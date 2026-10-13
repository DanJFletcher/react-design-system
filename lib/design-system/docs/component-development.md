# Component development

The initial scope established Button. The approved core form-control set adds TextField, Textarea, native Select, Checkbox, and RadioGroup. Further additions require a written API and an approved roadmap entry before implementation.

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

The user approved implementing `Accordion`, `Footer`, `Dialog`, `Toast`, `Text`, `Heading`, `Icon`, `ArticleFootnotes`, `Pagination`, and `Testimonials` as component additions. Their API and accessibility contracts are:

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

### ContactSection

- Objective: help small-business customers call, visit, check hours, request a quote, or send a message from one responsive section.
- Dependencies: existing React package, CSS Modules, semantic surface/text/border/action tokens, and registered `contact.*` styling hooks; no map SDK, form state, or scheduling dependency.
- Public API: `heading` is a required visible string; `description`, `address` (`lines`, optional `directionsHref` and `directionsLabel`), `contactMethods` (stable `id`, visible `label` and `value`, `href`, optional decorative `icon` and native anchor props), `hours` (stable `id`, `day`, and `hours`), `action`, and `form` are optional. `headingLevel` defaults to `2`; detail headings use the next level. `variant` (`plain`, `surface`, `accent`) and `layout` (`split`, `stacked`) configure presentation. Native `section` props, refs, `className`, and typed `style` are forwarded; the section's accessible name is tied to its required heading.
- Semantics and interaction: render a named native `section`; location uses `<address>`, contact details and hours use definition lists, and contact/directions destinations remain native anchors. The `action` and `form` slots retain consumer-owned semantics and behavior. No map is embedded, hours are displayed as supplied, and the component does not own form submission or booking state.
- State: stateless; content, link destinations, form state, and any scheduling behavior belong to the consumer.
- Customization: use semantic tokens, responsive CSS Modules, public `variant` and `layout` props, and registered `contact.*` hooks for surface/text/muted/border/link colors, radius, padding, and spacing. Support ACME, Luna, Orchid, custom themes, and nested boundaries.
- Validation: Storybook playground and form/location examples; browser checks for landmarks, native links, hours, themes, nested overrides, responsive stacking, and custom hooks; lint, typecheck, token checks, Storybook, package build, and package-consumer checks.

### ArticleCard

- Objective: present a scannable blog post preview in indexes, featured content, and related-post lists while retaining the existing Card design system.
- Dependencies: existing `Card`, `Badge`, semantic theme tokens, and `card.*` component hooks; no CMS, router, or image-hosting dependency.
- Public API: required `title` and `href`; optional `excerpt`, `category` (`label`, optional `href`), `author` (`name`, optional `href` and avatar), `publishedAt` (`dateTime`, visible `label`), `readingTime`, and native image attributes through `image`. `readMoreLabel` and `showReadMore` configure the secondary title-qualified link. Card layout, variants, shape, size, media position/crop, heading level, native article props, `className`, ref, and typed `style` are forwarded.
- Semantics and interaction: render a native article named by its heading; the heading and optional “read article” action are native links to the supplied article `href`. Categories and linked authors remain separate native links. Dates use `<time dateTime>`. Informative image alternative text is required; decorative media uses `alt=""`.
- State: stateless; article data, route destinations, date localization, reading-time calculation, and publishing belong to the consumer.
- Customization: compose the existing theme-aware Card and Badge; inherit their semantic colors and `card.*` hooks across ACME, Luna, Orchid, custom themes, and nested theme boundaries. Keep links visibly identifiable and preserve focus indicators and forced-color behavior.
- Validation: Storybook playground, layouts, content variants, themes, and custom hooks; browser checks for article naming, title/category/author/read-more links, machine-readable dates, optional media, narrow-screen wrapping, and responsive horizontal layout; lint, typecheck, Storybook, package build, and package-consumer checks.

### ArticleFootnotes

