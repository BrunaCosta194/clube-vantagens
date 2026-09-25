import { supabase } from "./supabase";

// ─────────────────────────────────────────────────────────────
// PAINEL — Bloco 11 (painel de desempenho)
// Client das RPCs criadas em supabase/migrations/0009_painel_admin.sql.
// Todas as funções são SECURITY DEFINER e checam is_admin() no banco — aqui
// só empacotamos filtros, convertemos datas para o fuso de São Paulo e
// tipamos o retorno.
// ─────────────────────────────────────────────────────────────

export interface PainelTotais {
  eventos: number;
  sessoes: number;
  membros_ativos: number;
}

export interface PainelPorDia {
  dia: string;
  eventos: number;
  sessoes: number;
}

export interface PainelPorEvento {
  nome: string;
  total: number;
}

export interface PainelBanner {
  banner: string;
  views: number;
  cliques: number;
}

export interface PainelFunilEbook {
  abriu_form: number;
  enviou_form: number;
  baixou: number;
  virou_membro: number;
}

export interface PainelParceiro {
  slug: string;
  aberturas: number;
  contatos: number;
  contatos_whatsapp: number;
  contatos_site: number;
}

export interface PainelProduto {
  produto: string;
  canal: string;
  cliques: number;
}

export interface PainelSocial {
  rede: string;
  local: string;
  cliques: number;
}

export interface PainelMapa {
  tipo: string;
  localizacao: string;
  total: number;
}

export interface PainelCadastroPorOrigem {
  origem: string;
  campanha: string;
  iniciados: number;
  completos: number;
}

export interface PainelTopCodigo {
  codigo: string;
  indicacoes: number;
}

export interface PainelIndicacoes {
  compartilhamentos: number;
  cadastradas: number;
  convertidas: number;
  top_codigos: PainelTopCodigo[];
}

export interface PainelMetricas {
  totais: PainelTotais;
  por_dia: PainelPorDia[];
  por_evento: PainelPorEvento[];
  banners: PainelBanner[];
  funil_ebook: PainelFunilEbook;
  parceiros: PainelParceiro[];
  produtos: PainelProduto[];
  social: PainelSocial[];
  mapa: PainelMapa[];
  cadastros_por_origem: PainelCadastroPorOrigem[];
  indicacoes: PainelIndicacoes;
  novos_membros: number;
}

export interface PainelOpcoesFiltro {
  campanhas: string[];
  origens: string[];
  refs: string[];
}

export type PainelPeriodo = "7d" | "30d" | "90d" | "custom";
export type PainelDispositivo = "mobile" | "tablet" | "desktop";
export type PainelSituacao = "visitante" | "membro";

export interface PainelFiltros {
  periodo: PainelPeriodo;
  /** yyyy-mm-dd, só usado quando periodo === "custom" */
  inicio?: string;
  /** yyyy-mm-dd, só usado quando periodo === "custom" */
  fim?: string;
  campanha?: string | null;
  origem?: string | null;
  dispositivo?: PainelDispositivo | null;
  situacao?: PainelSituacao | null;
  ref?: string | null;
}

/** Checa se o usuário logado é admin do painel (tabela `admins`). */
export async function ehAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_admin");
  if (error) throw error;
  return Boolean(data);
}

/** Valores distintos pros selects de filtro (campanha/origem/ref). */
export async function carregarOpcoesFiltro(): Promise<PainelOpcoesFiltro> {
  const { data, error } = await supabase.rpc("painel_opcoes_filtro");
  if (error) throw error;
  return (data ?? { campanhas: [], origens: [], refs: [] }) as PainelOpcoesFiltro;
}

/** yyyy-mm-dd → ISO string à meia-noite de São Paulo (UTC-03:00, sem horário
 * de verão desde 2019 — fixo o ano todo). */
function inicioDoDiaSaoPaulo(data: string): string {
  return `${data}T00:00:00-03:00`;
}

/** yyyy-mm-dd → ISO string da meia-noite do dia SEGUINTE em São Paulo —
 * limite exclusivo (p_fim), pra incluir o dia inteiro informado. */
function fimDoDiaSaoPauloExclusivo(data: string): string {
  const [ano, mes, dia] = data.split("-").map(Number);
  const proximoDia = new Date(Date.UTC(ano, mes - 1, dia + 1));
  const y = proximoDia.getUTCFullYear();
  const m = String(proximoDia.getUTCMonth() + 1).padStart(2, "0");
  const d = String(proximoDia.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}T00:00:00-03:00`;
}

function hojeYYYYMMDD(): string {
  const agora = new Date();
  const y = agora.getFullYear();
  const m = String(agora.getMonth() + 1).padStart(2, "0");
  const d = String(agora.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function diasAtrasYYYYMMDD(dias: number): string {
  const agora = new Date();
  agora.setDate(agora.getDate() - dias);
  const y = agora.getFullYear();
  const m = String(agora.getMonth() + 1).padStart(2, "0");
  const d = String(agora.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Resolve o período escolhido em (inicio, fim) no fuso de São Paulo,
 * já como ISO strings prontas pra RPC (p_fim exclusivo). */
function resolverPeriodo(filtros: PainelFiltros): { inicio: string; fim: string } {
  if (filtros.periodo === "custom") {
    const inicio = filtros.inicio ?? diasAtrasYYYYMMDD(7);
    const fim = filtros.fim ?? hojeYYYYMMDD();
    return { inicio: inicioDoDiaSaoPaulo(inicio), fim: fimDoDiaSaoPauloExclusivo(fim) };
  }

  const dias = filtros.periodo === "7d" ? 7 : filtros.periodo === "30d" ? 30 : 90;
  return {
    inicio: inicioDoDiaSaoPaulo(diasAtrasYYYYMMDD(dias - 1)),
    fim: fimDoDiaSaoPauloExclusivo(hojeYYYYMMDD()),
  };
}

/** Métricas agregadas do painel, já filtradas. */
export async function carregarMetricas(filtros: PainelFiltros): Promise<PainelMetricas> {
  const { inicio, fim } = resolverPeriodo(filtros);

  const { data, error } = await supabase.rpc("painel_metricas", {
    p_inicio: inicio,
    p_fim: fim,
    p_campanha: filtros.campanha ?? null,
    p_origem: filtros.origem ?? null,
    p_dispositivo: filtros.dispositivo ?? null,
    p_situacao: filtros.situacao ?? null,
    p_ref: filtros.ref ?? null,
  });

  if (error) throw error;
  return data as PainelMetricas;
}
