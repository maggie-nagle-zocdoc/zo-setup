# Vibezz MCP Server

An MCP (Model Context Protocol) server that exposes the Vibezz component library, design tokens, and coding patterns to AI assistants for enhanced development assistance.

## What is MCP?

MCP (Model Context Protocol) is an open protocol that allows AI assistants to access external tools and data sources. This server gives your AI tool structured access to:

- **Component Registry** — All 40+ Vibezz components with props, variants, and descriptions
- **Design Tokens** — Colors, typography, and spacing values
- **Code Generation** — Ready-to-use code snippets for any component
- **UI Patterns** — Common patterns mapped to Vibezz components
- **Coding Rules** — Best practices for using the design system

## Quick Setup

From the project root, run:

```bash
npm run setup:mcp
```

This will:
1. Install dependencies
2. Build the MCP server
3. Configure it for your AI tool (Cursor, Claude Code, or both)

You can also target a specific tool:

```bash
npm run setup:mcp -- cursor    # Cursor only
npm run setup:mcp -- claude    # Claude Code only
npm run setup:mcp -- all       # All supported tools (default)
```

## Manual Setup

### 1. Build the server

```bash
cd mcp
npm install
npm run build
```

### 2. Configure your AI tool

#### Cursor

Create or edit `.cursor/mcp.json` in the project root:

```json
{
  "mcpServers": {
    "vibezz": {
      "command": "node",
      "args": ["/absolute/path/to/vibezz/mcp/dist/index.js"]
    }
  }
}
```

Then restart Cursor.

#### Claude Code

Create `.mcp.json` in the project root:

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

Or use the CLI:

```bash
claude mcp add vibezz -- node ./mcp/dist/index.js
```

#### Codex / Other MCP-Compatible Tools

The server uses stdio transport. Point your tool at:

```
command: node
args: ./mcp/dist/index.js
```

## Available Tools

Once configured, your AI assistant can use these tools:

| Tool | Description |
|------|-------------|
| `list_components` | List all Vibezz components, optionally filtered by category |
| `get_component` | Get detailed info about a specific component |
| `get_component_code` | Generate usage code with specific props |
| `search_components` | Search components by keyword or use case |
| `get_design_tokens` | Get colors, typography, or spacing tokens |

## Available Resources

The server also exposes these read-only resources:

| Resource | URI | Description |
|----------|-----|-------------|
| Component Catalog | `vibezz://catalog` | Full component registry as JSON |
| Design Tokens | `vibezz://tokens` | All design token values |
| Coding Rules | `vibezz://rules` | AI coding guidelines |
| UI Patterns | `vibezz://patterns` | Pattern-to-component mappings |

## Example Usage

After setup, try asking your AI assistant:

- "What form components does Vibezz have?"
- "Show me how to use the Dialog component"
- "Generate a Button with destructive variant and small size"
- "What are the Vibezz typography tokens?"
- "Search for components related to notifications"

## Development

### Rebuild after changes

```bash
npm run build:mcp
```

### Run in watch mode

```bash
cd mcp
npm run dev
```

### Test the server directly

```bash
cd mcp
npm start
```

The server communicates via stdio, so you'll see JSON-RPC messages.

## Project Structure

```
mcp/
├── src/
│   ├── index.ts          # Server entry point
│   ├── tools.ts          # Tool handlers + component registry
│   ├── resources.ts      # Resource handlers
│   └── design-tokens.ts  # Token definitions
├── dist/                 # Compiled output (gitignored)
├── package.json
├── tsconfig.json
└── README.md
```

## Keeping in Sync

The component registry in `mcp/src/tools.ts` is a copy of `src/lib/component-registry.ts`. When components are added or modified in the main library, update the MCP server's registry to match.

## Troubleshooting

### Server not appearing in your AI tool

1. Ensure the server is built (`npm run build:mcp`)
2. Check that the MCP config file exists and has the correct path:
   - Cursor: `.cursor/mcp.json`
   - Claude Code: `.mcp.json`
3. Restart your AI tool completely

### Tools not working

1. Check your tool's MCP logs for errors
2. Verify the server starts: `cd mcp && npm start`
3. Look for TypeScript errors: `cd mcp && npm run build`

### Path issues

The setup script uses absolute paths for Cursor and relative paths for Claude Code. If you move the project, run `npm run setup:mcp` again to update the configuration.
