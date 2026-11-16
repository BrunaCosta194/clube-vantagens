-- 0019 — a limpeza agendada dos rascunhos passa a mandar um segredo
--
-- A ação `limpar_rascunhos` da função `parceiro-cadastro` era chamada sem nenhuma
-- identificação (0015): qualquer pessoa podia dispará-la. Ela só apaga o que a regra já
-- manda apagar, então não havia perda de dado, mas cada chamada faz a função listar o
-- Storage. Agora o pg_cron manda o cabeçalho `x-cron-segredo`, com um valor guardado no
-- Vault do Supabase (nunca neste arquivo: o repositório é público), e a função recusa
-- quem não manda o mesmo valor.
--
-- PASSO A PASSO (nesta ordem):
--   1. Gerar um valor aleatório, por exemplo no terminal:  openssl rand -hex 32
--   2. No SQL Editor, guardar no Vault (trocar VALOR pelo valor gerado; NÃO salvar a
--      consulta com o valor dentro):
--        select vault.create_secret('VALOR', 'cron_segredo', 'limpeza de rascunhos do Portal do Parceiro');
--   3. Rodar este arquivo (reagenda a tarefa para mandar o cabeçalho).
--   4. No terminal, da pasta do Clube, guardar o MESMO valor na função e publicar:
--        npx supabase secrets set CRON_SEGREDO=VALOR --project-ref yfdlvusoanyyetcgoafz
--        npx supabase functions deploy parceiro-cadastro --project-ref yfdlvusoanyyetcgoafz --no-verify-jwt
-- Entre o passo 3 e o 4 nada quebra: sem o secret CRON_SEGREDO a função ainda aceita a
-- chamada como antes. Depois do 4, só passa quem manda o valor certo.
--
-- Trocar o segredo depois: `select vault.update_secret(id, 'NOVO') from vault.secrets where
-- name = 'cron_segredo';` e repetir o passo 4 com o valor novo.
-- Idempotente: pode rodar de novo.

do $cron$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron')
     or not exists (select 1 from pg_extension where extname = 'pg_net') then
    raise warning 'pg_cron/pg_net não instalados: limpeza dos rascunhos NÃO reagendada';
    return;
  end if;
  if not exists (select 1 from vault.secrets where name = 'cron_segredo') then
    raise exception 'falta o passo 2: guardar o segredo no Vault com o nome cron_segredo';
  end if;
  -- cron.schedule com o mesmo nome substitui a tarefa da 0015.
  perform cron.schedule(
    'parceiros-limpar-rascunhos',
    '17 6 * * *',
    $job$
      select net.http_post(
        url := 'https://yfdlvusoanyyetcgoafz.supabase.co/functions/v1/parceiro-cadastro',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-cron-segredo', coalesce((select decrypted_secret from vault.decrypted_secrets where name = 'cron_segredo'), '')
        ),
        body := '{"acao": "limpar_rascunhos"}'::jsonb
      );
    $job$
  );
end;
$cron$;

-- ── Conferência ─────────────────────────────────────────────────────────────
-- A tarefa agendada (1 linha; o comando tem de conter x-cron-segredo e NÃO o valor):
--   select jobname, schedule, command from cron.job where jobname = 'parceiros-limpar-rascunhos';
-- Depois do passo 4, chamada sem o cabeçalho tem de dar 403. As últimas execuções do
-- agendamento (status_code 200 no dia seguinte):
--   select status_code, content, created from net._http_response order by created desc limit 5;
