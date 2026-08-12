-- ============================================================
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

-- 2026-08
insert into public.planejamentos (id, ano, mes, meta, conversao, nota) values
  ('2026-08', 2026, 7, 38000, 0.8, 'Artigos PSU sempre em Clínica Médica e Cirurgia Geral (eixo reabilitação, Fisioterapia Brasil) · apresentação em congresso com 10 autores · formatos alternados sem dois artigos em sequência · PSU no início de cada quinzena (01 e 17) · temas do banco oficial, sem repetir julho.')
on conflict (id) do nothing;
insert into public.planejamento_lancamentos
  (planejamento_id, dia, produto, tipo, vagas, preco, custo, veiculo, taxa_por_tema, exige_graduado) values
  ('2026-08', 1, 'Artigo PSU', 'Artigo PSU', 4, 600, 1650, 'Fisioterapia Brasil · Qualis B1 · LILACS', null, false)
on conflict (planejamento_id, dia) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Fisioterapia no Paciente Vítima de Trauma Grave: Da UTI ao Retorno às Atividades', 'Cirurgia Geral · Trauma · Fisioterapia', null, null, 0
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 1
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Fibromialgia: Exercício Físico, Controle da Dor e Qualidade de Vida', 'Clínica Médica · Reumatologia · Fisioterapia', null, null, 1
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 1
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Pé Diabético: Fisioterapia, Cuidado da Ferida e Prevenção da Amputação', 'Cirurgia Geral · Endocrinologia · Fisioterapia', null, null, 2
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 1
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_lancamentos
  (planejamento_id, dia, produto, tipo, vagas, preco, custo, veiculo, taxa_por_tema, exige_graduado) values
  ('2026-08', 4, 'Capítulo de livro', 'Capítulo', 7, 160, 600, 'Válido no PSU', null, false)
on conflict (planejamento_id, dia) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Pancreatite Aguda Grave: Quando a Necrose Exige Intervenção e Qual o Momento Certo de Operar', 'Cirurgia Geral · Medicina Intensiva', null, null, 0
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 4
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Dor Torácica na Emergência: Estratificação de Risco, Exames Necessários e Quando Liberar o Paciente', 'Clínica Médica · Cardiologia · Emergência', null, null, 1
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 4
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Febre no Lactente: Sinais de Gravidade, Exames Necessários e Decisão de Internar', 'Pediatria · Infectologia · Emergência', null, null, 2
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 4
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_lancamentos
  (planejamento_id, dia, produto, tipo, vagas, preco, custo, veiculo, taxa_por_tema, exige_graduado) values
  ('2026-08', 7, 'Artigo internacional', 'Artigo Internacional', 5, 220, 960, 'International Health Sciences Review', null, false)
on conflict (planejamento_id, dia) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Câncer Gástrico Precoce: Ressecção Endoscópica Comparada à Gastrectomia e Sobrevida', 'Cirurgia Geral · Estômago · Oncologia', null, null, 0
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 7
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Análogos de GLP-1 em Pacientes com Diabetes Tipo 2 e Doença Renal Crônica: Benefícios além do Controle da Glicemia', 'Clínica Médica · Endocrinologia · Nefrologia', null, null, 1
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 7
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Dermatite Atópica na Prática Clínica: Controle dos Sintomas, Prevenção de Crises e Impacto na Qualidade de Vida', 'Dermatologia · Alergologia · Pediatria', null, null, 2
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 7
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_lancamentos
  (planejamento_id, dia, produto, tipo, vagas, preco, custo, veiculo, taxa_por_tema, exige_graduado) values
  ('2026-08', 10, 'Apresentação em congresso', 'Apresentação', 10, 100, 150, 'Anais do Congresso', null, false)
on conflict (planejamento_id, dia) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Dor Abdominal no Pronto-Socorro: Quando o Caso Deixa de Ser Clínico e Passa a Ser Cirúrgico', 'Cirurgia Geral · Clínica Médica · Emergência', null, null, 0
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 10
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Ataque Isquêmico Transitório: Diagnóstico Precoce e Prevenção do Acidente Vascular Cerebral', 'Cardiologia · Clínica Médica · Emergência', null, null, 1
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 10
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'AVC nas Primeiras Horas: Reconhecimento, Critérios para Trombólise e Decisão de Transferir', 'Neurologia · Emergência', null, null, 2
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 10
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_lancamentos
  (planejamento_id, dia, produto, tipo, vagas, preco, custo, veiculo, taxa_por_tema, exige_graduado) values
  ('2026-08', 13, 'Artigo Qualis A3', 'Artigo Qualis A3', 5, 230, 900, 'Revista REASE', null, false)
on conflict (planejamento_id, dia) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Colangite Aguda Grave: Momento da Drenagem Biliar e Mortalidade Hospitalar', 'Cirurgia Geral · Hepatobiliar · Emergência', null, null, 0
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 13
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Insuficiência Cardíaca com Fração de Ejeção Preservada: Diagnóstico Subestimado e Avanços Terapêuticos Recentes', 'Clínica Médica · Cardiologia', null, null, 1
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 13
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Depressão Pós-Parto: Rastreamento no Pré-Natal e Desfechos no Desenvolvimento do Bebê', 'Psiquiatria · Obstetrícia · Pediatria', null, null, 2
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 13
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_lancamentos
  (planejamento_id, dia, produto, tipo, vagas, preco, custo, veiculo, taxa_por_tema, exige_graduado) values
  ('2026-08', 15, 'Capítulo de livro', 'Capítulo', 7, 160, 600, 'Válido no PSU', null, false)
