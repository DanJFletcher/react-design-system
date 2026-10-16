# External learning sources: consult when needed, don't copy blindly

The repository's own design-system docs and implemented contracts outrank these examples. They support learning patterns, not silent migrations. Consult the specific page or repo when the task actually requires it; avoid bulk ingesting external source trees into the workspace.

## Authoritative specifications and guidance

1. **W3C WAI-ARIA Authoring Practices Guide** — https://www.w3.org/WAI/ARIA/apg/  
   Use for semantics, names, keyboard patterns, focus behavior, and interactive widget examples. Start here for a novel interaction; native HTML is still preferable whenever possible.
2. **Storybook: Args** — https://storybook.js.org/docs/writing-stories/args  
   Use for stable controls and realistic component stories (match the repo's Storybook major version and existing config).
3. **Storybook: Play functions** — https://storybook.js.org/docs/writing-stories/play-function  
   Use for executable behavior scenarios and interaction assertions; prefer the code conventions already present in `Button.stories.tsx`.
4. **Design Tokens Community Group (DTCG)** — https://www.designtokens.org/ and https://www.designtokens.org/TR/2025.10/  
   Read for vocabulary, interoperability, semantic/alias models, and future migration discussions. **Do not author `$type` / `$value` into this project's existing token JSON** without an explicitly approved compiler migration. The DTCG community-group specification is not a W3C Standards Track Recommendation.

## Open-source implementation references

5. **Adobe React Aria** — https://github.com/adobe/react-spectrum and https://react-spectrum.adobe.com/react-aria/  
   Study interaction/state and accessibility composition, especially for controls with challenging focus/keyboard behavior. Treat as a pattern reference, not an approved dependency.
6. **Radix Primitives** — https://github.com/radix-ui/primitives and https://www.radix-ui.com/primitives/docs/overview/introduction  
   Study headless component parts, state APIs, and accessibility considerations. Avoid copying its API wholesale into a repository that prefers native elements and explicit approved scopes.
7. **IBM Carbon Design System** — https://github.com/carbon-design-system/carbon  
   Study scalable component documentation, architecture, accessibility/testing governance, and token usage. Carbon's branding and technical conventions do not supersede this project's.
8. **GitHub Primer** — https://github.com/primer/react and https://primer.style/  
   Study public API discipline, component documentation, and token-driven patterns.
9. **Style Dictionary** — https://github.com/amzn/style-dictionary and https://styledictionary.com/  
   Study token transformations, platform distribution, and validation *concepts* only. This repository currently has its own `scripts/build-tokens.ts` compiler.
10. **Replit Agent Skills** — https://docs.replit.com/replitai/skills and https://replit.com/blog/custom-skills  
    Follow the `SKILL.md` format and install location `.agents/skills/<skill-name>/`. Keep trigger descriptions precise so the skill applies to library work, not ordinary app UI.

## Research-to-action rules

- Before consulting outside material, articulate the missing implementation knowledge (e.g., listbox keyboard model or theme-boundary strategy).
- Read the smallest authoritative slice; cross-check against current repository constraints.
- Record any adopted public-contract or architecture decision in `docs/decisions.md` and update tests/docs.
- Do not infer that another library's licensing, API, version, or dependency is compatible without checking it for a proposed code reuse or new dependency.
- Never paste third-party source files into the library as-is. Learn principles; author maintainable native code consistent with this repo unless the user approves a new dependency or licensed code port.
