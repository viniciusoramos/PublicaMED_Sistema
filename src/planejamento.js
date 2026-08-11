/* ============================================================
   PLANEJAMENTO EDITORIAL · CARGA INICIAL
   Cronograma de lançamentos do mês (fonte: PDF de planejamento).

   ATENÇÃO — o cronograma vivo mora no BANCO, não aqui.
   Este arquivo é a carga inicial: vira SQL por `npm run sql:planejamento`
   (→ supabase/11-planejamento.sql), que é aplicado no Supabase uma vez.
   Depois disso os ajustes são feitos pela tela do Calendário e valem para
   todos os usuários — editar aqui NÃO muda mais o que aparece no sistema.
   A tela só cai neste arquivo, em modo leitura, enquanto o SQL não roda.

   Para planejar um mês novo: acrescente aqui, rode o script e aplique o SQL
   gerado (ele é idempotente — não desfaz o que já foi ajustado pela tela).

   Campos opcionais, usados pelo botão "criar publicação no sistema":
     no lançamento → taxaPorTema (taxa de cada publicação), exigeGraduado
     no tema       → taxa, exigeGraduado (têm prioridade sobre o lançamento)
   Sem eles a publicação é criada com tema, tipo, áreas e vagas, e a taxa
   continua sendo lançada à mão no painel da publicação.
   ============================================================ */

