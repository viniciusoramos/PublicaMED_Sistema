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

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

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
          <Logo style={{ height: 30, color: '#1D3557' }} />
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

const S = {
  root: { minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#F5F7FA' },
  card: {
    background: '#fff', border: '1px solid #E3E8EF', borderRadius: 16, padding: '30px 30px 24px',
    width: '100%', maxWidth: 380, boxShadow: '0 10px 40px rgba(29,53,87,.10)',
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  brandRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 },
  mark: {
    width: 42, height: 42, borderRadius: 11, display: 'grid', placeItems: 'center',
    background: 'linear-gradient(135deg,#2C7DA0,#1D3557)', color: '#fff', fontWeight: 800, fontSize: 22,
  },
  nome: { fontWeight: 700, fontSize: 18, color: '#1D3557' },
  sub: { fontSize: 12.5, color: '#5B6B73', marginTop: 2 },
  label: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, fontWeight: 600, color: '#5B6B73' },
  input: {
    border: '1px solid #E3E8EF', borderRadius: 9, padding: '10px 12px', fontSize: 14,
    color: '#1D3557', fontFamily: 'inherit', outline: 'none',
  },
  erro: { background: '#FBE6EE', color: '#C2477A', borderRadius: 9, padding: '9px 12px', fontSize: 12.5, fontWeight: 600 },
  btn: {
    background: '#2C7DA0', color: '#fff', border: 'none', padding: '11px 16px', borderRadius: 9,
    fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4,
  },
  rodape: { fontSize: 11, color: '#8997A0', textAlign: 'center', marginTop: 4 },
};
