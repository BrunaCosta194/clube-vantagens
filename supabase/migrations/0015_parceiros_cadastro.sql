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
--   • o bucket `parceiros-cadastro` é privado: os arquivos sobem por link de upload
--     de uso único gerado pela função, e só a equipe (papel parceiros/validacao) lê;
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

-- ── Painel da coordenação (/admin/parceiros) ────────────────────────────────
-- Tudo por funções SECURITY DEFINER que conferem o papel. Ver: `parceiros` ou
-- `validacao`. Mudar status: conforme a tabela de transições abaixo, espelhada em
-- TRANSICOES (supabase/functions/_shared/parceiro-cadastro.ts): mudar nos dois.

create or replace function public.meus_papeis()
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select papeis from public.admins where user_id = auth.uid()), '{}'::text[]);
$$;

create or replace function public.parceiros_pode_ver()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.tem_papel('parceiros') or public.tem_papel('validacao');
$$;

-- A equipe baixa os arquivos direto do bucket (link assinado gerado no navegador).
-- Visitante e membro continuam sem acesso: a policy exige o papel.
drop policy if exists "equipe lê arquivos de parceiros" on storage.objects;
create policy "equipe lê arquivos de parceiros" on storage.objects
  for select to authenticated
  using (bucket_id = 'parceiros-cadastro' and public.parceiros_pode_ver());

-- Lista: um item por cadastro, com as respostas (para calcular pendências na tela)
-- e só o tipo dos arquivos. Nunca devolve o hash do link.
create or replace function public.parceiros_painel_lista()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.parceiros_pode_ver() then
    raise exception 'acesso negado' using errcode = '42501';
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', c.id,
      'status', c.status,
      'slug', c.slug,
      'convite_empresa', c.convite_empresa,
      'convite_contato', c.convite_contato,
      'convite_whatsapp', c.convite_whatsapp,
      'respostas', c.respostas,
      'etapas_completas', c.etapas_completas,
      'beneficio_confirmado_em', c.beneficio_confirmado_em,
      'enviado_em', c.enviado_em,
      'ultima_atividade_em', c.ultima_atividade_em,
      'token_expira_em', c.token_expira_em,
      'responsavel_equipe', c.responsavel_equipe,
      'created_at', c.created_at,
      'arquivos', coalesce((
        select jsonb_agg(jsonb_build_object('tipo', a.tipo, 'item_id', a.item_id))
        from public.parceiros_arquivos a
        where a.cadastro_id = c.id and a.confirmado
      ), '[]'::jsonb)
    ) order by coalesce(c.ultima_atividade_em, c.created_at) desc)
    from public.parceiros_cadastro c
  ), '[]'::jsonb);
end;
$$;

-- Ficha completa de um cadastro.
create or replace function public.parceiros_painel_ficha(p_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v jsonb;
begin
  if not public.parceiros_pode_ver() then
    raise exception 'acesso negado' using errcode = '42501';
  end if;
  select to_jsonb(c) - 'token_hash' into v from public.parceiros_cadastro c where c.id = p_id;
  if v is null then
    raise exception 'cadastro não encontrado';
  end if;
  return jsonb_build_object(
    'cadastro', v,
    'arquivos', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', a.id, 'tipo', a.tipo, 'item_id', a.item_id, 'caminho', a.caminho, 'nome', a.nome_original,
        'mime', a.mime, 'tamanho', a.tamanho, 'largura', a.largura, 'altura', a.altura, 'usar', a.usar,
        'created_at', a.created_at
      ) order by a.tipo, a.created_at)
      from public.parceiros_arquivos a
      where a.cadastro_id = p_id and a.confirmado
    ), '[]'::jsonb),
    'beneficio_versoes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', b.id, 'texto', b.texto, 'situacao', b.situacao, 'confirmado_em', b.confirmado_em,
        'confirmado_por', b.confirmado_por, 'validado_em', b.validado_em,
        'validado_por', (select email from public.admins where user_id = b.validado_por)
      ) order by b.created_at desc)
      from public.parceiros_beneficio_versoes b
      where b.cadastro_id = p_id
    ), '[]'::jsonb),
    'historico', coalesce((
      select jsonb_agg(x order by x->>'quando' desc)
      from (
        select jsonb_build_object(
          'quando', h.quando,
          'acao', h.acao,
          'detalhe', h.detalhe,
          'autor', coalesce((select email from public.admins where user_id::text = h.autor), h.autor)
        ) as x
        from public.parceiros_historico h
        where h.cadastro_id = p_id
        order by h.quando desc
        limit 200
      ) t
    ), '[]'::jsonb)
  );
