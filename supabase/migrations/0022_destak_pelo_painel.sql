-- 0022 — /parceiro/destak-office passa a ser da página montada no painel (Portal do Parceiro).
--
-- A Destak Boutique tinha página feita à mão desde 17/11 (sem benefício). Ela mandou o
-- cadastro pelo portal em 18/11, com benefício confirmado, endereço e horário, e a página
-- sai pelo fluxo do bloco F, igual à Dewa (0021). O App.tsx mostra a página do painel em
-- /parceiro/destak-office quando ela estiver publicada e, até lá, a feita à mão.
--
-- Muda só a lista de endereços reservados em parceiro_perfil_salvar (resto igual à 0021):
--   sai 'destak-office'; ficam 'bioreluz' e 'insurance-sante'.
--
-- Rodar no SQL Editor. Para desfazer: rodar de novo a função da 0021.

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
  if v_slug in ('bioreluz', 'insurance-sante') then
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

revoke all on function public.parceiro_perfil_salvar(uuid, jsonb) from public, anon;
grant execute on function public.parceiro_perfil_salvar(uuid, jsonb) to authenticated;
