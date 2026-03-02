"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "../../lib/utils"
import { IconButton } from "./icon-button"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50",
      "bg-[var(--background-backdrop)]",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
      "motion-reduce:animate-none",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
        "gap-4 p-6",
        "bg-[var(--color-white)]",
        "border border-[var(--stroke-default)]",
        "rounded-[var(--radius-dialog)]",
        "shadow-lg",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
        "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
        "motion-reduce:animate-none",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close asChild>
        <IconButton
          icon="close"
          aria-label="Close"
          className="absolute right-4 top-4"
        />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col gap-1.5 text-left", className)}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional content (e.g., link) to display on the far left, vertically centered */
  leftContent?: React.ReactNode
}

const DialogFooter = ({
  className,
  leftContent,
  children,
  ...props
}: DialogFooterProps) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:items-center gap-2",
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
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-[20px] leading-[26px]", // title-2: 20px, line-height: 26px
      "font-semibold text-[var(--text-default)]",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      "text-[16px] leading-[26px]", // body: 16px, line-height: 26px
      "text-[var(--text-whisper)]",
      className
    )}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}

