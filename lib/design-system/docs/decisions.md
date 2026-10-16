# Architecture decisions

## Surface corners are separate from pill controls

Content surfaces use a bounded semantic `radius.surface` rather than the action-control radius or a fixed shape foundation. Luna uses 32px surfaces and retains 9999px action/input controls. ACME and Orchid retain the existing 12px general-panel character; specialized family tokens remain independently overridable.

**Why:** Reusing the action radius made code blocks and other Luna surfaces circular. Fixing components individually did not prevent new implementations from repeating the mistake.

**Enforcement:** Style checks default new radius declarations to the surface role and recursively inspect hook fallbacks and private aliases. Exact-selector exceptions with reasons cover intentional controls, explicit shapes, circles, and inheritance. Consumer customization still takes precedence and is never clamped. Computed browser checks verify default corners, mobile layouts, explicit shapes, nested boundaries, and local overrides.

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

## Labels remain presentational wrappers around native semantics

The public `Label` renders a native `<label>` with field and choice layouts. Its required marker is decorative, while required and disabled validation state remains on the native control. Form controls reuse the same label implementation; group names continue to use native `<legend>`.

**Why:** applications need consistent labels outside the higher-level form controls without introducing a second source of validation or control state.

## Form-control radii are independently themed

Single-line inputs, textareas, field groups, and action buttons each have separate radius tokens. This lets Luna keep its pill-shaped text/select controls while giving textareas and field groups a 32px rounded-rectangle shape.

## Spinner is distinct from Progress

Spinner communicates indeterminate waiting with a circular status indicator; Progress represents linear work that may have a measurable value. Standalone Spinner names its status accessibly, while embedded use can mark it decorative when its containing control already exposes the loading state. As an indicator rather than a content surface, it does not receive surface elevation. Button reuses the decorative mode rather than maintaining a second loading-ring implementation.

## Header defaults to composable responsive navigation

The Header uses the shared Menu in `navigation` mode across breakpoints: it opens as a disclosure on narrow screens and becomes inline native-link navigation on desktop. Menu navigation mode preserves ordinary navigation landmark and link semantics instead of applying the ARIA application-menu keyboard model. Consumers can replace the default mobile navigation with a render slot that receives the nav items and controlled open state.

**Why:** Reuse the design system's menu presentation and interaction while keeping site navigation accessible and allowing products to supply specialized mobile navigation.

## Hero uses content slots and semantic layout options

Hero content, media, and actions remain caller-owned React nodes; layout, alignment, responsive stacking, and semantic backgrounds are component options. This keeps the component flexible without imposing a media library or coupling action behavior to the presentation section.

## Cards keep interaction inside explicit slots

Card uses an article container rather than making the entire surface a click target. Links and buttons stay in caller-owned content, header-action, and action slots so focus order and nested controls remain predictable.

## Pricing details are presentational

PricingDetails renders consumer-supplied price and line-item content. It does not compute totals, format currencies, or initiate payment, keeping financial rules and localization with the consuming product.

## Carousel autoplay is opt-in and focus-safe

Carousel only auto-advances when explicitly enabled and always exposes a pause/start control. Hover temporarily pauses rotation; keyboard focus and manual navigation stop it until restarted. Reduced-motion preferences disable autoplay and transitions, and non-looping carousels stop on the final slide.

## Menus use the ARIA menu interaction model

The configurable Menu supports nested action/link items and separators. It keeps native buttons and links as the activation elements while applying menu roles and managed arrow-key focus; nested menus open inline on narrow screens to avoid viewport overflow. Menu-specific component hooks extend scoped theming without adding new semantic tokens.

## Tooltips stay in their theme subtree

Tooltip content uses fixed positioning but remains a DOM descendant of its trigger, rather than moving into a body portal. Viewport flipping and clamping provide visible placement while inherited semantic tokens and scoped component hooks remain correct across nested theme boundaries.

## Storybook and visual checks are documentation, not a deployable app

Storybook stays with the package and runs as its development/documentation environment. This project remains a shared library; it does not introduce a publishable end-user application.
