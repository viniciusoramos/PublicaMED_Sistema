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

-- 2026-09
insert into public.planejamentos (id, ano, mes, meta, conversao, nota) values
  ('2026-09', 2026, 8, 55000, 0.85, 'Um tipo de publicação por lançamento, sem repetir tipo em lançamentos vizinhos · PSU nos dias 01, 10 e 19, de nove em nove dias, o último dentro do limite do dia 20 para o certificado de 30 dias chegar em outubro · PSU sempre em Clínica Médica ou Cirurgia Geral com eixo de fisioterapia (exigência da Fisioterapia Brasil) e sem repetir área entre os dois blocos grandes · ticket alto nos primeiros 20 dias e prazo curto no fim do mês, como janela de urgência para quem entrega currículo em outubro · 07/09 é feriado e não recebe lançamento · nenhum tema repete o banco de 261 títulos já publicados.')
on conflict (id) do nothing;
insert into public.planejamento_lancamentos
  (planejamento_id, dia, produto, tipo, vagas, preco, custo, veiculo, taxa_por_tema, exige_graduado) values
  ('2026-09', 1, 'Artigo PSU', 'Artigo PSU', 4, 600, 2200, 'Fisioterapia Brasil · Qualis B2 · LILACS · certificado em 30 dias', null, false)
on conflict (planejamento_id, dia) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Reabilitação Funcional Após Cirurgia Bariátrica: Preservação de Massa Magra e Recuperação da Capacidade Física no Pós-Operatório', 'Cirurgia Geral · Cirurgia Bariátrica · Fisioterapia', null, null, 0
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 1
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Fraturas de Arcos Costais no Trauma Torácico: Fisioterapia Respiratória, Controle da Dor e Prevenção de Complicações Pulmonares', 'Cirurgia Geral · Trauma · Fisioterapia', null, null, 1
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 1
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Mobilização Precoce na Sepse em Terapia Intensiva: Critérios de Segurança e Desfechos Funcionais na Alta e no Seguimento', 'Clínica Médica · Medicina Intensiva · Fisioterapia', null, null, 2
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 1
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Sarcopenia no Idoso Hospitalizado: Reconhecimento Precoce, Exercício Resistido e Desfechos na Alta', 'Clínica Médica · Geriatria · Fisioterapia', null, null, 3
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 1
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_lancamentos
  (planejamento_id, dia, produto, tipo, vagas, preco, custo, veiculo, taxa_por_tema, exige_graduado) values
  ('2026-09', 3, 'Capítulo de livro', 'Capítulo', 7, 160, 800, 'ISBN · válido em HCPA e FELUMA · certificado em 7 dias', null, false)
on conflict (planejamento_id, dia) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Icterícia Neonatal: Tomada de Decisão entre Fototerapia e Exsanguineotransfusão', 'Pediatria · Neonatologia', null, null, 0
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 3
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Hipotireoidismo Subclínico: Tomada de Decisão sobre o Momento de Iniciar Levotiroxina', 'Clínica Médica · Endocrinologia', null, null, 1
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 3
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Sangramento Uterino Anormal: Tomada de Decisão entre Tratamento Clínico, Ablação Endometrial e Histerectomia', 'Ginecologia · Cirurgia Geral', null, null, 2
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 3
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Náusea e Vômito no Pós-Operatório: Tomada de Decisão na Profilaxia e Escolha do Esquema Antiemético', 'Anestesiologia · Cirurgia Geral', null, null, 3
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 3
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_lancamentos
  (planejamento_id, dia, produto, tipo, vagas, preco, custo, veiculo, taxa_por_tema, exige_graduado) values
  ('2026-09', 5, 'Artigo internacional', 'Artigo Internacional', 5, 220, 960, 'International Health Sciences Review · certificado em 7 dias', null, false)
