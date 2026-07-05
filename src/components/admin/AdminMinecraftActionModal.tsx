import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Coins,
  Loader2,
  Save,
  ShieldAlert,
  TimerReset,
  X,
} from "lucide-react";
import type {
  MinecraftAdminAction,
  MinecraftActionType,
} from "../../types/minecraftActions";
import {
  createMinecraftAdminAction,
  fetchMinecraftAdminActions,
  minecraftActionLabels,
} from "../../services/minecraftActions";

type AdminMinecraftActionModalProps = {
  isOpen: boolean;
  minecraftUsername: string;
  discordUsername: string | null;
  initialActionType: MinecraftActionType;
  canManagePlayers: boolean;
  onClose: () => void;
};

const rankOptions = ["NEON", "AETHER", "TITAN", "OVERCLOCK", "ASCENDANT"];

function getActionIcon(actionType: MinecraftActionType) {
  if (actionType === "give_rank") return <BadgeCheck className="h-4 w-4" />;
  if (actionType === "give_coins") return <Coins className="h-4 w-4" />;
  if (actionType === "temp_ban") return <TimerReset className="h-4 w-4" />;
  return <ShieldAlert className="h-4 w-4" />;
}

function getPayloadSummary(action: MinecraftAdminAction) {
  if (action.action_type === "give_rank") {
    return `Rank: ${String(action.payload.rank || "N/A")}`;
  }

  if (action.action_type === "give_coins") {
    return `Coins: ${String(action.payload.amount || "N/A")}`;
  }

  if (action.action_type === "temp_ban") {
    return `Duration: ${String(action.payload.duration || "N/A")}`;
  }

  return "No extra payload.";
}

