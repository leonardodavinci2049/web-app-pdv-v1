<h1 align="center">🛒 PDV WinERP</h1>

<p align="center">
  <strong>Sistema completo de Ponto de Venda (PDV) para administração de vendas, controle de estoque, gestão financeira e emissão de notas fiscais.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.2-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Biome-2.4-60A5FA?style=for-the-badge&logo=biome&logoColor=white" alt="Biome" />
</p>

---

## 📑 Índice

- [📖 Sobre o Projeto](#-sobre-o-projeto)
- [🚀 Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [📦 Pré-requisitos](#-pré-requisitos)
- [⚙️ Instalação e Configuração](#️-instalação-e-configuração)
- [🗂️ Estrutura de Diretórios](#️-estrutura-de-diretórios)
- [📜 Scripts Disponíveis](#-scripts-disponíveis)
- [🛡️ Variáveis de Ambiente](#️-variáveis-de-ambiente)
- [🏗️ Arquitetura](#️-arquitetura)
- [🤝 Contribuição](#-contribuição)
- [📝 Licença](#-licença)

---

## 📖 Sobre o Projeto

**PDV WinERP** é um sistema completo de Ponto de Venda desenvolvido com tecnologias modernas para oferecer controle total do negócio através de uma interface intuitiva e performática.

### Principais Funcionalidades

- **📦 Catálogo de Produtos** — Gerenciamento completo com categorização, marcas, estoque e preços
- **🛒 PDV (Ponto de Venda)** — Interface de vendas com carrinho, múltiplos métodos de pagamento e integração com clientes
- **🏷️ Gestão de Categorias** — Sistema de taxonomia com categorias e subcategorias hierárquicas
- **📊 Relatórios & Dashboard** — Painéis de vendas, produtos, clientes e métricas de negócio com gráficos interativos
- **👥 Gestão de Usuários** — Autenticação com OAuth (Google, GitHub), roles granulares e controle de permissões
- **🏢 Multi-tenancy** — Organizações com gestão de membros, convites e papéis organizacionais
- **📧 Notificações por E-mail** — Verificação de conta, convites de organização e recuperação de senha
- **🌙 Tema Escuro/Claro** — Suporte completo a temas com `next-themes`

### Público-alvo

Pequenas e médias empresas que necessitam de um sistema unificado de ponto de venda, controle de estoque e gestão financeira.

---

## 🚀 Tecnologias Utilizadas

| Categoria | Tecnologia |
|---|---|
| **Framework** | Next.js 16+ com React Compiler |
| **Linguagem** | TypeScript 5.9 (strict mode) |
| **UI** | Radix UI + Tailwind CSS 4 + Shadcn/ui (New York) |
| **Banco de Dados** | MySQL com mysql2 (queries raw, Entity → DTO) |
| **Autenticação** | Better Auth com OAuth (Google, GitHub) + 2FA |
| **Formulários** | React Hook Form + Zod validation |
| **Data Fetching** | Axios com cached services |
| **Drag & Drop** | @dnd-kit |
| **Gráficos** | Recharts |
| **E-mail** | React Email + Resend |
| **QR Code** | react-qr-code |
| **Ícones** | Lucide React + Tabler Icons |
| **Linting/Formatting** | Biome 2.4 |
| **Package Manager** | pnpm |

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** >= 18.x
- **pnpm** >= 9.x
- **MySQL** >= 8.0
- **Git**

---

## ⚙️ Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/web-app-pdv-v1.git
cd web-app-pdv-v1
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com base no exemplo abaixo (veja seção [Variáveis de Ambiente](#️-variáveis-de-ambiente)):

```bash
cp .env.example .env
```

Preencha as variáveis com os valores do seu ambiente.

### 4. Execute o projeto

```bash
# Desenvolvimento
pnpm dev

# Produção
pnpm build
pnpm start
```

O servidor estará disponível em `http://localhost:3000`.

---

## 🗂️ Estrutura de Diretórios

```
src/
├── app/                    # Next.js App Router (páginas e rotas de API)
│   ├── (auth)/             # Páginas de autenticação (sign-in, forgot-password, etc.)
│   ├── actions/            # Server Actions para mutações de dados
│   ├── admin/              # Painel administrativo
│   ├── api/                # Rotas de API (auth handlers, webhooks)
│   ├── brand/              # Gestão de marcas (CRUD completo)
│   └── dashboard/          # Dashboard principal com relatórios
│       ├── product/        # Catálogo e detalhes de produtos
│       └── report/         # Relatórios (vendas, clientes, produtos)
├── components/             # Componentes React reutilizáveis
│   ├── auth/               # Componentes de autenticação
│   ├── common/             # Componentes genéricos compartilhados
│   ├── dashboard/          # Componentes do dashboard
│   ├── emails/             # Templates de e-mail (React Email)
│   ├── header/             # Cabeçalho e navegação
│   ├── theme/              # Provider de temas
│   └── ui/                 # Componentes Shadcn/ui (button, card, table, etc.)
├── core/                   # Utilitários centrais
│   ├── config/             # Configuração e validação de variáveis de ambiente
│   ├── constants/          # Constantes da aplicação
│   └── logger.ts           # Sistema de logging
├── db/                     # Definição de schema do banco de dados
├── hooks/                  # Custom React Hooks
├── lib/                    # Utilitários compartilhados
│   ├── auth/               # Configuração Better Auth, permissões e roles
│   ├── axios/              # Instância Axios configurada
│   ├── translations/       # i18n (pt-BR, en)
│   └── validations/        # Schemas Zod compartilhados
├── server/                 # Lógica server-side (auth, membros, permissões)
├── services/               # Camada de serviços
│   ├── api-main/           # Serviços REST da API principal
│   ├── api-assets/         # Serviço de assets/imagens
│   ├── api-cep/            # Serviço de consulta de CEP
│   └── db/                 # Serviços de banco de dados (mysql2)
├── types/                  # Definições TypeScript
└── utils/                  # Funções utilitárias
```

---

## 📜 Scripts Disponíveis

| Script | Comando | Descrição |
|---|---|---|
| **Dev** | `pnpm dev` | Inicia o servidor de desenvolvimento com carregamento de `.env` via dotenv |
| **Build** | `pnpm build` | Gera o build de produção otimizado |
| **Start** | `pnpm start` | Inicia o servidor de produção com carregamento de `.env` via dotenv |
| **Lint** | `pnpm lint` | Executa o linter Biome para verificação de código |
| **Format** | `pnpm format` | Formata o código automaticamente com Biome |

---

## 🛡️ Variáveis de Ambiente

O projeto requer as seguintes variáveis de ambiente. Crie um arquivo `.env` na raiz do projeto:

### Variáveis Públicas (expostas ao cliente)

```env
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_DEVELOPER_NAME=
NEXT_PUBLIC_DEVELOPER_URL=
NEXT_PUBLIC_COMPANY_NAME=
NEXT_PUBLIC_COMPANY_PHONE=
NEXT_PUBLIC_COMPANY_EMAIL=
NEXT_PUBLIC_COMPANY_WHATSAPP=
NEXT_PUBLIC_COMPANY_META_TITLE_MAIN=
NEXT_PUBLIC_COMPANY_META_TITLE_CAPTION=
NEXT_PUBLIC_COMPANY_META_DESCRIPTION=
```

### Variáveis do Servidor (privadas)

```env
# Servidor
PORT=

# API Externa
EXTERNAL_API_MAIN_URL=
EXTERNAL_API_ASSETS_URL=
APP_ID=
STORE_ID=

# Banco de Dados
DATABASE_URL=
DATABASE_HOST=
DATABASE_PORT=
DATABASE_NAME=
DATABASE_USER=
DATABASE_PASSWORD=

# Autenticação (Better Auth)
API_KEY=
BETTER_AUTH_URL=
BETTER_AUTH_SECRET=

# OAuth - GitHub
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# OAuth - Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# E-mail (Resend)
RESEND_API_KEY=
EMAIL_SENDER_NAME=
EMAIL_SENDER_ADDRESS=
```

> ⚠️ **Nunca** commite o arquivo `.env` com valores reais. Adicione-o ao `.gitignore`.

---

## 🏗️ Arquitetura

O projeto segue uma arquitetura **Server-First**:

```
┌─────────────────────────────────────────────────┐
│                   Next.js App Router             │
│  ┌──────────────┐  ┌─────────────────────────┐  │
│  │  Pages (RSC)  │  │  Layouts (RSC)          │  │
│  └──────┬───────┘  └────────┬────────────────┘  │
│         │                   │                    │
│  ┌──────▼───────────────────▼────────────────┐  │
│  │         Server Actions (Mutations)         │  │
│  └──────────────────┬───────────────────────┘   │
│                     │                            │
│  ┌──────────────────▼───────────────────────┐   │
│  │           Services Layer                  │   │
│  │  ┌─────────────┐  ┌──────────────────┐   │   │
│  │  │  API Main    │  │  DB Services     │   │   │
│  │  │  (Axios)     │  │  (mysql2 raw)    │   │   │
│  │  └─────────────┘  └──────────────────┘   │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │    Client Components (isolados)           │   │
│  │    Hooks · Forms · Interatividade         │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Princípios

- **Server Components** como padrão para renderização no servidor
- **Server Actions** exclusivamente para mutações de dados
- **Client Components** isolados apenas onde necessário para interatividade
- **Entity → DTO Pattern** para transformação de dados entre banco e aplicação
- **Zod validation** em todas as fronteiras de dados
- **React Compiler** ativado para otimização automática de componentes

---

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/minha-feature`)
3. Siga o padrão de código do projeto (execute `pnpm lint` e `pnpm format`)
4. Commit suas mudanças com mensagens descritivas
5. Envie um Pull Request

### Padrões do Projeto

- **Código**: Formatado com Biome (2 espaços de indentação)
- **Imports**: Use `@/` como alias para `src/` — sem imports relativos
- **Componentes**: Server Components por padrão; Client Components isolados em pasta `components/`
- **Tipagem**: TypeScript strict — sem uso de `any`
- **Comentários**: Escritos em Português para conceitos de domínio

---

## 📝 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

<p align="center">
  Feito com ❤️ usando <strong>Next.js</strong>, <strong>React</strong> e <strong>TypeScript</strong>
</p>