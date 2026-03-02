"use client";

import { useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
  DataTable,
  AvatarWithFallback,
  Progress,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SwitchField,
  RadioGroup,
  RadioCard,
  Input,
  TextareaField,
  Button,
  IconButton,
  Flag,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  Toaster,
  useToast,
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/vibezz";
import {
  createSelectionColumn,
  useTableSelection,
  createActionsColumn,
} from "@/components/vibezz/table-patterns";
import { type ColumnDef } from "@tanstack/react-table";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface Activity {
  id: string;
  user: string;
  initials: string;
  action: string;
  date: string;
  status: "completed" | "pending" | "failed";
}

const activities: Activity[] = [
  { id: "1", user: "Alice Chen", initials: "AC", action: "Deployed v2.4.1 to production", date: "2 min ago", status: "completed" },
  { id: "2", user: "Bob Martinez", initials: "BM", action: "Opened PR #482 — refactor auth", date: "18 min ago", status: "pending" },
  { id: "3", user: "Carol Davis", initials: "CD", action: "Resolved incident INC-1192", date: "1 hr ago", status: "completed" },
  { id: "4", user: "Dan Kim", initials: "DK", action: "Rolled back migration 0047", date: "3 hr ago", status: "failed" },
  { id: "5", user: "Eva Novak", initials: "EN", action: "Updated staging environment", date: "5 hr ago", status: "completed" },
];

interface AnalyticsRow {
  id: string;
  endpoint: string;
  method: string;
  calls: number;
  avgLatency: string;
  errorRate: string;
  status: "healthy" | "degraded" | "down";
}

const analyticsData: AnalyticsRow[] = [
  { id: "1", endpoint: "/api/users", method: "GET", calls: 12840, avgLatency: "42ms", errorRate: "0.02%", status: "healthy" },
  { id: "2", endpoint: "/api/auth/login", method: "POST", calls: 8921, avgLatency: "187ms", errorRate: "1.4%", status: "degraded" },
  { id: "3", endpoint: "/api/appointments", method: "GET", calls: 6430, avgLatency: "95ms", errorRate: "0.1%", status: "healthy" },
  { id: "4", endpoint: "/api/search", method: "GET", calls: 5102, avgLatency: "312ms", errorRate: "0.8%", status: "healthy" },
  { id: "5", endpoint: "/api/notifications", method: "POST", calls: 3200, avgLatency: "58ms", errorRate: "0.05%", status: "healthy" },
  { id: "6", endpoint: "/api/billing/charge", method: "POST", calls: 2100, avgLatency: "520ms", errorRate: "3.2%", status: "degraded" },
  { id: "7", endpoint: "/api/files/upload", method: "PUT", calls: 980, avgLatency: "1.2s", errorRate: "5.1%", status: "down" },
  { id: "8", endpoint: "/api/reports/generate", method: "POST", calls: 410, avgLatency: "4.8s", errorRate: "0.3%", status: "healthy" },
];

const statusBadgeVariant = {
  completed: "positive",
  pending: "info",
  failed: "negative",
  healthy: "positive",
  degraded: "yellow-dark",
  down: "negative",
} as const;

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const activityColumns: ColumnDef<Activity>[] = [
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <AvatarWithFallback fallback={row.original.initials} size="32" />
        <span className="font-semibold">{row.original.user}</span>
      </div>
    ),
  },
  { accessorKey: "action", header: "Action" },
  { accessorKey: "date", header: "When" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusBadgeVariant[row.original.status]}>
        {row.original.status}
      </Badge>
    ),
  },
];

// ---------------------------------------------------------------------------
// Stats helper
// ---------------------------------------------------------------------------

