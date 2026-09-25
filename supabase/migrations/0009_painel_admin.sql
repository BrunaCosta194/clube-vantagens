-- Clube de Vantagens Sanchez — Bloco 11 (painel de desempenho, fase 1)
-- Rota /admin lê métricas agregadas de `eventos`, `membros` e `indicacoes`.
--
-- Modelo de segurança:
--   • `admins` lista quem entra no painel (user_id do Supabase Auth). RLS
--     ligada e SEM policy → o client nunca lê nem grava essa tabela; quem
--     vira admin é decidido no SQL Editor (ver fim do arquivo).
--   • `eventos` continua sem SELECT pro client. O painel só enxerga dados
--     agregados, pelas funções SECURITY DEFINER abaixo, que checam
--     `is_admin()` antes de qualquer consulta.
--   • Nenhuma função devolve nome/e-mail/WhatsApp/CPF — só contagens,
--     slugs e códigos de indicação.

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Métricas do painel. Filtros opcionais (null = todos):
--   p_campanha / p_origem / p_ref — igualdade exata com a coluna do evento
--   p_dispositivo — mobile | tablet | desktop
--   p_situacao    — 'visitante' (sem membro_id) | 'membro' (com membro_id)
create or replace function public.painel_metricas(
  p_inicio timestamptz,
  p_fim timestamptz,
  p_campanha text default null,
  p_origem text default null,
  p_dispositivo text default null,
  p_situacao text default null,
  p_ref text default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_resultado jsonb;
begin
  if not public.is_admin() then
    raise exception 'acesso negado' using errcode = '42501';
  end if;

  if p_fim - p_inicio > interval '400 days' then
    raise exception 'período máximo é de 400 dias' using errcode = '22023';
  end if;

  with ev as (
    select *
    from public.eventos e
    where e.created_at >= p_inicio
      and e.created_at < p_fim
      and (p_campanha is null or e.campanha = p_campanha)
      and (p_origem is null or e.origem = p_origem)
      and (p_dispositivo is null or e.dispositivo = p_dispositivo)
      and (p_ref is null or e.ref = p_ref)
      and (
        p_situacao is null
        or (p_situacao = 'visitante' and e.membro_id is null)
        or (p_situacao = 'membro' and e.membro_id is not null)
      )
  )
  select jsonb_build_object(
    'totais', (
      select jsonb_build_object(
        'eventos', count(*),
        'sessoes', count(distinct sessao_id),
        'membros_ativos', count(distinct membro_id)
      )
      from ev
    ),
    'por_dia', coalesce((
      select jsonb_agg(d order by d.dia)
      from (
        select (created_at at time zone 'America/Sao_Paulo')::date as dia,
               count(*) as eventos,
               count(distinct sessao_id) as sessoes
        from ev
        group by 1
      ) d
    ), '[]'::jsonb),
    'por_evento', coalesce((
      select jsonb_agg(x order by x.total desc)
      from (select nome, count(*) as total from ev group by nome) x
    ), '[]'::jsonb),
    'banners', coalesce((
      select jsonb_agg(x order by x.views desc, x.cliques desc)
      from (
        select props ->> 'banner' as banner,
               count(*) filter (where nome = 'banner_view') as views,
               count(*) filter (where nome = 'banner_click') as cliques
        from ev
        where nome in ('banner_view', 'banner_click') and props ? 'banner'
        group by 1
      ) x
    ), '[]'::jsonb),
    'funil_ebook', (
      select jsonb_build_object(
        'abriu_form', count(*) filter (where nome = 'ebook_form_open'),
        'enviou_form', count(*) filter (where nome = 'ebook_form_submit'),
        'baixou', count(*) filter (where nome = 'ebook_download'),
        -- sessões que baixaram o e-book e depois completaram o cadastro
        'virou_membro', (
          select count(distinct c.sessao_id)
          from ev c
          where c.nome = 'club_signup_complete'
            and exists (
              select 1 from ev d
              where d.sessao_id = c.sessao_id
                and d.nome = 'ebook_download'
                and d.created_at <= c.created_at
            )
        )
      )
      from ev
    ),
    'parceiros', coalesce((
      select jsonb_agg(x order by x.contatos desc, x.aberturas desc)
      from (
        select props ->> 'slug' as slug,
               count(*) filter (where nome = 'partner_open') as aberturas,
               count(*) filter (where nome = 'partner_contact') as contatos,
               count(*) filter (where nome = 'partner_contact' and props ->> 'canal' = 'whatsapp') as contatos_whatsapp,
               count(*) filter (where nome = 'partner_contact' and props ->> 'canal' = 'site') as contatos_site
        from ev
        where nome in ('partner_open', 'partner_contact') and props ? 'slug'
        group by 1
      ) x
    ), '[]'::jsonb),
    'produtos', coalesce((
      select jsonb_agg(x order by x.cliques desc)
      from (
        select props ->> 'produto' as produto,
               props ->> 'canal' as canal,
               count(*) as cliques
        from ev
        where nome = 'product_click'
        group by 1, 2
      ) x
    ), '[]'::jsonb),
    'social', coalesce((
      select jsonb_agg(x order by x.cliques desc)
      from (
        select coalesce(props ->> 'rede', '?') as rede,
               coalesce(props ->> 'local', '?') as local,
               count(*) as cliques
        from ev
        where nome = 'social_click'
        group by 1, 2
      ) x
    ), '[]'::jsonb),
    'mapa', coalesce((
      select jsonb_agg(x order by x.total desc)
      from (
        select coalesce(props ->> 'tipo', '?') as tipo,
               coalesce(props ->> 'localizacao', '-') as localizacao,
               count(*) as total
        from ev
        where nome = 'map_open'
        group by 1, 2
      ) x
    ), '[]'::jsonb),
    'cadastros_por_origem', coalesce((
      select jsonb_agg(x order by x.iniciados desc)
      from (
        select coalesce(origem, 'direto') as origem,
               coalesce(campanha, '-') as campanha,
               count(*) filter (where nome = 'club_signup_start') as iniciados,
               count(*) filter (where nome = 'club_signup_complete') as completos
        from ev
        where nome in ('club_signup_start', 'club_signup_complete')
        group by 1, 2
      ) x
    ), '[]'::jsonb),
    -- Indicações vêm da tabela `indicacoes` (fonte de verdade), só pelo
    -- período — os filtros de sessão/dispositivo não se aplicam a ela.
    'indicacoes', (
      select jsonb_build_object(
        'compartilhamentos', (select count(*) from ev where nome = 'referral_share'),
        'cadastradas', count(*),
        'convertidas', count(*) filter (where i.status = 'convertido'),
        'top_codigos', coalesce((
          select jsonb_agg(t order by t.indicacoes desc)
          from (
            select m.codigo_indicacao as codigo, count(*) as indicacoes
            from public.indicacoes i2
            join public.membros m on m.id = i2.indicador_id
            where i2.created_at >= p_inicio and i2.created_at < p_fim
            group by 1
            order by 2 desc
            limit 10
          ) t
        ), '[]'::jsonb)
      )
      from public.indicacoes i
      where i.created_at >= p_inicio and i.created_at < p_fim
    ),
    'novos_membros', (
      select count(*) from public.membros m
      where m.created_at >= p_inicio and m.created_at < p_fim
    )
  )
  into v_resultado;

  return v_resultado;
end;
$$;

revoke all on function public.painel_metricas(timestamptz, timestamptz, text, text, text, text, text) from public;
grant execute on function public.painel_metricas(timestamptz, timestamptz, text, text, text, text, text) to authenticated;

-- Valores distintos pros selects de filtro do painel (últimos 400 dias).
create or replace function public.painel_opcoes_filtro()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'acesso negado' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'campanhas', coalesce((
      select jsonb_agg(c order by c) from (
        select distinct campanha as c from public.eventos
        where campanha is not null and created_at > now() - interval '400 days'
      ) x
    ), '[]'::jsonb),
    'origens', coalesce((
      select jsonb_agg(o order by o) from (
        select distinct origem as o from public.eventos
        where origem is not null and created_at > now() - interval '400 days'
      ) x
    ), '[]'::jsonb),
    'refs', coalesce((
      select jsonb_agg(r order by r) from (
        select distinct ref as r from public.eventos
        where ref is not null and created_at > now() - interval '400 days'
      ) x
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.painel_opcoes_filtro() from public;
grant execute on function public.painel_opcoes_filtro() to authenticated;

-- ── Dar acesso ao painel (rodar no SQL Editor, trocando o e-mail) ─────────
-- A pessoa precisa já ter conta no Clube (cadastro normal no site).
--
-- insert into public.admins (user_id, email)
-- select id, email from auth.users where email = 'EMAIL_AQUI'
-- on conflict (user_id) do nothing;
