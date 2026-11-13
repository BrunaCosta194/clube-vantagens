-- 0016 — Portal do Parceiro, bloco F: página do parceiro, aprovação e publicação
-- Spec: docs/superpowers/specs/2026-11-13-portal-cadastro-parceiros.md (seções 3, 5 e 6)
-- Depende da 0015.
--
-- Fluxo da página:
--   1. A Júlia (papel `parceiros`) monta a página no painel a partir das respostas:
--      `parceiro_perfil_salvar`. As fotos são reprocessadas no navegador dela (sai a
--      localização e qualquer dado escondido; SVG vira PNG) e ficam no bucket privado,
--      em <cadastro>/pagina/. O benefício da página NÃO vem da tela: o banco copia a
--      versão que o parceiro confirmou (parceiros_beneficio_versoes).
--   2. Ela manda para a validação; a Yruena valida (0015) e o benefício da página
--      passa a ser a versão validada.
--   3. O parceiro vê a prévia pelo link pessoal e aprova ou pede ajuste
--      (`parceiro_pagina_decidir`, só a Edge Function chama). A aprovação guarda o
--      hash e uma cópia do conteúdo exato que ele viu.
--   4. A Júlia publica: o navegador copia as fotos para o bucket público
--      `parceiros-publico` e chama `parceiro_perfil_publicar`, que confere TUDO de
--      novo no banco (aprovado, mesmo hash da aprovação, benefício validado, fotos no
--      bucket público). Publicar sem isso dá erro, não importa a tela.
--   5. Editar a página depois de ela ir ao parceiro volta o status para "Em preparação"
--      (o hash muda, precisa de nova validação e aprovação). Se já estava publicada,
--      a versão publicada continua no ar até a nova ser publicada.
--
-- O site lê só `parceiros_publicados()` (visitante) e `parceiro_codigo()` (membro
-- logado vê o código de desconto). Tabelas sem nenhuma policy, como na 0015.
--
-- Idempotente: pode rodar de novo.

-- ── Tabelas ─────────────────────────────────────────────────────────────────

-- Conteúdo da página (forma em PerfilPagina, supabase/functions/_shared/parceiro-cadastro.ts).
create table if not exists public.parceiros_perfil (
  cadastro_id uuid primary key references public.parceiros_cadastro (id) on delete cascade,
  conteudo jsonb not null check (jsonb_typeof(conteudo) = 'object' and pg_column_size(conteudo) < 200000),
  conteudo_hash text not null,
  publicado jsonb,              -- cópia que está no ar (null = fora do ar)
  publicado_hash text,
  publicado_em timestamptz,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);
alter table public.parceiros_perfil enable row level security;

-- Cada decisão do parceiro sobre a prévia, com o conteúdo exato que ele viu.
create table if not exists public.parceiros_aprovacoes (
  id uuid primary key default gen_random_uuid(),
  cadastro_id uuid not null references public.parceiros_cadastro (id) on delete cascade,
  conteudo_hash text not null,
  snapshot jsonb not null,
  decisao text not null check (decisao in ('aprovado', 'ajuste')),
  nome text not null check (length(nome) between 1 and 120),
  comentario text check (length(comentario) <= 2000),
  ip_hash text,
  criado_em timestamptz not null default now()
);
create index if not exists parceiros_aprovacoes_cadastro_idx
  on public.parceiros_aprovacoes (cadastro_id, criado_em desc);
alter table public.parceiros_aprovacoes enable row level security;

