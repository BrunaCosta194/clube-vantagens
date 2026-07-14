-- Clube de Vantagens Sanchez — Fase 2.1
-- Troca o modelo de pontos por voucher fixo de cadastro (a Yruena decidiu:
-- clube funciona por voucher, não pontos). Quem se cadastra ganha R$100 de
-- voucher, indicado ou não. O código de indicação continua sendo rastreado
-- em `indicacoes` para uso futuro, mas sem pontuação — a Yruena ainda vai
-- definir se/como o indicador é recompensado.
-- Valor usado aqui deve ficar em sincronia com src/lib/recompensas.ts
-- (VALOR_VOUCHER_CADASTRO=100).

alter table public.membros
  drop column pontos,
  add column voucher_cadastro numeric(10, 2) not null default 100.00;

alter table public.indicacoes
  drop column pontos_gerados;

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

  insert into public.membros (id, nome, whatsapp, email, documento, codigo_indicacao, indicado_por)
  values (
    new.id,
    new.raw_user_meta_data ->> 'nome',
    new.raw_user_meta_data ->> 'whatsapp',
    new.email,
    new.raw_user_meta_data ->> 'documento',
    v_codigo,
    v_indicado_por
  );

  if v_indicado_por is not null then
    insert into public.indicacoes (indicador_id, indicado_id)
    values (v_indicado_por, new.id);
  end if;

  return new;
end;
$$;
