-- 0017 — revisão de segurança de 14/11: tranca `membros` e confere o cadastro no banco
--
-- 1. A policy de UPDATE da 0001 deixava o membro logado alterar a própria linha
--    INTEIRA em `membros` (CPF/CNPJ, status, voucher, indicado_por, código). Como o
--    Sanchez Connect cruza por CPF/CNPJ de hora em hora, dava para uma conta se passar
--    por um cliente. O site nunca fez UPDATE nessa tabela: a policy sai e o direito
--    de gravar direto também.
-- 2. O gatilho de cadastro gravava o que o navegador mandava, sem conferir. Agora:
--    CPF/CNPJ só com dígitos e com os dígitos verificadores certos, nome e WhatsApp
--    com tamanho, e a data do consentimento é a do servidor (não a do aparelho).
--    O trecho da equipe do Inteligência (0011) continua igual.
-- 3. Adesão de patrocínio (0010): data do aceite, id e valores deixam de vir do
--    navegador. O valor é o da cota escolhida.
--
-- Não muda nenhuma linha que já existe. Idempotente: pode rodar de novo.
-- Para desfazer o item 1: recriar a policy "membro atualiza o próprio registro" da
-- 0001 e `grant update on public.membros to authenticated`.

-- ── 1. membros e indicacoes: o site só lê ───────────────────────────────────
drop policy if exists "membro atualiza o próprio registro" on public.membros;
revoke insert, update, delete, truncate on public.membros from anon, authenticated;
revoke insert, update, delete, truncate on public.indicacoes from anon, authenticated;
-- Se um dia existir "editar meus dados" na Minha área, liberar só as colunas certas:
--   grant update (nome, whatsapp) on public.membros to authenticated;
--   create policy "membro edita nome e whatsapp" on public.membros for update
--     using (auth.uid() = id) with check (auth.uid() = id);

-- ── 2. CPF/CNPJ com dígito verificador ──────────────────────────────────────
-- Mesma conta de documentoValido() em src/lib/membros.ts: mudar nos dois.
create or replace function public.documento_valido(p_doc text)
returns boolean
language plpgsql
immutable
set search_path = public
as $$
declare
  d int[];
  n int;
  soma int;
  r int;
  pesos1 constant int[] := array[5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  pesos2 constant int[] := array[6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
begin
  if p_doc is null or p_doc !~ '^([0-9]{11}|[0-9]{14})$' then
    return false;
  end if;
  if p_doc ~ '^(.)\1+$' then   -- 000.000.000-00, 111.111.111-11 ...
    return false;
  end if;
  d := string_to_array(p_doc, null)::int[];
  n := length(p_doc);

  if n = 11 then
    soma := 0;
    for i in 1..9 loop soma := soma + d[i] * (11 - i); end loop;
    if (soma * 10) % 11 % 10 <> d[10] then return false; end if;
    soma := 0;
    for i in 1..10 loop soma := soma + d[i] * (12 - i); end loop;
    return (soma * 10) % 11 % 10 = d[11];
  end if;

  soma := 0;
  for i in 1..12 loop soma := soma + d[i] * pesos1[i]; end loop;
  r := soma % 11;
  if (case when r < 2 then 0 else 11 - r end) <> d[13] then return false; end if;
  soma := 0;
  for i in 1..13 loop soma := soma + d[i] * pesos2[i]; end loop;
  r := soma % 11;
  return (case when r < 2 then 0 else 11 - r end) = d[14];
end;
$$;

-- ── 2. Gatilho de cadastro (substitui o da 0011) ────────────────────────────
create or replace function public.handle_new_membro()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_indicado_por uuid;
  v_codigo text;
  v_doc text := regexp_replace(coalesce(new.raw_user_meta_data ->> 'documento', ''), '\D', '', 'g');
  v_nome text := left(trim(coalesce(new.raw_user_meta_data ->> 'nome', '')), 120);
  v_whatsapp text := left(trim(coalesce(new.raw_user_meta_data ->> 'whatsapp', '')), 32);
begin
  -- equipe Sanchez (painel Inteligência) não é membro do Clube (0011: manter)
  if coalesce((new.raw_user_meta_data ->> 'equipe_inteligencia')::boolean, false)
     or coalesce((new.raw_app_meta_data ->> 'equipe_inteligencia')::boolean, false) then
    return new;
  end if;

  if not public.documento_valido(v_doc) then
    raise exception 'documento inválido: CPF ou CNPJ não confere' using errcode = '22023';
  end if;
  if length(v_nome) < 2 then
    raise exception 'cadastro inválido: nome' using errcode = '22023';
  end if;
  if length(regexp_replace(v_whatsapp, '\D', '', 'g')) < 10 then
    raise exception 'cadastro inválido: whatsapp' using errcode = '22023';
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
    v_nome,
    v_whatsapp,
    new.email,
    v_doc,
    v_codigo,
    v_indicado_por,
    -- hora do servidor: a do aparelho pode estar errada ou ser forjada
    case when (new.raw_user_meta_data ->> 'consentimento_lgpd_em') is not null then now() end
  );

  if v_indicado_por is not null then
    insert into public.indicacoes (indicador_id, indicado_id)
    values (v_indicado_por, new.id);
  end if;

  return new;
end;
$$;

-- ── 3. Adesão de patrocínio: o que não pode vir do navegador ────────────────
-- Só vale para quem grava pelo site (anon/authenticated). Pelo SQL Editor ou com
-- a service_role, a linha entra como foi escrita.
create or replace function public.patrocinio_adesao_antes()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') in ('anon', 'authenticated') then
    new.id := gen_random_uuid();
    new.created_at := now();
    new.aceite_em := now();
    new.valor_mensal := new.cota::numeric;   -- o id da cota é o valor mensal (150, 250, 300)
    new.valor_total := new.valor_mensal * new.prazo_meses;
  end if;
  return new;
end;
$$;

drop trigger if exists patrocinio_adesao_antes on public.patrocinio_adesoes;
create trigger patrocinio_adesao_antes
  before insert on public.patrocinio_adesoes
  for each row execute function public.patrocinio_adesao_antes();

-- ── Conferência ─────────────────────────────────────────────────────────────
-- Sem policy de UPDATE em membros (só a de SELECT):
--   select policyname, cmd from pg_policies where schemaname = 'public' and tablename = 'membros';
-- Visitante e membro sem direito de gravar (tem de voltar vazio):
--   select grantee, privilege_type from information_schema.role_table_grants
--    where table_schema = 'public' and table_name in ('membros', 'indicacoes')
--      and grantee in ('anon', 'authenticated') and privilege_type <> 'SELECT'
--      and privilege_type not in ('REFERENCES', 'TRIGGER');
-- Dígito verificador (false, false):
--   select public.documento_valido('11111111111'), public.documento_valido('12345678900');
