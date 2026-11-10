-- 0012 — limite de tamanho e de tipo no bucket `cotacoes-docs`
--
-- Revisão de segurança (sanchez-inteligencia, docs/seguranca/2026-10-26-relatorio.md):
-- a policy "upload de docs de cotação" (0005) deixa qualquer visitante sem login
-- enviar para o bucket, que não tinha limite de tamanho nem de tipo. Dava para
-- encher o Storage do projeto (que também hospeda o schema `inteligencia`).
--
-- Agora o próprio Storage recusa arquivo acima de 10 MB ou que não seja PDF/foto.
-- Os mesmos valores estão em src/lib/cotacoes.ts (o formulário avisa antes de enviar):
-- mudar nos dois lugares.
--
-- Idempotente: pode rodar de novo.

update storage.buckets
set file_size_limit = 10485760, -- 10 MB
    allowed_mime_types = array[
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif'
    ]
where id = 'cotacoes-docs';

-- Conferência (tem de mostrar 10485760 e os 6 tipos):
-- select id, file_size_limit, allowed_mime_types from storage.buckets where id = 'cotacoes-docs';
