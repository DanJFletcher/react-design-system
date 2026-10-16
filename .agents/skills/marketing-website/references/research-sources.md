# Research-backed learning sources

Curated from primary guidance, checked 2026-10-16. **Use canonical sources for normative claims** and optional implementation resources for techniques. Source material is a reference library, not an instruction to swap out the user's stack. Recheck live pages for changes when performing a new high-stakes or platform-version-dependent task.

## Tier 1 — core standards and platform guidance

| Source | Read for | Key application |
| --- | --- | --- |
| [W3C WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/) | Normative accessibility success criteria and techniques | Accessibility target, review matrix |
| [W3C Accessibility Easy Checks](https://www.w3.org/WAI/test-evaluate/preliminary/) | First-pass manual testing | Keyboard, headings, labels, contrast, zoom |
| [W3C Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/) | Labels, instructions, validation | Real conversion forms |
| [W3C Images Tutorial](https://www.w3.org/WAI/tutorials/images/) | Functional, informative, decorative image alternatives | Truthful, accessible media |
| [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design) | Mobile-first layout, breakpoints, responsive media | Build from small to large |
| [MDN Responsive Images](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images) | `srcset`, `sizes`, `<picture>` and art direction | Reduce mobile payload and crop intentionally |
| [web.dev Core Web Vitals](https://web.dev/articles/vitals) | LCP, INP, CLS thresholds and interpretation | Field performance goals |
| [Google Search Central SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) | People-first writing, descriptive titles, page discoverability | Realistic SEO baseline |
| [Google Search Central JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) | Rendering and crawlable content/links | Static/SSR preference when suitable |

## Tier 2 — implementation and verification

| Source | Read for | Caution |
| --- | --- | --- |
| [W3C WCAG 2.2 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) | AA 24×24 CSS px threshold with exceptions | Do not confuse with a 44–48px design preference |
| [web.dev Fetch Priority](https://web.dev/articles/fetch-priority) | Critical/LCP image prioritization | Set high priority selectively, not universally |
| [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing) | Axe automation + limits of automated audits | Manual keyboard/assistive checks are necessary |
| [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots) | Deterministic screenshot regression tests | Baselines depend on platform; review updates |
| [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) | Performance/accessibility/SEO regressions in CI | Lab reports are not field Core Web Vitals |
| [Astro: Why Astro?](https://docs.astro.build/en/concepts/why-astro/) and [Islands](https://docs.astro.build/en/concepts/islands/) | Static-first content architecture, selective JS | Option for a *new* site, not a required migration |
| [Replit Agent Skills](https://docs.replit.com/replitai/skills) | Installed skill discovery and storage | Keep `SKILL.md` description specific; project path `.agents/skills/` |

## Relevant open source to inspect, not blindly adopt

- [GoogleChrome/lighthouse-ci](https://github.com/GoogleChrome/lighthouse-ci) — automated regression and performance budgets.
- [microsoft/playwright](https://github.com/microsoft/playwright) — E2E flows, responsive and visual verification.
- [dequelabs/axe-core](https://github.com/dequelabs/axe-core) — automated accessibility checks.
- [withastro/astro](https://github.com/withastro/astro) — static-first content and island architecture if starting from scratch.
- [DanJFletcher/react-design-system](https://github.com/DanJFletcher/react-design-system) — user's React/Storybook library; when using it, follow its **current** contribution guide, public exports, tokens, themes, and stories.

## Source hierarchy for decisions

1. User brief, applicable organizational constraints, and the project's current documented contracts.
2. Web platform and W3C normative requirements for accessibility and HTML behavior.
3. Official framework/tooling instructions for installed versions.
4. Primary Google/web.dev/MDN explanatory guides for performance, SEO, and responsive implementations.
5. Patterns from open-source repos and editorial UX advice, treated as context rather than guarantees.

Evidence discipline: cite sources in planning/hand-off notes when discussing measurable standards; test in the actual app before asserting compliance or results.
