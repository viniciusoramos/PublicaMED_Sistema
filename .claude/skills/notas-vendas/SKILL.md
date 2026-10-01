---
name: notas-vendas
description: Lista de nome, CPF e valor das vendas para o Lucas emitir as notas fiscais da PublicaMED, a partir do último corte, sem as vendas marcadas para não ter nota. Use sempre que ele pedir para tirar ou emitir notas, pegar CPF e valor das vendas, perguntar até onde já tirou nota, ou falar em nota duplicada — mesmo que não diga "skill".
---

# Notas das vendas

O Lucas emite as notas por fora do sistema, em lotes. A cada lote ele pede
nome, CPF, valor e tipo das vendas novas. O risco é sempre o mesmo: **nota
duplicada** (venda que já entrou no lote anterior) ou **nota de venda que não
deveria ter** — então o que define o lote é o corte, não a memória dele.

## O corte é quando a venda foi lançada, não a data dela

Venda lançada depois com data retroativa (cadastrada em 10/09 com data de
05/09) não estava no lote anterior e precisa entrar. Por isso a consulta filtra
`vendas.criado_em` maior que o instante em que o lote anterior foi tirado.

**Último corte: 30/09/2026, por volta das 23:35 (Brasília).** O lote foi das
vendas lançadas entre 07/09 12:08 e esse momento: **317 vendas, R$ 83.980,15**,
já sem Simone Michelon e Letícia Ferreira Rolim (marcadas para não ter nota).
A última venda da lista é de 30/09 (Rafael Pedro Roewer, capítulo e
internacional). No próximo lote, use `2026-09-30 23:30:00-03` e tire da lista
as vendas de 30/09 que já estavam nesta — o minuto exato da consulta não ficou
registrado. As de 30/09 desta lista: André Luiz da Silva, Felipe de Souza
Fontanella Bittencourt, Isabella Valle Mazzaro (2), Luana Alberton Medeiros,
Lucimar Hintz de Freitas Júnior (3), Manoela Rita Inácio, Marcelo Scarabelot
Rampinelli, Maria Eduarda Celestino de Souza Moraes (2), Mônica Fernandes
Delapasse e Rafael Pedro Roewer (2).

Ao terminar cada lote, **atualize o corte acima** com a data e hora em que a
consulta foi gerada.

## O fluxo

1. Ponha `consulta-notas.sql` na área de transferência trocando `{{CORTE}}`
   pelo último corte (ex.: `2026-09-30 23:30:00-03`) e mande o link do SQL Editor:
   `https://supabase.com/dashboard/project/falyttjidgdtpazoljun/sql/new`
2. A consulta devolve dia, nome, CPF, valor e tipo, com uma linha de TOTAL no
   fim. CPF vem da participação ligada à venda e, na falta, de outra
   participação da mesma pessoa (e-mail, depois nome). Sem CPF aparece
   `>>> SEM CPF`.
3. Pergunte se alguma venda do período já teve nota por fora.

## Venda que não deve ter nota

O Lucas marca isso nas **Observações da publicação** (aba Dados da
publicação), com o nome da pessoa: "não emitir nota da venda Simone Michelon",
"Letícia Ferreira Rolim — Enviado Para PF Vinicius, não tirar nota". A consulta
pula a venda quando a observação da publicação dela tem "tirar nota" ou
"emitir nota" e cita o nome do cliente.

- O nome precisa estar escrito igual ao da venda (acento conta). Se ele disser
  que marcou e a venda continuou na lista, procure a observação com
  `ilike '%nota%'` e compare a grafia.
- Não procure por "nf": casa com "Infecção" e traz descrição de combo.