function StatCard({ label, value, delta, positive }: { label: string; value: string; delta: string; positive: boolean }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex-1 rounded-lg border border-[var(--stroke-default)] p-5">
            <p className="text-[12px] leading-[16px] font-semibold text-[var(--text-whisper)] uppercase tracking-wide">
              {label}
            </p>
            <p className="mt-1 text-[28px] leading-[36px] font-semibold text-[var(--text-default)]">
              {value}
            </p>
            <p className={`mt-1 text-[14px] leading-[20px] font-medium ${positive ? "text-[var(--text-positive)]" : "text-[var(--text-negative)]"}`}>
              {delta}
            </p>
          </div>
        </TooltipTrigger>
        <TooltipContent>Compared to previous 30 days</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ---------------------------------------------------------------------------
// Overview Tab
// ---------------------------------------------------------------------------

function OverviewTab() {
  return (
    <div className="space-y-8">
      <div className="flex gap-4">
        <StatCard label="Total Requests" value="39,983" delta="+12.3% from last month" positive />
        <StatCard label="Avg Latency" value="127ms" delta="-8.1% from last month" positive />
        <StatCard label="Error Rate" value="0.87%" delta="+0.12% from last month" positive={false} />
        <StatCard label="Uptime" value="99.97%" delta="No change" positive />
      </div>

      <div>
        <h3 className="text-[16px] leading-[26px] font-semibold text-[var(--text-default)] mb-4">
          Project Completion
        </h3>
        <Progress value={72} />
        <p className="mt-2 text-[14px] leading-[20px] text-[var(--text-secondary)]">
          72% — 18 of 25 milestones completed
        </p>
      </div>

      <div>
        <h3 className="text-[16px] leading-[26px] font-semibold text-[var(--text-default)] mb-4">
          Recent Activity
        </h3>
        <DataTable columns={activityColumns} data={activities} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Analytics Tab
// ---------------------------------------------------------------------------

function AnalyticsTab() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { rowSelection, tableOptions } = useTableSelection<AnalyticsRow>();
  const [drawerRow, setDrawerRow] = useState<AnalyticsRow | null>(null);
  const [dialogRow, setDialogRow] = useState<AnalyticsRow | null>(null);

  const filtered = statusFilter === "all"
    ? analyticsData
    : analyticsData.filter((r) => r.status === statusFilter);

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  const columns: ColumnDef<AnalyticsRow>[] = [
    createSelectionColumn<AnalyticsRow>(),
    { accessorKey: "endpoint", header: "Endpoint", cell: ({ row }) => <span className="font-semibold">{row.original.endpoint}</span> },
    {
      accessorKey: "method",
      header: "Method",
      cell: ({ row }) => (
        <Badge variant="charcoal">{row.original.method}</Badge>
      ),
    },
    { accessorKey: "calls", header: "Calls (30d)", cell: ({ row }) => row.original.calls.toLocaleString() },
    { accessorKey: "avgLatency", header: "Avg Latency" },
    { accessorKey: "errorRate", header: "Error Rate" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={statusBadgeVariant[row.original.status]}>
          {row.original.status}
        </Badge>
      ),
    },
    createActionsColumn<AnalyticsRow>((row) => (
      <div className="flex items-center gap-1">
        <IconButton icon="open_in_new" size="small" aria-label="Details" onClick={() => setDrawerRow(row)} />
        <IconButton icon="delete" size="small" aria-label="Delete" onClick={() => setDialogRow(row)} />
      </div>
    )),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]" size="small">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="healthy">Healthy</SelectItem>
              <SelectItem value="degraded">Degraded</SelectItem>
              <SelectItem value="down">Down</SelectItem>
            </SelectContent>
          </Select>
          {selectedCount > 0 && (
            <Badge variant="info">{selectedCount} selected</Badge>
          )}
        </div>
        <p className="text-[14px] leading-[20px] text-[var(--text-secondary)]">
          {filtered.length} endpoint{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      <DataTable columns={columns} data={filtered} tableOptions={tableOptions} />

      {/* Detail Drawer */}
      <Drawer open={!!drawerRow} onOpenChange={(open) => !open && setDrawerRow(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{drawerRow?.endpoint ?? "Endpoint Details"}</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            {drawerRow && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="charcoal">{drawerRow.method}</Badge>
                  <Badge variant={statusBadgeVariant[drawerRow.status]}>{drawerRow.status}</Badge>
                </div>
                <dl className="space-y-3 text-[14px] leading-[20px]">
                  <div className="flex justify-between">
                    <dt className="text-[var(--text-secondary)]">Calls (30d)</dt>
                    <dd className="font-semibold">{drawerRow.calls.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--text-secondary)]">Avg Latency</dt>
                    <dd className="font-semibold">{drawerRow.avgLatency}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--text-secondary)]">Error Rate</dt>
                    <dd className="font-semibold">{drawerRow.errorRate}</dd>
                  </div>
                </dl>
              </div>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!dialogRow} onOpenChange={(open) => !open && setDialogRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove endpoint?</DialogTitle>
            <DialogDescription>
              This will stop monitoring <span className="font-semibold">{dialogRow?.endpoint}</span>. You can re-add it later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" size="small">Cancel</Button>
            </DialogClose>
            <Button variant="primary" size="small" onClick={() => setDialogRow(null)}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Settings Tab
// ---------------------------------------------------------------------------

function SettingsTab() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [theme, setTheme] = useState("system");

  return (
    <div className="max-w-2xl space-y-8">
      <div className="space-y-4">
        <h3 className="text-[16px] leading-[26px] font-semibold text-[var(--text-default)]">
          Preferences
        </h3>
        <SwitchField
          label="Email notifications"
          description="Receive alerts when endpoints go down"
          checked={notifications}
          onCheckedChange={setNotifications}
        />
        <SwitchField
          label="Auto-refresh data"
          description="Refresh dashboard data every 30 seconds"
          checked={autoRefresh}
          onCheckedChange={setAutoRefresh}
        />
        <SwitchField
          label="Compact mode"
          description="Reduce spacing for denser information display"
          checked={compactMode}
          onCheckedChange={setCompactMode}
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-[16px] leading-[26px] font-semibold text-[var(--text-default)]">
          Appearance
        </h3>
        <RadioGroup value={theme} onValueChange={setTheme} className="flex gap-3">
          <RadioCard value="light" label="Light" description="Always use light mode" />
          <RadioCard value="dark" label="Dark" description="Always use dark mode" />
          <RadioCard value="system" label="System" description="Follow OS preference" />
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <h3 className="text-[16px] leading-[26px] font-semibold text-[var(--text-default)]">
          Project Info
        </h3>
        <Input placeholder="Display name" defaultValue="Example Project" />
        <TextareaField
          label="Description"
          placeholder="Describe what this project monitors..."
          defaultValue="A demo project showing the design system in action"
        />
      </div>

      <Button
        variant="primary"
        onClick={() =>
          toast({
            title: "Settings saved",
            description: "Your preferences have been updated.",
          })
        }
      >
        Save changes
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard (main export)
// ---------------------------------------------------------------------------

export default function Dashboard() {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="flex-1 flex flex-col">
      {showBanner && (
        <Flag color="blue" title="New release" showIcon onClose={() => setShowBanner(false)}>
          v2.4.1 deployed successfully — 3 new endpoints are now being monitored.
        </Flag>
      )}

      <div className="flex-1 p-6">
        <Tabs defaultValue="overview">
          <TabsList variant="segmented">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="analytics">
            <AnalyticsTab />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>

      <Toaster />
    </div>
  );
}
