/**
 * Vibezz MCP Resources
 *
 * Exposes read-only resources for accessing the component catalog,
 * design tokens, coding rules, UI patterns, layout guidance,
 * page starters, and raw CSS tokens.
 */

import { componentRegistry } from "./tools.js";
import { getDesignTokens, getRawTokensCSS } from "./design-tokens.js";

// =============================================================================
// UI Pattern Mappings
// =============================================================================

const UI_PATTERNS = {
  "form-field": {
    description: "Form input components for collecting user data",
    components: ["TextField", "TextareaField", "SelectField", "Checkbox", "RadioGroup", "Switch"],
    example: "Use TextField for single-line input, TextareaField for multi-line, SelectField for dropdowns",
  },
  "modal-dialog": {
    description: "Modal overlay for focused interactions",
    components: ["Dialog", "DialogContent", "DialogHeader", "DialogFooter", "DialogTitle", "DialogDescription"],
    example: "Use Dialog for confirmations, forms, or focused tasks that require user attention",
  },
  "slide-panel": {
    description: "Side panel that slides in from the edge",
    components: ["Drawer", "DrawerContent", "DrawerHeader", "DrawerBody", "DrawerFooter"],
    example: "Use Drawer for secondary content, filters, or forms that don't require full focus",
  },
  notification: {
    description: "User feedback and alert components",
    components: ["Toast", "Flag"],
    example: "Use Toast for transient feedback, Flag for persistent alerts/banners",
  },
  "data-display": {
    description: "Components for displaying data and information",
    components: ["Table", "DataTable", "Badge", "Avatar", "Progress"],
    example: "Use DataTable for sortable/filterable tables, Badge for status indicators",
  },
  navigation: {
    description: "Navigation and wayfinding components",
    components: ["Nav", "Tabs", "Link", "Pagination"],
    example: "Use Nav for main navigation, Tabs for content sections, Pagination for multi-page content",
  },
  layout: {
    description: "Page structure and layout components",
    components: ["Container", "Section", "Header"],
    example: "Wrap pages in Container, use Section for vertical spacing, Header for page titles",
  },
  action: {
    description: "Interactive action components",
    components: ["Button", "IconButton", "Link"],
    example: "Use Button for primary actions, IconButton for icon-only actions, Link for navigation",
  },
};

// =============================================================================
// Cursor Rules (condensed for AI reference)
// =============================================================================

