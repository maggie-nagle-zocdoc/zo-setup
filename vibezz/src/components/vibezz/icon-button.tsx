"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { Icon } from "./icon"

const iconButtonVariants = cva(
  // Base styles
  [
    "inline-flex items-center justify-center",
    "bg-transparent",
    "transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--stroke-keyboard)]",
    "disabled:cursor-not-allowed",
    "rounded-[var(--radius-button)]",
  ],
  {
    variants: {
      size: {
        large: [
          "size-12", // 48px
        ],
        default: [
          "size-10", // 40px
        ],
        small: [
          "size-6", // 24px
        ],
        xsmall: [
          "size-4", // 16px
        ],
      },
      mode: {
        light: [
          "text-[var(--icon-default)]",
          "hover:bg-[var(--state-hover)]",
          "active:bg-[var(--state-pressed)]",
          "disabled:text-[var(--icon-disabled)]",
          "disabled:hover:bg-transparent",
          "disabled:active:bg-transparent",
        ],
        dark: [
          "text-[var(--icon-white)]",
          "hover:bg-[var(--state-dark-mode-hover)]",
          "active:bg-[var(--state-dark-mode-pressed)]",
          "disabled:text-[var(--text-dark-mode-disabled)]",
          "disabled:hover:bg-transparent",
          "disabled:active:bg-transparent",
        ],
      },
    },
    defaultVariants: {
      size: "default",
      mode: "light",
    },
  }
)

// Map button sizes to icon sizes
const iconSizeMap = {
  large: "24",
  default: "24",
  small: "20",
  xsmall: "16",
} as const

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  /** Material Symbols icon name */
  icon: string
  /** Accessible label for the button */
  "aria-label": string
  asChild?: boolean
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, icon, size, mode, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const iconSize = iconSizeMap[size ?? "default"]

    return (
      <Comp
        className={cn(iconButtonVariants({ size, mode, className }))}
        ref={ref}
        {...props}
      >
        <Icon name={icon} size={iconSize} />
      </Comp>
    )
  }
)
IconButton.displayName = "IconButton"

export { IconButton, iconButtonVariants }

