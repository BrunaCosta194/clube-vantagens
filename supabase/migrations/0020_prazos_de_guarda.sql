-- 0020 — prazos de guarda: o que a /privacidade promete passa a ser apagado de verdade
--
-- ATENÇÃO: esta migration liga uma limpeza diária que APAGA dados, sem volta. Só rodar
-- depois de a Yruena confirmar os prazos (proposta de 16/11):
--   • documentos da cotação (CPF, CNH, comprovantes) ..... 90 dias depois do envio
--   • pedido de cotação (nome, WhatsApp, respostas) ...... 1 ano
--   • leads do e-book ................................... 2 anos sem baixar de novo
--   • registros de navegação e de download .............. 2 anos
-- Membros, parceiros e adesões de patrocínio NÃO entram: têm contrato ou autorização
-- por trás e só saem a pedido (prazos na /privacidade).
--
-- Os prazos estão escritos AQUI, dentro das funções, como piso: quem chama não consegue
-- pedir prazo menor. Mudou o prazo: mudar aqui, em DOCS_GUARDA_DIAS
-- (supabase/functions/_shared/cotacao.ts) e no texto de src/pages/Privacidade.tsx.
--
-- Como funciona: todo dia às 6h37 (UTC) o pg_cron chama a função `cotacao-enviar` com
-- { "acao": "limpar" } e o cabeçalho x-cron-segredo (o mesmo segredo da 0019). A função
-- apaga os arquivos vencidos pela API do Storage (arquivo não pode ser apagado por SQL)
-- e depois chama `limpeza_de_dados()`, que apaga as linhas vencidas.
--
-- ORDEM: 0019 feita inteira (segredo no Vault e CRON_SEGREDO na função) → publicar a
-- função `cotacao-enviar` desta versão → rodar este arquivo.
-- Sem o secret CRON_SEGREDO a função recusa a limpeza (403): ninguém de fora dispara.
-- Idempotente: pode rodar de novo.

alter table public.cotacoes
  add column if not exists documentos_apagados_em timestamptz;  -- quando os arquivos saíram do Storage

-- Cotações com documento vencido. A função `cotacao-enviar` apaga os arquivos e marca.
create or replace function public.cotacoes_docs_vencidos(p_dias integer default 90)
returns table (id uuid, documentos text[])
language sql
stable
security definer
set search_path = public
as $$
  select c.id, c.documentos
    from public.cotacoes c
   where c.documentos_apagados_em is null
     and c.created_at < now() - make_interval(days => greatest(coalesce(p_dias, 90), 90))
   order by c.created_at
   limit 100
$$;

-- Apaga as linhas vencidas e devolve quantas saíram de cada tabela.
create or replace function public.limpeza_de_dados()
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_cotacoes integer;
  v_leads integer;
  v_downloads integer;
  v_eventos integer;
begin
  -- Cotação: 1 ano. Só sai a linha cujos arquivos já saíram do Storage (senão o
  -- arquivo ficaria lá sem dono).
  delete from public.cotacoes
   where created_at < now() - interval '1 year'
     and documentos_apagados_em is not null;
  get diagnostics v_cotacoes = row_count;

  -- Lead do e-book: 2 anos sem baixar de novo.
  delete from public.ebook_leads l
   where l.created_at < now() - interval '2 years'
     and not exists (
       select 1 from public.ebook_downloads d
        where d.lead_id = l.id and d.created_at >= now() - interval '2 years'
     );
  get diagnostics v_leads = row_count;

  delete from public.ebook_downloads where created_at < now() - interval '2 years';
  get diagnostics v_downloads = row_count;

  delete from public.eventos where created_at < now() - interval '2 years';
  get diagnostics v_eventos = row_count;

  return jsonb_build_object(
    'cotacoes', v_cotacoes, 'leads', v_leads, 'downloads', v_downloads, 'eventos', v_eventos
  );
end;
$$;

revoke all on function public.cotacoes_docs_vencidos(integer) from public, anon, authenticated;
revoke all on function public.limpeza_de_dados() from public, anon, authenticated;
grant execute on function public.cotacoes_docs_vencidos(integer) to service_role;
grant execute on function public.limpeza_de_dados() to service_role;

do $cron$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron')
     or not exists (select 1 from pg_extension where extname = 'pg_net') then
    raise warning 'pg_cron/pg_net não instalados: limpeza de dados NÃO agendada';
    return;
  end if;
  if not exists (select 1 from vault.secrets where name = 'cron_segredo') then
    raise exception 'falta a 0019: guardar o segredo no Vault com o nome cron_segredo';
  end if;
  perform cron.schedule(
    'clube-limpeza-de-dados',
    '37 6 * * *',
    $job$
      select net.http_post(
        url := 'https://yfdlvusoanyyetcgoafz.supabase.co/functions/v1/cotacao-enviar',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-cron-segredo', coalesce((select decrypted_secret from vault.decrypted_secrets where name = 'cron_segredo'), '')
        ),
        body := '{"acao": "limpar"}'::jsonb
      );
    $job$
  );
end;
$cron$;

-- ── Antes de rodar: ver o que a PRIMEIRA limpeza vai apagar ─────────────────
--   select 'documentos de cotação' as o_que, count(*) from public.cotacoes
--    where documentos_apagados_em is null and documentos <> '{}' and created_at < now() - interval '90 days'
--   union all select 'cotações', count(*) from public.cotacoes where created_at < now() - interval '1 year'
--   union all select 'leads', count(*) from public.ebook_leads where created_at < now() - interval '2 years'
--   union all select 'downloads', count(*) from public.ebook_downloads where created_at < now() - interval '2 years'
--   union all select 'eventos', count(*) from public.eventos where created_at < now() - interval '2 years';
--
-- ── Conferência ─────────────────────────────────────────────────────────────
-- Tarefa agendada (1 linha):
--   select jobname, schedule from cron.job where jobname = 'clube-limpeza-de-dados';
-- No dia seguinte, a resposta da função (status_code 200 e as contagens):
--   select status_code, content, created from net._http_response order by created desc limit 5;
-- Para desligar a limpeza:  select cron.unschedule('clube-limpeza-de-dados');
