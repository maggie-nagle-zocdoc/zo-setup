// =============================================================================
// UI COMPONENTS INDEX
// =============================================================================

// Load Material Symbols font for icons
import "material-symbols/rounded.css"

// -----------------------------------------------------------------------------
// Field Primitives (shared form field styling)
// -----------------------------------------------------------------------------
export {
  labelVariants,
  helperTextVariants,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldHelper,
  FieldWrapper,
} from "./field-primitives"
export type {
  FieldLabelProps,
  FieldDescriptionProps,
  FieldErrorProps,
  FieldHelperProps,
  FieldWrapperProps,
} from "./field-primitives"

// Backwards compatibility alias
export { FieldError as ErrorMessage } from "./field-primitives"
export type { FieldErrorProps as ErrorMessageProps } from "./field-primitives"

// -----------------------------------------------------------------------------
// Accordion
// -----------------------------------------------------------------------------
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
} from "./accordion"
export type {
  AccordionProps,
  AccordionItemProps,
  AccordionHeaderProps,
  AccordionTriggerProps,
  AccordionContentProps,
} from "./accordion"

// -----------------------------------------------------------------------------
// Avatar
// -----------------------------------------------------------------------------
export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarWithFallback,
  avatarVariants,
  avatarFallbackVariants,
} from "./avatar"
export type {
  AvatarProps,
  AvatarImageProps,
  AvatarFallbackProps,
  AvatarWithFallbackProps,
} from "./avatar"

// -----------------------------------------------------------------------------
// Badge
// -----------------------------------------------------------------------------
export { Badge, badgeVariants } from "./badge"
export type { BadgeProps } from "./badge"

// -----------------------------------------------------------------------------
// Button
// -----------------------------------------------------------------------------
export { Button, buttonVariants } from "./button"
export type { ButtonProps } from "./button"

// -----------------------------------------------------------------------------
// Checkbox
// -----------------------------------------------------------------------------
export { Checkbox, checkboxVariants } from "./checkbox"
export type { CheckboxProps } from "./checkbox"

export { CheckboxGroup, useCheckboxGroup } from "./checkbox-group"
export type { CheckboxGroupProps } from "./checkbox-group"

// -----------------------------------------------------------------------------
// Container (Layout primitive)
// -----------------------------------------------------------------------------
export { Container } from "./container"
export type { ContainerProps, ContainerSize } from "./container"

// -----------------------------------------------------------------------------
// Dialog
// -----------------------------------------------------------------------------
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
} from "./dialog"

// -----------------------------------------------------------------------------
// Drawer
// -----------------------------------------------------------------------------
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
} from "./drawer"
export type {
  DrawerRootProps,
  DrawerContentProps,
  DrawerFooterProps,
} from "./drawer"

// -----------------------------------------------------------------------------
// Flag
// -----------------------------------------------------------------------------
export { Flag, flagVariants } from "./flag"
export type { FlagProps, FlagActionButtonProps } from "./flag"

// -----------------------------------------------------------------------------
// Header (Page header)
// -----------------------------------------------------------------------------
export { Header, headerVariants } from "./header"
export type { HeaderProps } from "./header"

// -----------------------------------------------------------------------------
// Icon
// -----------------------------------------------------------------------------
export { Icon } from "./icon"
export type { IconSize, IconProps } from "./icon"

// -----------------------------------------------------------------------------
// Icon Button
// -----------------------------------------------------------------------------
export { IconButton, iconButtonVariants } from "./icon-button"
export type { IconButtonProps } from "./icon-button"

// -----------------------------------------------------------------------------
// Input
// -----------------------------------------------------------------------------
export { Input, InputField, TextField, inputVariants } from "./input"
export type { InputProps, InputFieldProps, TextFieldProps } from "./input"

// -----------------------------------------------------------------------------
// Link
// -----------------------------------------------------------------------------
export { Link, linkVariants } from "./link"
export type { LinkProps } from "./link"

// -----------------------------------------------------------------------------
// Logo
// -----------------------------------------------------------------------------
export { Logo, logoVariants } from "./logo"
export type { LogoProps } from "./logo"

