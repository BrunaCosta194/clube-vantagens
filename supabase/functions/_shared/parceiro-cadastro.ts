// Regras do Portal do Parceiro (cadastro por link pessoal).
// Spec: docs/superpowers/specs/2026-11-13-portal-cadastro-parceiros.md
//
// Arquivo puro, sem nada do Deno nem do Supabase: o mesmo código roda na Edge Function
// `parceiro-cadastro` (Deno), no formulário (src/pages/CadastroParceiro.tsx, pelo Vite)
// e no teste (node --test supabase/functions/_shared/parceiro-cadastro.test.ts).
// Assim a tela e a função nunca discordam sobre o que é obrigatório.

import { nomeSeguro, telefoneBR } from "./cotacao.ts";

// ── Constantes ────────────────────────────────────────────────────────────────

/** Validade do link a partir do convite (decisão D5/D8 da spec, ainda a confirmar). */
export const VALIDADE_LINK_DIAS = 90;

/** Versão do texto de autorização aceito no envio. Trocar quando as Condições de participação chegarem. */
export const TERMOS_VERSAO = "2026-11-rascunho";

/** Lista inicial de segmentos (decisão D6, a Júlia ainda vai confirmar). */
export const SEGMENTOS = [
  "Casa e decoração",
  "Reforma e construção",
  "Serviços para casa",
  "Moda",
  "Beleza e bem-estar",
  "Saúde",
  "Seguros e finanças",
  "Alimentação",
  "Fotografia e eventos",
  "Outro",
] as const;

export const STATUS = {
  convite_enviado: "Convite enviado",
  cadastro_iniciado: "Cadastro iniciado",
  cadastro_recebido: "Cadastro recebido",
  informacoes_incompletas: "Informações incompletas",
  em_preparacao: "Em preparação",
  aguardando_aprovacao: "Aguardando aprovação do parceiro",
  ajustes_solicitados: "Ajustes solicitados",
  aprovado: "Aprovado",
  publicado: "Publicado",
  arquivado: "Arquivado",
} as const;
export type Status = keyof typeof STATUS;

/**
 * Status em que o parceiro pode mexer nas respostas pelo link. Inclui "cadastro
 * recebido": quem enviou sem logo ou sem fotos completa pelo mesmo link até a
 * equipe começar a preparar a página.
 */
export function editavel(status: string): boolean {
  return (
    status === "convite_enviado" ||
    status === "cadastro_iniciado" ||
    status === "cadastro_recebido" ||
    status === "informacoes_incompletas" ||
    status === "ajustes_solicitados"
  );
}

// ── Etapas ────────────────────────────────────────────────────────────────────

export const ETAPAS = ["negocio", "beneficio", "produtos", "fotos", "contato", "orcamento"] as const;
export type NomeEtapa = (typeof ETAPAS)[number];

/** Título curto de cada etapa (barra de progresso e revisão). Índice 1–6 = etapa; 7 = revisão. */
export const TITULO_ETAPA: Record<NomeEtapa, string> = {
  negocio: "Seu negócio",
  beneficio: "Benefício",
  produtos: "Produtos e serviços",
  fotos: "Fotos e marca",
  contato: "Contato",
  orcamento: "Orçamentos",
};

export const TIPOS_BENEFICIO = {
  percentual: "Desconto percentual",
  reais: "Desconto em reais",
  brinde: "Brinde",
  servico: "Serviço sem custo",
  especial: "Condição especial",
  outro: "Outro",
} as const;
export type TipoBeneficio = keyof typeof TIPOS_BENEFICIO;

export const ONDE_USAR = {
  loja: "Loja física",
  site: "Site",
  whatsapp: "WhatsApp",
  externo: "Atendimento externo",
  outro: "Outro",
} as const;

export const COMO_USAR = {
  codigo: "Código de desconto",
  identificacao: "Apresentação da identificação de membro",
  contato: "Contato direto com a empresa",
  outro: "Outro procedimento",
} as const;

export const REGRAS = {
  valor_minimo: "Valor mínimo",
  quantidade: "Quantidade limitada",
  restricoes: "Produtos ou serviços fora da regra",
  acumula: "Acumula com outras promoções?",
  outras: "Outras condições",
} as const;
export type Regra = keyof typeof REGRAS;

export const OFERTA = {
  produtos: "Produtos",
  servicos: "Serviços",
  ambos: "Os dois",
} as const;

