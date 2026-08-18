-- ============================================================
--  Migração: detalhamento dos custos do mês (itens)
--
--  Antes, cada custo era só um número, e o "do que é" cabia
--  numa única frase concatenada no custo extra — ilegível
--  depois de três ou quatro lançamentos.
--
--  Agora cada custo pode ser detalhado em itens (valor +
--  descrição), como as linhas de uma planilha. A coluna
--  numérica do mês continua sendo o total (é dela que saem
--  os relatórios, gráficos e a Visão geral); os itens
--  explicam de onde ele veio e a somam automaticamente.
--
--  Rode no SQL Editor do Supabase (idempotente).
-- ============================================================

create table if not exists public.financeiro_itens (
  id            uuid          primary key default gen_random_uuid(),
  financeiro_id uuid          not null references public.financeiro(id) on delete cascade,
  -- qual custo do mês este item detalha
  campo         text          not null check (campo in ('taxaPublicacao','custoAds','custoFixo','custoExtra')),
  descricao     text          not null default '',
  valor         numeric(12,2) not null default 0,
  criado_em     timestamptz   not null default now()
);

create index if not exists financeiro_itens_mes_idx on public.financeiro_itens (financeiro_id, campo);

alter table public.financeiro_itens enable row level security;
drop policy if exists financeiro_itens_auth_all on public.financeiro_itens;
create policy financeiro_itens_auth_all on public.financeiro_itens
  for all to authenticated using (true) with check (true);