const CURSOR_RULES = `# Vibezz Design System Rules

## Core Principles
1. ALWAYS use Vibezz components from "@/components/vibezz"
2. NEVER create custom/inline components - use existing ones
3. NEVER modify files in src/components/vibezz/ unless explicitly asked

## Typography Rules
- Use font-semibold (600) for headings, labels, emphasis
- Use font-medium (500) for body text, descriptions
- NEVER use font-bold

### Size Scale
- Display: text-[28px] font-semibold leading-[36px]
- Title 1: text-[28px] font-semibold leading-[32px]
- Title 2: text-[20px] font-semibold leading-[26px]
- Title 3: text-[18px] font-semibold leading-[24px]
- Title 4: text-[16px] font-semibold leading-[20px]
- Body: text-[16px] font-medium leading-[26px]
- Subbody: text-[14px] font-medium leading-[20px]
- Caption: text-[12px] font-medium leading-[16px]

## Color Rules
Use CSS variables, never arbitrary hex values:
- text-[var(--text-default)] - Primary text
- text-[var(--text-whisper)] - Muted/placeholder
- text-[var(--text-error)] - Error text
- text-[var(--text-success)] - Success text
- bg-[var(--background-default-white)] - White background
- bg-[var(--background-default-greige)] - Light gray background
- bg-[var(--background-success)] - Success background
- bg-[var(--background-error)] - Error background
- bg-[var(--core-yellow)] - Brand yellow
- border-[var(--stroke-default)] - Default borders
- border-[var(--stroke-ui)] - UI element borders
- border-[var(--stroke-error)] - Error borders

## Icon Usage
Use the Icon component with Material Symbols names:
\`\`\`tsx
import { Icon } from "@/components/vibezz"
<Icon name="settings" size="24" />
<Icon name="favorite" filled />
\`\`\`
Browse icons: https://fonts.google.com/icons?icon.set=Material+Symbols

## Import Pattern
Always import from the vibezz barrel:
\`\`\`tsx
import { Button, Icon, Input, Select } from "@/components/vibezz"
\`\`\`

## Page Structure
\`\`\`tsx
import { Container, Section, Header } from "@/components/vibezz"

export default function Page() {
  return (
    <Container>
      <Header title="Page Title" />
      <Section>
        {/* Content */}
      </Section>
    </Container>
  )
}
\`\`\`

## Container Sizes
- \`default\`: max-w-[1440px] — Standard content width
- \`wide\`: No max-width — Full/fluid for data-heavy layouts
- \`narrow\`: max-w-[720px] — Focused content like forms

## Section Sizes
- \`"1"\`: py-8 (32px) — Compact sections
- \`"2"\`: py-12 (48px) — Moderate spacing
- \`"3"\`: py-20 (80px) — Standard (default)
- \`"4"\`: py-32 (128px) — Large/prominent sections

## Breakpoints (Radix UI Themes, min-width)
- xs: 520px — Phones (landscape)
- sm: 768px — Tablets (portrait)
- md: 1024px — Tablets (landscape)
- lg: 1280px — Laptops
- xl: 1640px — Desktops

## Component Pattern Mapping
| UI Pattern | Use This Component |
|------------|-------------------|
| Primary/Secondary buttons | Button with variant prop |
| Icon-only button | IconButton |
| Any icon | Icon with name prop |
| Text input | TextField or Input |
| Multi-line text | TextareaField |
| Dropdown/Select | SelectField or Select |
| Toggle/Switch | Switch or SwitchField |
| Single checkbox | Checkbox |
| Multiple checkboxes | CheckboxGroup |
| Radio options | RadioGroup |
| Modal/Popup | Dialog |
| Bottom sheet | Drawer |
| Hover info | Tooltip |
| Click popover | Popover |
| User avatar | Avatar |
| Status badge | Badge |
| Alert/Banner | Flag |
| Progress bar | Progress |
| Data table | Table or DataTable |
| Pagination | Pagination |
| Page header | Header |
| Navigation | Nav |
| Page wrapper | Container |
| Content section | Section |
`;

// =============================================================================
// Layout Guide (static resource)
// =============================================================================

const LAYOUT_GUIDE = {
  pageStructure: {
    description: "Every Vibezz page follows a Container > Header > Section structure",
    pattern: `<Container size="default|wide|narrow">
  <Header title="..." />
  <Section size="1|2|3|4">
    {/* Content */}
  </Section>
</Container>`,
    components: {
      Container: {
        description: "Width-constraining wrapper with responsive horizontal padding",
        sizes: {
          default: "max-w-[1440px] — Standard content width",
          wide: "No max-width — Full/fluid for data-heavy layouts",
          narrow: "max-w-[720px] — Focused content like forms",
        },
        padding: "px-4 sm:px-6 md:px-8 (auto-applied)",
      },
      Section: {
        description: "Vertical spacing primitive using padding",
        sizes: {
          "1": "py-8 (32px) — Compact",
          "2": "py-12 (48px) — Moderate",
          "3": "py-20 (80px) — Standard (default)",
          "4": "py-32 (128px) — Large",
        },
      },
      Header: {
        description: "Page header with title, optional subbody, and right slot",
        props: ["title: string", "subbody?: string", "right?: ReactNode"],
      },
    },
  },
  breakpoints: {
    description: "Radix UI Themes breakpoints, min-width based. Mobile-first approach.",
    values: {
      xs: "520px — Phones (landscape)",
      sm: "768px — Tablets (portrait)",
      md: "1024px — Tablets (landscape)",
      lg: "1280px — Laptops",
      xl: "1640px — Desktops",
    },
  },
  gridPatterns: {
    twoColumn: "grid grid-cols-1 md:grid-cols-2 gap-6",
    threeColumn: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
    fourColumn: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
    sidebar: "grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8",
    formLayout: "flex flex-col gap-4 max-w-[560px] mx-auto",
  },
  responsivePatterns: {
    stackToRow: "flex flex-col md:flex-row gap-4",
    hideOnMobile: "hidden md:block",
    responsiveText: "text-[20px] md:text-[28px] font-semibold",
  },
};

