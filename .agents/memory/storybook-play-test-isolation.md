---
name: Storybook play-function isolation
description: Storybook interaction functions can affect tests that open the same story directly in a browser.
---

When Playwright navigates directly to a Storybook `iframe.html?id=...` route, that story's `play` function also runs. A visual test that then clicks the same controls may inherit mutated counters, queues, or dismissal state.

**Why:** This was observed in Chromium when the story interaction and the browser test both added and dismissed queued notifications.

**How to apply:** Keep interaction-heavy `play` functions off stories used as visual-test fixtures, or account for their completion and cleanup before exercising the story from Playwright.