- Objective: connect in-text footnote markers to an accessible notes list and return links, so readers can move between a citation and its explanation.
- Dependencies: React, native fragment links, semantic theme tokens, and CSS Modules; no router, citation parser, or content-fetching dependency.
- Public API: `ArticleFootnote` requires a unique marker `id`, destination `noteId`, and visible `label`; native anchor attributes, refs, `className`, and typed `style` are supported. `ArticleFootnotes` requires note `items` (`id`, `label`, React `content`, and one or more `backlinks`); it also accepts a visible `heading`, semantic `headingLevel` (2–6), localizable `backlinkLabel`, native section attributes, refs, `className`, and typed `style`.
- Semantics and interaction: markers are native superscript links; the notes are a named section containing an ordered list, and each note has native links back to its marker or markers. All destinations use real, consumer-provided IDs and work without JavaScript. Keyboard focus remains visible in regular and forced-colors modes.
- State: stateless; the consumer owns citation numbering, stable unique IDs, note content, source URLs, and localization. Duplicate or mismatched IDs are invalid consumer data.
- Customization: use semantic text, action, border, spacing, and focus tokens; support ACME, Luna, Orchid, custom themes, nested scopes, long content, and narrow layouts. No component-specific hooks or new semantic tokens are required.
- Validation: Storybook connected, theme, and narrow-layout examples; browser checks for native marker/backlink navigation, multiple citations per note, keyboard focus, theme boundaries, and no narrow-screen overflow; lint, typecheck, Storybook, package build, and package-consumer checks.

### ArticleTableOfContents

- Objective: help readers jump directly to relevant sections in long articles.
- Dependencies: React, native fragment links, semantic theme tokens, and CSS Modules; no router, article parser, or new semantic token.
- Public API: required ordered `items` each contain a consumer-provided heading `id` and visible `label`; `heading` defaults to “On this page”; `headingLevel` defaults to `2` and accepts `2`–`6`; native `nav` attributes including `aria-label`, refs, `className`, and typed `DesignSystemStyle` are supported.
- Semantics and interaction: render a named native `<nav>` containing a visible heading, list, and native `<a href="#id">` links. Native keyboard activation and browser fragment navigation remain intact. IDs must match headings in the same document.
- State: stateless; the consumer owns heading markup, IDs, labels, and all routing/content behavior. The component does not parse arbitrary article HTML or create IDs.
- Customization: use semantic text, action, border, surface, radius, spacing, and focus tokens with responsive CSS Modules. Support ACME, Luna, Orchid, custom themes, and nested boundaries; preserve forced-colors focus and link visibility.
- Validation: Storybook connected, theme/custom/nested, and narrow-screen examples; browser checks for landmark naming, correct fragment targets, keyboard activation/focus, theme inheritance, and no narrow-screen overflow; lint, typecheck, Storybook, package build, and package-consumer checks.

### Pagination

- Objective: help readers move through long blog, service, or product listings while keeping the current page clear.
- Dependencies: existing React package, CSS Modules, semantic action/border/text/focus tokens, and the built-in Icon component; no router, data fetching, or new token is required.
- Public API: `currentPage` and positive integer `totalPages` are required. `siblingCount` and `boundaryCount` default to `1` and accept non-negative integers. `previousLabel`, `nextLabel`, `pageLabel(page)`, and `pageSummaryLabel(currentPage, totalPages)` provide localized labels. Navigation behavior is a discriminated union: callback mode requires `onPageChange(page)`; link mode requires `getPageHref(page)`; the two are mutually exclusive. Native `nav` props, accessible `aria-label` (default `"Pagination"`), refs, `className`, and typed `DesignSystemStyle` are forwarded. A one-page result renders nothing; invalid page ranges or counts throw.
- Semantics and interaction: render a named native `nav`, page numbers as a list, and the current item with `aria-current="page"`. Callback mode uses native buttons and native disabled states; link mode uses native anchors and non-interactive disabled boundary labels. Keyboard activation and focus stay native. On narrow screens, numbered controls are replaced by a localized current/total summary while previous/next remain available.
- State: stateless and controlled; the consumer updates `currentPage` after callbacks or navigation. The component computes the visible range and ellipses, but does not fetch pages, change routes, or own list data.
- Customization: page windows and labels are public props; colors, borders, radius, focus, spacing, and type inherit semantic theme tokens. Support ACME, Luna, Orchid, custom themes, and nested boundaries without theme-specific rendering or component hooks.
- Validation: Storybook callback/link, edge-page, page-window, theme, and narrow-layout examples; browser checks for link destinations, callback values, current-page semantics, keyboard operation, disabled boundaries, responsive summary, theme inheritance, and no horizontal overflow; lint, typecheck, Storybook, package build, and package-consumer checks.

