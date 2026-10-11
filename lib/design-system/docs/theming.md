# Theming and scoped customization

Load the package's public assets in this order:

```ts
import "@workspace/design-system/tokens.css";
import "@workspace/design-system/styles.css";
import "@workspace/design-system/themes/luna.css";
```

The token sheet supplies the shared foundation scale and ACME as the fallback default. Importing the Luna stylesheet gives an otherwise unthemed document Luna's values and enables nested ACME and Luna boundaries. Import only the built-in theme stylesheets a consumer intends to keep.

```tsx
<section data-ds-theme="acme">
  <Button>ACME</Button>
  <section data-ds-theme="luna">
    <Button>Nested Luna</Button>
  </section>
</section>
```

Semantic variables are concrete and directly overridable:

```css
.campaign {
  --ds-color-action-primary-bg: #343A40;
  --ds-color-action-primary-hover: #252A2F;
}
```

Each state has its own variable. A custom resting value does not implicitly update hover, pressed, foreground, border, or focus values. Run the same contrast checks for each custom theme.

For a component-only override, use a registered hook:

```tsx
<ThemeScope
  theme="luna"
  style={{ "--ds-button-radius": "12px" }}
>
  <Button>Continue</Button>
</ThemeScope>
```

`DesignSystemStyle` is generated from documented hooks. Hooks are unset on the component and selected through local fallbacks. Every `[data-ds-theme]` boundary resets the full registered hook set, preventing outer overrides from crossing nested theme boundaries. Put the desired override on the inner boundary.

To add a custom theme, add a JSON source under `src/tokens/themes/`, optionally extend ACME or Luna, provide overrides for all semantic roles not inherited, and run `pnpm tokens:build`. The compiler emits a complete map; your fork can remove the inherited theme afterwards without breaking the generated result.

CSS custom properties inherit through DOM ancestry. Portalled components added in a later phase must define how their portal container receives active theme values and scoped overrides before implementation begins.
