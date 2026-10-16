---
name: Astro managed workflows
description: Astro 7's agent auto-background mode and legacy Vite entry cleanup in Replit workflow-managed Astro apps.
---

In a Replit managed workflow, Astro 7 may detect an AI-agent environment and spawn a detached background server. The workflow can then finish even though Astro briefly reported that it was ready. Use `astro dev --ignore-lock` so the managed workflow keeps the server in the foreground; this disables Astro's PID lock tracking, while the managed workflow remains responsible for process lifecycle.

When migrating a Vite scaffold to Astro, remove the root `index.html` and the stale React bootstrap (`src/main.tsx` and `src/App.tsx`). Astro's Vite dependency scanner may still discover that bootstrap and follow its imports even though Astro pages own the routes.

In path-based previews, Astro's dev toolbar and CSS module imports may inject root-absolute requests (for example, `/@id/...` or `/src/...`). Those can 404 through the preview proxy even when they work directly against the local port. Disable the dev toolbar and, when necessary, use a `?inline` stylesheet import rendered in a global `<style>` block; a `?url` CSS import can still inject an unprefixed module request.

**Why:** Astro's agent auto-backgrounding detached the server from the managed workflow, Vite kept scanning the orphaned React bootstrap, and the proxy exposed root-absolute development asset paths that returned 404.

**How to apply:** If an Astro workflow exits after announcing readiness, check for agent auto-backgrounding before diagnosing a port problem. Keep it in the foreground for workflow supervision, remove both old Vite entrypoints, disable the dev toolbar for the path-based preview, and make source styles proxy-safe.
