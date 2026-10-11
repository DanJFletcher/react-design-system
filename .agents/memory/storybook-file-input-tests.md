---
name: Storybook file-input tests
description: A limitation observed when testing native file uploads in the Storybook browser runner.
---

In this workspace's Storybook interaction runner, `userEvent.upload` made selected files visible through `input.files`, but reading those files through `new FormData(form).get(name)` was unreliable, and `instanceof File` did not hold across the Storybook frame.

**Why:** Storybook's interaction code and rendered form elements can use different browser realms or file shims, so strict constructor identity and cross-frame form serialization assumptions can fail in tests even though the native input exposes the selected file list.

**How to apply:** Assert uploaded filenames and multiplicity from the input's `files` property in Storybook stories. Use FormData assertions for ordinary fields; avoid `instanceof File` checks in cross-frame test code.
