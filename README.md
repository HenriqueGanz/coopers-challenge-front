# Coopers Challenge Frontend

Frontend da aplicação do case técnico da Coopers.

Este projeto é uma SPA em React que entrega a landing page pública, o fluxo de autenticação, a lista de tarefas com drag-and-drop e as interações de contato e recuperação de senha.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- React Hook Form + Zod
- Axios
- dnd-kit
- Embla Carousel
- Sonner
- Vitest + Testing Library

## Funcionalidades

- Landing page com hero, carousel e formulário de contato
- Login, cadastro, recuperação e redefinição de senha
- Lista de tarefas autenticada
- Marcação de tarefas como concluídas
- Drag-and-drop entre colunas `To-do` e `Done`
- Toasts para feedback de ações
- Layout responsivo com foco em desktop e mobile

## Pré-requisitos

- Node.js 20+
- npm 10+
- Backend do projeto rodando localmente ou publicado

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:3333
```

`VITE_API_BASE_URL` deve apontar para a API do projeto `coopers-challenge-back`.

## Como rodar localmente

1. Instale as dependências:

```bash
npm install
```

2. Crie o arquivo `.env`:

```bash
cp .env.example .env
```

3. Garanta que o backend esteja rodando em `http://localhost:3333` ou ajuste `VITE_API_BASE_URL`.

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

5. Abra a URL exibida pelo Vite no navegador.

## Scripts disponíveis

```bash
npm run dev
```

Inicia o servidor de desenvolvimento com hot reload.

```bash
npm run build
```

Gera o build de produção em `dist/`.

```bash
npm run preview
```

Serve localmente o build gerado.

```bash
npm run lint
```

Executa o lint do projeto.

```bash
npm test
```

Executa a suíte de testes com Vitest.

```bash
npm run test:watch
```

Executa os testes em modo watch.

## Estrutura principal

```text
src/
  components/
  context/
  hooks/
  mocks/
  pages/
  services/
  types/
```

## Fluxo de autenticação

- O token JWT é armazenado no cliente.
- A aplicação reidrata a sessão ao carregar a página.
- Respostas `401` invalidam a sessão no frontend de forma centralizada.

## Integração com o backend

Principais dependências do frontend em relação à API:

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/me`
- `GET /todos`
- `POST /todos`
- `PATCH /todos/:id`
- `PATCH /todos/reorder`
- `DELETE /todos/:id`
- `DELETE /todos?column=todo|done`
- `GET /carousel-posts`
- `POST /contact`

## Testes

O projeto possui testes focados em fluxos críticos de UI, incluindo:

- modal de autenticação
- hidratação e invalidação de sessão
- comportamento do card de tarefas

## Observações

- Para usar autenticação, todos e contato, o backend precisa estar configurado corretamente.
- Se o backend estiver indisponível ou sem acesso ao banco, partes autenticadas da interface não irão funcionar.
- Este repositório não inclui segredos. Nunca publique o arquivo `.env`.
