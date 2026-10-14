---
name: Storybook theme CSS ordering
description: Keep custom theme overrides from being reset by another generated theme stylesheet in Storybook.
---

In Storybook's multi-theme preview, import all generated theme CSS before any custom per-theme override CSS.

**Why:** Generated theme files reset component-specific hook variables at theme boundaries. Loading another generated theme after a custom override can reset that override even on a different theme, such as Atom's table border.

**How to apply:** Keep generated theme imports together first in the Storybook preview, then import custom theme stylesheets. Keep each public `themes/<name>` entrypoint bundling its own custom styles for single-theme consumers.
