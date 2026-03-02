/**
 * Vibezz MCP Tools
 *
 * Exposes tools for querying components, generating code, and accessing design tokens.
 */

// =============================================================================
// Types
// =============================================================================

type PropertyType = "select" | "boolean" | "text";

interface PropertyConfig {
  name: string;
  type: PropertyType;
  label: string;
  options?: string[];
  defaultValue: string | boolean;
  hidden?: boolean;
}

interface ComponentVariant {
  id: string;
  name: string;
  description?: string;
  hideProperties?: string[];
  propertyOverrides?: Record<string, { options?: string[]; defaultValue?: string | boolean }>;
}

interface ComponentConfig {
  id: string;
  name: string;
  description: string;
  variants: ComponentVariant[];
  properties: PropertyConfig[];
  parentId?: string;
  showVariantsOnPage?: boolean;
}

// =============================================================================
// Component Registry (synced from src/lib/component-registry.ts)
// =============================================================================

export const componentRegistry: ComponentConfig[] = [
  {
    id: "accordion",
    name: "Accordion",
    description: "A vertically stacked set of interactive headings that each reveal an associated section of content.",
    variants: [],
    properties: [
      { name: "type", type: "select", label: "Type", options: ["single", "multiple"], defaultValue: "single" },
    ],
  },
  {
    id: "avatar",
    name: "Avatar",
    description: "Circular avatar component for displaying user profile images with fallback support.",
    variants: [
      { id: "default", name: "Default", description: "Avatar with image" },
      { id: "initials", name: "Initials", description: "Avatar with initials when no image is available" },
    ],
    properties: [
      { name: "size", type: "select", label: "Size", options: ["32", "40", "56", "72", "96", "120", "144"], defaultValue: "32" },
    ],
  },
  {
    id: "badge",
    name: "Badge",
    description: "Status tag component for displaying labels, states, and contextual information.",
    variants: [
      { id: "default", name: "Default", description: "Text-only badge" },
      { id: "withIcon", name: "With Icon", description: "Badge with variant-specific icon" },
      { id: "withTooltip", name: "With Tooltip", description: "Badge with info tooltip on hover" },
    ],
    properties: [
      { name: "variant", type: "select", label: "Type", options: ["yellow-dark", "yellow-light", "callout", "info", "positive", "negative", "charcoal"], defaultValue: "yellow-dark" },
    ],
  },
  {
    id: "button",
    name: "Button",
    description: "Interactive button component with multiple variants and sizes.",
    variants: [
      { id: "default", name: "Default", description: "Standard button styles", hideProperties: ["showLabel"] },
      { id: "withIcon", name: "With Icon", description: "Button with leading icon. Icon size is automatic based on button size (24px for default, 20px for small).", hideProperties: ["showChevron", "showLabel"] },
      { id: "icon", name: "Icon", description: "Icon-only button for actions and controls", hideProperties: ["variant", "showChevron", "showLabel", "isLoading"], propertyOverrides: { size: { options: ["large", "default", "small", "xsmall"], defaultValue: "default" } } },
      { id: "toggle", name: "Toggle", description: "Pill-shaped toggle button with optional label", hideProperties: ["variant", "showChevron", "theme", "isLoading"] },
    ],
    properties: [
      { name: "variant", type: "select", label: "Variant", options: ["primary", "secondary", "tertiary", "ghost", "destructive"], defaultValue: "primary" },
      { name: "size", type: "select", label: "Size", options: ["default", "small"], defaultValue: "default" },
      { name: "theme", type: "select", label: "Theme", options: ["light", "dark"], defaultValue: "light" },
      { name: "disabled", type: "boolean", label: "Disabled", defaultValue: false },
      { name: "showChevron", type: "boolean", label: "Show Chevron", defaultValue: false },
      { name: "showLabel", type: "boolean", label: "Show Label", defaultValue: true },
      { name: "isLoading", type: "boolean", label: "Loading", defaultValue: false },
    ],
  },
  {
    id: "checkbox",
    name: "Checkbox",
    description: "Toggle selection control for boolean values.",
    variants: [
      { id: "default", name: "Default", description: "Standalone checkbox without a label.", hideProperties: ["showLabel", "showSupportingText"] },
      { id: "withLabel", name: "With Label", description: "Use a single checkbox when there's a yes or no choice to make.", hideProperties: ["showLabel", "size"] },
      { id: "group", name: "Group", description: "Use when someone can select multiple options.", hideProperties: ["size"] },
      { id: "hierarchical", name: "Hierarchical", description: "Parent checkbox with indeterminate state that controls child checkboxes.", hideProperties: ["showLabel", "size"] },
    ],
    properties: [
      { name: "size", type: "select", label: "Size", options: ["default", "small"], defaultValue: "default" },
      { name: "showLabel", type: "boolean", label: "Label/Prompt", defaultValue: true },
      { name: "hasError", type: "boolean", label: "Error State", defaultValue: false },
      { name: "showSupportingText", type: "boolean", label: "Supporting Text", defaultValue: false },
      { name: "disabled", type: "boolean", label: "Disabled", defaultValue: false },
    ],
  },
  {
    id: "dialog",
    name: "Dialog",
    description: "Modal dialog for focused interactions.",
    variants: [{ id: "default", name: "Default", description: "Standard dialog" }],
    properties: [{ name: "showLeftLink", type: "boolean", label: "Left Link", defaultValue: false }],
  },
  {
    id: "drawer",
    name: "Drawer",
    description: "Slide-out panel for secondary content, forms, or navigation. Slides in from the right.",
    variants: [{ id: "default", name: "Default", description: "Slides in from the right" }],
    properties: [
      { name: "showCloseButton", type: "boolean", label: "Close Button", defaultValue: true },
      { name: "showLeftLink", type: "boolean", label: "Left Link", defaultValue: false },
    ],
  },
  {
    id: "flag",
    name: "Flag",
    description: "Contextual feedback banner for success, error, info, and status notifications with optional actions.",
    variants: [],
    properties: [
      { name: "color", type: "select", label: "Color", options: ["greige", "yellow", "blue", "red", "green", "white"], defaultValue: "green" },
      { name: "showTitle", type: "boolean", label: "Title", defaultValue: true },
      { name: "leadingElement", type: "select", label: "Leading Element", options: ["none", "icon", "badge"], defaultValue: "icon" },
      { name: "action", type: "select", label: "Action", options: ["none", "button", "close"], defaultValue: "button" },
    ],
  },
  {
    id: "icon",
    name: "Icon",
    description: "Material Symbols icon component with variable font settings for optimal rendering at each size.",
    variants: [{ id: "default", name: "Default", description: "Standard icon display" }],
    properties: [
      { name: "size", type: "select", label: "Size", options: ["16", "20", "24", "40"], defaultValue: "24" },
      { name: "filled", type: "boolean", label: "Filled", defaultValue: false },
    ],
  },
  {
    id: "input",
    name: "Input",
    description: "Text input field with optional label, helper text, and validation states.",
    variants: [{ id: "default", name: "Default", description: "Standard text input" }],
    properties: [
      { name: "size", type: "select", label: "Size", options: ["default", "small"], defaultValue: "default" },
      { name: "state", type: "select", label: "State", options: ["default", "error"], defaultValue: "default" },
      { name: "showLabel", type: "boolean", label: "Label/Prompt", defaultValue: false },
      { name: "required", type: "boolean", label: "Required", defaultValue: false },
      { name: "disabled", type: "boolean", label: "Disabled", defaultValue: false },
    ],
  },
  {
    id: "link",
    name: "Link",
    description: "Inline text link for navigation within content.",
    variants: [{ id: "default", name: "Default", description: "Standard inline link" }],
    properties: [{ name: "size", type: "select", label: "Size", options: ["default", "small"], defaultValue: "default" }],
  },
  {
    id: "logo",
    name: "Logo",
    description: "Brand logo component available as full wordmark or icon-only variants at multiple sizes.",
    variants: [],
    properties: [
      { name: "variant", type: "select", label: "Variant", options: ["wordmark", "icon"], defaultValue: "wordmark" },
      { name: "size", type: "select", label: "Size", options: ["xsmall", "small", "medium", "large"], defaultValue: "medium" },
    ],
  },
  {
    id: "header",
    name: "Page Header",
    description: "Page header component with title, optional subbody, and right drop zone for actions.",
    variants: [
      { id: "default", name: "Default", description: "Simple page header with just a title" },
      { id: "subbody", name: "Subbody", description: "Page header with supporting description text" },
      { id: "actions", name: "Actions", description: "Page header with action buttons on the right" },
    ],
    properties: [],
  },
  {
    id: "nav",
    name: "Nav",
    description: "Navigation bar component with left, center, and right drop zones for logos, search, buttons, and avatars.",
    variants: [
      { id: "logo-with-avatar", name: "Logo with Avatar", description: "Navigation bar with logo and user avatar" },
      { id: "logo-with-actions", name: "Logo with Actions", description: "Navigation with logo and action buttons" },
      { id: "actions", name: "Actions", description: "Navigation with action buttons on both sides" },
    ],
    properties: [
      { name: "variant", type: "select", label: "Variant", options: ["default", "transparent"], defaultValue: "default" },
    ],
  },
  {
    id: "progress",
    name: "Progress",
    description: "Progress bar component for showing completion status of a task or process.",
    variants: [{ id: "default", name: "Default", description: "Standard progress bar" }],
    properties: [
      { name: "variant", type: "select", label: "Variant", options: ["default", "stepped"], defaultValue: "default" },
      { name: "size", type: "select", label: "Size", options: ["small", "default"], defaultValue: "default" },
    ],
  },
  {
    id: "popover",
    name: "Popover",
    description: "Floating content panel that appears next to a trigger element. Useful for displaying additional context, actions, or forms.",
    variants: [{ id: "default", name: "Default", description: "Standard popover with content" }],
    properties: [
      { name: "side", type: "select", label: "Side", options: ["top", "right", "bottom", "left"], defaultValue: "bottom" },
      { name: "align", type: "select", label: "Align", options: ["start", "center", "end"], defaultValue: "center" },
    ],
  },
  {
    id: "pagination",
    name: "Pagination",
    description: "Navigation component for paginated content with page numbers and previous/next controls.",
    variants: [{ id: "default", name: "Default", description: "Standard pagination with page numbers and navigation" }],
    properties: [{ name: "showNavigation", type: "boolean", label: "Show Navigation", defaultValue: true }],
  },
  {
    id: "radio",
    name: "Radio",
    description: "A single radio button for simple binary choices within a group context.",
    variants: [{ id: "default", name: "Default", description: "Single radio button with label." }],
    properties: [
      { name: "showSupportingText", type: "boolean", label: "Supporting Text", defaultValue: false },
      { name: "disabled", type: "boolean", label: "Disabled", defaultValue: false },
    ],
  },
  {
    id: "radio-cards",
    name: "Radio Cards",
    description: "Card-based radio selection for more prominent choices.",
    variants: [{ id: "default", name: "Default", description: "Wide cards that stack vertically." }],
    properties: [
      { name: "hasError", type: "boolean", label: "Error State", defaultValue: false },
      { name: "disabled", type: "boolean", label: "Disabled", defaultValue: false },
    ],
  },
  {
    id: "radio-group",
    name: "Radio Group",
    description: "Single selection from multiple options in a list.",
    variants: [{ id: "default", name: "Default", description: "Use when someone needs to select exactly one option from a list." }],
    properties: [
      { name: "showLabel", type: "boolean", label: "Label/Prompt", defaultValue: true },
      { name: "hasError", type: "boolean", label: "Error State", defaultValue: false },
      { name: "showSupportingText", type: "boolean", label: "Supporting Text", defaultValue: false },
      { name: "disabled", type: "boolean", label: "Disabled", defaultValue: false },
    ],
  },
  {
    id: "section",
    name: "Section",
    description: "Layout primitive for vertical page sections with consistent spacing.",
    variants: [{ id: "default", name: "Default", description: "Section with configurable vertical padding" }],
    properties: [{ name: "size", type: "select", label: "Size", options: ["1", "2", "3", "4"], defaultValue: "3" }],
  },
  {
    id: "select",
    name: "Select",
    description: "Dropdown selection component with button trigger.",
    variants: [{ id: "default", name: "Default", description: "Standard select dropdown" }],
    properties: [
      { name: "size", type: "select", label: "Size", options: ["default", "small"], defaultValue: "default" },
      { name: "showLabel", type: "boolean", label: "Label/Prompt", defaultValue: false },
      { name: "hasError", type: "boolean", label: "Error State", defaultValue: false },
      { name: "disabled", type: "boolean", label: "Disabled", defaultValue: false },
    ],
  },
  {
    id: "switch",
    name: "Switch",
    description: "Toggle switch for binary on/off settings.",
    variants: [{ id: "default", name: "Default", description: "Standard toggle switch" }],
    properties: [
      { name: "size", type: "select", label: "Size", options: ["default", "small"], defaultValue: "default" },
      { name: "showLabel", type: "boolean", label: "Label", defaultValue: false },
      { name: "disabled", type: "boolean", label: "Disabled", defaultValue: false },
    ],
  },
  {
    id: "table",
    name: "Table",
    description: "Data table component powered by TanStack Table for displaying tabular data with sorting, filtering, and pagination capabilities.",
    variants: [
      { id: "default", name: "Default", description: "Basic data table with header and rows" },
      { id: "withTooltips", name: "With Tooltips", description: "Table headers with info icons that display tooltips on hover" },
      { id: "withSelection", name: "With Selection", description: "Checkbox column for selecting rows with select all support" },
      { id: "withActions", name: "With Actions", description: "Overflow menu button in the last column for row actions" },
      { id: "withEditable", name: "With Editable Cells", description: "Inline editable cells with popover editor" },
      { id: "withPagination", name: "With Pagination", description: "Table with pagination controls for navigating larger datasets" },
    ],
    properties: [],
    showVariantsOnPage: true,
  },
  {
    id: "tabs",
    name: "Tabs",
    description: "Tabbed navigation component for organizing content into sections.",
    variants: [{ id: "default", name: "Default", description: "Standard horizontal tabs" }],
    properties: [
      { name: "variant", type: "select", label: "Style", options: ["underline", "segmented"], defaultValue: "underline" },
      { name: "fullWidth", type: "boolean", label: "Full Width", defaultValue: false },
    ],
  },
  {
    id: "textarea",
    name: "Textarea",
    description: "Multi-line text input field for longer form content.",
    variants: [{ id: "default", name: "Default", description: "Standard textarea" }],
    properties: [
      { name: "size", type: "select", label: "Size", options: ["default", "small"], defaultValue: "default" },
      { name: "state", type: "select", label: "State", options: ["default", "error"], defaultValue: "default" },
      { name: "showLabel", type: "boolean", label: "Label/Prompt", defaultValue: false },
      { name: "required", type: "boolean", label: "Required", defaultValue: false },
      { name: "disabled", type: "boolean", label: "Disabled", defaultValue: false },
    ],
  },
  {
    id: "toast",
    name: "Toast",
    description: "Non-blocking notification that provides feedback to users. Appears from the top of the screen.",
    variants: [{ id: "default", name: "Default", description: "Toast notification" }],
    properties: [
      { name: "type", type: "select", label: "Type", options: ["default", "error"], defaultValue: "default" },
      { name: "showAction", type: "boolean", label: "Action Link", defaultValue: true },
      { name: "autoDismiss", type: "boolean", label: "Auto Dismiss (2s)", defaultValue: false },
    ],
  },
  {
    id: "tooltip",
    name: "Tooltip",
    description: "Contextual popup that displays additional information on hover or focus.",
    variants: [{ id: "default", name: "Default", description: "Standard tooltip with text content" }],
    properties: [],
  },
  {
    id: "map",
    name: "Map",
    description: "Google Maps component with Vibezz-branded styling. Displays locations with custom theme colors.",
    variants: [{ id: "default", name: "Default", description: "Interactive map with branded styling" }],
    properties: [
      { name: "zoom", type: "select", label: "Zoom Level", options: ["10", "12", "14", "16"], defaultValue: "12" },
      { name: "showControls", type: "boolean", label: "Show Controls", defaultValue: true },
      { name: "showMarker", type: "boolean", label: "Show Marker", defaultValue: true },
    ],
  },
  {
    id: "times-grid",
    name: "Times Grid",
    description: "Responsive availability grid for displaying provider appointment availability.",
    variants: [
      { id: "day-grid-default", name: "Day Timesgrid Default", description: "7-column grid showing available dates by day" },
      { id: "day-grid-mobile", name: "Day Timesgrid Mobile", description: "Horizontal scroll layout for mobile devices" },
      { id: "hour-grid-default", name: "Hour Timesgrid Default", description: "Hourly time slots with date header" },
      { id: "hour-grid-mobile", name: "Hour Timesgrid Mobile", description: "Horizontal scroll layout for hourly time slots" },
    ],
    properties: [],
    showVariantsOnPage: true,
  },
  {
    id: "times-grid-empty",
    name: "Times Grid - Empty State",
    description: "Empty state variants for the Times Grid when no availability exists.",
    variants: [
      { id: "next-availability", name: "Next Availability", description: "CTA button showing next available date" },
      { id: "no-availability", name: "No Availability", description: "Empty state message when no availability" },
      { id: "notify-me", name: "Notify Me", description: "Empty state with notify me button" },
    ],
    properties: [],
  },
];

