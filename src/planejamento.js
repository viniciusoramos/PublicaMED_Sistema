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
  {
    id: "2026-09",
    ano: 2026,
    mes: 8, // 0 = janeiro
    meta: 55000,
    conversao: 0.85,
    nota: "Um tipo de publicação por lançamento, sem repetir tipo em lançamentos vizinhos · PSU nos dias 01, 10 e 19, de nove em nove dias, o último dentro do limite do dia 20 para o certificado de 30 dias chegar em outubro · PSU sempre em Clínica Médica ou Cirurgia Geral com eixo de fisioterapia (exigência da Fisioterapia Brasil) e sem repetir área entre os dois blocos grandes · ticket alto nos primeiros 20 dias e prazo curto no fim do mês, como janela de urgência para quem entrega currículo em outubro · 07/09 é feriado e não recebe lançamento · nenhum tema repete o banco de 261 títulos já publicados.",
    lancamentos: [
      {
        dia: 1, produto: "Artigo PSU", tipo: "Artigo PSU", vagas: 4, preco: 600, custo: 2200,
        veiculo: "Fisioterapia Brasil · Qualis B2 · LILACS · certificado em 30 dias",
        temas: [
          { areas: "Cirurgia Geral · Cirurgia Bariátrica · Fisioterapia", titulo: "Reabilitação Funcional Após Cirurgia Bariátrica: Preservação de Massa Magra e Recuperação da Capacidade Física no Pós-Operatório" },
          { areas: "Cirurgia Geral · Trauma · Fisioterapia", titulo: "Fraturas de Arcos Costais no Trauma Torácico: Fisioterapia Respiratória, Controle da Dor e Prevenção de Complicações Pulmonares" },
          { areas: "Clínica Médica · Medicina Intensiva · Fisioterapia", titulo: "Mobilização Precoce na Sepse em Terapia Intensiva: Critérios de Segurança e Desfechos Funcionais na Alta e no Seguimento" },
          { areas: "Clínica Médica · Geriatria · Fisioterapia", titulo: "Sarcopenia no Idoso Hospitalizado: Reconhecimento Precoce, Exercício Resistido e Desfechos na Alta" },
        ],
      },
      {
        dia: 3, produto: "Capítulo de livro", tipo: "Capítulo", vagas: 7, preco: 160, custo: 800,
        veiculo: "ISBN · válido em HCPA e FELUMA · certificado em 7 dias",
        temas: [
          { areas: "Pediatria · Neonatologia", titulo: "Icterícia Neonatal: Tomada de Decisão entre Fototerapia e Exsanguineotransfusão" },
          { areas: "Clínica Médica · Endocrinologia", titulo: "Hipotireoidismo Subclínico: Tomada de Decisão sobre o Momento de Iniciar Levotiroxina" },
          { areas: "Ginecologia · Cirurgia Geral", titulo: "Sangramento Uterino Anormal: Tomada de Decisão entre Tratamento Clínico, Ablação Endometrial e Histerectomia" },
          { areas: "Anestesiologia · Cirurgia Geral", titulo: "Náusea e Vômito no Pós-Operatório: Tomada de Decisão na Profilaxia e Escolha do Esquema Antiemético" },
        ],
      },
      {
        dia: 5, produto: "Artigo internacional", tipo: "Artigo Internacional", vagas: 5, preco: 220, custo: 960,
        veiculo: "International Health Sciences Review · certificado em 7 dias",
        temas: [
          { areas: "Otorrinolaringologia · Neurologia · Emergência", titulo: "Vertigem na Emergência: Diferenciação entre Causas Periféricas e Centrais e Conduta Inicial" },
          { areas: "Neurologia · Clínica Médica", titulo: "Epilepsia Refratária: Critérios de Definição e Indicação de Tratamento Cirúrgico" },
          { areas: "Cardiologia · Clínica Médica", titulo: "Cardiomiopatia Hipertrófica: Rastreamento Familiar, Estratificação de Risco de Morte Súbita e Conduta" },
        ],
      },
      {
        dia: 8, produto: "Capítulo de livro", tipo: "Capítulo", vagas: 7, preco: 160, custo: 800,
        veiculo: "ISBN · válido em HCPA e FELUMA · certificado em 7 dias",
        temas: [
          { areas: "Clínica Médica · Cardiologia · Emergência", titulo: "Síncope na Emergência: Tomada de Decisão entre Investigação Ambulatorial e Internação" },
          { areas: "Pediatria · Nefrologia", titulo: "Infecção do Trato Urinário na Criança: Tomada de Decisão sobre Investigação por Imagem e Prevenção de Cicatriz Renal" },
          { areas: "Ortopedia · Clínica Médica", titulo: "Lombalgia Crônica: Tomada de Decisão sobre Investigação por Imagem e Encaminhamento Cirúrgico" },
          { areas: "Clínica Médica · Gastroenterologia", titulo: "Cirrose Hepática Descompensada: Tomada de Decisão no Manejo das Complicações e no Encaminhamento para Transplante" },
        ],
      },
      {
        dia: 10, produto: "Artigo PSU", tipo: "Artigo PSU", vagas: 4, preco: 600, custo: 2200,
        veiculo: "Fisioterapia Brasil · Qualis B2 · LILACS · certificado em 30 dias",
        temas: [
          { areas: "Cirurgia Geral · Queimados · Fisioterapia", titulo: "Reabilitação do Paciente Grande Queimado: Prevenção de Contraturas Cicatriciais e Retorno à Funcionalidade" },
          { areas: "Clínica Médica · Reumatologia · Fisioterapia", titulo: "Osteoartrite de Joelho: Exercício Terapêutico Comparado à Indicação de Artroplastia" },
          { areas: "Clínica Médica · Nefrologia · Fisioterapia", titulo: "Exercício Intradialítico na Doença Renal Crônica: Capacidade Funcional e Adesão ao Tratamento" },
          { areas: "Cirurgia Geral · Cirurgia Vascular · Fisioterapia", titulo: "Amputação de Membro Inferior por Doença Arterial: Reabilitação Protética e Retorno à Marcha" },
        ],
      },
      {
        dia: 12, produto: "Apresentação em congresso", tipo: "Apresentação", vagas: 10, preco: 100, custo: 150,
        veiculo: "Anais do Congresso · certificado em 15 dias",
        temas: [
          { areas: "Clínica Médica · Emergência · Toxicologia", titulo: "Intoxicação Exógena no Pronto-Socorro: Reconhecimento Precoce e Conduta Inicial" },
          { areas: "Pediatria · Gastroenterologia", titulo: "Constipação Funcional na Infância: Reconhecimento, Tratamento e Prevenção de Recorrência" },
          { areas: "Obstetrícia · Emergência", titulo: "Trabalho de Parto Prematuro: Critérios de Tocólise e Corticoterapia Antenatal" },
        ],
      },
      {
        dia: 15, produto: "Artigo internacional", tipo: "Artigo Internacional", vagas: 5, preco: 220, custo: 1280,
        veiculo: "International Health Sciences Review · certificado em 7 dias",
        temas: [
          { areas: "Cirurgia Cardiovascular · Cardiologia", titulo: "Estenose Aórtica Grave: Troca Valvar Cirúrgica Comparada ao Implante Transcateter e Desfechos a Longo Prazo" },
          { areas: "Oftalmologia · Geriatria", titulo: "Degeneração Macular Relacionada à Idade: Terapia Anti-VEGF e Preservação da Autonomia do Idoso" },
          { areas: "Pediatria · Alergologia · Emergência", titulo: "Anafilaxia na Criança: Reconhecimento, Uso da Adrenalina e Prevenção de Recorrência" },
          { areas: "Clínica Médica · Pneumologia · Emergência", titulo: "Tromboembolismo Pulmonar de Alto Risco: Estratificação e Critérios para Trombólise" },
        ],
      },
      {
        dia: 17, produto: "Capítulo de livro", tipo: "Capítulo", vagas: 7, preco: 160, custo: 800,
        veiculo: "ISBN · válido em HCPA e FELUMA · certificado em 7 dias",
        temas: [
          { areas: "Pediatria · Pneumologia", titulo: "Bronquiolite Viral Aguda: Tomada de Decisão sobre Suporte Ventilatório e Critérios de Internação" },
          { areas: "Ortopedia · Geriatria", titulo: "Fratura de Fêmur no Idoso: Tomada de Decisão sobre o Momento da Cirurgia e Impacto na Mortalidade" },
          { areas: "Psiquiatria · Clínica Médica", titulo: "Primeiro Episódio Psicótico: Tomada de Decisão no Encaminhamento Precoce e Impacto da Duração da Psicose Não Tratada" },
          { areas: "Ginecologia · Obstetrícia · Cirurgia Geral", titulo: "Gestação Ectópica: Tomada de Decisão entre Tratamento com Metotrexato e Abordagem Cirúrgica" },
        ],
      },
      {
        // última chamada do PSU: fecha no dia 19 para o certificado de 30 dias sair ainda em outubro
        dia: 19, produto: "Artigo PSU · última chamada", tipo: "Artigo PSU", vagas: 4, preco: 600, custo: 550,
        veiculo: "Fisioterapia Brasil · Qualis B2 · LILACS · certificado em 30 dias",
        temas: [
          { areas: "Cirurgia Cardiovascular · Clínica Médica · Fisioterapia", titulo: "Reabilitação Após Cirurgia Cardíaca: Mobilização Precoce, Função Pulmonar e Tempo de Internação" },
        ],
      },
      {
        dia: 22, produto: "Artigo Qualis A3", tipo: "Artigo Qualis A3", vagas: 5, preco: 230, custo: 1200,
        veiculo: "Revista REASE · certificado em 20 dias",
        temas: [
          { areas: "Cirurgia Geral · Coloproctologia", titulo: "Fechamento de Ostomia Intestinal: Fatores Associados ao Adiamento e Impacto na Qualidade de Vida do Paciente" },
          { areas: "Dermatologia · Oncologia", titulo: "Carcinoma Espinocelular Cutâneo: Fatores de Risco, Reconhecimento Precoce e Desfechos após Tratamento" },
          { areas: "Clínica Médica · Neurologia · Emergência", titulo: "Cefaleia na Emergência: Reconhecimento de Sinais de Alarme e Critérios para Neuroimagem" },
          { areas: "Ginecologia · Endocrinologia", titulo: "Síndrome dos Ovários Policísticos: Repercussões Metabólicas e Impacto na Fertilidade" },
        ],
      },
      {
        dia: 24, produto: "Apresentação em congresso", tipo: "Apresentação", vagas: 10, preco: 100, custo: 200,
        veiculo: "Anais do Congresso · certificado em 15 dias",
        temas: [
          { areas: "Psiquiatria · Clínica Médica", titulo: "Transtorno Obsessivo-Compulsivo: Reconhecimento Precoce e Escolha do Tratamento Inicial" },
          { areas: "Anestesiologia · Gastroenterologia", titulo: "Sedação em Procedimentos Endoscópicos: Critérios de Segurança e Manejo de Complicações" },
          { areas: "Cirurgia Geral · Medicina Intensiva", titulo: "Traqueostomia no Paciente Crítico: Momento Ideal e Impacto no Tempo de Ventilação Mecânica" },
          { areas: "Pediatria · Endocrinologia", titulo: "Puberdade Precoce: Investigação Diagnóstica e Critérios para Bloqueio Hormonal" },
        ],
      },
      {
        dia: 26, produto: "Artigo internacional", tipo: "Artigo Internacional", vagas: 5, preco: 220, custo: 1280,
        veiculo: "International Health Sciences Review · certificado em 7 dias",
        temas: [
          { areas: "Neurologia · Clínica Médica", titulo: "Esclerose Múltipla: Diagnóstico Precoce, Terapias Modificadoras e Impacto na Incapacidade" },
          { areas: "Cirurgia Geral · Urologia · Oncologia", titulo: "Câncer de Próstata Localizado: Vigilância Ativa Comparada ao Tratamento Radical e Qualidade de Vida" },
          { areas: "Clínica Médica · Cardiologia · Endocrinologia", titulo: "Dislipidemia de Alto Risco Cardiovascular: Metas Lipídicas, Estatinas de Alta Potência e Novos Agentes Hipolipemiantes" },
          { areas: "Ginecologia · Cirurgia Geral · Urologia", titulo: "Prolapso de Órgãos Pélvicos: Tratamento Conservador Comparado à Correção Cirúrgica e Impacto na Qualidade de Vida" },
        ],
      },
      {
        dia: 28, produto: "Artigo Qualis A3", tipo: "Artigo Qualis A3", vagas: 5, preco: 230, custo: 1200,
        veiculo: "Revista REASE · certificado em 20 dias",
        temas: [
          { areas: "Pediatria · Neonatologia · Infectologia", titulo: "Sepse Neonatal Precoce: Reconhecimento Clínico, Uso Racional de Antibióticos e Desfechos" },
          // condicionado ao interesse no PSU de bariátrica do dia 01: se aquele dia não engajar,
          // este tema é substituído antes do lançamento.
          { areas: "Cirurgia Geral · Endocrinologia", titulo: "Reganho de Peso Após Cirurgia Bariátrica: Critérios para Indicação de Cirurgia Revisional e Desfechos Metabólicos" },
          { areas: "Anestesiologia · Cirurgia Geral", titulo: "Bloqueio Neuromuscular Residual: Reconhecimento, Reversão e Complicações Respiratórias Pós-Operatórias" },
          { areas: "Psiquiatria · Clínica Médica", titulo: "Transtorno do Uso de Álcool: Rastreamento na Atenção Primária e Estratégias Farmacológicas de Manutenção" },
        ],
      },
      {
        dia: 30, produto: "Apresentação em congresso", tipo: "Apresentação", vagas: 10, preco: 100, custo: 100,
        veiculo: "Anais do Congresso · certificado em 15 dias",
        temas: [
          { areas: "Clínica Médica · Hematologia", titulo: "Anemia Ferropriva no Adulto: Investigação da Causa e Escolha da Via de Reposição" },
          { areas: "Ortopedia · Medicina Esportiva", titulo: "Lesão do Ligamento Cruzado Anterior: Tratamento Conservador Comparado à Reconstrução Cirúrgica" },
        ],
      },
    ],
  },
];
