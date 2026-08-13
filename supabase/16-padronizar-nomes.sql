-- ============================================================
--  Correção única: nomes de pessoa no padrão de nome próprio
-- ------------------------------------------------------------
--  O app já grava nome próprio desde o commit d71e710, mas os
--  registros anteriores continuam como foram digitados ("FLÁVIO
--  RUI DE SOUZA", "flavio rui de souza"). Isto acerta o passado.
--
--  Mesma regra da tela (nomeProprio, em src/lib/db.js): conectivos minúsculos,
--  menos quando abrem o nome, e maiúscula depois de hífen ou
--  apóstrofo. Resultado conferido contra a versão em JavaScript.
--
--  Alcança vendas.nome e participantes.nome. NÃO toca em títulos
--  de trabalho, faculdades nem e-mails.
--
--  ── ANTES DE APLICAR, se quiser conferir o que vai mudar: ──
--      select nome as antes, public.nome_proprio(nome) as depois
--        from public.vendas
--       where nome is distinct from public.nome_proprio(nome)
--         and btrim(coalesce(nome,'')) <> ''
--       order by nome limit 50;
--    (rode primeiro só o "create function" abaixo, depois esta consulta)
--
--  Rode no SQL Editor do Supabase. Pode rodar de novo sem efeito:
--  na segunda vez nenhum nome está fora do padrão.
-- ============================================================

create or replace function public.nome_proprio(txt text) returns text
language sql immutable as $$
  select coalesce((
    select string_agg(
      case
        when ord > 1 and w = any (array['de','da','do','das','dos','e','di','du',
                                        'del','della','la','le','van','von','y'])
        then w
        else initcap(w)     -- initcap já respeita hífen e apóstrofo
      end, ' ' order by ord)
    from (
      select lower(x) as w, ordinality as ord
      from unnest(
        string_to_array(btrim(regexp_replace(coalesce(txt, ''), '\s+', ' ', 'g')), ' ')
      ) with ordinality as t(x, ordinality)
    ) z
  ), '');
$$;

-- aplica nas duas tabelas e devolve quantos registros foram corrigidos
with v as (
  update public.vendas
     set nome = public.nome_proprio(nome)
   where btrim(coalesce(nome, '')) <> ''
     and nome is distinct from public.nome_proprio(nome)
  returning 1
), p as (
  update public.participantes
     set nome = public.nome_proprio(nome)
   where btrim(coalesce(nome, '')) <> ''
     and nome is distinct from public.nome_proprio(nome)
  returning 1
)
select (select count(*) from v) as vendas_corrigidas,
       (select count(*) from p) as participantes_corrigidos;
