---
name: Pagination browser tests
description: Reliable browser assertions for accessible current-page indicators and numbered controls.
---

The current pagination item is intentionally not a button or link; it is a text item marked with `aria-current="page"`. Numbered control names such as “Page 1” can also prefix-match “Page 10” in Playwright's default accessible-name matching.

**Why:** the current page is state, not a navigation action, and non-exact test locators can match several later pages.

**How to apply:** assert the current item separately by its visible number and `aria-current`, and use exact accessible-name matching when locating numbered page buttons or links.
