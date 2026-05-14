# IArtefato

MVP para inferir padrões de correção usados por professores com IA. O foco não é ser uma IA corretora tradicional, mas aproximar a lógica do avaliador a partir de correções já recebidas e reutilizar essa memória para simular avaliações futuras.

## Requisitos

- Node.js compatível com Next.js 16
- PostgreSQL acessível via `DATABASE_URL`
- Chave do Google Gemini em `GEMINI_API_KEY`

As variáveis devem estar em `.env.local` na raiz do projeto ou exportadas no shell. Não versionar credenciais.

## Rodar Localmente

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

O servidor usa a porta configurada em `package.json`: [http://localhost:3001](http://localhost:3001).

## Fluxo

### Base de Correção

O usuário informa descrição da atividade, resposta enviada, feedback recebido e nota. A API server-side envia os dados para Gemini, infere critérios, penalizações, estilo, rigor técnico, foco estrutural e pseudo-prompt aproximado, depois salva tudo no PostgreSQL via Prisma.

### Simular Avaliação

O usuário informa nova atividade e nova resposta. O sistema busca casos similares persistidos, combina pseudo-prompts anteriores, monta um prompt contextual, chama Gemini e salva feedback previsto, nota prevista, riscos e requisitos faltantes.

## Arquitetura

```txt
src/
├── app/
│   ├── api/
│   │   ├── correction-cases/
│   │   ├── semantic-memory/search/
│   │   └── simulations/
│   ├── base-correcao/
│   ├── dashboard/
│   └── simular/
├── features/
│   ├── correction-inference/
│   ├── evaluation-simulator/
│   ├── prompt-composer/
│   ├── semantic-memory/
│   └── shared/
├── services/
│   ├── ai/gemini/
│   └── database/
└── prisma/
```

## Comandos Úteis

```bash
npx tsc --noEmit
npm run lint
npm run build
npm run prisma:migrate
npm run prisma:studio
```

## Observações

- Gemini é chamado apenas no servidor.
- Prisma é acessado apenas por rotas e serviços server-side.
- A memória semântica atual usa similaridade lexical/tags sobre dados reais persistidos; embeddings podem entrar depois sem mudar o fluxo principal.
