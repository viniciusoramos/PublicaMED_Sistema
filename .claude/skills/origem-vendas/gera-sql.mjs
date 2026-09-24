/* Gera o UPDATE da origem a partir do resultado.json do cruza.mjs.
 * Uso: node gera-sql.mjs <pasta>  ->  <pasta>/gravar-origem.sql */
import { readFileSync, writeFileSync } from "node:fs";
const dir = process.argv[2];
const res = JSON.parse(readFileSync(dir + "/resultado.json", "utf8"));
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const porGrupo = new Map();
let invalidos = 0;
for (const v of [...res.tel, ...res.nome]) {
  if (!UUID.test(v.id)) { invalidos++; continue; }
  if (!porGrupo.has(v.grupo)) porGrupo.set(v.grupo, []);
  porGrupo.get(v.grupo).push(v.id);
}
if (invalidos) throw new Error(invalidos + " id(s) invalidos - nada gerado");
const ordem = [...porGrupo.keys()].sort((a, b) => ((a.match(/#(\d)/) || [0, 1])[1]) - ((b.match(/#(\d)/) || [0, 1])[1]));
const q = (s) => "'" + s.replace(/'/g, "''") + "'";
let sql = `-- ============================================================
--  Origem das vendas: de qual grupo de WhatsApp veio cada uma
--  ${[...porGrupo.values()].reduce((s, a) => s + a.length, 0)} vendas: por telefone e, na falta dele, por nome com
--  sobrenome. Quem esta em dois grupos fica de fora de proposito -
--  nao ha como saber de qual deles veio.
--
--  So preenche venda com origem VAZIA: nada ja preenchido e tocado.
--  Pode rodar de novo sem efeito.
-- ============================================================
`;
for (const g of ordem) {
  const ids = porGrupo.get(g);
  sql += `\n-- ${g}: ${ids.length} vendas\nupdate public.vendas set origem = ${q(g)}\n where origem = '' and id in (\n`;
  sql += ids.map((id) => `  '${id}'`).join(",\n") + "\n );\n";
}
sql += `
-- confere: quantas vendas ficaram em cada grupo
select coalesce(nullif(origem, ''), '(sem origem)') as origem,
       count(*)                                    as vendas
  from public.vendas
 group by 1
 order by 2 desc;
`;
writeFileSync(dir + "/gravar-origem.sql", sql, "utf8");
console.log("gerado: " + (sql.length / 1024).toFixed(1) + " KB");
for (const g of ordem) console.log("   " + String(porGrupo.get(g).length).padStart(4) + "  " + g);
console.log("   total: " + [...porGrupo.values()].reduce((s, a) => s + a.length, 0) + "  ·  ids repetidos: " +
  ([...porGrupo.values()].flat().length - new Set([...porGrupo.values()].flat()).size));
