# Design-system contribution rules

Before proposing, planning, or beginning any work in this package, read `CONTRIBUTING.md` first. This applies to code, documentation, tokens, themes, stories, tests, package exports, and build configuration. Then read `docs/design-system.md` and the relevant component documentation.

- Define a component's responsibility, semantics, and public API before implementation.
- Prefer native HTML semantics.
- Use public semantic tokens or registered component hooks for visual styling.
- Choose radii by purpose: new content surfaces use `radius.surface`, never `radius.control`, `radius.form-control`, `radius.full`, or a fixed rounded-shape foundation as their default. Luna surfaces default to 32px; pill controls and intentional circles are separate roles.
- Radius exceptions require an exact selector, role, and reason in `scripts/radius-policy.json`. Keep that list narrow: action/form controls, intentional circles, explicit shape props, and inherited corners only. Consumer hooks keep precedence; never cap them to the default radius.
- Document relevant interaction, focus, disabled, and loading behavior.
- Cover the relevant built-in themes (ACME, Luna, Orchid, Atom, Sublime), custom themes, scoped customization, and nested boundaries.
- Update component docs and the Storybook component catalog for public changes; record architectural changes in `docs/decisions.md`.
- Edit token sources, never `src/generated/` by hand.
- Run relevant checks and report their results.
- Use the current component catalog and the user's request to establish scope; do not rely on historical approval lists as a limit on current work.

New semantic tokens need a documented purpose, a clear distinction from existing roles, complete theme coverage, and applicable contrast checks.
