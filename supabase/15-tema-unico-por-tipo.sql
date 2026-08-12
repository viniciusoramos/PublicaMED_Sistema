-- ============================================================
--  Migração: no cronograma, o título também passa a ser único POR TIPO
-- ------------------------------------------------------------
--  Irmã da 14, para a outra ponta. `planejamento_temas` tinha
--  unique (lancamento_id, titulo), então um capítulo e uma
--  apresentação de mesmo nome NO MESMO DIA colidiam — exatamente
--  o caso que a 14 acabou de liberar em publicações.
--
--  Vira índice único em (lancamento_id, titulo, coalesce(tipo,'')).
--  O coalesce é necessário: em Postgres, NULLs são considerados
--  distintos entre si numa restrição única, então temas vindos do
--  plano (tipo nulo = herda do dia) escapariam da checagem.
--
--  Rode no SQL Editor do Supabase (idempotente).
-- ============================================================

alter table public.planejamento_temas
  drop constraint if exists planejamento_temas_lancamento_id_titulo_key;

create unique index if not exists planejamento_temas_unq
  on public.planejamento_temas (lancamento_id, titulo, coalesce(tipo, ''));
