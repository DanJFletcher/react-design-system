# Repository map and non-negotiable contracts

This reference supplements, but does not replace, the live repo sources. Re-read them before changing code; the repository may have evolved since this skill was authored (2026-10-15).

## Actual workspace and authority

- Root `package.json`: pnpm workspace commands, including `tokens:build`, `tokens:check`, `lint`, `test:storybook`, `test:visual`, `test:package`, `check`.
- `lib/design-system/package.json`: `@workspace/design-system`, ESM, React peer dependency, CSS exports, Storybook 10, Vitest/Playwright, TypeScript, tokens build.
- `lib/design-system/AGENTS.md`: package-level guardrails, particularly approval gates for new families and breaking contracts.
- `lib/design-system/docs/design-system.md`: package and component specification.
- `lib/design-system/docs/component-development.md`: approved component contracts and planning outline.
- `lib/design-system/docs/theming.md`: CSS import order and runtime theme guarantees.
- `lib/design-system/docs/decisions.md`: architecture decision history. Update for a new architecture decision; do not overwrite old decisions silently.
- `lib/design-system/docs/roadmap.md`: deferred/approved future work; verify against already shipped components because historic docs can lag implementation.
- `lib/design-system/src/index.ts`: public React exports and types; `src/theme/ThemeScope.tsx`: local theme boundary.
- `lib/design-system/src/components/<Name>/`: implementation + CSS Module + stories + docs. `FormControls` share CSS and foundational helpers.
- `lib/design-system/.storybook/main.ts`: `.stories.tsx`, `.docs.mdx`, and foundation MDX discovery; addon-docs, addon-a11y, addon-vitest.
- `lib/design-system/.storybook/preview.tsx`: theme global and decorator for ACME, Luna, Orchid.
- `lib/design-system/tests/visual/`: Playwright visual checks across themes; `tests/tokens`: compiler contract tests.

The repo also contains `artifacts/design-system-docs` and `artifacts/mockup-sandbox` with many app-local UI components. They are not the exported shared library. Do not mix their component APIs and dependencies into `@workspace/design-system` without an approved porting plan.

## Token-to-runtime dataflow

```text
src/tokens/foundations.json -- shared scales, internal palette
              |
src/tokens/contract.json --- semantic token definitions + ACME baseline
              |                \
src/tokens/themes/*.json ------ theme semantic overrides / source inheritance
              |                /
src/tokens/component-hooks.json --- optional typed public override names
src/tokens/contrast-pairs.json --- contrast validation expectations
              |
      scripts/build-tokens.ts
              |
       src/generated/ -- DO NOT EDIT BY HAND
          |-- tokens.css
          |-- themes/{acme,luna,orchid}.css
          |-- token-manifest.json
          `-- token-types.ts
              |
  CSS Modules: var(--ds-button-primary-bg, var(--ds-color-action-primary-bg))
              |
     scoped ThemeScope / data-ds-theme boundaries
```

The public variable form uses dotted token names converted to `--ds-kebab-case`: `color.action.primary.bg` -> `--ds-color-action-primary-bg`. Public component hook example: `button.primary.bg` -> `--ds-button-primary-bg`. CSS Modules can use **private** local variables (`--_button-bg`) to combine variants but cannot mint new `--ds-*` declarations.

Token authoring uses this repo's own schema (`schemaVersion: 1`; `type`, `value`, `description`; reference objects `{ "ref": "palette.blue.700" }` and dimension objects `{ "amount": 6, "unit": "px" }`). It is **not** the DTCG `$value` / `$type` structure. External token documents are conceptual references; translating the internal compiler to DTCG requires a separate approved migration and compatibility plan.

## Runtime CSS and themes

Preferred consumer import sequence, according to the repo's theming docs:

```ts
import "@workspace/design-system/tokens.css";
import "@workspace/design-system/styles.css";
import "@workspace/design-system/themes/luna.css";
```

ACME is the default. Luna and Orchid are alternate complete maps. `ThemeScope` sets `data-ds-theme` on a normal wrapper; nested scopes reapply semantic tokens and reset component hooks. Hooks are explicitly opt-in overrides, not defaults written onto components. Custom themes may inherit source definitions, but emitted theme CSS is flattened so consumers do not need the source theme at runtime.

Do not use global React theme context when CSS inheritance solves the requirement. For dialogs, tooltips, and portals, confirm where the DOM *actually lives*; if it moves outside the theme subtree, plan a theme bridge before implementing it.

## Existing implementation to learn from

- `Button`: native button, typed API, icon-only name contract, loading semantics, ref forwarding; variant styles use hook > semantic fallback. Stories use `play` assertions and test nested themes; visuals snapshot three themes.
- `FormControls`: native inputs, labels/descriptions/errors, typed controls.
- `Tooltip`: in-subtree popover behavior to preserve themes, Escape/outside dismissal, focus/hover/touch interactions.
- `Dialog`: native dialog/top-layer behavior; preserve user interaction contract.
- `Accordion`, `Tabs`, and `Menu`: study complete ARIA keyboard patterns before modifying.
- `Card`, `Hero`, `ContactSection`: consumer-owned content slots rather than business-specific rendering.

## Structural traps

- Root `replit.md` describes an earlier, smaller Button-focused snapshot. Prefer current component exports, current tests, package-local specs, and code over historic inventory claims.
- Some future roadmap items may already be implemented. Inspect `src/index.ts` and actual code rather than assuming a planned item is absent.
- The CI/full `check` path includes browser-backed suites. Running a subset is not equivalent to passing the whole gate.
- `scripts/check-design-rules.ts` rejects hard-coded colors, nonzero dimensions, and public CSS custom property declarations in component styles. Story-only layout scaffolding is not the public styling layer.
