---
name: Storybook live-region queries
description: Avoid ambiguous role queries when demos combine component status messages and live outputs.
---

In Storybook tests, an `<output aria-live="polite">` is exposed with the implicit `status` role. When a component also renders `role="status"`, a generic `getByRole("status")` may match multiple elements; prefer an exact message query or scope the query to the relevant component/listbox.

**Why:** component interaction stories often use live outputs to display controlled values, so generic status queries can fail even when the component's own announcement is correct.

**How to apply:** before using a status role query in a story, check whether the story includes an `<output>` or another polite live region and scope or disambiguate the assertion.
