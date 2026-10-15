---
name: Storybook site-example accessibility
description: Accessibility checks for full-page website examples rendered as Storybook stories.
---

When adding a full-site Storybook example, run its browser story and axe checks against the complete page. These checks can surface low-contrast brand accents and accessible-name mismatches well below the initial viewport.

**Why:** Site examples often use their own hardcoded brand palette instead of the design-system tokens, so text colors and form placeholders can miss contrast requirements even when the first viewport looks fine.

**How to apply:** Validate both the default and reduced-motion story states, choose text colors that meet WCAG contrast on each surface, and let visible brand text supply a link name unless an `aria-label` preserves that visible wording.
