# Deferred roadmap

The following work is documented but deliberately not part of the first milestone.

| Phase | Capabilities | Required foundation |
| --- | --- | --- |
| Visual atoms | Text, Heading, Icon | Typography and semantic color rules |
| Layout primitives | Stack, Inline, Grid, Container | Pixel spacing and responsive layout rules |
| Form atoms | Label, Input, Textarea, Checkbox, Radio, Switch | Labeling, validation, and focus conventions |
| Form composition | Field, HelpText, ValidationMessage | Form atoms and shared accessible relationships |
| Interaction infrastructure | Focus management, dismissal, positioning, themed portals | Tested accessibility primitives and theme-boundary policy |
| Compound controls | Tabs, Accordion, Menu, Dialog, Select, Combobox | Shared state and keyboard interaction contracts |
| Larger compositions | Navigation, complex forms, data displays | Stable atoms and compound controls |

Every future compound component must document its parts, state ownership, controlled/uncontrolled behavior, keyboard model, labeling relationships, and public styling hooks. Consumers must not need to target private DOM structures.

Before portalled components are added, define how portal containers receive the active theme and scoped overrides. CSS variables follow DOM ancestry. Every addition must retain the token validation and accessibility checks in a fork that removes unused themes, stories, and components.
