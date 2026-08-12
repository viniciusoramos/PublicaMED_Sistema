-- ============================================================
--  Migração: fechar publicação (encerrar as vendas)
-- ------------------------------------------------------------
--  Quando o trabalho é publicado, não dá mais para vender vaga
--  nele — mesmo que tenham sobrado vagas. Até aqui a única saída
--  da lista "em venda" era lotar, então essas publicações ficavam
--  ocupando espaço para sempre.
--
--  fechada_em = quando foi encerrada. Nulo = ainda em venda.
--  (uma coluna só: guarda a data e serve de marcador)
--
--  Rode no SQL Editor do Supabase (idempotente).
-- ============================================================

alter table public.publicacoes add column if not exists fechada_em timestamptz;
