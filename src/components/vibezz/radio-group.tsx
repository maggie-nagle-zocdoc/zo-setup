"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { FieldError, FieldDescription, FieldWrapper, labelVariants } from "./field-primitives"
import { Icon } from "./icon"

/* =============================================================================
 * RADIO GROUP
 * Single selection from multiple options with various presentation styles
 * ============================================================================= */

/* -----------------------------------------------------------------------------
 * Variants
 * -------------------------------------------------------------------------- */

const radioItemVariants = cva(
  [
    "aspect-square h-5 w-5",
    "rounded-full",
    "border",
    "bg-[var(--color-white)]",
    "transition-colors",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--stroke-keyboard)] focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:bg-[var(--background-disabled)] disabled:border-[var(--stroke-disabled)]",
    "data-[state=checked]:border-[var(--stroke-charcoal)]",
    "disabled:data-[state=checked]:!bg-[var(--background-disabled)] disabled:data-[state=checked]:!border-[var(--stroke-disabled)]",
  ],
  {
    variants: {
      hasError: {
        true: [
          "border-[var(--stroke-error)]",
          "data-[state=checked]:!border-[var(--stroke-error)]",
        ],
        false: "border-[var(--stroke-ui)]",
      },
    },
    defaultVariants: {
      hasError: false,
    },
  }
)

const radioCardVariants = cva(
  [
    "relative cursor-pointer",
    "rounded-[var(--radius-card)]",
    "border",
    "bg-[var(--color-white)]",
    "transition-all duration-150",
    "focus-within:outline-none focus-within:ring-2 focus-within:ring-[var(--stroke-keyboard)] focus-within:ring-offset-2",
    "border-[var(--stroke-ui)]",
    "hover:border-[var(--stroke-charcoal)] hover:bg-[var(--state-hover)]",
    "data-[state=checked]:border-[var(--stroke-charcoal)] data-[state=checked]:bg-[var(--state-selected-light)]",
    "data-[disabled]:cursor-not-allowed data-[disabled]:!bg-[var(--background-disabled)] data-[disabled]:!border-[var(--stroke-disabled)] data-[disabled]:hover:!bg-[var(--background-disabled)]",
  ],
  {
    variants: {
      layout: {
        compact: "aspect-[3/4] p-4 flex flex-col",
        wide: "p-4 flex",
      },
      hasError: {
        true: [
          "border-[var(--stroke-error)]",
          "data-[state=checked]:border-[var(--stroke-error)]",
        ],
        false: "",
      },
    },
    defaultVariants: {
      layout: "wide",
      hasError: false,
    },
  }
)

/* -----------------------------------------------------------------------------
 * Context
 * -------------------------------------------------------------------------- */

interface RadioGroupContextType {
  hasError?: boolean
  disabled?: boolean
}

const RadioGroupContext = React.createContext<RadioGroupContextType>({})

function useRadioGroupContext() {
  return React.useContext(RadioGroupContext)
}

/* -----------------------------------------------------------------------------
 * RadioGroup
 * -------------------------------------------------------------------------- */

