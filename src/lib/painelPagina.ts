import { supabase } from "./supabase";
import { BUCKET_PUBLICO } from "./paginasParceiros";
import { fotosDoPerfil, limparPerfil, type PerfilPagina } from "../../supabase/functions/_shared/parceiro-pagina.ts";

// ─────────────────────────────────────────────────────────────
// PAINEL: MONTAR, SALVAR E PUBLICAR A PÁGINA DO PARCEIRO (migration 0016).
// Toda foto da página passa por aqui antes de subir: é redesenhada num canvas
// (sai a localização e qualquer dado escondido; SVG vira imagem comum) e grava
// em <cadastro>/pagina/<uuid> no bucket privado. Na publicação, as fotos são
// copiadas para o bucket público e o banco confere tudo antes de pôr no ar.
// ─────────────────────────────────────────────────────────────

const PRIVADO = "parceiros-cadastro";

export interface PerfilFicha {
  conteudo: unknown;
  conteudo_hash: string;
  publicado_hash: string | null;
  publicado_em: string | null;
  updated_at: string;
}

export interface AprovacaoFicha {
  decisao: "aprovado" | "ajuste";
  nome: string;
  comentario: string | null;
  conteudo_hash: string;
  criado_em: string;
}

export async function salvarPerfil(id: string, perfil: PerfilPagina): Promise<string> {
  const { data, error } = await supabase.rpc("parceiro_perfil_salvar", { p_id: id, p_conteudo: perfil });
  if (error) throw error;
  return data as string;
}

/** Imagem que o navegador consegue desenhar. PDF, AI e EPS não: a equipe converte antes. */
export function fotoProcessavel(mime: string): boolean {
  return /^image\/(jpeg|png|webp|svg\+xml|heic|heif)$/.test(mime);
}

async function desenhavel(blob: Blob): Promise<{ img: CanvasImageSource; w: number; h: number; fechar: () => void }> {
  if (blob.type !== "image/svg+xml") {
    try {
      const b = await createImageBitmap(blob);
      return { img: b, w: b.width, h: b.height, fechar: () => b.close() };
    } catch {
      /* tenta pelo <img> abaixo */
    }
  }
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    // SVG sem tamanho próprio: desenha com 1000 px de largura.
    const w = img.naturalWidth || 1000;
    const h = img.naturalHeight || Math.round(w * 0.6);
    return { img, w, h, fechar: () => URL.revokeObjectURL(url) };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

/**
 * Redesenha a foto: logo até 800 px em PNG (mantém o fundo transparente); as outras
 * até 1920 px em JPEG. Devolve null se o navegador não conseguir abrir o arquivo.
 */
export async function reprocessar(blob: Blob, logo: boolean): Promise<{ arquivo: Blob; ext: "png" | "jpg" } | null> {
  let d: Awaited<ReturnType<typeof desenhavel>>;
  try {
    d = await desenhavel(blob);
  } catch {
    return null;
  }
  const max = logo ? 800 : 1920;
  const escala = Math.min(1, max / Math.max(d.w, d.h));
  const w = Math.max(1, Math.round(d.w * escala));
  const h = Math.max(1, Math.round(d.h * escala));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    d.fechar();
    return null;
  }
  if (!logo) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(d.img, 0, 0, w, h);
  d.fechar();
  const tipo = logo ? "image/png" : "image/jpeg";
  const saida = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, tipo, logo ? undefined : 0.82));
  return saida ? { arquivo: saida, ext: logo ? "png" : "jpg" } : null;
}

/** Reprocessa e sobe uma foto da página. Devolve o caminho, ou null se não deu para abrir. */
export async function subirFotoPagina(cadastroId: string, origem: Blob, logo: boolean): Promise<string | null> {
  const r = await reprocessar(origem, logo);
  if (!r) return null;
  const caminho = `${cadastroId}/pagina/${crypto.randomUUID()}.${r.ext}`;
  const { error } = await supabase.storage.from(PRIVADO).upload(caminho, r.arquivo, {
    contentType: r.ext === "png" ? "image/png" : "image/jpeg",
  });
  if (error) throw error;
  return caminho;
}

/** Baixa um arquivo do parceiro (bucket privado; a policy da 0015 exige o papel). */
export async function baixarDoParceiro(caminho: string): Promise<Blob> {
  const { data, error } = await supabase.storage.from(PRIVADO).download(caminho);
  if (error || !data) throw error ?? new Error("download");
  return data;
}

/** Links de 10 min para ver as fotos da página no painel (bucket privado). */
export async function linksDasFotos(caminhos: string[]): Promise<Record<string, string>> {
  const mapa: Record<string, string> = {};
  if (!caminhos.length) return mapa;
  const { data } = await supabase.storage.from(PRIVADO).createSignedUrls(caminhos, 600);
  for (const l of data ?? []) if (l.path && l.signedUrl) mapa[l.path] = l.signedUrl;
  return mapa;
}

/** Apaga do bucket privado fotos da página que não são mais usadas (melhor esforço). */
export async function limparFotosSoltas(cadastroId: string, usadas: string[]) {
  const { data } = await supabase.storage.from(PRIVADO).list(`${cadastroId}/pagina`, { limit: 200 });
  const sobra = (data ?? []).map((o) => `${cadastroId}/pagina/${o.name}`).filter((c) => !usadas.includes(c));
  if (sobra.length) await supabase.storage.from(PRIVADO).remove(sobra);
}

const tipoPelaExtensao = (c: string) => (c.endsWith(".png") ? "image/png" : c.endsWith(".webp") ? "image/webp" : "image/jpeg");

/**
 * Publica: copia as fotos da versão salva para o bucket público e pede ao banco para
 * pôr no ar (ele confere a aprovação, o hash e o benefício validado). Depois apaga do
 * bucket público as fotos de versões antigas.
 */
export async function publicar(cadastroId: string, conteudoSalvo: unknown) {
  const perfil = limparPerfil(conteudoSalvo);
  const fotos = fotosDoPerfil(perfil);
  for (const c of fotos) {
    const blob = await baixarDoParceiro(c);
    const { error } = await supabase.storage.from(BUCKET_PUBLICO).upload(c, blob, {
      upsert: true,
      contentType: tipoPelaExtensao(c),
      cacheControl: "31536000", // o nome é um uuid: o arquivo nunca muda
    });
    if (error) throw error;
  }
  const { error } = await supabase.rpc("parceiro_perfil_publicar", { p_id: cadastroId });
  if (error) throw error;
  const { data } = await supabase.storage.from(BUCKET_PUBLICO).list(`${cadastroId}/pagina`, { limit: 200 });
  const antigas = (data ?? []).map((o) => `${cadastroId}/pagina/${o.name}`).filter((c) => !fotos.includes(c));
  if (antigas.length) await supabase.storage.from(BUCKET_PUBLICO).remove(antigas);
}
