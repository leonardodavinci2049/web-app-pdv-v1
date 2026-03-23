# Agent Guidelines for web-app-pdv-v1

This document provides essential conventions for code agents in this repository.

## Critical Rules

**These rules are mandatory and must always be followed:**

1. **Server First**: Always prioritize server-side components. When you need interactivity (hooks, event listeners), create a subcomponent and isolate the functionality.

2. **Route Pages**: MUST be Server Components (page.tsx, layout.tsx).

3. **Cache Invalidation**: All create, update, and delete operations must revalidate cache with `revalidateTag()`.

4. **Server Actions with Auth**: For security, server action functions must always check if a user session exists.

5. **Next.js 16+**: Project uses Next.js version 16+ with React Compiler (component cache enabled).

6. **Mobile-first**: Project is mobile-first with light and dark themes.

## Overview

**PDV WinERP** - Point of Sale system with product catalog, inventory management, sales, reports, and multi-tenancy.

## Architecture

**Server-First** with Next.js 16 + React Compiler:

- **Server Components**: Default pattern
- **Server Actions**: Exclusively for mutations
- **Client Components**: Isolated only where necessary
- **Services Layer**: Separation API Service ↔ Cached Service
- **Entity → DTO**: Data transformation between layers

## Stack

- **Framework**: Next.js 16+ with **React 19** and **React Compiler** (component cache enabled)
- **UI**: Radix UI + Tailwind CSS + Shadcn
- **Design**: Mobile-first with light and dark themes
- **Database**: MySQL with mysql2 (raw queries)
- **Auth**: Better Auth (OAuth: Google, GitHub)
- **Forms**: Next Form + Server Actions
- **Validation**: Zod
- **HTTP**: Axios (server-only)
- **Cache**: Next.js 16 `use cache` directive
- **Email**: React Email + Resend
- **Charts**: Recharts

## Commands

```bash
pnpm dev    # Start dev server (requires .env)
pnpm build  # Production build
pnpm lint   # Biome check
pnpm format # Biome format
```

## Project Structure

```
src/
├── app/                    # App Router pages (Server Components)
├── components/
│   ├── ui/                 # Shadcn components
│   └── dashboard/          # Dashboard components
├── core/                   # Config, constants, logger
├── db/                     # DB schema types
├── lib/                    # Utils, auth, axios, cache config
├── server/                 # Server Actions (mutations only)
├── services/
│   ├── db/                 # MySQL services (mysql2)
│   └── api-main/           # External API services
│       └── [feature]/
│           ├── *-service-api.ts       # API integration
│           ├── *-cached-service.ts    # Cache + transform
│           ├── types/                 # TypeScript types
│           ├── validation/            # Zod schemas
│           └── transformers/          # Entity→DTO
└── types/                  # Shared types
```

## Code Style

### Essential Rules

- **Server First**: Always Server Component by default
- **Route Pages/Layouts**: MUST be Server Components
- **Client Components**: Isolate in `components/` of parent directory only when needed for interactivity
- **Priority**: Always prioritize server-side components. When you need interactivity (hooks, event listeners), create a subcomponent and isolate the functionality
- **Imports**: Absolute with `@/` (no relative for src)
- **Biome**: 2 spaces, no trailing semicolons
- **TypeScript**: Strict, `unknown` instead of `any`

### Naming

- **Files**: kebab-case (`submit-button.tsx`, `auth.service.ts`)
- **Components**: PascalCase (`SubmitButton`)
- **Functions**: camelCase (`useIsMobile`, `findById`)
- **Constants**: UPPER_SNAKE_CASE (`API_TIMEOUTS`)

## UI/UX Layout Patterns

### Dashboard Content Width

For internal dashboard pages, the dashboard shell must remain full width. Only the content area inside the page may change width.

Use only these two content-width patterns for internal dashboard pages:

- **Default content width**: `1400px` maximum width
- **Full content width**: full available width of the content area

Important rules:

- Do not create additional content-width variants for internal dashboard pages
- When a page is not explicitly designed as full-width, use the `1400px` max-width pattern
- Full-width pages should be used only when the screen needs maximum horizontal space (for example: dense data tables, operational panels, complex side-by-side layouts)
- When developing a new internal dashboard page, always ask whether the page should use `1400px` max-width content or full-width content

## Service Patterns

### API Service Pattern (External API Integration)

**Structure in `src/services/api-main/[feature]/`:**

```
[feature]/
├── *-service-api.ts       # Class extending BaseApiService
├── *-cached-service.ts    # Functions with 'use cache'
├── types/                 # Request/Response types, Error classes
├── validation/            # Zod schemas
├── transformers/          # Entity→DTO (API→UI)
└── index.ts               # Public exports
```

**Service API (`*service-api.ts`):**

```typescript
import "server-only";
import { BaseApiService } from "@/lib/axios/base-api-service";
import * as schemas from "./validation/*-schemas";

export class FeatureServiceApi extends BaseApiService {
  async findFeatureById(
    params: FindByIdRequest,
  ): Promise<ApiResponse<FeatureResponse>> {
    schemas.FindByIdSchema.parse(params); // Validate with Zod
    return this.post<FeatureResponse>("/endpoint", params);
  }
  // Helper methods: extract*, transform*, validate*
}

export const featureServiceApi = new FeatureServiceApi();
```

