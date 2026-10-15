# Themed React UI Foundation

One forkable React/TypeScript component library for semantic design tokens, five scoped themes, and Storybook documentation.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- `pnpm --filter @workspace/design-system run storybook` — run the design-system component documentation and examples

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Design system: `lib/design-system`, React >=18 peer dependency, ESM, TypeScript, CSS Modules, Storybook 10, Vite 7, pnpm
- Design-system source of truth: `lib/design-system/CONTRIBUTING.md`, `lib/design-system/docs/design-system.md`, and `lib/design-system/src/tokens/`
- Design-system full gate: `pnpm check`

## Where things live

- `lib/design-system/src/tokens/` — typed token source, five built-in themes, hook registry, and contrast pairs
- `lib/design-system/src/generated/` — deterministic checked-in CSS, type names, and documentation manifest
- `lib/design-system/src/components/` — public component implementations, Storybook stories, and component docs
- `lib/design-system/docs/` — design-system spec, theming, component development, roadmap, and fork guidance

## Architecture decisions

- Theme selection is CSS-only through nested `data-ds-theme` boundaries; components do not branch on theme names.
- Palette references are resolved by the compiler and are not runtime CSS variables.
- Component hooks reset at theme boundaries to prevent an outer override from leaking into an inner theme.

## Agent work rule

- Before proposing an approach, planning a task, or starting any work that may affect `lib/design-system/`, read `lib/design-system/CONTRIBUTING.md` first. Then follow `lib/design-system/AGENTS.md` and the relevant component documentation.

## Product

- Provides reusable website, form, editorial, CMS, and layout components across ACME, Luna, Orchid, Atom, and Sublime themes, with generated tokens and living Storybook documentation.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
