import {
  BarChart3,
  CircleDot,
  History,
  LayoutDashboard,
  Megaphone,
  PackageCheck,
  Settings,
  ShieldCheck,
  Terminal,
  Ticket,
  UsersRound,
  Wrench,
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

type AdminDashboardTabsProps = {
  activeTab: AdminTab;
  onChange: (tab: AdminTab) => void;
};

type TabAccent =
  | "pink"
  | "purple"
  | "emerald"
  | "yellow"
  | "cyan"
  | "blue"
  | "amber"
  | "gray";

const tabs: Array<{
  label: string;
  shortLabel: string;
  value: AdminTab;
  accent: TabAccent;
  icon: LucideIcon;
}> = [
  {
    label: "Command Center",
    shortLabel: "Command",
    value: "overview",
    accent: "pink",
    icon: LayoutDashboard,
  },
  {
    label: "Orders",
    shortLabel: "Orders",
    value: "orders",
    accent: "purple",
    icon: PackageCheck,
  },
  {
    label: "Tickets",
    shortLabel: "Tickets",
    value: "tickets",
    accent: "yellow",
    icon: Ticket,
  },
  {
    label: "Players",
    shortLabel: "Players",
    value: "players",
    accent: "emerald",
    icon: UsersRound,
  },
  {
    label: "Minecraft Queue",
    shortLabel: "Queue",
    value: "minecraft",
    accent: "yellow",
    icon: Terminal,
  },
  {
    label: "Announcements",
    shortLabel: "Broadcast",
    value: "announcements",
    accent: "pink",
    icon: Megaphone,
  },
  {
    label: "Server Ops",
    shortLabel: "Ops",
    value: "server_ops",
    accent: "cyan",
    icon: Wrench,
  },
  {
    label: "Staff Activity",
    shortLabel: "Activity",
    value: "activity",
    accent: "cyan",
    icon: BarChart3,
  },
  {
    label: "Staff",
    shortLabel: "Staff",
    value: "staff",
    accent: "blue",
    icon: ShieldCheck,
  },
  {
    label: "Logs",
    shortLabel: "Logs",
    value: "logs",
    accent: "amber",
    icon: History,
  },
  {
    label: "Settings",
    shortLabel: "Settings",
    value: "settings",
    accent: "gray",
    icon: Settings,
  },
];

const accentClasses: Record<
  TabAccent,
  {
    active: string;
    inactive: string;
    glow: string;
    dot: string;
  }
> = {
  pink: {
    active: "border-pink-300/45 bg-pink-400/15 text-pink-100",
    inactive: "hover:border-pink-300/25 hover:text-pink-100",
    glow: "shadow-[0_0_24px_rgba(244,114,182,0.14)]",
    dot: "bg-pink-300",
  },
  purple: {
    active: "border-purple-300/45 bg-purple-400/15 text-purple-100",
    inactive: "hover:border-purple-300/25 hover:text-purple-100",
    glow: "shadow-[0_0_24px_rgba(168,85,247,0.14)]",
    dot: "bg-purple-300",
  },
  emerald: {
    active: "border-emerald-300/45 bg-emerald-400/15 text-emerald-100",
    inactive: "hover:border-emerald-300/25 hover:text-emerald-100",
    glow: "shadow-[0_0_24px_rgba(52,211,153,0.12)]",
    dot: "bg-emerald-300",
  },
  yellow: {
    active: "border-yellow-300/45 bg-yellow-400/15 text-yellow-100",
    inactive: "hover:border-yellow-300/25 hover:text-yellow-100",
    glow: "shadow-[0_0_24px_rgba(250,204,21,0.12)]",
    dot: "bg-yellow-300",
  },
  cyan: {
    active: "border-cyan-300/45 bg-cyan-400/15 text-cyan-100",
    inactive: "hover:border-cyan-300/25 hover:text-cyan-100",
    glow: "shadow-[0_0_24px_rgba(34,211,238,0.13)]",
    dot: "bg-cyan-300",
  },
  blue: {
    active: "border-blue-300/45 bg-blue-400/15 text-blue-100",
    inactive: "hover:border-blue-300/25 hover:text-blue-100",
    glow: "shadow-[0_0_24px_rgba(96,165,250,0.12)]",
    dot: "bg-blue-300",
  },
  amber: {
    active: "border-amber-300/45 bg-amber-400/15 text-amber-100",
    inactive: "hover:border-amber-300/25 hover:text-amber-100",
    glow: "shadow-[0_0_24px_rgba(251,191,36,0.12)]",
    dot: "bg-amber-300",
  },
  gray: {
    active: "border-slate-200/35 bg-slate-300/10 text-slate-100",
    inactive: "hover:border-slate-300/25 hover:text-slate-100",
    glow: "shadow-[0_0_24px_rgba(148,163,184,0.10)]",
    dot: "bg-slate-300",
  },
};

export function AdminDashboardTabs({
  activeTab,
  onChange,
}: AdminDashboardTabsProps) {
  const activeItem = tabs.find((tab) => tab.value === activeTab) || tabs[0];

  return (
    <section className="mt-4 mb-4 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#060616]/85 p-3 shadow-[0_0_40px_rgba(34,211,238,0.06)]">
      <div className="mb-2 flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
            <CircleDot className="h-4 w-4" />
          </span>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
              Admin Control Dock
            </p>
            <p className="text-[13px] text-slate-500">
              Active module:{" "}
              <span className="font-bold text-slate-300">{activeItem.label}</span>
            </p>
          </div>
        </div>

        <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
          Operator Navigation
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-8 bg-gradient-to-r from-[#060616] to-transparent sm:hidden" />
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-8 bg-gradient-to-l from-[#060616] to-transparent sm:hidden" />

        <nav className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-nowrap lg:overflow-x-auto lg:pb-1 [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            const accent = accentClasses[tab.accent];

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onChange(tab.value)}
                className={`group relative inline-flex shrink-0 items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-sm font-black transition sm:text-[15px] ${
                  isActive
                    ? `${accent.active} ${accent.glow}`
                    : `border-white/10 bg-black/25 text-slate-400 ${accent.inactive}`
                }`}
                title={tab.label}
              >
                <span
                  className={`absolute left-3 top-2 h-1.5 w-1.5 rounded-full transition ${
                    isActive ? accent.dot : "bg-slate-700 group-hover:bg-slate-500"
                  }`}
                />

                <Icon className="ml-1 h-4 w-4" />

                <span className="hidden xl:inline">{tab.label}</span>
                <span className="xl:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </section>
  );
}