end;
$$;

-- Muda o status, conferindo o papel e a transição. Ao validar (Yruena), a versão
-- confirmada do benefício passa a `validado`: é a que a página pode mostrar.
create or replace function public.parceiro_painel_mudar_status(p_id uuid, p_status text, p_nota text default null)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_atual text;
  v_enviado timestamptz;
  v_ok boolean := false;
  v_versao uuid;
begin
  if not public.parceiros_pode_ver() then
    raise exception 'acesso negado' using errcode = '42501';
  end if;

  select status, enviado_em into v_atual, v_enviado
    from public.parceiros_cadastro where id = p_id for update;
  if v_atual is null then
    raise exception 'cadastro não encontrado';
  end if;

  v_ok := case
    when p_status = 'arquivado' then v_atual <> 'arquivado' and public.tem_papel('parceiros')
    -- reabrir um arquivado: volta para recebido (se já tinha enviado) ou iniciado
    when v_atual = 'arquivado' then public.tem_papel('parceiros')
      and p_status = (case when v_enviado is null then 'cadastro_iniciado' else 'cadastro_recebido' end)
    when p_status = 'em_preparacao' then
      (public.tem_papel('parceiros') and v_atual in ('cadastro_recebido', 'informacoes_incompletas', 'aguardando_validacao', 'ajustes_solicitados'))
      or (public.tem_papel('validacao') and v_atual = 'aguardando_validacao')
    when p_status = 'informacoes_incompletas' then
      public.tem_papel('parceiros') and v_atual in ('cadastro_recebido', 'em_preparacao')
    when p_status = 'aguardando_validacao' then
      public.tem_papel('parceiros') and v_atual in ('em_preparacao', 'ajustes_solicitados')
    when p_status = 'aguardando_aprovacao' then
      public.tem_papel('validacao') and v_atual = 'aguardando_validacao'
    when p_status = 'ajustes_solicitados' then
      public.tem_papel('parceiros') and v_atual = 'aguardando_aprovacao'
    when p_status = 'publicado' then
      public.tem_papel('parceiros') and v_atual = 'aprovado'
    else false   -- 'aprovado' só pelo parceiro, no link
  end;
  if not v_ok then
    raise exception 'mudança de status não permitida (% → %)', v_atual, p_status using errcode = '42501';
  end if;

  if p_status = 'aguardando_aprovacao' then
    select id into v_versao from public.parceiros_beneficio_versoes
     where cadastro_id = p_id and situacao in ('confirmado', 'validado')
     order by created_at desc limit 1;
    if v_versao is null then
      raise exception 'o parceiro ainda não confirmou o benefício';
    end if;
    update public.parceiros_beneficio_versoes
       set situacao = 'validado', validado_em = coalesce(validado_em, now()), validado_por = coalesce(validado_por, auth.uid())
     where id = v_versao;
  end if;

  update public.parceiros_cadastro
     set status = p_status, updated_at = now()
   where id = p_id;

  insert into public.parceiros_historico (cadastro_id, autor, acao, detalhe)
  values (p_id, coalesce(auth.uid()::text, 'sql'), 'status',
          jsonb_build_object('de', v_atual, 'para', p_status, 'nota', nullif(trim(coalesce(p_nota, '')), '')));
end;
$$;

-- Nota interna e responsável da equipe.
create or replace function public.parceiro_painel_anotar(p_id uuid, p_nota text default null, p_responsavel text default null)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if not public.parceiros_pode_ver() then
    raise exception 'acesso negado' using errcode = '42501';
  end if;
  if p_responsavel is not null then
    if not public.tem_papel('parceiros') then
      raise exception 'acesso negado' using errcode = '42501';
    end if;
    update public.parceiros_cadastro
       set responsavel_equipe = nullif(left(trim(p_responsavel), 80), ''), updated_at = now()
     where id = p_id;
    insert into public.parceiros_historico (cadastro_id, autor, acao, detalhe)
    values (p_id, coalesce(auth.uid()::text, 'sql'), 'responsavel', jsonb_build_object('responsavel', nullif(trim(p_responsavel), '')));
  end if;
  if nullif(trim(coalesce(p_nota, '')), '') is not null then
    insert into public.parceiros_historico (cadastro_id, autor, acao, detalhe)
    values (p_id, coalesce(auth.uid()::text, 'sql'), 'nota', jsonb_build_object('nota', left(trim(p_nota), 2000)));
  end if;
