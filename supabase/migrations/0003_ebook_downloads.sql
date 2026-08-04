-- Clube de Vantagens Sanchez — registro de downloads do e-book
-- "Papo de Aluguel". Cada linha = um membro que baixou (saber quem baixou).
-- Gate no front: só membro logado dispara o download (src/lib/ebook.ts).
-- Rodar assim que o projeto Supabase for reativado (Pro).

create table public.ebook_downloads (
  id uuid primary key default gen_random_uuid(),
  membro_id uuid not null references public.membros (id) on delete cascade,
  ebook text not null default 'papo-de-aluguel',
  created_at timestamptz not null default now()
);

-- consultas por membro e por e-book
create index ebook_downloads_membro_idx on public.ebook_downloads (membro_id);
create index ebook_downloads_ebook_idx on public.ebook_downloads (ebook);

alter table public.ebook_downloads enable row level security;

create policy "membro registra o próprio download"
  on public.ebook_downloads for insert
  with check (auth.uid() = membro_id);

create policy "membro vê os próprios downloads"
  on public.ebook_downloads for select
  using (auth.uid() = membro_id);
