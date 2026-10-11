# Themed React UI Foundation

One forkable React/TypeScript package for semantic design tokens, scoped themes, Storybook documentation, and an accessible Button foundation.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- `pnpm --filter @workspace/design-system run storybook` — run the token and Button documentation

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Design system: `lib/design-system`, React 19 peer-compatible ESM, TypeScript, CSS Modules, Storybook 10, Vite 7, pnpm
- Design-system source of truth: `lib/design-system/docs/design-system.md` and `lib/design-system/src/tokens/`
- Design-system full gate: `pnpm check`

## Where things live

- `lib/design-system/src/tokens/` — typed token source, ACME/Luna themes, hook registry, and contrast pairs
- `lib/design-system/src/generated/` — deterministic checked-in CSS, type names, and documentation manifest
- `lib/design-system/src/components/Button/` — public Button and its Storybook specification
- `lib/design-system/docs/` — design-system spec, theming, contribution, roadmap, and fork guidance

## Architecture decisions

- Theme selection is CSS-only through nested `data-ds-theme` boundaries; components do not branch on theme names.
- Palette references are resolved by the compiler and are not runtime CSS variables.
- Component hooks reset at theme boundaries to prevent an outer override from leaking into an inner theme.

## Product

- Provides one reusable Button across ACME, Luna, and a custom example theme, with generated tokens and living Storybook documentation.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
