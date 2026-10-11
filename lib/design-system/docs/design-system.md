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

ACME is the default unthemed document. Luna uses blush/lavender surfaces, deep plum actions, moonlit gold accents, and softer shapes. Both built-in themes share the same type and spatial scales. Orchid demonstrates a third theme extending Luna.

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
  loading?: boolean;
  style?: DesignSystemStyle;
};
```

Defaults are `variant="primary"`, `size="md"`, and `type="button"`. Native refs, `className`, form properties, accessible naming attributes, and remaining button props are forwarded. The component owns `aria-busy` and `aria-disabled`.

Small, medium, and large targets have minimum block sizes of 44, 48, and 56px. Padding is tokenized and controls grow with the user's typography settings; the component has no fixed height. Long labels wrap.

Native disabled uses the native `disabled` attribute. Loading preserves focus with `aria-disabled` and `aria-busy`, suppresses the forwarded click callback and the click's default submit/reset activation, and retains the accessible name. The label stays in layout with zero opacity while an `aria-hidden` spinner is centered over it. Hover and pressed states do not apply while disabled or loading. Reduced-motion and forced-colors preferences receive explicit treatment. Keyboard focus uses a visible tokenized outline.

The owning form manages longer asynchronous submission state. Children may contain decorative icons, which should be hidden from assistive technology. `href`, `asChild`, toggle semantics, groups, and an icon-only convenience API are out of scope.

## Enforcement

`pnpm check` is the complete gate. Token sources and output, raw component styling values, type/prop contracts, contrast, interaction, visual snapshots, and the packaged consumer are mechanically checked. Storybook documentation includes manual keyboard-navigation, screen-reader naming, zoom, and focus-clipping checks; automated accessibility checks do not replace them.