export const PLANEJAMENTOS = [
  {
    id: "2026-08",
    ano: 2026,
    mes: 7, // 0 = janeiro
    meta: 38000,
    conversao: 0.8,
    nota: "Artigos PSU sempre em Clínica Médica e Cirurgia Geral (eixo reabilitação, Fisioterapia Brasil) · apresentação em congresso com 10 autores · formatos alternados sem dois artigos em sequência · PSU no início de cada quinzena (01 e 17) · temas do banco oficial, sem repetir julho.",
    lancamentos: [
      {
        dia: 1, produto: "Artigo PSU", tipo: "Artigo PSU", vagas: 4, preco: 600, custo: 1650,
        veiculo: "Fisioterapia Brasil · Qualis B1 · LILACS",
        temas: [
          // trocado na abertura das vagas (o tema previsto de pré-habilitação não foi usado)
          { areas: "Cirurgia Geral · Trauma · Fisioterapia", titulo: "Fisioterapia no Paciente Vítima de Trauma Grave: Da UTI ao Retorno às Atividades" },
          { areas: "Clínica Médica · Reumatologia · Fisioterapia", titulo: "Fibromialgia: Exercício Físico, Controle da Dor e Qualidade de Vida" },
          { areas: "Cirurgia Geral · Endocrinologia · Fisioterapia", titulo: "Pé Diabético: Fisioterapia, Cuidado da Ferida e Prevenção da Amputação" },
        ],
      },
      {
        dia: 4, produto: "Capítulo de livro", tipo: "Capítulo", vagas: 7, preco: 160, custo: 600,
        veiculo: "Válido no PSU",
        temas: [
          { areas: "Cirurgia Geral · Medicina Intensiva", titulo: "Pancreatite Aguda Grave: Quando a Necrose Exige Intervenção e Qual o Momento Certo de Operar" },
          { areas: "Clínica Médica · Cardiologia · Emergência", titulo: "Dor Torácica na Emergência: Estratificação de Risco, Exames Necessários e Quando Liberar o Paciente" },
          { areas: "Pediatria · Infectologia · Emergência", titulo: "Febre no Lactente: Sinais de Gravidade, Exames Necessários e Decisão de Internar" },
        ],
      },
      {
        dia: 7, produto: "Artigo internacional", tipo: "Artigo Internacional", vagas: 5, preco: 220, custo: 960,
        veiculo: "International Health Sciences Review",
        temas: [
          { areas: "Cirurgia Geral · Estômago · Oncologia", titulo: "Câncer Gástrico Precoce: Ressecção Endoscópica Comparada à Gastrectomia e Sobrevida" },
          { areas: "Clínica Médica · Endocrinologia · Nefrologia", titulo: "Análogos de GLP-1 em Pacientes com Diabetes Tipo 2 e Doença Renal Crônica: Benefícios além do Controle da Glicemia" },
          { areas: "Dermatologia · Alergologia · Pediatria", titulo: "Dermatite Atópica na Prática Clínica: Controle dos Sintomas, Prevenção de Crises e Impacto na Qualidade de Vida" },
        ],
      },
      {
        dia: 10, produto: "Apresentação em congresso", tipo: "Apresentação", vagas: 10, preco: 100, custo: 150,
        veiculo: "Anais do Congresso",
        temas: [
          { areas: "Cirurgia Geral · Clínica Médica · Emergência", titulo: "Dor Abdominal no Pronto-Socorro: Quando o Caso Deixa de Ser Clínico e Passa a Ser Cirúrgico" },
          { areas: "Cardiologia · Clínica Médica · Emergência", titulo: "Ataque Isquêmico Transitório: Diagnóstico Precoce e Prevenção do Acidente Vascular Cerebral" },
          { areas: "Neurologia · Emergência", titulo: "AVC nas Primeiras Horas: Reconhecimento, Critérios para Trombólise e Decisão de Transferir" },
        ],
      },
      {
        dia: 13, produto: "Artigo Qualis A3", tipo: "Artigo Qualis A3", vagas: 5, preco: 230, custo: 900,
        veiculo: "Revista REASE",
        temas: [
          { areas: "Cirurgia Geral · Hepatobiliar · Emergência", titulo: "Colangite Aguda Grave: Momento da Drenagem Biliar e Mortalidade Hospitalar" },
          { areas: "Clínica Médica · Cardiologia", titulo: "Insuficiência Cardíaca com Fração de Ejeção Preservada: Diagnóstico Subestimado e Avanços Terapêuticos Recentes" },
          { areas: "Psiquiatria · Obstetrícia · Pediatria", titulo: "Depressão Pós-Parto: Rastreamento no Pré-Natal e Desfechos no Desenvolvimento do Bebê" },
        ],
      },
      {
        dia: 15, produto: "Capítulo de livro", tipo: "Capítulo", vagas: 7, preco: 160, custo: 600,
        veiculo: "Válido no PSU",
        temas: [
          { areas: "Cirurgia Geral · Coloproctologia · Oncologia", titulo: "Câncer de Cólon Obstruído: Cirurgia em Um ou Dois Tempos e o Lugar da Prótese Endoscópica" },
          // "Insuficiência Cardíaca Descompensada" saiu daqui: já tinha sido aberto antes (está no sistema como
          // "Decisão Clínica na Insuficiência Cardíaca Descompensada..."). Falta definir o tema que entra no lugar.
          // "AVC nas Primeiras Horas" saiu daqui: foi aberto como Apresentação em congresso no dia 10/08, não como
          // capítulo. (a publicação segue normalmente no sistema — isto é só o cronograma). Falta definir o tema que
          // entra no lugar.
        ],
      },
      {
        dia: 17, produto: "Artigo PSU", tipo: "Artigo PSU", vagas: 4, preco: 600, custo: 1650,
        veiculo: "Fisioterapia Brasil · Qualis B1 · LILACS",
        temas: [
          // "Fisioterapia no Paciente Vítima de Trauma Grave" saiu daqui: foi antecipado e vendido no dia 01/08.
          // (a publicação segue normalmente no sistema — isto é só o cronograma). Falta definir o tema que entra no lugar.
          { areas: "Clínica Médica · Oncologia · Fisioterapia", titulo: "Cansaço Durante o Tratamento do Câncer: Exercício Físico, Força e Continuidade da Quimioterapia" },
          { areas: "Cirurgia Geral · Coloproctologia · Fisioterapia", titulo: "Recuperação Precoce após Cirurgia do Intestino: Saída do Leito, Retorno da Função Intestinal e Alta Hospitalar" },
        ],
      },
      {
        dia: 19, produto: "Artigo Qualis A3", tipo: "Artigo Qualis A3", vagas: 5, preco: 230, custo: 900,
        veiculo: "Revista REASE",
        temas: [
          { areas: "Cirurgia Geral · Endocrinologia", titulo: "Cirurgia da Tireoide: Lesão do Nervo da Voz e Qualidade de Vida no Pós-Operatório" },
          { areas: "Clínica Médica · Infectologia", titulo: "Resistência Bacteriana em Infecções Hospitalares: Panorama Atual e Consequências Clínicas" },
          { areas: "Cardiologia · Eletrofisiologia", titulo: "Ablação por Cateter e Antiarrítmicos na Fibrilação Atrial: Controle do Ritmo e Qualidade de Vida" },
        ],
      },
      {
        dia: 21, produto: "Artigo internacional", tipo: "Artigo Internacional", vagas: 5, preco: 220, custo: 960,
        veiculo: "International Health Sciences Review",
        temas: [
          { areas: "Cirurgia Geral · Trauma · Emergência", titulo: "Laparotomia de Controle de Danos no Trauma Abdominal Grave: Momento do Fechamento da Parede e Complicações Tardias" },
          { areas: "Clínica Médica · Reumatologia · Nefrologia", titulo: "Nefrite Lúpica: Novas Terapias e Preservação da Função Renal" },
          { areas: "Neurologia · Infectologia · Emergência", titulo: "Meningite Bacteriana no Adulto: Reconhecimento, Antibioticoterapia Precoce e Sequelas Neurológicas" },
        ],
      },
      {
        dia: 24, produto: "Capítulo de livro", tipo: "Capítulo", vagas: 7, preco: 160, custo: 600,
        veiculo: "Válido no PSU",
        temas: [
          { areas: "Cirurgia Geral · Gastroenterologia", titulo: "Coledocolitíase e Colangite Aguda: Ordem entre Drenagem Endoscópica e Cirurgia" },
          // "Dor Torácica na Emergência: Estratificação de Risco e Decisão de Alta" saiu daqui: já foi aberto antes.
          // (a publicação segue normalmente no sistema — isto é só o cronograma). Falta definir o tema que entra no lugar.
          { areas: "Obstetrícia · Clínica Médica", titulo: "Pressão Alta na Gestação: Diferenciar a Pré-Eclâmpsia, Definir a Conduta e Decidir o Momento do Parto" },
        ],
      },
      {
        dia: 27, produto: "Apresentação em congresso", tipo: "Apresentação", vagas: 10, preco: 100, custo: 150,
        veiculo: "Anais do Congresso",
        temas: [
          { areas: "Cirurgia Geral · Trauma · Emergência", titulo: "Trauma Abdominal Fechado: Tratamento Conservador ou Laparotomia Imediata" },
          { areas: "Cirurgia Geral · Hepatologia", titulo: "Hipertensão Portal e Varizes Esofágicas: Do Controle do Sangramento à Indicação Cirúrgica" },
          { areas: "Pediatria · Gastroenterologia · Emergência", titulo: "Diarreia e Desidratação na Criança: Avaliação da Gravidade, Reidratação e Critérios de Internação" },
        ],
      },
      {
        dia: 30, produto: "Artigo Qualis A3", tipo: "Artigo Qualis A3", vagas: 5, preco: 230, custo: 900,
        veiculo: "Revista REASE",
        temas: [
          { areas: "Cirurgia Geral · Vascular · Emergência", titulo: "Aneurisma de Aorta Abdominal: Mortalidade Hospitalar e Fatores Associados ao Desfecho" },
          // "Análogos de GLP-1" saiu daqui: foi aberto no Artigo Internacional do dia 07/08.
          // (a publicação segue normalmente no sistema — isto é só o cronograma). Falta definir o tema que entra no lugar.
          { areas: "Psiquiatria · Clínica Médica · Farmacologia", titulo: "Transtorno de Ansiedade Generalizada: Tratamento Farmacológico Comparado à Psicoterapia" },
        ],
      },
    ],
  },
];
