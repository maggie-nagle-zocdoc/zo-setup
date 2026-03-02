"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { FieldLabel, FieldError, FieldHelper, FieldWrapper } from "./field-primitives"

/* =============================================================================
 * INPUT
 * Text input component with optional field wrapper (label, helper, error)
 * ============================================================================= */

const inputVariants = cva(
  [
    "flex w-full",
    "bg-[var(--background-default-white)]",
    "border border-[var(--stroke-ui)]",
    "rounded-[var(--radius-input)]",
    "font-medium",
    "text-[var(--text-default)]",
    "placeholder:text-[var(--text-placeholder)]",
    "transition-all duration-150",
    // Focus state
    "focus:outline-none focus:border-[var(--stroke-charcoal)] focus:ring-3 focus:ring-[rgba(78,147,243,0.6)] focus:ring-offset-0",
    // Hover state
    "hover:border-[var(--stroke-charcoal)]",
    // Disabled state
    "disabled:bg-[var(--background-disabled)] disabled:text-[var(--text-disabled)] disabled:placeholder:text-[var(--text-disabled)] disabled:cursor-not-allowed disabled:border-[var(--stroke-disabled)] disabled:hover:border-[var(--stroke-disabled)]",
  ],
  {
    variants: {
      size: {
        default: [
          "h-[48px]",
          "px-3",
          "py-[14px]",
          "text-[16px]",
          "leading-[26px]",
        ],
        small: [
          "h-[32px]",
          "px-3",
          "py-2",
          "text-[14px]",
          "leading-[20px]",
        ],
      },
      state: {
        default: "",
        error: [
          "border-[var(--stroke-error)]",
          "hover:border-[var(--stroke-error)]",
          "focus:border-[var(--stroke-error)] focus:ring-[var(--color-red-20)]",
        ],
      },
    },
    defaultVariants: {
      size: "default",
      state: "default",
    },
  }
)

/* -----------------------------------------------------------------------------
 * Input (bare)
 * -------------------------------------------------------------------------- */

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, state, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ size, state, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

/* -----------------------------------------------------------------------------
 * InputField (with label, helper text, error handling)
 * -------------------------------------------------------------------------- */

interface InputFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  /** Label text displayed above the input */
  label?: string
  /** Helper text displayed below the input */
  helperText?: string
  /** Error message displayed below the input (overrides helperText when state is error) */
  errorMessage?: string
  /** Whether the field is required - shows (Optional) when false */
  required?: boolean
  /** Container className for the wrapper div */
  containerClassName?: string
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      className,
      containerClassName,
      size = "default",
      state = "default",
      label,
      helperText,
      errorMessage,
      required,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId()
    const hasError = state === "error"
    const message = hasError && errorMessage ? errorMessage : helperText

    return (
      <FieldWrapper className={containerClassName}>
        {label && (
          <FieldLabel
            htmlFor={inputId}
            size={size}
            disabled={disabled}
            required={required}
          >
            {label}
          </FieldLabel>
        )}
        <Input
          id={inputId}
          ref={ref}
          size={size}
          state={state}
          disabled={disabled}
          className={className}
          aria-required={required}
          aria-invalid={hasError}
          aria-describedby={message ? `${inputId}-description` : undefined}
          {...props}
        />
        {hasError && errorMessage ? (
          <FieldError id={`${inputId}-description`} message={errorMessage} />
        ) : helperText ? (
          <FieldHelper id={`${inputId}-description`} message={helperText} />
        ) : null}
      </FieldWrapper>
    )
  }
)
InputField.displayName = "InputField"

/* -----------------------------------------------------------------------------
 * TextField (alias for InputField - backwards compatibility)
 * -------------------------------------------------------------------------- */

const TextField = InputField
TextField.displayName = "TextField"

/* -----------------------------------------------------------------------------
 * Exports
 * -------------------------------------------------------------------------- */

export { Input, InputField, TextField, inputVariants }
export type { InputProps, InputFieldProps }
// Backwards compatibility alias
export type { InputFieldProps as TextFieldProps }
