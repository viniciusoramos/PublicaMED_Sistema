import { supabase } from './supabase.js';

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
});
const finDe = (r) => ({
  id: r.id,
  mes: r.mes,
  ordem: r.ordem,
  faturamento: Number(r.faturamento) || 0,
  taxaPublicacao: Number(r.taxa_publicacao) || 0,
  custoAds: Number(r.custo_ads) || 0,
  custoFixo: Number(r.custo_fixo) || 0,
  custoExtra: Number(r.custo_extra) || 0,
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
    supabase.from('financeiro').select('*').order('ordem', { ascending: true }),
    supabase.from('publicacoes').select('*, participantes(*)'),
    supabase.from('faculdades').select('id, nome, uf').order('nome', { ascending: true }),
  ]);
  const erro = v.error || t.error || f.error || p.error || fac.error;
  if (erro) throw erro;
  return {
    vendas: v.data.map(vendaDe),
    trabalhos: t.data.map((x) => ({ id: x.id, titulo: x.titulo, tipo: x.tipo, status: x.status })),
    financeiro: f.data.map(finDe),
    temas: p.data.map(pubDe).sort((a, b) => b.participantes.length - a.participantes.length),
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
  const { data, error } = await supabase.from('vendas').insert(await vendaLinha(d)).select('*, faculdades(nome)').single();
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

/* ---------- financeiro (só atualização; 12 linhas fixas) ---------- */
export async function atualizarFinanceiro(id, d) {
  const { data, error } = await supabase.from('financeiro').update({
    faturamento: d.faturamento || 0,
    taxa_publicacao: d.taxaPublicacao || 0,
    custo_ads: d.custoAds || 0,
    custo_fixo: d.custoFixo || 0,
    custo_extra: d.custoExtra || 0,
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
  const { data } = await supabase.auth.getSession();
  return data.session;
}
export function aoMudarAuth(cb) {
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
