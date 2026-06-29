import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";
import * as db from "./lib/db.js";
import Login from "./components/Login.jsx";
import Logo from "./components/Logo.jsx";

/* ============================================================
   DADOS SEMENTE (extraídos das suas planilhas e do docx)
   ============================================================ */
const SEED = {"temas":[],"facs":["","Centro Universitário Atenas (UniAtenas)","Universidade Evangélica de Goiás","Faculdade de Medicina de Barbacena","FACISB - Faculdade de Ciências da Saúde de Barretos","Universidade Privada Maria Serrana (Paraguai)","Universidade Federal de Santa Maria (UFSM)","Centro Universitário de Belo Horizonte (UNIBH)","Universidade Federal de Minas Gerais (UFMG)","Universidade do Contestado (UnC)","Universidade do Estado do Pará (UEPA)","Universidade do Sul de Santa Catarina (UNISUL)","Universidade de Caxias do Sul (UCS)","Universidade de Taubaté (UNITAU)","Universidade de Rio Verde (UniRV)","UNIFIPMOC / Afya Montes Claros","Universidade Federal de Sergipe (UFS)","Universidade Franciscana (UFN)","Universidade Federal do Amazonas (UFAM)","Universidade Vila Velha (UVV)","Faculdade ZARNS - Pouso Alegre","Universidad Privada del Este (Paraguai)","Universidade Federal da Paraíba (UFPB)","Faculdade de Medicina Souza Marques","IDOMED - Estácio Presidente Vargas","Faculdade Atenas - Campus Passos","FAMINAS Muriaé","Afya Itabuna","Universidade Federal do Rio Grande do Sul (UFRGS)","Faculdade de Medicina de Olinda (FMO)","Faculdade das Américas (FAM)","Faculdade de Medicina Nova Esperança (FAMENE)","Faculdade São Leopoldo Mandic","PUCPR - Pontifícia Universidade Católica do PR","Universidade CEUMA (UNICEUMA)","Centro Universitário Maurício de Nassau (Uninassau) - Cacoal","Faculdade de Ciências Biomédicas de Cacoal (Facimed)","Universidade Potiguar (UnP)","Unigranrio (Afya)","PUCRS - Pontifícia Universidade Católica do RS","UNIFAMAZ - Centro Universitário Metropolitano da Amazônia","Universidade Católica de Brasília (UCB)","Universidade Feevale","Centro Universitário UNIFACIG","Faculdade Ciências Médicas de Minas Gerais (FCMMG)","Faculdade Multivix Vitória","Universidade do Vale do Sapucaí (Univás)","Universidade Federal do Piauí (UFPI)","Faculdade de Ciências Médicas e da Saúde de Juiz de Fora (SUPREMA)","Universidade Federal de Ciências da Saúde de Porto Alegre (UFCSPA)","Centro Universitário Maurício de Nassau","Universidade do Vale do Taquari (UNIVATES)","UNIFAGOC","Universidad Anáhuac (México)","Unichristus (Centro Universitário Christus)","Centro Universitário de João Pessoa (Unipê)","Faculdade de Ciências Médicas de Santos (FCMS)","PUC Goiás (PUCGO)","Universidade de Mogi das Cruzes (UMC)","FASEH - Faculdade da Saúde e Ecologia Humana","Universidade Anhembi Morumbi (UAM)","Universidade de Ribeirão Preto (UNAERP)","Universidade de Marília (UNIMAR)","Universidade do Vale do Rio dos Sinos (UNISINOS)","Universidade de Vassouras","Centro Universitário de Várzea Grande (UNIVAG)","Centro Universitário UNIFACIMED - Cacoal","Fundação Assis Gurgacz (FAG)","Atitus Educação - Passo Fundo","UNINGÁ - Centro Universitário Ingá","Centro Universitário Univértix","PUC Minas","UNIJUÍ - Univ. Regional do Noroeste do RS","Universidade Federal de Viçosa (UFV)","Universidade de Santa Cruz do Sul (UNISC)","Universidade Federal do Maranhão (UFMA)","Universidade Federal de Juiz de Fora (UFJF)","Centro Universitário São Camilo","Universidade de Itaúna","FAMINAS BH","Universidade do Oeste Paulista (UNOESTE)","Faculdade de Medicina de Catanduva (FAMECA)","Universidade de Santo Amaro (UNISA)","Faceres - Faculdade de Medicina","Afya - Faculdade de Ciências Médicas da Paraíba","Universidade Nove de Julho (Uninove)","Universidade do Estado de Minas Gerais (UEMG)","Centro Universitário Max Planck","Centro Universitário Uninovafapi","Faculdade de Medicina de Itajubá","Universidade de Fortaleza (Unifor)","Universidad Nacional de La Plata (Argentina)","Universidade Comunitária de Chapecó (Unochapecó)","Afya- faculdade de ciências médicas","UNIFENAS (Universidade José do Rosário Vellano)","Centro Universitário Imepac Araguari","Faculdade de Medicina do ABC (FMABC)","Centro Universitário de Brasília (UniCEUB)","Universidade Católica de Pelotas (UCPel)","Centro Universitário Aparício Carvalho (FIMCA)","Universidade Regional Integrada (URI)","Universidade Luterana do Brasil (ULBRA)","Faculdade Pitágoras de Medicina de Eunápolis","Universidade Positivo","Universidade Federal da Fronteira Sul (UFFS)","Universidade Iguaçu (UNIG)","UNESC - Colatina","Unicesumar","Faculdade Serra Dourada (FSD)","Universidad Técnica de Ambato (Equador)","Universidade Federal de Ouro Preto (UFOP)","Centro Universitário Redentor (UniRedentor - Afya)","Universidade Federal de Pelotas (UFPel)","Universidade Federal da Bahia (UFBA)","Pontificia Universidad Javeriana (Colômbia)","UNIFADRA - Faculdades de Dracena","Faculdade de Medicina de Açailândia (FAMEAC)","Unifamec","Fundação Universidade Regional de Blumenau (FURB)","Centro Universitário Mauá de Brasília","Universidade Federal de São João del-Rei (UFSJ)","Faculdade de Medicina do Vale do Aço","PUC Campinas"],"vendas":[],"trabalhos":[],"financeiro":[],"facUF":["N/I","MG","GO","MG","SP","N/I","RS","MG","MG","SC","PA","SC","RS","SP","GO","MG","SE","RS","AM","ES","MG","N/I","PB","RJ","RJ","MG","MG","BA","RS","PE","SP","PB","SP","PR","MA","RO","RO","RN","RJ","RS","PA","DF","RS","MG","MG","ES","MG","PI","MG","RS","PE","RS","MG","N/I","CE","PB","SP","GO","SP","MG","SP","SP","SP","RS","RJ","MT","RO","PR","RS","PR","MG","MG","RS","MG","RS","MA","MG","SP","MG","MG","SP","SP","SP","SP","PB","SP","MG","SP","PI","MG","CE","N/I","SC","N/I","MG","MG","SP","DF","RS","RO","RS","RS","BA","PR","SC","RJ","ES","PR","GO","N/I","MG","RJ","RS","BA","N/I","SP","MA","N/I","SC","DF","MG","MG","SP"]};

/* ---------- Tabelas auxiliares ---------- */
const DDD_UF = (() => {
  const m = {};
  const reg = (uf, ...ds) => ds.forEach((d) => (m[String(d)] = uf));
  reg("SP",11,12,13,14,15,16,17,18,19); reg("RJ",21,22,24); reg("ES",27,28);
  reg("MG",31,32,33,34,35,37,38); reg("PR",41,42,43,44,45,46); reg("SC",47,48,49);
  reg("RS",51,53,54,55); reg("DF",61); reg("GO",62,64); reg("TO",63);
  reg("MT",65,66); reg("MS",67); reg("AC",68); reg("RO",69);
  reg("BA",71,73,74,75,77); reg("SE",79); reg("PE",81,87); reg("AL",82);
  reg("PB",83); reg("RN",84); reg("CE",85,88); reg("PI",86,89);
  reg("PA",91,93,94); reg("AM",92,97); reg("RR",95); reg("AP",96); reg("MA",98,99);
  return m;
})();
const UF_REGIAO = {
  AC:"Norte",AP:"Norte",AM:"Norte",PA:"Norte",RO:"Norte",RR:"Norte",TO:"Norte",
  AL:"Nordeste",BA:"Nordeste",CE:"Nordeste",MA:"Nordeste",PB:"Nordeste",PE:"Nordeste",PI:"Nordeste",RN:"Nordeste",SE:"Nordeste",
  DF:"Centro-Oeste",GO:"Centro-Oeste",MT:"Centro-Oeste",MS:"Centro-Oeste",
  ES:"Sudeste",MG:"Sudeste",RJ:"Sudeste",SP:"Sudeste",
  PR:"Sul",RS:"Sul",SC:"Sul","N/I":"N/I",
};
const UF_NOME = {
  AC:"Acre",AL:"Alagoas",AM:"Amazonas",AP:"Amapá",BA:"Bahia",CE:"Ceará",DF:"Distrito Federal",
  ES:"Espírito Santo",GO:"Goiás",MA:"Maranhão",MG:"Minas Gerais",MS:"Mato Grosso do Sul",
  MT:"Mato Grosso",PA:"Pará",PB:"Paraíba",PE:"Pernambuco",PI:"Piauí",PR:"Paraná",
  RJ:"Rio de Janeiro",RN:"Rio Grande do Norte",RO:"Rondônia",RR:"Roraima",RS:"Rio Grande do Sul",
  SC:"Santa Catarina",SE:"Sergipe",SP:"São Paulo",TO:"Tocantins","N/I":"Não identificado",
};
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const TIPOS = ["Artigo","Capítulo","Apresentação","Combo","Artigo PSU","Outro"];
const TIPO_COR = {
  "Artigo":"#2C7DA0","Capítulo":"#6366A8","Apresentação":"#E8833A",
  "Combo":"#C2477A","Artigo PSU":"#2E9E7B","Outro":"#8B97A0",
};
const STATUS = ["A fazer","Aguardando certificado","Concluído","Certificado emitido"];
const STATUS_COR = {
  "A fazer":"#9AA5AB","Aguardando certificado":"#E0A93B",
  "Concluído":"#3B92C2","Certificado emitido":"#2E9E7B",
};

