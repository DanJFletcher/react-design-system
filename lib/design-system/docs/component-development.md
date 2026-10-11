# Component development

The first milestone intentionally contains one component. Do not add another component until it has a written API and an approved roadmap dependency.

For a future component, use this planning template:

1. Objective and user need
2. Dependencies
3. Scope and exclusions
4. Public API
5. HTML and accessibility semantics
6. Interaction and state ownership
7. Tokens and customization hooks
8. Storybook examples
9. Validation commands
10. Completion checklist

Every component must use native HTML semantics when applicable, public semantic tokens or registered component hooks, and documented focus, disabled, loading, keyboard, and state behavior as relevant. Cover ACME, Luna, custom themes, scoped overrides, and nested boundaries.

Use CSS Modules for styles. Visual properties must come from tokens or documented hooks. Do not add theme-specific React branches, raw component colors, pixel font sizes, arbitrary spacing, or literal radii/shadows. Structural values such as `0`, `auto`, `currentColor`, `transparent`, and fluid grid sizing are allowed.

Add stories for standard and important edge states; test real pointer and keyboard interactions. Update the generated-token source rather than generated output. Document public changes and decisions. Run relevant checks and report results. New semantic tokens need a distinct documented purpose, complete theme coverage, and contrast coverage.

Rules enforced by CI: token schema and reference validity, complete theme maps, generated-output freshness, CSS literal restrictions, types, documented contrast pairs, story interactions, visual snapshots, package exports, and clean-consumer installation.

Rules requiring a human review: keyboard navigation, screen-reader naming, zoom, focus clipping, snapshot differences, API necessity, and whether a proposed token duplicates an existing semantic role.
