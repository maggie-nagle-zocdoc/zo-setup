"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "../../lib/utils"

/**
 * Section size determines the vertical padding applied to the section.
 * Based on Radix UI Themes Section component.
 * - "1": Minimal padding (py-8 / 32px)
 * - "2": Moderate padding (py-12 / 48px)  
 * - "3": Standard padding (py-20 / 80px) - Default
 * - "4": Large padding (py-32 / 128px)
 */
type SectionSize = "1" | "2" | "3" | "4"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Section padding size
   * @default "3"
   */
  size?: SectionSize
  /**
   * Control section display
   */
  display?: "none" | "initial"
  /**
   * Render as child element using Radix Slot
   * When true, Section will merge its props onto its immediate child
   */
  asChild?: boolean
}

const sectionSizes: Record<SectionSize, string> = {
  "1": "py-8",      // 32px - Minimal, compact sections
  "2": "py-12",     // 48px - Moderate spacing
  "3": "py-20",     // 80px - Standard section spacing
  "4": "py-32",     // 128px - Large, prominent sections
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, size = "3", display, asChild = false, children, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "section"
    
    const displayStyle = display === "none" 
      ? { display: "none", ...style }
      : display === "initial"
      ? { display: "initial", ...style }
      : style

    return (
      <Comp
        ref={ref as React.Ref<HTMLElement>}
        className={cn(
          sectionSizes[size],
          className
        )}
        style={displayStyle}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Section.displayName = "Section"

export { Section, type SectionProps, type SectionSize }

