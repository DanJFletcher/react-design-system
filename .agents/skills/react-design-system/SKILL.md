---
name: react-design-system
description: >-
  Build, extend, refactor, review, or document the reusable React/TypeScript
  design-system package in lib/design-system, including its component APIs,
  CSS Modules, design tokens, scoped themes, Storybook stories/docs,
  accessibility, package exports, and tests. Use when a request concerns
  shared UI primitives, compositions, variants, styling contracts, or token
  infrastructure. Do not use for ordinary app screens in artifacts/, backend
  endpoints, or unrelated UI work unless the user explicitly requests a change
  to the shared component library.
---

# React Design System Engineer

You are maintaining **this repository's existing design system**, not inventing a new one. Deliver stable, accessible, token-driven React components with a coherent public API, demonstrable Storybook states, and working consumer exports. Prefer small, traceable changes over large rewrites.

## 1. Read the repository before editing

From the workspace root, read in this order:

1. `lib/design-system/AGENTS.md` — binding package contribution rules and approved scope.
2. `lib/design-system/docs/design-system.md` — public design-system contract.
3. `lib/design-system/docs/component-development.md` — component/API and accessibility expectations.
4. `lib/design-system/docs/theming.md` and `docs/decisions.md` — theming and architectural invariants.
5. The nearest analogous component's `.tsx`, `.module.css`, `.stories.tsx`, and `.docs.mdx` files, plus the relevant existing tests.
6. Relevant source under `src/tokens/`, `scripts/build-tokens.ts`, `src/index.ts`, `package.json`, and `.storybook/`.

Read `references/repo-contract.md` for the maintained source-of-truth map and token workflow. Read `references/component-delivery.md` for the acceptance matrix. Consult `references/learning-sources.md` only when a novel pattern needs external guidance.

**Precedence:** explicit current user request > applicable `AGENTS.md` and existing approved contracts > current implementation plus tests > external examples. If a request conflicts with a contract, explain the tradeoff, suggest the narrowest safe change, and obtain approval for a new public API, deferred component family, new dependency, or architectural migration. Do not interpret a stale roadmap paragraph as permission to remove implemented features: inspect the current code and exports.

## 2. Preserve these architectural invariants

- The target package is `lib/design-system`, published inside this pnpm workspace as `@workspace/design-system`. Do not create a second design-system package or relocate components to `artifacts/`.
- React + TypeScript own rendering, semantics, and interaction. **CSS Modules** own component styles. **CSS custom properties** are the runtime theming/customization API.
- Keep package output ESM and typed; React is a peer dependency. Preserve CSS asset exports and the CSS `sideEffects` rule.
- Do not introduce Tailwind, CSS-in-JS, shadcn-generated components, Radix/React Aria, a new styling engine, or a new token compiler just to implement a feature. External projects are *references*, not dependencies or source-of-truth replacements.
- Keep themes **CSS-driven** using `data-ds-theme`; never branch on `acme`, `luna`, or `orchid` inside component rendering logic.
- ACME is the fallback; Luna and Orchid are supported alternate themes. Nested `ThemeScope` / `data-ds-theme` boundaries must reestablish full semantic values and reset registered component hooks. Watch DOM relocation/portals carefully.
- Preserve existing accessible semantics and behavior when refactoring. No unnecessary polymorphic `as`/`asChild` APIs or generalized plugin systems.

## 3. Follow the design-token contract

Author in `lib/design-system/src/tokens/`; **never hand-edit `src/generated/`**. Existing sources are intentionally project-specific, **not DTCG-format JSON**:

| Layer | Source | Purpose |
| --- | --- | --- |
| Foundations | `foundations.json` | Shared scales and compile-time palette references; palette is not a public CSS API |
| Semantics | `contract.json` + `themes/*.json` | Purpose-named public roles with effective coverage in each theme |
| Component overrides | `component-hooks.json` | Optional typed, registered hooks with local CSS fallbacks and boundary resets |

The custom compiler in `scripts/build-tokens.ts` validates naming, types, units, references, cycles, theme completeness, CSS collisions, and contrast pairs (`contrast-pairs.json`). It emits `src/generated/tokens.css`, complete theme stylesheets, a manifest, and TypeScript token types. Do not bypass it or silently migrate to Style Dictionary/DTCG.

**Choose the least public change:**

1. Reuse an existing semantic role and foundation scale whenever possible.
2. For a component-specific configurable value, register a documented `component-hooks.json` hook and consume it as `var(--ds-component-hook, var(--ds-semantic-or-foundation))`.
3. Add a *new semantic token* only if it expresses a genuinely reusable intent not covered by existing roles. Give it a description, maintain complete effective theme coverage, update contrast pairs when applicable, document its purpose, and rebuild.
4. Add a foundation value only if the shared scale actually lacks a needed primitive; do not add one-off palettes or sizes just for a screenshot.

No unregistered public `--ds-*` properties, hard-coded color values, or nonzero dimensional literals in component CSS. `scripts/check-design-rules.ts` enforces these conventions. Private within-component CSS variables such as `--_button-bg` are acceptable for internal composition. Do not expose them as a public customization contract.

