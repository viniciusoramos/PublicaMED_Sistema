-- ============================================================
--  Migração: o título passa a ser único POR TIPO de trabalho
-- ------------------------------------------------------------
--  Antes: `tema` era único no sistema inteiro. Isso impedia abrir
--  uma apresentação com o mesmo título de um capítulo já existente
--  — e eles são trabalhos diferentes, cada um com as suas vagas.
--  O erro que aparecia era:
--      duplicate key value violates unique constraint "publicacoes_tema_key"
--
--  Agora a dupla (tema, tipo) é que precisa ser única: dá para ter
--  "Dor Torácica na Emergência" como capítulo E como apresentação,
--  mas continua impedido cadastrar o mesmo capítulo duas vezes.
--
--  Rode no SQL Editor do Supabase (idempotente).
-- ============================================================

alter table public.publicacoes drop constraint if exists publicacoes_tema_key;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'publicacoes_tema_tipo_key'
  ) then
    alter table public.publicacoes add constraint publicacoes_tema_tipo_key unique (tema, tipo);
  end if;
end $$;
