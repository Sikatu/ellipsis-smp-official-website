import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
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
  getMinecraftActionPayloadSummary,
  minecraftActionLabels,
  minecraftActionStatusLabels,
  updateMinecraftAdminActionStatus,
} from "../../services/minecraftActions";
import KpiTile from "./KpiTile";

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
  queued: "text-[#fbbf24] bg-[rgba(251,191,36,0.14)] border-[rgba(251,191,36,0.25)]",
  processing: "text-[#60a5fa] bg-[rgba(96,165,250,0.14)] border-[rgba(96,165,250,0.25)]",
  completed: "text-[#34d399] bg-[rgba(52,211,153,0.14)] border-[rgba(52,211,153,0.25)]",
  failed: "text-[#f87171] bg-[rgba(248,113,113,0.14)] border-[rgba(248,113,113,0.25)]",
  cancelled: "text-[#8b91ad] bg-white/[0.05] border-white/[0.1]",
};

function getActionIcon(actionType: MinecraftActionType) {
  if (actionType === "give_rank") return <BadgeCheck className="h-4 w-4" />;
  if (actionType === "give_coins") return <Coins className="h-4 w-4" />;
  if (actionType === "temp_ban") return <TimerReset className="h-4 w-4" />;
  if (actionType === "sync_all_profiles") return <RefreshCcw className="h-4 w-4" />;
  return <ShieldAlert className="h-4 w-4" />;
}

function canUpdateStatus(status: MinecraftActionStatus) {
  return status === "queued" || status === "processing";
}

