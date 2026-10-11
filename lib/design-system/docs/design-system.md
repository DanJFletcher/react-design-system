# Design-system specification

## Scope and architecture

This is one forkable React/TypeScript package. React owns rendering and interaction; CSS Modules own component styling; CSS custom properties are the public styling API. Storybook is the living documentation and development environment. Token compilation is TypeScript-only and has no React dependency.

The package exposes ESM, TypeScript declarations, `tokens.css`, `styles.css`, and separate ACME, Luna, and example Orchid theme stylesheets. React stays external to the bundle. CSS files are preserved by the package `sideEffects` declaration.

## Token contract

Token sources use a deliberately small schema in `src/tokens/schema.json`; this project does not claim conformance to an external design-token standard.

1. **Foundations** (`foundations.json`) define shared scales and internal palette references. The palette is used at compile time and is not emitted as a public CSS API.
2. **Semantic tokens** (`contract.json`) name public roles by purpose and are fully specified by every effective theme.
3. **Component hooks** (`component-hooks.json`) are optional documented Button overrides. They are unset by the component, have local CSS fallbacks, and reset at theme boundaries.

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
