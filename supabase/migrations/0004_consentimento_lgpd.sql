-- Clube de Vantagens Sanchez — Fase 2.2
-- Consentimento LGPD. O aceite já fica gravado no raw_user_meta_data do
-- auth.users no momento do signup (trilha imutável); aqui espelhamos em
-- membros.consentimento_lgpd_em para o Sanchez Connect conseguir consultar
-- sem tocar no schema de auth.

alter table public.membros
  add column consentimento_lgpd_em timestamptz;

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
