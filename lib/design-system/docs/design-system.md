# Design-system specification

## Scope and architecture

This is one forkable React/TypeScript package. React owns rendering and interaction; CSS Modules own component styling; CSS custom properties are the public styling API. Storybook is the living documentation and development environment. Token compilation is TypeScript-only and has no React dependency.

For application installation, global stylesheet setup, and consumer examples, see the package [developer quick start](../README.md).

The package exposes ESM, TypeScript declarations, `tokens.css`, `styles.css`, and separate ACME, Luna, Orchid, Atom, and Sublime theme stylesheets. React stays external to the bundle. CSS files are preserved by the package `sideEffects` declaration.

## Token contract

Token sources use a deliberately small schema in `src/tokens/schema.json`; this project does not claim conformance to an external design-token standard.

1. **Foundations** (`foundations.json`) define shared scales and internal palette references. The palette is used at compile time and is not emitted as a public CSS API.
2. **Semantic tokens** (`contract.json`) name public roles by purpose and are fully specified by every effective theme.
3. **Component hooks** (`component-hooks.json`) are optional documented component overrides. They are unset by the component, have local CSS fallbacks, and reset at theme boundaries.

Every token has a stable dotted name, a supported type, a value, and a description. Dimensions are constrained by category: font sizes are `rem`; spacing, layout, control, focus, radius, and border values are `px`; line heights are unitless; font weights are numeric; motion durations are `ms`. The shared font families include sans and monospace stacks. Structural CSS values such as `0`, `auto`, `currentColor`, and `transparent` are permitted where appropriate.

### Motion

Use `motion.duration.*` for transition timing, `motion.easing.*` for the standard, enter, and exit curves, and `motion.distance.*` for movement offsets. These semantic roles are theme-overridable; component CSS should use the same `--ds-motion-*` variable names in every theme. Distance tokens describe animation movement, not layout spacing: use `subtle` for small feedback, `standard` for menus and toasts, and `prominent` for dialogs and other high-emphasis overlays. Keep large structural movements such as an off-canvas drawer proportional to its own size.

Reduced motion is a user preference, not a theme token. Components must respect `prefers-reduced-motion`, removing nonessential movement and stopping motion-driven behavior such as carousel autoplay. Do not rely on zeroing token values alone: disable transitions and transforms where needed, and preserve immediate state changes and functionality.

The compiler validates names, descriptions, types, units, references, cycles, reference type compatibility, theme completeness, and generated CSS-variable collisions. It resolves references to concrete values, generates deterministic CSS, TypeScript names and a manifest, and exits with an error if checked-in output is stale. Add or edit source files only; never hand-edit `src/generated/`.

### Semantic color roles

Shared surfaces use `color.canvas`, `color.surface.primary`, `color.surface.secondary`, `color.surface.raised`, and `color.surface.overlay`. Themes may give adjacent roles the same value when that best fits their visual hierarchy; the role names still let components communicate intent consistently. Pair text with the surface role it appears on.

Use `color.text.disabled` for inactive content and `color.text.inverse` for foreground text on high-emphasis primary actions. Use `color.border.subtle` for decorative dividers only; interactive controls and required boundaries need a contrast-checked role such as `color.border.control` or `color.border.strong`. Status colors provide paired foreground and background roles for success, info, warning, error, and neutral messages.

New theme roles are checked against their documented text and indicator contrast pairs. Add contrast pairs whenever a role is intended to be readable or visible on a specific surface.

### Border widths and elevation

Border color and width are independent semantic decisions. Use `border.width.subtle` for separators and low-emphasis boundaries, `border.width.default` for ordinary component edges, and `border.width.strong` for prominent outlines. Pair them with the appropriate `color.border.*` role; do not use a thicker border as a substitute for sufficient contrast.

Use `shadow.elevation.surface`, `shadow.elevation.control`, and `shadow.elevation.overlay` as complete `box-shadow` values for content surfaces, controls, and floating overlays. Themes can define soft shadows, hard offsets, or `none` without every component rebuilding a shadow from color and offset fragments. Atom's vivid surface and control shadows have equal rightward and downward offsets (6px and 3px); its soft floating-overlay shadow is offset 8px in both directions. The Accordion intentionally suppresses its own shadows in Atom. The older `shadow.color` and `shadow.offset.*` tokens remain available for compatibility and scrim tinting, but new component styles should consume the semantic elevation roles.

### Layer scale

The shared `layer.*` foundation tokens establish a consistent stacking order: base content, sticky bars, fixed navigation, dropdowns and popovers, scrims, tooltips, then notifications. A navigation scrim covers page dropdowns; its panel and toggle sit just above the scrim. Use these levels for overlays shared between components. Small `z-index` values used only to order items inside one component (for example, a focused tab above its siblings) may remain local. Native modal dialogs use the browser top layer and are not ordered by this scale.

### Responsive breakpoints

The shared `breakpoint.*` foundation scale is `narrow` (32rem), `compact` (40rem), `medium` (48rem), and `wide` (72rem). Component CSS uses named `@media` aliases such as `@media (--ds-viewport-compact)` and `@media (--ds-viewport-medium-up)`. The build expands these aliases to standard media queries, keeping source breakpoints consistent without relying on CSS custom properties inside `@media`, where they are not supported. Use the narrow and compact aliases for small-screen adjustments, the below-medium and medium-up aliases for the tablet/desktop transition, and wide-up for expanded desktop layouts.

Applications consuming the package can use the same aliases through the public `@workspace/design-system/breakpoint-media` entry. With Vite, add the plugin to the app's existing plugin list:

```ts
import { defineConfig } from "vite";
import { breakpointMediaVitePlugin } from "@workspace/design-system/breakpoint-media";

export default defineConfig({
  plugins: [breakpointMediaVitePlugin()],
});
```

For a PostCSS config, add `breakpointMediaPlugin()` to its `plugins` array instead. Either plugin expands aliases in the application's CSS at build time and reports unknown viewport aliases as errors.

## Theme contract

Corner radii are semantic roles, not a theme-wide shape setting. General content surfaces use `radius.surface` (12px ACME, 32px Luna, 12px Orchid); action controls and single-line form controls retain separate tokens and remain pills in Luna. Specialized menu, tooltip, textarea, and form-group tokens retain their public compatibility values (32px in Luna). Explicit shape props and consumer hooks override defaults. See `docs/theming.md` and the **Foundations/Radius Policy** stories for the full policy.