-- ── Bucket público (só o que foi publicado) ─────────────────────────────────
-- Fotos já reprocessadas (JPEG/PNG/WebP). Nada do bucket privado é servido daqui.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('parceiros-publico', 'parceiros-publico', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- A equipe (papel parceiros) grava as fotos da página: no bucket privado, só dentro
-- de <cadastro>/pagina/ (os arquivos do parceiro continuam intocáveis); no público,
-- em qualquer pasta. Visitante lê o público pelo link direto, mas não lista.
drop policy if exists "equipe grava fotos das páginas" on storage.objects;
create policy "equipe grava fotos das páginas" on storage.objects
  for insert to authenticated
  with check (
    public.tem_papel('parceiros')
    and (bucket_id = 'parceiros-publico'
         or (bucket_id = 'parceiros-cadastro' and (storage.foldername(name))[2] = 'pagina'))
  );
drop policy if exists "equipe troca fotos das páginas" on storage.objects;
create policy "equipe troca fotos das páginas" on storage.objects
  for update to authenticated
  using (
    public.tem_papel('parceiros')
    and (bucket_id = 'parceiros-publico'
         or (bucket_id = 'parceiros-cadastro' and (storage.foldername(name))[2] = 'pagina'))
  );
drop policy if exists "equipe apaga fotos das páginas" on storage.objects;
create policy "equipe apaga fotos das páginas" on storage.objects
  for delete to authenticated
  using (
    public.tem_papel('parceiros')
    and (bucket_id = 'parceiros-publico'
         or (bucket_id = 'parceiros-cadastro' and (storage.foldername(name))[2] = 'pagina'))
  );
drop policy if exists "equipe lista fotos publicadas" on storage.objects;
create policy "equipe lista fotos publicadas" on storage.objects
  for select to authenticated
  using (bucket_id = 'parceiros-publico' and public.tem_papel('parceiros'));

-- ── Auxiliares ──────────────────────────────────────────────────────────────

create or replace function public.parceiros_hash(c jsonb)
returns text
language sql
immutable
set search_path = public, extensions
as $$
  select encode(extensions.digest(c::text, 'sha256'), 'hex')
$$;

-- Caminhos de todas as fotos usadas na página (logo, capa, galeria e itens).
create or replace function public.parceiros_perfil_imagens(c jsonb)
returns text[]
language sql
immutable
as $$
  select coalesce(array_agg(x) filter (where coalesce(x, '') <> ''), '{}'::text[])
    from (
      select c ->> 'logo' as x
      union all select c ->> 'capa'
      union all
      select g from jsonb_array_elements_text(
        case when jsonb_typeof(c -> 'galeria') = 'array' then c -> 'galeria' else '[]'::jsonb end) g
      union all
      select i ->> 'foto' from jsonb_array_elements(
        case when jsonb_typeof(c -> 'itens') = 'array' then c -> 'itens' else '[]'::jsonb end) i
    ) t
$$;

-- Benefício como a página guarda: a versão (não substituída) mais recente.
-- Fica sem a situação de propósito: validar não muda o hash da página.
create or replace function public.parceiros_beneficio_da_pagina(p_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object('versao_id', id, 'texto', texto, 'dados', dados)
    from public.parceiros_beneficio_versoes
   where cadastro_id = p_id and situacao <> 'substituido'
   order by created_at desc
   limit 1
$$;
revoke all on function public.parceiros_beneficio_da_pagina(uuid) from public, anon, authenticated;

-- ── Montar / editar a página (papel parceiros) ──────────────────────────────
-- Devolve o hash do conteúdo salvo.
create or replace function public.parceiro_perfil_salvar(p_id uuid, p_conteudo jsonb)
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_status text;
  v_slug text;
  v_img text;
  v_conteudo jsonb;
  v_hash text;
  v_antigo text;
begin
  if not public.tem_papel('parceiros') then
    raise exception 'acesso negado' using errcode = '42501';
  end if;
  if p_conteudo is null or jsonb_typeof(p_conteudo) <> 'object' or pg_column_size(p_conteudo) > 150000 then
    raise exception 'conteúdo da página inválido';
  end if;

  select status into v_status from public.parceiros_cadastro where id = p_id for update;
  if v_status is null then
    raise exception 'cadastro não encontrado';
  end if;
  if v_status in ('convite_enviado', 'cadastro_iniciado', 'arquivado') then
    raise exception 'a página só pode ser montada depois que o parceiro enviar o cadastro';
  end if;

  -- Endereço da página (/parceiro/<slug>). As páginas feitas à mão têm rota própria.
  v_slug := nullif(trim(p_conteudo ->> 'slug'), '');
  if v_slug is null or length(v_slug) > 60 or v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'endereço da página inválido: use letras minúsculas, números e hífen';
  end if;
  if v_slug in ('dewa', 'bioreluz', 'insurance-sante') then
    raise exception 'endereço da página já usado por uma página feita à mão';
  end if;
  if exists (select 1 from public.parceiros_cadastro where slug = v_slug and id <> p_id)
     or exists (select 1 from public.parceiros_perfil where publicado ->> 'slug' = v_slug and cadastro_id <> p_id) then
    raise exception 'endereço da página já usado por outro parceiro';
  end if;

  -- Fotos: só as da própria pasta da página, no formato que o painel gera.
  foreach v_img in array public.parceiros_perfil_imagens(p_conteudo) loop
    if v_img !~ ('^' || p_id::text || '/pagina/[0-9a-f-]{36}\.(jpg|png|webp)$') then
      raise exception 'foto inválida na página';
    end if;
  end loop;

  v_conteudo := (p_conteudo - 'beneficio')
                || jsonb_build_object('slug', v_slug, 'beneficio', public.parceiros_beneficio_da_pagina(p_id));
  v_hash := public.parceiros_hash(v_conteudo);

  select conteudo_hash into v_antigo from public.parceiros_perfil where cadastro_id = p_id;
  insert into public.parceiros_perfil (cadastro_id, conteudo, conteudo_hash, updated_at, updated_by)
  values (p_id, v_conteudo, v_hash, now(), auth.uid())
  on conflict (cadastro_id) do update
    set conteudo = excluded.conteudo,
        conteudo_hash = excluded.conteudo_hash,
        updated_at = now(),
        updated_by = excluded.updated_by;
  update public.parceiros_cadastro set slug = v_slug, updated_at = now() where id = p_id;

  if v_antigo is distinct from v_hash then
    insert into public.parceiros_historico (cadastro_id, autor, acao)
    values (p_id, coalesce(auth.uid()::text, 'sql'), case when v_antigo is null then 'pagina_montada' else 'pagina_editada' end);
    -- Mudou depois de ir para o parceiro: precisa de nova validação e aprovação.
    if v_status in ('aguardando_aprovacao', 'aprovado', 'publicado') then
      update public.parceiros_cadastro set status = 'em_preparacao' where id = p_id;
      insert into public.parceiros_historico (cadastro_id, autor, acao, detalhe)
      values (p_id, coalesce(auth.uid()::text, 'sql'), 'status', jsonb_build_object(
        'de', v_status, 'para', 'em_preparacao',
        'nota', 'Página editada depois de ir para o parceiro: precisa de nova validação e aprovação.'
                || case when v_status = 'publicado' then ' A versão publicada continua no ar até a nova ser publicada.' else '' end));
    end if;
  end if;
  return v_hash;
end;
$$;

-- ── Mudar status (substitui a da 0015) ──────────────────────────────────────
-- Igual à 0015, mais:
--   • mandar para a validação exige a página montada com logo e foto principal;
--   • ao validar, o benefício da página passa a ser a versão validada;
--   • "publicado" não passa mais por aqui: só por parceiro_perfil_publicar;
--   • arquivar tira a página do ar.
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
  v_conteudo jsonb;
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
    else false   -- 'aprovado' só pelo parceiro, no link; 'publicado' só por parceiro_perfil_publicar
  end;
  if not v_ok then
    raise exception 'mudança de status não permitida (% → %)', v_atual, p_status using errcode = '42501';
  end if;

  if p_status = 'aguardando_validacao' then
    select conteudo into v_conteudo from public.parceiros_perfil where cadastro_id = p_id;
    if v_conteudo is null or coalesce(v_conteudo ->> 'logo', '') = '' or coalesce(v_conteudo ->> 'capa', '') = '' then
      raise exception 'monte a página, com logo e foto principal, antes de mandar para a validação';
    end if;
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
    -- A página mostra exatamente a versão validada.
    update public.parceiros_perfil
       set conteudo = jsonb_set(conteudo, '{beneficio}', public.parceiros_beneficio_da_pagina(p_id)),
           updated_at = now()
     where cadastro_id = p_id;
    update public.parceiros_perfil set conteudo_hash = public.parceiros_hash(conteudo) where cadastro_id = p_id;
  end if;

  if p_status = 'arquivado' then
    update public.parceiros_perfil set publicado = null, publicado_hash = null where cadastro_id = p_id;
  end if;

  update public.parceiros_cadastro
     set status = p_status, updated_at = now()
   where id = p_id;

  insert into public.parceiros_historico (cadastro_id, autor, acao, detalhe)
  values (p_id, coalesce(auth.uid()::text, 'sql'), 'status',
          jsonb_build_object('de', v_atual, 'para', p_status, 'nota', nullif(trim(coalesce(p_nota, '')), '')));
end;
$$;

-- ── Decisão do parceiro sobre a prévia (só a Edge Function chama) ───────────
-- Devolve 'ok', 'status' (não está aguardando aprovação) ou 'mudou' (a página mudou
-- depois que ele abriu a prévia: precisa olhar de novo).
create or replace function public.parceiro_pagina_decidir(
  p_id uuid,
  p_hash text,
  p_decisao text,
  p_nome text,
  p_comentario text default null,
  p_ip_hash text default null
)
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_status text;
  v_hash text;
  v_conteudo jsonb;
  v_para text;
begin
  if p_decisao not in ('aprovado', 'ajuste') or coalesce(trim(p_nome), '') = '' then
    raise exception 'decisão inválida';
  end if;
  if p_decisao = 'ajuste' and coalesce(trim(p_comentario), '') = '' then
    raise exception 'diga o que precisa ajustar';
  end if;

  select status into v_status from public.parceiros_cadastro where id = p_id for update;
  if v_status is distinct from 'aguardando_aprovacao' then
    return 'status';
  end if;
  select conteudo_hash, conteudo into v_hash, v_conteudo from public.parceiros_perfil where cadastro_id = p_id;
  if v_hash is null or v_hash <> p_hash then
    return 'mudou';
  end if;

  v_para := case p_decisao when 'aprovado' then 'aprovado' else 'ajustes_solicitados' end;
  insert into public.parceiros_aprovacoes (cadastro_id, conteudo_hash, snapshot, decisao, nome, comentario, ip_hash)
  values (p_id, v_hash, v_conteudo, p_decisao, left(trim(p_nome), 120), nullif(left(trim(coalesce(p_comentario, '')), 2000), ''), p_ip_hash);
  update public.parceiros_cadastro
     set status = v_para, ultima_atividade_em = now(), updated_at = now()
   where id = p_id;
  insert into public.parceiros_historico (cadastro_id, autor, acao, detalhe)
  values (p_id, 'parceiro', case p_decisao when 'aprovado' then 'pagina_aprovada' else 'pagina_ajuste' end,
          jsonb_build_object('nome', left(trim(p_nome), 120), 'comentario', nullif(trim(coalesce(p_comentario, '')), ''),
                             'de', v_status, 'para', v_para));
  return 'ok';
end;
$$;
revoke all on function public.parceiro_pagina_decidir(uuid, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.parceiro_pagina_decidir(uuid, text, text, text, text, text) to service_role;

-- ── Publicar (papel parceiros) ──────────────────────────────────────────────
create or replace function public.parceiro_perfil_publicar(p_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_status text;
  v_conteudo jsonb;
  v_hash text;
  v_aprov_hash text;
  v_aprov_decisao text;
  v_img text;
begin
  if not public.tem_papel('parceiros') then
    raise exception 'acesso negado' using errcode = '42501';
  end if;
  select status into v_status from public.parceiros_cadastro where id = p_id for update;
  if v_status is distinct from 'aprovado' then
    raise exception 'só dá para publicar depois que o parceiro aprovar a página';
  end if;

  select conteudo, conteudo_hash into v_conteudo, v_hash from public.parceiros_perfil where cadastro_id = p_id;
  select conteudo_hash, decisao into v_aprov_hash, v_aprov_decisao
    from public.parceiros_aprovacoes where cadastro_id = p_id order by criado_em desc limit 1;
  if v_conteudo is null or v_aprov_decisao is distinct from 'aprovado' or v_aprov_hash is distinct from v_hash then
    raise exception 'a página mudou depois da aprovação do parceiro: precisa de nova aprovação';
  end if;
  if not exists (
    select 1 from public.parceiros_beneficio_versoes
     where cadastro_id = p_id and situacao = 'validado'
       and id::text = v_conteudo -> 'beneficio' ->> 'versao_id'
  ) then
    raise exception 'o benefício da página não é a versão validada';
  end if;
  if coalesce(v_conteudo ->> 'logo', '') = '' or coalesce(v_conteudo ->> 'capa', '') = '' then
    raise exception 'a página precisa de logo e foto principal';
  end if;
  foreach v_img in array public.parceiros_perfil_imagens(v_conteudo) loop
    if not exists (select 1 from storage.objects where bucket_id = 'parceiros-publico' and name = v_img) then
      raise exception 'foto ainda não copiada para o site: %', v_img;
    end if;
  end loop;

  update public.parceiros_perfil
     set publicado = v_conteudo, publicado_hash = v_hash, publicado_em = now()
   where cadastro_id = p_id;
  update public.parceiros_cadastro set status = 'publicado', updated_at = now() where id = p_id;
  insert into public.parceiros_historico (cadastro_id, autor, acao, detalhe)
  values (p_id, coalesce(auth.uid()::text, 'sql'), 'status', jsonb_build_object('de', v_status, 'para', 'publicado'));
end;
$$;

-- ── Ficha (substitui a da 0015): + página e decisões do parceiro ────────────
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
    'perfil', (
      select jsonb_build_object(
        'conteudo', p.conteudo, 'conteudo_hash', p.conteudo_hash,
        'publicado_hash', p.publicado_hash, 'publicado_em', p.publicado_em, 'publicado_imagens',
        case when p.publicado is null then '[]'::jsonb else to_jsonb(public.parceiros_perfil_imagens(p.publicado)) end,
        'updated_at', p.updated_at
      )
      from public.parceiros_perfil p where p.cadastro_id = p_id
    ),
    'aprovacoes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'decisao', a.decisao, 'nome', a.nome, 'comentario', a.comentario,
        'conteudo_hash', a.conteudo_hash, 'criado_em', a.criado_em
      ) order by a.criado_em desc)
      from public.parceiros_aprovacoes a where a.cadastro_id = p_id
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

-- ── O que o site lê ─────────────────────────────────────────────────────────
-- Páginas no ar. Sai sem o código de desconto e sem o texto completo do benefício
-- (que também traz o código): o código só aparece para membro logado.
create or replace function public.parceiros_publicados(p_slug text default null)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'slug', p.publicado ->> 'slug',
           'conteudo', p.publicado #- '{beneficio,dados,codigo}' #- '{beneficio,texto}',
           'tem_codigo', coalesce(p.publicado -> 'beneficio' -> 'dados' ->> 'codigo', '') <> '',
           'publicado_em', p.publicado_em
         ) order by p.publicado_em), '[]'::jsonb)
    from public.parceiros_perfil p
    join public.parceiros_cadastro c on c.id = p.cadastro_id
   where p.publicado is not null
     and c.status <> 'arquivado'
     and (p_slug is null or p.publicado ->> 'slug' = p_slug)
