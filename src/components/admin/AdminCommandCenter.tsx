import { useEffect, useMemo, useState } from "react";
import {
  AlertOctagon,
  Clock3,
  Coins,
  Loader2,
  PackageCheck,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  Terminal,
  UsersRound,
  Zap,
} from "lucide-react";
import type { AdminTab } from "./AdminDashboardTabs";
import type { Order, StatusFilter } from "../../types/admin";
import type { MinecraftAdminAction } from "../../types/minecraftActions";
import { supabase } from "../../lib/supabase";
import {
  getMinecraftActionPayloadSummary,
  minecraftActionLabels,
  minecraftActionStatusLabels,
} from "../../services/minecraftActions";

type CommandCenterStats = {
  pending: number;
  verified: number;
  delivered: number;
  rejected: number;
  needsAttention: number;
  revenue: number;
};

type AdminCommandCenterProps = {
  orders: Order[];
  stats: CommandCenterStats;
  needsAttentionOrders: Order[];
  realtimeStatus: "connecting" | "live" | "error";
  lastUpdated: string;
  onNavigate: (tab: AdminTab) => void;
  onSetOrderFilter: (filter: StatusFilter) => void;
  onRefresh: () => void;
};

function getNumericPrice(price: string) {
  const value = Number(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(value) ? value : 0;
}

function isToday(dateValue: string) {
  const date = new Date(dateValue);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function getOrderReference(order: Order) {
  return order.payment_reference || order.id;
}

function getRecentOrders(orders: Order[]) {
  return [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
}

export function AdminCommandCenter({
  orders,
  stats,
  needsAttentionOrders,
  realtimeStatus,
  lastUpdated,
  onNavigate,
  onSetOrderFilter,
  onRefresh,
}: AdminCommandCenterProps) {
  const [minecraftActions, setMinecraftActions] = useState<MinecraftAdminAction[]>([]);
  const [loadingActions, setLoadingActions] = useState(false);
  const [actionError, setActionError] = useState("");

  const todayOrders = useMemo(
    () => orders.filter((order) => isToday(order.created_at)),
    [orders],
  );

  const todayRevenue = useMemo(
    () =>
      todayOrders
        .filter((order) => order.status === "verified" || order.status === "delivered")
        .reduce((total, order) => total + getNumericPrice(order.product_price), 0),
    [todayOrders],
  );

  const actionStats = useMemo(() => {
    const waiting = minecraftActions.filter(
      (action) => action.status === "queued" || action.status === "processing",
    ).length;
    const failed = minecraftActions.filter((action) => action.status === "failed").length;
    const completed = minecraftActions.filter((action) => action.status === "completed").length;

    return { waiting, failed, completed };
  }, [minecraftActions]);

  const recentOrders = useMemo(() => getRecentOrders(orders), [orders]);

  async function loadMinecraftActions() {
    setLoadingActions(true);
    setActionError("");

    const { data, error } = await supabase
      .from("minecraft_admin_actions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) {
      setActionError(error.message);
    } else {
      setMinecraftActions((data || []) as MinecraftAdminAction[]);
    }

    setLoadingActions(false);
  }

  useEffect(() => {
    void loadMinecraftActions();
  }, []);

  function openOrders(filter: StatusFilter) {
    onSetOrderFilter(filter);
    onNavigate("orders");
  }

  return (
    <section className="mt-6">
      <div className="rounded-[2rem] border border-purple-500/25 bg-gradient-to-br from-purple-500/15 via-white/[0.05] to-emerald-500/10 p-6 shadow-[0_0_50px_rgba(168,85,247,0.12)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-purple-300">
              Admin Command Center
            </p>
            <h2 className="mt-3 text-3xl font-black text-white">
              Staff operations at a glance
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-300">
              Review urgent orders, today&apos;s movement, Minecraft queue health, and staff workflow
              entry points from one clean overview.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              onRefresh();
              void loadMinecraftActions();
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-purple-400/25 bg-purple-500/10 px-5 py-3 text-sm font-black text-purple-100 transition hover:bg-purple-500/20"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh Center
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <StatusPill
            label={realtimeStatus === "error" ? "Realtime Offline" : "Realtime Live"}
            tone={realtimeStatus === "error" ? "danger" : "success"}
          />
          {lastUpdated && <StatusPill label={`Updated ${lastUpdated}`} tone="neutral" />}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <CommandStat
          label="Today Revenue"
          value={`PHP ${todayRevenue}`}
          icon={<Coins className="h-5 w-5" />}
          tone="yellow"
        />
        <CommandStat
          label="Today Orders"
          value={todayOrders.length}
          icon={<ReceiptText className="h-5 w-5" />}
          tone="purple"
        />
        <CommandStat
          label="Needs Attention"
          value={stats.needsAttention}
          icon={<AlertOctagon className="h-5 w-5" />}
          tone={stats.needsAttention > 0 ? "red" : "emerald"}
        />
        <CommandStat
          label="Pending"
          value={stats.pending}
          icon={<Clock3 className="h-5 w-5" />}
          tone="blue"
        />
        <CommandStat
          label="Verified Waiting"
          value={stats.verified}
          icon={<ShieldCheck className="h-5 w-5" />}
          tone="cyan"
        />
        <CommandStat
          label="MC Waiting"
          value={actionStats.waiting}
          icon={<Terminal className="h-5 w-5" />}
          tone={actionStats.waiting > 0 ? "yellow" : "emerald"}
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-red-500/20 bg-red-500/[0.06] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-red-300">
                Needs Attention Queue
              </p>
              <h3 className="mt-2 text-2xl font-black text-white">
                Orders staff should review first
              </h3>
            </div>

            <button
              type="button"
              onClick={() => openOrders("needs_attention")}
              className="rounded-2xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm font-black text-red-100 transition hover:bg-red-500/25"
            >
              Open Queue
            </button>
          </div>

          <div className="mt-5 grid gap-3">
            {needsAttentionOrders.slice(0, 5).map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => openOrders("needs_attention")}
                className="rounded-2xl border border-white/10 bg-black/25 p-4 text-left transition hover:border-red-300/40 hover:bg-red-500/10"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-white">{order.product_name}</p>
                    <p className="mt-1 text-sm text-gray-300">
                      {order.minecraft_username || "No IGN"} • {order.discord_username || "No Discord"}
                    </p>
                  </div>
                  <span className="rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-xs font-black uppercase text-red-200">
                    {order.status}
                  </span>
                </div>
                <p className="mt-3 font-mono text-xs text-gray-500">
                  {getOrderReference(order)}
                </p>
              </button>
            ))}

            {needsAttentionOrders.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-sm text-gray-400">
                No urgent orders right now.
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-5">
          <div className="rounded-[2rem] border border-purple-500/20 bg-white/[0.045] p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-300">
              Quick Navigation
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <QuickButton label="Orders" icon={<PackageCheck className="h-4 w-4" />} onClick={() => onNavigate("orders")} />
              <QuickButton label="Players" icon={<UsersRound className="h-4 w-4" />} onClick={() => onNavigate("players")} />
              <QuickButton label="MC Queue" icon={<Terminal className="h-4 w-4" />} onClick={() => onNavigate("minecraft")} />
              <QuickButton label="Staff Activity" icon={<Zap className="h-4 w-4" />} onClick={() => onNavigate("activity")} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-yellow-500/20 bg-yellow-500/[0.06] p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-300">
              Minecraft Queue Health
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <MiniStat label="Waiting" value={actionStats.waiting} />
              <MiniStat label="Completed" value={actionStats.completed} />
              <MiniStat label="Failed" value={actionStats.failed} danger={actionStats.failed > 0} />
            </div>

            {actionError && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm font-bold text-red-200">
                {actionError}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
            Recent Orders
          </p>

          <div className="mt-4 grid gap-3">
            {recentOrders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => openOrders("all")}
                className="rounded-2xl border border-white/10 bg-black/25 p-4 text-left transition hover:border-emerald-300/40 hover:bg-emerald-500/10"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-black text-white">{order.product_name}</p>
                    <p className="mt-1 text-sm text-gray-400">
                      {order.minecraft_username || "No IGN"} • {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase text-emerald-200">
                    {order.status}
                  </span>
                </div>
              </button>
            ))}

            {recentOrders.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-sm text-gray-400">
                No orders yet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-300">
            Recent Minecraft Actions
          </p>

          {loadingActions ? (
            <div className="mt-4 flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-8 text-sm text-gray-300">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading Minecraft actions...
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              {minecraftActions.slice(0, 5).map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => onNavigate("minecraft")}
                  className="rounded-2xl border border-white/10 bg-black/25 p-4 text-left transition hover:border-yellow-300/40 hover:bg-yellow-500/10"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-white">
                        {minecraftActionLabels[action.action_type]} • {action.minecraft_username}
                      </p>
                      <p className="mt-1 text-sm text-gray-400">
                        {getMinecraftActionPayloadSummary(action)}
                      </p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${
                      action.status === "failed"
                        ? "border-red-400/25 bg-red-500/10 text-red-200"
                        : "border-blue-400/25 bg-blue-500/10 text-blue-200"
                    }`}>
                      {minecraftActionStatusLabels[action.status]}
                    </span>
                  </div>
                </button>
              ))}

              {minecraftActions.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-sm text-gray-400">
                  No Minecraft actions yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function CommandStat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  tone: "purple" | "emerald" | "yellow" | "red" | "blue" | "cyan";
}) {
  const toneClass = {
    purple: "border-purple-500/25 bg-purple-500/10 text-purple-200",
    emerald: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200",
    yellow: "border-yellow-500/25 bg-yellow-500/10 text-yellow-200",
    red: "border-red-500/40 bg-red-500/15 text-red-200",
    blue: "border-blue-500/25 bg-blue-500/10 text-blue-200",
    cyan: "border-cyan-500/25 bg-cyan-500/10 text-cyan-200",
  }[tone];

  return (
    <div className={`rounded-[1.5rem] border p-5 ${toneClass}`}>
      <div>{icon}</div>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "success" | "danger" | "neutral";
}) {
  const toneClass = {
    success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200",
    danger: "border-red-500/25 bg-red-500/10 text-red-200",
    neutral: "border-white/10 bg-white/[0.05] text-gray-300",
  }[tone];

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${toneClass}`}>
      {label}
    </span>
  );
}

function QuickButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-black text-gray-200 transition hover:border-purple-300/40 hover:bg-purple-500/10 hover:text-purple-100"
    >
      {icon}
      {label}
    </button>
  );
}

function MiniStat({
  label,
  value,
  danger,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-3 ${
      danger
        ? "border-red-400/25 bg-red-500/10"
        : "border-white/10 bg-black/20"
    }`}>
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`mt-1 text-lg font-black ${danger ? "text-red-200" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

