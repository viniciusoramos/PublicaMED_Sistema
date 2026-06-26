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
});
const partDe = (x) => ({
  id: x.id,
  nome: x.nome || '',
  faculdade: x.faculdade || '',
  email: x.email || '',
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
  participantes: (p.participantes || []).map(partDe),
});

/* ---------- carga inicial (tudo de uma vez) ---------- */
export async function carregarTudo() {
  const [v, t, f, p, fac] = await Promise.all([
    supabase.from('vendas').select('*, faculdades(nome)'),
    supabase.from('trabalhos').select('*').order('criado_em', { ascending: true }),
    supabase.from('financeiro').select('*'),
    supabase.from('publicacoes').select('*, participantes(*)').order('criado_em', { ascending: false }),
    supabase.from('faculdades').select('id, nome, uf').order('nome', { ascending: true }),
  ]);
  const erro = v.error || t.error || f.error || p.error || fac.error;
  if (erro) throw erro;
  return {
    vendas: v.data.map(vendaDe),
    trabalhos: t.data.map((x) => ({ id: x.id, titulo: x.titulo, tipo: x.tipo, status: x.status })),
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
  const { data, error } = await supabase.from('vendas').update(await vendaLinha(d)).eq('id', id).select('*, faculdades(nome)').single();
  if (error) throw error;
  return vendaDe(data);
}
export async function removerVenda(id) {
  const { error } = await supabase.from('vendas').delete().eq('id', id);
  if (error) throw error;
}

/* ---------- trabalhos ---------- */
export async function criarTrabalho(d) {
  const { data, error } = await supabase.from('trabalhos')
    .insert({ titulo: d.titulo || '', tipo: d.tipo || 'Artigo', status: d.status || 'A fazer' }).select().single();
  if (error) throw error;
  return { id: data.id, titulo: data.titulo, tipo: data.tipo, status: data.status };
}
export async function atualizarTrabalho(id, d) {
  const { data, error } = await supabase.from('trabalhos')
    .update({ titulo: d.titulo || '', tipo: d.tipo || 'Artigo', status: d.status || 'A fazer' }).eq('id', id).select().single();
  if (error) throw error;
  return { id: data.id, titulo: data.titulo, tipo: data.tipo, status: data.status };
}
export async function removerTrabalho(id) {
  const { error } = await supabase.from('trabalhos').delete().eq('id', id);
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
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from('publicacoes').update(row).eq('id', id);
  if (error) throw error;
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
    autor_principal: !!p.autorPrincipal,
    graduado: !!p.graduado,
  }).select().single();
  if (error) throw error;
  return partDe(data);
}
export async function removerParticipante(id) {
  const { error } = await supabase.from('participantes').delete().eq('id', id);
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
