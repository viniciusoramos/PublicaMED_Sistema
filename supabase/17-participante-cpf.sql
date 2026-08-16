-- ============================================================
--  Migração: CPF do participante
--  Guardado só com os dígitos (a tela formata na exibição).
--  Rode no SQL Editor do Supabase (idempotente).
-- ============================================================

alter table public.participantes add column if not exists cpf text not null default '';
