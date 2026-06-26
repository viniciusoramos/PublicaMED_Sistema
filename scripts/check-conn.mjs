/* Diagnóstico rápido: confirma conexão com o Supabase, se o schema
 * foi aplicado e quantas linhas já existem em cada tabela.
 *   node scripts/check-conn.mjs
 * (apague depois; é só verificação) */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
console.log('URL:', url || '(ausente)');
if (!url || !key) { console.error('Faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no .env'); process.exit(1); }

const sb = createClient(url, key, { auth: { persistSession: false } });
const tabelas = ['faculdades', 'vendas', 'publicacoes', 'participantes', 'trabalhos', 'financeiro'];

let faltam = 0;
for (const t of tabelas) {
  const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true });
  if (error) { console.log(`  ${t.padEnd(14)}: ERRO -> ${error.message}`); faltam++; }
  else console.log(`  ${t.padEnd(14)}: ${count} linha(s)`);
}
console.log(faltam ? `\n${faltam} tabela(s) com problema — o schema.sql foi aplicado?` : '\nConexão OK e schema presente.');
