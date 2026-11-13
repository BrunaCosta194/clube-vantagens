import { supabase } from "./supabase";
import {
  ARQUIVOS,
  mimePelaExtensao,
  problemaArquivo,
  type NomeEtapa,
  type Pendencias,
  type Respostas,
  type TipoArquivo,
} from "../../supabase/functions/_shared/parceiro-cadastro.ts";
import type { PerfilPagina } from "../../supabase/functions/_shared/parceiro-pagina.ts";

// ─────────────────────────────────────────────────────────────
// PORTAL DO PARCEIRO — client da Edge Function `parceiro-cadastro`.
// O parceiro não tem conta: o código do link (/cadastro-parceiro#<codigo>)
// vai em toda chamada. Tabelas e bucket não têm policy (migration 0015);
// tudo passa pela função.
// ─────────────────────────────────────────────────────────────

export interface ArquivoTela {
  id: string;
  tipo: TipoArquivo;
  item_id: string | null;
  nome: string;
  mime: string;
  tamanho: number;
  largura: number | null;
  altura: number | null;
  url: string | null;
}

export interface CadastroTela {
  status: string;
  editavel: boolean;
  /** Só vem quando a página está publicada. */
  slug: string | null;
  empresa: string;
  contato: string | null;
  respostas: Respostas;
  versao: number;
  etapa_atual: number;
  etapas_completas: number[];
  autorizado: boolean;
  enviado_em: string | null;
}

export type { Pendencias };

export type ErroPortal =
  | "link_invalido"
  | "link_vencido"
  | "nao_editavel"
  | "conflito"
  | "invalido"
  | "limite"
  | "falha"
  | "rede";

export class FalhaPortal extends Error {
  constructor(
    public codigo: ErroPortal,
    public corpo: Record<string, unknown> = {},
  ) {
    super(typeof corpo.mensagem === "string" ? corpo.mensagem : codigo);
  }
}

/** Código do link: o que vem depois do # (só hexadecimal de 64 caracteres). */
export function codigoDaUrl(hash: string): string | null {
  const t = hash.replace(/^#/, "").trim().toLowerCase();
  return /^[0-9a-f]{64}$/.test(t) ? t : null;
}

async function chamar<T>(codigo: string, acao: string, extra: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("parceiro-cadastro", {
    body: { acao, codigo, ...extra },
  });
  if (error) {
    const resposta = (error as { context?: Response }).context;
    let corpo: Record<string, unknown> | null = null;
    if (resposta && typeof resposta.json === "function") corpo = await resposta.json().catch(() => null);
    if (corpo && typeof corpo.erro === "string") throw new FalhaPortal(corpo.erro as ErroPortal, corpo);
    throw new FalhaPortal("rede");
  }
  return data as T;
}

export function abrir(codigo: string) {
  return chamar<{ cadastro: CadastroTela; arquivos: ArquivoTela[]; pendencias: Pendencias }>(codigo, "abrir");
}

export function salvar(
  codigo: string,
  p: { etapa?: NomeEtapa; dados?: unknown; versao: number; etapa_atual?: number },
) {
  return chamar<{ versao: number; etapas_completas: number[]; pendencias: Pendencias }>(codigo, "salvar", p);
}

export function removerArquivo(codigo: string, id: string) {
  return chamar<{ etapas_completas: number[] }>(codigo, "remover_arquivo", { id });
}

export function enviar(codigo: string) {
  return chamar<{ pendencias: Pendencias }>(codigo, "enviar", { autorizacao: true });
}

export function pedirCorrecao(codigo: string, mensagem: string) {
  return chamar<{ ok: true }>(codigo, "pedir_correcao", { mensagem });
}

// ── Prévia da página e aprovação ──────────────────────────────────────────────

export function previa(codigo: string) {
  return chamar<{ perfil: PerfilPagina; hash: string; fotos: Record<string, string> }>(codigo, "previa");
}

/** 409 "conflito" = a equipe mudou a página depois que a prévia abriu. */
export function decidirPagina(codigo: string, p: { aprovar: boolean; hash: string; nome: string; comentario?: string }) {
  return chamar<{ status: string }>(codigo, p.aprovar ? "aprovar" : "pedir_ajuste", {
    hash: p.hash,
    nome: p.nome,
    comentario: p.comentario ?? "",
  });
}

// ── Fotos: reduz no próprio aparelho antes de subir ───────────────────────────

const LADO_MAX = 2400;
const QUALIDADE = 0.85;

/**
 * Foto grande de celular (4–8 MB) vira JPEG de ~2400 px (~600 KB). Também tira os
 * dados escondidos da foto (inclusive a localização). Logo não passa por aqui:
 * PNG sem fundo perderia a transparência. Se o navegador não conseguir abrir a
 * imagem (HEIC fora do Safari, por exemplo), sobe o original.
 */
export async function prepararFoto(arquivo: File): Promise<{ arquivo: File; largura: number | null; altura: number | null }> {
  if (!arquivo.type.startsWith("image/") || arquivo.type === "image/svg+xml") {
    return { arquivo, largura: null, altura: null };
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(arquivo);
  } catch {
    return { arquivo, largura: null, altura: null };
  }
  const { width, height } = bitmap;
  const escala = Math.min(1, LADO_MAX / Math.max(width, height));
  if (escala === 1 && arquivo.size < 1.5 * 1024 * 1024 && arquivo.type === "image/jpeg") {
    bitmap.close();
    return { arquivo, largura: width, altura: height };
  }
  const w = Math.round(width * escala);
  const h = Math.round(height * escala);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return { arquivo, largura: width, altura: height };
  }
  ctx.fillStyle = "#fff"; // PNG com fundo transparente vira fundo branco no JPEG
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", QUALIDADE));
  if (!blob || blob.size >= arquivo.size) return { arquivo, largura: width, altura: height };
  const nome = arquivo.name.replace(/\.[^.]+$/, "") + ".jpg";
  return { arquivo: new File([blob], nome, { type: "image/jpeg" }), largura: w, altura: h };
}

