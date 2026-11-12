// Regras puras da Edge Function cotacao-enviar (cotação da Insurance & Santé).
// Sem nada do Deno nem do Supabase: o mesmo arquivo roda no Deno (função) e no
// Node (teste: node --test supabase/functions/_shared/cotacao.test.ts).
//
// Os limites de arquivo são os mesmos do bucket `cotacoes-docs` (migration 0012)
// e de src/lib/cotacoes.ts. Mudar nos três lugares.

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

/** Envios por IP numa hora antes de recusar (429). */
export const LIMITE_POR_HORA = 5;

export interface ArquivoPedido {
  nome: string;
  tipo: string;
  tamanho: number;
}

export interface CotacaoValida {
  produto: string;
  categoria: string | null;
  nome: string;
  whatsapp: string;
  email: string | null;
  dados: Record<string, string>;
  arquivos: ArquivoPedido[];
}

export type Validacao =
  | { ok: true; cotacao: CotacaoValida }
  | { ok: false; erros: Record<string, string> };

type Obj = Record<string, unknown>;

function texto(v: unknown, max: number): string | null {
  if (typeof v !== "string" && typeof v !== "number") return null;
  const t = String(v).replace(/\s+/g, " ").trim();
  return t ? t.slice(0, max) : null;
}

/** Telefone brasileiro → só dígitos com DDD (10 ou 11), sem o 55. null = inválido. */
export function telefoneBR(v: unknown): string | null {
  if (typeof v !== "string" && typeof v !== "number") return null;
  let d = String(v).replace(/\D/g, "").replace(/^0+/, "");
  if (/^55\d{10,11}$/.test(d)) d = d.slice(2);
  if (!/^[1-9]{2}\d{8,9}$/.test(d)) return null;
  if (d.length === 11 && d[2] !== "9") return null;
  return d;
}

export function emailValido(v: unknown): string | null {
  const t = texto(v, 200)?.toLowerCase() ?? null;
  return t && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t) ? t : null;
}

/** Nome do arquivo sem caminho nem caractere estranho (vai no caminho do Storage). */
export function nomeSeguro(nome: string): string {
  const base = nome.split(/[\\/]/).pop() ?? "arquivo";
  const limpo = base.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.\-]+/g, "_");
  return (limpo.replace(/^\.+/, "") || "arquivo").slice(-80);
}

function arquivosDo(v: unknown, erros: Record<string, string>): ArquivoPedido[] {
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v)) {
    erros.arquivos = "Envio inválido.";
    return [];
  }
  if (v.length > DOC_QTD_MAX) {
    erros.arquivos = `No máximo ${DOC_QTD_MAX} arquivos por cotação.`;
    return [];
  }
  const saida: ArquivoPedido[] = [];
  for (const item of v) {
    const a = (item && typeof item === "object" ? item : {}) as Obj;
    const nome = texto(a.nome, 200);
    const tipo = typeof a.tipo === "string" ? a.tipo : "";
    const tamanho = typeof a.tamanho === "number" ? a.tamanho : NaN;
    if (!nome) {
      erros.arquivos = "Envio inválido.";
      return [];
    }
    if (!DOC_TIPOS.includes(tipo)) {
      erros.arquivos = `${nome}: envie PDF ou foto (JPG, PNG, WEBP ou HEIC).`;
      return [];
    }
    if (!Number.isFinite(tamanho) || tamanho <= 0 || tamanho > DOC_TAMANHO_MAX) {
      erros.arquivos = `${nome}: o arquivo passa de 10 MB.`;
      return [];
    }
    saida.push({ nome, tipo, tamanho });
  }
  return saida;
}

function dadosDo(v: unknown): Record<string, string> {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  const saida: Record<string, string> = {};
  for (const [k, x] of Object.entries(v as Obj).slice(0, 40)) {
    const chave = texto(k, 60);
    const valor = texto(x, 500);
    if (chave && valor) saida[chave] = valor;
  }
  return saida;
}

