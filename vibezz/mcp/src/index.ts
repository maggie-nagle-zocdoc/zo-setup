#!/usr/bin/env node
/**
 * Vibezz MCP Server
 *
 * Exposes Vibezz component registry, design tokens, and code generation
 * to Cursor AI via the Model Context Protocol.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { handleListTools, handleCallTool } from "./tools.js";
import { handleListResources, handleReadResource } from "./resources.js";

const server = new Server(
  {
    name: "vibezz",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Tool handlers - for querying and generating code
server.setRequestHandler(ListToolsRequestSchema, handleListTools);
server.setRequestHandler(CallToolRequestSchema, handleCallTool);

// Resource handlers - for accessing catalog, tokens, rules
server.setRequestHandler(ListResourcesRequestSchema, handleListResources);
server.setRequestHandler(ReadResourceRequestSchema, handleReadResource);

// Start server with stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Vibezz MCP server running on stdio");
}

main().catch((error) => {
  console.error("Failed to start Vibezz MCP server:", error);
  process.exit(1);
});