### Breadcrumbs

- Objective: show readers their current location in a site hierarchy and provide links to parent pages.
- Dependencies: React, native anchors, CSS Modules, and semantic theme tokens; no router or new token is required.
- Public API: ordered `items` contain parent `{ label, href }` links followed by a `{ label, current: true }` current-page item. Native `nav` attributes including `aria-label`, refs, `className`, and typed `DesignSystemStyle` are supported. The accessible landmark name defaults to `"Breadcrumb"`.
- Semantics and interaction: render a named native `<nav>` containing an ordered list; parent destinations are native anchors and the final page label is non-interactive text marked `aria-current="page"`. Separators are hidden from assistive technology. Keyboard navigation remains native.
- State: stateless; the consumer owns labels, destinations, and routing. The final item must identify the current page, and every parent item must provide a destination.
- Customization: use semantic text, action, spacing, radius, and focus tokens with responsive CSS Modules. Support ACME, Luna, Orchid, custom themes, and nested boundaries; long labels wrap without horizontal overflow and focus remains visible in forced-colors mode.
- Validation: Storybook basic, theme/custom/nested, and narrow-screen examples; browser checks for landmark naming, links/current-page semantics, keyboard focus, token inheritance, and no narrow-screen overflow; lint, typecheck, Storybook, package build, and package-consumer checks.

### Testimonials

- Objective: present customer feedback as readable, trustworthy social proof for small-business sites and articles.
- Dependencies: the existing `Card`, semantic theme tokens, CSS Modules, and inline rating text; no new token, icon library, review service, or image dependency.
- Public API: required `items` are readonly records with unique `id`, non-empty `quote`, and `author.name`; author `role`, `company`, and `avatar` (`src`, optional `alt`) are optional. Each item may include an integer `rating` from 1 to 5. `heading`, `description`, `headingLevel` (2–6, default 2), `layout` (`grid` or `featured`, default `grid`), and `columns` (2 or 3, default 3) configure the collection; a non-empty featured layout requires exactly one item. `variant`, `size`, `shape`, and `alignment` configure the composed Cards. `getRatingLabel(rating)` customizes the accessible rating text. Native `section` attributes, refs, `className`, and typed `DesignSystemStyle` are supported.
- Semantics and interaction: render a named native section with an optional heading and description, containing semantic Cards and figures. Quotes use `<blockquote>`, author attribution uses `<figcaption>` and `<cite>`, and ratings are exposed as one accessible image label while decorative star glyphs are hidden. Avatars default to decorative alternatives because the author name is visible. The component is non-interactive and owns no review links or verification claims.
- State: stateless; consumers own testimonial content and rating provenance. An empty item list renders nothing; invalid IDs, blank author/quote text, out-of-range ratings, or multiple items in featured layout throw.
- Customization: compose the existing theme-aware `Card`; use its public variants and `card.*` hooks plus semantic tokens. Support ACME, Luna, Orchid, custom themes, and nested boundaries without theme-specific rendering or new token roles.
- Validation: Storybook playground, featured/grid, optional-content, rating, theme/nested, custom-hook, and narrow-layout examples; browser checks for landmark and quote semantics, rating announcements, validation, responsive columns, theme inheritance, and no horizontal overflow; lint, typecheck, Storybook, package build, and package-consumer checks.

### Dialog

