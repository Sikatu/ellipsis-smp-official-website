import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Coins,
  Loader2,
  MessageSquare,
  PackageCheck,
  ReceiptText,
  ShieldAlert,
  Terminal,
  UserRound,
  X,
} from "lucide-react";
import type { Order } from "../../types/admin";
import type {
  MinecraftAdminAction,
  MinecraftActionType,
} from "../../types/minecraftActions";
import {
  fetchMinecraftAdminActions,
  getMinecraftActionPayloadSummary,
  minecraftActionLabels,
  minecraftActionStatusLabels,
} from "../../services/minecraftActions";

export type AdminPlayerProfile = {
  ign: string;
  discord: string;
  orders: Order[];
  totalSpent: number;
  latestOrder: string;
};

type AdminPlayerProfileModalProps = {
  isOpen: boolean;
  player: AdminPlayerProfile | null;
  canManagePlayers: boolean;
  onClose: () => void;
  onOpenNotes: (player: AdminPlayerProfile) => void;
  onOpenAction: (player: AdminPlayerProfile, actionType: MinecraftActionType) => void;
};

type ProfileTab = "overview" | "orders" | "actions" | "controls";

const tabs: Array<{ label: string; value: ProfileTab }> = [
  { label: "Overview", value: "overview" },
  { label: "Orders", value: "orders" },
  { label: "Minecraft Actions", value: "actions" },
  { label: "Quick Controls", value: "controls" },
];

const orderStatusStyles: Record<Order["status"], string> = {
  pending: "border-yellow-400/25 bg-yellow-400/10 text-yellow-200",
  verified: "border-blue-400/25 bg-blue-500/10 text-blue-200",
  delivered: "border-emerald-400/25 bg-emerald-500/10 text-emerald-200",
  rejected: "border-red-400/25 bg-red-500/10 text-red-200",
};


function getOrderReference(order: Order) {
  return order.payment_reference || order.id;
}

