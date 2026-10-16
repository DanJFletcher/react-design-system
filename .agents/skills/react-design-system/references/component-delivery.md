# Component delivery playbook

Use this checklist for **one component or closely related component family per task**. Adapt to simple static atoms: do not invent loading state, controlled state, or interaction semantics when irrelevant.

## A. Design brief (write before code)

1. **Need and alternatives:** what problem? Can an existing component/slot solve it?
2. **Approved scope:** where is permission recorded? Which capabilities are explicitly excluded?
3. **HTML semantics:** exact root element, labels, landmarks, headings, and roles; ARIA only when needed.
4. **Public API:** props, defaults, variants, sizes, composition slots, ref type, native prop forwarding, controlled/uncontrolled contract, callbacks and event cancellation.
5. **Behavior:** pointer, keyboard, focus entry/restore, Escape/outside click, disabled/loading, error and empty states.
6. **Visual contract:** semantic roles, reusable foundations, component hooks (if a customization surface is justified), contrast pairs, responsive/reduced-motion/forced-colors.
7. **Theme contract:** ACME/Luna/Orchid, custom semantic overrides, local hooks, nested boundaries; portal implications.
8. **Stories:** a finite matrix of variant/state/theme examples plus behavior `play` tests and usage-oriented MDX.
9. **Verification:** token tests, lint, typecheck, Storybook tests, visuals, build, isolated package consumer test.
10. **Compatibility/exclusions:** source migration needed? Is a new dependency or exported surface required?

Use names and prop patterns already in neighboring components; do not proliferate multiple overlapping concepts such as `tone`, `intent`, `variant`, `appearance` without a documented distinction.

## B. Implementation order

1. Draft types and accessibility invariants; confirm `AGENTS.md` and spec permit the work.
2. Identify existing tokens and hooks. Only then propose additions to `src/tokens/`.
3. Implement `.tsx` and `.module.css`; base styles on current semantic/foundation token fallbacks, keeping internal variables private.
4. Build tokens if changed; inspect generated diffs, **never edit generated outputs manually**.
5. Add typed exports, ensure the package's CSS is included in build/distribution, and add test coverage.
6. Add Storybook stories for each relevant state, separate interaction behavior from visual assertion; author `.docs.mdx` with a real consumer example and accessibility notes.
7. Test default plus nested/custom themes; verify there is no unintended component-hook leakage through nested boundaries.
8. Update documentation and decision/roadmap notes; run targeted and full checks.

## C. Minimum Storybook coverage matrix

| Dimension | Baseline | Conditional extensions |
| --- | --- | --- |
| Public props | Default; every variant and size; className/ref/native attrs | Shape, content slots, callbacks, composition |
| Content | Normal and long/wrapping content | Empty/media/complex child slots; RTL text |
| Input state | Native focus and active | Disabled, loading, error, required, read-only, validation messages |
| Interaction | Click/keyboard behavior; accessible role/name | Controlled/uncontrolled; Escape; outside click; focus return; touch; drag |
| Theme | ACME, Luna, Orchid | Nested theme changes; semantic override; component-hook override |
| System modes | Narrow viewport | Reduced motion; forced colors; screen reader announcements |
| Build surface | Named public export, declaration, CSS | Forkable theme CSS and isolated package consumer |

Prefer one focused Storybook `play` assertion per externally visible behavior. Query by `getByRole` / accessible name whenever possible. Do not use tests that pass because you asserted internal implementation details while the UX is broken.

## D. Acceptance review

- [ ] Correct native semantics and accessible name/description.
- [ ] Keyboard navigation and focus management work without a mouse.
- [ ] Disabled/loading semantics do not cause accidental activation.
- [ ] Contrast, focus visibility, reduced-motion, and forced-colors checks where applicable.
- [ ] No hard-coded CSS color or dimension in component stylesheet; token/hook layering correct.
- [ ] Correct visual output in ACME/Luna/Orchid; nested theme and local override tested where relevant.
- [ ] No new unregistered `--ds-*` customization API; generated files come from compiler.
- [ ] TS props/ref and public exports compile for a package consumer.
- [ ] Stories and MDX explain the contract; interaction tests assert behavior.
- [ ] Relevant package checks actually ran or are clearly marked blocked/skipped.

## E. Report format

Conclude with a concise summary:

```text
Implemented: [component or change] — [consumer benefit]
Contract: [public props/export/compatibility choices]
Tokens/themes: [reused/added roles and hooks; theme coverage]
Stories/tests: [new cases]
Validation: [exact commands and pass/fail/skipped, with reasons]
Follow-ups: [only unresolved risks or explicit approval requests]
```

Do not introduce unsupported claims of WCAG conformance; automated accessibility checks are necessary but do not replace human keyboard/assistive-tech evaluation.