- Objective: accessible modal content for confirmations, forms, and focused tasks.
- API: `open` and `onOpenChange` are required controlled props; `heading`, `description`, `children`, and `footer` provide content slots. `size` (`sm`, `md`, `lg`), `headingLevel`, `showCloseButton`, `closeLabel`, `closeOnEscape`, and `closeOnBackdropClick` configure presentation and dismissal. Native dialog props, refs, `className`, and typed `style` are forwarded, excluding native `open`, `onClose`, `onCancel`, `onClick`, and `style` which the component coordinates.
- Semantics and interaction: render a native `<dialog>` opened with `showModal()`, not a React portal. The browser provides modal focus containment, background inertness, initial focus, and return focus. A visible close button is shown by default. Escape closes by default; backdrop clicks do not close by default. Native cancel/close handlers and dialog children remain supported.
- State: the consumer owns `open`; the component reports dismissal requests through `onOpenChange(false)`. Consumer-supplied close handlers run without bypassing that contract.
- Theme behavior: CSS variables continue to inherit through the dialog's DOM ancestry; the native top layer changes paint order, not the element's parent relationship. No separate portal-theme bridge is needed.
- Customization: register documented `dialog.*` styling hooks for its surface, text, border, radius, padding, width, and backdrop; use semantic tokens for focus and text styles.
- Validation: Storybook open/closed and size/theme examples; browser tests for focus, Escape, backdrop, controlled state, mobile fit, and nested theme styling; lint, typecheck, Storybook and package-consumer checks.

### Toast

- Objective: short, accessible status notifications with optional actions for app-wide feedback.
- Dependencies: existing semantic tokens, generated component hooks, and the React design-system package; no external notification or portal dependency.
- Scope: a presentational `Toast`, a `ToastProvider`, and a `useToast` hook. Provider positions are `top-start`, `top-end`, `bottom-start`, and `bottom-end`; it shows up to five notifications and queues the rest FIFO.
- Public API: `Toast` requires `title` and `onDismiss`; `description`, `variant` (`info`, `success`, `warning`, `error`), decorative `icon`, an action `{ label, onClick }`, accessible close label, and `duration` are optional. A zero or negative duration disables automatic dismissal. `ToastProvider` accepts children, position, accessible viewport label, visible limit, default duration, class name, and typed style. `useToast` returns `showToast(options)` (which returns an ID), `dismissToast(id)`, and `dismissAll()`.
- Semantics and interaction: notifications use `role="status"` with polite announcements except errors, which use `role="alert"`. The viewport is a labeled region. Each toast has a named native dismiss button; an optional action invokes its callback and then dismisses. Automatic dismissal pauses while the pointer or keyboard focus is within the toast. Actions and close controls retain visible focus indicators.
- State and theme behavior: the provider owns its FIFO queue and removes dismissed toasts; the consumer owns the content and any action side effects. No portal is used, so mount the provider under the desired `data-ds-theme`/`ThemeScope` boundary. Duration defaults to five seconds and can be disabled for persistent messages.
- Customization: use semantic tokens and registered `toast.*` hooks for surface, text, border, radius, padding, width, accent colors, viewport inset, and stack spacing. CSS Modules provide responsive positioning and forced-colors support.
- Validation: Storybook playground, variants, actions, placement, queue, and scoped-theme stories; browser tests for announcement roles, manual and automatic dismissal, pausing, FIFO behavior, mobile fit, and theme inheritance; lint, typecheck, Storybook and package-consumer checks.

### Typography (Text and Heading)

