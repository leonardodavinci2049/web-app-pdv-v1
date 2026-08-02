# Project Guidelines

These instructions apply across the repository. If a subdirectory contains its own `AGENTS.md`, follow the closest file instead of this root guide.

## Architecture

- Server-first Next.js 16.2 / React 19 application with React Compiler (`reactCompiler: true` in `next.config.ts`) and component caching (`cacheComponents: true`).
- Route `page.tsx` and `layout.tsx` files must remain Server Components. Isolate interactivity in small client subcomponents.
- The codebase uses two service families. Stay inside the family already used by the feature you are editing:
  - `src/services/api-main/`: external REST API integration. Each module has `*-service-api.ts`, optional `*-cached-service.ts`, `types/`, `validation/`, and `transformers/`. Most modules have their own `AGENTS.md` — read it before changing a service contract.
  - `src/services/db/`: direct MySQL services via `src/database/dbConnection.ts` singleton (raw queries, no ORM).
- There is no ORM. All database access is raw SQL through mysql2. Schema types are auto-generated at `src/database/schema.ts` by `pnpm generate:schema` (requires a running MySQL database with the env vars from `.env`).

## Core Conventions

- Prefer existing local patterns over introducing new abstractions. Start from the component, action, or service that already controls the behavior.
- Use absolute `@/` imports for code under `src/`. No relative path imports.
- Biome formatting: 2-space indent, no semicolons. Run `pnpm format` to auto-fix, `pnpm lint` to check.
- TypeScript strict mode. Use `unknown` instead of `any` unless there is a proven need.
- Preserve the existing Entity → DTO and schema-validation layers. Extend the current transformer or Zod schema rather than bypassing it.
- All service files use `import "server-only"` as the first import to prevent accidental client-side inclusion.

## Language policy

- **US English** for all code artifacts: code comments, documentation files, READMEs, file names, debug/log messages, variable/function names, and error class names (e.g. `DatabaseConnectionError`, not `ErroConexaoBancoDados`).
- **Brazilian Portuguese (pt-BR)** only for user-facing UI text and messages, since the system's audience is Brazilian. This includes toast messages, form labels, validation messages shown to the user, and email templates.
- The `pe_` prefix on API parameters is an external API convention — preserve it as-is when calling those endpoints, but do not use Portuguese for new internal names.

## Validation: Zod 4

- This project uses **Zod 4** (`"zod": "^4.3.6"`). The import is `import { z } from "zod"` — same surface as v3 for basic usage, but some APIs differ (e.g. `z.coerce`, error maps, `.refine` behavior). Check existing schemas in the module you are editing before writing new ones.
- Env vars are validated at startup in `src/core/config/envs.ts` using Zod.

## Mutations, Auth, and Cache

- Every create, update, or delete path must enforce authentication or auth context before mutating data.
- **Auth entry point**: `getAuthContext()` from `src/server/auth-context.ts` returns the session and an `apiContext` object with the `pe_*` fields needed by the external API (`pe_organization_id`, `pe_user_id`, `pe_user_name`, `pe_user_role`, `pe_person_id`). Use this instead of hand-rolled session logic in dashboard flows.
- **Auth config**: `src/lib/auth/auth.ts` (server), `src/lib/auth/auth-client.ts` (client). Authentication is Better Auth with OAuth plugins.
- All mutations must revalidate the affected cache tags with `revalidateTag()`. Tags are defined in `src/lib/cache-config.ts` (`CACHE_TAGS`). Add `revalidatePath()` only when the page path also needs a refresh.
- Caching uses Next.js 16 `'use cache'` directive with `cacheLife` profiles defined in `next.config.ts` (`seconds`, `frequent`, `quarter`, `hours`, `daily`) and `cacheTag()` for granular invalidation.
- Do not add client-side data mutations when the feature already uses Server Actions.

## UI and Form Patterns

- Internal dashboard pages use only two content widths: default `max-w-[1400px]` or full-width. Do not invent extra width variants.
- Mobile-first, supports light and dark themes. Uses Radix/Shadcn/Tailwind patterns — Shadcn "new-york" style, base color "stone", Tailwind CSS v4 with `@tailwindcss/postcss`.
- Prefer the current form flow: `next/form` plus `useActionState`, with a thin client form component and an authenticated Server Action.
- Recent dashboard work favors sectioned forms and reusable server actions over large monolithic client screens. Extend the existing flow before creating a parallel one.

## Build and Validation

- `pnpm dev`: start development server (loads `.env` via `dotenv-cli`)
- `pnpm build`: production build (does NOT load `.env` — env vars must be set in the build environment)
- `pnpm start`: start production server (loads `.env` via `dotenv-cli`)
- `pnpm lint`: Biome checks
- `pnpm format`: apply Biome formatting
- `pnpm generate:schema`: regenerate `src/database/schema.ts` from a live MySQL database. Requires `DATABASE_ADMIN_HOST`, `DATABASE_ADMIN_PORT`, `DATABASE_ADMIN_NAME`, `DATABASE_ADMIN_USER`, `DATABASE_ADMIN_PASSWORD` in `.env`.
- There is no test script. Use `pnpm lint` or `pnpm build` for validation after changes.

## Service Module Pattern (api-main)

Each module under `src/services/api-main/` typically contains:
- `*-service-api.ts` — extends `BaseApiService`, exports a singleton instance
- `types/` — TypeScript interfaces for request/response
- `validation/` — Zod schemas (`.parse()` for validation)
- `transformers/` — Entity → DTO transformation functions (optional)
- `index.ts` — public barrel exports

API parameter naming convention: prefix `pe_` for all parameters sent to the external API. Context parameters (`pe_app_id`, `pe_store_id`, `pe_organization_id`, `pe_user_id`, etc.) are included via `buildBasePayload()`.

## Key Directories

| Path | Purpose |
|---|---|
| `src/app/dashboard/` | Main dashboard area (orders, CRM, products, reports, settings) |
| `src/app/actions/` | Top-level Server Actions for data mutations |
| `src/app/dashboard/crm/actions/` | CRM-specific Server Actions |
| `src/services/api-main/` | External REST API services (20 modules) |
| `src/services/db/` | Direct MySQL services (auth, CRM, agenda, logs) |
| `src/database/` | DB connection pool and auto-generated schema types |
| `src/server/` | Server-side auth context, permissions, organizations |
| `src/lib/auth/` | Better Auth config, permissions, roles |
| `src/core/config/envs.ts` | Zod-validated environment variable config |
| `src/lib/cache-config.ts` | Cache tags and profiles |

## Documentation Index

- Project overview and setup: [README.md](README.md)
- API endpoint references: [docs/api-reference/](docs/api-reference/)
- CRM planning: [docs/CRM/](docs/CRM/)
