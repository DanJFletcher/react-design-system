# Contributing to the design system

This guide covers changes made in this repository. For the full public component list, open Storybook and go to **Foundations → Component catalog**. For detailed component planning and API contracts, see [`docs/component-development.md`](docs/component-development.md).

## Set up the workspace

Run commands from the repository root unless noted otherwise:

```sh
pnpm install
pnpm --filter @workspace/design-system run storybook
```

The library is a pnpm workspace package at `lib/design-system`. Storybook is the development and documentation environment; use it to inspect component behavior across stories and themes.

## Where to make changes

| Area | Location |
| --- | --- |
| React components and CSS Modules | `lib/design-system/src/components/` |
| Public package exports and types | `lib/design-system/src/index.ts` |
| Token sources and themes | `lib/design-system/src/tokens/` |
| Generated token files | `lib/design-system/src/generated/` |
| Component stories and docs | `lib/design-system/src/components/**/` |
| Shared Storybook foundation guides and catalog | `lib/design-system/stories/foundations/` |
| Browser visual tests | `lib/design-system/tests/visual/` |
| Package exports and published files | `lib/design-system/package.json` |

Do not edit files in `src/generated/` by hand. Change their source tokens and regenerate them instead.

## Add or update a component

Before implementation, define the user need, scope, public API, native semantics, state ownership, customization points, Storybook coverage, and validation. Use the planning template in [`docs/component-development.md`](docs/component-development.md).

For an implemented component:

1. Keep its public API typed and documented. Prefer native HTML elements and browser behavior; add custom interaction only when the component needs it.
2. Put component styling in its CSS Module and use semantic `--ds-*` tokens. Use documented component hooks for supported overrides; avoid theme-name conditionals and undocumented private variables.
3. Export public components and types from `src/index.ts`. If adding a package entry point or public asset, update `package.json` exports and published files too.
4. Add or update a `*.stories.tsx` story and matching `*.docs.mdx` page. Cover meaningful variants, states, theme behavior, and narrow layouts. Update the Storybook component catalog when adding a public component.
5. Test interaction and accessibility behavior: labels, keyboard operation, focus order and return, disabled/loading states, and appropriate ARIA semantics. Preserve visible focus, forced-colors support, and reduced-motion behavior.
6. Add browser visual coverage for important responsive or theme-specific layout behavior. Update snapshots only after reviewing the change.

## Change tokens, themes, or motion

- Edit token sources under `src/tokens/`; never hand-edit generated CSS or TypeScript.
- After changing token sources, run `pnpm --filter @workspace/design-system run tokens:build`, inspect generated output, and run `pnpm --filter @workspace/design-system run tokens:check`.
- Keep semantic roles complete for every effective theme. Check contrast pairs when introducing or changing a readable color or indicator.
- Use the documented radius roles: content surfaces use the surface role, controls use control/form-control roles, and intentional circles remain explicit.
- Use shared motion and breakpoint tokens/aliases. Respect `prefers-reduced-motion`; do not rely on duration tokens alone to disable movement.
- Check changes in ACME, Luna, Orchid, Atom, and Sublime where the behavior or styling is shared.

See [`docs/design-system.md`](docs/design-system.md) for contracts and [`docs/theming.md`](docs/theming.md) for theme boundaries and customization.

## Run checks

Run targeted checks while iterating:

```sh
pnpm --filter @workspace/design-system run lint
pnpm --filter @workspace/design-system run typecheck
pnpm --filter @workspace/design-system run test:design-rules
pnpm --filter @workspace/design-system run test:tokens
pnpm --filter @workspace/design-system run test:storybook
pnpm --filter @workspace/design-system run build-storybook
pnpm --filter @workspace/design-system run test:visual
pnpm --filter @workspace/design-system run test:package
```

Before merging a component, token, or package change, run the full suite:

```sh
pnpm --filter @workspace/design-system run check
```

The `check` script regenerates and checks tokens, runs lint and type checks, runs design-rule/token/Storybook tests, builds the library and Storybook, runs browser visual tests, and installs the packed package in an isolated consumer.

For documentation-only changes, at minimum build Storybook when changing Storybook MDX, and run `git diff --check`. For token changes, inspect generated diffs. For public API or package export changes, include the package-consumer test.

## Before submitting

- [ ] Public exports, types, docs, stories, and the component catalog are in sync.
- [ ] The change works in relevant themes and narrow layouts.
- [ ] Keyboard, focus, reduced-motion, and forced-colors behavior were considered.
- [ ] Tests and visual snapshot changes are intentional.
- [ ] Token-generated files are current and no generated source was edited by hand.
- [ ] Relevant checks pass; include the full package check for component, token, or packaging changes.
- [ ] Any new dependency has a clear need and is compatible with the package’s React peer dependency and ESM/CSS exports.