// =============================================================================
// Page Starters (static resource — summary catalog)
// =============================================================================

const PAGE_STARTERS_CATALOG = [
  {
    id: "default",
    title: "Default Page",
    description: "Standard page with Nav, Container, Header, and Section. Best for general content pages.",
    components: ["Nav", "Logo", "Button", "Container", "Header", "Section"],
  },
  {
    id: "form",
    title: "Form Page",
    description: "Narrow-centered form with transparent nav, sectioned fields, and submit. Best for long forms, onboarding.",
    components: ["Nav", "Logo", "Icon", "Header", "Section", "TextField", "TextareaField", "RadioGroup", "RadioField", "Checkbox", "Button", "Link"],
  },
  {
    id: "flow",
    title: "Flow / Wizard Page",
    description: "Step-by-step flow with progress indicator and option cards. Best for multi-step wizards.",
    components: ["Flow", "FlowHeader", "FlowProgress", "FlowContent", "FlowQuestion", "FlowOptions", "FlowOption"],
    importPath: "@/starters/flow-page",
  },
  {
    id: "table",
    title: "Table / Data Page",
    description: "Data-heavy page with filter bar, data table, and pagination. Best for admin panels, dashboards.",
    components: ["Nav", "Logo", "Header", "Button", "Icon", "Input", "Select", "Table", "Badge", "AvatarWithFallback", "Pagination"],
  },
];

// =============================================================================
// Resource Handlers
// =============================================================================

export async function handleListResources() {
  return {
    resources: [
      {
        uri: "vibezz://catalog",
        name: "Component Catalog",
        description: "Complete Vibezz component registry with all props, variants, and metadata",
        mimeType: "application/json",
      },
      {
        uri: "vibezz://tokens",
        name: "Design Tokens",
        description: "Vibezz design tokens parsed from tokens.css — colors, typography, spacing, borders, breakpoints, and more",
        mimeType: "application/json",
      },
      {
        uri: "vibezz://tokens/css",
        name: "Raw CSS Tokens",
        description: "The raw tokens.css file with all CSS custom properties — the single source of truth",
        mimeType: "text/css",
      },
      {
        uri: "vibezz://rules",
        name: "Cursor Rules",
        description: "AI coding rules and guidelines for using Vibezz components correctly",
        mimeType: "text/markdown",
      },
      {
        uri: "vibezz://patterns",
        name: "UI Patterns",
        description: "Common UI patterns mapped to Vibezz components",
        mimeType: "application/json",
      },
      {
        uri: "vibezz://layout",
        name: "Layout Guide",
        description: "Page structure, Container/Section usage, breakpoints, responsive patterns, and grid compositions",
        mimeType: "application/json",
      },
      {
        uri: "vibezz://page-starters",
        name: "Page Starter Templates",
        description: "Pre-built page template catalog — use get_page_starter tool for full code",
        mimeType: "application/json",
      },
    ],
  };
}

export async function handleReadResource(request: { params: { uri: string } }) {
  const { uri } = request.params;

  switch (uri) {
    case "vibezz://catalog":
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(componentRegistry, null, 2),
          },
        ],
      };

    case "vibezz://tokens":
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(getDesignTokens(), null, 2),
          },
        ],
      };

    case "vibezz://tokens/css":
      return {
        contents: [
          {
            uri,
            mimeType: "text/css",
            text: getRawTokensCSS(),
          },
        ],
      };

    case "vibezz://rules":
      return {
        contents: [
          {
            uri,
            mimeType: "text/markdown",
            text: CURSOR_RULES,
          },
        ],
      };

    case "vibezz://patterns":
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(UI_PATTERNS, null, 2),
          },
        ],
      };

    case "vibezz://layout":
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(LAYOUT_GUIDE, null, 2),
          },
        ],
      };

    case "vibezz://page-starters":
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(PAGE_STARTERS_CATALOG, null, 2),
          },
        ],
      };

    default:
      throw new Error(
        `Unknown resource: ${uri}. Available resources: vibezz://catalog, vibezz://tokens, vibezz://tokens/css, vibezz://rules, vibezz://patterns, vibezz://layout, vibezz://page-starters`
      );
  }
}