/* ---------- Utilidades ---------- */
const brl = (n) =>
  (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const num = (n) => (n || 0).toLocaleString("pt-BR");
const fmtData = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}/${m}/${y}` : iso;
};
const mesDeIso = (iso) => (iso ? parseInt(iso.split("-")[1], 10) - 1 : null);
const anoDeIso = (iso) => (iso ? parseInt(iso.split("-")[0], 10) : null);
const hojeIso = () => new Date().toISOString().slice(0, 10);
const dddDe = (tel) => {
  if (!tel) return null;
  const mt = String(tel).match(/\((\d{2})\)/);
  if (mt) return mt[1];
  const dig = String(tel).replace(/\D/g, "");
  return dig.length >= 10 ? dig.slice(0, 2) : null;
};
const uid = () => Math.random().toString(36).slice(2, 9);

/* ---------- Persistência (window.storage com fallback em memória) ---------- */
const KEYS = {
  vendas: "publicamed:vendas",
  trabalhos: "publicamed:trabalhos",
  financeiro: "publicamed:financeiro",
  temas: "publicamed:temas",
  seeded: "publicamed:seeded:v1",
};
const hasStore = typeof window !== "undefined" && window.storage && window.storage.get;
const store = {
  async get(k) {
    if (!hasStore) return null;
    try {
      const r = await window.storage.get(k);
      return r ? JSON.parse(r.value) : null;
    } catch {
      return null;
    }
  },
  async set(k, v) {
    if (!hasStore) return;
    try {
      await window.storage.set(k, JSON.stringify(v));
    } catch (e) {
      console.error("storage set falhou", e);
    }
  },
};

/* ---------- Expansão do seed ---------- */
function expandSeed() {
  const vendas = SEED.vendas.map((r, i) => ({
    id: "s" + i,
    data: r[0],
    nome: r[1] || "",
    email: r[2] || "",
    faculdade: SEED.facs[r[3]] || "",
    uf: r[4] || "N/I",
    tipo: r[5] || "Outro",
    valor: r[6] || 0,
    tema: SEED.temas[r[7]] || "",
  }));
  const trabalhos = SEED.trabalhos.map((t, i) => ({
    id: "t" + i, titulo: t[0], tipo: t[1], status: t[2],
  }));
  const financeiro = SEED.financeiro.map((f) => ({ ...f }));
  return { vendas, trabalhos, financeiro };
}

/* ---------- Faculdades canônicas (para o seletor) + mapa nome->UF ---------- */
const FAC_BASE = (() => {
  const ufMap = {};
  const nomes = [];
  (SEED.facs || []).forEach((nome, i) => {
    if (!nome) return;
    nomes.push(nome);
    ufMap[nome] = (SEED.facUF && SEED.facUF[i]) || "N/I";
  });
  return { nomes, ufMap };
})();

// resolve a UF a partir do nome da faculdade: tenta o nome exato, depois por
// sigla (início) e por trecho — assim "PUCRS" acha "PUCRS - Pontifícia...".
function ufDaFaculdade(nome) {
  const n = (nome || "").trim();
  if (!n) return "N/I";
  if (FAC_BASE.ufMap[n] && FAC_BASE.ufMap[n] !== "N/I") return FAC_BASE.ufMap[n];
  const nb = n.toLowerCase();
  for (const c of FAC_BASE.nomes) {
    if (c.toLowerCase().startsWith(nb) && FAC_BASE.ufMap[c] !== "N/I") return FAC_BASE.ufMap[c];
  }
  if (nb.length >= 5) {
    for (const c of FAC_BASE.nomes) {
      const cb = c.toLowerCase();
      if ((cb.includes(nb) || nb.includes(cb)) && FAC_BASE.ufMap[c] !== "N/I") return FAC_BASE.ufMap[c];
    }
  }
  return "N/I";
}

/* ============================================================
   COMPONENTES BASE
   ============================================================ */
function KPI({ label, valor, sub, cor }) {
  return (
    <div className="kpi">
      <div className="kpi-bar" style={{ background: cor }} />
      <div className="kpi-body">
        <div className="kpi-label">{label}</div>
        <div className="kpi-valor">{valor}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>
    </div>
  );
}

function Donut({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="donut-wrap">
      <ResponsiveContainer width="100%" height={230}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%"
            innerRadius={58} outerRadius={88} paddingAngle={2} stroke="none">
            {data.map((d, i) => <Cell key={i} fill={d.cor} />)}
          </Pie>
          <Tooltip formatter={(v) => brl(v)} />
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-legend">
        {data.map((d, i) => (
          <div className="leg" key={i}>
            <span className="dot" style={{ background: d.cor }} />
            <span className="leg-name">{d.name}</span>
            <span className="leg-val">{total ? Math.round((d.value / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarrasH({ data, max, fmt, cor }) {
  return (
    <div className="barras">
      {data.map((d, i) => (
        <div className="barra-row" key={i}>
          <div className="barra-lab" title={d.label}>{d.label}</div>
          <div className="barra-track">
            <div className="barra-fill" style={{ width: `${max ? (d.value / max) * 100 : 0}%`, background: d.cor || cor }} />
          </div>
          <div className="barra-val">{fmt ? fmt(d.value) : d.value}</div>
        </div>
      ))}
    </div>
  );
}

function Modal({ titulo, onClose, children, wide }) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className={"modal " + (wide ? "modal-wide" : "")} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{titulo}</h3>
          <button className="x" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function Campo({ label, children }) {
  return (
    <label className="campo">
      <span>{label}</span>
      {children}
    </label>
  );
}

/* ============================================================
   APP
   ============================================================ */
/* ---------- sincronizacao incremental com o Supabase ---------- */
async function syncLista(prev, next, ops, mudou) {
  const nextIds = new Set(next.map((x) => x.id));
  for (const p of prev) if (!nextIds.has(p.id)) await ops.remover(p.id);
  const prevById = new Map(prev.map((x) => [x.id, x]));
  const out = [];
  for (const n of next) {
    const old = prevById.get(n.id);
    if (!old) out.push(await ops.criar(n));
    else if (mudou(old, n)) out.push(await ops.atualizar(n.id, n));
    else out.push(n);
  }
  return out;
}
const vendaMudou = (a, b) =>
  a.data !== b.data || a.nome !== b.nome || a.email !== b.email || a.faculdade !== b.faculdade ||
  a.uf !== b.uf || a.tipo !== b.tipo || (a.valor || 0) !== (b.valor || 0) || a.tema !== b.tema;
const trabalhoMudou = (a, b) => a.titulo !== b.titulo || a.tipo !== b.tipo || a.status !== b.status;
const finMudou = (a, b) =>
  (a.faturamento || 0) !== (b.faturamento || 0) || (a.taxaPublicacao || 0) !== (b.taxaPublicacao || 0) ||
  (a.custoAds || 0) !== (b.custoAds || 0) || (a.custoFixo || 0) !== (b.custoFixo || 0) ||
  (a.custoExtra || 0) !== (b.custoExtra || 0) || (a.custoExtraDesc || "") !== (b.custoExtraDesc || "");
// (CRUD de publicações é incremental via db.*; ver os handlers granulares no App)

export default function App() {
  const [tab, setTab] = useState("overview");
  const [vendas, setVendas] = useState([]);
  const [trabalhos, setTrabalhos] = useState([]);
  const [financeiro, setFinanceiro] = useState([]);
  const [temas, setTemas] = useState([]);
  const [pronto, setPronto] = useState(false);
  const [sessao, setSessao] = useState(undefined); // undefined=verificando, null=deslogado, objeto=logado
  const [toast, setToast] = useState(null);

  const aviso = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  /* sessao (login) */
  useEffect(() => {
    db.sessaoAtual().then((s) => setSessao(s || null));
    return db.aoMudarAuth((s) => setSessao(s || null));
  }, []);

  /* carregar dados do Supabase quando logado */
  useEffect(() => {
    if (!sessao) { setPronto(false); return; }
    let vivo = true;
    (async () => {
      try {
        const d = await db.carregarTudo();
        if (!vivo) return;
        setVendas(d.vendas); setTrabalhos(d.trabalhos);
        setFinanceiro(d.financeiro); setTemas(d.temas);
        setPronto(true);
      } catch (e) {
        if (vivo) aviso("Erro ao carregar dados: " + e.message);
      }
    })();
    return () => { vivo = false; };
  }, [sessao]);

  const sair = async () => { setPronto(false); await db.sair(); };

  /* salvar = atualizacao otimista da tela + sincronizacao por linha no banco */
  const salvarVendas = async (nv) => {
    const antes = vendas; setVendas(nv);
    try { setVendas(await syncLista(antes, nv, { criar: db.criarVenda, atualizar: db.atualizarVenda, remover: db.removerVenda }, vendaMudou)); }
    catch (e) { aviso("Erro ao salvar: " + e.message); setVendas(antes); }
  };
  const salvarTrabalhos = async (nt) => {
    const antes = trabalhos; setTrabalhos(nt);
    try { setTrabalhos(await syncLista(antes, nt, { criar: db.criarTrabalho, atualizar: db.atualizarTrabalho, remover: db.removerTrabalho }, trabalhoMudou)); }
    catch (e) { aviso("Erro ao salvar: " + e.message); setTrabalhos(antes); }
  };
  const salvarFinanceiro = async (nf) => {
    const antes = financeiro; setFinanceiro(nf);
    try { for (const f of nf) { const old = antes.find((x) => x.id === f.id); if (old && finMudou(old, f)) await db.atualizarFinanceiro(f.id, f); } }
    catch (e) { aviso("Erro ao salvar: " + e.message); setFinanceiro(antes); }
  };
  /* ---------- publicacoes / participantes (granular, com venda junto) ---------- */
  const addPublicacao = async (dados) => {
    try {
      const nova = await db.criarPublicacao(dados);
      setTemas((ts) => [nova, ...ts]);
      // espelha na aba Trabalhos (evita cadastrar o mesmo trabalho duas vezes)
      const trab = await db.criarTrabalho({ titulo: nova.nome, tipo: nova.tipo, status: "A fazer" });
      setTrabalhos((ts) => [trab, ...ts]);
      aviso("Publicação criada e enviada para Trabalhos");
      return nova;
    } catch (e) { aviso("Erro: " + e.message); }
  };
  const remPublicacao = async (id) => {
    const antes = temas; setTemas((ts) => ts.filter((t) => t.id !== id));
    try { await db.removerPublicacao(id); aviso("Publicação removida"); }
    catch (e) { aviso("Erro: " + e.message); setTemas(antes); }
  };
  const editPublicacao = async (id, campos) => {
    const antes = temas; setTemas((ts) => ts.map((t) => (t.id === id ? { ...t, ...campos } : t)));
    try { await db.atualizarPublicacao(id, campos); }
    catch (e) { aviso("Erro: " + e.message); setTemas(antes); }
  };
  // soma a taxa de publicação no mês correspondente do Financeiro (cria o ano se faltar)
  const lancarTaxaFinanceiro = async (dataIso, taxa) => {
    const ano = anoDeIso(dataIso), mesIdx = mesDeIso(dataIso);
    if (ano == null || mesIdx == null) return;
    let linha = financeiro.find((f) => f.ano === ano && f.ordem === mesIdx);
    if (!linha) {
      const novas = await db.criarAnoFinanceiro(ano);
      setFinanceiro((fs) => [...fs, ...novas]);
      linha = novas.find((f) => f.ordem === mesIdx);
    }
    if (!linha) return;
    const salva = await db.atualizarFinanceiro(linha.id, { ...linha, taxaPublicacao: (linha.taxaPublicacao || 0) + taxa });
    setFinanceiro((fs) => fs.map((f) => (f.id === salva.id ? salva : f)));
  };
  const addParticipante = async (tema, dados) => {
    try {
      const part = await db.adicionarParticipante(tema.id, dados);
      setTemas((ts) => ts.map((t) => (t.id === tema.id ? { ...t, participantes: [...t.participantes, part] } : t)));
      const acoes = ["Participante adicionado"];
      if (dados.lancarVenda && (dados.valor || 0) > 0) {
        const uf = ufDaFaculdade(dados.faculdade);
        const venda = await db.criarVenda({
          data: dados.data || hojeIso(), nome: dados.nome, email: dados.email,
          faculdade: dados.faculdade, uf, tipo: tema.tipo, valor: dados.valor, tema: tema.nome,
          participanteId: part.id,
        });
        setVendas((vs) => [venda, ...vs]);
        acoes.push("venda lançada");
      }
      // exige graduado e acabou de lotar sem nenhum graduado?
      const lotouSemGrad = tema.requiresGrad && (tema.participantes.length + 1) >= tema.maxVagas
        && !dados.graduado && !tema.participantes.some((p) => p.graduado);
      aviso(acoes.join(" · ") + (lotouSemGrad ? " · ⚠️ lotou sem nenhum graduado!" : ""));
    } catch (e) { aviso("Erro: " + e.message); }
  };
  const remParticipante = async (temaId, partId) => {
    const antesT = temas, antesV = vendas;
    setTemas((ts) => ts.map((t) => (t.id === temaId ? { ...t, participantes: t.participantes.filter((p) => p.id !== partId) } : t)));
    setVendas((vs) => vs.filter((v) => v.participanteId !== partId)); // a venda atrelada some junto
    try { await db.removerParticipante(partId); }
    catch (e) { aviso("Erro: " + e.message); setTemas(antesT); setVendas(antesV); }
  };
  // edita um participante -> atualiza o participante E a venda dele (dados + valor pago)
  const editParticipante = async (tema, part, dados) => {
    const antesT = temas, antesV = vendas;
    const uf = ufDaFaculdade(dados.faculdade);
    // acha a venda do participante: pelo vínculo direto, ou pelo tema + nome antigo
    const venda = vendas.find((v) =>
      (v.participanteId && v.participanteId === part.id) ||
      (v.tema === tema.nome && (v.nome || "").trim().toLowerCase() === (part.nome || "").trim().toLowerCase())
    );
    setTemas((ts) => ts.map((t) => (t.id === tema.id ? { ...t, participantes: t.participantes.map((p) => (p.id === part.id ? { ...p, ...dados } : p)) } : t)));
    if (venda) setVendas((vs) => vs.map((v) => (v.id === venda.id ? { ...v, nome: dados.nome, email: dados.email, faculdade: dados.faculdade, uf, valor: dados.valor ?? v.valor, participanteId: part.id } : v)));
    try {
      await db.atualizarParticipante(part.id, dados);
      // só ATUALIZA a venda existente — nunca cria (evita venda duplicada)
      if (venda) {
        await db.atualizarVenda(venda.id, { ...venda, nome: dados.nome, email: dados.email, faculdade: dados.faculdade, uf, valor: dados.valor ?? venda.valor, participanteId: part.id });
      }
      aviso("Participante atualizado");
    } catch (e) { aviso("Erro: " + e.message); setTemas(antesT); setVendas(antesV); }
  };
  // taxa de publicação = valor único da publicação, lançado uma vez no financeiro
  const lancarTaxaPub = async (tema, valor, data) => {
    if (tema.taxaLancada) { aviso("Taxa já lançada para esta publicação"); return; }
    try {
      await lancarTaxaFinanceiro(data, valor);
      await db.atualizarPublicacao(tema.id, { taxa: valor, taxaLancada: true });
      setTemas((ts) => ts.map((t) => (t.id === tema.id ? { ...t, taxa: valor, taxaLancada: true } : t)));
      aviso("Taxa lançada no financeiro");
    } catch (e) { aviso("Erro: " + e.message); }
  };
  const criarAnoFin = async (ano) => {
    try { const linhas = await db.criarAnoFinanceiro(ano); setFinanceiro((f) => [...f, ...linhas]); aviso(`Ano ${ano} criado`); }
    catch (e) { aviso("Erro: " + e.message); }
  };
  // edita os dados de um cliente -> aplica em TODAS as compras (vendas) dele
  const salvarCliente = async (cliente, dados) => {
    const uf = dados.uf && dados.uf !== "N/I" ? dados.uf : ufDaFaculdade(dados.faculdade);
    const ids = new Set((cliente.compras || []).map((v) => v.id));
    const antes = vendas;
    setVendas((vs) => vs.map((v) => (ids.has(v.id) ? { ...v, nome: dados.nome, email: dados.email, faculdade: dados.faculdade, uf } : v)));
    try {
      for (const v of cliente.compras) {
        await db.atualizarVenda(v.id, { ...v, nome: dados.nome, email: dados.email, faculdade: dados.faculdade, uf });
      }
      aviso("Cliente atualizado");
    } catch (e) { aviso("Erro: " + e.message); setVendas(antes); }
  };

  /* ---------- métricas ---------- */
  const m = useMemo(() => calcMetricas(vendas), [vendas]);

  if (!db.ENV_OK) {
    return (
      <div className="loading">
        <div style={{ maxWidth: 440, textAlign: "center", padding: 24 }}>
          <h2 style={{ color: "#1D3557", marginBottom: 10 }}>Configuração ausente</h2>
          <p style={{ color: "#54657A", fontSize: 14, lineHeight: 1.6 }}>
            Defina <b>VITE_SUPABASE_URL</b> e <b>VITE_SUPABASE_ANON_KEY</b> nas
            variáveis de ambiente do Netlify (Site configuration → Environment variables)
            e publique novamente.
          </p>
        </div>
      </div>
    );
  }

  if (sessao === undefined) {
    return (
      <div className="loading">
        <div className="spin" />
        <p>Carregando...</p>
      </div>
    );
  }
  if (!sessao) return <Login />;

  if (!pronto) {
    return (
      <div className="loading">
        <div className="spin" />
        <p>Carregando seus dados…</p>
      </div>
    );
  }

  const navItens = [
    ["overview", "Visão geral", "◧"],
    ["vendas", "Vendas", "▦"],
    ["clientes", "Clientes", "◑"],
    ["trabalhos", "Trabalhos", "✓"],
    ["financeiro", "Financeiro", "$"],
    ["temas", "Publicações e vagas", "≡"],
  ];

  return (
    <div className="root">
      <Estilos />
      {/* SIDEBAR */}
      <aside className="side">
        <div className="brand">
          <Logo style={{ height: 26, color: "#fff" }} />
          <div className="brand-sub">Painel de gestão</div>
        </div>
        <nav>
          {navItens.map(([id, lab, ic]) => (
            <button key={id} className={"nav " + (tab === id ? "ativo" : "")} onClick={() => setTab(id)}>
              <span className="nav-ic">{ic}</span>{lab}
            </button>
          ))}
        </nav>
        <div className="side-foot">
          <div className="persist on">
            <span className="pdot" />
            Conectado ao Supabase
          </div>
          {sessao && sessao.user && (
            <div style={{ fontSize: 11, color: "#7E97A0", marginTop: 10, wordBreak: "break-all" }}>{sessao.user.email}</div>
          )}
          <button onClick={sair} style={{ marginTop: 10, width: "100%", background: "transparent", color: "#A9C0C6", border: "1px solid rgba(255,255,255,.15)", borderRadius: 8, padding: "8px 10px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Sair</button>
        </div>
      </aside>

      {/* CONTEÚDO */}
      <main className="main">
        {tab === "overview" && <Overview vendas={vendas} financeiro={financeiro} trabalhos={trabalhos} />}
        {tab === "vendas" && (
          <Vendas vendas={vendas} salvar={salvarVendas} aviso={aviso} temasExist={temas} />
        )}
        {tab === "clientes" && <Clientes m={m} vendas={vendas} salvarCliente={salvarCliente} />}
        {tab === "trabalhos" && (
          <Trabalhos trabalhos={trabalhos} salvar={salvarTrabalhos} aviso={aviso} />
        )}
        {tab === "financeiro" && (
          <Financeiro financeiro={financeiro} salvar={salvarFinanceiro} vendas={vendas} aviso={aviso} onCriarAno={criarAnoFin} />
        )}
        {tab === "temas" && (
          <Temas temas={temas} vendas={vendas} onAdd={addPublicacao} onRem={remPublicacao} onEdit={editPublicacao}
            onAddPart={addParticipante} onEditPart={editParticipante} onRemPart={remParticipante}
            onLancarTaxa={lancarTaxaPub} aviso={aviso} />
        )}
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

/* ============================================================
   MÉTRICAS
   ============================================================ */
function calcMetricas(vendas) {
  const totalFat = vendas.reduce((s, v) => s + (v.valor || 0), 0);
  const nVendas = vendas.length;

  const clientesMap = {};
  vendas.forEach((v) => {
    const k = (v.email || "").trim() || v.nome.trim().toLowerCase();
    if (!k) return;
    if (!clientesMap[k]) {
      clientesMap[k] = { chave: k, nome: v.nome, email: v.email, faculdade: v.faculdade, uf: v.uf, qtd: 0, total: 0, compras: [] };
    }
    const c = clientesMap[k];
    c.qtd += 1; c.total += v.valor || 0; c.compras.push(v);
    if (!c.faculdade && v.faculdade) c.faculdade = v.faculdade;
    if ((c.uf === "N/I" || !c.uf) && v.uf !== "N/I") c.uf = v.uf;
  });
  const clientes = Object.values(clientesMap).sort((a, b) => b.total - a.total);

  const porTipo = TIPOS.map((t) => {
    const arr = vendas.filter((v) => v.tipo === t);
    return { tipo: t, qtd: arr.length, total: arr.reduce((s, v) => s + v.valor, 0) };
  }).filter((x) => x.qtd > 0).sort((a, b) => b.total - a.total);

  const ufMap = {};
  vendas.forEach((v) => {
    const u = v.uf || "N/I";
    if (!ufMap[u]) ufMap[u] = { uf: u, qtd: 0, total: 0 };
    ufMap[u].qtd += 1; ufMap[u].total += v.valor;
  });
  const porUF = Object.values(ufMap).sort((a, b) => b.qtd - a.qtd);

  const regMap = {};
  vendas.forEach((v) => {
    const r = UF_REGIAO[v.uf] || "N/I";
    if (!regMap[r]) regMap[r] = { regiao: r, qtd: 0, total: 0 };
    regMap[r].qtd += 1; regMap[r].total += v.valor;
  });
  const porRegiao = Object.values(regMap).sort((a, b) => b.qtd - a.qtd);

  const facMap = {};
  vendas.forEach((v) => {
    const f = (v.faculdade || "").trim() || "—";
    if (!facMap[f]) facMap[f] = { faculdade: f, qtd: 0, total: 0 };
    facMap[f].qtd += 1; facMap[f].total += v.valor;
  });
  const porFaculdade = Object.values(facMap).filter((x) => x.faculdade !== "—").sort((a, b) => b.qtd - a.qtd);

  const mesArr = MESES.map((nome, i) => ({ mes: nome, mesAbrev: nome.slice(0, 3), idx: i, total: 0, qtd: 0 }));
  vendas.forEach((v) => {
    const mi = mesDeIso(v.data);
    if (mi != null && mesArr[mi]) { mesArr[mi].total += v.valor; mesArr[mi].qtd += 1; }
  });
  const porMes = mesArr.filter((x) => x.qtd > 0);

  const ticket = nVendas ? totalFat / nVendas : 0;

  return { totalFat, nVendas, clientes, porTipo, porUF, porRegiao, porFaculdade, porMes, ticket };
}

/* construir publicações a partir das vendas (reconstrói o controle de vagas) */
function construirTemas(vendas) {
  const map = {};
  vendas.forEach((v) => {
    const t = (v.tema || "").trim();
    if (!t) return;
    if (!map[t]) map[t] = { id: uid(), nome: t, area: "", maxVagas: 6, participantes: [], tipo: v.tipo || "Artigo", requiresGrad: false, _tipos: {} };
    const tp = v.tipo || "Artigo";
    map[t]._tipos[tp] = (map[t]._tipos[tp] || 0) + 1;
    const jaTem = map[t].participantes.some((p) => p.email && p.email === v.email);
    if (!jaTem) {
      map[t].participantes.push({
        id: uid(), nome: v.nome, faculdade: v.faculdade, email: v.email,
        autorPrincipal: false, graduado: /formad|graduad|médic/i.test(v.faculdade || ""),
      });
    }
  });
  return Object.values(map).map((t) => {
    const ord = Object.entries(t._tipos).sort((a, b) => b[1] - a[1]);
    t.tipo = ord.length ? ord[0][0] : "Artigo";
    delete t._tipos;
    return t;
  }).sort((a, b) => b.participantes.length - a.participantes.length);
}

/* ============================================================
   VISÃO GERAL
   ============================================================ */
function Overview({ vendas, financeiro, trabalhos }) {
  const anos = useMemo(() => {
    const set = new Set();
    vendas.forEach((v) => { const a = anoDeIso(v.data); if (a) set.add(a); });
    (financeiro || []).forEach((f) => { if (f.ano) set.add(f.ano); });
    return [...set].sort((a, b) => b - a);
  }, [vendas, financeiro]);

  const [ano, setAno] = useState("");
  const [mes, setMes] = useState("");
  const anoSel = ano || (anos[0] != null ? String(anos[0]) : "todos");

  const vendasFiltradas = useMemo(() => vendas.filter((v) => {
    if (anoSel !== "todos" && anoDeIso(v.data) !== Number(anoSel)) return false;
    if (mes !== "" && mesDeIso(v.data) !== Number(mes)) return false;
    return true;
  }), [vendas, anoSel, mes]);

  const m = useMemo(() => calcMetricas(vendasFiltradas), [vendasFiltradas]);

  const finFiltrado = useMemo(() => {
    let f = financeiro || [];
    if (anoSel !== "todos") f = f.filter((x) => x.ano === Number(anoSel));
    if (mes !== "") f = f.filter((x) => x.ordem === Number(mes));
    return f;
  }, [financeiro, anoSel, mes]);

  const lucroTotal = finFiltrado.reduce((s, f) => s + ((f.faturamento || 0) - (f.taxaPublicacao || 0) - (f.custoAds || 0) - (f.custoFixo || 0) - (f.custoExtra || 0)), 0);
  const custoTotal = finFiltrado.reduce((s, f) => s + (f.taxaPublicacao || 0) + (f.custoAds || 0) + (f.custoFixo || 0) + (f.custoExtra || 0), 0);

  const tipoTop = m.porTipo[0];
  const ufTop = m.porUF.filter((u) => u.uf !== "N/I")[0];
  const facTop = m.porFaculdade[0];
  const cliTop = m.clientes[0];

  const donut = m.porTipo.map((t) => ({ name: t.tipo, value: t.total, cor: TIPO_COR[t.tipo] }));
  const maxUF = Math.max(...m.porUF.filter((u) => u.uf !== "N/I").map((u) => u.qtd), 1);
  const ufData = m.porUF.filter((u) => u.uf !== "N/I").slice(0, 8)
    .map((u) => ({ label: `${u.uf} · ${UF_NOME[u.uf]}`, value: u.qtd, cor: "#2C7DA0" }));

  const certEmitido = trabalhos.filter((t) => t.status === "Certificado emitido").length;
  const pendentes = trabalhos.filter((t) => t.status !== "Certificado emitido").length;

  const rotuloPeriodo = (anoSel === "todos" ? "todos os anos" : anoSel) + (mes !== "" ? " · " + MESES[Number(mes)] : "");

  return (
    <>
      <Header titulo="Visão geral" sub={`Período: ${rotuloPeriodo}`} />

      <div className="periodo-bar">
        <span className="periodo-lab">Período</span>
        <select className="inp" value={anoSel} onChange={(e) => setAno(e.target.value)}>
          <option value="todos">Todos os anos</option>
          {anos.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select className="inp" value={mes} onChange={(e) => setMes(e.target.value)}>
          <option value="">Ano inteiro</option>
          {MESES.map((nm, i) => <option key={i} value={i}>{nm}</option>)}
        </select>
        <span className="periodo-info">{num(m.nVendas)} vendas · {brl(m.totalFat)}</span>
      </div>

      <div className="kpis">
        <KPI label="Faturamento (vendas)" valor={brl(m.totalFat)} sub={`${num(m.nVendas)} vendas no período`} cor="#2C7DA0" />
        <KPI label="Lucro líquido" valor={brl(lucroTotal)} sub={`Custos: ${brl(custoTotal)}`} cor="#2E9E7B" />
        <KPI label="Clientes únicos" valor={num(m.clientes.length)} sub={`Ticket médio ${brl(m.ticket)}`} cor="#6366A8" />
        <KPI label="Certificados emitidos" valor={num(certEmitido)} sub={`${num(pendentes)} no total`} cor="#E8833A" />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head"><h3>Faturamento por mês</h3></div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={m.porMes} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEFF1" />
              <XAxis dataKey="mesAbrev" tick={{ fontSize: 12, fill: "#5B6B73" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#5B6B73" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
              <Tooltip formatter={(v) => brl(v)} cursor={{ fill: "#F0F4F5" }} />
              <Bar dataKey="total" fill="#2C7DA0" radius={[5, 5, 0, 0]} maxBarSize={46} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Faturamento por tipo de trabalho</h3>
            <span className="hint">qual produto dá mais retorno</span>
          </div>
          <Donut data={donut} />
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head"><h3>Estados que mais compram</h3><span className="hint">por nº de compras</span></div>
          <BarrasH data={ufData} max={maxUF} fmt={(v) => `${v}`} />
          <p className="nota">O estado de cada venda é identificado pela faculdade do cliente: {num(m.nVendas - (m.porUF.find((u) => u.uf === "N/I")?.qtd || 0))} de {num(m.nVendas)} vendas com estado definido. As poucas não identificadas são instituições do exterior ou sem faculdade informada.</p>
        </div>

        <div className="card">
          <div className="card-head"><h3>Destaques</h3></div>
          <div className="destaques">
            <Destaque rotulo="Produto campeão" principal={tipoTop?.tipo || "—"}
              detalhe={tipoTop ? `${brl(tipoTop.total)} · ${tipoTop.qtd} vendas` : ""} cor={TIPO_COR[tipoTop?.tipo]} />
            <Destaque rotulo="Estado líder" principal={ufTop ? UF_NOME[ufTop.uf] : "—"}
              detalhe={ufTop ? `${ufTop.qtd} compras · ${brl(ufTop.total)}` : ""} cor="#2C7DA0" />
            <Destaque rotulo="Faculdade líder" principal={facTop?.faculdade || "—"}
              detalhe={facTop ? `${facTop.qtd} compras` : ""} cor="#6366A8" />
            <Destaque rotulo="Melhor cliente" principal={cliTop?.nome || "—"}
              detalhe={cliTop ? `${brl(cliTop.total)} · ${cliTop.qtd} trabalhos` : ""} cor="#E8833A" />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3>Faculdades que mais compram</h3><span className="hint">top 10</span></div>
        <table className="tab">
          <thead><tr><th>#</th><th>Faculdade</th><th className="r">Compras</th><th className="r">Faturamento</th></tr></thead>
          <tbody>
            {m.porFaculdade.slice(0, 10).map((f, i) => (
              <tr key={i}>
                <td className="muted">{i + 1}</td>
                <td>{f.faculdade}</td>
                <td className="r"><b>{f.qtd}</b></td>
                <td className="r">{brl(f.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Destaque({ rotulo, principal, detalhe, cor }) {
  return (
    <div className="destaque">
      <div className="dq-bar" style={{ background: cor || "#2C7DA0" }} />
      <div>
        <div className="dq-rot">{rotulo}</div>
        <div className="dq-pri">{principal}</div>
        <div className="dq-det">{detalhe}</div>
      </div>
    </div>
  );
}

/* ============================================================
   VENDAS
   ============================================================ */
function Vendas({ vendas, salvar, aviso, temasExist }) {
  const [busca, setBusca] = useState("");
  const [fTipo, setFTipo] = useState("");
  const [fUF, setFUF] = useState("");
  const [fMes, setFMes] = useState("");
  const [limite, setLimite] = useState(60);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);

  const filtradas = useMemo(() => {
    const b = busca.trim().toLowerCase();
    return vendas
      .filter((v) => {
        if (b && !(`${v.nome} ${v.email} ${v.faculdade} ${v.tema}`.toLowerCase().includes(b))) return false;
        if (fTipo && v.tipo !== fTipo) return false;
        if (fUF && v.uf !== fUF) return false;
        if (fMes !== "" && mesDeIso(v.data) !== parseInt(fMes, 10)) return false;
        return true;
      })
      .sort((a, b) => (b.data || "").localeCompare(a.data || ""));
  }, [vendas, busca, fTipo, fUF, fMes]);

  // opções de faculdade para o seletor: base canônica + qualquer faculdade já usada
  const facOpts = useMemo(() => {
    const ufMap = { ...FAC_BASE.ufMap };
    const set = new Set(FAC_BASE.nomes);
    vendas.forEach((v) => {
      const nome = (v.faculdade || "").trim();
      if (!nome) return;
      set.add(nome);
      if (!ufMap[nome] || ufMap[nome] === "N/I") ufMap[nome] = v.uf || "N/I";
    });
    const nomes = Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
    return { nomes, ufMap };
  }, [vendas]);

  const somaFiltro = filtradas.reduce((s, v) => s + v.valor, 0);
  const ufsDisponiveis = [...new Set(vendas.map((v) => v.uf))].sort();

  const remover = (id) => {
    if (!confirm("Remover esta venda?")) return;
    salvar(vendas.filter((v) => v.id !== id));
    aviso("Venda removida");
  };
  const salvarVenda = (dados) => {
    if (editando) {
      salvar(vendas.map((v) => (v.id === editando.id ? { ...v, ...dados } : v)));
      aviso("Venda atualizada");
    } else {
      salvar([{ id: "s" + uid(), ...dados }, ...vendas]);
      aviso("Venda adicionada");
    }
    setModal(false); setEditando(null);
  };

  return (
    <>
      <Header titulo="Vendas" sub={`${num(vendas.length)} vendas · ${brl(vendas.reduce((s, v) => s + v.valor, 0))} no total`}
        acao={<button className="btn" onClick={() => { setEditando(null); setModal(true); }}>+ Nova venda</button>} />

      <div className="filtros">
        <input className="inp busca" placeholder="Buscar por nome, email, faculdade ou tema…" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <select className="inp" value={fTipo} onChange={(e) => setFTipo(e.target.value)}>
          <option value="">Todos os tipos</option>
          {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="inp" value={fUF} onChange={(e) => setFUF(e.target.value)}>
          <option value="">Todos os estados</option>
          {ufsDisponiveis.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
        <select className="inp" value={fMes} onChange={(e) => setFMes(e.target.value)}>
          <option value="">Todos os meses</option>
          {MESES.map((mez, i) => <option key={i} value={i}>{mez}</option>)}
        </select>
      </div>

      <div className="resumo-filtro">
        <span>{num(filtradas.length)} resultado(s)</span>
        <span><b>{brl(somaFiltro)}</b></span>
      </div>

      <div className="card no-pad">
        <table className="tab">
          <thead>
            <tr><th>Data</th><th>Cliente</th><th>Faculdade</th><th>UF</th><th>Tipo</th><th className="r">Valor</th><th></th></tr>
          </thead>
          <tbody>
            {filtradas.slice(0, limite).map((v) => (
              <tr key={v.id}>
                <td className="nowrap muted">{fmtData(v.data)}</td>
                <td>
                  <div className="cel-nome">{v.nome || "—"}</div>
                  {v.tema && <div className="cel-tema" title={v.tema}>{v.tema}</div>}
                </td>
                <td className="cel-fac">{v.faculdade || "—"}</td>
                <td><span className="uf-pill">{v.uf}</span></td>
                <td><span className="tipo-pill" style={{ background: TIPO_COR[v.tipo] + "22", color: TIPO_COR[v.tipo] }}>{v.tipo}</span></td>
                <td className="r"><b>{brl(v.valor)}</b></td>
                <td className="acoes">
                  <button className="mini" onClick={() => { setEditando(v); setModal(true); }}>editar</button>
                  <button className="mini del" onClick={() => remover(v.id)}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtradas.length > limite && (
          <div className="mais"><button className="btn-ghost" onClick={() => setLimite((l) => l + 60)}>Mostrar mais ({num(filtradas.length - limite)} restantes)</button></div>
        )}
        {filtradas.length === 0 && <div className="vazio">Nenhuma venda encontrada com esses filtros.</div>}
      </div>

      {modal && (
        <FormVenda venda={editando} onSalvar={salvarVenda} onClose={() => { setModal(false); setEditando(null); }} temasExist={temasExist} facOpts={facOpts} />
      )}
    </>
  );
}

function FormVenda({ venda, onSalvar, onClose, temasExist, facOpts }) {
  const opts = facOpts || { nomes: FAC_BASE.nomes, ufMap: FAC_BASE.ufMap };
  // se a venda em edição tem faculdade fora da lista, tratamos como "outra"
  const facNaLista = venda && venda.faculdade && opts.nomes.includes(venda.faculdade);
  const [f, setF] = useState(venda || {
    data: new Date().toISOString().slice(0, 10), nome: "", email: "", faculdade: "",
    telefone: "", uf: "N/I", tipo: "Artigo", valor: "", tema: "",
  });
  const [outraFac, setOutraFac] = useState(!!(venda && venda.faculdade && !facNaLista));
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  // ao escolher faculdade na lista, puxa o estado automaticamente
  const aoEscolherFac = (nome) => {
    if (nome === "__outra__") { setOutraFac(true); set("faculdade", ""); return; }
    setOutraFac(false);
    const uf = opts.ufMap[nome] || "N/I";
    setF((p) => ({ ...p, faculdade: nome, uf }));
  };
  const submeter = () => {
    if (!f.nome.trim() && !f.email.trim()) { alert("Informe ao menos o nome ou o email."); return; }
    onSalvar({ ...f, valor: parseFloat(String(f.valor).replace(",", ".")) || 0 });
  };

  return (
    <Modal titulo={venda ? "Editar venda" : "Nova venda"} onClose={onClose} wide>
      <div className="form-grid">
        <Campo label="Data"><input type="date" className="inp" value={f.data || ""} onChange={(e) => set("data", e.target.value)} /></Campo>
        <Campo label="Valor pago (R$)"><input className="inp" inputMode="decimal" placeholder="220" value={f.valor} onChange={(e) => set("valor", e.target.value)} /></Campo>
        <Campo label="Nome do cliente"><input className="inp" value={f.nome} onChange={(e) => set("nome", e.target.value)} /></Campo>
        <Campo label="Email"><input className="inp" value={f.email} onChange={(e) => set("email", e.target.value)} /></Campo>
        <Campo label="Faculdade (define o estado)">
          <select className="inp" value={outraFac ? "__outra__" : (f.faculdade || "")} onChange={(e) => aoEscolherFac(e.target.value)}>
            <option value="">Selecione a faculdade...</option>
            {opts.nomes.map((n) => <option key={n} value={n}>{n}{opts.ufMap[n] && opts.ufMap[n] !== "N/I" ? ` · ${opts.ufMap[n]}` : ""}</option>)}
            <option value="__outra__">Outra (digitar nova)...</option>
          </select>
        </Campo>
        {outraFac ? (
          <Campo label="Nome da nova faculdade"><input className="inp" placeholder="Digite o nome da faculdade" value={f.faculdade} onChange={(e) => set("faculdade", e.target.value)} /></Campo>
        ) : (
          <Campo label="Telefone (opcional)"><input className="inp" placeholder="(31)99999-9999" value={f.telefone} onChange={(e) => set("telefone", e.target.value)} /></Campo>
        )}
        <Campo label="Tipo de trabalho">
          <select className="inp" value={f.tipo} onChange={(e) => set("tipo", e.target.value)}>
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Campo>
        <Campo label={outraFac ? "Estado (UF) da nova faculdade" : "Estado (UF)"}>
          <select className="inp" value={f.uf} onChange={(e) => set("uf", e.target.value)}>
            {["N/I", ...Object.keys(UF_NOME).filter((u) => u !== "N/I")].map((u) => <option key={u} value={u}>{u === "N/I" ? "Não identificado" : `${u} · ${UF_NOME[u]}`}</option>)}
          </select>
        </Campo>
        {outraFac && (
          <Campo label="Telefone (opcional)"><input className="inp" placeholder="(31)99999-9999" value={f.telefone} onChange={(e) => set("telefone", e.target.value)} /></Campo>
        )}
        <Campo label="Tema do trabalho">
          <input className="inp" list="temas-list" value={f.tema} onChange={(e) => set("tema", e.target.value)} />
          <datalist id="temas-list">{temasExist.map((t) => <option key={t.id} value={t.nome} />)}</datalist>
        </Campo>
      </div>
      <div className="form-acoes">
        <button className="btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn" onClick={submeter}>{venda ? "Salvar alterações" : "Adicionar venda"}</button>
      </div>
    </Modal>
  );
}

/* ============================================================
   CLIENTES
   ============================================================ */
function Clientes({ m, vendas, salvarCliente }) {
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState("total");
  const [limite, setLimite] = useState(50);
  const [sel, setSel] = useState(null);
  const [editando, setEditando] = useState(false);
  const abrir = (c) => { setSel(c); setEditando(false); };

  const lista = useMemo(() => {
    const b = busca.trim().toLowerCase();
    let arr = m.clientes.filter((c) => !b || `${c.nome} ${c.email} ${c.faculdade}`.toLowerCase().includes(b));
    if (ordem === "total") arr = [...arr].sort((a, b) => b.total - a.total);
    if (ordem === "qtd") arr = [...arr].sort((a, b) => b.qtd - a.qtd);
    if (ordem === "nome") arr = [...arr].sort((a, b) => a.nome.localeCompare(b.nome));
    return arr;
  }, [m.clientes, busca, ordem]);

  const recorrentes = m.clientes.filter((c) => c.qtd > 1).length;

  return (
    <>
      <Header titulo="Clientes" sub={`${num(m.clientes.length)} clientes · ${num(recorrentes)} compraram mais de uma vez`} />

      <div className="kpis kpis-3">
        <KPI label="Clientes únicos" valor={num(m.clientes.length)} cor="#6366A8" />
        <KPI label="Recorrentes (2+ compras)" valor={num(recorrentes)} sub={`${m.clientes.length ? Math.round((recorrentes / m.clientes.length) * 100) : 0}% da base`} cor="#2C7DA0" />
        <KPI label="Gasto médio por cliente" valor={brl(m.clientes.length ? m.totalFat / m.clientes.length : 0)} cor="#E8833A" />
      </div>

      <div className="filtros">
        <input className="inp busca" placeholder="Buscar cliente…" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <select className="inp" value={ordem} onChange={(e) => setOrdem(e.target.value)}>
          <option value="total">Ordenar por total gasto</option>
          <option value="qtd">Ordenar por nº de trabalhos</option>
          <option value="nome">Ordenar por nome</option>
        </select>
      </div>

      <div className="card no-pad">
        <table className="tab">
          <thead><tr><th>#</th><th>Cliente</th><th>Faculdade</th><th>UF</th><th className="r">Trabalhos</th><th className="r">Total gasto</th><th></th></tr></thead>
          <tbody>
            {lista.slice(0, limite).map((c, i) => (
              <tr key={c.chave} className="row-click" onClick={() => abrir(c)}>
                <td className="muted">{i + 1}</td>
                <td>
                  <div className="cel-nome">{c.nome || "—"}</div>
                  <div className="cel-tema">{c.email}</div>
                </td>
                <td className="cel-fac">{c.faculdade || "—"}</td>
                <td><span className="uf-pill">{c.uf}</span></td>
                <td className="r"><b>{c.qtd}</b></td>
                <td className="r"><b>{brl(c.total)}</b></td>
                <td className="muted">›</td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista.length > limite && (
          <div className="mais"><button className="btn-ghost" onClick={() => setLimite((l) => l + 50)}>Mostrar mais ({num(lista.length - limite)} restantes)</button></div>
        )}
      </div>

      {sel && (
        <Modal titulo={editando ? `Editar cliente · ${sel.nome}` : sel.nome} onClose={() => setSel(null)} wide>
          {editando ? (
            <FormCliente cliente={sel} onSalvar={(d) => { salvarCliente(sel, d); setSel(null); }} onCancelar={() => setEditando(false)} />
          ) : (
            <>
              <div className="cli-info">
                <div><span className="ci-lab">Email</span>{sel.email || "—"}</div>
                <div><span className="ci-lab">Faculdade</span>{sel.faculdade || "—"}</div>
                <div><span className="ci-lab">Estado</span>{UF_NOME[sel.uf] || sel.uf}</div>
                <div><span className="ci-lab">Total gasto</span><b>{brl(sel.total)}</b></div>
                <div><span className="ci-lab">Trabalhos</span><b>{sel.qtd}</b></div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
                <button className="btn-ghost" onClick={() => setEditando(true)}>Editar dados do cliente</button>
              </div>
              <h4 className="sub-h">Histórico de compras</h4>
              <table className="tab">
                <thead><tr><th>Data</th><th>Tipo</th><th>Tema</th><th className="r">Valor</th></tr></thead>
                <tbody>
                  {sel.compras.sort((a, b) => (b.data || "").localeCompare(a.data || "")).map((v) => (
                    <tr key={v.id}>
                      <td className="nowrap muted">{fmtData(v.data)}</td>
                      <td><span className="tipo-pill" style={{ background: TIPO_COR[v.tipo] + "22", color: TIPO_COR[v.tipo] }}>{v.tipo}</span></td>
                      <td className="cel-fac">{v.tema || "—"}</td>
                      <td className="r"><b>{brl(v.valor)}</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </Modal>
      )}
    </>
  );
}

function FormCliente({ cliente, onSalvar, onCancelar }) {
  const [f, setF] = useState({ nome: cliente.nome || "", email: cliente.email || "", faculdade: cliente.faculdade || "", uf: cliente.uf || "N/I" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const escolherFac = (nome) => {
    const uf = ufDaFaculdade(nome);
    setF((p) => ({ ...p, faculdade: nome, uf: uf !== "N/I" ? uf : p.uf }));
  };
  return (
    <>
      <div className="form-grid">
        <Campo label="Nome"><input className="inp" value={f.nome} onChange={(e) => set("nome", e.target.value)} /></Campo>
        <Campo label="Email"><input className="inp" value={f.email} onChange={(e) => set("email", e.target.value)} /></Campo>
        <Campo label="Faculdade (define o estado)">
          <input className="inp" list="fac-datalist-cli" value={f.faculdade} placeholder="Digite e escolha da lista" onChange={(e) => escolherFac(e.target.value)} />
          <datalist id="fac-datalist-cli">{FAC_BASE.nomes.map((n) => <option key={n} value={n} />)}</datalist>
        </Campo>
        <Campo label="Estado (UF)">
          <select className="inp" value={f.uf} onChange={(e) => set("uf", e.target.value)}>
            {["N/I", ...Object.keys(UF_NOME).filter((u) => u !== "N/I")].map((u) => <option key={u} value={u}>{u === "N/I" ? "Não identificado" : `${u} · ${UF_NOME[u]}`}</option>)}
          </select>
        </Campo>
      </div>
      <p className="nota">Aplica nome, email, faculdade e estado em <b>todas as {cliente.qtd} compra(s)</b> deste cliente.</p>
      <div className="form-acoes">
        <button className="btn-ghost" onClick={onCancelar}>Cancelar</button>
        <button className="btn" onClick={() => { if (!f.nome.trim() && !f.email.trim()) { alert("Informe nome ou email."); return; } onSalvar(f); }}>Salvar alterações</button>
      </div>
    </>
  );
}

/* ============================================================
   TRABALHOS (status)
   ============================================================ */
function Trabalhos({ trabalhos, salvar, aviso }) {
  const [busca, setBusca] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fTipo, setFTipo] = useState("");
  const [ordem, setOrdem] = useState("recentes");
  const [modal, setModal] = useState(false);

  const filtrados = useMemo(() => {
    const b = busca.trim().toLowerCase();
    const arr = trabalhos.filter((t) =>
      (!b || t.titulo.toLowerCase().includes(b)) &&
      (!fStatus || t.status === fStatus) &&
      (!fTipo || t.tipo === fTipo));
    const cmp = {
      recentes: (a, c) => (c.criadoEm || "").localeCompare(a.criadoEm || ""),
      antigos: (a, c) => (a.criadoEm || "").localeCompare(c.criadoEm || ""),
      status: (a, c) => STATUS.indexOf(a.status) - STATUS.indexOf(c.status) || (c.criadoEm || "").localeCompare(a.criadoEm || ""),
      titulo: (a, c) => a.titulo.localeCompare(c.titulo),
    }[ordem];
    return [...arr].sort(cmp);
  }, [trabalhos, busca, fStatus, fTipo, ordem]);

  const contagem = STATUS.map((s) => ({ s, n: trabalhos.filter((t) => t.status === s).length }));

  const mudarStatus = (id, status) => {
    salvar(trabalhos.map((t) => (t.id === id ? { ...t, status } : t)));
  };
  const remover = (id) => { if (confirm("Remover trabalho?")) { salvar(trabalhos.filter((t) => t.id !== id)); aviso("Removido"); } };
  const addTrab = (d) => { salvar([{ id: "t" + uid(), criadoEm: new Date().toISOString(), ...d }, ...trabalhos]); setModal(false); aviso("Trabalho adicionado"); };

  return (
    <>
      <Header titulo="Trabalhos" sub={`${num(trabalhos.length)} trabalhos no controle de produção`}
        acao={<button className="btn" onClick={() => setModal(true)}>+ Novo trabalho</button>} />

      <div className="kpis kpis-4">
        {contagem.map(({ s, n }) => (
          <button key={s} className={"kpi kpi-click " + (fStatus === s ? "kpi-ativo" : "")} onClick={() => setFStatus(fStatus === s ? "" : s)}>
            <div className="kpi-bar" style={{ background: STATUS_COR[s] }} />
            <div className="kpi-body"><div className="kpi-label">{s}</div><div className="kpi-valor">{n}</div></div>
          </button>
        ))}
      </div>

      <div className="filtros">
        <input className="inp busca" placeholder="Buscar trabalho pelo título…" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <select className="inp" value={fTipo} onChange={(e) => setFTipo(e.target.value)}>
          <option value="">Todos os tipos</option>
          {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="inp" value={ordem} onChange={(e) => setOrdem(e.target.value)}>
          <option value="recentes">Mais recentes primeiro</option>
          <option value="antigos">Mais antigos primeiro</option>
          <option value="status">Ordenar por status</option>
          <option value="titulo">Ordenar por título</option>
        </select>
        {fStatus && <button className="btn-ghost" onClick={() => setFStatus("")}>Limpar status: {fStatus}</button>}
      </div>

      <div className="card no-pad">
        <table className="tab">
          <thead><tr><th>Título</th><th>Tipo</th><th>Adicionado</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {filtrados.map((t) => (
              <tr key={t.id}>
                <td className="cel-titulo">{t.titulo}</td>
                <td><span className="tipo-pill" style={{ background: (TIPO_COR[t.tipo] || "#8B97A0") + "22", color: TIPO_COR[t.tipo] || "#8B97A0" }}>{t.tipo}</span></td>
                <td className="nowrap muted">{t.criadoEm ? fmtData(t.criadoEm.slice(0, 10)) : "—"}</td>
                <td>
                  <select className="status-sel" style={{ color: STATUS_COR[t.status], borderColor: STATUS_COR[t.status] + "55" }}
                    value={t.status} onChange={(e) => mudarStatus(t.id, e.target.value)}>
                    {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="acoes"><button className="mini del" onClick={() => remover(t.id)}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtrados.length === 0 && <div className="vazio">Nenhum trabalho encontrado.</div>}
      </div>

      {modal && <FormTrabalho onSalvar={addTrab} onClose={() => setModal(false)} />}
    </>
  );
}

function FormTrabalho({ onSalvar, onClose }) {
  const [f, setF] = useState({ titulo: "", tipo: "Artigo", status: "A fazer" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Modal titulo="Novo trabalho" onClose={onClose}>
      <Campo label="Título do trabalho"><input className="inp" value={f.titulo} onChange={(e) => set("titulo", e.target.value)} /></Campo>
      <Campo label="Tipo">
        <select className="inp" value={f.tipo} onChange={(e) => set("tipo", e.target.value)}>{TIPOS.map((t) => <option key={t}>{t}</option>)}</select>
      </Campo>
      <Campo label="Status">
        <select className="inp" value={f.status} onChange={(e) => set("status", e.target.value)}>{STATUS.map((s) => <option key={s}>{s}</option>)}</select>
      </Campo>
      <div className="form-acoes">
        <button className="btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn" onClick={() => { if (!f.titulo.trim()) { alert("Informe o título."); return; } onSalvar(f); }}>Adicionar</button>
      </div>
    </Modal>
  );
}

/* ============================================================
   FINANCEIRO
   ============================================================ */
function Financeiro({ financeiro, salvar, vendas, aviso, onCriarAno }) {
  const anos = useMemo(() => [...new Set(financeiro.map((f) => f.ano))].sort((a, b) => b - a), [financeiro]);
  const [ano, setAno] = useState(null);
  // abre no ano que tem dados (evita cair num ano recém-criado e vazio)
  const anoPadrao = useMemo(() => {
    let best = anos[0] ?? null, bestTot = -1;
    for (const a of anos) {
      const tot = financeiro.filter((f) => f.ano === a)
        .reduce((s, f) => s + (f.faturamento || 0) + (f.taxaPublicacao || 0) + (f.custoAds || 0) + (f.custoFixo || 0) + (f.custoExtra || 0), 0);
      if (tot > bestTot) { bestTot = tot; best = a; }
    }
    return best;
  }, [financeiro, anos]);
  const anoSel = ano ?? anoPadrao;
  const [editId, setEditId] = useState(null);
  const [cmpA, setCmpA] = useState("");
  const [cmpB, setCmpB] = useState("");

  const fatVendasMes = useMemo(() => {
    const arr = Array(12).fill(0);
    vendas.forEach((v) => { if (anoDeIso(v.data) === anoSel) { const mi = mesDeIso(v.data); if (mi != null) arr[mi] += v.valor; } });
    return arr;
  }, [vendas, anoSel]);

  const linhas = financeiro
    .filter((f) => f.ano === anoSel)
    .sort((a, b) => a.ordem - b.ordem)
    .map((f) => {
      const faturamento = fatVendasMes[f.ordem] || 0; // = soma das vendas pagas no mês (pela data do pagamento)
      const custoTotal = (f.taxaPublicacao || 0) + (f.custoAds || 0) + (f.custoFixo || 0) + (f.custoExtra || 0);
      return { ...f, faturamento, custoTotal, lucro: faturamento - custoTotal };
    });
  const tot = linhas.reduce((a, l) => ({
    faturamento: a.faturamento + (l.faturamento || 0),
    taxaPublicacao: a.taxaPublicacao + (l.taxaPublicacao || 0),
    custoAds: a.custoAds + (l.custoAds || 0),
    custoFixo: a.custoFixo + (l.custoFixo || 0),
    custoExtra: a.custoExtra + (l.custoExtra || 0),
    custoTotal: a.custoTotal + l.custoTotal,
    lucro: a.lucro + l.lucro,
  }), { faturamento: 0, taxaPublicacao: 0, custoAds: 0, custoFixo: 0, custoExtra: 0, custoTotal: 0, lucro: 0 });

  const salvarLinha = (id, dados) => {
    const nf = financeiro.map((f) => (f.id === id ? { ...f, ...dados } : f));
    salvar(nf); setEditId(null); aviso("Mês atualizado");
  };
  const novoAno = async () => {
    const a = parseInt(window.prompt("Criar fechamento para qual ano? (ex.: 2026)") || "", 10);
    if (!a || a < 2000 || a > 2100) return;
    if (anos.includes(a)) { setAno(a); aviso("Esse ano já existe"); return; }
    await onCriarAno(a); setAno(a);
  };
  const editLinha = linhas.find((l) => l.id === editId) || null;
  const chart = linhas.map((l) => ({ mes: l.mes.slice(0, 3), Faturamento: l.faturamento, Lucro: l.lucro }));

  // ---- movimentações: entradas = pagamentos recebidos (vendas); saídas = custos do financeiro ----
  const movimentacoes = useMemo(() => {
    const ent = vendas.filter((v) => v.data && (v.valor || 0) > 0).map((v) => ({
      data: v.data, quando: fmtData(v.data), tipo: "entrada",
      label: "Pagamento recebido" + (v.nome ? ` · ${v.nome}` : (v.tema ? ` · ${v.tema}` : "")),
      valor: v.valor || 0,
    }));
    const said = [];
    financeiro.forEach((f) => {
      const dataMes = `${f.ano}-${String((f.ordem ?? 0) + 1).padStart(2, "0")}-15`;
      const quando = `${f.mes}/${f.ano}`;
      if ((f.taxaPublicacao || 0) > 0) said.push({ data: dataMes, quando, tipo: "saida", label: "Taxa de publicação", valor: f.taxaPublicacao });
      if ((f.custoAds || 0) > 0) said.push({ data: dataMes, quando, tipo: "saida", label: "Anúncios (Ads)", valor: f.custoAds });
      if ((f.custoFixo || 0) > 0) said.push({ data: dataMes, quando, tipo: "saida", label: "Custo fixo", valor: f.custoFixo });
      if ((f.custoExtra || 0) > 0) said.push({ data: dataMes, quando, tipo: "saida", label: "Custo extra" + (f.custoExtraDesc ? ` · ${f.custoExtraDesc}` : ""), valor: f.custoExtra });
    });
    return [...ent, ...said].sort((a, b) => (b.data || "").localeCompare(a.data || ""));
  }, [vendas, financeiro]);
  const LIM_MOV = 60;

  // ---- comparar meses (usa o fechamento mensal) ----
  const mesesComp = useMemo(() => financeiro
    .map((f) => ({ key: `${f.ano}-${f.ordem}`, rot: `${f.mes}/${f.ano}` }))
    .sort((a, b) => b.key.localeCompare(a.key, undefined, { numeric: true })), [financeiro]);
  const resumoDe = (key) => {
    if (!key) return null;
    const [a, o] = key.split("-").map(Number);
    const f = financeiro.find((x) => x.ano === a && x.ordem === o);
    if (!f) return null;
    const entrou = vendas.reduce((s, v) => (anoDeIso(v.data) === a && mesDeIso(v.data) === o ? s + (v.valor || 0) : s), 0);
    const saiu = (f.taxaPublicacao || 0) + (f.custoAds || 0) + (f.custoFixo || 0) + (f.custoExtra || 0);
    return { rot: `${f.mes}/${f.ano}`, entrou, saiu, saldo: entrou - saiu };
  };
  const rA = resumoDe(cmpA), rB = resumoDe(cmpB);
  const difCell = (a, b, higherIsBetter = true) => {
    const d = b - a;
    if (d === 0) return <span className="muted">—</span>;
    const bom = higherIsBetter ? d > 0 : d < 0;
    const sinal = d > 0 ? "+" : "−";
    const pct = a !== 0 ? ` (${sinal}${Math.abs(Math.round((d / a) * 100))}%)` : "";
    return <span className={bom ? "pos" : "negv"}>{sinal}{brl(Math.abs(d))}{pct}</span>;
  };

  return (
    <>
      <Header titulo="Financeiro" sub="Fechamento mensal por ano: faturamento, custos e lucro"
        acao={<button className="btn-ghost" onClick={novoAno}>+ Novo ano</button>} />

      <div className="periodo-bar">
        <span className="periodo-lab">Ano</span>
        <select className="inp" value={anoSel ?? ""} onChange={(e) => setAno(Number(e.target.value))}>
          {anos.length === 0 && <option value="">—</option>}
          {anos.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        {anoSel != null && <span className="periodo-info">{brl(tot.faturamento)} faturados · lucro {brl(tot.lucro)}</span>}
      </div>

      {anoSel == null ? (
        <div className="card"><div className="vazio">Nenhum fechamento cadastrado. Clique em “+ Novo ano” para começar.</div></div>
      ) : (
        <>
          <div className="kpis kpis-3">
            <KPI label="Faturamento no ano" valor={brl(tot.faturamento)} cor="#2C7DA0" />
            <KPI label="Custo total no ano" valor={brl(tot.custoTotal)} sub={`Publicação ${brl(tot.taxaPublicacao)} · Ads ${brl(tot.custoAds)}`} cor="#C2477A" />
            <KPI label="Lucro líquido no ano" valor={brl(tot.lucro)} sub={tot.faturamento ? `Margem ${Math.round((tot.lucro / tot.faturamento) * 100)}%` : ""} cor="#2E9E7B" />
          </div>

          <div className="card">
            <div className="card-head"><h3>Faturamento × lucro por mês · {anoSel}</h3></div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEFF1" />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#5B6B73" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#5B6B73" }} axisLine={false} tickLine={false} tickFormatter={(v) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
                <Tooltip formatter={(v) => brl(v)} cursor={{ fill: "#F0F4F5" }} />
                <Bar dataKey="Faturamento" fill="#2C7DA0" radius={[4, 4, 0, 0]} maxBarSize={26} />
                <Bar dataKey="Lucro" fill="#2E9E7B" radius={[4, 4, 0, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card no-pad">
            <div className="card-head pad"><h3>Fechamento mensal · {anoSel}</h3><span className="hint">Faturamento = soma das vendas pagas no mês · “editar” ajusta os custos</span></div>
            <div className="scroll-x">
              <table className="tab fin">
                <thead>
                  <tr>
                    <th>Mês</th><th className="r">Faturamento</th><th className="r">Taxa public.</th>
                    <th className="r">Ads</th><th className="r">Custo fixo</th><th className="r">Extra</th>
                    <th className="r">Custo total</th><th className="r">Lucro</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((l) => (
                    <tr key={l.id} className={l.faturamento === 0 && l.custoTotal === 0 ? "row-zero" : ""}>
                      <td><b>{l.mes}</b></td>
                      <td className="r">{brl(l.faturamento)}</td>
                      <td className="r neg">{brl(l.taxaPublicacao)}</td>
                      <td className="r neg">{brl(l.custoAds)}</td>
                      <td className="r neg">{brl(l.custoFixo)}</td>
                      <td className="r neg">{brl(l.custoExtra)}{l.custoExtraDesc ? <div className="extra-desc" title={l.custoExtraDesc}>{l.custoExtraDesc}</div> : null}</td>
                      <td className="r neg"><b>{brl(l.custoTotal)}</b></td>
                      <td className="r"><b className={l.lucro >= 0 ? "pos" : "negv"}>{brl(l.lucro)}</b></td>
                      <td className="acoes"><button className="mini" onClick={() => setEditId(l.id)}>editar</button></td>
                    </tr>
                  ))}
                  <tr className="row-total">
                    <td>TOTAL</td>
                    <td className="r">{brl(tot.faturamento)}</td>
                    <td className="r">{brl(tot.taxaPublicacao)}</td>
                    <td className="r">{brl(tot.custoAds)}</td>
                    <td className="r">{brl(tot.custoFixo)}</td>
                    <td className="r">{brl(tot.custoExtra)}</td>
                    <td className="r">{brl(tot.custoTotal)}</td>
                    <td className="r"><b className="pos">{brl(tot.lucro)}</b></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h3>Comparar meses</h3><span className="hint">escolha dois meses (de qualquer ano)</span></div>
            <div className="cmp-pick">
              <select className="inp" value={cmpA} onChange={(e) => setCmpA(e.target.value)}>
                <option value="">Mês A…</option>
                {mesesComp.map((m) => <option key={m.key} value={m.key}>{m.rot}</option>)}
              </select>
              <span className="cmp-vs">vs</span>
              <select className="inp" value={cmpB} onChange={(e) => setCmpB(e.target.value)}>
                <option value="">Mês B…</option>
                {mesesComp.map((m) => <option key={m.key} value={m.key}>{m.rot}</option>)}
              </select>
            </div>
            {rA && rB ? (
              <div className="scroll-x">
                <table className="tab cmp">
                  <thead><tr><th></th><th className="r">{rA.rot}</th><th className="r">{rB.rot}</th><th className="r">Diferença</th></tr></thead>
                  <tbody>
                    <tr><td>Entrou (faturamento)</td><td className="r">{brl(rA.entrou)}</td><td className="r">{brl(rB.entrou)}</td><td className="r">{difCell(rA.entrou, rB.entrou, true)}</td></tr>
                    <tr><td>Saiu (custos)</td><td className="r neg">{brl(rA.saiu)}</td><td className="r neg">{brl(rB.saiu)}</td><td className="r">{difCell(rA.saiu, rB.saiu, false)}</td></tr>
                    <tr className="row-total"><td>Saldo (lucro)</td><td className="r"><b className={rA.saldo >= 0 ? "pos" : "negv"}>{brl(rA.saldo)}</b></td><td className="r"><b className={rB.saldo >= 0 ? "pos" : "negv"}>{brl(rB.saldo)}</b></td><td className="r">{difCell(rA.saldo, rB.saldo, true)}</td></tr>
                  </tbody>
                </table>
              </div>
            ) : <div className="vazio pad">Escolha dois meses para comparar.</div>}
          </div>

          <div className="card no-pad">
            <div className="card-head pad">
              <h3>Movimentações recentes</h3>
              <span className="hint">pagamentos recebidos (+) e custos (−) · {movimentacoes.length} no total</span>
            </div>
            <div className="scroll-x">
              <table className="tab mov">
                <thead><tr><th>Quando</th><th>Movimentação</th><th className="r">Valor</th></tr></thead>
                <tbody>
                  {movimentacoes.slice(0, LIM_MOV).map((m, i) => (
                    <tr key={i}>
                      <td className="nowrap muted">{m.quando}</td>
                      <td><span className={`mov-dot ${m.tipo}`}>{m.tipo === "entrada" ? "↑" : "↓"}</span>{m.label}</td>
                      <td className={`r mov-val ${m.tipo}`}>{m.tipo === "entrada" ? "+" : "−"}{brl(m.valor)}</td>
                    </tr>
                  ))}
                  {movimentacoes.length === 0 && <tr><td colSpan={3} className="vazio">Sem movimentações ainda.</td></tr>}
                </tbody>
              </table>
            </div>
            {movimentacoes.length > LIM_MOV && <div className="mov-mais">Mostrando as {LIM_MOV} mais recentes de {movimentacoes.length}.</div>}
          </div>
        </>
      )}

      {editLinha && (
        <FormMes linha={editLinha} onSalvar={(d) => salvarLinha(editLinha.id, d)} onClose={() => setEditId(null)} />
      )}
    </>
  );
}

function FormMes({ linha, onSalvar, onClose }) {
  const [f, setF] = useState({
    faturamento: linha.faturamento || 0, taxaPublicacao: linha.taxaPublicacao || 0,
    custoAds: linha.custoAds || 0, custoFixo: linha.custoFixo || 0, custoExtra: linha.custoExtra || 0,
    custoExtraDesc: linha.custoExtraDesc || "",
  });
  const setn = (k, v) => setF((p) => ({ ...p, [k]: parseFloat(String(v).replace(",", ".")) || 0 }));
  const setTxt = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const ct = f.taxaPublicacao + f.custoAds + f.custoFixo + f.custoExtra;
  return (
    <Modal titulo={`Fechamento · ${linha.mes}`} onClose={onClose}>
      <div className="fatura-auto">
        Faturamento (soma das vendas pagas no mês): <b>{brl(f.faturamento)}</b>
        <div className="hint">Calculado automaticamente pelas vendas. Para mudar, ajuste as vendas do mês.</div>
      </div>
      <div className="form-grid">
        <Campo label="Taxa de publicação"><input className="inp" defaultValue={f.taxaPublicacao} onChange={(e) => setn("taxaPublicacao", e.target.value)} /></Campo>
        <Campo label="Custo com anúncios (Ads)"><input className="inp" defaultValue={f.custoAds} onChange={(e) => setn("custoAds", e.target.value)} /></Campo>
        <Campo label="Custo fixo"><input className="inp" defaultValue={f.custoFixo} onChange={(e) => setn("custoFixo", e.target.value)} /></Campo>
        <Campo label="Custo extra / variável"><input className="inp" defaultValue={f.custoExtra} onChange={(e) => setn("custoExtra", e.target.value)} /></Campo>
      </div>
      <Campo label="Descrição do custo extra (opcional)">
        <input className="inp" placeholder="Ex.: Compra de celular" value={f.custoExtraDesc} onChange={(e) => setTxt("custoExtraDesc", e.target.value)} />
      </Campo>
      <div className="resumo-mes">
        <div><span>Custo total</span><b className="negv">{brl(ct)}</b></div>
        <div><span>Lucro</span><b className={f.faturamento - ct >= 0 ? "pos" : "negv"}>{brl(f.faturamento - ct)}</b></div>
      </div>
      <div className="form-acoes">
        <button className="btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn" onClick={() => onSalvar(f)}>Salvar fechamento</button>
      </div>
    </Modal>
  );
}

/* ============================================================
   TEMAS E VAGAS
   ============================================================ */
function Temas({ temas, vendas, onAdd, onRem, onEdit, onAddPart, onEditPart, onRemPart, onLancarTaxa, aviso }) {
  const [busca, setBusca] = useState("");
  const [soComVaga, setSoComVaga] = useState(false);
  const [selId, setSelId] = useState(null);
  const [modalTema, setModalTema] = useState(false);

  const lista = useMemo(() => {
    const b = busca.trim().toLowerCase();
    return temas
      .filter((t) => !b || t.nome.toLowerCase().includes(b))
      .filter((t) => !soComVaga || t.participantes.length < t.maxVagas)
      .sort((a, b) => (b.criadoEm || "").localeCompare(a.criadoEm || ""));
  }, [temas, busca, soComVaga]);

  const sel = temas.find((t) => t.id === selId) || null;
  const comVaga = temas.filter((t) => t.participantes.length < t.maxVagas).length;
  const totalPart = temas.reduce((s, t) => s + t.participantes.length, 0);

  const criar = (d) => { onAdd(d); setModalTema(false); };
  const excluir = (t) => { if (confirm("Remover esta publicação?")) { onRem(t.id); if (selId === t.id) setSelId(null); } };

  return (
    <>
      <Header titulo="Publicações e vagas" sub={`${num(temas.length)} publicações · ${num(totalPart)} participações · ${num(comVaga)} com vaga aberta`}
        acao={<button className="btn" onClick={() => setModalTema(true)}>+ Nova publicação</button>} />

      <div className="filtros">
        <input className="inp busca" placeholder="Buscar publicação…" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <label className="check"><input type="checkbox" checked={soComVaga} onChange={(e) => setSoComVaga(e.target.checked)} /> só com vaga aberta</label>
      </div>

      <div className="pub-split">
        <div className="pub-lista card no-pad">
          {lista.map((t) => {
            const restantes = t.maxVagas - t.participantes.length;
            const cheio = restantes <= 0;
            const pct = Math.min(100, (t.participantes.length / t.maxVagas) * 100);
            return (
              <button key={t.id} className={"pub-item" + (selId === t.id ? " ativo" : "")} onClick={() => setSelId(t.id)}>
                <div className="pub-item-top">
                  <span className="pub-item-nome">{t.nome}</span>
                  <span className={"vagas-badge " + (cheio ? "b-cheio" : restantes <= 2 ? "b-quase" : "b-ok")}>
                    {cheio ? "Lotado" : `${restantes} vaga${restantes > 1 ? "s" : ""}`}
                  </span>
                </div>
                <div className="pub-item-prog"><div className="pub-item-fill" style={{ width: `${pct}%`, background: cheio ? "#C2477A" : "#2C7DA0" }} /></div>
                <div className="pub-item-sub">
                  <span className="chip-tipo sm" style={{ background: TIPO_COR[t.tipo] || "#7A8893" }}>{t.tipo || "Artigo"}</span>
                  <span className="pub-item-ocup">{t.participantes.length}/{t.maxVagas}</span>
                </div>
              </button>
            );
          })}
          {lista.length === 0 && <div className="vazio">Nenhuma publicação encontrada.</div>}
        </div>

        <div className="pub-detalhe card">
          {!sel ? (
            <div className="pub-vazio-det">
              <div className="pub-vazio-ic">≡</div>
              <p>Selecione uma publicação na lista para ver os participantes e lançar pessoas (com o valor pago).</p>
            </div>
          ) : (
            <DetalhePub key={sel.id} t={sel} vendas={vendas} onEdit={onEdit} onAddPart={onAddPart} onEditPart={onEditPart} onRemPart={onRemPart} onLancarTaxa={onLancarTaxa} onExcluir={() => excluir(sel)} />
          )}
        </div>
      </div>

      {modalTema && <FormTema onSalvar={criar} onClose={() => setModalTema(false)} />}
    </>
  );
}

function DetalhePub({ t, vendas = [], onEdit, onAddPart, onEditPart, onRemPart, onLancarTaxa, onExcluir }) {
  const restantes = t.maxVagas - t.participantes.length;
  const cheio = restantes <= 0;
  const pct = Math.min(100, (t.participantes.length / t.maxVagas) * 100);
  const [editP, setEditP] = useState(null);
  const [taxaVal, setTaxaVal] = useState("");
  const [taxaData, setTaxaData] = useState(hojeIso());
  const lancar = () => {
    const v = parseFloat(String(taxaVal).replace(",", ".")) || 0;
    if (v <= 0) { alert("Informe o valor da taxa."); return; }
    onLancarTaxa(t, v, taxaData); setTaxaVal("");
  };
  // faturamento = soma de UMA venda por participante (à prova de venda duplicada);
  // bate exatamente com os valores mostrados por pessoa na lista
  const faturamento = useMemo(() => {
    const vistos = new Set();
    let total = 0;
    for (const p of t.participantes) {
      const v = vendas.find((x) =>
        (x.participanteId && x.participanteId === p.id) ||
        (x.tema === t.nome && (x.nome || "").trim().toLowerCase() === (p.nome || "").trim().toLowerCase())
      );
      if (v && !vistos.has(v.id)) { total += v.valor || 0; vistos.add(v.id); }
    }
    return total;
  }, [vendas, t.participantes, t.nome]);
  const lucro = faturamento - (t.taxa || 0);
  // venda de um participante (vínculo direto ou pelo tema + nome)
  const vendaDoPart = (p) => vendas.find((v) =>
    (v.participanteId && v.participanteId === p.id) ||
    (v.tema === t.nome && (v.nome || "").trim().toLowerCase() === (p.nome || "").trim().toLowerCase())
  );
  const semGraduado = t.requiresGrad && !t.participantes.some((p) => p.graduado);
  return (
    <div className="dp">
      <div className="dp-head">
        <h3 className="dp-nome">{t.nome}</h3>
        <button className="mini del" onClick={onExcluir}>excluir</button>
      </div>
      <div className="dp-prog"><div className="dp-prog-fill" style={{ width: `${pct}%`, background: cheio ? "#C2477A" : "#2C7DA0" }} /></div>
      <div className="dp-ocup">{t.participantes.length} de {t.maxVagas} vagas ocupadas{t.area ? ` · ${t.area}` : ""}</div>

      <div className="dp-fin">
        <div className="dp-fin-item"><span>Faturamento</span><b>{brl(faturamento)}</b></div>
        <div className="dp-fin-item"><span>Taxa de publicação</span><b className={(t.taxa || 0) > 0 ? "negv" : ""}>{brl(t.taxa || 0)}</b></div>
        <div className="dp-fin-item"><span>Lucro</span><b className={lucro >= 0 ? "pos" : "negv"}>{brl(lucro)}</b></div>
      </div>

      <div className="dp-controles">
        <label className="ep-campo">Tipo
          <select className="max-inp wide" value={t.tipo || "Artigo"} onChange={(e) => onEdit(t.id, { tipo: e.target.value })}>
            {TIPOS.map((tp) => <option key={tp} value={tp}>{tp}</option>)}
          </select>
        </label>
        <label className="ep-campo">Vagas
          <input type="number" min="1" className="max-inp" value={t.maxVagas} onChange={(e) => onEdit(t.id, { maxVagas: parseInt(e.target.value, 10) || 1 })} />
        </label>
        <label className="check sm grad-check"><input type="checkbox" checked={!!t.requiresGrad} onChange={(e) => onEdit(t.id, { requiresGrad: e.target.checked })} /> exige graduado</label>
      </div>

      <div className="dp-taxa">
        {t.taxaLancada ? (
          <span className="dp-taxa-ok">Taxa de publicação: <b>{brl(t.taxa)}</b> · lançada no financeiro</span>
        ) : (
          <>
            <span className="dp-taxa-lab">Taxa de publicação (custo único)</span>
            <input className="inp sm dp-taxa-val" inputMode="decimal" placeholder="R$" value={taxaVal} onChange={(e) => setTaxaVal(e.target.value)} />
            <input className="inp sm" type="date" value={taxaData} onChange={(e) => setTaxaData(e.target.value)} />
            <button className="btn sm" onClick={lancar}>lançar no financeiro</button>
          </>
        )}
      </div>

      {semGraduado && (
        cheio
          ? <div className="aviso-grad erro">Lotada sem nenhum graduado — esta publicação exige pelo menos um participante graduado.</div>
          : <div className="aviso-grad">Exige graduado · ainda não há nenhum graduado entre os participantes.</div>
      )}

      <h4 className="dp-sub">Participantes ({t.participantes.length})</h4>
      <ul className="parts">
        {t.participantes.map((p) => {
          const vd = vendaDoPart(p);
          return (
            <li key={p.id}>
              <div>
                <span className="p-nome">{p.nome}</span>
                {p.autorPrincipal && <span className="tag-autor">autor principal</span>}
                {p.graduado && <span className="tag-grad">graduado</span>}
                <div className="p-fac">{p.faculdade}{p.email ? ` · ${p.email}` : ""}</div>
              </div>
              <div className="p-acoes">
                <span className="p-valor" title="Valor pago na vaga">{vd ? brl(vd.valor) : "—"}</span>
                <button className="mini" onClick={() => setEditP(p)}>editar</button>
                <button className="mini del" onClick={() => onRemPart(t.id, p.id)}>×</button>
              </div>
            </li>
          );
        })}
        {t.participantes.length === 0 && <li className="p-vazio">Sem participantes ainda.</li>}
      </ul>

      {cheio
        ? <div className="dp-lotado">Publicação lotada ({t.maxVagas}/{t.maxVagas}). Aumente as vagas para adicionar mais pessoas.</div>
        : <FormPart tema={t} onAdd={(d) => onAddPart(t, d)} />}

      {editP && (
        <Modal titulo="Editar participante" onClose={() => setEditP(null)}>
          <FormParticipante part={editP} valorAtual={vendaDoPart(editP)?.valor ?? ""} onSalvar={(d) => { onEditPart(t, editP, d); setEditP(null); }} onCancelar={() => setEditP(null)} />
        </Modal>
      )}
    </div>
  );
}

function FormPart({ tema, onAdd }) {
  const vazio = { nome: "", faculdade: "", email: "", autorPrincipal: false, graduado: false, valor: "", data: hojeIso(), lancarVenda: true };
  const [p, setP] = useState(vazio);
  const set = (k, v) => setP((x) => ({ ...x, [k]: v }));
  const enviar = () => {
    if (!p.nome.trim()) { alert("Informe o nome."); return; }
    const valor = parseFloat(String(p.valor).replace(",", ".")) || 0;
    onAdd({ ...p, valor });
    setP({ ...vazio, data: p.data });
  };
  return (
    <div className="form-part">
      <div className="fp-titulo">Adicionar pessoa{p.lancarVenda ? " + lançar venda" : ""}</div>
      <div className="fp-grid">
        <input className="inp sm" placeholder="Nome" value={p.nome} onChange={(e) => set("nome", e.target.value)} />
        <input className="inp sm" placeholder="Faculdade" list="fac-datalist" value={p.faculdade} onChange={(e) => set("faculdade", e.target.value)} />
        <input className="inp sm" placeholder="Email" value={p.email} onChange={(e) => set("email", e.target.value)} />
        <input className="inp sm" inputMode="decimal" placeholder="Valor pago (R$)" value={p.valor} onChange={(e) => set("valor", e.target.value)} />
        <input className="inp sm" type="date" value={p.data} onChange={(e) => set("data", e.target.value)} />
      </div>
      <datalist id="fac-datalist">{FAC_BASE.nomes.map((n) => <option key={n} value={n} />)}</datalist>
      <div className="fp-opts">
        <label className="check sm"><input type="checkbox" checked={p.lancarVenda} onChange={(e) => set("lancarVenda", e.target.checked)} /> lançar venda ({tema.tipo})</label>
        <label className="check sm"><input type="checkbox" checked={p.autorPrincipal} onChange={(e) => set("autorPrincipal", e.target.checked)} /> autor principal</label>
        <label className="check sm"><input type="checkbox" checked={p.graduado} onChange={(e) => set("graduado", e.target.checked)} /> graduado</label>
        <button className="btn sm" onClick={enviar}>adicionar</button>
      </div>
    </div>
  );
}

function FormParticipante({ part, valorAtual = "", onSalvar, onCancelar }) {
  const [f, setF] = useState({
    nome: part.nome || "", faculdade: part.faculdade || "", email: part.email || "",
    autorPrincipal: !!part.autorPrincipal, graduado: !!part.graduado,
    valor: valorAtual === "" || valorAtual == null ? "" : String(valorAtual),
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const salvar = () => {
    if (!f.nome.trim()) { alert("Informe o nome."); return; }
    onSalvar({ ...f, valor: parseFloat(String(f.valor).replace(",", ".")) || 0 });
  };
  return (
    <>
      <Campo label="Nome"><input className="inp" value={f.nome} onChange={(e) => set("nome", e.target.value)} /></Campo>
      <Campo label="Faculdade">
        <input className="inp" list="fac-datalist-pe" placeholder="Digite e escolha da lista" value={f.faculdade} onChange={(e) => set("faculdade", e.target.value)} />
        <datalist id="fac-datalist-pe">{FAC_BASE.nomes.map((n) => <option key={n} value={n} />)}</datalist>
      </Campo>
      <div className="form-grid">
        <Campo label="Email"><input className="inp" value={f.email} onChange={(e) => set("email", e.target.value)} /></Campo>
        <Campo label="Valor pago na vaga (R$)"><input className="inp" inputMode="decimal" value={f.valor} onChange={(e) => set("valor", e.target.value)} /></Campo>
      </div>
      <div className="fp-opts">
        <label className="check sm"><input type="checkbox" checked={f.autorPrincipal} onChange={(e) => set("autorPrincipal", e.target.checked)} /> autor principal</label>
        <label className="check sm"><input type="checkbox" checked={f.graduado} onChange={(e) => set("graduado", e.target.checked)} /> graduado</label>
      </div>
      <div className="form-acoes">
        <button className="btn-ghost" onClick={onCancelar}>Cancelar</button>
        <button className="btn" onClick={salvar}>Salvar</button>
      </div>
    </>
  );
}

function FormTema({ onSalvar, onClose }) {
  const [f, setF] = useState({ nome: "", tipo: "Artigo", area: "", maxVagas: 6, requiresGrad: false });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Modal titulo="Nova publicação" onClose={onClose}>
      <Campo label="Tema da publicação"><input className="inp" value={f.nome} onChange={(e) => set("nome", e.target.value)} /></Campo>
      <div className="form-grid">
        <Campo label="Tipo de trabalho">
          <select className="inp" value={f.tipo} onChange={(e) => set("tipo", e.target.value)}>
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Campo>
        <Campo label="Número de vagas"><input type="number" min="1" className="inp" value={f.maxVagas} onChange={(e) => set("maxVagas", parseInt(e.target.value, 10) || 1)} /></Campo>
      </div>
      <Campo label="Área (opcional)"><input className="inp" placeholder="Ex.: Cirurgia Geral · Emergência" value={f.area} onChange={(e) => set("area", e.target.value)} /></Campo>
      <label className="check pub-grad"><input type="checkbox" checked={f.requiresGrad} onChange={(e) => set("requiresGrad", e.target.checked)} /> é necessário ao menos um médico graduado?</label>
      <div className="form-acoes">
        <button className="btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn" onClick={() => { if (!f.nome.trim()) { alert("Informe o tema."); return; } onSalvar(f); }}>Criar publicação</button>
      </div>
    </Modal>
  );
}

/* ============================================================
   HEADER + ESTILOS
   ============================================================ */
function Header({ titulo, sub, acao }) {
  return (
    <div className="head">
      <div>
        <h1>{titulo}</h1>
        {sub && <p className="head-sub">{sub}</p>}
      </div>
      {acao}
    </div>
  );
}

function Estilos() {
  return (
    <style>{`
