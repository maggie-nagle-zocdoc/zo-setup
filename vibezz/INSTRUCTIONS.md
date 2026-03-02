# Vibezz Design System — AI Coding Guidelines

You are building with the Vibezz Design System. Follow these rules strictly.

## MCP Server Available

This project has a **Vibezz MCP server** configured. Use it to:
- Look up component props, variants, and usage
- Generate accurate code for any component
- Access design tokens (colors, typography, spacing)
- Search for components by use case
- Get starter page templates

**When unsure about a component, query the MCP server first.**

---

## Guardrails

### 1. NEVER Modify Vibezz Components

Do not edit files in `src/components/vibezz/` unless the user explicitly asks.

- Do not add props or change component behavior
- Do not refactor or "improve" component internals
- Use components as-is, or **ask before modifying**

If a component doesn't do what you need:

1. **Use it as-is** with available props and variants
2. **Compose it** with other components or wrapper elements
3. **Ask the user** before making any modifications:
   > "The existing [Component] doesn't support [feature]. Would you like me to modify the component source, or should I work around it?"

Vibezz components are the **source of truth** for the design system. Unintended modifications break consistency. Changes should be deliberate and reviewed, not incidental.

### 2. NEVER Create Custom Components

Use existing Vibezz components from `@/components/vibezz`. Do NOT create inline custom components.

If a UI pattern seems to need a custom component, check the MCP server first — there's likely an existing component for it.

When you think a component is missing:

1. **Query the MCP server** to search for components by use case
2. Check component variants — many have multiple variants/sizes
3. **Ask the user** before creating anything custom:
   > "I don't see an exact component for [pattern]. Would you like me to:
   > A) Use [closest existing component] with some styling
   > B) Suggest adding a new variant to an existing component
   > C) Create a custom solution (not recommended)"

The design system exists for consistency. Every custom component breaks that consistency.

### 3. NEVER Use `font-bold`

The Sharp Sans font only has two weights:
- `font-semibold` (600) — Headings, labels, emphasis
- `font-medium` (500) — Body text, descriptions

### 4. NEVER Use Arbitrary Colors

Use CSS variables, never hex values. Query the MCP server for the full list of design tokens.

---

## Patterns

### Import Pattern

Always import from the vibezz barrel:

```tsx
import { Button, Icon, Input, Select } from "@/components/vibezz";
```

### Page Structure

Use Container and Section for layout:

```tsx
import { Container, Section, Header } from "@/components/vibezz";

export default function Page() {
  return (
    <Container>
      <Header title="Page Title" />
      <Section>
        {/* Content */}
      </Section>
    </Container>
  );
}
```

### Icons

Use the Icon component with Material Symbols names:

```tsx
<Icon name="search" />
<Icon name="favorite" filled />
```

---

## Pattern Recognition — Analyze Before Building

Before writing any code from a Figma mockup or design, FIRST identify all UI patterns and map them to existing Vibezz components.

### Navigation & Layout

| Pattern You See | Vibezz Component |
|-----------------|------------------|
| Top bar with logo | `Nav` + `Logo` |
| Page title with subtitle | `Header` |
| Content area with max-width | `Container` |
| Grouped content sections | `Section` |
| Back arrow/chevron | `IconButton icon="chevron_left"` |

### Forms & Inputs

| Pattern You See | Vibezz Component |
|-----------------|------------------|
| Text input with label | `TextField` |
| Multi-line text input | `TextareaField` |
| Dropdown/select menu | `SelectField` |
| Checkbox with label | `CheckboxField` |
| Toggle switch (on/off boolean) | `SwitchField` |
| Radio buttons (vertical list) | `RadioGroup` + `RadioField` |
| Radio buttons (card style) | `RadioGroup` + `RadioCard` |
| Segmented control / toggle | `Tabs` with `TabsList variant="segmented"` |

### Segmented Control vs Switch

**Segmented controllers** (toggle groups, pill toggles):
- Multiple options in a horizontal row with pill/rounded background
- Options like "Weekly | Monthly", "Yes | No", "List | Grid"
- Selected option has a highlighted background

Use `Tabs` with `variant="segmented"`

**Switch** is for binary on/off toggles (sliding track with thumb). Use `SwitchField`.

### Buttons & Actions

