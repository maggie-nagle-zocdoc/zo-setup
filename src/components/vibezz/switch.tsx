"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { FieldDescription } from "./field-primitives"

/* =============================================================================
 * SWITCH
 * Toggle switch for binary on/off settings
 * ============================================================================= */

const switchVariants = cva(
  [
    "peer inline-flex shrink-0 cursor-pointer items-center",
    "rounded-full",
    "transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--stroke-keyboard)] focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-100",
  ],
  {
    variants: {
      size: {
        default: "h-7 w-12 p-0.5",
        small: "h-5 w-9 p-0.5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const switchThumbVariants = cva(
  [
    "pointer-events-none block rounded-full bg-[var(--core-white)]",
    "shadow-[0_1px_4px_rgba(0,0,0,0.2)]",
    "transition-transform",
  ],
  {
    variants: {
      size: {
        default: "size-6",
        small: "size-4",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

/* -----------------------------------------------------------------------------
 * Switch (bare)
 * -------------------------------------------------------------------------- */

interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> {}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, size, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
      switchVariants({ size }),
      "bg-[var(--background-disabled)]",
      "data-[state=checked]:bg-[var(--color-green-70)]",
      "disabled:bg-[var(--background-disabled)]",
      "disabled:data-[state=checked]:bg-[var(--background-disabled)]",
      className
    )}
    ref={ref}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        switchThumbVariants({ size }),
        size === "small"
          ? "translate-x-0 data-[state=checked]:translate-x-4"
          : "translate-x-0 data-[state=checked]:translate-x-5",
        "data-[disabled]:shadow-none"
      )}
    />
  </SwitchPrimitive.Root>
))
Switch.displayName = SwitchPrimitive.Root.displayName

/* -----------------------------------------------------------------------------
 * SwitchField (with label and optional description)
 * -------------------------------------------------------------------------- */

interface SwitchFieldProps extends SwitchProps {
  /** Label text */
  label: string
  /** Optional description text */
  description?: string
  /** HTML id attribute */
  id?: string
  /** Position of label relative to switch */
  labelPosition?: "left" | "right"
}

const SwitchField = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchFieldProps
>(({ label, description, id, labelPosition = "right", className, size, disabled, ...props }, ref) => {
  const generatedId = React.useId()
  const switchId = id || generatedId
  const isSmall = size === "small"
  
  const labelContent = (
    <div className="flex flex-col gap-0.5">
      <label
        htmlFor={switchId}
        className={cn(
          isSmall 
            ? "text-[14px] leading-[20px]"
            : "text-[16px] leading-[26px]",
          disabled ? "font-normal" : "font-medium",
          "cursor-pointer select-none",
          disabled && "text-[var(--text-disabled)] cursor-not-allowed"
        )}
      >
        {label}
      </label>
      {description && (
        <FieldDescription disabled={disabled} size={isSmall ? "small" : "default"}>
          {description}
        </FieldDescription>
      )}
    </div>
  )

  return (
    <div className={cn(
      "flex gap-3",
      description ? "items-start" : "items-center",
      className
    )}>
      {labelPosition === "left" && labelContent}
      <Switch
        ref={ref}
        id={switchId}
        size={size}
        disabled={disabled}
        className={description ? "mt-0.5" : undefined}
        {...props}
      />
      {labelPosition === "right" && labelContent}
    </div>
  )
})
SwitchField.displayName = "SwitchField"

/* -----------------------------------------------------------------------------
 * Exports
 * -------------------------------------------------------------------------- */

export { Switch, SwitchField, switchVariants, switchThumbVariants }
export type { SwitchProps, SwitchFieldProps }