interface RadioGroupProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  /** Label text displayed above the group */
  label?: string
  /** Error state styling */
  hasError?: boolean
  /** Error message displayed below the group */
  errorMessage?: string
  /** Optional className for the radio group root (layout container) */
  rootClassName?: string
}

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, label, hasError, errorMessage, disabled, rootClassName, children, ...props }, ref) => {
  return (
    <RadioGroupContext.Provider value={{ hasError, disabled }}>
      <FieldWrapper className={className}>
        {label && (
          <span className={cn(labelVariants({ disabled }))}>
            {label}
          </span>
        )}
        <RadioGroupPrimitive.Root
          className={cn("grid gap-4", rootClassName)}
          disabled={disabled}
          {...props}
          ref={ref}
        >
          {children}
        </RadioGroupPrimitive.Root>
        {hasError && errorMessage && (
          <FieldError message={errorMessage} />
        )}
      </FieldWrapper>
    </RadioGroupContext.Provider>
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

/* -----------------------------------------------------------------------------
 * RadioGroupItem (bare radio button)
 * -------------------------------------------------------------------------- */

interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
    VariantProps<typeof radioItemVariants> {
  hasError?: boolean
}

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, hasError: propHasError, ...props }, ref) => {
  const context = useRadioGroupContext()
  const hasError = propHasError ?? context.hasError

  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(radioItemVariants({ hasError }), className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <div 
          className={cn(
            "h-2.5 w-2.5 rounded-full",
            props.disabled ? "bg-[var(--background-disabled)]" : hasError ? "bg-[var(--icon-error)]" : "bg-[var(--state-selected-dark)]"
          )} 
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

/* -----------------------------------------------------------------------------
 * RadioField (radio with label and optional description)
 * -------------------------------------------------------------------------- */

interface RadioFieldProps extends Omit<RadioGroupItemProps, 'id'> {
  /** Label text */
  label: string
  /** Optional description text */
  description?: string
  /** HTML id attribute */
  id?: string
}

const RadioField = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioFieldProps
>(({ label, description, id, className, hasError: propHasError, disabled: propDisabled, ...props }, ref) => {
  const generatedId = React.useId()
  const radioId = id || generatedId
  const context = useRadioGroupContext()
  const hasError = propHasError ?? context.hasError
  const disabled = propDisabled ?? context.disabled

  return (
    <div className={cn("flex gap-2", description ? "items-start" : "items-center", className)}>
      <RadioGroupItem
        ref={ref}
        id={radioId}
        hasError={hasError}
        disabled={disabled}
        className={description ? "mt-0.5" : undefined}
        {...props}
      />
      <div className="flex flex-col gap-0.5">
        <label
          htmlFor={radioId}
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
RadioField.displayName = "RadioField"

/* -----------------------------------------------------------------------------
 * RadioCard (card-based radio selection)
 * -------------------------------------------------------------------------- */

interface RadioCardProps
  extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>, 'id'>,
    VariantProps<typeof radioCardVariants> {
  /** Label text */
  label: string
  /** Optional description text */
  description?: string
  /** Optional icon name (Material Symbols) - rendered left-aligned at 40px, outlined style */
  icon?: string
  /** HTML id attribute */
  id?: string
}

const RadioCard = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioCardProps
>(({ label, description, icon: iconName, id, className, layout = "wide", hasError: propHasError, disabled: propDisabled, ...props }, ref) => {
  const generatedId = React.useId()
  const radioId = id || generatedId
  const context = useRadioGroupContext()
  const hasError = propHasError ?? context.hasError
  const disabled = propDisabled ?? context.disabled

  const textContent = layout === "compact" ? (
    <div className="flex flex-col h-full justify-end text-left">
      <span
        className={cn(
          "block text-[var(--font-size-body)] leading-[var(--line-height-body)]",
          disabled ? "font-normal text-[var(--text-disabled)]" : "font-semibold text-[var(--text-default)]"
        )}
      >
        {label}
      </span>
      {description && (
        <FieldDescription disabled={disabled} className="block mt-1">
          {description}
        </FieldDescription>
      )}
    </div>
  ) : (
    <div className="flex flex-col gap-0.5 min-w-0 w-full text-left">
      <span
        className={cn(
          "text-[var(--font-size-body)] leading-[var(--line-height-body)]",
          disabled ? "font-normal text-[var(--text-disabled)]" : "font-semibold text-[var(--text-default)]"
        )}
      >
        {label}
      </span>
      {description && (
        <FieldDescription disabled={disabled}>
          {description}
        </FieldDescription>
      )}
    </div>
  )

  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      id={radioId}
      disabled={disabled}
      className={cn(radioCardVariants({ layout, hasError }), className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="sr-only" />
      {iconName && layout === "wide" ? (
        <div className="flex items-center gap-4 w-full">
          <Icon name={iconName} size="40" filled={false} className="shrink-0 text-[var(--icon-default)]" />
          {textContent}
        </div>
      ) : (
        textContent
      )}
    </RadioGroupPrimitive.Item>
  )
})
RadioCard.displayName = "RadioCard"

/* -----------------------------------------------------------------------------
 * Exports
 * -------------------------------------------------------------------------- */

export { 
  RadioGroup, 
  RadioGroupItem, 
  RadioField, 
  RadioCard, 
  radioItemVariants, 
  radioCardVariants,
  useRadioGroupContext,
}
export type { RadioGroupProps, RadioGroupItemProps, RadioFieldProps, RadioCardProps }