/** Largura e altura de uma imagem, sem alterá-la (para o logo). */
async function medir(arquivo: File): Promise<{ largura: number | null; altura: number | null }> {
  if (!arquivo.type.startsWith("image/") || arquivo.type === "image/svg+xml") return { largura: null, altura: null };
  try {
    const b = await createImageBitmap(arquivo);
    const r = { largura: b.width, altura: b.height };
    b.close();
    return r;
  } catch {
    return { largura: null, altura: null };
  }
}

/** Motivo para recusar antes de subir (mesma regra da função). */
export function problemaAntes(tipo: TipoArquivo, f: File): string | null {
  return problemaArquivo(tipo, f.name, mimePelaExtensao(f.name, f.type), f.size);
}

/**
 * Sobe um arquivo: pede o link de uso único, envia direto para o bucket e
 * confirma. A função confere o que chegou e, para logo/capa/foto de item,
 * apaga o anterior.
 */
export async function subirArquivo(
  codigo: string,
  tipo: TipoArquivo,
  original: File,
  itemId?: string,
): Promise<{ arquivo: ArquivoTela; etapas_completas: number[] }> {
  const preparado =
    tipo === "logo" || tipo === "referencia"
      ? { arquivo: original, ...(await medir(original)) }
      : await prepararFoto(original);
  const f = preparado.arquivo;
  const mime = mimePelaExtensao(f.name, f.type);
  const problema = problemaArquivo(tipo, f.name, mime, f.size);
  if (problema) throw new FalhaPortal("invalido", { mensagem: problema });

  const pedido = await chamar<{ id: string; caminho: string; token: string }>(codigo, "upload", {
    tipo,
    nome: f.name,
    mime,
    tamanho: f.size,
    item_id: itemId,
    largura: preparado.largura,
    altura: preparado.altura,
  });

  const { error } = await supabase.storage
    .from("parceiros-cadastro")
    .uploadToSignedUrl(pedido.caminho, pedido.token, f, { contentType: mime });
  if (error) throw new FalhaPortal("rede", { mensagem: `${original.name}: não conseguimos enviar. Tente de novo.` });

  return chamar<{ arquivo: ArquivoTela; etapas_completas: number[] }>(codigo, "confirmar_upload", { id: pedido.id });
}

export const LIMITE_ARQUIVOS = ARQUIVOS;

// ── CEP (ViaCEP, API pública) ─────────────────────────────────────────────────

export interface EnderecoCep {
  rua: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export async function buscarCep(cep: string): Promise<EnderecoCep | null> {
  const d = cep.replace(/\D/g, "");
  if (d.length !== 8) return null;
  try {
    const r = await fetch(`https://viacep.com.br/ws/${d}/json/`, { signal: AbortSignal.timeout(6000) });
    if (!r.ok) return null;
    const j = (await r.json()) as { erro?: unknown; logradouro?: string; bairro?: string; localidade?: string; uf?: string };
    if (j.erro) return null;
    return { rua: j.logradouro ?? "", bairro: j.bairro ?? "", cidade: j.localidade ?? "", uf: j.uf ?? "" };
  } catch {
    return null;
  }
}

/** Id curto para um produto novo (o mesmo formato que a função aceita). */
export function novoIdItem(): string {
  const a = new Uint8Array(6);
  crypto.getRandomValues(a);
  return [...a].map((b) => (b % 36).toString(36)).join("") + Date.now().toString(36).slice(-4);
}
