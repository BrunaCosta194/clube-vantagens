-- Clube de Vantagens Sanchez — Cotações (Insurance & Santé)
-- Tabela de pedidos de cotação vindos da página /parceiro/insurance-sante
-- + bucket PRIVADO pros documentos anexados (CPF/CNH/comprovantes).
--
-- Modelo de segurança:
--   • INSERT liberado pro público (anon) — qualquer visitante envia cotação.
--   • SEM policy de SELECT/UPDATE/DELETE → o client nunca lê/edita cotações.
--     A Yruena consulta pelo painel admin (service_role) ou pelo dashboard.
--   • Bucket `cotacoes-docs` é privado (public=false): nada de URL pública.
--     Acesso aos docs só via signed URL gerada com service_role.

create extension if not exists pgcrypto;

create table public.cotacoes (
  id uuid primary key default gen_random_uuid(),
  produto text not null,
  categoria text,
  nome text not null,
  whatsapp text not null,
  email text,
  -- respostas dos campos de simulação (variam por produto), como JSON.
  dados jsonb not null default '{}'::jsonb,
  -- caminhos dos arquivos no bucket cotacoes-docs (ex: "<pasta>/<arquivo>").
  documentos text[] not null default '{}',
  status text not null default 'nova'
    check (status in ('nova', 'em_analise', 'respondida', 'fechada')),
  origem text not null default 'clube-insurance',
  consentimento_lgpd_em timestamptz,
  created_at timestamptz not null default now()
);

create index cotacoes_created_at_idx on public.cotacoes (created_at desc);
create index cotacoes_status_idx on public.cotacoes (status);

alter table public.cotacoes enable row level security;

-- Visitante (anon) e membro logado podem CRIAR cotação. Nada além disso.
create policy "qualquer um cria cotação"
  on public.cotacoes for insert
  to anon, authenticated
  with check (true);

-- ─── Storage: bucket privado pros documentos ───
insert into storage.buckets (id, name, public)
values ('cotacoes-docs', 'cotacoes-docs', false)
on conflict (id) do nothing;

-- Upload liberado pro público nesse bucket (envio de docs da cotação).
-- NOTA: como o insert é anon, o bucket aceita upload de qualquer visitante —
-- risco aceitável no MVP (docs são privados, sem leitura pública). Se virar
-- alvo de abuso, migrar o upload pra uma Edge Function com validação/limite.
create policy "upload de docs de cotação"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'cotacoes-docs');

-- Sem policy de SELECT em storage.objects pro bucket → docs não são lidos
-- pelo client. A Yruena baixa via signed URL (service_role) no painel.
