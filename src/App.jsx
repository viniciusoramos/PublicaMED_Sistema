import React, { useState, useMemo, useEffect, useRef, useContext } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";
import { PLANEJAMENTOS } from "./planejamento";
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
// Paleta categórica validada (CVD ΔE 16.2 claro / 14.7 escuro, croma e contraste ≥3:1 nas duas superfícies)
// mantendo as matizes que os usuários já associam a cada tipo
const TIPO_COR = {
  "Artigo":"#4C9AE0","Artigo PSU":"#34B58A","Capítulo":"#8B7BE8",
  "Apresentação":"#E0913C","Artigo Internacional":"#46B8CE","Artigo Qualis A3":"#D9647E",
  "Combo":"#C57BD6","Personalizado":"#7E8E9C","Outro":"#7E8E9C",
};
const STATUS = ["A fazer","Aguardando certificado","Concluído","Certificado emitido"];
const STATUS_COR = {
  "A fazer":"#64748B","Aguardando certificado":"#A16207",
  "Concluído":"#0E7490","Certificado emitido":"#12805C",
};
// cores para tipos/status criados pelo usuário (fora dos padrões): paleta estável por hash
const PALETA = ["#4C9AE0","#34B58A","#8B7BE8","#E0913C","#46B8CE","#D9647E","#C57BD6","#7E8E9C"];
const hashCor = (s) => PALETA[[...String(s || "")].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETA.length];
const corTipo = (v) => TIPO_COR[v] || hashCor(v);
const corStatus = (v) => STATUS_COR[v] || hashCor(v);
// tipos/status disponíveis (padrões + criados pelo usuário) chegam aos componentes por contexto
const ListasCtx = React.createContext({ tipos: TIPOS, status: STATUS });

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
// "hoje" pelo horário de Brasília, não pelo UTC: das 21h à meia-noite o UTC já
// virou o dia seguinte, e o sistema datava as vendas da noite no dia errado.
// (sv-SE formata como AAAA-MM-DD; é o jeito curto de pedir ISO com fuso.)
const hojeIso = () => new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
// dia (AAAA-MM-DD) de um instante gravado em UTC, lido no horário de Brasília:
// cortar o ISO direto adiantava em um dia tudo que foi criado depois das 21h
const diaDe = (ts) => {
  if (!ts) return "";
  if (String(ts).length <= 10) return String(ts); // já é data pura
  const d = new Date(ts);
  return isNaN(d) ? String(ts).slice(0, 10) : d.toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
};
// soma/subtrai dias de uma data ISO sem passar por fuso nenhum
const isoSomaDias = (iso, n) => {
  const [y, m, d] = String(iso).split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
};
// Lê número no padrão brasileiro: ponto = separador de milhar, vírgula = decimal.
// Ex.: "1.260" -> 1260 · "1.260,50" -> 1260.5 · "124,17" -> 124.17 · "1260" -> 1260 · "124.17" -> 124.17
/* Links internos do painel: são <a href="#..."> de verdade, para o botão direito oferecer
 * "abrir em nova guia" e o clique do meio funcionar. No clique simples cancelamos o padrão e
 * navegamos por dentro (sem recarregar); com Ctrl/Cmd/Shift/Alt saímos do caminho e deixamos o
 * navegador abrir a guia — se chamássemos preventDefault sempre, o Ctrl+clique não abriria nada. */
const abrirForaDoApp = (e) => e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;

const numBR = (v) => {
  if (typeof v === "number") return v;
  let s = String(v ?? "").trim().replace(/[^\d.,-]/g, "");
  if (!s) return 0;
  const temV = s.includes(","), temP = s.includes(".");
  if (temV && temP) s = s.replace(/\./g, "").replace(",", ".");      // 1.260,50 -> 1260.50
  else if (temV) s = s.replace(",", ".");                            // 1260,50 -> 1260.50
  else if (temP) {                                                   // só ponto (ambíguo)
    const p = s.split(".");
    if (p.length > 2 || p[p.length - 1].length === 3) s = s.replace(/\./g, ""); // milhar: 1.260 / 1.234.567
    // senão é decimal (124.17 / 1.5): mantém
  }
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
};
// CPF: guardamos só os dígitos e mostramos 000.000.000-00 (formata enquanto digita)
const fmtCPF = (v) => {
  const d = String(v ?? "").replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};