- Objective: reusable, theme-aware text primitives with explicit semantic markup and type-scale controls.
- Dependencies: existing font-size, font-weight, line-height, and text-color tokens; no new semantic tokens or component hooks.
- Public API: `Text` renders `p` by default and may render `span` or `div` through `as`; `size` accepts `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`, or `5xl`; `weight` accepts `regular`, `medium`, or `semibold`; `tone` accepts `primary` or `muted`. `Heading` renders the actual `h1`–`h6` selected by `level` (default `2`); `size` uses the same font scale and defaults by semantic level (`h1` → `5xl`, `h2` → `4xl`, `h3` → `3xl`, `h4` → `2xl`, `h5` → `xl`, `h6` → `lg`); it also accepts `weight` and `tone`. Both forward native HTML attributes, children, refs, `className`, and typed `DesignSystemStyle`.
- Semantics and interaction: headings remain native heading elements, with visual `size` independent from document-outline `level`; text defaults to a paragraph and can use inline or generic block markup. Neither adds implicit ARIA roles or interaction.
- Defaults: `Text` uses `md`, `regular`, and `primary`; `Heading` uses a size tied to `level`, `semibold`, and `primary`. Text line height is normal; heading line height is tight. Both reset browser margins.
- Customization: use the shared theme font and semantic text tokens, CSS Modules, and the documented size/weight/tone props. Keep ACME, Luna, Orchid, and custom themes on the same markup path; no theme-specific React branches or undocumented hooks.
- Validation: Storybook playgrounds for scale, semantic levels, weights, tones, and all themes; browser checks for heading semantics, visual-size overrides, mobile wrapping, and nested theme inheritance; lint, typecheck, Storybook, build, and package-consumer checks.

### Icon

- Objective: provide consistent, named SVG icons that can be reused across application controls and Storybook examples.
- Dependencies and source policy: render a curated, built-in inline SVG catalog; add no icon-library dependency, semantic color token, or component hook. All paths use `currentColor`.
- Public API: `name` is one of the exported `iconNames` (`arrow-left`, `arrow-right`, `book`, `check`, `chevron-down`, `chevron-right`, `close`, `folder`, `grid`, `heart`, `list`, `menu`, `moon`, `pause`, `play`, `search`, `settings`, `sparkle`). `size` accepts `xs`, `sm`, `md`, `lg`, or `xl`, defaulting to `md` (20px); sizes map to shared spacing tokens from 12px through 32px. `decorative` defaults to `true`. When `decorative={false}`, `label` is required and becomes the SVG's accessible name. Native SVG attributes, class name, refs, and typed style are forwarded; callers cannot override the accessibility role/name contract.
- Semantics and theme behavior: decorative SVGs use `aria-hidden="true"`; meaning-bearing SVGs use `role="img"` and a non-empty label. Icons inherit `currentColor` and spacing values from active themes without theme-specific rendering.
- Customization: use the public `size` prop and SVG `className`/typed `style`; no icon-specific hooks are registered.
- Validation: Storybook name-select playground, complete icon catalog, sizing, accessibility, all themes and nested theme stories; browser tests for catalog coverage, dimensions, accessible naming, and color inheritance; lint, typecheck, Storybook, package build, and package-consumer checks.

### Badge

- Objective: concise, non-interactive labels for statuses, categories, and highlights.
- Dependencies: existing React package, CSS Modules, and shared semantic text, surface, border, spacing, radius, and type tokens; status tones add contrast-checked semantic success, warning, and error surface/foreground pairs across every theme. No runtime dependency or badge-specific hook is needed.
- Public API: `children` is the visible label. `tone` accepts `neutral`, `accent`, `success`, `warning`, or `error` (default `neutral`); `size` accepts `sm`, `md`, or `lg` (default `md`); optional `shape` accepts `rounded`, `square`, or `pill` and otherwise follows the active theme's control radius. Optional `icon` is decorative and placed according to `iconPosition` (`left` or `right`, default `left`); `dot` adds an additional decorative status marker. Native `span` props, refs, `className`, and typed `DesignSystemStyle` are forwarded.
- Semantics and interaction: render a static native `span` with no implicit live-region or interactive role. The visible children carry the badge's meaning; icon and dot indicators are hidden from assistive technology. Color is supplemental and not the sole status cue.
- State: stateless; status meaning and updates belong to the consumer.
- Customization: use public tone, size, and shape props with semantic tokens and CSS Modules; do not add theme-specific rendering, undocumented hooks, or interaction semantics.
- Validation: Storybook tone, size, shape, icon/dot, ACME/Luna/Orchid, and nested-theme examples; browser checks for contrast, static semantics, indicators, and dimensions; token contrast checks, lint, typecheck, Storybook, package build, and package-consumer checks.

