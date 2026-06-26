/* ============================================================
 *  PublicaMED · importação única do SEED para o Supabase
 * ------------------------------------------------------------
 *  Lê a constante SEED diretamente do .jsx ORIGINAL (fonte da
 *  verdade, UTF-8 limpo), normaliza nas tabelas do schema e
 *  popula o banco usando a service_role key (ignora RLS).
 *
 *  Pré-requisitos:
 *    1. Aplicar supabase/schema.sql no projeto Supabase.
 *    2. Definir no .env (ou no ambiente):
 *         SUPABASE_URL=https://SEU-PROJETO.supabase.co
 *         SUPABASE_SERVICE_ROLE_KEY=...          (NUNCA no front!)
 *    3. npm install
 *
 *  Uso:
 *    node scripts/import-seed.mjs --dry-run      # só mostra o que faria
 *    node scripts/import-seed.mjs                # importa (aborta se já houver dados)
 *    node scripts/import-seed.mjs --reset        # apaga tudo e reimporta
 *    node scripts/import-seed.mjs --source ./publicamed_sistema.jsx
 *
 *  Por que ler do .jsx em vez de copiar o SEED?
 *    Evita duplicar/corromper os dados. O .jsx do cliente está em
 *    UTF-8 correto; o script detecta e corrige mojibake por
 *    segurança caso a fonte esteja com encoding quebrado.
 * ============================================================ */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

// dotenv é opcional: se instalado, carrega o .env automaticamente.
try { await import('dotenv/config'); } catch { /* usa env do ambiente */ }

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

/* ---------- args ---------- */
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const valOf = (f, def) => {
  const i = argv.indexOf(f);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const DRY = has('--dry-run');
const RESET = has('--reset');
const SOURCE = resolve(
  ROOT,
  valOf('--source', process.env.SEED_SOURCE || 'publicamed_sistema.jsx')
);

/* ---------- log helpers ---------- */
const log = (...a) => console.log(...a);
const ok = (s) => log(`  \x1b[32m✓\x1b[0m ${s}`);
const warn = (s) => log(`  \x1b[33m!\x1b[0m ${s}`);
const die = (s) => { console.error(`\n\x1b[31m✗ ${s}\x1b[0m\n`); process.exit(1); };

/* ============================================================
 *  1. Extrair o objeto SEED do arquivo .jsx (casamento de chaves)
 * ============================================================ */
function extractSeed(src) {
  const marker = 'const SEED = ';
  const at = src.indexOf(marker);
  if (at < 0) die(`Nao encontrei "const SEED = " em ${SOURCE}`);
  const start = src.indexOf('{', at);
  if (start < 0) die('Nao encontrei o inicio do objeto SEED.');

  let depth = 0, inStr = false, esc = false, end = -1;
  for (let k = start; k < src.length; k++) {
    const c = src[k];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
    } else if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}') { if (--depth === 0) { end = k; break; } }
  }
  if (end < 0) die('Nao consegui casar as chaves do objeto SEED.');
  try {
    return JSON.parse(src.slice(start, end + 1));
  } catch (e) {
    die(`O objeto SEED nao e JSON valido: ${e.message}`);
  }
}

/* ============================================================
 *  2. Correção de mojibake (UTF-8 lido como Latin-1)
 *     "Ã­" -> "í", "Ã£" -> "ã", etc.
 * ============================================================ */
const demojibake = (s) => Buffer.from(s, 'latin1').toString('utf8');

// "Â"/"Ã" seguido de um byte de continuação UTF-8 (..¿) é a
// assinatura inequívoca de UTF-8 lido como Latin-1. Texto PT-BR limpo nunca
// produz esses pares (em "SÃO", o "Ã" é seguido de "O", fora da faixa),
// então não há falso-positivo capaz de corromper dado já correto.
const MOJIBAKE_RE = /[\u00C2\u00C3][\u0080-\u00BF]/;

