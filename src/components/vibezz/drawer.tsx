"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"
import { cn } from "../../lib/utils"
import { IconButton } from "./icon-button"

type DrawerRootProps = React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Root>

function Drawer(props: DrawerRootProps) {
  return <DrawerPrimitive.Root direction="right" {...props} />
}
Drawer.displayName = "Drawer"

const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerPortal = DrawerPrimitive.Portal

const DrawerClose = DrawerPrimitive.Close

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50",
      "bg-[var(--background-backdrop)]",
      className
    )}
    {...props}
  />
))
DrawerOverlay.displayName = "DrawerOverlay"

interface DrawerContentProps
  extends React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> {
  /** Show a close button */
  showCloseButton?: boolean
}

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  DrawerContentProps
>(
  (
    { className, children, showCloseButton = true, ...props },
    ref
  ) => {
    return (
      <DrawerPortal>
        <DrawerOverlay />
        <DrawerPrimitive.Content
          ref={ref}
          className={cn(
            "fixed z-50 flex flex-col",
            "bg-[var(--color-white)]",
            "border-[var(--stroke-default)]",
            "inset-y-0 right-0",
            "h-full w-[540px] max-w-[90vw]",
            "border-l",
            className
          )}
          {...props}
        >
          {children}
          {showCloseButton && (
            <DrawerPrimitive.Close asChild>
              <IconButton
                icon="close"
                aria-label="Close"
                className="absolute right-4 top-4"
              />
            </DrawerPrimitive.Close>
          )}
        </DrawerPrimitive.Content>
      </DrawerPortal>
    )
  }
)
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col gap-1.5 p-6 pb-0 text-left", className)}
    {...props}
  />
)
DrawerHeader.displayName = "DrawerHeader"

interface DrawerFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional content (e.g., link) to display on the far left, vertically centered */
  leftContent?: React.ReactNode
}

const DrawerFooter = ({
  className,
  leftContent,
  children,
  ...props
}: DrawerFooterProps) => (
  <div
    className={cn(
      "mt-auto flex flex-col-reverse sm:flex-row sm:items-center gap-2 p-6",
      "border-t border-[var(--stroke-default)]",
      leftContent ? "sm:justify-between" : "sm:justify-end",
      className
    )}
    {...props}
  >
    {leftContent && <div className="sm:order-first">{leftContent}</div>}
    <div className="flex flex-col-reverse sm:flex-row gap-2 sm:order-last">
      {children}
    </div>
  </div>
)
DrawerFooter.displayName = "DrawerFooter"

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-[20px] leading-[26px]", // title-2: 20px, line-height: 26px
      "font-semibold text-[var(--text-default)]",
      className
    )}
    {...props}
  />
))
DrawerTitle.displayName = "DrawerTitle"

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn(
      "text-[16px] leading-[26px]", // body: 16px, line-height: 26px
      "text-[var(--text-whisper)]",
      className
    )}
    {...props}
  />
))
DrawerDescription.displayName = "DrawerDescription"

/** Scrollable body content area for drawer */
const DrawerBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex-1 overflow-y-auto px-6 py-4", className)}
    {...props}
  />
)
DrawerBody.displayName = "DrawerBody"

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}

export type { DrawerRootProps, DrawerContentProps, DrawerFooterProps }

