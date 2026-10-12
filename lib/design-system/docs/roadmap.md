# Deferred roadmap

The core native form controls are part of the current foundation. `Accordion`, `Footer`, `Dialog`, `Toast`, `Text`, `Heading`, `Icon`, `Tabs`, `Badge`, and `Tooltip` are approved components; the remaining capabilities stay deferred.

| Phase | Capabilities | Required foundation |
| --- | --- | --- |
| Approved compositions | Accordion, Footer, Dialog | Public APIs and accessibility/state contracts in `component-development.md` |
| Approved notifications | Toast | Provider-owned queue, timed dismissal, announcements, and theme-scoped viewport in `component-development.md` |
| Approved typography atoms | Text, Heading | Native heading outline, shared type scale, and semantic text colors |
| Approved icon atom | Icon | Curated named SVG catalog, token-based sizing, and decorative/accessible semantics |
| Approved status atom | Badge | Non-interactive status/category labels with complete themed, contrast-checked status colors |
| Approved help atom | Tooltip | Brief supplementary help with keyboard and pointer access, touch dismissal, and theme-safe viewport positioning |
| Approved compound control | Tabs | Named tab list, controlled/uncontrolled selection, orientation-aware keyboard model, and accessible tab panels |
| Layout primitives | Stack, Inline, Grid, Container | Pixel spacing and responsive layout rules |
| Additional form atoms | Switch, date/time inputs, file input | Extend the existing labeling, validation-message, and focus conventions |
| Form composition | Public Field, Form, shared validation messages and state | Core form controls and a separately defined state/validation contract |
| Interaction infrastructure | Focus management, dismissal, positioning, themed portals | Tested accessibility primitives and theme-boundary policy |
| Compound controls | Menu, Combobox, custom popover Select | Shared state and keyboard interaction contracts |
| Larger compositions | Navigation, complex forms, data displays | Stable atoms and compound controls |

Every future compound component must document its parts, state ownership, controlled/uncontrolled behavior, keyboard model, labeling relationships, and public styling hooks. Consumers must not need to target private DOM structures.

Before portalled components are added, define how portal containers receive the active theme and scoped overrides. CSS variables follow DOM ancestry. Every addition must retain the token validation and accessibility checks in a fork that removes unused themes, stories, and components.
