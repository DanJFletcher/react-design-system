# `@workspace/design-system`

A React and TypeScript component library with shared design tokens, five themes, and Storybook documentation.

## Install

The package is currently maintained as a local package in this pnpm workspace. Build it from the repository root before importing it:

```sh
pnpm --filter @workspace/design-system build
```

Then add it to an app in the same workspace. Replace `@workspace/my-app` with the package name from that app's `package.json`:

```sh
pnpm --filter @workspace/my-app add '@workspace/design-system@workspace:*'
```

For a separate project, build and pack the library, then install the resulting tarball:

```sh
cd lib/design-system
pnpm pack
cd /path/to/my-app
pnpm add /absolute/path/to/repository/lib/design-system/workspace-design-system-0.1.0.tgz
```

The library requires React 18 or newer as a peer dependency. This package is not currently documented as a public registry install; publish it to your registry before using a registry-based install command.

## Load the styles

Import the token stylesheet, component styles, and each theme your app uses once in its global entry point. For a Vite app, that is commonly `src/main.tsx`:

```ts
import "@workspace/design-system/tokens.css";
import "@workspace/design-system/styles.css";
import "@workspace/design-system/themes/luna.css";
```

`tokens.css` supplies shared foundations and ACME as the fallback theme. The Luna stylesheet enables Luna as the document default and as a local theme boundary. Add other built-in theme stylesheets only when the app needs those themes: `acme`, `luna`, `orchid`, `atom`, or `sublime`.

In frameworks with a root layout or global stylesheet entry, load the same files there, following that framework's rules for global CSS imports.

## Use components

Components and their TypeScript props are exported from the package root:

```tsx
import { Button, ThemeScope } from "@workspace/design-system";

export function ProfileActions() {
  return (
<ThemeScope theme="luna">
  <Button variant="primary" shape="pill">
        Save profile
      </Button>
    </ThemeScope>
  );
}
```

`ThemeScope` applies a local theme boundary without changing document-wide state. Use `DesignSystemThemeName` for a typed theme name:

```tsx
import { ThemeScope, type DesignSystemThemeName } from "@workspace/design-system";

const theme: DesignSystemThemeName = "luna";

<ThemeScope theme={theme}>{/* themed content */}</ThemeScope>
```

Components use native HTML semantics and expose their documented props for variants, sizes, layouts, and behavior. Prefer those props first; use CSS custom properties for app-specific styling rather than relying on internal class names.

## Customize tokens and component hooks

Use semantic CSS variables for app-specific colors and surfaces:

```css
.profilePanel {
  background: var(--ds-color-surface-primary);
  color: var(--ds-color-text-primary);
  border-radius: var(--ds-radius-surface);
}
```

For a documented component hook, pass its value to a local `ThemeScope`:

```tsx
<ThemeScope theme="luna" style={{ "--ds-button-radius": "12px" }}>
  <Button>Continue</Button>
</ThemeScope>
```

Registered hook names are available through the exported `DesignSystemStyle` type. See [`docs/theming.md`](docs/theming.md) for theme loading, nested themes, and override behavior.

## Use shared responsive breakpoints

Vite app developers can expand the library's named media aliases in their own CSS with the package plugin:

```ts
import { defineConfig } from "vite";
import { breakpointMediaVitePlugin } from "@workspace/design-system/breakpoint-media";

export default defineConfig({
  plugins: [breakpointMediaVitePlugin()],
});
```

Then use aliases such as `@media (--ds-viewport-compact)` or `@media (--ds-viewport-medium-up)`. For other PostCSS builds, use `breakpointMediaPlugin()` from the same package entry. See the [design-system specification](docs/design-system.md#responsive-breakpoints) for the full scale and details.

## Develop the library

Run Storybook and the package checks from the repository root:

```sh
pnpm --filter @workspace/design-system run storybook
pnpm --filter @workspace/design-system run check
```

Storybook contains component documentation, interactive controls, themes, and examples. For component authoring conventions, see [`docs/component-development.md`](docs/component-development.md).
For a categorized list of all components with links to their documentation, open **Foundations → Component catalog** in Storybook.

For repository setup, development standards, and the contribution checklist, see [`CONTRIBUTING.md`](CONTRIBUTING.md).
