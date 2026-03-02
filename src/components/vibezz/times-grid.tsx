"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { useIsMobile } from "../../hooks/use-mobile"

// =============================================================================
// TYPES
// =============================================================================

export interface TimeSlot {
  /** The date for this time slot */
  date: Date
  /** Number of appointments available (0 = no availability) */
  appointmentCount: number
}

export interface HourSlot {
  /** The date for this time slot */
  date: Date
  /** Display time string (e.g. "9:00 am") */
  time: string
}

export interface TimesGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Grid variant: day-level or hourly time slots */
  variant?: "day" | "hourly"
  /** Array of day-level time slots (used with variant="day") */
  slots?: TimeSlot[]
  /** Array of hourly time slots (used with variant="hourly") */
  hourSlots?: HourSlot[]
  /** Date header for the hour view */
  headerDate?: Date
  /** Callback when a date tile is clicked (day view) */
  onDateSelect?: (date: Date, appointmentCount: number) => void
  /** Callback when a time slot is clicked (hour view) */
  onTimeSelect?: (date: Date, time: string) => void
  /** Callback when "More" button is clicked (mobile) */
  onMoreClick?: () => void
  /** Maximum visible slots on mobile before showing "More" button */
  mobileMaxSlots?: number
}

export interface TimesGridEmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The empty state variant to display */
  state: "next-availability" | "no-availability" | "notify-me"
  /** Date of next availability (used when state is "next-availability") */
  nextAvailabilityDate?: Date
  /** Callback when "Next availability" CTA is clicked */
  onNextAvailability?: () => void
  /** Callback when "Notify me" button is clicked */
  onNotifyMe?: () => void
}

// =============================================================================
// TIME TILE (Internal Component — Day View)
// =============================================================================

const timeTileVariants = cva(
  [
    "flex flex-col rounded-[4px] transition-colors cursor-pointer",
    "text-[14px] leading-[20px]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--stroke-keyboard)] focus-visible:ring-offset-2",
  ],
  {
    variants: {
      state: {
        available: [
          "bg-[var(--core-yellow)] text-[var(--text-default)]",
          "hover:bg-[var(--state-brand-hover)]",
          "active:bg-[var(--state-brand-pressed)]",
        ],
        empty: [
          "bg-[var(--background-disabled)] text-[var(--text-disabled)]",
          "cursor-default",
        ],
      },
      viewport: {
        desktop: "h-[100px] p-2 justify-between items-start",
        mobile: "gap-1 px-3 py-2 items-start",
      },
    },
    defaultVariants: {
      state: "available",
      viewport: "desktop",
    },
  }
)

interface TimeTileProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof timeTileVariants> {
  /** The date to display */
  date: Date
  /** Number of appointments */
  appointmentCount: number
  /** Click handler */
  onSelect?: () => void
}

