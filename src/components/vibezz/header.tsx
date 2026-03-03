"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const headerVariants = cva(
  [
    "relative",
    "flex items-center justify-between",
    "w-full",
    "font-[family-name:var(--font-sharp-sans)]",
  ],
  {
    variants: {},
    defaultVariants: {},
  }
)

export interface HeaderProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof headerVariants> {
  /** Title text displayed in the header */
  title: string
  /** Optional subtitle/description text below the title */
  subbody?: string
  /** Content for the right zone (buttons, actions) */
  right?: React.ReactNode
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ className, title, subbody, right, children, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(headerVariants({ className }))}
        {...props}
      >
        {/* Left zone - Title and subbody */}
        <div className="flex flex-col gap-1">
          <h1 className="text-[20px] leading-[26px] font-semibold text-[var(--text-default)] md:text-[24px] md:leading-[32px]">
            {title}
          </h1>
          {subbody && (
            <p className="text-[16px] leading-[26px] font-medium text-[var(--text-secondary)]">
              {subbody}
            </p>
          )}
        </div>
        
        {/* Right zone */}
        {right && (
          <div className="flex items-center justify-end shrink-0 gap-3">
            {right}
          </div>
        )}
        
        {/* Allow custom children if not using zones */}
        {children}
      </header>
    )
  }
)
Header.displayName = "Header"

export { Header, headerVariants }

