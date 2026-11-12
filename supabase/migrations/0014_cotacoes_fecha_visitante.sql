-- 0014 — cotação pela Edge Function `cotacao-enviar` (parte 2 de 2: fecha o acesso direto)
--
-- Tira as duas policies da 0005 que deixavam qualquer visitante, sem login, gravar em
-- `cotacoes` e subir arquivo no bucket `cotacoes-docs`. Depois disto só a função grava
-- (service_role) e os documentos sobem por link de upload de uso único que ela gera.
-- Revisão de segurança (sanchez-inteligencia, docs/seguranca/2026-10-26-relatorio.md).
--
-- SÓ RODAR DEPOIS de a função `cotacao-enviar` estar publicada e o site novo no ar:
-- antes disso, o formulário antigo para de funcionar.
-- Idempotente: pode rodar de novo. Para voltar atrás, recriar as duas policies da 0005.

drop policy if exists "qualquer um cria cotação" on public.cotacoes;
drop policy if exists "upload de docs de cotação" on storage.objects;

-- Conferência (as duas consultas têm de voltar vazias):
-- select policyname from pg_policies where schemaname = 'public' and tablename = 'cotacoes';
-- select policyname from pg_policies where schemaname = 'storage' and tablename = 'objects'
--  and policyname = 'upload de docs de cotação';