### Callout

- Objective: persistent, in-flow content for important status, guidance, and next steps; unlike Toast, it is not queued or automatically dismissed.
- Dependencies: existing React package, CSS Modules, the shared accent and success/warning/error semantic color pairs, and registered `callout.*` hooks; no new runtime dependency or semantic color token.
- Public API: `children` provides the body; optional `title`, decorative `icon`, and consumer-supplied `action` provide common composition. `tone` accepts `info`, `success`, `warning`, `error`, or `neutral` (default `info`). Native `div` props, including an optional caller-selected `role`, refs, `className`, and typed `DesignSystemStyle` are forwarded.
- Semantics and interaction: render a generic in-flow `div` with no implicit role or live-region behavior. The consumer chooses `role="status"` or `role="alert"` only when its update needs announcement. Icons are decorative and hidden from assistive technology; the visible title/body carries meaning. Actions use consumer-provided links or buttons and retain their native behavior.
- State: stateless and persistent; there is no auto-dismissal or internal action state.
- Customization: tones use existing semantic theme pairs. Register `callout.*` hooks for surface, text, border/accent, radius, padding, and spacing; the outer border matches the tone accent by default, while `callout.border` remains an independent override. Preserve forced-colors support and nested theme boundaries.
- Validation: Storybook playground, tone/action/icon, theme, nested, and custom-hook examples; browser checks for explicit roles, color contrast, action semantics, mobile wrapping, and scoped customization; lint, typecheck, token checks, Storybook, package build, and package-consumer checks.

### Progress

- Objective: communicate ongoing or completed work with a persistent, accessible linear progress indicator.
- Dependencies: existing React package, CSS Modules, semantic accent/surface/text tokens, and registered `progress.*` styling hooks; no new runtime dependency or semantic token.
- Public API: `label` is required and visible. Supplying `value` selects determinate progress; omitting it selects indeterminate progress. `max` defaults to `100`; values are clamped to `[0, max]`; invalid non-finite values or non-positive maxima throw. `valueText` overrides the visible and spoken value text; `showValue` hides only the visible value. Native `div` props, refs, `className`, `aria-describedby`, and typed `DesignSystemStyle` are forwarded, excluding ARIA progress semantics owned by the component.
- Semantics and interaction: the track uses `role="progressbar"` and is named by the visible label. Determinate progress sets `aria-valuemin`, `aria-valuemax`, and clamped `aria-valuenow`; indeterminate progress omits `aria-valuenow`. Progress updates do not create a live region. Reduced-motion and forced-colors preferences remain supported.
- State: stateless; the consumer owns and updates the numeric value.
- Customization: use semantic theme tokens and registered `progress.*` hooks for track, indicator, label/value text, height, radius, and spacing. Support ACME, Luna, Orchid, custom themes, and nested boundaries.
- Validation: Storybook determinate, indeterminate, custom-scale, theme, nested, and custom-hook examples; browser checks for ARIA values, clamping, status text, reduced motion, responsive labels, and custom themes; lint, typecheck, token checks, Storybook, package build, and package-consumer checks.

### Tooltip

- Objective: reveal short, non-essential explanations consistently on pointer hover, keyboard focus, and touch.
- Dependencies: existing React package, CSS Modules, shared semantic text/surface and tooltip-radius tokens, and registered tooltip hooks; no portal or runtime positioning dependency.
- Public API: `content` is supplementary `ReactNode`; `placement` accepts `top`, `right`, `bottom`, or `left` (default `top`). `children` is one trigger element. Native span props, `className`, refs, and typed `DesignSystemStyle` are forwarded to its anchor.
- Semantics and interaction: the caller supplies a keyboard-focusable trigger as needed. Tooltip adds its generated ID to the trigger's existing `aria-describedby` value. Hover and focus open it; Escape dismisses without moving focus; touch activation toggles it and outside pointer activation dismisses it. Tooltip content is non-interactive; use a dialog or popover for controls and links.
- Position and theme behavior: use a fixed-position tooltip in the anchor's DOM subtree so semantic tokens and scoped hooks inherit from ACME, Luna, Orchid, and nested boundaries. Prefer the requested side, flip when needed, and clamp to the visible viewport.
- Customization: register `tooltip.*` hooks for surface, text, border, radius, padding, and maximum width; the default radius comes from `radius.tooltip` (24px in Luna), while a local `tooltip.radius` hook takes precedence. Retain semantic defaults and reduced-motion/forced-color support.
- Validation: Storybook placement, theme, custom-hook, and viewport examples; browser checks for trigger relationships, hover, focus, Escape, touch dismissal, viewport fit, nested themes, and reduced motion; lint, typecheck, Storybook, package build, and package-consumer checks.

