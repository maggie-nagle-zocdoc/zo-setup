"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const linkVariants = cva(
  // Base styles
  [
    "inline font-semibold underline",
    "text-[var(--text-link)]",
    "hover:text-[var(--color-charcoal-70)]",
    "transition-colors cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--stroke-keyboard)] focus-visible:ring-offset-2",
  ],
  {
    variants: {
      size: {
        default: [
          "text-[16px]", // body: 16px
          "leading-[26px]", // body line-height: 26px
        ],
        small: [
          "text-[14px]", // subbody: 14px
          "leading-[20px]", // subbody line-height: 20px
        ],
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  asChild?: boolean
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "a"
    return (
      <Comp
        className={cn(linkVariants({ size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Link.displayName = "Link"

export { Link, linkVariants }

