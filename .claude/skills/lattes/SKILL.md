---
name: lattes
description: Campanha de organização do Lattes para clientes da PublicaMED com 4 ou mais compras. Use sempre que o Lucas perguntar quem chegou a 4 compras, quem é novo na lista do Lattes, se tem gente nova para oferecer a organização do currículo, ou pedir para conferir se alguém passou de 4 vendas — mesmo quando ele não disser "Lattes" nem "skill". Também use quando ele mandar números de telefone que achou no WhatsApp para gravar no sistema, ou perguntar quem ainda está sem telefone.
---

# Campanha Lattes · clientes com 4+ compras

O Lucas oferece o serviço de **organização do Lattes** por WhatsApp aos clientes
que já compraram **4 ou mais trabalhos**. Ele roda isso periodicamente e a regra
que não pode ser quebrada é: **ninguém recebe a mensagem duas vezes.**

## Por que não existe lista de contatados

A tentação é guardar os nomes de quem já recebeu. Não faça isso — a lista cresce,
envelhece e exige manutenção a cada rodada.

Em vez disso, use **a data da 4ª compra**. Ela é um dado do banco, é
determinística e não muda: quem cruzou a linha depois do último envio é novo, por
definição. Então basta guardar uma coisa — **a data do último envio** — e ela mora
na memória `campanha-lattes-4-compras.md`.

## O fluxo

**1. Leia a data do último envio** em
`~/.claude/projects/c--Users-lucas-PublicaMED-Sistema/memory/campanha-lattes-4-compras.md`.

**2. Monte a consulta.** Leia `consulta-novos.sql` (aqui nesta pasta), troque
`{{CORTE}}` pela data do último envio no formato `AAAA-MM-DD`, e ponha o
resultado na área de transferência:

```powershell
Get-Content <arquivo-temporario>.sql -Raw -Encoding UTF8 | Set-Clipboard
```

Escreva o arquivo já substituído no diretório de rascunho da sessão, não dentro
da skill — a skill fica no repositório e não deve acumular arquivos de uma rodada.

**3. Mande o link.** O Lucas cola e roda no painel:
`https://supabase.com/dashboard/project/falyttjidgdtpazoljun/sql/new`

Ele não tem como rodar a consulta por você: a chave pública do app não lê a
tabela por causa do RLS. O caminho é sempre clipboard + link.

**4. Formate o resultado** exatamente assim, um por linha — é o formato que ele
cola no Cowork para disparar:

```
Nome Completo Da Pessoa → 11 99999-9999
```

Nada de tabela, nada de numeração, nada de comentário no meio. A tabela com
compras, gasto e data serve para a conversa; a lista final é só nome e telefone.

**5. Atualize a data na memória** para o dia em que a rodada foi enviada. Se
esquecer isso, a próxima rodada repete as mesmas pessoas — que é exatamente o
erro que a campanha inteira existe para evitar.

## O nono dígito

Muitos telefones estão gravados com 8 dígitos depois do DDD, sem o 9 que os
celulares brasileiros ganharam em 2016. Esses não funcionam no WhatsApp.

Ao entregar a lista, **ofereça a versão com o 9** para os de 8 dígitos (celular
começa em 6, 7, 8 ou 9; fixo começa em 2 a 5 e continua com 8 dígitos).

Uma exceção importante: números que o **Lucas pegou direto do WhatsApp** podem ter
8 dígitos legitimamente — contas brasileiras antigas ficam assim lá. Esses nunca
devem ser "corrigidos"; grave exatamente como ele mandou.

## Quando ele mandar telefones para gravar

Ele às vezes busca à mão no WhatsApp os números que faltavam e manda a lista.
Grave com UPDATE via SQL — pela tela seria um por um. O `UPDATE` precisa:

- casar por **e-mail ou nome sem acento** (o e-mail do participante às vezes
  difere do da venda, e há nomes gravados com caixa diferente)
- atualizar **todas as participações da pessoa**, porque o telefone é da pessoa e
  não de uma participação — é o mesmo critério que o sistema usa para CPF
- mexer **só em quem está com o campo vazio**, para nunca sobrescrever um número
  que já existe
- terminar com `returning nome, email, telefone`, para o resultado já mostrar o
  que foi gravado sem precisar de uma segunda consulta

Confira depois se o número de linhas por pessoa bate com o número de compras
dela. Se bater, o casamento pegou tudo.

## O que já se sabe e evita retrabalho

- **Telefone não está na tabela de vendas**, e sim em `participantes`.
- **A data da 4ª compra pode mudar** se uma venda antiga for apagada ou corrigida.
  Se um nome conhecido reaparecer como novo, provavelmente foi isso — vale
  conferir antes de mandar mensagem repetida.
- **8 clientes não têm telefone e não foram encontrados**: estão nomeados na
  memória. Para eles resta o e-mail.
- **Claude Code não envia WhatsApp.** O disparo é o Lucas quem faz, pelo Cowork.
  Não ofereça enviar; entregue a lista pronta.
