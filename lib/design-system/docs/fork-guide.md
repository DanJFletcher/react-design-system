# Fork guide

## Rename and publish

Change the workspace package name and public package name in `lib/design-system/package.json`, then update the examples that use `@workspace/design-system`. Keep the ESM exports, declarations, CSS exports, React peer dependency, and CSS `sideEffects` declaration aligned with the files generated into `dist/`.

## Keep only the themes you use

Remove an unused theme source in `src/tokens/themes/`, remove its export from `package.json`, and remove it from Storybook's toolbar and theme-specific tests. If you keep a custom theme that extends the removed one, resolve or change its `extends` source first. Generation flattens each effective theme into a complete independent map, so the retained generated theme will not require its parent at runtime.

## Remove unused components and variants

This milestone has one Button. When a later fork removes a component or variant, also remove its stories, hooks that no longer have a consumer, tests, documentation, exports, and CSS entrypoint. Keep token validation, contrast checks for retained themes, type checking, package smoke tests, and accessibility checks.

## Verify a fork

1. Edit token source files, not generated artifacts.
2. Run `pnpm tokens:build` and review the manifest/theme changes.
3. Run `pnpm check`.
4. Inspect visual snapshot changes before updating them.
5. Test the packed package from an isolated consumer before publishing.
