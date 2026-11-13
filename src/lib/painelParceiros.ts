import { supabase } from "./supabase";
import type { Parceiro } from "@/data/parceiros";
import {
  SEGMENTOS,
  STATUS,
  VAZIO,
  cardBeneficio,
  instagramNormalizado,
  limparRespostas,
  pendencias,
  type ArquivoResumo,
  type Pendencias,
  type Respostas,
  type TipoArquivo,
} from "../../supabase/functions/_shared/parceiro-cadastro.ts";

// ─────────────────────────────────────────────────────────────
// PAINEL DE PARCEIROS — client das funções do painel (migration 0015).
// Todas conferem o papel no banco (parceiros / validacao); aqui só chamamos.
// ─────────────────────────────────────────────────────────────

export interface CadastroLista {
  id: string;
  status: keyof typeof STATUS;
  slug: string | null;
  convite_empresa: string;
  convite_contato: string | null;
  convite_whatsapp: string | null;
  respostas: Respostas;
  etapas_completas: number[];
  beneficio_confirmado_em: string | null;
  enviado_em: string | null;
  ultima_atividade_em: string | null;
  token_expira_em: string;
  responsavel_equipe: string | null;
  created_at: string;
  arquivos: ArquivoResumo[];
  /** Calculado aqui, com as mesmas regras do formulário. */
  pendencias: Pendencias;
}

export interface ArquivoFicha {
  id: string;
  tipo: TipoArquivo;
  item_id: string | null;
  caminho: string;
  nome: string;
  mime: string;
  tamanho: number;
  largura: number | null;
  altura: number | null;
  usar: boolean;
  created_at: string;
}

export interface VersaoBeneficio {
  id: string;
  texto: string;
  situacao: "confirmado" | "validado" | "substituido";
  confirmado_em: string;
  confirmado_por: string | null;
  validado_em: string | null;
  validado_por: string | null;
}

export interface ItemHistorico {
  quando: string;
  acao: string;
  autor: string;
  detalhe: Record<string, unknown>;
}

export interface Ficha {
  cadastro: Omit<CadastroLista, "arquivos" | "pendencias"> & {
    beneficio_confirmado_texto: string | null;
    autorizacao_uso_em: string | null;
    autorizacao_termos_versao: string | null;
    etapa_atual: number;
  };
  arquivos: ArquivoFicha[];
  beneficio_versoes: VersaoBeneficio[];
  historico: ItemHistorico[];
}

export async function meusPapeis(): Promise<string[]> {
  const { data, error } = await supabase.rpc("meus_papeis");
  if (error) throw error;
  return (data as string[] | null) ?? [];
}

export async function listar(): Promise<CadastroLista[]> {
  const { data, error } = await supabase.rpc("parceiros_painel_lista");
  if (error) throw error;
  return ((data as Omit<CadastroLista, "pendencias">[]) ?? []).map((c) => {
    const respostas = limparRespostas(c.respostas);
    return { ...c, respostas, pendencias: pendencias(respostas, c.arquivos) };
  });
}

export async function abrirFicha(id: string): Promise<Ficha> {
  const { data, error } = await supabase.rpc("parceiros_painel_ficha", { p_id: id });
  if (error) throw error;
  const f = data as Ficha;
  return { ...f, cadastro: { ...f.cadastro, respostas: limparRespostas(f.cadastro.respostas) } };
}

export async function mudarStatus(id: string, status: string, nota?: string) {
  const { error } = await supabase.rpc("parceiro_painel_mudar_status", {
    p_id: id,
    p_status: status,
    p_nota: nota || null,
  });
  if (error) throw error;
}

export async function anotar(id: string, nota: string | null, responsavel: string | null = null) {
  const { error } = await supabase.rpc("parceiro_painel_anotar", {
    p_id: id,
    p_nota: nota,
    p_responsavel: responsavel,
  });
  if (error) throw error;
}

