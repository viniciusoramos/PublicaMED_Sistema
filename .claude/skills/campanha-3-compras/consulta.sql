-- ============================================================
--  Campanha 3+ compras · quem chegou a 3a compra depois do corte
--  e nunca comprou a organizacao do Lattes
-- ------------------------------------------------------------
--  TROQUE {{CORTE}} pelo ultimo corte (esta no SKILL.md, AAAA-MM-DD).
--  Vai so ate ontem: quem cruzou hoje entra na proxima rodada, e
--  assim o novo corte e sempre a vespera do dia em que isto rodou.
-- ============================================================
with corte(ultimo, hoje) as (
  values (date '{{CORTE}}', (now() at time zone 'America/Sao_Paulo')::date)
),
acento(de, para) as (
  values ('áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ',
          'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC')
),
-- chave do cliente igual a do painel: e-mail, ou nome quando nao ha e-mail
base as (
  select coalesce(nullif(lower(trim(v.email)), ''), lower(trim(v.nome))) as chave,
         lower(regexp_replace(translate(trim(v.nome), a.de, a.para), '\s+', ' ', 'g')) as nome_n,
         v.nome, v.email, v.data, v.valor, v.criado_em,
         lower(translate(v.tipo || ' ' || v.tema, a.de, a.para)) like '%lattes%' as eh_lattes
    from public.vendas v cross join acento a
),
-- quem ja comprou o Lattes, por chave e por nome
lattes as (
  select chave, nome_n from base where eh_lattes
),
-- so trabalho conta: o Lattes fica fora da contagem
v as (
  select chave, nome, email, data, valor,
         row_number() over (partition by chave order by data, criado_em) as n
    from base
   where not eh_lattes and data is not null and chave <> ''
),
cruzou as (
  select chave, data as dia_da_terceira from v where n = 3
),
total as (
  select chave, max(nome) as nome, max(nullif(trim(email), '')) as email,
         count(*) as compras, sum(valor) as gasto
    from v group by chave
)
select t.nome,
       to_char(c.dia_da_terceira, 'DD/MM/YYYY') as chegou_a_3_em,
       t.compras,
       to_char(t.gasto, 'FM999G999D00')         as total_gasto,
       -- telefone mora em participantes, nao na venda: casa por e-mail e,
       -- na falta dele, pelo nome sem acento
       coalesce((
         select p.telefone from public.participantes p cross join acento a2
          where nullif(trim(p.telefone), '') is not null
            and (lower(trim(p.email)) = lower(coalesce(t.email, '~'))
                 or lower(regexp_replace(translate(trim(p.nome), a2.de, a2.para), '\s+', ' ', 'g'))
                  = lower(regexp_replace(translate(trim(t.nome), a2.de, a2.para), '\s+', ' ', 'g')))
          order by p.criado_em desc limit 1
       ), '>>> SEM TELEFONE') as telefone,
       coalesce(t.email, '') as email
  from cruzou c
  join total  t on t.chave = c.chave
 cross join corte
 cross join acento a
 where c.dia_da_terceira > corte.ultimo
   and c.dia_da_terceira < corte.hoje
   and not exists (
         select 1 from lattes l
          where l.chave = c.chave
             or l.nome_n = lower(regexp_replace(translate(trim(t.nome), a.de, a.para), '\s+', ' ', 'g')))
 order by c.dia_da_terceira desc, t.compras desc;
