-- ============================================================
--  Migração: ajuste manual de faturamento por mês.
--  O faturamento do mês = soma das vendas (automático) + este ajuste.
--  Serve pra registrar receita que não foi lançada venda a venda
--  (ex.: trabalhos esquecidos). Rode no SQL Editor do Supabase.
-- ============================================================

alter table public.financeiro add column if not exists faturamento_ajuste numeric(12,2) not null default 0;