ACME is the default unthemed document. Luna is a dark, Sailor Moon-inspired palette with midnight-indigo surfaces, moonlight and lavender text, rose-pink actions, crescent-gold accents, and softer shapes. Atom is a dark comic-book theme with vivid inks and hard-offset shadows; Sublime draws on the Sublime code editor. Orchid demonstrates a custom theme extending Luna. All themes share the same type and spatial scales.

Use ordinary markup:

```html
<section data-ds-theme="acme">
  <button>Save changes</button>
  <section data-ds-theme="luna">
    <button>Continue</button>
  </section>
</section>
```

Every theme boundary sets its complete semantic map. Semantic CSS variables contain concrete values rather than aliases, so local semantic overrides resolve predictably. Runtime states are independent variables: overriding a resting primary background does not change its hover or pressed token.

Every registered component hook is reset to `initial` at a theme boundary. That stops an outer hook from leaking into a nested theme while allowing an override placed on the inner boundary. Custom themes can extend another source theme; generated output remains complete and independent of its source theme.

`ThemeScope` is a lightweight wrapper for `data-ds-theme` and typed hook styles. It never changes global document state. Custom theme names may also be used directly in HTML.

## Button contract

```ts
type ButtonProps = Omit<
  React.ComponentPropsWithRef<"button">,
  "style" | "aria-busy" | "aria-disabled"
> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  shape?: "rounded" | "square" | "pill";
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  iconOnly?: boolean;
  loading?: boolean;
  style?: DesignSystemStyle;
};
```

Defaults are `variant="primary"`, `size="md"`, and `type="button"`. Native refs, `className`, form properties, accessible naming attributes, and remaining button props are forwarded. The component owns `aria-busy` and `aria-disabled`.

Small, medium, and large targets have minimum block sizes of 44, 48, and 56px. Padding is tokenized and controls grow with the user's typography settings; the component has no fixed height. Long labels wrap.

The optional `shape` prop selects rounded (12px), square, or pill corners. When omitted, the button uses the active theme's control radius. `fullWidth` makes it fill its containing block and defaults to `false`.

The optional `icon` slot renders a decorative icon on the left by default or on the right with `iconPosition="right"`. `iconOnly` hides the text and requires an accessible name via `aria-label` or `aria-labelledby`; an icon-only button also requires an icon.

Native disabled uses the native `disabled` attribute. Loading preserves focus with `aria-disabled` and `aria-busy`, suppresses the forwarded click callback and the click's default submit/reset activation, and retains the accessible name. The label stays in layout with zero opacity while an `aria-hidden` spinner is centered over it. Hover and pressed states do not apply while disabled or loading. Reduced-motion and forced-colors preferences receive explicit treatment. Keyboard focus uses a visible tokenized outline.

The owning form manages longer asynchronous submission state. Children may contain decorative icons, which should be hidden from assistive technology. `href`, `asChild`, toggle semantics, and group behavior are out of scope for Button itself; use ToggleButton or ToggleGroup for selection state.

## ToggleGroup

`ToggleGroup` coordinates selection state for toggle buttons while reusing `ButtonGroup` layout behavior. Its group requires an accessible name through `aria-label` or `aria-labelledby`; every item has a unique non-empty `value`, a visible `label`, and an optional `ariaLabel` for icon-only content.

`selectionMode` defaults to `single`. In single mode, `value` is a string or `null`, and `onValueChange` receives the newly selected value or `null` when cleared. `allowEmpty` defaults to `true`; set it to `false` to prevent clearing the current choice. In `multiple` mode, `value` and `defaultValue` are string arrays and `onValueChange` receives the updated array. Selection can be controlled with `value` or initialized with `defaultValue`.

Items render as native toggle buttons with `aria-pressed`. Each button remains in the normal Tab order; the component does not implement arrow-key or roving-focus navigation. Use `disabled` on the group or an item to disable selection. Orientation, spacing, alignment, full width, equal width, wrapping, appearance, size, and variant are forwarded from `ButtonGroup`.

```tsx
<ToggleGroup
  aria-label="View mode"
  items={[
    { value: "grid", label: "Grid" },
    { value: "list", label: "List" },
  ]}
  defaultValue="grid"
  onValueChange={(value) => setView(value)}
/>
```

## RangeField

`RangeField` is a labeled native `<input type="range">` with a visible current-value output. It uses `min` (default `0`), `max` (default `100`), and `step` (default `1`) constraints. If neither `value` nor `defaultValue` is supplied, it starts at the midpoint rounded to the nearest step. `value` with `onValueChange` provides controlled state; `defaultValue` initializes uncontrolled state. Native `onChange`, `name`, and other input attributes are forwarded.

`formatValue` formats the visible output without changing the numeric slider value. `getAriaValueText` provides a localized or unit-bearing accessible value. `label` is required; `description`, `error`, `invalid`, and `disabled` follow the shared form-field contract. Range inputs always have a value, so the native `required` validation state is not exposed. The slider retains native Tab, arrow-key, and form-submission behavior. The output is hidden from assistive technology because the range input already exposes its current value.

```tsx
<RangeField
  label="Moving budget"
  name="budget"
  min={0}
  max={1000}
  step={50}
  defaultValue={250}
  formatValue={(value) => `$${value}`}
  getAriaValueText={(value) => `${value} dollars`}
/>
```

## Combobox

`Combobox` is a searchable single-select form control. `options` is a readonly list of unique `{ value, label, disabled? }` entries. Matching is case-insensitive against the option label by default; `filterOptions(options, query)` can supply custom filtering. Editing the query clears any previous selection, and free-form query text is not submitted as an option.

The text input exposes the ARIA combobox/listbox pattern. Focus opens the list; Arrow keys, Home, and End move the active option while skipping disabled entries; Enter selects; Escape closes and restores the selected label; Tab leaves the field. Pointer selection keeps focus on the input. `value` with `onValueChange` provides controlled state; `defaultValue` initializes uncontrolled state. A hidden named input submits the selected option's value. `required`, `disabled`, `description`, `error`, and `invalid` follow the shared form-field contract; required validation only passes after an option is selected.

`loading` and `loadingMessage` announce asynchronous loading states; the message is paired with a decorative small Spinner. `noResultsMessage` customizes the empty result message. `allowClear` defaults to `true`, and `clearLabel` localizes its accessible name. Invalid or duplicate options and a non-loading selected value that does not match an option fail explicitly. The control uses semantic form/menu tokens and supports all built-in and nested themes.

