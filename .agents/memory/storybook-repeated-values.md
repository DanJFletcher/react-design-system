---
name: Repeated accessible values in Storybook tests
description: Avoid singular queries when repeated demo items intentionally share an accessible name.
---

Storybook examples commonly repeat accessible labels, such as the same star-rating text across several testimonial cards. Use plural role queries and assert the expected count, or scope the query to a specific item.

**Why:** a valid repeated-item example makes a singular `getByRole` query fail even when the rendered component is correct.

**How to apply:** When testing collections whose items can share a semantic label, use `getAllByRole` or scope queries to an individual card instead of assuming the label is unique.
