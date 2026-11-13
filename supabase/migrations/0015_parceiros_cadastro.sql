-- 0015 — Portal do Parceiro (fase 1, parte do parceiro)
-- Spec: docs/superpowers/specs/2026-11-13-portal-cadastro-parceiros.md
--
-- Fluxo (Júlia, 13/11): cadastro recebido → revisão pela Júlia → página preparada →
-- validação da Yruena → aprovação do parceiro → publicação manual pela coordenação.
--
-- O parceiro preenche o cadastro por um link pessoal (/cadastro-parceiro#<código>),
-- sem conta. Quem grava é a Edge Function `parceiro-cadastro` (service_role), que
-- confere o código. Por isso:
--   • as três tabelas novas têm RLS ligada e NENHUMA policy: visitante e membro
--     logado não leem nem gravam nada;
--   • o bucket `parceiros-cadastro` é privado e sem policy: os arquivos sobem por
--     link de upload de uso único gerado pela função;
--   • o código do link nunca é guardado, só o hash SHA-256 dele (token_hash).
--
-- Convites: `parceiro_convite_criar(...)` devolve o código UMA vez. Enquanto o
-- painel /admin/parceiros não existe, rodar no SQL Editor (exemplo no fim).
--
-- Idempotente: pode rodar de novo.

create extension if not exists pgcrypto with schema extensions;

-- ── Papéis no painel ────────────────────────────────────────────────────────
-- Definidos com a Júlia em 13/11:
--   `painel`    = métricas agregadas (o /admin que já existia);
--   `parceiros` = ver e editar os cadastros de parceiro (têm dado pessoal: nome e
--                 WhatsApp do responsável), pedir pendências, preparar e publicar (Júlia);
--   `validacao` = acompanhar os cadastros e fazer a validação institucional final
--                 antes de a página ir para o parceiro aprovar (Yruena).
-- A Bruna fica com os três (acesso técnico).
alter table public.admins
  add column if not exists papeis text[] not null default array['painel'];

create or replace function public.tem_papel(p_papel text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid() and p_papel = any (papeis)
  );
$$;

revoke all on function public.tem_papel(text) from public;
grant execute on function public.tem_papel(text) to authenticated;

-- ── Cadastro (um por empresa) ───────────────────────────────────────────────
create table if not exists public.parceiros_cadastro (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'convite_enviado' check (status in (
    'convite_enviado',
    'cadastro_iniciado',
    'cadastro_recebido',
    'informacoes_incompletas',
    'em_preparacao',
    'aguardando_validacao',   -- página pronta, esperando a validação da Yruena
    'aguardando_aprovacao',
    'ajustes_solicitados',
    'aprovado',
    'publicado',
    'arquivado'
  )),
  slug text unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),

  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  token_expira_em timestamptz not null,
  token_gerado_em timestamptz not null default now(),

  convite_empresa text not null check (length(convite_empresa) between 1 and 120),
  convite_contato text check (length(convite_contato) <= 120),
  convite_whatsapp text check (convite_whatsapp ~ '^[0-9]{10,13}$'),

  -- o que o parceiro preencheu, por etapa (formato em supabase/functions/_shared/parceiro-cadastro.ts)
  respostas jsonb not null default '{}'::jsonb check (pg_column_size(respostas) < 65536),
  versao integer not null default 0,          -- controle de gravação simultânea
  schema_versao integer not null default 1,   -- versão do formulário
  etapa_atual smallint not null default 0,
  etapas_completas smallint[] not null default '{}',

  beneficio_confirmado_em timestamptz,
  beneficio_confirmado_texto text,            -- texto exato do benefício confirmado
  autorizacao_uso_em timestamptz,
  autorizacao_termos_versao text,

  enviado_em timestamptz,
  ultima_atividade_em timestamptz,
  responsavel_equipe text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists parceiros_cadastro_status_idx
  on public.parceiros_cadastro (status, ultima_atividade_em desc);

alter table public.parceiros_cadastro enable row level security;

-- ── Arquivos ────────────────────────────────────────────────────────────────
create table if not exists public.parceiros_arquivos (
  id uuid primary key default gen_random_uuid(),
  cadastro_id uuid not null references public.parceiros_cadastro (id) on delete cascade,
  tipo text not null check (tipo in ('logo', 'capa', 'galeria', 'item', 'referencia')),
  item_id text check (item_id ~ '^[a-z0-9]{6,16}$'),  -- só para tipo = item
  caminho text not null unique,
  nome_original text not null check (length(nome_original) <= 200),
  mime text not null,
  tamanho bigint not null check (tamanho > 0),
  largura integer,
  altura integer,
  confirmado boolean not null default false,   -- upload terminou e foi conferido
  usar boolean not null default true,           -- equipe: usar na página?
  created_at timestamptz not null default now()
);

create index if not exists parceiros_arquivos_cadastro_idx
  on public.parceiros_arquivos (cadastro_id, tipo);

alter table public.parceiros_arquivos enable row level security;

-- ── Histórico (quem fez o quê) ──────────────────────────────────────────────
create table if not exists public.parceiros_historico (
  id bigint generated always as identity primary key,
  cadastro_id uuid not null references public.parceiros_cadastro (id) on delete cascade,
  quando timestamptz not null default now(),
  autor text not null,   -- uid da equipe | 'parceiro' | 'sistema' | 'sql'
  acao text not null,
  detalhe jsonb not null default '{}'::jsonb check (pg_column_size(detalhe) < 8192)
);

create index if not exists parceiros_historico_cadastro_idx
  on public.parceiros_historico (cadastro_id, quando desc);

alter table public.parceiros_historico enable row level security;

-- ── Versões do benefício ─────────────────────────────────────────────────────
-- Registro próprio das condições comerciais que a empresa autorizou divulgar
-- (pedido da Júlia, 13/11). Cada confirmação do parceiro vira uma linha com o texto
-- exato; a anterior passa a `substituido`. A página publicada só pode mostrar uma
-- versão `validado` (validação da equipe, no painel). Mudou o benefício depois de
-- publicado: nova versão, nova confirmação, nova validação.
create table if not exists public.parceiros_beneficio_versoes (
  id uuid primary key default gen_random_uuid(),
  cadastro_id uuid not null references public.parceiros_cadastro (id) on delete cascade,
  texto text not null check (length(texto) <= 4000),   -- o texto que o parceiro confirmou
  dados jsonb not null,                                 -- as respostas do benefício naquele momento
  situacao text not null default 'confirmado' check (situacao in ('confirmado', 'validado', 'substituido')),
  confirmado_em timestamptz not null default now(),
  confirmado_por text,                                  -- nome do responsável informado no cadastro
  validado_em timestamptz,
  validado_por uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create index if not exists parceiros_beneficio_versoes_cadastro_idx
  on public.parceiros_beneficio_versoes (cadastro_id, created_at desc);

alter table public.parceiros_beneficio_versoes enable row level security;

-- ── Bucket privado ──────────────────────────────────────────────────────────
-- Limite geral de 25 MB (PDF de referência). Os limites por tipo de arquivo
-- (15 MB para logo e fotos) ficam na função. Mesmos tipos em
-- supabase/functions/_shared/parceiro-cadastro.ts: mudar nos dois.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'parceiros-cadastro',
  'parceiros-cadastro',
  false,
  26214400,
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
    'image/svg+xml', 'application/pdf', 'application/postscript', 'application/illustrator'
  ]
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ── Convites ────────────────────────────────────────────────────────────────
-- Pelo site (RPC), só quem tem o papel `parceiros`. Direto no SQL Editor
-- (session_user diferente de `authenticator`), sempre.
create or replace function public.parceiro_convite_criar(
  p_empresa text,
  p_contato text default null,
  p_whatsapp text default null,
  p_respostas jsonb default '{}'::jsonb,
  p_dias integer default 90
)
returns table (id uuid, codigo text)
language plpgsql
volatile
security definer
set search_path = public, extensions
as $$
declare
  v_codigo text;
  v_id uuid;
begin
  if session_user = 'authenticator' and not public.tem_papel('parceiros') then
    raise exception 'acesso negado' using errcode = '42501';
  end if;
  if coalesce(trim(p_empresa), '') = '' then
    raise exception 'informe o nome da empresa';
  end if;

  v_codigo := encode(extensions.gen_random_bytes(32), 'hex');

  insert into public.parceiros_cadastro (
    token_hash, token_expira_em, convite_empresa, convite_contato, convite_whatsapp, respostas
  ) values (
    encode(extensions.digest(v_codigo, 'sha256'), 'hex'),
    now() + make_interval(days => greatest(1, least(p_dias, 365))),
    trim(p_empresa),
    nullif(trim(p_contato), ''),
    nullif(regexp_replace(coalesce(p_whatsapp, ''), '\D', '', 'g'), ''),
    coalesce(p_respostas, '{}'::jsonb)
  )
  returning parceiros_cadastro.id into v_id;

  insert into public.parceiros_historico (cadastro_id, autor, acao)
  values (v_id, coalesce(auth.uid()::text, 'sql'), 'convite_criado');

  return query select v_id, v_codigo;
end;
$$;

-- Novo link para o mesmo cadastro. O anterior para de funcionar na hora.
create or replace function public.parceiro_convite_renovar(p_id uuid, p_dias integer default 90)
returns text
language plpgsql
volatile
security definer
set search_path = public, extensions
as $$
declare
  v_codigo text;
begin
  if session_user = 'authenticator' and not public.tem_papel('parceiros') then
    raise exception 'acesso negado' using errcode = '42501';
  end if;

  v_codigo := encode(extensions.gen_random_bytes(32), 'hex');

  update public.parceiros_cadastro
     set token_hash = encode(extensions.digest(v_codigo, 'sha256'), 'hex'),
         token_expira_em = now() + make_interval(days => greatest(1, least(p_dias, 365))),
         token_gerado_em = now(),
         updated_at = now()
   where id = p_id;
  if not found then
    raise exception 'cadastro não encontrado';
  end if;

  insert into public.parceiros_historico (cadastro_id, autor, acao)
  values (p_id, coalesce(auth.uid()::text, 'sql'), 'link_renovado');

  return v_codigo;
end;
$$;

-- Invalida o link sem gerar outro (link vazou, contato saiu da empresa). Troca o
-- hash por um aleatório que ninguém conhece: o link antigo passa a dar "não é mais
-- válido". Para mandar um link novo depois, usar parceiro_convite_renovar.
create or replace function public.parceiro_convite_invalidar(p_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = public, extensions
as $$
begin
  if session_user = 'authenticator' and not public.tem_papel('parceiros') then
    raise exception 'acesso negado' using errcode = '42501';
  end if;

  update public.parceiros_cadastro
     set token_hash = encode(extensions.digest(encode(extensions.gen_random_bytes(32), 'hex'), 'sha256'), 'hex'),
         token_expira_em = now(),
         updated_at = now()
   where id = p_id;
  if not found then
    raise exception 'cadastro não encontrado';
  end if;

  insert into public.parceiros_historico (cadastro_id, autor, acao)
  values (p_id, coalesce(auth.uid()::text, 'sql'), 'link_invalidado');
end;
$$;

revoke all on function public.parceiro_convite_criar(text, text, text, jsonb, integer) from public, anon;
revoke all on function public.parceiro_convite_renovar(uuid, integer) from public, anon;
revoke all on function public.parceiro_convite_invalidar(uuid) from public, anon;
grant execute on function public.parceiro_convite_criar(text, text, text, jsonb, integer) to authenticated;
grant execute on function public.parceiro_convite_renovar(uuid, integer) to authenticated;
grant execute on function public.parceiro_convite_invalidar(uuid) to authenticated;

-- ── Eventos do formulário (para medir o teste com as 2 empresas) ────────────
-- Mesmo check da 0007, mais os 3 nomes novos. Espelho em src/lib/track.ts.
alter table public.eventos drop constraint if exists eventos_nome_check;
alter table public.eventos add constraint eventos_nome_check check (nome in (
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
  'social_click',
  'parceiro_cadastro_abriu',
  'parceiro_cadastro_etapa',
  'parceiro_cadastro_enviou'
));

-- ── Conferência ─────────────────────────────────────────────────────────────
-- As três tabelas sem nenhuma policy (tem de voltar vazio):
--   select tablename, policyname from pg_policies
--    where tablename in ('parceiros_cadastro', 'parceiros_arquivos', 'parceiros_historico',
--                        'parceiros_beneficio_versoes');
-- Bucket privado:
--   select id, public, file_size_limit from storage.buckets where id = 'parceiros-cadastro';
--
-- ── Criar um convite pelo SQL Editor ────────────────────────────────────────
--   select * from public.parceiro_convite_criar('Dewa', 'Nome do contato', '11999999999');
-- Guardar o `codigo` (não dá para ver de novo) e mandar:
--   https://clube-vantagens.vercel.app/cadastro-parceiro#<codigo>
-- Papéis (a pessoa precisa já estar em `admins`, ver 0009):
--   Júlia:  update public.admins set papeis = array['parceiros'] where email = '...';
--   Yruena: update public.admins set papeis = array['painel', 'validacao'] where email = '...';
--   Bruna:  update public.admins set papeis = array['painel', 'parceiros', 'validacao'] where email = '...';
