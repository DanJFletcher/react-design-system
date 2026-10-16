---
name: Unit-only component coverage
description: The design-system component coverage acceptance rule and how to interpret separate test reports.
---

The design-system goal is 100% coverage of component implementation code from unit tests alone. Storybook and browser-test coverage must be measured separately and must not contribute to the unit target.

**Why:** the user clarified that the component code itself should be tested by unit tests, rather than reaching a combined percentage by relying on other test types.

**How to apply:** Before reporting the goal as achieved, run unit-only coverage and verify the component implementation files meet the target. Keep separate reports for unit tests, Storybook/browser tests, and combined coverage; only the unit-only report certifies the goal.
