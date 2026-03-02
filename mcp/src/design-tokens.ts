/**
 * Vibezz Design Tokens
 *
 * Parses tokens directly from src/styles/tokens.css at startup
 * so the MCP server always serves the real source of truth.
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// =============================================================================
// Types
// =============================================================================

export interface TokenCategory {
  description: string;
  tokens: Record<string, string>;
}

export interface DesignTokens {
  "base-colors": TokenCategory;
  core: TokenCategory;
  text: TokenCategory;
  icon: TokenCategory;
  background: TokenCategory;
  stroke: TokenCategory;
  state: TokenCategory;
  typography: TokenCategory;
  "component-tokens": TokenCategory;
  breakpoints: TokenCategory;
  spacing: TokenCategory;
}

// =============================================================================
// CSS parser — extract custom properties from :root block
// =============================================================================

function parseCSSVariables(css: string): Record<string, string> {
  const vars: Record<string, string> = {};
  // Match everything inside the first :root { ... } block
  const rootMatch = css.match(/:root\s*\{([\s\S]*?)\n\}/);
  if (!rootMatch) return vars;

  const block = rootMatch[1];
  const propRegex = /--([\w-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = propRegex.exec(block)) !== null) {
    vars[`--${match[1]}`] = match[2].trim();
  }
  return vars;
}

function categorize(allVars: Record<string, string>): DesignTokens {
  const buckets: Record<string, Record<string, string>> = {
    "base-colors": {},
    core: {},
    text: {},
    icon: {},
    background: {},
    stroke: {},
    state: {},
    typography: {},
    "component-tokens": {},
    breakpoints: {},
  };

  for (const [name, value] of Object.entries(allVars)) {
    const key = name.slice(2); // remove leading --

    if (key.startsWith("color-")) {
      buckets["base-colors"][name] = value;
    } else if (key.startsWith("core-")) {
      buckets.core[name] = value;
    } else if (key.startsWith("text-")) {
      buckets.text[name] = value;
    } else if (key.startsWith("icon-")) {
      buckets.icon[name] = value;
    } else if (key.startsWith("background-")) {
      buckets.background[name] = value;
    } else if (key.startsWith("stroke-")) {
      buckets.stroke[name] = value;
    } else if (key.startsWith("state-")) {
      buckets.state[name] = value;
    } else if (
      key.startsWith("font-") ||
      key.startsWith("line-height-") ||
      key.startsWith("letter-spacing-")
    ) {
      buckets.typography[name] = value;
    } else if (key.startsWith("breakpoint-")) {
      buckets.breakpoints[name] = value;
    } else if (
      key.startsWith("radius-") ||
      key.startsWith("button-")
    ) {
      buckets["component-tokens"][name] = value;
    }
  }

  return {
    "base-colors": {
      description:
        "Primitive color scale — the raw palette. Do NOT use these directly in UI; use semantic tokens instead.",
      tokens: buckets["base-colors"],
    },
    core: {
      description:
        "Core brand colors (yellow, charcoal, white). Used for primary brand surfaces.",
      tokens: buckets.core,
    },
    text: {
      description:
        "Text color tokens. Use var(--text-default) for primary text, var(--text-whisper) for muted, etc.",
      tokens: buckets.text,
    },
    icon: {
      description:
        "Icon color tokens. Apply via className text-[var(--icon-default)] or inline style.",
      tokens: buckets.icon,
    },
    background: {
      description:
        "Background color tokens including semantic (success, error, callout) and brand variants.",
      tokens: buckets.background,
    },
    stroke: {
      description:
        "Border/stroke tokens for dividers, inputs, and outlines.",
      tokens: buckets.stroke,
    },
    state: {
      description:
        "Interactive state tokens — hover, pressed, selected, and dark-mode variants.",
      tokens: buckets.state,
    },
    typography: {
      description:
        "Font family, weights, sizes, line heights, and letter spacing. Sharp Sans has two weights: medium (500) and semibold (600). NEVER use font-bold.",
      tokens: buckets.typography,
    },
    "component-tokens": {
      description:
        "Component-specific tokens such as border radius and button sizing.",
      tokens: buckets["component-tokens"],
    },
    breakpoints: {
      description:
        "Responsive breakpoints (Radix UI Themes, min-width). Use with Tailwind: xs:, sm:, md:, lg:, xl:.",
      tokens: buckets.breakpoints,
    },
    spacing: {
      description:
        "Spacing uses standard Tailwind scale. These are recommended pairings, not CSS variables.",
      tokens: {
        "gap-1 / p-1": "4px (0.25rem) — Tight spacing, icon gaps",
        "gap-2 / p-2": "8px (0.5rem) — Small gaps, compact padding",
        "gap-3 / p-3": "12px (0.75rem) — Medium-small spacing",
        "gap-4 / p-4": "16px (1rem) — Standard spacing, card padding",
        "gap-5 / p-5": "20px (1.25rem) — Medium spacing",
        "gap-6 / p-6": "24px (1.5rem) — Large spacing, section gaps",
        "gap-8 / p-8": "32px (2rem) — Extra large spacing",
        "gap-10 / p-10": "40px (2.5rem) — Section padding",
        "gap-12 / p-12": "48px (3rem) — Large section spacing",
        "gap-16 / p-16": "64px (4rem) — Page section gaps",
      },
    },
  };
}

// =============================================================================
// Load & cache tokens at startup
// =============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve path relative to the compiled dist/ folder → ../../src/styles/tokens.css
const TOKENS_CSS_PATH = resolve(__dirname, "../../src/styles/tokens.css");

let cachedCSS: string | null = null;
let cachedTokens: DesignTokens | null = null;

function loadCSS(): string {
  if (!cachedCSS) {
    cachedCSS = readFileSync(TOKENS_CSS_PATH, "utf-8");
  }
  return cachedCSS;
}

function loadTokens(): DesignTokens {
  if (!cachedTokens) {
    const css = loadCSS();
    const allVars = parseCSSVariables(css);
    cachedTokens = categorize(allVars);
  }
  return cachedTokens;
}

// =============================================================================
// Public API
// =============================================================================

/** All valid token category keys */
export const TOKEN_CATEGORIES = [
  "base-colors",
  "core",
  "text",
  "icon",
  "background",
  "stroke",
  "state",
  "typography",
  "component-tokens",
  "breakpoints",
  "spacing",
  "all",
] as const;

export type TokenCategoryKey = (typeof TOKEN_CATEGORIES)[number];

/**
 * Get all design tokens or a specific category.
 */
export function getDesignTokens(
  category?: TokenCategoryKey
): DesignTokens | TokenCategory {
  const tokens = loadTokens();
  if (category && category !== "all") {
    return tokens[category as keyof DesignTokens];
  }
  return tokens;
}

/**
 * Get the raw CSS content of tokens.css
 */
export function getRawTokensCSS(): string {
  return loadCSS();
}