// ORCID: alguns cadastros trazem a URL inteira — ao copiar, sai só o identificador
const soOrcid = (v) => String(v ?? "").trim().replace(/^https?:\/\/(www\.)?orcid\.org\//i, "");
// Campo de dinheiro que também aceita conta, pra não ter que somar de cabeça:
//   "226,10"            -> substitui pelo valor
//   "+54"               -> soma 54 ao que já estava no mês (base)
//   "-20"               -> desconta 20 do que já estava
//   "25+281,08+359,99"  -> soma os itens (útil pro custo extra)
const temConta = (v) => /[+-]/.test(String(v ?? "").trim());
const numExpr = (v, base = 0) => {
  if (typeof v === "number") return v;
  const s = String(v ?? "").trim().replace(/\s+/g, "");
  if (!s) return 0;
  const termos = s.match(/[+-]?[\d.,]+/g);
  if (!termos) return 0;
  let total = /^[+-]/.test(s) ? (Number(base) || 0) : 0;   // começou com sinal? parte do valor do mês
  for (const t of termos) total += (t.startsWith("-") ? -1 : 1) * numBR(t.replace(/^[+-]/, ""));
  return Math.round(total * 100) / 100;
};
// número no padrão brasileiro, sem "R$" (para preencher campo de digitação)
const numTxt = (n) => (Number(n) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// telefone -> formato WhatsApp (só dígitos, com DDI 55 se faltar)
const waTel = (tel) => {
  const d = String(tel || "").replace(/\D/g, "");
  if (!d) return "";
  return d.startsWith("55") ? d : "55" + d;
};
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
      <div className="kpi-body">
        <div className="kpi-label">{cor && <span className="kpi-dot" style={{ background: cor }} />}{label}</div>
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
  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className={"modal " + (wide ? "modal-wide" : "")} role="dialog" aria-modal="true" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{titulo}</h3>
          <button className="x" onClick={onClose} aria-label="Fechar">×</button>
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
// gera um arquivo de texto e dispara o download no navegador
const baixarTexto = (nome, conteudo) => {
  const url = URL.createObjectURL(new Blob([conteudo], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a"); a.href = url; a.download = nome; document.body.appendChild(a); a.click();
  document.body.removeChild(a); setTimeout(() => URL.revokeObjectURL(url), 1000);
};
const trabalhoMudou = (a, b) => a.titulo !== b.titulo || a.tipo !== b.tipo || a.status !== b.status;
const finMudou = (a, b) =>
  (a.faturamento || 0) !== (b.faturamento || 0) || (a.taxaPublicacao || 0) !== (b.taxaPublicacao || 0) ||
  (a.custoAds || 0) !== (b.custoAds || 0) || (a.custoFixo || 0) !== (b.custoFixo || 0) ||
  (a.custoExtra || 0) !== (b.custoExtra || 0) || (a.custoExtraDesc || "") !== (b.custoExtraDesc || "") ||
  (a.faturamentoAjuste || 0) !== (b.faturamentoAjuste || 0);
// (CRUD de publicações é incremental via db.*; ver os handlers granulares no App)

/* Qual banco o painel está usando. Existe porque o `npm run dev` aponta para o Supabase de
 * produção: sem um aviso na tela, é fácil testar achando que é de mentira e mexer no real.
 *   npm run dev        → banco real   (tarja vermelha, só em desenvolvimento)
 *   npm run dev:teste  → banco teste  (tarja verde, lê .env.teste)
 * Em produção de verdade (site publicado) nenhuma das duas aparece. */
const AMBIENTE_TESTE = import.meta.env.VITE_AMBIENTE === "teste";
const DEV_NO_REAL = import.meta.env.DEV && !AMBIENTE_TESTE;
// o Vite completa o .env.teste com o .env: se faltar a URL lá, cairíamos no banco real
// com cara de teste. Mostrar o projeto na tarja deixa isso visível de imediato.
const PROJETO_SUPABASE = (import.meta.env.VITE_SUPABASE_URL || "").replace(/^https?:\/\//, "").replace(/\/.*$/, "");

export default function App() {
  const [tab, setTab] = useState("overview");
  const [menuAberto, setMenuAberto] = useState(false);
  const [pubAlvo, setPubAlvo] = useState(null);
  const [clienteAlvo, setClienteAlvo] = useState(null); // cliente aberto a partir de Vendas
  const [dark, setDark] = useState(() => { try { return localStorage.getItem("tema") === "dark"; } catch { return false; } });
  const toggleTema = () => setDark((d) => { const n = !d; try { localStorage.setItem("tema", n ? "dark" : "claro"); } catch (e) {} return n; });
  const [vendas, setVendas] = useState([]);
  const [trabalhos, setTrabalhos] = useState([]);
  const [financeiro, setFinanceiro] = useState([]);
  const [finItens, setFinItens] = useState([]); // detalhamento dos custos do mês
  const [temas, setTemas] = useState([]);
  // cronograma: vem do banco. Enquanto o SQL não for aplicado, cai no arquivo em modo leitura.
  const [planejamentos, setPlanejamentos] = useState(PLANEJAMENTOS);
  const [planoNoBanco, setPlanoNoBanco] = useState(false);
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
        const [d, plan] = await Promise.all([db.carregarTudo(), db.carregarPlanejamentos()]);
        if (!vivo) return;
        setVendas(d.vendas); setTrabalhos(d.trabalhos);
        setFinanceiro(d.financeiro); setTemas(d.temas); setFinItens(d.financeiroItens || []);
        // sem cronograma no banco (SQL ainda não aplicado): segue com o do arquivo, sem edição
        setPlanejamentos(plan || PLANEJAMENTOS);
        setPlanoNoBanco(!!plan);
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
  /* Itens de custo: o item entra somando no total do mês e sai descontando,
     para o número da planilha e o detalhamento nunca se contradizerem. */
  // deste mês em diante (o custo fixo vale para os próximos, não para o passado)
  const mesesDaquiEmDiante = (linha) => financeiro.filter((f) =>
    f.ano > linha.ano || (f.ano === linha.ano && f.ordem >= linha.ordem));
  const addItemFin = async (mesId, campo, valor, descricao, repetir = false) => {
    const linha = financeiro.find((f) => f.id === mesId);
    if (!linha || !valor) return;
    const alvos = repetir ? mesesDaquiEmDiante(linha) : [linha];
    const antes = financeiro, antesI = finItens;
    const ids = new Set(alvos.map((f) => f.id));
    const atualizadas = financeiro.map((f) => (ids.has(f.id) ? { ...f, [campo]: (f[campo] || 0) + valor } : f));
    setFinanceiro(atualizadas);
    try {
      const novos = await db.criarItensFinanceiro(alvos.map((f) => ({ mesId: f.id, campo, valor, descricao, recorrente: repetir })));
      setFinItens((is) => [...is, ...novos]);
      for (const f of atualizadas.filter((x) => ids.has(x.id))) await db.atualizarFinanceiro(f.id, f);
      aviso(`${brl(valor)} somado${descricao ? " · " + descricao : ""}` + (repetir ? ` · em ${alvos.length} meses` : ""));
    } catch (e) { aviso("Erro: " + e.message); setFinanceiro(antes); setFinItens(antesI); }
  };
  const remItemFin = async (item, tambemFuturos = false) => {
    const linha = financeiro.find((f) => f.id === item.mesId);
    if (!linha) return;
    // mesma recorrência = mesmo custo, valor e descrição, deste mês para a frente
    const alvos = tambemFuturos
      ? finItens.filter((i) => {
          const m = financeiro.find((f) => f.id === i.mesId);
          return m && i.campo === item.campo && i.valor === item.valor && i.descricao === item.descricao
            && (m.ano > linha.ano || (m.ano === linha.ano && m.ordem >= linha.ordem));
        })
      : [item];
    const antes = financeiro, antesI = finItens;
    const porMes = new Map();
    alvos.forEach((i) => porMes.set(i.mesId, (porMes.get(i.mesId) || 0) + i.valor));
    const atualizadas = financeiro.map((f) => (porMes.has(f.id)
      ? { ...f, [item.campo]: Math.max(0, (f[item.campo] || 0) - porMes.get(f.id)) } : f));
    const idsItens = alvos.map((i) => i.id);
    setFinanceiro(atualizadas);
    setFinItens((is) => is.filter((x) => !idsItens.includes(x.id)));
    try {
      await db.removerItensFinanceiro(idsItens);
      for (const f of atualizadas.filter((x) => porMes.has(x.id))) await db.atualizarFinanceiro(f.id, f);
      aviso(`Removido de ${alvos.length} ${alvos.length === 1 ? "mês" : "meses"}`);
    } catch (e) { aviso("Erro: " + e.message); setFinanceiro(antes); setFinItens(antesI); }
  };
  /* Acha a publicação pelo título: exato e, se falhar, ignorando acento/pontuação/espaço
   * (a mesma obra costuma estar escrita com pequenas diferenças em cada tela).
   * O tipo entra como desempate: desde que o título passou a ser único apenas DENTRO de cada
   * tipo, podem existir um capítulo e uma apresentação com o mesmo nome. */
  const acharPubPorTitulo = (titulo, tipo) => {
    const alvo = (titulo || "").trim().toLowerCase();
    const mesmoTipo = (t) => !tipo || chaveTipo(t.tipo) === chaveTipo(tipo);
    const exatos = temas.filter((t) => (t.nome || "").trim().toLowerCase() === alvo);
    const aprox = temas.filter((t) => chaveTitulo(t.nome) === chaveTitulo(titulo));
    return exatos.find(mesmoTipo) || aprox.find(mesmoTipo) || exatos[0] || aprox[0];
  };
  // o hash carrega tipo junto do título ("#pub=Nome::Capítulo") para não abrir o trabalho errado
  const hashDaPub = (pub) => "#pub=" + encodeURIComponent(pub.nome) + "::" + encodeURIComponent(pub.tipo || "");
  // clicar num trabalho abre a publicação correspondente em "Publicações e vagas"
  const abrirPublicacao = (titulo, tipo) => {
    const pub = acharPubPorTitulo(titulo, tipo);
    if (!pub) { aviso("Esse trabalho não tem publicação vinculada."); return; }
    const destino = hashDaPub(pub);
    if (window.location.hash === destino) { setPubAlvo(pub.id); setTab("temas"); }
    else window.location.hash = destino; // vira entrada no histórico; o hashchange abre a publicação
  };
  // hash da URL ⇄ navegação: a aba atual e a publicação aberta ficam no histórico do navegador,
  // então as setas voltar/avançar e "abrir em nova guia" funcionam
  const aplicarHash = () => {
    if (!pronto) return;
    const h = window.location.hash || "";
    const mPub = h.match(/^#pub=(.+)$/);
    if (mPub) {
      // "#pub=Titulo::Tipo" — links antigos, sem o "::Tipo", seguem funcionando
      const [cru, tipoCru = ""] = mPub[1].split("::");
      let titulo = cru, tipo = tipoCru;
      try { titulo = decodeURIComponent(cru); tipo = decodeURIComponent(tipoCru); } catch (e) {}
      const pub = acharPubPorTitulo(titulo, tipo);
      if (!pub) { aviso("Esse trabalho não tem publicação vinculada."); return; }
      setPubAlvo(pub.id);
      setTab("temas");
      return;
    }
    const id = h.replace(/^#/, "");
    if (["overview", "vendas", "clientes", "trabalhos", "financeiro", "temas", "planejamento"].includes(id)) setTab(id);
    else if (!h) setTab("overview");
  };
  const irPara = (id) => {
    setMenuAberto(false);
    if (window.location.hash === "#" + id) setTab(id);
    else window.location.hash = id;
  };
  useEffect(() => {
    window.addEventListener("hashchange", aplicarHash);
    return () => window.removeEventListener("hashchange", aplicarHash);
  });
  useEffect(() => { if (pronto) aplicarHash(); }, [pronto]); // aplica o hash inicial (deep link / F5)
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
  // cria a publicação a partir do cronograma (aba Calendário). A taxa informada ali já entra
  // como saída no Financeiro, no mês do lançamento — a publicação nasce com o custo lançado,
  // sem obrigar a repetir o valor no painel dela depois.
  const criarPublicacaoDoPlano = async (dados) => {
    const nova = await addPublicacao(dados);
    if (nova && (dados.taxa || 0) > 0) await lancarTaxaPub(nova, dados.taxa, dados.taxaData || hojeIso());
    return nova;
  };
  /* Cria a publicação E a põe no calendário no dia informado — criando o mês e o dia se ainda
   * não existirem. É o que faz um trabalho avulso ter data de abertura de verdade (e portanto
   * cair em "Em venda"/"Programadas" em vez de "Anteriores"). */
  const criarPublicacaoNoDia = async (dataIso, dados) => {
    const nova = await criarPublicacaoDoPlano({ ...dados, taxaData: dataIso });
    if (!nova) return null;
    if (!planoNoBanco) { aviso("Publicação criada. O calendário está em modo leitura, então ela não entrou no cronograma."); return nova; }
    try {
      const { lancamento } = await db.garantirDiaNoPlano(dataIso, { tipo: dados.tipo, produto: dados.tipo, vagas: dados.maxVagas });
      await db.adicionarTemaPlano(lancamento.id, {
        titulo: dados.nome, areas: dados.area, tipo: dados.tipo, vagas: dados.maxVagas,
      });
      const rec = await db.carregarPlanejamentos();
      if (rec) setPlanejamentos(rec);
    } catch (e) {
      aviso("Publicação criada, mas não entrou no calendário: " + e.message);
    }
    return nova;
  };
  /* ---------- cronograma (aba Calendário) ----------
   * Nenhuma destas ações toca na publicação ou nos participantes: mexem só no plano do mês.
   */
  const mexerNosTemas = (lancamentoId, fn) => setPlanejamentos((ps) => ps.map((p) => ({
    ...p,
    lancamentos: p.lancamentos.map((l) => (l.id === lancamentoId ? { ...l, temas: fn(l.temas) } : l)),
  })));
  /* Põe no calendário uma publicação que JÁ existe (não cria nada em Publicações e vagas).
   * É o caminho para trabalhos abertos fora do cronograma — inclusive os antigos — passarem
   * a ter data de abertura e sair de "Anteriores". */
  const porPublicacaoNoCalendario = async (pub, dataIso) => {
    if (!dataIso) return;
    try {
      const modelo = { tipo: pub.tipo, produto: pub.tipo, vagas: pub.maxVagas };
      const { lancamento } = await db.garantirDiaNoPlano(dataIso, modelo);
      await db.adicionarTemaPlano(lancamento.id, {
        titulo: pub.nome, areas: pub.area, tipo: pub.tipo, vagas: pub.maxVagas,
      });
      const rec = await db.carregarPlanejamentos();
      if (rec) setPlanejamentos(rec);
      aviso("Publicação posta no calendário");
    } catch (e) { aviso("Erro ao pôr no calendário: " + e.message); }
  };
  // (acrescentar tema ao cronograma agora acontece dentro de criarPublicacaoNoDia, que
  //  também cria o dia e o mês quando eles ainda não existem)
  // o que veio do plano do mês fica guardado e pode ser restaurado;
  // o que foi acrescentado pela tela sai de vez (não fazia parte do plano)
  const tirarTemaPlano = async (lancamentoId, tema) => {
    const antes = planejamentos;
    mexerNosTemas(lancamentoId, (ts) => (tema.extra
      ? ts.filter((x) => x.id !== tema.id)
      : ts.map((x) => (x.id === tema.id ? { ...x, removido: true } : x))));
    try {
      if (tema.extra) await db.removerTemaPlano(tema.id);
      else await db.marcarTemaPlanoRemovido(tema.id, true);
    } catch (e) { aviso("Erro ao salvar: " + e.message); setPlanejamentos(antes); }
  };
  const restaurarTemaPlano = async (lancamentoId, tema) => {
    const antes = planejamentos;
    mexerNosTemas(lancamentoId, (ts) => ts.map((x) => (x.id === tema.id ? { ...x, removido: false } : x)));
    try { await db.marcarTemaPlanoRemovido(tema.id, false); }
    catch (e) { aviso("Erro ao salvar: " + e.message); setPlanejamentos(antes); }
  };
  // estorna uma taxa lançada: tira do mês do lançamento; se não achar, procura o mês mais recente com taxa suficiente
  const estornarTaxaFinanceiro = async (valor, dataIso) => {
    let alvo = null;
    if (dataIso) {
      const ano = anoDeIso(dataIso), mesIdx = mesDeIso(dataIso);
      alvo = financeiro.find((f) => f.ano === ano && f.ordem === mesIdx && (f.taxaPublicacao || 0) >= valor - 0.005);
    }
    if (!alvo) {
      alvo = [...financeiro].sort((a, b) => (b.ano - a.ano) || (b.ordem - a.ordem))
        .find((f) => (f.taxaPublicacao || 0) >= valor - 0.005);
    }
    if (!alvo) return false;
    const atualizado = { ...alvo, taxaPublicacao: Math.max(0, (alvo.taxaPublicacao || 0) - valor) };
    await db.atualizarFinanceiro(alvo.id, atualizado);
    setFinanceiro((fs) => fs.map((f) => (f.id === alvo.id ? atualizado : f)));
    return true;
  };
  // excluir publicação -> remove também o trabalho vinculado (mesmo título) e estorna a taxa do Financeiro
  const remPublicacao = async (tema) => {
    const antesT = temas, antesTr = trabalhos;
    setTemas((ts) => ts.filter((t) => t.id !== tema.id));
    try {
      await db.removerPublicacao(tema.id);
      const acoes = ["Publicação removida"];
      const trab = trabalhos.find((x) => x.titulo === tema.nome);
      if (trab) {
        await db.removerTrabalho(trab.id);
        setTrabalhos((tr) => tr.filter((x) => x.id !== trab.id));
        acoes.push("trabalho removido");
      }
      if (tema.taxaLancada && (tema.taxa || 0) > 0) {
        const ok = await estornarTaxaFinanceiro(tema.taxa, tema.taxaData);
        acoes.push(ok ? `taxa de ${brl(tema.taxa)} estornada do financeiro` : "⚠️ não achei o mês da taxa — ajuste no Financeiro");
      }
      aviso(acoes.join(" · "));
    } catch (e) { aviso("Erro: " + e.message); setTemas(antesT); setTrabalhos(antesTr); }
  };
  /* O calendário liga tema↔publicação por TIPO + TÍTULO. Se um dos dois muda só na publicação,
   * o vínculo arrebenta e ela some do calendário (indo parar em "Anteriores"). Então o tema do
   * cronograma é atualizado junto — em vez de só avisar. */
  const sincronizarTemasDoCal = async (pubId, campos) => {
    const ids = vinculoCal.temasDaPub.get(pubId) || [];
    if (!ids.length) return;
    for (const tid of ids) await db.atualizarTemaPlano(tid, campos);
    const rec = await db.carregarPlanejamentos();
    if (rec) setPlanejamentos(rec);
  };
  const editPublicacao = async (id, campos) => {
    const antes = temas; setTemas((ts) => ts.map((t) => (t.id === id ? { ...t, ...campos } : t)));
    try {
      await db.atualizarPublicacao(id, campos);
      if ("tipo" in campos) await sincronizarTemasDoCal(id, { tipo: campos.tipo });
    }
    catch (e) { aviso("Erro: " + e.message); setTemas(antes); }
  };
  // renomeia a publicação e sincroniza o trabalho vinculado (mesmo título) e as vendas (mesmo tema)
  const editNomePublicacao = async (tema, novoNome) => {
    const nome = (novoNome || "").trim();
    if (!nome || nome === tema.nome) return;
    const antigo = tema.nome;
    const antT = temas, antTr = trabalhos, antV = vendas;
    setTemas((ts) => ts.map((t) => (t.id === tema.id ? { ...t, nome } : t)));
    setTrabalhos((tr) => tr.map((x) => (x.titulo === antigo ? { ...x, titulo: nome } : x)));
    setVendas((vs) => vs.map((v) => (v.tema === antigo ? { ...v, tema: nome } : v)));
    try {
      await db.atualizarPublicacao(tema.id, { nome });
      const trab = trabalhos.find((x) => x.titulo === antigo);
      if (trab) await db.renomearTrabalho(trab.id, nome);
      // vendas guardam o nome do trabalho em texto. Se outra publicação (de outro tipo) usa
      // o mesmo título, renomear em lote levaria as vendas dela junto — aí não mexemos.
      const homonima = temas.some((t) => t.id !== tema.id && t.nome === antigo);
      if (!homonima) await db.renomearTemaVendas(antigo, nome);
      // mantém o tema do cronograma com o título novo, senão a publicação sai do calendário
      await sincronizarTemasDoCal(tema.id, { titulo: nome });
      aviso(homonima ? "Nome atualizado (vendas não renomeadas: há outro trabalho com o título antigo)" : "Nome atualizado");
    } catch (e) { aviso("Erro: " + e.message); setTemas(antT); setTrabalhos(antTr); setVendas(antV); }
  };
  // define o local de publicação de um trabalho (usado na aba Trabalhos e no painel da publicação)
  const setLocalTrabalho = async (trabId, local) => {
    const antes = trabalhos;
    setTrabalhos((tr) => tr.map((x) => (x.id === trabId ? { ...x, localPublicacao: local } : x)));
    try { await db.atualizarLocalTrabalho(trabId, local); }
    catch (e) { aviso("Erro: " + e.message); setTrabalhos(antes); }
  };
  // altera o status de um trabalho a partir do painel da publicação (reflete na aba Trabalhos)
  const setStatusTrabalho = async (trabId, status) => {
    const antes = trabalhos;
    const alvo = trabalhos.find((x) => x.id === trabId);
    if (!alvo) return;
    setTrabalhos((tr) => tr.map((x) => (x.id === trabId ? { ...x, status } : x)));
    try { await db.atualizarTrabalho(trabId, { ...alvo, status }); }
    catch (e) { aviso("Erro: " + e.message); setTrabalhos(antes); }
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
  // CPF informado numa participação passa a valer para as outras da mesma pessoa
  // que ainda estavam sem ele (participações antigas, anteriores ao campo).
  const propagarCpf = async (dados) => {
    if (!dados.cpf) return 0;
    try {
      const tocados = await db.propagarCpf(dados);
      if (!tocados.length) return 0;
      const ids = new Set(tocados.map((x) => x.id));
      const cpf = String(dados.cpf).replace(/\D/g, "");
      setTemas((ts) => ts.map((t) => ({ ...t, participantes: t.participantes.map((p) => (ids.has(p.id) ? { ...p, cpf } : p)) })));
      return tocados.length;
    } catch (e) { return 0; } // não atrapalha o cadastro em si
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
      const outras = await propagarCpf(dados);
      if (outras) acoes.push(`CPF aplicado em ${outras} participação(ões) anterior(es)`);
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
    setTemas((ts) => ts.map((t) => (t.id === tema.id ? { ...t, participantes: t.participantes.map((p) => (p.id === part.id ? { ...p, ...dados } : p)) } : t)));
    try {
      await db.atualizarParticipante(part.id, dados);
      // busca a venda no BANCO (evita duplicar por causa de estado desatualizado)
      const vendaDB = await db.buscarVendaDoParticipante(part.id, tema.nome, part.nome);
      if (vendaDB) {
        const valor = dados.valorMexido ? dados.valor : vendaDB.valor; // só troca o valor se o usuário mexeu
        const atual = await db.atualizarVenda(vendaDB.id, { ...vendaDB, nome: dados.nome, email: dados.email, faculdade: dados.faculdade, uf, valor, participanteId: part.id });
        setVendas((vs) => [atual, ...vs.filter((v) => v.id !== atual.id)]);
      } else if (dados.valorMexido && (dados.valor || 0) > 0) {
        // participante sem venda: cria uma já vinculada, com o valor informado
        const nova = await db.criarVenda({ data: hojeIso(), nome: dados.nome, email: dados.email, faculdade: dados.faculdade, uf, tipo: tema.tipo, valor: dados.valor, tema: tema.nome, participanteId: part.id });
        setVendas((vs) => [nova, ...vs]);
      }
      const outras = await propagarCpf(dados);
      aviso("Participante atualizado" + (outras ? ` · CPF aplicado em ${outras} participação(ões) anterior(es)` : ""));
    } catch (e) { aviso("Erro: " + e.message); setTemas(antesT); setVendas(antesV); }
  };
  // taxa de publicação = valor único da publicação, lançado uma vez no financeiro
  const lancarTaxaPub = async (tema, valor, data) => {
    if (tema.taxaLancada) { aviso("Taxa já lançada para esta publicação"); return; }
    try {
      await lancarTaxaFinanceiro(data, valor);
      await db.atualizarPublicacao(tema.id, { taxa: valor, taxaLancada: true, taxaData: data });
      setTemas((ts) => ts.map((t) => (t.id === tema.id ? { ...t, taxa: valor, taxaLancada: true, taxaData: data } : t)));
      aviso("Taxa lançada no financeiro");
    } catch (e) { aviso("Erro: " + e.message); }
  };
  /* Corrigir uma taxa já lançada: estorna o valor antigo do mês em que entrou e
   * lança o novo (que pode ser em outro mês). Valor zero só estorna, devolvendo
   * a publicação ao estado de "taxa não lançada". */
  const corrigirTaxaPub = async (tema, valor, data) => {
    try {
      if ((tema.taxa || 0) > 0) {
        const ok = await estornarTaxaFinanceiro(tema.taxa, tema.taxaData);
        if (!ok) { aviso("Erro: não achei o lançamento antigo no Financeiro — ajuste o mês por lá"); return; }
      }
      if (valor > 0) {
        await lancarTaxaFinanceiro(data, valor);
        await db.atualizarPublicacao(tema.id, { taxa: valor, taxaLancada: true, taxaData: data });
        setTemas((ts) => ts.map((t) => (t.id === tema.id ? { ...t, taxa: valor, taxaLancada: true, taxaData: data } : t)));
        aviso(`Taxa corrigida para ${brl(valor)} · ${brl(tema.taxa || 0)} estornado`);
      } else {
        await db.atualizarPublicacao(tema.id, { taxa: 0, taxaLancada: false, taxaData: null });
        setTemas((ts) => ts.map((t) => (t.id === tema.id ? { ...t, taxa: 0, taxaLancada: false, taxaData: null } : t)));
        aviso(`Taxa estornada · ${brl(tema.taxa || 0)} devolvido ao Financeiro`);
      }
    } catch (e) { aviso("Erro: " + e.message); }
  };
  const criarAnoFin = async (ano) => {
    try { const linhas = await db.criarAnoFinanceiro(ano); setFinanceiro((f) => [...f, ...linhas]); aviso(`Ano ${ano} criado`); }
    catch (e) { aviso("Erro: " + e.message); }
  };
  // edita os dados de um cliente -> aplica em TODAS as compras (vendas) dele
  /* Clicar no nome do cliente em Vendas abre a ficha dele na aba Clientes.
   * A chave e a mesma do agrupamento: e-mail em minusculas ou, sem e-mail, o nome. */
  const abrirCliente = (venda) => {
    const chave = (venda.email || "").trim().toLowerCase() || (venda.nome || "").trim().toLowerCase();
    if (!chave) { aviso("Essa venda nao tem cliente identificado."); return; }
    setClienteAlvo(chave);
    irPara("clientes");
  };
  const salvarCliente = async (cliente, dados) => {
    const uf = dados.uf && dados.uf !== "N/I" ? dados.uf : ufDaFaculdade(dados.faculdade);
    const ids = new Set((cliente.compras || []).map((v) => v.id));
    const antes = vendas;
    setVendas((vs) => vs.map((v) => (ids.has(v.id) ? { ...v, nome: dados.nome, email: dados.email, faculdade: dados.faculdade, uf } : v)));
    try {
      for (const v of cliente.compras) {
        await db.atualizarVenda(v.id, { ...v, nome: dados.nome, email: dados.email, faculdade: dados.faculdade, uf });
      }
      // CPF e telefone moram no participante: aplica nas participações da mesma pessoa
      const n = await sincronizarContato(cliente, dados);
      aviso("Cliente atualizado" + (n ? ` · contato em ${n} participação(ões)` : ""));
    } catch (e) { aviso("Erro: " + e.message); setVendas(antes); }
  };
  /* Espelha CPF/telefone editados na aba Clientes para as participações da pessoa
   * (casadas por e-mail e, na falta dele, pelo nome). */
  const sincronizarContato = async (cliente, dados) => {
    const cpf = String(dados.cpf || "").replace(/\D/g, "");
    const tel = (dados.telefone || "").trim();
    if (!cpf && !tel) return 0;
    const email = (cliente.email || "").trim().toLowerCase();
    const nome = chaveTitulo(cliente.nome);
    const alvos = [];
    for (const t of temas) {
      for (const p of t.participantes || []) {
        const mesmo = email ? (p.email || "").trim().toLowerCase() === email : chaveTitulo(p.nome) === nome;
        if (!mesmo) continue;
        if ((cpf && p.cpf !== cpf) || (tel && p.telefone !== tel)) alvos.push({ tema: t, p });
      }
    }
    if (!alvos.length) return 0;
    for (const { p } of alvos) {
      await db.atualizarParticipante(p.id, { ...p, cpf: cpf || p.cpf, telefone: tel || p.telefone });
    }
    const ids = new Set(alvos.map((x) => x.p.id));
    setTemas((ts) => ts.map((t) => ({
      ...t,
      participantes: t.participantes.map((p) => (ids.has(p.id)
        ? { ...p, cpf: cpf || p.cpf, telefone: tel || p.telefone } : p)),
    })));
    return alvos.length;
  };

  /* ---------- métricas ---------- */
  const m = useMemo(() => calcMetricas(vendas), [vendas]);
  /* CPF, telefone e ORCID são dados do participante, não da venda — e o cliente é
   * montado a partir das vendas. Este índice traz esses campos para a aba Clientes,
   * casando por e-mail e, na falta dele, pelo nome. */
  const contatoDaPessoa = useMemo(() => {
    const porEmail = new Map(), porNome = new Map();
    const juntar = (map, k, d) => {
      if (!k) return;
      const at = map.get(k) || {};
      map.set(k, { cpf: at.cpf || d.cpf, telefone: at.telefone || d.telefone, orcid: at.orcid || d.orcid });
    };
    for (const t of temas) {
      for (const p of t.participantes || []) {
        const d = { cpf: p.cpf || "", telefone: p.telefone || "", orcid: p.orcid || "" };
        if (!d.cpf && !d.telefone && !d.orcid) continue;
        juntar(porEmail, (p.email || "").trim().toLowerCase(), d);
        juntar(porNome, chaveTitulo(p.nome), d);
      }
    }
    return { porEmail, porNome };
  }, [temas]);
  const contatoDe = (c) => (c && (contatoDaPessoa.porEmail.get((c.email || "").trim().toLowerCase())
    || contatoDaPessoa.porNome.get(chaveTitulo(c.nome)))) || {};

  if (!db.ENV_OK) {
    return (
      <div className={"root" + (dark ? " dark" : "")}><Estilos />
      <div className="loading" style={{ flex: 1 }}>
        <div style={{ maxWidth: 440, textAlign: "center", padding: 24 }}>
          <h2 style={{ marginBottom: 10 }}>Configuração ausente</h2>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>
            Defina <b>VITE_SUPABASE_URL</b> e <b>VITE_SUPABASE_ANON_KEY</b> nas
            variáveis de ambiente da hospedagem (Cloudflare Pages → Settings →
            Environment variables) e publique novamente.
          </p>
        </div>
      </div>
      </div>
    );
  }

  // tipos/status = padrões + os criados pelo usuário. Calcular ANTES dos returns condicionais (regras de hooks!)
  const tiposDisp = useMemo(
    () => [...new Set([...TIPOS, ...temas.map((t) => t.tipo), ...trabalhos.map((t) => t.tipo)])].filter(Boolean),
    [temas, trabalhos]);
  const statusDisp = useMemo(
    () => [...new Set([...STATUS, ...trabalhos.map((t) => t.status)])].filter(Boolean),
    [trabalhos]);
  // data de abertura de cada publicação, vinda do cronograma (organiza a lista de Publicações
  // e vagas por situação em vez de por data de cadastro). Também antes dos returns condicionais.
  const vinculoCal = useMemo(() => aberturaDasPublicacoes(planejamentos, temas), [planejamentos, temas]);
  const aberturaPub = vinculoCal.abertura;

  if (sessao === undefined) {
    return (
      <div className={"root" + (dark ? " dark" : "")}><Estilos />
        <div className="loading" style={{ flex: 1 }}><div className="spin" /><p>Carregando...</p></div>
      </div>
    );
  }
  if (!sessao) return <Login />;

  if (!pronto) {
    return (
      <div className={"root" + (dark ? " dark" : "")}><Estilos />
        <div className="loading" style={{ flex: 1 }}><div className="spin" /><p>Carregando seus dados…</p></div>
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
    ["planejamento", "Calendário", "▤"],
  ];

  return (
    <ListasCtx.Provider value={{ tipos: tiposDisp, status: statusDisp }}>
    <div className={"root" + (dark ? " dark" : "") + (AMBIENTE_TESTE || DEV_NO_REAL ? " com-tarja" : "")}>
      <Estilos />
      {AMBIENTE_TESTE && (
        <div className="tarja-amb teste">
          AMBIENTE DE TESTE · pode mexer à vontade
          <code>{PROJETO_SUPABASE}</code>
          <span className="tarja-conf">confira que este NÃO é o projeto real</span>
        </div>
      )}
      {DEV_NO_REAL && (
        <div className="tarja-amb real">
          ATENÇÃO · localhost ligado ao banco REAL — o que mudar aqui vale de verdade
          <code>{PROJETO_SUPABASE}</code>
          <span className="tarja-conf">para testar sem risco: npm run dev:teste</span>
        </div>
      )}
      {/* TOPBAR (aparece só no celular) */}
      <header className="topbar">
        <button className="hamb" onClick={() => setMenuAberto(true)} aria-label="Abrir menu">☰</button>
        <Logo style={{ height: 20, color: "#fff" }} />
        <span className="topbar-tit">{(navItens.find((n) => n[0] === tab) || [])[1] || ""}</span>
        <button className="hamb tema-top" onClick={toggleTema} aria-label="Alternar tema">{dark ? "☀️" : "🌙"}</button>
      </header>
      {menuAberto && <div className="side-backdrop" onClick={() => setMenuAberto(false)} />}
      {/* SIDEBAR */}
      <aside className={"side" + (menuAberto ? " aberta" : "")}>
        <div className="brand">
          <button className="side-close" onClick={() => setMenuAberto(false)} aria-label="Fechar menu">×</button>
          <Logo style={{ height: 26, color: "#fff" }} />
          <div className="brand-sub">Painel de gestão</div>
        </div>
        <nav>
          {navItens.map(([id, lab, ic]) => (
            <a key={id} href={"#" + id} className={"nav " + (tab === id ? "ativo" : "")} aria-current={tab === id ? "page" : undefined}
              onClick={(e) => { if (abrirForaDoApp(e)) return; e.preventDefault(); irPara(id); }}>
              <span className="nav-ic">{ic}</span>{lab}
            </a>
          ))}
        </nav>
        <div className="side-foot">
          <div className="persist on">
            <span className="pdot" />
            Conectado ao Supabase
          </div>
          {sessao && sessao.user && (
            <div style={{ fontSize: 11, color: "#8FA6B8", marginTop: 10, wordBreak: "break-all" }}>{sessao.user.email}</div>
          )}
          <button className="tema-btn" onClick={toggleTema}>{dark ? "☀️ Modo claro" : "🌙 Modo escuro"}</button>
          <button className="tema-btn" onClick={sair}>Sair</button>
        </div>
      </aside>

      {/* CONTEÚDO */}
      <main className="main">
        {tab === "overview" && <Overview vendas={vendas} financeiro={financeiro} trabalhos={trabalhos} dark={dark} />}
        {tab === "vendas" && (
          <Vendas vendas={vendas} salvar={salvarVendas} aviso={aviso} temasExist={temas} onAbrirPublicacao={abrirPublicacao} onAbrirCliente={abrirCliente} />
        )}
        {tab === "clientes" && <Clientes m={m} vendas={vendas} salvarCliente={salvarCliente} onAbrirPublicacao={abrirPublicacao} contatoDe={contatoDe} alvo={clienteAlvo} onAlvoUsado={() => setClienteAlvo(null)} />}
        {tab === "trabalhos" && (
          <Trabalhos trabalhos={trabalhos} temas={temas} salvar={salvarTrabalhos} aviso={aviso} onAbrirPublicacao={abrirPublicacao} />
        )}
        {tab === "financeiro" && (
          <Financeiro financeiro={financeiro} salvar={salvarFinanceiro} vendas={vendas} aviso={aviso} onCriarAno={criarAnoFin} dark={dark}
            itens={finItens} onAddItem={addItemFin} onRemItem={remItemFin} />
        )}
        {tab === "temas" && (
          <Temas temas={temas} vendas={vendas} trabalhos={trabalhos} abertura={aberturaPub} onSetLocalTrabalho={setLocalTrabalho} onSetStatusTrabalho={setStatusTrabalho} alvoId={pubAlvo} onAlvoUsado={() => setPubAlvo(null)}
            onAdd={addPublicacao} onCriarNoDia={criarPublicacaoNoDia} onPorNoCalendario={porPublicacaoNoCalendario} onRem={remPublicacao} onEdit={editPublicacao} onEditNome={editNomePublicacao}
            onAddPart={addParticipante} onEditPart={editParticipante} onRemPart={remParticipante}
            onLancarTaxa={lancarTaxaPub} onCorrigirTaxa={corrigirTaxaPub} aviso={aviso} />
        )}
        {tab === "planejamento" && (
          <Planejamento temas={temas} vendas={vendas} planejamentos={planejamentos} editavel={planoNoBanco}
            onAbrirPublicacao={abrirPublicacao} onCriarPublicacao={criarPublicacaoDoPlano}
            onCriarNoDia={criarPublicacaoNoDia} onTirarTema={tirarTemaPlano} onRestaurarTema={restaurarTemaPlano} />
        )}
      </main>

      {toast && <div className={"toast" + (/^erro/i.test(toast) ? " erro" : "")} role="status" aria-live="polite">{toast}</div>}
    </div>
    </ListasCtx.Provider>
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
    // e-mail não diferencia maiúsculas: sem o toLowerCase, "Flavio.JR@" e "flavio.jr@"
    // viravam dois clientes distintos
    const k = (v.email || "").trim().toLowerCase() || v.nome.trim().toLowerCase();
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

  const porTipo = [...new Set([...TIPOS, ...vendas.map((v) => v.tipo)])].filter(Boolean).map((t) => {
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
function Overview({ vendas, financeiro, trabalhos, dark }) {
  // série única dos gráficos: azul da marca calibrado por superfície (Recharts não lê var() no fill)
  const corSerie = dark ? "#5AA7CC" : "#2C7DA0";
  const anos = useMemo(() => {
    const set = new Set();
    vendas.forEach((v) => { const a = anoDeIso(v.data); if (a) set.add(a); });
    (financeiro || []).forEach((f) => { if (f.ano) set.add(f.ano); });
    return [...set].sort((a, b) => b - a);
  }, [vendas, financeiro]);

  const [ano, setAno] = useState("");
  const [mes, setMes] = useState("");
  const [todasFac, setTodasFac] = useState(false); // lista de faculdades: top 10 ou completa
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

  // mesma regra do Financeiro: faturamento = vendas pagas no período + ajuste manual do mês
  const ajusteTotal = finFiltrado.reduce((s, f) => s + (f.faturamentoAjuste || 0), 0);
  const fatTotal = m.totalFat + ajusteTotal;
  const custoTotal = finFiltrado.reduce((s, f) => s + (f.taxaPublicacao || 0) + (f.custoAds || 0) + (f.custoFixo || 0) + (f.custoExtra || 0), 0);
  const lucroTotal = fatTotal - custoTotal;

  const porMesChart = useMemo(() => {
    const ajusteMes = Array(12).fill(0);
    finFiltrado.forEach((f) => { if (f.ordem != null && ajusteMes[f.ordem] !== undefined) ajusteMes[f.ordem] += (f.faturamentoAjuste || 0); });
    return MESES.map((nome, i) => {
      const v = m.porMes.find((x) => x.idx === i);
      return { mes: nome, mesAbrev: nome.slice(0, 3), idx: i, total: (v?.total || 0) + ajusteMes[i], qtd: v?.qtd || 0 };
    }).filter((x) => x.qtd > 0 || x.total !== 0);
  }, [m, finFiltrado]);

  const tipoTop = m.porTipo[0];
  const ufTop = m.porUF.filter((u) => u.uf !== "N/I")[0];
  const facTop = m.porFaculdade[0];
  const cliTop = m.clientes[0];

  const donut = m.porTipo.map((t) => ({ name: t.tipo, value: t.total, cor: corTipo(t.tipo) }));
  const maxUF = Math.max(...m.porUF.filter((u) => u.uf !== "N/I").map((u) => u.qtd), 1);
  const ufData = m.porUF.filter((u) => u.uf !== "N/I").slice(0, 8)
    .map((u) => ({ label: `${u.uf} · ${UF_NOME[u.uf]}`, value: u.qtd, cor: "var(--brand)" }));

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
      </div>

      <div className="kpis">
        <KPI label="Faturamento" valor={brl(fatTotal)} sub={`${num(m.nVendas)} vendas no período` + (ajusteTotal ? ` · inclui ajustes ${brl(ajusteTotal)}` : "")} cor="var(--brand)" />
        <KPI label="Lucro líquido" valor={brl(lucroTotal)} sub={`Custos: ${brl(custoTotal)}` + (fatTotal ? ` · Margem ${Math.round((lucroTotal / fatTotal) * 100)}%` : "")} cor="var(--ok)" />
        <KPI label="Clientes únicos" valor={num(m.clientes.length)} sub={`Ticket médio ${brl(m.ticket)}`} cor="#6D5DD3" />
        <KPI label="Certificados emitidos" valor={num(certEmitido)} sub={`${num(pendentes)} pendentes`} cor="var(--accent)" />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head"><h3>Faturamento por mês</h3></div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={porMesChart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEFF1" />
              <XAxis dataKey="mesAbrev" tick={{ fontSize: 12, fill: "#5B6B73" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#5B6B73" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
              <Tooltip formatter={(v) => brl(v)} cursor={{ fill: "#F0F4F5" }} />
              <Bar dataKey="total" fill={corSerie} radius={[5, 5, 0, 0]} maxBarSize={46} />
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
          <p className="nota" title="As não identificadas são instituições do exterior ou sem faculdade informada.">Estado identificado pela faculdade do cliente · {num(m.nVendas - (m.porUF.find((u) => u.uf === "N/I")?.qtd || 0))} de {num(m.nVendas)} vendas com estado definido.</p>
        </div>

        <div className="card">
          <div className="card-head"><h3>Destaques</h3></div>
          <div className="destaques">
            <Destaque rotulo="Produto campeão" principal={tipoTop?.tipo || "—"}
              detalhe={tipoTop ? `${brl(tipoTop.total)} · ${tipoTop.qtd} vendas` : ""} />
            <Destaque rotulo="Estado líder" principal={ufTop ? UF_NOME[ufTop.uf] : "—"}
              detalhe={ufTop ? `${ufTop.qtd} compras · ${brl(ufTop.total)}` : ""} />
            <Destaque rotulo="Faculdade líder" principal={facTop?.faculdade || "—"}
              detalhe={facTop ? `${facTop.qtd} compras` : ""} />
            <Destaque rotulo="Melhor cliente" principal={cliTop?.nome || "—"}
              detalhe={cliTop ? `${brl(cliTop.total)} · ${cliTop.qtd} trabalhos` : ""} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Faculdades que mais compram</h3>
          <span className="hint">{todasFac ? `todas · ${num(m.porFaculdade.length)}` : `top 10 de ${num(m.porFaculdade.length)}`}</span>
        </div>
        <table className="tab">
          <thead><tr><th scope="col">#</th><th scope="col">Faculdade</th><th scope="col" className="r">Compras</th><th scope="col" className="r">Faturamento</th></tr></thead>
          <tbody>
            {(todasFac ? m.porFaculdade : m.porFaculdade.slice(0, 10)).map((f, i) => (
              <tr key={i}>
                <td className="muted">{i + 1}</td>
                <td>{f.faculdade}</td>
                <td className="r"><b>{f.qtd}</b></td>
                <td className="r">{brl(f.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {m.porFaculdade.length > 10 && (
          <div className="mais">
            <button className="btn-ghost" onClick={() => setTodasFac((v) => !v)}>
              {todasFac ? "Mostrar só as 10 primeiras" : `Ver todas as ${num(m.porFaculdade.length)} faculdades`}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function Destaque({ rotulo, principal, detalhe }) {
  return (
    <div className="destaque">
      <div className="dq-rot">{rotulo}</div>
      <div className="dq-pri">{principal}</div>
      <div className="dq-det">{detalhe}</div>
    </div>
  );
}

/* ============================================================
   VENDAS
   ============================================================ */
function Vendas({ vendas, salvar, aviso, temasExist, onAbrirPublicacao, onAbrirCliente }) {
  const { tipos } = useContext(ListasCtx);
  const [busca, setBusca] = useState("");
  const [fTipo, setFTipo] = useState("");
  const [fUF, setFUF] = useState("");
  const [fMes, setFMes] = useState("");
  const [fDia, setFDia] = useState("");     // dia exato (ISO); vazio = sem filtro de dia
  const [fPeriodo, setFPeriodo] = useState(""); // "" | "hoje" | "ontem" | "7d"
  const [limite, setLimite] = useState(60);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);

  // dia e mês são recortes concorrentes: escolher um limpa o outro, senão o
  // resultado vira vazio sem o usuário entender por quê
  const escolherPeriodo = (p) => { setFPeriodo(p); setFDia(""); setFMes(""); setLimite(60); };
  const escolherDia = (d) => { setFDia(d); setFPeriodo(""); setFMes(""); setLimite(60); };
  const escolherMes = (m) => { setFMes(m); setFPeriodo(""); setFDia(""); setLimite(60); };

  const filtradas = useMemo(() => {
    const b = busca.trim().toLowerCase();
    const hoje = hojeIso();
    const diasAtras = (n) => isoSomaDias(hoje, -n);
    const de = fPeriodo === "hoje" ? hoje : fPeriodo === "ontem" ? diasAtras(1) : fPeriodo === "7d" ? diasAtras(6) : "";
    const ate = fPeriodo === "ontem" ? diasAtras(1) : fPeriodo ? hoje : "";
    return vendas
      .filter((v) => {
        if (b && !(`${v.nome} ${v.email} ${v.faculdade} ${v.tema}`.toLowerCase().includes(b))) return false;
        if (fTipo && v.tipo !== fTipo) return false;
        if (fUF && v.uf !== fUF) return false;
        if (fDia && v.data !== fDia) return false;
        if (de && !(v.data >= de && v.data <= ate)) return false;
        if (fMes !== "" && mesDeIso(v.data) !== parseInt(fMes, 10)) return false;
        return true;
      })
      .sort((a, b) => (b.data || "").localeCompare(a.data || ""));
  }, [vendas, busca, fTipo, fUF, fMes, fDia, fPeriodo]);

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
  // contagem no próprio chip, pra saber se vale clicar antes de filtrar
  const contaPeriodo = (p) => {
    const hoje = hojeIso();
    if (p === "hoje") return vendas.filter((v) => v.data === hoje).length;
    if (p === "ontem") { const o = isoSomaDias(hoje, -1); return vendas.filter((v) => v.data === o).length; }
    const de = isoSomaDias(hoje, -6);
    return vendas.filter((v) => v.data >= de && v.data <= hoje).length;
  };
  const rotuloPeriodo = fDia ? fmtData(fDia)
    : fPeriodo === "hoje" ? `hoje, ${fmtData(hojeIso())}`
    : fPeriodo === "ontem" ? "ontem"
    : fPeriodo === "7d" ? "últimos 7 dias"
    : fMes !== "" ? MESES[Number(fMes)] : "";

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
        <div className="busca-wrap">
          <span className="busca-ic" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          </span>
          <input className="inp busca" placeholder="Buscar por nome, email, faculdade ou tema…" aria-label="Buscar venda" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <select className="inp" aria-label="Filtrar por tipo" value={fTipo} onChange={(e) => setFTipo(e.target.value)}>
          <option value="">Todos os tipos</option>
          {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="inp" aria-label="Filtrar por estado" value={fUF} onChange={(e) => setFUF(e.target.value)}>
          <option value="">Todos os estados</option>
          {ufsDisponiveis.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
        <select className="inp" aria-label="Filtrar por mês" value={fMes} onChange={(e) => escolherMes(e.target.value)}>
          <option value="">Todos os meses</option>
          {MESES.map((mez, i) => <option key={i} value={i}>{mez}</option>)}
        </select>
      </div>

      <div className="status-filtros" role="group" aria-label="Filtrar por período">
        {[["hoje", "Hoje"], ["ontem", "Ontem"], ["7d", "Últimos 7 dias"]].map(([id, lab]) => (
          <button key={id} className={"chip-filtro" + (fPeriodo === id ? " ativo" : "")} aria-pressed={fPeriodo === id}
            title={fPeriodo === id ? "Clique para limpar o filtro" : `Ver as vendas de ${lab.toLowerCase()}`}
            onClick={() => escolherPeriodo(fPeriodo === id ? "" : id)}>
            {lab}<b>{contaPeriodo(id)}</b>
          </button>
        ))}
        <label className="chip-dia">
          <span>dia</span>
          <input type="date" className="inp sm" aria-label="Ver as vendas de um dia específico"
            value={fDia} onChange={(e) => escolherDia(e.target.value)} />
        </label>
        {(fPeriodo || fDia || fMes !== "") && (
          <button className="mini" onClick={() => { setFPeriodo(""); setFDia(""); setFMes(""); }}>limpar período</button>
        )}
      </div>

      <div className="resumo-filtro">
        <span>{num(filtradas.length)} venda(s){rotuloPeriodo ? ` · ${rotuloPeriodo}` : ""}</span>
        <span><b>{brl(somaFiltro)}</b></span>
      </div>

      <div className="card no-pad">
        <table className="tab">
          <thead>
            <tr><th scope="col">Data</th><th scope="col">Cliente</th><th scope="col">Faculdade</th><th scope="col">UF</th><th scope="col">Tipo</th><th scope="col" className="r">Valor</th><th scope="col"><span className="sr-only">Ações</span></th></tr>
          </thead>
          <tbody>
            {filtradas.slice(0, limite).map((v) => (
              <tr key={v.id}>
                <td className="nowrap muted">{fmtData(v.data)}</td>
                <td>
                  <button className="cel-nome link-cliente" onClick={() => onAbrirCliente(v)} title="Ver a ficha deste cliente">{v.nome || "—"}</button>
                  {v.tema && (
                    <div className="cel-tema">
                      <a className="link-tema" href={`#pub=${encodeURIComponent(v.tema)}::${encodeURIComponent(v.tipo || "")}`}
                        title={`${v.tema} — abrir em Publicações e vagas`}
                        onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; e.preventDefault(); onAbrirPublicacao(v.tema, v.tipo); }}>
                        {v.tema}
                      </a>
                    </div>
                  )}
                </td>
                <td className="cel-fac">{v.faculdade || "—"}</td>
                <td><span className="uf-pill">{v.uf}</span></td>
                <td><span className="tipo-pill" style={{ "--tc": corTipo(v.tipo) }}>{v.tipo}</span></td>
                <td className="r"><b>{brl(v.valor)}</b></td>
                <td className="acoes">
                  <button className="mini" onClick={() => { setEditando(v); setModal(true); }} aria-label={`Editar venda de ${v.nome || "cliente sem nome"}`}>editar</button>
                  <button className="mini del" onClick={() => remover(v.id)} aria-label={`Remover venda de ${v.nome || "cliente sem nome"}`} title="Remover venda">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtradas.length > limite && (
          <div className="mais"><button className="btn-ghost" onClick={() => setLimite((l) => l + 60)}>Mostrar mais ({num(filtradas.length - limite)} restantes)</button></div>
        )}
        {filtradas.length === 0 && (
          <div className="vazio">
            {vendas.length === 0
              ? "Sem vendas registradas — clique em + Nova venda para começar."
              : "Nenhuma venda encontrada com esses filtros."}
          </div>
        )}
      </div>

      {modal && (
        <FormVenda venda={editando} onSalvar={salvarVenda} onClose={() => { setModal(false); setEditando(null); }} temasExist={temasExist} facOpts={facOpts} />
      )}
    </>
  );
}

/* Select com a lista COMPLETA + opção de criar um valor novo.
 * Substitui os <input list="...">: o datalist só sugeria o que era parecido com o texto já
 * digitado — escondendo as demais opções — e digitar livre criava variantes quase iguais
 * ("capitulo" x "Capítulo"), que o resto do sistema passa a tratar como coisas diferentes. */
function SelectComNovo({ valor, opcoes = [], onChange, rotuloNovo, className = "inp" }) {
  return (
    <select className={className} value={valor} onChange={(e) => {
      if (e.target.value !== "__novo") { onChange(e.target.value); return; }
      const novo = prompt(rotuloNovo);
      if (novo && novo.trim()) onChange(novo.trim());
    }}>
      {valor && !opcoes.includes(valor) && <option value={valor}>{valor}</option>}
      {opcoes.map((o) => <option key={o} value={o}>{o}</option>)}
      <option value="__novo">{rotuloNovo}</option>
    </select>
  );
}

function FormVenda({ venda, onSalvar, onClose, temasExist, facOpts }) {
  const { tipos: tiposDisp } = useContext(ListasCtx);
  const opts = facOpts || { nomes: FAC_BASE.nomes, ufMap: FAC_BASE.ufMap };
  // se a venda em edição tem faculdade fora da lista, tratamos como "outra"
  const facNaLista = venda && venda.faculdade && opts.nomes.includes(venda.faculdade);
  const [f, setF] = useState(venda || {
    data: hojeIso(), nome: "", email: "", faculdade: "",
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
    onSalvar({ ...f, valor: numBR(f.valor) });
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
          <SelectComNovo valor={f.tipo} opcoes={tiposDisp} onChange={(v) => set("tipo", v)} rotuloNovo="Criar novo tipo…" />
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
function Clientes({ m, vendas, salvarCliente, onAbrirPublicacao, contatoDe = () => ({}), alvo = null, onAlvoUsado }) {
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState("total");
  const [limite, setLimite] = useState(50);
  const [sel, setSel] = useState(null);
  const [editando, setEditando] = useState(false);
  const abrir = (c) => { setSel(c); setEditando(false); };
  const contato = contatoDe(sel);
  // veio de um clique no nome do cliente em Vendas: abre esse cliente
  useEffect(() => {
    if (!alvo) return;
    const c = m.clientes.find((x) => x.chave === alvo);
    if (c) { setSel(c); setEditando(false); setBusca(""); }
    if (onAlvoUsado) onAlvoUsado();
  }, [alvo]); // eslint-disable-line react-hooks/exhaustive-deps

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
        <KPI label="Clientes únicos" valor={num(m.clientes.length)} cor="#6D5DD3" />
        <KPI label="Recorrentes (2+ compras)" valor={num(recorrentes)} sub={`${m.clientes.length ? Math.round((recorrentes / m.clientes.length) * 100) : 0}% da base`} cor="var(--brand)" />
        <KPI label="Gasto médio por cliente" valor={brl(m.clientes.length ? m.totalFat / m.clientes.length : 0)} cor="var(--accent)" />
      </div>

      <div className="filtros">
        <div className="busca-wrap">
          <span className="busca-ic" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          </span>
          <input className="inp busca" placeholder="Buscar cliente…" aria-label="Buscar cliente" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <select className="inp sel-ordem" aria-label="Ordenação da lista" value={ordem} onChange={(e) => setOrdem(e.target.value)}>
          <option value="total">Ordenar por total gasto</option>
          <option value="qtd">Ordenar por nº de trabalhos</option>
          <option value="nome">Ordenar por nome</option>
        </select>
      </div>

      <div className="card no-pad">
        <table className="tab">
          <thead><tr><th scope="col">#</th><th scope="col">Cliente</th><th scope="col">Faculdade</th><th scope="col">UF</th><th scope="col" className="r">Trabalhos</th><th scope="col" className="r">Total gasto</th><th scope="col"><span className="sr-only">Detalhes</span></th></tr></thead>
          <tbody>
            {lista.slice(0, limite).map((c, i) => (
              <tr key={c.chave} className="row-click" onClick={() => abrir(c)}>
                <td className="muted">{i + 1}</td>
                <td>
                  <button className="link-titulo" onClick={(e) => { e.stopPropagation(); abrir(c); }} title="Ver detalhes do cliente">{c.nome || "—"}</button>
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
        {lista.length === 0 && (
          <div className="vazio">
            {m.clientes.length === 0
              ? "Sem clientes ainda — eles aparecem aqui conforme as vendas são lançadas."
              : "Nenhum cliente encontrado com essa busca."}
          </div>
        )}
      </div>

      {sel && (
        <Modal titulo={editando ? `Editar cliente · ${sel.nome}` : sel.nome} onClose={() => setSel(null)} wide>
          {editando ? (
            <FormCliente cliente={sel} contato={contato} onSalvar={(d) => { salvarCliente(sel, d); setSel(null); }} onCancelar={() => setEditando(false)} />
          ) : (
            <>
              <div className="cli-info">
                <div><span className="ci-lab">Email</span>{sel.email || "—"}</div>
                <div><span className="ci-lab">Faculdade</span>{sel.faculdade || "—"}</div>
                <div><span className="ci-lab">Estado</span>{UF_NOME[sel.uf] || sel.uf}</div>
                {/* vêm do cadastro de participante, não da venda */}
                <div><span className="ci-lab">CPF</span>{contato.cpf ? fmtCPF(contato.cpf) : "—"}</div>
                <div><span className="ci-lab">Telefone</span>{contato.telefone || "—"}</div>
                {contato.orcid && <div><span className="ci-lab">ORCID</span>{soOrcid(contato.orcid)}</div>}
                <div><span className="ci-lab">Total gasto</span><b>{brl(sel.total)}</b></div>
                <div><span className="ci-lab">Trabalhos</span><b>{sel.qtd}</b></div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
                <button className="btn-ghost" onClick={() => setEditando(true)}>Editar dados do cliente</button>
              </div>
              <h4 className="sub-h">Histórico de compras</h4>
              <table className="tab">
                <thead><tr><th scope="col">Data</th><th scope="col">Tipo</th><th scope="col">Tema</th><th scope="col" className="r">Valor</th></tr></thead>
                <tbody>
                  {sel.compras.sort((a, b) => (b.data || "").localeCompare(a.data || "")).map((v) => (
                    <tr key={v.id}>
                      <td className="nowrap muted">{fmtData(v.data)}</td>
                      <td><span className="tipo-pill" style={{ "--tc": corTipo(v.tipo) }}>{v.tipo}</span></td>
                      <td className="cel-fac">
                        {v.tema ? (
                          // leva direto ao trabalho, em vez de copiar o título e procurar na outra aba.
                          // o tipo vai junto porque o mesmo título pode existir como capítulo e apresentação
                          <a className="link-titulo" href={`#pub=${encodeURIComponent(v.tema)}::${encodeURIComponent(v.tipo || "")}`}
                            title="Abrir este trabalho em Publicações e vagas"
                            onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; e.preventDefault(); setSel(null); onAbrirPublicacao(v.tema, v.tipo); }}>
                            {v.tema}
                          </a>
                        ) : "—"}
                      </td>
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

function FormCliente({ cliente, contato = {}, onSalvar, onCancelar }) {
  const [f, setF] = useState({
    nome: cliente.nome || "", email: cliente.email || "", faculdade: cliente.faculdade || "", uf: cliente.uf || "N/I",
    // guardados no participante; entram aqui para não ter que abrir a publicação só p/ ver o CPF
    cpf: fmtCPF(contato.cpf || ""), telefone: contato.telefone || "",
  });
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
        <Campo label="CPF"><input className="inp" inputMode="numeric" placeholder="000.000.000-00" value={f.cpf} onChange={(e) => set("cpf", fmtCPF(e.target.value))} /></Campo>
        <Campo label="Telefone / WhatsApp"><input className="inp" placeholder="(31) 99999-9999" value={f.telefone} onChange={(e) => set("telefone", e.target.value)} /></Campo>
      </div>
      <p className="nota">
        Aplica nome, email, faculdade e estado em <b>todas as {cliente.qtd} compra(s)</b> deste cliente.
        CPF e telefone valem para as <b>participações</b> dele nas publicações.
      </p>
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
function Trabalhos({ trabalhos, temas, salvar, aviso, onAbrirPublicacao }) {
  const { tipos, status: statusDisp } = useContext(ListasCtx);
  const [busca, setBusca] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fTipo, setFTipo] = useState("");
  const [ordem, setOrdem] = useState("recentes");
  const [modal, setModal] = useState(false);
  const [editLocalId, setEditLocalId] = useState(null);

  const filtrados = useMemo(() => {
    const b = busca.trim().toLowerCase();
    const arr = trabalhos.filter((t) =>
      (!b || t.titulo.toLowerCase().includes(b)) &&
      (!fStatus || t.status === fStatus) &&
      (!fTipo || t.tipo === fTipo));
    const cmp = {
      recentes: (a, c) => (c.criadoEm || "").localeCompare(a.criadoEm || ""),
      antigos: (a, c) => (a.criadoEm || "").localeCompare(c.criadoEm || ""),
      status: (a, c) => statusDisp.indexOf(a.status) - statusDisp.indexOf(c.status) || (c.criadoEm || "").localeCompare(a.criadoEm || ""),
      titulo: (a, c) => a.titulo.localeCompare(c.titulo),
    }[ordem];
    return [...arr].sort(cmp);
  }, [trabalhos, busca, fStatus, fTipo, ordem]);

  const contagem = statusDisp.map((s) => ({ s, n: trabalhos.filter((t) => t.status === s).length }));

  /* Ritmo de produção: quantos trabalhos por mês, pela data de criação do registro,
     lida no horário de Brasília. Nos meses anteriores ao sistema o número reflete a
     importação, não a produção da época. */
  const porMesTrab = useMemo(() => {
    const map = new Map();
    trabalhos.forEach((t) => {
      const d = diaDe(t.criadoEm);
      if (!d) return;
      const k = `${anoDeIso(d)}-${mesDeIso(d)}`;
      map.set(k, (map.get(k) || 0) + 1);
    });
    return map;
  }, [trabalhos]);
  const hojeRef = hojeIso();
  const anoHoje = anoDeIso(hojeRef), mesHoje = mesDeIso(hojeRef);
  const contaMes = (a, m) => porMesTrab.get(`${a}-${m}`) || 0;
  // o mês de comparação começa no anterior, mas pode ser trocado por qualquer outro
  const [cmpMes, setCmpMes] = useState(() => {
    const a = mesHoje === 0 ? anoHoje - 1 : anoHoje, m = mesHoje === 0 ? 11 : mesHoje - 1;
    return `${a}-${m}`;
  });
  const opcoesMes = useMemo(() => {
    const out = [];
    let a = anoHoje, m = mesHoje;
    for (let i = 0; i < 24; i++) {
      out.push({ chave: `${a}-${m}`, rot: MESES[m] + (a !== anoHoje ? ` / ${a}` : "") });
      m -= 1; if (m < 0) { m = 11; a -= 1; }
    }
    return out;
  }, [anoHoje, mesHoje]);
  const [cmpAno, cmpMesIdx] = cmpMes.split("-").map(Number);
  const nEste = contaMes(anoHoje, mesHoje);
  const nCmp = contaMes(cmpAno, cmpMesIdx);
  const difCmp = nEste - nCmp;
  const rotCmp = MESES[cmpMesIdx].toLowerCase() + (cmpAno !== anoHoje ? ` de ${cmpAno}` : "");
  const noAno = [...porMesTrab].reduce((s, [k, n]) => (Number(k.split("-")[0]) === anoHoje ? s + n : s), 0);

  const mudarStatus = (id, status) => {
    salvar(trabalhos.map((t) => (t.id === id ? { ...t, status } : t)));
  };
  const mudarLocal = (id, local) => {
    salvar(trabalhos.map((t) => (t.id === id ? { ...t, localPublicacao: local } : t)));
  };
  const remover = (id) => { if (confirm("Remover trabalho?")) { salvar(trabalhos.filter((t) => t.id !== id)); aviso("Removido"); } };
  const addTrab = (d) => { salvar([{ id: "t" + uid(), criadoEm: new Date().toISOString(), ...d }, ...trabalhos]); setModal(false); aviso("Trabalho adicionado"); };

  // exporta o título de TODOS os trabalhos + o nome de TODAS as publicações (ignora filtros) num .txt,
  // um por linha, sem repetir e em ordem alfabética — serve como lista de exclusão de temas já usados
  const exportarTitulos = () => {
    const brutos = [...trabalhos.map((t) => t.titulo), ...(temas || []).map((t) => t.nome)];
    const titulos = [...new Set(brutos.map((x) => (x || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
    if (!titulos.length) { aviso("Nenhum título para exportar."); return; }
    const hoje = new Date().toISOString().slice(0, 10);
    baixarTexto(`titulos-trabalhos-${hoje}.txt`, titulos.join("\n") + "\n");
    aviso(`${num(titulos.length)} títulos exportados (trabalhos + publicações)`);
  };

  return (
    <>
      <Header titulo="Trabalhos" sub={`${num(trabalhos.length)} trabalhos no controle de produção`}
        acao={<div className="head-acoes">
          <button className="btn-ghost" onClick={exportarTitulos} title="Baixa um .txt com todos os títulos (trabalhos + publicações), um por linha">⬇ Exportar títulos</button>
          <button className="btn" onClick={() => setModal(true)}>+ Novo trabalho</button>
        </div>} />

      <div className="kpis kpis-3">
        <KPI label={`Este mês · ${MESES[mesHoje]}`} valor={num(nEste)}
          sub={nCmp === 0 ? `nada em ${rotCmp} para comparar`
            : difCmp === 0 ? `mesmo ritmo de ${rotCmp}`
            : `${difCmp > 0 ? "+" : "−"}${Math.abs(difCmp)} em relação a ${rotCmp}`}
          cor="var(--brand)" />
        <div className="kpi">
          <div className="kpi-body">
            <span className="kpi-label">
              <span className="kpi-dot" style={{ background: "#6D5DD3" }} />
              <select className="kpi-sel" aria-label="Mês para comparar" value={cmpMes} onChange={(e) => setCmpMes(e.target.value)}>
                {opcoesMes.map((o) => <option key={o.chave} value={o.chave}>{o.rot}</option>)}
              </select>
            </span>
            <div className="kpi-valor">{num(nCmp)}</div>
            <div className="kpi-sub">
              {cmpAno === anoHoje && cmpMesIdx === mesHoje ? "mês em andamento" : `mês fechado · ${cmpAno}`}
            </div>
          </div>
        </div>
        <KPI label={`No ano · ${anoHoje}`} valor={num(noAno)}
          sub={`${num(trabalhos.length)} desde o início`} cor="var(--ok)" />
      </div>

      <div className="status-filtros" role="group" aria-label="Filtrar por status">
        {contagem.map(({ s, n }) => (
          <button key={s} className={"chip-filtro" + (fStatus === s ? " ativo" : "")} aria-pressed={fStatus === s}
            title={fStatus === s ? "Clique para limpar o filtro" : `Filtrar por ${s}`}
            onClick={() => setFStatus(fStatus === s ? "" : s)}>
            <span className="cf-dot" style={{ background: corStatus(s) }} />{s}<b>{n}</b>
          </button>
        ))}
      </div>

      <div className="filtros">
        <div className="busca-wrap">
          <span className="busca-ic" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          </span>
          <input className="inp busca" placeholder="Buscar trabalho pelo título…" aria-label="Buscar trabalho pelo título" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <select className="inp" aria-label="Filtrar por tipo" value={fTipo} onChange={(e) => setFTipo(e.target.value)}>
          <option value="">Todos os tipos</option>
          {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="inp sel-ordem" aria-label="Ordenação da lista" value={ordem} onChange={(e) => setOrdem(e.target.value)}>
          <option value="recentes">Mais recentes primeiro</option>
          <option value="antigos">Mais antigos primeiro</option>
          <option value="status">Ordenar por status</option>
          <option value="titulo">Ordenar por título</option>
        </select>
      </div>

      <div className="card no-pad">
        <table className="tab tab-trab">
          <thead><tr>
            <th scope="col">Título</th><th scope="col">Adicionado</th><th scope="col">Status</th>
            <th scope="col"><span className="sr-only">Ações</span></th>
          </tr></thead>
          <tbody>
            {filtrados.map((t) => (
              <tr key={t.id}>
                <td className="cel-titulo">
                  <a className="link-titulo" href={`#pub=${encodeURIComponent(t.titulo)}::${encodeURIComponent(t.tipo || "")}`} title="Ver em Publicações e vagas"
                    onClick={(e) => { if (abrirForaDoApp(e)) return; e.preventDefault(); onAbrirPublicacao(t.titulo, t.tipo); }}>{t.titulo}</a>
                  <div className="titulo-meta">
                    <span className="tipo-pill" style={{ "--tc": corTipo(t.tipo) }}>{t.tipo}</span>
                    {editLocalId === t.id ? (
                      <input className="onde-inp" autoFocus defaultValue={t.localPublicacao || ""} placeholder="Revista / evento…"
                        onBlur={(e) => { mudarLocal(t.id, e.target.value.trim()); setEditLocalId(null); }}
                        onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); else if (e.key === "Escape") setEditLocalId(null); }} />
                    ) : t.localPublicacao ? (
                      <button className="onde-chip" onClick={() => setEditLocalId(t.id)} title="Editar local de publicação">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        {t.localPublicacao}
                      </button>
                    ) : (
                      <button className="onde-add" onClick={() => setEditLocalId(t.id)}>+ definir onde será publicado</button>
                    )}
                  </div>
                </td>
                <td className="nowrap cel-data">{t.criadoEm ? fmtData(diaDe(t.criadoEm)) : "—"}</td>
                <td>
                  <select className="status-sel" style={{ "--tc": corStatus(t.status) }} aria-label={`Status do trabalho ${t.titulo}`}
                    value={t.status} onChange={(e) => { if (e.target.value === "__novo") { const s = prompt("Nome do novo status:"); if (s && s.trim()) mudarStatus(t.id, s.trim()); } else mudarStatus(t.id, e.target.value); }}>
                    {statusDisp.map((s) => <option key={s} value={s}>{s}</option>)}
                    <option value="__novo">Criar novo status…</option>
                  </select>
                </td>
                <td className="acoes"><button className="mini del" onClick={() => remover(t.id)} aria-label={`Remover trabalho ${t.titulo}`} title="Remover trabalho">×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtrados.length === 0 && (
          <div className="vazio">
            {trabalhos.length === 0
              ? "Sem trabalhos cadastrados — clique em + Novo trabalho para começar."
              : "Nenhum trabalho encontrado com esses filtros."}
          </div>
        )}
      </div>

      {modal && <FormTrabalho onSalvar={addTrab} onClose={() => setModal(false)} />}
    </>
  );
}

function FormTrabalho({ onSalvar, onClose }) {
  const { tipos: tiposDisp, status: statusDisp } = useContext(ListasCtx);
  const [f, setF] = useState({ titulo: "", tipo: "Artigo", status: "A fazer", localPublicacao: "" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Modal titulo="Novo trabalho" onClose={onClose}>
      <Campo label="Título do trabalho"><input className="inp" value={f.titulo} onChange={(e) => set("titulo", e.target.value)} /></Campo>
      <div className="form-grid">
        <Campo label="Tipo"><SelectComNovo valor={f.tipo} opcoes={tiposDisp} onChange={(v) => set("tipo", v)} rotuloNovo="Criar novo tipo…" /></Campo>
        <Campo label="Status"><SelectComNovo valor={f.status} opcoes={statusDisp} onChange={(v) => set("status", v)} rotuloNovo="Criar novo status…" /></Campo>
      </div>
      <Campo label="Onde será publicado (opcional)"><input className="inp" placeholder="Ex.: Revista X · Congresso Y" value={f.localPublicacao} onChange={(e) => set("localPublicacao", e.target.value)} /></Campo>
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
function Financeiro({ financeiro, salvar, vendas, aviso, onCriarAno, dark, itens = [], onAddItem, onRemItem }) {
  // séries dos gráficos calibradas por superfície (Recharts não lê var() no fill)
  const corSerie = dark ? "#5AA7CC" : "#2C7DA0";
  const corLucro = dark ? "#3FB380" : "#2E9E7B";
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
  const [mes, setMes] = useState("");
  const [editId, setEditId] = useState(null);
  const [cmpA, setCmpA] = useState("");
  const [cmpB, setCmpB] = useState("");

  const fatVendasMes = useMemo(() => {
    const arr = Array(12).fill(0);
    vendas.forEach((v) => { if (anoDeIso(v.data) === anoSel) { const mi = mesDeIso(v.data); if (mi != null) arr[mi] += v.valor; } });
    return arr;
  }, [vendas, anoSel]);

  // linhas do ano (base do gráfico) e o recorte do período selecionado (KPIs, tabela e totais)
  const linhasAno = financeiro
    .filter((f) => f.ano === anoSel)
    .sort((a, b) => a.ordem - b.ordem)
    .map((f) => {
      // faturamento = soma das vendas pagas no mês (automático) + ajuste manual (diferença registrada à mão)
      const faturamento = (fatVendasMes[f.ordem] || 0) + (f.faturamentoAjuste || 0);
      const custoTotal = (f.taxaPublicacao || 0) + (f.custoAds || 0) + (f.custoFixo || 0) + (f.custoExtra || 0);
      return { ...f, faturamento, custoTotal, lucro: faturamento - custoTotal };
    });
  const linhas = mes === "" ? linhasAno : linhasAno.filter((l) => l.ordem === Number(mes));
  const noMes = mes !== "";
  const sufixoPeriodo = noMes ? `em ${MESES[Number(mes)]}` : "no ano";
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

  /* ---- acrescentar um custo direto na tabela (sem abrir o fechamento) ----
     o "+" some no hover da linha; a caixinha soma ao que já está no mês. */
  const [addCusto, setAddCusto] = useState(null); // { id, campo, label, mes, atual, x, y }
  const [addVal, setAddVal] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addRepetir, setAddRepetir] = useState(true);
  const abrirAdd = (e, l, campo, label) => {
    const r = e.currentTarget.getBoundingClientRect();
    setAddVal(""); setAddDesc("");
    setAddRepetir(campo === "custoFixo"); // custo fixo se repete; os outros são do mês
    const seguintes = financeiro.filter((f) => f.ano > l.ano || (f.ano === l.ano && f.ordem >= l.ordem)).length;
    setAddCusto({ id: l.id, campo, label, mes: l.mes, atual: l[campo] || 0, seguintes, x: r.right, y: r.bottom + 6 });
  };
  const confirmarAdd = () => {
    const v = numBR(addVal);
    if (!v) { aviso("Erro: informe o valor a acrescentar"); return; }
    onAddItem(addCusto.id, addCusto.campo, v, addDesc, addRepetir);
    setAddCusto(null);
  };
  const removerItem = (i) => {
    if (i.recorrente) {
      const sim = confirm(`"${i.descricao || "item"}" de ${brl(i.valor)} se repete nos meses seguintes.\n\nOK = tirar deste mês e dos próximos\nCancelar = tirar só deste mês`);
      onRemItem(i, sim);
    } else onRemItem(i, false);
  };
  // itens de um custo do mês, do mais antigo ao mais novo
  const itensDe = (mesId, campo) => itens.filter((i) => i.mesId === mesId && i.campo === campo);
  const celCusto = (l, campo, label, legado = "") => {
    const lista = itensDe(l.id, campo);
    return (
      <td className="r muted cel-custo">
        <span className="cel-custo-val">{brl(l[campo])}</span>
        <button className="add-custo" title={`Acrescentar a ${label.toLowerCase()} de ${l.mes}`}
          aria-label={`Acrescentar a ${label} de ${l.mes}`}
          onClick={(e) => abrirAdd(e, l, campo, label)}>+</button>
        {(lista.length > 0 || legado) && (
          <ul className="itens-cel">
            {lista.map((i) => (
              <li key={i.id} title={`${i.descricao || "sem descrição"} · ${brl(i.valor)}${i.recorrente ? " · se repete todo mês" : ""}`}>
                <span className="ic-val">{numTxt(i.valor)}</span>
                <span className="ic-desc">{i.recorrente && <span className="ic-fixo" aria-hidden="true">↻ </span>}{i.descricao || "—"}</span>
                <button className="ic-x" onClick={() => removerItem(i)} title="Remover este item e descontar do mês"
                  aria-label={`Remover ${i.descricao || "item"} de ${brl(i.valor)}`}>×</button>
              </li>
            ))}
            {/* anotação antiga, de quando a descrição era um texto só; fica até ser reescrita em itens */}
            {legado && <li className="ic-legado" title={legado}>{legado}</li>}
          </ul>
        )}
      </td>
    );
  };
  const novoAno = async () => {
    const a = parseInt(window.prompt("Criar fechamento para qual ano? (ex.: 2026)") || "", 10);
    if (!a || a < 2000 || a > 2100) return;
    if (anos.includes(a)) { setAno(a); aviso("Esse ano já existe"); return; }
    await onCriarAno(a); setAno(a);
  };
  const editLinha = linhasAno.find((l) => l.id === editId) || null;
  // o gráfico mantém o ano inteiro como contexto; o mês escolhido fica em destaque
  const chart = linhasAno.map((l) => ({ mes: l.mes.slice(0, 3), ordem: l.ordem, Faturamento: l.faturamento, Lucro: l.lucro }));

  // ---- movimentações: entradas = pagamentos recebidos (vendas); saídas = custos do financeiro ----
  const movimentacoes = useMemo(() => {
    const noPeriodo = (a, o) => a === anoSel && (mes === "" || o === Number(mes));
    const ent = vendas
      .filter((v) => v.data && (v.valor || 0) > 0 && noPeriodo(anoDeIso(v.data), mesDeIso(v.data)))
      .map((v) => ({
        data: v.data, quando: fmtData(v.data), tipo: "entrada",
        label: "Pagamento recebido" + (v.nome ? ` · ${v.nome}` : (v.tema ? ` · ${v.tema}` : "")),
        valor: v.valor || 0,
      }));
    const said = [];
    financeiro.filter((f) => noPeriodo(f.ano, f.ordem)).forEach((f) => {
      const dataMes = `${f.ano}-${String((f.ordem ?? 0) + 1).padStart(2, "0")}-15`;
      const quando = `${f.mes}/${f.ano}`;
      if ((f.taxaPublicacao || 0) > 0) said.push({ data: dataMes, quando, tipo: "saida", label: "Taxa de publicação", valor: f.taxaPublicacao });
      if ((f.custoAds || 0) > 0) said.push({ data: dataMes, quando, tipo: "saida", label: "Anúncios (Ads)", valor: f.custoAds });
      if ((f.custoFixo || 0) > 0) said.push({ data: dataMes, quando, tipo: "saida", label: "Custo fixo", valor: f.custoFixo });
      if ((f.custoExtra || 0) > 0) said.push({ data: dataMes, quando, tipo: "saida", label: "Custo extra" + (f.custoExtraDesc ? ` · ${f.custoExtraDesc}` : ""), valor: f.custoExtra });
    });
    return [...ent, ...said].sort((a, b) => (b.data || "").localeCompare(a.data || ""));
  }, [vendas, financeiro, anoSel, mes]);
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
    const vendasMes = vendas.reduce((s, v) => (anoDeIso(v.data) === a && mesDeIso(v.data) === o ? s + (v.valor || 0) : s), 0);
    const entrou = vendasMes + (f.faturamentoAjuste || 0);
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
      <Header titulo="Financeiro" sub={`Fechamento ${noMes ? `de ${MESES[Number(mes)]} de ${anoSel}` : `mensal · ${anoSel ?? "—"}`}: faturamento, custos e lucro`}
        acao={<button className="btn-ghost" onClick={novoAno}>+ Novo ano</button>} />

      <div className="periodo-bar">
        <span className="periodo-lab">Período</span>
        <select className="inp" aria-label="Ano do fechamento" value={anoSel ?? ""} onChange={(e) => setAno(Number(e.target.value))}>
          {anos.length === 0 && <option value="">—</option>}
          {anos.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select className="inp" aria-label="Mês do fechamento" value={mes} onChange={(e) => setMes(e.target.value)}>
          <option value="">Ano inteiro</option>
          {MESES.map((nm, i) => <option key={i} value={i}>{nm}</option>)}
        </select>
      </div>

      {anoSel == null ? (
        <div className="card"><div className="vazio">Nenhum fechamento cadastrado. Clique em “+ Novo ano” para começar.</div></div>
      ) : (
        <>
          <div className="kpis kpis-3">
            <KPI label={`Faturamento ${sufixoPeriodo}`} valor={brl(tot.faturamento)} cor="var(--brand)" />
            <KPI label={`Custo total ${sufixoPeriodo}`} valor={brl(tot.custoTotal)} sub={`Publicação ${brl(tot.taxaPublicacao)} · Ads ${brl(tot.custoAds)}`} cor="var(--danger)" />
            <KPI label={`Lucro líquido ${sufixoPeriodo}`} valor={brl(tot.lucro)} sub={tot.faturamento ? `Margem ${Math.round((tot.lucro / tot.faturamento) * 100)}%` : ""} cor="var(--ok)" />
          </div>

          <div className="card">
            <div className="card-head"><h3>Faturamento × lucro por mês · {anoSel}</h3></div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEFF1" />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#5B6B73" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#5B6B73" }} axisLine={false} tickLine={false} tickFormatter={(v) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
                <Tooltip formatter={(v) => brl(v)} cursor={{ fill: "#F0F4F5" }} />
                <Bar dataKey="Faturamento" fill={corSerie} radius={[4, 4, 0, 0]} maxBarSize={26}>
                  {chart.map((c) => <Cell key={c.ordem} fillOpacity={noMes && c.ordem !== Number(mes) ? .28 : 1} />)}
                </Bar>
                <Bar dataKey="Lucro" fill={corLucro} radius={[4, 4, 0, 0]} maxBarSize={26}>
                  {chart.map((c) => <Cell key={c.ordem} fillOpacity={noMes && c.ordem !== Number(mes) ? .28 : 1} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card no-pad">
            <div className="card-head pad"><h3>Fechamento {noMes ? `· ${MESES[Number(mes)]} de ${anoSel}` : `mensal · ${anoSel}`}</h3><span className="hint">Faturamento = soma das vendas pagas no mês · “editar” ajusta os custos</span></div>
            <div className="scroll-x">
              <table className="tab fin">
                <thead>
                  <tr>
                    <th scope="col">Mês</th><th scope="col" className="r">Faturamento</th><th scope="col" className="r">Taxa public.</th>
                    <th scope="col" className="r">Ads</th><th scope="col" className="r">Custo fixo</th><th scope="col" className="r">Extra</th>
                    <th scope="col" className="r">Custo total</th><th scope="col" className="r">Lucro</th><th scope="col"><span className="sr-only">Ações</span></th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((l) => (
                    <tr key={l.id} className={l.faturamento === 0 && l.custoTotal === 0 ? "row-zero" : ""}>
                      <td><b>{l.mes}</b>{(l.faturamentoAjuste || 0) !== 0 && (
                        <div className="fat-real" title="Vendas do mês + ajuste manual">vendas {brl(fatVendasMes[l.ordem])} + ajuste {brl(l.faturamentoAjuste)}</div>
                      )}</td>
                      <td className="r">{brl(l.faturamento)}</td>
                      {celCusto(l, "taxaPublicacao", "Taxa de publicação")}
                      {celCusto(l, "custoAds", "Custo com anúncios (Ads)")}
                      {celCusto(l, "custoFixo", "Custo fixo")}
                      {celCusto(l, "custoExtra", "Custo extra / variável", l.custoExtraDesc)}
                      <td className="r neg"><b>{brl(l.custoTotal)}</b></td>
                      <td className="r"><b className={l.lucro >= 0 ? "pos" : "negv"}>{brl(l.lucro)}</b></td>
                      <td className="acoes"><button className="mini" onClick={() => setEditId(l.id)} aria-label={`Editar fechamento de ${l.mes}`}>editar</button></td>
                    </tr>
                  ))}
                  {linhas.length === 0 && <tr><td colSpan={9} className="vazio">Sem fechamento para este mês.</td></tr>}
                  {linhas.length > 1 && (
                  <tr className="row-total">
                    <td>TOTAL</td>
                    <td className="r">{brl(tot.faturamento)}</td>
                    <td className="r">{brl(tot.taxaPublicacao)}</td>
                    <td className="r">{brl(tot.custoAds)}</td>
                    <td className="r">{brl(tot.custoFixo)}</td>
                    <td className="r">{brl(tot.custoExtra)}</td>
                    <td className="r">{brl(tot.custoTotal)}</td>
                    <td className="r"><b className={tot.lucro >= 0 ? "pos" : "negv"}>{brl(tot.lucro)}</b></td>
                    <td></td>
                  </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card no-pad">
            <div className="card-head pad">
              <h3>Movimentações {noMes ? `· ${MESES[Number(mes)]} de ${anoSel}` : `· ${anoSel}`}</h3>
              <span className="hint">pagamentos recebidos (+) e custos (−) · {movimentacoes.length} no período</span>
            </div>
            <div className="scroll-x">
              <table className="tab mov">
                <thead><tr><th scope="col">Quando</th><th scope="col">Movimentação</th><th scope="col" className="r">Valor</th></tr></thead>
                <tbody>
                  {movimentacoes.slice(0, LIM_MOV).map((m, i) => (
                    <tr key={i}>
                      <td className="nowrap muted">{m.quando}</td>
                      <td><span className={`mov-dot ${m.tipo}`}>{m.tipo === "entrada" ? "↑" : "↓"}</span>{m.label}</td>
                      <td className={`r mov-val ${m.tipo}`}>{m.tipo === "entrada" ? "+" : "−"}{brl(m.valor)}</td>
                    </tr>
                  ))}
                  {movimentacoes.length === 0 && <tr><td colSpan={3} className="vazio">Sem movimentações neste período.</td></tr>}
                </tbody>
              </table>
            </div>
            {movimentacoes.length > LIM_MOV && <div className="mov-mais">Mostrando as {LIM_MOV} mais recentes de {movimentacoes.length}.</div>}
          </div>

          <div className="card">
            <div className="card-head"><h3>Comparar meses</h3><span className="hint">escolha dois meses (de qualquer ano)</span></div>
            <div className="cmp-pick">
              <select className="inp" aria-label="Primeiro mês da comparação" value={cmpA} onChange={(e) => setCmpA(e.target.value)}>
                <option value="">Mês A…</option>
                {mesesComp.map((m) => <option key={m.key} value={m.key}>{m.rot}</option>)}
              </select>
              <span className="cmp-vs">vs</span>
              <select className="inp" aria-label="Segundo mês da comparação" value={cmpB} onChange={(e) => setCmpB(e.target.value)}>
                <option value="">Mês B…</option>
                {mesesComp.map((m) => <option key={m.key} value={m.key}>{m.rot}</option>)}
              </select>
            </div>
            {rA && rB ? (
              <div className="scroll-x">
                <table className="tab cmp">
                  <thead><tr><th scope="col"><span className="sr-only">Métrica</span></th><th scope="col" className="r">{rA.rot}</th><th scope="col" className="r">{rB.rot}</th><th scope="col" className="r">Diferença</th></tr></thead>
                  <tbody>
                    <tr><td>Entrou (faturamento)</td><td className="r">{brl(rA.entrou)}</td><td className="r">{brl(rB.entrou)}</td><td className="r">{difCell(rA.entrou, rB.entrou, true)}</td></tr>
                    <tr><td>Saiu (custos)</td><td className="r neg">{brl(rA.saiu)}</td><td className="r neg">{brl(rB.saiu)}</td><td className="r">{difCell(rA.saiu, rB.saiu, false)}</td></tr>
                    <tr className="row-total"><td>Saldo (lucro)</td><td className="r"><b className={rA.saldo >= 0 ? "pos" : "negv"}>{brl(rA.saldo)}</b></td><td className="r"><b className={rB.saldo >= 0 ? "pos" : "negv"}>{brl(rB.saldo)}</b></td><td className="r">{difCell(rA.saldo, rB.saldo, true)}</td></tr>
                  </tbody>
                </table>
              </div>
            ) : <div className="vazio pad">Escolha dois meses para comparar.</div>}
          </div>
        </>
      )}

      {editLinha && (
        <FormMes linha={editLinha} fatVendas={fatVendasMes[editLinha.ordem]} onSalvar={(d) => salvarLinha(editLinha.id, d)} onClose={() => setEditId(null)} />
      )}

      {addCusto && (
        <>
          <div className="pop-fundo" onClick={() => setAddCusto(null)} />
          <div className="pop-add" style={{ top: addCusto.y, left: addCusto.x }} role="dialog" aria-label={`Acrescentar a ${addCusto.label}`}
            onKeyDown={(e) => { if (e.key === "Escape") setAddCusto(null); }}>
            <div className="pop-tit">{addCusto.label} · {addCusto.mes}</div>
            <div className="pop-atual">hoje: <b>{brl(addCusto.atual)}</b></div>
            <input className="inp sm" autoFocus inputMode="decimal" placeholder="valor a acrescentar"
              value={addVal} onChange={(e) => setAddVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") confirmarAdd(); }} />
            <input className="inp sm" placeholder="do que é? (ex.: chip mentoria)" value={addDesc}
              onChange={(e) => setAddDesc(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") confirmarAdd(); }} />
            <label className="check sm pop-rep">
              <input type="checkbox" checked={addRepetir} onChange={(e) => setAddRepetir(e.target.checked)} />
              repetir nos meses seguintes
            </label>
            {numBR(addVal) > 0 && (
              <div className="pop-preview">
                fica <b>{brl(addCusto.atual + numBR(addVal))}</b>
                {addRepetir && addCusto.seguintes > 1 && <> · em {addCusto.seguintes} meses</>}
              </div>
            )}
            <div className="pop-acoes">
              <button className="mini" onClick={() => setAddCusto(null)}>cancelar</button>
              <button className="btn sm" onClick={confirmarAdd}>acrescentar</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function FormMes({ linha, fatVendas = 0, onSalvar, onClose }) {
  // o que já está salvo no mês serve de base: digitar "+54" soma a isto
  const base = {
    faturamentoAjuste: linha.faturamentoAjuste || 0, taxaPublicacao: linha.taxaPublicacao || 0,
    custoAds: linha.custoAds || 0, custoFixo: linha.custoFixo || 0, custoExtra: linha.custoExtra || 0,
  };
  const [txt, setTxtCampo] = useState(() => {
    const o = {};
    for (const k of Object.keys(base)) o[k] = numTxt(base[k]);
    return o;
  });
  const [desc, setDesc] = useState(linha.custoExtraDesc || "");
  const val = (k) => numExpr(txt[k], base[k]);
  const f = {
    faturamentoAjuste: val("faturamentoAjuste"), taxaPublicacao: val("taxaPublicacao"),
    custoAds: val("custoAds"), custoFixo: val("custoFixo"), custoExtra: val("custoExtra"),
    custoExtraDesc: desc,
  };
  const ct = f.taxaPublicacao + f.custoAds + f.custoFixo + f.custoExtra;
  const fatTotal = (fatVendas || 0) + f.faturamentoAjuste;
  // campo de dinheiro com o resultado da conta logo abaixo, enquanto se digita
  const campo = (k, label) => (
    <Campo label={label}>
      <input className="inp" inputMode="text" value={txt[k]}
        onChange={(e) => setTxtCampo((p) => ({ ...p, [k]: e.target.value }))} />
      {temConta(txt[k]) && (
        <span className="campo-calc">
          = <b>{brl(val(k))}</b>
          {/^[+-]/.test(txt[k].trim()) && <> · sobre os {brl(base[k])} do mês</>}
        </span>
      )}
    </Campo>
  );
  return (
    <Modal titulo={`Fechamento · ${linha.mes}`} onClose={onClose}>
      <div className="fatura-auto">
        Vendas pagas no mês (automático): <b>{brl(fatVendas)}</b>
        {f.faturamentoAjuste !== 0 && <> + ajuste <b>{brl(f.faturamentoAjuste)}</b> = <b>{brl(fatTotal)}</b></>}
        <div className="hint">As vendas somam sozinhas. Use o ajuste só pra registrar receita que não foi lançada venda a venda.</div>
      </div>
      <div className="form-grid">
        {campo("faturamentoAjuste", "Ajuste de faturamento (diferença)")}
        {campo("taxaPublicacao", "Taxa de publicação")}
        {campo("custoAds", "Custo com anúncios (Ads)")}
        {campo("custoFixo", "Custo fixo")}
        {campo("custoExtra", "Custo extra / variável")}
      </div>
      <p className="hint dica-conta">
        Para <b>acrescentar</b> um custo em vez de trocar o valor, digite com <b>+</b>:
        “+54” soma 54 ao que já está no mês. Também dá para somar itens de uma vez: “25+281,08+359,99”.
      </p>
      <Campo label="Descrição do custo extra (opcional)">
        <input className="inp" placeholder="Ex.: Compra de celular" value={desc} onChange={(e) => setDesc(e.target.value)} />
      </Campo>
      <div className="resumo-mes">
        <div><span>Faturamento</span><b className="pos">{brl(fatTotal)}</b></div>
        <div><span>Custo total</span><b className="negv">{brl(ct)}</b></div>
        <div><span>Lucro</span><b className={fatTotal - ct >= 0 ? "pos" : "negv"}>{brl(fatTotal - ct)}</b></div>
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
function Temas({ temas, vendas, trabalhos, abertura = new Map(), onCriarNoDia, onPorNoCalendario, onSetLocalTrabalho, onSetStatusTrabalho, alvoId, onAlvoUsado, onAdd, onRem, onEdit, onEditNome, onAddPart, onEditPart, onRemPart, onLancarTaxa, onCorrigirTaxa, aviso }) {
  const [busca, setBusca] = useState("");
  const [soComVaga, setSoComVaga] = useState(false);
  const [situacao, setSituacao] = useState("venda"); // a tela abre no trabalho do dia
  const [selId, setSelId] = useState(null);
  const [modalTema, setModalTema] = useState(false);
  const detalheRef = useRef(null);
  // veio de um clique em "Trabalhos"? seleciona a publicação e rola até o detalhe
  useEffect(() => {
    if (alvoId) {
      setSelId(alvoId);
      // veio de fora (Calendário, Trabalhos, link direto): a publicação pode não estar na
      // situação filtrada. Troca o filtro para a dela, senão ela abre no detalhe mas some da lista.
      const alvo = temas.find((t) => t.id === alvoId);
      if (alvo) { setSituacao(situacaoDaPub(alvo, abertura, hojeIso())); setBusca(""); }
      if (onAlvoUsado) onAlvoUsado();
      requestAnimationFrame(() => { if (detalheRef.current) detalheRef.current.scrollIntoView({ behavior: "smooth", block: "start" }); });
    }
  }, [alvoId]); // eslint-disable-line react-hooks/exhaustive-deps

  const hoje = hojeIso();
  const situacaoDe = (t) => situacaoDaPub(t, abertura, hoje);
  // quantas publicações em cada situação — vai no rótulo de cada filtro
  const contagens = useMemo(() => {
    const c = { venda: 0, programada: 0, fechada: 0, anterior: 0, todas: temas.length };
    temas.forEach((t) => { c[situacaoDe(t)] += 1; });
    return c;
  }, [temas, abertura, hoje]);

  const buscando = busca.trim().length > 0;
  const lista = useMemo(() => {
    const b = busca.trim().toLowerCase();
    return temas
      .filter((t) => !b || t.nome.toLowerCase().includes(b))
      // a busca procura em todas: quando há texto digitado, o filtro de situação sai da frente
      .filter((t) => buscando || situacao === "todas" || situacaoDe(t) === situacao)
      .filter((t) => !soComVaga || t.participantes.length < t.maxVagas)
      .sort((a, b) => {
        const da = abertura.get(a.id) || "", db = abertura.get(b.id) || "";
        // programadas: a que abre primeiro no topo. Demais: a mais recente no topo.
        if (da && db && da !== db) return situacao === "programada" && !buscando ? da.localeCompare(db) : db.localeCompare(da);
        if (da !== db) return db.localeCompare(da); // com data antes de sem data
        return (b.criadoEm || "").localeCompare(a.criadoEm || "");
      });
  }, [temas, busca, soComVaga, situacao, abertura, hoje]);

  const sel = temas.find((t) => t.id === selId) || null;
  const trabLink = sel ? (trabalhos || []).find((x) => x.titulo === sel.nome) : null; // trabalho vinculado (mesmo título)
  const comVaga = temas.filter((t) => t.participantes.length < t.maxVagas).length;
  const totalPart = temas.reduce((s, t) => s + t.participantes.length, 0);

  // cadastro unificado de pessoas conhecidas (vendas + participantes de qualquer publicação),
  // para preencher os dados de quem já comprou sem redigitar
  const pessoas = useMemo(() => {
    const map = new Map();
    const upsert = (dados, data) => {
      const k = (dados.nome || "").trim().toLowerCase();
      if (!k) return;
      const atual = map.get(k);
      if (!atual) { map.set(k, { ...dados, nome: dados.nome.trim(), _data: data || "" }); return; }
      const maisNovo = (data || "") >= (atual._data || "");
      for (const c of ["email", "faculdade", "orcid", "telefone", "cpf"]) {
        if (dados[c] && (maisNovo || !atual[c])) atual[c] = dados[c];
      }
      if (dados.graduado) atual.graduado = true;
      if (maisNovo) atual._data = data || "";
    };
    vendas.forEach((v) => upsert({ nome: v.nome || "", email: v.email || "", faculdade: v.faculdade || "" }, v.data));
    temas.forEach((tm) => tm.participantes.forEach((p) =>
      upsert({ nome: p.nome || "", email: p.email || "", faculdade: p.faculdade || "", orcid: p.orcid || "", telefone: p.telefone || "", cpf: p.cpf || "", graduado: !!p.graduado }, "")));
    return Array.from(map.values()).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [vendas, temas]);

  // publicação criada por aqui também entra no calendário, na data informada — senão ela
  // nasceria sem data de abertura e cairia em "Anteriores" no mesmo dia em que foi criada
  const criar = (d) => { onCriarNoDia(d.dataAbertura || hojeIso(), d); setModalTema(false); };
  // fechar = trabalho publicado, não vende mais. Sai de "Em venda" e vai para "Fechadas".
  // Nada é apagado: participantes, vendas e taxa continuam como estão.
  const fechar = (t) => {
    const sobrando = t.maxVagas - t.participantes.length;
    const nota = sobrando > 0 ? `\n\nAinda há ${sobrando} vaga(s) por vender — elas serão dadas como encerradas.` : "";
    if (!confirm(`Fechar as vendas desta publicação?\n\n${t.nome}${nota}\n\nOs participantes e as vendas continuam no sistema. Dá para reabrir depois.`)) return;
    onEdit(t.id, { fechadaEm: new Date().toISOString() });
  };
  const reabrir = (t) => onEdit(t.id, { fechadaEm: null });
  const excluir = (t) => {
    const extras = ["o trabalho vinculado na aba Trabalhos"];
    if (t.taxaLancada && (t.taxa || 0) > 0) extras.push(`a taxa de ${brl(t.taxa)} lançada no Financeiro (estorno)`);
    if (confirm(`Remover esta publicação?\n\nSerão removidos junto: ${extras.join(" e ")}.`)) {
      onRem(t);
      if (selId === t.id) setSelId(null);
    }
  };

  return (
    <>
      <Header titulo="Publicações e vagas" sub={`${num(temas.length)} publicações · ${num(totalPart)} participações · ${num(comVaga)} com vaga aberta`}
        acao={<button className="btn" onClick={() => setModalTema(true)}>+ Nova publicação</button>} />

      <div className="filtros">
        <div className="busca-wrap">
          <span className="busca-ic" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          </span>
          <input className="inp busca" placeholder="Buscar publicação…" aria-label="Buscar publicação" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <label className="check"><input type="checkbox" checked={soComVaga} onChange={(e) => setSoComVaga(e.target.checked)} /> só com vaga aberta</label>
      </div>

      <div className="sit-bar" role="tablist" aria-label="Situação da publicação">
        {SITUACOES.map(([id, lab]) => (
          <button key={id} role="tab" aria-selected={!buscando && situacao === id}
            className={"sit-chip" + (!buscando && situacao === id ? " ativo" : "")}
            onClick={() => { setSituacao(id); setBusca(""); }}
            title={DICA_SITUACAO[id]}>
            {lab} <span className="sit-num">{contagens[id]}</span>
          </button>
        ))}
        {buscando && <span className="sit-aviso">buscando nas {num(temas.length)} publicações</span>}
      </div>

      <div className="pub-split">
        <div className="pub-lista card no-pad">
          {lista.map((t) => {
            const restantes = t.maxVagas - t.participantes.length;
            const cheio = restantes <= 0;
            return (
              <a key={t.id} href={"#pub=" + encodeURIComponent(t.nome) + "::" + encodeURIComponent(t.tipo || "")} className={"pub-item" + (selId === t.id ? " ativo" : "")}
                onClick={(e) => {
                  if (abrirForaDoApp(e)) return;
                  e.preventDefault();
                  setSelId(t.id); window.history.replaceState(null, "", "#pub=" + encodeURIComponent(t.nome) + "::" + encodeURIComponent(t.tipo || ""));
                }}>
                <div className="pub-item-top">
                  <span className="pub-item-nome">{t.nome}</span>
                  <span className={"vagas-badge " + (t.fechadaEm ? "b-fechada" : cheio ? "b-cheio" : restantes <= 2 ? "b-quase" : "b-ok")}>
                    {t.fechadaEm ? "Fechada" : cheio ? "Lotado" : `${restantes} vaga${restantes > 1 ? "s" : ""}`}
                  </span>
                </div>
                <div className="pub-item-meta">
                  <span className="tipo-pill" style={{ "--tc": corTipo(t.tipo) }}>{t.tipo || "Artigo"}</span>
                  {abertura.get(t.id) && (
                    <span className={"pub-item-data" + (abertura.get(t.id) === hoje ? " hoje" : abertura.get(t.id) > hoje ? " futura" : "")}>
                      {rotuloAbertura(abertura.get(t.id), hoje)}
                    </span>
                  )}
                  <span className="pub-item-ocup">{t.participantes.length}/{t.maxVagas} ocupadas</span>
                </div>
              </a>
            );
          })}
          {lista.length === 0 && (
            <div className="vazio">
              {temas.length === 0
                ? "Sem publicações ainda — clique em + Nova publicação para começar."
                : buscando
                  ? "Nenhuma publicação com esse nome."
                  : situacao === "venda"
                    ? "Nada em venda no momento. Veja em Programadas o que ainda vai abrir, ou use a busca."
                    : "Nenhuma publicação nesta situação."}
            </div>
          )}
        </div>

        <div className="pub-detalhe card" ref={detalheRef}>
          {!sel ? (
            <div className="pub-vazio-det">
              <div className="pub-vazio-ic">≡</div>
              <p>Selecione uma publicação na lista para ver os participantes e lançar pessoas (com o valor pago).</p>
            </div>
          ) : (
            <DetalhePub key={sel.id} t={sel} vendas={vendas} pessoas={pessoas}
              localPub={trabLink ? trabLink.localPublicacao : ""} onSetLocal={(local) => trabLink && onSetLocalTrabalho(trabLink.id, local)}
              statusTrab={trabLink ? (trabLink.status || "A fazer") : null} onSetStatus={(s) => trabLink && onSetStatusTrabalho(trabLink.id, s)}
              onEdit={onEdit} onEditNome={onEditNome} onAddPart={onAddPart} onEditPart={onEditPart} onRemPart={onRemPart} onLancarTaxa={onLancarTaxa} onCorrigirTaxa={onCorrigirTaxa}
              onFechar={fechar} onReabrir={reabrir} dataAbertura={abertura.get(sel.id) || ""} onPorNoCalendario={onPorNoCalendario}
              onExcluir={() => excluir(sel)} />
          )}
        </div>
      </div>

      {modalTema && <FormTema comTaxa comData onSalvar={criar} onClose={() => setModalTema(false)} />}
    </>
  );
}

function DetalhePub({ t, vendas = [], pessoas = [], localPub = "", onSetLocal, statusTrab = null, onSetStatus, onEdit, onEditNome, onAddPart, onEditPart, onRemPart, onLancarTaxa, onCorrigirTaxa, onFechar, onReabrir, dataAbertura = "", onPorNoCalendario, onExcluir }) {
  const { tipos, status: statusDisp } = useContext(ListasCtx);
  const restantes = t.maxVagas - t.participantes.length;
  const cheio = restantes <= 0;
  const [editandoNome, setEditandoNome] = useState(false);
  const [nomeTmp, setNomeTmp] = useState("");
  const [editP, setEditP] = useState(null);
  // se a publicação já tem taxa cadastrada mas ainda não lançada (ex.: veio do cronograma antes
  // do lançamento automático), o valor aparece preenchido — não faz sentido redigitar
  const [taxaVal, setTaxaVal] = useState("");
  const [taxaData, setTaxaData] = useState(hojeIso());
  const [editTaxa, setEditTaxa] = useState(false); // taxa ja lancada, em modo de correcao
  const [dataCal, setDataCal] = useState(hojeIso()); // data para pôr a publicação no calendário
  useEffect(() => {
    setTaxaVal(!t.taxaLancada && (t.taxa || 0) > 0 ? String(t.taxa).replace(".", ",") : "");
    setTaxaData(t.taxaData || hojeIso());
  }, [t.id, t.taxa, t.taxaLancada, t.taxaData]);
  const [subindoCert, setSubindoCert] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [aba, setAba] = useState("participantes");
  const [addAberto, setAddAberto] = useState(false);
  // trocar de publicação volta para a primeira aba e fecha o formulário aberto
  useEffect(() => { setAba("participantes"); setAddAberto(false); }, [t.id]);
  const lancar = () => {
    const v = numBR(taxaVal);
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
  const enviarCert = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setSubindoCert(true);
    try { const url = await db.uploadCertificado(t.id, file); onEdit(t.id, { certificadoUrl: url }); }
    catch (err) { alert("Erro ao subir o certificado: " + (err.message || err)); }
    setSubindoCert(false);
  };
  const linkWhats = (p) => {
    const msg = `Olá, ${p.nome}! 🎓 Segue o certificado da publicação "${t.nome}".\n\nBaixe aqui: ${t.certificadoUrl}\n\nQualquer dúvida, estou à disposição! — PublicaMED`;
    return `https://wa.me/${waTel(p.telefone)}?text=${encodeURIComponent(msg)}`;
  };
  const copiarAutores = () => {
    const txt = t.participantes.map((p) => {
      const nome = p.nome + (p.autorPrincipal ? " (autor principal)" : "") + (p.graduado ? " (graduado)" : "");
      return `Nome: ${nome}\nFaculdade: ${p.faculdade || ""}\nEmail: ${p.email || ""}`
        + (p.cpf ? `\nCPF: ${fmtCPF(p.cpf)}` : "")
        + (p.orcid ? `\nORCID: ${soOrcid(p.orcid)}` : "");
    }).join("\n\n");
    const ok = () => { setCopiado(true); setTimeout(() => setCopiado(false), 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(ok, () => alert(txt));
    else alert(txt);
  };
  const vagasOcupadas = t.participantes.length;
  const graduados = t.participantes.filter((p) => p.graduado).length;
  // valor por vaga: quando todos pagaram igual mostra o valor; senão, a média
  const valoresPagos = t.participantes.map((p) => vendaDoPart(p)?.valor).filter((v) => v != null);
  const porVaga = valoresPagos.length
    ? (valoresPagos.every((v) => v === valoresPagos[0]) ? valoresPagos[0] : faturamento / valoresPagos.length)
    : null;

  return (
    <div className="dp">
      {/* cabeçalho: chips, título e linha de contexto */}
      <div className="dp-chips">
        <span className="tipo-pill" style={{ "--tc": corTipo(t.tipo) }}>{t.tipo || "Artigo"}</span>
        {localPub && <span className="dp-chip">{localPub}</span>}
        {statusTrab != null && (
          <span className="dp-chip status" style={{ "--tc": corStatus(statusTrab) }}>{statusTrab}</span>
        )}
        {t.fechadaEm && <span className="dp-chip fechada">Fechada</span>}
      </div>

      {editandoNome ? (
        <div className="dp-nome-edit">
          <input className="inp" autoFocus value={nomeTmp} onChange={(e) => setNomeTmp(e.target.value)} />
          <button className="btn sm" onClick={() => { if (nomeTmp.trim()) { onEditNome(t, nomeTmp); setEditandoNome(false); } }}>salvar</button>
          <button className="mini" onClick={() => setEditandoNome(false)}>cancelar</button>
        </div>
      ) : (
        <h3 className="dp-titulo">{t.nome}
          <button className="mini dp-edit-nome" onClick={() => { setNomeTmp(t.nome); setEditandoNome(true); }}>editar nome</button>
        </h3>
      )}
      <div className="dp-contexto">
        {t.area ? `${t.area} · ` : ""}criada em {t.criadoEm ? fmtData(diaDe(t.criadoEm)) : "—"}
        {dataAbertura ? ` · abre em ${fmtData(dataAbertura)}` : ""}
      </div>

      {/* indicadores */}
      <div className="dp-kpis">
        <div className="dp-kpi">
          <span className="dp-kpi-lab">Vagas</span>
          <span className="dp-kpi-val">
            {vagasOcupadas} de {t.maxVagas}
            {restantes > 0 && <em className="dp-kpi-livres">{restantes} livre{restantes > 1 ? "s" : ""}</em>}
          </span>
          <span className="dp-vagas-barra" role="img" aria-label={`${vagasOcupadas} de ${t.maxVagas} vagas ocupadas`}>
            {Array.from({ length: t.maxVagas }, (_, i) => (
              <i key={i} className={i < vagasOcupadas ? "cheia" : ""} />
            ))}
          </span>
        </div>
        <div className="dp-kpi">
          <span className="dp-kpi-lab">Faturamento</span>
          <span className="dp-kpi-val">{brl(faturamento)}</span>
        </div>
        {/* clicável porque é aqui que se procura a taxa quando ela saiu errada */}
        <button className="dp-kpi dp-kpi-btn" title={t.taxaLancada ? "Corrigir ou estornar a taxa" : "Lançar a taxa no financeiro"}
          onClick={() => { setAba("dados"); if (t.taxaLancada) { setTaxaVal(numTxt(t.taxa)); setTaxaData(t.taxaData || hojeIso()); setEditTaxa(true); } }}>
          <span className="dp-kpi-lab">Taxa de publicação</span>
          <span className="dp-kpi-val">{brl(t.taxa || 0)}<span className="dp-kpi-edit" aria-hidden="true">corrigir</span></span>
        </button>
        <div className="dp-kpi">
          <span className="dp-kpi-lab">Lucro</span>
          <span className={"dp-kpi-val " + (lucro >= 0 ? "pos" : "negv")}>{brl(lucro)}</span>
        </div>
      </div>

      {/* abas */}
      <div className="dp-abas" role="tablist">
        {[["participantes", "Participantes"], ["dados", "Dados da publicação"], ["certificados", "Certificados"]].map(([id, lab]) => (
          <button key={id} role="tab" aria-selected={aba === id}
            className={"dp-aba" + (aba === id ? " ativo" : "")} onClick={() => setAba(id)}>{lab}</button>
        ))}
      </div>

      {aba === "participantes" && (
        <>
          <div className="dp-barra">
            <span className="dp-barra-txt">
              {vagasOcupadas} participante{vagasOcupadas === 1 ? "" : "s"}
              {graduados > 0 ? ` · ${graduados} graduado${graduados > 1 ? "s" : ""}` : ""}
              {porVaga != null ? ` · ${brl(porVaga)} por vaga` : ""}
            </span>
            <span className="dp-barra-acoes">
              {vagasOcupadas > 0 && <button className="mini copiar-btn" onClick={copiarAutores}>{copiado ? "✓ copiado!" : "copiar autores"}</button>}
              {cheio
                ? <span className="dp-lotado-inline">Lotada — aumente as vagas para adicionar</span>
                : <button className="btn" onClick={() => setAddAberto((v) => !v)}>{addAberto ? "Cancelar" : "Adicionar participante"}</button>}
            </span>
          </div>

          {semGraduado && (
            cheio
              ? <div className="aviso-grad erro">Lotada sem nenhum graduado — esta publicação exige pelo menos um participante graduado.</div>
              : <div className="aviso-grad">Exige graduado · ainda não há nenhum graduado entre os participantes.</div>
          )}

          {addAberto && !cheio && (
            <FormPart tema={t} pessoas={pessoas} onAdd={(d) => { onAddPart(t, d); setAddAberto(false); }} />
          )}

          {vagasOcupadas === 0 ? (
            <div className="vazio">Sem participantes ainda.</div>
          ) : (
            <div className="card no-pad dp-tabela-box">
              <table className="tab dp-tabela">
                <thead>
                  <tr>
                    <th scope="col">Participante</th>
                    <th scope="col">Faculdade</th>
                    <th scope="col">Marcações</th>
                    <th scope="col" className="r">Valor pago</th>
                    <th scope="col" className="r"><span className="sr-only">Ações</span></th>
                  </tr>
                </thead>
                <tbody>
                  {t.participantes.map((p) => {
                    const vd = vendaDoPart(p);
                    return (
                      <tr key={p.id}>
                        <td>
                          <span className="p-nome">{p.nome}</span>
                          {p.email && <div className="p-fac">{p.email}</div>}
                          {p.cpf ? <div className="p-cpf">CPF: {fmtCPF(p.cpf)}</div> : null}
                          {p.orcid ? <div className="p-orcid"><a href={`https://orcid.org/${p.orcid.trim()}`} target="_blank" rel="noreferrer">ORCID: {p.orcid}</a></div> : null}
                        </td>
                        <td className="dp-fac">{p.faculdade}</td>
                        <td>
                          <span className="dp-marcas">
                            {p.autorPrincipal && <span className="tag-autor">Autor principal</span>}
                            {p.graduado && <span className="tag-grad">Graduado</span>}
                          </span>
                        </td>
                        <td className="r p-valor" title="Valor pago na vaga">{vd ? brl(vd.valor) : "—"}</td>
                        <td className="r nowrap dp-acoes">
                          <button className="mini" onClick={() => setEditP(p)}>editar</button>
                          <button className="mini del" onClick={() => onRemPart(t.id, p.id)}>×</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* a nota fecha a caixa, como uma última linha da tabela */}
              <div className="dp-rodape-nota">
                {cheio
                  ? `Publicação lotada (${t.maxVagas}/${t.maxVagas}).`
                  : `${restantes} vaga${restantes > 1 ? "s" : ""} ainda livre${restantes > 1 ? "s" : ""} nesta publicação`}
              </div>
            </div>
          )}
        </>
      )}

      {aba === "dados" && (
        <div className="dp-dados">
          <div className="dp-campo">
            <span className="dp-prop-lab" id={`lab-tipo-${t.id}`}>Tipo de trabalho</span>
            <select className="inp" aria-labelledby={`lab-tipo-${t.id}`} value={t.tipo || "Artigo"} onChange={(e) => onEdit(t.id, { tipo: e.target.value })}>
              {tipos.map((tp) => <option key={tp} value={tp}>{tp}</option>)}
            </select>
          </div>
          <div className="dp-campo">
            <span className="dp-prop-lab" id={`lab-vagas-${t.id}`}>Total de vagas</span>
            <input type="number" min="1" className="inp" aria-labelledby={`lab-vagas-${t.id}`} value={t.maxVagas}
              onChange={(e) => onEdit(t.id, { maxVagas: parseInt(e.target.value, 10) || 1 })} />
          </div>
          <div className="dp-campo">
            <span className="dp-prop-lab" id={`lab-local-${t.id}`}>Onde será publicado</span>
            <input className="inp" aria-labelledby={`lab-local-${t.id}`} defaultValue={localPub} placeholder="Revista / evento (ex.: Revista Brasileira de Cardiologia)"
              onBlur={(e) => { const v = e.target.value.trim(); if (onSetLocal && v !== (localPub || "")) onSetLocal(v); }} />
          </div>

          {statusTrab != null && (
            <div className="dp-campo">
              <span className="dp-prop-lab" id={`lab-status-${t.id}`}>Status do trabalho</span>
              <select className="inp" aria-labelledby={`lab-status-${t.id}`} value={statusTrab}
                onChange={(e) => { if (e.target.value === "__novo") { const s = prompt("Nome do novo status:"); if (s && s.trim()) onSetStatus(s.trim()); } else onSetStatus(e.target.value); }}>
                {statusDisp.map((s) => <option key={s} value={s}>{s}</option>)}
                <option value="__novo">Criar novo status…</option>
              </select>
            </div>
          )}
          <div className="dp-campo">
            <span className="dp-prop-lab">Taxa de publicação</span>
            {t.taxaLancada && !editTaxa ? (
              <span className="dp-taxa-form">
                <span className="dp-taxa-ok">{brl(t.taxa)} · lançada no financeiro</span>
                <button className="mini" onClick={() => { setTaxaVal(numTxt(t.taxa)); setTaxaData(t.taxaData || hojeIso()); setEditTaxa(true); }}>corrigir</button>
              </span>
            ) : t.taxaLancada && editTaxa ? (
              <span className="dp-taxa-form">
                <input className="inp sm dp-taxa-val" inputMode="decimal" placeholder="R$" aria-label="Novo valor da taxa" value={taxaVal} onChange={(e) => setTaxaVal(e.target.value)} />
                <input className="inp sm" type="date" aria-label="Mês do lançamento" value={taxaData} onChange={(e) => setTaxaData(e.target.value)} />
                <button className="btn sm" onClick={() => { const v = numBR(taxaVal); onCorrigirTaxa(t, v, taxaData); setEditTaxa(false); }}>salvar correção</button>
                <button className="mini" onClick={() => setEditTaxa(false)}>cancelar</button>
                <button className="mini del" title="Tira a taxa do Financeiro e volta ao estado de não lançada"
                  onClick={() => { if (confirm(`Estornar a taxa de ${brl(t.taxa)} do Financeiro?\n\nA publicação volta a ficar sem taxa lançada.`)) { onCorrigirTaxa(t, 0, t.taxaData); setEditTaxa(false); } }}>estornar</button>
                <span className="hint dp-taxa-hint">o valor antigo é descontado do mês em que entrou</span>
              </span>
            ) : (
              <span className="dp-taxa-form">
                <input className="inp sm dp-taxa-val" inputMode="decimal" placeholder="R$" aria-label="Valor da taxa de publicação" value={taxaVal} onChange={(e) => setTaxaVal(e.target.value)} />
                <input className="inp sm" type="date" aria-label="Data da taxa" value={taxaData} onChange={(e) => setTaxaData(e.target.value)} />
                <button className="btn sm" onClick={lancar}>lançar no financeiro</button>
              </span>
            )}
          </div>
          <div className="dp-campo">
            <span className="dp-prop-lab">Exigências</span>
            <label className="check sm"><input type="checkbox" checked={!!t.requiresGrad} onChange={(e) => onEdit(t.id, { requiresGrad: e.target.checked })} /> Exige ao menos um graduado</label>
          </div>

          <div className="dp-campo full">
            <span className="dp-prop-lab">Calendário</span>
            {dataAbertura ? (
              <span className="dp-fechada-txt">Abre em {fmtData(dataAbertura)}</span>
            ) : (
              <span className="dp-taxa-form">
                <span className="dp-fechada-txt">Fora do calendário</span>
                <input className="inp sm" type="date" aria-label="Data de abertura no calendário"
                  value={dataCal} onChange={(e) => setDataCal(e.target.value)} />
                <button className="mini" onClick={() => onPorNoCalendario(t, dataCal)}
                  title="Põe esta publicação no calendário nesta data. Nada é criado de novo — ela passa a ter data de abertura e sai de Anteriores.">
                  pôr no calendário
                </button>
              </span>
            )}
          </div>
          <div className="dp-campo full">
            <span className="dp-prop-lab">Vendas</span>
            {t.fechadaEm ? (
              <span className="dp-fechada">
                <b>Fechada</b> em {fmtData(diaDe(t.fechadaEm))} · não vende mais vaga
                <button className="mini" onClick={() => onReabrir(t)}
                  title="Volta a publicação para a lista de quem está vendendo">reabrir</button>
              </span>
            ) : cheio ? (
              <span className="dp-fechada"><b>Lotada</b> · todas as vagas preenchidas</span>
            ) : (
              <span className="dp-taxa-form">
                <span className="dp-fechada-txt">Aberta · {restantes} vaga(s) por vender</span>
                <button className="mini fechar-pub" onClick={() => onFechar(t)}
                  title="Use quando o trabalho já foi publicado: encerra as vendas mesmo com vaga sobrando e tira a publicação da lista Em venda">
                  fechar publicação
                </button>
              </span>
            )}
          </div>

          <div className="dp-footer full">
            <button className="mini del" onClick={onExcluir}>excluir esta publicação</button>
          </div>
        </div>
      )}

      {aba === "certificados" && (
        <>
          <div className="dp-barra">
            <div>
              <div className="dp-cert-tit">Certificado da publicação</div>
              <p className="dp-cert-txt">Suba o PDF do certificado para liberar o envio a cada participante pelo WhatsApp.
                O envio automático a todos entra depois, quando o número e a API estiverem configurados.</p>
            </div>
            <span className="dp-barra-acoes">
              {t.certificadoUrl && <a className="mini" href={t.certificadoUrl} target="_blank" rel="noreferrer">ver PDF</a>}
              <label className="btn cert-file">{subindoCert ? "enviando…" : t.certificadoUrl ? "Trocar certificado" : "Subir certificado"}
                <input type="file" accept="application/pdf" onChange={enviarCert} /></label>
            </span>
          </div>

          {vagasOcupadas === 0 ? (
            <div className="vazio">Sem participantes ainda.</div>
          ) : (
            <div className="card no-pad dp-tabela-box">
              <table className="tab dp-tabela">
                <thead>
                  <tr><th scope="col">Participante</th><th scope="col">Situação</th><th scope="col" className="r"><span className="sr-only">Enviar</span></th></tr>
                </thead>
                <tbody>
                  {t.participantes.map((p) => (
                    <tr key={p.id}>
                      <td><span className="p-nome">{p.nome}</span></td>
                      <td>
                        {!t.certificadoUrl
                          ? <span className="cert-pendente">Aguardando PDF</span>
                          : p.telefone
                            ? <span className="cert-pronto">Pronto para envio</span>
                            : <span className="cert-sem-tel">sem telefone — adicione no “editar”</span>}
                      </td>
                      <td className="r">
                        {t.certificadoUrl && p.telefone
                          ? <a className="btn sm wa-btn" href={linkWhats(p)} target="_blank" rel="noreferrer">Enviar</a>
                          : <button className="mini" disabled>Enviar</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {editP && (
        <Modal titulo="Editar participante" onClose={() => setEditP(null)}>
          <FormParticipante part={editP} valorAtual={vendaDoPart(editP)?.valor ?? ""} onSalvar={(d) => { onEditPart(t, editP, d); setEditP(null); }} onCancelar={() => setEditP(null)} />
        </Modal>
      )}
    </div>
  );
}

function FormPart({ tema, pessoas = [], onAdd }) {
  const vazio = { nome: "", faculdade: "", email: "", orcid: "", telefone: "", cpf: "", autorPrincipal: false, graduado: false, valor: "", data: hojeIso(), lancarVenda: true };
  const [p, setP] = useState(vazio);
  const [reconhecida, setReconhecida] = useState(null);
  const set = (k, v) => setP((x) => ({ ...x, [k]: v }));
  // nome bateu com alguém da base? preenche o que estiver vazio (sem sobrescrever o que foi digitado)
  const aoMudarNome = (v) => {
    const ph = pessoas.find((x) => x.nome.toLowerCase() === v.trim().toLowerCase());
    setReconhecida(ph ? ph.nome : null);
    setP((x) => ph ? {
      ...x, nome: ph.nome,
      faculdade: x.faculdade || ph.faculdade || "",
      email: x.email || ph.email || "",
      orcid: x.orcid || ph.orcid || "",
      telefone: x.telefone || ph.telefone || "",
      cpf: x.cpf || ph.cpf || "",
      graduado: x.graduado || !!ph.graduado,
    } : { ...x, nome: v });
  };
  const enviar = () => {
    if (!p.nome.trim()) { alert("Informe o nome."); return; }
    const valor = numBR(p.valor);
    onAdd({ ...p, valor });
    setP({ ...vazio, data: p.data });
    setReconhecida(null);
  };
  return (
    <div className="form-part">
      <div className="fp-grid">
        <input className="inp" placeholder="Nome (busca quem já comprou)" list="pessoas-datalist" value={p.nome} onChange={(e) => aoMudarNome(e.target.value)} />
        <input className="inp" placeholder="Faculdade" list="fac-datalist" value={p.faculdade} onChange={(e) => set("faculdade", e.target.value)} />
        <input className="inp" placeholder="Email" value={p.email} onChange={(e) => set("email", e.target.value)} />
        <input className="inp" placeholder="Telefone / WhatsApp" value={p.telefone} onChange={(e) => set("telefone", e.target.value)} />
        <input className="inp" inputMode="numeric" placeholder="CPF" value={fmtCPF(p.cpf)} onChange={(e) => set("cpf", e.target.value)} />
        <input className="inp" placeholder="ORCID (opcional)" value={p.orcid} onChange={(e) => set("orcid", e.target.value)} />
        <input className="inp" inputMode="decimal" placeholder="Valor pago (R$)" value={p.valor} onChange={(e) => set("valor", e.target.value)} />
        <input className="inp" type="date" aria-label="Data da venda" value={p.data} onChange={(e) => set("data", e.target.value)} />
      </div>
      <datalist id="fac-datalist">{FAC_BASE.nomes.map((n) => <option key={n} value={n} />)}</datalist>
      <datalist id="pessoas-datalist">{pessoas.map((x) => <option key={x.nome} value={x.nome}>{x.faculdade || x.email || ""}</option>)}</datalist>
      {reconhecida && <div className="fp-reconhecida" role="status">✓ {reconhecida} já está na base — dados preenchidos, confira e ajuste se precisar.</div>}
      <div className="fp-opts">
        {/* o tipo da venda sai do rótulo (fica no title) para bater com o desenho aprovado */}
        <label className="check sm" title={`A venda entra no Financeiro como ${tema.tipo}`}>
          <input type="checkbox" checked={p.lancarVenda} onChange={(e) => set("lancarVenda", e.target.checked)} /> Lançar venda</label>
        <label className="check sm"><input type="checkbox" checked={p.autorPrincipal} onChange={(e) => set("autorPrincipal", e.target.checked)} /> Autor principal</label>
        <label className="check sm"><input type="checkbox" checked={p.graduado} onChange={(e) => set("graduado", e.target.checked)} /> Graduado</label>
        <button className="btn" onClick={enviar}>Salvar</button>
      </div>
    </div>
  );
}

function FormParticipante({ part, valorAtual = "", onSalvar, onCancelar }) {
  const [f, setF] = useState({
    nome: part.nome || "", faculdade: part.faculdade || "", email: part.email || "", orcid: part.orcid || "", telefone: part.telefone || "", cpf: part.cpf || "",
    autorPrincipal: !!part.autorPrincipal, graduado: !!part.graduado,
    valor: valorAtual === "" || valorAtual == null ? "" : String(valorAtual),
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const salvar = () => {
    if (!f.nome.trim()) { alert("Informe o nome."); return; }
    const inicial = valorAtual === "" || valorAtual == null ? "" : String(valorAtual);
    onSalvar({ ...f, valor: numBR(f.valor), valorMexido: String(f.valor) !== inicial });
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
      <div className="form-grid">
        <Campo label="ORCID (opcional)"><input className="inp" placeholder="0000-0000-0000-0000" value={f.orcid} onChange={(e) => set("orcid", e.target.value)} /></Campo>
        <Campo label="Telefone / WhatsApp"><input className="inp" placeholder="(31) 99999-9999" value={f.telefone} onChange={(e) => set("telefone", e.target.value)} /></Campo>
      </div>
      <div className="form-grid">
        <Campo label="CPF"><input className="inp" inputMode="numeric" placeholder="000.000.000-00" value={fmtCPF(f.cpf)} onChange={(e) => set("cpf", e.target.value)} /></Campo>
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

// usado tanto no "+ Nova publicação" quanto no cronograma (aí chega pré-preenchido pelo planejamento)
// comTaxa liga o campo de taxa de publicação (usado ao criar a partir do cronograma, onde o
// custo do lançamento já é conhecido na hora). A taxa é digitada como no resto do painel
// ("1.650,00"), convertida por numBR ao salvar, e quem cria é que decide o que fazer com ela —
// no cronograma, ela já é lançada no Financeiro do mês do lançamento.
function FormTema({ onSalvar, onClose, inicial, titulo = "Nova publicação", aviso: avisoTopo, comTaxa = false, comData = false }) {
  const { tipos: tiposDisp } = useContext(ListasCtx); // padrões + os já usados no sistema
  const [f, setF] = useState(() => {
    const base = { nome: "", tipo: "Artigo", area: "", maxVagas: 6, requiresGrad: false, ...(inicial || {}) };
    // a taxa pode chegar como número (vinda do plano) — o input trabalha com texto
    return {
      ...base,
      taxa: base.taxa == null || base.taxa === "" ? "" : String(base.taxa).replace(".", ","),
      dataAbertura: base.dataAbertura || base.taxaData || hojeIso(),
    };
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Modal titulo={titulo} onClose={onClose}>
      {avisoTopo && <p className="form-nota">{avisoTopo}</p>}
      <Campo label="Tema da publicação"><textarea className="inp ta-tema" rows={3} value={f.nome} onChange={(e) => set("nome", e.target.value)} /></Campo>
      <div className="form-grid">
        <Campo label="Tipo de trabalho">
          <SelectComNovo valor={f.tipo} opcoes={tiposDisp} onChange={(v) => set("tipo", v)} rotuloNovo="Criar novo tipo…" />
        </Campo>
        <Campo label="Número de vagas"><input type="number" min="1" className="inp" value={f.maxVagas} onChange={(e) => set("maxVagas", parseInt(e.target.value, 10) || 1)} /></Campo>
      </div>
      <Campo label="Área (opcional)"><input className="inp" placeholder="Ex.: Cirurgia Geral · Emergência" value={f.area} onChange={(e) => set("area", e.target.value)} /></Campo>
      {comData && (
        <div className="form-grid form-grid-taxa">
          <Campo label="Data de abertura">
            <input className="inp" type="date" value={f.dataAbertura} onChange={(e) => set("dataAbertura", e.target.value)} />
          </Campo>
          <p className="form-dica">O dia em que este trabalho entra em venda. Ele passa a aparecer
            no Calendário nessa data, e é por ela que os filtros de Publicações e vagas se orientam.</p>
        </div>
      )}
      {comTaxa && (
        <div className="form-grid form-grid-taxa">
          <Campo label="Taxa de publicação (opcional)">
            <input className="inp" inputMode="decimal" placeholder="R$ 0,00" value={f.taxa} onChange={(e) => set("taxa", e.target.value)} />
          </Campo>
          <p className="form-dica">O custo pago à revista. Já entra como saída no Financeiro,
            no mês deste lançamento — não precisa lançar de novo depois.</p>
        </div>
      )}
      <label className="check pub-grad"><input type="checkbox" checked={f.requiresGrad} onChange={(e) => set("requiresGrad", e.target.checked)} /> é necessário ao menos um médico graduado?</label>
      <div className="form-acoes">
        <button className="btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn" onClick={() => {
          if (!f.nome.trim()) { alert("Informe o tema."); return; }
          onSalvar(comTaxa ? { ...f, taxa: numBR(f.taxa) } : f);
        }}>Criar publicação</button>
      </div>
    </Modal>
  );
}

/* ============================================================
   PLANEJAMENTO (calendário editorial do mês)
   ============================================================ */
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DIAS_SEMANA_LONGO = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
// compara títulos ignorando acento, hífen, pontuação e espaço: "Prehabilitação" acha "Pré-habilitação",
// senão uma diferença de grafia entre o planejamento e o cadastro esconde a publicação já aberta
const chaveTitulo = (s) => (s || "")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, "");
// o t\u00edtulo do cronograma raramente \u00e9 digitado igualzinho no cadastro: al\u00e9m da chave exata,
// comparamos as palavras significativas (\u22654 letras) e aceitamos o melhor candidato acima do limiar
const tokensTitulo = (s) => new Set((s || "")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 4));
const semelhanca = (a, b) => {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  a.forEach((w) => { if (b.has(w)) inter += 1; });
  return inter / (a.size + b.size - inter); // Jaccard
};
const LIMIAR_TITULO = 0.6;
const chaveTipo = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
/* Índice das publicações para casar com o cronograma.
 * A chave inclui o TIPO de propósito: é comum existir um capítulo e uma apresentação com o
 * mesmo título (ou quase), e são trabalhos diferentes, com vagas próprias. Casar só pelo
 * título fazia um puxar as vagas do outro. */
const indicePubs = (temas) => {
  const idx = (temas || []).map((t) => ({
    pub: t, tipo: chaveTipo(t.tipo), chave: chaveTitulo(t.nome), toks: tokensTitulo(t.nome),
  }));
  return { idx, porChave: new Map(idx.map((x) => [x.tipo + "|" + x.chave, x.pub])) };
};
// casa pelo título exato dentro do mesmo tipo e, se falhar, pelo mais parecido acima do
// limiar — também só entre publicações do mesmo tipo. Tipo diferente nunca é o mesmo trabalho.
const casarPub = (titulo, tipo, ix) => {
  const tp = chaveTipo(tipo);
  const exato = ix.porChave.get(tp + "|" + chaveTitulo(titulo));
  if (exato) return exato;
  const toks = tokensTitulo(titulo);
  let melhor = null, score = 0;
  for (const x of ix.idx) {
    if (x.tipo !== tp) continue;
    const s = semelhanca(toks, x.toks);
    if (s > score) { score = s; melhor = x.pub; }
  }
  return melhor && score >= LIMIAR_TITULO ? melhor : null;
};
/* Data de abertura de cada publicação = o dia do lançamento do cronograma em que ela entra.
 * É o que separa "o trabalho de hoje" do resto: publicação fora do cronograma (as anteriores
 * ao calendário editorial) fica sem data, e é justamente por isso que ela não polui a lista
 * de quem está vendendo agora. Devolve Map(pubId -> data ISO). */
function aberturaDasPublicacoes(planejamentos, temas) {
  const ix = indicePubs(temas);
  const abertura = new Map();   // pubId -> data ISO de abertura
  const temasDaPub = new Map(); // pubId -> [ids dos temas do cronograma]
  for (const p of planejamentos || []) {
    for (const l of p.lancamentos || []) {
      const data = `${p.ano}-${String(p.mes + 1).padStart(2, "0")}-${String(l.dia).padStart(2, "0")}`;
      for (const t of l.temas || []) {
        if (t.removido) continue;
        const pub = casarPub(t.titulo, t.tipo || l.tipo, ix);
        if (!pub) continue;
        const atual = abertura.get(pub.id);
        // o mesmo trabalho pode constar em mais de um dia: vale o primeiro, que é quando abriu
        if (!atual || data < atual) abertura.set(pub.id, data);
        if (t.id) temasDaPub.set(pub.id, [...(temasDaPub.get(pub.id) || []), t.id]);
      }
    }
  }
  return { abertura, temasDaPub };
}
/* Situação de uma publicação, na ordem em que importa para o dia a dia. */
const SITUACOES = [
  ["venda", "Em venda"],
  ["programada", "Programadas"],
  ["fechada", "Fechadas"],
  ["anterior", "Anteriores"],
  ["todas", "Todas"],
];
const DICA_SITUACAO = {
  venda: "Já abriram no cronograma e ainda vendem — é aqui que se lança quem comprou",
  programada: "Criadas com antecedência; a data de abertura ainda não chegou",
  fechada: "Não vendem mais: lotaram as vagas ou foram fechadas na mão (trabalho publicado)",
  anterior: "Não estão no cronograma (anteriores ao calendário editorial)",
};
// selo de data mostrado em cada item da lista
const rotuloAbertura = (data, hoje) => {
  if (!data) return "";
  const [a, m, d] = data.split("-");
  const curto = `${d}/${m}`;
  if (data === hoje) return "abre hoje";
  return data > hoje ? `abre ${curto}` : `aberta ${curto}`;
};
const situacaoDaPub = (t, abertura, hoje) => {
  // sai de venda por dois caminhos: lotar as vagas, ou ser fechada na mão quando o
  // trabalho é publicado (acontece de publicar sem ter esgotado as vagas)
  if (t.fechadaEm || t.participantes.length >= t.maxVagas) return "fechada";
  const data = abertura.get(t.id);
  if (!data) return "anterior";           // fora do cronograma
  return data > hoje ? "programada" : "venda";
};
// `editavel` é falso enquanto o cronograma ainda não está no banco (SQL 11-planejamento.sql
// não aplicado): a tela mostra o plano do arquivo, mas sem os botões que gravariam.
/* ============================================================
   MENSAGEM DE VENDAS (anúncio de abertura de vagas no grupo)
   Modelos oficiais por tipo de trabalho. O texto fixo é sempre o
   mesmo; só os temas do dia (emoji + áreas / título / vagas) e o
   valor por vaga mudam. Regras: valor sempre "por vaga", título
   completo em negrito (*...*), sem travessão, separador ━━━━━━━━━━━━.
   ============================================================ */
const SEP_MSG = "━━━━━━━━━━━━";
const semAcento = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
// emoji da especialidade principal (primeira área do tema); se não reconhecer, tenta as outras; senão 🩺
const EMOJI_AREA = [
  [/cardio|eletrofisio/, "❤️"], [/neuro/, "🧠"], [/pediatr|neonat|lactente/, "👶"], [/obstet|gineco|gesta/, "🤰"],
  [/ortop|trauma/, "🦴"], [/fisioter|reabilit|esporte/, "🏃"], [/psiqui|psico/, "🧘"], [/endocrin|diabet/, "🧬"],
  [/infecto|microbio/, "🦠"], [/dermato/, "🧴"], [/onco|cancer/, "🎗️"], [/nefro|urolog/, "🫘"],
  [/pneumo/, "🫁"], [/hemato|vascular/, "🩸"], [/farmaco/, "💊"], [/oftalmo/, "👁️"], [/otorrino/, "👂"],
  [/odonto/, "🦷"], [/anestes/, "💉"], [/radiolog|imagem/, "🩻"], [/geriatr/, "👴"], [/nutri/, "🥗"],
  [/alergo|imuno/, "🤧"], [/publica|coletiva|familia|comunidade/, "🌎"], [/emergenc|urgenc/, "🚑"],
  [/intensiva|uti/, "🏥"], [/reumato/, "🦴"], [/cirurg/, "🔪"], [/clinica/, "🩺"],
];
const emojiArea = (areas) => {
  const partes = (areas || "").split("·").map((a) => semAcento(a.trim())).filter(Boolean);
  for (const a of partes) { const hit = EMOJI_AREA.find(([re]) => re.test(a)); if (hit) return hit[1]; }
  return "🩺";
};
// "600" quando é inteiro, "160,50" quando tem centavos
const fmtValorMsg = (n) => { const v = Number(n) || 0; const c = Number.isInteger(v) ? 0 : 2; return v.toLocaleString("pt-BR", { minimumFractionDigits: c, maximumFractionDigits: c }); };
const linhaVagas = (n) => `↳ ${n} ${n === 1 ? "vaga" : "vagas"}`;
// rodapé comum: valor, parcelamento, desconto, prazo do certificado (+ linha extra opcional)
const rodapeMsg = (valor, certDias, extra) => [
  SEP_MSG,
  `💰 R$ ${valor} por vaga`,
  "💳 Até 12x no cartão",
  "🤝 Desconto comprando mais de uma vaga ou com amigos",
  `📄 Certificado em até ${certDias} dias`,
  ...(extra ? [extra] : []),
  SEP_MSG,
  "Interesse? Chama no privado 👇",
];
const cabTemas = ["📌 TEMAS DISPONÍVEIS", SEP_MSG];
const MODELOS_MSG = {
  internacional: ({ blocos, valor }) => [
    "🌐 VAGAS EM ARTIGO INTERNACIONAL INDEXADO", SEP_MSG,
    "📄 Revista: International Health Sciences Review",
    "✅ ISSN e DOI garantidos", SEP_MSG,
    ...cabTemas, blocos,
    ...rodapeMsg(valor, 7, "📊 Indexação: LATINDEX · LiVre · Google Acadêmico ResearchBid · Crossref · ORCID Eurasian Scientific Journal Index"),
  ],
  qualisA3: ({ blocos, valor }) => [
    "🌐 VAGAS EM ARTIGO INDEXADO QUALIS A3", SEP_MSG,
    "📄 Revista · REASE",
    "📖 Qualis A3 CAPES",
    "✅ ISSN e DOI garantidos", SEP_MSG,
    ...cabTemas, blocos,
    ...rodapeMsg(valor, 20),
  ],
  psu: ({ blocos, valor }) => [
    "🌐 VAGAS EM ARTIGO INDEXADO LILACS", SEP_MSG,
    "⭐ Qualis B2",
    "⭐ Indexado no LILACS",
    "✅ Válido no PSU · HCPA · SES GO · UNESP · AMRIGS",
    "✅ Válido em diversos outros editais do Brasil", SEP_MSG,
    ...cabTemas, blocos,
    ...rodapeMsg(valor, 30),
  ],
  capitulo: ({ blocos, valor }) => [
    "🌐 VAGAS EM CAPÍTULO DE LIVRO", SEP_MSG,
    "✅ Válido no HCPA · FELUMA",
    "✅ ISBN e DOI garantidos", SEP_MSG,
    ...cabTemas, blocos,
    ...rodapeMsg(valor, 7),
  ],
  apresentacao: ({ blocos, valor }) => [
    "🎤 VAGAS EM APRESENTAÇÃO EM CONGRESSO", SEP_MSG,
    "📄 {{nome do congresso}}",
    "📑 Publicado nos Anais do Congresso",
    "✅ Pontua em diversos editais do Brasil como UFCSPA e FELUMA", SEP_MSG,
    ...cabTemas, blocos,
    ...rodapeMsg(valor, 15),
  ],
  // combo: 1º tema = capítulo, 2º tema = apresentação
  combo: ({ temas, valor, vagas }) => {
    const [cap, apr] = temas;
    return [
      "🔥 COMBO CAPÍTULO + APRESENTAÇÃO EM CONGRESSO",
      "*2 TRABALHOS PELO PREÇO DE UM!*", SEP_MSG,
      "📚 *Capítulo de Livro*",
      cap ? cap.titulo : "{{título capítulo}}",
      cap ? cap.areas : "{{áreas}}",
      "",
      "🎤 *Apresentação em Congresso*",
      apr ? apr.titulo : "{{título apresentação}}",
      apr ? apr.areas : "{{áreas}}", SEP_MSG,
      `💰 *Os dois trabalhos juntos por apenas R$ ${valor}* ✅`,
      linhaVagas(vagas), SEP_MSG,
      "💳 Até 12x no cartão",
      "🤝 Desconto comprando com amigos",
      "📄 Certificado em até 7 dias", SEP_MSG,
      "Me chama no privado agora e garanta a sua! 👇",
    ];
  },
  // tipo sem modelo oficial (ex.: "Artigo" genérico): estrutura padrão com o que se sabe do lançamento
  generico: ({ blocos, valor, tipo, veiculo }) => [
    `🌐 VAGAS EM ${(tipo || "TRABALHO").toUpperCase()}`, SEP_MSG,
    ...(veiculo ? [`📄 ${veiculo}`, SEP_MSG] : []),
    ...cabTemas, blocos,
    SEP_MSG,
    `💰 R$ ${valor} por vaga`,
    "💳 Até 12x no cartão",
    "🤝 Desconto comprando mais de uma vaga ou com amigos", SEP_MSG,
    "Interesse? Chama no privado 👇",
  ],
};
const modeloMsgDoTipo = (tipo) => {
  const k = chaveTipo(tipo);
  if (k.includes("internacional")) return MODELOS_MSG.internacional;
  if (k.includes("qualis")) return MODELOS_MSG.qualisA3;
  if (k.includes("psu") || k.includes("lilacs")) return MODELOS_MSG.psu;
  if (k.includes("capitulo")) return MODELOS_MSG.capitulo;
  if (k.includes("apresentacao") || k.includes("congresso")) return MODELOS_MSG.apresentacao;
  if (k.includes("combo")) return MODELOS_MSG.combo;
  return MODELOS_MSG.generico;
};
/* Monta a mensagem de um grupo (trabalho) do dia. `dadosTema(t)` devolve título/áreas/vagas
 * restantes do tema já casado com a publicação do sistema. Tema sem vaga (lotado ou fechado)
 * fica de fora da lista e é devolvido em `fora` para avisar. */
const montarMensagemVendas = (grupo, lanc, dadosTema) => {
  const todos = grupo.temas.map((t) => ({ ...dadosTema(t), emoji: emojiArea(dadosTema(t).areas) }));
  const semVaga = (x) => x.fechada || !(x.vagas > 0);
  const fora = todos.filter(semVaga);
  const dentro = todos.filter((x) => !semVaga(x));
  const blocos = dentro.map((x) => `${x.emoji} ${x.areas}\n*${x.titulo}*\n${linhaVagas(x.vagas)}`).join("\n\n")
    || "{{emoji}} {{áreas}}\n*{{título completo}}*\n↳ {{vagas}} vagas";
  const linhas = modeloMsgDoTipo(grupo.tipo)({
    blocos, temas: dentro, valor: fmtValorMsg(grupo.preco), vagas: grupo.vagas, tipo: grupo.tipo, veiculo: lanc.veiculo,
  });
  const texto = linhas.join("\n");
  return { texto, fora, pendencias: (texto.match(/\{\{[^}]+\}\}/g) || []) };
};

/* Caixa da mensagem: texto já pronto, editável, com copiar. Dia com mais de um trabalho
 * (ex.: capítulo + apresentação) gera uma mensagem por trabalho, escolhida nas abas. */
function GeradorMensagem({ lanc, grupos, dadosTema, onClose }) {
  const [chave, setChave] = useState(grupos[0]?.chave);
  const grupo = grupos.find((g) => g.chave === chave) || grupos[0];
  const gerado = useMemo(() => montarMensagemVendas(grupo, lanc, dadosTema), [grupo, lanc]);
  const [texto, setTexto] = useState(gerado.texto);
  useEffect(() => { setTexto(gerado.texto); }, [gerado.texto]);
  const [copiado, setCopiado] = useState(false);
  const copiar = () => {
    const ok = () => { setCopiado(true); setTimeout(() => setCopiado(false), 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(texto).then(ok, () => alert(texto));
    else alert(texto);
  };
  const editado = texto !== gerado.texto;
  return (
    <Modal titulo={`Mensagem de vendas · dia ${lanc.dia}`} onClose={onClose} wide>
      {grupos.length > 1 && (
        <div className="msg-grupos" role="tablist" aria-label="Trabalho do dia">
          {grupos.map((g) => (
            <button key={g.chave} role="tab" aria-selected={g.chave === grupo.chave}
              className={"mini" + (g.chave === grupo.chave ? " ativo" : "")} onClick={() => setChave(g.chave)}>{g.tipo}</button>
          ))}
        </div>
      )}
      <p className="hint msg-hint">
        Modelo padrão de <b>{grupo.tipo}</b> com os temas do dia e as vagas que ainda restam. Pode editar à vontade antes de copiar.
      </p>
      {gerado.fora.length > 0 && (
        <p className="nota msg-nota">Sem vaga (ficaram de fora): {gerado.fora.map((x) => x.titulo).join(" · ")}</p>
      )}
      {gerado.pendencias.length > 0 && (
        <p className="nota msg-nota">Preencha antes de enviar: {[...new Set(gerado.pendencias)].join(", ")}</p>
      )}
      <textarea className="inp msg-ta" rows={22} value={texto} onChange={(e) => setTexto(e.target.value)} spellCheck={false} />
      <div className="form-acoes">
        {editado && <button className="btn-ghost" onClick={() => setTexto(gerado.texto)}>voltar ao padrão</button>}
        <button className="btn" onClick={copiar}>{copiado ? "✓ copiado!" : "Copiar mensagem"}</button>
      </div>
    </Modal>
  );
}

function Planejamento({ temas, vendas = [], planejamentos = [], editavel = false,
                        onAbrirPublicacao, onCriarPublicacao, onCriarNoDia, onTirarTema, onRestaurarTema }) {
  const [planId, setPlanId] = useState(planejamentos[0]?.id || "");
  const plano = planejamentos.find((p) => p.id === planId) || planejamentos[0] || null;
  const [diaSel, setDiaSel] = useState(plano?.lancamentos[0]?.dia ?? null);
  const [criando, setCriando] = useState(null); // { dados, taxa, dia, novo } — abre o form já preenchido
  const [msgVendas, setMsgVendas] = useState(false); // caixa "Gerar mensagem de vendas" do dia selecionado
  // temas em cartaz no dia e temas que foram tirados dele (guardados, dá para restaurar)
  const temasDe = (l) => l.temas.filter((t) => !t.removido);
  const tiradosDe = (l) => l.temas.filter((t) => t.removido);

  // abre o formulário padrão de publicação com os dados do planejamento, para conferir/ajustar antes de criar
  const abrirCriacao = (l, t) => setCriando({
    dia: l.dia,
    lancamentoId: l.id,
    dataIso: `${plano.ano}-${String(plano.mes + 1).padStart(2, "0")}-${String(l.dia).padStart(2, "0")}`,
    novo: !t,
    dados: {
      nome: t?.titulo || "",
      tipo: l.tipo,
      area: t?.areas || "",
      maxVagas: l.vagas,
      requiresGrad: !!(t?.exigeGraduado ?? l.exigeGraduado),
      // sugestão vinda do plano; o campo do formulário é quem manda
      taxa: t?.taxa ?? l.taxaPorTema,
      // a taxa é lançada no mês do lançamento, não no mês em que a publicação foi criada
      taxaData: `${plano.ano}-${String(plano.mes + 1).padStart(2, "0")}-${String(l.dia).padStart(2, "0")}`,
    },
  });
  const isoDoDia = (dia) => `${plano.ano}-${String(plano.mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
  // trabalho avulso: dia que não tem lançamento planejado. O dia (e o mês, se preciso) é
  // criado no banco na hora de salvar; o tema carrega o próprio tipo e vagas.
  const abrirCriacaoNoDia = (dia) => setCriando({
    dia, novo: true, dataIso: isoDoDia(dia),
    dados: { nome: "", tipo: "Artigo", area: "", maxVagas: 6, requiresGrad: false, taxaData: isoDoDia(dia) },
  });
  const confirmarCriacao = async (form) => {
    const ctx = criando;
    setCriando(null);
    // tema novo entra no cronograma do dia junto com a publicação; tema que já estava no
    // plano só precisa da publicação
    if (ctx?.novo) await onCriarNoDia(ctx.dataIso, form);
    else await onCriarPublicacao(form);
  };
  // tira o tema do cronograma — NÃO mexe na publicação nem nos participantes
  const tirarDoCronograma = (l, tema) => {
    const guardado = tema.extra
      ? "Ele foi acrescentado por aqui, então sai de vez do cronograma."
      : "Ele fica guardado no rodapé do dia — dá para restaurar depois.";
    if (!confirm(`Tirar este tema do dia ${l.dia} do cronograma?\n\n${tema.titulo}\n\nA publicação e os participantes continuam no sistema — sai apenas do planejamento. ${guardado}`)) return;
    onTirarTema(l.id, tema);
  };

  // publicação real correspondente a cada tema planejado. A chave é tipo+título: um capítulo
  // e uma apresentação de mesmo nome são trabalhos distintos e não podem se cruzar.
  const pubPorTitulo = useMemo(() => {
    const ix = indicePubs(temas);
    const map = new Map();
    for (const l of plano?.lancamentos || []) {
      for (const t of temasDe(l)) {
        const ch = chaveTipo(t.tipo || l.tipo) + "|" + chaveTitulo(t.titulo);
        if (map.has(ch)) continue;
        const pub = casarPub(t.titulo, t.tipo || l.tipo, ix);
        if (pub) map.set(ch, pub);
      }
    }
    return map;
  }, [temas, plano]);
  // sempre consultado com o tipo do lançamento junto
  const pubDoTema = (l, t) => pubPorTitulo.get(chaveTipo(t.tipo || l.tipo) + "|" + chaveTitulo(t.titulo));
  // índices de venda p/ apurar o que já foi pago sem varrer a lista inteira por participante
  const idxVendas = useMemo(() => {
    const porPart = new Map(), porTemaNome = new Map();
    (vendas || []).forEach((v) => {
      if (v.participanteId) porPart.set(v.participanteId, v);
      porTemaNome.set(`${v.tema}|${chaveTitulo(v.nome)}`, v);
    });
    return { porPart, porTemaNome };
  }, [vendas]);
  const faturamentoDaPub = (pub) => {
    const vistos = new Set();
    let total = 0;
    for (const p of pub.participantes) {
      const v = idxVendas.porPart.get(p.id) || idxVendas.porTemaNome.get(`${pub.nome}|${chaveTitulo(p.nome)}`);
      if (v && !vistos.has(v.id)) { total += v.valor || 0; vistos.add(v.id); }
    }
    return total;
  };

  // planejado (projeção) e realizado (o que já existe no sistema), lado a lado
  /* Separa os temas do dia por TIPO de trabalho. Um capítulo e uma apresentação marcados para
   * o mesmo dia são trabalhos distintos — com vagas, preço e publicação próprios —, e listá-los
   * juntos passava a impressão de serem temas do mesmo trabalho. */
  const gruposDoDia = (l) => {
    const porTipo = new Map();
    for (const t of temasDe(l)) {
      const tipo = t.tipo || l.tipo;
      const chave = chaveTipo(tipo);
      if (!porTipo.has(chave)) {
        porTipo.set(chave, {
          chave, tipo, temas: [],
          vagas: t.vagas ?? l.vagas,
          preco: t.preco ?? l.preco,
          doPlano: chave === chaveTipo(l.tipo) && !l.avulso,
        });
      }
      porTipo.get(chave).temas.push(t);
    }
    // o tipo do lançamento planejado vem primeiro; os avulsos, depois
    return [...porTipo.values()].sort((a, b) => (b.doPlano ? 1 : 0) - (a.doPlano ? 1 : 0));
  };
  // soma tema a tema: um trabalho avulso no mesmo dia pode ter vagas e preço próprios
  const calc = (l) => {
    const ts = temasDe(l);
    const teto = ts.reduce((s, t) => s + (t.vagas ?? l.vagas) * (t.preco ?? l.preco), 0);
    const vagas = ts.reduce((s, t) => s + (t.vagas ?? l.vagas), 0);
    const receita = teto * plano.conversao;
    return { teto, receita, custo: l.custo || 0, lucro: receita - (l.custo || 0), vagas };
  };
  const real = (l) => {
    let criadas = 0, ocupadas = 0, receita = 0, custo = 0;
    temasDe(l).forEach((t) => {
      const pub = pubDoTema(l, t);
      if (!pub) return;
      criadas += 1;
      ocupadas += pub.participantes.length;
      receita += faturamentoDaPub(pub);
      custo += pub.taxa || 0; // taxa de publicação já cadastrada
    });
    return { criadas, ocupadas, receita, custo, lucro: receita - custo };
  };
  // o realizado é somado por publicação (um mesmo trabalho pode aparecer em mais de um dia
  // do cronograma — contar duas vezes inflaria o vendido)
  const tot = useMemo(() => {
    const a = { teto: 0, receita: 0, custo: 0, lucro: 0, temas: 0, vagas: 0, criadas: 0, ocupadas: 0, receitaReal: 0, custoReal: 0 };
    const vistos = new Set();
    for (const l of plano?.lancamentos || []) {
      const c = calc(l);
      a.teto += c.teto; a.receita += c.receita; a.custo += c.custo; a.lucro += c.lucro;
      a.temas += temasDe(l).length; a.vagas += c.vagas;
      for (const t of temasDe(l)) {
        const pub = pubDoTema(l, t);
        if (!pub || vistos.has(pub.id)) continue;
        vistos.add(pub.id);
        a.criadas += 1;
        a.ocupadas += pub.participantes.length;
        a.receitaReal += faturamentoDaPub(pub);
        a.custoReal += pub.taxa || 0;
      }
    }
    a.lucroReal = a.receitaReal - a.custoReal;
    return a;
  }, [plano, pubPorTitulo, idxVendas]);

  if (!plano) return <><Header titulo="Planejamento" sub="Nenhum planejamento cadastrado" /></>;

  const porDia = new Map(plano.lancamentos.map((l) => [l.dia, l]));
  const primeiroDiaSemana = new Date(plano.ano, plano.mes, 1).getDay();
  const diasNoMes = new Date(plano.ano, plano.mes + 1, 0).getDate();
  const celulas = [
    ...Array.from({ length: primeiroDiaSemana }, () => null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];
  const lanc = diaSel != null ? porDia.get(diaSel) : null;
  const faltaMeta = plano.meta - tot.receitaReal; // o que ainda falta vender de verdade
  const hoje = hojeIso();
  const diaHoje = anoDeIso(hoje) === plano.ano && mesDeIso(hoje) === plano.mes ? Number(hoje.slice(8, 10)) : null;

  return (
    <>
      <Header titulo="Planejamento editorial"
        sub={`${MESES[plano.mes]} de ${plano.ano} · ${num(plano.lancamentos.length)} lançamentos · ${num(tot.criadas)} de ${num(tot.temas)} temas já abertos no sistema`} />

      {planejamentos.length > 1 && (
        <div className="periodo-bar">
          <span className="periodo-lab">Mês</span>
          <select className="inp" aria-label="Mês do planejamento" value={planId}
            onChange={(e) => { setPlanId(e.target.value); const p = planejamentos.find((x) => x.id === e.target.value); setDiaSel(p?.lancamentos[0]?.dia ?? null); }}>
            {planejamentos.map((p) => <option key={p.id} value={p.id}>{MESES[p.mes]} de {p.ano}</option>)}
          </select>
        </div>
      )}
      {!editavel && (
        <p className="nota plano-somente-leitura">
          <b>Cronograma em modo leitura.</b> Ele ainda está no arquivo do código, não no banco —
          por isso os botões de mexer nos temas estão desligados. Para liberar, aplique
          <code> supabase/11-planejamento.sql</code> no SQL Editor do Supabase.
        </p>
      )}

      <div className="kpis kpis-4">
        <KPI label="Já vendido no mês" valor={brl(tot.receitaReal)} sub={`${num(tot.ocupadas)} de ${num(tot.vagas)} vagas planejadas preenchidas`} cor="var(--ok)" />
        <KPI label="Lucro real" valor={brl(tot.lucroReal)} sub={`Vendido menos ${brl(tot.custoReal)} de taxas lançadas`} cor="var(--ok)" />
        <KPI label={`Faturamento projetado (${Math.round(plano.conversao * 100)}%)`} valor={brl(tot.receita)} sub={`${num(tot.criadas)} de ${num(tot.temas)} temas abertos · teto ${brl(tot.teto)}`} cor="#6D5DD3" />
        <KPI label="Lucro projetado" valor={brl(tot.lucro)} sub={`Custo ${brl(tot.custo)} · margem ${tot.receita ? (tot.lucro / tot.receita * 100).toFixed(1) : 0}%`} cor="var(--accent)" />
      </div>

      <div className="card meta-bar">
        <div className="meta-txt">
          <span className="dp-sub">Meta do mês · {brl(plano.meta)}</span>
          <span className="meta-leg"><i className="meta-key real" />vendido {brl(tot.receitaReal)}</span>
          <span className="meta-leg"><i className="meta-key proj" />projeção {brl(tot.receita)}</span>
          <span className={faltaMeta <= 0 ? "pos" : "negv"}>
            {faltaMeta <= 0 ? `meta batida · +${brl(-faltaMeta)}` : `faltam ${brl(faltaMeta)} para a meta`}
          </span>
        </div>
        <div className="meta-track" role="img" aria-label={`Vendido ${brl(tot.receitaReal)} de ${brl(plano.meta)}; projeção ${brl(tot.receita)}`}>
          <div className="meta-fill proj" style={{ width: `${Math.min(100, (tot.receita / plano.meta) * 100)}%` }} />
          <div className="meta-fill real" style={{ width: `${Math.min(100, (tot.receitaReal / plano.meta) * 100)}%` }} />
        </div>
      </div>

      <div className="cal-split">
        <div className="card cal-card">
          <div className="card-head"><h3>{MESES[plano.mes]} · {plano.ano}</h3>
            <span className="hint">{editavel ? "clique em qualquer dia — inclusive vazio — para ver ou adicionar trabalho" : "clique num dia com lançamento"}</span></div>
          <div className="cal-grid">
            {DIAS_SEMANA.map((d) => <div key={d} className="cal-dow">{d}</div>)}
            {celulas.map((dia, i) => {
              if (dia == null) return <div key={`v${i}`} className="cal-cel vazia" />;
              const l = porDia.get(dia);
              // dia sem lançamento continua selecionável: é por onde se cria um trabalho avulso
              if (!l) return (
                <button key={dia} className={"cal-cel livre" + (diaSel === dia ? " sel" : "") + (dia === diaHoje ? " hoje" : "")}
                  onClick={() => setDiaSel(dia)} title={editavel ? `Adicionar trabalho em ${dia}/${String(plano.mes + 1).padStart(2, "0")}` : undefined}>
                  <span className="cal-num">{dia}</span>
                  {editavel && <span className="cal-mais" aria-hidden="true">+</span>}
                </button>
              );
              const r = real(l), c = calc(l);
              // o dia só ganha a cor do tipo quando pelo menos um tema dele foi aberto no sistema
              const ativo = r.criadas > 0;
              return (
                <button key={dia} className={"cal-cel tem" + (ativo ? " aberto" : " neutro") + (diaSel === dia ? " sel" : "") + (dia === diaHoje ? " hoje" : "")} style={{ "--tc": corTipo(l.tipo) }}
                  onClick={() => setDiaSel(dia)} aria-pressed={diaSel === dia}
                  aria-label={`Dia ${dia}: ${l.produto}, ${r.criadas} de ${l.temas.length} publicações abertas, ${r.ocupadas} de ${c.vagas} vagas vendidas`}
                  title={`${l.produto} · ${r.criadas}/${l.temas.length} abertas`}>
                  <span className="cal-num">{dia}</span>
                  <span className="cal-prod">{l.produto}</span>
                  <span className={"cal-info" + (r.criadas === 0 ? " pendente" : "")}>
                    {r.criadas === 0 ? `${l.temas.length} temas · não abertos` : `${r.criadas}/${l.temas.length} abertas · ${r.ocupadas}/${c.vagas} vagas`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card cal-detalhe">
          {!lanc && diaSel != null && editavel ? (
            // dia sem nada planejado: dá para pendurar um trabalho avulso nele
            <div className="pub-vazio-det">
              <div className="pub-vazio-ic">＋</div>
              <p><b>{DIAS_SEMANA_LONGO[new Date(plano.ano, plano.mes, diaSel).getDay()]}, {diaSel} de {MESES[plano.mes]}</b><br />
                Nenhum lançamento planejado para este dia.</p>
              <button className="btn" onClick={() => abrirCriacaoNoDia(diaSel)}>+ adicionar trabalho neste dia</button>
            </div>
          ) : !lanc ? (
            <div className="pub-vazio-det"><div className="pub-vazio-ic">◧</div><p>Selecione um dia para ver os temas planejados.</p></div>
          ) : (() => {
            const c = calc(lanc), r = real(lanc);
            const dow = new Date(plano.ano, plano.mes, lanc.dia).getDay();
            const grupos = gruposDoDia(lanc);
            const misto = grupos.length > 1;
            return (
              <>
                <div className="cal-det-head">
                  <div>
                    <div className="dp-sub">{DIAS_SEMANA_LONGO[dow]}, {lanc.dia} de {MESES[plano.mes]}</div>
                    <h3 className="cal-det-tit">{misto ? `${grupos.length} trabalhos neste dia` : lanc.produto}</h3>
                  </div>
                  <div className="cal-det-acoes">
                    {!misto && <span className="tipo-pill" style={{ "--tc": corTipo(lanc.tipo) }}>{lanc.tipo}</span>}
                    {temasDe(lanc).length > 0 && (
                      <button className="btn sm msg-btn" onClick={() => setMsgVendas(true)}
                        title="Monta a mensagem padrão de abertura de vagas com os temas deste dia">💬 Gerar mensagem de vendas</button>
                    )}
                    {editavel && (
                      <button className="mini" onClick={() => abrirCriacao(lanc, null)}
                        title={`Adiciona um trabalho ao dia ${lanc.dia}/${String(plano.mes + 1).padStart(2, "0")} e cria a publicação`}>
                        + adicionar tema
                      </button>
                    )}
                  </div>
                </div>
                {!misto && (
                  <div className="dp-meta">
                    <span className="dp-meta-txt">{lanc.vagas} vagas por tema · {brl(lanc.preco)} por vaga</span>
                  </div>
                )}
                {lanc.veiculo && !misto && <div className="cal-veiculo">{lanc.veiculo}</div>}

                <div className="cal-cmp">
                  <div className="cal-cmp-row cab"><span /><span>Realizado</span><span>Planejado ({Math.round(plano.conversao * 100)}%)</span></div>
                  <div className="cal-cmp-row"><span>Faturamento</span><b className="pos">{brl(r.receita)}</b><b className="prev">{brl(c.receita)}</b></div>
                  <div className="cal-cmp-row"><span>Custo</span><b className={r.custo > 0 ? "negv" : ""}>{brl(r.custo)}</b><b className="prev">{brl(c.custo)}</b></div>
                  <div className="cal-cmp-row lucro"><span>Lucro</span><b className={r.lucro >= 0 ? "pos" : "negv"}>{brl(r.lucro)}</b><b className="prev">{brl(c.lucro)}</b></div>
                </div>

                <div className="dp-sec-head">
                  <h4 className="dp-sub">{grupos.length > 1 ? `Trabalhos do dia (${grupos.length})` : `Temas (${temasDe(lanc).length})`}</h4>
                  <span className="hint">{r.criadas} de {temasDe(lanc).length} abertos · {r.ocupadas}/{c.vagas} vagas vendidas</span>
                </div>

                {/* um bloco por TIPO de trabalho: capítulo, apresentação e artigo do mesmo dia
                    são trabalhos distintos, e misturá-los numa lista só sugeria que os temas
                    pertenciam todos ao lançamento planejado */}
                {grupos.map((g) => (
                  <section key={g.chave} className={grupos.length > 1 ? "cal-grupo" : ""} style={{ "--tc": corTipo(g.tipo) }}>
                    {grupos.length > 1 && (
                      <header className="cal-grupo-head">
                        <span className="tipo-pill" style={{ "--tc": corTipo(g.tipo) }}>{g.tipo}</span>
                        <span className="cal-grupo-meta">
                          {g.temas.length} tema{g.temas.length > 1 ? "s" : ""} · {g.vagas} vagas por tema
                          {g.preco > 0 ? ` · ${brl(g.preco)} por vaga` : ""}
                        </span>
                        {g.doPlano
                          ? <span className="cal-grupo-tag">do planejamento</span>
                          : <span className="cal-grupo-tag avulso">avulso</span>}
                      </header>
                    )}
                    <ul className="cal-temas">
                      {g.temas.map((t) => {
                        const pub = pubDoTema(lanc, t);
                        const vagasPrev = t.vagas ?? lanc.vagas;
                        return (
                          <li key={t.id || t.titulo} className={pub ? "aberta" : "fechada"}>
                            <div className="cal-tema-topo">
                              <div className="cal-tema-areas">{t.areas}</div>
                              {editavel && (
                                <button className="mini tirar-tema" onClick={() => tirarDoCronograma(lanc, t)}
                                  title="Tira o tema deste dia do cronograma. A publicação e os participantes continuam no sistema.">
                                  tirar do cronograma
                                </button>
                              )}
                            </div>
                            {pub ? (
                              <a className="link-titulo" href={`#pub=${encodeURIComponent(pub.nome)}::${encodeURIComponent(pub.tipo || "")}`} title="Abrir em Publicações e vagas"
                                onClick={(e) => { if (abrirForaDoApp(e)) return; e.preventDefault(); onAbrirPublicacao(pub.nome, pub.tipo); }}>{t.titulo}</a>
                            ) : (
                              <span className="cal-tema-tit">{t.titulo}</span>
                            )}
                            {pub ? (
                              <>
                                <span className="cal-tema-st ok">
                                  ✓ aberta · {pub.participantes.length}/{pub.maxVagas} vagas · {brl(faturamentoDaPub(pub))} vendidos
                                </span>
                                {chaveTitulo(pub.nome) !== chaveTitulo(t.titulo) && (
                                  <span className="cal-tema-st cadastro" title="Título cadastrado no sistema">no sistema: “{pub.nome}”</span>
                                )}
                              </>
                            ) : (
                              <div className="cal-tema-acao">
                                <span className="cal-tema-st">ainda não aberta · {vagasPrev} vagas previstas</span>
                                <button className="mini criar-pub" onClick={() => abrirCriacao(lanc, t)}
                                  title="Abre o formulário de publicação já preenchido com os dados do planejamento">
                                  + criar publicação no sistema
                                </button>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}

                {tiradosDe(lanc).length > 0 && (
                  <div className="cal-tirados">
                    <span className="hint">Tirados do cronograma deste dia</span>
                    <ul>
                      {tiradosDe(lanc).map((t) => (
                        <li key={t.id}>
                          <span className="cal-tirado-tit">{t.titulo}</span>
                          <button className="mini" onClick={() => onRestaurarTema(lanc.id, t)}
                            title="Devolve o tema a este dia do cronograma">restaurar</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {criando && (
        <FormTema titulo={criando.novo ? `Adicionar tema · dia ${criando.dia}` : "Criar publicação do planejamento"} inicial={criando.dados}
          aviso={criando.novo
            ? `O tema entra no cronograma do dia ${criando.dia} e a publicação é criada no sistema (e na aba Trabalhos). Tipo e vagas já vêm do lançamento.`
            : "Dados vindos do cronograma — ajuste o que precisar antes de criar. A publicação também entra na aba Trabalhos."}
          comTaxa comData={false} onSalvar={confirmarCriacao} onClose={() => setCriando(null)} />
      )}

      {msgVendas && lanc && (
        <GeradorMensagem lanc={lanc} grupos={gruposDoDia(lanc)} onClose={() => setMsgVendas(false)}
          dadosTema={(t) => {
            // título e vagas vêm da publicação do sistema quando ela já existe; senão, do cronograma
            const pub = pubDoTema(lanc, t);
            return {
              titulo: pub ? pub.nome : t.titulo,
              areas: t.areas || (pub && pub.area) || "",
              vagas: pub ? Math.max(0, (pub.maxVagas || 0) - pub.participantes.length) : (t.vagas ?? lanc.vagas),
              fechada: !!(pub && pub.fechadaEm),
            };
          }} />
      )}

      {plano.nota && <p className="nota cal-nota"><b>Regras do mês:</b> {plano.nota}</p>}
    </>
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
/* ============ TOKENS · PublicaMED UI 2.0 ============
   Tinta: ink > muted > muted2 (3 níveis, AA garantido)
   Cor de marca: --brand p/ texto e links (AA em 13px), --brand-solid p/ fundos com texto branco
   Sombra: cartões = borda hairline (sem sombra); sombra só em elementos flutuantes
   Escala tipo: 11 overline · 12 meta · 13 corpo · 14 ênfase · 16 seção · 20 página · 24 stat
   Ritmo: base 4px (4/8/12/16/20/24/32/40) · Raios: 6/8/12/999 */
:root{
  --ink:#17222E; --muted:#4D5D6D; --muted2:#5D6D7D;
  --brand:#256E93; --brand-hover:#1E5F82; --brand-deep:#173A56; --accent:#DD6B20;
  --brand-solid:#256E93; --brand-solid-hover:#1E5F82;
  --bg:#F7F8FA; --surface:#FFFFFF; --soft:#F2F5F8; --hover:#F6F8FA; --track:#E8EDF2;
  --border:#E3E8EE; --border-strong:#C9D3DD; --divider:#EDF1F5;
  --brand-soft:rgba(37,110,147,.09); --ring:0 0 0 3px rgba(37,110,147,.25);
  --ok:#0F7A4D; --ok-soft:rgba(15,122,77,.09); --ok-border:rgba(15,122,77,.28);
  --warn:#8F5E00; --warn-soft:rgba(180,124,10,.12); --warn-border:rgba(180,124,10,.38);
  --danger:#B03063; --danger-soft:rgba(176,48,99,.09); --danger-border:rgba(176,48,99,.30);
  --shadow-1:0 1px 2px rgba(16,24,40,.05);
  --shadow-2:0 2px 4px rgba(16,24,40,.04), 0 6px 16px rgba(16,24,40,.08);
  --shadow-3:0 4px 8px rgba(16,24,40,.06), 0 16px 40px rgba(16,24,40,.16);
  --r-sm:6px; --r-md:8px; --r-lg:12px; --r-full:999px;
  --sel-chevron:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="%235D6D7D" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>');
}
.root.dark{
  /* texto */
  --ink:#F5F5F7; --muted:#A1A1A6; --muted2:#8A8A8F; --apagado:#6E6E73;
  /* ação: uma cor só. --brand-solid preenche (botão/menu ativo); --brand é o acento de link */
  --brand:#8CC9EE; --brand-hover:#B0DBF5; --brand-deep:#8CC9EE; --accent:#E8A33D;
  --brand-solid:#2C7BB6; --brand-solid-hover:#3B9EDE;
  /* superfícies */
  --bg:#000000; --surface:#161617; --soft:#101011; --hover:#1F1F21; --track:#2E2E30;
  /* bordas sempre translúcidas, nunca cinza sólido */
  --border:rgba(255,255,255,.08); --border-strong:rgba(255,255,255,.12); --divider:rgba(255,255,255,.06);
  --brand-soft:rgba(59,158,222,.14); --ring:0 0 0 3px rgba(59,158,222,.35);
  /* sinais: cada cor com um trabalho só */
  --ok:#57CF9A; --ok-soft:rgba(87,207,154,.15); --ok-border:rgba(87,207,154,.32);
  --warn:#E8A33D; --warn-soft:rgba(232,163,61,.15); --warn-border:rgba(232,163,61,.34);
  --danger:#E4837E; --danger-soft:rgba(228,131,126,.15); --danger-border:rgba(228,131,126,.32);
  --shadow-1:0 1px 2px rgba(0,0,0,.5);
  --shadow-2:0 2px 4px rgba(0,0,0,.5), 0 6px 16px rgba(0,0,0,.5);
  --shadow-3:0 4px 12px rgba(0,0,0,.6), 0 20px 48px rgba(0,0,0,.7);
  --sel-chevron:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="%238A8A8F" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>');
}
.root{ display:flex; min-height:100vh; background:var(--bg); color-scheme:light;
  font-family:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif; color:var(--ink);
  font-size:14px; line-height:1.45; -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility; }
.root.dark{ color-scheme:dark; }
.root :is(table,td,th,.kpi-valor,.barra-val,.leg-val,.p-valor,.mov-val,.dp-fin-item b,.dp-fin-lucro b){ font-variant-numeric:tabular-nums; }

/* ── TEMA ESCURO: peças com cor fixa fora das variáveis ──────────────────────
   A sidebar e a topbar são navy nos dois temas. No escuro elas passam a
   acompanhar as superfícies do sistema; o tema claro fica como está. */
.root.dark .side{ background:#161617; color:var(--muted); border-right:1px solid rgba(255,255,255,.07); }
.root.dark .topbar{ background:#161617; box-shadow:0 2px 12px rgba(0,0,0,.5); }
.root.dark .brand-sub{ color:var(--muted2); }
.root.dark .nav{ color:var(--muted); }
.root.dark .nav:hover{ background:#242426; color:var(--ink); }
.root.dark .nav.ativo{ background:rgba(59,158,222,.14); color:var(--ink); box-shadow:none; }
.root.dark .nav.ativo .nav-ic{ color:var(--brand); }
.root.dark .nav:focus-visible{ box-shadow:inset 0 0 0 2px var(--brand); }
.root.dark .persist{ color:var(--muted2); }
.root.dark .persist.on .pdot{ background:var(--ok); box-shadow:0 0 0 3px rgba(87,207,154,.18); }
.root.dark .tema-btn{ color:var(--muted); border-color:rgba(255,255,255,.12); }
.root.dark .tema-btn:hover{ background:#242426; }
.root.dark .side-backdrop{ background:rgba(0,0,0,.65); }
.root.dark .side-close{ color:var(--muted); }
/* chip de tipo: fundo é a própria cor do tipo com alpha 0.15 */
.root.dark .tipo-pill{ background:color-mix(in srgb, var(--tc, #7E8E9C) 15%, transparent);
  border-color:color-mix(in srgb, var(--tc, #7E8E9C) 30%, transparent); color:var(--ink); }
/* vazio/desabilitado (ex.: meses sem movimento) */
.root.dark .vazio{ color:var(--apagado); }
/* scrollbar: thumb sólido discreto sobre trilho transparente */
.root.dark *::-webkit-scrollbar-thumb{ background:#2E2E30; }
.root.dark *::-webkit-scrollbar-thumb:hover{ background-color:#3A3A3D; }

/* SIDEBAR — âncora navy da marca nos dois temas */
.side{ width:236px; flex-shrink:0; background:#1C3252; color:#CFE0E3; display:flex; flex-direction:column;
  position:sticky; top:0; height:100vh; border-right:1px solid rgba(255,255,255,.06); }
.brand{ display:flex; flex-direction:column; align-items:flex-start; gap:7px; padding:24px 22px 16px; }
.brand-sub{ font-size:11px; color:#93A9B9; margin-top:1px; letter-spacing:.01em; }
nav{ display:flex; flex-direction:column; gap:2px; padding:8px 12px; }
.nav{ display:flex; align-items:center; gap:10px; padding:9px 12px; border:none; background:transparent;
  color:rgba(214,230,240,.72); font-size:13px; border-radius:8px; cursor:pointer; text-align:left; width:100%; font-weight:500;
  transition:background .12s, color .12s; font-family:inherit; text-decoration:none; box-sizing:border-box; }
.nav:hover{ background:rgba(255,255,255,.05); color:#E9F2F7; }
.nav.ativo{ background:rgba(255,255,255,.10); color:#fff; font-weight:600; box-shadow:inset 0 0 0 1px rgba(255,255,255,.06); }
.nav.ativo .nav-ic{ color:#8FCBE8; opacity:1; }
.nav-ic{ width:18px; text-align:center; font-size:13px; opacity:.85; }
.side-foot{ margin-top:auto; padding:16px; }
.persist{ font-size:11px; display:flex; align-items:center; gap:8px; color:#8FA6B8; line-height:1.4; }
.pdot{ width:7px; height:7px; border-radius:50%; flex-shrink:0; }
.persist.on .pdot{ background:#3FBF8F; box-shadow:0 0 0 3px rgba(63,191,143,.18); }
.persist.off .pdot{ background:var(--accent); }

/* topbar + sidebar-gaveta (só no celular; escondidos no desktop) */
.topbar{ display:none; position:fixed; top:0; left:0; right:0; height:54px; z-index:30; align-items:center; gap:10px;
  padding:0 8px; background:#1C3252; box-shadow:0 2px 12px rgba(13,25,40,.22); }
.topbar-tit{ color:#fff; font-weight:600; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.hamb{ background:transparent; border:none; color:#fff; font-size:23px; line-height:1; cursor:pointer; padding:6px 10px; border-radius:9px; flex-shrink:0; }
.hamb:active{ background:rgba(255,255,255,.14); }
.tema-top{ margin-left:auto; font-size:17px; }
.tema-btn{ width:100%; margin-top:10px; background:transparent; color:#A9C0C6; border:1px solid rgba(255,255,255,.15); border-radius:var(--r-md); padding:8px 10px; font-size:12px; font-weight:500; cursor:pointer; font-family:inherit; transition:background .14s ease; }
.tema-btn:hover{ background:rgba(255,255,255,.06); }
.side-backdrop{ display:none; position:fixed; inset:0; background:rgba(13,25,40,.5); z-index:55; }
.side-close{ display:none; position:absolute; top:14px; right:12px; background:transparent; border:none; color:#A9C0C6; font-size:26px; line-height:1; cursor:pointer; }

/* MAIN */
.main{ flex:1; padding:28px 40px 64px; min-width:0; max-width:1840px; }
.head{ display:flex; justify-content:space-between; align-items:flex-end; gap:16px; margin-bottom:24px; }
.head h1{ font-size:20px; font-weight:600; letter-spacing:-.02em; line-height:1.2; }
.head-sub{ color:var(--muted); font-size:13px; margin-top:4px; }
.head-acoes{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; justify-content:flex-end; }

/* KPIs */
.kpis{ display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:20px; }
.kpis-3{ grid-template-columns:repeat(3,1fr); }
.kpis-4{ grid-template-columns:repeat(4,1fr); }
.kpi{ background:var(--surface); border:1px solid var(--border); border-radius:var(--r-lg); overflow:hidden;
  display:flex; }
.kpi-body{ padding:16px 18px; min-width:0; }
.kpi-label{ font-size:11px; color:var(--muted); font-weight:600; text-transform:uppercase; letter-spacing:.06em;
  display:flex; align-items:center; gap:8px; }
.kpi-dot{ width:8px; height:8px; border-radius:50%; flex-shrink:0; }
/* mês de comparação escolhido no próprio rótulo do cartão */
.kpi-sel{ appearance:none; border:none; background:transparent; color:inherit; font:inherit; letter-spacing:inherit;
  text-transform:inherit; cursor:pointer; padding:0 16px 0 0; outline:none;
  background-image:var(--sel-chevron); background-repeat:no-repeat; background-position:right center; background-size:11px 11px; }
.kpi-sel:hover, .kpi-sel:focus-visible{ color:var(--brand); }
.kpi-sel:focus-visible{ box-shadow:var(--ring); border-radius:3px; }
.kpi-sel option{ text-transform:none; letter-spacing:normal; font-size:13px; color:var(--ink); background:var(--surface); }
.kpi-valor{ font-size:24px; font-weight:600; margin-top:8px; letter-spacing:-.02em; line-height:1.15; }
.kpi-sub{ font-size:12px; color:var(--muted2); margin-top:3px; }
.kpi-click{ cursor:pointer; text-align:left; font-family:inherit; transition:border-color .14s ease, background .14s ease; }
.kpi-click:hover{ border-color:var(--border-strong); background:var(--hover); }
.kpi-click:focus-visible{ box-shadow:var(--ring); outline:none; }
.kpi-ativo{ border-color:var(--brand); box-shadow:var(--ring); }

/* CARDS */
.card{ background:var(--surface); border:1px solid var(--border); border-radius:var(--r-lg); padding:20px;
  margin-bottom:16px; }
.card.no-pad{ padding:0; overflow:hidden; }
.card-head{ display:flex; align-items:baseline; justify-content:space-between; gap:10px; margin-bottom:14px; }
.card-head.pad{ padding:16px 20px 0; }
.card-head h3{ font-size:14px; font-weight:600; letter-spacing:-.01em; }
.hint{ font-size:12px; color:var(--muted2); font-style:normal; }
.grid-2{ display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.nota{ font-size:12px; color:var(--muted2); margin-top:12px; line-height:1.5; border-top:1px solid var(--divider); padding-top:11px; }

/* DONUT */
.donut-wrap{ display:flex; align-items:center; gap:8px; }
.donut-legend{ flex:1; display:flex; flex-direction:column; gap:7px; }
.leg{ display:flex; align-items:center; gap:8px; font-size:12px; }
.dot{ width:9px; height:9px; border-radius:3px; flex-shrink:0; }
.leg-name{ flex:1; color:var(--ink); }
.leg-val{ font-weight:700; color:var(--muted); }

/* BARRAS H */
.barras{ display:flex; flex-direction:column; gap:9px; }
.barra-row{ display:grid; grid-template-columns:130px 1fr 38px; align-items:center; gap:10px; }
.barra-lab{ font-size:12px; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.barra-track{ background:var(--track); border-radius:var(--r-sm); height:8px; overflow:hidden; }
.barra-fill{ height:100%; border-radius:var(--r-sm); transition:width .4s; }
.barra-val{ font-size:12px; font-weight:600; text-align:right; color:var(--muted); }

/* DESTAQUES */
.destaques{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.destaque{ display:flex; flex-direction:column; background:var(--soft); border:1px solid var(--border); border-radius:var(--r-md); padding:12px 14px; }
.dq-rot{ font-size:11px; color:var(--muted2); text-transform:uppercase; font-weight:600; letter-spacing:.06em; }
.dq-pri{ font-size:14px; font-weight:600; margin-top:4px; line-height:1.3; }
.dq-det{ font-size:12px; color:var(--muted); margin-top:2px; }

/* FILTROS */
.filtros{ display:flex; gap:10px; margin-bottom:14px; flex-wrap:wrap; align-items:center; }
.inp{ background:var(--surface); border:1px solid var(--border); border-radius:var(--r-md); padding:8px 12px;
  font-size:13px; color:var(--ink); font-family:inherit; outline:none; transition:border-color .14s ease, box-shadow .14s ease; }
.inp::placeholder{ color:var(--muted2); }
.inp:hover{ border-color:var(--border-strong); }
.inp:focus{ border-color:var(--brand); box-shadow:var(--ring); }
select.inp{ appearance:none; background-image:var(--sel-chevron); background-repeat:no-repeat;
  background-position:right 10px center; padding-right:30px; }
.inp.busca{ flex:1; min-width:230px; }
.inp.sm{ padding:6px 10px; font-size:12px; }
select.inp{ cursor:pointer; }
.resumo-filtro{ display:flex; justify-content:space-between; font-size:12px; color:var(--muted); margin-bottom:10px; padding:0 2px; }
.resumo-filtro b{ color:var(--ink); font-size:13px; }
.check{ display:flex; align-items:center; gap:7px; font-size:13px; color:var(--muted); cursor:pointer; }
.check.sm{ font-size:12px; }
/* a cor de preenchimento da ação, não a de link (idêntica no tema claro) */
.check input{ accent-color:var(--brand-solid); }

/* TABELAS */
.scroll-x{ overflow-x:auto; }
.tab{ width:100%; border-collapse:collapse; }
.tab thead th{ text-align:left; font-size:11px; font-weight:600; color:var(--muted); text-transform:uppercase;
  letter-spacing:.06em; padding:10px 14px; border-bottom:1px solid var(--border); background:var(--soft); }
.tab td{ padding:12px 14px; border-bottom:1px solid var(--divider); font-size:13px; vertical-align:middle; }
.tab tbody tr:last-child td{ border-bottom:none; }
.tab tbody tr:hover{ background:var(--hover); }
/* Trabalhos: grid de colunas estável + hierarquia por linha */
.tab-trab th:nth-child(2){ width:116px; } .tab-trab th:nth-child(3){ width:228px; }
.tab-trab th:nth-child(4){ width:48px; }
.tab-trab td.cel-data{ font-size:12px; color:var(--muted2); }
.tab-trab .status-sel{ width:100%; }
/* linha de metadados sob o título: tipo + local de publicação */
.titulo-meta{ display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-top:7px; }
.titulo-meta .onde-chip, .titulo-meta .onde-add, .titulo-meta .onde-inp{ margin-top:0; }
.titulo-meta .onde-inp{ flex:1; min-width:220px; }
.tab .mini.del{ width:28px; height:28px; padding:0; font-size:16px; line-height:1; display:inline-grid; place-items:center; border-color:transparent; }
.tab .r{ text-align:right; }
.muted{ color:var(--muted2); }
.nowrap{ white-space:nowrap; }
.cel-nome{ font-weight:600; }
.cel-tema{ font-size:11px; color:var(--muted2); margin-top:2px; max-width:330px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.cel-fac{ font-size:12px; color:var(--muted); max-width:200px; }
.cel-titulo{ font-size:13px; max-width:560px; line-height:1.45; }
.link-titulo{ background:transparent; border:none; padding:0; font:inherit; font-weight:600; color:var(--ink); text-align:left; cursor:pointer; line-height:1.45; text-decoration:none; display:inline; transition:color .14s ease; }
.link-titulo:hover{ text-decoration:underline; text-underline-offset:3px; color:var(--brand); }
.link-titulo:focus-visible{ box-shadow:var(--ring); outline:none; border-radius:3px; }
.onde-chip{ display:flex; width:fit-content; align-items:center; gap:5px; margin-top:7px; background:transparent; border:1px solid var(--border); border-radius:var(--r-full); padding:2px 9px; font-size:11px; color:var(--muted2); cursor:pointer; font-family:inherit; max-width:440px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; transition:border-color .14s ease, color .14s ease; }
.onde-chip:hover{ border-color:var(--border-strong); color:var(--ink); }
.onde-chip svg{ flex-shrink:0; opacity:.7; }
.onde-add{ display:block; margin-top:7px; background:transparent; border:none; padding:0; font-size:11px; color:var(--muted2); cursor:pointer; font-family:inherit; opacity:0; transition:opacity .14s ease; }
.tab tbody tr:hover .onde-add, .onde-add:focus-visible{ opacity:1; }
.onde-add:hover{ color:var(--brand); text-decoration:underline; }
.onde-inp{ display:block; margin-top:6px; width:100%; max-width:440px; border:1px solid var(--brand); background:var(--surface); border-radius:var(--r-sm); padding:3px 8px; font-size:12px; color:var(--ink); font-family:inherit; outline:none; }
.onde-inp:focus{ box-shadow:var(--ring); }
.cert-status{ display:flex; align-items:center; gap:12px; font-size:12px; }
.cert-status a{ color:var(--brand); font-weight:600; }
.cert-file{ position:relative; overflow:hidden; cursor:pointer; }
.cert-file input[type=file]{ position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%; }
.cert-lista{ list-style:none; display:flex; flex-direction:column; }
.cert-lista li{ display:flex; justify-content:space-between; align-items:center; gap:10px; padding:9px 6px; border-bottom:1px solid var(--divider); }
.cert-lista li:last-child{ border-bottom:none; }
.cert-nome{ font-size:13px; font-weight:600; color:var(--ink); }
.wa-btn{ background:#25D366 !important; color:#0B3B24 !important; font-weight:700; border:none; white-space:nowrap; text-decoration:none; }
.wa-btn:hover{ background:#1FB855 !important; }
.cert-sem-tel{ font-size:11px; color:var(--muted2); }
.cert-hint{ font-size:12px; color:var(--muted); line-height:1.5; }
.p-cpf{ font-size:11px; margin-top:2px; color:var(--muted2); font-variant-numeric:tabular-nums; }
.p-orcid{ font-size:11px; margin-top:2px; }
.p-orcid a{ color:var(--brand); text-decoration:none; }
.p-orcid a:hover{ text-decoration:underline; }
.uf-pill{ display:inline-block; min-width:30px; text-align:center; font-size:11px; font-weight:600; color:var(--muted);
  background:var(--soft); border:1px solid var(--border); padding:2px 7px; border-radius:var(--r-sm); }
/* badge de tipo: dot colorido (identidade) + texto neutro — metadado, não grito */
.tipo-pill{ display:inline-flex; align-items:center; gap:6px; font-size:11px; font-weight:500; padding:2px 9px 2px 8px;
  border-radius:var(--r-full); white-space:nowrap; color:var(--muted); background:var(--soft); border:1px solid var(--border); }
.tipo-pill::before{ content:""; width:6px; height:6px; border-radius:50%; background:var(--tc,var(--muted2)); flex-shrink:0; }
.row-click{ cursor:pointer; }
.acoes{ white-space:nowrap; text-align:right; }
.mini{ border:1px solid var(--border); background:var(--surface); color:var(--muted); font-size:11px; padding:4px 10px;
  border-radius:var(--r-sm); cursor:pointer; font-family:inherit; transition:background .14s ease, border-color .14s ease, color .14s ease; }
.mini:hover{ border-color:var(--border-strong); color:var(--ink); background:var(--hover); }
.mini:active{ background:var(--soft); }
.mini:focus-visible{ box-shadow:var(--ring); outline:none; }
.mini:disabled{ opacity:.55; cursor:not-allowed; }
.mini.del:hover{ border-color:var(--danger-border); color:var(--danger); background:var(--danger-soft); }
.mais{ padding:14px; text-align:center; border-top:1px solid var(--divider); }
.vazio{ padding:40px; text-align:center; color:var(--muted2); font-size:13px; }
.neg{ color:var(--danger); opacity:.9; }
.fin td{ font-size:12px; padding:9px 12px; }
.row-zero td{ opacity:.42; }
.row-total td{ background:var(--soft); font-weight:600; border-top:1px solid var(--border-strong); }
.fat-real{ font-size:10px; color:var(--brand); margin-top:2px; font-weight:600; }
.extra-desc{ font-size:10px; color:var(--muted2); font-weight:500; margin-top:2px; max-width:130px; margin-left:auto;
  overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.pos{ color:var(--ok); }
.negv{ color:var(--danger); }
/* Recharts nos dois temas */
.recharts-default-tooltip{ border-radius:10px !important; box-shadow:var(--shadow-2); }
.root.dark .recharts-cartesian-grid line{ stroke:rgba(255,255,255,.08); }
.root.dark .recharts-cartesian-axis-tick text{ fill:#8A8A8F; }
.root.dark .recharts-default-tooltip{ background:#1F1F21 !important; border:1px solid rgba(255,255,255,.12) !important; }
.root.dark .recharts-default-tooltip .recharts-tooltip-label,
.root.dark .recharts-default-tooltip .recharts-tooltip-item{ color:#F5F5F7 !important; }
.root.dark .recharts-tooltip-cursor{ fill:rgba(255,255,255,.05); }

/* BOTÕES */
.btn{ background:var(--brand-solid); color:#fff; border:none; padding:8px 14px; border-radius:var(--r-md); font-size:13px;
  font-weight:600; cursor:pointer; font-family:inherit; transition:background .14s ease, transform .08s ease; white-space:nowrap; }
.btn:hover{ background:var(--brand-solid-hover); }
.btn:active{ transform:translateY(1px); }
.btn:focus-visible{ box-shadow:var(--ring); outline:none; }
.btn:disabled{ opacity:.55; cursor:not-allowed; transform:none; }
.btn.sm{ padding:6px 12px; font-size:12px; }
.btn-ghost{ background:transparent; color:var(--muted); border:1px solid var(--border); padding:7px 12px; border-radius:var(--r-md);
  font-size:13px; font-weight:500; cursor:pointer; font-family:inherit; transition:background .14s ease, border-color .14s ease, color .14s ease; }
.btn-ghost:hover{ background:var(--hover); border-color:var(--border-strong); color:var(--ink); }
.btn-ghost:focus-visible{ box-shadow:var(--ring); outline:none; }
.btn-ghost:disabled{ opacity:.55; cursor:not-allowed; }
/* select de status: controle de verdade — dot de estado + chevron, hover e foco visíveis */
.status-sel{ appearance:none; border:1px solid color-mix(in srgb, var(--tc,#5D6D7D) 45%, transparent); background-color:var(--surface);
  background-image:radial-gradient(circle, var(--tc,var(--muted2)) 0 3px, transparent 3.5px), var(--sel-chevron);
  background-repeat:no-repeat; background-position:10px center, right 8px center; background-size:8px 8px, 12px 12px;
  border-radius:var(--r-md); padding:5px 26px 5px 24px; font-size:12px; font-weight:500;
  color:color-mix(in srgb, var(--tc,#5D6D7D) 45%, #17222E);
  cursor:pointer; font-family:inherit; outline:none; transition:border-color .14s ease, background-color .14s ease; }
.status-sel:hover{ border-color:color-mix(in srgb, var(--tc,#5D6D7D) 70%, transparent); background-color:var(--hover); }
.status-sel:focus-visible{ border-color:var(--brand); box-shadow:var(--ring); }
.root.dark .status-sel{ color:color-mix(in srgb, var(--tc,#8A8A8F) 55%, #F5F5F7); border-color:color-mix(in srgb, var(--tc,#8A8A8F) 55%, transparent); }
.root.dark .status-sel:hover{ border-color:color-mix(in srgb, var(--tc,#8A8A8F) 80%, transparent); }

/* MODAL */
.modal-bg{ position:fixed; inset:0; background:rgba(15,23,42,.45); display:grid; place-items:center; z-index:70; padding:20px;
  backdrop-filter:blur(4px); }
.root.dark .modal-bg{ background:rgba(0,0,0,.7); }
.modal{ background:var(--surface); border:1px solid var(--border); border-radius:var(--r-lg); width:100%; max-width:440px; max-height:90vh; overflow:auto;
  box-shadow:var(--shadow-3); animation:pop .16s cubic-bezier(.16,1,.3,1); }
@keyframes pop{ from{ opacity:0; transform:scale(.98) translateY(4px); } }
.modal-wide{ max-width:640px; }
.modal-head{ display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid var(--border);
  position:sticky; top:0; background:var(--surface); z-index:1; }
.modal-head h3{ font-size:15px; font-weight:600; }
.x{ background:none; border:none; font-size:22px; color:var(--muted2); cursor:pointer; line-height:1; }
.x:hover{ color:var(--ink); }
.modal-body{ padding:20px; }
.campo{ display:flex; flex-direction:column; gap:5px; margin-bottom:13px; }
.campo span{ font-size:11px; font-weight:600; color:var(--muted2); text-transform:uppercase; letter-spacing:.05em; }
/* resultado da conta digitada no campo (ex.: "+54" -> = R$ 226,10) */
.campo .campo-calc{ font-size:11px; font-weight:500; color:var(--brand); text-transform:none; letter-spacing:0; margin-top:2px; }
.campo .campo-calc b{ font-weight:700; }
.dica-conta{ margin:-2px 0 14px; line-height:1.5; }
/* "+" para acrescentar custo direto na tabela do fechamento */
.cel-custo{ white-space:nowrap; }
.add-custo{ border:1px solid var(--border); background:var(--surface); color:var(--muted2); width:19px; height:19px;
  border-radius:var(--r-sm); font-size:13px; line-height:1; cursor:pointer; font-family:inherit; padding:0;
  margin-left:6px; vertical-align:middle; opacity:0; transition:opacity .14s ease, border-color .14s ease, color .14s ease; }
.tab tbody tr:hover .add-custo, .add-custo:focus-visible{ opacity:1; }
.add-custo:hover{ border-color:var(--brand); color:var(--brand); background:var(--brand-soft); }
.add-custo:focus-visible{ box-shadow:var(--ring); outline:none; }
.pop-fundo{ position:fixed; inset:0; z-index:80; }
.pop-add{ position:fixed; z-index:81; transform:translateX(-100%); width:236px; display:flex; flex-direction:column; gap:7px;
  background:var(--surface); border:1px solid var(--border); border-radius:var(--r-lg); padding:12px 13px; box-shadow:var(--shadow-3);
  animation:pop .16s cubic-bezier(.16,1,.3,1); }
.pop-tit{ font-size:11px; font-weight:600; color:var(--muted2); text-transform:uppercase; letter-spacing:.05em; line-height:1.35; }
.pop-atual{ font-size:12px; color:var(--muted); margin-top:-3px; }
.pop-atual b{ color:var(--ink); font-variant-numeric:tabular-nums; }
.pop-preview{ font-size:12px; color:var(--brand); font-weight:500; }
.pop-preview b{ font-weight:700; font-variant-numeric:tabular-nums; }
.pop-acoes{ display:flex; justify-content:flex-end; gap:8px; margin-top:2px; }
/* detalhamento do custo: uma linha por item, como as linhas de uma planilha */
.itens-cel{ list-style:none; display:flex; flex-direction:column; gap:2px; margin-top:5px; text-align:right; }
.itens-cel li{ display:flex; align-items:center; justify-content:flex-end; gap:7px; font-size:10px; line-height:1.35;
  color:var(--muted2); font-weight:500; }
.ic-val{ font-variant-numeric:tabular-nums; color:var(--muted); flex-shrink:0; }
.ic-desc{ max-width:118px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:left; flex:1; }
.ic-x{ border:none; background:transparent; color:var(--muted2); font-size:12px; line-height:1; cursor:pointer;
  padding:0 1px; opacity:0; transition:opacity .14s ease, color .14s ease; flex-shrink:0; }
.tab tbody tr:hover .ic-x, .ic-x:focus-visible{ opacity:1; }
.ic-x:hover{ color:var(--danger); }
.ic-legado{ font-style:italic; opacity:.75; max-width:160px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; display:block; }
.ic-fixo{ color:var(--brand); font-weight:700; }
.pop-rep{ font-size:11px; color:var(--muted); }
/* filtro de período em Vendas: chips rápidos + um dia específico */
/* tema da venda: linka para o trabalho sem virar um azulão na tabela inteira */
.link-tema{ color:inherit; text-decoration:none; }
.link-tema:hover{ color:var(--brand); text-decoration:underline; text-underline-offset:2px; }
.link-tema:focus-visible{ box-shadow:var(--ring); outline:none; border-radius:3px; }
.chip-dia{ display:inline-flex; align-items:center; gap:8px; height:32px; padding:0 12px 0 13px;
  border:1px solid var(--border); background:var(--surface); border-radius:var(--r-full);
  font-size:12px; color:var(--muted); }
.chip-dia input[type=date]{ border:none; background:transparent; padding:0; font-size:12px; color:var(--ink);
  font-family:inherit; outline:none; }
.chip-dia input[type=date]:focus-visible{ box-shadow:var(--ring); border-radius:var(--r-sm); }
.root.dark .chip-dia input[type=date]::-webkit-calendar-picker-indicator{ filter:invert(.7); }
.status-filtros .mini{ align-self:center; }
.form-grid{ display:grid; grid-template-columns:1fr 1fr; gap:13px; }
.form-grid .campo{ margin-bottom:0; }
.form-grid-taxa{ margin-bottom:13px; }
.form-dica{ align-self:center; font-size:11px; color:var(--muted2); line-height:1.45; }
.form-acoes{ display:flex; justify-content:flex-end; gap:10px; margin-top:20px; }
.resumo-mes{ display:flex; gap:24px; margin-top:16px; padding:12px 14px; background:var(--soft); border-radius:var(--r-md); border:1px solid var(--border); }
.resumo-mes div{ display:flex; flex-direction:column; gap:3px; }
.resumo-mes span{ font-size:11px; color:var(--muted2); text-transform:uppercase; font-weight:600; letter-spacing:.05em; }
.resumo-mes b{ font-size:18px; letter-spacing:-.01em; }

/* CLIENTE DETALHE */
.cli-info{ display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:18px; padding:12px 14px;
  background:var(--soft); border-radius:var(--r-md); border:1px solid var(--border); }
.cli-info > div{ display:flex; flex-direction:column; gap:3px; font-size:13px; }
.ci-lab{ font-size:11px; color:var(--muted2); text-transform:uppercase; font-weight:600; letter-spacing:.05em; }
/* nome do cliente na lista de vendas: abre a ficha, sem virar um azulão na tabela */
.link-cliente{ background:transparent; border:none; padding:0; font:inherit; font-weight:600; color:var(--ink);
  text-align:left; cursor:pointer; }
.link-cliente:hover{ color:var(--brand); text-decoration:underline; text-underline-offset:3px; }
.link-cliente:focus-visible{ box-shadow:var(--ring); outline:none; border-radius:3px; }
.sub-h{ font-size:13px; font-weight:600; color:var(--muted); margin-bottom:8px; }

/* PUBLICAÇÕES — badge de vagas é o código primário de ocupação (única codificação) */
.vagas-badge{ font-size:11px; font-weight:600; padding:3px 9px; border-radius:var(--r-full); white-space:nowrap; flex-shrink:0; }
.b-ok{ background:var(--ok-soft); color:var(--ok); }
.b-quase{ background:var(--warn-soft); color:var(--warn); }
.b-cheio{ background:var(--danger-soft); color:var(--danger); }
.b-fechada{ background:var(--soft); color:var(--muted2); border:1px solid var(--border); }
/* fechar / reabrir vendas da publicação */
.dp-fechada{ display:flex; align-items:center; gap:9px; flex-wrap:wrap; font-size:12px; color:var(--muted); }
.dp-fechada b{ color:var(--ink); }
.dp-fechada-txt{ font-size:12px; color:var(--muted); }
.fechar-pub:hover{ border-color:var(--warn); color:var(--warn); background:var(--warn-soft); }
.pub-grad{ margin:4px 0 2px; }
.max-inp{ width:64px; border:1px solid var(--border); border-radius:var(--r-sm); padding:5px 8px; font-size:12px;
  font-family:inherit; color:var(--ink); background:var(--surface); outline:none; transition:border-color .14s ease; }
.max-inp.wide{ width:150px; }
.max-inp:hover{ border-color:var(--border-strong); }
.max-inp:focus{ border-color:var(--brand); box-shadow:var(--ring); }
/* participantes em linhas planas: divisor hairline, ações reveladas no hover */
.parts{ list-style:none; display:flex; flex-direction:column; }
.parts li{ display:flex; justify-content:space-between; align-items:flex-start; gap:10px; padding:10px 6px;
  border-bottom:1px solid var(--divider); border-radius:var(--r-sm); transition:background .14s ease; }
.parts li:last-child{ border-bottom:none; }
.parts li:hover{ background:var(--hover); }
.p-acoes .mini{ opacity:0; transition:opacity .14s ease; }
.parts li:hover .p-acoes .mini, .p-acoes .mini:focus-visible{ opacity:1; }
.p-nome{ font-size:13px; font-weight:600; }
.p-fac{ font-size:11px; color:var(--muted2); margin-top:2px; }
.p-vazio{ justify-content:center; color:var(--muted2); font-size:12px; padding:14px 6px; }
/* marcações: pílula contornada, cada uma com a sua cor (laranja = autor, azul = graduado) */
.tag-autor{ font-size:11px; font-weight:500; background:rgba(232,163,61,.14); color:#B4610F;
  border:1px solid rgba(232,163,61,.45); padding:2px 9px; border-radius:999px; white-space:nowrap; }
.root.dark .tag-autor{ color:#E8A33D; }
.root.dark .tag-grad{ color:#8CC9EE; }
.tag-grad{ font-size:11px; font-weight:500; background:rgba(59,158,222,.14); color:#1E5F82;
  border:1px solid rgba(59,158,222,.45); padding:2px 9px; border-radius:999px; white-space:nowrap; }
/* PERIODO BAR */
.periodo-bar{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; background:var(--surface);
  border:1px solid var(--border); border-radius:var(--r-lg); padding:10px 14px; margin-bottom:16px; }
.periodo-lab{ font-size:11px; font-weight:600; color:var(--muted2); text-transform:uppercase; letter-spacing:.06em; }
.periodo-bar .inp{ padding:7px 11px; font-size:13px; }
/* select precisa manter o espaço à direita do chevron, senão a seta some sob o texto */
.periodo-bar select.inp{ padding-right:30px; }

/* PUBLICACOES: lista + painel de detalhe */
.pub-split{ display:grid; grid-template-columns:330px 1fr; gap:16px; align-items:start; }
/* precisa vencer o .card.no-pad{overflow:hidden}, senão a lista corta em vez de rolar */
.pub-lista.card.no-pad{ max-height:calc(100vh - 240px); overflow-y:auto; overscroll-behavior:contain; }
/* ── PAINEL DA PUBLICAÇÃO ──────────────────────────────────────── */
.dp-chips{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:12px; }
.dp-chip{ font-size:11px; font-weight:500; padding:2px 9px; border-radius:var(--r-full); white-space:nowrap;
  color:var(--muted); background:var(--soft); border:1px solid var(--border); }
.dp-chip.status{ color:var(--tc); border-color:color-mix(in srgb, var(--tc) 40%, transparent);
  background:color-mix(in srgb, var(--tc) 14%, transparent); }
.dp-chip.fechada{ color:var(--muted2); }
.dp-titulo{ font-size:19px; font-weight:700; letter-spacing:-.01em; line-height:1.32; color:var(--ink); }
.dp-titulo .dp-edit-nome{ margin-left:10px; vertical-align:middle; opacity:0; transition:opacity .14s ease; }
.dp-titulo:hover .dp-edit-nome, .dp-edit-nome:focus-visible{ opacity:1; }
.dp-contexto{ font-size:12px; color:var(--muted2); margin-top:7px; }

.dp-kpis{ display:flex; gap:38px; flex-wrap:wrap; margin:20px 0 4px; }
.dp-kpi{ display:flex; flex-direction:column; gap:5px; min-width:120px; }
.dp-kpi-lab{ font-size:11px; color:var(--muted2); }
.dp-kpi-val{ font-size:19px; font-weight:600; color:var(--ink); letter-spacing:-.01em; }
/* a taxa é um atalho: mesma aparência dos outros números, com a ação no hover */
.dp-kpi-btn{ background:transparent; border:none; padding:0; text-align:left; font-family:inherit; cursor:pointer;
  border-radius:var(--r-sm); }
.dp-kpi-btn:hover .dp-kpi-val{ color:var(--brand); }
.dp-kpi-btn:focus-visible{ box-shadow:var(--ring); outline:none; }
.dp-kpi-edit{ font-size:11px; font-weight:500; color:var(--brand); margin-left:8px; opacity:0; transition:opacity .14s ease; }
.dp-kpi-btn:hover .dp-kpi-edit, .dp-kpi-btn:focus-visible .dp-kpi-edit{ opacity:1; }
.dp-kpi-val.pos{ color:var(--ok); }
.dp-kpi-val.negv{ color:var(--danger); }
.dp-kpi-livres{ font-size:11px; font-weight:500; font-style:normal; color:var(--brand); margin-left:8px; }
.dp-vagas-barra{ display:flex; gap:4px; margin-top:3px; }
.dp-vagas-barra i{ width:22px; height:3px; border-radius:2px; background:var(--track); }
.dp-vagas-barra i.cheia{ background:var(--brand-solid); }

.dp-abas{ display:flex; gap:22px; border-bottom:1px solid var(--divider); margin:22px 0 18px; }
.dp-aba{ background:transparent; border:none; padding:0 0 10px; font-size:13px; font-family:inherit; cursor:pointer;
  color:var(--muted2); border-bottom:2px solid transparent; margin-bottom:-1px; transition:color .12s, border-color .12s; }
.dp-aba:hover{ color:var(--ink); }
.dp-aba.ativo{ color:var(--ink); font-weight:600; border-bottom-color:var(--ink); }
.dp-aba:focus-visible{ box-shadow:var(--ring); outline:none; border-radius:var(--r-sm); }

.dp-barra{ display:flex; align-items:flex-start; justify-content:space-between; gap:16px; flex-wrap:wrap; margin-bottom:14px; }
.dp-barra-txt{ font-size:12px; color:var(--muted); }
.dp-barra-acoes{ display:flex; align-items:center; gap:10px; margin-left:auto; }
.dp-lotado-inline{ font-size:12px; color:var(--muted2); }
/* tabela de participantes/certificados: caixa fechada, com a nota como última linha */
.dp-tabela-box{ overflow:hidden; }
.dp-tabela .p-nome{ font-weight:600; color:var(--ink); font-size:13px; }
.dp-tabela .p-fac{ font-size:11px; color:var(--brand); margin-top:3px; font-weight:400; }
.dp-tabela .p-orcid{ font-size:11px; margin-top:2px; }
/* azul é reservado a link/acento: o e-mail fica azul, a faculdade é texto comum */
.dp-tabela td.dp-fac{ color:var(--muted); }
.dp-tabela td.p-valor{ color:var(--ink); font-weight:500; }
.dp-marcas{ display:inline-flex; gap:6px; flex-wrap:wrap; }
/* as ações não estão no desenho: aparecem só ao passar o mouse na linha */
.dp-tabela td.dp-acoes{ white-space:nowrap; }
.dp-tabela td.dp-acoes > *{ opacity:0; transition:opacity .14s ease; }
.dp-tabela tbody tr:hover td.dp-acoes > *,
.dp-tabela td.dp-acoes > *:focus-visible{ opacity:1; }
.dp-rodape-nota{ font-size:12px; color:var(--muted2); padding:12px 14px; border-top:1px solid var(--divider); }

.dp-dados{ display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:18px 20px; }
.dp-campo{ display:flex; flex-direction:column; gap:6px; min-width:0; }
.dp-campo.full{ grid-column:1 / -1; }
.dp-cert-tit{ font-size:13px; font-weight:600; color:var(--ink); }
.dp-cert-txt{ font-size:12px; color:var(--muted2); line-height:1.5; margin-top:4px; max-width:520px; }
.cert-pendente{ font-size:12px; color:var(--warn); }
.cert-pronto{ font-size:12px; color:var(--ok); }
@media (max-width:1100px){ .dp-dados{ grid-template-columns:repeat(2, minmax(0,1fr)); } }
@media (max-width:700px){ .dp-dados{ grid-template-columns:1fr; } .dp-kpis{ gap:22px; } }

/* filtros por situação da publicação */
.sit-bar{ display:flex; align-items:center; gap:7px; flex-wrap:wrap; margin:-4px 0 14px; }
.sit-chip{ display:inline-flex; align-items:center; gap:6px; padding:5px 11px; font-size:12px; font-weight:500;
  color:var(--muted); background:var(--surface); border:1px solid var(--border); border-radius:var(--r-full);
  cursor:pointer; font-family:inherit; transition:background .12s, border-color .12s, color .12s; }
.sit-chip:hover{ color:var(--ink); border-color:var(--brand); }
.sit-chip.ativo{ background:var(--brand); border-color:var(--brand); color:#fff; font-weight:600; }
.sit-chip:focus-visible{ box-shadow:var(--ring); outline:none; }
.sit-num{ font-size:11px; font-variant-numeric:tabular-nums; opacity:.7; }
.sit-chip.ativo .sit-num{ opacity:.85; }
.sit-aviso{ font-size:11px; color:var(--muted2); font-style:italic; }
/* data de abertura no item da lista */
.pub-item-data{ font-size:11px; color:var(--muted2); }
.pub-item-data.hoje{ color:var(--ok); font-weight:600; }
.pub-item-data.futura{ color:var(--muted2); font-style:italic; }
.pub-item{ display:block; width:100%; text-align:left; background:transparent; border:none; border-bottom:1px solid var(--divider);
  padding:12px 14px; cursor:pointer; font-family:inherit; transition:.12s; text-decoration:none; color:inherit; box-sizing:border-box; }
.pub-item:hover{ background:var(--hover); }
.pub-item.ativo{ background:var(--brand-soft); box-shadow:inset 2px 0 0 var(--brand); }
.pub-item-top{ display:flex; justify-content:space-between; gap:8px; align-items:flex-start; }
.pub-item-nome{ font-size:13px; font-weight:600; line-height:1.35; color:var(--ink); }
.pub-item-meta{ display:flex; align-items:center; gap:8px; margin-top:7px; }
.pub-item-ocup{ font-size:11px; color:var(--muted2); }

.pub-detalhe{ min-height:320px; }
.pub-vazio-det{ display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; min-height:300px;
  color:var(--muted2); text-align:center; font-size:13px; padding:30px; line-height:1.5; }
.pub-vazio-ic{ width:56px; height:56px; border-radius:var(--r-lg); background:var(--track); display:grid; place-items:center; font-size:26px; color:var(--brand); }
/* painel estilo Notion: título dominante, meta sob ele, propriedades planas, seções por divisor */
.dp-head{ display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
.dp-nome{ font-size:16px; font-weight:600; line-height:1.35; letter-spacing:-.01em; }
.dp-edit-nome{ vertical-align:middle; margin-left:8px; font-weight:600; opacity:0; transition:opacity .14s ease; }
.dp-head:hover .dp-edit-nome, .dp-edit-nome:focus-visible{ opacity:1; }
.dp-nome-edit{ display:flex; gap:8px; align-items:center; flex:1; flex-wrap:wrap; }
.dp-nome-edit .inp{ flex:1; min-width:220px; font-size:15px; font-weight:600; }
.dp-meta{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-top:9px; }
.dp-meta-txt{ font-size:12px; color:var(--muted); }
/* financeiro plano: o Lucro é o número — faturamento e taxa recuam */
.dp-fin{ display:flex; align-items:flex-end; gap:36px; padding:16px 2px; margin:16px 0 6px;
  border-top:1px solid var(--divider); border-bottom:1px solid var(--divider); }
.dp-fin-lucro{ display:flex; flex-direction:column; gap:4px; }
.dp-fin-lucro span{ font-size:11px; font-weight:600; color:var(--muted2); text-transform:uppercase; letter-spacing:.06em; }
.dp-fin-lucro b{ font-size:24px; font-weight:600; letter-spacing:-.02em; line-height:1.1; }
.dp-fin-item{ display:flex; flex-direction:column; gap:4px; padding-bottom:2px; }
.dp-fin-item span{ font-size:11px; font-weight:600; color:var(--muted2); text-transform:uppercase; letter-spacing:.06em; }
.dp-fin-item b{ font-size:14px; font-weight:600; color:var(--muted); letter-spacing:-.01em; }
/* propriedades: rótulo em coluna fixa à esquerda, controle à direita — 2 colunas p/ compactar */
.dp-props{ display:grid; grid-template-columns:1fr 1fr; gap:0 28px; margin:6px 0 4px; }
.dp-prop{ display:flex; align-items:center; gap:12px; min-height:34px; }
.dp-prop.full{ grid-column:1 / -1; }
.dp-prop-lab{ width:132px; flex-shrink:0; font-size:12px; color:var(--muted2); }
.dp-prop .inp{ background:var(--surface); }
.dp-prop-flex{ flex:1; max-width:430px; }
.dp-taxa-form{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.dp-taxa-val{ max-width:100px; }
.dp-taxa-ok{ font-size:12px; color:var(--ok); font-weight:600; }
.dp-taxa-hint{ flex-basis:100%; margin-top:-2px; }
.dp-sub{ font-size:11px; font-weight:600; color:var(--muted2); text-transform:uppercase; letter-spacing:.06em; }
.dp-sec-head{ display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;
  margin:22px 0 6px; padding-top:16px; border-top:1px solid var(--divider); }
.copiar-btn{ white-space:nowrap; }
.dp-lotado{ font-size:12px; color:var(--danger); background:var(--danger-soft); border:1px solid var(--danger-border); border-radius:var(--r-md); padding:10px 13px; margin-top:11px; }
.dp-footer{ display:flex; justify-content:flex-end; margin-top:22px; padding-top:14px; border-top:1px solid var(--divider); }
.p-acoes{ display:flex; gap:6px; align-items:center; flex-shrink:0; }
.mov-dot{ display:inline-block; width:20px; font-weight:700; }
.mov-dot.entrada{ color:var(--ok); }
.mov-dot.saida{ color:var(--danger); }
.mov-val{ font-weight:600; }
.mov-val.entrada{ color:var(--ok); }
.mov-val.saida{ color:var(--danger); }
.mov-mais{ padding:11px 16px; font-size:12px; color:var(--muted); border-top:1px solid var(--divider); }
.cmp-pick{ display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:4px; }
.cmp-pick .inp{ max-width:170px; }
.cmp-vs{ color:var(--muted2); font-weight:600; }
.vazio.pad{ padding:18px 4px; }
.p-valor{ font-weight:600; color:var(--ink); margin-right:6px; white-space:nowrap; }
.aviso-grad{ font-size:12px; color:var(--warn); background:var(--warn-soft); border:1px solid var(--warn-border); border-radius:var(--r-md); padding:10px 13px; margin-bottom:12px; }
.aviso-grad.erro{ color:var(--danger); background:var(--danger-soft); border-color:var(--danger-border); font-weight:600; }
.fatura-auto{ background:var(--soft); border:1px solid var(--border); border-radius:var(--r-md); padding:11px 13px; margin-bottom:14px; font-size:13px; color:var(--ink); }
.fatura-auto b{ font-size:15px; }

/* FORM PARTICIPANTE (com venda) */
.form-part{ margin-bottom:16px; padding:16px; background:transparent; border:1px solid var(--border); border-radius:var(--r-md); }
.form-part .inp{ background:var(--surface); }
/* 4 colunas: nome, faculdade, email, telefone na 1a linha; CPF, orcid, valor e data na 2a */
.fp-grid{ display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:10px; }
.fp-grid .inp{ width:100%; }
.fp-opts{ display:flex; flex-wrap:wrap; align-items:center; gap:18px; margin-top:14px; }
.fp-opts .btn{ margin-left:auto; }
.fp-reconhecida{ font-size:12px; font-weight:600; color:var(--ok); margin-top:9px; }
@media (max-width:1100px){ .fp-grid{ grid-template-columns:repeat(2, minmax(0,1fr)); } }
@media (max-width:640px){ .fp-grid{ grid-template-columns:1fr; } }

/* PLANEJAMENTO — calendário editorial */
.meta-bar{ display:flex; flex-direction:column; gap:10px; }
.meta-txt{ display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
.meta-txt .dp-sub{ margin:0; }
.meta-txt span:last-child{ font-size:12px; font-weight:600; margin-left:auto; }
.meta-leg{ display:inline-flex; align-items:center; gap:6px; font-size:12px; color:var(--muted); font-variant-numeric:tabular-nums; }
.meta-key{ width:9px; height:9px; border-radius:3px; flex-shrink:0; }
.meta-key.real{ background:var(--ok); }
.meta-key.proj{ background:color-mix(in srgb, var(--brand) 34%, transparent); }
.meta-track{ position:relative; height:8px; background:var(--track); border-radius:var(--r-full); overflow:hidden; }
.meta-fill{ position:absolute; left:0; top:0; height:100%; border-radius:var(--r-full); transition:width .4s; }
.meta-fill.proj{ background:color-mix(in srgb, var(--brand) 34%, transparent); }
.meta-fill.real{ background:var(--ok); }
.cal-split{ display:grid; grid-template-columns:minmax(0,1.15fr) minmax(0,1fr); gap:16px; align-items:start; }
.cal-grid{ display:grid; grid-template-columns:repeat(7,1fr); gap:6px; }
.cal-dow{ font-size:11px; font-weight:600; color:var(--muted2); text-transform:uppercase; letter-spacing:.06em;
  text-align:center; padding-bottom:4px; }
.cal-cel{ min-height:76px; border:1px solid var(--divider); border-radius:var(--r-md); padding:7px 8px;
  background:var(--surface); display:flex; flex-direction:column; gap:3px; text-align:left; font-family:inherit; }
.cal-cel.vazia{ border-color:transparent; background:transparent; }
.cal-num{ font-size:12px; font-weight:600; color:var(--muted2); font-variant-numeric:tabular-nums; }
.cal-cel.tem{ cursor:pointer; transition:border-color .14s ease, background .14s ease, transform .08s ease; }
.cal-cel.tem:active{ transform:translateY(1px); }
.cal-cel.tem:focus-visible{ box-shadow:var(--ring); outline:none; }
/* já aberto no sistema: card na cor do tipo de trabalho */
.cal-cel.tem.aberto{ border-color:color-mix(in srgb, var(--tc,#5D6D7D) 34%, transparent);
  background:color-mix(in srgb, var(--tc,#5D6D7D) 7%, var(--surface)); }
.cal-cel.tem.aberto .cal-num{ color:var(--ink); }
.cal-cel.tem.aberto:hover{ border-color:color-mix(in srgb, var(--tc,#5D6D7D) 62%, transparent); }
.cal-cel.tem.aberto.sel{ border-color:var(--tc,var(--brand)); box-shadow:inset 0 0 0 1px var(--tc,var(--brand)); }
/* nenhum tema aberto ainda: neutro, só o cronograma */
.cal-cel.tem.neutro{ border-color:var(--border); background:var(--soft); }
.cal-cel.tem.neutro .cal-num{ color:var(--muted2); }
.cal-cel.tem.neutro .cal-prod{ color:var(--muted); font-weight:500; }
.cal-cel.tem.neutro:hover{ border-color:var(--border-strong); background:var(--hover); }
.cal-cel.tem.neutro.sel{ border-color:var(--border-strong); box-shadow:inset 0 0 0 1px var(--border-strong); }
.cal-cel.tem.neutro::after{ background:var(--muted2); }
.cal-cel.hoje .cal-num{ color:var(--brand); }
.cal-cel.hoje .cal-num::after{ content:" · hoje"; font-size:9px; font-weight:600; text-transform:uppercase; letter-spacing:.04em; }
.cal-prod{ font-size:11px; font-weight:600; line-height:1.25; color:color-mix(in srgb, var(--tc,#5D6D7D) 55%, var(--ink)); }
.cal-info{ font-size:10px; color:var(--muted2); line-height:1.3; margin-top:auto; font-variant-numeric:tabular-nums; }
.cal-info.pendente{ font-style:italic; }
.cal-det-head{ display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
.cal-det-acoes{ display:flex; flex-direction:column; align-items:flex-end; gap:8px; flex-shrink:0; }
/* dia sem lançamento: clicável, para pendurar um trabalho avulso */
.cal-cel.livre{ background:transparent; border:1px dashed var(--divider); font-family:inherit; cursor:pointer;
  position:relative; text-align:left; transition:border-color .12s, background .12s; }
.cal-cel.livre:hover{ border-color:var(--brand); background:color-mix(in srgb, var(--brand) 5%, transparent); }
.cal-cel.livre .cal-mais{ position:absolute; right:8px; bottom:6px; font-size:15px; color:var(--muted2); opacity:0; transition:opacity .12s; }
.cal-cel.livre:hover .cal-mais{ opacity:1; }
.cal-cel.livre.sel{ border-style:solid; border-color:var(--brand); }
/* cada TIPO de trabalho do dia vira um bloco próprio, com a cor do tipo na borda */
/* fundo NEUTRO de propósito: a cor do tipo fica só na borda e no cabeçalho, senão ela
   cobriria o verde que marca "tema já aberto" e os dois estados ficariam iguais */
.cal-grupo{ border:1px solid var(--border); border-left:3px solid var(--tc); border-radius:var(--r-md);
  margin-bottom:12px; overflow:hidden; background:transparent; }
.cal-grupo:last-of-type{ margin-bottom:0; }
.cal-grupo-head{ display:flex; align-items:center; gap:9px; flex-wrap:wrap; padding:9px 12px;
  border-bottom:1px solid var(--divider); background:color-mix(in srgb, var(--tc) 6%, transparent); }
.cal-grupo-meta{ font-size:11px; color:var(--muted); }
.cal-grupo-tag{ margin-left:auto; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.05em;
  color:var(--muted2); background:var(--soft); border:1px solid var(--border); border-radius:var(--r-full); padding:2px 8px; }
.cal-grupo-tag.avulso{ color:var(--accent); border-color:color-mix(in srgb, var(--accent) 40%, transparent); }
.cal-grupo .cal-temas li{ padding-left:12px; }
.cal-grupo .cal-temas li:last-child{ border-bottom:none; }
.cal-tema-topo{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
.tirar-tema{ font-size:10px; padding:2px 8px; opacity:0; transition:opacity .14s ease; }
.cal-temas li:hover .tirar-tema, .tirar-tema:focus-visible{ opacity:1; }
.tirar-tema:hover{ border-color:var(--danger-border); color:var(--danger); background:var(--danger-soft); }
.cal-det-tit{ font-size:16px; font-weight:600; letter-spacing:-.01em; margin-top:3px; }
.cal-veiculo{ font-size:12px; color:var(--muted); margin-top:6px; }
/* comparação realizado × planejado do lançamento */
.cal-cmp{ margin:16px 0 6px; border-top:1px solid var(--divider); border-bottom:1px solid var(--divider); padding:6px 0; }
.cal-cmp-row{ display:grid; grid-template-columns:1fr auto auto; gap:10px 20px; align-items:baseline; padding:6px 2px; }
.cal-cmp-row span:first-child{ font-size:12px; color:var(--muted); }
.cal-cmp-row b{ font-size:14px; font-weight:600; text-align:right; min-width:104px; font-variant-numeric:tabular-nums; }
.cal-cmp-row b.prev{ color:var(--muted2); font-weight:500; }
.cal-cmp-row.cab{ padding-bottom:2px; }
.cal-cmp-row.cab span{ font-size:10px; font-weight:600; color:var(--muted2); text-transform:uppercase; letter-spacing:.06em; text-align:right; min-width:104px; }
.cal-cmp-row.lucro{ border-top:1px solid var(--divider); margin-top:2px; padding-top:9px; }
.cal-cmp-row.lucro span:first-child{ color:var(--ink); font-weight:600; }
.cal-cmp-row.lucro b{ font-size:18px; letter-spacing:-.01em; }

/* temas: aberto no sistema = verde; ainda não aberto = neutro apagado */
.cal-temas{ list-style:none; display:flex; flex-direction:column; }
.cal-temas li{ padding:11px 6px 11px 12px; border-bottom:1px solid var(--divider); border-left:2px solid transparent; }
.cal-temas li:last-child{ border-bottom:none; }
/* aberta = já existe publicação vendendo · fechada = ainda não aberta no sistema.
   A diferença precisa saltar aos olhos: é o que diz o que ainda falta fazer no dia. */
.cal-temas li.aberta{ border-left-color:var(--ok); background:color-mix(in srgb, var(--ok) 9%, transparent); }
.cal-temas li.fechada{ border-left:2px dashed var(--border); background:transparent; }
.cal-temas li.fechada .cal-tema-tit{ color:var(--muted); font-weight:500; }
.cal-tema-areas{ font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.05em; margin-bottom:4px; }
.cal-temas li.aberta .cal-tema-areas{ color:var(--ok); }
.cal-temas li.fechada .cal-tema-areas{ color:var(--muted2); opacity:.8; }
.cal-tema-tit{ font-size:13px; font-weight:600; color:var(--ink); line-height:1.4; display:block; }
.cal-tema-acao{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-top:5px; }
.cal-tema-acao .cal-tema-st{ margin-top:0; }
.form-nota{ font-size:12px; color:var(--muted); line-height:1.5; background:var(--soft); border:1px solid var(--border);
  border-radius:var(--r-md); padding:9px 12px; margin-bottom:14px; }
.ta-tema{ width:100%; resize:vertical; line-height:1.45; font-family:inherit; }
.criar-pub{ margin-left:auto; white-space:nowrap; }
.criar-pub:hover:not(:disabled){ border-color:var(--brand); color:var(--brand); background:var(--brand-soft); }
.cal-temas .link-titulo{ font-size:13px; line-height:1.4; }
.cal-tema-st{ display:block; font-size:11px; color:var(--muted2); margin-top:4px; }
.cal-tema-st.ok{ color:var(--ok); font-weight:600; }
.cal-tema-st.cadastro{ color:var(--muted2); font-style:italic; margin-top:2px; }
.cal-nota{ border-top:none; margin-top:4px; }
/* gerador de mensagem de vendas */
.msg-ta{ width:100%; resize:vertical; line-height:1.5; font-family:inherit; font-size:13px; white-space:pre-wrap; margin-top:10px; }
.msg-grupos{ display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px; }
.msg-grupos .mini.ativo{ border-color:var(--brand); color:var(--brand); background:var(--soft); }
.msg-hint{ display:block; }
.msg-nota{ margin-top:8px; border-top:none; padding-top:0; }
/* temas tirados do dia — ficam discretos, só para poder devolver ao cronograma */
.cal-tirados{ margin-top:12px; border-top:1px dashed var(--divider); padding-top:10px; }
.cal-tirados ul{ list-style:none; display:flex; flex-direction:column; gap:6px; margin-top:7px; }
.cal-tirados li{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
.cal-tirado-tit{ font-size:12px; color:var(--muted2); line-height:1.4; text-decoration:line-through; }
/* TARJA DE AMBIENTE — qual banco o painel está usando */
.tarja-amb{ position:fixed; top:0; left:0; right:0; z-index:70; min-height:30px; display:flex; align-items:center;
  justify-content:center; gap:7px; padding:5px 14px; text-align:center; font-size:12px; font-weight:600; letter-spacing:.02em; }
.tarja-amb code{ font-weight:500; font-size:11px; background:rgba(0,0,0,.2); border-radius:5px; padding:1px 6px; }
.tarja-conf{ font-weight:500; opacity:.8; }
.tarja-amb.teste{ background:#12694A; color:#E6FBF2; }
.tarja-amb.real{ background:#A81F27; color:#FFEDED; }
.root.com-tarja{ padding-top:30px; }
.root.com-tarja .side{ top:30px; height:calc(100vh - 30px); }
.plano-somente-leitura{ border-top:none; margin:0 0 14px; }
.plano-somente-leitura code{ font-size:11px; background:var(--soft); border:1px solid var(--border);
  border-radius:var(--r-sm); padding:1px 5px; }

/* LOADING / TOAST */
.loading{ display:grid; place-items:center; min-height:100vh; gap:14px; color:var(--muted); font-size:13px;
  font-family:"Inter",system-ui,sans-serif; background:var(--bg); }
.spin{ width:34px; height:34px; border:3px solid var(--track); border-top-color:var(--brand); border-radius:50%; animation:sp 1s linear infinite; }
@keyframes sp{ to{ transform:rotate(360deg); } }
.toast{ position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:#17222E; color:#fff;
  padding:10px 18px; border-radius:var(--r-md); font-size:13px; font-weight:500; z-index:90; box-shadow:var(--shadow-3);
  animation:up .2s ease; }
.toast.erro{ background:var(--danger); }
.root.dark .toast{ background:#1F1F21; color:#F5F5F7; border:1px solid rgba(255,255,255,.12); }
.root.dark .toast.erro{ background:#5E2E2C; }
@keyframes up{ from{ opacity:0; transform:translate(-50%,8px); } }

/* ============ PRIMITIVOS DO SISTEMA ============ */
/* filter-chips (Trabalhos): filtro parece filtro, não estatística */
.status-filtros{ display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px; }
.chip-filtro{ display:inline-flex; align-items:center; gap:8px; height:32px; padding:0 12px;
  border:1px solid var(--border); background:var(--surface); border-radius:var(--r-full);
  font-size:12px; font-weight:500; color:var(--muted); cursor:pointer; font-family:inherit;
  transition:border-color .14s ease, background .14s ease, color .14s ease; }
.chip-filtro b{ font-weight:600; font-size:12px; color:var(--ink); font-variant-numeric:tabular-nums; }
.cf-dot{ width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.chip-filtro:hover{ border-color:var(--border-strong); background:var(--hover); }
.chip-filtro:focus-visible{ box-shadow:var(--ring); outline:none; }
.chip-filtro.ativo{ background:var(--brand-soft); border-color:var(--brand); color:var(--brand); }
.chip-filtro.ativo b{ color:inherit; }
.chip-filtro.ativo::after{ content:"×"; font-size:13px; line-height:1; opacity:.65; margin-left:-2px; }
/* busca com ícone */
.busca-wrap{ position:relative; flex:1; min-width:230px; display:flex; }
.busca-wrap .inp.busca{ width:100%; padding-left:32px; min-width:0; }
.busca-ic{ position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--muted2); pointer-events:none; display:flex; }
.sel-ordem{ margin-left:auto; }
/* skeleton de carregamento */
.skel{ background:linear-gradient(90deg, var(--soft) 25%, var(--hover) 37%, var(--soft) 63%);
  background-size:400% 100%; animation:skel 1.4s ease infinite; border-radius:var(--r-sm); color:transparent; }
@keyframes skel{ 0%{ background-position:100% 0; } 100%{ background-position:0 0; } }
/* acessibilidade */
.sr-only{ position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
.pub-item:focus-visible, .x:focus-visible, .onde-chip:focus-visible, .tema-btn:focus-visible, .hamb:focus-visible{ box-shadow:var(--ring); outline:none; }
.nav:focus-visible{ box-shadow:inset 0 0 0 2px #8FCBE8; outline:none; }
@media (prefers-reduced-motion: reduce){
  *, *::before, *::after{ animation-duration:.01ms !important; animation-iteration-count:1 !important; transition-duration:.01ms !important; }
  .spin{ animation-duration:1s !important; animation-iteration-count:infinite !important; }
}
/* scrollbar discreta */
*::-webkit-scrollbar{ width:10px; height:10px; }
*::-webkit-scrollbar-thumb{ background:var(--border-strong); border-radius:var(--r-full); border:3px solid transparent; background-clip:content-box; }
*::-webkit-scrollbar-thumb:hover{ background-color:var(--muted2); }
*::-webkit-scrollbar-track{ background:transparent; }

@media (max-width:900px){
  .topbar{ display:flex; }
  .side-close{ display:block; }
  /* sidebar vira gaveta à esquerda, escondida até abrir pelo menu */
  .side{ position:fixed; top:0; left:0; width:250px; max-width:84vw; height:100vh; z-index:60;
    transform:translateX(-100%); transition:transform .25s ease; box-shadow:6px 0 34px rgba(0,0,0,.34); }
  .side.aberta{ transform:translateX(0); }
  .side-backdrop{ display:block; }
  .main{ padding:70px 16px 54px; }
  /* no celular a topbar é fixa: desce para caber a tarja de ambiente */
  .root.com-tarja .topbar{ top:30px; }
  .root.com-tarja .side{ top:0; height:100vh; }
  .head{ flex-direction:column; align-items:flex-start; gap:6px; margin-bottom:18px; }
  .head h1{ font-size:18px; }
  .kpis,.kpis-3,.kpis-4,.grid-2,.pub-split,.fp-grid,.destaques,.cli-info,.form-grid,.dp-props,.cal-split{ grid-template-columns:1fr; }
  .cal-grid{ gap:4px; }
  .cal-cel{ min-height:56px; padding:5px; }
  .cal-prod, .cal-info{ display:none; }
  .cal-cel.tem{ align-items:center; justify-content:center; }
  .cal-cel.tem::after{ content:""; width:6px; height:6px; border-radius:50%; background:var(--tc,var(--brand)); }
  .pub-lista.card.no-pad{ max-height:none; }
  .periodo-bar{ flex-wrap:wrap; }
  .dp-fin{ flex-wrap:wrap; gap:14px 28px; }
  .dp-fin-lucro b{ font-size:20px; }
  .dp-prop{ flex-wrap:wrap; row-gap:4px; padding:4px 0; }
  .dp-prop-lab{ width:100%; }
  .dp-edit-nome, .p-acoes .mini{ opacity:1; }
}
    `}</style>
  );
}
