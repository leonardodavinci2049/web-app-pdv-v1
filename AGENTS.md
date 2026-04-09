# Project Guidelines

These instructions apply across the repository. If a subdirectory contains its own `AGENTS.md`, follow the closest file instead of this root guide.

## Architecture

- This is a server-first Next.js 16.2 / React 19 application with React Compiler enabled.
- Route `page.tsx` and `layout.tsx` files must remain Server Components. Isolate interactivity in small client subcomponents.
- The codebase uses two service families. Stay inside the family already used by the feature you are editing:
  - `src/services/api-main/`: external API integration modules with `*-service-api.ts`, optional `*-cached-service.ts`, `validation/`, `types/`, and `transformers/`
  - `src/services/db/`: direct MySQL and CRM services
- Many service modules under `src/services/api-main/*` have their own `AGENTS.md` with endpoint, payload, and cache details. Read the nearest one before changing a service contract.

## Core Conventions

- Prefer existing local patterns over introducing new abstractions. Start from the component, action, or service that already controls the behavior.
- Use absolute `@/` imports for code under `src/`.
- Follow Biome formatting: 2 spaces, no trailing semicolons.
- Keep TypeScript strict. Use `unknown` instead of `any` unless there is a proven need.
- Preserve the existing Entity -> DTO and schema-validation layers. Extend the current transformer or Zod schema rather than bypassing it.

## Mutations, Auth, and Cache

- Every create, update, or delete path must enforce authentication or auth context before mutating data.
- Reuse the area's existing helper when one already owns auth and API context. In dashboard flows, `getAuthContext()` is often the correct entry point instead of hand-rolled session logic.
- All mutations must revalidate the affected cache tags with `revalidateTag()`. Add `revalidatePath()` only when the page path also needs a refresh.
- Do not add client-side data mutations when the feature already uses Server Actions.

## UI and Form Patterns

- Internal dashboard pages use only two content widths: default `max-w-[1400px]` or full-width. Do not invent extra width variants.
- The project is mobile-first and supports both light and dark themes. Preserve the established Radix/Shadcn/Tailwind patterns in the area you touch.
- Prefer the current form flow: `next/form` plus `useActionState`, with a thin client form component and an authenticated Server Action.
- Recent dashboard work favors sectioned forms and reusable server actions over large monolithic client screens. Extend the existing flow before creating a parallel one.

## Build and Validation

- `pnpm dev`: start the development server with `.env`
- `pnpm build`: production build
- `pnpm start`: start the production server with `.env`
- `pnpm lint`: run Biome checks
- `pnpm format`: apply Biome formatting
- `pnpm generate:schema`: regenerate schema artifacts when database schema types change
- There is no dedicated test script in `package.json`. Use the narrowest available validation for the slice you changed, then run `pnpm lint` or `pnpm build` when the scope justifies it.

## Documentation Index

- Project overview and setup: [README.md](README.md)
- API endpoint references: [docs/api-reference/prompt.md](docs/api-reference/prompt.md) and the feature folders under `docs/api-reference/`
- CRM planning and schema notes: [docs/CRM/crm-brainstorm.md](docs/CRM/crm-brainstorm.md) and [docs/CRM/plano-acao-implementacao-crm.md](docs/CRM/plano-acao-implementacao-crm.md)
- Inline field update workflow: [.github/agents/inline-update-field.agent.md](.github/agents/inline-update-field.agent.md)

## Current Feature Pointers

- CRM is an active dashboard area under `src/app/dashboard/crm/` backed by `src/services/db/crm-*` services.
- Budget and order flows include customer creation via sectioned dialogs and authenticated Server Actions under `src/app/dashboard/order/new-budget/`.
- If you are editing inline update behavior, use the dedicated agent instructions in `.github/agents/inline-update-field.agent.md` and the nearest service-level `AGENTS.md`.
