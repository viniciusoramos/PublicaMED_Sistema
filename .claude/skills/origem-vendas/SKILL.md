---
name: origem-vendas
description: Descobrir de qual grupo de WhatsApp veio cada venda da PublicaMED, para medir se cada estratégia (tráfego pago, orgânico, divulgação de funcionário) traz cliente que compra bem e volta. Use sempre que o Lucas falar em origem das vendas, de qual grupo veio um cliente, medir o resultado de um grupo ou de uma estratégia, cruzar a lista de membros do WhatsApp com as vendas, ou quando ele trouxer um arquivo de membros de grupo (grupos.csv) — mesmo que não diga "origem" nem "skill".
---

# De qual grupo veio cada venda

Os grupos de WhatsApp da PublicaMED têm origens diferentes — tráfego pago,
estratégia orgânica, divulgação feita por funcionário. A pergunta que o Lucas
quer responder não é quantas vendas cada grupo deu, e sim **qual grupo traz
gente que compra bem e volta**.

A origem fica em `vendas.origem` (migração 24). Vazio quer dizer desconhecida —
é o estado de quase todo o histórico, e a tela precisa diferenciar isso de "não
veio de grupo nenhum".

## Por que a leitura dos grupos, e não um campo preenchido à mão

Foi decisão do Lucas, com um motivo bom: quase ninguém está em dois grupos ao
mesmo tempo nem troca de grupo depois de comprar. Com isso, **estar no grupo é
um bom substituto de ter vindo dele**, e a atribuição automática fica confiável.

Não há como exportar a lista de membros pelo WhatsApp: não existe botão, copiar
a lista no WhatsApp Web não funciona, e exportar a conversa deixa gente de fora
(o histórico tem limite). Sobra ler a lista na tela — e isso o Claude Code não
faz, porque não tem controle de navegador. Quem lê é o **Cowork**.

## O fluxo

**1. Entregue o prompt do Cowork.** Está em `PROMPT-COWORK.md`, aqui nesta
pasta. Ele pede a leitura dos grupos e devolve `grupos.csv` com
`grupo;telefone;nome`.

Peça ao Lucas para conferir o total: o prompt manda o Cowork informar quantos
membros o WhatsApp diz que o grupo tem e quantos ele conseguiu ler. Se os
números não baterem, a leitura ficou incompleta — vale rodar de novo antes de
gravar, senão vendas ficam sem origem por falha de leitura, não por falta de
dado.

Para só **atualizar com as vendas novas**, pule este passo e use o `grupos.csv`
da última leitura (guarde-o em Downloads). Quem comprou mas entrou no grupo
depois da leitura fica sem origem até a próxima; se forem poucas vendas, não
vale rodar o Cowork só por elas.

**2. Exporte os contatos das vendas.** Ponha `exportar-contatos.sql` na área de
transferência e mande o link do SQL Editor:
`https://supabase.com/dashboard/project/falyttjidgdtpazoljun/sql/new`

A consulta devolve só as vendas **sem origem**, uma por linha, com id, data,
nome, telefone e quando a venda entrou no sistema. O telefone não existe na
venda — vem do participante ligado a ela e, na falta do vínculo, do cadastro da
mesma pessoa em outra participação. O Lucas baixa em CSV (Export → Download
CSV) na pasta Downloads; pegue o `Supabase Snippet*.csv` mais recente.

**3. Cruze localmente e mostre a cobertura ANTES de gravar.** Numa pasta do
scratchpad, ponha o `grupos.csv` e o CSV exportado como `vendas.csv`, e rode:

```
node .claude/skills/origem-vendas/cruza.mjs <pasta>
```

Ele não toca no banco: escreve `resultado.json` e imprime quantas vendas
casaram por grupo, por telefone e por nome, quantas estão em dois grupos e
quantas ficaram sem origem (e por quê). Mostre isso ao Lucas, com o nome das
vendas novas que não casaram, antes de gerar o UPDATE.

