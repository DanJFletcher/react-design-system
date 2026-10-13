---
name: Design-system verification
description: The combined design-system check can exceed the shell command time limit when browser tests follow builds.
---

The design-system's combined check may exceed the five-minute shell timeout because the Storybook browser suite takes several minutes after token, type, and build checks. A timeout during that stage is not by itself evidence of a failing test.

**Why:** The full browser suite passes when run separately, while the combined check uses the same limited command window for both builds and browser tests.

**How to apply:** If the combined check times out during visual tests, run the full visual suite separately and verify any remaining package checks before treating it as a code failure.
