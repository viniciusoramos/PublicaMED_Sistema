-- ============================================================
--  Migração: ordem dos autores dentro da publicação
-- ------------------------------------------------------------
--  A ordem dos autores é parte do trabalho: quem é o primeiro,
--  o segundo, e assim por diante. Até agora os participantes
--  saíam na ordem em que o banco devolvia — normalmente a de
--  cadastro, mas sem nenhuma garantia disso.
--
--  A carga inicial preserva o que está na tela hoje: numera cada
--  publicação pela data de cadastro do participante, que é a
--  ordem que vinha aparecendo. Ninguém precisa reorganizar nada
--  depois de aplicar.
--
--  Como aplicar:
--    Supabase Dashboard → SQL Editor → cole → Run.
--    (idempotente: rodar de novo não embaralha o que já foi
--     ajustado na tela — o backfill só numera quem está zerado)
-- ============================================================

alter table public.participantes
  add column if not exists ordem smallint not null default 0;

comment on column public.participantes.ordem is
  'Posição do autor na publicação (0 = primeiro). Definida arrastando na tela.';

-- Numera pela data de cadastro, só nas publicações em que ninguém foi
-- reordenado ainda (todas as posições em 0). Assim rodar de novo é inofensivo.
with numerado as (
  select p.id,
         row_number() over (partition by p.publicacao_id order by p.criado_em, p.id) - 1 as pos
    from public.participantes p
   where p.publicacao_id in (
     select publicacao_id from public.participantes
      group by publicacao_id having max(ordem) = 0 and count(*) > 1
   )
)
update public.participantes p
   set ordem = n.pos
  from numerado n
 where p.id = n.id
   and p.ordem is distinct from n.pos;

-- ordenar por (publicacao, ordem) é o que a tela faz a cada carga
create index if not exists participantes_ordem_idx
  on public.participantes (publicacao_id, ordem);

-- O PostgREST guarda o desenho das tabelas em cache e não enxerga a coluna
-- nova sozinha: sem isto o painel responde "Could not find the 'ordem'
-- column of 'participantes' in the schema cache".
notify pgrst, 'reload schema';

-- confere: as 5 publicações com mais autores e como ficaram numeradas
select pub.tema, p.ordem, p.nome
  from public.participantes p
  join public.publicacoes pub on pub.id = p.publicacao_id
 where p.publicacao_id in (
   select publicacao_id from public.participantes
    group by publicacao_id order by count(*) desc limit 5
 )
 order by pub.tema, p.ordem;
