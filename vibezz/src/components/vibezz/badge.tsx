"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { Icon } from "./icon"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip"

const badgeVariants = cva(
  // Base styles - Caption typography
  [
    "inline-flex items-center gap-0.5",
    "rounded-[4px]",
    "py-0.5",
    "text-[12px] leading-[16px] font-semibold tracking-[0.12px]",
    "whitespace-nowrap",
  ],
  {
    variants: {
      variant: {
        "yellow-dark": [
          "bg-[var(--color-yellow-100)] text-[var(--text-default)]",
        ],
        "yellow-light": [
          "bg-[var(--background-new)] text-[var(--text-default)]",
        ],
        callout: [
          "bg-[var(--background-callout)] text-[var(--text-default)]",
        ],
        info: [
          "bg-[var(--background-info)] text-[var(--text-default)]",
        ],
        positive: [
          "bg-[var(--background-success)] text-[var(--text-default)]",
        ],
        negative: [
          "bg-[var(--background-error)] text-[var(--text-default)]",
        ],
        charcoal: [
          "bg-[var(--core-charcoal)] text-[var(--text-white)]",
        ],
        "info-inverse": [
          "bg-[var(--core-charcoal)] text-[var(--text-white)]",
        ],
      },
      hasIcon: {
        true: "pl-0.5 pr-1.5",
        false: "px-1.5",
      },
    },
    defaultVariants: {
      variant: "yellow-dark",
      hasIcon: false,
    },
  }
)

// Icon names for each variant
const variantIcons: Record<string, { name: string; colorClass: string }> = {
  "yellow-dark": { name: "check", colorClass: "text-[var(--icon-default)]" },
  "yellow-light": { name: "check", colorClass: "text-[var(--icon-default)]" },
  callout: { name: "check", colorClass: "text-[var(--icon-default)]" },
  info: { name: "check", colorClass: "text-[var(--icon-default)]" },
  positive: { name: "check", colorClass: "text-[var(--icon-default)]" },
  negative: { name: "check", colorClass: "text-[var(--icon-default)]" },
  charcoal: { name: "check", colorClass: "text-[var(--icon-white)]" },
  "info-inverse": { name: "check", colorClass: "text-[var(--icon-white)]" },
}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Show the variant's icon before the text */
  showIcon?: boolean
  /** Tooltip text to display on hover (adds an info icon) */
  infoText?: string
}

function Badge({
  className,
  variant = "yellow-dark",
  showIcon = false,
  infoText,
  children,
  ...props
}: BadgeProps) {
  const iconConfig = variantIcons[variant || "yellow-dark"]

  const badgeContent = (
    <span className={cn(badgeVariants({ variant, hasIcon: showIcon }), className)} {...props}>
      {showIcon && iconConfig && (
        <Icon
          name={iconConfig.name}
          size="16"
          className={iconConfig.colorClass}
        />
      )}
      {children}
    </span>
  )

  if (infoText) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
          <TooltipContent>
            <p>{infoText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return badgeContent
}

export { Badge, badgeVariants }

