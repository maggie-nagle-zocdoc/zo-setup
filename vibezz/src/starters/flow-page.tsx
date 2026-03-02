/**
 * Flow Page Starter
 * 
 * A multi-step wizard layout for guided flows.
 * Best for: onboarding, search funnels, preference gathering, decision trees.
 * 
 * Features:
 * - Segmented progress indicator
 * - Skip action in header
 * - Centered question heading
 * - Selectable option cards
 * 
 * @example
 * // Copy this file and customize for your needs
 * // Rename to your-flow-name.tsx
 */

"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"
import { Button } from "@/components/vibezz/button"
import { Icon } from "@/components/vibezz/icon"
import { Nav } from "@/components/vibezz/nav"
import { Progress } from "@/components/vibezz/progress"
import { RadioGroup, RadioCard } from "@/components/vibezz/radio-group"

/* =============================================================================
 * FLOW COMPONENTS
 * Compound components for building multi-step wizard flows
 * ============================================================================= */

/* -----------------------------------------------------------------------------
 * Flow Context
 * -------------------------------------------------------------------------- */

interface FlowContextType {
  currentStep: number
  totalSteps: number
  onSkip?: () => void
  onBack?: () => void
  onNext?: () => void
  canGoBack: boolean
  skipLabel?: string
}

const FlowContext = React.createContext<FlowContextType | null>(null)

function useFlowContext() {
  const context = React.useContext(FlowContext)
  if (!context) {
    throw new Error("Flow compound components must be used within a Flow")
  }
  return context
}

/* -----------------------------------------------------------------------------
 * Flow Root
 * -------------------------------------------------------------------------- */

interface FlowProps extends React.HTMLAttributes<HTMLDivElement> {
  currentStep: number
  totalSteps: number
  onSkip?: () => void
  onBack?: () => void
  onNext?: () => void
  skipLabel?: string
}

