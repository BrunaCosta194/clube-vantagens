-- 0011 — Usuário da equipe Sanchez não vira membro do Clube.
--
-- PROBLEMA: o Clube tem trigger `on_auth_user_created` -> public.handle_new_membro(),
-- que insere em public.membros com nome/whatsapp/documento NOT NULL vindos do
-- user_metadata. Usuário de equipe (painel Inteligência) não tem esses dados ->
-- "Database error creating new user".
--
-- SOLUÇÃO: se `equipe_inteligencia = true` no user_metadata (ou app_metadata),
-- o trigger não cria membro. Precisa olhar user_metadata porque o GoTrue grava
-- app_metadata customizado DEPOIS do insert — no trigger ele ainda não existe.
-- Segurança: pular a criação de membro não dá acesso a nada. Acesso ao painel
-- depende de linha em inteligencia.equipe, que só service_role grava.
-- Criar usuário de equipe: jobs/criar-equipe.ts do repo sanchez-inteligencia (NÃO pelo formulário do dashboard).
--
-- Já aplicada no banco pela 0006 do repo sanchez-inteligencia: este arquivo só registra
-- a função aqui. Rodar de novo não muda nada. Corpo = 0004_consentimento_lgpd.sql,
-- só com o guard no início. Se o Clube mudar essa função, manter o guard.

create or replace function public.handle_new_membro()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_indicado_por uuid;
  v_codigo text;
begin
  -- equipe Sanchez (painel Inteligência) não é membro do Clube
  if coalesce((new.raw_user_meta_data ->> 'equipe_inteligencia')::boolean, false)
     or coalesce((new.raw_app_meta_data ->> 'equipe_inteligencia')::boolean, false) then
    return new;
  end if;

  if (new.raw_user_meta_data ->> 'codigo_ref') is not null then
    select id into v_indicado_por
    from public.membros
    where codigo_indicacao = new.raw_user_meta_data ->> 'codigo_ref';
  end if;

  v_codigo := upper(substr(replace(new.id::text, '-', ''), 1, 8));

  insert into public.membros (id, nome, whatsapp, email, documento, codigo_indicacao, indicado_por, consentimento_lgpd_em)
  values (
    new.id,
    new.raw_user_meta_data ->> 'nome',
    new.raw_user_meta_data ->> 'whatsapp',
    new.email,
    new.raw_user_meta_data ->> 'documento',
    v_codigo,
    v_indicado_por,
    (new.raw_user_meta_data ->> 'consentimento_lgpd_em')::timestamptz
  );

  if v_indicado_por is not null then
    insert into public.indicacoes (indicador_id, indicado_id)
    values (v_indicado_por, new.id);
  end if;

  return new;
end;
$$;