function TimeTile({
  className,
  state,
  viewport,
  date,
  appointmentCount,
  onSelect,
  ...props
}: TimeTileProps) {
  const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" })
  const monthDay = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const isAvailable = appointmentCount > 0
  const computedState = state ?? (isAvailable ? "available" : "empty")

  const handleClick = () => {
    if (isAvailable && onSelect) {
      onSelect()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && isAvailable && onSelect) {
      e.preventDefault()
      onSelect()
    }
  }

  if (viewport === "mobile") {
    return (
      <button
        type="button"
        className={cn(timeTileVariants({ state: computedState, viewport }), className)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={!isAvailable}
        aria-label={`${monthDay}, ${appointmentCount} appointments`}
        {...props}
      >
        <span className="font-medium">{monthDay}</span>
        <span className="font-semibold whitespace-nowrap">
          {isAvailable ? `${appointmentCount} appts` : "No appts"}
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      className={cn(timeTileVariants({ state: computedState, viewport }), "flex-1 min-w-0", className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={!isAvailable}
      aria-label={`${dayOfWeek} ${monthDay}, ${appointmentCount} appointments`}
      {...props}
    >
      <div className="flex flex-col items-start pb-0.5">
        <span className="font-semibold">{dayOfWeek}</span>
        <span className="font-medium">{monthDay}</span>
      </div>
      <div className="flex flex-col items-start pb-1">
        <span className="font-semibold">
          {isAvailable ? appointmentCount : "No"}
        </span>
        <span className="font-medium">appts</span>
      </div>
    </button>
  )
}

// =============================================================================
// HOUR TILE (Internal Component — Hour View)
// =============================================================================

const hourTileVariants = cva(
  [
    "flex items-center justify-center rounded-[4px] transition-colors cursor-pointer",
    "text-[14px] leading-[20px] font-semibold",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--stroke-keyboard)] focus-visible:ring-offset-2",
  ],
  {
    variants: {
      viewport: {
        desktop: "h-8 px-3",
        mobile: "h-8 px-3",
      },
    },
    defaultVariants: {
      viewport: "desktop",
    },
  }
)

interface HourTileProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Display time string */
  time: string
  /** Click handler */
  onSelect?: () => void
  /** Viewport variant */
  viewport?: "desktop" | "mobile"
}

function HourTile({
  className,
  time,
  viewport = "desktop",
  onSelect,
  ...props
}: HourTileProps) {
  return (
    <button
      type="button"
      className={cn(
        hourTileVariants({ viewport }),
        "bg-[var(--core-yellow)] text-[var(--text-default)]",
        "hover:bg-[var(--state-brand-hover)]",
        "active:bg-[var(--state-brand-pressed)]",
        className
      )}
      onClick={onSelect}
      aria-label={`Select ${time}`}
      {...props}
    >
      {time}
    </button>
  )
}

// =============================================================================
// MORE BUTTON (Mobile)
// =============================================================================

const moreButtonVariants = cva([
  "flex items-center justify-center rounded-[4px]",
  "bg-white border border-[var(--stroke-ui)]",
  "text-[14px] leading-[20px] font-semibold text-[var(--text-default)]",
  "h-[60px] w-[92px] px-3 py-2 shrink-0",
  "cursor-pointer transition-colors",
  "hover:bg-[var(--state-hover)]",
  "active:bg-[var(--state-pressed)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--stroke-keyboard)] focus-visible:ring-offset-2",
])

interface MoreButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function MoreButton({ className, ...props }: MoreButtonProps) {
  return (
    <button
      type="button"
      className={cn(moreButtonVariants(), className)}
      {...props}
    >
      More
    </button>
  )
}

// =============================================================================
// TIMES GRID EMPTY STATE (Exported Component)
// =============================================================================

function TimesGridEmptyState({
  className,
  state,
  nextAvailabilityDate,
  onNextAvailability,
  onNotifyMe,
  ...props
}: TimesGridEmptyStateProps) {
  if (state === "next-availability" && nextAvailabilityDate) {
    const formattedDate = nextAvailabilityDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })

    return (
      <div className={cn("flex flex-col items-center justify-center h-[204px] px-11 w-full", className)} {...props}>
        <button
          type="button"
          onClick={onNextAvailability}
          className={cn(
            "w-full h-8 px-3 rounded-[4px]",
            "bg-[var(--core-yellow)] text-[var(--text-default)]",
            "text-[14px] leading-[20px] font-semibold",
            "cursor-pointer transition-colors",
            "hover:bg-[var(--state-brand-hover)]",
            "active:bg-[var(--state-brand-pressed)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--stroke-keyboard)] focus-visible:ring-offset-2"
          )}
        >
          Next availability is {formattedDate}
        </button>
      </div>
    )
  }

  if (state === "no-availability") {
    return (
      <div className={cn("flex flex-col items-center justify-center h-[204px] px-5 w-full", className)} {...props}>
        <p className="text-[14px] leading-[20px] font-medium text-[var(--text-whisper)] text-center">
          At the moment, there&apos;s no availability on Zocdoc for the selected date range and appointment type at this location.
        </p>
      </div>
    )
  }

  if (state === "notify-me") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-[9px] h-[204px] px-5 w-full", className)} {...props}>
        <button
          type="button"
          onClick={onNotifyMe}
          className={cn(
            "w-full h-8 px-3 rounded-[4px]",
            "bg-white border border-[var(--stroke-charcoal)]",
            "text-[14px] leading-[20px] font-semibold text-[var(--text-default)]",
            "cursor-pointer transition-colors",
            "hover:bg-[var(--state-hover)]",
            "active:bg-[var(--state-pressed)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--stroke-keyboard)] focus-visible:ring-offset-2"
          )}
        >
          Notify me
        </button>
        <div className="p-4 w-full">
          <p className="text-[14px] leading-[20px] font-medium text-[var(--text-whisper)]">
            At this time, the provider has no availability on Zocdoc at this location for appointments that meet your search criteria.
          </p>
        </div>
      </div>
    )
  }

  return null
}

// =============================================================================
// TIMES GRID (Exported Component)
// =============================================================================

