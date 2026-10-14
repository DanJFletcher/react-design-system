---
name: Storybook theme coverage ordering
description: How to expand existing theme comparison stories without breaking positional visual checks.
---

Append each new built-in theme after the existing entries in comparison arrays. The current order is ACME, Luna, Orchid, Atom, then Sublime.

**Why:** Some visual tests and examples address themes by their position in the rendered list; inserting a theme earlier can make a test inspect the wrong theme without changing its locator.

**How to apply:** When adding a built-in theme, append it in shared comparison stories and update coverage counts. Prefer locating a specific theme by its `data-ds-theme` value rather than list position.
