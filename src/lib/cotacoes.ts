import { supabase } from "./supabase";
import type { CotacaoPayload } from "@/components/CotacaoForm";

// Limites do bucket `cotacoes-docs` (migration 0012). O Storage recusa o que
// passar disso; aqui o formulário avisa antes. Mudar nos dois lugares.
export const DOC_TAMANHO_MAX = 10 * 1024 * 1024; // 10 MB
export const DOC_QTD_MAX = 10;
export const DOC_TIPOS = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

// Motivo pelo qual o arquivo não pode ser anexado, ou null se pode.
export function problemaDoArquivo(f: File): string | null {
  if (!DOC_TIPOS.includes(f.type)) return `${f.name}: envie PDF ou foto (JPG, PNG, WEBP ou HEIC).`;
  if (f.size > DOC_TAMANHO_MAX) return `${f.name}: o arquivo passa de 10 MB.`;
  return null;
}

export type ResultadoCotacao = {
  /** Documentos que não conseguiram subir (a cotação foi gravada mesmo assim). */
  docsFalharam: number;
};

/** Erro com a mensagem pronta para mostrar no formulário. */
export class ErroCotacao extends Error {}

// Envia uma cotação da Insurance & Santé pela Edge Function `cotacao-enviar`
// (supabase/functions/cotacao-enviar). A função confere o anti-robô e o limite
// por IP, grava a cotação e devolve um link de upload de uso único por arquivo;
// cada documento sobe direto no bucket privado `cotacoes-docs` por esse link.
// Sem acesso direto do visitante à tabela nem ao bucket (migration 0014).
export async function enviarCotacao(p: CotacaoPayload, turnstile: string): Promise<ResultadoCotacao> {
  const { data, error } = await supabase.functions.invoke("cotacao-enviar", {
    body: {
      produto: p.produto,
      categoria: p.categoria ?? null,
      nome: p.nome,
      whatsapp: p.whatsapp,
      email: p.email,
      dados: p.dados,
      arquivos: p.arquivos.map((f) => ({ nome: f.name, tipo: f.type, tamanho: f.size })),
      aceite: true,
      turnstile,
      website: "",
    },
  });

  if (error) {
    // Resposta de erro da função (400/403/429/500): lê o motivo para a mensagem.
    let corpo: { erro?: string; erros?: Record<string, string> } | null = null;
    const resposta = (error as { context?: Response }).context;
    if (resposta && typeof resposta.json === "function") corpo = await resposta.json().catch(() => null);
    if (corpo?.erros) throw new ErroCotacao(Object.values(corpo.erros).join(" "));
    if (corpo?.erro === "robo") throw new ErroCotacao("Não conseguimos confirmar que você não é um robô. Tente de novo.");
    if (corpo?.erro === "limite")
      throw new ErroCotacao("Muitos envios em pouco tempo. Tente de novo mais tarde ou fale com a Yruena no WhatsApp.");
    throw error;
  }

  const uploads = ((data as { uploads?: { caminho: string; token: string }[] })?.uploads ?? []);
  let docsFalharam = 0;
  for (let i = 0; i < uploads.length; i++) {
    const arquivo = p.arquivos[i];
    if (!arquivo) continue;
    const { error: erroUpload } = await supabase.storage
      .from("cotacoes-docs")
      .uploadToSignedUrl(uploads[i].caminho, uploads[i].token, arquivo, { contentType: arquivo.type });
    if (erroUpload) {
      console.error(erroUpload);
      docsFalharam++;
    }
  }
  return { docsFalharam };
}