$$;

-- Código de desconto da página: só para quem está logado (membro do clube).
create or replace function public.parceiro_codigo(p_slug text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select nullif(p.publicado -> 'beneficio' -> 'dados' ->> 'codigo', '')
    from public.parceiros_perfil p
    join public.parceiros_cadastro c on c.id = p.cadastro_id
   where p.publicado is not null and c.status <> 'arquivado' and p.publicado ->> 'slug' = p_slug
   limit 1
$$;

revoke all on function public.parceiros_hash(jsonb) from public, anon;
revoke all on function public.parceiros_perfil_imagens(jsonb) from public, anon;
revoke all on function public.parceiro_perfil_salvar(uuid, jsonb) from public, anon;
revoke all on function public.parceiro_perfil_publicar(uuid) from public, anon;
revoke all on function public.parceiro_codigo(text) from public, anon;
grant execute on function public.parceiro_perfil_salvar(uuid, jsonb) to authenticated;
grant execute on function public.parceiro_perfil_publicar(uuid) to authenticated;
grant execute on function public.parceiro_codigo(text) to authenticated;
grant execute on function public.parceiros_publicados(text) to anon, authenticated;

-- ── Conferência ─────────────────────────────────────────────────────────────
-- As tabelas novas sem nenhuma policy (tem de voltar vazio):
--   select tablename, policyname from pg_policies
--    where tablename in ('parceiros_perfil', 'parceiros_aprovacoes');
-- Bucket público:
--   select id, public, file_size_limit from storage.buckets where id = 'parceiros-publico';
-- O que o visitante vê (lista vazia até a primeira publicação):
--   select public.parceiros_publicados();