on conflict (planejamento_id, dia) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Vertigem na Emergência: Diferenciação entre Causas Periféricas e Centrais e Conduta Inicial', 'Otorrinolaringologia · Neurologia · Emergência', null, null, 0
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 5
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Epilepsia Refratária: Critérios de Definição e Indicação de Tratamento Cirúrgico', 'Neurologia · Clínica Médica', null, null, 1
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 5
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Cardiomiopatia Hipertrófica: Rastreamento Familiar, Estratificação de Risco de Morte Súbita e Conduta', 'Cardiologia · Clínica Médica', null, null, 2
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 5
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_lancamentos
  (planejamento_id, dia, produto, tipo, vagas, preco, custo, veiculo, taxa_por_tema, exige_graduado) values
  ('2026-09', 8, 'Capítulo de livro', 'Capítulo', 7, 160, 800, 'ISBN · válido em HCPA e FELUMA · certificado em 7 dias', null, false)
on conflict (planejamento_id, dia) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Síncope na Emergência: Tomada de Decisão entre Investigação Ambulatorial e Internação', 'Clínica Médica · Cardiologia · Emergência', null, null, 0
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 8
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Infecção do Trato Urinário na Criança: Tomada de Decisão sobre Investigação por Imagem e Prevenção de Cicatriz Renal', 'Pediatria · Nefrologia', null, null, 1
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 8
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Lombalgia Crônica: Tomada de Decisão sobre Investigação por Imagem e Encaminhamento Cirúrgico', 'Ortopedia · Clínica Médica', null, null, 2
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 8
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Cirrose Hepática Descompensada: Tomada de Decisão no Manejo das Complicações e no Encaminhamento para Transplante', 'Clínica Médica · Gastroenterologia', null, null, 3
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 8
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_lancamentos
  (planejamento_id, dia, produto, tipo, vagas, preco, custo, veiculo, taxa_por_tema, exige_graduado) values
  ('2026-09', 10, 'Artigo PSU', 'Artigo PSU', 4, 600, 2200, 'Fisioterapia Brasil · Qualis B2 · LILACS · certificado em 30 dias', null, false)
on conflict (planejamento_id, dia) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Reabilitação do Paciente Grande Queimado: Prevenção de Contraturas Cicatriciais e Retorno à Funcionalidade', 'Cirurgia Geral · Queimados · Fisioterapia', null, null, 0
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 10
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Osteoartrite de Joelho: Exercício Terapêutico Comparado à Indicação de Artroplastia', 'Clínica Médica · Reumatologia · Fisioterapia', null, null, 1
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 10
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Exercício Intradialítico na Doença Renal Crônica: Capacidade Funcional e Adesão ao Tratamento', 'Clínica Médica · Nefrologia · Fisioterapia', null, null, 2
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 10
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Amputação de Membro Inferior por Doença Arterial: Reabilitação Protética e Retorno à Marcha', 'Cirurgia Geral · Cirurgia Vascular · Fisioterapia', null, null, 3
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 10
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_lancamentos
  (planejamento_id, dia, produto, tipo, vagas, preco, custo, veiculo, taxa_por_tema, exige_graduado) values
  ('2026-09', 12, 'Apresentação em congresso', 'Apresentação', 10, 100, 150, 'Anais do Congresso · certificado em 15 dias', null, false)
on conflict (planejamento_id, dia) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Intoxicação Exógena no Pronto-Socorro: Reconhecimento Precoce e Conduta Inicial', 'Clínica Médica · Emergência · Toxicologia', null, null, 0
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 12
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Constipação Funcional na Infância: Reconhecimento, Tratamento e Prevenção de Recorrência', 'Pediatria · Gastroenterologia', null, null, 1
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 12
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Trabalho de Parto Prematuro: Critérios de Tocólise e Corticoterapia Antenatal', 'Obstetrícia · Emergência', null, null, 2
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 12
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_lancamentos
  (planejamento_id, dia, produto, tipo, vagas, preco, custo, veiculo, taxa_por_tema, exige_graduado) values
  ('2026-09', 15, 'Artigo internacional', 'Artigo Internacional', 5, 220, 1280, 'International Health Sciences Review · certificado em 7 dias', null, false)
