-- ============================================================
--  Migração: taxa de publicação como valor único da PUBLICAÇÃO
--  (antes era por participante). Guarda o valor da taxa e se já
--  foi lançada no Financeiro, para não lançar duas vezes.
--  Rode no SQL Editor do Supabase (idempotente).
-- ============================================================

alter table public.publicacoes add column if not exists taxa numeric(10,2) not null default 0;
alter table public.publicacoes add column if not exists taxa_lancada boolean not null default false;
