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

// Envia uma cotação da Insurance & Santé pro Supabase.
//
// Ordem importa por causa da RLS (só há policy de INSERT, nada de SELECT/
// UPDATE): geramos a pasta no client, subimos os docs, e inserimos a linha
// já com os caminhos — sem precisar ler o id de volta nem dar update depois.
export async function enviarCotacao(p: CotacaoPayload): Promise<void> {
  const pasta =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // 1. sobe os documentos pro bucket privado, agrupados na pasta da cotação.
  const documentos: string[] = [];
  for (const arquivo of p.arquivos) {
    const nomeSeguro = arquivo.name.replace(/[^\w.\-]+/g, "_");
    const caminho = `${pasta}/${Date.now()}_${nomeSeguro}`;
    const { error } = await supabase.storage
      .from("cotacoes-docs")
      .upload(caminho, arquivo, { upsert: false });
    if (error) throw error;
    documentos.push(caminho);
  }

  // 2. grava a cotação já com os caminhos dos docs.
  const { error } = await supabase.from("cotacoes").insert({
    produto: p.produto,
    categoria: p.categoria ?? null,
    nome: p.nome,
    whatsapp: p.whatsapp,
    email: p.email || null,
    dados: p.dados,
    documentos,
    consentimento_lgpd_em: new Date().toISOString(),
  });
  if (error) throw error;
}
