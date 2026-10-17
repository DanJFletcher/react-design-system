---
name: Storybook stable story IDs
description: Preserve deep links when moving stories into a different Storybook sidebar group.
---

When changing a CSF story title to move it into a different sidebar category, set its existing Storybook ID explicitly. This changes the sidebar path without changing deep-link IDs used by documentation and browser tests.

**Why:** Story IDs are referenced directly by the component catalog and Playwright tests, so regenerating them during a sidebar cleanup creates avoidable link and test churn.

**How to apply:** Before changing a story title, check its current ID in the Storybook index. Keep that ID in the story metadata, rebuild Storybook, and verify both the new title path and all existing references.
