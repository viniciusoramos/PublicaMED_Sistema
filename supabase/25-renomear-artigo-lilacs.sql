-- ============================================================
--  Correção única: o tipo "Artigo PSU" passa a se chamar "Artigo Lilacs"
-- ------------------------------------------------------------
--  É o MESMO tipo com outro nome, não um tipo novo. O nome mora
--  em cada registro, gravado na hora da venda/criação, e a lista
--  do seletor junta os tipos do código com os que estão no banco.
--  Trocar só no código deixaria "Artigo PSU" e "Artigo Lilacs"
--  lado a lado.
--
--  Alcança as cinco tabelas que guardam o tipo, numa instrução só
--  (ou troca tudo, ou nada): o calendário liga publicação e tema
--  do plano pela dupla tipo + título, então elas precisam mudar
--  juntas. NÃO toca no nome do produto do dia no calendário
--  (ex.: "Artigo PSU / LILACS"), que é rótulo do lançamento.
--
--  A comparação é a mesma da tela (chaveTipo, em src/App.jsx):
--  ignora maiúsculas, espaços e pontuação.
--
--  ── ANTES DE APLICAR, se quiser conferir o que vai mudar: ──
--      select 'vendas' as tabela, tipo, count(*) from public.vendas
--       where regexp_replace(lower(tipo), '[^a-z0-9]+', '', 'g') = 'artigopsu' group by tipo
--      union all
--      select 'publicacoes', tipo, count(*) from public.publicacoes
--       where regexp_replace(lower(tipo), '[^a-z0-9]+', '', 'g') = 'artigopsu' group by tipo
--      union all
--      select 'trabalhos', tipo, count(*) from public.trabalhos
--       where regexp_replace(lower(tipo), '[^a-z0-9]+', '', 'g') = 'artigopsu' group by tipo
--      union all
--      select 'planejamento_lancamentos', tipo, count(*) from public.planejamento_lancamentos
--       where regexp_replace(lower(tipo), '[^a-z0-9]+', '', 'g') = 'artigopsu' group by tipo
--      union all
--      select 'planejamento_temas', tipo, count(*) from public.planejamento_temas
--       where regexp_replace(lower(tipo), '[^a-z0-9]+', '', 'g') = 'artigopsu' group by tipo;
--
--  Rode no SQL Editor do Supabase. Pode rodar de novo sem efeito:
--  na segunda vez não sobra nenhum "Artigo PSU".
-- ============================================================

with v as (
  update public.vendas set tipo = 'Artigo Lilacs'
   where regexp_replace(lower(tipo), '[^a-z0-9]+', '', 'g') = 'artigopsu'
  returning 1
), p as (
  update public.publicacoes set tipo = 'Artigo Lilacs'
   where regexp_replace(lower(tipo), '[^a-z0-9]+', '', 'g') = 'artigopsu'
  returning 1
), t as (
  update public.trabalhos set tipo = 'Artigo Lilacs'
   where regexp_replace(lower(tipo), '[^a-z0-9]+', '', 'g') = 'artigopsu'
  returning 1
), l as (
  update public.planejamento_lancamentos set tipo = 'Artigo Lilacs'
   where regexp_replace(lower(tipo), '[^a-z0-9]+', '', 'g') = 'artigopsu'
  returning 1
), pt as (
  -- tipo nulo = herda o do dia; esses ficam como estão
  update public.planejamento_temas set tipo = 'Artigo Lilacs'
   where regexp_replace(lower(tipo), '[^a-z0-9]+', '', 'g') = 'artigopsu'
  returning 1
)
select (select count(*) from v)  as vendas,
       (select count(*) from p)  as publicacoes,
       (select count(*) from t)  as trabalhos,
       (select count(*) from l)  as dias_do_calendario,
       (select count(*) from pt) as temas_do_calendario;
