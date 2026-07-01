-- ============================================================
--  PublicaMED · schema Supabase (PostgreSQL)
-- ------------------------------------------------------------
--  Banco central, multiusuário, uma linha por registro.
--  Substitui o armazenamento em bloco único (window.storage /
--  localStorage) por tabelas normalizadas com CRUD por linha.
--
--  Como aplicar:
--    Supabase Dashboard → SQL Editor → cole este arquivo → Run.
--    (idempotente: pode rodar de novo sem quebrar)
-- ============================================================

-- gen_random_uuid()
create extension if not exists pgcrypto;

-- ───────────────────────── FACULDADES ─────────────────────────
-- As 122 instituições canônicas (SEED.facs + SEED.facUF).
create table if not exists public.faculdades (
  id         uuid primary key default gen_random_uuid(),
  nome       text        not null unique,
  uf         text        not null default 'N/I',
  criado_em  timestamptz not null default now()
);

-- ───────────────────────── VENDAS ─────────────────────────────
-- Cada venda. O estado (uf) é resolvido pela faculdade na origem,
-- mas guardamos a coluna uf desnormalizada para vendas sem
-- faculdade (exterior / não informada) e para consultas rápidas.
create table if not exists public.vendas (
  id            uuid          primary key default gen_random_uuid(),
  data          date,                                    -- pode ser nula (algumas vendas sem data)
  nome          text          not null default '',
  email         text          not null default '',
  faculdade_id  uuid          references public.faculdades(id) on delete set null,
  uf            text          not null default 'N/I',
  tipo          text          not null default 'Outro',
  valor         numeric(10,2) not null default 0,
  tema          text          not null default '',
  participante_id uuid,
  criado_em     timestamptz   not null default now()
);
create index if not exists vendas_data_idx      on public.vendas (data);
create index if not exists vendas_email_idx     on public.vendas (lower(email));
create index if not exists vendas_uf_idx        on public.vendas (uf);
create index if not exists vendas_tipo_idx      on public.vendas (tipo);
create index if not exists vendas_faculdade_idx on public.vendas (faculdade_id);

-- ───────────────────────── PUBLICACOES ────────────────────────
-- Controle de vagas por publicação (aba "Publicações e vagas").
create table if not exists public.publicacoes (
  id               uuid        primary key default gen_random_uuid(),
  tema             text        not null unique,
  tipo             text        not null default 'Artigo',
  area             text        not null default '',
  vagas            integer     not null default 6 check (vagas >= 1),
  requer_graduado  boolean     not null default false,
  taxa             numeric(10,2) not null default 0,
  taxa_lancada     boolean     not null default false,
  certificado_url  text        not null default '',
  criado_em        timestamptz not null default now()
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
-- Controle de produção (aba "Trabalhos"). Ausente do "schema
-- mínimo" do CONTEXTO, incluído para não perder a persistência
-- dessa aba (status: A fazer / Aguardando / Concluído / Emitido).
create table if not exists public.trabalhos (
  id         uuid        primary key default gen_random_uuid(),
  titulo     text        not null default '',
  tipo       text        not null default 'Artigo',
  status     text        not null default 'A fazer',
  local_publicacao text  not null default '',
  criado_em  timestamptz not null default now()
);

-- ───────────────────────── FINANCEIRO ─────────────────────────
-- Fechamento mês a mês (12 linhas). mes é único; ordem garante
-- a sequência Jan→Dez independente de ordenação alfabética.
create table if not exists public.financeiro (
  id               uuid          primary key default gen_random_uuid(),
  ano              smallint      not null default 2025,
  mes              text          not null,
  ordem            smallint      not null default 0,
  faturamento      numeric(12,2) not null default 0,
  taxa_publicacao  numeric(12,2) not null default 0,
  custo_ads        numeric(12,2) not null default 0,
  custo_fixo       numeric(12,2) not null default 0,
  custo_extra      numeric(12,2) not null default 0,
  custo_extra_desc text          not null default '',
  faturamento_ajuste numeric(12,2) not null default 0,
  criado_em        timestamptz   not null default now(),
  unique (ano, mes)
);

-- ============================================================
--  ROW LEVEL SECURITY
--  Uso interno: qualquer usuário autenticado tem acesso total.
--  - anon  (chave pública sem login) → NENHUM acesso
--  - authenticated (após login)      → CRUD completo
--  - service_role (import script)    → ignora RLS (bypass)
--  Refinar por papel depois (ex.: restringir quem vê financeiro).
-- ============================================================
alter table public.faculdades    enable row level security;
alter table public.vendas        enable row level security;
alter table public.publicacoes   enable row level security;
alter table public.participantes enable row level security;
alter table public.trabalhos     enable row level security;
alter table public.financeiro    enable row level security;

drop policy if exists faculdades_auth_all    on public.faculdades;
drop policy if exists vendas_auth_all         on public.vendas;
drop policy if exists publicacoes_auth_all    on public.publicacoes;
drop policy if exists participantes_auth_all   on public.participantes;
drop policy if exists trabalhos_auth_all       on public.trabalhos;
drop policy if exists financeiro_auth_all      on public.financeiro;

create policy faculdades_auth_all    on public.faculdades    for all to authenticated using (true) with check (true);
create policy vendas_auth_all        on public.vendas        for all to authenticated using (true) with check (true);
create policy publicacoes_auth_all   on public.publicacoes   for all to authenticated using (true) with check (true);
create policy participantes_auth_all on public.participantes for all to authenticated using (true) with check (true);
create policy trabalhos_auth_all     on public.trabalhos     for all to authenticated using (true) with check (true);
create policy financeiro_auth_all    on public.financeiro    for all to authenticated using (true) with check (true);
