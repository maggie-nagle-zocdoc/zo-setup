"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { Icon } from "./icon"

// Accordion Root
const accordionRootVariants = cva(["w-full"])

// Accordion Item
const accordionItemVariants = cva([
  "border-b border-[var(--stroke-default)]",
  "last:border-b-0",
  "group", // For hover state propagation
])

// Accordion Trigger variants
const accordionTriggerVariants = cva(
  [
    "flex flex-1 items-center justify-between",
    "py-4",
    "text-[16px] leading-[26px] font-semibold",
    "text-[var(--text-default)]",
    "text-left",
    "cursor-pointer",
    "transition-all",
    // Focus state
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--stroke-keyboard)] focus-visible:ring-offset-2",
    // Chevron rotation on open
    "[&[data-state=open]_.accordion-icon]:rotate-180",
  ],
  {
    variants: {
      size: {
        default: "py-4",
        compact: "py-3",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

// Accordion Content variants
const accordionContentVariants = cva([
  "overflow-hidden",
  "text-[16px] leading-[26px]",
  "text-[var(--text-whisper)]",
  // Animation
  "data-[state=closed]:animate-accordion-up",
  "data-[state=open]:animate-accordion-down",
])

// Accordion Root
type AccordionProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>

const Accordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  AccordionProps
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Root
    ref={ref}
    className={cn(accordionRootVariants(), className)}
    {...props}
  />
))
Accordion.displayName = "Accordion"

// Accordion Item
type AccordionItemProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(accordionItemVariants(), className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

// Accordion Header
type AccordionHeaderProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Header>

const AccordionHeader = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Header>,
  AccordionHeaderProps
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Header
    ref={ref}
    className={cn("flex", className)}
    {...props}
  />
))
AccordionHeader.displayName = "AccordionHeader"

// Accordion Trigger
type AccordionTriggerProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> &
  VariantProps<typeof accordionTriggerVariants>

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, size, ...props }, ref) => (
  <AccordionHeader>
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(accordionTriggerVariants({ size }), className)}
      {...props}
    >
      {children}
      <Icon 
        name="keyboard_arrow_down" 
        size="24"
        className={cn(
          "accordion-icon",
          "shrink-0 ml-4",
          "text-[var(--icon-default)]",
          "transition-all duration-200",
          // Show hover color when parent row is hovered
          "group-hover:text-[var(--icon-whisper)]",
        )}
      />
    </AccordionPrimitive.Trigger>
  </AccordionHeader>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

// Accordion Content
type AccordionContentProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> &
  VariantProps<typeof accordionContentVariants>

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  AccordionContentProps
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(accordionContentVariants(), className)}
    {...props}
  >
    <div className="pb-4 pt-0">{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
  accordionRootVariants,
  accordionItemVariants,
  accordionTriggerVariants,
  accordionContentVariants,
}
export type {
  AccordionProps,
  AccordionItemProps,
  AccordionHeaderProps,
  AccordionTriggerProps,
  AccordionContentProps,
}