end;
$$;

revoke all on function public.meus_papeis() from public, anon;
revoke all on function public.parceiros_pode_ver() from public, anon;
revoke all on function public.parceiros_painel_lista() from public, anon;
revoke all on function public.parceiros_painel_ficha(uuid) from public, anon;
revoke all on function public.parceiro_painel_mudar_status(uuid, text, text) from public, anon;
revoke all on function public.parceiro_painel_anotar(uuid, text, text) from public, anon;
grant execute on function public.meus_papeis() to authenticated;
grant execute on function public.parceiros_pode_ver() to authenticated;
grant execute on function public.parceiros_painel_lista() to authenticated;
grant execute on function public.parceiros_painel_ficha(uuid) to authenticated;
grant execute on function public.parceiro_painel_mudar_status(uuid, text, text) to authenticated;
grant execute on function public.parceiro_painel_anotar(uuid, text, text) to authenticated;

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

-- ── Rascunhos parados: apagados depois de 180 dias ──────────────────────────
-- A Política de privacidade (seção "Empresas parceiras") promete: cadastro iniciado
-- e nunca enviado é apagado depois de 180 dias sem atividade. Conta como atividade
-- o parceiro salvar ou subir arquivo e a equipe mexer no cadastro (anotar, gerar
-- link novo, invalidar). Os arquivos no Storage não podem ser apagados por SQL, então
-- quem apaga é a função `parceiro-cadastro` (acao = limpar_rascunhos): ela pega a
-- lista aqui, remove os arquivos pela API do Storage e apaga o cadastro (arquivos,
-- histórico e versões do benefício vão junto, por cascade). Todo dia às 6h17 (UTC)
-- o pg_cron chama a função pelo pg_net.
create or replace function public.parceiros_rascunhos_vencidos(p_dias integer default 180)
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
    from public.parceiros_cadastro
   where status in ('convite_enviado', 'cadastro_iniciado')
     and enviado_em is null
     and greatest(updated_at, coalesce(ultima_atividade_em, updated_at))
         < now() - make_interval(days => greatest(p_dias, 180))
$$;
revoke all on function public.parceiros_rascunhos_vencidos(integer) from public, anon, authenticated;
grant execute on function public.parceiros_rascunhos_vencidos(integer) to service_role;

do $cron$
begin
  if not exists (select 1 from pg_available_extensions where name = 'pg_cron')
     or not exists (select 1 from pg_available_extensions where name = 'pg_net') then
    raise warning 'pg_cron/pg_net indisponíveis: limpeza dos rascunhos NÃO agendada';
    return;
  end if;
  create extension if not exists pg_cron;
  create extension if not exists pg_net with schema extensions;
  perform cron.schedule(
    'parceiros-limpar-rascunhos',
    '17 6 * * *',
    $job$
      select net.http_post(
        url := 'https://yfdlvusoanyyetcgoafz.supabase.co/functions/v1/parceiro-cadastro',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := '{"acao": "limpar_rascunhos"}'::jsonb
      );
    $job$
  );
end;
$cron$;

-- ── Conferência ─────────────────────────────────────────────────────────────
-- As três tabelas sem nenhuma policy (tem de voltar vazio):
--   select tablename, policyname from pg_policies
--    where tablename in ('parceiros_cadastro', 'parceiros_arquivos', 'parceiros_historico',
--                        'parceiros_beneficio_versoes');
-- Bucket privado:
--   select id, public, file_size_limit from storage.buckets where id = 'parceiros-cadastro';
-- Limpeza agendada (1 linha) e as últimas execuções (depois de publicada a função):
--   select jobname, schedule from cron.job where jobname = 'parceiros-limpar-rascunhos';
--   select status_code, content, created from net._http_response order by created desc limit 5;
--
-- ── Criar um convite pelo SQL Editor ────────────────────────────────────────
--   select * from public.parceiro_convite_criar('Dewa', 'Nome do contato', '11999999999');
-- Guardar o `codigo` (não dá para ver de novo) e mandar:
--   https://clube-vantagens.vercel.app/cadastro-parceiro#<codigo>
-- Papéis (a pessoa precisa já estar em `admins`, ver 0009):
--   Júlia:  update public.admins set papeis = array['parceiros'] where email = '...';
--   Yruena: update public.admins set papeis = array['painel', 'validacao'] where email = '...';
--   Bruna:  update public.admins set papeis = array['painel', 'parceiros', 'validacao'] where email = '...';
