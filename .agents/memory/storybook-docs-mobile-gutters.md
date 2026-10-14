---
name: Storybook Docs mobile gutters
description: Responsive spacing around MDX Canvas previews in Storybook.
---

Storybook MDX Canvas previews render in the preview iframe, not the manager UI. Manager styles therefore do not control the Docs page’s canvas spacing. Mobile width can be limited by multiple nested layers: the docs wrapper, the docs story stage, and a transparent inline-story border reserved for focus outlines.

**Why:** Removing only the general canvas padding can leave the Docs Canvas visibly inset, while removing the docs wrapper padding also pushes headings and explanatory text against the screen edge.

**How to apply:** Inspect computed styles inside the Docs iframe. Keep a modest horizontal gutter for documentation text, make the Canvas preview full-bleed, and remove only the inner story’s horizontal spacing on mobile while preserving vertical focus-outline space.