### Tabs

- Objective: switch between related panels such as settings sections, feature details, or documentation categories without navigating away.
- Dependencies: existing React package, CSS Modules, and semantic text, action, surface, border, focus, spacing, radius, and typography tokens; no new runtime dependency or token is required.
- Public API: `items` is a readonly list of `{ id, label, content, disabled?, ariaLabel? }` with unique IDs; `label` names the tab list. `value` and `onValueChange` provide controlled state; `defaultValue` initializes uncontrolled state. `orientation` accepts `horizontal` or `vertical` (default `horizontal`); `activationMode` accepts `automatic` or `manual` (default `automatic`); `variant` accepts `line` or `pills` (default `line`); `size` accepts `sm`, `md`, or `lg` (default `md`); `fullWidth` defaults to `false`. Native `div` props, refs, `className`, and typed `DesignSystemStyle` are forwarded.
- Semantics and interaction: a named `role="tablist"` contains native buttons with `role="tab"`, `aria-selected`, roving `tabIndex`, and `aria-controls`. Panels use `role="tabpanel"` and `aria-labelledby`; inactive panels remain mounted but are hidden. Disabled tabs are skipped. Horizontal lists use Left/Right Arrow; vertical lists use Up/Down Arrow; Home/End move to the first/last enabled tab. Horizontal arrow direction follows text direction. Automatic activation selects on arrow navigation; manual activation moves focus only until Enter, Space, or pointer activation. The selected panel is focusable.
- State: uncontrolled mode keeps selection internally. Controlled mode reports requested values through `onValueChange` and changes only when the consumer updates `value`. If the current value is missing or disabled, the first enabled item is the displayed selection; an empty or fully disabled list has no selected panel.
- Customization: use `variant`, `size`, `orientation`, `fullWidth`, semantic tokens, CSS Modules, `className`, and typed `style`; do not add theme-specific React branches or undocumented hooks.
- Validation: Storybook controls for state, orientation, activation, variants, sizes, disabled items, and themes; browser tests for roving focus, automatic/manual activation, orientation-aware and RTL arrow keys, Home/End, disabled tabs, panel relationships, nested themes, and mobile overflow; lint, typecheck, Storybook, package build, and package-consumer checks.

Every component must use native HTML semantics when applicable, public semantic tokens or registered component hooks, and documented focus, disabled, loading, keyboard, and state behavior as relevant. Cover ACME, Luna, custom themes, scoped overrides, and nested boundaries.

Use CSS Modules for styles. Visual properties must come from tokens or documented hooks. Do not add theme-specific React branches, raw component colors, pixel font sizes, arbitrary spacing, or literal radii/shadows. Structural values such as `0`, `auto`, `currentColor`, `transparent`, and fluid grid sizing are allowed.

Add stories for standard and important edge states; test real pointer and keyboard interactions. Update the generated-token source rather than generated output. Document public changes and decisions. Run relevant checks and report results. New semantic tokens need a distinct documented purpose, complete theme coverage, and contrast coverage.

Rules enforced by CI: token schema and reference validity, complete theme maps, generated-output freshness, CSS literal restrictions, types, documented contrast pairs, story interactions, visual snapshots, package exports, and clean-consumer installation.

Rules requiring a human review: keyboard navigation, screen-reader naming, zoom, focus clipping, snapshot differences, API necessity, and whether a proposed token duplicates an existing semantic role.
