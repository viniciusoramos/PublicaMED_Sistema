/* Cruza a lista de membros dos grupos com as vendas.
 * Uso: node cruza.mjs <pasta>, com <pasta>/grupos.csv (do Cowork) e
 * <pasta>/vendas.csv (do exportar-contatos.sql). Nao grava nada no banco:
 * escreve <pasta>/resultado.json e imprime a cobertura, para conferir antes. */
import { readFileSync, writeFileSync } from "node:fs";
const dir = process.argv[2];

// ---------- leitura ----------
// CSV do Supabase: vírgula, e campo com vírgula ou aspas vem entre aspas
const lerCSV = (txt) => {
  const out = []; let campo = "", linha = [], aspas = false;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (aspas) {
      if (c === '"' && txt[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === ",") { linha.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && txt[i + 1] === "\n") i++;
      linha.push(campo); campo = "";
      if (linha.some((x) => x !== "")) out.push(linha);
      linha = [];
    } else campo += c;
  }
  if (campo || linha.length) { linha.push(campo); out.push(linha); }
  return out;
};
const vRaw = lerCSV(readFileSync(dir + "/vendas.csv", "utf8").replace(/^\uFEFF/, ""));
const cab = vRaw.shift();
const vendas = vRaw.map((r) => Object.fromEntries(cab.map((c, i) => [c, r[i] ?? ""])));

const gTxt = readFileSync(dir + "/grupos.csv", "utf8").replace(/^\uFEFF/, "");
const membros = gTxt.split(/\r?\n/).filter(Boolean).slice(1).map((l) => {
  const [grupo, telefone, ...resto] = l.split(";");
  return { grupo, telefone: telefone || "", nome: resto.join(";") };
});

// ---------- normalização ----------
const chaveTel = (t) => {
  let d = String(t).replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("55") && d.length >= 12) d = d.slice(2);
  else if (d.length > 11) return "x" + d;
  if (d.length < 10) return "";
  return d.slice(0, 2) + d.slice(-8);   // DDD + 8 últimos: casa com e sem o 9
};
const LIGA = new Set(["de", "da", "do", "dos", "das", "e", "di", "du"]);
const tokens = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  .replace(/[^a-z\s]/g, " ").split(/\s+/).filter((w) => w.length >= 2 && !LIGA.has(w));
// contas da própria PublicaMED e da equipe: estão em todo grupo e não são cliente
const EQUIPE = new Set(["publicamed", "publicamed artigos", "vinicius", "lucas", "lucas artigo direito", "amigo med"]);

// ---------- índices dos grupos ----------
const porTel = new Map();                  // chave -> Set(grupos)
const comNome = [];                        // membros com nome de 2+ palavras, para o casamento por nome
for (const m of membros) {
  const k = chaveTel(m.telefone);
  if (k) { if (!porTel.has(k)) porTel.set(k, new Set()); porTel.get(k).add(m.grupo); }
  const tk = tokens(m.nome);
  if (tk.length >= 2 && !EQUIPE.has(tk.join(" "))) comNome.push({ ...m, tk, temTel: !!k });
}

/* Nome só entra onde o telefone não tem como decidir: venda sem telefone, ou
 * membro sem telefone (salvo na agenda). Se os DOIS têm telefone e os números
 * não bateram, são quase certamente pessoas diferentes com nome parecido —
 * casar pelo nome ali criaria origem errada. E o nome do membro precisa ter
 * pelo menos duas palavras, todas presentes no nome da venda: "Ana" sozinho
 * casaria com metade das clientes. */
/* Prenomes comuns não identificam ninguém: "Maria Eduarda" casou com quatro
 * membros diferentes do mesmo nome. Então o nome do membro precisa trazer ao
 * menos uma palavra que NÃO seja prenome comum — na prática, um sobrenome. */
const PRENOMES = new Set(('maria ana joao jose pedro lucas gabriel gabriela luis luiz fernando fernanda henrique ' +
  'eduarda eduardo claudia claudio victoria vitoria victor vitor julia juliana laura lara carolina caroline carol ' +
  'beatriz isabela isabella isabel izabela gabriella amanda bruna bruno camila leticia mariana marina paula paulo ' +
  'rafael rafaela rafa felipe filipe gustavo guilherme matheus mateus thiago tiago arthur artur antonio antonia carlos ' +
  'luisa luiza clara alice sophia sofia giovana giovanna isadora larissa natalia nathalia bianca livia igor bernardo ' +
  'enzo davi daniel daniela danielle renata roberta rodrigo ricardo leonardo leandro marcos marcelo murilo otavio ' +
  'heloisa emanuelly emanuelle yasmin yasmim rebeca raquel sarah sara lais luana lorena manuela manoela manuella ' +
  'melissa nicole nicolas olivia pietra samara tainara thais valentina vanessa aline adriana cecilia eloa emilly ' +
  'luana alana alexia andre andrea andressa angelica barbara brenda caio cristina diego diogo elisa emily erika ' +
  'fabio fabiana flavia flavio gisele helena hugo ingrid iris jade jessica joana julio karina karen kaique kamila ' +
  'lavinia lorenzo luana mayara michele milena mirella monica nayara pamela patricia priscila renan sabrina ' +
  'samuel silvia tatiana vinicius wesley yuri jonathan joaquim milla lorraine rayssa kauan kaua luan').split(' '));