// =============================================================================
// Design Tokens (loaded from CSS at runtime)
// =============================================================================

import { getDesignTokens, TOKEN_CATEGORIES, type TokenCategoryKey } from "./design-tokens.js";

// =============================================================================
// Layout Guidance Data
// =============================================================================

const layoutGuidance = {
  "page-structure": {
    description: "Every Vibezz page follows a Container > Header > Section structure.",
    pattern: `import { Container, Section, Header } from "@/components/vibezz"

export default function Page() {
  return (
    <Container size="default">
      <Header title="Page Title" />
      <Section size="3">
        {/* Content */}
      </Section>
    </Container>
  )
}`,
    containerSizes: {
      default: "max-w-[1440px] — Standard content width for most pages",
      wide: "No max-width — Full/fluid width for data-heavy layouts (tables, dashboards)",
      narrow: "max-w-[720px] — Focused content like forms, review flows, articles",
    },
    containerPadding: "px-4 sm:px-6 md:px-8 — Responsive horizontal padding (auto-applied by Container)",
    sectionSizes: {
      "1": "py-8 (32px) — Minimal, compact sections (form groups, tight content)",
      "2": "py-12 (48px) — Moderate spacing (between related content blocks)",
      "3": "py-20 (80px) — Standard section spacing (default, most sections)",
      "4": "py-32 (128px) — Large, prominent sections (hero, feature showcases)",
    },
    notes: [
      "Container centers itself horizontally with mx-auto by default",
      "Section renders a <section> element with vertical padding",
      "Header supports title, subbody, and right slot for action buttons",
    ],
  },
  breakpoints: {
    description: "Radix UI Themes breakpoints, min-width based. Always use mobile-first approach.",
    values: {
      xs: "520px — Phones (landscape). Tailwind: xs:",
      sm: "768px — Tablets (portrait). Tailwind: sm:",
      md: "1024px — Tablets (landscape). Tailwind: md:",
      lg: "1280px — Laptops. Tailwind: lg:",
      xl: "1640px — Desktops. Tailwind: xl:",
    },
    usage: [
      "Use mobile-first: start with base styles, then add sm:, md:, lg: overrides",
      "Most layouts need only 2-3 breakpoints (base + md + lg)",
      "Container padding is already responsive: px-4 sm:px-6 md:px-8",
    ],
  },
  responsive: {
    description: "Common responsive patterns used across Vibezz pages.",
    patterns: {
      stackToRow: {
        description: "Stack on mobile, row on tablet+",
        className: "flex flex-col md:flex-row gap-4",
      },
      hideOnMobile: {
        description: "Hidden on mobile, visible on tablet+",
        className: "hidden md:block",
      },
      responsiveGrid: {
        description: "Single column mobile, multi-column desktop",
        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
      },
      responsiveText: {
        description: "Smaller text on mobile, larger on desktop",
        className: "text-[20px] md:text-[28px] font-semibold",
      },
    },
    rules: [
      "Always design mobile-first, then layer in larger breakpoints",
      "Use flex-col → flex-row pattern for horizontal layouts that need to stack",
      "Use grid with responsive column counts for card layouts",
      "Container handles horizontal padding responsively — don't add extra px-*",
    ],
  },
  "grid-patterns": {
    description: "Common grid/flex layout compositions for page content.",
    patterns: {
      twoColumn: {
        description: "Even two-column grid, stacks on mobile",
        className: "grid grid-cols-1 md:grid-cols-2 gap-6",
        useCase: "Feature comparisons, side-by-side content",
      },
      threeColumn: {
        description: "Three-column grid for cards, stacks on mobile",
        className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
        useCase: "Card grids, feature showcases, team listings",
      },
      fourColumn: {
        description: "Four-column grid for compact items",
        className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
        useCase: "Stats, metric cards, icon grids",
      },
      sidebar: {
        description: "Fixed sidebar with fluid content area",
        className: "grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8",
        useCase: "Settings pages, docs, navigation-heavy layouts",
      },
      formLayout: {
        description: "Centered narrow form with vertical stacking",
        className: "flex flex-col gap-4 max-w-[560px] mx-auto",
        useCase: "Forms, onboarding flows, sign-up/login pages",
      },
      splitHero: {
        description: "50/50 split for hero with media",
        className: "grid grid-cols-1 lg:grid-cols-2 gap-8 items-center",
        useCase: "Landing page heroes, marketing sections",
      },
    },
  },
  "nav-patterns": {
    description: "Navigation component composition patterns.",
    patterns: {
      "logo-with-avatar": {
        description: "Standard authenticated layout",
        code: `<Nav
  variant="default"
  left={<Logo size="small" />}
  right={<AvatarWithFallback alt="User" fallback="U" size="40" />}
/>`,
      },
      "logo-with-actions": {
        description: "Marketing/public layout",
        code: `<Nav
  variant="default"
  left={<Logo size="small" />}
  right={<Button>Get started</Button>}
/>`,
      },
      "transparent-overlay": {
        description: "Transparent nav overlaying hero content",
        code: `<Nav
  variant="transparent"
  className="absolute top-0 left-0 right-0 z-10"
  left={<Logo size="small" />}
  right={<Button variant="ghost">Sign in</Button>}
/>`,
      },
    },
  },
};

