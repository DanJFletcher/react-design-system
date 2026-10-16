# Accessibility and mobile-first responsive acceptance checklist

**Engineering goal:** WCAG 2.2 AA. W3C defines normative success criteria; this checklist is an implementation and review tool, not certification. Automated audits cannot establish complete conformance. Source: https://www.w3.org/WAI/WCAG22/quickref/

## Structure and semantics

- Set the document language and useful, route-specific `<title>`.
- One meaningful H1 per page as a site convention; heading hierarchy follows the content outline rather than font size.
- Semantic `<header>`, clearly named `<nav>`, `<main id="main-content">`, relevant `<section aria-labelledby>`, and `<footer>`. Avoid redundant landmarks or unnecessary `role` annotations.
- Provide a skip link that becomes visible on focus and reaches main content.
- Native `<button>` for actions; `<a href>` for navigation; never use clickable divs or `href="#"` placeholders as fake actions.
- Links make sense outside surrounding prose; icon-only controls have accessible names.
- Images: informative alt describes the information, decorative `alt=""`, functional alt describes the action. Avoid putting required copy in an image.

## Keyboard and assistive technology

- All controls usable with Tab/Shift+Tab, Enter, Space where appropriate, Escape for dismissal, and arrow keys only where the interaction pattern requires them.
- Visible, high-contrast `:focus-visible` treatment on *every* interactive element; do not suppress default outlines without replacement.
- Mobile navigation button announces an accessible name and expanded state; menu content is reachable in logical order; closing or following navigation returns focus sensibly.
- Dialog/popover focus and dismissal match native semantics or established component library implementations; avoid hover-only dropdowns.
- No keyboard traps; sticky headers do not hide focused content.
- Check reading order and labels using browser accessibility tree or an actual screen reader where available.

## Typography, contrast, and motion

- Normal text contrast ≥4.5:1; large text contrast ≥3:1 under WCAG definitions. UI component boundaries, icons conveying meaning, and relevant states generally require ≥3:1 non-text contrast. Check text over photos and gradients at the *worst* point.
- Do not convey meaning by color alone. Error states need text, not a red border alone.
- Maintain legibility at 200% zoom; test 400% zoom/reflow at the appropriate desktop viewport, corresponding to roughly 320 CSS px content width. Avoid 2D scroll for ordinary prose.
- Verify text spacing adjustments do not clip or overlap content (WCAG 1.4.12).
- Honor `prefers-reduced-motion`; remove nonessential parallax, looping backgrounds, slide effects, and automatic carousel motion. Do not require animation to reveal information.
- Verify forced-colors/high-contrast mode where applicable; important boundaries and focus remain perceivable.

## Pointer and mobile targets

- WCAG 2.2 AA Target Size (Minimum), SC 2.5.8: generally 24×24 CSS px with specified spacing and other exceptions; do not misstate this as a strict universal 44px WCAG requirement.
- For comfortable mobile use, **prefer** approximately 44–48px activation targets for primary controls and generous gaps for neighboring icon actions.
- No gestures that are the only way to perform an action. Never require hover for a mobile user.
- Ensure content is usable with one thumb, with important controls accessible without obstructing reading or keyboard entry.

## Forms

- Every control has a visible, associated label; placeholder text is not a substitute.
- Required fields, examples, and format instructions are clear before or during entry, not only after errors.
- Validation uses field-level messages, `aria-invalid` and stable `aria-describedby` associations as appropriate; focus moves or announcements make submission failures findable.
- Preserve entered data on errors. Prevent accidental duplicate submissions and provide truthful success/failure feedback.
- Choose suitable `autocomplete` and `inputmode`; use native input types where helpful.
- Provide a usable alternative to CAPTCHA if a CAPTCHA is introduced.

## Viewport review matrix

| Width / mode | Inspect |
| --- | --- |
| ~320 CSS px | No horizontal overflow, legible copy, accessible nav/CTA, form fits |
| 360–390px | One-thumb actions, hero crop, balanced above-the-fold content |
| 768px | Tablet transition, column stacking, navigation behavior |
| 1024px | Intermediate grid proportions and restrained line lengths |
| 1440px and wider | Intentional max widths, whitespace, readable scan paths |
| 200% and 400% zoom | Reflow, text spacing, focus visibility, sticky elements |
| Landscape mobile | Menus, forms, no viewport-height content traps |
| Keyboard only | Navigate, operate, dismiss, submit, recover from errors |
| Reduced motion | No essential movement, no unwanted autoplay |
| Low bandwidth | Content/action available without large images or unnecessary JS |

Breakpoints must follow **content failure points**, not arbitrary device classes. Use flexible layout and logical properties. Verify actual rendering; pixel-perfect mockups are not sufficient.

## Useful canonical guidance

- WCAG Quick Reference: https://www.w3.org/WAI/WCAG22/quickref/
- W3C Mobile accessibility and evaluation: https://www.w3.org/WAI/test-evaluate/preliminary/
- Target Size AA: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum
- WAI form labels: https://www.w3.org/WAI/tutorials/forms/labels/
- WAI images: https://www.w3.org/WAI/tutorials/images/
- MDN responsive design: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design
