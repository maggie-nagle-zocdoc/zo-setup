"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { FieldDescription } from "./field-primitives"

/* =============================================================================
 * CHECKBOX
 * Toggle selection control with optional label and description
 * ============================================================================= */

const checkboxVariants = cva(
  [
    "peer shrink-0",
    "rounded-[2px]",
    "border",
    "bg-[var(--color-white)]",
    "transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--stroke-keyboard)] focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:bg-[var(--background-disabled)] disabled:border-[var(--stroke-disabled)]",
    "data-[state=checked]:bg-[var(--state-selected-dark)] data-[state=checked]:border-[var(--stroke-charcoal)]",
    "data-[state=indeterminate]:bg-[var(--state-selected-dark)] data-[state=indeterminate]:border-[var(--stroke-charcoal)]",
    "disabled:data-[state=checked]:!bg-[var(--background-disabled)] disabled:data-[state=checked]:!border-transparent",
    "disabled:data-[state=indeterminate]:!bg-[var(--background-disabled)] disabled:data-[state=indeterminate]:!border-transparent",
  ],
  {
    variants: {
      size: {
        default: "h-5 w-5",
        small: "h-4 w-4",
      },
      hasError: {
        true: [
          "border-[var(--stroke-error)]",
          "data-[state=checked]:!bg-[var(--icon-error)]",
          "data-[state=checked]:!border-transparent",
          "data-[state=indeterminate]:!bg-[var(--icon-error)]",
          "data-[state=indeterminate]:!border-transparent",
        ],
        false: "border-[var(--stroke-ui)]",
      },
    },
    defaultVariants: {
      size: "default",
      hasError: false,
    },
  }
)

/* -----------------------------------------------------------------------------
 * Checkbox
 * -------------------------------------------------------------------------- */

interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {
  /** Optional label text - when provided, renders checkbox with accessible label */
  label?: string
  /** Optional description text below the label */
  description?: string
  /** Error state styling */
  hasError?: boolean
}

/**
 * Checkbox component with optional label support.
 *
 * @example
 * // Without label (bare checkbox)
 * <Checkbox checked={value} onCheckedChange={setValue} />
 *
 * @example
 * // With label
 * <Checkbox label="Accept terms" checked={value} onCheckedChange={setValue} />
 *
 * @example
 * // With label and description
 * <Checkbox
 *   label="Email notifications"
 *   description="Receive updates about your account"
 * />
 */
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, size, hasError, label, description, disabled, id, ...props }, ref) => {
  const generatedId = React.useId()
  const checkboxId = id || generatedId

  const checkboxElement = (
    <CheckboxPrimitive.Root
      ref={ref}
      id={checkboxId}
      disabled={disabled}
      className={cn(
        checkboxVariants({ size, hasError }),
        label && "mt-0.5",
        !label && className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        {props.checked === "indeterminate" ? (
          <MinusIcon className={cn("text-[var(--color-white)]", size === "small" ? "h-2.5 w-2.5" : "h-3 w-3")} />
        ) : (
          <CheckIcon className={cn("text-[var(--color-white)]", size === "small" ? "h-2.5 w-2.5" : "h-3 w-3")} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )

  // Without label, return bare checkbox
  if (!label) return checkboxElement

  // With label, wrap in field layout
  return (
    <div className={cn("flex items-start gap-2", className)}>
      {checkboxElement}
      <div className="flex flex-col gap-0.5">
        <label
          htmlFor={checkboxId}
          className={cn(
            "text-[var(--font-size-body)] leading-[var(--line-height-body)]",
            disabled ? "font-normal" : "font-medium",
            "cursor-pointer select-none",
            disabled && "text-[var(--text-disabled)] cursor-not-allowed"
          )}
        >
          {label}
        </label>
        {description && (
          <FieldDescription disabled={disabled}>
            {description}
          </FieldDescription>
        )}
      </div>
    </div>
  )
})
Checkbox.displayName = "Checkbox"

/* -----------------------------------------------------------------------------
 * Icons
 * -------------------------------------------------------------------------- */

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.91675 7H11.0834" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* -----------------------------------------------------------------------------
 * Exports
 * -------------------------------------------------------------------------- */

export { Checkbox, checkboxVariants }
export type { CheckboxProps }
