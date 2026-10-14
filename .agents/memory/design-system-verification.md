---
name: Design-system verification
description: The combined design-system check can exceed the shell command time limit when browser tests follow builds.
---

The combined design-system check and the full Playwright visual suite can exceed the five-minute shell timeout. The visual suite may also become slower and less reliable when run with substantially more workers.

**Why:** Large Storybook-backed browser suites spend several seconds starting and rendering each story; adding workers increased resource contention without making the full suite finish reliably.

**How to apply:** Run type, token, package, and Storybook checks separately from browser checks. For visual verification, run the changed component specs and impacted neighboring specs; split broader coverage into smaller file batches rather than relying on one full-suite invocation or simply raising worker count.
