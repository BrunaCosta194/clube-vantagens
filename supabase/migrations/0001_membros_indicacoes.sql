-- Clube de Vantagens Sanchez — Fase 2
-- Tabelas membros/indicacoes + RLS + trigger de criação automática no signup.
-- Pontos usados aqui devem ficar em sincronia com src/lib/recompensas.ts
-- (PONTOS_CADASTRO=50, PONTOS_INDICACAO=100). PONTOS_CONVERSAO fica a cargo
-- do Sanchez Connect (não implementado neste projeto).

create extension if not exists pgcrypto;

create table public.membros (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  whatsapp text not null,
  email text not null,
  documento text not null unique,
  codigo_indicacao text not null unique,
  indicado_por uuid references public.membros (id),
  pontos integer not null default 0,
  status text not null default 'lead' check (status in ('lead', 'membro', 'cliente')),
  origem text not null default 'clube',
  created_at timestamptz not null default now()
);

create table public.indicacoes (
  id uuid primary key default gen_random_uuid(),
  indicador_id uuid not null references public.membros (id),
  indicado_id uuid not null unique references public.membros (id),
  status text not null default 'cadastrado' check (status in ('cadastrado', 'convertido')),
  pontos_gerados integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.membros enable row level security;
alter table public.indicacoes enable row level security;

create policy "membro vê o próprio registro"
  on public.membros for select
  using (auth.uid() = id);

create policy "membro atualiza o próprio registro"
  on public.membros for update
  using (auth.uid() = id);

create policy "indicador ou indicado vê a indicação"
  on public.indicacoes for select
  using (auth.uid() = indicador_id or auth.uid() = indicado_id);

-- Cria automaticamente o registro em membros (e a indicação, se houver
-- ?ref=CODIGO) assim que um usuário é criado no Supabase Auth. Roda como
-- SECURITY DEFINER pra não depender de policy de INSERT liberada pro client.
create or replace function public.handle_new_membro()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_indicado_por uuid;
  v_codigo text;
  v_pontos_cadastro constant integer := 50;
  v_pontos_indicacao constant integer := 100;
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
    insert into public.indicacoes (indicador_id, indicado_id, pontos_gerados)
    values (v_indicado_por, new.id, v_pontos_indicacao);

    update public.membros set pontos = pontos + v_pontos_indicacao where id = v_indicado_por;
    update public.membros set pontos = pontos + v_pontos_cadastro where id = new.id;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_membro();