function looksMojibake(seed) {
  // varre TODAS as strings ricas em acento (temas + faculdades), não só uma
  // amostra, para não deixar passar mojibake escondido em linhas finais.
  const sample = JSON.stringify(seed.temas || []) + JSON.stringify(seed.facs || []);
  return MOJIBAKE_RE.test(sample);
}
function deepFix(v) {
  if (typeof v === 'string') return demojibake(v);
  if (Array.isArray(v)) return v.map(deepFix);
  if (v && typeof v === 'object') {
    const o = {};
    for (const k in v) o[k] = deepFix(v[k]);
    return o;
  }
  return v;
}

/* ============================================================
 *  3. Transformações SEED -> linhas das tabelas
 * ============================================================ */
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

// trim + remove "lixo" no início do nome (bullets/ZWNJ/asteriscos que sobram
// em algumas linhas após corrigir o encoding), preservando letras acentuadas.
const limpaNome = (s) => (s || '').trim().replace(/^[^\p{L}\p{N}]+/u, '').trim();

function build(seed) {
  const temas = seed.temas || [];
  const facs = seed.facs || [];
  const facUF = seed.facUF || [];
  const vendasRaw = seed.vendas || [];
  const trabalhosRaw = seed.trabalhos || [];
  const financeiroRaw = seed.financeiro || [];

  // -- faculdades (índice 0 de facs é "" = "sem faculdade", ignorado) --
  const faculdades = [];
  const facNomes = new Set();
  for (let i = 1; i < facs.length; i++) {
    const nome = (facs[i] || '').trim();
    if (!nome || facNomes.has(nome)) continue;
    facNomes.add(nome);
    faculdades.push({ nome, uf: facUF[i] || 'N/I' });
  }

  // -- vendas (resolvendo nome da faculdade; id vem após insert) --
  // [data, nome, email, facIdx, uf, tipo, valor, temaIdx]
  const vendas = vendasRaw.map((r) => {
    const facIdx = r[3];
    const facNome = facIdx && facs[facIdx] ? facs[facIdx].trim() : '';
    const temaIdx = r[7];
    return {
      data: r[0] || null,
      nome: limpaNome(r[1]),
      email: (r[2] || '').trim(),
      _facNome: facNome,                                   // resolvido p/ faculdade_id depois
      uf: r[4] || 'N/I',
      tipo: r[5] || 'Outro',
      valor: typeof r[6] === 'number' ? r[6] : parseFloat(String(r[6]).replace(',', '.')) || 0,
      tema: temaIdx != null && temas[temaIdx] ? temas[temaIdx] : '',
    };
  });

  // vendas cujo campo "email" não parece email (dado bruto da planilha)
  const emailsSuspeitos = vendas.filter((v) => v.email && !v.email.includes('@')).length;

  // -- publicações + participantes (porta construirTemas do front) --
  let participantesDedup = 0;
  const pubMap = {};
  for (const v of vendas) {
    const t = (v.tema || '').trim();
    if (!t) continue;
    if (!pubMap[t]) {
      pubMap[t] = { tema: t, tipo: v.tipo || 'Artigo', area: '', vagas: 6, requer_graduado: false, _tipos: {}, _parts: [] };
    }
    const tp = v.tipo || 'Artigo';
    pubMap[t]._tipos[tp] = (pubMap[t]._tipos[tp] || 0) + 1;
    const jaTem = v.email && pubMap[t]._parts.some((p) => p.email === v.email);
    if (!jaTem) {
      pubMap[t]._parts.push({
        nome: v.nome || '',
        email: v.email || '',
        faculdade: v._facNome || '',
        autor_principal: false,
        graduado: /formad|graduad|méd/i.test(v._facNome || ''),
      });
    } else {
      participantesDedup++;
    }
  }
  const publicacoes = Object.values(pubMap).map((p) => {
    const ord = Object.entries(p._tipos).sort((a, b) => b[1] - a[1]);
    p.tipo = ord.length ? ord[0][0] : 'Artigo';
    return p;
  });

  // -- trabalhos [titulo, tipo, status] --
  // pula títulos vazios e linhas-lixo herdadas da planilha (resumos).
  const TRAB_LIXO = new Set(['', 'lucro total', 'total']);
  let trabalhosPulados = 0;
  const trabalhos = trabalhosRaw
    .filter((t) => {
      const titulo = (t[0] || '').trim();
      const lixo = titulo.length === 0 || TRAB_LIXO.has(titulo.toLowerCase());
      if (lixo) trabalhosPulados++;
      return !lixo;
    })
    .map((t) => ({ titulo: (t[0] || '').trim(), tipo: t[1] || 'Artigo', status: t[2] || 'A fazer' }));

  // -- financeiro -- (ordem fixa Jan..Dez pelo nome do mês, robusto a reordenação)
  const financeiro = financeiroRaw.map((f, i) => {
    const idxMes = MESES.indexOf(f.mes);
    return {
      mes: f.mes,
      ordem: idxMes >= 0 ? idxMes : i,
      faturamento: f.faturamento || 0,
      taxa_publicacao: f.taxaPublicacao || 0,
      custo_ads: f.custoAds || 0,
      custo_fixo: f.custoFixo || 0,
      custo_extra: f.custoExtra || 0,
    };
  });

  return {
    faculdades, vendas, publicacoes, trabalhos, financeiro,
    trabalhosPulados, participantesDedup, emailsSuspeitos,
  };
}

