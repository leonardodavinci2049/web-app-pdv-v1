# Agent Guidelines for web-app-pdv-v1

This document provides conventions and guidelines for agentic coding in this repository.

## Visão Geral do Projeto

**PDV WinERP** é um sistema completo de Ponto de Venda (PDV) desenvolvido para administração de vendas, controle de estoque, gestão financeira e emissão de notas fiscais. O sistema oferece controle total do negócio através de uma interface moderna e intuitiva.

### Principais Funcionalidades

- **Catálogo de Produtos**: Gerenciamento completo de produtos com categorização, marcas, estoque e preços
- **PDV (Ponto de Venda)**: Interface de vendas com carrinho, múltiplos métodos de pagamento e integração com clientes
- **Gestão de Categorias**: Sistema de taxonomia com categorias e subcategorias
- **Relatórios**: Dashboard com painéis de vendas, produtos, clientes e métricas de negócio
- **Gestão de Usuários**: Sistema de autenticação com roles (ADMIN, MEMBER, BILLING) e controle de permissões
- **Organizações**: Multi-tenancy com gestão de membros e convites

### Arquitetura

O projeto segue uma arquitetura **Server-First** com:

- **Server Components**: Padrão default para renderização no servidor
- **Server Actions**: Exclusivamente para mutações de dados
- **Client Components Isolados**: Apenas onde necessário para interatividade
- **Services Layer**: Separação clara entre serviços de API e serviços de banco de dados
- **Entity → DTO Pattern**: Transformação de dados entre banco e aplicação

### Stack Tecnológico

- **Framework**: Next.js 16+ com React Compiler
- **UI**: Radix UI + Tailwind CSS + Shadcn components
- **Banco de Dados**: MySQL com mysql2 (queries raw)
- **Autenticação**: Better Auth com OAuth (Google, GitHub)
- **Formulários**: React Hook Form + Zod validation
- **Data Fetching**: Axios com cached services
- **Drag & Drop**: Dnd-kit para componentes interativos
- **Email**: React Email + Resend
- **QR Code**: react-qr-code para geração de códigos
- **Gráficos**: Recharts para visualização de dados

## Build & Development Commands

```bash
pnpm dev              # Start dev server with dotenv (required for DB)
pnpm build            # Production build
pnpm start            # Start production server with dotenv
pnpm lint             # Run Biome linter/checker
pnpm format           # Format code with Biome (auto-fixes)
```


**Principais Tecnologias:**
- **Next.js 16+**: Utiliza as versões mais recentes com **React Compiler** (cache component) ativado.
- **Server Components**: Preferência absoluta por componentes do lado do servidor para performance e SEO.
- **Server Actions**: Utilizados **exclusivamente** para mutações de dados (mutations).

## Project Structure

```
src/
├── app/           # Next.js App Router pages and API routes
├── components/    # React components (client and server)
├── core/          # Core utilities (config, constants, logger)
├── db/            # Database schema definitions
├── hooks/         # React hooks
├── lib/           # Shared utilities (cn helper, auth config)
├── server/        # Server actions (apenas para mutations)
├── services/      # Database and API services
└── types/         # TypeScript type definitions
```

## Code Style Guidelines

### Componentes e Interatividade
- **Server First**: Desenvolva sempre como Server Component por padrão.
- **Componentes de Rota**: Páginas (`page.tsx`) e Layouts (`layout.tsx`) devem ser **obrigatoriamente** Server Components.
- **Isolamento de Client Components**: Se precisar de interatividade (hooks, event listeners), isole essa lógica em um componente separado.
- **Localização de Client Components**: Coloque o componente de cliente em uma pasta `components/` dentro do diretório do componente pai (ex: se o pai está em `src/app/page.tsx`, o componente de cliente fica em `src/app/components/client-component.tsx`).

### Formatting & Linting
- **Biome** for all formatting (2 space indentation).
- Imports organized automatically on save.
- No trailing semicolons.

### Imports
- Path alias `@/` for internal imports (`@/components/ui/button`).
- Order: external libraries, internal modules, styles.
- Absolute imports only - no relative imports for src files.
- Named exports preferred for multiple exports.

### TypeScript
- **Strict mode enabled** - all types must be defined.
- `type` for type aliases, `interface` for object shapes.
- Use `unknown` instead of `any`, `Record<string, unknown>` for dynamic objects.
- `as const` for readonly constant arrays/objects.

### Naming Conventions
- **Files:** kebab-case (`submit-button.tsx`, `auth.service.ts`).
- **Components:** PascalCase (`SubmitButton`, `ThemeProvider`).
- **Functions:** camelCase (`useIsMobile`, `findUserById`).
- **Constants:** UPPER_SNAKE_CASE (`API_TIMEOUTS`, `AUTH_TABLES`).

### Server Actions
```typescript
"use server";
// Use APENAS para mutações (POST, PUT, DELETE)
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

export async function myAction(params: { id: string }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  try {
    // Lógica de mutação
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error message" };
  }
}
```

### Database Services
Services in `src/services/db/` use raw SQL with mysql2 and Entity → DTO pattern:

```typescript
import "server-only";
import { z } from "zod";
import dbService from "@/services/db/dbConnection";

const IdSchema = z.string().min(1).max(128);

async function findById(params: { id: string }): Promise<ServiceResponse<User>> {
  try {
    IdSchema.parse(params.id);
    const query = "SELECT id, name FROM user WHERE id = ? LIMIT 1";
    const results = await dbService.selectExecute<UserEntity>(query, [params.id]);
    return { success: true, data: mapEntityToDto(results[0]), error: null };
  } catch (error) {
    return handleError<User>(error, "findById");
  }
}
export const MyService = { findById } as const;
```

### Error Handling
- Always wrap async operations in try-catch.
- Return standardized: `{ success: boolean, data?: T, error?: string }`.
- Use custom error classes for domain errors.
- Never expose database errors/stack traces to clients.
- Log with `createLogger("context")` from `@/core/logger`.

### Configuration
- Environment vars in `.env` and `.env.local` (don't commit secrets).
- Load with `envs` from `@/core/config/envs`.
- React Compiler enabled in next.config.ts.
- TypeScript strict mode, ES2017 target.

### Comments
- Write in Portuguese for domain concepts (as per existing codebase).
- Keep brief and focused on "why" not "what".
- Don't comment obvious code.

## Before Making Changes
1. Run `pnpm lint` to check code quality.
2. Follow existing patterns in similar files.
3. Use `pnpm format` to auto-format.
4. No relative imports for src files.
5. Ensure all new code is properly typed (no `any`).