const Flow = React.forwardRef<HTMLDivElement, FlowProps>(
  (
    {
      className,
      currentStep,
      totalSteps,
      onSkip,
      onBack,
      onNext,
      skipLabel = "Skip",
      children,
      ...props
    },
    ref
  ) => {
    const canGoBack = currentStep > 1

    return (
      <FlowContext.Provider
        value={{
          currentStep,
          totalSteps,
          onSkip,
          onBack,
          onNext,
          canGoBack,
          skipLabel,
        }}
      >
        <div
          ref={ref}
          className={cn(
            "flex flex-col min-h-screen w-full",
            "bg-[var(--background-default-white)]",
            "font-[family-name:var(--font-sharp-sans)]",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </FlowContext.Provider>
    )
  }
)
Flow.displayName = "Flow"

/* -----------------------------------------------------------------------------
 * Flow Header
 * -------------------------------------------------------------------------- */

interface FlowHeaderProps extends Omit<React.ComponentPropsWithoutRef<typeof Nav>, 'left' | 'center' | 'right'> {
  hideSkip?: boolean
}

const FlowHeader = React.forwardRef<HTMLElement, FlowHeaderProps>(
  ({ className, hideSkip = false, children, ...props }, ref) => {
    const { onSkip, skipLabel } = useFlowContext()

    return (
      <Nav
        ref={ref}
        variant="transparent"
        sticky
        className={className}
        center={children}
        right={
          !hideSkip && onSkip ? (
            <Button
              variant="ghost"
              onClick={onSkip}
            >
              {skipLabel}
            </Button>
          ) : undefined
        }
        {...props}
      />
    )
  }
)
FlowHeader.displayName = "FlowHeader"

/* -----------------------------------------------------------------------------
 * Flow Progress
 * -------------------------------------------------------------------------- */

interface FlowProgressProps extends Omit<React.ComponentPropsWithoutRef<typeof Progress>, 'value'> {
  currentStep?: number
  totalSteps?: number
}

const FlowProgress = React.forwardRef<HTMLDivElement, FlowProgressProps>(
  ({ className, currentStep: propCurrentStep, totalSteps: propTotalSteps, size = "default", ...props }, ref) => {
    const context = useFlowContext()
    const currentStep = propCurrentStep ?? context.currentStep
    const totalSteps = propTotalSteps ?? context.totalSteps
    
    const percentage = Math.round((currentStep / totalSteps) * 100)

    return (
      <Progress
        ref={ref}
        value={percentage}
        size={size}
        aria-label={`Step ${currentStep} of ${totalSteps}`}
        className={cn("w-full", className)}
        {...props}
      />
    )
  }
)
FlowProgress.displayName = "FlowProgress"

/* -----------------------------------------------------------------------------
 * Flow Content
 * -------------------------------------------------------------------------- */

const flowContentVariants = cva(
  [
    "flex-1 flex flex-col",
    "w-full mx-auto",
    "px-4 sm:px-6 md:px-8",
  ],
  {
    variants: {
      size: {
        narrow: "max-w-lg",
        default: "max-w-xl",
        wide: "max-w-2xl",
      },
      align: {
        start: "items-start justify-start pt-8 md:pt-12",
        center: "items-center justify-center",
      },
    },
    defaultVariants: {
      size: "default",
      align: "start",
    },
  }
)

interface FlowContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof flowContentVariants> {}

const FlowContent = React.forwardRef<HTMLDivElement, FlowContentProps>(
  ({ className, size, align, children, ...props }, ref) => {
    return (
      <main
        ref={ref}
        className={cn(flowContentVariants({ size, align }), className)}
        {...props}
      >
        {children}
      </main>
    )
  }
)
FlowContent.displayName = "FlowContent"

/* -----------------------------------------------------------------------------
 * Flow Question
 * -------------------------------------------------------------------------- */

interface FlowQuestionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
}

const FlowQuestion = React.forwardRef<HTMLDivElement, FlowQuestionProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("w-full text-center mb-8 md:mb-10", className)}
        {...props}
      >
        <h1
          className={cn(
            "text-[var(--font-size-title-1)] leading-[var(--line-height-title-1)]",
            "md:text-[24px] md:leading-[32px]",
            "font-semibold text-[var(--text-default)]"
          )}
        >
          {title}
        </h1>
        {description && (
          <p
            className={cn(
              "mt-2",
              "text-[var(--font-size-body)] leading-[var(--line-height-body)]",
              "text-[var(--text-whisper)]"
            )}
          >
            {description}
          </p>
        )}
        {children}
      </div>
    )
  }
)
FlowQuestion.displayName = "FlowQuestion"

/* -----------------------------------------------------------------------------
 * Flow Options
 * -------------------------------------------------------------------------- */

interface FlowOptionsProps
  extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroup>, 'label'> {
  gap?: "tight" | "default" | "loose"
}

const FlowOptions = React.forwardRef<
  React.ElementRef<typeof RadioGroup>,
  FlowOptionsProps
>(({ className, gap = "default", children, ...props }, ref) => {
  const gapClasses = {
    tight: "gap-2",
    default: "gap-3",
    loose: "gap-4",
  }

  return (
    <RadioGroup
      ref={ref}
      className={cn("w-full flex flex-col", gapClasses[gap], className)}
      {...props}
    >
      {children}
    </RadioGroup>
  )
})
FlowOptions.displayName = "FlowOptions"

/* -----------------------------------------------------------------------------
 * Flow Option
 * -------------------------------------------------------------------------- */

interface FlowOptionProps
  extends Omit<React.ComponentPropsWithoutRef<typeof RadioCard>, 'label'> {
  title: string
  description?: string
}

const FlowOption = React.forwardRef<
  React.ElementRef<typeof RadioCard>,
  FlowOptionProps
>(({ title, description, className, ...props }, ref) => {
  return (
    <RadioCard
      ref={ref}
      label={title}
      description={description}
      layout="wide"
      className={className}
      {...props}
    />
  )
})
FlowOption.displayName = "FlowOption"

/* -----------------------------------------------------------------------------
 * Flow Footer
 * -------------------------------------------------------------------------- */