export const PRECO_TIPO = {
  fixo: "Preço fixo",
  apartir: "A partir de",
  consulta: "Sob consulta",
} as const;

export const MODALIDADES = {
  presencial: "Presencial",
  online: "Online",
  cliente: "No endereço do cliente",
  outro: "Outro",
} as const;

export const DIAS = {
  seg: "Segunda",
  ter: "Terça",
  qua: "Quarta",
  qui: "Quinta",
  sex: "Sexta",
  sab: "Sábado",
  dom: "Domingo",
} as const;
export type Dia = keyof typeof DIAS;

export const REGIOES = [
  "Mogi das Cruzes",
  "Suzano",
  "Itaquaquecetuba",
  "Alto Tietê",
  "Grande São Paulo",
] as const;

export const INFO_ORCAMENTO = {
  descricao: "Descrição do que o cliente precisa",
  fotos: "Fotos",
  medidas: "Medidas",
  endereco: "Endereço do serviço",
  planta: "Planta ou projeto",
  prazo: "Prazo desejado",
  verba: "Quanto o cliente pretende investir",
} as const;

export const CANAIS_ORCAMENTO = {
  whatsapp: "WhatsApp",
  email: "E-mail",
  formulario: "Formulário no site do Clube",
} as const;

export const ITENS_MAX = 8;

// ── Formato das respostas ─────────────────────────────────────────────────────

export interface EtapaNegocio {
  nomeEmpresa: string;
  responsavel: string;
  segmento: string;
  segmentoOutro: string;
  anoFundacao: string;
  cidade: string;
  oQueFaz: string;
  diferenciais: string;
  materialLink: string;
}

export interface EtapaBeneficio {
  tipo: TipoBeneficio | "";
  percentual: string;
  valorReais: string;
  brinde: string;
  servico: string;
  descricao: string; // em quê / detalhes (todos os tipos)
  ondeUsar: string[];
  ondeOutro: string;
  comoUsar: string;
  codigo: string;
  clubeCriaCodigo: boolean;
  comoOutro: string;
  regras: Regra[];
  regraValorMinimo: string;
  regraQuantidade: string;
  regraRestricoes: string;
  regraAcumula: "" | "sim" | "nao";
  regraOutras: string;
  validade: "" | "sem" | "data";
  validadeData: string; // AAAA-MM-DD
  confirmado: boolean;
}

export interface ItemOferta {
  id: string;
  nome: string;
  descricao: string;
  precoTipo: "" | keyof typeof PRECO_TIPO;
  preco: string;
  video: string;
}

export interface EtapaProdutos {
  oferta: "" | keyof typeof OFERTA;
  itens: ItemOferta[];
}

export interface EtapaFotos {
  autorizacaoImagens: boolean;
}

export type Horario = { abre: string; fecha: string } | null;

export interface EtapaContato {
  modalidades: string[];
  modalidadeOutra: string;
  whatsapp: string;
  instagram: string;
  site: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidadeEndereco: string;
  uf: string;
  horarios: Record<Dia, Horario>;
  horaMarcada: boolean;
  horarioObs: string;
  regioes: string[];
  regiaoOutra: string;
}

export interface EtapaOrcamento {
  trabalha: "" | "sim" | "nao";
  informacoes: string[];
  informacaoOutra: string;
  documentos: string;
  canais: string[];
  email: string;
}

export interface Respostas {
  negocio?: EtapaNegocio;
  beneficio?: EtapaBeneficio;
  produtos?: EtapaProdutos;
  fotos?: EtapaFotos;
  contato?: EtapaContato;
  orcamento?: EtapaOrcamento;
}

// ── Valores vazios (o formulário começa daqui) ────────────────────────────────

export function horariosVazios(): Record<Dia, Horario> {
  return { seg: null, ter: null, qua: null, qui: null, sex: null, sab: null, dom: null };
}

