-- ============================================================
--  Migração: onde o trabalho será publicado (revista/evento/etc.)
--  Rode no SQL Editor do Supabase (idempotente).
-- ============================================================

alter table public.trabalhos add column if not exists local_publicacao text not null default '';
