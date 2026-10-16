# Performance, crawlability, SEO, and respectful analytics

Use during architecture selection, media handling, metadata work, deployment, or performance optimization. Verify current deployment capabilities and Google documentation before promising results.

## Architecture decision

| Scenario | Preferred approach |
| --- | --- |
| Existing working marketing site | Keep framework; improve rendered HTML, assets, CSS, JS delivery |
| New mostly static content site | Consider static generation / SSR with small interactive islands, e.g. Astro |
| Existing React application or rich widget integration | Use React and current router/build; prerender or SSR indexable routes if feasible |
| Heavily edited content | Choose CMS/content pipeline based on real editor workflow and maintenance needs |
| Forms | Real server/endpoint, backend validation, spam defense, secrets server-side |

Do not force an Astro migration or add a CMS without explicit need. Ensure important public copy, links, and headings exist in the first HTML response when reasonable. Google can execute JS, but rendering/indexing may be delayed and non-Google bots vary.

## Core Web Vitals objectives

Google's **field** good thresholds measured at the 75th percentile, separately on mobile/desktop:

| Metric | Good threshold | Main engineering levers |
| --- | --- | --- |
| LCP (Largest Contentful Paint) | ≤2.5 seconds | Fast initial HTML, critical CSS, hero image discovery, optimized server/assets |
| INP (Interaction to Next Paint) | ≤200 ms | Less JS, reduce main-thread work, lean interactions, defer noncritical code |
| CLS (Cumulative Layout Shift) | ≤0.1 | Explicit image dimensions/aspect ratios, reserved embeds, font handling |

These are performance **outcome goals**, not a guaranteed result, and not equivalent to a single Lighthouse score. Use lab tests while developing and real-user measurements after launch when available.

Practical initial budgets are **project choices, not standards**: consider mobile-first caps on third-party JS, compressed above-the-fold imagery, font families/weights, and page transfer size; adjust with evidence. Record actual asset and JS totals instead of claiming arbitrary pass/fail.

## Media and loading

- Prefer AVIF/WebP when supported by the pipeline, sensible JPG/PNG fallbacks, responsive `srcset`/`sizes`, and art direction via `<picture>` when crops need to differ.
- Give images explicit `width` and `height` or a stable aspect-ratio container; use `object-fit` only when crop is intentional.
- Do **not** use `loading="lazy"` for above-the-fold/LCP hero imagery. Consider `fetchpriority="high"` on the measured LCP image when appropriate, not every image.
- Lazy-load offscreen media. Do not hide critical content behind heavy video, canvas, or animation.
- Compress/self-host fonts when licensing allows, limit weights, provide fallback stacks, use sensible loading behavior, and inspect layout shift.
- Audit third-party embeds, social pixels, chat widgets, and tracking scripts for cost and privacy impact.

## Per-page SEO checklist

- Unique, human-readable route and page title describing the real offering; descriptive meta description (not a ranking mechanism or length fetish).
- One coherent H1 and content heading outline. Include relevant user terminology naturally, without repeated keyword stuffing.
- Navigation and cross-page links are real `<a href>` links; internal links work and anchor destinations exist.
- Canonical URL points to the actual public URL **only when known**. Verify staging/noindex versus production policy and avoid accidentally blocking the live site.
- Meaningful social share metadata (Open Graph and optional Twitter/X fields) with assets you own. No invented public-domain URLs.
- Generate sitemap.xml and robots.txt suitable to route inventory and publish environment. Do not put a secret in robots.txt.
- Structured data/JSON-LD only for valid, user-visible, verifiable information and applicable schema types (e.g. Organization or LocalBusiness *if true and useful*). Validate rather than assuming rich results.
- Correct statuses for missing routes and redirects; test mobile navigation and deep-link refreshing.
- Content quality and credibility matter more than metadata hacks. No promise of rankings, snippets, Google Business visibility, or conversion improvement without measurement.

## Conversion analytics and privacy

Specify an observable event and its source before instrumenting: CTA click, successful form submission, booking completion, etc. Track successful **outcomes**, not simulated UI events. Avoid transmitting field values, email addresses, or other unnecessary personal data through analytics. Require project-owner decisions on vendors, cookie/consent requirements, jurisdiction, retention, and notices; legal compliance cannot be inferred from a simple banner.

## Verification steps

1. Inspect built HTML (`view-source` or server response) for indexable content, links, metadata, and status codes.
2. Run Lighthouse on at least a representative homepage and key conversion page using representative mobile settings; record versions and conditions.
3. Check images/assets in network waterfall and failed requests, font loading, layout shifts, and JS chunks.
4. Use Lighthouse CI or equivalent regression assertions when tooling is approved and the site is stable.
5. After launch (when access exists), consider PageSpeed Insights / CrUX and Search Console; distinguish field data from simulated lab results.

## Primary sources

- Core Web Vitals: https://web.dev/articles/vitals
- Optimizing LCP discovery: https://web.dev/articles/fetch-priority
- Responsive images: https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images
- SEO starter: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- SEO for developers: https://developers.google.com/search/docs/fundamentals/get-started-developers
- JavaScript SEO: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Astro architecture: https://docs.astro.build/en/concepts/why-astro/
- Lighthouse CI: https://github.com/GoogleChrome/lighthouse-ci
