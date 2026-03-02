/**
 * Table Page Starter
 * 
 * A data table layout with filtering, sorting, and pagination.
 * Best for: admin panels, listings, provider directories, user management.
 * 
 * Features:
 * - Sticky navigation with logo and CTA button
 * - Page header with title and primary action
 * - Filter bar with search and dropdown filters
 * - Data table with TanStack Table
 * - Pagination controls
 * 
 * @example
 * // Copy this file and customize for your needs
 * // Rename to your-page-name.tsx
 */

"use client"

import * as React from "react"
import { useState } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import {
  Nav,
  Logo,
  Button,
  Header,
  Container,
  Icon,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  DataTable,
  Pagination,
  Badge,
  AvatarWithFallback,
} from "@/components/vibezz"

/* =============================================================================
 * TYPES
 * ============================================================================= */

interface Provider {
  id: string
  name: string
  avatar?: string
  role: string
  status: "active" | "inactive" | "pending"
  email: string
}

/* =============================================================================
 * SAMPLE DATA
 * Replace with your actual data fetching
 * ============================================================================= */

const sampleProviders: Provider[] = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    avatar: "/avatars/providers/JiaZhang.png",
    role: "Primary Care",
    status: "active",
    email: "sarah.chen@example.com",
  },
  {
    id: "2",
    name: "Dr. Michael Torres",
    avatar: "/avatars/providers/CarlosJuanAquino.png",
    role: "Specialist",
    status: "active",
    email: "m.torres@example.com",
  },
  {
    id: "3",
    name: "Dr. Emily Brooks",
    avatar: "/avatars/providers/OliviaBrooks.png",
    role: "Primary Care",
    status: "pending",
    email: "e.brooks@example.com",
  },
  {
    id: "4",
    name: "Dr. James Wilson",
    avatar: "/avatars/providers/NathanPeters.png",
    role: "Specialist",
    status: "inactive",
    email: "j.wilson@example.com",
  },
  {
    id: "5",
    name: "Dr. Lisa Anderson",
    avatar: "/avatars/providers/LibbyAnderson.png",
    role: "Primary Care",
    status: "active",
    email: "l.anderson@example.com",
  },
]

/* =============================================================================
 * TABLE COLUMNS
 * 
 * Add features using table pattern helpers from @/components/vibezz:
 * 
 * Row Selection:
 *   import { createSelectionColumn, useTableSelection } from "@/components/vibezz"
 *   const { tableOptions } = useTableSelection<Provider>()
 *   const columns = [createSelectionColumn<Provider>(), ...otherColumns]
 *   <DataTable columns={columns} data={data} tableOptions={tableOptions} />
 * 
 * Actions Column:
 *   import { createActionsColumn } from "@/components/vibezz"
 *   const columns = [...otherColumns, createActionsColumn<Provider>((row) => <IconButton ... />)]
 * 
 * Header Tooltips:
 *   import { createHeaderWithTooltip } from "@/components/vibezz"
 *   { accessorKey: "status", header: createHeaderWithTooltip("Status", "Account status") }
 * 
 * See .cursor/rules/vibezz-table-patterns.mdc for full documentation.
 * ============================================================================= */

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const columns: ColumnDef<Provider>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const provider = row.original
      return (
        <div className="flex items-center gap-3">
          <AvatarWithFallback
            src={provider.avatar}
            alt={provider.name}
            fallback={getInitials(provider.name)}
            size="40"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-[var(--text-default)]">
              {provider.name}
            </span>
            <span className="text-[12px] text-[var(--text-whisper)]">
              {provider.email}
            </span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <span className="text-[var(--text-secondary)]">{row.getValue("role")}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Provider["status"]
      const variantMap = {
        active: "positive",
        inactive: "negative",
        pending: "callout",
      } as const
      const labelMap = {
        active: "Active",
        inactive: "Inactive",
        pending: "Pending",
      }
      return (
        <Badge variant={variantMap[status]}>
          {labelMap[status]}
        </Badge>
      )
    },
  },
]

/* =============================================================================
 * TABLE PAGE COMPONENT
 * ============================================================================= */

export default function TablePage() {
  // Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(sampleProviders.length / itemsPerPage)

  // Filter the data
  const filteredData = sampleProviders.filter((provider) => {
    const matchesSearch =
      !searchQuery ||
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = !roleFilter || provider.role === roleFilter

    const matchesStatus = !statusFilter || provider.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  // Paginate the filtered data
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background-default-white)]">
      {/* Navigation Header */}
      <Nav
        sticky={true}
        variant="default"
        left={<Logo size="small" />}
        right={<Button>Get started</Button>}
      />

      {/* Main Content */}
      <main className="flex-1">
        <Container>
          <div className="py-12">
            {/* Page Header */}
            <Header
              title="Providers"
              right={
                <Button>
                  <Icon name="add" size="20" />
                  Add provider
                </Button>
              }
            />

            {/* Filter Bar */}
            <div className="mt-8 flex items-center gap-4">
              <Input
                size="small"
                placeholder="Search by name"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1) // Reset to first page on search
                }}
                className="w-[200px]"
              />

              <Select
                size="small"
                value={roleFilter}
                onValueChange={(value) => {
                  setRoleFilter(value === "all" ? "" : value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="Primary Care">Primary Care</SelectItem>
                  <SelectItem value="Specialist">Specialist</SelectItem>
                </SelectContent>
              </Select>

              <Select
                size="small"
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value === "all" ? "" : value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data Table */}
            <div className="mt-6">
              <DataTable columns={columns} data={paginatedData} />
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </Container>
      </main>
    </div>
  )
}

