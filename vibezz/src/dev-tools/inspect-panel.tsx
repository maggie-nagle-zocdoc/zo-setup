"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import {
  getFiberFromDom,
  getComponentAncestry,
  getSafeProps,
  getComponentName,
  type ComponentAncestor,
} from "./fiber-utils"

// ---------------------------------------------------------------------------
// Style extraction
// ---------------------------------------------------------------------------

const STYLE_GROUPS = [
  {
    label: "Layout",
    keys: ["display", "position", "width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight"],
  },
  {
    label: "Spacing",
    keys: ["padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "margin", "marginTop", "marginRight", "marginBottom", "marginLeft"],
  },
  {
    label: "Typography",
    keys: ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "color"],
  },
  {
    label: "Flex / Grid",
    keys: ["flexDirection", "flexWrap", "alignItems", "justifyContent", "gap", "gridTemplateColumns", "gridTemplateRows"],
  },
  {
    label: "Visual",
    keys: ["backgroundColor", "borderRadius", "border", "boxShadow", "opacity", "overflow"],
  },
] as const

function getRelevantStyles(el: Element): { label: string; entries: [string, string][] }[] {
  const computed = getComputedStyle(el)
  const groups: { label: string; entries: [string, string][] }[] = []

  for (const group of STYLE_GROUPS) {
    const entries: [string, string][] = []
    for (const key of group.keys) {
      const value = computed.getPropertyValue(camelToKebab(key))
      if (value && value !== "none" && value !== "normal" && value !== "auto" && value !== "0px" && value !== "rgba(0, 0, 0, 0)") {
        entries.push([key, value])
      }
    }
    if (entries.length > 0) {
      groups.push({ label: group.label, entries })
    }
  }

  return groups
}

function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
}

// ---------------------------------------------------------------------------
// Element prop extraction (props passed directly to this DOM node's fiber)
// ---------------------------------------------------------------------------

const SKIP_ELEMENT_KEYS = new Set([
  "children", "key", "ref", "__self", "__source",
  "suppressHydrationWarning", "suppressContentEditableWarning",
])

function getElementProps(fiber: any): Record<string, unknown> | null {
  // For host fibers (DOM elements), memoizedProps has className, style, href, etc.
  // For component fibers, walk down to find the host fiber
  let hostFiber = fiber
  if (typeof hostFiber?.type !== "string") {
    // This is a component fiber — its child chain leads to the host element
    let child = hostFiber?.child
    while (child && typeof child.type !== "string") {
      child = child.child
    }
    hostFiber = child
  }

  const raw = hostFiber?.memoizedProps
  if (!raw || typeof raw !== "object") return null

  const result: Record<string, unknown> = {}
  let hasProps = false

  for (const [key, value] of Object.entries(raw)) {
    if (SKIP_ELEMENT_KEYS.has(key)) continue
    if (key === "className") continue // shown in dedicated Classes section
    if (key === "style" && typeof value === "object" && value !== null) {
      // Show style as individual properties
      for (const [sk, sv] of Object.entries(value as Record<string, unknown>)) {
        if (sv !== undefined && sv !== null && sv !== "") {
          result[`style.${sk}`] = sv
          hasProps = true
        }
      }
      continue
    }
    if (typeof value === "function") {
      result[key] = "ƒ()"
      hasProps = true
      continue
    }
    if (typeof value === "symbol") continue
    if (value instanceof Element) continue

    try {
      JSON.stringify(value)
      result[key] = value
      hasProps = true
    } catch {
      result[key] = `[${typeof value}]`
      hasProps = true
    }
  }

  return hasProps ? result : null
}

// ---------------------------------------------------------------------------
// InspectPanel
// ---------------------------------------------------------------------------

interface InspectPanelProps {
  element: Element
  rect: DOMRect
  onClose: () => void
}

