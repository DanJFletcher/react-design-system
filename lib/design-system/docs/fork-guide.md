# Fork guide

## Rename and publish

This is a full component library spanning foundations, forms, layout, site sections, navigation, editorial content, and CMS workflows. Use Storybook's **Foundations → Component catalog** as the component inventory before deciding what a fork should retain.

Change the workspace package name and public package name in `lib/design-system/package.json`, then update workspace filters, app examples, and documentation that use `@workspace/design-system`. Keep the ESM exports, declarations, CSS exports, React peer dependency, CSS `sideEffects` declaration, and published `files` list aligned with the files generated into `dist/`.

## Keep only the themes you use

The built-in themes are ACME, Luna, Orchid, Atom, and Sublime. Remove an unused theme source in `src/tokens/themes/`, remove its CSS export from `package.json`, and remove it from Storybook's toolbar and theme-specific tests. If you keep a custom theme that extends the removed one, resolve or change its `extends` source first. Generation flattens each effective theme into a complete independent map, so the retained generated theme will not require its parent at runtime.

## Remove unused components and variants

When a fork removes a component or variant, update the root exports, component catalog, Storybook stories and docs, tests, component hooks that no longer have a consumer, and generated CSS. Keep token validation, contrast checks for retained themes, type checking, package smoke tests, and accessibility checks.

## Verify a fork

1. Edit token source files, not generated artifacts.
2. Run `pnpm tokens:build` and review the manifest/theme changes.
3. Run `pnpm check`.
4. Inspect visual snapshot changes before updating them.
5. Test the packed package from an isolated consumer before publishing.
