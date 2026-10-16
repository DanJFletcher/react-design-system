# Implementation playbook and visual QA

## First reconnaissance commands

Use the actual workspace and its existing commands; these are **illustrative**, not mandatory:

```sh
pwd
find . -maxdepth 3 \( -name package.json -o -name replit.md -o -name AGENTS.md \) -print
cat package.json
```

Inspect current routes and deployment setup before choosing page technology. Do not replace a project scaffold or install dependencies without a concrete reason.

## Implementation sequence

1. Record brief, route plan, content/proof inventory, CTA destination.
2. Inventory existing site layout components/tokens and review candidate Storybook stories if available.
3. Establish layout primitives (`container`, `stack`, `cluster`, responsive grid), typographic hierarchy and spacing scale using the site's existing styling approach.
4. Build a real header/nav, semantic main content, and useful footer with mobile DOM order.
5. Implement hero and first conversion path first; inspect at ~360px and ~1440px before continuing.
6. Add only sections that meaningfully support the offer; make copy and visuals responsive and truthful.
7. Wire links and forms; add loading, validation, error and success states.
8. Optimize real media and serve appropriate formats/sizes.
9. Add metadata, site map/robots rules, analytics only as authorized.
10. Inspect full page visually at target widths, run accessibility/behavior/performance checks, fix highest-impact issues, report results.

## CSS examples (adapt to tokens, not paste blindly)

For a standalone site without an existing token system:

```css
:root {
  --page-max: 72rem;
  --page-gutter: clamp(1rem, 4vw, 2.5rem);
  --space-section: clamp(3.5rem, 8vw, 7rem);
  --text-heading: clamp(2.25rem, 5vw, 4.75rem);
}

.pageContainer {
  width: min(100% - 2 * var(--page-gutter), var(--page-max));
  margin-inline: auto;
}

.hero {
  display: grid;
  align-items: center;
  gap: clamp(1.5rem, 4vw, 4rem);
  padding-block: var(--space-section);
}

.hero h1 {
  font-size: var(--text-heading);
  line-height: 1.08;
  overflow-wrap: break-word;
  text-wrap: balance;
}

.hero img { display: block; max-width: 100%; height: auto; }

@media (min-width: 52rem) {
  .hero { grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); }
}
```

This is a **demonstration only**: where `@workspace/design-system` exists, prefer its public semantic tokens, styles, responsive aliases, and components instead of adding redundant variables. Confirm support/behavior when using modern CSS features; provide sensible fallback where the actual browser matrix requires it.

For a responsive image, specify actual image files and truthful alternative text:

```html
<img
  src="/images/workshop-960.webp"
  srcset="/images/workshop-480.webp 480w, /images/workshop-960.webp 960w, /images/workshop-1440.webp 1440w"
  sizes="(min-width: 52rem) 45vw, 100vw"
  width="1440"
  height="960"
  alt="Technician inspecting a bicycle wheel in the workshop"
/>
```

Only use this pattern after creating or confirming every referenced file. If the hero is the LCP image, do not lazy-load it.

## Existing `react-design-system` package integration

When the site is in the same workspace:

- Consult `lib/design-system/README.md`, `CONTRIBUTING.md`, `AGENTS.md`, `docs/design-system.md`, and Storybook first.
- Build and import the workspace package through its public exports as documented. Load `@workspace/design-system/tokens.css`, `styles.css`, and required `themes/*.css` once at app entry.
- Review public `Header`, `Hero`, `Button`, `Card`, `Text`, `Heading`, `Footer`, form components, and section compositions before implementing lookalikes. Verify *current* catalog rather than assuming all exports exist in every revision.
- Use the documented `breakpointMediaVitePlugin` in Vite projects if adopting named `@media (--ds-viewport-...)` aliases; otherwise follow documented native CSS or toolchain options.
- Distinguish site-specific composition from reusable shared components; never edit library-generated token files. If a reusable library component genuinely needs changing, follow its contribution rules.

## Browser and QA procedure

At each target width, capture the hero and a **full-page screenshot**, check nav/menu/CTA/contact, and critique the visual result. Look for: poor headline wrapping, uneven rhythm, excessively large hero dead space, stretched imagery, too many same-looking cards, weak contrast, illegible overlay text, missing real content, clipped badges, and crowded footer/navigation.

Manually inspect:

- 320, ~375, 768, 1024, 1440 CSS px and at least one in-between width.
- Keyboard-only flow from skip link through header and main CTA to footer.
- Zoom 200% and reflow around 320 CSS px, narrow landscape, reduced motion.
- Both successful and failing form submission paths using a real development/test endpoint. Do not submit genuine user data to an unknown external endpoint.
- No JavaScript or delayed JavaScript where feasible: essential information and core navigation should still exist.

## Automated test sketch

Use Playwright when installed/approved and adapt locators to real copy:

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage has a useful CTA and no major automated a11y findings', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('link', { name: /request a quote/i })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('narrow layouts do not overflow the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/');
  const hasOverflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(hasOverflow).toBe(false);
});
```

These are example tests. The CTA name, route, tools, and actual expected behavior must match the project. Add keyboard/mobile navigation and form outcome tests; screenshot assertions should be reviewed rather than blindly overwritten. Automated axe checks **cannot** replace manual accessibility assessment.

## Release gate

Mark as **blocking**: nonfunctional primary CTA, unlabeled control, keyboard trap, critical text clipping/overflow, contrast failures on important content, broken route, fabricated claim, exposed secret, or false success message. Mark as **follow-up with owner**: missing real photo, unverified testimonial, not-yet-supplied email integration, unknown canonical domain, unapproved analytics/policy details. Don't call a not-yet-wired form "complete".

Always state which checks could not run and why (browser unavailable, missing credentials, no deployment domain, etc.).
