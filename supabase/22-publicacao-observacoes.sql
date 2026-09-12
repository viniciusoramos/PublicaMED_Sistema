-- ============================================================
--  Migração: campo de observações na publicação
-- ------------------------------------------------------------
--  Anotação livre sobre o trabalho — o que precisa ser lembrado
--  na hora de mexer nele. Fica na própria publicação porque é
--  sobre ela, não sobre o participante nem sobre a venda.
--
--  Texto vazio é o padrão: nenhuma publicação existente muda.
--
--  Como aplicar:
--    Supabase Dashboard → SQL Editor → cole → Run.
--    (idempotente: pode rodar de novo sem efeito)
-- ============================================================

alter table public.publicacoes
  add column if not exists observacoes text not null default '';

comment on column public.publicacoes.observacoes is
  'Anotação livre sobre a publicação, escrita na aba Dados da publicação.';

-- O PostgREST (a API que o painel usa) guarda o desenho das tabelas em cache e
-- não percebe a coluna nova sozinha na hora: sem isto o app responde
-- "Could not find the 'observacoes' column ... in the schema cache".
notify pgrst, 'reload schema';

-- confere o resultado
select count(*) filter (where observacoes <> '') as com_observacao,
       count(*)                                  as publicacoes
  from public.publicacoes;
