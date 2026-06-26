import { createClient } from '@supabase/supabase-js';

/* Cliente Supabase do FRONT (browser).
 * Usa a anon key (pública). O acesso real aos dados é liberado
 * apenas após login, pelas policies de RLS ("authenticated").
 * As chaves vêm do .env via Vite (prefixo VITE_). */
const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.warn(
    '[PublicaMED] Variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ausentes. ' +
    'Copie .env.example para .env e preencha.'
  );
}

// Não chama createClient sem URL/key (lançaria erro e quebraria o app):
// quando faltam variáveis, exporta null e o App mostra o aviso de setup.
export const supabase = url && anon ? createClient(url, anon) : null;
