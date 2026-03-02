# Vibezz UI

A React component library built with Radix UI primitives and Tailwind CSS — with **built-in AI assistance** via an MCP server for Cursor, Claude Code, Codex, and any MCP-compatible AI tool.

## Why Vibezz?

Vibezz isn't just a component library. It's designed for **AI-assisted development**:

- **40+ components** for rapid prototyping with consistent design tokens
- **MCP Server** — your AI assistant understands your components, props, and patterns
- **Guardrailed AI** — built-in rules ensure AI generates code using Vibezz components correctly
- **Works with any AI tool** — Cursor, Claude Code, Codex, and any MCP-compatible assistant
- **Zero configuration** — Install and start building

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start building.

---

## AI Integration Setup

Vibezz includes an MCP server that gives your AI assistant deep knowledge of all components, their props, variants, and design tokens.

### Cursor

```bash
npm run setup:mcp
```

Then restart Cursor (Cmd+Shift+P > "Reload Window" or quit and reopen).

Or just ask Cursor to do it for you:

> Set up the Vibezz MCP server by running \`npm run setup:mcp\`, then tell me to restart Cursor.

### Claude Code

```bash
npm run setup:mcp
```

Or add the server manually:

```bash
claude mcp add vibezz -- node ./mcp/dist/index.js
```

### Codex

Build the MCP server, then configure your tool to use it:

```bash
cd mcp && npm install && npm run build
```

The server is a standard stdio MCP server:
```
command: node
args: ./mcp/dist/index.js
```

### Other MCP-Compatible Tools

The Vibezz MCP server implements the [Model Context Protocol](https://modelcontextprotocol.io) standard. Any MCP-compatible tool can connect to it via stdio transport.

## What's Included

| Feature | Description |
|---------|-------------|
| **40+ UI Components** | Buttons, forms, dialogs, tables, and more |
| **MCP Server** | Gives AI assistants deep knowledge of all components |
| **AI Rules** | Guardrails for Cursor, Claude Code, and Codex |
| **Design Tokens** | Consistent colors, spacing, and typography |
| **Page Starters** | Ready-to-use page templates |
| **Sharp Sans Font** | Pre-configured custom typography |
| **Material Symbols** | Icon font already set up |

## MCP Server

The MCP (Model Context Protocol) server is what makes Vibezz AI-native. It exposes:

| Tool | What It Does |
|------|--------------|
| \`list_components\` | Discover all available components |
| \`get_component\` | Get detailed props, variants, and usage |
| \`get_component_code\` | Generate ready-to-use code snippets |
| \`search_components\` | Find components by keyword or use case |
| \`get_design_tokens\` | Access colors, typography, spacing |

**Example prompts after setup:**
- "What form components does Vibezz have?"
- "Show me how to use the Dialog component"
- "Generate a destructive button with small size"
- "What are the typography tokens?"

See \`mcp/README.md\` for detailed documentation.

## Using Components

```tsx
import { Button, TextField, Icon } from "@/components/vibezz";

<Button variant="primary">Click me</Button>
<TextField label="Email" placeholder="you@example.com" />
<Icon name="search" />
```

## Components

- **Buttons:** Button, IconButton, Link
- **Forms:** TextField, TextareaField, SelectField, Checkbox, RadioGroup, Switch
- **Feedback:** Toast, Toaster, Flag, Progress
- **Overlays:** Dialog, Drawer, Popover, Tooltip
- **Layout:** Container, Section, Header, Nav
- **Data:** Table, DataTable, Tabs, Accordion
- **Display:** Avatar, Badge, Icon, Logo

## Icons

This starter uses [Material Symbols Rounded](https://fonts.google.com/icons?icon.set=Material+Symbols) icons:

```tsx
import { Icon } from "@/components/vibezz";

<Icon name="home" />
<Icon name="settings" size="large" />
<Icon name="favorite" filled />
```

Browse available icons: https://fonts.google.com/icons?icon.set=Material+Symbols

## Project Structure

```
src/
├── app/                   # Next.js app (edit page.tsx!)
├── components/vibezz/     # All Vibezz components
├── lib/utils.ts           # Utility functions
├── hooks/                 # React hooks
├── styles/tokens.css      # Design tokens
├── fonts/                 # Sharp Sans fonts
└── starters/              # Page templates
mcp/                       # MCP server for AI assistants
scripts/                   # Setup scripts
INSTRUCTIONS.md            # AI coding guidelines (shared across all tools)
CLAUDE.md                  # Claude Code configuration
AGENTS.md                  # Codex / AI agent configuration
.cursorrules               # Cursor configuration
```

## Documentation

Visit the [Vibezz documentation site](https://vibezz.zocdoc.net) for full component documentation and examples.

## License

MIT
