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

The native `Dialog` uses `showModal()` and is painted in the browser's top layer, but it remains in its original DOM position. Semantic theme tokens and scoped component hooks continue to inherit from its ancestors; Dialog does not create a portal or require a theme bridge.

`ToastProvider` keeps its viewport in the DOM subtree where it is mounted, so notifications inherit a surrounding `ThemeScope` and any local `toast.*` hook overrides. Mount the provider inside the intended theme boundary.

`Tooltip` uses the browser's popover top layer to escape transformed and overflow-clipped ancestors. It remains in its original DOM subtree, so it continues to inherit the active theme and local `tooltip.*` hook overrides. Mount it inside the intended theme boundary.

`Text` and `Heading` use the active theme's shared font scale and semantic primary/muted text colors. Their markup stays identical across themes; visual heading `size` can vary independently from semantic `level`.

To add a custom theme, add a JSON source under `src/tokens/themes/`, optionally extend ACME or Luna, provide overrides for all semantic roles not inherited, and run `pnpm tokens:build`. The compiler emits a complete map; your fork can remove the inherited theme afterwards without breaking the generated result.

CSS custom properties inherit through DOM ancestry. Components rendered in a separate portal must define how their portal container receives active theme values and scoped overrides before implementation begins; top-layer popovers that remain in the DOM subtree continue to inherit them.
