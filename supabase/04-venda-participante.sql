-- ============================================================
--  Migração: ligar venda -> participante
--  A venda lançada junto com um participante passa a referenciar
--  esse participante. Ao remover o participante, a venda é apagada
--  automaticamente (ON DELETE CASCADE).
--  Rode no SQL Editor do Supabase (idempotente).
-- ============================================================

alter table public.vendas
  add column if not exists participante_id uuid
  references public.participantes(id) on delete cascade;

create index if not exists vendas_participante_idx on public.vendas (participante_id);
