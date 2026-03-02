"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { Icon } from "./icon"

const paginationVariants = cva("inline-flex items-center gap-2")

const paginationButtonVariants = cva(
  [
    "inline-flex items-center justify-center",
    "bg-transparent",
    "font-semibold",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--stroke-keyboard)]",
    "disabled:cursor-not-allowed",
    "rounded-[var(--radius-button)]",
    // Transparent border to prevent layout shift when active
    "border border-transparent",
    // Match IconButton styling
    "text-[var(--icon-default)]",
    "hover:bg-[var(--state-hover)]",
    "active:bg-[var(--state-pressed)]",
    "disabled:text-[var(--icon-disabled)]",
    "disabled:hover:bg-transparent",
    "disabled:active:bg-transparent",
    // Small size styles
    "h-[var(--button-height-small)]",
    "px-3",
    "gap-1.5",
    "text-[14px]",
    "leading-[20px]",
  ],
  {
    variants: {
      isActive: {
        true: "border-[var(--stroke-ui)]",
        false: "",
      },
      isPageNumber: {
        true: "min-w-8 px-2",
        false: "",
      },
    },
    defaultVariants: {
      isActive: false,
      isPageNumber: false,
    },
  }
)

const paginationEllipsisVariants = cva([
  "inline-flex items-center justify-center",
  "text-[var(--icon-whisper)]",
  "select-none",
  "h-[var(--button-height-small)]",
  "min-w-8",
  "text-[14px]",
])

// Generate page numbers with ellipsis for truncation
function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  siblingCount: number = 1
): (number | "ellipsis")[] {
  const totalPageNumbers = siblingCount * 2 + 5 // siblings + first + last + current + 2 ellipsis

  // If total pages is less than what we want to show, return all pages
  if (totalPages <= totalPageNumbers - 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

  const showLeftEllipsis = leftSiblingIndex > 2
  const showRightEllipsis = rightSiblingIndex < totalPages - 1

  if (!showLeftEllipsis && showRightEllipsis) {
    // Show first pages + ellipsis + last page
    const leftItemCount = 3 + 2 * siblingCount
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1)
    return [...leftRange, "ellipsis", totalPages]
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    // Show first page + ellipsis + last pages
    const rightItemCount = 3 + 2 * siblingCount
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i + 1
    )
    return [1, "ellipsis", ...rightRange]
  }

  if (showLeftEllipsis && showRightEllipsis) {
    // Show first + ellipsis + middle pages + ellipsis + last
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    )
    return [1, "ellipsis", ...middleRange, "ellipsis", totalPages]
  }

  return Array.from({ length: totalPages }, (_, i) => i + 1)
}

export interface PaginationProps
  extends React.HTMLAttributes<HTMLElement> {
  /** Current active page (1-indexed) */
  currentPage: number
  /** Total number of pages */
  totalPages: number
  /** Callback when page changes */
  onPageChange: (page: number) => void
  /** Number of sibling pages to show on each side of current page */
  siblingCount?: number
  /** Whether to show Previous/Next buttons */
  showNavigation?: boolean
  /** Text for previous button */
  previousLabel?: string
  /** Text for next button */
  nextLabel?: string
}

const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  (
    {
      className,
      currentPage,
      totalPages,
      onPageChange,
      siblingCount = 1,
      showNavigation = true,
      previousLabel = "Previous",
      nextLabel = "Next",
      ...props
    },
    ref
  ) => {
    const pages = generatePageNumbers(currentPage, totalPages, siblingCount)
    const canGoPrevious = currentPage > 1
    const canGoNext = currentPage < totalPages

    return (
      <nav
        ref={ref}
        role="navigation"
        aria-label="Pagination"
        className={cn(paginationVariants(), className)}
        {...props}
      >
        {showNavigation && (
          <button
            type="button"
            className={cn(paginationButtonVariants())}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canGoPrevious}
            aria-label="Go to previous page"
          >
            <Icon name="chevron_left" size="20" />
            {previousLabel}
          </button>
        )}

        {pages.map((page, index) => {
          if (page === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                className={cn(paginationEllipsisVariants())}
                aria-hidden="true"
              >
                <Icon name="more_horiz" size="20" />
              </span>
            )
          }

          const isActive = page === currentPage
          return (
            <button
              key={page}
              type="button"
              className={cn(paginationButtonVariants({ isActive, isPageNumber: true }))}
              onClick={() => onPageChange(page)}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Page ${page}`}
            >
              {page}
            </button>
          )
        })}

        {showNavigation && (
          <button
            type="button"
            className={cn(paginationButtonVariants())}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canGoNext}
            aria-label="Go to next page"
          >
            {nextLabel}
            <Icon name="chevron_right" size="20" />
          </button>
        )}
      </nav>
    )
  }
)
Pagination.displayName = "Pagination"

// Standalone button components for custom pagination layouts
const PaginationButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof paginationButtonVariants>
>(({ className, isActive, isPageNumber, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(paginationButtonVariants({ isActive, isPageNumber }), className)}
    {...props}
  />
))
PaginationButton.displayName = "PaginationButton"

const PaginationPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    label?: string
  }
>(({ className, label = "Previous", ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-label="Go to previous page"
    className={cn(paginationButtonVariants(), className)}
    {...props}
  >
    <Icon name="chevron_left" size="20" />
    {label}
  </button>
))
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    label?: string
  }
>(({ className, label = "Next", ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-label="Go to next page"
    className={cn(paginationButtonVariants(), className)}
    {...props}
  >
    {label}
    <Icon name="chevron_right" size="20" />
  </button>
))
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    aria-hidden="true"
    className={cn(paginationEllipsisVariants(), className)}
    {...props}
  >
    <Icon name="more_horiz" size="20" />
  </span>
))
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationButton,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  paginationVariants,
  paginationButtonVariants,
  paginationEllipsisVariants,
}
