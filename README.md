# PublicaMED · Sistema de gestão

Painel interno da PublicaMED (vendas, clientes, trabalhos, financeiro, publicações/vagas).
Migração de artifact single-file → **Vite + React + Supabase** (banco central, multiusuário, com login).

## Estado da migração

| Etapa | Status |
|---|---|
| Schema Supabase (tabelas normalizadas + RLS) | ✅ `supabase/schema.sql` |
| Script de importação do SEED | ✅ `scripts/import-seed.mjs` |
| Scaffold Vite + cliente Supabase | ✅ (parcial) |
| Reescrever `store` para CRUD por linha no Supabase | ⏳ próximo |
| Tela de login (Supabase Auth) | ⏳ próximo |
| Portar o componente `App` para `src/` | ⏳ próximo |

## 1. Banco (Supabase)

1. Crie um projeto em [supabase.com](https://supabase.com).
2. **SQL Editor** → cole o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
   Cria 6 tabelas (`faculdades`, `vendas`, `publicacoes`, `participantes`, `trabalhos`, `financeiro`)
   com RLS ligado: só usuários **autenticados** acessam.
3. **Authentication** → habilite **Email** (email/senha) e crie os usuários dos funcionários.

## 2. Variáveis de ambiente

```bash
cp .env.example .env
```

Preencha o `.env` (chaves em *Project Settings → API*):
- `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` → usadas pelo front (públicas).
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` → usadas só pelo import (secreta, **nunca** no front).

## 3. Importar os dados do SEED

O import lê a constante `SEED` direto do `.jsx` original (fonte da verdade),
normaliza e popula o banco. Coloque `publicamed_sistema.jsx` na raiz do projeto.

```bash
npm install

# 1) validar a transformação sem tocar no banco (recomendado primeiro):
npm run import:seed:dry

# 2) importar de verdade (aborta se as tabelas já tiverem dados):
npm run import:seed

# limpar tudo e reimportar do zero:
npm run import:seed:reset

# fonte alternativa:
node scripts/import-seed.mjs --source ./caminho/para/arquivo.jsx
```

Detalhes:
- **Encoding:** o script detecta e corrige mojibake (UTF-8 lido como Latin-1) automaticamente.
- **Publicações/participantes:** reconstruídas a partir das vendas (mesma lógica de `construirTemas`):
  um participante por email por tema; tipo dominante; `vagas=6`, `requer_graduado=false` por padrão.
- **Faculdades:** as 122 canônicas (índice 0 vazio é ignorado), cada uma com sua UF.
- **Idempotência:** sem `--reset` o script se recusa a rodar se já houver dados, evitando duplicação.

## 4. Rodar o front (em construção)

```bash
npm run dev
```

> A reescrita da camada de persistência (`store`) e a tela de login são as próximas etapas.

## Deploy (Netlify)

O build embute a URL + anon key (públicas). A `service_role` **não** vai no bundle.

**Simples (arrastar e soltar):**
1. `npm run build` (gera `dist/`).
2. Acesse https://app.netlify.com/drop e arraste a pasta `dist` (ou `publicamed-site.zip`).
3. O site sobe numa URL `*.netlify.app`; o login funciona sem configurar nada.

Ao rotacionar as chaves do Supabase, rode `npm run build` de novo e suba o novo `dist`.

**Deploy contínuo (git):** conecte o repositório no Netlify. O `netlify.toml` já define
build (`npm run build`) e publish (`dist`); defina no Netlify as variáveis
`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

## Estrutura

```
supabase/schema.sql        DDL + RLS
scripts/import-seed.mjs     importação única do SEED → Supabase
src/lib/supabase.js         cliente Supabase do front (anon)
.env.example                modelo de variáveis de ambiente
```
