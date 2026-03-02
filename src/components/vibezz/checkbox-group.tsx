"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { FieldError, FieldWrapper, labelVariants } from "./field-primitives"

/* =============================================================================
 * CHECKBOX GROUP
 * Container for multiple checkboxes with shared state and error handling
 * ============================================================================= */

/* -----------------------------------------------------------------------------
 * Context
 * -------------------------------------------------------------------------- */

interface CheckboxGroupContextValue {
  name?: string
  hasError?: boolean
  disabled?: boolean
}

const CheckboxGroupContext = React.createContext<CheckboxGroupContextValue>({})

function useCheckboxGroup() {
  return React.useContext(CheckboxGroupContext)
}

/* -----------------------------------------------------------------------------
 * CheckboxGroup
 * -------------------------------------------------------------------------- */

interface CheckboxGroupProps {
  /** Checkbox items */
  children: React.ReactNode
  /** Field name for form submission */
  name?: string
  /** Error state styling */
  hasError?: boolean
  /** Whether all checkboxes are disabled */
  disabled?: boolean
  /** Error message displayed below the group */
  errorMessage?: string
  /** Whether to show error icon */
  showErrorIcon?: boolean
  /** Label text displayed above the group */
  label?: string
  /** Container className */
  className?: string
}

function CheckboxGroup({
  children,
  name,
  hasError = false,
  disabled = false,
  errorMessage,
  showErrorIcon = true,
  label,
  className,
}: CheckboxGroupProps) {
  const contextValue = React.useMemo(
    () => ({ name, hasError, disabled }),
    [name, hasError, disabled]
  )

  return (
    <CheckboxGroupContext.Provider value={contextValue}>
      <FieldWrapper
        role="group"
        aria-labelledby={label ? `${name}-label` : undefined}
        className={cn("gap-3", className)}
      >
        {label && (
          <span
            id={`${name}-label`}
            className={cn(labelVariants({ disabled }))}
          >
            {label}
          </span>
        )}
        <div className="flex flex-col gap-3">
          {children}
        </div>
        {hasError && errorMessage && (
          <FieldError message={errorMessage} showIcon={showErrorIcon} />
        )}
      </FieldWrapper>
    </CheckboxGroupContext.Provider>
  )
}

/* -----------------------------------------------------------------------------
 * Exports
 * -------------------------------------------------------------------------- */

export { CheckboxGroup, useCheckboxGroup }
export type { CheckboxGroupProps, CheckboxGroupContextValue }