/** Cria o convite. O código volta UMA vez: depois só dá para gerar outro. */
export async function criarConvite(p: {
  empresa: string;
  contato: string;
  whatsapp: string;
  respostas: Respostas;
}): Promise<{ id: string; codigo: string }> {
  const { data, error } = await supabase.rpc("parceiro_convite_criar", {
    p_empresa: p.empresa,
    p_contato: p.contato || null,
    p_whatsapp: p.whatsapp || null,
    p_respostas: p.respostas,
  });
  if (error) throw error;
  const linha = (data as { id: string; codigo: string }[])[0];
  return linha;
}

export async function renovarLink(id: string): Promise<string> {
  const { data, error } = await supabase.rpc("parceiro_convite_renovar", { p_id: id });
  if (error) throw error;
  return data as string;
}

export async function invalidarLink(id: string) {
  const { error } = await supabase.rpc("parceiro_convite_invalidar", { p_id: id });
  if (error) throw error;
}

/** Links de 10 min para ver/baixar os arquivos (a policy da 0015 exige o papel). */
export async function linksDosArquivos(caminhos: string[]): Promise<Map<string, string>> {
  const mapa = new Map<string, string>();
  if (!caminhos.length) return mapa;
  const { data } = await supabase.storage.from("parceiros-cadastro").createSignedUrls(caminhos, 600);
  for (const l of data ?? []) if (l.path && l.signedUrl) mapa.set(l.path, l.signedUrl);
  return mapa;
}

export async function linkDeDownload(caminho: string, nome: string): Promise<string | null> {
  const { data } = await supabase.storage.from("parceiros-cadastro").createSignedUrl(caminho, 600, { download: nome });
  return data?.signedUrl ?? null;
}

// ── Link e mensagens de WhatsApp ──────────────────────────────────────────────

export function linkDoCadastro(codigo: string): string {
  return `${window.location.origin}/cadastro-parceiro#${codigo}`;
}

/** Telefone salvo (só dígitos, com ou sem 55) → número para o wa.me. */
export function numeroWhats(v: string | null | undefined): string | null {
  const d = (v ?? "").replace(/\D/g, "").replace(/^0+/, "");
  if (/^55\d{10,11}$/.test(d)) return d;
  if (/^\d{10,11}$/.test(d)) return `55${d}`;
  return null;
}

export function linkWhats(numero: string | null, texto: string): string {
  return numero
    ? `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
    : `https://wa.me/?text=${encodeURIComponent(texto)}`;
}

export function mensagemConvite(contato: string, empresa: string, link: string, preenchido: boolean): string {
  const ola = contato ? `Olá, ${contato.split(" ")[0]}!` : "Olá!";
  return [
    `${ola} Aqui é a coordenação do Clube Sanchez.`,
    preenchido
      ? `Este é o link para conferir e completar a página da ${empresa} no Clube. Já deixamos preenchido o que tínhamos: é só conferir, corrigir e completar o que falta.`
      : `Este é o link para cadastrar a ${empresa} no Clube:`,
    link,
    "Pode preencher aos poucos: tudo fica salvo e você continua pelo mesmo link. O link vale por 90 dias.",
  ].join("\n\n");
}

export function mensagemPendencia(contato: string, empresa: string, faltas: string[]): string {
  const ola = contato ? `Oi, ${contato.split(" ")[0]}!` : "Oi!";
  return `${ola} Para terminar a página da ${empresa} no Clube Sanchez, falta: ${faltas.join(", ").toLowerCase()}. É só enviar pelo mesmo link do cadastro. Se não encontrar o link, me avise que mando outro.`;
}

// ── Convite a partir de um parceiro que já está no site ───────────────────────

/** Categoria antiga de src/data/parceiros.ts → segmento novo (lista da Júlia). */
const SEGMENTO_POR_SLUG: Record<string, (typeof SEGMENTOS)[number]> = {
  dewa: "Moda e acessórios",
  bioreluz: "Serviços para casa",
  "insurance-sante": "Seguros e finanças",
  "mrt-arquitetura": "Construção e reforma",
  "oticas-diniz": "Saúde",
  remalar: "Serviços para casa",
  "renova-lar": "Casa e decoração",
  "lumine-studio": "Fotografia e audiovisual",
  "vidracaria-av": "Construção e reforma",
};

