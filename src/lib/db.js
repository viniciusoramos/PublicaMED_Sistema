import { supabase } from './supabase.js';

// false quando faltam as variáveis VITE_ no build (evita tela branca)
export const ENV_OK = !!supabase;

/* ============================================================
 *  Camada de dados · Supabase
 *  Converte entre as linhas do banco (snake_case) e os formatos
 *  que os componentes do painel já esperam (camelCase), e expõe
 *  CRUD por linha. Substitui o antigo `store` (window.storage).
 * ============================================================ */

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
  participantes: (p.participantes || []).map(partDe),
});

/* ---------- carga inicial (tudo de uma vez) ---------- */
export async function carregarTudo() {
  const [v, t, f, p, fac] = await Promise.all([
    supabase.from('vendas').select('*, faculdades(nome)'),
    supabase.from('trabalhos').select('*').order('criado_em', { ascending: false }),
    supabase.from('financeiro').select('*'),
    supabase.from('publicacoes').select('*, participantes(*)').order('criado_em', { ascending: false }),
    supabase.from('faculdades').select('id, nome, uf').order('nome', { ascending: true }),
  ]);
  const erro = v.error || t.error || f.error || p.error || fac.error;
  if (erro) throw erro;
  return {
    vendas: v.data.map(vendaDe),
    trabalhos: t.data.map((x) => ({ id: x.id, titulo: x.titulo, tipo: x.tipo, status: x.status, criadoEm: x.criado_em, localPublicacao: x.local_publicacao || '' })),
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
  nome: d.nome || '',
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
    nome: p.nome || '',
    email: p.email || '',
    faculdade: p.faculdade || '',
    orcid: p.orcid || '',
    telefone: p.telefone || '',
    autor_principal: !!p.autorPrincipal,
    graduado: !!p.graduado,
  }).select().single();
  if (error) throw error;
  return partDe(data);
}
export async function atualizarParticipante(id, p) {
  const { data, error } = await supabase.from('participantes').update({
    nome: p.nome || '',
    email: p.email || '',
    faculdade: p.faculdade || '',
    orcid: p.orcid || '',
    telefone: p.telefone || '',
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
    origem: 'extra',
    ordem: t.ordem ?? 99,
  }).select().single();
  if (error) throw error;
  return planTemaDe(data);
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