// =============================================================================
// Page Starter Templates
// =============================================================================

const pageStarters: Record<string, { title: string; description: string; code: string }> = {
  default: {
    title: "Default Page",
    description: "Standard page layout with Nav, Container, Header, and Section. Best for general content pages.",
    code: `import { Container, Section, Header, Nav, Logo, Button } from "@/components/vibezz"

export default function Page() {
  return (
    <>
      <Nav
        variant="default"
        left={<Logo size="small" />}
        right={<Button>Get started</Button>}
      />
      <Container>
        <Header title="Page Title" />
        <Section size="3">
          {/* Your content here */}
        </Section>
      </Container>
    </>
  )
}`,
  },
  form: {
    title: "Form Page",
    description: "Narrow-centered form layout with transparent nav, form sections, and submit button. Best for long forms, onboarding, and review flows.",
    code: `import {
  Container,
  Section,
  Header,
  Nav,
  Logo,
  Icon,
  Button,
  TextField,
  TextareaField,
  RadioGroup,
  RadioField,
  Checkbox,
  Link,
} from "@/components/vibezz"

export default function FormPage() {
  return (
    <>
      <Nav
        variant="transparent"
        className="absolute top-0 left-0 right-0 z-10"
        left={<Logo size="small" />}
        right={
          <div className="flex items-center gap-2">
            <Icon name="lock" size="20" className="text-[var(--text-default)]" />
            <span className="text-[var(--font-size-body)] font-semibold text-[var(--text-default)]">Secure</span>
          </div>
        }
      />

      <main className="bg-[var(--background-default-white)]">
        <div className="w-full max-w-[560px] mx-auto px-4 sm:px-6 md:px-8 py-12 pt-[80px]">
          <Header title="Form Title" subbody="Complete the form below to continue." />

          <Section size="1">
            <div className="space-y-4">
              <h3 className="text-[18px] leading-[24px] font-semibold md:text-[20px] md:leading-[28px]">
                Section heading
              </h3>
              <TextField label="Full name" placeholder="Enter your full name" required />
              <TextField label="Email address" placeholder="Enter your email" type="email" required />
            </div>
          </Section>

          <hr className="border-[var(--stroke-default)]" />

          <Section size="1">
            <div className="space-y-4">
              <h3 className="text-[18px] leading-[24px] font-semibold md:text-[20px] md:leading-[28px]">
                Preferences
              </h3>
              <RadioGroup defaultValue="option1" className="space-y-2" required>
                <p className="text-[16px] leading-[26px] font-semibold">Select an option</p>
                <div className="flex flex-col gap-2">
                  <RadioField value="option1" label="Option 1" />
                  <RadioField value="option2" label="Option 2" />
                </div>
              </RadioGroup>
            </div>
          </Section>

          <hr className="border-[var(--stroke-default)]" />

          <Section size="1">
            <div className="space-y-4">
              <h3 className="text-[18px] leading-[24px] font-semibold md:text-[20px] md:leading-[28px]">
                Additional details
              </h3>
              <TextareaField label="Comments" placeholder="Enter any additional information" rows={4} />
            </div>
          </Section>

          <Section size="1" className="!pt-4">
            <div className="space-y-6">
              <div className="flex gap-3 items-start">
                <Checkbox id="terms" required />
                <label htmlFor="terms" className="text-[14px] leading-[20px] font-medium">
                  I agree to the <Link href="#" size="small">terms and conditions</Link>.
                </label>
              </div>
              <Button variant="primary" className="w-full justify-center">Submit</Button>
            </div>
          </Section>
        </div>
      </main>
    </>
  )
}`,
  },
  flow: {
    title: "Flow / Wizard Page",
    description: "Step-by-step flow with progress indicator and option cards. Best for multi-step wizards, onboarding, and guided selection.",
    code: `import {
  Flow,
  FlowHeader,
  FlowProgress,
  FlowContent,
  FlowQuestion,
  FlowOptions,
  FlowOption,
} from "@/starters/flow-page"

export default function FlowPage() {
  return (
    <Flow
      currentStep={1}
      totalSteps={3}
      onSkip={() => {}}
      skipLabel="Skip"
      className="min-h-screen"
    >
      <FlowHeader>
        <FlowProgress />
      </FlowHeader>
      <FlowContent>
        <FlowQuestion title="What type of care are you looking for?" />
        <FlowOptions>
          <FlowOption
            title="Annual physical / checkup"
            description="Comprehensive preventative examination to assess overall health"
            value="physical"
          />
          <FlowOption
            title="I need care for an issue, condition or problem"
            description="Find treatment for a new issue or ongoing care for a diagnosed condition"
            value="issue"
          />
        </FlowOptions>
      </FlowContent>
    </Flow>
  )
}`,
  },
  table: {
    title: "Table / Data Page",
    description: "Data-heavy page with Nav, Header with action button, filter bar, data table, and pagination. Best for admin panels, dashboards, and list views.",
    code: `import {
  Container,
  Header,
  Nav,
  Logo,
  Button,
  Icon,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  AvatarWithFallback,
  Pagination,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/vibezz"

export default function TablePage() {
  return (
    <>
      <Nav
        variant="default"
        left={<Logo size="small" />}
        right={<AvatarWithFallback alt="User" fallback="U" size="40" />}
      />
      <Container>
        <div className="py-12">
          <Header
            title="Providers"
            right={
              <Button>
                <Icon name="add" size="20" />
                Add provider
              </Button>
            }
          />

          {/* Filter bar */}
          <div className="mt-8 flex items-center gap-4">
            <Input size="small" placeholder="Search by name" className="w-[200px]" />
            <Select size="small">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="primary">Primary Care</SelectItem>
                <SelectItem value="specialist">Specialist</SelectItem>
              </SelectContent>
            </Select>
            <Select size="small">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data table */}
          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <AvatarWithFallback alt="Dr. Chen" fallback="SC" size="40" />
                      <div>
                        <div className="text-[14px] font-medium text-[var(--text-default)]">Dr. Sarah Chen</div>
                        <div className="text-[12px] text-[var(--text-whisper)]">sarah.chen@example.com</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>Primary Care</TableCell>
                  <TableCell><Badge variant="positive">Active</Badge></TableCell>
                </TableRow>
                {/* Add more rows as needed */}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6">
            <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
          </div>
        </div>
      </Container>
    </>
  )
}`,
  },
};

