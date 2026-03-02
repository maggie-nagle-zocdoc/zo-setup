"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

// Context to pass variant and fullWidth from TabsList to TabsTrigger
type TabsVariant = "underline" | "segmented"
interface TabsContextValue {
  variant: TabsVariant
  fullWidth: boolean
}
const TabsContext = React.createContext<TabsContextValue>({
  variant: "underline",
  fullWidth: false,
})

const tabsListVariants = cva(
  [
    "inline-flex",
  ],
  {
    variants: {
      variant: {
        underline: [
          "items-end",
          "gap-8", // 32px gap between tabs
          "border-b border-[var(--stroke-ui)]",
        ],
        segmented: [
          "items-center",
          "p-0.5", // 2px padding
          "gap-1", // 4px gap between segments
          "bg-[var(--background-disabled)]",
          "rounded-[4px]", // Outer radius: 4px
          "h-8", // 32px height
        ],
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
    },
    defaultVariants: {
      variant: "underline",
      fullWidth: false,
    },
  }
)

const tabsTriggerVariants = cva(
  [
    // Base layout
    "inline-flex items-center justify-center gap-2",
    "whitespace-nowrap",
    // Focus state
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--stroke-keyboard)] focus-visible:ring-offset-2",
    // Disabled state
    "disabled:pointer-events-none disabled:text-[var(--text-disabled)]",
  ],
  {
    variants: {
      variant: {
        underline: [
          "pb-3", // Padding bottom for spacing above border
          // Border-based indicator (sits on top of tab list border)
          "border-b border-transparent",
          "-mb-px", // Pull down to overlap with tab list border
          // Typography - body: 16px/26px
          "text-[16px] leading-[26px]",
          "font-medium",
          "text-[var(--text-whisper)]",
          // Hover state
          "hover:text-[var(--text-default)]",
          // Selected state - border becomes visible
          "data-[state=active]:font-semibold",
          "data-[state=active]:text-[var(--text-default)]",
          "data-[state=active]:border-[var(--state-selected-dark)]",
        ],
        segmented: [
          "flex-1",
          "h-full", // Fill container height
          "px-4", // 16px horizontal padding
          "rounded-[3px]", // Inner radius: 3px
          // Typography - subbody: 14px/20px
          "text-[14px] leading-[20px]",
          "font-semibold",
          "text-[var(--text-default)]",
          // Selected state - white background with shadow
          "data-[state=active]:bg-[var(--background-default-white)]",
          "data-[state=active]:shadow-[0px_1px_4px_0px_rgba(0,0,0,0.2)]",
        ],
      },
    },
    defaultVariants: {
      variant: "underline",
    },
  }
)

const tabsContentVariants = cva(
  [
    "mt-4",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--stroke-keyboard)] focus-visible:ring-offset-2",
  ],
  {
    variants: {},
    defaultVariants: {},
  }
)

// Tabs Root
interface TabsProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {}

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(({ className, id, ...props }, ref) => {
  const reactId = React.useId()
  const tabsId = id || reactId
  
  return (
    <TabsPrimitive.Root
      ref={ref}
      id={tabsId}
      className={cn("w-full", className)}
      {...props}
    />
  )
})
Tabs.displayName = TabsPrimitive.Root.displayName

// Tabs List
interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant = "underline", fullWidth = false, children, ...props }, ref) => (
  <TabsContext.Provider value={{ variant: variant ?? "underline", fullWidth: fullWidth ?? false }}>
    <TabsPrimitive.List
      ref={ref}
      className={cn(tabsListVariants({ variant, fullWidth }), className)}
      {...props}
    >
      {children}
    </TabsPrimitive.List>
  </TabsContext.Provider>
))
TabsList.displayName = TabsPrimitive.List.displayName

// Tabs Trigger
interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, children, ...props }, ref) => {
  const { variant, fullWidth } = React.useContext(TabsContext)
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        tabsTriggerVariants({ variant }),
        // For segmented non-fullWidth, use 24px padding instead of 16px
        variant === "segmented" && !fullWidth && "px-6",
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

// Tabs Content
interface TabsContentProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>,
    VariantProps<typeof tabsContentVariants> {}

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(tabsContentVariants(), className)}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsListVariants,
  tabsTriggerVariants,
  tabsContentVariants,
}
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps }
