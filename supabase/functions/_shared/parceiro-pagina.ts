// Página do parceiro (/parceiro/:slug), bloco F do Portal do Parceiro.
// Spec: docs/superpowers/specs/2026-11-13-portal-cadastro-parceiros.md, seção 6.
//
// A equipe monta a página no painel a partir das respostas do cadastro. O que fica
// gravado (parceiros_perfil.conteudo, migration 0016) tem a forma de PerfilPagina.
// Este arquivo é usado pela página pública, pela prévia do parceiro, pelo painel e
// pela Edge Function: mudar aqui muda em todos.
// Teste: node --test supabase/functions/_shared/parceiro-pagina.test.ts

import { telefoneBR } from "./cotacao.ts";
import {
  COMO_USAR,
  DIAS,
  MODALIDADES,
  bloco,
  cardBeneficio,
  instagramNormalizado,
  limparBeneficio,
  limparContato,
  linha,
  linkValido,
  reais,
  videoValido,
  type Dia,
  type EtapaBeneficio,
  type EtapaContato,
  type Horario,
  type ItemOferta,
  type Respostas,
} from "./parceiro-cadastro.ts";

export interface ItemPagina {
  id: string;
  nome: string;
  descricao: string;
  preco: string; // já como aparece: "R$ 120", "A partir de R$ 80", "Sob consulta"
  foto: string | null;
  video: string;
}

export interface ContatoPagina {
  whatsapp: string; // só dígitos, com DDD, sem o 55
  instagram: string; // "@perfil"
  site: string;
  endereco: string;
  horarios: Record<Dia, Horario>;
  horaMarcada: boolean;
  horarioObs: string;
  regioes: string[];
  modalidades: string[]; // rótulos ("Presencial", "Online"...)
}

/** Vem do banco (versão do benefício confirmada pelo parceiro), nunca da tela. */
export interface BeneficioPagina {
  versao_id: string;
  dados: EtapaBeneficio;
}

export interface PerfilPagina {
  slug: string;
  nome: string;
  categoria: string;
  frase: string; // uma linha, vai no topo e no card da vitrine
  sobre: string;
  diferenciais: string;
  anoFundacao: string;
  cidade: string;
  tags: string[];
  logo: string | null; // caminho da foto (bucket privado na prévia, público depois de publicar)
  capa: string | null;
  galeria: string[];
  itens: ItemPagina[];
  contato: ContatoPagina;
  beneficio: BeneficioPagina | null;
}

export const GALERIA_MAX = 10;
export const ITENS_PAGINA_MAX = 12;
export const TAGS_MAX = 6;

/** Caminho que o painel gera: <cadastro>/pagina/<uuid>.<jpg|png|webp>. Mesma regra da 0016. */
export function caminhoFotoValido(v: unknown, cadastroId?: string): v is string {
  if (typeof v !== "string") return false;
  const m = /^([0-9a-f-]{36})\/pagina\/[0-9a-f-]{36}\.(jpg|png|webp)$/.exec(v);
  return !!m && (!cadastroId || m[1] === cadastroId);
}

export function slugDe(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " e ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
}

export function slugValido(v: string): boolean {
  return v.length > 0 && v.length <= 60 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(v);
}

/** Endereços com página feita à mão (rota própria no App.tsx). Mesma lista da 0016. */
export const SLUGS_RESERVADOS = ["dewa", "bioreluz", "insurance-sante"];

// ── Limpeza ───────────────────────────────────────────────────────────────────

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {});

function foto(v: unknown): string | null {
  return caminhoFotoValido(v) ? v : null;
}

function idItem(v: unknown, i: number): string {
  return typeof v === "string" && /^[a-z0-9]{6,16}$/.test(v) ? v : `item${String(i).padStart(3, "0")}`;
}

