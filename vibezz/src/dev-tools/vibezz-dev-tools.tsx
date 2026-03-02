"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import {
  VIBEZZ_NAMES,
  getFiberFromDom,
  getComponentName,
  getDomNode,
} from "./fiber-utils"

// ---------------------------------------------------------------------------
// Fiber tree walking — collect all Vibezz component highlights
// ---------------------------------------------------------------------------
interface HighlightInfo {
  name: string
  rect: DOMRect
}

function collectVibezzNodes(rootEl: Element): HighlightInfo[] {
  const results: HighlightInfo[] = []
  const seen = new Set<Element>()

  function walkFiber(fiber: any) {
    if (!fiber) return

    const name = getComponentName(fiber)
    if (name && VIBEZZ_NAMES.has(name)) {
      const dom = getDomNode(fiber)
      if (dom && !seen.has(dom)) {
        seen.add(dom)
        const rect = dom.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          results.push({ name, rect })
        }
      }
    }

    walkFiber(fiber.child)
    walkFiber(fiber.sibling)
  }

  const rootFiber = getFiberFromDom(rootEl)
  if (rootFiber) {
    let current = rootFiber
    while (current.return) current = current.return
    walkFiber(current)
  }

  return results
}

// ---------------------------------------------------------------------------
// Highlight overlay — renders boxes over detected Vibezz components
// ---------------------------------------------------------------------------
function HighlightOverlay({ highlights }: { highlights: HighlightInfo[] }) {
  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 99998,
      }}
    >
      {highlights.map((h, i) => (
        <div key={`${h.name}-${i}`}>
          <div
            style={{
              position: "fixed",
              top: h.rect.top,
              left: h.rect.left,
              width: h.rect.width,
              height: h.rect.height,
              border: "2px solid #6366f1",
              backgroundColor: "rgba(99, 102, 241, 0.08)",
              borderRadius: 4,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "fixed",
              top: h.rect.top - 20,
              left: h.rect.left,
              backgroundColor: "#6366f1",
              color: "#fff",
              fontSize: 10,
              fontFamily: "monospace",
              fontWeight: 600,
              lineHeight: "16px",
              padding: "1px 6px",
              borderRadius: "4px 4px 0 0",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            {h.name}
          </div>
        </div>
      ))}
    </div>,
    document.body
  )
}

// ---------------------------------------------------------------------------
// VibezzDevTools — self-contained toggle button + highlight overlay
// ---------------------------------------------------------------------------
export function VibezzDevTools() {
  const [active, setActive] = React.useState(false)
  const [highlights, setHighlights] = React.useState<HighlightInfo[]>([])

  React.useEffect(() => {
    if (!active) {
      setHighlights([])
      return
    }

    function scan() {
      const root = document.getElementById("__next") || document.body
      const results = collectVibezzNodes(root)
      setHighlights(results)
    }

    scan()

    const handleUpdate = () => requestAnimationFrame(scan)
    window.addEventListener("scroll", handleUpdate, true)
    window.addEventListener("resize", handleUpdate)

    const observer = new MutationObserver(handleUpdate)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener("scroll", handleUpdate, true)
      window.removeEventListener("resize", handleUpdate)
      observer.disconnect()
    }
  }, [active])

  return (
    <>
      <button
        onClick={() => setActive((a) => !a)}
        aria-pressed={active}
        title={active ? "Hide Vibezz highlights" : "Show Vibezz highlights"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          height: 32,
          padding: "0 10px",
          borderRadius: 6,
          border: active ? "1.5px solid #6366f1" : "1.5px solid var(--stroke-default)",
          backgroundColor: active ? "rgba(99, 102, 241, 0.1)" : "transparent",
          color: active ? "#6366f1" : "var(--text-secondary)",
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
            backgroundColor: active ? "#6366f1" : "var(--text-disabled)",
            transition: "background-color 150ms ease",
          }}
        />
        vibezz
      </button>
      {active && highlights.length > 0 && <HighlightOverlay highlights={highlights} />}
    </>
  )
}
