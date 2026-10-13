# Deferred roadmap

The core native form controls are part of the current foundation. `Accordion`, `Footer`, `Dialog`, `Toast`, `Text`, `Heading`, `Icon`, `Tabs`, `Badge`, `Tooltip`, `Callout`, `Progress`, `ContactSection`, `ArticleCard`, `ArticleBody`, `ArticleFootnotes`, `ArticleTableOfContents`, `Pagination`, `Breadcrumbs`, and `Testimonials` are approved components; the remaining capabilities stay deferred.

| Phase | Capabilities | Required foundation |
| --- | --- | --- |
| Approved compositions | Accordion, Footer, Dialog | Public APIs and accessibility/state contracts in `component-development.md` |
| Approved notifications | Toast | Provider-owned queue, timed dismissal, announcements, and theme-scoped viewport in `component-development.md` |
| Approved typography atoms | Text, Heading | Native heading outline, shared type scale, and semantic text colors |
| Approved icon atom | Icon | Curated named SVG catalog, token-based sizing, and decorative/accessible semantics |
| Approved status atom | Badge | Non-interactive status/category labels with complete themed, contrast-checked status colors |
| Approved help atom | Tooltip | Brief supplementary help with keyboard and pointer access, touch dismissal, and theme-safe viewport positioning |
| Approved message composition | Callout | Persistent in-flow status, guidance, and consumer-provided actions, distinct from queued toasts |
| Approved activity indicator | Progress | Accessible linear determinate/indeterminate feedback with labels and theme-aware styling |
| Approved small-business section | ContactSection | Responsive contact methods, address/directions, weekly hours, CTA, and an optional consumer-owned form slot |
| Approved blog content card | ArticleCard | Semantic post previews with category, linked title, excerpt, author/date/read-time metadata, and optional image |
| Approved blog citations | ArticleFootnotes | In-text footnote links, accessible notes, and return links to one or more citations |
| Approved article navigation | ArticleTableOfContents | Named navigation landmark with native links to consumer-provided heading IDs |
| Approved blog navigation | Pagination | URL links or controlled callbacks, current-page semantics, and responsive page ranges |
| Approved site navigation | Breadcrumbs | Named landmark with consumer-owned parent URLs and current-page semantics |
| Approved customer trust | Testimonials | Theme-aware quote cards with author attribution and optional portraits and accessible ratings |
| Approved compound control | Tabs | Named tab list, controlled/uncontrolled selection, orientation-aware keyboard model, and accessible tab panels |
| Layout primitives | Stack, Inline, Grid, Container | Pixel spacing and responsive layout rules |
| Additional form atoms | Switch, date/time inputs, file input | Extend the existing labeling, validation-message, and focus conventions |
| Form composition | Public Field, Form, shared validation messages and state | Core form controls and a separately defined state/validation contract |
| Interaction infrastructure | Focus management, dismissal, positioning, themed portals | Tested accessibility primitives and theme-boundary policy |
| Compound controls | Menu, Combobox, custom popover Select | Shared state and keyboard interaction contracts |
| Larger compositions | Navigation, complex forms, data displays | Stable atoms and compound controls |

Every future compound component must document its parts, state ownership, controlled/uncontrolled behavior, keyboard model, labeling relationships, and public styling hooks. Consumers must not need to target private DOM structures.

Before portalled components are added, define how portal containers receive the active theme and scoped overrides. CSS variables follow DOM ancestry. Every addition must retain the token validation and accessibility checks in a fork that removes unused themes, stories, and components.