/** Perfil vindo do banco ou da tela: tudo conferido, nada de campo a mais. */
export function limparPerfil(v: unknown): PerfilPagina {
  const o = obj(v);
  const c = obj(o.contato);
  const h = limparContato({ horarios: c.horarios }).horarios;
  const b = obj(o.beneficio);
  const itens = (Array.isArray(o.itens) ? o.itens : []).slice(0, ITENS_PAGINA_MAX).map((x, i) => {
    const it = obj(x);
    const video = linha(it.video, 300);
    return {
      id: idItem(it.id, i),
      nome: linha(it.nome, 120),
      descricao: linha(it.descricao, 300),
      preco: linha(it.preco, 60),
      foto: foto(it.foto),
      video: videoValido(video) ? video : "",
    };
  });
  const site = linha(c.site, 300);
  const slug = linha(o.slug, 60);
  return {
    slug: slugValido(slug) ? slug : "",
    nome: linha(o.nome, 120),
    categoria: linha(o.categoria, 60),
    frase: linha(o.frase, 200),
    sobre: bloco(o.sobre, 2000),
    diferenciais: bloco(o.diferenciais, 1000),
    anoFundacao: linha(o.anoFundacao, 4).replace(/\D/g, ""),
    cidade: linha(o.cidade, 80),
    tags: [...new Set((Array.isArray(o.tags) ? o.tags : []).map((t) => linha(t, 30)).filter(Boolean))].slice(0, TAGS_MAX),
    logo: foto(o.logo),
    capa: foto(o.capa),
    galeria: [...new Set((Array.isArray(o.galeria) ? o.galeria : []).filter((x) => caminhoFotoValido(x)))].slice(0, GALERIA_MAX),
    itens,
    contato: {
      whatsapp: telefoneBR(c.whatsapp) ?? "",
      instagram: instagramNormalizado(c.instagram),
      site: site && linkValido(site) ? (linkValido(site) as string) : "",
      endereco: linha(c.endereco, 240),
      horarios: h,
      horaMarcada: c.horaMarcada === true,
      horarioObs: linha(c.horarioObs, 300),
      regioes: (Array.isArray(c.regioes) ? c.regioes : []).map((r) => linha(r, 60)).filter(Boolean).slice(0, 15),
      modalidades: (Array.isArray(c.modalidades) ? c.modalidades : []).map((m) => linha(m, 60)).filter(Boolean).slice(0, 6),
    },
    beneficio:
      typeof b.versao_id === "string" && b.versao_id ? { versao_id: b.versao_id, dados: limparBeneficio(b.dados) } : null,
  };
}

// ── Montar a partir das respostas ─────────────────────────────────────────────

export function precoTexto(i: Pick<ItemOferta, "precoTipo" | "preco">): string {
  if (i.precoTipo === "consulta") return "Sob consulta";
  if (!i.preco) return "";
  if (i.precoTipo === "apartir") return `A partir de ${reais(i.preco)}`;
  return reais(i.preco);
}

export function enderecoTexto(c: EtapaContato): string {
  if (!c.rua) return "";
  const rua = [c.rua, c.numero].filter(Boolean).join(", ") + (c.complemento ? ` – ${c.complemento}` : "");
  const cidade = [c.cidadeEndereco, c.uf].filter(Boolean).join("/");
  return [rua, c.bairro, cidade].filter(Boolean).join(", ");
}

/** Primeira versão da página: o que o parceiro respondeu, no formato da página. */
export function perfilDasRespostas(r: Respostas, empresaConvite = ""): PerfilPagina {
  const n = r.negocio;
  const c = r.contato;
  const nome = n?.nomeEmpresa || empresaConvite;
  const segmento = n?.segmento === "Outros" ? n?.segmentoOutro || "" : n?.segmento || "";
  const primeiraFrase = (n?.oQueFaz ?? "").split(/(?<=[.!?])\s|\n/)[0] ?? "";
  const modalidades = (c?.modalidades ?? []).map((m) =>
    m === "outro" ? c?.modalidadeOutra || "" : MODALIDADES[m as keyof typeof MODALIDADES] ?? "",
  );
  const regioes = [...(c?.regioes ?? []), ...(c?.regiaoOutra ? [c.regiaoOutra] : [])];
  return limparPerfil({
    slug: slugDe(nome),
    nome,
    categoria: segmento,
    frase: primeiraFrase.slice(0, 200),
    sobre: n?.oQueFaz ?? "",
    diferenciais: n?.diferenciais ?? "",
    anoFundacao: n?.anoFundacao ?? "",
    cidade: n?.cidade ?? "",
    tags: [],
    logo: null,
    capa: null,
    galeria: [],
    itens: (r.produtos?.itens ?? [])
      .filter((i) => i.nome)
      .map((i) => ({ id: i.id, nome: i.nome, descricao: i.descricao, preco: precoTexto(i), foto: null, video: i.video })),
    contato: c
      ? {
          whatsapp: c.whatsapp,
          instagram: c.instagram,
          site: c.site,
          endereco: c.modalidades.includes("presencial") ? enderecoTexto(c) : "",
          horarios: c.horarios,
          horaMarcada: c.horaMarcada,
          horarioObs: c.horarioObs,
          regioes: c.modalidades.some((m) => m !== "presencial") ? regioes : [],
          modalidades: modalidades.filter(Boolean),
        }
      : {},
    beneficio: null,
  });
}

/** O que falta para mandar a página para a validação. Mesmo mínimo da 0016 (logo e capa) + o básico. */
export function faltaNaPagina(p: PerfilPagina): string[] {
  const f: string[] = [];
  if (!p.slug) f.push("Endereço da página");
  if (!p.nome) f.push("Nome");
  if (!p.frase) f.push("Frase de apresentação");
  if (!p.logo) f.push("Logo");
  if (!p.capa) f.push("Foto principal");
  if (!p.contato.whatsapp && !p.contato.instagram && !p.contato.site) f.push("Algum contato");
  return f;
}

/** Todas as fotos usadas (para copiar na publicação). Mesma lista que a 0016 confere. */
export function fotosDoPerfil(p: PerfilPagina): string[] {
  const todas = [p.logo, p.capa, ...p.galeria, ...p.itens.map((i) => i.foto)].filter((x): x is string => !!x);
  return [...new Set(todas)];
}