```tsx
<Combobox
  label="Service region"
  name="region"
  options={[
    { value: "ca", label: "Canada" },
    { value: "us", label: "United States" },
  ]}
  placeholder="Search regions"
  required
/>
```

## Badge

```tsx
<Badge tone="success" size="sm" dot>
  Published
</Badge>

<Badge
  tone="accent"
  shape="pill"
  icon={<Icon name="sparkle" size="sm" />}
>
  New
</Badge>
```

`Badge` is a static, inline label for status, category, and highlight text. `tone` accepts `neutral` (default), `accent`, `success`, `warning`, or `error`; status tones use semantic theme color pairs with verified text contrast. `size` accepts `sm`, `md` (default), or `lg`. Omit `shape` to use the active theme's control radius, or choose `rounded`, `square`, or `pill`.

An optional `icon` is decorative and appears on the left by default; set `iconPosition="right"` to place it after the label. `dot` adds a decorative status marker. If both are supplied, both are shown. Icons and dots are hidden from assistive technology, so keep the visible label meaningful and do not use color alone to convey status.

`Badge` renders a native `span` and adds no interaction or live-region behavior. It forwards native span props, refs, `className`, and typed `style`. The component follows ACME, Luna, Orchid, nested, and custom themes without theme-specific rendering.

## Chip

```tsx
<Chip>Design systems</Chip>

<Chip selected={isSelected} onSelect={setIsSelected}>
  Accessibility
</Chip>

<Chip onRemove={removeTag} removeLabel="Remove Drafts">
  Drafts
</Chip>
```

`Chip` presents a compact content tag or filter. A chip is static by default. Pass `selected` with `onSelect(nextSelected)` to render a native toggle button with `aria-pressed`; selection is controlled by the consumer. Pass `onRemove` with a localized `removeLabel` to add a separate remove button. When both actions are present, they render as sibling buttons rather than nested controls. `disabled` disables available actions.

The component supports `sm`, `md` (default), and `lg` sizes, uses the active theme's semantic surface, border, accent, disabled, and focus tokens, and follows the theme's control radius. It forwards native span attributes, refs, `className`, and typed `style` and supports nested/custom themes without theme-specific rendering.

## Tooltip

```tsx
<Tooltip content="Your changes are saved automatically." placement="right">
  <Button variant="ghost" aria-label="About automatic saving">
    More information
  </Button>
</Tooltip>
```

`Tooltip` reveals brief supplementary help on pointer hover and keyboard focus, and can be opened or dismissed by touch. It preserves any existing `aria-describedby` IDs on the single trigger element and adds its own description ID. Escape closes the tooltip without moving focus; outside pointer activation dismisses it.

Tooltip content is non-interactive and must not contain essential instructions by itself. The component keeps its fixed-position content in the trigger's DOM subtree, preserving semantic tokens and scoped hooks across ACME, Luna, Orchid, and nested theme boundaries. It flips placement when necessary and clamps to the viewport. `placement` accepts `top`, `right`, `bottom`, or `left`; `tooltip.*` hooks customize visual details. The default radius follows `radius.tooltip` (6px in ACME, 32px in Luna, 16px in Orchid), with the local `tooltip.radius` hook taking precedence.

## Popover

```tsx
<Popover
  triggerLabel="Profile settings"
  trigger="Profile settings"
  heading="Profile settings"
  description="Update preferences for your account."
  placement="bottom"
  align="end"
  showCloseButton
>
  <ProfileSettings />
</Popover>
```

`Popover` presents interactive or supplementary content next to a button trigger. It is non-modal: it does not block the page, trap focus, or add a backdrop. The trigger has a required accessible `triggerLabel`; `trigger` customizes its visible content. `heading`, `description`, and `showCloseButton` optionally add a named panel header.

`open` with `onOpenChange` provides controlled state; `defaultOpen` initializes uncontrolled state. Escape, outside pointer activation, and focus leaving the component close it by default; each dismissal behavior can be configured. `autoFocus` focuses the first enabled control when opened. Escape or closing from inside returns focus to the trigger by default, while clicking elsewhere leaves focus with the outside target. Normal Tab order is not trapped.

Choose `placement` (`top`, `right`, `bottom`, or `left`) and `align` (`start`, `center`, or `end`); the panel flips to the opposite side when space is insufficient and clamps to the viewport. `offset` and `collisionPadding` accept non-negative pixel values, otherwise the component uses active spacing tokens. `matchTriggerWidth` aligns the panel's minimum width to its trigger; `panelMaxWidth` limits its width. Trigger variant, size, shape, and icon are configurable. `panelClassName` and typed CSS `panelStyle` customize the content surface.

The component uses the browser's top layer while remaining in its DOM subtree, so themes and scoped tokens continue to inherit across nested theme boundaries. The panel uses the surface radius role (32px in Luna), semantic surface, text, border, shadow, and motion tokens, and respects reduced-motion and forced-colors settings. Use `Menu` for keyboard-navigable action lists and `Dialog` for modal decisions.

## Icon

```tsx
import { Icon } from "@workspace/design-system";

<Icon name="sparkle" />
<Icon name="search" size="lg" />
<Icon name="search" decorative={false} label="Search" />
```

`Icon` renders a named SVG from the built-in icon catalog: `arrow-left`, `arrow-right`, `book`, `check`, `chevron-down`, `chevron-right`, `close`, `folder`, `grid`, `heart`, `list`, `menu`, `moon`, `pause`, `play`, `search`, `settings`, and `sparkle`. The package exports the `IconName` type and `iconNames` list for typed APIs and controls.

Icons are decorative and hidden from assistive technology by default. Set `decorative={false}` and provide a concise, non-empty `label` when the icon itself communicates meaning. `size` accepts `xs`, `sm`, `md`, `lg`, or `xl` and maps to 12px, 16px, 20px, 24px, or 32px from the shared spacing tokens. SVG attributes, refs, `className`, and typed `style` are forwarded.

The paths use `currentColor`, so icons inherit the surrounding text color in ACME, Luna, Orchid, and custom themes. The catalog is inline SVG and adds no third-party icon dependency.

## Typography

```tsx
<Heading level={2}>Build with a clear hierarchy</Heading>
<Text size="lg">Supporting copy follows the active theme's type scale.</Text>
<Text as="span" tone="muted" size="sm">Updated today</Text>
```