* { box-sizing: border-box; margin: 0; padding: 0; }
:root{
  --ink:#1D3557; --brand:#2C7DA0; --brand-deep:#1D3557; --accent:#E8833A;
  --bg:#F5F7FA; --surface:#FFFFFF; --border:#E3E8EF; --muted:#5B6B73; --muted2:#8997A0;
}
.root{ display:flex; min-height:100vh; background:var(--bg);
  font-family:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif; color:var(--ink);
  font-size:14px; -webkit-font-smoothing:antialiased; }
.root :is(table,td,th,.kpi-valor,.barra-val,.leg-val){ font-variant-numeric:tabular-nums; }

/* SIDEBAR */
.side{ width:236px; flex-shrink:0; background:linear-gradient(180deg,#244468 0%,#1D3557 55%,#16273C 100%); color:#CFE0E3; display:flex; flex-direction:column;
  position:sticky; top:0; height:100vh; }
.brand{ display:flex; flex-direction:column; align-items:flex-start; gap:7px; padding:24px 22px 18px; }
.brand-mark{ width:38px; height:38px; border-radius:10px; background:linear-gradient(135deg,var(--brand),var(--brand-deep));
  display:grid; place-items:center; font-weight:800; font-size:20px; color:#fff; }
.brand-nome{ font-weight:700; font-size:16px; color:#fff; letter-spacing:.2px; }
.brand-sub{ font-size:11px; color:#7E97A0; margin-top:1px; }
nav{ display:flex; flex-direction:column; gap:2px; padding:8px 12px; }
.nav{ display:flex; align-items:center; gap:11px; padding:10px 13px; border:none; background:transparent;
  color:#A9C0C6; font-size:13.5px; border-radius:9px; cursor:pointer; text-align:left; width:100%; font-weight:500;
  transition:.13s; font-family:inherit; }
.nav:hover{ background:rgba(255,255,255,.06); color:#E6F1F3; }
.nav.ativo{ background:var(--brand); color:#fff; }
.nav-ic{ width:18px; text-align:center; font-size:13px; opacity:.9; }
.side-foot{ margin-top:auto; padding:16px; }
.persist{ font-size:11px; display:flex; align-items:center; gap:7px; color:#7E97A0; line-height:1.4; }
.pdot{ width:7px; height:7px; border-radius:50%; flex-shrink:0; }
.persist.on .pdot{ background:#3FBF8F; box-shadow:0 0 0 3px rgba(63,191,143,.18); }
.persist.off .pdot{ background:var(--accent); }

/* MAIN */
.main{ flex:1; padding:32px 44px 70px; min-width:0; max-width:1840px; }
.head{ display:flex; justify-content:space-between; align-items:flex-end; gap:16px; margin-bottom:28px; }
.head h1{ font-size:28px; font-weight:700; letter-spacing:-.6px; }
.head-sub{ color:var(--muted); font-size:13px; margin-top:3px; }

/* KPIs */
.kpis{ display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin-bottom:22px; }
.kpis-3{ grid-template-columns:repeat(3,1fr); }
.kpis-4{ grid-template-columns:repeat(4,1fr); }
.kpi{ background:var(--surface); border:1px solid var(--border); border-radius:16px; overflow:hidden;
  display:flex; box-shadow:0 1px 2px rgba(29,53,87,.03); }
.kpi-bar{ width:4px; flex-shrink:0; }
.kpi-body{ padding:18px 20px; }
.kpi-label{ font-size:11px; color:var(--muted); font-weight:700; text-transform:uppercase; letter-spacing:.7px; }
.kpi-valor{ font-size:28px; font-weight:700; margin-top:7px; letter-spacing:-.7px; }
.kpi-sub{ font-size:11.5px; color:var(--muted2); margin-top:3px; }
.kpi-click{ cursor:pointer; text-align:left; font-family:inherit; transition:.13s; }
.kpi-click:hover{ box-shadow:0 3px 10px rgba(29,53,87,.08); transform:translateY(-1px); }
.kpi-ativo{ outline:2px solid var(--brand); }

/* CARDS */
.card{ background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:22px 24px;
  margin-bottom:20px; box-shadow:0 1px 2px rgba(29,53,87,.05), 0 6px 22px rgba(29,53,87,.05); }
.card.no-pad{ padding:0; overflow:hidden; }
.card-head{ display:flex; align-items:baseline; justify-content:space-between; gap:10px; margin-bottom:14px; }
.card-head.pad{ padding:18px 20px 0; }
.card-head h3{ font-size:15.5px; font-weight:700; letter-spacing:-.2px; }
.hint{ font-size:11.5px; color:var(--muted2); font-style:italic; }
.grid-2{ display:grid; grid-template-columns:1fr 1fr; gap:20px; }
.nota{ font-size:11.5px; color:var(--muted2); margin-top:12px; line-height:1.5; border-top:1px solid var(--border); padding-top:11px; }

/* DONUT */
.donut-wrap{ display:flex; align-items:center; gap:8px; }
.donut-legend{ flex:1; display:flex; flex-direction:column; gap:7px; }
.leg{ display:flex; align-items:center; gap:8px; font-size:12.5px; }
.dot{ width:9px; height:9px; border-radius:3px; flex-shrink:0; }
.leg-name{ flex:1; color:var(--ink); }
.leg-val{ font-weight:700; color:var(--muted); }

/* BARRAS H */
.barras{ display:flex; flex-direction:column; gap:9px; }
.barra-row{ display:grid; grid-template-columns:130px 1fr 38px; align-items:center; gap:10px; }
.barra-lab{ font-size:12px; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.barra-track{ background:#EEF3F4; border-radius:6px; height:9px; overflow:hidden; }
.barra-fill{ height:100%; border-radius:6px; transition:width .4s; }
.barra-val{ font-size:12px; font-weight:700; text-align:right; color:var(--muted); }

/* DESTAQUES */
.destaques{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.destaque{ display:flex; gap:11px; background:#F8FAFB; border:1px solid var(--border); border-radius:11px; padding:13px 14px; }
.dq-bar{ width:3px; border-radius:3px; flex-shrink:0; }
.dq-rot{ font-size:10.5px; color:var(--muted2); text-transform:uppercase; font-weight:700; letter-spacing:.4px; }
.dq-pri{ font-size:14.5px; font-weight:700; margin-top:3px; line-height:1.25; }
.dq-det{ font-size:11.5px; color:var(--muted); margin-top:3px; }

/* FILTROS */
.filtros{ display:flex; gap:10px; margin-bottom:14px; flex-wrap:wrap; align-items:center; }
.inp{ background:var(--surface); border:1px solid var(--border); border-radius:9px; padding:9px 12px;
  font-size:13px; color:var(--ink); font-family:inherit; outline:none; transition:.13s; }
.inp:focus{ border-color:var(--brand); box-shadow:0 0 0 3px rgba(13,125,138,.12); }
.inp.busca{ flex:1; min-width:230px; }
.inp.sm{ padding:7px 10px; font-size:12.5px; }
select.inp{ cursor:pointer; }
.resumo-filtro{ display:flex; justify-content:space-between; font-size:12.5px; color:var(--muted); margin-bottom:10px; padding:0 2px; }
.check{ display:flex; align-items:center; gap:7px; font-size:13px; color:var(--muted); cursor:pointer; }
.check.sm{ font-size:12px; }

/* TABELAS */
.scroll-x{ overflow-x:auto; }
.tab{ width:100%; border-collapse:collapse; }
.tab thead th{ text-align:left; font-size:11px; font-weight:700; color:var(--muted2); text-transform:uppercase;
  letter-spacing:.4px; padding:11px 14px; border-bottom:1px solid var(--border); background:#FAFCFC; position:sticky; }
.tab td{ padding:13px 18px; border-bottom:1px solid #F0F4F5; font-size:13px; vertical-align:middle; }
.tab tbody tr:last-child td{ border-bottom:none; }
.tab tbody tr:hover{ background:#FAFCFD; }
.tab .r{ text-align:right; }
.muted{ color:var(--muted2); }
.nowrap{ white-space:nowrap; }
.cel-nome{ font-weight:600; }
.cel-tema{ font-size:11px; color:var(--muted2); margin-top:2px; max-width:330px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.cel-fac{ font-size:12px; color:var(--muted); max-width:200px; }
.cel-titulo{ font-size:12.5px; max-width:560px; line-height:1.4; }
.uf-pill{ display:inline-block; min-width:30px; text-align:center; font-size:11px; font-weight:700; color:var(--brand-deep);
  background:#E6F2F3; padding:2px 7px; border-radius:6px; }
.tipo-pill{ display:inline-block; font-size:11px; font-weight:700; padding:3px 9px; border-radius:6px; white-space:nowrap; }
.row-click{ cursor:pointer; }
.acoes{ white-space:nowrap; text-align:right; }
.mini{ border:1px solid var(--border); background:#fff; color:var(--muted); font-size:11px; padding:4px 9px;
  border-radius:6px; cursor:pointer; font-family:inherit; transition:.12s; }
.mini:hover{ border-color:var(--brand); color:var(--brand); }
.mini.del:hover{ border-color:#D9486B; color:#D9486B; }
.mais{ padding:14px; text-align:center; border-top:1px solid var(--border); }
.vazio{ padding:40px; text-align:center; color:var(--muted2); font-size:13px; }
.neg{ color:#B05; opacity:.85; }
.fin td{ font-size:12px; padding:9px 12px; }
.row-zero td{ opacity:.42; }
.row-total td{ background:#F4F8F9; font-weight:700; border-top:2px solid var(--border); }
.fat-real{ font-size:10px; color:var(--brand); margin-top:2px; font-weight:600; }
.extra-desc{ font-size:10px; color:var(--muted2); font-weight:500; margin-top:2px; max-width:130px; margin-left:auto;
  overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.pos{ color:#1F8F66; }
.negv{ color:#C2477A; }

/* BOTÕES */
.btn{ background:var(--brand); color:#fff; border:none; padding:9px 16px; border-radius:9px; font-size:13px;
  font-weight:600; cursor:pointer; font-family:inherit; transition:.13s; white-space:nowrap; }
.btn:hover{ background:var(--brand-deep); }
.btn.sm{ padding:7px 12px; font-size:12px; }
.btn-ghost{ background:#fff; color:var(--muted); border:1px solid var(--border); padding:8px 14px; border-radius:9px;
  font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; transition:.13s; }
.btn-ghost:hover{ border-color:var(--brand); color:var(--brand); }
.link-mini{ background:none; border:none; color:var(--brand); font-size:11.5px; cursor:pointer; font-family:inherit;
  padding:0; text-decoration:underline; }
.status-sel{ border:1px solid; background:#fff; border-radius:7px; padding:5px 8px; font-size:11.5px; font-weight:600;
  cursor:pointer; font-family:inherit; outline:none; }

/* MODAL */
.modal-bg{ position:fixed; inset:0; background:rgba(29,53,87,.42); display:grid; place-items:center; z-index:50; padding:20px;
  backdrop-filter:blur(2px); }
.modal{ background:#fff; border-radius:16px; width:100%; max-width:440px; max-height:90vh; overflow:auto;
  box-shadow:0 20px 60px rgba(29,53,87,.3); }
.modal-wide{ max-width:640px; }
.modal-head{ display:flex; justify-content:space-between; align-items:center; padding:18px 22px; border-bottom:1px solid var(--border);
  position:sticky; top:0; background:#fff; }
.modal-head h3{ font-size:16px; font-weight:700; }
.x{ background:none; border:none; font-size:24px; color:var(--muted2); cursor:pointer; line-height:1; }
.modal-body{ padding:20px 22px 22px; }
.campo{ display:flex; flex-direction:column; gap:5px; margin-bottom:13px; }
.campo span{ font-size:12px; font-weight:600; color:var(--muted); }
.form-grid{ display:grid; grid-template-columns:1fr 1fr; gap:13px; }
.form-grid .campo{ margin-bottom:0; }
.form-acoes{ display:flex; justify-content:flex-end; gap:10px; margin-top:20px; }
.resumo-mes{ display:flex; gap:24px; margin-top:16px; padding:14px 16px; background:#F8FAFB; border-radius:11px; border:1px solid var(--border); }
.resumo-mes div{ display:flex; flex-direction:column; gap:3px; }
.resumo-mes span{ font-size:11px; color:var(--muted2); text-transform:uppercase; font-weight:600; }
.resumo-mes b{ font-size:18px; }

/* CLIENTE DETALHE */
.cli-info{ display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:18px; padding:14px 16px;
  background:#F8FAFB; border-radius:11px; border:1px solid var(--border); }
.cli-info > div{ display:flex; flex-direction:column; gap:3px; font-size:13px; }
.ci-lab{ font-size:10.5px; color:var(--muted2); text-transform:uppercase; font-weight:700; letter-spacing:.3px; }
.sub-h{ font-size:13px; font-weight:700; color:var(--muted); margin-bottom:8px; }

/* TEMAS */
.temas-grid{ display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
.tema-card{ background:var(--surface); border:1px solid var(--border); border-radius:13px; padding:15px 16px;
  box-shadow:0 1px 2px rgba(29,53,87,.03); }
.tema-card.cheio{ background:#FDF7F9; }
.tema-top{ display:flex; justify-content:space-between; gap:10px; align-items:flex-start; cursor:pointer; }
.tema-nome{ font-size:13px; font-weight:600; line-height:1.35; }
.vagas-badge{ font-size:10.5px; font-weight:700; padding:3px 9px; border-radius:20px; white-space:nowrap; flex-shrink:0; }
.b-ok{ background:#E3F3EC; color:#1F8F66; }
.b-quase{ background:#FCF1DE; color:#C98A1E; }
.b-cheio{ background:#FBE6EE; color:#C2477A; }
.tema-prog{ height:6px; background:#EEF3F4; border-radius:5px; margin:11px 0 7px; overflow:hidden; }
.tema-prog-fill{ height:100%; border-radius:5px; transition:width .4s; }
.tema-meta{ display:flex; justify-content:space-between; align-items:center; font-size:11.5px; color:var(--muted); }
.tema-chips{ display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin:2px 0 9px; }
.chip-tipo{ font-size:10px; font-weight:700; color:#fff; padding:2px 9px; border-radius:20px; letter-spacing:.2px; }
.chip-grad{ font-size:10px; font-weight:700; background:#2E9E7B1F; color:#1F8F66; padding:2px 9px; border-radius:20px; border:1px solid #2E9E7B44; }
.tema-det{ margin-top:13px; padding-top:13px; border-top:1px solid var(--border); }
.edit-pub{ display:flex; align-items:flex-end; gap:12px; flex-wrap:wrap; margin-bottom:13px; }
.ep-campo{ display:flex; flex-direction:column; gap:4px; font-size:11px; color:var(--muted); font-weight:600; }
.grad-check{ align-self:center; }
.max-inp.wide{ width:130px; }
.pub-grad{ margin:4px 0 2px; }
.max-row{ display:flex; align-items:center; gap:9px; font-size:12px; color:var(--muted); margin-bottom:11px; }
.max-inp{ width:54px; border:1px solid var(--border); border-radius:7px; padding:5px 8px; font-size:12px; font-family:inherit; }
.parts{ list-style:none; display:flex; flex-direction:column; gap:8px; }
.parts li{ display:flex; justify-content:space-between; align-items:flex-start; gap:10px; background:#F8FAFB;
  border-radius:9px; padding:9px 11px; }
.p-nome{ font-size:12.5px; font-weight:600; }
.p-fac{ font-size:11px; color:var(--muted2); margin-top:2px; }
.p-vazio{ justify-content:center; color:var(--muted2); font-size:12px; padding:10px; }
.tag-autor{ font-size:9.5px; font-weight:700; background:#E8833A22; color:#C26A1E; padding:1px 6px; border-radius:5px; margin-left:6px; }
.tag-grad{ font-size:9.5px; font-weight:700; background:#2E9E7B22; color:#1F8F66; padding:1px 6px; border-radius:5px; margin-left:5px; }
/* PERIODO BAR */
.periodo-bar{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; background:var(--surface);
  border:1px solid var(--border); border-radius:12px; padding:10px 14px; margin-bottom:18px; box-shadow:0 1px 2px rgba(29,53,87,.03); }
.periodo-lab{ font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.5px; }
.periodo-bar .inp{ padding:8px 11px; font-size:13px; }
.periodo-info{ margin-left:auto; font-size:12.5px; color:var(--muted); font-weight:600; }

/* PUBLICACOES: lista + painel de detalhe */
.pub-split{ display:grid; grid-template-columns:330px 1fr; gap:16px; align-items:start; }
.pub-lista{ max-height:calc(100vh - 240px); overflow-y:auto; }
.pub-item{ display:block; width:100%; text-align:left; background:transparent; border:none; border-bottom:1px solid #F0F4F5;
  padding:12px 14px; cursor:pointer; font-family:inherit; transition:.12s; }
.pub-item:hover{ background:#FAFCFD; }
.pub-item.ativo{ background:#EAF5F6; box-shadow:inset 3px 0 0 var(--brand); }
.pub-item-top{ display:flex; justify-content:space-between; gap:8px; align-items:flex-start; }
.pub-item-nome{ font-size:12.5px; font-weight:600; line-height:1.35; color:var(--ink); }
.pub-item-prog{ height:5px; background:#EEF3F4; border-radius:4px; margin:8px 0 6px; overflow:hidden; }
.pub-item-fill{ height:100%; border-radius:4px; }
.pub-item-sub{ display:flex; align-items:center; justify-content:space-between; }
.pub-item-ocup{ font-size:11px; color:var(--muted); font-weight:700; }
.chip-tipo.sm{ font-size:9.5px; padding:2px 8px; }

.pub-detalhe{ min-height:320px; }
.pub-vazio-det{ display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; min-height:300px;
  color:var(--muted2); text-align:center; font-size:13px; padding:30px; line-height:1.5; }
.pub-vazio-ic{ width:56px; height:56px; border-radius:15px; background:#EEF3F4; display:grid; place-items:center; font-size:26px; color:var(--brand); }
.dp-head{ display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
.dp-nome{ font-size:16px; font-weight:700; line-height:1.3; }
.dp-prog{ height:8px; background:#EEF3F4; border-radius:6px; margin:12px 0 6px; overflow:hidden; }
.dp-prog-fill{ height:100%; border-radius:6px; transition:width .4s; }
.dp-ocup{ font-size:12px; color:var(--muted); margin-bottom:14px; }
.dp-controles{ display:flex; align-items:flex-end; gap:14px; flex-wrap:wrap; padding:13px 14px; background:#F8FAFB;
  border:1px solid var(--border); border-radius:11px; margin-bottom:16px; }
.dp-sub{ font-size:12px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.3px; margin-bottom:10px; }
.dp-lotado{ font-size:12.5px; color:#C2477A; background:#FBE6EE; border-radius:9px; padding:11px 13px; margin-top:11px; }
.dp-taxa{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; padding:11px 13px; background:#F4F8FB; border:1px solid var(--border); border-radius:11px; margin-bottom:16px; }
.dp-taxa-lab{ font-size:12px; font-weight:600; color:var(--muted); }
.dp-taxa-val{ max-width:110px; }
.dp-taxa-ok{ font-size:12.5px; color:#1F8F66; font-weight:600; }
.dp-taxa .btn.sm{ margin-left:auto; }
.p-acoes{ display:flex; gap:6px; align-items:center; flex-shrink:0; }
.mov-dot{ display:inline-block; width:20px; font-weight:800; }
.mov-dot.entrada{ color:#2E9E7B; }
.mov-dot.saida{ color:#C2477A; }
.mov-val{ font-weight:700; font-variant-numeric:tabular-nums; }
.mov-val.entrada{ color:#2E9E7B; }
.mov-val.saida{ color:#C2477A; }
.mov-mais{ padding:11px 16px; font-size:12px; color:var(--muted); border-top:1px solid var(--border); }
.cmp-pick{ display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:4px; }
.cmp-pick .inp{ max-width:170px; }
.cmp-vs{ color:var(--muted); font-weight:700; }
.vazio.pad{ padding:18px 4px; }
.dp-fin{ display:flex; gap:28px; flex-wrap:wrap; padding:13px 16px; background:#F4F8FB; border:1px solid var(--border); border-radius:11px; margin-bottom:16px; }
.dp-fin-item{ display:flex; flex-direction:column; gap:2px; }
.dp-fin-item span{ font-size:10.5px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.04em; }
.dp-fin-item b{ font-size:18px; color:var(--ink); }
.p-valor{ font-weight:700; color:var(--ink); font-variant-numeric:tabular-nums; margin-right:6px; white-space:nowrap; }
.aviso-grad{ font-size:12.5px; color:#9A6700; background:#FFF6E0; border:1px solid #F2D98A; border-radius:9px; padding:10px 13px; margin-bottom:14px; }
.aviso-grad.erro{ color:#C2477A; background:#FBE6EE; border-color:#F3C2D6; font-weight:600; }
.fatura-auto{ background:#F4F8FB; border:1px solid var(--border); border-radius:10px; padding:11px 13px; margin-bottom:14px; font-size:13.5px; color:var(--ink); }
.fatura-auto b{ font-size:16px; }

/* FORM PARTICIPANTE (com venda) */
.form-part{ margin-top:14px; padding-top:14px; border-top:1px dashed var(--border); }
.fp-titulo{ font-size:12.5px; font-weight:700; color:var(--brand-deep); margin-bottom:10px; }
.fp-grid{ display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.fp-grid .inp{ width:100%; }
.fp-opts{ display:flex; flex-wrap:wrap; align-items:center; gap:12px; margin-top:11px; }
.fp-opts .btn{ margin-left:auto; }

/* LOADING / TOAST */
.loading{ display:grid; place-items:center; min-height:100vh; gap:14px; color:var(--muted); font-size:13px;
  font-family:system-ui,sans-serif; background:var(--bg); }
.spin{ width:34px; height:34px; border:3px solid #DCE6E8; border-top-color:var(--brand); border-radius:50%; animation:sp 1s linear infinite; }
@keyframes sp{ to{ transform:rotate(360deg); } }
.toast{ position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:var(--ink); color:#fff;
  padding:11px 20px; border-radius:10px; font-size:13px; font-weight:500; z-index:80; box-shadow:0 8px 24px rgba(29,53,87,.3);
  animation:up .2s ease; }
@keyframes up{ from{ opacity:0; transform:translate(-50%,8px); } }

@media (max-width:900px){
  .root{ flex-direction:column; }
  .side{ width:100%; height:auto; position:relative; flex-direction:row; align-items:center; overflow-x:auto; }
  .brand{ padding:14px 16px; } nav{ flex-direction:row; padding:8px; } .side-foot{ display:none; }
  .main{ padding:18px 16px 50px; }
  .kpis,.kpis-3,.kpis-4,.grid-2,.temas-grid,.pub-split,.fp-grid,.destaques,.cli-info,.form-grid{ grid-template-columns:1fr; }
  .pub-lista{ max-height:none; }
  .head{ flex-direction:column; align-items:flex-start; }
}
    `}</style>
  );
}
