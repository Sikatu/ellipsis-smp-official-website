import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Ban,
  CheckCircle2,
  Coins,
  Loader2,
  RefreshCcw,
  Search,
  ShieldAlert,
  TimerReset,
  XCircle,
} from "lucide-react";
import type {
  MinecraftAdminAction,
  MinecraftActionStatus,
  MinecraftActionType,
} from "../../types/minecraftActions";
import {
  fetchAllMinecraftAdminActions,
  minecraftActionLabels,
  minecraftActionStatusLabels,
  updateMinecraftAdminActionStatus,
} from "../../services/minecraftActions";

type AdminMinecraftActionCenterProps = {
  canManagePlayers: boolean;
};

type StatusFilter = "all" | MinecraftActionStatus;

const statusFilters: Array<{ label: string; value: StatusFilter }> = [
  { label: "All", value: "all" },
  { label: "Queued", value: "queued" },
  { label: "Processing", value: "processing" },
  { label: "Completed", value: "completed" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" },
];

const statusStyles: Record<MinecraftActionStatus, string> = {
  queued: "border-yellow-400/25 bg-yellow-400/10 text-yellow-200",
  processing: "border-blue-400/25 bg-blue-500/10 text-blue-200",
  completed: "border-emerald-400/25 bg-emerald-500/10 text-emerald-200",
  failed: "border-red-400/25 bg-red-500/10 text-red-200",
  cancelled: "border-gray-400/25 bg-gray-500/10 text-gray-200",
};

function getActionIcon(actionType: MinecraftActionType) {
  if (actionType === "give_rank") return <BadgeCheck className="h-4 w-4" />;
  if (actionType === "give_coins") return <Coins className="h-4 w-4" />;
  if (actionType === "temp_ban") return <TimerReset className="h-4 w-4" />;
  return <ShieldAlert className="h-4 w-4" />;
}

function getPayloadSummary(action: MinecraftAdminAction) {
  const payload = action.payload || {};

  if (action.action_type === "give_rank") {
    return `Rank: ${String(payload.rank || "N/A")}`;
  }

  if (action.action_type === "give_coins") {
    return `Coins: ${String(payload.amount || "N/A")}`;
  }

  if (action.action_type === "temp_ban") {
    return `Duration: ${String(payload.duration || "N/A")}`;
  }

  return "No extra payload.";
}

function canUpdateStatus(status: MinecraftActionStatus) {
  return status === "queued" || status === "processing";
}

export function AdminMinecraftActionCenter({
  canManagePlayers,
}: AdminMinecraftActionCenterProps) {
  const [actions, setActions] = useState<MinecraftAdminAction[]>([]);
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("queued");
  const [loading, setLoading] = useState(false);
  const [updatingActionId, setUpdatingActionId] = useState<string | null>(null);
  const [resultMessages, setResultMessages] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function loadActions() {
    setLoading(true);
    setFeedback(null);

    const result = await fetchAllMinecraftAdminActions();

    if (result.error) {
      setFeedback({ type: "error", text: result.error.message });
    } else {
      setActions(result.data);

      const nextMessages: Record<string, string> = {};
      for (const action of result.data) {
        nextMessages[action.id] = action.result_message || "";
      }
      setResultMessages(nextMessages);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadActions();
  }, []);

  const filteredActions = useMemo(() => {
    return actions.filter((action) => {
      const statusMatch = activeStatus === "all" || action.status === activeStatus;
      const haystack = [
        action.minecraft_username,
        action.discord_username,
        minecraftActionLabels[action.action_type],
        action.action_type,
        action.reason,
        action.result_message,
        getPayloadSummary(action),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return statusMatch && haystack.includes(search.toLowerCase());
    });
  }, [actions, activeStatus, search]);

  const queueStats = useMemo(() => {
    return {
      queued: actions.filter((action) => action.status === "queued").length,
      processing: actions.filter((action) => action.status === "processing").length,
      completed: actions.filter((action) => action.status === "completed").length,
      failed: actions.filter((action) => action.status === "failed").length,
    };
  }, [actions]);

  async function handleStatusUpdate(action: MinecraftAdminAction, status: MinecraftActionStatus) {
    if (!canManagePlayers || updatingActionId) return;

    const message = resultMessages[action.id] || "";

    if (status === "failed" && !message.trim()) {
      setFeedback({
        type: "error",
        text: "Add a result message before marking an action as failed.",
      });
      return;
    }

    if (status === "completed" && !message.trim()) {
      setFeedback({
        type: "error",
        text: "Add a result message before marking an action as completed.",
      });
      return;
    }

    setUpdatingActionId(action.id);
    setFeedback(null);

    const result = await updateMinecraftAdminActionStatus({
      actionId: action.id,
      status,
      resultMessage: message,
    });

    if (result.error) {
      setFeedback({ type: "error", text: result.error.message });
    } else if (result.data) {
      setActions((current) =>
        current.map((item) => (item.id === result.data?.id ? result.data : item)),
      );
      setFeedback({
        type: "success",
        text: `Action marked as ${minecraftActionStatusLabels[status]}.`,
      });
    }

    setUpdatingActionId(null);
  }

  return (
    <section className="mt-6">
      <div className="rounded-[2rem] border border-purple-500/20 bg-purple-500/[0.06] p-6">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-300">
          Minecraft Operations
        </p>
        <h2 className="mt-3 text-2xl font-black text-white">
          Minecraft Action Center
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-300">
          Review and manage queued Minecraft actions from the Players dashboard.
          Actions are still manual-safe until the secure Minecraft bridge is connected.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
          <p className="text-xs font-black uppercase tracking-widest text-yellow-200">Queued</p>
          <p className="mt-2 text-2xl font-black text-white">{queueStats.queued}</p>
        </div>
        <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4">
          <p className="text-xs font-black uppercase tracking-widest text-blue-200">Processing</p>
          <p className="mt-2 text-2xl font-black text-white">{queueStats.processing}</p>
        </div>
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
          <p className="text-xs font-black uppercase tracking-widest text-emerald-200">Completed</p>
          <p className="mt-2 text-2xl font-black text-white">{queueStats.completed}</p>
        </div>
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
          <p className="text-xs font-black uppercase tracking-widest text-red-200">Failed</p>
          <p className="mt-2 text-2xl font-black text-white">{queueStats.failed}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 rounded-[1.75rem] border border-purple-500/20 bg-white/[0.045] p-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-300" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by IGN, Discord, action, reason, result..."
            className="w-full rounded-2xl border border-purple-500/20 bg-black/30 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-purple-300"
          />
        </div>

        <button
          type="button"
          onClick={loadActions}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-purple-400/25 bg-purple-500/10 px-4 py-3 text-sm font-black text-purple-100 transition hover:bg-purple-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          Refresh
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setActiveStatus(filter.value)}
            className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wider transition ${
              activeStatus === filter.value
                ? "border-purple-300 bg-purple-500/20 text-purple-100"
                : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-purple-300/40 hover:text-purple-100"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {feedback && (
        <div className={`mt-4 rounded-xl border p-3 text-sm font-bold ${
          feedback.type === "success"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
            : "border-red-500/30 bg-red-500/10 text-red-200"
        }`}>
          {feedback.text}
        </div>
      )}

      {loading ? (
        <div className="mt-6 flex items-center justify-center gap-3 rounded-[2rem] border border-purple-500/20 bg-white/[0.03] p-10 text-gray-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading Minecraft actions...
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {filteredActions.map((action) => {
            const isUpdating = updatingActionId === action.id;
            const editable = canManagePlayers && canUpdateStatus(action.status);

            return (
              <article
                key={action.id}
                className="rounded-[2rem] border border-purple-500/25 bg-white/[0.06] p-5 shadow-[0_0_35px_rgba(168,85,247,0.1)]"
              >
                <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${statusStyles[action.status]}`}>
                        {minecraftActionStatusLabels[action.status]}
                      </span>
                      <span className="text-sm text-gray-400">
                        {new Date(action.created_at).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="mt-3 flex flex-wrap items-center gap-2 text-xl font-black text-white">
                      {getActionIcon(action.action_type)}
                      {minecraftActionLabels[action.action_type]}
                    </h3>

                    <div className="mt-4 grid gap-3 text-sm text-gray-300 sm:grid-cols-2 lg:grid-cols-3">
                      <p><strong>IGN:</strong> <span className="font-mono text-white">{action.minecraft_username}</span></p>
                      <p><strong>Discord:</strong> <span className="text-white">{action.discord_username || "N/A"}</span></p>
                      <p><strong>Payload:</strong> <span className="text-white">{getPayloadSummary(action)}</span></p>
                      <p className="sm:col-span-2 lg:col-span-3">
                        <strong>Reason:</strong> <span className="text-white">{action.reason || "No reason provided."}</span>
                      </p>
                    </div>

                    <div className="mt-4">
                      <label className="text-xs font-black uppercase tracking-widest text-purple-300">
                        Result Message
                      </label>
                      <textarea
                        value={resultMessages[action.id] ?? ""}
                        onChange={(event) =>
                          setResultMessages((current) => ({
                            ...current,
                            [action.id]: event.target.value,
                          }))
                        }
                        disabled={!editable}
                        rows={3}
                        placeholder="Example: Rank delivered manually by Sikatu."
                        className="mt-2 w-full resize-none rounded-2xl border border-purple-500/20 bg-black/30 p-3 text-sm leading-6 text-white outline-none placeholder:text-gray-600 focus:border-purple-300 disabled:cursor-not-allowed disabled:opacity-70"
                      />
                    </div>

                    {action.processed_at && (
                      <p className="mt-3 text-xs text-gray-500">
                        Processed: {new Date(action.processed_at).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="grid content-start gap-2">
                    {action.status === "queued" && (
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(action, "processing")}
                        disabled={!canManagePlayers || isUpdating}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-400/25 bg-blue-500/10 px-4 py-3 text-sm font-black text-blue-100 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
                        Mark Processing
                      </button>
                    )}

                    {canUpdateStatus(action.status) && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(action, "completed")}
                          disabled={!canManagePlayers || isUpdating}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm font-black text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                          Mark Completed
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(action, "failed")}
                          disabled={!canManagePlayers || isUpdating}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm font-black text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                          Mark Failed
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(action, "cancelled")}
                          disabled={!canManagePlayers || isUpdating}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-400/25 bg-gray-500/10 px-4 py-3 text-sm font-black text-gray-100 transition hover:bg-gray-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                          Cancel Action
                        </button>
                      </>
                    )}

                    {!canManagePlayers && (
                      <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-xs font-bold text-yellow-100">
                        Support role can view this queue but cannot update Minecraft actions.
                      </div>
                    )}

                    {!canUpdateStatus(action.status) && (
                      <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs font-bold text-gray-400">
                        This action is already closed.
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}

          {filteredActions.length === 0 && (
            <div className="rounded-[2rem] border border-purple-500/20 bg-white/[0.02] p-10 text-center text-gray-400">
              No Minecraft actions found.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
