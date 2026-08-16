-- ============================================================
--  Migração: espalhar o CPF já cadastrado para as outras
--  participações da MESMA pessoa que estão sem ele.
--
--  O CPF é um dado da pessoa, mas fica gravado em cada
--  participação. Quem foi cadastrado antes do campo existir
--  ficou com o CPF vazio; este script preenche esses casos a
--  partir de alguma participação que já tenha o número.
--
--  Só preenche o que está VAZIO — nunca sobrescreve um CPF
--  existente, nem apaga nada.
--  Rode no SQL Editor do Supabase (idempotente).
-- ============================================================

-- 1) pelo e-mail (mesma chave que o sistema usa para identificar cliente)
with fonte as (
  select distinct on (lower(trim(email)))
         lower(trim(email)) as email,
         cpf
    from public.participantes
   where cpf <> '' and trim(email) <> ''
   order by lower(trim(email)), criado_em desc   -- em caso de divergência, vale o mais recente
)
update public.participantes p
   set cpf = f.cpf
  from fonte f
 where trim(p.cpf) = ''
   and lower(trim(p.email)) = f.email;

-- 2) quem não tem e-mail: exige nome E faculdade iguais, para não misturar homônimos
with fonte as (
  select distinct on (lower(trim(nome)), lower(trim(faculdade)))
         lower(trim(nome)) as nome,
         lower(trim(faculdade)) as faculdade,
         cpf
    from public.participantes
   where cpf <> '' and trim(nome) <> '' and trim(faculdade) <> ''
   order by lower(trim(nome)), lower(trim(faculdade)), criado_em desc
)
update public.participantes p
   set cpf = f.cpf
  from fonte f
 where trim(p.cpf) = ''
   and trim(p.email) = ''
   and lower(trim(p.nome)) = f.nome
   and lower(trim(p.faculdade)) = f.faculdade;

-- confere o resultado
select count(*) filter (where cpf <> '') as com_cpf,
       count(*) filter (where cpf =  '') as sem_cpf,
       count(*)                          as total
  from public.participantes;
