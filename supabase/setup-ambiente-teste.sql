-- ============================================================
--  PublicaMED · setup completo (schema + storage) em UM arquivo
-- ------------------------------------------------------------
--  Use para montar um projeto Supabase novo do zero — por exemplo
--  o ambiente de TESTE, separado do banco real.
--
--  Como aplicar:
--    Supabase Dashboard → SQL Editor → New query → cole tudo → Run.
--    (idempotente: pode rodar de novo sem quebrar nada)
--
--  Rode DEPOIS, no mesmo projeto, para ter o calendário editorial:
--    supabase/11-planejamento.sql  (tabelas do cronograma + a carga
--    do mês). Fica fora daqui de propósito: aquele arquivo é gerado
--    a partir de src/planejamento.js e duplicá-lo aqui sairia do ar
--    assim que o cronograma mudasse.
--
--  Depois de rodar, crie um usuário para conseguir entrar no app:
--    Authentication → Users → Add user → email + senha (marque
--    "Auto Confirm User"). Sem isso o login não passa, porque o
--    RLS abaixo só libera dados para usuário autenticado.
-- ============================================================

-- gen_random_uuid()
create extension if not exists pgcrypto;

-- ───────────────────────── FACULDADES ─────────────────────────
create table if not exists public.faculdades (
  id         uuid primary key default gen_random_uuid(),
  nome       text        not null unique,
  uf         text        not null default 'N/I',
  criado_em  timestamptz not null default now()
);

-- ───────────────────────── VENDAS ─────────────────────────────
create table if not exists public.vendas (
  id              uuid          primary key default gen_random_uuid(),
  data            date,
  nome            text          not null default '',
  email           text          not null default '',
  faculdade_id    uuid          references public.faculdades(id) on delete set null,
  uf              text          not null default 'N/I',
  tipo            text          not null default 'Outro',
  valor           numeric(10,2) not null default 0,
  tema            text          not null default '',
  participante_id uuid,
  criado_em       timestamptz   not null default now()
);
create index if not exists vendas_data_idx      on public.vendas (data);
create index if not exists vendas_email_idx     on public.vendas (lower(email));
create index if not exists vendas_uf_idx        on public.vendas (uf);
create index if not exists vendas_tipo_idx      on public.vendas (tipo);
create index if not exists vendas_faculdade_idx on public.vendas (faculdade_id);

-- ───────────────────────── PUBLICACOES ────────────────────────
create table if not exists public.publicacoes (
  id               uuid          primary key default gen_random_uuid(),
  tema             text          not null,
  tipo             text          not null default 'Artigo',
  area             text          not null default '',
  vagas            integer       not null default 6 check (vagas >= 1),
  requer_graduado  boolean       not null default false,
  taxa             numeric(10,2) not null default 0,
  taxa_lancada     boolean       not null default false,
  taxa_data        date,
  certificado_url  text          not null default '',
  fechada_em       timestamptz,                    -- vendas encerradas; nulo = ainda em venda
  criado_em        timestamptz   not null default now(),
  -- o mesmo título pode existir em tipos diferentes (capítulo × apresentação são
  -- trabalhos distintos); o que não pode é repetir o mesmo título no mesmo tipo
  unique (tema, tipo)
);

-- ───────────────────────── PARTICIPANTES ──────────────────────
create table if not exists public.participantes (
  id               uuid        primary key default gen_random_uuid(),
  publicacao_id    uuid        not null references public.publicacoes(id) on delete cascade,
  nome             text        not null default '',
  email            text        not null default '',
  faculdade        text        not null default '',
  autor_principal  boolean     not null default false,
  graduado         boolean     not null default false,
  orcid            text        not null default '',
  telefone         text        not null default '',
  criado_em        timestamptz not null default now()
);
create index if not exists participantes_pub_idx on public.participantes (publicacao_id);

-- liga venda -> participante (a venda some junto ao remover o participante)
alter table public.vendas drop constraint if exists vendas_participante_fk;
alter table public.vendas add constraint vendas_participante_fk
  foreign key (participante_id) references public.participantes(id) on delete cascade;
create index if not exists vendas_participante_idx on public.vendas (participante_id);

-- ───────────────────────── TRABALHOS ──────────────────────────
create table if not exists public.trabalhos (
  id               uuid        primary key default gen_random_uuid(),
  titulo           text        not null default '',
  tipo             text        not null default 'Artigo',
  status           text        not null default 'A fazer',
  local_publicacao text        not null default '',
  criado_em        timestamptz not null default now()
);

-- ───────────────────────── FINANCEIRO ─────────────────────────
create table if not exists public.financeiro (
  id                 uuid          primary key default gen_random_uuid(),
  ano                smallint      not null default 2025,
  mes                text          not null,
  ordem              smallint      not null default 0,
  faturamento        numeric(12,2) not null default 0,
  taxa_publicacao    numeric(12,2) not null default 0,
  custo_ads          numeric(12,2) not null default 0,
  custo_fixo         numeric(12,2) not null default 0,
  custo_extra        numeric(12,2) not null default 0,
  custo_extra_desc   text          not null default '',
  faturamento_ajuste numeric(12,2) not null default 0,
  criado_em          timestamptz   not null default now(),
  unique (ano, mes)
);
create index if not exists financeiro_ano_idx on public.financeiro (ano);

-- ───────────────────────── STORAGE (certificados) ─────────────
insert into storage.buckets (id, name, public)
  values ('certificados', 'certificados', true)
  on conflict (id) do nothing;

drop policy if exists cert_auth_all on storage.objects;
create policy cert_auth_all on storage.objects for all to authenticated
  using (bucket_id = 'certificados') with check (bucket_id = 'certificados');

-- ============================================================
--  ROW LEVEL SECURITY
--  anon (sem login) → nenhum acesso · authenticated → CRUD total
-- ============================================================
alter table public.faculdades    enable row level security;
alter table public.vendas        enable row level security;
alter table public.publicacoes   enable row level security;
alter table public.participantes enable row level security;
alter table public.trabalhos     enable row level security;
alter table public.financeiro    enable row level security;

drop policy if exists faculdades_auth_all    on public.faculdades;
drop policy if exists vendas_auth_all        on public.vendas;
drop policy if exists publicacoes_auth_all   on public.publicacoes;
drop policy if exists participantes_auth_all on public.participantes;
drop policy if exists trabalhos_auth_all     on public.trabalhos;
drop policy if exists financeiro_auth_all    on public.financeiro;

create policy faculdades_auth_all    on public.faculdades    for all to authenticated using (true) with check (true);
create policy vendas_auth_all        on public.vendas        for all to authenticated using (true) with check (true);
create policy publicacoes_auth_all   on public.publicacoes   for all to authenticated using (true) with check (true);
create policy participantes_auth_all on public.participantes for all to authenticated using (true) with check (true);
create policy trabalhos_auth_all     on public.trabalhos     for all to authenticated using (true) with check (true);
create policy financeiro_auth_all    on public.financeiro    for all to authenticated using (true) with check (true);