**As que não casaram, pergunte ao Lucas antes de mandar rodar o Cowork.** Ele
costuma saber de qual grupo é cada cliente novo. Em 25/09/2026 ele identificou
na hora as nove que ficaram de fora, entre elas quatro sem telefone
cadastrado, que nenhuma leitura pegaria. O grupo que ele disser vale e é gravado
direto: um UPDATE por grupo com os ids, só em origem vazia, e a contagem no fim.
Se ele citar a pessoa só pelo primeiro nome, confirme o nome completo antes.

Como casar:

- **Telefone** primeiro, comparando só os dígitos e ignorando o DDI. Muitos
  números estão gravados sem o 9 da migração de 2016, então compare também a
  versão com o 9 acrescentado — senão metade não casa.
- **Nome** quando não houver telefone dos dois lados: sem acento, sem
  maiúsculas, sem espaço repetido. Nome é mais frágil (homônimo, nome salvo
  diferente do nome da venda), então informe separado quantas vieram por aí.

**4. Grave.** `node .claude/skills/origem-vendas/gera-sql.mjs <pasta>` gera
`gravar-origem.sql`: um UPDATE por grupo, com a lista de ids daquele grupo, só
em venda com origem vazia, e no fim uma contagem por grupo. Ponha na área de
transferência, diga ao Lucas quantas vendas devem ficar em cada grupo depois de
rodar e confira com o resultado que ele mandar. Diferença pequena costuma ser
venda registrada depois da exportação.

Nunca sobrescreva origem já preenchida.

## O que já se sabe

- **Quem está no grupo mas nunca comprou não casa com nada**, e está certo: o
  grupo tem muito mais gente do que clientes. O que interessa é o contrário —
  venda que encontra seu grupo.
- **Rodar de novo corrige o passado.** Quem entrou no grupo depois de comprar
  aparece na leitura seguinte e a venda antiga ganha origem.
- **Quem está salvo na agenda do Lucas aparece só com o nome**, sem número. Por
  isso o cruzamento por nome existe.
- **20 clientes recorrentes não têm telefone cadastrado** (ver
  [[campanha-lattes-4-compras]]); esses só casam por nome.
- **Quem está em dois grupos fica sem origem**, por decisão do Lucas. Na leitura
  de 23/09/2026 foram seis clientes.
- **O #5 foi criado com acento** ("Científicos"); os outros quatro, sem. A
  origem guarda o nome exato, e o painel normaliza para "Grupo #1".."#5".
- **Cobertura:** cerca de 35% das vendas de 2025 têm origem, contra 80–89% de
  julho a setembro de 2026. Venda antiga fica sem origem porque a pessoa saiu do
  grupo ou não tem telefone.

## O painel

Aba **Origem das vendas** (última do menu, `#origem`). Abre sempre no mês
corrente, diferente das outras abas, porque a pergunta é como os grupos estão
indo agora. Tudo conta só o período do filtro:

- **Por grupo:** vendas, faturamento, ticket médio, clientes e gasto por cliente
  (faturamento do período ÷ clientes do período). Com um mês escolhido, também
  **novos** (primeira compra da vida naquele mês) e **recorrentes** (já tinham
  comprado antes). No ano inteiro essas duas somem, porque não fazem sentido.
- **Gráfico:** vendas, faturamento ou clientes novos, com uma barra por grupo
  (padrão quando há mês escolhido) ou por mês (padrão no ano inteiro).
- **Tabela mês a mês**, com a coluna "com origem" para não comparar mês de
  cobertura baixa com mês de cobertura alta.

O Lucas rejeitou métricas de histórico inteiro, como gasto total do cliente ou
recompra de toda a vida: com o filtro num mês elas ficavam infladas e
confundiam. Mantenha tudo preso ao período.

"Sem origem" sempre sai com menos recorrentes, porque quem compra várias vezes
tem mais chance de ter telefone cadastrado e ganhar grupo. Compare os grupos
entre si, não com essa linha.
