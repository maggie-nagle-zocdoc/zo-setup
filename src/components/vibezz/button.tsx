"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { Icon } from "./icon"

// Loading spinner component
function LoadingSpinner({ size = "default", disabled = false }: { size?: "default" | "small"; disabled?: boolean }) {
  const sizeClasses = size === "small" 
    ? "size-3 border-[1.5px]" 
    : "size-4 border-[1.75px]"
  
  const borderColor = disabled 
    ? "border-[var(--text-disabled)]" 
    : "border-[rgba(51,51,51,0.68)]"
  
  return (
    <span 
      className={cn(
        sizeClasses,
        borderColor,
        "inline-block rounded-full border-b-transparent",
        "animate-spin shrink-0"
      )}
      aria-hidden="true"
    />
  )
}

const buttonVariants = cva(
  // Base styles
  [
    "inline-flex items-center justify-center",
    "font-semibold transition-colors cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:cursor-default",
    "rounded-[var(--radius-button)]",
    // Auto-size icons inside buttons (using data-icon attribute)
    "[&_[data-icon]]:leading-none",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-[var(--core-yellow)] text-[var(--text-default)]",
          "hover:bg-[var(--state-brand-hover)]",
          "active:bg-[var(--state-brand-pressed)]",
          "disabled:bg-[var(--background-disabled)] disabled:text-[var(--text-disabled)]",
          "focus-visible:ring-[var(--stroke-keyboard)]",
        ],
        secondary: [
          "w-fit",
          "bg-[var(--color-white)] text-[var(--text-default)]",
          "border border-[var(--stroke-charcoal)]",
          "hover:bg-[var(--state-hover)]",
          "active:bg-[var(--state-pressed)]",
          "disabled:bg-[var(--color-white)] disabled:text-[var(--text-disabled)] disabled:border-[var(--stroke-disabled)]",
          "focus-visible:ring-[var(--stroke-keyboard)]",
        ],
        ghost: [
          "bg-transparent text-[var(--text-default)]",
          "hover:bg-[var(--state-hover)]",
          "active:bg-[var(--state-pressed)]",
          "disabled:bg-transparent disabled:text-[var(--text-disabled)]",
          "focus-visible:ring-[var(--stroke-keyboard)]",
        ],
        tertiary: [
          "bg-transparent text-[var(--text-default)]",
          "border border-[var(--stroke-default)]",
          "hover:bg-[var(--state-hover)]",
          "active:bg-[var(--state-pressed)]",
          "disabled:bg-transparent disabled:text-[var(--text-disabled)] disabled:border-[var(--stroke-disabled)]",
          "focus-visible:ring-[var(--stroke-keyboard)]",
        ],
        toggle: [
          "bg-transparent text-[var(--text-default)]",
          "border border-[var(--stroke-default)]",
          "hover:bg-[var(--state-hover)]",
          "active:bg-[var(--state-pressed)]",
          "disabled:bg-transparent disabled:text-[var(--text-disabled)] disabled:border-[var(--stroke-disabled)]",
          "focus-visible:ring-[var(--stroke-keyboard)]",
          "!rounded-full",
        ],
        select: [
          "bg-[var(--color-white)] text-[var(--text-default)]",
          "border border-[var(--stroke-ui)]",
          "hover:bg-[var(--state-hover)]",
          "active:bg-[var(--state-pressed)]",
          "disabled:bg-[var(--background-disabled)] disabled:text-[var(--text-disabled)] disabled:border-[var(--stroke-disabled)]",
          "focus-visible:ring-[var(--stroke-keyboard)]",
        ],
        destructive: [
          "bg-[var(--color-red-70)] text-[var(--color-white)]",
          "hover:bg-[var(--color-red-80)]",
          "active:bg-[#b02828]", // Darker red for pressed
          "disabled:bg-[var(--background-disabled)] disabled:text-[var(--text-disabled)]",
          "focus-visible:ring-[var(--color-red-70)]",
        ],
      },
      size: {
        default: [
          "h-[var(--button-height-default)]",
          "px-[var(--button-padding-x)]",
          "gap-2", // 8px
          "text-[16px]", // body: 16px
          "leading-[26px]", // body line-height: 26px
          "[&_[data-icon]]:!text-[24px]", // Force icons to 24px in default buttons
        ],
        small: [
          "h-[var(--button-height-small)]",
          "px-3", // 12px
          "gap-1.5", // 6px
          "text-[14px]", // subbody: 14px
          "leading-[20px]", // subbody line-height: 20px
          "[&_[data-icon]]:!text-[20px]", // Force icons to 20px in small buttons
        ],
      },
      mode: {
        light: "",
        dark: "",
      },
      showChevron: {
        true: "",
        false: "",
      },
      showLabel: {
        true: "",
        false: "",
      },
      pressed: {
        true: "",
        false: "",
      },
      isLoading: {
        true: [
          "cursor-default pointer-events-none",
        ],
        false: "",
      },
    },
    compoundVariants: [
      // Loading state - Primary variant
      {
        variant: "primary",
        isLoading: true,
        className: [
          "bg-[rgba(58,47,31,0.1)] text-[rgba(51,51,51,0.68)]",
          "hover:bg-[rgba(58,47,31,0.1)]",
        ],
      },
      // Loading state - Secondary variant
      {
        variant: "secondary",
        isLoading: true,
        className: [
          "bg-[rgba(58,47,31,0.1)] text-[rgba(51,51,51,0.68)] border-transparent",
          "hover:bg-[rgba(58,47,31,0.1)]",
        ],
      },
      // Loading state - Ghost variant
      {
        variant: "ghost",
        isLoading: true,
        className: [
          "bg-[rgba(58,47,31,0.1)] text-[rgba(51,51,51,0.68)]",
          "hover:bg-[rgba(58,47,31,0.1)]",
        ],
      },
      // Loading state - Tertiary variant
      {
        variant: "tertiary",
        isLoading: true,
        className: [
          "bg-[rgba(58,47,31,0.1)] text-[rgba(51,51,51,0.68)] border-transparent",
          "hover:bg-[rgba(58,47,31,0.1)]",
        ],
      },
      // Loading state - Destructive variant
      {
        variant: "destructive",
        isLoading: true,
        className: [
          "bg-[rgba(58,47,31,0.1)] text-[rgba(51,51,51,0.68)]",
          "hover:bg-[rgba(58,47,31,0.1)]",
        ],
      },
      // Select variant - Default: reduce right padding by 4px
      {
        variant: "select",
        size: "default",
        className: [
          "pl-[var(--button-padding-x)] pr-[calc(var(--button-padding-x)-4px)]",
        ],
      },
      // Select variant - Small: reduce right padding by 4px
      {
        variant: "select",
        size: "small",
        className: ["pl-3 pr-2"],
      },
      // Show chevron - Default size: reduce right padding by 4px
      {
        showChevron: true,
        size: "default",
        className: [
          "pr-[calc(var(--button-padding-x)-4px)]",
        ],
      },
      // Show chevron - Small size: reduce right padding by 4px
      {
        showChevron: true,
        size: "small",
        className: ["pr-2"],
      },
      // Dark mode - Secondary
      {
        variant: "secondary",
        mode: "dark",
        className: [
          "bg-transparent text-[var(--color-white)] border-[var(--color-white)]",
          "hover:bg-[var(--state-dark-mode-hover)]",
          "active:bg-[var(--state-dark-mode-pressed)]",
          "disabled:text-[var(--text-dark-mode-disabled)] disabled:border-[var(--stroke-dark-mode-disabled)] disabled:bg-transparent",
        ],
      },
      // Dark mode - Ghost
      {
        variant: "ghost",
        mode: "dark",
        className: [
          "text-[var(--color-white)]",
          "hover:bg-[var(--state-dark-mode-hover)]",
          "active:bg-[var(--state-dark-mode-pressed)]",
          "disabled:text-[var(--text-dark-mode-disabled)]",
        ],
      },
      // Dark mode - Tertiary
      {
        variant: "tertiary",
        mode: "dark",
        className: [
          "bg-transparent text-[var(--color-white)] border-[var(--color-white-20)]",
          "hover:bg-[var(--state-dark-mode-hover)]",
          "active:bg-[var(--state-dark-mode-pressed)]",
          "disabled:text-[var(--text-dark-mode-disabled)] disabled:border-[var(--stroke-dark-mode-disabled)] disabled:bg-transparent",
        ],
      },
      // Toggle without label (circle mode) - Default size (48x48)
      {
        variant: "toggle",
        showLabel: false,
        size: "default",
        className: ["!p-0 size-12"],
      },
      // Toggle without label (circle mode) - Small size (32x32)
      {
        variant: "toggle",
        showLabel: false,
        size: "small",
        className: ["!p-0 size-8"],
      },
      // Toggle pressed/toggled state - solid charcoal background, no active/pressed state
      {
        variant: "toggle",
        pressed: true,
        className: [
          "bg-[var(--stroke-charcoal)] text-[var(--color-white)] border-[var(--stroke-charcoal)]",
          "hover:bg-[var(--stroke-charcoal)]",
          "active:bg-[var(--stroke-charcoal)]",
        ],
      },
      // Dark mode - Primary (disabled state)
      {
        variant: "primary",
        mode: "dark",
        className: [
          "disabled:bg-transparent disabled:text-[var(--text-dark-mode-disabled)]",
        ],
      },
      // Dark mode - Destructive (disabled state)
      {
        variant: "destructive",
        mode: "dark",
        className: [
          "disabled:bg-transparent disabled:text-[var(--text-dark-mode-disabled)]",
        ],
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "default",
      mode: "light",
      showChevron: false,
      showLabel: true,
      pressed: false,
      isLoading: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  showChevron?: boolean
  showLabel?: boolean
  pressed?: boolean
  isLoading?: boolean
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, mode, showChevron = false, showLabel = true, pressed = false, isLoading = false, loadingText = "Loading...", asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, mode, showChevron, showLabel, pressed, isLoading, className }))}
        ref={ref}
        aria-busy={isLoading}
        aria-disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          asChild ? (
            <span className="inline-flex items-center gap-2">
              <LoadingSpinner size={size === "small" ? "small" : "default"} disabled={props.disabled} />
              <span>{loadingText}</span>
            </span>
          ) : (
            <>
              <LoadingSpinner size={size === "small" ? "small" : "default"} disabled={props.disabled} />
              <span>{loadingText}</span>
            </>
          )
        ) : (
          asChild && showChevron ? (
            <span className="inline-flex items-center gap-2">
              {children}
              <Icon name="chevron_right" />
            </span>
          ) : asChild ? (
            children
          ) : (
            <>
              {children}
              {showChevron && <Icon name="chevron_right" />}
            </>
          )
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

