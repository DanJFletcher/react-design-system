# Design-system contribution rules

Before changing `lib/design-system/`, read `docs/design-system.md` and the relevant component documentation.

- Define a component's responsibility, semantics, and public API before implementation.
- Prefer native HTML semantics.
- Use public semantic tokens or registered component hooks for visual styling.
- Choose radii by purpose: new content surfaces use `radius.surface`, never `radius.control`, `radius.form-control`, `radius.full`, or a fixed rounded-shape foundation as their default. Luna surfaces default to 24px; pill controls and intentional circles are separate roles.
- Radius exceptions require an exact selector, role, and reason in `scripts/radius-policy.json`. Keep that list narrow: action/form controls, intentional circles, explicit shape props, and inherited corners only. Consumer hooks keep precedence; never cap them to the default radius.
- Document relevant interaction, focus, disabled, and loading behavior.
- Cover ACME, Luna, custom themes, scoped customization, and nested boundaries.
- Update docs and changelogs for public changes; record architectural changes in `docs/decisions.md`.
- Edit token sources, never `src/generated/` by hand.
- Run relevant checks and report their results.
- The initial scope established the token foundation and Button. The approved core form-control scope adds TextField, Textarea, native Select, Checkbox, and RadioGroup. The Menu, Hero, Card, PricingDetails, Carousel, Tabs, Badge, Tooltip, Callout, Progress, ContactSection, ArticleCard, ArticleBody, ArticleFootnotes, ArticleTableOfContents, Pagination, Breadcrumbs, Testimonials, and FAQSection components are separately approved; other component families, polymorphic rendering, and a general plugin system remain deferred unless separately approved.

New semantic tokens need a documented purpose, a clear distinction from existing roles, complete theme coverage, and applicable contrast checks.