const timesGridVariants = cva("flex relative", {
  variants: {
    viewport: {
      desktop: "flex-col gap-1 w-full",
      mobile: "gap-1 items-start overflow-x-auto",
    },
  },
  defaultVariants: {
    viewport: "desktop",
  },
})

function TimesGrid({
  className,
  variant = "day",
  slots = [],
  hourSlots = [],
  headerDate,
  onDateSelect,
  onTimeSelect,
  onMoreClick,
  mobileMaxSlots = 13,
  ...props
}: TimesGridProps) {
  const isMobile = useIsMobile()
  const viewport = isMobile ? "mobile" : "desktop"

  // ─── Hour View ──────────────────────────────────────────────────────
  if (variant === "hourly") {
    const formattedHeader = headerDate
      ? headerDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
      : undefined

    return (
      <div
        className={cn("flex flex-col gap-2 w-full", className)}
        role="group"
        aria-label="Available appointment times"
        {...props}
      >
        {formattedHeader && (
          <p className="text-[16px] leading-[24px] font-semibold text-[var(--text-default)]">
            {formattedHeader}
          </p>
        )}
        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))" }}
        >
          {hourSlots.map((slot, index) => (
            <HourTile
              key={`${slot.time}-${index}`}
              time={slot.time}
              viewport={viewport}
              onSelect={() => onTimeSelect?.(slot.date, slot.time)}
            />
          ))}
        </div>
      </div>
    )
  }

  // ─── Day View ───────────────────────────────────────────────────────

  // Mobile day view
  if (isMobile) {
    const visibleSlots = slots.slice(0, mobileMaxSlots)
    const hasMore = slots.length > mobileMaxSlots

    return (
      <div
        className={cn(timesGridVariants({ viewport }), className)}
        role="group"
        aria-label="Available appointment dates"
        {...props}
      >
        {visibleSlots.map((slot, index) => (
          <TimeTile
            key={`${slot.date.toISOString()}-${index}`}
            date={slot.date}
            appointmentCount={slot.appointmentCount}
            viewport="mobile"
            onSelect={() => onDateSelect?.(slot.date, slot.appointmentCount)}
          />
        ))}
        {hasMore && <MoreButton onClick={onMoreClick} />}
      </div>
    )
  }

  // Desktop day view — group slots into weeks (7 days per row)
  const weeks: TimeSlot[][] = []
  for (let i = 0; i < slots.length; i += 7) {
    weeks.push(slots.slice(i, i + 7))
  }

  // Determine if More button should appear in the last row
  const lastWeek = weeks[weeks.length - 1]
  const showMoreInLastRow = onMoreClick && lastWeek && lastWeek.length < 7

  return (
    <div
      className={cn(timesGridVariants({ viewport }), className)}
      role="group"
      aria-label="Available appointment dates"
      {...props}
    >
      {weeks.map((week, weekIndex) => {
        const isLastRow = weekIndex === weeks.length - 1

        return (
          <div
            key={`week-${weekIndex}`}
            className="flex gap-1 w-full"
            role="row"
          >
            {week.map((slot, slotIndex) => (
              <TimeTile
                key={`${slot.date.toISOString()}-${slotIndex}`}
                date={slot.date}
                appointmentCount={slot.appointmentCount}
                viewport="desktop"
                onSelect={() => onDateSelect?.(slot.date, slot.appointmentCount)}
              />
            ))}
            {/* More button in last row */}
            {isLastRow && showMoreInLastRow && (
              <button
                type="button"
                onClick={onMoreClick}
                className={cn(
                  "flex items-center justify-center flex-1 min-w-0 h-[100px] rounded-[4px]",
                  "bg-transparent border border-[var(--stroke-charcoal)]",
                  "text-[14px] leading-[20px] font-semibold text-[var(--text-default)]",
                  "cursor-pointer transition-colors",
                  "hover:bg-[var(--state-hover)]",
                  "active:bg-[var(--state-pressed)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--stroke-keyboard)] focus-visible:ring-offset-2"
                )}
              >
                More
              </button>
            )}
            {/* Fill remaining slots if row is incomplete */}
            {(() => {
              const filledCount = week.length + (isLastRow && showMoreInLastRow ? 1 : 0)
              return filledCount < 7
                ? Array.from({ length: 7 - filledCount }).map((_, i) => (
                    <div key={`empty-${i}`} className="flex-1 min-w-0" />
                  ))
                : null
            })()}
          </div>
        )
      })}
    </div>
  )
}

export { TimesGrid, TimesGridEmptyState, timesGridVariants, timeTileVariants, hourTileVariants }
