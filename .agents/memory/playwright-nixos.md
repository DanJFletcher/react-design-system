---
name: Playwright in NixOS
description: Browser dependencies for running Playwright Chromium in Replit's NixOS workspace.
---

Playwright can download Chromium successfully while the browser still cannot launch because the NixOS environment lacks its shared libraries. This workspace needed GLib, NSS/NSPR, GTK accessibility, DBus, X11, Mesa/GBM, ALSA, CUPS, Cairo, and Pango runtime libraries.

**Why:** browser binaries and native system libraries are installed separately here; the missing-library failure appears only when Chromium launches.

**How to apply:** use `installSystemDependencies` with Nix package names after checking the browser executable with `ldd`. In Ubuntu CI, Playwright's `install --with-deps chromium` handles the separate dependency set.
