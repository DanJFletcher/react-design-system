---
name: Storybook viewport behavior in Vitest
description: A Storybook viewport global may not change the browser width used by mobile breakpoint tests in the Vitest browser runner.
---

For Storybook 10 browser-story tests that depend on `matchMedia` or responsive CSS, a story-level `viewport.defaultViewport` preset may still be needed to set the test iframe's actual viewport width. The newer `globals.viewport` setting alone can leave the Vitest iframe at its desktop width, even though it works in the Storybook manager.

**Why:** The current Vitest browser runner did not apply the viewport global to the story iframe; mobile `matchMedia` state stayed false until the story-level preset was restored.

**How to apply:** When testing a responsive story, verify `window.matchMedia` or computed breakpoint styles in the browser test. Prefer the current viewport global for Storybook's normal UI, and retain or replace the story-level preset only until the test runner sets its viewport directly. Expect Storybook 10 to log a deprecation warning for the legacy preset.
