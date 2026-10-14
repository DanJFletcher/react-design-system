---
name: Storybook Vite preview hosts
description: Allowing proxied hostnames for the Storybook preview iframe.
---

Storybook's manager-level host allowlist does not necessarily configure the Vite server that serves `iframe.html` and its preview modules. When the Replit proxy loads the manager but the iframe rejects a host such as `127.0.0.1`, configure Vite's `server.allowedHosts` in Storybook's `viteFinal` hook.

**Why:** A healthy manager page can coexist with a blank preview iframe and a host-validation error.

**How to apply:** Check the preview iframe's browser console separately from manager startup logs; set the Vite server allowlist in the Storybook config when the proxy hostname is rejected.
