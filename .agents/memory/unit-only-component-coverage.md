---
name: Unit-only component coverage
description: The design-system component coverage acceptance rule and how to interpret separate test reports.
---

The design-system goal is 100% coverage of component implementation code from unit tests alone. Storybook and browser-test coverage must be measured separately and must not contribute to the unit target.

**Why:** the user clarified that the component code itself should be tested by unit tests, rather than reaching a combined percentage by relying on other test types.

**How to apply:** Before reporting the goal as achieved, run unit-only coverage and verify the component implementation files meet the target. Keep separate reports for unit tests, Storybook/browser tests, and combined coverage; only the unit-only report certifies the goal.

When a deterministic branch is difficult or impossible to reach through the rendered UI, isolate that behavior in a small internal helper and test both outcomes directly. Keep component-level tests for the visible flow and helper tests for the edge logic.

**Why:** DOM simulations do not always expose every internal state reliably; focused helper tests can verify valid edge cases without brittle UI setup or borrowing Storybook/browser coverage.

**How to apply:** First attempt a realistic unit-level component test. If the path is genuinely internal or inaccessible, extract only the relevant comparison or cleanup logic, keep the behavior unchanged, and test it directly alongside the component integration test.
