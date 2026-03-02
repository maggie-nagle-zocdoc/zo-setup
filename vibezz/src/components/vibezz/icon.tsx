"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

// Font variation settings for each size (weight and optical size)
// Using Material Symbols recommended settings for optimal rendering
const variationSettings: Record<string, { wght: number; opsz: number }> = {
  "16": { wght: 400, opsz: 16 },
  "20": { wght: 300, opsz: 20 },
  "24": { wght: 300, opsz: 24 },
  "40": { wght: 300, opsz: 40 },
  "small": { wght: 400, opsz: 16 },
  "medium": { wght: 300, opsz: 24 },
  "large": { wght: 300, opsz: 40 },
}

// Size values in pixels - applied via inline style to override Google Fonts CSS
const sizeValues: Record<string, number> = {
  "16": 16,
  "20": 20,
  "24": 24,
  "40": 40,
  "small": 16,
  "medium": 24,
  "large": 40,
}

export type IconSize = "16" | "20" | "24" | "40" | "small" | "medium" | "large"

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string
  size?: IconSize
  /** Whether to use the filled variant of the icon */
  filled?: boolean
}

const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, name, size = "24", filled = false, style, ...props }, ref) => {
    const variation = variationSettings[size || "24"] || variationSettings["24"]
    const fontSize = sizeValues[size || "24"] || sizeValues["24"]
    const fontVariationSettings = `'FILL' ${filled ? 1 : 0}, 'wght' ${variation.wght}, 'GRAD' 0, 'opsz' ${variation.opsz}`

    return (
      <span
        ref={ref}
        data-icon
        className={cn("material-symbols-rounded select-none", className)}
        style={{ 
          fontSize,
          fontVariationSettings, 
          ...style 
        }}
        aria-hidden="true"
        {...props}
      >
        {name}
      </span>
    )
  }
)
Icon.displayName = "Icon"

export { Icon }