export const VAZIO = {
  negocio: (): EtapaNegocio => ({
    nomeEmpresa: "",
    responsavel: "",
    segmento: "",
    segmentoOutro: "",
    anoFundacao: "",
    cidade: "Mogi das Cruzes",
    oQueFaz: "",
    diferenciais: "",
    materialLink: "",
  }),
  beneficio: (): EtapaBeneficio => ({
    tipo: "",
    percentual: "",
    valorReais: "",
    brinde: "",
    servico: "",
    descricao: "",
    ondeUsar: [],
    ondeOutro: "",
    comoUsar: "",
    codigo: "",
    clubeCriaCodigo: false,
    comoOutro: "",
    regras: [],
    regraValorMinimo: "",
    regraQuantidade: "",
    regraRestricoes: "",
    regraAcumula: "",
    regraOutras: "",
    validade: "",
    validadeData: "",
    confirmado: false,
  }),
  produtos: (): EtapaProdutos => ({ oferta: "", itens: [] }),
  fotos: (): EtapaFotos => ({ autorizacaoImagens: false }),
  contato: (): EtapaContato => ({
    modalidades: [],
    modalidadeOutra: "",
    whatsapp: "",
    instagram: "",
    site: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidadeEndereco: "",
    uf: "",
    horarios: horariosVazios(),
    horaMarcada: false,
    horarioObs: "",
    regioes: [],
    regiaoOutra: "",
  }),
  orcamento: (): EtapaOrcamento => ({
    trabalha: "",
    informacoes: [],
    informacaoOutra: "",
    documentos: "",
    canais: [],
    email: "",
  }),
};

// ── Limpeza (o que chega do navegador nunca é confiável) ──────────────────────

type Obj = Record<string, unknown>;

function obj(v: unknown): Obj {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {};
}

/** Texto de uma linha: espaços repetidos viram um. */
function linha(v: unknown, max: number): string {
  if (typeof v !== "string" && typeof v !== "number") return "";
  return String(v).replace(/\s+/g, " ").trim().slice(0, max);
}

