"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

type ContainerSize = "default" | "wide" | "narrow"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 
   * Container width variant
   * - `default`: Standard content width (max-width: 1440px)
   * - `wide`: Full/fluid width for data-heavy layouts (no max-width)
   * - `narrow`: Half width for focused content (max-width: 720px)
   */
  size?: ContainerSize
  /** Center the container horizontally */
  centered?: boolean
}

const containerSizes: Record<ContainerSize, string> = {
  default: "max-w-[1440px]",
  wide: "", // Full/fluid width - no max-width constraint
  narrow: "max-w-[720px]",
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = "default", centered = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-full px-4 sm:px-6 md:px-8",
          containerSizes[size],
          centered && "mx-auto",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Container.displayName = "Container"

export { Container, type ContainerProps, type ContainerSize }