`Heading` renders the semantic heading element selected by `level` (`1`–`6`); its optional `size` is independent from that semantic level. It defaults from `5xl` at level 1 down to `lg` at level 6. `Text` renders a paragraph by default and accepts `as="span"` or `as="div"` when different native markup is needed. Both support the shared size scale (`xs`–`5xl`), weights (`regular`, `medium`, `semibold`), and text tones (`primary`, `muted`); they use the active theme's typography and text-color tokens.

Both components forward native HTML attributes, refs, children, `className`, and typed `DesignSystemStyle`. Choose heading levels to match the document outline, not their visual appearance. Text and heading colors and typography inherit from the active theme; no typography-specific hooks or theme branches are needed.

## Responsive header

```tsx
<Header
  logo={<BrandMark />}
  logoHref="/"
  logoLabel="Acme home"
  navItems={[
    { label: "Products", href: "/products" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about", current: true },
  ]}
  cta={<Button>Get started</Button>}
  size="md"
  sticky={false}
  borderBottom
/>
```

`Header` accepts a React-node logo and CTA, native anchor props for each navigation item, an optional accessible navigation name, three minimum bar heights (`sm` 48px, `md` 64px, `lg` 80px), `sticky`, and `borderBottom`. The logo is linked to `logoHref` and named by `logoLabel`; the default label is "Home". The border is on by default and stickiness is off by default.

The layout is mobile-first, with the desktop navigation at 48rem. On mobile, the accessible menu button discloses the navigation and places the single CTA slot below it. On desktop, navigation and CTA sit inline. Escape closes the mobile menu and returns focus to its button; selecting a navigation link closes the menu. The CTA stays in one DOM location across breakpoints, so consumers do not get duplicate IDs or state.

## Responsive hero

```tsx
<Hero
  eyebrow="A clearer way forward"
  title="Make room for your next big idea"
  description="Bring your team and plans together in one workspace."
  media={<ProductIllustration />}
  layout="split"
  mediaPosition="end"
  background="surface"
  primaryAction={<Button>Start for free</Button>}
  secondaryAction={<Button variant="ghost">Explore features</Button>}
/>
```

`Hero` renders a labeled native section with a configurable heading level. Content slots include `eyebrow`, `title`, `description`, `media`, primary/secondary actions, or a custom `actions` row. It supports split and stacked layouts, start/center alignment, media position and crop, three sizes, semantic background variants, and four content widths. Split layouts stack on mobile. All supplied content and action slots remain in a single DOM tree.

The media slot accepts images, video, or composed React nodes. Informative images need consumer-provided alternative text. `style` accepts typed `hero.*` component hooks for colors, vertical padding, spacing, and media radius; native section props and `className` are forwarded.

## Card

```tsx
<Card
  eyebrow="Workspace"
  title="Design project overview"
  description="Keep the latest updates, files, and decisions in one place."
  media={<ProjectArtwork />}
  layout="horizontal"
  mediaPosition="start"
  variant="surface"
  actions={<Button size="sm">Open card</Button>}
/>
```

`Card` renders a semantic article with independent eyebrow, title, description, metadata, header-action, media, body, footer, and action slots. It supports vertical or responsive horizontal layout, four variants, three sizes, start/center alignment, square/rounded shape, configurable media crop, and heading levels. The card itself is not a link or button; interactive content remains in explicit action slots.

The `card.*` component hooks customize the surface, text, border, radius, padding, spacing, and media corners. Its colors use semantic theme tokens and its media slot accepts images, video, or composed React nodes.

## ArticleCard

```tsx
<ArticleCard
  category={{ label: "Small business", href: "/journal/topics/small-business" }}
  title="A calmer morning routine for your studio"
  href="/journal/calm-morning-routine"
  excerpt="Small changes to the opening routine can make busy workdays feel more manageable."
  image={{
    src: "/images/calm-studio.jpg",
    alt: "A quiet studio with plants beside a sunlit desk",
    width: 1200,
    height: 675,
  }}
  author={{ name: "Maya Chen", href: "/journal/authors/maya-chen" }}
  publishedAt={{ dateTime: "2026-05-14", label: "May 14, 2026" }}
  readingTime="6 min read"
/>
```

`ArticleCard` composes the semantic `Card` with blog-specific content and link behavior. The required title links to `href`; `category`, `excerpt`, `author`, `publishedAt`, `readingTime`, and `image` are optional. Publication dates use a machine-readable `dateTime` value and a separate visible label. Image attributes are forwarded to a native `<img>`; supply meaningful `alt` text for informative images, or an empty string for decorative images. The image defaults to lazy loading and a wide crop.

The optional author avatar is decorative by default because the author name is visible beside it. `showReadMore` defaults to `true` and adds a descriptive link to the same article destination. Card layout, size, shape, variant, heading level, theme tokens, and `card.*` hooks remain configurable. The component does not fetch articles, resolve routes, or manage publishing.

## Testimonials

```tsx
<Testimonials
  heading="What our customers say"
  items={[
    {
      id: "maya-chen",
      quote: "The team made a busy season feel much easier to manage.",
      author: { name: "Maya Chen", role: "Owner", company: "Northstar Studio" },
      rating: 5,
    },
  ]}
  layout="featured"
/>
```

`Testimonials` presents consumer-provided quotes in a responsive grid or as one featured quote. Each card uses the existing `Card` surface, size, and shape options. Author roles, businesses, portraits, and one-to-five-star ratings are optional. Ratings use the shared `Rating` display mode and have a spoken label (`getRatingLabel` can localize it); the displayed star glyphs are decorative. The component does not verify reviews, fetch content, or link to review platforms.

Quotes are rendered as native blockquotes with author attribution in a figure caption. The section is named by its optional heading, `aria-labelledby`, or `aria-label` (default “Testimonials”). An empty collection renders nothing. A non-empty featured layout accepts exactly one testimonial; invalid content or ratings fail explicitly.

## Rating

`Rating` supports a read-only display mode and a selectable form-input mode. Display mode accepts a numeric `value` from `0` through `max`, including fractional values, and announces the score as a named image. `max` defaults to `5` and must be an integer from `1` to `10`; `size` accepts `sm`, `md`, or `lg`. `symbol` selects `star` (default), `heart`, or `thumbs`. The default accessible text names the score and symbol; `getRatingLabel` can customize or localize it. `showValue` and `formatValue` customize the visible score.

