---
name: campanha-3-compras
description: Lista de quem comprou 3 ou mais trabalhos para o Lucas mandar a mensagem pelo WhatsApp, sem repetir quem já recebeu e sem quem já comprou a organização do Lattes. Use sempre que ele pedir para mandar a mensagem para quem comprou 3 ou mais, puxar os clientes com 3+ compras, perguntar quem é novo nessa lista ou quem ainda não recebeu — mesmo que não diga "skill" nem "campanha".
---

# Campanha 3+ compras

O Lucas manda uma mensagem pelo WhatsApp para quem já comprou **3 ou mais
trabalhos**, em rodadas. Duas regras não podem quebrar: **ninguém recebe duas
vezes**, e **quem já comprou a organização do Lattes não recebe**.

**Último corte: 25/10/2026.** A rodada entregue em 26/10/2026 (67 pessoas)
cobriu quem chegou à 3ª compra até 25/10. A anterior foi em 15/09/2026.

## Por que só uma data

Como na `/lattes`, quem já recebeu sai pela **data da 3ª compra**, que vem do
banco e não muda: quem cruzou a linha depois do corte é novo, por definição.
Basta guardar o corte, e ele mora aqui, no repositório, porque precisa chegar a
qualquer computador. Em 26/10/2026 a data da rodada anterior só existia na
memória de outra máquina, e o Lucas teve de procurar no WhatsApp.

Lista de nomes, e-mails ou telefones **não entra aqui**: este repositório é
público.

## O fluxo

**1. Monte a consulta.** Leia `consulta.sql`, troque `{{CORTE}}` pelo corte
acima (`AAAA-MM-DD`), escreva o arquivo no diretório de rascunho da sessão e
ponha na área de transferência:

```powershell
Get-Content <arquivo>.sql -Raw -Encoding UTF8 | Set-Clipboard
```

Mande o link do SQL Editor:
`https://supabase.com/dashboard/project/falyttjidgdtpazoljun/sql/new`

A chave pública do app não lê as tabelas por causa do RLS, então quem roda é
ele. A consulta já tira quem comprou o Lattes e vai **só até ontem** (horário
de Brasília). Quem cruzou hoje entra na próxima rodada, e é isso que deixa o
novo corte sem ambiguidade.

**2. Formate.** Ele cola o resultado no chat como tabela. Salve no rascunho e
rode:

```
node .claude/skills/campanha-3-compras/formatar.mjs <arquivo>
```

O script escreve `lista-cowork.txt` na mesma pasta e imprime quantos têm
telefone, quantos estão sem e quais números ganharam o 9.

**3. Entregue a lista** exatamente assim, uma pessoa por linha. É o formato que
ele cola no Cowork para disparar:

```
Nome Completo Da Pessoa → 11 99999-9999
```

Sem tabela, sem numeração, sem comentário no meio. Ponha também na área de
transferência (`Get-Content <pasta>\lista-cowork.txt -Raw -Encoding UTF8 |
Set-Clipboard`). Os sem telefone vão numa lista separada, com o e-mail.
Pergunte se ele quer tirar ou acrescentar alguém antes de disparar.

**4. Atualize o corte acima** para a véspera do dia em que a consulta rodou,
com a data da rodada e quantas pessoas foram. Faça commit e push, senão o
outro computador continua com o corte antigo. Se esquecer este passo, a
próxima rodada repete as mesmas pessoas, que é exatamente o erro que a
campanha existe para evitar.

## O nono dígito

Muito telefone está gravado com 8 dígitos depois do DDD, sem o 9 de 2016. O
`formatar.mjs` acrescenta o 9 nos celulares (que começam em 6, 7, 8 ou 9),
**menos** no formato `+55 XX XXXX-XXXX`. É assim que o WhatsApp mostra conta
antiga, então esse número foi copiado de lá e funciona com 8 dígitos. Número
que o Lucas pegar direto do WhatsApp nunca é "corrigido". Se algum número falhar
no Cowork, teste com e sem o 9.

## O que já se sabe

- **Lattes no sistema:** tipo "Organização Lattes", tema "Organização Lattes
  (Nome)". Uma venda antiga está como "Personalizado", com "ORGANIZAÇÃO
  LATTES" no tema. A consulta procura "lattes" no tipo ou no tema e casa a
  pessoa por e-mail ou nome, porque o e-mail da venda do Lattes pode ser outro.
  O Lattes também não conta como trabalho na contagem das 3 compras.
- **Telefone não está na venda**, e sim em `participantes`.
- **Quem estava sem telefone não recebeu e não volta sozinho:** já está abaixo
  do corte. Em 26/10/2026 eram 24 pessoas, todas com a 3ª compra até
  30/06/2026. Alcançá-las é uma rodada à parte, se o Lucas quiser.
- **Quem chegou à 3ª compra no próprio dia do corte** ficou de fora por engano
  na rodada de 15/09/2026. Por isso a consulta agora vai só até ontem.
- **A data da 3ª compra pode mudar** se uma venda antiga for apagada, corrigida
  ou lançada depois com data retroativa (é raro: o Lucas lança na hora). Se um
  nome conhecido reaparecer, confira antes de mandar.
- **Para achar a data de uma rodada perdida:** buscar no WhatsApp um trecho da
  mensagem mostra todas as conversas em que ela foi enviada, com data.
- **Para validar a consulta** (ela nunca rodou nesta forma única, que junta as
  duas consultas usadas em 26/10/2026): com corte `2026-09-15`, ela deve
  devolver as 66 pessoas daquela rodada que chegaram à 3ª compra depois de
  15/09, mais quem cruzou de 26/10 até ontem.
- **Claude Code não envia WhatsApp.** O disparo é do Lucas, pelo Cowork. Não
  ofereça enviar; entregue a lista pronta.