function ActionRow({
  action,
  canManagePlayers,
  resultMessage,
  onResultMessageChange,
  onStatusUpdate,
  isUpdating,
}: {
  action: MinecraftAdminAction;
  canManagePlayers: boolean;
  resultMessage: string;
  onResultMessageChange: (value: string) => void;
  onStatusUpdate: (status: MinecraftActionStatus) => void;
  isUpdating: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const editable = canManagePlayers && canUpdateStatus(action.status);

  return (
    <div className="border-b border-white/[0.05] last:border-b-0">
      <button
        type="button"
        onClick={() => setIsExpanded((value) => !value)}
        className="grid w-full grid-cols-[1fr_auto] items-center gap-3 px-4 py-3.5 text-left text-[13px] transition hover:bg-white/[0.02] sm:grid-cols-[1.3fr_1fr_0.9fr_auto]"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="shrink-0 text-[#8b91ad]">{getActionIcon(action.action_type)}</span>
          <div className="min-w-0">
            <p className="truncate font-bold text-white">{minecraftActionLabels[action.action_type]}</p>
            <p className="mt-0.5 truncate text-[11px] text-[#8b91ad]">{action.minecraft_username}</p>
          </div>
        </div>

        <span className="hidden truncate text-[#9aa0b8] sm:block">
          {getMinecraftActionPayloadSummary(action)}
        </span>

        <span className="hidden text-[#9aa0b8] sm:block">
          {new Date(action.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>

        <div className="flex items-center justify-end gap-2">
          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusStyles[action.status]}`}>
            {minecraftActionStatusLabels[action.status]}
          </span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-[#6b7192] transition ${isExpanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-white/[0.06] bg-black/15 p-4 sm:p-5">
          <div className="grid gap-5 lg:grid-cols-[1fr_220px]">
            <div>
              <div className="grid gap-2.5 text-[13px] text-[#c4c9dc] sm:grid-cols-2 lg:grid-cols-3">
                <p><strong className="text-[#8b91ad]">IGN:</strong> <span className="font-mono text-white">{action.minecraft_username}</span></p>
                <p><strong className="text-[#8b91ad]">Discord:</strong> <span className="text-white">{action.discord_username || "N/A"}</span></p>
                <p><strong className="text-[#8b91ad]">Payload:</strong> <span className="text-white">{getMinecraftActionPayloadSummary(action)}</span></p>
                <p><strong className="text-[#8b91ad]">Source:</strong> <span className="text-white">{action.automated ? "Automated" : "Manual"}</span></p>
                <p><strong className="text-[#8b91ad]">Order:</strong> <span className="font-mono text-white">{action.source_order_reference || "N/A"}</span></p>
                <p className="sm:col-span-2 lg:col-span-3">
                  <strong className="text-[#8b91ad]">Reason:</strong> <span className="text-white">{action.reason || "No reason provided."}</span>
                </p>
              </div>

              <div className="mt-3.5">
                <label className="text-[11px] font-bold uppercase tracking-wide text-[#8b91ad]">
                  Result Message
                </label>
                <textarea
                  value={resultMessage}
                  onChange={(event) => onResultMessageChange(event.target.value)}
                  disabled={!editable}
                  rows={3}
                  placeholder="Example: Rank delivered manually by Sikatu."
                  className="mt-1.5 w-full resize-none rounded-[10px] border border-white/[0.08] bg-black/25 p-3 text-[13px] leading-6 text-white outline-none placeholder:text-[#565d78] focus:border-white/20 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              {action.processed_at && (
                <p className="mt-2.5 text-xs text-[#6b7192]">
                  Processed: {new Date(action.processed_at).toLocaleString()}
                </p>
              )}
            </div>

            <div className="grid content-start gap-2">
              {action.status === "queued" && (
                <button
                  type="button"
                  onClick={() => onStatusUpdate("processing")}
                  disabled={!canManagePlayers || isUpdating}
                  className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[rgba(96,165,250,0.3)] bg-[rgba(96,165,250,0.08)] px-4 py-2.5 text-[13px] font-bold text-[#60a5fa] transition hover:bg-[rgba(96,165,250,0.14)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <TimerReset className="h-4 w-4" />}
                  Mark Processing
                </button>
              )}

              {canUpdateStatus(action.status) && (
                <>
                  <button
                    type="button"
                    onClick={() => onStatusUpdate("completed")}
                    disabled={!canManagePlayers || isUpdating}
                    className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.08)] px-4 py-2.5 text-[13px] font-bold text-[#34d399] transition hover:bg-[rgba(52,211,153,0.14)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Mark Completed
                  </button>

                  <button
                    type="button"
                    onClick={() => onStatusUpdate("failed")}
                    disabled={!canManagePlayers || isUpdating}
                    className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-2.5 text-[13px] font-bold text-[#f87171] transition hover:bg-[rgba(248,113,113,0.14)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    Mark Failed
                  </button>

                  <button
                    type="button"
                    onClick={() => onStatusUpdate("cancelled")}
                    disabled={!canManagePlayers || isUpdating}
                    className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[13px] font-bold text-[#c4c9dc] transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                    Cancel Action
                  </button>
                </>
              )}

              {!canManagePlayers && (
                <div className="rounded-[10px] border border-[rgba(251,191,36,0.2)] bg-[rgba(251,191,36,0.06)] p-3 text-xs font-bold text-[#fbbf24]">
                  Support role can view this queue but cannot update Minecraft actions.
                </div>
              )}

              {!canUpdateStatus(action.status) && (
                <div className="rounded-[10px] border border-white/[0.07] bg-black/20 p-3 text-xs font-bold text-[#8b91ad]">
                  This action is already closed.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
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
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);

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
        getMinecraftActionPayloadSummary(action),
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
        type: result.warning ? "warning" : "success",
        text: result.warning || `Action marked as ${minecraftActionStatusLabels[status]}.`,
      });
    }

    setUpdatingActionId(null);
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b91ad]">
          Minecraft Operations
        </p>
        <h2 className="mt-2 text-xl font-extrabold text-white">
          Minecraft Action Center
        </h2>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-6 text-[#9aa0b8]">
          Review and manage queued Minecraft actions from the Players dashboard.
          Actions are still manual-safe until the secure Minecraft bridge is connected.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiTile label="Queued" value={queueStats.queued} />
        <KpiTile label="Processing" value={queueStats.processing} />
        <KpiTile label="Completed" value={queueStats.completed} />
        <KpiTile label="Failed" value={queueStats.failed} tone={queueStats.failed > 0 ? "alert" : "neutral"} />
      </div>

      <div className="grid gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7192]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by IGN, Discord, action, reason, result..."
            className="w-full rounded-[10px] border border-white/[0.08] bg-black/25 px-10 py-2.5 text-sm text-white outline-none placeholder:text-[#565d78] focus:border-white/20"
          />
        </div>

        <button
          type="button"
          onClick={loadActions}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[13px] font-bold text-[#c4c9dc] transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          Refresh
        </button>
      </div>

      <div className="-mt-1 flex flex-wrap gap-1.5">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setActiveStatus(filter.value)}
            className={`rounded-[8px] px-3 py-1.5 text-[11px] font-bold transition ${
              activeStatus === filter.value
                ? "bg-[rgba(168,85,247,0.16)] text-[#e9d5ff]"
                : "border border-white/[0.1] text-[#9aa0b8] hover:bg-white/[0.04]"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {feedback && (
        <div
          className={`rounded-xl border p-3 text-[13px] font-bold ${
            feedback.type === "success"
              ? "border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.08)] text-[#6ee7b7]"
              : "border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] text-[#fca5a5]"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-10 text-[13px] text-[#9aa0b8]">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading Minecraft actions...
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
          <div
            className="hidden gap-3 border-b border-white/[0.06] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#565d78] sm:grid"
            style={{ gridTemplateColumns: "1.3fr 1fr 0.9fr auto" }}
          >
            <span>Action / IGN</span>
            <span>Payload</span>
            <span>Date</span>
            <span>Status</span>
          </div>

          {filteredActions.map((action) => (
            <ActionRow
              key={action.id}
              action={action}
              canManagePlayers={canManagePlayers}
              resultMessage={resultMessages[action.id] ?? ""}
              onResultMessageChange={(value) =>
                setResultMessages((current) => ({ ...current, [action.id]: value }))
              }
              onStatusUpdate={(status) => handleStatusUpdate(action, status)}
              isUpdating={updatingActionId === action.id}
            />
          ))}

          {filteredActions.length === 0 && (
            <div className="p-10 text-center text-[13px] text-[#6b7192]">
              No Minecraft actions found.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
