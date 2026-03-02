"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { Icon } from "./icon"

/* =============================================================================
 * FIELD PRIMITIVES
 * Shared styling for form field labels, helper text, and error messages.
 * Used across Input, Textarea, Select, Radio, Checkbox, and Switch components.
 * ============================================================================= */

/* -----------------------------------------------------------------------------
 * Label Variants
 * -------------------------------------------------------------------------- */

const labelVariants = cva(
  [
    "block",
    "font-semibold",
    "text-[var(--text-default)]",
  ],
  {
    variants: {
      size: {
        default: [
          "text-[16px]",
          "leading-[26px]",
        ],
        small: [
          "text-[14px]",
          "leading-[20px]",
        ],
      },
      disabled: {
        true: "text-[var(--text-disabled)]",
        false: "",
      },
    },
    defaultVariants: {
      size: "default",
      disabled: false,
    },
  }
)

/* -----------------------------------------------------------------------------
 * Helper Text Variants
 * -------------------------------------------------------------------------- */

const helperTextVariants = cva(
  [
    "text-[14px]",
    "leading-[20px]",
  ],
  {
    variants: {
      state: {
        default: "font-medium text-[var(--text-whisper)]",
        error: "font-semibold text-[var(--text-error)]",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
)

/* -----------------------------------------------------------------------------
 * Field Label
 * -------------------------------------------------------------------------- */

interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement>,
  VariantProps<typeof labelVariants> {
  /** Show (Optional) suffix when field is not required */
  required?: boolean
  disabled?: boolean
}

const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ className, size, disabled, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(labelVariants({ size, disabled }), className)}
        {...props}
      >
        {children}
        {!required && (
          <span className="text-[var(--text-whisper)] font-medium ml-1">
            (Optional)
          </span>
        )}
      </label>
    )
  }
)
FieldLabel.displayName = "FieldLabel"

/* -----------------------------------------------------------------------------
 * Field Description (for inline labels with descriptions)
 * -------------------------------------------------------------------------- */

interface FieldDescriptionProps extends React.HTMLAttributes<HTMLSpanElement> {
  disabled?: boolean
  size?: "default" | "small"
}

const FieldDescription = React.forwardRef<HTMLSpanElement, FieldDescriptionProps>(
  ({ className, disabled, size = "default", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        style={{ 
          fontSize: size === "small" ? 'var(--font-size-caption)' : 'var(--font-size-subbody)', 
          lineHeight: size === "small" ? 'var(--line-height-caption)' : 'var(--line-height-subbody)' 
        }}
        className={cn(
          disabled ? "font-normal text-[var(--text-disabled)]" : "font-medium text-[var(--text-whisper)]",
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)
FieldDescription.displayName = "FieldDescription"

/* -----------------------------------------------------------------------------
 * Field Error Message
 * -------------------------------------------------------------------------- */

interface FieldErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string
  showIcon?: boolean
}

const FieldError = React.forwardRef<HTMLDivElement, FieldErrorProps>(
  ({ className, message, showIcon = true, ...props }, ref) => {
    if (!message) return null

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-1",
          helperTextVariants({ state: "error" }),
          className
        )}
        {...props}
      >
        {showIcon && (
          <Icon
            name="error"
            size="small"
            filled
            className="text-[var(--icon-error)]"
          />
        )}
        <span>{message}</span>
      </div>
    )
  }
)
FieldError.displayName = "FieldError"

/* -----------------------------------------------------------------------------
 * Field Helper Text
 * -------------------------------------------------------------------------- */

interface FieldHelperProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string
}

const FieldHelper = React.forwardRef<HTMLDivElement, FieldHelperProps>(
  ({ className, message, ...props }, ref) => {
    if (!message) return null

    return (
      <div
        ref={ref}
        className={cn(helperTextVariants({ state: "default" }), className)}
        {...props}
      >
        {message}
      </div>
    )
  }
)
FieldHelper.displayName = "FieldHelper"

/* -----------------------------------------------------------------------------
 * Field Wrapper (for consistent field layout)
 * -------------------------------------------------------------------------- */

interface FieldWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Gap between field elements */
  gap?: "tight" | "default"
}

const FieldWrapper = React.forwardRef<HTMLDivElement, FieldWrapperProps>(
  ({ className, gap = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col w-full",
          gap === "tight" ? "gap-1" : "gap-2",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
FieldWrapper.displayName = "FieldWrapper"

/* -----------------------------------------------------------------------------
 * Exports
 * -------------------------------------------------------------------------- */

export {
  labelVariants,
  helperTextVariants,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldHelper,
  FieldWrapper,
}

export type {
  FieldLabelProps,
  FieldDescriptionProps,
  FieldErrorProps,
  FieldHelperProps,
  FieldWrapperProps,
}


