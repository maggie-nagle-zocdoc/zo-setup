"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const progressVariants = cva(
  // Base styles
  "relative w-full",
  {
    variants: {
      size: {
        small: "h-1", // 4px
        default: "h-2", // 8px
      },
      variant: {
        default: "",
        stepped: "flex gap-1",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  /** Current progress value (0-100 for default, or current step for stepped) */
  value?: number
  /** Total steps when using stepped variant */
  steps?: number
  /** Accessible label for the progress bar */
  "aria-label"?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, size = "default", variant = "default", steps = 3, ...props }, ref) => {
    if (variant === "stepped") {
      const totalSteps = Math.max(1, steps)
      const currentStep = Math.min(totalSteps, Math.max(0, value))

      return (
        <div
          ref={ref}
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={0}
          aria-valuemax={totalSteps}
          className={cn(progressVariants({ size, variant }), className)}
          {...props}
        >
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "flex-1 rounded-full transition-colors duration-300 ease-out",
                index < currentStep
                  ? "bg-[var(--core-charcoal)]"
                  : "bg-[var(--stroke-default)]"
              )}
            />
          ))}
        </div>
      )
    }

    // Default continuous mode
    const clampedValue = Math.min(100, Math.max(0, value))

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(
          progressVariants({ size, variant }),
          "overflow-hidden bg-[var(--stroke-default)] rounded-full",
          className
        )}
        {...props}
      >
        <div
          className="h-full bg-[var(--core-charcoal)] rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress, progressVariants }

