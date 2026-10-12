---
name: Native dialog Storybook tests
description: Native modal behavior differs from Storybook's simulated interactions.
---

Storybook's simulated `userEvent.keyboard("{Escape}")` did not invoke the browser-native `<dialog>` cancel event in the component test runner. A dialog mounted open also has no invoking control for the browser to restore focus to, so focus returns to the document body rather than a trigger.

**Why:** These behaviors were observed while testing a native modal dialog in Chromium and Storybook.

**How to apply:** Verify Escape dismissal with real browser keyboard input in Playwright. When checking return focus, open the dialog by activating its trigger; use Storybook interactions for buttons and other simulated actions.
