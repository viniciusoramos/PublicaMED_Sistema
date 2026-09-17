-- ============================================================
--  Campanha Lattes · quem chegou a 4+ compras desde o ultimo envio
-- ------------------------------------------------------------
--  TROQUE A DATA ABAIXO pela data do ultimo envio (esta na memoria
--  campanha-lattes-4-compras.md). Quem cruzou DEPOIS dela e novo.
-- ============================================================
with corte(ultimo_envio) as (
  values (date '{{CORTE}}')
),
acento(de, para) as (
  values ('áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ',
          'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC')
),
-- numera as compras de cada cliente na ordem em que aconteceram.
-- A chave do cliente e a mesma do painel: e-mail, ou nome quando nao ha e-mail.
v as (
  select coalesce(nullif(lower(trim(email)), ''), lower(trim(nome))) as chave,
         nome, email, data, valor,
         row_number() over (
           partition by coalesce(nullif(lower(trim(email)), ''), lower(trim(nome)))
           order by data, criado_em
         ) as n
    from public.vendas
   where data is not null
     and coalesce(nullif(lower(trim(email)), ''), lower(trim(nome))) <> ''
),
-- a 4a compra e o momento exato em que a pessoa cruzou a linha
cruzou as (
  select chave, data as dia_da_quarta from v where n = 4
),
total as (
  select chave, max(nome) as nome, max(nullif(trim(email), '')) as email,
         count(*) as compras, sum(valor) as gasto
    from v group by chave
)
select t.nome,
       to_char(c.dia_da_quarta, 'DD/MM/YYYY') as chegou_a_4_em,
       t.compras,
       to_char(t.gasto, 'FM999G999D00')       as total_gasto,
       -- telefone mora em participantes, nao na venda: casa por e-mail e,
       -- na falta dele, pelo nome sem acento
       coalesce((
         select p.telefone from public.participantes p cross join acento a
          where nullif(trim(p.telefone), '') is not null
            and (lower(trim(p.email)) = lower(coalesce(t.email, '~'))
                 or lower(regexp_replace(translate(trim(p.nome), a.de, a.para), '\s+', ' ', 'g'))
                  = lower(regexp_replace(translate(trim(t.nome), a.de, a.para), '\s+', ' ', 'g')))
          order by p.criado_em desc limit 1
       ), '>>> SEM TELEFONE') as telefone,
       coalesce(t.email, '') as email
  from cruzou c
  join total  t on t.chave = c.chave
 cross join corte
 where c.dia_da_quarta > corte.ultimo_envio
 order by c.dia_da_quarta desc, t.compras desc;
