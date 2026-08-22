-- ============================================================
--  AUDITORIA · taxa de publicação x trabalhos, mês a mês
--  Só consulta: não altera nada. Rode no SQL Editor.
--  Responde: o valor no fechamento bate com a soma das taxas
--  das publicações? Sobrou taxa de publicação já excluída?
-- ============================================================

-- 1) O fechamento x a soma das taxas lançadas pelas publicações
with lancado as (
  select extract(year from taxa_data)::int  as ano,
         extract(month from taxa_data)::int as mes,
         count(*)   as publicacoes_com_taxa,
         sum(taxa)  as soma_das_publicacoes
    from public.publicacoes
   where taxa_lancada and taxa > 0 and taxa_data is not null
   group by 1, 2
)
select f.ano,
       f.ordem + 1                                   as mes,
       f.mes                                         as mes_nome,
       f.taxa_publicacao                             as no_fechamento,
       coalesce(l.soma_das_publicacoes, 0)           as soma_das_publicacoes,
       f.taxa_publicacao - coalesce(l.soma_das_publicacoes, 0) as diferenca,
       coalesce(l.publicacoes_com_taxa, 0)           as publicacoes_com_taxa
  from public.financeiro f
  left join lancado l on l.ano = f.ano and l.mes = f.ordem + 1
 where f.taxa_publicacao <> 0 or l.soma_das_publicacoes is not null
 order by f.ano, f.ordem;
-- diferenca > 0  → há taxa no fechamento sem publicação correspondente
--                  (publicação excluída sem estorno, ou lançamento manual)
-- diferenca < 0  → há publicação com taxa que não entrou no fechamento

-- 2) Quantos trabalhos e publicações por mês (o número do painel)
select to_char(criado_em at time zone 'America/Sao_Paulo', 'YYYY-MM') as mes,
       count(*) as trabalhos
  from public.trabalhos group by 1 order by 1;

select to_char(criado_em at time zone 'America/Sao_Paulo', 'YYYY-MM') as mes,
       count(*) as publicacoes
  from public.publicacoes group by 1 order by 1;

-- 3) A composição da taxa do mês, por tipo — explica saltos entre meses
select extract(year from taxa_data)::int  as ano,
       extract(month from taxa_data)::int as mes,
       tipo,
       count(*)  as qtd,
       sum(taxa) as soma
  from public.publicacoes
 where taxa_lancada and taxa > 0 and taxa_data is not null
 group by 1, 2, 3
 order by 1, 2, soma desc;

-- 4) Trabalhos sem publicação com o mesmo título (avulsos ou publicação excluída)
select t.titulo, t.tipo, t.criado_em
  from public.trabalhos t
  left join public.publicacoes p on p.tema = t.titulo and p.tipo = t.tipo
 where p.id is null
 order by t.criado_em desc;
