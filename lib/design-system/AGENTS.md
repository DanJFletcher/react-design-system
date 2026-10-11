# Design-system contribution rules

Before changing `lib/design-system/`, read `docs/design-system.md` and the relevant component documentation.

- Define a component's responsibility, semantics, and public API before implementation.
- Prefer native HTML semantics.
- Use public semantic tokens or registered component hooks for visual styling.
- Document relevant interaction, focus, disabled, and loading behavior.
- Cover ACME, Luna, custom themes, scoped customization, and nested boundaries.
- Update docs and changelogs for public changes; record architectural changes in `docs/decisions.md`.
- Edit token sources, never `src/generated/` by hand.
- Run relevant checks and report their results.
- Keep the first milestone limited to the token foundation and Button. Additional components, dark mode, polymorphic rendering, and a general plugin system are deferred.

New semantic tokens need a documented purpose, a clear distinction from existing roles, complete theme coverage, and applicable contrast checks.