export function AdminMinecraftActionModal({
  isOpen,
  minecraftUsername,
  discordUsername,
  initialActionType,
  canManagePlayers,
  onClose,
}: AdminMinecraftActionModalProps) {
  const [actionType, setActionType] = useState<MinecraftActionType>(initialActionType);
  const [rank, setRank] = useState("NEON");
  const [coinAmount, setCoinAmount] = useState("10");
  const [duration, setDuration] = useState("1d");
  const [reason, setReason] = useState("");
  const [actions, setActions] = useState<MinecraftAdminAction[]>([]);
  const [loadingActions, setLoadingActions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setActionType(initialActionType);
  }, [initialActionType, isOpen]);

  useEffect(() => {
    if (!isOpen || !minecraftUsername) return;

    let isMounted = true;

    async function loadActions() {
      setLoadingActions(true);
      setFeedback(null);

      const result = await fetchMinecraftAdminActions(minecraftUsername);

      if (!isMounted) return;

      if (result.error) {
        setFeedback({ type: "error", text: result.error.message });
      } else {
        setActions(result.data);
      }

      setLoadingActions(false);
    }

    loadActions();

    return () => {
      isMounted = false;
    };
  }, [isOpen, minecraftUsername]);

  if (!isOpen) return null;

  function getPayload() {
    if (actionType === "give_rank") return { rank };
    if (actionType === "give_coins") return { amount: Number(coinAmount) || 0 };
    if (actionType === "temp_ban") return { duration };
    return {};
  }

  async function handleQueueAction() {
    if (!canManagePlayers || saving) return;

    if ((actionType === "jail" || actionType === "temp_ban") && !reason.trim()) {
      setFeedback({
        type: "warning",
        text: "A reason is required for moderation actions.",
      });
      return;
    }

    setSaving(true);
    setFeedback(null);

    const result = await createMinecraftAdminAction({
      minecraftUsername,
      discordUsername,
      actionType,
      payload: getPayload(),
      reason,
    });

    if (result.error) {
      setFeedback({ type: "error", text: result.error.message });
    } else {
      setFeedback({
        type: "success",
        text: "Minecraft action queued. It will not execute until the server bridge is connected.",
      });

      const refresh = await fetchMinecraftAdminActions(minecraftUsername);
      if (!refresh.error) setActions(refresh.data);

      setReason("");
    }

    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[2rem] border border-purple-400/25 bg-[#12091f] p-5 shadow-[0_0_60px_rgba(168,85,247,0.2)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-300">
              Minecraft Action Queue
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              {minecraftUsername}
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Discord: {discordUsername || "N/A"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Close Minecraft action modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm leading-6 text-yellow-100">
          This queues the action in the admin dashboard only. It does not execute inside Minecraft yet.
          The actual execution will be added later through a secure Minecraft bridge.
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <label className="text-sm font-black text-purple-200">
              Action Type
            </label>

            <select
              value={actionType}
              onChange={(event) => setActionType(event.target.value as MinecraftActionType)}
              disabled={!canManagePlayers}
              className="mt-3 w-full rounded-2xl border border-purple-500/20 bg-black/40 p-3 text-sm font-bold text-white outline-none focus:border-purple-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <option value="give_rank">Give Rank</option>
              <option value="give_coins">Give Coins</option>
              <option value="jail">Jail Player</option>
              <option value="unjail">Unjail Player</option>
              <option value="temp_ban">Temp Ban Player</option>
            </select>

            {actionType === "give_rank" && (
              <div className="mt-4">
                <label className="text-sm font-black text-gray-300">
                  Rank
                </label>
                <select
                  value={rank}
                  onChange={(event) => setRank(event.target.value)}
                  disabled={!canManagePlayers}
                  className="mt-2 w-full rounded-2xl border border-purple-500/20 bg-black/40 p-3 text-sm font-bold text-white outline-none focus:border-purple-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {rankOptions.map((rankOption) => (
                    <option key={rankOption} value={rankOption}>
                      {rankOption}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {actionType === "give_coins" && (
              <div className="mt-4">
                <label className="text-sm font-black text-gray-300">
                  Ellipsis Coins
                </label>
                <input
                  value={coinAmount}
                  onChange={(event) => setCoinAmount(event.target.value)}
                  disabled={!canManagePlayers}
                  inputMode="numeric"
                  className="mt-2 w-full rounded-2xl border border-purple-500/20 bg-black/40 p-3 text-sm font-bold text-white outline-none focus:border-purple-300 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>
            )}

            {actionType === "temp_ban" && (
              <div className="mt-4">
                <label className="text-sm font-black text-gray-300">
                  Duration
                </label>
                <input
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                  disabled={!canManagePlayers}
                  placeholder="Example: 1h, 1d, 7d"
                  className="mt-2 w-full rounded-2xl border border-purple-500/20 bg-black/40 p-3 text-sm font-bold text-white outline-none focus:border-purple-300 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>
            )}

            <div className="mt-4">
              <label className="text-sm font-black text-gray-300">
                Reason / Staff Note
              </label>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                disabled={!canManagePlayers}
                rows={4}
                placeholder="Explain why this action is being queued..."
                className="mt-2 w-full resize-none rounded-2xl border border-purple-500/20 bg-black/40 p-3 text-sm leading-6 text-white outline-none placeholder:text-gray-600 focus:border-purple-300 disabled:cursor-not-allowed disabled:opacity-70"
              />
            </div>

            {!canManagePlayers && (
              <div className="mt-4 rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-xs font-bold text-yellow-100">
                Your Support role can view action history but cannot queue Minecraft actions.
              </div>
            )}

            {feedback && (
              <div className={`mt-4 rounded-xl border p-3 text-sm font-bold ${
                feedback.type === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                  : feedback.type === "warning"
                    ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-200"
                    : "border-red-500/30 bg-red-500/10 text-red-200"
              }`}>
                {feedback.text}
              </div>
            )}

            {canManagePlayers && (
              <button
                type="button"
                onClick={handleQueueAction}
                disabled={saving}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-purple-400/30 bg-purple-500/20 px-5 py-3 text-sm font-black text-purple-100 transition hover:bg-purple-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Queue Action
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="text-sm font-black text-purple-200">
              Recent Player Actions
            </p>

            {loadingActions ? (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-gray-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading actions...
              </div>
            ) : actions.length > 0 ? (
              <div className="mt-4 grid max-h-[440px] gap-3 overflow-y-auto pr-1">
                {actions.map((action) => (
                  <div
                    key={action.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="flex items-center gap-2 text-sm font-black text-white">
                        {getActionIcon(action.action_type)}
                        {minecraftActionLabels[action.action_type]}
                      </p>
                      <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-2 py-1 text-xs font-black uppercase text-blue-200">
                        {action.status}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-gray-400">
                      {getPayloadSummary(action)}
                    </p>

                    <p className="mt-2 text-sm leading-6 text-gray-300">
                      {action.reason || "No reason provided."}
                    </p>

                    <p className="mt-3 text-xs text-gray-500">
                      Queued: {new Date(action.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-5 text-center text-sm text-gray-400">
                No Minecraft actions queued for this player yet.
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-gray-300 transition hover:bg-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

