// ---------------------------------------------------------------------------
// Shared React Fiber introspection utilities
// ---------------------------------------------------------------------------

// Known Vibezz component display names
export const VIBEZZ_NAMES = new Set([
  "Accordion", "AccordionItem", "AccordionHeader", "AccordionTrigger", "AccordionContent",
  "Avatar", "AvatarImage", "AvatarFallback", "AvatarWithFallback",
  "Badge",
  "Button",
  "Checkbox", "CheckboxGroup",
  "Container",
  "Dialog", "DialogPortal", "DialogOverlay", "DialogTrigger", "DialogClose",
  "DialogContent", "DialogHeader", "DialogFooter", "DialogTitle", "DialogDescription",
  "Drawer", "DrawerPortal", "DrawerOverlay", "DrawerTrigger", "DrawerClose",
  "DrawerContent", "DrawerHeader", "DrawerBody", "DrawerFooter", "DrawerTitle", "DrawerDescription",
  "Flag",
  "Header",
  "Icon", "IconButton",
  "Input", "InputField", "TextField",
  "Link",
  "Logo",
  "Nav",
  "Pagination", "PaginationButton", "PaginationPrevious", "PaginationNext", "PaginationEllipsis",
  "Popover", "PopoverTrigger", "PopoverContent", "PopoverClose", "PopoverAnchor",
  "Progress",
  "RadioGroup", "RadioGroupItem", "RadioField", "RadioCard",
  "Section",
  "Select", "SelectGroup", "SelectValue", "SelectTrigger", "SelectContent",
  "SelectLabel", "SelectItem", "SelectSeparator", "SelectField",
  "Switch", "SwitchField",
  "Table", "TableHeader", "TableBody", "TableFooter", "TableHead",
  "TableRow", "TableCell", "TableCaption", "DataTable",
  "Tabs", "TabsList", "TabsTrigger", "TabsContent",
  "TimesGrid", "TimesGridEmptyState",
  "Textarea", "TextareaField",
  "Toast", "ToastAction", "ToastClose", "ToastDescription",
  "ToastProvider", "ToastTitle", "ToastViewport", "Toaster",
  "Tooltip", "TooltipTrigger", "TooltipContent", "TooltipProvider",
  "Map", "MapMarker", "StaticMap",
  "FieldLabel", "FieldDescription", "FieldError", "FieldHelper", "FieldWrapper",
  "EditableCell",
])

// ---------------------------------------------------------------------------
// Fiber tree walking utilities
// ---------------------------------------------------------------------------

/** Get the React fiber node attached to a DOM element */
export function getFiberFromDom(dom: Element): any {
  const key = Object.keys(dom).find(
    (k) => k.startsWith("__reactFiber$") || k.startsWith("__reactInternalInstance$")
  )
  return key ? (dom as any)[key] : null
}

/** Get the display name of a React component fiber (null for host elements) */
export function getComponentName(fiber: any): string | null {
  if (!fiber?.type) return null
  if (typeof fiber.type === "string") return null // host element
  return fiber.type.displayName || fiber.type.name || null
}

/** Walk fiber.child to find the nearest DOM element */
export function getDomNode(fiber: any): Element | null {
  let node = fiber
  while (node) {
    if (node.stateNode instanceof Element) return node.stateNode
    node = node.child
  }
  return null
}

// ---------------------------------------------------------------------------
// Inspector-specific utilities
// ---------------------------------------------------------------------------

export interface ComponentAncestor {
  name: string
  isVibezz: boolean
  props: Record<string, unknown> | null
}

/** Walk up the fiber tree and collect React component ancestors */
export function getComponentAncestry(startFiber: any, maxDepth = 20): ComponentAncestor[] {
  const ancestors: ComponentAncestor[] = []
  let fiber = startFiber?.return

  while (fiber && ancestors.length < maxDepth) {
    const name = getComponentName(fiber)
    if (name) {
      ancestors.push({
        name,
        isVibezz: VIBEZZ_NAMES.has(name),
        props: getSafeProps(fiber),
      })
    }
    fiber = fiber.return
  }

  return ancestors
}

/** Extract props from a fiber, filtering out internals and non-serializable values */
export function getSafeProps(fiber: any): Record<string, unknown> | null {
  const raw = fiber?.memoizedProps
  if (!raw || typeof raw !== "object") return null

  const SKIP_KEYS = new Set(["children", "key", "ref", "__self", "__source"])
  const result: Record<string, unknown> = {}
  let hasProps = false

  for (const [key, value] of Object.entries(raw)) {
    if (SKIP_KEYS.has(key)) continue
    if (typeof key === "symbol") continue
    if (typeof value === "function") continue
    if (typeof value === "symbol") continue
    if (value instanceof Element) continue

    // Attempt to serialize — skip if it fails
    try {
      JSON.stringify(value)
      result[key] = value
      hasProps = true
    } catch {
      result[key] = `[${typeof value}]`
      hasProps = true
    }
  }

  return hasProps ? result : null
}
