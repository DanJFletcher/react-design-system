---
name: Unique Storybook landmarks
description: Accessibility rule for stories that stack several theme examples in one document.
---

When a Storybook story shows multiple theme variants at once, repeated named semantic regions such as `<section aria-labelledby="Footnotes">` can violate axe's `landmark-unique` rule, even when each is nested under a different theme wrapper.

**Why:** the theme wrappers do not create separate documents or landmark scopes, so each region name must still be unique on the page.

**How to apply:** give each stacked region a distinct visible heading/name (for example, include the theme name), or use a neutral non-landmark wrapper when a region role is not needed; rerun the story's accessibility check.
