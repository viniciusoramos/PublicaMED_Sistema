-- ============================================================
--  Migração: separar o Financeiro por ANO
--  Rode no SQL Editor do Supabase (idempotente, pode repetir).
--  As 12 linhas que já existem viram ano = 2025.
-- ============================================================

alter table public.financeiro add column if not exists ano smallint not null default 2025;

-- a unicidade passa a ser (ano, mes) em vez de só (mes)
alter table public.financeiro drop constraint if exists financeiro_mes_key;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'financeiro_ano_mes_key') then
    alter table public.financeiro add constraint financeiro_ano_mes_key unique (ano, mes);
  end if;
end $$;

create index if not exists financeiro_ano_idx on public.financeiro (ano);