interface FlowFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  hideBack?: boolean
  backLabel?: string
  backButton?: React.ReactNode
  nextButton?: React.ReactNode
}

const FlowFooter = React.forwardRef<HTMLDivElement, FlowFooterProps>(
  (
    {
      className,
      hideBack = false,
      backLabel = "Back",
      backButton,
      nextButton,
      children,
      ...props
    },
    ref
  ) => {
    const { onBack, canGoBack } = useFlowContext()

    return (
      <footer
        ref={ref}
        className={cn(
          "sticky bottom-0",
          "flex items-center justify-between",
          "w-full px-4 py-4 sm:px-6 md:px-8",
          "bg-[var(--background-default-white)]",
          "border-t border-[var(--stroke-default)]",
          className
        )}
        {...props}
      >
        {!hideBack && canGoBack && onBack ? (
          backButton || (
            <Button
              variant="ghost"
              onClick={onBack}
            >
              <Icon name="chevron_left" />
              {backLabel}
            </Button>
          )
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3">
          {children}
          {nextButton}
        </div>
      </footer>
    )
  }
)
FlowFooter.displayName = "FlowFooter"

/* =============================================================================
 * EXAMPLE FLOW PAGE
 * Copy and customize for your specific flow
 * ============================================================================= */

// Define your flow steps and options
const FLOW_STEPS = [
  {
    id: 1,
    question: "What type of care are you looking for?",
    options: [
      {
        value: "physical",
        title: "Annual physical / checkup",
        description: "Comprehensive preventative examination to assess overall health",
      },
      {
        value: "issue",
        title: "I need care for an issue, condition or problem",
        description: "Find treatment for a new issue or ongoing care for a diagnosed condition",
      },
    ],
  },
  {
    id: 2,
    question: "What is your preferred appointment type?",
    options: [
      {
        value: "in-person",
        title: "In-person visit",
        description: "Visit a provider at their office or clinic",
      },
      {
        value: "video",
        title: "Video visit",
        description: "Connect with a provider via video call from home",
      },
    ],
  },
]

export default function FlowPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [selections, setSelections] = useState<Record<number, string>>({})

  const totalSteps = FLOW_STEPS.length
  const currentStepData = FLOW_STEPS.find((step) => step.id === currentStep)

  const handleOptionSelect = (value: string) => {
    setSelections((prev) => ({ ...prev, [currentStep]: value }))

    // Auto-advance to next step or complete
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      // Flow complete - navigate to results
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    // Navigate to skip destination
    router.push("/results")
  }

  const handleComplete = () => {
    // Navigate with selections or handle completion
    console.log("Flow complete with selections:", selections)
    router.push("/results")
  }

  if (!currentStepData) {
    return null
  }

  return (
    <Flow
      currentStep={currentStep}
      totalSteps={totalSteps}
      onSkip={handleSkip}
      onBack={currentStep > 1 ? handleBack : undefined}
      skipLabel="Skip"
      className="min-h-screen"
    >
      <FlowHeader>
        <FlowProgress />
      </FlowHeader>

      <FlowContent>
        <FlowQuestion title={currentStepData.question} />
        <FlowOptions
          value={selections[currentStep] || ""}
          onValueChange={handleOptionSelect}
        >
          {currentStepData.options.map((option) => (
            <FlowOption
              key={option.value}
              title={option.title}
              description={option.description}
              value={option.value}
            />
          ))}
        </FlowOptions>
      </FlowContent>

      <FlowFooter
        nextButton={
          selections[currentStep] && currentStep < totalSteps ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)}>
              Continue
            </Button>
          ) : selections[currentStep] ? (
            <Button onClick={handleComplete}>Complete</Button>
          ) : null
        }
      />
    </Flow>
  )
}

/* =============================================================================
 * EXPORTS
 * Export components for reuse in documentation/previews
 * ============================================================================= */

export {
  Flow,
  FlowHeader,
  FlowProgress,
  FlowContent,
  FlowQuestion,
  FlowOptions,
  FlowOption,
  FlowFooter,
  flowContentVariants,
}
