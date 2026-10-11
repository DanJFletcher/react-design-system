# Implementation plan

This plan records the first foundation milestone. Work stops after the package can support ACME, Luna, and an example custom theme with one production-ready Button.

## Completed stages

1. **Bootstrap** — one pnpm library package, ESM exports, TypeScript declarations, Storybook/Vite, and a checked-in lockfile.
2. **Tokens** — a small versioned source schema, semantic contract, foundations, component-hook registry, deterministic TypeScript compiler, and stale-output check.
3. **Themes** — complete ACME and Luna maps, plus Orchid as an example custom theme extending Luna. CSS theme boundaries resolve to complete values.
4. **Foundations** — Storybook principles, colors, typography, spacing, themes, and customization pages with token data generated from the manifest.
5. **Button** — native button API, all three variants and sizes, loading/disabled behavior, typed styling, nested themes, and interaction stories.
6. **Verification** — unit checks, design-rule linting, contrast gates, type checking, Storybook interaction tests, Playwright snapshots, and a clean package-consumer smoke test.
7. **Handoff** — contribution rules, implementation and theming documentation, a fork guide, decisions, and the deferred roadmap.

## Completion gates

Run `pnpm check` from the workspace root. It regenerates and verifies token outputs, checks component CSS rules and types, exercises compiler and Storybook interaction tests, builds the package and Storybook, captures visual snapshots, and installs the packed package into a clean consumer.

Review changes to visual snapshots before updating them. The committed token artifacts are generated output; edit the token sources and run `pnpm tokens:build` instead.
