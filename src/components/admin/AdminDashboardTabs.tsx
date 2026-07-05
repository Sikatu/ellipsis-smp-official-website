import {
  BarChart3,
  History,
  LayoutDashboard,
  Megaphone,
  PackageCheck,
  Settings,
  ShieldCheck,
  Terminal,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AdminTab =
  | "overview"
  | "orders"
  | "players"
  | "minecraft"
  | "announcements"
  | "activity"
  | "staff"
  | "logs"
  | "settings";

type AdminDashboardTabsProps = {
  activeTab: AdminTab;
  onChange: (tab: AdminTab) => void;
};

const tabs: Array<{
  label: string;
  value: AdminTab;
  accent: string;
  icon: LucideIcon;
}> = [
  { label: "Command Center", value: "overview", accent: "pink", icon: LayoutDashboard },
  { label: "Orders", value: "orders", accent: "purple", icon: PackageCheck },
  { label: "Players", value: "players", accent: "emerald", icon: UsersRound },
  { label: "Minecraft Queue", value: "minecraft", accent: "yellow", icon: Terminal },
  { label: "Announcements", value: "announcements", accent: "pink", icon: Megaphone },
  { label: "Staff Activity", value: "activity", accent: "cyan", icon: BarChart3 },
  { label: "Staff", value: "staff", accent: "blue", icon: ShieldCheck },
  { label: "Logs", value: "logs", accent: "amber", icon: History },
  { label: "Settings", value: "settings", accent: "gray", icon: Settings },
];

function activeClass(accent: string) {
  if (accent === "pink") return "border-pink-400 text-pink-300";
  if (accent === "emerald") return "border-emerald-400 text-emerald-300";
  if (accent === "yellow") return "border-yellow-400 text-yellow-300";
  if (accent === "cyan") return "border-cyan-400 text-cyan-300";
  if (accent === "blue") return "border-blue-400 text-blue-300";
  if (accent === "amber") return "border-amber-400 text-amber-300";
  if (accent === "gray") return "border-gray-300 text-gray-200";
  return "border-purple-400 text-purple-300";
}

export function AdminDashboardTabs({ activeTab, onChange }: AdminDashboardTabsProps) {
  return (
    <div className="mt-8 mb-4 overflow-x-auto border-b border-white/10">
      <nav className="-mb-px flex min-w-max gap-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-bold transition ${
                isActive
                  ? activeClass(tab.accent)
                  : "border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300"
              }`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

