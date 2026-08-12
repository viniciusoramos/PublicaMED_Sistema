-- ============================================================
--  Migração: trabalho avulso no calendário
-- ------------------------------------------------------------
--  Até aqui o TIPO, as vagas e o preço viviam no lançamento (o dia),
--  e todo tema daquele dia herdava isso. Isso impedia duas coisas:
--
--   1. pôr no mesmo dia trabalhos de tipos diferentes (ex.: um capítulo
--      avulso num dia cujo lançamento planejado é apresentação);
--   2. criar trabalho num dia que não tem lançamento nenhum.
--
--  Agora o tema pode trazer os seus próprios tipo/vagas/preço. Nulo =
--  herda do lançamento, que continua valendo para o plano do mês.
--
--  `avulso` marca o lançamento criado por conveniência para segurar
--  trabalhos de um dia que não estava no planejamento editorial.
--
--  Rode no SQL Editor do Supabase (idempotente).
-- ============================================================

alter table public.planejamento_temas add column if not exists tipo  text;
alter table public.planejamento_temas add column if not exists vagas integer;
alter table public.planejamento_temas add column if not exists preco numeric(10,2);

alter table public.planejamento_lancamentos add column if not exists avulso boolean not null default false;

-- Segue valendo UM lançamento por dia (a unicidade fica de pé, e o script 11 continua
-- idempotente): o trabalho avulso entra como tema daquele dia, com tipo próprio.
