"use client"

import * as React from "react"
import { useState, useCallback } from "react"
import { type ColumnDef, type RowSelectionState, type TableOptions } from "@tanstack/react-table"
import { Checkbox } from "./checkbox"
import { IconButton } from "./icon-button"
import { Icon } from "./icon"
import { Button } from "./button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

/* =============================================================================
 * TABLE PATTERNS
 * Reusable column helpers and hooks for common DataTable patterns
 * ============================================================================= */

/* -----------------------------------------------------------------------------
 * Selection Pattern
 * Adds a checkbox column for row selection with "select all" header
 * -------------------------------------------------------------------------- */

/**
 * Creates a selection column with checkbox for each row and "select all" in header.
 * Use with `useTableSelection()` hook to manage selection state.
 * 
 * @example
 * const { rowSelection, tableOptions } = useTableSelection()
 * const columns = [
 *   createSelectionColumn<MyRowType>(),
 *   { accessorKey: "name", header: "Name" },
 * ]
 * <DataTable columns={columns} data={data} tableOptions={tableOptions} />
 */
export function createSelectionColumn<T>(): ColumnDef<T> {
  return {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          size="small"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          size="small"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  }
}

/**
 * Hook for managing table row selection state.
 * Returns selection state and tableOptions to pass to DataTable.
 * 
 * @example
 * const { rowSelection, setRowSelection, tableOptions, selectedRows } = useTableSelection()
 * <DataTable columns={columns} data={data} tableOptions={tableOptions} />
 * 
 * // Access selected row IDs
 * console.log(Object.keys(rowSelection).filter(id => rowSelection[id]))
 */
export function useTableSelection<T>() {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const tableOptions: Partial<TableOptions<T>> = {
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
  }

  // Helper to get selected row indices
  const getSelectedRowIds = useCallback(() => {
    return Object.keys(rowSelection).filter((id) => rowSelection[id])
  }, [rowSelection])

  // Helper to clear selection
  const clearSelection = useCallback(() => {
    setRowSelection({})
  }, [])

  return {
    rowSelection,
    setRowSelection,
    tableOptions,
    getSelectedRowIds,
    clearSelection,
  }
}

/* -----------------------------------------------------------------------------
 * Actions Pattern
 * Adds an actions column with custom content (typically overflow menu)
 * -------------------------------------------------------------------------- */

/**
 * Creates an actions column that renders custom content for each row.
 * Typically used for overflow menus, edit buttons, or row-specific actions.
 * 
 * @param renderActions - Function that receives the row data and returns action elements
 * 
 * @example
 * const columns = [
 *   { accessorKey: "name", header: "Name" },
 *   createActionsColumn<MyRowType>((row) => (
 *     <IconButton icon="more_vert" aria-label="Actions" onClick={() => handleEdit(row)} />
 *   )),
 * ]
 */
export function createActionsColumn<T>(
  renderActions: (row: T) => React.ReactNode
): ColumnDef<T> {
  return {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        {renderActions(row.original)}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  }
}

/**
 * Default actions column with an overflow menu button.
 * Use when you just need a simple actions trigger.
 * 
 * @param onAction - Callback when action button is clicked, receives row data
 * 
 * @example
 * const columns = [
 *   { accessorKey: "name", header: "Name" },
 *   createDefaultActionsColumn<MyRowType>((row) => {
 *     console.log("Action clicked for:", row.name)
 *   }),
 * ]
 */
export function createDefaultActionsColumn<T>(
  onAction?: (row: T) => void
): ColumnDef<T> {
  return createActionsColumn<T>((row) => (
    <IconButton
      icon="more_vert"
      size="small"
      aria-label="More actions"
      onClick={() => onAction?.(row)}
    />
  ))
}

/* -----------------------------------------------------------------------------
 * Header with Tooltip Pattern
 * Creates a header with an info icon that shows a tooltip on hover
 * -------------------------------------------------------------------------- */

/**
 * Creates a header renderer with label and info tooltip.
 * Use for columns that need additional context or explanation.
 * 
 * @param label - The header text
 * @param tooltip - The tooltip content
 * 
 * @example
 * const columns = [
 *   { accessorKey: "name", header: "Name" },
 *   { 
 *     accessorKey: "status", 
 *     header: createHeaderWithTooltip("Status", "Current account status") 
 *   },
 * ]
 */
export function createHeaderWithTooltip(
  label: string,
  tooltip: string
): () => React.ReactNode {
  return function HeaderWithTooltip() {
    return (
      <div className="flex items-center gap-1">
        <span>{label}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="inline-flex">
                <Icon name="info" size="16" filled className="text-[var(--icon-whisper)]" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  }
}

/* -----------------------------------------------------------------------------
 * Editable Cell Pattern
 * Cell component with inline editing via popover
 * -------------------------------------------------------------------------- */

export interface EditableCellProps {
  /** Current cell value */
  value: string
  /** Callback when value is saved */
  onSave: (value: string) => void
  /** Placeholder text for empty values */
  placeholder?: string
}

/**
 * Editable cell component with popover for inline editing.
 * Click to open editor, Enter to save, Escape to cancel.
 * 
 * @example
 * const columns = [
 *   { 
 *     accessorKey: "name", 
 *     header: "Name",
 *     cell: ({ row }) => (
 *       <EditableCell
 *         value={row.original.name}
 *         onSave={(value) => updateRow(row.index, "name", value)}
 *       />
 *     ),
 *   },
 * ]
 */
export function EditableCell({ 
  value: initialValue, 
  onSave,
  placeholder = "Click to edit",
}: EditableCellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState(initialValue)

  // Sync internal state when prop changes
  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const handleSave = () => {
    onSave(value)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setValue(initialValue)
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    }
    if (e.key === "Escape") {
      handleCancel()
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider delayDuration={1000}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="w-[calc(100%+16px)] text-left hover:bg-[var(--state-hover)] -mx-2 -my-4 px-2 py-4 transition-colors"
              >
                {initialValue || <span className="text-[var(--text-whisper)]">{placeholder}</span>}
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            Edit
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent 
        className="w-[280px] p-3" 
        align="start"
      >
        <div className="space-y-3">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-[var(--stroke-ui)] rounded bg-[var(--color-white)] outline-none focus:border-[var(--stroke-keyboard)] focus:ring-2 focus:ring-[var(--stroke-keyboard)]/20"
            style={{
              fontSize: 'var(--font-size-subbody)',
              lineHeight: 'var(--line-height-subbody)',
            }}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="small" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" size="small" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/* -----------------------------------------------------------------------------
 * Exports
 * -------------------------------------------------------------------------- */

export type { RowSelectionState }

