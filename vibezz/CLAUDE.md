# Vibezz Design System — Claude Code

Read and follow all instructions in [INSTRUCTIONS.md](INSTRUCTIONS.md).

## Key Rules

- **NEVER** modify files in `src/components/vibezz/` unless explicitly asked
- **NEVER** create custom components — use existing Vibezz components
- **NEVER** use `font-bold` — only `font-semibold` and `font-medium`
- **NEVER** use hardcoded hex colors — use CSS variables
- **ALWAYS** import from `@/components/vibezz`
- **ALWAYS** query the MCP server when unsure about a component
- **ALWAYS** maximize use of Vibezz components when building UI. Before reaching for raw HTML elements or custom markup, check if an existing Vibezz component covers the need (e.g. use `Table`/`DataTable` for lists, `Badge` for status labels, `Flag` for banners, `Tabs` for view switching, `Dialog`/`Drawer` for overlays, etc.). The design system has 40+ components — use them.

## MCP Server

The Vibezz MCP server gives you deep knowledge of all 40+ components, their props, variants, and design tokens. If it's not already configured, set it up:

```bash
npm run setup:mcp
```

Or add it manually by creating `.mcp.json` in the project root:

```json
{
  "mcpServers": {
    "vibezz": {
      "command": "node",
      "args": ["./mcp/dist/index.js"]
    }
  }
}
```

Or via the CLI:

```bash
claude mcp add vibezz -- node ./mcp/dist/index.js
```

## Available MCP Tools

| Tool | What It Does |
|------|--------------|
| `list_components` | Discover all available components |
| `get_component` | Get detailed props, variants, and usage |
| `get_component_code` | Generate ready-to-use code snippets |
| `search_components` | Find components by keyword or use case |
| `get_design_tokens` | Access colors, typography, spacing |
