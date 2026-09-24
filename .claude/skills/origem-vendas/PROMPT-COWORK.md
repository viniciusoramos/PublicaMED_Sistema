# Prompt para o Cowork · ler os membros dos grupos

Cole no Cowork. Os nomes dos grupos já estão preenchidos.

Pode rodar quantas vezes quiser: a lista é sempre lida do zero, e rodar de novo
corrige o passado (quem entrou depois de comprar aparece na leitura seguinte).

---

Use a aba do **WhatsApp Business** que já está aberta e logada no meu
navegador. **Não é o meu WhatsApp pessoal.** Antes de começar, confirme que a
conta aberta é a do PublicaMED — se houver mais de uma janela ou perfil de
WhatsApp aberto, me pergunte qual usar em vez de escolher sozinho.

Preciso da lista de membros destes cinco grupos:

1. `PublicaMed (Artigos Cientificos)`
2. `PublicaMed (Artigos Cientificos) #2`
3. `PublicaMed (Artigos Cientificos) #3`
4. `PublicaMed (Artigos Cientificos) #4`
5. `PublicaMed (Artigos Cientificos) #5`

**Cuidado com o primeiro.** O nome dele é prefixo dos outros quatro: buscar
"PublicaMed (Artigos Cientificos)" faz aparecer os cinco. O grupo 1 é o que
**não tem `#` nenhum** no fim. Confira o nome no cabeçalho depois de abrir, e
não se guie pela ordem da lista de conversas.

Para cada grupo:

1. Abra o grupo e entre em **Dados do grupo**.
2. Anote o **total de membros** que o WhatsApp mostra no cabeçalho da lista
   (ex.: "247 membros"). Vou usar para conferir se a leitura ficou completa.
3. Role a lista de membros **até o fim**, lendo todos. A lista carrega conforme
   rola, então vá devagar e não pare no meio.
4. De cada membro, anote o telefone (quando aparecer) e o nome. Quem está salvo
   na agenda aparece só com o nome, sem número — anote assim mesmo, **não abra
   o contato** para descobrir o número.

**Só leitura.** Não envie mensagem, não abra conversa, não entre nem saia de
grupo, não remova ninguém, não mude nada em nenhum grupo.

No fim, me devolva um arquivo `grupos.csv` com ponto e vírgula como separador,
uma linha por membro, exatamente nestas colunas:

```
grupo;telefone;nome
PublicaMed (Artigos Cientificos);+55 11 99999-0000;Fulano de Tal
PublicaMed (Artigos Cientificos);;Beltrana Souza
PublicaMed (Artigos Cientificos) #3;+55 31 98888-1111;
```

No campo `grupo`, escreva o nome exato do grupo, com o `#` quando houver.
Telefone vazio quando não aparecer, nome vazio quando só houver número. **Não
invente número nem nome.**

E me diga, para cada um dos cinco grupos, quantos membros o WhatsApp informava
e quantas linhas você conseguiu ler. Se algum par não bater, me avise — quero
saber que a leitura ficou incompleta antes de usar os dados.

---

## Depois

Traga o `grupos.csv` para o Claude Code e peça para preencher a origem das
vendas. Ele cruza por telefone e, na falta dele, por nome, e informa quantas
vendas casaram antes de gravar qualquer coisa.