export function InspectPanel({ element, rect, onClose }: InspectPanelProps) {
  const panelRef = React.useRef<HTMLDivElement>(null)

  // Gather data
  const fiber = getFiberFromDom(element)
  const componentName = fiber ? getComponentName(fiber) : null
  const ancestry = fiber ? getComponentAncestry(fiber) : []
  const nearestProps = ancestry.length > 0 ? ancestry[0].props : null
  const elementProps = fiber ? getElementProps(fiber) : null
  const styleGroups = getRelevantStyles(element)

  // Element label + classes
  const tag = element.tagName.toLowerCase()
  const allClasses = element.className && typeof element.className === "string"
    ? element.className.split(/\s+/).filter(Boolean)
    : []
  const headerClasses = allClasses.slice(0, 3)

  // Position panel to the right of the element, clamped to viewport
  const panelWidth = 320
  const panelMaxHeight = 500
  const gap = 8

  let panelX = rect.right + gap
  if (panelX + panelWidth > window.innerWidth - 16) {
    panelX = rect.left - panelWidth - gap
  }
  if (panelX < 16) panelX = 16

  let panelY = rect.top
  if (panelY + panelMaxHeight > window.innerHeight - 16) {
    panelY = window.innerHeight - panelMaxHeight - 16
  }
  if (panelY < 16) panelY = 16

  // Close on Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  // Close on click outside
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current?.contains(e.target as Node)) return
      // Small delay to avoid conflicting with the pin click
      requestAnimationFrame(() => onClose())
    }
    // Use setTimeout to avoid catching the pin click itself
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClick, true)
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener("click", handleClick, true)
    }
  }, [onClose])

  return createPortal(
    <div
      ref={panelRef}
      data-inspector-ui
      style={{
        position: "fixed",
        top: panelY,
        left: panelX,
        width: panelWidth,
        maxHeight: panelMaxHeight,
        overflowY: "auto",
        backgroundColor: "#fff",
        border: "1px solid var(--stroke-default)",
        borderRadius: 8,
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
        zIndex: 99999,
        pointerEvents: "auto",
        fontFamily: "monospace",
        fontSize: 11,
        lineHeight: "16px",
        color: "#1a1a1a",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 10px",
          borderBottom: "1px solid #e5e5e5",
          backgroundColor: "#fafafa",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
          <span style={{ color: "#8b5cf6", fontWeight: 700 }}>&lt;{tag}&gt;</span>
          {headerClasses.length > 0 && (
            <span style={{ color: "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              .{headerClasses.join(".")}
            </span>
          )}
        </div>
        <button
          data-inspector-ui
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px 4px",
            fontSize: 14,
            color: "#999",
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>

      {/* Classes */}
      {allClasses.length > 0 && (
        <Section title="Classes">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {allClasses.map((cls, i) => (
              <span
                key={i}
                style={{
                  fontSize: 10,
                  padding: "1px 5px",
                  borderRadius: 3,
                  backgroundColor: "#f3f4f6",
                  color: "#555",
                  whiteSpace: "nowrap",
                }}
              >
                .{cls}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Element Props (passed directly to this DOM node) */}
      {elementProps && Object.keys(elementProps).length > 0 && (
        <Section title={`Element Props — <${tag}>`}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {Object.entries(elementProps).map(([key, value]) => (
              <div key={key} style={{ display: "flex", gap: 6 }}>
                <span style={{ color: "#8b5cf6", flexShrink: 0 }}>{key}</span>
                <span style={{ color: "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {formatPropValue(value)}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Component Ancestry */}
      {ancestry.length > 0 && (
        <Section title="Component Tree">
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {ancestry.map((a, i) => (
              <AncestorRow key={i} ancestor={a} depth={ancestry.length - 1 - i} />
            ))}
          </div>
        </Section>
      )}

      {/* Parent Component Props */}
      {nearestProps && Object.keys(nearestProps).length > 0 && (
        <Section title={`Component Props — ${ancestry[0]?.name ?? "unknown"}`}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {Object.entries(nearestProps).map(([key, value]) => (
              <div key={key} style={{ display: "flex", gap: 6 }}>
                <span style={{ color: "#8b5cf6", flexShrink: 0 }}>{key}</span>
                <span style={{ color: "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {formatPropValue(value)}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Computed Styles */}
      {styleGroups.length > 0 && (
        <Section title="Computed Styles">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {styleGroups.map((group) => (
              <div key={group.label}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "#999", marginBottom: 2 }}>
                  {group.label}
                </div>
                {group.entries.map(([key, value]) => (
                  <div key={key} style={{ display: "flex", gap: 6, paddingLeft: 8 }}>
                    <span style={{ color: "#3b82f6", flexShrink: 0 }}>{camelToKebab(key)}</span>
                    <span style={{ color: "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Dimensions */}
      <Section title="Box">
        <div style={{ display: "flex", gap: 12, color: "#666" }}>
          <span>{Math.round(rect.width)} × {Math.round(rect.height)}</span>
          <span>({Math.round(rect.left)}, {Math.round(rect.top)})</span>
        </div>
      </Section>
    </div>,
    document.body
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "8px 10px", borderBottom: "1px solid #f0f0f0" }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#999", marginBottom: 4 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function AncestorRow({ ancestor, depth }: { ancestor: ComponentAncestor; depth: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, paddingLeft: depth * 12 }}>
      {depth > 0 && <span style={{ color: "#ccc" }}>└</span>}
      <span style={{ fontWeight: ancestor.isVibezz ? 700 : 400, color: ancestor.isVibezz ? "#6366f1" : "#333" }}>
        {ancestor.name}
      </span>
      {ancestor.isVibezz && (
        <span
          style={{
            fontSize: 8,
            fontWeight: 700,
            padding: "0 4px",
            borderRadius: 3,
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            color: "#6366f1",
          }}
        >
          vibezz
        </span>
      )}
    </div>
  )
}

function formatPropValue(value: unknown): string {
  if (value === null) return "null"
  if (value === undefined) return "undefined"
  if (typeof value === "string") return `"${value.length > 40 ? value.slice(0, 40) + "…" : value}"`
  if (typeof value === "boolean") return String(value)
  if (typeof value === "number") return String(value)
  if (Array.isArray(value)) return `[${value.length}]`
  if (typeof value === "object") return `{${Object.keys(value).length}}`
  return String(value)
}
