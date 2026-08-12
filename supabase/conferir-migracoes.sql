-- ============================================================
--  Conferência: quais migrações já estão aplicadas neste projeto
-- ------------------------------------------------------------
--  Só LÊ o catálogo do banco — não altera nada. Pode rodar à
--  vontade, em produção e no teste.
--
--  Cole no SQL Editor do Supabase e dê Run. Cada linha diz OK ou
--  FALTA. Se tudo estiver OK, o banco está pronto para o código
--  publicado.
--
--  Para conferir também se o cronograma foi carregado (só depois de
--  a 11 estar OK, senão a tabela nem existe):
--      select count(*) from public.planejamento_temas;   -- esperado: 31+
-- ============================================================

with checagem(migracao, item, ok) as (
  select '11', 'tabela planejamentos',            to_regclass('public.planejamentos')            is not null
  union all
  select '11', 'tabela planejamento_lancamentos', to_regclass('public.planejamento_lancamentos') is not null
  union all
  select '11', 'tabela planejamento_temas',       to_regclass('public.planejamento_temas')       is not null
  union all
  select '12', 'publicacoes.fechada_em', exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'publicacoes' and column_name = 'fechada_em')
  union all
  select '13', 'planejamento_temas.tipo', exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'planejamento_temas' and column_name = 'tipo')
  union all
  select '13', 'planejamento_temas.vagas', exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'planejamento_temas' and column_name = 'vagas')
  union all
  select '13', 'planejamento_temas.preco', exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'planejamento_temas' and column_name = 'preco')
  union all
  select '13', 'planejamento_lancamentos.avulso', exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'planejamento_lancamentos' and column_name = 'avulso')
  union all
  select '14', 'publicacoes: unique (tema, tipo) criado', exists (
    select 1 from pg_constraint where conname = 'publicacoes_tema_tipo_key')
  union all
  select '14', 'publicacoes: unique (tema) antigo removido', not exists (
    select 1 from pg_constraint where conname = 'publicacoes_tema_key')
  union all
  select '15', 'cronograma: indice unico por tipo criado', exists (
    select 1 from pg_indexes where schemaname = 'public' and indexname = 'planejamento_temas_unq')
  union all
  select '15', 'cronograma: unique (dia, titulo) antigo removido', not exists (
    select 1 from pg_constraint where conname = 'planejamento_temas_lancamento_id_titulo_key')
)
select migracao,
       case when ok then 'OK' else '*** FALTA ***' end as situacao,
       item
  from checagem
 order by migracao, item;
