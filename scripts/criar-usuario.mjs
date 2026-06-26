/* Cria um usuário de login e testa o fluxo real de autenticação.
 *   node scripts/criar-usuario.mjs <email> <senha>
 * (usa a service_role para criar; testa login com a anon key) */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const [email, senha] = process.argv.slice(2);
if (!email || !senha) { console.error('uso: node scripts/criar-usuario.mjs <email> <senha>'); process.exit(1); }

const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { error } = await admin.auth.admin.createUser({ email, password: senha, email_confirm: true });
if (error && !/already|exist/i.test(error.message)) { console.error('Erro ao criar:', error.message); process.exit(1); }
console.log(error ? `Usuario ja existia: ${email}` : `Usuario criado: ${email}`);

// fluxo real do app: login com a anon key
const anon = createClient(url, process.env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
const login = await anon.auth.signInWithPassword({ email, password: senha });
if (login.error) { console.error('Login FALHOU:', login.error.message); process.exit(1); }
console.log('Login OK — sessao valida para', login.data.user.email);

// leitura autenticada (valida RLS "authenticated")
const { count, error: e2 } = await anon.from('vendas').select('*', { count: 'exact', head: true });
if (e2) console.error('Leitura pos-login falhou:', e2.message);
else console.log('Leitura autenticada OK — vendas visiveis:', count);