export function validarCotacao(corpo: unknown): Validacao {
  const c = (corpo && typeof corpo === "object" ? corpo : {}) as Obj;
  const erros: Record<string, string> = {};

  const produto = texto(c.produto, 120);
  if (!produto) erros.produto = "Escolha o produto.";

  const nome = texto(c.nome, 120);
  if (!nome || nome.length < 2) erros.nome = "Preencha seu nome.";

  const whatsapp = telefoneBR(c.whatsapp);
  if (!whatsapp) erros.whatsapp = "Confira o WhatsApp, com DDD.";

  let email: string | null = null;
  if (typeof c.email === "string" && c.email.trim()) {
    email = emailValido(c.email);
    if (!email) erros.email = "Confira o e-mail.";
  }

  if (c.aceite !== true) erros.aceite = "É preciso aceitar o tratamento dos dados para enviar.";

  const arquivos = arquivosDo(c.arquivos, erros);

  if (Object.keys(erros).length) return { ok: false, erros };
  return {
    ok: true,
    cotacao: {
      produto: produto!,
      categoria: texto(c.categoria, 120),
      nome: nome!,
      whatsapp: whatsapp!,
      email,
      dados: dadosDo(c.dados),
      arquivos,
    },
  };
}

/** Campo escondido no formulário: gente não preenche, robô preenche. */
export function pareceRobo(corpo: unknown): boolean {
  const c = (corpo && typeof corpo === "object" ? corpo : {}) as Obj;
  return typeof c.website === "string" && c.website.trim() !== "";
}

/** IP → hash que muda todo dia (limite por hora sem guardar o IP). */
export async function hashDoIp(ip: string | null, dia: string, sal: string): Promise<string | null> {
  if (!ip) return null;
  const dados = new TextEncoder().encode(`${ip}|${dia}|${sal}`);
  const h = await crypto.subtle.digest("SHA-256", dados);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

export function ipDaRequisicao(headers: Headers): string | null {
  const cf = headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const xff = headers.get("x-forwarded-for");
  return xff ? xff.split(",")[0].trim() || null : null;
}

/** Data de hoje em Brasília (AAAA-MM-DD). */
export function hojeBrasilia(agora: Date = new Date()): string {
  return agora.toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
}

/** Origem que pode chamar (CORS). Lista vazia = qualquer uma. */
export function origemPermitida(origem: string | null, permitidas: string[]): string {
  if (permitidas.length === 0) return "*";
  return origem && permitidas.includes(origem) ? origem : permitidas[0];
}

/** O token do Turnstile tem de ter sido gerado num domínio do Clube. Lista vazia = aceita. */
export function hostnameDoClube(hostname: unknown, origens: string[]): boolean {
  if (origens.length === 0) return true;
  if (typeof hostname !== "string" || !hostname) return false;
  return origens.some((o) => {
    try {
      return new URL(o).hostname === hostname;
    } catch {
      return false;
    }
  });
}

/**
 * Resultado do Turnstile. A Cloudflare dizer "não" (robô) recusa o envio; a função não
 * conseguir falar com ela (rede, 5xx, erro interno) grava com robo_checado = false, para
 * nenhuma cotação de verdade se perder. Mesma regra do formulário do site da Sanchez.
 */
export type ResultadoTurnstile = "ok" | "recusado" | "sem_resposta";
export function resultadoTurnstile(token: unknown, resposta: unknown, origens: string[]): ResultadoTurnstile {
  if (typeof token !== "string" || !token) return "recusado";
  if (!resposta || typeof resposta !== "object") return "sem_resposta";
  const r = resposta as { success?: unknown; hostname?: unknown; "error-codes"?: unknown };
  if (r.success === true) return hostnameDoClube(r.hostname, origens) ? "ok" : "recusado";
  const codigos = Array.isArray(r["error-codes"]) ? r["error-codes"] : [];
  return codigos.includes("internal-error") ? "sem_resposta" : "recusado";
}

/** Caminhos no bucket: <pasta da cotação>/<n>_<nome seguro>. */
export function caminhosDosArquivos(pasta: string, arquivos: ArquivoPedido[]): string[] {
  return arquivos.map((a, i) => `${pasta}/${String(i + 1).padStart(2, "0")}_${nomeSeguro(a.nome)}`);
}
