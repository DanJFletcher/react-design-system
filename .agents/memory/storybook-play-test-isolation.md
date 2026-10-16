---
name: Storybook play-function isolation
description: Storybook interaction functions can affect tests that open the same story directly in a browser.
---

When Playwright navigates directly to a Storybook `iframe.html?id=...` route, that story's `play` function also runs. A visual test that then clicks the same controls may inherit mutated counters, queues, or dismissal state.

**Why:** This was observed in Chromium when the story interaction and the browser test both added and dismissed queued notifications.

In browser-backed Storybook tests, `userEvent.keyboard` may also fail to synthesize native Space activation even when the button is focused, while a real Playwright key press works.

**Why:** A focused native toggle stayed unchanged under the Storybook keyboard helper, but the same control responded to Space and Enter in Playwright.

**How to apply:** Keep interaction-heavy `play` functions off stories used as browser-test fixtures. Use Storybook play tests for ordinary state transitions and a separate play-free story for real-browser keyboard activation; do not weaken native button semantics to accommodate a test-helper mismatch.
