import { supabase } from "./supabase";
import type { CotacaoPayload } from "@/components/CotacaoForm";

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
