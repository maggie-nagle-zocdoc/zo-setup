"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { Icon } from "./icon"
import { FieldLabel, FieldError, FieldWrapper, labelVariants } from "./field-primitives"

/* =============================================================================
 * SELECT
 * Dropdown selection component with optional field wrapper
 * ============================================================================= */

const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

/* -----------------------------------------------------------------------------
 * Context
 * -------------------------------------------------------------------------- */

interface SelectContextType {
  hasError?: boolean
  disabled?: boolean
  size?: "default" | "small"
}

const SelectContext = React.createContext<SelectContextType>({})

function useSelectContext() {
  return React.useContext(SelectContext)
}

/* -----------------------------------------------------------------------------
 * Select (wrapper with size context)
 * -------------------------------------------------------------------------- */

interface SelectProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {
  /** Size variant that flows to trigger and dropdown items */
  size?: "default" | "small"
}

function Select({ size, children, ...props }: SelectProps) {
  return (
    <SelectContext.Provider value={{ size }}>
      <SelectPrimitive.Root {...props}>
        {children}
      </SelectPrimitive.Root>
    </SelectContext.Provider>
  )
}

/* -----------------------------------------------------------------------------
 * Select Trigger
 * -------------------------------------------------------------------------- */

const selectTriggerVariants = cva(
  [
    "flex w-full items-center justify-between gap-2",
    "rounded-[var(--radius-input)]",
    "border",
    "bg-[var(--color-white)]",
    "font-semibold text-[var(--text-default)]",
    "data-[placeholder]:font-semibold data-[placeholder]:text-[var(--text-placeholder)]",
    "transition-colors",
    "hover:bg-[var(--state-hover)]",
    "focus:outline-none focus:ring-2 focus:ring-[var(--stroke-keyboard)]",
    "disabled:cursor-not-allowed disabled:bg-[var(--background-disabled)] disabled:text-[var(--text-disabled)] disabled:border-[var(--stroke-disabled)]",
    "[&>span]:truncate",
  ],
  {
    variants: {
      size: {
        default: [
          "h-[var(--button-height-default)]",
          "pl-4 pr-3",
          "text-[16px] leading-[26px]",
        ],
        small: [
          "h-[var(--button-height-small)]",
          "pl-3 pr-2",
          "text-[14px] leading-[20px]",
        ],
      },
      hasError: {
        true: [
          "border-[var(--stroke-error)]",
          "focus:border-[var(--stroke-error)]",
        ],
        false: [
          "border-[var(--stroke-ui)]",
          "focus:border-[var(--stroke-charcoal)]",
        ],
      },
    },
    defaultVariants: {
      size: "default",
      hasError: false,
    },
  }
)

interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
    VariantProps<typeof selectTriggerVariants> {
  hasError?: boolean
}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, children, size: propSize, hasError: propHasError, ...props }, ref) => {
  const context = useSelectContext()
  const size = propSize ?? context.size ?? "default"
  const hasError = propHasError ?? context.hasError

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(selectTriggerVariants({ size, hasError }), className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <Icon name="expand_more" size="24" className="text-[var(--icon-default)] opacity-70" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

/* -----------------------------------------------------------------------------
 * Select Content
 * -------------------------------------------------------------------------- */

interface SelectContentProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  /** Size variant - pass this when using primitives without SelectField */
  size?: "default" | "small"
}

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(({ className, children, position = "popper", size: propSize, ...props }, ref) => {
  // Read context before portal so we can re-provide it inside
  const context = useSelectContext()
  // Allow size prop to override context (for primitive usage)
  const mergedContext = {
    ...context,
    size: propSize ?? context.size,
  }

  return (
    <SelectPrimitive.Portal>
      {/* Re-provide context inside portal since portal renders outside React tree */}
      <SelectContext.Provider value={mergedContext}>
        <SelectPrimitive.Content
          ref={ref}
          className={cn(
            "relative z-50 max-h-96 min-w-[8rem] overflow-hidden",
            "rounded-[var(--radius-input)]",
            "border border-[var(--stroke-default)]",
            "bg-[var(--color-white)]",
            "shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            position === "popper" &&
              "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
            className
          )}
          position={position}
          {...props}
        >
          <SelectPrimitive.Viewport
            className={cn(
              "p-1",
              position === "popper" &&
                "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
            )}
          >
            {children}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectContext.Provider>
    </SelectPrimitive.Portal>
  )
})
SelectContent.displayName = SelectPrimitive.Content.displayName

/* -----------------------------------------------------------------------------
 * Select Label
 * -------------------------------------------------------------------------- */

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(
      "px-3 py-1.5",
      "text-[14px] font-semibold text-[var(--text-whisper)]",
      className
    )}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

