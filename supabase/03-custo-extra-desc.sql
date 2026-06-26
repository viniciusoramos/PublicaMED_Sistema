-- ============================================================
--  Migração: descrição do custo extra no Financeiro
--  Permite anotar o que foi o custo extra (ex.: "Compra de celular").
--  Rode no SQL Editor do Supabase (idempotente).
-- ============================================================

alter table public.financeiro add column if not exists custo_extra_desc text not null default '';