// =============================================================================
// Code Generation
// =============================================================================

function generateComponentCode(componentId: string, variant?: string, props?: Record<string, unknown>): string {
  const component = componentRegistry.find((c) => c.id === componentId);
  if (!component) {
    return `// Component "${componentId}" not found`;
  }

  const componentName = component.name;
  const importPath = "@/components/vibezz";

  // Generate props string
  const propsEntries = props ? Object.entries(props).filter(([, v]) => v !== undefined && v !== "") : [];
  const propsStr = propsEntries
    .map(([key, value]) => {
      if (typeof value === "boolean") {
        return value ? key : `${key}={false}`;
      }
      return `${key}="${value}"`;
    })
    .join("\n  ");

  const propsBlock = propsStr ? `\n  ${propsStr}\n` : "";

  // Component-specific code templates
  switch (componentId) {
    case "button":
      if (variant === "icon") {
        return `import { IconButton } from "${importPath}"

<IconButton
  icon="close"
  aria-label="Close"${propsBlock}/>`;
      }
      return `import { Button } from "${importPath}"

<Button${propsBlock}>
  Button label
</Button>`;

    case "input":
      return `import { TextField } from "${importPath}"

<TextField
  label="Label"
  placeholder="Enter value..."${propsBlock}/>`;

    case "select":
      return `import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "${importPath}"

<Select${propsBlock}>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>`;

    case "dialog":
      return `import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "${importPath}"
import { Button } from "${importPath}"

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        This is a dialog description.
      </DialogDescription>
    </DialogHeader>
    <div className="py-4">
      <p>Dialog body content goes here.</p>
    </div>
    <DialogFooter>
      <Button variant="secondary">Cancel</Button>
      <Button variant="primary">Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`;

    case "drawer":
      return `import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerBody,
  DrawerTitle,
  DrawerTrigger,
} from "${importPath}"
import { Button } from "${importPath}"

<Drawer>
  <DrawerTrigger asChild>
    <Button>Open Drawer</Button>
  </DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Drawer Title</DrawerTitle>
      <DrawerDescription>
        This is a drawer description.
      </DrawerDescription>
    </DrawerHeader>
    <DrawerBody>
      <p>Drawer body content goes here.</p>
    </DrawerBody>
    <DrawerFooter>
      <Button variant="secondary">Cancel</Button>
      <Button variant="primary">Confirm</Button>
    </DrawerFooter>
  </DrawerContent>
</Drawer>`;

    case "tabs":
      return `import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "${importPath}"

<Tabs defaultValue="tab1">
  <TabsList${props?.variant ? ` variant="${props.variant}"` : ""}>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
    <TabsTrigger value="tab3">Tab 3</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content for Tab 1</TabsContent>
  <TabsContent value="tab2">Content for Tab 2</TabsContent>
  <TabsContent value="tab3">Content for Tab 3</TabsContent>
</Tabs>`;

    case "icon":
      return `import { Icon } from "${importPath}"

<Icon
  name="settings"${propsBlock}/>`;

    case "toast":
      return `import { useToast, ToastAction } from "${importPath}"

function MyComponent() {
  const { toast } = useToast()
  
  const showToast = () => {
    toast({
      title: "Toast heading",
      description: "Toast description text.",
      action: <ToastAction altText="Undo">Undo</ToastAction>,
    })
  }
  
  return <Button onClick={showToast}>Show Toast</Button>
}`;

    default:
      return `import { ${componentName} } from "${importPath}"

<${componentName}${propsBlock}/>`;
  }
}