const porNome = (venda, vendaTemTel) => {
  const tv = new Set(tokens(venda.nome));
  const quem = [];
  for (const m of comNome) {
    if (vendaTemTel && m.temTel) continue;
    if (!m.tk.some((w) => !PRENOMES.has(w))) continue;   // só prenome: não prova nada
    if (m.tk.every((w) => tv.has(w))) quem.push(m);
  }
  // mais de um membro casando = não dá para saber qual é a pessoa, mesmo se o grupo for o mesmo
  if (quem.length > 1) return { grupos: new Set(quem.map((m) => m.grupo)), varios: true };
  return { grupos: new Set(quem.map((m) => m.grupo)), varios: false };
};

// ---------- cruzamento ----------
const res = { tel: [], nome: [], ambiguo: [], semOrigem: [], jaTinha: [] };
for (const v of vendas) {
  if (v.origem_atual) { res.jaTinha.push(v); continue; }
  const k = chaveTel(v.telefone);
  const gTel = k ? porTel.get(k) : null;
  if (gTel && gTel.size === 1) { res.tel.push({ ...v, grupo: [...gTel][0] }); continue; }
  if (gTel && gTel.size > 1) { res.ambiguo.push({ ...v, grupos: [...gTel], por: "telefone" }); continue; }
  const pn = porNome(v, !!k);
  // vários membros casando só é problema se estiverem em grupos diferentes: a
  // pergunta é o grupo, não a pessoa, e todos no mesmo grupo dão a mesma resposta
  if (pn.varios && pn.grupos.size > 1) { res.ambiguo.push({ ...v, grupos: [...pn.grupos], por: "nome, em dois grupos" }); continue; }
  if (pn.grupos.size === 1) { res.nome.push({ ...v, grupo: [...pn.grupos][0] }); continue; }
  res.semOrigem.push(v);
}
writeFileSync(dir + "/resultado.json", JSON.stringify(res, null, 1));

// ---------- relatório ----------
const curto = (g) => (g.match(/#\d/) || ["#1"])[0];
const total = vendas.length;
const pct = (n) => (100 * n / total).toFixed(1).replace(".", ",") + "%";
console.log(`vendas: ${total}\n`);
console.log(`casaram por telefone: ${String(res.tel.length).padStart(5)}  ${pct(res.tel.length)}`);
console.log(`casaram só por nome:  ${String(res.nome.length).padStart(5)}  ${pct(res.nome.length)}`);
console.log(`em dois grupos:       ${String(res.ambiguo.length).padStart(5)}  ${pct(res.ambiguo.length)}`);
console.log(`sem origem:           ${String(res.semOrigem.length).padStart(5)}  ${pct(res.semOrigem.length)}`);
console.log(`já tinham origem:     ${String(res.jaTinha.length).padStart(5)}`);

const porG = new Map();
for (const x of [...res.tel, ...res.nome]) {
  const g = curto(x.grupo);
  if (!porG.has(g)) porG.set(g, { tel: 0, nome: 0, pessoas: new Set() });
  const e = porG.get(g);
  e[res.tel.includes(x) ? "tel" : "nome"]++;
  e.pessoas.add(chaveTel(x.telefone) || tokens(x.nome).join(" "));
}
console.log(`\npor grupo            vendas   (tel + nome)   clientes`);
for (const g of ["#1", "#2", "#3", "#4", "#5"]) {
  const e = porG.get(g) || { tel: 0, nome: 0, pessoas: new Set() };
  console.log(`   ${g}              ${String(e.tel + e.nome).padStart(5)}    (${e.tel} + ${e.nome})${" ".repeat(Math.max(1, 10 - String(e.tel).length - String(e.nome).length))}${String(e.pessoas.size).padStart(5)}`);
}
// por que sobrou sem origem: sem telefone nenhum, ou telefone que não está em grupo
const semTelV = res.semOrigem.filter((v) => !chaveTel(v.telefone)).length;
console.log(`\nsem origem, por quê:`);
console.log(`   venda sem telefone cadastrado:       ${semTelV}`);
console.log(`   telefone que não está em nenhum grupo: ${res.semOrigem.length - semTelV}`);