/**
 * Respostas pré-preenchidas com o que o site já tem do parceiro. O benefício vem
 * preenchido quando dá para entender o texto do voucher, mas sempre DESMARCADO:
 * o parceiro precisa confirmar de novo (decisão da Júlia, 13/11).
 */
export function respostasDoParceiro(p: Parceiro): Respostas {
  const negocio = {
    ...VAZIO.negocio(),
    nomeEmpresa: p.nome,
    segmento: SEGMENTO_POR_SLUG[p.slug] ?? "",
    oQueFaz: p.descricao,
  };

  const contato = { ...VAZIO.contato() };
  const wa = p.whatsapp?.match(/wa\.me\/(\d{12,13})/);
  if (wa) contato.whatsapp = wa[1].replace(/^55/, "");
  if (p.site?.includes("instagram.com")) contato.instagram = instagramNormalizado(p.site);
  else if (p.site) contato.site = p.site;

  const beneficio = { ...VAZIO.beneficio() };
  const v = p.voucher ?? "";
  const pct = v.match(/^(\d+(?:[.,]\d+)?)\s*%\s*(?:de desconto)?\s*(.*)$/i);
  const rs = v.match(/R\$\s*(\d+(?:[.,]\d+)?)/i);
  const sem = v.match(/^(.+?)\s+sem custo$/i);
  if (pct) {
    beneficio.tipo = "percentual";
    beneficio.percentual = pct[1];
    beneficio.descricao = pct[2].trim();
  } else if (rs) {
    beneficio.tipo = "reais";
    beneficio.valorReais = rs[1];
  } else if (sem) {
    beneficio.tipo = "servico";
    beneficio.servico = sem[1];
  }

  return { negocio, contato, beneficio: cardBeneficio(beneficio).titulo ? beneficio : undefined };
}

// ── Planilha ──────────────────────────────────────────────────────────────────

function celula(v: unknown): string {
  const t = v === null || v === undefined ? "" : String(v);
  // Fórmula vinda de texto do parceiro não pode rodar no Excel.
  const seguro = /^[=+\-@\t\r]/.test(t) ? `'${t}` : t;
  return `"${seguro.replace(/"/g, '""')}"`;
}

const data = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" }) : "";

/** CSV com ";" e BOM, que abre direto no Excel em português. */
export function planilha(lista: CadastroLista[]): Blob {
  const cab = [
    "Empresa",
    "Segmento",
    "Status",
    "Responsável na empresa",
    "WhatsApp comercial",
    "Instagram",
    "Cidade",
    "Benefício",
    "Benefício confirmado em",
    "Progresso",
    "Falta para publicar",
    "Responsável na equipe",
    "Enviado em",
    "Última atividade",
  ];
  const linhas = lista.map((c) => {
    const r = c.respostas;
    const n = r.negocio ?? VAZIO.negocio();
    const ct = r.contato ?? VAZIO.contato();
    return [
      n.nomeEmpresa || c.convite_empresa,
      n.segmento === "Outros" ? n.segmentoOutro || "Outros" : n.segmento,
      STATUS[c.status],
      n.responsavel || c.convite_contato,
      ct.whatsapp,
      ct.instagram,
      n.cidade,
      r.beneficio ? cardBeneficio(r.beneficio).titulo : "",
      data(c.beneficio_confirmado_em),
      `${Math.round((c.etapas_completas.length / 6) * 100)}%`,
      [...c.pendencias.envio, ...c.pendencias.publicacao].map((p) => p.texto).join(", "),
      c.responsavel_equipe,
      data(c.enviado_em),
      data(c.ultima_atividade_em),
    ];
  });
  const csv = [cab, ...linhas].map((l) => l.map(celula).join(";")).join("\r\n");
  return new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
}
