# Design-system specification

## Scope and architecture

This is one forkable React/TypeScript package. React owns rendering and interaction; CSS Modules own component styling; CSS custom properties are the public styling API. Storybook is the living documentation and development environment. Token compilation is TypeScript-only and has no React dependency.

The package exposes ESM, TypeScript declarations, `tokens.css`, `styles.css`, and separate ACME, Luna, and example Orchid theme stylesheets. React stays external to the bundle. CSS files are preserved by the package `sideEffects` declaration.

## Token contract

Token sources use a deliberately small schema in `src/tokens/schema.json`; this project does not claim conformance to an external design-token standard.

1. **Foundations** (`foundations.json`) define shared scales and internal palette references. The palette is used at compile time and is not emitted as a public CSS API.
2. **Semantic tokens** (`contract.json`) name public roles by purpose and are fully specified by every effective theme.
3. **Component hooks** (`component-hooks.json`) are optional documented component overrides. They are unset by the component, have local CSS fallbacks, and reset at theme boundaries.

Every token has a stable dotted name, a supported type, a value, and a description. Dimensions are constrained by category: font sizes are `rem`; spacing, layout, control, focus, radius, and border values are `px`; line heights are unitless; font weights are numeric; motion durations are `ms`. Structural CSS values such as `0`, `auto`, `currentColor`, and `transparent` are permitted where appropriate.

The compiler validates names, descriptions, types, units, references, cycles, reference type compatibility, theme completeness, and generated CSS-variable collisions. It resolves references to concrete values, generates deterministic CSS, TypeScript names and a manifest, and exits with an error if checked-in output is stale. Add or edit source files only; never hand-edit `src/generated/`.

## Theme contract

ACME is the default unthemed document. Luna is a dark, Sailor Moon-inspired palette with midnight-indigo surfaces, moonlight and lavender text, rose-pink actions, crescent-gold accents, and softer shapes. Both built-in themes share the same type and spatial scales. Orchid demonstrates a distinct custom theme extending Luna.

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

The owning form manages longer asynchronous submission state. Children may contain decorative icons, which should be hidden from assistive technology. `href`, `asChild`, toggle semantics, groups, and an icon-only convenience API are out of scope.

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
  controlsPosition="below"
/>
```

`Carousel` supports controlled or uncontrolled slide selection, optional looping and autoplay, previous/next buttons, dot or fraction indicators, overlay/below control placement, custom slide content, and an empty state. Keyboard users can focus the carousel and use Left/Right Arrow, Home, and End; touch users can swipe horizontally. Inactive slides are hidden and inert.

Autoplay is opt-in through `autoPlay` and advances at `autoPlayInterval` (default 5 seconds). Its pause/start control is always available when enabled. Rotation pauses on hover, stops on keyboard focus or manual navigation, and stops on the last slide unless looping is enabled. Reduced-motion preferences disable autoplay and slide transitions.

Provide an accessible `label` and unique slide `id` values. Use `getSlideLabel` and `getIndicatorLabel` for localized accessible names. The `carousel.*` hooks customize theme colors, controls, indicators, spacing, and corners.

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

The menu uses semantic surface, text, border, focus, spacing, action, and `radius.menu` tokens. The dropdown panel radius is 6px in ACME, 24px in Luna, and 16px in Orchid. The `menu.*` component hooks customize its panel, item interaction colors, radius, disabled text, and focus outline; they reset at nested theme boundaries like other hooks.

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

Single-line text and select controls use `radius.form-control`; textareas and field groups use the independent `radius.textarea` and `radius.form-group` tokens. Luna keeps text inputs, selects, and buttons pill-shaped, with a 24px radius for both textareas and field groups.

## Enforcement

`pnpm check` is the complete gate. Token sources and output, raw component styling values, type/prop contracts, contrast, interaction, visual snapshots, and the packaged consumer are mechanically checked. Storybook documentation includes manual keyboard-navigation, screen-reader naming, zoom, and focus-clipping checks; automated accessibility checks do not replace them.