on conflict (planejamento_id, dia) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Estenose Aórtica Grave: Troca Valvar Cirúrgica Comparada ao Implante Transcateter e Desfechos a Longo Prazo', 'Cirurgia Cardiovascular · Cardiologia', null, null, 0
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 15
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Degeneração Macular Relacionada à Idade: Terapia Anti-VEGF e Preservação da Autonomia do Idoso', 'Oftalmologia · Geriatria', null, null, 1
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 15
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Anafilaxia na Criança: Reconhecimento, Uso da Adrenalina e Prevenção de Recorrência', 'Pediatria · Alergologia · Emergência', null, null, 2
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 15
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Tromboembolismo Pulmonar de Alto Risco: Estratificação e Critérios para Trombólise', 'Clínica Médica · Pneumologia · Emergência', null, null, 3
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 15
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_lancamentos
  (planejamento_id, dia, produto, tipo, vagas, preco, custo, veiculo, taxa_por_tema, exige_graduado) values
  ('2026-09', 17, 'Capítulo de livro', 'Capítulo', 7, 160, 800, 'ISBN · válido em HCPA e FELUMA · certificado em 7 dias', null, false)
on conflict (planejamento_id, dia) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Bronquiolite Viral Aguda: Tomada de Decisão sobre Suporte Ventilatório e Critérios de Internação', 'Pediatria · Pneumologia', null, null, 0
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 17
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Fratura de Fêmur no Idoso: Tomada de Decisão sobre o Momento da Cirurgia e Impacto na Mortalidade', 'Ortopedia · Geriatria', null, null, 1
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 17
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Primeiro Episódio Psicótico: Tomada de Decisão no Encaminhamento Precoce e Impacto da Duração da Psicose Não Tratada', 'Psiquiatria · Clínica Médica', null, null, 2
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 17
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Gestação Ectópica: Tomada de Decisão entre Tratamento com Metotrexato e Abordagem Cirúrgica', 'Ginecologia · Obstetrícia · Cirurgia Geral', null, null, 3
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 17
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_lancamentos
  (planejamento_id, dia, produto, tipo, vagas, preco, custo, veiculo, taxa_por_tema, exige_graduado) values
  ('2026-09', 19, 'Artigo PSU · última chamada', 'Artigo PSU', 4, 600, 550, 'Fisioterapia Brasil · Qualis B2 · LILACS · certificado em 30 dias', null, false)
on conflict (planejamento_id, dia) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Reabilitação Após Cirurgia Cardíaca: Mobilização Precoce, Função Pulmonar e Tempo de Internação', 'Cirurgia Cardiovascular · Clínica Médica · Fisioterapia', null, null, 0
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 19
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_lancamentos
  (planejamento_id, dia, produto, tipo, vagas, preco, custo, veiculo, taxa_por_tema, exige_graduado) values
  ('2026-09', 22, 'Artigo Qualis A3', 'Artigo Qualis A3', 5, 230, 1200, 'Revista REASE · certificado em 20 dias', null, false)
on conflict (planejamento_id, dia) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Fechamento de Ostomia Intestinal: Fatores Associados ao Adiamento e Impacto na Qualidade de Vida do Paciente', 'Cirurgia Geral · Coloproctologia', null, null, 0
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 22
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Carcinoma Espinocelular Cutâneo: Fatores de Risco, Reconhecimento Precoce e Desfechos após Tratamento', 'Dermatologia · Oncologia', null, null, 1
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 22
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Cefaleia na Emergência: Reconhecimento de Sinais de Alarme e Critérios para Neuroimagem', 'Clínica Médica · Neurologia · Emergência', null, null, 2
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 22
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Síndrome dos Ovários Policísticos: Repercussões Metabólicas e Impacto na Fertilidade', 'Ginecologia · Endocrinologia', null, null, 3
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 22
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_lancamentos
  (planejamento_id, dia, produto, tipo, vagas, preco, custo, veiculo, taxa_por_tema, exige_graduado) values
  ('2026-09', 24, 'Apresentação em congresso', 'Apresentação', 10, 100, 200, 'Anais do Congresso · certificado em 15 dias', null, false)
