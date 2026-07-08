import { useState } from "react";
import {
  BarChart3,
  History,
  LayoutDashboard,
  Megaphone,
  Menu,
  PackageCheck,
  Settings,
  ShieldCheck,
  Terminal,
  Ticket,
  UsersRound,
  Wrench,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AdminTab =
  | "overview"
  | "orders"
  | "tickets"
  | "players"
  | "minecraft"
  | "announcements"
  | "server_ops"
  | "activity"
  | "staff"
  | "logs"
  | "settings";

type TabGroup = "operations" | "server";

type AdminDashboardTabsProps = {
  activeTab: AdminTab;
  onChange: (tab: AdminTab) => void;
  ordersBadgeCount?: number;
  staffName?: string;
  staffRole?: string;
};

const groupLabels: Record<TabGroup, string> = {
  operations: "Operations",
  server: "Server",
};

const tabs: Array<{
  label: string;
  value: AdminTab;
  group: TabGroup;
  icon: LucideIcon;
}> = [
  { label: "Command Center", value: "overview", group: "operations", icon: LayoutDashboard },
  { label: "Orders", value: "orders", group: "operations", icon: PackageCheck },
  { label: "Tickets", value: "tickets", group: "operations", icon: Ticket },
  { label: "Players", value: "players", group: "operations", icon: UsersRound },
  { label: "Minecraft Queue", value: "minecraft", group: "operations", icon: Terminal },
  { label: "Announcements", value: "announcements", group: "server", icon: Megaphone },
  { label: "Server Ops", value: "server_ops", group: "server", icon: Wrench },
  { label: "Staff", value: "staff", group: "server", icon: ShieldCheck },
  { label: "Activity", value: "activity", group: "server", icon: BarChart3 },
  { label: "Logs", value: "logs", group: "server", icon: History },
  { label: "Settings", value: "settings", group: "server", icon: Settings },
];

const operationsTabs = tabs.filter((tab) => tab.group === "operations");
const serverTabs = tabs.filter((tab) => tab.group === "server");

function NavList({
  activeTab,
  onChange,
  ordersBadgeCount,
}: {
  activeTab: AdminTab;
  onChange: (tab: AdminTab) => void;
  ordersBadgeCount?: number;
}) {
  function renderGroup(group: TabGroup, groupTabs: typeof tabs) {
    return (
      <div key={group}>
        <p className="px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#565d78]">
          {groupLabels[group]}
        </p>
        <div className="mt-2 flex flex-col gap-0.5">
          {groupTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            const badge = tab.value === "orders" ? ordersBadgeCount : undefined;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onChange(tab.value)}
                className={`flex items-center justify-between gap-2 rounded-[9px] border-l-2 px-2.5 py-[9px] text-[13px] font-semibold transition ${
                  isActive
                    ? "border-[#a855f7] bg-[rgba(168,85,247,0.16)] text-[#e9d5ff]"
                    : "border-transparent text-[#9aa0b8] hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </span>
                {Boolean(badge) && (
                  <span className="rounded-full bg-[rgba(248,113,113,0.18)] px-[7px] py-px text-[10px] font-extrabold text-[#fca5a5]">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {renderGroup("operations", operationsTabs)}
      {renderGroup("server", serverTabs)}
    </div>
  );
}

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5 px-1.5">
      <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-br from-[#a855f7] to-[#2563eb] text-[13px] font-black">
        E
      </span>
      <div>
        <p className="text-[13px] font-extrabold leading-tight">Ellipsis</p>
        <p className="text-[10px] font-semibold leading-tight text-[#6b7192]">Admin Console</p>
      </div>
    </div>
  );
}

function UserChip({ name, role }: { name?: string; role?: string }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="mt-auto flex items-center gap-2.5 rounded-[10px] border border-white/[0.06] bg-white/[0.03] p-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgba(168,85,247,0.18)] text-[13px] font-extrabold text-[#d8b4fe]">
        {initial}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-bold">{name || "Staff"}</p>
        <p className="truncate text-[10px] font-bold uppercase tracking-[0.04em] text-[#6b7192]">
          {role || "..."}
        </p>
      </div>
    </div>
  );
}

export function AdminDashboardTabs({
  activeTab,
  onChange,
  ordersBadgeCount,
  staffName,
  staffRole,
}: AdminDashboardTabsProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden w-[212px] shrink-0 flex-col gap-6 border-r border-white/[0.07] bg-[#0c0c17] p-3.5 lg:flex">
        <BrandMark />
        <NavList activeTab={activeTab} onChange={onChange} ordersBadgeCount={ordersBadgeCount} />
        <UserChip name={staffName} role={staffRole} />
      </aside>

      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="mb-3 inline-flex items-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm font-bold text-[#9aa0b8] lg:hidden"
      >
        <Menu className="h-4 w-4" />
        Menu
      </button>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsMobileOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[240px] flex-col gap-6 border-r border-white/[0.07] bg-[#0c0c17] p-4">
            <div className="flex items-center justify-between">
              <BrandMark />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setIsMobileOpen(false)}
                className="text-[#9aa0b8]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavList
              activeTab={activeTab}
              onChange={(tab) => {
                onChange(tab);
                setIsMobileOpen(false);
              }}
              ordersBadgeCount={ordersBadgeCount}
            />
            <UserChip name={staffName} role={staffRole} />
          </aside>
        </div>
      )}
    </>
  );
}