Input mode uses `mode="input"` and a required visible `label`. It renders a native fieldset and radio inputs for each whole-step value by default; `step={0.5}` enables half-step choices. Native Tab and arrow-key navigation and `name` form submission are preserved. `value` with `onValueChange` provides controlled state; `defaultValue` initializes uncontrolled state. `required`, `disabled`, `description`, `error`, and `invalid` follow the shared form-field contract. `symbol` applies to both input and display modes, and `getRatingLabel` names each radio choice.

```tsx
<Rating
  mode="input"
  label="Service rating"
  name="serviceRating"
  max={5}
  step={0.5}
  symbol="heart"
  defaultValue={3.5}
  required
/>
```

## Article body

```tsx
<ArticleBody aria-labelledby="article-title">
  <h2 id="article-title">A calmer morning routine for your studio</h2>
  <p>
    A welcoming studio starts before the first appointment. Read{" "}
    <a href="/journal/studio-planning">our studio planning guide</a> for ideas.
  </p>
  <blockquote>
    <p>The best routine makes the day easier for the people who use it.</p>
  </blockquote>
  <figure>
    <img src="/images/studio.jpg" alt="A bright, plant-filled studio" />
    <figcaption>A calm, prepared space makes room for good work.</figcaption>
  </figure>
</ArticleBody>
```

`ArticleBody` renders a semantic `<article>` around regular HTML and styles paragraphs, all heading levels, ordered and unordered lists, links, blockquotes, figures, captions, images, and tables. It forwards native article attributes, refs, `className`, children, and typed `DesignSystemStyle`.

The reading column is limited to 72 characters per line and fluidly fits narrow screens. Inline code and preformatted blocks use the shared `font.family.mono` foundation token; preformatted blocks use a contrasting surface and scroll horizontally rather than forcing page overflow. Add `tabIndex={0}` to wide code blocks so keyboard users can focus and scroll them; focused blocks show the theme focus ring. Images scale down within the article; wide tables also scroll horizontally without forcing the page to overflow. Add `tabIndex={0}` to tables that need horizontal scrolling so keyboard users can operate them. Styling follows the active ACME, Luna, Orchid, or custom theme and includes keyboard focus and forced-colors treatment. Use headings in document order, informative image alternative text, scoped table headers, and sanitized content; the component does not parse or sanitize HTML.

## Article footnotes

```tsx
<ArticleBody aria-label="A guide to preparing your studio">
  <p>
    A short opening checklist can make busy mornings easier
    <ArticleFootnote id="citation-checklist" noteId="note-checklist" label="1" />.
  </p>
  <ArticleFootnotes
    heading="Sources and notes"
    headingLevel={2}
    items={[
      {
        id: "note-checklist",
        label: "1",
        content: <>See the <a href="/journal/opening-checklist">full opening checklist</a>.</>,
        backlinks: [{ id: "citation-checklist" }],
      },
    ]}
  />
</ArticleBody>
```

`ArticleFootnote` renders an in-text superscript anchor to a note. `ArticleFootnotes` renders a named section with an ordered list and return links to each citation marker. Supply a stable, unique marker `id`, the matching note `id` as `noteId`, and the same IDs in each note's `backlinks` list. A note can link back to multiple in-text citations. `label` controls the visible and accessible marker text; `headingLevel` keeps the notes heading in the article's semantic outline. Note content is consumer-provided React content, so external source links and formatting remain under caller control.

The components use native fragment links without JavaScript navigation, inherit ACME, Luna, Orchid, custom, and nested theme tokens, and preserve visible focus indicators and forced-colors support. The component does not resolve sources, assign citation numbering, or fetch content.

## Article table of contents

```tsx
<ArticleBody aria-label="A guide to preparing your studio">
  <h1>A guide to preparing your studio</h1>
  <ArticleTableOfContents
    aria-label="Article table of contents"
    heading="In this article"
    items={[
      { id: "prepare-the-space", label: "Prepare the space" },
      { id: "welcome-each-guest", label: "Welcome each guest" },
    ]}
  />
  <h2 id="prepare-the-space">Prepare the space</h2>
  <h2 id="welcome-each-guest">Welcome each guest</h2>
</ArticleBody>
```

`ArticleTableOfContents` renders a named native `<nav>` landmark with a visible heading and an ordered-by-input list of native fragment links. Each item pairs a consumer-provided heading `id` with its visible `label`; the IDs must match headings in the same document. `heading` defaults to “On this page”, `headingLevel` defaults to `2`, and the navigation landmark is named “Table of contents” unless its native `aria-label` is customized.

Links work with browser fragment navigation and keyboard activation without JavaScript. Styling inherits ACME, Luna, Orchid, custom, and nested theme tokens, wraps long labels on narrow screens, and retains visible focus and forced-colors support. The component does not parse article HTML, generate IDs, or own routing.

## Pagination

```tsx
<Pagination
  aria-label="Journal pages"
  currentPage={currentPage}
  totalPages={totalPages}
  siblingCount={1}
  boundaryCount={1}
  getPageHref={(page) => `/journal?page=${page}`}
/>
```

`Pagination` renders a named navigation landmark with page numbers, previous/next controls, a current-page indicator, and ellipses when pages are omitted. Use either `getPageHref(page)` for native URL links or `onPageChange(page)` for controlled buttons. The consumer owns the current page, route, and list data.

`siblingCount` controls how many page numbers appear around the current page; `boundaryCount` controls the visible page numbers at each end. Both default to `1`. The `previousLabel`, `nextLabel`, `pageLabel`, and `pageSummaryLabel` props allow localization. At narrow widths the number list is replaced by a current/total summary, while previous/next controls remain available. A one-page result renders no navigation, and invalid page values throw.

The current page uses `aria-current="page"`; callback mode uses native buttons and link mode uses native anchors. Styling inherits action, border, focus, spacing, and radius tokens across built-in, nested, and custom themes.

## Breadcrumbs

```tsx
<Breadcrumbs
  aria-label="Service breadcrumb"
  items={[
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Repairs", current: true },
  ]}
/>
```

`Breadcrumbs` renders an ordered trail in a named native navigation landmark. Supply a native-link destination for each parent page and mark the final item with `current: true`; it is announced with `aria-current="page"` and is not linked. The consumer owns all URLs and routing. The landmark name defaults to “Breadcrumb” and can be customized with `aria-label`.

Long labels wrap at narrow widths. Link colors, spacing, corner radius, and visible keyboard focus inherit built-in, custom, and nested theme tokens.

## Pricing details

