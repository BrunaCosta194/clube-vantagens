-- Clube de Vantagens Sanchez — Fase 2.2
-- O voucher de cadastro deixou de ser valor fixo em reais (R$100) e virou
-- desconto percentual (5%). A 0002 criou `voucher_cadastro numeric` com
-- default 100.00 — o front já não lê mais esse número (mostra o rótulo de
-- src/lib/recompensas.ts), então a coluna ficou desalinhada com a regra.
-- Aqui ela vira texto, guardando o rótulo que o membro recebeu no cadastro.
-- Mantém sincronia com src/lib/recompensas.ts (VOUCHER_CADASTRO_LABEL="5%").

alter table public.membros
  alter column voucher_cadastro drop default;

alter table public.membros
  alter column voucher_cadastro type text
  using '5%';

alter table public.membros
  alter column voucher_cadastro set default '5%';

comment on column public.membros.voucher_cadastro is
  'Rótulo do benefício de boas-vindas recebido no cadastro (ex: "5%"). Sincronizar com VOUCHER_CADASTRO_LABEL em src/lib/recompensas.ts.';
