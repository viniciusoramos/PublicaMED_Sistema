-- ============================================================
--  Contatos das vendas SEM origem, para cruzar com a lista de membros
--  dos grupos. Devolve uma linha por VENDA, com o telefone e o nome de
--  quem comprou.
--
--  Só as sem origem porque o cruzamento nunca sobrescreve origem já
--  gravada: as outras só pesariam no arquivo. Serve tanto para pegar as
--  vendas novas quanto para reprocessar tudo depois de uma leitura nova
--  dos grupos (as antigas sem origem entram também).
--
--  O telefone não existe na venda: vem do participante ligado a ela e,
--  na falta do vínculo, do cadastro da mesma pessoa em outra participação.
-- ============================================================
select v.id,
       to_char(v.data, 'YYYY-MM-DD')              as data,
       v.nome,
       coalesce(nullif(v.origem, ''), '')         as origem_atual,
       coalesce(
         nullif(trim(pv.telefone), ''),
         -- mesma pessoa em outra participação, casada por e-mail
         (select nullif(trim(p2.telefone), '') from public.participantes p2
           where trim(p2.telefone) <> '' and trim(v.email) <> ''
             and lower(trim(p2.email)) = lower(trim(v.email))
           order by p2.criado_em desc limit 1),
         -- último recurso: pelo nome
         (select nullif(trim(p3.telefone), '') from public.participantes p3
           where trim(p3.telefone) <> ''
             and lower(trim(p3.nome)) = lower(trim(v.nome))
           order by p3.criado_em desc limit 1),
         ''
       )                                          as telefone,
       -- quando a venda entrou no sistema: separa as novas das que já não casaram antes
       to_char(v.criado_em at time zone 'America/Sao_Paulo', 'YYYY-MM-DD HH24:MI') as criada_em
  from public.vendas v
  left join public.participantes pv on pv.id = v.participante_id
 where v.origem = ''
 order by v.criado_em desc;
