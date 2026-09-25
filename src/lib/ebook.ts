// ─────────────────────────────────────────────────────────────
// E-BOOK "Papo de Aluguel" — Bloco 6 (formulário curto)
// Até 04/08 baixar exigia virar membro. O briefing da Yruena desfez isso:
// visitante baixa preenchendo nome + e-mail + WhatsApp (vira lead), membro
// logado baixa direto, e quem já preencheu nesta máquina não preenche de novo.
//
// Regra de ouro daqui: o DOWNLOAD NUNCA DEPENDE DO BANCO. Toda gravação é
// best-effort — se o Supabase estiver fora, o PDF baixa igual e o erro fica
// só no console. Perder um lead é ruim; travar o material é pior.
// ─────────────────────────────────────────────────────────────

import { supabase } from "./supabase";
import { getAtribuicao } from "./atribuicao";
import { getSessaoId, track } from "./track";

export const EBOOK_SLUG = "papo-de-aluguel";
export const EBOOK_URL = "/ebook-papo-de-aluguel.pdf";
export const EBOOK_FILENAME = "Papo de Aluguel - E-book Sanchez.pdf";

/** Teto pra qualquer ida ao banco no caminho do download. Rede pendurada não
 * pode deixar a pessoa olhando "Preparando..." pra sempre. */
const LIMITE_BANCO_MS = 6000;

const LEAD_STORAGE_KEY = "clube_ebook_lead";

/** O que fica no localStorage depois do primeiro download do visitante: o id
 * amarra os downloads repetidos ao mesmo lead, e nome/e-mail/WhatsApp
 * pré-preenchem o cadastro do Clube depois (item 5 do Bloco 6). */
export interface EbookLead {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
}

/** Dispara o download do PDF no navegador. */
export function baixarEbook() {
  const a = document.createElement("a");
  a.href = EBOOK_URL;
  a.download = EBOOK_FILENAME;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** True se existe sessão logada (lê do storage local — funciona offline). */
export async function temSessao(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

// ─── lead guardado nesta máquina ───

/** Lead que já preencheu o formulário neste navegador, ou null. Tolera JSON
 * corrompido e storage bloqueado (modo privado): nesses casos só pede os
 * dados de novo, nunca quebra a página. */
export function getLeadSalvo(): EbookLead | null {
  try {
    const bruto = localStorage.getItem(LEAD_STORAGE_KEY);
    if (!bruto) return null;
    const lead = JSON.parse(bruto) as Partial<EbookLead> | null;
    if (!lead?.id || !lead.email) return null;
    return {
      id: lead.id,
      nome: lead.nome ?? "",
      email: lead.email,
      whatsapp: lead.whatsapp ?? "",
    };
  } catch {
    return null;
  }
}

function salvarLead(lead: EbookLead) {
  try {
    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(lead));
  } catch {
    // storage cheio/bloqueado — segue sem lembrar (vai pedir de novo depois)
  }
}

// ─── validação (mensagens em português, exibidas no modal) ───

export function erroDoNome(nome: string): string | null {
  const valor = nome.trim();
  if (!valor) return "Informe seu nome completo.";
  if (valor.length < 2) return "Nome muito curto.";
  if (valor.length > 120) return "Nome muito longo.";
  return null;
}

/** Formato mínimo de e-mail — espelha o `check` da migration 0008. Validar
 * aqui evita o insert ser recusado pelo banco sem a pessoa entender por quê. */
export function erroDoEmail(email: string): string | null {
  const valor = email.trim();
  if (!valor) return "Informe seu e-mail.";
  if (valor.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)) {
    return "E-mail inválido. Confira o endereço digitado.";
  }
  return null;
}

/** Conta só os dígitos: a pessoa pode digitar com máscara, espaço ou +55.
 * 10 dígitos = fixo com DDD; 13 = +55 com celular. Tudo entre isso passa. */
export function erroDoWhatsapp(whatsapp: string): string | null {
  const digitos = whatsapp.replace(/\D/g, "");
  if (!digitos) return "Informe seu WhatsApp.";
  if (digitos.length < 10 || digitos.length > 13) {
    return "WhatsApp inválido. Inclua o DDD, ex.: (11) 90000-0000.";
  }
  return null;
}

// ─── gravação (tudo best-effort) ───

