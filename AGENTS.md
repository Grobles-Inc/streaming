# AGENTS.md

## 0. Project Stack

- **Frontend:** React 19, Vite 6, TypeScript 5.8
- **Styling:** Tailwind v4 (`@tailwindcss/vite`), shadcn/ui (style `new-york`, base `slate`, CSS variables)
- **Backend/DB:** Supabase — Postgres, Auth, Storage, Realtime, RPCs
- **Server-side:** Netlify Functions (`netlify/functions/*.js`, Node 22) for secrets and privileged work
- **Hosting:** Netlify (`netlify.toml`)
- **Routing:** TanStack Router (file-based, `src/routes`)
- **Data:** TanStack Query v5, TanStack Table v8
- **Forms/validation:** react-hook-form + zod
- **State:** zustand (global), React context (feature/UI)
- **Others:** sonner (toasts), recharts, date-fns, axios, imapflow (Netlify functions only)
- **Tooling:** ESLint, Prettier (sort-imports + tailwindcss plugins), knip, Bun

---

## 1. Context

Working with Brayan — expert React developer.
Direct colleague tone. No fluff, no AI empathy, no filler.

---

## 2. Planning Protocol

- Read the files you need before proposing anything. Explore the codebase freely; don't ask where a well-known file lives.
- Never assume file structure, existing logic, or types. If something is genuinely ambiguous, ask before writing.
- For non-trivial work (new feature, integration, multi-file change): state the plan — files to touch, approach, assumptions — and wait for confirmation. Small fixes and isolated changes: just do them.
- When `@file` references are provided, use them as the primary context.
- Break work into small iterative steps and report what changed.

---

## 3. Forbidden Commands

**Never run project scripts** — dev, build, lint, format, knip, or typecheck. Brayan runs all of them manually. If you think a check is needed, say which one and let him run it.

Available commands, for reference only:

| Command | Purpose |
|---------|---------|
| `bun run dev` | Vite dev server |
| `bun run build` | `tsc -b && vite build` |
| `bun run lint` | ESLint |
| `bun run format:check` / `bun run format` | Prettier |
| `bunx tsc -b` | Typecheck |
| `bun run knip` | Unused files/exports/deps |

---

## 4. Package Manager

Always use **Bun** (`bun.lock`). Never `npm`, `yarn`, or `pnpm`.

---

## 5. Available CLI Tools (use over defaults when applicable)

- `rg` (ripgrep) — use instead of `grep`/`find -exec grep` for all text search
- `fd` — use instead of `find` for file search
- `ast-grep` (sg) — use for structural code search/rewrite instead of regex when refactoring (renaming, signature changes, pattern-based edits)
- `jq` — use for parsing/transforming JSON output instead of manual string parsing

Rule: if a task matches one of these tools' purpose, use it. Don't fall back to slower built-ins when the optimized tool is available and listed above.

---

## 6. Language

- **Spanish** for the domain: table/column names (`compras`, `recargas`, `billeteras`, `retiros`), feature folders, sub-feature folders, page/component names, UI copy, and user-facing messages/toasts.
- **English** for infrastructure: `routes/`, `lib/`, `services/`, `queries/`, `hooks/`, `stores/`, `config/`, type filenames, and architecture-level naming.
- Prettier: no semicolons, single quotes (including JSX), 2-space indent, 80 columns. Import order is enforced by `@trivago/prettier-plugin-sort-imports` — don't hand-order imports.

---

## 7. Feature Scope

- All changes must stay within the current feature scope.
- Never modify files outside the feature unless strictly required.
- If a change outside scope is unavoidable, flag it explicitly and wait for confirmation before touching it.
- `src/routeTree.gen.ts` is generated (TanStack Router plugin). Never edit it by hand.

---

## 8. Feature Architecture

All domain features live under `src/features/`, grouped by role/domain, then by sub-feature.

```
src/features/
  vendedor/
    compras/
      data/          # types.ts, schema.ts, data.ts (constants/options for tables/filters)
      services/      # Supabase calls — index.ts and/or <concern>.service.ts
      queries/       # TanStack Query hooks (index.ts) + query keys
      hooks/         # local/imperative UI state, realtime subscriptions
      components/    # table, columns, dialogs, modals — feature-scoped only
      context/       # feature UI state (dialog control, cross-component selection)
      index.ts(x)    # public surface: page + re-exports
      <name>-page.tsx
```

Domains in use: `admin/`, `vendedor/`, `proveedor/`, `auth/`, `landing/`, `security/`, `users/`, `settings/`, `dashboard/`, `chats/`, `tasks/`, `apps/`, `errors/`.

### Rules

