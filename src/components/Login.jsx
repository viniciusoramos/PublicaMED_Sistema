import { useState } from 'react';
import { entrar } from '../lib/db.js';
import Logo from './Logo.jsx';

const traduz = (msg = '') => {
  const m = msg.toLowerCase();
  if (m.includes('invalid login') || m.includes('invalid credentials')) return 'Email ou senha incorretos.';
  if (m.includes('email not confirmed')) return 'Email ainda não confirmado no Supabase.';
  if (m.includes('failed to fetch') || m.includes('network')) return 'Sem conexão com o servidor. Verifique a internet.';
  return msg;
};

// respeita o tema salvo (o toggle fica dentro do app; aqui só lemos)
const temaSalvoEscuro = () => {
  try { return localStorage.getItem('tema') === 'dark'; } catch { return false; }
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const dark = temaSalvoEscuro();
  const S = dark ? SD : SL;

  const submeter = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await entrar(email.trim(), senha);
      // o listener de auth no App troca a tela automaticamente
    } catch (err) {
      setErro(traduz(err.message));
      setCarregando(false);
    }
  };

  return (
    <div style={S.root}>
      <form style={S.card} onSubmit={submeter}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Logo style={{ height: 30, color: dark ? '#E6EDF5' : '#1D3557' }} />
          <div style={S.sub}>Painel de gestão</div>
        </div>

        <label style={S.label}>
          Email
          <input style={S.input} type="email" autoComplete="username" value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="voce@publicamed.com" required />
        </label>
        <label style={S.label}>
          Senha
          <input style={S.input} type="password" autoComplete="current-password" value={senha}
            onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" required />
        </label>

        {erro && <div style={S.erro}>{erro}</div>}

        <button style={{ ...S.btn, opacity: carregando ? 0.7 : 1 }} type="submit" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>

        <div style={S.rodape}>Acesso restrito · uso interno PublicaMED</div>
      </form>
    </div>
  );
}

/* tema claro */
const SL = {
  root: { minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#F6F8FA', colorScheme: 'light' },
  card: {
    background: '#fff', border: '1px solid #E4E9EF', borderRadius: 14, padding: '30px 30px 24px',
    width: '100%', maxWidth: 380, boxShadow: '0 1px 2px rgba(16,24,40,.05), 0 12px 32px rgba(16,24,40,.08)',
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  sub: { fontSize: 12.5, color: '#5A6B7E', marginTop: 2 },
  label: {
    display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, fontWeight: 600,
    color: '#6F7E90', textTransform: 'uppercase', letterSpacing: '.05em',
  },
  input: {
    border: '1px solid #E4E9EF', borderRadius: 8, padding: '10px 12px', fontSize: 14,
    color: '#22334A', background: '#fff', fontFamily: 'inherit', outline: 'none',
  },
  erro: { background: 'rgba(185,58,108,.10)', color: '#B93A6C', borderRadius: 8, padding: '9px 12px', fontSize: 12.5, fontWeight: 600 },
  btn: {
    background: '#2C7DA0', color: '#fff', border: 'none', padding: '11px 16px', borderRadius: 8,
    fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4,
    boxShadow: '0 1px 2px rgba(16,24,40,.08)',
  },
  rodape: { fontSize: 11, color: '#6F7E90', textAlign: 'center', marginTop: 4 },
};

/* tema escuro (mesmos tokens do app) */
const SD = {
  ...SL,
  root: { ...SL.root, background: '#0F1520', colorScheme: 'dark' },
  card: { ...SL.card, background: '#161E2B', border: '1px solid #263243', boxShadow: '0 4px 12px rgba(0,0,0,.45), 0 20px 48px rgba(0,0,0,.55)' },
  sub: { ...SL.sub, color: '#98A8BA' },
  label: { ...SL.label, color: '#8296AB' },
  input: { ...SL.input, color: '#E6EDF5', background: '#121926', border: '1px solid #263243' },
  erro: { background: 'rgba(229,139,176,.12)', color: '#E58BB0', borderRadius: 8, padding: '9px 12px', fontSize: 12.5, fontWeight: 600 },
  btn: { ...SL.btn, background: '#2B7495' },
  rodape: { ...SL.rodape, color: '#8296AB' },
};