on conflict (planejamento_id, dia) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Câncer de Cólon Obstruído: Cirurgia em Um ou Dois Tempos e o Lugar da Prótese Endoscópica', 'Cirurgia Geral · Coloproctologia · Oncologia', null, null, 0
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 15
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_lancamentos
  (planejamento_id, dia, produto, tipo, vagas, preco, custo, veiculo, taxa_por_tema, exige_graduado) values
  ('2026-08', 17, 'Artigo PSU', 'Artigo PSU', 4, 600, 1650, 'Fisioterapia Brasil · Qualis B1 · LILACS', null, false)
on conflict (planejamento_id, dia) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Cansaço Durante o Tratamento do Câncer: Exercício Físico, Força e Continuidade da Quimioterapia', 'Clínica Médica · Oncologia · Fisioterapia', null, null, 0
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 17
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Recuperação Precoce após Cirurgia do Intestino: Saída do Leito, Retorno da Função Intestinal e Alta Hospitalar', 'Cirurgia Geral · Coloproctologia · Fisioterapia', null, null, 1
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 17
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_lancamentos
  (planejamento_id, dia, produto, tipo, vagas, preco, custo, veiculo, taxa_por_tema, exige_graduado) values
  ('2026-08', 19, 'Artigo Qualis A3', 'Artigo Qualis A3', 5, 230, 900, 'Revista REASE', null, false)
on conflict (planejamento_id, dia) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Cirurgia da Tireoide: Lesão do Nervo da Voz e Qualidade de Vida no Pós-Operatório', 'Cirurgia Geral · Endocrinologia', null, null, 0
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 19
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Resistência Bacteriana em Infecções Hospitalares: Panorama Atual e Consequências Clínicas', 'Clínica Médica · Infectologia', null, null, 1
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 19
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Ablação por Cateter e Antiarrítmicos na Fibrilação Atrial: Controle do Ritmo e Qualidade de Vida', 'Cardiologia · Eletrofisiologia', null, null, 2
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 19
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_lancamentos
  (planejamento_id, dia, produto, tipo, vagas, preco, custo, veiculo, taxa_por_tema, exige_graduado) values
  ('2026-08', 21, 'Artigo internacional', 'Artigo Internacional', 5, 220, 960, 'International Health Sciences Review', null, false)
on conflict (planejamento_id, dia) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Laparotomia de Controle de Danos no Trauma Abdominal Grave: Momento do Fechamento da Parede e Complicações Tardias', 'Cirurgia Geral · Trauma · Emergência', null, null, 0
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 21
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Nefrite Lúpica: Novas Terapias e Preservação da Função Renal', 'Clínica Médica · Reumatologia · Nefrologia', null, null, 1
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 21
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Meningite Bacteriana no Adulto: Reconhecimento, Antibioticoterapia Precoce e Sequelas Neurológicas', 'Neurologia · Infectologia · Emergência', null, null, 2
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 21
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_lancamentos
  (planejamento_id, dia, produto, tipo, vagas, preco, custo, veiculo, taxa_por_tema, exige_graduado) values
  ('2026-08', 24, 'Capítulo de livro', 'Capítulo', 7, 160, 600, 'Válido no PSU', null, false)
on conflict (planejamento_id, dia) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Coledocolitíase e Colangite Aguda: Ordem entre Drenagem Endoscópica e Cirurgia', 'Cirurgia Geral · Gastroenterologia', null, null, 0
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 24
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Pressão Alta na Gestação: Diferenciar a Pré-Eclâmpsia, Definir a Conduta e Decidir o Momento do Parto', 'Obstetrícia · Clínica Médica', null, null, 1
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 24
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_lancamentos
  (planejamento_id, dia, produto, tipo, vagas, preco, custo, veiculo, taxa_por_tema, exige_graduado) values
  ('2026-08', 27, 'Apresentação em congresso', 'Apresentação', 10, 100, 150, 'Anais do Congresso', null, false)
on conflict (planejamento_id, dia) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Trauma Abdominal Fechado: Tratamento Conservador ou Laparotomia Imediata', 'Cirurgia Geral · Trauma · Emergência', null, null, 0
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 27
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Hipertensão Portal e Varizes Esofágicas: Do Controle do Sangramento à Indicação Cirúrgica', 'Cirurgia Geral · Hepatologia', null, null, 1
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 27
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Diarreia e Desidratação na Criança: Avaliação da Gravidade, Reidratação e Critérios de Internação', 'Pediatria · Gastroenterologia · Emergência', null, null, 2
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 27
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_lancamentos
  (planejamento_id, dia, produto, tipo, vagas, preco, custo, veiculo, taxa_por_tema, exige_graduado) values
  ('2026-08', 30, 'Artigo Qualis A3', 'Artigo Qualis A3', 5, 230, 900, 'Revista REASE', null, false)
on conflict (planejamento_id, dia) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Aneurisma de Aorta Abdominal: Mortalidade Hospitalar e Fatores Associados ao Desfecho', 'Cirurgia Geral · Vascular · Emergência', null, null, 0
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 30
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Transtorno de Ansiedade Generalizada: Tratamento Farmacológico Comparado à Psicoterapia', 'Psiquiatria · Clínica Médica · Farmacologia', null, null, 1
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-08' and l.dia = 30
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;

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
