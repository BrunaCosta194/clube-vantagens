-- Clube de Vantagens Sanchez — Bloco 5 (fundação de mensuração)
-- Tabela própria de eventos anônimos de navegação (banner, e-book, cadastro,
-- parceiro, produto, indicação, mapa, social). Sem GA4/cookie de terceiro —
-- dados próprios, cruzáveis com `membros` por membro_id quando há sessão.
--
-- Modelo de segurança:
--   • INSERT liberado pro público (anon) e pra membro logado (authenticated).
--   • check garante que ninguém grava evento em nome de outro membro
--     (membro_id nulo = visitante, ou tem que ser o próprio auth.uid()).
--   • SEM policy de SELECT/UPDATE/DELETE → o client nunca lê eventos.
--     Leitura só pelo painel (Bloco 11) ou dashboard, via service_role.
--   • `nome` trancado numa lista fechada (os 14 eventos do briefing) pra
--     não virar uma tabela de lixo aceitando qualquer string.
--   • limites de tamanho em props/utm/textos — não é telemetria pesada,
--     é contagem de eventos com contexto curto.

create extension if not exists pgcrypto;

create table public.eventos (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (nome in (
    'banner_view',
    'banner_click',
    'ebook_form_open',
    'ebook_form_submit',
    'ebook_download',
    'club_signup_start',
    'club_signup_complete',
    'partner_open',
    'partner_contact',
    'product_click',
    'referral_share',
    'referral_conversion',
    'map_open',
    'social_click'
  )),
  sessao_id text not null check (length(sessao_id) <= 64),
  membro_id uuid references public.membros (id) on delete set null,
  props jsonb not null default '{}'::jsonb check (pg_column_size(props) < 4096),
  origem text check (length(origem) <= 300),
  campanha text check (length(campanha) <= 300),
  utm jsonb not null default '{}'::jsonb check (pg_column_size(utm) < 2048),
  -- código de indicação (?ref=) que originou a sessão, quando houver.
  ref text check (length(ref) <= 300),
  dispositivo text check (dispositivo in ('mobile', 'tablet', 'desktop')),
  pagina text check (length(pagina) <= 300),
  created_at timestamptz not null default now()
);

create index eventos_nome_created_at_idx on public.eventos (nome, created_at);
create index eventos_created_at_idx on public.eventos (created_at);
create index eventos_membro_id_idx on public.eventos (membro_id);
create index eventos_campanha_idx on public.eventos (campanha);

alter table public.eventos enable row level security;

-- Visitante (anon) e membro logado podem CRIAR evento. Nunca em nome de
-- outro membro: se membro_id vier preenchido, só pode ser o próprio usuário.
create policy "qualquer um registra evento (nunca em nome de outro)"
  on public.eventos for insert
  to anon, authenticated
  with check (membro_id is null or membro_id = auth.uid());

-- Sem policy de select/update/delete → leitura só via service_role (painel
-- futuro do Bloco 11) ou pelo SQL editor do Dashboard.
