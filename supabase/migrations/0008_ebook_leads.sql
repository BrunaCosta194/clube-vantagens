-- Clube de Vantagens Sanchez — Bloco 6 (e-book com formulário curto)
-- Desfaz a decisão de 04/08 (baixar exigia virar membro): agora o visitante
-- baixa preenchendo nome + e-mail + WhatsApp. Cada linha aqui é um lead que
-- pediu um material — matéria-prima do funil do briefing
-- (open → submit → download → cadastro no Clube).
--
-- ATENÇÃO: migration AINDA NÃO APLICADA. Rodar no SQL Editor do Dashboard,
-- num banco onde a 0003_ebook_downloads.sql já está aplicada (o ALTER no fim
-- depende da tabela e da policy criadas lá).
--
-- Modelo de segurança (mesmo espírito da 0007_eventos.sql):
--   • INSERT liberado pro público (anon) e pra membro logado (authenticated).
--   • SEM policy de SELECT/UPDATE/DELETE → o client nunca lê os leads.
--     Leitura só pelo painel (Bloco 11) ou dashboard, via service_role.
--   • limites de tamanho em todos os textos e no utm — formulário curto não
--     pode virar porta de entrada pra payload grande.
--   • `aceita_comunicacao` é opt-in SEPARADO do download: recusar não bloqueia
--     o e-book (exigência do briefing). O carimbo `aceita_comunicacao_em`
--     existe pra provar QUANDO o consentimento foi dado (LGPD).

create extension if not exists pgcrypto;

create table public.ebook_leads (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(nome) between 2 and 120),
  -- Formato mínimo de e-mail: não valida existência (isso é trabalho do
  -- disparo de e-mail), só evita lixo óbvio e string gigante.
  email text not null check (
    length(email) between 5 and 200
    and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  ),
  whatsapp text not null check (length(whatsapp) between 8 and 32),
  -- Qual material o lead pediu. Hoje só existe o e-book do Papo de Aluguel,
  -- mas a coluna já nasce genérica pros próximos materiais do briefing.
  material text not null default 'papo-de-aluguel' check (length(material) <= 60),
  aceita_comunicacao boolean not null default false,
  aceita_comunicacao_em timestamptz,
  origem text check (length(origem) <= 300),
  campanha text check (length(campanha) <= 300),
  utm jsonb not null default '{}'::jsonb check (pg_column_size(utm) < 2048),
  -- código de indicação (?ref=) que originou a sessão, quando houver.
  ref text check (length(ref) <= 300),
  -- mesma sessão de public.eventos → dá pra reconstruir a jornada do lead.
  sessao_id text check (length(sessao_id) <= 64),
  created_at timestamptz not null default now()
);

-- Índices das métricas do item 4 do Bloco 6: únicos por e-mail (e join com
-- membros.email pra medir "cadastrou depois de baixar"), recorte por período
-- e recorte por campanha/banner.
create index ebook_leads_email_idx on public.ebook_leads (email);
create index ebook_leads_created_at_idx on public.ebook_leads (created_at desc);
create index ebook_leads_campanha_idx on public.ebook_leads (campanha);

alter table public.ebook_leads enable row level security;

-- Visitante (anon) e membro logado podem CRIAR lead. Nada além disso.
create policy "qualquer um cria lead de e-book"
  on public.ebook_leads for insert
  to anon, authenticated
  with check (true);

-- Sem policy de select/update/delete → leitura só via service_role (painel
-- futuro do Bloco 11) ou pelo SQL editor do Dashboard.


-- ─── ebook_downloads: passa a aceitar download de visitante ───
-- Antes: membro_id not null (só membro baixava). Agora cada download é de um
-- membro OU de um lead. Download repetido continua sendo uma linha nova —
-- repetido é contado, não bloqueado.
alter table public.ebook_downloads
  add column if not exists lead_id uuid references public.ebook_leads (id) on delete set null;

alter table public.ebook_downloads
  alter column membro_id drop not null;

create index if not exists ebook_downloads_lead_idx on public.ebook_downloads (lead_id);
create index if not exists ebook_downloads_created_at_idx on public.ebook_downloads (created_at desc);

-- A policy da 0003 era `auth.uid() = membro_id`: visitante (auth.uid() nulo)
-- nunca passava nela. Mesma regra da 0007 agora — ninguém grava em nome de
-- outro membro, mas membro_id nulo (visitante/lead) é aceito.
drop policy if exists "membro registra o próprio download" on public.ebook_downloads;

create policy "qualquer um registra download (nunca em nome de outro)"
  on public.ebook_downloads for insert
  to anon, authenticated
  with check (membro_id is null or membro_id = auth.uid());

-- A policy de SELECT da 0003 ("membro vê os próprios downloads") continua
-- valendo e não precisa mudar: `auth.uid() = membro_id` nunca casa com linha
-- de visitante (membro_id nulo), então lead não vaza pro client.
