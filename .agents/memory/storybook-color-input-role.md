---
name: Browser color-input locators
description: Accessibility-query behavior for native color pickers in browser tests.
---

In Playwright with Chromium, `input[type="color"]` may appear as a textbox and inherit the same accessible name as its paired hex input when both reference the visible field label. Role-and-name queries can therefore match both controls.

**Why:** Browser-level accessibility snapshots showed the picker and editable hex value as separate textboxes with the same name, even though the unit-test DOM query APIs treated them differently.

**How to apply:** When a form has both controls, select the specific input by its type or inspect its shared control group instead of relying only on role and accessible name.