/** Texto de várias linhas: mantém quebras (no máximo 2 seguidas). */
function bloco(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v
    .replace(/\r\n?/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

function um<T extends string>(v: unknown, opcoes: readonly T[]): T | "" {
  return typeof v === "string" && (opcoes as readonly string[]).includes(v) ? (v as T) : "";
}

function varios<T extends string>(v: unknown, opcoes: readonly T[]): T[] {
  if (!Array.isArray(v)) return [];
  return [...new Set(v.filter((x): x is T => typeof x === "string" && (opcoes as readonly string[]).includes(x)))];
}

function textos(v: unknown, maxItens: number, maxLen: number): string[] {
  if (!Array.isArray(v)) return [];
  return [...new Set(v.map((x) => linha(x, maxLen)).filter(Boolean))].slice(0, maxItens);
}

/** Número digitado → só dígitos e uma vírgula/ponto decimal. */
function numero(v: unknown, max = 12): string {
  return linha(v, 40).replace(/[^\d.,]/g, "").slice(0, max);
}

function hora(v: unknown): string {
  return typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : "";
}

const chaves = <T extends object>(o: T) => Object.keys(o) as (keyof T & string)[];

export function limparNegocio(v: unknown): EtapaNegocio {
  const o = obj(v);
  const ano = linha(o.anoFundacao, 4).replace(/\D/g, "");
  return {
    nomeEmpresa: linha(o.nomeEmpresa, 120),
    responsavel: linha(o.responsavel, 120),
    segmento: um(o.segmento, SEGMENTOS),
    segmentoOutro: linha(o.segmentoOutro, 60),
    anoFundacao: ano,
    cidade: linha(o.cidade, 80),
    oQueFaz: bloco(o.oQueFaz, 3000),
    diferenciais: bloco(o.diferenciais, 2000),
    materialLink: linha(o.materialLink, 500),
  };
}

export function limparBeneficio(v: unknown): EtapaBeneficio {
  const o = obj(v);
  const validade = um(o.validade, ["sem", "data"] as const);
  const data = typeof o.validadeData === "string" && /^\d{4}-\d{2}-\d{2}$/.test(o.validadeData) ? o.validadeData : "";
  let percentual = numero(o.percentual, 5);
  const p = Number(percentual.replace(",", "."));
  if (percentual && (!Number.isFinite(p) || p <= 0 || p > 100)) percentual = "";
  return {
    tipo: um(o.tipo, chaves(TIPOS_BENEFICIO)),
    percentual,
    valorReais: numero(o.valorReais),
    brinde: linha(o.brinde, 200),
    servico: linha(o.servico, 200),
    descricao: bloco(o.descricao, 1000),
    ondeUsar: varios(o.ondeUsar, chaves(ONDE_USAR)),
    ondeOutro: linha(o.ondeOutro, 200),
    comoUsar: um(o.comoUsar, chaves(COMO_USAR)),
    codigo: linha(o.codigo, 40).toUpperCase().replace(/\s/g, ""),
    clubeCriaCodigo: o.clubeCriaCodigo === true,
    comoOutro: linha(o.comoOutro, 300),
    regras: varios(o.regras, chaves(REGRAS)),
    regraValorMinimo: numero(o.regraValorMinimo),
    regraQuantidade: linha(o.regraQuantidade, 200),
    regraRestricoes: linha(o.regraRestricoes, 300),
    regraAcumula: um(o.regraAcumula, ["sim", "nao"] as const),
    regraOutras: bloco(o.regraOutras, 600),
    validade,
    validadeData: validade === "data" ? data : "",
    confirmado: o.confirmado === true,
  };
}

export function idItemValido(v: unknown): v is string {
  return typeof v === "string" && /^[a-z0-9]{6,16}$/.test(v);
}

export function limparProdutos(v: unknown): EtapaProdutos {
  const o = obj(v);
  const itens = Array.isArray(o.itens) ? o.itens : [];
  const vistos = new Set<string>();
  const limpos: ItemOferta[] = [];
  for (const bruto of itens) {
    const i = obj(bruto);
    if (!idItemValido(i.id) || vistos.has(i.id)) continue;
    vistos.add(i.id);
    limpos.push({
      id: i.id,
      nome: linha(i.nome, 120),
      descricao: linha(i.descricao, 160),
      precoTipo: um(i.precoTipo, chaves(PRECO_TIPO)),
      preco: numero(i.preco),
      video: linha(i.video, 300),
    });
    if (limpos.length >= ITENS_MAX) break;
  }
  return { oferta: um(o.oferta, chaves(OFERTA)), itens: limpos };
}

export function limparFotos(v: unknown): EtapaFotos {
  return { autorizacaoImagens: obj(v).autorizacaoImagens === true };
}

export function limparContato(v: unknown): EtapaContato {
  const o = obj(v);
  const h = obj(o.horarios);
  const horarios = horariosVazios();
  for (const d of chaves(DIAS)) {
    const x = obj(h[d]);
    const abre = hora(x.abre);
    const fecha = hora(x.fecha);
    horarios[d] = abre && fecha ? { abre, fecha } : null;
  }
  return {
    modalidades: varios(o.modalidades, chaves(MODALIDADES)),
    modalidadeOutra: linha(o.modalidadeOutra, 200),
    whatsapp: linha(o.whatsapp, 30),
    instagram: instagramNormalizado(o.instagram),
    site: linha(o.site, 300),
    cep: linha(o.cep, 9).replace(/\D/g, "").slice(0, 8),
    rua: linha(o.rua, 160),
    numero: linha(o.numero, 20),
    complemento: linha(o.complemento, 80),
    bairro: linha(o.bairro, 80),
    cidadeEndereco: linha(o.cidadeEndereco, 80),
    uf: linha(o.uf, 2).toUpperCase().replace(/[^A-Z]/g, ""),
    horarios,
    horaMarcada: o.horaMarcada === true,
    horarioObs: linha(o.horarioObs, 300),
    regioes: textos(o.regioes, 15, 60),
    regiaoOutra: linha(o.regiaoOutra, 200),
  };
}

export function limparOrcamento(v: unknown): EtapaOrcamento {
  const o = obj(v);
  return {
    trabalha: um(o.trabalha, ["sim", "nao"] as const),
    informacoes: varios(o.informacoes, chaves(INFO_ORCAMENTO)),
    informacaoOutra: bloco(o.informacaoOutra, 600),
    documentos: bloco(o.documentos, 600),
    canais: varios(o.canais, chaves(CANAIS_ORCAMENTO)),
    email: linha(o.email, 200).toLowerCase(),
  };
}

export const LIMPAR: { [K in NomeEtapa]: (v: unknown) => NonNullable<Respostas[K]> } = {
  negocio: limparNegocio,
  beneficio: limparBeneficio,
  produtos: limparProdutos,
  fotos: limparFotos,
  contato: limparContato,
  orcamento: limparOrcamento,
};

/** Respostas inteiras (as que vêm do banco ou do convite pré-preenchido). */
export function limparRespostas(v: unknown): Respostas {
  const o = obj(v);
  const saida: Respostas = {};
  for (const e of ETAPAS) {
    if (o[e] !== undefined) (saida as Record<string, unknown>)[e] = LIMPAR[e](o[e]);
  }
  return saida;
}

// ── Formatos ──────────────────────────────────────────────────────────────────

/** "@perfil", "perfil" ou o link → "@perfil". Vazio se não parecer um perfil. */
export function instagramNormalizado(v: unknown): string {
  let t = linha(v, 200);
  if (!t) return "";
  t = t.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/[/?#].*$/, "").replace(/^@/, "");
  return /^[A-Za-z0-9._]{1,30}$/.test(t) ? `@${t.toLowerCase()}` : "";
}

/** Link com http(s) e domínio com ponto. Aceita sem "https://". */
export function linkValido(v: string): string | null {
  const t = v.trim();
  if (!t) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`);
    if (!/^https?:$/.test(u.protocol) || !u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Link de vídeo aceito: YouTube, Instagram, TikTok, Vimeo. */
export function videoValido(v: string): boolean {
  const u = linkValido(v);
  if (!u) return false;
  const host = new URL(u).hostname.replace(/^www\.|^m\./, "");
  return ["youtube.com", "youtu.be", "instagram.com", "tiktok.com", "vimeo.com"].some(
    (h) => host === h || host.endsWith(`.${h}`),
  );
}

function reais(v: string): string {
  const n = Number(v.replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return `R$ ${v}`;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: n % 1 ? 2 : 0 });
}

function lista(itens: string[]): string {
  if (itens.length <= 1) return itens.join("");
  return `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`;
}

// ── Benefício: o que aparece no card e o texto que o parceiro confirma ────────

export interface CardBeneficio {
  titulo: string;
  detalhe: string;
  codigo: string;
}

/** Card do benefício, igual ao da vitrine. Título vazio = ainda não dá para mostrar. */
export function cardBeneficio(b: EtapaBeneficio): CardBeneficio {
  let titulo = "";
  switch (b.tipo) {
    case "percentual":
      titulo = b.percentual ? `${b.percentual.replace(".", ",")}% de desconto` : "";
      break;
    case "reais":
      titulo = b.valorReais ? `${reais(b.valorReais)} de desconto` : "";
      break;
    case "brinde":
      titulo = b.brinde ? `Brinde: ${b.brinde}` : "";
      break;
    case "servico":
      titulo = b.servico ? `${b.servico} sem custo` : "";
      break;
    case "especial":
    case "outro":
      titulo = b.descricao ? b.descricao.split("\n")[0].slice(0, 70) : "";
      break;
  }

  const partes: string[] = [];
  if (b.descricao && b.tipo !== "especial" && b.tipo !== "outro") partes.push(b.descricao.split("\n")[0]);
  const onde = b.ondeUsar.filter((o) => o !== "outro").map((o) => ONDE_USAR[o as keyof typeof ONDE_USAR].toLowerCase());
  if (b.ondeUsar.includes("outro") && b.ondeOutro) onde.push(b.ondeOutro);
  if (onde.length) partes.push(`vale em ${lista(onde)}`);

  const codigo = b.comoUsar === "codigo" ? b.codigo || (b.clubeCriaCodigo ? "código do Clube" : "") : "";
  return { titulo, detalhe: partes.join(" · "), codigo };
}

/**
 * Texto completo do benefício, por extenso. É o que fica gravado quando o parceiro
 * confirma (beneficio_confirmado_texto) e o que a equipe pode divulgar. Se mudar,
 * a confirmação deixa de valer.
 */
export function textoBeneficio(b: EtapaBeneficio): string {
  const c = cardBeneficio(b);
  const l: string[] = [];
  l.push(`Benefício: ${b.tipo ? TIPOS_BENEFICIO[b.tipo] : "—"}${c.titulo ? ` — ${c.titulo}` : ""}`);
  if (b.descricao) l.push(`Detalhes: ${b.descricao}`);
  const onde = b.ondeUsar.map((o) =>
    o === "outro" && b.ondeOutro ? b.ondeOutro : ONDE_USAR[o as keyof typeof ONDE_USAR],
  );
  if (onde.length) l.push(`Onde vale: ${lista(onde)}`);
  if (b.comoUsar) {
    let como: string = COMO_USAR[b.comoUsar as keyof typeof COMO_USAR];
    if (b.comoUsar === "codigo") como += b.codigo ? ` ${b.codigo}` : b.clubeCriaCodigo ? " (criado pelo Clube)" : "";
    if (b.comoUsar === "outro" && b.comoOutro) como = b.comoOutro;
    l.push(`Como usar: ${como}`);
  }
  for (const r of b.regras) {
    if (r === "valor_minimo") l.push(`Valor mínimo: ${b.regraValorMinimo ? reais(b.regraValorMinimo) : "sim"}`);
    if (r === "quantidade") l.push(`Quantidade limitada: ${b.regraQuantidade || "sim"}`);
    if (r === "restricoes") l.push(`Fora da regra: ${b.regraRestricoes || "sim"}`);
    if (r === "acumula")
      l.push(`Acumula com outras promoções: ${b.regraAcumula === "sim" ? "sim" : b.regraAcumula === "nao" ? "não" : "—"}`);
    if (r === "outras") l.push(`Outras condições: ${b.regraOutras || "sim"}`);
  }
  if (b.validade === "sem") l.push("Validade: sem prazo definido");
  if (b.validade === "data" && b.validadeData) {
    const [a, m, d] = b.validadeData.split("-");
    l.push(`Validade: até ${d}/${m}/${a}`);
  }
  return l.join("\n");
}

// ── Arquivos ──────────────────────────────────────────────────────────────────

export type TipoArquivo = "logo" | "capa" | "galeria" | "item" | "referencia";

const MB = 1024 * 1024;
const FOTOS = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

/**
 * Regras por tipo de arquivo. Os tipos aceitos somados são os do bucket
 * `parceiros-cadastro` (migration 0015): mudar nos dois lugares.
 * `unico`: um arquivo só (por item, no caso de `item`); o novo substitui o anterior.
 */
export const ARQUIVOS: Record<TipoArquivo, { max: number; tamanho: number; mimes: string[]; unico: boolean }> = {
  logo: {
    max: 1,
    tamanho: 15 * MB,
    mimes: [...FOTOS, "image/svg+xml", "application/pdf", "application/postscript", "application/illustrator"],
    unico: true,
  },
  capa: { max: 1, tamanho: 15 * MB, mimes: FOTOS, unico: true },
  galeria: { max: 10, tamanho: 15 * MB, mimes: FOTOS, unico: false },
  item: { max: ITENS_MAX, tamanho: 15 * MB, mimes: FOTOS, unico: true },
  referencia: { max: 3, tamanho: 25 * MB, mimes: ["application/pdf"], unico: false },
};

/** Tipo do arquivo pela extensão, para quando o navegador não informa (comum em .ai e .eps). */
export function mimePelaExtensao(nome: string, mime: string): string {
  if (mime) return mime;
  const ext = nome.toLowerCase().split(".").pop() ?? "";
  const mapa: Record<string, string> = {
    ai: "application/postscript",
    eps: "application/postscript",
    pdf: "application/pdf",
    svg: "image/svg+xml",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    heic: "image/heic",
    heif: "image/heif",
  };
  return mapa[ext] ?? "";
}

/** Motivo para recusar o arquivo, ou null se pode. */
export function problemaArquivo(tipo: TipoArquivo, nome: string, mime: string, tamanho: number): string | null {
  const r = ARQUIVOS[tipo];
  if (!r) return "Tipo de arquivo inválido.";
  if (!r.mimes.includes(mime)) {
    if (tipo === "referencia") return `${nome}: envie em PDF.`;
    if (tipo === "logo") return `${nome}: envie PNG, SVG, PDF, AI, EPS ou JPG.`;
    return `${nome}: envie uma foto (JPG, PNG, WEBP ou HEIC).`;
  }
  if (!Number.isFinite(tamanho) || tamanho <= 0) return `${nome}: arquivo vazio.`;
  if (tamanho > r.tamanho) return `${nome}: o arquivo passa de ${r.tamanho / MB} MB.`;
  return null;
}

/** Caminho no bucket: <cadastro>/<tipo>/<id>_<nome seguro>. */
export function caminhoArquivo(cadastroId: string, tipo: TipoArquivo, arquivoId: string, nome: string): string {
  return `${cadastroId}/${tipo}/${arquivoId}_${nomeSeguro(nome)}`;
}

// ── O que falta ───────────────────────────────────────────────────────────────

export interface Pendencia {
  etapa: NomeEtapa | "revisao";
  campo: string;
  texto: string;
}

export interface ArquivoResumo {
  tipo: TipoArquivo;
  item_id?: string | null;
}

/**
 * `envio`: impede enviar (o mínimo para a equipe trabalhar).
 * `publicacao`: não impede enviar, mas a página não vai ao ar sem isso
 * (aparece como "Ainda falta" na revisão e como pendência no painel).
 */
export function pendencias(r: Respostas, arquivos: ArquivoResumo[]): { envio: Pendencia[]; publicacao: Pendencia[] } {
  const envio: Pendencia[] = [];
  const publicacao: Pendencia[] = [];
  const falta = (lista: Pendencia[], etapa: Pendencia["etapa"], campo: string, texto: string) =>
    lista.push({ etapa, campo, texto });

  const n = r.negocio ?? VAZIO.negocio();
  if (!n.nomeEmpresa) falta(envio, "negocio", "nomeEmpresa", "Nome da empresa");
  if (!n.responsavel) falta(envio, "negocio", "responsavel", "Nome do responsável");
  if (!n.segmento) falta(envio, "negocio", "segmento", "Segmento");
  else if (n.segmento === "Outro" && !n.segmentoOutro) falta(envio, "negocio", "segmentoOutro", "Qual é o segmento");
  if (!n.cidade) falta(envio, "negocio", "cidade", "Cidade");
  if (!n.oQueFaz) falta(envio, "negocio", "oQueFaz", "O que a empresa faz");

  const b = r.beneficio ?? VAZIO.beneficio();
  if (!b.tipo) falta(envio, "beneficio", "tipo", "Tipo de benefício");
  else if (!cardBeneficio(b).titulo) {
    const campo = { percentual: "percentual", reais: "valorReais", brinde: "brinde", servico: "servico" }[
      b.tipo as string
    ];
    falta(envio, "beneficio", campo ?? "descricao", "Detalhe do benefício");
  }
  if (!b.comoUsar) falta(envio, "beneficio", "comoUsar", "Como o membro usa o benefício");
  if (!b.confirmado) falta(envio, "beneficio", "confirmado", "Confirmação do benefício");

  const c = r.contato ?? VAZIO.contato();
  if (!c.modalidades.length) falta(envio, "contato", "modalidades", "Como a empresa atende");
  if (!telefoneBR(c.whatsapp)) falta(envio, "contato", "whatsapp", "WhatsApp comercial");

  const tem = (t: TipoArquivo) => arquivos.some((a) => a.tipo === t);
  if (!tem("logo")) falta(publicacao, "fotos", "logo", "Logo");
  if (!tem("capa")) falta(publicacao, "fotos", "capa", "Foto principal");
  const p = r.produtos ?? VAZIO.produtos();
  const temMaterial = !!n.materialLink || tem("referencia");
  if (!p.itens.some((i) => i.nome) && !temMaterial)
    falta(publicacao, "produtos", "itens", "Produtos ou serviços (ou um catálogo)");
  if (c.modalidades.includes("presencial")) {
    if (!c.rua || !c.numero) falta(publicacao, "contato", "rua", "Endereço");
    if (!c.horaMarcada && !Object.values(c.horarios).some(Boolean))
      falta(publicacao, "contato", "horarios", "Horário de funcionamento");
  }

  return { envio, publicacao };
}

/** Etapas (1–6) que já têm o essencial. Serve para a barra de progresso e o painel. */
export function etapasCompletas(r: Respostas, arquivos: ArquivoResumo[]): number[] {
  const { envio } = pendencias(r, arquivos);
  const semFaltaDeEnvio = (e: NomeEtapa) => !envio.some((p) => p.etapa === e);
  const tem = (t: TipoArquivo) => arquivos.some((a) => a.tipo === t);
  const p = r.produtos;
  const completas: number[] = [];
  if (r.negocio && semFaltaDeEnvio("negocio")) completas.push(1);
  if (r.beneficio && semFaltaDeEnvio("beneficio")) completas.push(2);
  if ((p && p.itens.some((i) => i.nome)) || r.negocio?.materialLink || tem("referencia")) completas.push(3);
  if (tem("logo") && tem("capa")) completas.push(4);
  if (r.contato && semFaltaDeEnvio("contato")) completas.push(5);
  if (r.orcamento?.trabalha) completas.push(6);
  return completas;
}

// ── Código do link ────────────────────────────────────────────────────────────

export function codigoComFormato(v: unknown): v is string {
  return typeof v === "string" && /^[0-9a-f]{64}$/.test(v);
}

/** SHA-256 em hexadecimal, igual a encode(digest(codigo, 'sha256'), 'hex') no Postgres. */
export async function hashCodigo(codigo: string): Promise<string> {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(codigo));
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
