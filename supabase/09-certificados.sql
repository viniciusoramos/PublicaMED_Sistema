-- ============================================================
--  Migração: certificados por publicação + telefone do participante
--  Rode no SQL Editor do Supabase (idempotente).
-- ============================================================

-- telefone do participante (para enviar o certificado no WhatsApp)
alter table public.participantes add column if not exists telefone text not null default '';

-- URL do PDF do certificado da publicação (guardado no Storage)
alter table public.publicacoes add column if not exists certificado_url text not null default '';

-- bucket público onde ficam os PDFs de certificado
insert into storage.buckets (id, name, public)
  values ('certificados', 'certificados', true)
  on conflict (id) do nothing;

-- usuários logados podem subir/trocar/remover certificados; leitura é pública (bucket public)
drop policy if exists cert_auth_all on storage.objects;
create policy cert_auth_all on storage.objects for all to authenticated
  using (bucket_id = 'certificados') with check (bucket_id = 'certificados');