```tsx
<PricingDetails
  eyebrow="Annual plan"
  title="Professional"
  description="Everything your growing team needs to stay on track."
  price="$39"
  billingPeriod="per user / month, billed annually"
  variant="featured"
  layout="split"
  details={[
    { id: "members", label: "Team members", value: "Up to 10" },
    { id: "support", label: "Support", value: "Priority", emphasis: true },
  ]}
  primaryAction={<Button>Start a trial</Button>}
/>
```

`PricingDetails` presents consumer-provided price content, billing context, optional comparison price, structured definition-list rows, features, footnote, and action slots. It supports stacked or responsive split layout, five visual variants, three sizes, start/center alignment, and rounded/square shapes. It does not calculate totals, format currency, or initiate checkout; callers own localization and payment behavior. The `pricing.*` hooks customize its theme-aware surface, text, price, borders, spacing, and shape.

## Carousel

```tsx
<Carousel
  label="Featured stories"
  slides={[
    { id: "focus", label: "Find your focus", content: <FeaturedStory /> },
    { id: "flow", label: "Build your flow", content: <TeamStory /> },
  ]}
  loop
  indicators="dots"
  indicatorTargetSize="comfortable"
  controlsPosition="below"
/>
```

`Carousel` supports controlled or uncontrolled slide selection, optional looping and autoplay, previous/next buttons, dot or fraction indicators, overlay/below control placement, custom slide content, and an empty state. `indicatorTargetSize` is `comfortable` by default, with 44px hit targets; choose `compact` for 24px targets. The dot and selected marker remain compact at both sizes, and longer dot sets wrap within the controls row. Keyboard users can focus the carousel and use Left/Right Arrow, Home, and End; touch users can swipe horizontally. Inactive slides are hidden and inert.

Autoplay is opt-in through `autoPlay` and advances at `autoPlayInterval` (default 5 seconds). Its pause/start control is always available when enabled. Rotation pauses on hover, stops on keyboard focus or manual navigation, and stops on the last slide unless looping is enabled. Reduced-motion preferences disable autoplay and slide transitions.

Provide an accessible `label` and unique slide `id` values. Use `getSlideLabel` and `getIndicatorLabel` for localized accessible names. The `carousel.*` hooks customize theme colors, controls, indicators, spacing, and corners.

## Accordion

```tsx
<Accordion
  label="Frequently asked questions"
  items={[
    { id: "billing", title: "How does billing work?", content: <BillingDetails /> },
    { id: "cancel", title: "Can I cancel?", content: "Yes, at any time." },
  ]}
  multiple={false}
  variant="divided"
/>
```

`Accordion` renders a group of disclosures with unique item IDs, React-node titles and content, and optional disabled items. It supports single-open (default) or multi-open behavior, controlled or uncontrolled open-item state, three variants, three sizes, rounded/square corners, and configurable heading levels.

Each trigger is a native button inside a heading and connects to its panel with `aria-expanded`, `aria-controls`, and `aria-labelledby`. Panels use `role="region"` and remain mounted while closed. Native keyboard activation and Tab order are retained; there is no custom roving focus behavior. The component uses semantic theme tokens and accepts `className` and typed `style`.

## FAQ section

```tsx
<FAQSection
  heading="Frequently asked questions"
  description="A few details to help you get started."
  items={[
    { id: "booking", question: "How do I book?", answer: <p>Contact us to find a time that works.</p> },
    { id: "payment", question: "What payment methods do you accept?", answer: <p>We accept major credit cards.</p> },
  ]}
  variant="surface"
  action={<Button variant="secondary">Contact us</Button>}
/>
```

`FAQSection` composes the existing `Accordion` into a complete page section. It requires a visible heading and items with unique IDs, visible questions, and answers; an optional description and consumer-rendered `action` slot complete the section. The action's link or button behavior remains consumer-owned.

The section is named by its visible heading by default, with native `aria-label` and `aria-labelledby` overrides. Question controls are native buttons inside headings one level below the section heading, and all existing Accordion state, keyboard behavior, variants, sizes, and shapes are retained. `multiple`, `defaultOpenItems`, `openItems`, and `onOpenItemsChange` configure single/multi-open and controlled state. Empty item lists render nothing; invalid IDs, blank headings/questions, missing answers, or heading levels outside 1–5 fail explicitly. The section follows ACME, Luna, Orchid, custom themes, and nested theme boundaries without additional tokens.

## Tabs

```tsx
<Tabs
  label="Account settings"
  defaultValue="profile"
  items={[
    { id: "profile", label: "Profile", content: <ProfilePanel /> },
    { id: "security", label: "Security", content: <SecurityPanel /> },
    { id: "notifications", label: "Notifications", content: <NotificationPanel /> },
  ]}
  orientation="horizontal"
  activationMode="automatic"
  variant="line"
/>
```

`Tabs` switches between related panels in one view. Each item needs a unique `id`, visible `label`, and `content`; `disabled` removes an item from selection and keyboard navigation. Use `ariaLabel` only when the visible label does not provide an accessible name, such as an icon-only label. The required `label` names the tab list.

Selection can be uncontrolled with `defaultValue` or controlled with `value` and `onValueChange`. `orientation` is `horizontal` or `vertical`; horizontal lists respond to Left/Right Arrow and vertical lists to Up/Down Arrow. Home/End move to the first/last enabled tab. In automatic mode (default), arrow navigation also selects; manual mode moves focus without switching panels until Enter, Space, or a click. Horizontal arrow direction respects right-to-left text. Inactive panels stay mounted and hidden; the active panel is focusable.

Choose `variant="line"` or `variant="pills"`, `size="sm" | "md" | "lg"`, and `fullWidth` to control presentation. Styling uses semantic tokens, so tab states inherit ACME, Luna, Orchid, and custom theme colors without theme-specific rendering. Native `div` props, refs, `className`, and typed `style` are forwarded.

## ContactSection

```tsx
<ContactSection
  heading="Visit our studio"
  address={{
    lines: ["48 Queen Street West", "Toronto, ON M5H 2N2"],
    directionsHref: "https://maps.example.test/directions",
  }}
  contactMethods={[
    { id: "phone", label: "Phone", value: "(416) 555-0134", href: "tel:+14165550134" },
    { id: "email", label: "Email", value: "hello@example.com", href: "mailto:hello@example.com" },
  ]}
  hours={[
    { id: "monday", day: "Monday", hours: "9:00 AM – 5:00 PM" },
    { id: "sunday", day: "Sunday", hours: "Closed" },
  ]}
  action={<Button>Request a quote</Button>}
  form={<ContactForm />}
  variant="surface"
  layout="split"
/>
```