// =============================================================================
// Tool Handlers
// =============================================================================

export async function handleListTools() {
  return {
    tools: [
      {
        name: "list_components",
        description: "List all available Vibezz UI components with descriptions. Use this to discover what components are available.",
        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              description: "Optional filter by category: 'forms', 'layout', 'feedback', 'display', 'overlay', 'navigation'",
            },
          },
        },
      },
      {
        name: "get_component",
        description: "Get detailed information about a specific Vibezz component including all props, variants, and usage examples.",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Component ID (e.g., 'button', 'dialog', 'input', 'table')",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "get_component_code",
        description: "Generate ready-to-use code for a Vibezz component with specific props and variant.",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Component ID",
            },
            variant: {
              type: "string",
              description: "Variant ID (e.g., 'default', 'withIcon')",
            },
            props: {
              type: "object",
              description: "Props to apply to the component",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "search_components",
        description: "Search for components by keyword, description, or use case.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query (e.g., 'form input', 'modal', 'notification', 'toggle')",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "get_design_tokens",
        description:
          "Get Vibezz design tokens parsed directly from tokens.css. Returns CSS variables grouped by category. Categories: base-colors, core, text, icon, background, stroke, state, typography, component-tokens, breakpoints, spacing, all.",
        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: TOKEN_CATEGORIES as unknown as string[],
              description: "Token category to retrieve. Use 'all' for the complete token set.",
            },
          },
        },
      },
      {
        name: "get_layout_guidance",
        description:
          "Get layout patterns, page structure, responsive breakpoints, grid compositions, and nav patterns for building Vibezz pages.",
        inputSchema: {
          type: "object",
          properties: {
            topic: {
              type: "string",
              enum: [
                "page-structure",
                "breakpoints",
                "responsive",
                "grid-patterns",
                "nav-patterns",
                "all",
              ],
              description:
                "Layout topic: page-structure (Container/Header/Section), breakpoints (Radix breakpoints), responsive (mobile-first patterns), grid-patterns (2-col, 3-col, sidebar), nav-patterns (Nav compositions), all.",
            },
          },
        },
      },
      {
        name: "get_page_starter",
        description:
          "Get a complete, copy-pasteable page template for a common layout. Available starters: default, form, flow, table.",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              enum: ["default", "form", "flow", "table"],
              description: "Starter template ID",
            },
          },
          required: ["id"],
        },
      },
    ],
  };
}

