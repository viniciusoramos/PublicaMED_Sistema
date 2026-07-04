-- ============================================================
--  Migração: guarda a DATA em que a taxa da publicação foi
--  lançada no Financeiro. Permite estornar do mês certo quando
--  a publicação é excluída. Rode no SQL Editor do Supabase.
-- ============================================================

alter table public.publicacoes add column if not exists taxa_data date;
