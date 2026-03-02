#!/bin/bash
#
# Vibezz MCP Server Setup Script
#
# Builds the MCP server and configures it for your AI tool.
#
# Usage:
#   npm run setup:mcp              # Auto-detect or configure all supported tools
#   npm run setup:mcp -- cursor    # Configure for Cursor only
#   npm run setup:mcp -- claude    # Configure for Claude Code only
#   npm run setup:mcp -- all       # Configure for all supported tools
#

set -e

TOOL="${1:-}"

echo "Setting up Vibezz MCP Server..."
echo ""

# Get the absolute path to the project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MCP_DIR="$PROJECT_ROOT/mcp"

# Check if we're in the right directory
if [ ! -f "$MCP_DIR/package.json" ]; then
    echo "Error: mcp/package.json not found"
    echo "Please run this script from the Vibezz project root"
    exit 1
fi

# Step 1: Install MCP server dependencies
echo "Installing MCP server dependencies..."
cd "$MCP_DIR"
npm install

# Step 2: Build the MCP server
echo ""
echo "Building MCP server..."
npm run build

# Step 3: Configure for the requested tool(s)
echo ""

configure_cursor() {
    echo "Configuring for Cursor..."
    CURSOR_CONFIG_DIR="$PROJECT_ROOT/.cursor"
    MCP_CONFIG_FILE="$CURSOR_CONFIG_DIR/mcp.json"
    mkdir -p "$CURSOR_CONFIG_DIR"
    cat > "$MCP_CONFIG_FILE" << EOF
{
  "mcpServers": {
    "vibezz": {
      "command": "node",
      "args": ["$MCP_DIR/dist/index.js"]
    }
  }
}
EOF
    echo "  Created .cursor/mcp.json"
}

configure_claude() {
    echo "Configuring for Claude Code..."
    MCP_CONFIG_FILE="$PROJECT_ROOT/.mcp.json"
    cat > "$MCP_CONFIG_FILE" << EOF
{
  "mcpServers": {
    "vibezz": {
      "command": "node",
      "args": ["$MCP_DIR/dist/index.js"]
    }
  }
}
EOF
    echo "  Created .mcp.json"
}

configure_all() {
    configure_cursor
    configure_claude
}

# Determine which tool to configure
case "$TOOL" in
    cursor)
        configure_cursor
        ;;
    claude)
        configure_claude
        ;;
    all)
        configure_all
        ;;
    "")
        # Default: configure all supported tools
        configure_all
        ;;
    *)
        echo "Unknown tool: $TOOL"
        echo ""
        echo "Usage: npm run setup:mcp -- [cursor|claude|all]"
        echo ""
        echo "  cursor   Configure for Cursor"
        echo "  claude   Configure for Claude Code"
        echo "  all      Configure for all supported tools (default)"
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Vibezz MCP Server setup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

case "$TOOL" in
    cursor)
        echo "Restart Cursor to activate the MCP server."
        echo ""
        echo "  On Mac: Cmd+Shift+P > 'Reload Window'"
        echo "  Or just quit and reopen Cursor"
        ;;
    claude)
        echo "The MCP server is ready for Claude Code."
        echo "Start a new Claude Code session to pick up the configuration."
        ;;
    *)
        echo "Next steps by tool:"
        echo ""
        echo "  Cursor:     Restart Cursor (Cmd+Shift+P > 'Reload Window')"
        echo "  Claude Code: Start a new session to pick up .mcp.json"
        echo "  Codex:      Configure your tool to use: node $MCP_DIR/dist/index.js"
        echo "  Other:      Point your MCP client at: node $MCP_DIR/dist/index.js"
        ;;
esac

echo ""
echo "Try asking your AI assistant:"
echo ""
echo "  'What components does Vibezz have for forms?'"
echo "  'Show me how to use the Dialog component'"
echo "  'Generate a Button with destructive variant'"
echo ""
