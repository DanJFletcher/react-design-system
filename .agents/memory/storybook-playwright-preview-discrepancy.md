---
name: Storybook preview vs. browser tests
description: Diagnose mismatched rendering between the Replit preview and a standalone Playwright Storybook server.
---

A new Storybook article rendered in the workspace preview and passed its Storybook play test, while a direct iframe route on the separate Playwright-launched Storybook server returned an empty page. The cause was not established.

**Why:** Avoid changing working story or component code to compensate for a test server that did not serve the story.

**How to apply:** Compare the target story in the Replit preview and its Storybook interaction test, then inspect the Playwright server route and logs before treating a blank iframe as a product rendering defect. Keep only reproducible browser tests.