**Cached Service (`*-cached-service.ts`):**

```typescript
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-config";
import { featureServiceApi } from "./feature-service-api";
import { transformFeature } from "./transformers/transformers";

export async function getFeatureById(id: string): Promise<UIFeature> {
  "use cache";
  cacheLife("hours"); // hours, frequent, daily, seconds
  cacheTag(CACHE_TAGS.feature(id));

  const response = await featureServiceApi.findFeatureById({ id });
  return transformFeature(response.data);
}
```

### DB Service Pattern (Direct MySQL)

**Location:** `src/services/db/`

```typescript
import "server-only";
import dbService from "@/database/dbConnection";
import { z } from "zod";

async function findById(params: {
  id: string;
}): Promise<ServiceResponse<User>> {
  try {
    z.string().min(1).parse(params.id);
    const query = "SELECT id, name FROM user WHERE id = ? LIMIT 1";
    const results = await dbService.selectExecute<UserEntity>(query, [
      params.id,
    ]);
    return { success: true, data: mapEntityToDto(results[0]) };
  } catch (error) {
    return { success: false, error: "Error message" };
  }
}
```

## Cache Patterns

**Next.js 16 `use cache` directive:**

```typescript
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-config";

export async function getData(params: { id: string }): Promise<Data> {
  "use cache";
  cacheLife("hours"); // hours=1h, frequent=5m, daily=24h, seconds
  cacheTag(CACHE_TAGS.feature(params.id)); // Individual tag
  cacheTag(CACHE_TAGS.features); // Global tag
  // fetch logic
}
```

**Profiles defined in `next.config.ts`:**

- `hours`: 1 hour (navigation, categories)
- `frequent`: 5 minutes (products, listings)
- `daily`: 24 hours (footer, static content)

### Cache Invalidation (Mandatory in Mutations)

**All create, update, and delete operations must revalidate cache:**

```typescript
"use server";
import { revalidateTag, revalidatePath } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-config";

export async function createFeature(params: CreateParams) {
  // mutation logic (create)

  // Revalidate individual cache
  revalidateTag(CACHE_TAGS.feature(newId));

  // Revalidate global list cache
  revalidateTag(CACHE_TAGS.features);

  // Optional: revalidate full path
  revalidatePath("/dashboard/feature");
}

export async function updateFeature(params: UpdateParams) {
  // mutation logic (update)

  // Revalidate individual cache
  revalidateTag(CACHE_TAGS.feature(params.id));
  revalidateTag(CACHE_TAGS.features);
}

export async function deleteFeature(params: DeleteParams) {
  // mutation logic (delete)

  // Revalidate individual and global cache
  revalidateTag(CACHE_TAGS.feature(params.id));
  revalidateTag(CACHE_TAGS.features);
}
```

## Authentication Patterns

**Better Auth with Organization Roles:**

```typescript
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({ headers: await headers() });
if (!session) redirect("/sign-in");

// Organization roles: owner, manager, salesperson, operator, cashier, finance, shipping, customer
// Platform roles: superAdmin, user
```

### Server Actions with Authentication (Mandatory)

**For security, server action functions must always check if a user session exists:**

```typescript
"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

export async function myAction(formData: FormData) {
  // MANDATORY: Check user session
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  // mutation logic
}
```

## Form Patterns

**Next Form + Server Actions:**

```typescript
"use client";
import Form from "next/form";
import { useActionState } from "react";

export function MyForm() {
  const [state, formAction] = useActionState(serverAction, null);

  return (
    <Form action={formAction}>
      <Input name="field" required />
      <Button type="submit">Submit</Button>
    </Form>
  );
}
```

**Server Action for Form:**

```typescript
"use server";
import { z } from "zod";

const FormSchema = z.object({
  field: z.string().min(1),
});

export async function serverAction(_prevState: unknown, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const validated = FormSchema.parse(data);
  // mutation logic
  return { success: true, message: "Success" };
}
```

## Client Component Patterns

**Isolate interactivity:**

```typescript
"use client";
// hooks, event listeners, useState
import { useState } from "react";

export function InteractiveComponent() {
  const [value, setValue] = useState("");
  // interactive logic
}
```

**Use in Server Component:**

```typescript
// src/app/page.tsx (Server Component)
import { InteractiveComponent } from "./components/interactive-component";

export default function Page() {
  return <InteractiveComponent />;
}
```

**Important:**

- Always prioritize server-side components
- When you need interactivity (hooks, event listeners), create a subcomponent and isolate the functionality
- Keep client component as lean as possible, transferring fetch logic to parent component (Server Component)

## Error Handling

**Response pattern:**

```typescript
type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

**Log:**

```typescript
import { createLogger } from "@/core/logger";

const logger = createLogger("context");
logger.debug("debug message", data);
logger.info("info message");
logger.warn("warning message");
logger.error("error message", error);
```

## Cache Tags

Defined in `src/lib/cache-config.ts`:

**Dynamic tags:**

- `CACHE_TAGS.product(id)`, `CACHE_TAGS.category(id)`, etc.

**Static tags:**

- `CACHE_TAGS.products`, `CACHE_TAGS.categories`, etc.

## Before Committing

1. Run `pnpm lint`
2. Run `pnpm format`
3. Check absolute imports (no relative for src)
4. Check TypeScript types (no `any`)
5. Test build: `pnpm build`
