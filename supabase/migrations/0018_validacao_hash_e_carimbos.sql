-- 0018 — revisão de segurança de 14/11, segunda parte
-- Depende da 0016 (página do parceiro).
--
-- 1. Validação da Yruena confere a página que ela viu. Até aqui, se a equipe editasse
--    a página enquanto ela estava em "Aguardando validação", a validação valia para um
--    conteúdo que a Yruena não tinha visto. Agora o painel manda o hash da página que
--    estava na tela e o banco só valida se for o mesmo (igual à aprovação do parceiro).
--    A função ganha um 4º parâmetro (p_hash); a de 3 parâmetros sai.
-- 2. Datas que eram aceitas do navegador passam a ser as do servidor, para quem grava
--    pelo site: `created_at` em `eventos`, `ebook_leads` e `ebook_downloads`, e a data
--    do aceite de comunicação do e-book (`aceita_comunicacao_em`), que é prova de
--    consentimento.
--
-- ORDEM: rodar esta ANTES do merge do site (o painel novo chama a função com p_hash).
-- O painel antigo continua funcionando depois dela, menos o botão "Validar", que pede
-- para recarregar até o site novo entrar.
-- Idempotente: pode rodar de novo.

-- ── 1. Mudar status, com o hash na validação ────────────────────────────────
drop function if exists public.parceiro_painel_mudar_status(uuid, text, text);

create or replace function public.parceiro_painel_mudar_status(
  p_id uuid,
  p_status text,
  p_nota text default null,
  p_hash text default null
)
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
  v_hash text;
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
    -- A validação vale para a página que estava na tela de quem validou.
    select conteudo_hash into v_hash from public.parceiros_perfil where cadastro_id = p_id;
    if v_hash is null or p_hash is null or p_hash <> v_hash then
      raise exception 'a página mudou depois que você abriu: recarregue, confira de novo e valide';
    end if;

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

revoke all on function public.parceiro_painel_mudar_status(uuid, text, text, text) from public, anon;
grant execute on function public.parceiro_painel_mudar_status(uuid, text, text, text) to authenticated;

-- ── 2. Datas do servidor para o que o site grava ────────────────────────────
-- Só para anon/authenticated. Pelo SQL Editor ou com a service_role, a linha entra
-- como foi escrita.
create or replace function public.carimbo_do_servidor()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') in ('anon', 'authenticated') then
    new.created_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists carimbo_do_servidor on public.eventos;
create trigger carimbo_do_servidor before insert on public.eventos
  for each row execute function public.carimbo_do_servidor();

drop trigger if exists carimbo_do_servidor on public.ebook_downloads;
create trigger carimbo_do_servidor before insert on public.ebook_downloads
  for each row execute function public.carimbo_do_servidor();

create or replace function public.ebook_lead_antes()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') in ('anon', 'authenticated') then
    new.created_at := now();
    -- prova de quando o consentimento foi dado: hora do servidor, não a do aparelho
    new.aceita_comunicacao_em := case when new.aceita_comunicacao then now() end;
  end if;
  return new;
end;
$$;

drop trigger if exists ebook_lead_antes on public.ebook_leads;
create trigger ebook_lead_antes before insert on public.ebook_leads
  for each row execute function public.ebook_lead_antes();

-- ── Conferência ─────────────────────────────────────────────────────────────
-- Só a função de 4 parâmetros (1 linha):
--   select pg_get_function_identity_arguments(oid) from pg_proc where proname = 'parceiro_painel_mudar_status';
-- Os três gatilhos:
--   select event_object_table, trigger_name from information_schema.triggers
--    where trigger_name in ('carimbo_do_servidor', 'ebook_lead_antes');
