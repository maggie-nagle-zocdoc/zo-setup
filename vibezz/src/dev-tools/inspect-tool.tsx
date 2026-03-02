"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { getFiberFromDom, getComponentName } from "./fiber-utils"
import { InspectPanel } from "./inspect-panel"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isInspectorUI(el: Element): boolean {
  return el.closest("[data-inspector-ui]") !== null
}

/** Build a short label for a DOM element: tag + first class or React component name */
function getElementLabel(el: Element): string {
  const tag = el.tagName.toLowerCase()
  const fiber = getFiberFromDom(el)

  // Walk up to find nearest React component name
  let componentName: string | null = null
  if (fiber) {
    let current = fiber
    while (current) {
      const name = getComponentName(current)
      if (name) {
        componentName = name
        break
      }
      current = current.return
    }
  }

  const firstClass = el.className && typeof el.className === "string"
    ? el.className.split(/\s+/).filter(Boolean)[0]
    : null

  let label = `<${tag}>`
  if (componentName) label = `${componentName}  ${label}`
  else if (firstClass) label = `<${tag}>.${firstClass}`

  return label
}

// ---------------------------------------------------------------------------
// Hover highlight overlay
// ---------------------------------------------------------------------------

function HoverHighlight({ element }: { element: Element }) {
  const rect = element.getBoundingClientRect()
  if (rect.width === 0 && rect.height === 0) return null

  const label = getElementLabel(element)

  // Position label above, but flip below if near top of viewport
  const labelAbove = rect.top > 24
  const labelTop = labelAbove ? rect.top - 20 : rect.bottom
  const labelRadius = labelAbove ? "4px 4px 0 0" : "0 0 4px 4px"

  return createPortal(
    <div data-inspector-ui style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 99998 }}>
      {/* Highlight box */}
      <div
        style={{
          position: "fixed",
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          border: "2px solid #8b5cf6",
          backgroundColor: "rgba(139, 92, 246, 0.06)",
          borderRadius: 2,
          pointerEvents: "none",
        }}
      />
      {/* Label */}
      <div
        style={{
          position: "fixed",
          top: labelTop,
          left: rect.left,
          backgroundColor: "#8b5cf6",
          color: "#fff",
          fontSize: 10,
          fontFamily: "monospace",
          fontWeight: 600,
          lineHeight: "16px",
          padding: "2px 6px",
          borderRadius: labelRadius,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          maxWidth: 400,
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </div>
    </div>,
    document.body
  )
}

// ---------------------------------------------------------------------------
// Pinned highlight overlay
// ---------------------------------------------------------------------------

function PinnedHighlight({ rect }: { rect: DOMRect }) {
  return createPortal(
    <div data-inspector-ui style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 99998 }}>
      <div
        style={{
          position: "fixed",
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          border: "2px solid #3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.08)",
          borderRadius: 2,
          pointerEvents: "none",
        }}
      />
    </div>,
    document.body
  )
}

// ---------------------------------------------------------------------------
// InspectTool — main component
// ---------------------------------------------------------------------------

type Mode = "inactive" | "hover" | "pinned"

export function InspectTool() {
  const [mode, setMode] = React.useState<Mode>("inactive")
  const [hoveredElement, setHoveredElement] = React.useState<Element | null>(null)
  const [pinnedElement, setPinnedElement] = React.useState<Element | null>(null)
  const [pinnedRect, setPinnedRect] = React.useState<DOMRect | null>(null)

  const active = mode !== "inactive"

  // Hover tracking
  React.useEffect(() => {
    if (mode !== "hover") {
      setHoveredElement(null)
      return
    }

    let rafId = 0

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const el = document.elementFromPoint(e.clientX, e.clientY)
        if (el && !isInspectorUI(el)) {
          setHoveredElement(el)
        }
      })
    }

    document.addEventListener("mousemove", handleMouseMove)
    return () => {
      cancelAnimationFrame(rafId)
      document.removeEventListener("mousemove", handleMouseMove)
    }
  }, [mode])

  // Click to pin (capture phase to intercept before normal handlers)
  React.useEffect(() => {
    if (mode !== "hover") return

    const handleClick = (e: MouseEvent) => {
      const el = e.target as Element
      if (isInspectorUI(el)) return

      e.preventDefault()
      e.stopPropagation()

      const rect = el.getBoundingClientRect()
      setPinnedElement(el)
      setPinnedRect(rect)
      setHoveredElement(null)
      setMode("pinned")
    }

    document.addEventListener("click", handleClick, true)
    return () => document.removeEventListener("click", handleClick, true)
  }, [mode])

  // Toggle button handler
  const handleToggle = React.useCallback(() => {
    setMode((prev) => {
      if (prev === "inactive") return "hover"
      // Any active state → deactivate
      setPinnedElement(null)
      setPinnedRect(null)
      setHoveredElement(null)
      return "inactive"
    })
  }, [])

  // Panel close handler
  const handlePanelClose = React.useCallback(() => {
    setPinnedElement(null)
    setPinnedRect(null)
    setMode("inactive")
  }, [])

  return (
    <>
      <button
        data-inspector-ui
        onClick={handleToggle}
        aria-pressed={active}
        title={active ? "Disable inspector" : "Inspect elements"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          height: 32,
          padding: "0 10px",
          borderRadius: 6,
          border: active ? "1.5px solid #8b5cf6" : "1.5px solid var(--stroke-default)",
          backgroundColor: active ? "rgba(139, 92, 246, 0.1)" : "transparent",
          color: active ? "#8b5cf6" : "var(--text-secondary)",
          fontSize: 12,
          fontFamily: "monospace",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 150ms ease",
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: active ? "#8b5cf6" : "var(--text-disabled)",
            transition: "background-color 150ms ease",
          }}
        />
        inspect
      </button>

      {mode === "hover" && hoveredElement && (
        <HoverHighlight element={hoveredElement} />
      )}

      {mode === "pinned" && pinnedElement && pinnedRect && (
        <>
          <PinnedHighlight rect={pinnedRect} />
          <InspectPanel
            element={pinnedElement}
            rect={pinnedRect}
            onClose={handlePanelClose}
          />
        </>
      )}
    </>
  )
}
