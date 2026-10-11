# Architecture decisions

## One package inside the workspace

The library is a single `lib/` package with directory-based boundaries and explicit exports, not a new monorepo or a separate deployable product.

## CSS variables are the runtime theme API

Theme values are compiled to concrete CSS declarations. Components never branch on ACME/Luna in React; nested DOM boundaries apply a complete theme map.

## Component hooks reset at theme boundaries

Unregistered custom properties set to `initial` do not inherit through a nested `[data-ds-theme]` boundary. This prevents an outer component override from leaking into an inner theme while preserving locally scoped overrides.

## The token schema is project-owned

The compiler implements only the types and validation rules used here. It does not claim compatibility with an external design-token standard.

## Orchid is a compiled example theme

Orchid demonstrates extending Luna while retaining a flattened output map. It is a source example, not a commitment to add more built-in themes.

## Form controls use native elements

The core form controls preserve native input, select, checkbox, radio, and fieldset behavior. Shared internal helpers provide consistent labels and accessible description/error relationships; form state and validation rules remain the consumer's responsibility.

## Form-control radii are independently themed

Single-line inputs, textareas, field groups, and action buttons each have separate radius tokens. This lets Luna keep its pill-shaped text/select controls while giving textareas and field groups a 24px rounded-rectangle shape.

## Storybook and visual checks are documentation, not a deployable app

Storybook stays with the package and runs as its development/documentation environment. This project remains a shared library; it does not introduce a publishable end-user application.
