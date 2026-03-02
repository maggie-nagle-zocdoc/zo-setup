"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { Icon } from "./icon"
import { IconButton } from "./icon-button"
import { Button } from "./button"
import { Badge } from "./badge"

const flagVariants = cva(
  // Base styles
  [
    "relative flex w-full gap-3",
    "p-4 rounded-lg",
    "text-[var(--text-default)]",
  ],
  {
    variants: {
      color: {
        greige: "bg-[var(--color-greige-5)]",
        yellow: "bg-[var(--color-yellow-5)]",
        blue: "bg-[var(--color-blue-5)]",
        red: "bg-[var(--color-red-5)]",
        green: "bg-[var(--color-green-5)]",
        white: "bg-[var(--color-white)] shadow-[inset_0_0_0_1px_var(--stroke-default)]",
      },
    },
    defaultVariants: {
      color: "greige",
    },
  }
)

// Flag icon configuration (same for all colors)
const flagIconConfig = { name: "info", colorClass: "text-[var(--icon-default)]" }

// Flag badge variant (same for all colors)
const flagBadgeVariant = "info-inverse" as const

export interface FlagActionButtonProps {
  children: React.ReactNode
  onClick?: () => void
}

export interface FlagProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof flagVariants> {
  /** Optional title for the flag */
  title?: string
  /** Whether to show the icon (mutually exclusive with badge) */
  showIcon?: boolean
  /** Badge text to display above title/content (mutually exclusive with showIcon) */
  badge?: string
  /** Callback when close button is clicked - shows X button (mutually exclusive with actionButton) */
  onClose?: () => void
  /** Action button props - shows action button (mutually exclusive with onClose) */
  actionButton?: FlagActionButtonProps
}

const Flag = React.forwardRef<HTMLDivElement, FlagProps>(
  ({ 
    className, 
    color = "greige", 
    title,
    showIcon = false,
    badge,
    onClose,
    actionButton,
    children, 
    ...props 
  }, ref) => {
    const iconConfig = flagIconConfig
    const badgeVariant = flagBadgeVariant
    const hasTitle = Boolean(title)
    const hasBadge = Boolean(badge)
    // Icon and badge are mutually exclusive - badge takes precedence
    const shouldShowIcon = showIcon && !hasBadge

    // Render icon element
    const iconElement = shouldShowIcon && (
      <Icon
        name={iconConfig.name}
        size="20"
        filled
        className={iconConfig.colorClass}
      />
    )

    // Render badge element
    const badgeElement = hasBadge && (
      <Badge variant={badgeVariant}>{badge}</Badge>
    )

    // Leading element (icon or badge) - shown inline with title when title exists
    const leadingElement = iconElement || badgeElement

    return (
      <div
        ref={ref}
        className={cn(flagVariants({ color }), className)}
        role="alert"
        {...props}
      >
        {/* Close button - absolutely positioned in top right (mutually exclusive with action button) */}
        {onClose && !actionButton && (
          <IconButton
            icon="close"
            size="small"
            aria-label="Dismiss"
            onClick={onClose}
            className="absolute top-2 right-2"
          />
        )}

        {/* Icon - show on the left when no title */}
        {!hasTitle && iconElement && (
          <div className="flex-shrink-0 flex items-center">
            {iconElement}
          </div>
        )}

        {/* Main content */}
        <div className={cn("flex-1 min-w-0", onClose && !actionButton && "pr-10")}>
          {/* Badge - show above body when no title */}
          {!hasTitle && badgeElement && (
            <div className="mb-1">
              {badgeElement}
            </div>
          )}

          {/* Title row - with icon/badge inline when title exists */}
          {hasTitle && (
            <div className={cn("flex items-center", hasBadge ? "gap-2" : "gap-1")}>
              {leadingElement}
              <span className="text-[14px] leading-[20px] font-semibold">
                {title}
              </span>
            </div>
          )}

          {/* Body content */}
          <div className="text-[14px] leading-[20px] font-medium">
            {children}
          </div>
        </div>

        {/* Action button - mutually exclusive with close button */}
        {actionButton && (
          <div className="flex-shrink-0 flex items-center">
            <Button
              variant="secondary"
              size="small"
              className="bg-transparent hover:bg-[var(--state-hover)] active:bg-[var(--state-pressed)]"
              onClick={actionButton.onClick}
            >
              {actionButton.children}
            </Button>
          </div>
        )}
      </div>
    )
  }
)
Flag.displayName = "Flag"

export { Flag, flagVariants }