`ContactSection` is a responsive small-business contact composition. Its visible `heading` is required and names the native section; the default heading level is `h2`, and `headingLevel` can be set from `1` to `6`. Detail headings use the next heading level. Address lines are rendered inside `<address>`; contact methods and weekly hours use definition lists. Contact methods accept native anchor attributes, while directions use a native link with a consumer-provided destination and optional label.

`addressHeading`, `contactHeading`, and `hoursHeading` customize the detail headings; the directions label defaults to “Get directions.” Hours are displayed as supplied. `variant` accepts `plain` (default), `surface`, or `accent`. `layout="split"` places an optional form beside business details on wider screens and stacks it on mobile; `layout="stacked"` keeps one column at every size. `action` and `form` accept consumer-owned React content. This component does not embed a map, calculate open/closed state, submit forms, or manage booking state.

The `contact.*` hooks customize its surface, text, muted text, border, link color, radius, padding, and spacing. Theme tokens, nested theme boundaries, and custom hooks are supported.

## Footer

```tsx
<Footer
  brand={<Brand />}
  description="A short description of the company."
  logoHref="/"
  logoLabel="Company home"
  linkGroups={[
    { id: "company", title: "Company", links: [{ id: "about", label: "About", href: "/about" }] },
  ]}
  copyright="© 2026 Company"
  legalLinks={[{ id: "privacy", label: "Privacy", href: "/privacy" }]}
/>
```

`Footer` renders a responsive semantic footer with optional brand and description, grouped navigation, social links, legal links, custom content, and bottom content. It supports three visual variants and sizes and configurable link-group heading levels. Links are native anchors; navigation, destinations, and any stateful content belong to the consumer. Each non-empty link collection has its own accessible `nav` label. Icon-only links need a supplied `aria-label`.

The footer uses semantic text, surface, border, focus, spacing, and radius tokens and accepts `className` and typed `style`.

## Dialog

```tsx
<Dialog
  open={isOpen}
  onOpenChange={setIsOpen}
  heading="Delete this draft?"
  description="This action cannot be undone."
  size="md"
  closeOnEscape
  footer={<Button onClick={() => setIsOpen(false)}>Delete draft</Button>}
>
  <p>Are you sure you want to delete the draft?</p>
</Dialog>
```

`Dialog` is a controlled, modal-only component built on the native `<dialog>` element. `open` and `onOpenChange` are required; an external trigger updates the consumer's state. `heading`, `description`, `children`, and `footer` compose the content. It supports three maximum-width sizes, configurable heading level, a visible close button by default, Escape dismissal by default, and optional backdrop-click dismissal (off by default).

The native modal provides top-layer rendering, focus containment, background inertness, initial focus, and return focus. A native `form method="dialog"` can close the panel; the resulting close event calls `onOpenChange(false)`. Escape and backdrop dismissal request a controlled close rather than changing native open state behind the consumer. Use `aria-label` or `aria-labelledby` when omitting `heading`; `description` is connected with `aria-describedby`.

The `dialog.*` hooks customize surface, text, border, backdrop, radius, padding, and size widths. The dialog is not portalled: theme variables and scoped hooks inherit from its DOM ancestors even while the browser paints it in the top layer.

## Callout

```tsx
<Callout
  tone="warning"
  title="Review before publishing"
  icon={<Icon name="sparkle" />}
  action={<Button variant="secondary">Review changes</Button>}
>
  Your latest edits have not been checked yet.
</Callout>
```

`Callout` is persistent in-flow content for status, guidance, or next steps; it is not queued or automatically dismissed. `tone` accepts `info` (default), `success`, `warning`, `error`, or `neutral`. The visible title and body carry its meaning; an optional icon is decorative. The optional `action` slot accepts consumer-provided links or buttons.

The outer border matches the tone-specific leading accent by default. The `callout.border` hook can override the outer border independently. It renders a generic `div` with no implicit role or live-region behavior. When dynamically inserting content that needs announcing, set the native `role` prop to `status` or `alert` as appropriate. Callout actions retain their native behavior. The `callout.*` hooks customize its surface, text, border/accent, radius, padding, and spacing. Theme-aware semantic colors and nested theme boundaries are supported.

## Progress

```tsx
<Progress label="Uploading files" value={4} max={10} />

<Progress label="Saving changes" valueText="Working…" />
```

`Progress` is a linear indicator for ongoing or completed work. Its visible `label` is required. Supply `value` for determinate progress; omit it for indeterminate progress. `max` defaults to `100`. Values are clamped between `0` and `max`; `max` must be greater than zero.

Determinate progress exposes `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`. Indeterminate progress omits `aria-valuenow`. A provided `valueText` replaces the default visible percentage and is exposed as `aria-valuetext`; `showValue={false}` hides the visible value without changing accessible progress semantics. The component does not create a live region, so progress updates are not automatically announced.

The `progress.*` hooks customize track, indicator, label/value text, height, radius, and spacing. Theme tokens and scoped overrides inherit through nested ACME, Luna, Orchid, and custom themes. Reduced-motion and forced-colors preferences are supported.

## Spinner

```tsx
<Spinner label="Loading search results" />

<Button loading>
  Save changes
</Button>
```

`Spinner` is a circular indicator for indeterminate work. Its standalone default uses `role="status"` and the accessible name `Loading`; set `label` to describe the operation. Use `decorative` when nearby text or a containing control already communicates the loading state. Button uses Spinner in this decorative mode while retaining its own busy and disabled semantics.

`size` supports `sm`, `md`, and `lg` and defaults to `md`. The indicator inherits `currentColor`, follows the active theme and parent context, and stops rotating when reduced motion is requested. It is an indicator rather than a content surface, so it does not receive surface elevation. Forced-colors mode retains a visible system-colored ring. Use `Progress` for linear or measurable work and `Skeleton` for content-shaped loading placeholders.

## Toast

```tsx
function SaveButton() {
  const { showToast } = useToast();

  return (
    <Button
      onClick={() => showToast({
        title: "Changes saved",
        description: "Your profile is up to date.",
        variant: "success",
        action: { label: "View profile", onClick: openProfile },
      })}
    >
      Save profile
    </Button>
  );
}

<ThemeScope theme="luna">
  <ToastProvider position="bottom-end">
    <SaveButton />
  </ToastProvider>
</ThemeScope>
```

