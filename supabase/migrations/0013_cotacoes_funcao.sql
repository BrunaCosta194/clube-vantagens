-- 0013 — cotação pela Edge Function `cotacao-enviar` (parte 1 de 2: colunas novas)
--
-- A cotação da Insurance & Santé passa a ser gravada pela função (service_role),
-- que confere o Turnstile e limita os envios por IP. Esta migration só acrescenta
-- as colunas que a função grava; as policies abertas ao visitante continuam até a
-- 0014, para o site antigo seguir funcionando durante a troca.
--
-- ORDEM: rodar esta → publicar a função → deploy do site → rodar a 0014.
-- Idempotente: pode rodar de novo.

alter table public.cotacoes
  add column if not exists ip_hash text,              -- hash do IP que muda todo dia (nunca o IP)
  add column if not exists robo_checado boolean not null default false;  -- Turnstile respondeu "ok"

create index if not exists cotacoes_ip_hash_idx on public.cotacoes (ip_hash, created_at desc)
  where ip_hash is not null;

-- Conferência (tem de mostrar as duas colunas):
-- select column_name, data_type from information_schema.columns
--  where table_schema = 'public' and table_name = 'cotacoes' and column_name in ('ip_hash', 'robo_checado');
