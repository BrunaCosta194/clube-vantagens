// ─────────────────────────────────────────────────────────────
// TRACK — Bloco 5 (fundação de mensuração)
// Fire-and-forget: nunca lança, nunca bloqueia a UI, nunca depende de rede
// pra continuar funcionando. Grava em public.eventos (migration 0007).
//
// Transporte: fetch cru na REST do Supabase com `keepalive: true`, em vez
// do client supabase-js. Um clique que sai do site (wa.me, tel:, site
// externo) pode descartar o fetch no meio se o navegador começar a
// descarregar a página antes dele terminar — `keepalive` deixa o request
// sobreviver a essa navegação. Usar o mesmo caminho pra TODOS os eventos
// (mesmo os que não saem do site) mantém uma lib só, sem duplicar lógica.
//
// Não lê `src/lib/supabase.ts` (que lança se faltar env — ver esse arquivo):
// track() lê as envs direto e vira no-op se elas não existirem, em vez de
// derrubar quem chamou. `membro_id`/`access_token` vêm do cache de sessão
// de `src/lib/sessao.tsx` (mesmo listener do SessaoProvider, sem duplicar).
// ─────────────────────────────────────────────────────────────

import type { Session } from "@supabase/supabase-js";
import { getSessaoAtualCache } from "./sessao";
import { getAtribuicao } from "./atribuicao";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Espelho do `check (nome in (...))` da migration 0007_eventos.sql — mudar
 * um lado sem o outro quebra o insert silenciosamente (RLS engole o erro). */
export type NomeEvento =
  | "banner_view"
  | "banner_click"
  | "ebook_form_open"
  | "ebook_form_submit"
  | "ebook_download"
  | "club_signup_start"
  | "club_signup_complete"
  | "partner_open"
  | "partner_contact"
  | "product_click"
  | "referral_share"
  | "referral_conversion"
  | "map_open"
  | "social_click";

type Dispositivo = "mobile" | "tablet" | "desktop";

const SESSAO_ID_STORAGE_KEY = "clube_sessao_id";
/** Fallback em memória — se sessionStorage falhar (modo privado etc.), o id
 * ainda fica estável durante o carregamento da página, só não sobrevive a
 * um reload. */
let sessaoIdMemoria: string | null = null;

function getSessaoId(): string {
  try {
    const existente = sessionStorage.getItem(SESSAO_ID_STORAGE_KEY);
    if (existente) return existente;
    const novo = crypto.randomUUID();
    sessionStorage.setItem(SESSAO_ID_STORAGE_KEY, novo);
    return novo;
  } catch {
    if (!sessaoIdMemoria) sessaoIdMemoria = crypto.randomUUID();
    return sessaoIdMemoria;
  }
}

function getDispositivo(): Dispositivo {
  const largura = typeof window !== "undefined" ? window.innerWidth : 1024;
  if (largura < 768) return "mobile";
  if (largura < 1024) return "tablet";
  return "desktop";
}

export interface TrackOpcoes {
  /** Sobrescreve a sessão lida do cache (membro_id + access_token vêm dela).
   * Necessário logo após o signUp: o listener do SessaoProvider pode ainda
   * não ter processado o SIGNED_IN quando `club_signup_complete` dispara, e
   * a sessão já está disponível na resposta do próprio signUp/getSession —
   * token e membro_id precisam vir juntos, senão o RLS rejeita o insert
   * (a policy exige que membro_id bata com o auth.uid() do token usado). */
  sessao?: Session | null;
}

/** Fire-and-forget: nunca rejeita (fica seguro chamar sem `await`/`.catch`),
 * nunca bloqueia a UI, e não faz nada se faltar env do Supabase. */
export async function track(
  nome: NomeEvento,
  props: Record<string, unknown> = {},
  opcoes: TrackOpcoes = {},
): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;

  try {
    const atribuicao = getAtribuicao();
    const sessaoLida = opcoes.sessao !== undefined ? opcoes.sessao : getSessaoAtualCache();
    // Token vencido (aba parada horas, refresh ainda não rodou) → a REST
    // responde 401 e o evento se perde. Nesse caso grava como visitante.
    const vencida =
      !!sessaoLida?.expires_at && sessaoLida.expires_at * 1000 <= Date.now();
    const sessao = vencida ? null : sessaoLida;
    const token = sessao?.access_token || SUPABASE_ANON_KEY;

    const corpo = {
      nome,
      sessao_id: getSessaoId(),
      membro_id: sessao?.user?.id ?? null,
      props,
      origem: atribuicao.origem,
      campanha: atribuicao.campanha,
      utm: atribuicao.utm,
      ref: atribuicao.ref,
      dispositivo: getDispositivo(),
      pagina: typeof location !== "undefined" ? location.pathname : null,
    };

    await fetch(`${SUPABASE_URL}/rest/v1/eventos`, {
      method: "POST",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(corpo),
    });
  } catch {
    // banco fora do ar, tabela ainda não existe, offline etc. — nunca quebra
    // a navegação por causa de um evento perdido.
  }
}

/** Dispara `nome` no máximo 1x por sessão por `chave` (dedup em
 * sessionStorage). Pensado pro banner_view: cada banner só conta uma vez
 * por sessão, mesmo passando de novo no carrossel. */
export function trackOnce(chave: string, nome: NomeEvento, props?: Record<string, unknown>): void {
  const storageKey = `clube_track_once_${chave}`;
  try {
    if (sessionStorage.getItem(storageKey)) return;
    sessionStorage.setItem(storageKey, "1");
  } catch {
    // sem storage pra dedup — dispara mesmo assim (pode repetir na sessão)
  }
  void track(nome, props);
}
