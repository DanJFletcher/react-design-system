---
name: Storybook fragment-link tests
description: Avoid placeholder anchor navigation closing Storybook browser tests.
---

In Storybook-backed Vitest browser tests, activating fragment links in a story fixture can close the browser connection, including links that correctly target another element in the same story. Avoid activating native fragment links in the Storybook play test; verify accessible names and Tab order there, and cover actual fragment navigation in a separate Playwright browser test.

**Why:** Changing the Storybook iframe hash can disrupt its browser test connection. Splitting focus-order checks from native fragment navigation keeps both checks reliable.

**How to apply:** Keep stories used by direct `iframe.html` browser tests free of interaction-heavy `play` functions that change focus or location. Use Storybook play tests for accessible names and keyboard order, and use Playwright to test the real fragment destination and return link. Do not globally suppress native navigation in the component.
