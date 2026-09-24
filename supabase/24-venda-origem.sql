-- ============================================================
--  Migração: de qual grupo de WhatsApp veio cada venda
-- ------------------------------------------------------------
--  Os grupos têm origens diferentes — tráfego pago, estratégia
--  orgânica, divulgação feita por funcionário — e a pergunta que
--  importa é qual deles traz cliente que compra bem e volta.
--
--  Fica na VENDA, e não no participante: a pergunta é sobre a
--  compra ("esta venda veio de onde"), e a mesma pessoa pode
--  comprar de novo depois de mudar de grupo.
--
--  Vazio = origem ainda desconhecida. É o estado de quase todo o
--  histórico, e a tela precisa saber diferenciar "não sei" de
--  "sei que não veio de grupo nenhum" — por isso texto vazio, e
--  não um valor padrão qualquer.
--
--  Como aplicar:
--    Supabase Dashboard → SQL Editor → cole → Run.
--    (idempotente: pode rodar de novo sem efeito)
-- ============================================================

alter table public.vendas
  add column if not exists origem text not null default '';

comment on column public.vendas.origem is
  'Grupo de WhatsApp de onde veio a venda. Vazio = desconhecida.';

-- o painel agrupa por origem dentro de um período
create index if not exists vendas_origem_idx on public.vendas (origem);

-- O PostgREST guarda o desenho das tabelas em cache e não enxerga a coluna
-- nova sozinho: sem isto o painel responde "Could not find the 'origem'
-- column of 'vendas' in the schema cache".
notify pgrst, 'reload schema';

-- confere
select count(*) filter (where origem <> '') as com_origem,
       count(*) filter (where origem =  '') as sem_origem,
       count(*)                             as total
  from public.vendas;
