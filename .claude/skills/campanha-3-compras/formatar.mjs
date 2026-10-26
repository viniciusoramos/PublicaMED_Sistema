/* Transforma o resultado do consulta.sql na lista que o Lucas cola no Cowork.
 * Uso: node formatar.mjs <resultado.md>, com o resultado colado como tabela
 * markdown (como o SQL Editor copia). Escreve <pasta>/lista-cowork.txt, só com
 * as linhas "Nome → telefone", e imprime o relatório para a conversa. */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const arq = process.argv[2];
const linhas = readFileSync(arq, "utf8").replace(/^﻿/, "").split(/\r?\n/)
  .filter((l) => l.trim().startsWith("|"));
const celulas = (l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
const cab = celulas(linhas[0]);
const col = (r, nome) => r[cab.indexOf(nome)] ?? "";
const rows = linhas.slice(1).filter((l) => !/^\|\s*-/.test(l.trim())).map(celulas);

/* Telefone no padrão "DD 9XXXX-XXXX". Celular gravado com 8 dígitos ganha o 9,
 * exceto no formato "+55 XX XXXX-XXXX": é como o WhatsApp mostra conta antiga,
 * então o número veio de lá e funciona assim. Estrangeiro fica como veio. */
const telefone = (bruto) => {
  const t = bruto.trim();
  if (!t || t.includes("SEM TELEFONE")) return null;
  if (t.startsWith("+") && !t.startsWith("+55")) return { fmt: t, ganhou9: false };
  let dig = t.replace(/\D/g, "");
  if ((dig.length === 12 || dig.length === 13) && dig.startsWith("55")) dig = dig.slice(2);
  const ddd = dig.slice(0, 2);
  let num = dig.slice(2);
  let ganhou9 = false;
  if (num.length === 8 && "6789".includes(num[0]) && !t.startsWith("+55")) { num = "9" + num; ganhou9 = true; }
  const fmt = num.length === 9 ? `${ddd} ${num.slice(0, 5)}-${num.slice(5)}` : `${ddd} ${num.slice(0, 4)}-${num.slice(4)}`;
  return { fmt, ganhou9 };
};

const com = [], sem = [], nove = [];
for (const r of rows) {
  const nome = col(r, "nome"), bruto = col(r, "telefone");
  const tel = telefone(bruto);
  if (!tel) { sem.push(`${nome} (3ª compra em ${col(r, "chegou_a_3_em")}) · ${col(r, "email")}`); continue; }
  com.push(`${nome} → ${tel.fmt}`);
  if (tel.ganhou9) nove.push(`${nome}: ${bruto} → ${tel.fmt}`);
}

writeFileSync(join(dirname(arq), "lista-cowork.txt"), com.join("\r\n"), "utf8");
console.log(`COM TELEFONE (${com.length}) → lista-cowork.txt`);
console.log(com.join("\n"));
console.log(`\nSEM TELEFONE (${sem.length})`);
console.log(sem.join("\n"));
console.log(`\nGANHARAM O 9 (${nove.length})`);
console.log(nove.join("\n"));
