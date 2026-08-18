-- ============================================================
--  Migração: custo fixo que se repete nos meses seguintes
--
--  Um custo fixo (internet, telefone, mensalidade) vale para
--  todo mês, não só para aquele em que foi lançado. O item
--  passa a marcar se foi criado como recorrente, para o
--  sistema saber que ele se repete e poder removê-lo de uma
--  vez dos meses à frente.
--
--  Rode no SQL Editor do Supabase (idempotente).
-- ============================================================

alter table public.financeiro_itens
  add column if not exists recorrente boolean not null default false;