// -----------------------------------------------------------------------------
// Nav
// -----------------------------------------------------------------------------
export { Nav, navVariants } from "./nav"
export type { NavProps } from "./nav"

// -----------------------------------------------------------------------------
// Pagination
// -----------------------------------------------------------------------------
export {
  Pagination,
  PaginationButton,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  paginationVariants,
  paginationButtonVariants,
  paginationEllipsisVariants,
} from "./pagination"
export type { PaginationProps } from "./pagination"

// -----------------------------------------------------------------------------
// Popover
// -----------------------------------------------------------------------------
export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
  PopoverAnchor,
} from "./popover"

// -----------------------------------------------------------------------------
// Progress
// -----------------------------------------------------------------------------
export { Progress, progressVariants } from "./progress"
export type { ProgressProps } from "./progress"

// -----------------------------------------------------------------------------
// Radio Group
// -----------------------------------------------------------------------------
export { 
  RadioGroup, 
  RadioGroupItem, 
  RadioField, 
  RadioCard, 
  radioItemVariants, 
  radioCardVariants,
  useRadioGroupContext,
} from "./radio-group"
export type { 
  RadioGroupProps, 
  RadioGroupItemProps, 
  RadioFieldProps, 
  RadioCardProps,
} from "./radio-group"

// -----------------------------------------------------------------------------
// Section (Layout primitive)
// -----------------------------------------------------------------------------
export { Section } from "./section"
export type { SectionProps, SectionSize } from "./section"

// -----------------------------------------------------------------------------
// Select
// -----------------------------------------------------------------------------
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectField,
  selectTriggerVariants,
  useSelectContext,
} from "./select"
export type { SelectTriggerProps, SelectFieldProps } from "./select"

// -----------------------------------------------------------------------------
// Switch
// -----------------------------------------------------------------------------
export { Switch, SwitchField, switchVariants, switchThumbVariants } from "./switch"
export type { SwitchProps, SwitchFieldProps } from "./switch"

// -----------------------------------------------------------------------------
// Table
// -----------------------------------------------------------------------------
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  DataTable,
} from "./table"
export type { DataTableProps } from "./table"

// -----------------------------------------------------------------------------
// Table Patterns (helpers for common table variants)
// -----------------------------------------------------------------------------
export {
  createSelectionColumn,
  createActionsColumn,
  createDefaultActionsColumn,
  createHeaderWithTooltip,
  useTableSelection,
  EditableCell,
} from "./table-patterns"
export type { EditableCellProps, RowSelectionState } from "./table-patterns"

// -----------------------------------------------------------------------------
// Tabs
// -----------------------------------------------------------------------------
export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsListVariants,
  tabsTriggerVariants,
  tabsContentVariants,
} from "./tabs"
export type {
  TabsProps,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
} from "./tabs"

// -----------------------------------------------------------------------------
// Times Grid (Availability grid)
// -----------------------------------------------------------------------------
export { TimesGrid, TimesGridEmptyState, timesGridVariants, timeTileVariants, hourTileVariants } from "./times-grid"
export type { TimesGridProps, TimesGridEmptyStateProps, TimeSlot, HourSlot } from "./times-grid"

// -----------------------------------------------------------------------------
// Textarea
// -----------------------------------------------------------------------------
export { Textarea, TextareaField, textareaVariants } from "./textarea"
export type { TextareaProps, TextareaFieldProps } from "./textarea"

// -----------------------------------------------------------------------------
// Toast
// -----------------------------------------------------------------------------
export {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  toastVariants,
} from "./toast"
export type { ToastProps, ToastActionElement } from "./toast"

export { Toaster, useToast, toast } from "./toaster"
export type { ToasterToast } from "./toaster"

// -----------------------------------------------------------------------------
// Tooltip
// -----------------------------------------------------------------------------
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./tooltip"

// -----------------------------------------------------------------------------
// Map
// -----------------------------------------------------------------------------
export { Map, MapMarker, StaticMap, useMap } from "./map"
export type { MapProps, MapMarkerProps, StaticMapProps, LatLng } from "./map"

// Re-export map theme for advanced usage
export { VIBEZZ_MAP_STYLE, mapColors, defaultMapOptions } from "@/lib/map-theme"
export type { MapStyleElement } from "@/lib/map-theme"