- **Data flows one way:** `services → queries → components`. `data/` holds the types, zod schemas, and mappers shared by those layers — it never imports from them.
- `services/` is the layer that talks to Supabase (`@/lib/supabase`). Never call Supabase from a component. Some existing `hooks/` call it directly (legacy) — don't replicate that; put new queries in `queries/`.
- New server data goes through `queries/` (TanStack Query `useQuery`/`useMutation`, `queryKey` exported as a constant, `invalidateQueries` on success, `sonner` toast on user-facing errors). `hooks/` is for local state, realtime subscriptions, and imperative flows.
- Business logic never lives in components — put it in `services/` (data) or `queries/`/`hooks/` (orchestration).
- `data/types.ts` derives DB types from `@/types/supabase`: `Database['public']['Tables']['<tabla>']['Row' | 'Insert' | 'Update']`. Never hand-write a shape Supabase already generates.
- `data/schema.ts` holds zod schemas and row→view mappers (`mapXToComponent`) when the UI needs a shaped object.
- UI state (dialogs, selection) goes in `stores/` (zustand) or the feature's `context/` — never derived server data.
- Routes import the feature only through its entry point (`@/features/<dominio>/<sub-feature>`).

### Shared (outside `features/`)

`src/components/` (with `ui/` for shadcn-generated components and `layout/`), `src/lib/`, `src/hooks/`, `src/stores/`, `src/context/`, `src/services/`, `src/queries/`, `src/types/`, `src/utils/`, `src/config/`.

These hold cross-cutting code only. Top-level `services/` + `queries/` are the shared/legacy layer — don't grow them; new feature code belongs inside the feature.

---

## 9. Routes

- File-based TanStack Router. Routes mirror URL structure: `src/routes/(public)/`, `src/routes/(auth)/`, `src/routes/_authenticated/<role>/<page>/index.tsx`.
- A route file is thin: import the feature page and render it. No data fetching, no business logic.

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { RecargasPage } from '@/features/admin/recargas'

export const Route = createFileRoute('/_authenticated/admin/recargas/')({
  component: () => <RecargasPage />,
})
```

- **Authorization:** role-restricted routes guard in `beforeLoad` with `requireRole([...])` from `@/utils/role-guard` (roles are `admin`, `vendedor`, `proveedor`, from `@/components/layout/types`):

```tsx
export const Route = createFileRoute('/_authenticated/admin/users/')({
  beforeLoad: () => requireRole(['admin']),
  component: RouteComponent,
})
```

Client-side guards are UX only — real enforcement is RLS/policies in Postgres.

---

## 10. Backend & Data Access

- **Client:** `@/lib/supabase` (anon key, session persisted). Storage uploads go through `SupabaseStorageService` in the same file.
- **Generated types:** `@/types/supabase` — the source of truth for every table/row type.
- **Storage:** serve images through the Netlify `image-proxy` (`getProxiedImageUrl`) to cut Supabase egress; never render raw Supabase storage URLs in lists.
- **Schema changes:** new timestamped SQL file in `supabase/migrations/` (e.g. `20261016_<descripcion>.sql`). Never edit an applied migration.
- **Server-side work in Postgres:** pagination, search, filtering, and authorization-sensitive updates belong in RPCs called via `supabase.rpc(...)` (e.g. `get_recargas_admin`, `marcar_cuenta_actualizada_revisada`). Don't pull a full table to the client to paginate it.
- **Netlify Functions** (`netlify/functions/*.js`) are for anything needing secrets or Node-only libs, and must stay the only place reading those secrets:
  - `image-proxy` — CDN-cached Supabase storage proxy
  - `imap-request-code`, `imap-save-config` — IMAP/Vault flows
  - `security-gate` — Turnstile verification + IP/ASN policy (fail closed)
- Secrets live in Netlify env vars. Never hardcode or expose them in client code, and never log credentials or verification codes.
- The frontend calls functions with `fetch`/`axios`. There are no Supabase Edge Functions in this project.

---

## 11. UI Philosophy

- Use **shadcn/ui** defaults (add with `bunx shadcn@latest add <component>`). Never customize component styles.
- No custom colors, borders, gradients, or shadows.
- Use Tailwind only when strictly necessary — no decorative utility classes.
- Stick to design system tokens exclusively (`src/index.css`).
- Tables follow the existing pattern: local `data-table.tsx` + `columns.tsx` / `<name>-columns.tsx`, plus pagination and toolbar components copied per feature.
- Icons: `lucide-react` is the configured shadcn library; `@tabler/icons-react` is also in use. Match the file you're editing.

---

## 12. Pattern Replication

For medium or complex tasks (new functionality, non-trivial integrations, multi-file changes):

- Explore the codebase first and identify how similar problems are already solved.
- Match existing patterns for: fetching, routing, state management, backend interaction, file structure, and component composition.
- If a new feature touches a domain that already exists, copy the closest existing sub-feature layout instead of inventing one.
- Never invent a new pattern if an existing one already covers the case.
- If no clear pattern exists, flag it and ask before proceeding.

Not required for simple tasks (small fixes, isolated UI changes, refactors with clear scope).