/* ============================================================
 *  4. Supabase helpers
 * ============================================================ */
let sb = null;
function client() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    die(
      'Faltam variaveis de ambiente.\n' +
      '  Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (no .env ou no ambiente).\n' +
      '  A service_role key fica em: Supabase -> Project Settings -> API -> service_role.\n' +
      '  Use --dry-run para validar a transformacao sem conectar ao banco.'
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

async function insertAll(table, rows, chunk = 500) {
  const out = [];
  for (let i = 0; i < rows.length; i += chunk) {
    const slice = rows.slice(i, i + chunk);
    const { data, error } = await sb.from(table).insert(slice).select();
    if (error) die(`Erro inserindo em "${table}": ${error.message}`);
    out.push(...(data || []));
  }
  return out;
}

async function countRows(table) {
  const { count, error } = await sb.from(table).select('*', { count: 'exact', head: true });
  if (error) die(`Erro contando "${table}": ${error.message} (o schema foi aplicado?)`);
  return count || 0;
}

async function deleteAll(table) {
  // delete exige filtro; "id is not null" casa todas as linhas
  const { error } = await sb.from(table).delete().not('id', 'is', null);
  if (error) die(`Erro limpando "${table}": ${error.message}`);
}

/* ============================================================
 *  5. Main
 * ============================================================ */
const TABELAS = ['faculdades', 'vendas', 'publicacoes', 'participantes', 'trabalhos', 'financeiro'];

async function main() {
  log('\n\x1b[1mPublicaMED · importação do SEED -> Supabase\x1b[0m');
  log(`  fonte: ${SOURCE}`);
  log(`  modo : ${DRY ? 'DRY-RUN (sem gravar)' : RESET ? 'RESET (apaga e reimporta)' : 'INSERT'}\n`);

  // 1. ler + extrair
  let src;
  try { src = readFileSync(SOURCE, 'utf8'); }
  catch { die(`Nao consegui ler o arquivo fonte: ${SOURCE}\n  Use --source <caminho do .jsx>.`); }

  let seed = extractSeed(src);

  // 2. corrigir encoding se necessário
  if (looksMojibake(seed)) {
    seed = deepFix(seed);
    warn('Mojibake detectado na fonte -> encoding corrigido automaticamente (Latin-1 -> UTF-8).');
  } else {
    ok('Encoding da fonte OK (UTF-8 limpo).');
  }

  // 3. transformar
  const d = build(seed);
  log('\n  Resumo do que sera importado:');
  log(`    faculdades   : ${d.faculdades.length}`);
  log(`    vendas       : ${d.vendas.length}`);
  log(`    publicações  : ${d.publicacoes.length}`);
  log(`    participantes: ${d.publicacoes.reduce((s, p) => s + p._parts.length, 0)}`);
  log(`    trabalhos    : ${d.trabalhos.length}${d.trabalhosPulados ? ` (${d.trabalhosPulados} sem titulo/lixo, pulados)` : ''}`);
  log(`    financeiro   : ${d.financeiro.length}`);
  if (d.participantesDedup) log(`    (participações duplicadas por email no mesmo tema, ignoradas: ${d.participantesDedup})`);
  if (d.emailsSuspeitos) warn(`${d.emailsSuspeitos} venda(s) com email sem "@" (dado da planilha; importadas como estão).`);

  if (DRY) {
    log('\n  DRY-RUN: nada foi gravado. Exemplos:');
    log('    venda[0]:', JSON.stringify({ ...d.vendas[0], _facNome: undefined }));
    log('    faculdade[0]:', JSON.stringify(d.faculdades[0]));
    log('    publicacao[0]:', JSON.stringify({ ...d.publicacoes[0], _parts: `(${d.publicacoes[0]?._parts.length})`, _tipos: undefined }));
    log('\n\x1b[32mOK (dry-run).\x1b[0m\n');
    return;
  }

  // 4. conectar
  sb = client();

  // 5. checar estado / reset
  if (RESET) {
    log('\n  Limpando tabelas (ordem segura p/ FKs)...');
    for (const t of ['participantes', 'publicacoes', 'vendas', 'faculdades', 'trabalhos', 'financeiro']) {
      await deleteAll(t);
      ok(`limpo: ${t}`);
    }
  } else {
    const counts = await Promise.all(TABELAS.map(countRows));
    const naoVazias = TABELAS.filter((_, i) => counts[i] > 0);
    if (naoVazias.length) {
      die(
        `Ja existem dados em: ${naoVazias.join(', ')}.\n` +
        '  Use --reset para apagar e reimportar, ou --dry-run para apenas validar.'
      );
    }
  }

  // 6. inserir (ordem: pais -> filhos)
  log('\n  Inserindo...');
  const facRows = await insertAll('faculdades', d.faculdades);
  const facId = new Map(facRows.map((f) => [f.nome, f.id]));
  ok(`faculdades: ${facRows.length}`);

  const vendasRows = d.vendas.map((v) => ({
    data: v.data, nome: v.nome, email: v.email,
    faculdade_id: v._facNome ? facId.get(v._facNome) || null : null,
    uf: v.uf, tipo: v.tipo, valor: v.valor, tema: v.tema,
  }));
  const vIns = await insertAll('vendas', vendasRows);
  ok(`vendas: ${vIns.length}`);

  const pubInsert = d.publicacoes.map((p) => ({
    tema: p.tema, tipo: p.tipo, area: p.area,
    vagas: Math.max(1, p.vagas || 6), requer_graduado: p.requer_graduado,
  }));
  const pubRows = await insertAll('publicacoes', pubInsert);
  const pubId = new Map(pubRows.map((p) => [p.tema, p.id]));
  ok(`publicações: ${pubRows.length}`);

  const partRows = [];
  for (const p of d.publicacoes) {
    const pid = pubId.get(p.tema);
    if (!pid) continue;
    for (const part of p._parts) partRows.push({ publicacao_id: pid, ...part });
  }
  const partIns = await insertAll('participantes', partRows);
  ok(`participantes: ${partIns.length}`);

  const trabIns = await insertAll('trabalhos', d.trabalhos);
  ok(`trabalhos: ${trabIns.length}`);

  const finIns = await insertAll('financeiro', d.financeiro);
  ok(`financeiro: ${finIns.length}`);

  log('\n\x1b[32m✓ Importação concluída.\x1b[0m\n');
}

main().catch((e) => die(e.stack || e.message));