/** Faz o insert sem nunca propagar falha: corre contra um timeout (rede
 * pendurada não trava a UI) e registra no console o que deu errado.
 * O supabase-js NÃO rejeita quando o banco recusa — devolve `{ error }` —,
 * por isso os dois caminhos (rejeição e erro devolvido) são tratados aqui. */
async function gravarBestEffort(
  onde: string,
  promessa: PromiseLike<{ error: { message: string } | null }>,
): Promise<void> {
  const resultado = await Promise.race([
    Promise.resolve(promessa).catch((erro: unknown) => ({
      error: { message: String(erro) },
    })),
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), LIMITE_BANCO_MS);
    }),
  ]);

  if (resultado === null) {
    console.warn(`[ebook] ${onde}: banco demorou demais (o download segue).`);
  } else if (resultado.error) {
    console.warn(
      `[ebook] ${onde}: falhou (o download segue) —`,
      resultado.error.message,
    );
  }
}

interface RegistroDownload {
  membroId?: string | null;
  leadId?: string | null;
}

/** Uma linha por download em `ebook_downloads` (migrations 0003 + 0008).
 * Download repetido gera linha nova de propósito: o painel precisa separar
 * total de únicos. */
async function registrarDownload({ membroId, leadId }: RegistroDownload) {
  await gravarBestEffort(
    "ebook_downloads",
    supabase.from("ebook_downloads").insert({
      membro_id: membroId ?? null,
      lead_id: leadId ?? null,
      ebook: EBOOK_SLUG,
    }),
  );
}

/** Membro logado: baixa direto, sem modal. */
export async function baixarEbookComoMembro(): Promise<void> {
  baixarEbook();
  void track("ebook_download", { material: EBOOK_SLUG, membro: true });

  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    await registrarDownload({ membroId: auth.user.id });
  } catch (erro) {
    console.warn("[ebook] não deu pra registrar o download do membro:", erro);
  }
}

/** Visitante que já é lead nesta máquina: baixa direto e conta o repetido. */
export async function baixarEbookComoLead(lead: EbookLead): Promise<void> {
  baixarEbook();
  void track("ebook_download", {
    material: EBOOK_SLUG,
    membro: false,
    repetido: true,
  });
  await registrarDownload({ leadId: lead.id });
}

export interface DadosFormularioEbook {
  nome: string;
  email: string;
  whatsapp: string;
  /** Opt-in SEPARADO do download: recusar não bloqueia o e-book. */
  aceitaComunicacao: boolean;
}

/** Visitante novo: grava o lead, guarda nesta máquina, baixa e conta.
 * O id do lead é gerado no cliente de propósito — `ebook_leads` não tem
 * policy de SELECT (ninguém lê leads pela anon key), então não dá pra pedir o
 * id de volta no insert. Gerar aqui é o que permite guardar no localStorage e
 * amarrar os downloads repetidos ao mesmo lead. */
export async function enviarLeadEBaixar(
  dados: DadosFormularioEbook,
): Promise<EbookLead> {
  const atribuicao = getAtribuicao();
  const agora = new Date().toISOString();
  const lead: EbookLead = {
    id: crypto.randomUUID(),
    nome: dados.nome.trim(),
    email: dados.email.trim().toLowerCase(),
    whatsapp: dados.whatsapp.trim(),
  };

  await gravarBestEffort(
    "ebook_leads",
    supabase.from("ebook_leads").insert({
      id: lead.id,
      nome: lead.nome,
      email: lead.email,
      whatsapp: lead.whatsapp,
      material: EBOOK_SLUG,
      aceita_comunicacao: dados.aceitaComunicacao,
      // carimbo só quando houve consentimento — prova do QUANDO (LGPD).
      aceita_comunicacao_em: dados.aceitaComunicacao ? agora : null,
      origem: atribuicao.origem,
      campanha: atribuicao.campanha,
      utm: atribuicao.utm,
      ref: atribuicao.ref,
      sessao_id: getSessaoId(),
    }),
  );

  // Guarda mesmo se o insert falhou: a pessoa preencheu, não merece preencher
  // de novo. Um lead_id órfão no download é melhor que repetir o formulário.
  salvarLead(lead);

  baixarEbook();
  void track("ebook_download", {
    material: EBOOK_SLUG,
    membro: false,
    repetido: false,
  });
  await registrarDownload({ leadId: lead.id });

  return lead;
}