| Pattern You See | Vibezz Component |
|-----------------|------------------|
| Primary action button (filled, yellow) | `Button variant="primary"` |
| Secondary button (outlined) | `Button variant="secondary"` |
| Text-only button | `Button variant="tertiary"` |
| Icon-only button | `IconButton` |
| Link text (underlined) | `Link` |

### Feedback & Status

| Pattern You See | Vibezz Component |
|-----------------|------------------|
| Small colored label/tag | `Badge` |
| Notification banner | `Flag` |
| Loading indicator | `Progress` |
| Toast notification | `Toast` via `useToast()` |
| Error message under input | `ErrorMessage` |

### Overlays & Popovers

| Pattern You See | Vibezz Component |
|-----------------|------------------|
| Modal dialog (centered) | `Dialog` |
| Slide-in panel (bottom/side) | `Drawer` |
| Small popup on click | `Popover` |
| Hover hint/info | `Tooltip` |

### Data & Lists

| Pattern You See | Vibezz Component |
|-----------------|------------------|
| Data table with rows | `DataTable` or `Table` |
| Profile photo/avatar | `Avatar` |
| Collapsible sections | `Accordion` |
| Tab navigation | `Tabs` + `TabsList` + `TabsTrigger` |
| Page numbers | `Pagination` |

### Wizard/Flow Patterns

| Pattern You See | Vibezz Component |
|-----------------|------------------|
| Step indicator/progress | `FlowProgress` |
| Question with selectable options | `FlowQuestion` + `FlowOptions` |
| Multi-step flow | `Flow` + `FlowHeader` + `FlowContent` + `FlowFooter` |

### Never Create Custom Components

| UI Pattern | Use This | NOT This |
|------------|----------|----------|
| Yes/No toggle | `RadioGroup` + `RadioCard` or `Tabs` | Custom SegmentedControl |
| Icon with tooltip | `Tooltip` + `Icon` | Custom InfoTooltip |
| Back button | `IconButton icon="chevron_left"` | Custom BackButton |
| Form section | `Section` | Custom div wrapper |
| Page container | `Container` | Custom max-width div |
| Loading state | `Progress` | Custom loading component |
| Error message | `ErrorMessage` or `Flag variant="error"` | Custom error div |
| Modal/Dialog | `Dialog` or `Drawer` | Custom modal |
| Dropdown menu | `Select` or `Popover` | Custom dropdown |

---

## Design Tokens & Styling

**Always use Tailwind CSS classes and design tokens. Never use inline styles or hardcoded values.**

**Use the MCP server to look up design token values (colors, typography, spacing).**

### Font Weights — CRITICAL

**NEVER use `font-bold`. The design system uses `font-semibold` for ALL headings.**

| Element Type | Weight | Tailwind Class |
|--------------|--------|----------------|
| All headings (h1-h6) | Semibold (600) | `font-semibold` |
| Body text, paragraphs | Medium (500) | `font-medium` |
| Labels, captions | Medium (500) | `font-medium` |
| Links | Semibold (600) | `font-semibold` |
| Buttons | Semibold (600) | `font-semibold` |

```tsx
// NEVER use font-bold
<h1 className="font-bold">Wrong</h1>

// Always use font-semibold for headings
<h1 className="font-semibold">Correct</h1>
```

### Mapping Figma/Design to Vibezz Typography

When a design shows non-standard font sizes, map to the closest Vibezz style:

| Design Shows | Map To | Reasoning |
|--------------|--------|-----------|
| 22-26px heading | `title-1` (28px) | Closest large heading |
| 19-21px heading | `title-2` (20px) | Mid-range heading |
| 17-19px text | `title-3` (18px) | Subsection size |
| 15-16px text | `body` (16px) | Standard readable text |
| 13-14px text | `subbody` (14px) | Secondary content |
| 10-12px text | `caption` (12px) | Smallest readable size |

Always notify the user when mapping:
> "The Figma design uses 22px. The closest Vibezz options are `title-2` (20px) or `title-1` (28px). I recommend `title-2` to maintain visual hierarchy."

### Never Use

- Inline `style` attributes for layout/sizing
- Hardcoded color hex values (use design tokens via CSS variables)
- `font-bold` (always use `font-semibold`)
- Arbitrary font sizes outside the typography scale