// ── Mostrar ───────────────────────────────────────────────────────────────────

export function linkWhatsApp(numero: string, texto = ""): string {
  const n = telefoneBR(numero);
  if (!n) return "";
  return `https://wa.me/55${n}${texto ? `?text=${encodeURIComponent(texto)}` : ""}`;
}

export function telefoneTexto(numero: string): string {
  const n = telefoneBR(numero);
  if (!n) return "";
  return n.length === 11 ? `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}` : `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
}

export function linkInstagram(arroba: string): string {
  return arroba ? `https://www.instagram.com/${arroba.replace(/^@/, "")}` : "";
}

export function linkMapa(endereco: string): string {
  return endereco ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}` : "";
}

const ORDEM_DIAS = Object.keys(DIAS) as Dia[]; // seg … dom
const CURTO: Record<Dia, string> = { seg: "Seg", ter: "Ter", qua: "Qua", qui: "Qui", sex: "Sex", sab: "Sáb", dom: "Dom" };

function horaTexto(h: string): string {
  const [hh, mm] = h.split(":");
  return `${Number(hh)}h${mm === "00" ? "" : mm}`;
}

/** "Seg a sex: 9h às 18h", "Sáb: 9h às 13h". Dias seguidos com o mesmo horário viram um intervalo. */
export function horariosTexto(horarios: Record<Dia, Horario>): string[] {
  const linhas: string[] = [];
  let i = 0;
  while (i < ORDEM_DIAS.length) {
    const h = horarios[ORDEM_DIAS[i]];
    if (!h) {
      i++;
      continue;
    }
    let j = i;
    while (
      j + 1 < ORDEM_DIAS.length &&
      horarios[ORDEM_DIAS[j + 1]]?.abre === h.abre &&
      horarios[ORDEM_DIAS[j + 1]]?.fecha === h.fecha
    )
      j++;
    const dias = j === i ? CURTO[ORDEM_DIAS[i]] : `${CURTO[ORDEM_DIAS[i]]} a ${CURTO[ORDEM_DIAS[j]].toLowerCase()}`;
    linhas.push(`${dias}: ${horaTexto(h.abre)} às ${horaTexto(h.fecha)}`);
    i = j + 1;
  }
  return linhas;
}

const DIA_EN: Record<string, Dia> = { Mon: "seg", Tue: "ter", Wed: "qua", Thu: "qui", Fri: "sex", Sat: "sab", Sun: "dom" };

/** Aberto agora, no horário de Brasília. null = não tem horário cadastrado. */
export function abertoAgora(horarios: Record<Dia, Horario>, agora: Date = new Date()): boolean | null {
  if (!ORDEM_DIAS.some((d) => horarios[d])) return null;
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(agora);
  const p = (t: string) => partes.find((x) => x.type === t)?.value ?? "";
  const dia = DIA_EN[p("weekday")];
  const h = dia ? horarios[dia] : null;
  if (!h) return false;
  const agoraHM = `${p("hour")}:${p("minute")}`;
  return h.fecha > h.abre ? agoraHM >= h.abre && agoraHM < h.fecha : agoraHM >= h.abre || agoraHM < h.fecha;
}

/**
 * Condições do benefício para a página pública, sem o código (que só aparece para
 * membro logado). O título e o detalhe (com "vale em …") vêm de cardBeneficio().
 */
export function condicoesBeneficio(b: EtapaBeneficio): string[] {
  const l: string[] = [];
  if (b.comoUsar === "codigo") l.push("Use o código do Sanchez Clube na compra.");
  else if (b.comoUsar === "contato") l.push("Fale com a empresa e diga que é membro do Sanchez Clube.");
  else if (b.comoUsar === "outro") l.push(b.comoOutro || COMO_USAR.outro);
  for (const r of b.regras) {
    if (r === "valor_minimo" && b.regraValorMinimo) l.push(`Compra mínima de ${reais(b.regraValorMinimo)}.`);
    if (r === "quantidade" && b.regraQuantidade) l.push(`Quantidade limitada: ${b.regraQuantidade}.`);
    if (r === "restricoes" && b.regraRestricoes) l.push(`Não vale para: ${b.regraRestricoes}.`);
    if (r === "acumula" && b.regraAcumula) l.push(b.regraAcumula === "sim" ? "Acumula com outras promoções." : "Não acumula com outras promoções.");
    if (r === "outras" && b.regraOutras) l.push(b.regraOutras);
  }
  if (b.validade === "data" && b.validadeData) {
    const [a, m, d] = b.validadeData.split("-");
    l.push(`Válido até ${d}/${m}/${a}.`);
  }
  return l;
}

/** Título do benefício para o card da vitrine ("10% de desconto"). */
export function tituloBeneficio(p: PerfilPagina): string {
  return p.beneficio ? cardBeneficio(p.beneficio.dados).titulo : "";
}

