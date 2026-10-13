---
name: Luna radius intent
description: User's intended distinction between Luna surfaces and pill/circular controls.
---

Luna's ideal default surface radius is 24px. Surfaces should remain rectangular with large rounded corners, not become circular. Exceptions include a few form controls such as buttons and text inputs, where pills or circles are intended; the user previously also specified pill-shaped selects.

**Why:** The user identified repeated oversized surface corners and requested a design-system-level solution that prevents future implementations from repeating the problem.

**How to apply:** When planning or implementing new components, distinguish surface defaults from intentional pill/circular controls. Preserve explicit consumer shape and radius choices rather than treating the default as a hard cap.
