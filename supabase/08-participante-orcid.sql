-- ============================================================
--  Migração: ORCID do participante (identificador de pesquisador).
--  Opcional. Rode no SQL Editor do Supabase (idempotente).
-- ============================================================

alter table public.participantes add column if not exists orcid text not null default '';