`Toast` is the individual notification; `ToastProvider` owns the FIFO queue and renders a labeled viewport, and `useToast` exposes `showToast`, `dismissToast`, and `dismissAll`. New messages are queued while the visible limit is reached (`maxVisible`, default `5`); dismissing a visible message promotes the next queued message. The hook returns each notification's ID so a caller may dismiss it directly.

Toast titles and optional descriptions are consumer-provided content. Variants are `info` (default), `success`, `warning`, and `error`. All variants announce with `role="status"` except errors, which announce with `role="alert"`. The close control has an accessible name. Optional actions invoke their callback and then dismiss the toast.

`duration` defaults to five seconds. Set it to `0` (or a negative value) to keep a toast visible until the user dismisses it; the timer pauses while the pointer or keyboard focus is inside a toast. Position accepts `top-start`, `top-end`, `bottom-start`, or `bottom-end`, defaulting to `bottom-end`. Place the provider under the desired theme boundary; it does not portal, so scoped theme values and hooks inherit normally. The `toast.*` hooks customize the viewport spacing/width and toast surface, text, border, radius, padding, and per-variant accent colors.

## Action menu

```tsx
<Menu
  triggerLabel="Workspace actions"
  menuLabel="Workspace actions"
  placement="bottom-end"
  items={[
    { type: "item", id: "new", label: "New project", icon: <FolderIcon />, onSelect: createProject },
    { type: "divider", id: "divider-1" },
    {
      type: "submenu",
      id: "view",
      label: "View",
      items: [{ type: "item", id: "grid", label: "Grid view", onSelect: showGrid }],
    },
  ]}
/>
```

`Menu` renders a button trigger and a nested `role="menu"` tree. Items are action buttons or native links (`href`), submenus are disclosure buttons with their own labeled menus, and dividers use `role="separator"`. Icons are decorative; each menu action must have a text label. Sibling `id` values must be unique.

`trigger`, `triggerIcon`, `triggerAriaLabel`, `triggerVariant`, `triggerShape`, `size`, `placement`, `disabled`, `emptyMessage`, `closeOnSelect`, and `menuLabel` configure the trigger and menu. `open` with `onOpenChange` controls the menu; otherwise it is uncontrolled with `defaultOpen`. `menuClassName`, `itemClassName`, and `triggerClassName` allow scoped CSS customization, and `style` accepts the typed `DesignSystemStyle` hooks.

Keyboard users open the menu with Enter or Space on its trigger. The first enabled item receives focus; Up/Down, Home, and End move among items, while type-ahead moves to a matching label. Right Arrow opens a submenu, Left Arrow or Escape returns to its parent, and Escape at the root closes the menu and restores trigger focus. Tab closes the menu without preventing normal focus movement. Pointer activation outside also closes it. Selecting an action or link closes the menu by default; `closeOnSelect={false}` keeps it open, and an `onSelect` handler can call `preventDefault()` to keep it open for that activation.

The menu uses semantic surface, text, border, focus, spacing, action, and `radius.menu` tokens. The dropdown panel radius is 6px in ACME, 32px in Luna, and 16px in Orchid. The `menu.*` component hooks customize its panel, item interaction colors, radius, disabled text, and focus outline; they reset at nested theme boundaries like other hooks.

## Core form controls

```tsx
<TextField label="Email" type="email" required description="Used for account updates." />
<Textarea label="Message" rows={4} />
<Select label="Region" name="region"><option value="ca">Canada</option></Select>
<Checkbox label="Receive updates" name="updates" value="yes" />
<DateField label="Start date" name="startDate" required />
<DateField label="Review time" name="reviewTime" type="time" />
<FileField label="Attachments" name="attachments" accept=".pdf" multiple />
<Switch label="Enable reminders" name="reminders" value="yes" />
<RadioGroup
  label="Contact method"
  name="contact"
  options={[{ value: "email", label: "Email" }, { value: "phone", label: "Phone" }]}
/>
<FormLayout columns={2} gap="lg">
  <FieldGroup label="Profile" description="Your account details.">
    <TextField label="Name" name="name" required />
    <TextField label="Email" name="email" type="email" required />
  </FieldGroup>
  <FieldGroup label="Preferences">
    <Checkbox label="Send updates" name="updates" value="yes" />
  </FieldGroup>
</FormLayout>
```

Every individual control requires a visible `label` and forwards native props, refs, controlled/uncontrolled values, and form behavior. `TextField`, `DateField`, `FileField`, `Textarea`, and `Select` use native input elements; `Checkbox` and `Switch` use native checkboxes; `RadioGroup` uses a `fieldset`, `legend`, and native radios with a required shared `name`.

`description` and `error` content are connected with `aria-describedby` while preserving IDs supplied by the caller. An `error` sets `aria-invalid`; use `invalid` when an invalid state has no message. Native `required` and `disabled` behavior is retained. The controls do not provide a form state manager, validation rules, or asynchronous submission handling.

`DateField` allows `date`, `datetime-local`, `month`, `time`, and `week` input types, defaulting to `date`. `FileField` keeps browser-native file selection and accepts the native `accept` and `multiple` attributes; it intentionally does not expose controlled file values. `Switch` is a checkbox with switch role semantics, so native checked state, keyboard activation, required validation, and `name`/`value` form submission are preserved.

`FieldGroup` adds semantic grouping through a native `fieldset` and `legend`; setting `disabled` applies native fieldset disabling to its descendant controls. `FormLayout` provides a responsive, one- or two-column grid and spacing choices without changing form semantics. Both leave values, submission, and validation with the owning form and controls.

Error copy and invalid borders use `color.text.error` and `color.border.error`. Their contrast is checked against canvas and surface colors in ACME, Luna, and Orchid. The native file-picker action uses the secondary action colors, and the active switch uses primary action background with the surface color as its thumb; both combinations have theme contrast checks. Form control styling uses semantic text, surface, border, focus, spacing, and radius tokens.

Single-line text and select controls use `radius.form-control`; textareas and field groups use the independent `radius.textarea` and `radius.form-group` tokens. Luna keeps text inputs, selects, and buttons pill-shaped, with a 32px radius for both textareas and field groups.

## Enforcement

`pnpm check` is the complete gate. Token sources and output, raw component styling values, type/prop contracts, contrast, interaction, visual snapshots, and the packaged consumer are mechanically checked. Storybook documentation includes manual keyboard-navigation, screen-reader naming, zoom, and focus-clipping checks; automated accessibility checks do not replace them.
