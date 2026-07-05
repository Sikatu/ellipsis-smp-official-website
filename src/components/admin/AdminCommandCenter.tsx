import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  Clock3,
  Coins,
  Gauge,
  Loader2,
  PackageCheck,
  Radio,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  Terminal,
  TrendingUp,
  UsersRound,
  Zap,
} from "lucide-react";
import type { AdminTab } from "./AdminDashboardTabs";
import type { Order, StatusFilter } from "../../types/admin";
import type { MinecraftAdminAction } from "../../types/minecraftActions";
import { useServerStatus } from "../../hooks/useServerStatus";
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
      tone: stats.pending > 0 ? "blue" : "emerald",
      action: () => openOrders("pending"),
    },
    {
      label: "Delivery Queue",
      value: stats.verified,
      helper: "Verified orders that still need fulfillment",
      tone: stats.verified > 0 ? "cyan" : "emerald",
      action: () => openOrders("verified"),
    },
    {
      label: "MC Automation",
      value: actionStats.waiting + actionStats.failed,
      helper: actionStats.failed > 0 ? "Failed Minecraft action needs review" : "Queued Minecraft actions",
      tone: actionStats.failed > 0 ? "red" : actionStats.waiting > 0 ? "yellow" : "emerald",
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

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className={`rounded-[2rem] border p-5 ${
          commandHealth.tone === "danger"
            ? "border-red-500/30 bg-red-500/[0.08]"
            : commandHealth.tone === "warning"
              ? "border-yellow-500/30 bg-yellow-500/[0.08]"
              : "border-emerald-500/25 bg-emerald-500/[0.07]"
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-gray-300">
                Mission Brief
              </p>
              <h3 className="mt-2 text-2xl font-black text-white">{commandHealth.label}</h3>
            </div>
            <div className="grid h-20 w-20 place-items-center rounded-full border border-white/15 bg-black/25">
              <div className="text-center">
                <Gauge className="mx-auto h-5 w-5 text-white" />
                <p className="mt-1 text-lg font-black text-white">{commandHealth.score}</p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-gray-300">{commandHealth.summary}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MiniStat label="Fulfilled" value={commandHealth.completionRate} suffix="%" />
            <MiniStat label="Paid/Verified" value={commandHealth.conversionRate} suffix="%" />
            <MiniStat
              label="Oldest Pending"
              value={formatOrderAge(commandHealth.oldestPendingMinutes)}
              danger={commandHealth.oldestPendingMinutes > 60}
            />
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
                Bottleneck Radar
              </p>
              <h3 className="mt-2 text-2xl font-black text-white">What staff should clear next</h3>
            </div>
            <Activity className="h-6 w-6 text-cyan-300" />
          </div>

          <div className="mt-5 grid gap-3">
            {bottlenecks.map((item) => (
              <RadarButton
                key={item.label}
                label={item.label}
                value={item.value}
                helper={item.helper}
                tone={item.tone}
                onClick={item.action}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[2rem] border border-cyan-500/20 bg-cyan-500/[0.055] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
              Minecraft Server Intelligence
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              Live server and player economy statistics
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-300">
              A combined view of live server health, supporter behavior, product demand, and staff
              fulfillment strength.
            </p>
          </div>

          <div className={`rounded-2xl border px-4 py-3 ${
            serverStatus.loading
              ? "border-yellow-400/25 bg-yellow-500/10 text-yellow-100"
              : serverStatus.online
                ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-100"
                : "border-red-400/25 bg-red-500/10 text-red-100"
          }`}>
            <div className="flex items-center gap-2 text-sm font-black">
              <Radio className="h-4 w-4" />
              {serverStatus.loading ? "Checking Server" : serverStatus.online ? "Server Online" : "Server Offline"}
            </div>
            <p className="mt-1 text-xs text-gray-300">
              {serverStatus.playersOnline} / {serverStatus.playersMax} players • {serverStatus.version}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <CommandStat
            label="Players Online"
            value={`${serverStatus.playersOnline}/${serverStatus.playersMax}`}
            icon={<UsersRound className="h-5 w-5" />}
            tone={serverStatus.online ? "emerald" : "red"}
          />
          <CommandStat
            label="Capacity"
            value={`${serverIntelligence.playerCapacity}%`}
            icon={<Gauge className="h-5 w-5" />}
            tone={serverIntelligence.playerCapacity > 80 ? "yellow" : "cyan"}
          />
          <CommandStat
            label="Unique Supporters"
            value={serverIntelligence.uniquePlayers}
            icon={<UsersRound className="h-5 w-5" />}
            tone="purple"
          />
          <CommandStat
            label="Repeat Rate"
            value={`${serverIntelligence.repeatRate}%`}
            icon={<TrendingUp className="h-5 w-5" />}
            tone={serverIntelligence.repeatRate > 25 ? "emerald" : "blue"}
          />
          <CommandStat
            label="Fulfillment Rate"
            value={`${serverIntelligence.fulfillmentRate}%`}
            icon={<PackageCheck className="h-5 w-5" />}
            tone={serverIntelligence.fulfillmentRate > 85 ? "emerald" : "yellow"}
          />
          <CommandStat
            label="Automation Success"
            value={`${serverIntelligence.automationCompletion}%`}
            icon={<Zap className="h-5 w-5" />}
            tone={serverIntelligence.automationCompletion > 90 ? "emerald" : "yellow"}
          />
          <CommandStat
            label="Avg Order Value"
            value={`PHP ${serverIntelligence.averageOrderValue}`}
            icon={<Coins className="h-5 w-5" />}
            tone="yellow"
          />
          <CommandStat
            label="Repeat Players"
            value={serverIntelligence.repeatPlayers}
            icon={<Activity className="h-5 w-5" />}
            tone="cyan"
          />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
              Top Supporters
            </p>
            <div className="mt-4 grid gap-3">
              {serverIntelligence.topSupporters.map((player) => (
                <div
                  key={player.ign}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <div>
                    <p className="font-black text-white">{player.ign}</p>
                    <p className="mt-1 text-sm text-gray-400">
                      {player.orders} order{player.orders === 1 ? "" : "s"} • {player.delivered} delivered
                    </p>
                  </div>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-200">
                    PHP {player.totalSpent}
                  </span>
                </div>
              ))}
              {serverIntelligence.topSupporters.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-sm text-gray-400">
                  Supporter stats will appear after orders come in.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-300">
              Store Demand By Category
            </p>
            <div className="mt-4 grid gap-3">
              {serverIntelligence.categories.map((category) => (
                <div
                  key={category.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-black text-white">{category.label}</p>
                    <span className="rounded-full border border-yellow-400/20 bg-yellow-500/10 px-3 py-1 text-xs font-black text-yellow-200">
                      PHP {category.revenue}
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-yellow-300"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(8, (category.orders / Math.max(1, orders.length)) * 100),
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    {category.orders} order{category.orders === 1 ? "" : "s"}
                  </p>
                </div>
              ))}
              {serverIntelligence.categories.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-sm text-gray-400">
                  Category demand will appear after orders come in.
                </div>
              )}
            </div>
          </div>
        </div>
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
            {priorityOrders.map((order) => (
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
                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <span className="rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-xs font-black uppercase text-red-200">
                      {getPriorityLabel(order)}
                    </span>
                    <span className="text-xs font-bold text-gray-500">
                      Age {formatOrderAge(getOrderAgeMinutes(order))}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono text-gray-500">{getOrderReference(order)}</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 font-black uppercase text-gray-300">
                    {order.status}
                  </span>
                  <span className="rounded-full border border-yellow-400/20 bg-yellow-500/10 px-2 py-1 font-black text-yellow-200">
                    {order.product_price}
                  </span>
                </div>
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

          <div className="rounded-[2rem] border border-pink-500/20 bg-pink-500/[0.06] p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-pink-300">
              Sales Signals
            </p>

            <div className="mt-4 grid gap-3">
              {topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="rounded-2xl border border-white/10 bg-black/20 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-white">
                        #{index + 1} {product.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">{product.count} orders</p>
                    </div>
                    <span className="rounded-full border border-pink-400/20 bg-pink-500/10 px-3 py-1 text-xs font-black text-pink-200">
                      PHP {product.revenue}
                    </span>
                  </div>
                </div>
              ))}

              {topProducts.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-sm text-gray-400">
                  Sales signals will appear after orders come in.
                </div>
              )}
            </div>
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
  suffix,
}: {
  label: string;
  value: number | string;
  danger?: boolean;
  suffix?: string;
}) {
  return (
    <div className={`rounded-2xl border p-3 ${
      danger
        ? "border-red-400/25 bg-red-500/10"
        : "border-white/10 bg-black/20"
    }`}>
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`mt-1 text-lg font-black ${danger ? "text-red-200" : "text-white"}`}>
        {value}{suffix}
      </p>
    </div>
  );
}

function RadarButton({
  label,
  value,
  helper,
  tone,
  onClick,
}: {
  label: string;
  value: number;
  helper: string;
  tone: string;
  onClick: () => void;
}) {
  const toneClass = {
    blue: "border-blue-400/25 bg-blue-500/10 text-blue-200",
    cyan: "border-cyan-400/25 bg-cyan-500/10 text-cyan-200",
    emerald: "border-emerald-400/25 bg-emerald-500/10 text-emerald-200",
    red: "border-red-400/30 bg-red-500/12 text-red-200",
    yellow: "border-yellow-400/25 bg-yellow-500/10 text-yellow-200",
  }[tone] || "border-white/10 bg-black/20 text-gray-200";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center justify-between gap-4 rounded-2xl border p-4 text-left transition hover:bg-white/[0.08] ${toneClass}`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/20 text-lg font-black text-white">
            {value}
          </span>
          <div>
            <p className="font-black text-white">{label}</p>
            <p className="mt-1 text-sm text-gray-300">{helper}</p>
          </div>
        </div>
      </div>
      <ArrowRight className="h-5 w-5 shrink-0 transition group-hover:translate-x-1" />
    </button>
  );
}

