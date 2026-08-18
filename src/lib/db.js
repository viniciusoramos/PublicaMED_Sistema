import { supabase } from './supabase.js';

// false quando faltam as variáveis VITE_ no build (evita tela branca)
export const ENV_OK = !!supabase;

/* ============================================================
 *  Camada de dados · Supabase
 *  Converte entre as linhas do banco (snake_case) e os formatos
 *  que os componentes do painel já esperam (camelCase), e expõe
 *  CRUD por linha. Substitui o antigo `store` (window.storage).
 * ============================================================ */

/* Nome de pessoa no padrão de nome próprio, seja como for digitado:
 *   "FLÁVIO RUI DE SOUZA JÚNIOR" e "flávio rui de souza júnior"
 *   viram "Flávio Rui de Souza Júnior".
 * Conectivos ficam minúsculos (menos quando abrem o nome), como se escreve em português,
 * e o que vem depois de hífen ou apóstrofo continua maiúsculo (D'Ávila, Silva-Souza).
 * Fica aqui, na camada de dados, para valer em qualquer tela que grave nome. */
const CONECTIVOS = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'di', 'du', 'del', 'della', 'la', 'le', 'van', 'von', 'y']);
export const nomeProprio = (s) => {
  const limpo = String(s ?? '').trim().replace(/\s+/g, ' ');
  if (!limpo) return '';
  return limpo.split(' ').map((palavra, i) => {
    const min = palavra.toLocaleLowerCase('pt-BR');
    if (i > 0 && CONECTIVOS.has(min)) return min;
    return min.replace(/(^|[-'’])(\p{L})/gu, (_, sep, letra) => sep + letra.toLocaleUpperCase('pt-BR'));
  }).join(' ');
};

/* CPF é guardado só com os dígitos; a formatação fica na tela. */
const soDigitos = (s) => String(s ?? '').replace(/\D/g, '');

/* ---------- mapeamento banco -> componente ---------- */
const vendaDe = (r) => ({
  id: r.id,
  data: r.data,
  nome: r.nome || '',
  email: r.email || '',
  faculdade: r.faculdades ? r.faculdades.nome : '',
  uf: r.uf || 'N/I',
  tipo: r.tipo || 'Outro',
  valor: Number(r.valor) || 0,
  tema: r.tema || '',
  faculdade_id: r.faculdade_id || null,
  participanteId: r.participante_id || null,
});
const finDe = (r) => ({
  id: r.id,
  ano: r.ano ?? 2025, // fallback se a migração de 'ano' ainda não rodou
  mes: r.mes,
  ordem: r.ordem,
  faturamento: Number(r.faturamento) || 0,
  taxaPublicacao: Number(r.taxa_publicacao) || 0,
  custoAds: Number(r.custo_ads) || 0,
  custoFixo: Number(r.custo_fixo) || 0,
  custoExtra: Number(r.custo_extra) || 0,
  custoExtraDesc: r.custo_extra_desc || '',
  faturamentoAjuste: Number(r.faturamento_ajuste) || 0,
});
const partDe = (x) => ({
  id: x.id,
  nome: x.nome || '',
  faculdade: x.faculdade || '',
  email: x.email || '',
  orcid: x.orcid || '',
  telefone: x.telefone || '',
  cpf: x.cpf || '',
  autorPrincipal: !!x.autor_principal,
  graduado: !!x.graduado,
});
const pubDe = (p) => ({
  id: p.id,
  criadoEm: p.criado_em,
  nome: p.tema,
  area: p.area || '',
  maxVagas: p.vagas,
  tipo: p.tipo || 'Artigo',
  requiresGrad: !!p.requer_graduado,
  taxa: Number(p.taxa) || 0,
  taxaLancada: !!p.taxa_lancada,
  taxaData: p.taxa_data || null,
  certificadoUrl: p.certificado_url || '',
  // trabalho publicado: não vende mais vaga, mesmo que tenha sobrado. Nulo = ainda em venda.
  fechadaEm: p.fechada_em || null,
  participantes: (p.participantes || []).map(partDe),
});

/* ---------- carga inicial (tudo de uma vez) ---------- */
export async function carregarTudo() {
  const [v, t, f, p, fac, it] = await Promise.all([
    supabase.from('vendas').select('*, faculdades(nome)'),
    supabase.from('trabalhos').select('*').order('criado_em', { ascending: false }),
    supabase.from('financeiro').select('*'),
    supabase.from('publicacoes').select('*, participantes(*)').order('criado_em', { ascending: false }),
    supabase.from('faculdades').select('id, nome, uf').order('nome', { ascending: true }),
    supabase.from('financeiro_itens').select('*').order('criado_em', { ascending: true }),
  ]);
  const erro = v.error || t.error || f.error || p.error || fac.error;
  if (erro) throw erro;
  return {
    vendas: v.data.map(vendaDe),
    trabalhos: t.data.map((x) => ({ id: x.id, titulo: x.titulo, tipo: x.tipo, status: x.status, criadoEm: x.criado_em, localPublicacao: x.local_publicacao || '' })),
    // itens são opcionais: se a migração 19 ainda não rodou, a tela funciona sem detalhamento
    financeiroItens: it.error ? [] : (it.data || []).map(itemDe),
    financeiro: f.data.map(finDe).sort((a, b) => (a.ano - b.ano) || (a.ordem - b.ordem)),
    temas: p.data.map(pubDe).sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || '')),
    faculdades: fac.data,
  };
}

/* ---------- faculdades: resolve nome -> id (cria se nova) ---------- */
async function faculdadeId(nome, uf) {
  const n = (nome || '').trim();
  if (!n) return null;
  const achou = await supabase.from('faculdades').select('id').eq('nome', n).maybeSingle();
  if (achou.error) throw achou.error;
  if (achou.data) return achou.data.id;
  const nova = await supabase.from('faculdades').insert({ nome: n, uf: uf || 'N/I' }).select('id').single();
  if (nova.error) throw nova.error;
  return nova.data.id;
}

const vendaLinha = async (d) => ({
  data: d.data || null,
  nome: nomeProprio(d.nome),
  email: d.email || '',
  faculdade_id: await faculdadeId(d.faculdade, d.uf),
  uf: d.uf || 'N/I',
  tipo: d.tipo || 'Outro',
  valor: d.valor || 0,
  tema: d.tema || '',
});

/* ---------- vendas ---------- */
export async function criarVenda(d) {
  const row = await vendaLinha(d);
  if (d.participanteId) row.participante_id = d.participanteId;
  const { data, error } = await supabase.from('vendas').insert(row).select('*, faculdades(nome)').single();
  if (error) throw error;
  return vendaDe(data);
}
export async function atualizarVenda(id, d) {
  const row = await vendaLinha(d);
  if (d.participanteId) row.participante_id = d.participanteId; // cura/garante o vínculo com o participante
  const { data, error } = await supabase.from('vendas').update(row).eq('id', id).select('*, faculdades(nome)').single();
  if (error) throw error;
  return vendaDe(data);
}
// procura a venda de um participante direto no banco (confiável, evita duplicar): por vínculo, senão por tema+nome
export async function buscarVendaDoParticipante(participanteId, tema, nome) {
  if (participanteId) {
    const r = await supabase.from('vendas').select('*, faculdades(nome)').eq('participante_id', participanteId).limit(1);
    if (r.error) throw r.error;
    if (r.data && r.data.length) return vendaDe(r.data[0]);
  }
  const n = (nome || '').trim();
  if (tema && n) {
    const r = await supabase.from('vendas').select('*, faculdades(nome)').eq('tema', tema).ilike('nome', n).limit(1);
    if (r.error) throw r.error;
    if (r.data && r.data.length) return vendaDe(r.data[0]);
  }
  return null;
}
export async function removerVenda(id) {
  const { error } = await supabase.from('vendas').delete().eq('id', id);
  if (error) throw error;
}
// renomeia o tema (nome da publicação) em todas as vendas ligadas — 1 update em lote
export async function renomearTemaVendas(antigo, novo) {
  if (!antigo || antigo === novo) return;
  const { error } = await supabase.from('vendas').update({ tema: novo }).eq('tema', antigo);
  if (error) throw error;
}

/* ---------- trabalhos ---------- */
export async function criarTrabalho(d) {
  const { data, error } = await supabase.from('trabalhos')
    .insert({ titulo: d.titulo || '', tipo: d.tipo || 'Artigo', status: d.status || 'A fazer', local_publicacao: d.localPublicacao || '' }).select().single();
  if (error) throw error;
  return { id: data.id, titulo: data.titulo, tipo: data.tipo, status: data.status, criadoEm: data.criado_em, localPublicacao: data.local_publicacao || '' };
}
export async function atualizarTrabalho(id, d) {
  const { data, error } = await supabase.from('trabalhos')
    .update({ titulo: d.titulo || '', tipo: d.tipo || 'Artigo', status: d.status || 'A fazer', local_publicacao: d.localPublicacao || '' }).eq('id', id).select().single();
  if (error) throw error;
  return { id: data.id, titulo: data.titulo, tipo: data.tipo, status: data.status, criadoEm: data.criado_em, localPublicacao: data.local_publicacao || '' };
}
export async function removerTrabalho(id) {
  const { error } = await supabase.from('trabalhos').delete().eq('id', id);
  if (error) throw error;
}
// atualiza só o título do trabalho (não toca nas outras colunas)
export async function renomearTrabalho(id, titulo) {
  const { error } = await supabase.from('trabalhos').update({ titulo: titulo || '' }).eq('id', id);
  if (error) throw error;
}
// atualiza só o local de publicação do trabalho
export async function atualizarLocalTrabalho(id, local) {
  const { error } = await supabase.from('trabalhos').update({ local_publicacao: local || '' }).eq('id', id);
  if (error) throw error;
}

const MESES_DB = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

/* ---------- itens de custo (o "do que é" de cada custo do mês) ----------
 * A coluna numérica do mês continua sendo o total — é dela que saem os
 * relatórios. Os itens detalham esse total e são somados a ele ao entrar
 * e descontados ao sair, então os dois nunca se contradizem. */
const itemDe = (r) => ({ id: r.id, mesId: r.financeiro_id, campo: r.campo, descricao: r.descricao || '', valor: Number(r.valor) || 0, recorrente: !!r.recorrente, criadoEm: r.criado_em });
/* Um custo fixo entra em vários meses de uma vez (ele se repete), então a
 * inserção é em lote: uma linha por mês alvo. */
export async function criarItensFinanceiro(linhas) {
  const { data, error } = await supabase.from('financeiro_itens').insert(
    linhas.map((l) => ({
      financeiro_id: l.mesId, campo: l.campo, valor: l.valor || 0,
      descricao: (l.descricao || '').trim(), recorrente: !!l.recorrente,
    }))
  ).select();
  if (error) throw error;
  return data.map(itemDe);
}
export async function removerItensFinanceiro(ids) {
  if (!ids.length) return;
  const { error } = await supabase.from('financeiro_itens').delete().in('id', ids);
  if (error) throw error;
}

/* ---------- financeiro (por ano) ---------- */
export async function criarAnoFinanceiro(ano) {
  const linhas = MESES_DB.map((mes, i) => ({ ano, mes, ordem: i, faturamento: 0, taxa_publicacao: 0, custo_ads: 0, custo_fixo: 0, custo_extra: 0 }));
  const { data, error } = await supabase.from('financeiro').insert(linhas).select();
  if (error) throw error;
  return data.map(finDe).sort((a, b) => a.ordem - b.ordem);
}
export async function atualizarFinanceiro(id, d) {
  const { data, error } = await supabase.from('financeiro').update({
    faturamento: d.faturamento || 0,
    taxa_publicacao: d.taxaPublicacao || 0,
    custo_ads: d.custoAds || 0,
    custo_fixo: d.custoFixo || 0,
    custo_extra: d.custoExtra || 0,
    custo_extra_desc: d.custoExtraDesc || '',
    faturamento_ajuste: d.faturamentoAjuste || 0,
  }).eq('id', id).select().single();
  if (error) throw error;
  return finDe(data);
}

/* ---------- publicações + participantes ---------- */
export async function criarPublicacao(d) {
  const { data, error } = await supabase.from('publicacoes').insert({
    tema: d.nome || d.tema || '',
    tipo: d.tipo || 'Artigo',
    area: d.area || '',
    vagas: d.maxVagas || 6,
    requer_graduado: !!d.requiresGrad,
  }).select('*, participantes(*)').single();
  if (error) throw error;
  return pubDe(data);
}
export async function atualizarPublicacao(id, campos) {
  const row = {};
  if ('maxVagas' in campos) row.vagas = campos.maxVagas;
  if ('tipo' in campos) row.tipo = campos.tipo;
  if ('requiresGrad' in campos) row.requer_graduado = campos.requiresGrad;
  if ('area' in campos) row.area = campos.area;
  if ('nome' in campos) row.tema = campos.nome;
  if ('taxa' in campos) row.taxa = campos.taxa;
  if ('taxaLancada' in campos) row.taxa_lancada = campos.taxaLancada;
  if ('taxaData' in campos) row.taxa_data = campos.taxaData;
  if ('certificadoUrl' in campos) row.certificado_url = campos.certificadoUrl;
  if ('fechadaEm' in campos) row.fechada_em = campos.fechadaEm; // null reabre a publicação
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from('publicacoes').update(row).eq('id', id);
  if (error) throw error;
}
// sobe o PDF do certificado da publicação pro Storage e devolve a URL pública (com cache-bust)
export async function uploadCertificado(pubId, file) {
  const path = `${pubId}.pdf`;
  const up = await supabase.storage.from('certificados').upload(path, file, { upsert: true, contentType: 'application/pdf' });
  if (up.error) throw up.error;
  const { data } = supabase.storage.from('certificados').getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}
export async function removerPublicacao(id) {
  const { error } = await supabase.from('publicacoes').delete().eq('id', id);
  if (error) throw error;
}
export async function adicionarParticipante(publicacaoId, p) {
  const { data, error } = await supabase.from('participantes').insert({
    publicacao_id: publicacaoId,
    nome: nomeProprio(p.nome),
    email: p.email || '',
    faculdade: p.faculdade || '',
    orcid: p.orcid || '',
    telefone: p.telefone || '',
    cpf: soDigitos(p.cpf),
    autor_principal: !!p.autorPrincipal,
    graduado: !!p.graduado,
  }).select().single();
  if (error) throw error;
  return partDe(data);
}
/* O CPF é da pessoa, não da participação: ao gravar num participante, as outras
 * participações da mesma pessoa que ainda estão sem CPF recebem o mesmo valor.
 * Casamos por e-mail (chave que o resto do sistema já usa para identificar cliente);
 * sem e-mail, exigimos nome e faculdade iguais para não misturar homônimos. */
export async function propagarCpf(p) {
  const cpf = soDigitos(p.cpf);
  if (!cpf) return [];
  let q = supabase.from('participantes').update({ cpf }).eq('cpf', '');
  const email = (p.email || '').trim();
  if (email) {
    q = q.ilike('email', email);
  } else {
    const nome = nomeProprio(p.nome);
    const fac = (p.faculdade || '').trim();
    if (!nome || !fac) return [];
    q = q.eq('nome', nome).eq('faculdade', fac);
  }
  const { data, error } = await q.select('id');
  if (error) throw error;
  return data || [];
}
export async function atualizarParticipante(id, p) {
  const { data, error } = await supabase.from('participantes').update({
    nome: nomeProprio(p.nome),
    email: p.email || '',
    faculdade: p.faculdade || '',
    orcid: p.orcid || '',
    telefone: p.telefone || '',
    cpf: soDigitos(p.cpf),
    autor_principal: !!p.autorPrincipal,
    graduado: !!p.graduado,
  }).eq('id', id).select().single();
  if (error) throw error;
  return partDe(data);
}
export async function removerParticipante(id) {
  const { error } = await supabase.from('participantes').delete().eq('id', id);
  if (error) throw error;
}

/* ---------- planejamento editorial (cronograma) ----------
 * Sai no mesmo formato do antigo src/planejamento.js, então a tela do
 * calendário não precisa saber se o cronograma veio do banco ou do arquivo.
 * Cada tema traz o id (para editar) e o par extra/removido:
 *   extra    = acrescentado pela tela, não fazia parte do plano do mês
 *   removido = tirado do cronograma, mas guardado para poder restaurar
 */
const planTemaDe = (t) => ({
  id: t.id,
  titulo: t.titulo || '',
  areas: t.areas || '',
  taxa: t.taxa == null ? undefined : Number(t.taxa),
  exigeGraduado: t.exige_graduado == null ? undefined : !!t.exige_graduado,
  // próprios do tema; nulo = herda do lançamento do dia
  tipo: t.tipo || undefined,
  vagas: t.vagas == null ? undefined : t.vagas,
  preco: t.preco == null ? undefined : Number(t.preco),
  extra: t.origem === 'extra',
  removido: !!t.removido,
});
const planLancDe = (l) => ({
  id: l.id,
  dia: l.dia,
  produto: l.produto || '',
  tipo: l.tipo || 'Artigo',
  vagas: l.vagas,
  preco: Number(l.preco) || 0,
  custo: Number(l.custo) || 0,
  veiculo: l.veiculo || '',
  taxaPorTema: l.taxa_por_tema == null ? undefined : Number(l.taxa_por_tema),
  exigeGraduado: !!l.exige_graduado,
  avulso: !!l.avulso, // criado para segurar trabalho de um dia fora do planejamento
  temas: (l.planejamento_temas || [])
    .slice()
    .sort((a, b) => (a.ordem - b.ordem) || (a.criado_em || '').localeCompare(b.criado_em || ''))
    .map(planTemaDe),
});

// devolve null (em vez de estourar) quando as tabelas ainda não existem no banco:
// a tela cai no cronograma do arquivo, em modo leitura, até o SQL ser aplicado
export async function carregarPlanejamentos() {
  const { data, error } = await supabase
    .from('planejamentos')
    .select('*, planejamento_lancamentos(*, planejamento_temas(*))')
    .order('id', { ascending: false });
  if (error) {
    // tabela ainda não criada: o PostgREST responde PGRST205 ("não achei no schema cache")
    // e o Postgres, 42P01. Nos dois casos não é falha — é o SQL que ainda não foi aplicado.
    if (error.code === 'PGRST205' || error.code === '42P01'
        || /schema cache|does not exist/i.test(error.message || '')) return null;
    throw error;
  }
  if (!data || !data.length) return null;
  return data.map((p) => ({
    id: p.id,
    ano: p.ano,
    mes: p.mes,
    meta: Number(p.meta) || 0,
    conversao: Number(p.conversao) || 0.8,
    nota: p.nota || '',
    lancamentos: (p.planejamento_lancamentos || []).slice().sort((a, b) => a.dia - b.dia).map(planLancDe),
  }));
}
export async function adicionarTemaPlano(lancamentoId, t) {
  const { data, error } = await supabase.from('planejamento_temas').insert({
    lancamento_id: lancamentoId,
    titulo: t.titulo || '',
    areas: t.areas || '',
    tipo: t.tipo || null,     // trabalho avulso pode ter tipo diferente do dia
    vagas: t.vagas ?? null,
    preco: t.preco ?? null,
    origem: 'extra',
    ordem: t.ordem ?? 99,
  }).select().single();
  if (error) throw error;
  return planTemaDe(data);
}
/* Garante que existe o mês e o lançamento daquele dia, para pendurar um trabalho avulso.
 * Devolve { plano, lancamento } já no formato da tela. Não mexe no que já existe. */
export async function garantirDiaNoPlano(dataIso, modelo = {}) {
  const ano = Number(dataIso.slice(0, 4));
  const mes = Number(dataIso.slice(5, 7)) - 1; // 0 = janeiro
  const dia = Number(dataIso.slice(8, 10));
  const planoId = `${ano}-${String(mes + 1).padStart(2, '0')}`;

  const achouPlano = await supabase.from('planejamentos').select('*').eq('id', planoId).maybeSingle();
  if (achouPlano.error) throw achouPlano.error;
  if (!achouPlano.data) {
    const novo = await supabase.from('planejamentos')
      .insert({ id: planoId, ano, mes, meta: 0, conversao: 0.8, nota: '' }).select().single();
    if (novo.error) throw novo.error;
  }

  const achouLanc = await supabase.from('planejamento_lancamentos')
    .select('*, planejamento_temas(*)').eq('planejamento_id', planoId).eq('dia', dia).maybeSingle();
  if (achouLanc.error) throw achouLanc.error;
  if (achouLanc.data) return { planoId, lancamento: planLancDe(achouLanc.data) };

  const novoLanc = await supabase.from('planejamento_lancamentos').insert({
    planejamento_id: planoId,
    dia,
    produto: modelo.produto || modelo.tipo || 'Avulso',
    tipo: modelo.tipo || 'Artigo',
    vagas: modelo.vagas || 6,
    preco: modelo.preco || 0,
    custo: 0,
    veiculo: '',
    avulso: true,
  }).select('*, planejamento_temas(*)').single();
  if (novoLanc.error) throw novoLanc.error;
  return { planoId, lancamento: planLancDe(novoLanc.data) };
}
// mantém o tema do cronograma alinhado com a publicação quando ela é renomeada ou muda de
// tipo — sem isso o vínculo (tipo+título) quebra e a publicação some do calendário
export async function atualizarTemaPlano(id, campos) {
  const row = {};
  if ('titulo' in campos) row.titulo = campos.titulo;
  if ('tipo' in campos) row.tipo = campos.tipo;
  if ('areas' in campos) row.areas = campos.areas;
  if (!Object.keys(row).length) return;
  const { error } = await supabase.from('planejamento_temas').update(row).eq('id', id);
  if (error) throw error;
}
// tira/devolve o tema do cronograma. NÃO mexe na publicação nem nos participantes.
export async function marcarTemaPlanoRemovido(id, removido) {
  const { error } = await supabase.from('planejamento_temas').update({ removido: !!removido }).eq('id', id);
  if (error) throw error;
}
// só para temas acrescentados pela tela: não faziam parte do plano, somem de vez
export async function removerTemaPlano(id) {
  const { error } = await supabase.from('planejamento_temas').delete().eq('id', id);
  if (error) throw error;
}

/* ---------- auth ---------- */
export async function sessaoAtual() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}
export function aoMudarAuth(cb) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_e, session) => cb(session));
  return () => data.subscription.unsubscribe();
}
export async function entrar(email, senha) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) throw error;
  return data;
}
export async function sair() {
  await supabase.auth.signOut();
}
