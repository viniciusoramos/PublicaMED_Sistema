/* ============================================================
   Gera supabase/11-planejamento.sql a partir de src/planejamento.js.

   O cronograma nasceu como arquivo do código e passou a morar no banco.
   Este script existe para a carga inicial sair exata (sem redigitar os
   temas) e para poder regerar o SQL se o arquivo mudar antes da carga:

     npm run sql:planejamento

   O SQL é idempotente — rodar de novo não duplica nem desfaz o que já
   foi ajustado pela tela.
   ============================================================ */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { PLANEJAMENTOS } from "../src/planejamento.js";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const destino = resolve(raiz, "supabase/11-planejamento.sql");

const txt = (v) => (v == null ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const num = (v) => (v == null ? "null" : String(v));
const bool = (v) => (v == null ? "null" : v ? "true" : "false");

const cabecalho = `-- ============================================================
--  PublicaMED · planejamento editorial (cronograma) no banco
-- ------------------------------------------------------------
--  Tira o cronograma do arquivo do código e do localStorage do
--  navegador: os ajustes passam a valer para todos os usuários e
--  em qualquer dispositivo.
--
--  Como aplicar:
--    Supabase Dashboard → SQL Editor → cole este arquivo → Run.
--    (idempotente: pode rodar de novo sem duplicar nem desfazer
--     ajustes já feitos pela tela)
--
--  GERADO por scripts/gerar-sql-planejamento.mjs a partir de
--  src/planejamento.js — não edite à mão.
-- ============================================================

create extension if not exists pgcrypto;

-- ───────────────────── PLANEJAMENTOS (o mês) ─────────────────────
create table if not exists public.planejamentos (
  id         text        primary key,              -- "2026-08"
  ano        smallint    not null,
  mes        smallint    not null,                 -- 0 = janeiro
  meta       numeric(12,2) not null default 0,
  conversao  numeric(4,3)  not null default 0.8,   -- taxa usada na projeção
  nota       text        not null default '',
  criado_em  timestamptz not null default now()
);

-- ─────────────────── LANÇAMENTOS (cada dia do mês) ───────────────
create table if not exists public.planejamento_lancamentos (
  id               uuid        primary key default gen_random_uuid(),
  planejamento_id  text        not null references public.planejamentos(id) on delete cascade,
  dia              smallint    not null check (dia between 1 and 31),
  produto          text        not null default '',
  tipo             text        not null default 'Artigo',
  vagas            integer     not null default 6 check (vagas >= 1),
  preco            numeric(10,2) not null default 0,
  custo            numeric(10,2) not null default 0,
  veiculo          text        not null default '',
  taxa_por_tema    numeric(10,2),                  -- nulo = taxa lançada à mão na publicação
  exige_graduado   boolean     not null default false,
  avulso           boolean     not null default false, -- criado para segurar trabalho fora do plano
  criado_em        timestamptz not null default now(),
  unique (planejamento_id, dia)
);
create index if not exists plan_lanc_plano_idx on public.planejamento_lancamentos (planejamento_id);

-- ──────────────────── TEMAS (o que sai em cada dia) ──────────────
--  origem  'plano' = veio do planejamento do mês · 'extra' = acrescentado pela tela
--  removido  tema tirado do cronograma. É soft delete de propósito: dá para
--            restaurar, e a publicação/participantes nunca são tocados.
create table if not exists public.planejamento_temas (
  id             uuid        primary key default gen_random_uuid(),
  lancamento_id  uuid        not null references public.planejamento_lancamentos(id) on delete cascade,
  titulo         text        not null,
  areas          text        not null default '',
  taxa           numeric(10,2),                    -- tem prioridade sobre a taxa do lançamento
  exige_graduado boolean,                          -- nulo = herda do lançamento
  -- próprios do tema; nulo = herda do lançamento. É o que permite um trabalho avulso de
  -- outro tipo (ex.: capítulo num dia cujo lançamento planejado é apresentação).
  tipo           text,
  vagas          integer,
  preco          numeric(10,2),
  origem         text        not null default 'plano' check (origem in ('plano', 'extra')),
  removido       boolean     not null default false,
  ordem          smallint    not null default 0,
  criado_em      timestamptz not null default now()
);
create index if not exists plan_temas_lanc_idx on public.planejamento_temas (lancamento_id);
-- único por dia + título + TIPO: um capítulo e uma apresentação de mesmo nome no mesmo dia
-- são trabalhos distintos. O coalesce existe porque NULLs não colidem entre si em Postgres,
-- e tema vindo do plano tem tipo nulo (herda o do lançamento).
create unique index if not exists planejamento_temas_unq
  on public.planejamento_temas (lancamento_id, titulo, coalesce(tipo, ''));

-- ───────────────────────── CARGA INICIAL ─────────────────────────
`;

const rodape = `
-- ============================================================
--  ROW LEVEL SECURITY (mesmo critério das demais tabelas:
--  anon sem acesso, authenticated com CRUD completo)
-- ============================================================
alter table public.planejamentos             enable row level security;
alter table public.planejamento_lancamentos  enable row level security;
alter table public.planejamento_temas        enable row level security;

drop policy if exists planejamentos_auth_all      on public.planejamentos;
drop policy if exists plan_lancamentos_auth_all   on public.planejamento_lancamentos;
drop policy if exists plan_temas_auth_all         on public.planejamento_temas;

create policy planejamentos_auth_all    on public.planejamentos            for all to authenticated using (true) with check (true);
create policy plan_lancamentos_auth_all on public.planejamento_lancamentos for all to authenticated using (true) with check (true);
create policy plan_temas_auth_all       on public.planejamento_temas       for all to authenticated using (true) with check (true);
`;

const partes = [cabecalho];
let nTemas = 0;

for (const p of PLANEJAMENTOS) {
  partes.push(`
-- ${p.id}
insert into public.planejamentos (id, ano, mes, meta, conversao, nota) values
  (${txt(p.id)}, ${num(p.ano)}, ${num(p.mes)}, ${num(p.meta)}, ${num(p.conversao)}, ${txt(p.nota || "")})
on conflict (id) do nothing;
`);
  for (const l of p.lancamentos) {
    partes.push(`insert into public.planejamento_lancamentos
  (planejamento_id, dia, produto, tipo, vagas, preco, custo, veiculo, taxa_por_tema, exige_graduado) values
  (${txt(p.id)}, ${num(l.dia)}, ${txt(l.produto)}, ${txt(l.tipo)}, ${num(l.vagas)}, ${num(l.preco)}, ${num(l.custo || 0)}, ${txt(l.veiculo || "")}, ${num(l.taxaPorTema)}, ${bool(!!l.exigeGraduado)})
on conflict (planejamento_id, dia) do nothing;
`);
    l.temas.forEach((t, i) => {
      nTemas += 1;
      // o lançamento acabou de ser inserido (ou já existia): buscamos o id por plano+dia
      partes.push(`insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, ${txt(t.titulo)}, ${txt(t.areas || "")}, ${num(t.taxa)}, ${bool(t.exigeGraduado == null ? null : t.exigeGraduado)}, ${i}
  from public.planejamento_lancamentos l
 where l.planejamento_id = ${txt(p.id)} and l.dia = ${num(l.dia)}
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
`);
    });
  }
}

partes.push(rodape);
writeFileSync(destino, partes.join(""), "utf8");

const nLanc = PLANEJAMENTOS.reduce((a, p) => a + p.lancamentos.length, 0);
console.log(`supabase/11-planejamento.sql gerado · ${PLANEJAMENTOS.length} planejamento(s), ${nLanc} lançamentos, ${nTemas} temas`);
