import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  ChevronDown,
  Gauge,
  Loader2,
  PackageCheck,
  Radio,
  RefreshCcw,
  Terminal,
  UsersRound,
  Zap,
} from "lucide-react";
import type { AdminTab } from "./AdminDashboardTabs";
import StatusChip from "../ui/StatusChip";
import type { Order, StatusFilter } from "../../types/admin";
import type { MinecraftAdminAction } from "../../types/minecraftActions";
import { useServerStatus } from "../../hooks/useServerStatus";
import { supabase } from "../../lib/supabase";
import type { MinecraftPlayerProfile } from "../../types/playerProfiles";
import {
  fetchMinecraftPlayerProfiles,
  getFormattedPlaytime,
  getPlayerProfileSummary,
} from "../../services/playerProfiles";
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

function getOrderReference(order: Order) {
  return order.payment_reference || order.id;
}

function getOrderAgeMinutes(order: Order) {
  return Math.max(
    0,
    Math.floor((new Date().getTime() - new Date(order.created_at).getTime()) / 60000),
  );
}

function formatOrderAge(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
}

function getRecentOrders(orders: Order[]) {
  return [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
}

function getPriorityScore(order: Order) {
  let score = 0;
  if (order.status === "rejected") score += 80;
  if (order.status === "verified") score += 70;
  if (order.status === "pending") score += 45;
  if (!order.minecraft_username) score += 35;
  if (!order.discord_username) score += 25;
  if (!order.receipt_url && !order.payment_reference) score += 30;
  score += Math.min(40, Math.floor(getOrderAgeMinutes(order) / 15));
  return score;
}

function getPriorityLabel(order: Order) {
  if (order.status === "verified") return "Ready for delivery";
  if (order.status === "rejected") return "Needs review";
  if (!order.minecraft_username || !order.discord_username) return "Missing player info";
  if (!order.receipt_url && !order.payment_reference) return "Missing proof";
  if (getOrderAgeMinutes(order) > 30) return "Pending too long";
  return "Payment review";
}

function getPlayerKey(order: Order) {
  return order.minecraft_username.trim().toLowerCase();
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
  const serverStatus = useServerStatus();
  const [minecraftActions, setMinecraftActions] = useState<MinecraftAdminAction[]>([]);
  const [serverProfiles, setServerProfiles] = useState<MinecraftPlayerProfile[]>([]);
  const [loadingActions, setLoadingActions] = useState(false);
  const [actionError, setActionError] = useState("");

  const actionStats = useMemo(() => {
    const waiting = minecraftActions.filter(
      (action) => action.status === "queued" || action.status === "processing",
    ).length;
    const failed = minecraftActions.filter((action) => action.status === "failed").length;
    const completed = minecraftActions.filter((action) => action.status === "completed").length;

    return { waiting, failed, completed };
  }, [minecraftActions]);

  const recentOrders = useMemo(() => getRecentOrders(orders), [orders]);

  const priorityOrders = useMemo(
    () =>
      [...needsAttentionOrders]
        .sort((a, b) => getPriorityScore(b) - getPriorityScore(a))
        .slice(0, 6),
    [needsAttentionOrders],
  );

  const commandHealth = useMemo(() => {
    const verifiedOrDelivered = stats.verified + stats.delivered;
    const completionRate =
      orders.length > 0 ? Math.round((stats.delivered / orders.length) * 100) : 100;
    const conversionRate =
      orders.length > 0 ? Math.round((verifiedOrDelivered / orders.length) * 100) : 100;
    const pendingOrders = orders.filter((order) => order.status === "pending");
    const oldestPendingMinutes = pendingOrders.reduce(
      (oldest, order) => Math.max(oldest, getOrderAgeMinutes(order)),
      0,
    );
    const pressure =
      stats.needsAttention + actionStats.waiting + actionStats.failed * 2 + (realtimeStatus === "error" ? 4 : 0);

    if (realtimeStatus === "error" || actionStats.failed > 0) {
      return {
        label: "Systems Need Eyes",
        tone: "danger" as const,
        score: Math.max(35, 78 - pressure * 6),
        summary: "There is a failed queue item or realtime issue that staff should clear first.",
        completionRate,
        conversionRate,
        oldestPendingMinutes,
      };
    }

    if (pressure > 5 || oldestPendingMinutes > 60) {
      return {
        label: "High Workload",
        tone: "warning" as const,
        score: Math.max(50, 86 - pressure * 5),
        summary: "Orders are piling up. Focus the attention queue before handling lower-risk tasks.",
        completionRate,
        conversionRate,
        oldestPendingMinutes,
      };
    }

    return {
      label: "Operations Stable",
      tone: "success" as const,
      score: Math.min(100, 92 - pressure * 2),
      summary: "The command center is healthy. Staff can focus on fast delivery and player care.",
      completionRate,
      conversionRate,
      oldestPendingMinutes,
    };
  }, [actionStats.failed, actionStats.waiting, orders, realtimeStatus, stats.delivered, stats.needsAttention, stats.verified]);

  const bottlenecks = [
    {
      label: "Payment Review",
      value: stats.pending,
      helper: "Pending orders waiting for staff verification",
      alert: false,
      action: () => openOrders("pending"),
    },
    {
      label: "Delivery Queue",
      value: stats.verified,
      helper: "Verified orders that still need fulfillment",
      alert: false,
      action: () => openOrders("verified"),
    },
    {
      label: "MC Automation",
      value: actionStats.waiting + actionStats.failed,
      helper: actionStats.failed > 0 ? "Failed Minecraft action needs review" : "Queued Minecraft actions",
      alert: actionStats.failed > 0,
      action: () => onNavigate("minecraft"),
    },
  ];

  const topProducts = useMemo(() => {
    const productMap = new Map<string, { name: string; count: number; revenue: number }>();

    orders.forEach((order) => {
      const current = productMap.get(order.product_name) || {
        name: order.product_name,
        count: 0,
        revenue: 0,
      };

      current.count += 1;
      if (order.status === "verified" || order.status === "delivered") {
        current.revenue += getNumericPrice(order.product_price);
      }
      productMap.set(order.product_name, current);
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue || b.count - a.count)
      .slice(0, 3);
  }, [orders]);

  const serverIntelligence = useMemo(() => {
    const playerMap = new Map<
      string,
      {
        ign: string;
        orders: number;
        delivered: number;
        pending: number;
        totalSpent: number;
        lastOrder: string;
      }
    >();
    const categoryMap = new Map<string, { label: string; orders: number; revenue: number }>();

    orders.forEach((order) => {
      const playerKey = getPlayerKey(order);
      const currentPlayer = playerMap.get(playerKey) || {
        ign: order.minecraft_username || "Unknown",
        orders: 0,
        delivered: 0,
        pending: 0,
        totalSpent: 0,
        lastOrder: order.created_at,
      };

      currentPlayer.orders += 1;
      if (order.status === "delivered") currentPlayer.delivered += 1;
      if (order.status === "pending") currentPlayer.pending += 1;
      if (order.status === "verified" || order.status === "delivered") {
        currentPlayer.totalSpent += getNumericPrice(order.product_price);
      }
      if (new Date(order.created_at) > new Date(currentPlayer.lastOrder)) {
        currentPlayer.lastOrder = order.created_at;
      }
      playerMap.set(playerKey, currentPlayer);

      const category = order.product_category || "Other";
      const currentCategory = categoryMap.get(category) || {
        label: category,
        orders: 0,
        revenue: 0,
      };
      currentCategory.orders += 1;
      if (order.status === "verified" || order.status === "delivered") {
        currentCategory.revenue += getNumericPrice(order.product_price);
      }
      categoryMap.set(category, currentCategory);
    });

    const players = Array.from(playerMap.values());
    const repeatPlayers = players.filter((player) => player.orders > 1);
    const totalDelivered = orders.filter((order) => order.status === "delivered").length;
    const totalFulfillable = orders.filter((order) => order.status !== "rejected").length;
    const fulfillmentRate =
      totalFulfillable > 0 ? Math.round((totalDelivered / totalFulfillable) * 100) : 100;
    const averageOrderValue =
      orders.length > 0 ? Math.round(stats.revenue / Math.max(1, stats.verified + stats.delivered)) : 0;
    const playerCapacity =
      serverStatus.playersMax > 0
        ? Math.round((serverStatus.playersOnline / serverStatus.playersMax) * 100)
        : 0;
    const automationCompletion =
      minecraftActions.length > 0
        ? Math.round((actionStats.completed / minecraftActions.length) * 100)
        : 100;

    return {
      uniquePlayers: players.length,
      repeatPlayers: repeatPlayers.length,
      repeatRate: players.length > 0 ? Math.round((repeatPlayers.length / players.length) * 100) : 0,
      topSupporters: players
        .sort((a, b) => b.totalSpent - a.totalSpent || b.orders - a.orders)
        .slice(0, 4),
      categories: Array.from(categoryMap.values())
        .sort((a, b) => b.revenue - a.revenue || b.orders - a.orders)
        .slice(0, 4),
      fulfillmentRate,
      averageOrderValue,
      playerCapacity,
      automationCompletion,
    };
  }, [
    actionStats.completed,
    minecraftActions.length,
    orders,
    serverStatus.playersMax,
    serverStatus.playersOnline,
    stats.delivered,
    stats.revenue,
    stats.verified,
  ]);

  const syncedProfileSummary = useMemo(
    () => getPlayerProfileSummary(serverProfiles),
    [serverProfiles],
  );

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

  async function loadServerProfiles() {
    const { data, error } = await fetchMinecraftPlayerProfiles(500);
    if (!error) setServerProfiles(data);
  }

  useEffect(() => {
    void loadMinecraftActions();
    void loadServerProfiles();
  }, []);

  function openOrders(filter: StatusFilter) {
    onSetOrderFilter(filter);
    onNavigate("orders");
  }

  const intelligenceRows: Array<{ label: string; value: string | number }> = [
    { label: "Players Online", value: `${serverStatus.playersOnline}/${serverStatus.playersMax}` },
    { label: "Capacity", value: `${serverIntelligence.playerCapacity}%` },
    { label: "Unique Supporters", value: syncedProfileSummary.linked || serverIntelligence.uniquePlayers },
    { label: "Repeat Rate", value: `${serverIntelligence.repeatRate}%` },
    { label: "Repeat Players", value: serverIntelligence.repeatPlayers },
    { label: "Fulfillment Rate", value: `${serverIntelligence.fulfillmentRate}%` },
    { label: "Automation Success", value: `${serverIntelligence.automationCompletion}%` },
    { label: "Avg Order Value", value: `PHP ${serverIntelligence.averageOrderValue}` },
    { label: "Synced Profiles", value: serverProfiles.length },
    { label: "Synced Online", value: syncedProfileSummary.online },
    { label: "Avg Playtime", value: getFormattedPlaytime(syncedProfileSummary.averagePlaytime) },
    { label: "Avg Balance", value: syncedProfileSummary.averageBalance },
  ];

  return (
    <section className="mt-5 flex flex-col gap-4">
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#565d78]">
              Staff operations
            </p>
            <h2 className="mt-2 text-xl font-extrabold text-white">
              Command Center
            </h2>
            <p className="mt-1.5 max-w-2xl text-[13px] leading-6 text-[#9aa0b8]">
              Review urgent orders, today&apos;s movement, Minecraft queue health, and staff workflow
              entry points from one clean overview.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              onRefresh();
              void loadMinecraftActions();
              void loadServerProfiles();
            }}
            className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[13px] font-bold text-[#c4c9dc] transition hover:bg-white/[0.06]"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh Center
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <StatusPill
            label={realtimeStatus === "error" ? "Realtime Offline" : "Realtime Live"}
            tone={realtimeStatus === "error" ? "danger" : "success"}
          />
          {lastUpdated && <StatusPill label={`Updated ${lastUpdated}`} tone="neutral" />}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b91ad]">
                Mission Brief
              </p>
              <h3 className="mt-2 text-lg font-extrabold text-white">{commandHealth.label}</h3>
            </div>
            <div
              className={`grid h-16 w-16 shrink-0 place-items-center rounded-full border ${
                commandHealth.tone === "danger"
                  ? "border-[rgba(248,113,113,0.35)]"
                  : commandHealth.tone === "warning"
                    ? "border-[rgba(251,191,36,0.35)]"
                    : "border-[rgba(52,211,153,0.3)]"
              } bg-black/25`}
            >
              <div className="text-center">
                <Gauge
                  className={`mx-auto h-4 w-4 ${
                    commandHealth.tone === "danger"
                      ? "text-[#fca5a5]"
                      : commandHealth.tone === "warning"
                        ? "text-[#fbbf24]"
                        : "text-[#34d399]"
                  }`}
                />
                <p className="mt-1 text-sm font-extrabold text-white">{commandHealth.score}</p>
              </div>
            </div>
          </div>

          <p className="mt-3 text-[13px] leading-6 text-[#9aa0b8]">{commandHealth.summary}</p>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
            <MiniStat label="Fulfilled" value={commandHealth.completionRate} suffix="%" />
            <MiniStat label="Paid/Verified" value={commandHealth.conversionRate} suffix="%" />
            <MiniStat
              label="Oldest Pending"
              value={formatOrderAge(commandHealth.oldestPendingMinutes)}
              alert={commandHealth.oldestPendingMinutes > 60}
            />
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b91ad]">
                Bottleneck Radar
              </p>
              <h3 className="mt-2 text-lg font-extrabold text-white">What staff should clear next</h3>
            </div>
            <Activity className="h-5 w-5 text-[#8b91ad]" />
          </div>

          <div className="mt-4 grid gap-2.5">
            {bottlenecks.map((item) => (
              <RadarButton
                key={item.label}
                label={item.label}
                value={item.value}
                helper={item.helper}
                alert={item.alert}
                onClick={item.action}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b91ad]">
                Needs Attention Queue
              </p>
              <h3 className="mt-2 text-lg font-extrabold text-white">
                Orders staff should review first
              </h3>
            </div>

            <button
              type="button"
              onClick={() => openOrders("needs_attention")}
              className="rounded-[10px] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-3.5 py-2 text-[13px] font-bold text-[#fca5a5] transition hover:bg-[rgba(248,113,113,0.14)]"
            >
              Open Queue
            </button>
          </div>

          <div className="mt-4 grid gap-2.5">
            {priorityOrders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => openOrders("needs_attention")}
                className="rounded-[11px] border border-white/[0.07] bg-black/25 p-3.5 text-left transition hover:border-white/[0.14]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-white">{order.product_name}</p>
                    <p className="mt-1 text-[13px] text-[#9aa0b8]">
                      {order.minecraft_username || "No IGN"} &middot; {order.discord_username || "No Discord"}
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-1.5 sm:items-end">
                    <span className="rounded-full border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.1)] px-2.5 py-0.5 text-[11px] font-bold text-[#fca5a5]">
                      {getPriorityLabel(order)}
                    </span>
                    <span className="text-[11px] font-semibold text-[#6b7192]">
                      Age {formatOrderAge(getOrderAgeMinutes(order))}
                    </span>
                  </div>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                  <span className="mono text-[#6b7192]" style={{ fontFamily: "ui-monospace, monospace" }}>
                    {getOrderReference(order)}
                  </span>
                  <StatusChip status={order.status} />
                  <span className="font-bold text-[#fde047]">{order.product_price}</span>
                </div>
              </button>
            ))}

            {needsAttentionOrders.length === 0 && (
              <div className="rounded-[11px] border border-white/[0.07] bg-black/20 p-6 text-center text-[13px] text-[#6b7192]">
                No urgent orders right now.
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b91ad]">
              Quick Navigation
            </p>

            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              <QuickButton label="Orders" icon={<PackageCheck className="h-4 w-4" />} onClick={() => onNavigate("orders")} />
              <QuickButton label="Players" icon={<UsersRound className="h-4 w-4" />} onClick={() => onNavigate("players")} />
              <QuickButton label="MC Queue" icon={<Terminal className="h-4 w-4" />} onClick={() => onNavigate("minecraft")} />
              <QuickButton label="Staff Activity" icon={<Zap className="h-4 w-4" />} onClick={() => onNavigate("activity")} />
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b91ad]">
              Minecraft Queue Health
            </p>

            <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
              <MiniStat label="Waiting" value={actionStats.waiting} />
              <MiniStat label="Completed" value={actionStats.completed} />
              <MiniStat label="Failed" value={actionStats.failed} alert={actionStats.failed > 0} />
            </div>

            {actionError && (
              <div className="mt-3 rounded-[10px] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] p-3 text-[13px] font-semibold text-[#fca5a5]">
                {actionError}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b91ad]">
              Sales Signals
            </p>

            <div className="mt-3 grid gap-2.5">
              {topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="rounded-[11px] border border-white/[0.07] bg-black/20 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-bold text-white">
                        #{index + 1} {product.name}
                      </p>
                      <p className="mt-1 text-xs text-[#6b7192]">{product.count} orders</p>
                    </div>
                    <span className="font-bold text-[#fde047]">PHP {product.revenue}</span>
                  </div>
                </div>
              ))}

              {topProducts.length === 0 && (
                <div className="rounded-[11px] border border-white/[0.07] bg-black/20 p-6 text-center text-[13px] text-[#6b7192]">
                  Sales signals will appear after orders come in.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b91ad]">
            Recent Orders
          </p>

          <div className="mt-3 grid gap-2.5">
            {recentOrders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => openOrders("all")}
                className="rounded-[11px] border border-white/[0.07] bg-black/20 p-3.5 text-left transition hover:border-white/[0.14]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-white">{order.product_name}</p>
                    <p className="mt-1 text-[13px] text-[#9aa0b8]">
                      {order.minecraft_username || "No IGN"} &middot; {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <StatusChip status={order.status} />
                </div>
              </button>
            ))}

            {recentOrders.length === 0 && (
              <div className="rounded-[11px] border border-white/[0.07] bg-black/20 p-6 text-center text-[13px] text-[#6b7192]">
                No orders yet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b91ad]">
            Recent Minecraft Actions
          </p>

          {loadingActions ? (
            <div className="mt-3 flex items-center justify-center gap-3 rounded-[11px] border border-white/[0.07] bg-black/20 p-8 text-[13px] text-[#9aa0b8]">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading Minecraft actions...
            </div>
          ) : (
            <div className="mt-3 grid gap-2.5">
              {minecraftActions.slice(0, 5).map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => onNavigate("minecraft")}
                  className="rounded-[11px] border border-white/[0.07] bg-black/20 p-3.5 text-left transition hover:border-white/[0.14]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-white">
                        {minecraftActionLabels[action.action_type]} &middot; {action.minecraft_username}
                      </p>
                      <p className="mt-1 text-[13px] text-[#9aa0b8]">
                        {getMinecraftActionPayloadSummary(action)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                        action.status === "failed"
                          ? "border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.1)] text-[#fca5a5]"
                          : "border-[rgba(96,165,250,0.25)] bg-[rgba(96,165,250,0.1)] text-[#60a5fa]"
                      }`}
                    >
                      {minecraftActionStatusLabels[action.status]}
                    </span>
                  </div>
                </button>
              ))}

              {minecraftActions.length === 0 && (
                <div className="rounded-[11px] border border-white/[0.07] bg-black/20 p-6 text-center text-[13px] text-[#6b7192]">
                  No Minecraft actions yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Server intelligence -- collapsed below the fold, plain definition list */}
      <details className="group rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                serverStatus.loading
                  ? "border-[rgba(251,191,36,0.25)] bg-[rgba(251,191,36,0.1)] text-[#fbbf24]"
                  : serverStatus.online
                    ? "border-[rgba(52,211,153,0.25)] bg-[rgba(52,211,153,0.1)] text-[#34d399]"
                    : "border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.1)] text-[#f87171]"
              }`}
            >
              <Radio className="h-3 w-3" />
              {serverStatus.loading ? "Checking" : serverStatus.online ? "Online" : "Offline"}
            </span>
            <div>
              <p className="text-[13px] font-extrabold text-white">Minecraft Server Intelligence</p>
              <p className="text-xs text-[#6b7192]">
                {serverStatus.playersOnline}/{serverStatus.playersMax} players &middot; {serverStatus.version}
              </p>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-[#6b7192] transition group-open:rotate-180" />
        </summary>

        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 border-t border-white/[0.06] pt-4 sm:grid-cols-3 lg:grid-cols-4">
          {intelligenceRows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-3 border-b border-white/[0.05] pb-2">
              <span className="text-xs text-[#8b91ad]">{row.label}</span>
              <span className="text-[13px] font-bold text-white">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#8b91ad]">
              Top Supporters
            </p>
            <div className="mt-2.5 grid gap-2">
              {serverIntelligence.topSupporters.map((player) => (
                <div
                  key={player.ign}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-white/[0.06] bg-black/20 p-3"
                >
                  <div>
                    <p className="font-bold text-white">{player.ign}</p>
                    <p className="mt-0.5 text-xs text-[#6b7192]">
                      {player.orders} order{player.orders === 1 ? "" : "s"} &middot; {player.delivered} delivered
                    </p>
                  </div>
                  <span className="font-bold text-[#fde047]">PHP {player.totalSpent}</span>
                </div>
              ))}
              {serverIntelligence.topSupporters.length === 0 && (
                <div className="rounded-[10px] border border-white/[0.06] bg-black/20 p-4 text-center text-xs text-[#6b7192]">
                  Supporter stats will appear after orders come in.
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#8b91ad]">
              Store Demand By Category
            </p>
            <div className="mt-2.5 grid gap-2">
              {serverIntelligence.categories.map((category) => (
                <div
                  key={category.label}
                  className="rounded-[10px] border border-white/[0.06] bg-black/20 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-bold text-white">{category.label}</p>
                    <span className="font-bold text-[#fde047]">PHP {category.revenue}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className="h-full rounded-full bg-[#a855f7]"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(8, (category.orders / Math.max(1, orders.length)) * 100),
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-[#6b7192]">
                    {category.orders} order{category.orders === 1 ? "" : "s"}
                  </p>
                </div>
              ))}
              {serverIntelligence.categories.length === 0 && (
                <div className="rounded-[10px] border border-white/[0.06] bg-black/20 p-4 text-center text-xs text-[#6b7192]">
                  Category demand will appear after orders come in.
                </div>
              )}
            </div>
          </div>
        </div>
      </details>
    </section>
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
    success: "border-[rgba(52,211,153,0.25)] bg-[rgba(52,211,153,0.08)] text-[#6ee7b7]",
    danger: "border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.08)] text-[#fca5a5]",
    neutral: "border-white/[0.08] bg-white/[0.03] text-[#9aa0b8]",
  }[tone];

  return (
    <span className={`rounded-full border px-3 py-1 text-[11px] font-bold ${toneClass}`}>
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
      className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/[0.07] bg-black/20 px-3.5 py-2.5 text-[13px] font-bold text-[#c4c9dc] transition hover:border-white/[0.14] hover:bg-white/[0.04]"
    >
      {icon}
      {label}
    </button>
  );
}

function MiniStat({
  label,
  value,
  alert,
  suffix,
}: {
  label: string;
  value: number | string;
  alert?: boolean;
  suffix?: string;
}) {
  return (
    <div
      className={`rounded-[10px] border p-2.5 ${
        alert ? "border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)]" : "border-white/[0.07] bg-black/20"
      }`}
    >
      <p className="text-xs text-[#8b91ad]">{label}</p>
      <p className={`mt-1 text-[15px] font-extrabold ${alert ? "text-[#fca5a5]" : "text-white"}`}>
        {value}
        {suffix}
      </p>
    </div>
  );
}

function RadarButton({
  label,
  value,
  helper,
  alert,
  onClick,
}: {
  label: string;
  value: number;
  helper: string;
  alert: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center justify-between gap-4 rounded-[11px] border p-3.5 text-left transition hover:bg-white/[0.04] ${
        alert ? "border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.06)]" : "border-white/[0.07] bg-black/20"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-[9px] border text-[15px] font-extrabold ${
            alert ? "border-[rgba(248,113,113,0.3)] text-[#fca5a5]" : "border-white/[0.08] text-white"
          }`}
        >
          {value}
        </span>
        <div className="min-w-0">
          <p className="font-bold text-white">{label}</p>
          <p className="mt-0.5 truncate text-[13px] text-[#9aa0b8]">{helper}</p>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-[#6b7192] transition group-hover:translate-x-1" />
    </button>
  );
}
