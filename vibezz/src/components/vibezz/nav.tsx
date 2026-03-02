"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const navVariants = cva(
  [
    "relative",
    "flex items-center justify-between",
    "w-full",
    "h-[80px] px-6",
    "font-[family-name:var(--font-sharp-sans)]",
  ],
  {
    variants: {
      variant: {
        default: "bg-[var(--background-default-white)] border-b border-[var(--stroke-default)]",
        transparent: "bg-transparent border-b-0",
      },
      sticky: {
        true: "sticky top-0 z-50",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      sticky: false,
    },
  }
)

export interface NavProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof navVariants> {
  /** Content for the left zone (logos, branding) */
  left?: React.ReactNode
  /** Content for the center zone (search, navigation links) */
  center?: React.ReactNode
  /** Content for the right zone (buttons, user menu, avatar) */
  right?: React.ReactNode
}

const Nav = React.forwardRef<HTMLElement, NavProps>(
  ({ className, variant, sticky, left, center, right, children, ...props }, ref) => {
    // Determine if we need to render zone placeholders for proper justify-between spacing
    const hasZones = left !== undefined || center !== undefined || right !== undefined

    return (
      <nav
        ref={ref}
        className={cn(navVariants({ variant, sticky, className }))}
        {...props}
      >
        {/* Left zone - render empty div if right exists to maintain justify-between spacing */}
        {hasZones && (
          <div className="flex items-center justify-start shrink-0">
            {left}
          </div>
        )}
        
        {/* Center zone - absolutely positioned for true centering, with width constraints */}
        {center && (
          <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-md px-6 flex items-center">
            <div className="w-full">
              {center}
            </div>
          </div>
        )}
        
        {/* Right zone - render empty div if left exists to maintain justify-between spacing */}
        {hasZones && (
          <div className="flex items-center justify-end shrink-0 gap-3">
            {right}
          </div>
        )}
        
        {/* Allow custom children if not using zones */}
        {children}
      </nav>
    )
  }
)
Nav.displayName = "Nav"

export { Nav, navVariants }