// Category mappings for filtering
const componentCategories: Record<string, string[]> = {
  forms: ["input", "textarea", "select", "checkbox", "radio", "radio-group", "radio-cards", "switch"],
  layout: ["container", "section", "header", "nav", "accordion"],
  feedback: ["toast", "progress", "flag"],
  display: ["badge", "avatar", "icon", "logo", "table", "times-grid", "times-grid-empty", "map"],
  overlay: ["dialog", "drawer", "popover", "tooltip"],
  navigation: ["tabs", "pagination", "link", "button"],
};

export async function handleCallTool(request: { params: { name: string; arguments?: Record<string, unknown> } }) {
  const { name, arguments: args = {} } = request.params;

  switch (name) {
    case "list_components": {
      let components = componentRegistry;
      
      // Filter by category if provided
      const category = args.category as string | undefined;
      if (category && componentCategories[category]) {
        const categoryIds = componentCategories[category];
        components = components.filter((c) => categoryIds.includes(c.id));
      }
      
      const result = components.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        hasVariants: c.variants.length > 0,
        variantCount: c.variants.length,
      }));
      
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }

    case "get_component": {
      const id = args.id as string;
      const component = componentRegistry.find((c) => c.id === id);
      
      if (!component) {
        return {
          content: [{ type: "text", text: `Component "${id}" not found. Use list_components to see available components.` }],
          isError: true,
        };
      }
      
      const result = {
        ...component,
        importStatement: `import { ${component.name} } from "@/components/vibezz"`,
        filePath: `src/components/vibezz/${component.id}.tsx`,
        usage: generateComponentCode(component.id),
      };
      
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }

    case "get_component_code": {
      const id = args.id as string;
      const variant = args.variant as string | undefined;
      const props = args.props as Record<string, unknown> | undefined;
      
      const code = generateComponentCode(id, variant, props);
      
      return {
        content: [{ type: "text", text: code }],
      };
    }

    case "search_components": {
      const query = (args.query as string).toLowerCase();
      
      const matches = componentRegistry.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query) ||
          c.variants.some((v) => v.name.toLowerCase().includes(query) || v.description?.toLowerCase().includes(query))
      );
      
      if (matches.length === 0) {
        return {
          content: [{ type: "text", text: `No components found matching "${query}". Try a different search term.` }],
        };
      }
      
      const result = matches.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        matchedVariants: c.variants
          .filter((v) => v.name.toLowerCase().includes(query) || v.description?.toLowerCase().includes(query))
          .map((v) => v.name),
      }));
      
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }

    case "get_design_tokens": {
      const category = args.category as TokenCategoryKey | undefined;

      try {
        const result = getDesignTokens(category);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch {
        return {
          content: [
            {
              type: "text",
              text: `Unknown token category "${category}". Valid categories: ${TOKEN_CATEGORIES.join(", ")}`,
            },
          ],
          isError: true,
        };
      }
    }

    case "get_layout_guidance": {
      const topic = args.topic as string | undefined;

      if (topic && topic !== "all") {
        const data = layoutGuidance[topic as keyof typeof layoutGuidance];
        if (!data) {
          return {
            content: [
              {
                type: "text",
                text: `Unknown layout topic "${topic}". Valid topics: page-structure, breakpoints, responsive, grid-patterns, nav-patterns, all`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(layoutGuidance, null, 2) }],
      };
    }

    case "get_page_starter": {
      const id = args.id as string;
      const starter = pageStarters[id];

      if (!starter) {
        return {
          content: [
            {
              type: "text",
              text: `Unknown page starter "${id}". Available starters: ${Object.keys(pageStarters).join(", ")}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `# ${starter.title}\n\n${starter.description}\n\n\`\`\`tsx\n${starter.code}\n\`\`\``,
          },
        ],
      };
    }

    default:
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }
}
