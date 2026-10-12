# Component development

The initial scope established Button. The approved core form-control set adds TextField, Textarea, native Select, Checkbox, and RadioGroup. Any further component must have a written API and an approved roadmap dependency before implementation.

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

## Approved component scope

The user approved implementing `Accordion` and `Footer` as the next component additions. Their API and accessibility contracts are:

### Accordion

- Objective: reusable disclosure groups for FAQs and progressive content.
- API: `items` is a readonly list of `{ id, title, content, disabled? }`; `multiple` defaults to `false`; `openItems` and `onOpenItemsChange` provide controlled state; `defaultOpenItems` initializes uncontrolled state. `label`, `variant` (`divided`, `outlined`, `surface`), `size` (`sm`, `md`, `lg`), `shape` (`rounded`, `square`), and `headingLevel` configure presentation. Native `div` props, `className`, refs, and typed `style` are forwarded.
- Semantics and interaction: each item title is a native button inside a heading; it uses `aria-expanded` and `aria-controls` to identify its panel. Panels use `role="region"` and `aria-labelledby`. Enter and Space use native button activation; normal Tab order is retained. Disabled items cannot be toggled. Hidden panels remain mounted but are excluded from display and accessibility navigation.
- State: single-open mode replaces the current open item when another is opened; multi-open mode toggles independently. Controlled state changes only through `onOpenItemsChange`.
- Customization: use semantic tokens, CSS Modules, public variants and size/shape props; do not add theme-specific branches or undocumented private hooks.
- Validation: Storybook playground, variants/themes and controlled interaction; visual mobile/desktop checks; lint, typecheck, Storybook and package-consumer checks.

### Footer

- Objective: reusable, responsive site footer and navigation composition.
- API: optional `brand`, `description`, `logoHref`, `logoLabel`, `linkGroups`, `socialLinks`, `copyright`, `legalLinks`, and `bottomContent`; `navigationLabel` names the grouped-link navigation; `headingLevel` configures group headings; `variant` (`plain`, `surface`, `accent`) and `size` (`sm`, `md`, `lg`) configure presentation. Groups contain stable IDs, titles, and readonly links; links contain stable IDs, labels, `href`, and native anchor attributes. Native `footer` props, `className`, refs, and typed `style` are forwarded.
- Semantics and interaction: render a native `footer`; link groups and social/legal links are labeled native `nav` elements; group titles are headings; links remain native anchors and preserve supplied attributes.
- State: stateless; navigation and destinations belong to the consumer.
- Customization: use semantic tokens, CSS Modules, responsive layout, public variants and size props; do not add theme-specific branches or undocumented private hooks.
- Validation: Storybook playground, layout variants and themes; visual mobile/desktop checks; lint, typecheck, Storybook and package-consumer checks.

Every component must use native HTML semantics when applicable, public semantic tokens or registered component hooks, and documented focus, disabled, loading, keyboard, and state behavior as relevant. Cover ACME, Luna, custom themes, scoped overrides, and nested boundaries.

Use CSS Modules for styles. Visual properties must come from tokens or documented hooks. Do not add theme-specific React branches, raw component colors, pixel font sizes, arbitrary spacing, or literal radii/shadows. Structural values such as `0`, `auto`, `currentColor`, `transparent`, and fluid grid sizing are allowed.

Add stories for standard and important edge states; test real pointer and keyboard interactions. Update the generated-token source rather than generated output. Document public changes and decisions. Run relevant checks and report results. New semantic tokens need a distinct documented purpose, complete theme coverage, and contrast coverage.

Rules enforced by CI: token schema and reference validity, complete theme maps, generated-output freshness, CSS literal restrictions, types, documented contrast pairs, story interactions, visual snapshots, package exports, and clean-consumer installation.

Rules requiring a human review: keyboard navigation, screen-reader naming, zoom, focus clipping, snapshot differences, API necessity, and whether a proposed token duplicates an existing semantic role.
