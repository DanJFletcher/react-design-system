---
name: Storybook play and focus isolation
description: Storybook interaction functions and iframe focus order can affect direct browser tests.
---

When Playwright navigates directly to a Storybook `iframe.html?id=...` route, that story's `play` function also runs. A visual test that then clicks the same controls may inherit mutated counters, queues, or dismissal state.

**Why:** This was observed in Chromium when the story interaction and the browser test both added and dismissed queued notifications.

In browser-backed Storybook tests, `userEvent.keyboard` may also fail to synthesize native Space activation even when the button is focused, while a real Playwright key press works.

**Why:** A focused native toggle stayed unchanged under the Storybook keyboard helper, but the same control responded to Space and Enter in Playwright.

On a direct `iframe.html` route, starting a page-level Tab sequence did not reliably focus the intended scrollable story element. Focusing the target directly and checking its computed `:focus-visible` outline did.

**Why:** Storybook's surrounding document can affect which element receives the first Tab, while the component's focus styling is a separate behavior from tab order.

**How to apply:** Keep interaction-heavy `play` functions off stories used as browser-test fixtures. Use Storybook play tests for ordinary state transitions; test native keyboard order with a deliberate focus starting point, and test focus styling on the target itself. Do not weaken native semantics to accommodate a harness mismatch.
