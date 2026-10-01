-- Nome, CPF e valor das vendas para as notas: tudo o que entrou no sistema depois da
-- última lista ({{CORTE}}, ver SKILL.md), SEM as vendas marcadas para não ter nota.
-- Venda marcada = a observação da publicação dela fala em "tirar nota" ou "emitir nota"
-- e cita o nome da pessoa (ex.: "não emitir nota da venda Simone Michelon").
with base as (
  select v.data,
         v.criado_em,
         v.nome,
         v.valor,
         v.tipo,
         coalesce(
           nullif(pv.cpf, ''),
           nullif((select p2.cpf from participantes p2
                    where p2.cpf <> '' and lower(trim(p2.email)) = lower(trim(v.email))
                    order by p2.criado_em desc limit 1), ''),
           nullif((select p3.cpf from participantes p3
                    where p3.cpf <> '' and lower(trim(p3.nome)) = lower(trim(v.nome))
                    order by p3.criado_em desc limit 1), '')
         ) as cpf,
         -- observação da publicação da venda: pela participação ligada e, na falta, pelo tema
         coalesce(pub.observacoes,
                  (select p4.observacoes from publicacoes p4 where p4.tema = v.tema limit 1), '') as obs_pub
    from vendas v
    left join participantes pv on pv.id = v.participante_id
    left join publicacoes pub on pub.id = pv.publicacao_id
   where v.criado_em > timestamptz '{{CORTE}}'
),
lista as (
  select * from base
   where not (obs_pub ~* '(tirar|emitir)\s+nota' and position(lower(trim(nome)) in lower(obs_pub)) > 0)
)
select dia, nome, cpf, valor, tipo from (
  select 0 as ordem, data, to_char(data, 'DD/MM') as dia, nome,
         coalesce(cpf, '>>> SEM CPF') as cpf, valor, tipo
    from lista
  union all
  select 1, null, 'TOTAL', count(*) || ' vendas', '', sum(valor), ''
    from lista
) x
 order by ordem, data, nome;