export function AdminPlayerProfileModal({
  isOpen,
  player,
  canManagePlayers,
  onClose,
  onOpenNotes,
  onOpenAction,
}: AdminPlayerProfileModalProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [actions, setActions] = useState<MinecraftAdminAction[]>([]);
  const [loadingActions, setLoadingActions] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error"; text: string } | null>(null);

  useEffect(() => {
    if (!isOpen || !player?.ign) return;

    const playerIgn = player.ign;
    let isMounted = true;

    async function loadActions() {
      setLoadingActions(true);
      setFeedback(null);

      const result = await fetchMinecraftAdminActions(playerIgn);

      if (!isMounted) return;

      if (result.error) {
        setFeedback({ type: "error", text: result.error.message });
      } else {
        setActions(result.data);
      }

      setLoadingActions(false);
    }

    setActiveTab("overview");
    loadActions();

    return () => {
      isMounted = false;
    };
  }, [isOpen, player?.ign]);

  const stats = useMemo(() => {
    const orders = player?.orders || [];

    return {
      pending: orders.filter((order) => order.status === "pending").length,
      verified: orders.filter((order) => order.status === "verified").length,
      delivered: orders.filter((order) => order.status === "delivered").length,
      rejected: orders.filter((order) => order.status === "rejected").length,
      queuedActions: actions.filter((action) => action.status === "queued").length,
      completedActions: actions.filter((action) => action.status === "completed").length,
      failedActions: actions.filter((action) => action.status === "failed").length,
    };
  }, [actions, player?.orders]);

  if (!isOpen || !player) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-purple-400/25 bg-[#12091f] shadow-[0_0_70px_rgba(168,85,247,0.22)]">
        <div className="border-b border-white/10 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-300">
                Player Profile Control Center
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3">
                  <UserRound className="h-6 w-6 text-emerald-300" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white">{player.ign}</h2>
                  <p className="mt-1 text-sm text-gray-400">Discord: {player.discord}</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Close player profile"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wider transition ${
                  activeTab === tab.value
                    ? "border-purple-300 bg-purple-500/20 text-purple-100"
                    : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-purple-300/40 hover:text-purple-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[calc(92vh-190px)] overflow-y-auto p-5 sm:p-6">
          {feedback && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm font-bold text-red-200">
              {feedback.text}
            </div>
          )}

          {activeTab === "overview" && (
            <div className="grid gap-5">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Spend" value={`PHP ${player.totalSpent}`} icon={<Coins className="h-5 w-5" />} />
                <StatCard label="Orders" value={player.orders.length} icon={<PackageCheck className="h-5 w-5" />} />
                <StatCard label="Delivered" value={stats.delivered} icon={<ReceiptText className="h-5 w-5" />} />
                <StatCard label="MC Actions" value={actions.length} icon={<Terminal className="h-5 w-5" />} />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5">
                  <h3 className="text-lg font-black text-white">Order Health</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-4">
                    <MiniStat label="Pending" value={stats.pending} />
                    <MiniStat label="Verified" value={stats.verified} />
                    <MiniStat label="Delivered" value={stats.delivered} />
                    <MiniStat label="Rejected" value={stats.rejected} />
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5">
                  <h3 className="text-lg font-black text-white">Minecraft Queue Health</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <MiniStat label="Queued" value={stats.queuedActions} />
                    <MiniStat label="Completed" value={stats.completedActions} />
                    <MiniStat label="Failed" value={stats.failedActions} />
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-500/10 p-5">
                <p className="text-xs font-black uppercase tracking-widest text-emerald-200">
                  Last Activity
                </p>
                <p className="mt-2 text-sm text-gray-300">
                  Last order: {new Date(player.latestOrder).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="grid gap-3">
              {player.orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${orderStatusStyles[order.status]}`}>
                          {order.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleString()}
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-black text-white">{order.product_name}</h3>
                      <p className="mt-1 text-sm text-gray-300">
                        {order.product_category} • {order.quantity || "N/A"} qty
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-black text-yellow-300">{order.product_price}</p>
                      <p className="mt-1 font-mono text-xs text-gray-500">{getOrderReference(order)}</p>
                    </div>
                  </div>
                </article>
              ))}

              {player.orders.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-gray-400">
                  No orders found for this player.
                </div>
              )}
            </div>
          )}

          {activeTab === "actions" && (
            <div className="grid gap-3">
              {loadingActions ? (
                <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-gray-300">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading Minecraft actions...
                </div>
              ) : actions.length > 0 ? (
                actions.map((action) => (
                  <article
                    key={action.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-black text-white">
                          {minecraftActionLabels[action.action_type]}
                        </p>
                        <p className="mt-1 text-sm text-gray-300">
                          {getMinecraftActionPayloadSummary(action)}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-gray-400">
                          {action.reason || "No reason provided."}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-black uppercase text-blue-200">
                          {minecraftActionStatusLabels[action.status]}
                        </span>
                        <p className="mt-2 text-xs text-gray-500">
                          {new Date(action.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-gray-400">
                  No Minecraft actions found for this player.
                </div>
              )}
            </div>
          )}

          {activeTab === "controls" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <button
                type="button"
                onClick={() => onOpenAction(player, "give_rank")}
                disabled={!canManagePlayers}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-400/25 bg-blue-500/10 px-5 py-4 text-sm font-black text-blue-100 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-gray-500"
              >
                <BadgeCheck className="h-4 w-4" />
                Give Rank
              </button>

              <button
                type="button"
                onClick={() => onOpenAction(player, "give_coins")}
                disabled={!canManagePlayers}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-yellow-400/25 bg-yellow-500/10 px-5 py-4 text-sm font-black text-yellow-100 transition hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-gray-500"
              >
                <Coins className="h-4 w-4" />
                Give Coins
              </button>

              <button
                type="button"
                onClick={() => onOpenAction(player, "jail")}
                disabled={!canManagePlayers}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/25 bg-red-500/10 px-5 py-4 text-sm font-black text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-gray-500"
              >
                <ShieldAlert className="h-4 w-4" />
                Jail / Ban
              </button>

              <button
                type="button"
                onClick={() => onOpenNotes(player)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-5 py-4 text-sm font-black text-emerald-100 transition hover:bg-emerald-500/20"
              >
                <MessageSquare className="h-4 w-4" />
                Player Notes
              </button>

              {!canManagePlayers && (
                <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm font-bold text-yellow-100 lg:col-span-2">
                  Your Support role can view this profile but cannot queue Minecraft actions.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-purple-500/20 bg-white/[0.045] p-4">
      <div className="text-purple-300">{icon}</div>
      <p className="mt-3 text-xs font-black uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}

