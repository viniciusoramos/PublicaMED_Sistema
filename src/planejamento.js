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
  {
    // Fonte: Planejamento_PublicaMED_Outubro2026.pdf. Primeiro mês com a taxa por tema
    // (taxaPorTema): criar a publicação pelo calendário já lança a taxa no Financeiro.
    id: "2026-10",
    ano: 2026,
    mes: 9, // 0 = janeiro
    meta: 90000,
    /* O PDF projeta 70% no PSU, 75% no não indexado e 85% nos demais. O plano tem uma
     * conversão só, então vai a média ponderada: 84.511,00 ÷ 105.100,00 = 80,4%, que
     * mantém o total projetado do calendário igual ao do PDF. */
    conversao: 0.804,
    nota: "Um tipo de publicação por lançamento, com temas diferentes dentro do mesmo tipo, alternando artigo e não artigo sem repetir tipo em lançamentos vizinhos · o edital do PSU fecha em 15/10 e o certificado leva 30 dias, então nenhuma venda de PSU do mês serve àquele edital: o produto é anunciado pela indexação LILACS e Qualis B2 (HCPA, SES-GO, UNESP, AMRIGS e outros), com o PSU citado só como um entre vários · PSU nos dias 09, 21 e 31, sempre com eixo de fisioterapia (exigência da Fisioterapia Brasil) · artigo não indexado estreia no dia 05 · 12/10 é feriado e fica livre, assim como os domingos · conversão do PDF: 70% no PSU, 75% no não indexado e 85% nos demais · nenhum lançamento concentra mais de dois temas da mesma área · nenhum tema repete o banco de 333 títulos já publicados.",
    lancamentos: [
      {
        dia: 1, produto: "Artigo Qualis A3", tipo: "Artigo Qualis A3", vagas: 5, preco: 240, custo: 1750, taxaPorTema: 350,
        veiculo: "Revista Artefactum · certificado em 7 dias",
        temas: [
          { areas: "Cirurgia Geral · Emergência · Radiologia", titulo: "Apendicectomia Negativa: Escores Diagnósticos e Uso Racional de Imagem" },
          { areas: "Neurocirurgia · Geriatria", titulo: "Hematoma Subdural Crônico no Idoso: Indicação de Drenagem e Fatores de Recidiva" },
          { areas: "Dermatologia · Clínica Médica", titulo: "Alopecia Areata Grave: Inibidores de JAK e Resposta ao Tratamento" },
          { areas: "Psiquiatria · Clínica Médica", titulo: "Transtorno de Ansiedade Generalizada: Rastreamento e Escolha do Tratamento Inicial" },
          // trocado em 30/09: o título do PDF era quase o do A3 de 28/09 ("Reconhecimento Clínico,
          // Uso Racional de Antibióticos e Desfechos"); mantida a sepse neonatal precoce, com outro recorte
          { areas: "Pediatria · Neonatologia · Obstetrícia", titulo: "Sepse Neonatal Precoce: Fatores de Risco Maternos e Prevenção Intraparto" },
        ],
      },
      {
        dia: 3, produto: "Capítulo de livro", tipo: "Capítulo", vagas: 7, preco: 180, custo: 1000, taxaPorTema: 200,
        veiculo: "ISBN · válido em HCPA e FELUMA · certificado em 7 dias",
        temas: [
          { areas: "Ortopedia · Geriatria", titulo: "Fratura do Úmero Proximal no Idoso: Critérios para Tratamento Conservador e Indicação de Artroplastia" },
          { areas: "Oftalmologia · Geriatria", titulo: "Catarata: Critérios para Indicação Cirúrgica e Escolha da Lente Intraocular" },
          { areas: "Clínica Médica · Nefrologia", titulo: "Doença Renal Crônica: Estadiamento e Critérios de Encaminhamento ao Nefrologista" },
          { areas: "Clínica Médica · Infectologia", titulo: "Tuberculose Pulmonar: Diagnóstico, Esquema Básico e Manejo dos Efeitos Adversos" },
          { areas: "Cirurgia Geral · Endocrinologia", titulo: "Nódulo Tireoidiano: Critérios de Punção e Extensão da Tireoidectomia" },
        ],
      },
      {
        dia: 5, produto: "Artigo não indexado", tipo: "Artigo Não Indexado", vagas: 7, preco: 180, custo: 640, taxaPorTema: 160,
        veiculo: "Artigo não indexado · certificado em 7 dias",
        temas: [
          { areas: "Clínica Médica · Pneumologia", titulo: "Pneumonia Adquirida na Comunidade: Escores de Gravidade e Critérios de Internação" },
          { areas: "Clínica Médica · Pneumologia", titulo: "Exacerbação Aguda da DPOC: Manejo Inicial e Indicação de Ventilação Não Invasiva" },
          { areas: "Cirurgia Geral · Infectologia", titulo: "Infecção de Sítio Cirúrgico: Fatores de Risco e Medidas de Prevenção" },
          { areas: "Cirurgia Geral · Hematologia", titulo: "Cirurgia de Urgência no Paciente Anticoagulado: Reversão da Anticoagulação e Risco de Sangramento" },
        ],
      },
      {
        dia: 7, produto: "Apresentação em congresso", tipo: "Apresentação", vagas: 10, preco: 110, custo: 67.92, taxaPorTema: 16.98,
        veiculo: "Anais do Congresso · certificado em 15 dias",
        temas: [
          { areas: "Pediatria · Alergologia · Emergência", titulo: "Anafilaxia na Criança: Uso da Adrenalina e Prevenção de Recorrência" },
          { areas: "Cirurgia Geral · Emergência", titulo: "Queimaduras: Cálculo da Superfície Corporal e Critérios de Transferência" },
          { areas: "Neurologia · Emergência", titulo: "Crise Convulsiva no Pronto-Socorro: Manejo Inicial e Estado de Mal Epiléptico" },
          { areas: "Clínica Médica · Endocrinologia · Emergência", titulo: "Hipoglicemia Grave no Paciente Diabético: Reconhecimento e Conduta Imediata" },
        ],
      },
      {
        dia: 9, produto: "Artigo PSU / LILACS", tipo: "Artigo PSU", vagas: 4, preco: 600, custo: 2000, taxaPorTema: 500,
        veiculo: "Fisioterapia Brasil · Qualis B2 · LILACS · certificado em 30 dias",
        temas: [
          { areas: "Cirurgia Geral · Nefrologia · Fisioterapia", titulo: "Transplante Renal: Reabilitação Física no Pós-Operatório e Retorno às Atividades" },
          { areas: "Clínica Médica · Angiologia · Fisioterapia", titulo: "Doença Arterial Obstrutiva Periférica: Treino de Caminhada Supervisionado e Distância de Claudicação" },
          { areas: "Clínica Médica · Endocrinologia · Fisioterapia", titulo: "Neuropatia Diabética Periférica: Treino de Equilíbrio e Preservação da Marcha" },
          { areas: "Ortopedia · Clínica Médica · Fisioterapia", titulo: "Lesões do Manguito Rotador: Exercício Terapêutico e Recuperação da Função do Ombro" },
        ],
      },
      {
        dia: 10, produto: "Capítulo de livro", tipo: "Capítulo", vagas: 7, preco: 180, custo: 1000, taxaPorTema: 200,
        veiculo: "ISBN · válido em HCPA e FELUMA · certificado em 7 dias",
        temas: [
          { areas: "Cirurgia Geral · Coloproctologia", titulo: "Abscesso e Fístula Perianal: Drenagem e Técnicas de Preservação Esfincteriana" },
          { areas: "Clínica Médica · Nefrologia", titulo: "Injúria Renal Aguda no Paciente Internado: Causas Evitáveis e Critérios de Diálise" },
          { areas: "Clínica Médica · Infectologia · Dermatologia", titulo: "Erisipela e Celulite: Diagnóstico Diferencial e Critérios de Internação" },
          { areas: "Otorrinolaringologia · Neurologia", titulo: "Paralisia Facial Periférica: Diagnóstico Diferencial e Corticoterapia Precoce" },
          { areas: "Oftalmologia · Pediatria", titulo: "Ambliopia na Infância: Rastreamento Precoce e Janela Terapêutica" },
        ],
      },
      {
        dia: 13, produto: "Artigo internacional", tipo: "Artigo Internacional", vagas: 5, preco: 230, custo: 1600, taxaPorTema: 320,
        veiculo: "International Health Sciences Review · certificado em 7 dias",
        temas: [
          { areas: "Oftalmologia · Infectologia", titulo: "Toxoplasmose Ocular: Esquemas Terapêuticos e Prevenção de Recorrências" },
          { areas: "Clínica Médica · Infectologia", titulo: "Leishmaniose Visceral: Reconhecimento Precoce e Escolha do Esquema Terapêutico" },
          { areas: "Otorrinolaringologia", titulo: "Perda Auditiva Súbita: Investigação Etiológica e Impacto do Tempo até o Tratamento" },
          { areas: "Neurologia · Clínica Médica", titulo: "Miastenia Gravis: Diagnóstico Precoce e Manejo da Crise Miastênica" },
          { areas: "Cardiologia · Obstetrícia", titulo: "Cardiomiopatia Periparto: Diagnóstico Diferencial e Prognóstico Materno" },
        ],
      },
      {
        // cada tema do combo sai como capítulo E apresentação, com o mesmo título
        dia: 15, produto: "Combo capítulo + apresentação", tipo: "Combo", vagas: 7, preco: 220, custo: 867.92, taxaPorTema: 216.98,
        veiculo: "Capítulo de livro + apresentação em congresso · certificado em 7 dias",
        temas: [
          { areas: "Clínica Médica · Nefrologia · Emergência", titulo: "Distúrbios do Potássio: Reconhecimento da Hipercalemia e da Hipocalemia na Emergência" },
          { areas: "Neurologia · Neurocirurgia", titulo: "Acidente Vascular Cerebral Hemorrágico: Controle Pressórico e Indicação Cirúrgica" },
          { areas: "Geriatria · Clínica Médica", titulo: "Síndrome da Fragilidade no Idoso: Rastreamento e Intervenções Multidimensionais" },
          { areas: "Gastroenterologia · Endocrinologia", titulo: "Doença Hepática Gordurosa Metabólica: Rastreamento e Estratificação de Fibrose" },
        ],
      },
      {
        dia: 17, produto: "Artigo internacional", tipo: "Artigo Internacional", vagas: 5, preco: 230, custo: 1600, taxaPorTema: 320,
        veiculo: "International Health Sciences Review · certificado em 7 dias",
        temas: [
          { areas: "Oftalmologia · Endocrinologia", titulo: "Edema Macular Diabético: Terapia Anti-VEGF e Preditores de Resposta" },
          { areas: "Cirurgia Geral · Endocrinologia", titulo: "Cirurgia Bariátrica Comparada aos Agonistas do GLP-1: Durabilidade da Perda de Peso e Controle das Comorbidades" },
          { areas: "Clínica Médica · Pneumologia · Cardiologia", titulo: "Hipertensão Pulmonar: Classificação Diagnóstica e Terapias Específicas" },
          { areas: "Neurologia", titulo: "Doença de Parkinson: Terapias Avançadas e Indicação de Estimulação Cerebral Profunda" },
          { areas: "Gastroenterologia · Ginecologia e Obstetrícia", titulo: "Doença Inflamatória Intestinal na Gestação: Controle da Atividade e Desfechos Perinatais" },
        ],
      },
      {
        dia: 19, produto: "Apresentação em congresso", tipo: "Apresentação", vagas: 10, preco: 110, custo: 67.92, taxaPorTema: 16.98,
        veiculo: "Anais do Congresso · certificado em 15 dias",
        temas: [
          { areas: "Pediatria · Neonatologia", titulo: "Icterícia Neonatal: Indicação de Fototerapia e Critérios de Exsanguineotransfusão" },
          { areas: "Clínica Médica · Toxicologia · Emergência", titulo: "Acidentes por Animais Peçonhentos: Classificação da Gravidade e Soroterapia" },
          { areas: "Cirurgia Geral · Buco-Maxilo-Facial · Emergência", titulo: "Trauma de Face no Pronto-Socorro: Avaliação Inicial e Critérios de Encaminhamento" },
          { areas: "Clínica Médica · Infectologia", titulo: "Dengue Grave: Sinais de Alarme e Reposição Volêmica" },
        ],
      },
      {
        dia: 21, produto: "Artigo PSU / LILACS", tipo: "Artigo PSU", vagas: 4, preco: 600, custo: 2000, taxaPorTema: 500,
        veiculo: "Fisioterapia Brasil · Qualis B2 · LILACS · certificado em 30 dias",
        temas: [
          { areas: "Cirurgia Geral · Hepatologia · Fisioterapia", titulo: "Transplante Hepático: Recuperação da Capacidade Funcional e Força Muscular" },
          { areas: "Clínica Médica · Geriatria · Fisioterapia", titulo: "Obesidade Sarcopênica no Idoso: Exercício Resistido e Capacidade Funcional" },
          { areas: "Ortopedia · Geriatria · Fisioterapia", titulo: "Artroplastia Total de Quadril: Protocolos de Reabilitação e Recuperação da Marcha" },
          { areas: "Psiquiatria · Clínica Médica · Fisioterapia", titulo: "Exercício Físico no Tratamento da Depressão: Sintomas Depressivos e Capacidade Funcional" },
        ],
      },
      {
        dia: 23, produto: "Capítulo de livro", tipo: "Capítulo", vagas: 7, preco: 180, custo: 800, taxaPorTema: 200,
        veiculo: "ISBN · válido em HCPA e FELUMA · certificado em 7 dias",
        temas: [
          { areas: "Ortopedia · Geriatria", titulo: "Fratura Vertebral Osteoporótica: Tratamento Conservador e Indicação de Vertebroplastia" },
          { areas: "Oftalmologia · Emergência", titulo: "Olho Vermelho: Diagnóstico Diferencial e Sinais de Alerta para Encaminhamento Urgente" },
          { areas: "Pediatria · Gastroenterologia", titulo: "Refluxo Gastroesofágico no Lactente: Diagnóstico Diferencial e Critérios de Investigação" },
          { areas: "Clínica Médica · Neurologia · Psiquiatria", titulo: "Cannabis Medicinal: Indicações Baseadas em Evidência e Regulamentação no Brasil" },
        ],
      },
      {
        dia: 24, produto: "Artigo internacional", tipo: "Artigo Internacional", vagas: 5, preco: 230, custo: 1280, taxaPorTema: 320,
        veiculo: "International Health Sciences Review · certificado em 7 dias",
        temas: [
          { areas: "Oftalmologia · Reumatologia", titulo: "Uveíte Anterior Aguda: Investigação Etiológica e Relação com o HLA-B27" },
          { areas: "Neurologia · Ginecologia e Obstetrícia", titulo: "Epilepsia na Mulher em Idade Fértil: Teratogenicidade e Ajuste Terapêutico" },
          { areas: "Cardiologia · Medicina Intensiva", titulo: "Choque Cardiogênico no Infarto Agudo do Miocárdio: Suporte Circulatório Mecânico e Desfechos" },
          { areas: "Oncologia · Clínica Médica", titulo: "Imunoterapia com Inibidores de Checkpoint: Toxicidades Imunomediadas e Manejo Clínico" },
        ],
      },
      {
        dia: 27, produto: "Combo capítulo + apresentação", tipo: "Combo", vagas: 7, preco: 220, custo: 867.92, taxaPorTema: 216.98,
        veiculo: "Capítulo de livro + apresentação em congresso · certificado em 7 dias",
        temas: [
          { areas: "Cardiologia · Emergência", titulo: "Síndrome Coronariana Aguda sem Supradesnivelamento do ST: Estratificação de Risco e Estratégia Invasiva" },
          { areas: "Clínica Médica · Endocrinologia", titulo: "Insuficiência Adrenal Aguda: Reconhecimento Clínico e Reposição de Corticoide" },
          { areas: "Cirurgia Geral · Gastroenterologia", titulo: "Hemorragia Digestiva Alta: Estratificação de Risco e Momento da Endoscopia" },
          { areas: "Medicina Intensiva · Clínica Médica", titulo: "Parada Cardiorrespiratória Intra-Hospitalar: Qualidade da Reanimação e Cuidados Pós-Parada" },
        ],
      },
      {
        dia: 29, produto: "Artigo Qualis A3", tipo: "Artigo Qualis A3", vagas: 5, preco: 240, custo: 1750, taxaPorTema: 350,
        veiculo: "Revista Artefactum · certificado em 7 dias",
        temas: [
          { areas: "Cirurgia Geral · Radiologia Intervencionista", titulo: "Colecistostomia Percutânea na Colecistite Aguda do Paciente de Alto Risco" },
          { areas: "Urologia · Nefrologia", titulo: "Litíase Urinária de Repetição: Investigação Metabólica e Estratégias de Prevenção" },
          { areas: "Dermatologia", titulo: "Vitiligo: Estratégias Terapêuticas Atuais e Impacto Psicossocial" },
          { areas: "Ortopedia · Neurologia", titulo: "Síndrome do Túnel do Carpo: Tratamento Conservador e Retorno ao Trabalho" },
          { areas: "Ginecologia e Obstetrícia", titulo: "Infertilidade Feminina: Investigação Inicial e Critérios de Encaminhamento" },
        ],
      },
      {
        dia: 30, produto: "Apresentação em congresso", tipo: "Apresentação", vagas: 10, preco: 110, custo: 67.92, taxaPorTema: 16.98,
        veiculo: "Anais do Congresso · certificado em 15 dias",
        temas: [
          { areas: "Clínica Médica · Hematologia", titulo: "Doença Falciforme: Crise Vaso-Oclusiva e Manejo da Dor" },
          { areas: "Infectologia · Emergência", titulo: "Profilaxia Pós-Exposição ao HIV: Indicações e Seguimento Ambulatorial" },
          { areas: "Pediatria · Nefrologia", titulo: "Síndrome Nefrótica na Infância: Diagnóstico e Resposta à Corticoterapia" },
          { areas: "Neurologia", titulo: "Cefaleia em Salvas: Reconhecimento Clínico e Tratamento Abortivo" },
        ],
      },
      {
        dia: 31, produto: "Artigo PSU / LILACS", tipo: "Artigo PSU", vagas: 4, preco: 600, custo: 2000, taxaPorTema: 500,
        veiculo: "Fisioterapia Brasil · Qualis B2 · LILACS · certificado em 30 dias",
        temas: [
          { areas: "Cirurgia Geral · Oncologia · Fisioterapia", titulo: "Duodenopancreatectomia: Fisioterapia no Pós-Operatório e Complicações Pulmonares" },
          { areas: "Cirurgia Geral · Cirurgia Torácica · Fisioterapia", titulo: "Drenagem Torácica no Empiema Pleural: Fisioterapia Respiratória e Reexpansão Pulmonar" },
          { areas: "Clínica Médica · Pneumologia · Fisioterapia", titulo: "Doença Pulmonar Intersticial Fibrosante: Reabilitação Pulmonar e Capacidade de Exercício" },
          { areas: "Reumatologia · Clínica Médica · Fisioterapia", titulo: "Espondilite Anquilosante: Exercício Terapêutico e Preservação da Mobilidade" },
        ],
      },
    ],
  },
];