on conflict (planejamento_id, dia) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Transtorno Obsessivo-Compulsivo: Reconhecimento Precoce e Escolha do Tratamento Inicial', 'Psiquiatria · Clínica Médica', null, null, 0
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 24
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Sedação em Procedimentos Endoscópicos: Critérios de Segurança e Manejo de Complicações', 'Anestesiologia · Gastroenterologia', null, null, 1
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 24
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Traqueostomia no Paciente Crítico: Momento Ideal e Impacto no Tempo de Ventilação Mecânica', 'Cirurgia Geral · Medicina Intensiva', null, null, 2
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 24
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Puberdade Precoce: Investigação Diagnóstica e Critérios para Bloqueio Hormonal', 'Pediatria · Endocrinologia', null, null, 3
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 24
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_lancamentos
  (planejamento_id, dia, produto, tipo, vagas, preco, custo, veiculo, taxa_por_tema, exige_graduado) values
  ('2026-09', 26, 'Artigo internacional', 'Artigo Internacional', 5, 220, 1280, 'International Health Sciences Review · certificado em 7 dias', null, false)
on conflict (planejamento_id, dia) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Esclerose Múltipla: Diagnóstico Precoce, Terapias Modificadoras e Impacto na Incapacidade', 'Neurologia · Clínica Médica', null, null, 0
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 26
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Câncer de Próstata Localizado: Vigilância Ativa Comparada ao Tratamento Radical e Qualidade de Vida', 'Cirurgia Geral · Urologia · Oncologia', null, null, 1
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 26
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Dislipidemia de Alto Risco Cardiovascular: Metas Lipídicas, Estatinas de Alta Potência e Novos Agentes Hipolipemiantes', 'Clínica Médica · Cardiologia · Endocrinologia', null, null, 2
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 26
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Prolapso de Órgãos Pélvicos: Tratamento Conservador Comparado à Correção Cirúrgica e Impacto na Qualidade de Vida', 'Ginecologia · Cirurgia Geral · Urologia', null, null, 3
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 26
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_lancamentos
  (planejamento_id, dia, produto, tipo, vagas, preco, custo, veiculo, taxa_por_tema, exige_graduado) values
  ('2026-09', 28, 'Artigo Qualis A3', 'Artigo Qualis A3', 5, 230, 1200, 'Revista REASE · certificado em 20 dias', null, false)
on conflict (planejamento_id, dia) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Sepse Neonatal Precoce: Reconhecimento Clínico, Uso Racional de Antibióticos e Desfechos', 'Pediatria · Neonatologia · Infectologia', null, null, 0
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 28
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Reganho de Peso Após Cirurgia Bariátrica: Critérios para Indicação de Cirurgia Revisional e Desfechos Metabólicos', 'Cirurgia Geral · Endocrinologia', null, null, 1
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 28
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Bloqueio Neuromuscular Residual: Reconhecimento, Reversão e Complicações Respiratórias Pós-Operatórias', 'Anestesiologia · Cirurgia Geral', null, null, 2
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 28
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Transtorno do Uso de Álcool: Rastreamento na Atenção Primária e Estratégias Farmacológicas de Manutenção', 'Psiquiatria · Clínica Médica', null, null, 3
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 28
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_lancamentos
  (planejamento_id, dia, produto, tipo, vagas, preco, custo, veiculo, taxa_por_tema, exige_graduado) values
  ('2026-09', 30, 'Apresentação em congresso', 'Apresentação', 10, 100, 100, 'Anais do Congresso · certificado em 15 dias', null, false)
on conflict (planejamento_id, dia) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Anemia Ferropriva no Adulto: Investigação da Causa e Escolha da Via de Reposição', 'Clínica Médica · Hematologia', null, null, 0
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 30
on conflict (lancamento_id, titulo, coalesce(tipo, '')) do nothing;
insert into public.planejamento_temas (lancamento_id, titulo, areas, taxa, exige_graduado, ordem)
select l.id, 'Lesão do Ligamento Cruzado Anterior: Tratamento Conservador Comparado à Reconstrução Cirúrgica', 'Ortopedia · Medicina Esportiva', null, null, 1
  from public.planejamento_lancamentos l
 where l.planejamento_id = '2026-09' and l.dia = 30
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
