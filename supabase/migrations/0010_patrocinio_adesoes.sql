-- Clube de Vantagens Sanchez — adesões de patrocínio do Papo de Aluguel
-- O Mídia Kit (/midiakit) tem o fluxo "Quero fazer parte": cota → dados PF/PJ
-- → contrato de 6 meses + aceite → Pix. Até aqui a adesão só ia por WhatsApp;
-- se a conversa se perdesse, não sobrava registro de quem aceitou o quê.
-- Cada linha aqui é um aceite: quem, qual cota, qual texto de contrato, quando.
--
-- ATENÇÃO: migration AINDA NÃO APLICADA. Rodar no SQL Editor do Dashboard,
-- num banco onde a 0009_painel_admin.sql já está aplicada (usa is_admin()).
--
-- Modelo de segurança (mesmo espírito da 0008_ebook_leads.sql):
--   • INSERT liberado pro público (anon): a página é estática e usa a anon key.
--   • SELECT só pra admin (is_admin()). Visitante nunca lê adesão de ninguém.
--   • Sem UPDATE/DELETE pelo client. Mudar status (pago, cancelado) é feito
--     no Dashboard/SQL Editor ou por um painel futuro com service_role.
--   • `contrato_texto` guarda o contrato EXATAMENTE como foi exibido no aceite
--     — é a prova do que a pessoa aceitou, mesmo que o modelo mude depois.
--   • limites de tamanho em todos os textos (anon não pode mandar payload grande).

create extension if not exists pgcrypto;

create table public.patrocinio_adesoes (
  id uuid primary key default gen_random_uuid(),

  -- cota e condições
  cota text not null check (cota in ('150', '250', '300')),
  valor_mensal numeric(10, 2) not null check (valor_mensal > 0),
  valor_total numeric(10, 2) not null check (valor_total > 0),
  prazo_meses smallint not null default 6 check (prazo_meses between 1 and 36),
  inicio date not null,
  termino date not null check (termino > inicio),

  -- contratante
  tipo text not null check (tipo in ('PF', 'PJ')),
  nome text not null check (length(nome) between 2 and 200),           -- razão social ou nome completo
  fantasia text check (length(fantasia) <= 200),
  documento text not null check (length(documento) between 11 and 20), -- CPF ou CNPJ (com máscara)
  representante text check (length(representante) <= 200),
  cpf_representante text check (length(cpf_representante) <= 20),
  endereco text not null check (length(endereco) between 5 and 400),
  email text not null check (
    length(email) between 5 and 200
    and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  ),
  telefone text not null check (length(telefone) between 8 and 32),

  -- marca (o que vai ao ar)
  nome_comercial text check (length(nome_comercial) <= 200),
  segmento text check (length(segmento) <= 200),
  instagram text check (length(instagram) <= 200),
  site text check (length(site) <= 300),
  whats_comercial text check (length(whats_comercial) <= 32),
  descricao text check (length(descricao) <= 2000),
  oferta text check (length(oferta) <= 500),

  -- aceite eletrônico
  contrato_versao text not null check (length(contrato_versao) <= 40),
  contrato_texto text not null check (length(contrato_texto) <= 30000),
  aceite_contrato boolean not null check (aceite_contrato),
  aceite_lgpd boolean not null check (aceite_lgpd),
  aceite_em timestamptz not null default now(),
  user_agent text check (length(user_agent) <= 500),

  status text not null default 'contrato_aceito_aguardando_pagamento' check (status in (
    'contrato_aceito_aguardando_pagamento', 'ativo', 'encerrado', 'cancelado'
  )),
  observacao text check (length(observacao) <= 2000),
  created_at timestamptz not null default now()
);

create index patrocinio_adesoes_created_at_idx on public.patrocinio_adesoes (created_at desc);
create index patrocinio_adesoes_documento_idx on public.patrocinio_adesoes (documento);
create index patrocinio_adesoes_status_idx on public.patrocinio_adesoes (status);

alter table public.patrocinio_adesoes enable row level security;

-- Visitante cria a adesão. Status inicial é sempre o padrão: ninguém de fora
-- consegue se registrar já como "ativo".
create policy "qualquer um registra adesão de patrocínio"
  on public.patrocinio_adesoes for insert
  to anon, authenticated
  with check (status = 'contrato_aceito_aguardando_pagamento' and observacao is null);

-- Só admin do painel lê.
create policy "admin lê adesões de patrocínio"
  on public.patrocinio_adesoes for select
  to authenticated
  using (public.is_admin());

-- Consulta rápida no SQL Editor:
--   select created_at, cota, nome, documento, email, telefone, status
--   from public.patrocinio_adesoes order by created_at desc;
-- Marcar como pago:
--   update public.patrocinio_adesoes set status = 'ativo' where id = '...';
