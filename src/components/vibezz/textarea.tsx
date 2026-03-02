"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { FieldLabel, FieldError, FieldHelper, FieldWrapper } from "./field-primitives"

/* =============================================================================
 * TEXTAREA
 * Multi-line text input with optional field wrapper (label, helper, error)
 * ============================================================================= */

const textareaVariants = cva(
  [
    "flex w-full",
    "bg-[var(--background-default-white)]",
    "border border-[var(--stroke-ui)]",
    "rounded-[var(--radius-input)]",
    "font-medium",
    "text-[var(--text-default)]",
    "placeholder:text-[var(--text-placeholder)]",
    "transition-all duration-150",
    "focus:outline-none focus:border-[var(--stroke-charcoal)] focus:ring-3 focus:ring-[rgba(78,147,243,0.6)] focus:ring-offset-0",
    "hover:border-[var(--stroke-charcoal)]",
    "disabled:bg-[var(--background-disabled)] disabled:text-[var(--text-disabled)] disabled:placeholder:text-[var(--text-disabled)] disabled:cursor-not-allowed disabled:border-[var(--stroke-disabled)] disabled:hover:border-[var(--stroke-disabled)]",
    "min-h-[80px]",
    "resize-y",
  ],
  {
    variants: {
      size: {
        default: [
          "px-3",
          "py-2.5",
          "text-[16px]",
          "leading-[26px]",
        ],
        small: [
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
 * Textarea (bare)
 * -------------------------------------------------------------------------- */

interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size, state, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ size, state, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

/* -----------------------------------------------------------------------------
 * TextareaField (with label, helper text, error handling)
 * -------------------------------------------------------------------------- */

interface TextareaFieldProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    VariantProps<typeof textareaVariants> {
  /** Label text displayed above the textarea */
  label?: string
  /** Helper text displayed below the textarea */
  helperText?: string
  /** Error message displayed below the textarea (overrides helperText when state is error) */
  errorMessage?: string
  /** Whether the field is required - shows (Optional) when false */
  required?: boolean
  /** Container className for the wrapper div */
  containerClassName?: string
}

const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
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
    const textareaId = id || React.useId()
    const hasError = state === "error"
    const message = hasError && errorMessage ? errorMessage : helperText

    return (
      <FieldWrapper className={containerClassName}>
        {label && (
          <FieldLabel
            htmlFor={textareaId}
            size={size}
            disabled={disabled}
            required={required}
          >
            {label}
          </FieldLabel>
        )}
        <Textarea
          id={textareaId}
          ref={ref}
          size={size}
          state={state}
          disabled={disabled}
          className={className}
          aria-required={required}
          aria-invalid={hasError}
          aria-describedby={message ? `${textareaId}-description` : undefined}
          {...props}
        />
        {hasError && errorMessage ? (
          <FieldError id={`${textareaId}-description`} message={errorMessage} />
        ) : helperText ? (
          <FieldHelper id={`${textareaId}-description`} message={helperText} />
        ) : null}
      </FieldWrapper>
    )
  }
)
TextareaField.displayName = "TextareaField"

/* -----------------------------------------------------------------------------
 * Exports
 * -------------------------------------------------------------------------- */

export { Textarea, TextareaField, textareaVariants }
export type { TextareaProps, TextareaFieldProps }
