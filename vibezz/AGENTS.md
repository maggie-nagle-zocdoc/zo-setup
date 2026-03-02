# Vibezz Design System — Codex / AI Agents

Read and follow all instructions in [INSTRUCTIONS.md](INSTRUCTIONS.md).

## Key Rules

- **NEVER** modify files in `src/components/vibezz/` unless explicitly asked
- **NEVER** create custom components — use existing Vibezz components
- **NEVER** use `font-bold` — only `font-semibold` and `font-medium`
- **NEVER** use hardcoded hex colors — use CSS variables
- **ALWAYS** import from `@/components/vibezz`
- **ALWAYS** query the MCP server when unsure about a component

## MCP Server

The Vibezz MCP server gives you deep knowledge of all 40+ components, their props, variants, and design tokens. If it's not already configured, build it first:

```bash
cd mcp && npm install && npm run build
```

Then configure your tool to use the server. It's a standard stdio MCP server:

```
command: node
args: ./mcp/dist/index.js
```

## Available MCP Tools

| Tool | What It Does |
|------|--------------|
| `list_components` | Discover all available components |
| `get_component` | Get detailed props, variants, and usage |
| `get_component_code` | Generate ready-to-use code snippets |
| `search_components` | Find components by keyword or use case |
| `get_design_tokens` | Access colors, typography, spacing |