/* -----------------------------------------------------------------------------
 * Select Item
 * -------------------------------------------------------------------------- */

const selectItemVariants = cva(
  [
    "relative flex w-full cursor-pointer select-none items-center",
    "rounded-[4px]",
    "font-semibold text-[var(--text-default)]",
    "outline-none",
    "hover:bg-[var(--state-hover)]",
    "focus:bg-[var(--state-hover)]",
    "data-[disabled]:pointer-events-none data-[disabled]:text-[var(--text-disabled)]",
    "data-[state=checked]:bg-[var(--state-selected-light)]",
  ],
  {
    variants: {
      size: {
        default: [
          "py-2 px-3",
          "text-[16px] leading-[26px]",
        ],
        small: [
          "py-1.5 px-2.5",
          "text-[14px] leading-[20px]",
        ],
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

interface SelectItemProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>,
    VariantProps<typeof selectItemVariants> {}

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  SelectItemProps
>(({ className, children, size: propSize, ...props }, ref) => {
  const context = useSelectContext()
  const size = propSize ?? context.size ?? "default"

  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(selectItemVariants({ size }), className)}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
})
SelectItem.displayName = SelectPrimitive.Item.displayName

/* -----------------------------------------------------------------------------
 * Select Separator
 * -------------------------------------------------------------------------- */

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-[var(--stroke-default)]", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

/* -----------------------------------------------------------------------------
 * SelectField (with label and error handling)
 * -------------------------------------------------------------------------- */

interface SelectFieldProps {
  /** Label text displayed above the select */
  label?: string
  /** Placeholder text when no value selected */
  placeholder?: string
  /** Error state styling */
  hasError?: boolean
  /** Error message displayed below the select */
  errorMessage?: string
  /** Whether the field is disabled */
  disabled?: boolean
  /** Size variant */
  size?: "default" | "small"
  /** Controlled value */
  value?: string
  /** Default value for uncontrolled usage */
  defaultValue?: string
  /** Callback when value changes */
  onValueChange?: (value: string) => void
  /** Select options as children */
  children: React.ReactNode
  /** Container className */
  className?: string
}

function SelectField({
  label,
  placeholder,
  hasError,
  errorMessage,
  disabled,
  size = "default",
  value,
  defaultValue,
  onValueChange,
  children,
  className,
}: SelectFieldProps) {
  return (
    <SelectContext.Provider value={{ hasError, disabled, size }}>
      <FieldWrapper className={className}>
        {label && (
          <span className={cn(labelVariants({ size, disabled }))}>
            {label}
          </span>
        )}
        <Select
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          disabled={disabled}
        >
          <SelectTrigger size={size} hasError={hasError}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {children}
          </SelectContent>
        </Select>
        {hasError && errorMessage && (
          <FieldError message={errorMessage} />
        )}
      </FieldWrapper>
    </SelectContext.Provider>
  )
}

/* -----------------------------------------------------------------------------
 * Exports
 * -------------------------------------------------------------------------- */

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectField,
  selectTriggerVariants,
  selectItemVariants,
  useSelectContext,
}
export type { SelectProps, SelectTriggerProps, SelectContentProps, SelectItemProps, SelectFieldProps }
