---
name: Storybook fragment-link tests
description: Avoid placeholder anchor navigation closing Storybook browser tests.
---

In Storybook-backed Vitest browser tests, clicking placeholder fragment links such as `href="#overview"` in a story fixture caused the browser connection to close. Prevent default navigation only in the fixture link handlers; the component should still report active selection so the example and client-side routing behavior remain testable.

**Why:** The SideNavigation playground's test became stable after the fixture links stopped changing the Storybook iframe hash, while selection callbacks continued to work.

**How to apply:** For stories with fake fragment URLs, prevent their native navigation inside the story fixture and test selection through `onActiveChange`. Do not globally suppress navigation for real application links.