Independent interaction states need independent token mappings: rest/hover/pressed/disabled/focus cannot be assumed to derive automatically from a single override. Verify contrast and visible focus in all effective themes and applicable states.

## 4. Design the component contract *before* implementation

For a new component or significant change, write a brief working plan covering: purpose; consumer use-case; existing alternatives; approved scope; native HTML element; public props/ref/slots; variants and defaults; controlled/uncontrolled state; keyboard/focus/disabled/loading behavior; token roles/hooks; Storybook states; tests; and exclusions. Use the ten-part outline in `docs/component-development.md`.

Design principles:

- Prefer native semantic elements and browser behaviors first (`button`, `input`, `select`, `dialog`, headings, etc.); apply WAI-ARIA only where needed and implement the entire keyboard/focus pattern, not just roles.
- Favor composition and consumer-owned content slots over highly opinionated app-specific logic. Keep data fetching, navigation frameworks, payment rules, validation/business logic, and styling hacks outside the library.
- Use strict explicit TypeScript public types, sensible defaults, `forwardRef` where needed, native props/event forwarding, and a typed `DesignSystemStyle` customization surface consistent with neighboring components.
- Support `className` without requiring consumers to target internal markup. Treat changing rendered semantics, DOM structure relied on by consumers, prop defaults, token names, and CSS exports as compatibility decisions.
- Match existing component conventions instead of forcing a universal abstraction across unlike components. Accessibility state must remain meaningful when props are combined.
- Do not copy UI components from `artifacts/design-system-docs/src/components/ui` or `artifacts/mockup-sandbox/src/components/ui`; those are app/sandbox code, not the library's authoritative components.

## 5. Implement as a complete library change

For a new component `Thing`, match the local pattern:

```text
lib/design-system/src/components/Thing/
  Thing.tsx
  Thing.module.css
  Thing.stories.tsx
  Thing.docs.mdx
```

Also update, as necessary:

- `lib/design-system/src/index.ts` — component **and public type** exports.
- Existing style/package entrypoints if required by the build; verify output rather than guessing.
- `lib/design-system/docs/design-system.md`, `docs/component-development.md`, `docs/theming.md`, `docs/roadmap.md`; add an entry to `docs/decisions.md` for architectural choices.
- `src/tokens/` authoring files and rebuilt generated outputs, if the visual contract changed.
- Relevant `tests/visual/*.visual.spec.ts`, token tests, consumer smoke tests, and other applicable tests.

Do not create isolated demo implementations or Storybook-only behavior that differs from the published component. Avoid unrelated refactors and unexplained new dependencies.

## 6. Treat Storybook as an executable specification

Use the repository's **Storybook 10 + React/Vite** configuration and existing component story conventions (`satisfies Meta<typeof Thing>`, `StoryObj`, `args`/`argTypes`, `.docs.mdx`). Stories live under `src/components` and foundation docs under `stories/foundations`.

For each meaningful component capability, demonstrate:

- Minimal/default usage and supported props/variants/sizes.
- Disabled, loading, error, empty, long content, focus, and keyboard states **where applicable**.
- Controlled and uncontrolled paths when provided; relevant mouse, touch, and keyboard interaction.
- ACME, Luna, Orchid, custom semantic override, local component hook, nested theme boundaries when styling changes make these relevant.
- Reduced-motion, forced-colors, narrow viewport, and RTL/locale-sensitive behavior where applicable.

Prefer Storybook `play` tests with accessible-role queries, `userEvent`, and assertions for behavior; avoid fragile class-name/DOM-snapshot-only assertions. Document API purpose, semantics, accessibility behavior, tokens/hooks, limitations, and consumer usage in `.docs.mdx`. The global Storybook theme selector is already defined in `.storybook/preview.tsx`; reuse it.

## 7. Verify in increasing scope

Run commands from workspace root, using **pnpm** (not npm/yarn). For targeted iterations:

```bash
pnpm --filter @workspace/design-system run tokens:build   # when token sources change
pnpm --filter @workspace/design-system run tokens:check
pnpm --filter @workspace/design-system run lint
pnpm --filter @workspace/design-system run typecheck
pnpm --filter @workspace/design-system run test:tokens
pnpm --filter @workspace/design-system run test:storybook
pnpm --filter @workspace/design-system run build
pnpm --filter @workspace/design-system run build-storybook
pnpm --filter @workspace/design-system run test:visual
pnpm --filter @workspace/design-system run test:package
```

Use `pnpm --filter @workspace/design-system run check` for the full package gate, especially before describing a component as finished. Browser-backed suites may depend on a compatible browser/Storybook server in Replit; inspect config and report environmental blockers. Never claim a check passed unless it ran. Do not refresh visual snapshots without reviewing and explaining the changes.

## 8. Completion definition and response

A change is complete only when its **public contract, implementation, tokens/themes, Storybook examples, accessibility behavior, docs, exports, and relevant tests** agree. If any criterion cannot be met, call it out instead of concealing it.

Report succinctly: (1) what changed and why, (2) API/token decisions, (3) story/doc/test coverage, (4) actual commands and pass/fail/skipped results, (5) any incompatibilities, unresolved accessibility questions, or follow-ups. Never describe unrun checks as green.
