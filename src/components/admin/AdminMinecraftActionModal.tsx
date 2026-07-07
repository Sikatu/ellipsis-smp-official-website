import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Bell,
  Box,
  Coins,
  Gift,
  KeyRound,
  Loader2,
  Save,
  ShieldAlert,
  Sparkles,
  Terminal,
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
  getMinecraftActionPayloadSummary,
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

const actionGroups: Array<{
  title: string;
  helper: string;
  actions: MinecraftActionType[];
}> = [
  {
    title: "Rewards",
    helper: "Ranks, money, keys, kits, and item delivery.",
    actions: ["give_rank", "give_coins", "give_crate_key", "give_item", "give_kit"],
  },
  {
    title: "Moderation",
    helper: "Player safety, discipline, and staff enforcement.",
    actions: ["jail", "unjail", "temp_ban", "unban", "kick", "mute", "unmute", "warn"],
  },
  {
    title: "Broadcasts",
    helper: "Server-wide messages through the bridge.",
    actions: ["server_broadcast", "title_broadcast", "actionbar_broadcast", "sound_broadcast"],
  },
  {
    title: "Operations",
    helper: "Allowlisted server operations only.",
    actions: ["whitelist_add", "whitelist_remove", "maintenance_enable", "maintenance_disable", "manual_delivery", "approved_command"],
  },
];

const approvedCommandOptions = [
  { label: "Console Say Test", value: "test_say" },
  { label: "Config Actionbar Test", value: "test_actionbar" },
  { label: "Rank Authority", value: "rank_set" },
  { label: "Economy Grant", value: "money_give" },
  { label: "Crate Key Grant", value: "crate_key_give" },
  { label: "Player Warning", value: "player_warn" },
  { label: "Server Broadcast", value: "broadcast_server" },
  { label: "Actionbar Broadcast", value: "broadcast_actionbar" },
];

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-purple-300/50 focus:bg-black/40 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.14)]";

function getActionIcon(actionType: MinecraftActionType) {
  if (actionType === "give_rank") return <BadgeCheck className="h-4 w-4" />;
  if (actionType === "give_coins") return <Coins className="h-4 w-4" />;
  if (actionType === "give_crate_key") return <KeyRound className="h-4 w-4" />;
  if (actionType === "give_item") return <Box className="h-4 w-4" />;
  if (actionType === "give_kit") return <Gift className="h-4 w-4" />;
  if (actionType.includes("broadcast")) return <Bell className="h-4 w-4" />;
  if (actionType === "approved_command") return <Terminal className="h-4 w-4" />;
  if (actionType === "temp_ban" || actionType === "mute") return <TimerReset className="h-4 w-4" />;
  return <ShieldAlert className="h-4 w-4" />;
}

function needsReason(actionType: MinecraftActionType) {
  return [
    "jail",
    "temp_ban",
    "kick",
    "mute",
    "warn",
    "manual_delivery",
    "approved_command",
  ].includes(actionType);
}

function isPlayerRequired(actionType: MinecraftActionType) {
  return ![
    "server_broadcast",
    "title_broadcast",
    "actionbar_broadcast",
    "sound_broadcast",
    "maintenance_enable",
    "maintenance_disable",
  ].includes(actionType);
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
  const [crate, setCrate] = useState("MonsterHunter");
  const [item, setItem] = useState("minecraft:diamond");
  const [kit, setKit] = useState("starter");
  const [amount, setAmount] = useState("1");

  const [duration, setDuration] = useState("1d");
  const [reason, setReason] = useState("");

  const [title, setTitle] = useState("Ellipsis SMP");
  const [message, setMessage] = useState("");
  const [sound, setSound] = useState("minecraft:entity.player.levelup");
  const [volume, setVolume] = useState("1");
  const [pitch, setPitch] = useState("1");

  const [deliveryType, setDeliveryType] = useState("Manual Delivery");
  const [productName, setProductName] = useState("");
  const [commandKey, setCommandKey] = useState("test_say");

  const [actions, setActions] = useState<MinecraftAdminAction[]>([]);
  const [loadingActions, setLoadingActions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setActionType(initialActionType);
    setFeedback(null);
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

  const selectedLabel = minecraftActionLabels[actionType];

  const targetUsername = useMemo(() => {
    return isPlayerRequired(actionType) ? minecraftUsername : "SERVER";
  }, [actionType, minecraftUsername]);

  function getPayload(): Record<string, unknown> {
    if (actionType === "give_rank") return { rank };
    if (actionType === "give_coins") return { amount: Number(coinAmount) || 0 };
    if (actionType === "give_crate_key") return { crate, amount: Number(amount) || 1 };
    if (actionType === "give_item") return { item, amount: Number(amount) || 1 };
    if (actionType === "give_kit") return { kit };

    if (actionType === "temp_ban" || actionType === "mute") {
      return { duration, reason };
    }

    if (["kick", "warn", "jail", "unban", "unmute"].includes(actionType)) {
      return { reason };
    }

    if (actionType === "title_broadcast") {
      return { title, subtitle: message, audience: "all" };
    }

    if (actionType === "server_broadcast" || actionType === "actionbar_broadcast") {
      return { title, message, audience: "all" };
    }

    if (actionType === "sound_broadcast") {
      return { title, message, sound, volume, pitch, audience: "all" };
    }

    if (actionType === "manual_delivery") {
      return { deliveryType, productName };
    }

    if (actionType === "approved_command") {
      return {
        commandKey,
        amount: Number(amount) || 1,
        reason,
        title,
        message,
      };
    }

    return {};
  }

  function validateAction() {
    if (!canManagePlayers) return "You do not have permission to queue Minecraft actions.";

    if (isPlayerRequired(actionType) && !minecraftUsername.trim()) {
      return "Missing Minecraft username.";
    }

    if (needsReason(actionType) && !reason.trim()) {
      return "A reason is required for this action.";
    }

    if ((actionType === "temp_ban" || actionType === "mute") && !duration.trim()) {
      return "Duration is required for this action.";
    }

    if (
      (actionType === "server_broadcast" ||
        actionType === "title_broadcast" ||
        actionType === "actionbar_broadcast" ||
        actionType === "sound_broadcast") &&
      !message.trim()
    ) {
      return "Broadcast message is required.";
    }

    if (actionType === "approved_command" && !commandKey.trim()) {
      return "Select an approved command key.";
    }

    return null;
  }

  async function handleQueueAction() {
    if (saving) return;

    const validationError = validateAction();
    if (validationError) {
      setFeedback({ type: "warning", text: validationError });
      return;
    }

    setSaving(true);
    setFeedback(null);

    const result = await createMinecraftAdminAction({
      minecraftUsername: targetUsername,
      discordUsername: isPlayerRequired(actionType) ? discordUsername : null,
      actionType,
      payload: getPayload(),
      reason: reason.trim() || `Queued ${selectedLabel} from admin command center.`,
    });

    if (result.error) {
      setFeedback({ type: "error", text: result.error.message });
    } else {
      setFeedback({
        type: result.warning ? "warning" : "success",
        text:
          result.warning ||
          "Minecraft action queued. Ultimate Bridge v2 will execute this after the planned deployment.",
      });

      if (result.data) {
        setActions((current) => [result.data!, ...current]);
      }
    }

    setSaving(false);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-purple-400/25 bg-[#12091f] shadow-[0_0_70px_rgba(168,85,247,0.22)]">
        <div className="border-b border-white/10 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-300">
                Ultimate Bridge Action
              </p>
              <h2 className="mt-2 flex items-center gap-2 text-3xl font-black text-white">
                {getActionIcon(actionType)}
                Queue Minecraft Action
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Target: <span className="font-mono text-white">{targetUsername}</span>
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
        </div>

        <div className="max-h-[calc(92vh-130px)] overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-purple-500/20 bg-white/[0.045] p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-300">
                Action Library
              </p>

              <div className="mt-4 grid gap-4">
                {actionGroups.map((group) => (
                  <div key={group.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div>
                      <p className="font-black text-white">{group.title}</p>
                      <p className="mt-1 text-xs leading-5 text-gray-400">{group.helper}</p>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {group.actions.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setActionType(item)}
                          disabled={!canManagePlayers}
                          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-black transition ${
                            actionType === item
                              ? "border-purple-300 bg-purple-500/25 text-white"
                              : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-purple-300/40 hover:text-white"
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          {getActionIcon(item)}
                          {minecraftActionLabels[item]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-purple-500/20 bg-white/[0.045] p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-300">
                Payload
              </p>

              <h3 className="mt-3 text-xl font-black text-white">{selectedLabel}</h3>

              <div className="mt-5 grid gap-4">
                {actionType === "give_rank" && (
                  <Field label="Rank">
                    <select
                      value={rank}
                      onChange={(event) => setRank(event.target.value)}
                      className={inputClass}
                    >
                      {rankOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </Field>
                )}

                {actionType === "give_coins" && (
                  <Field label="Coin Amount">
                    <input className={inputClass} value={coinAmount} onChange={(event) => setCoinAmount(event.target.value)} />
                  </Field>
                )}

                {actionType === "give_crate_key" && (
                  <>
                    <Field label="Crate Key">
                      <input className={inputClass} value={crate} onChange={(event) => setCrate(event.target.value)} />
                    </Field>
                    <Field label="Amount">
                      <input className={inputClass} value={amount} onChange={(event) => setAmount(event.target.value)} />
                    </Field>
                  </>
                )}

                {actionType === "give_item" && (
                  <>
                    <Field label="Item ID">
                      <input className={inputClass} value={item} onChange={(event) => setItem(event.target.value)} />
                    </Field>
                    <Field label="Amount">
                      <input className={inputClass} value={amount} onChange={(event) => setAmount(event.target.value)} />
                    </Field>
                  </>
                )}

                {actionType === "give_kit" && (
                  <Field label="Kit Name">
                    <input className={inputClass} value={kit} onChange={(event) => setKit(event.target.value)} />
                  </Field>
                )}

                {(actionType === "temp_ban" || actionType === "mute") && (
                  <Field label="Duration">
                    <input className={inputClass} value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="Example: 1d, 7d, 12h" />
                  </Field>
                )}

                {(actionType === "server_broadcast" ||
                  actionType === "title_broadcast" ||
                  actionType === "actionbar_broadcast" ||
                  actionType === "sound_broadcast" ||
                  actionType === "approved_command") && (
                  <>
                    <Field label="Title">
                      <input className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} />
                    </Field>
                    <Field label={actionType === "title_broadcast" ? "Subtitle" : "Message"}>
                      <textarea className={`${inputClass} min-h-24 resize-none`} value={message} onChange={(event) => setMessage(event.target.value)} />
                    </Field>
                  </>
                )}

                {actionType === "sound_broadcast" && (
                  <>
                    <Field label="Sound">
                      <input className={inputClass} value={sound} onChange={(event) => setSound(event.target.value)} />
                    </Field>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Volume">
                        <input className={inputClass} value={volume} onChange={(event) => setVolume(event.target.value)} />
                      </Field>
                      <Field label="Pitch">
                        <input className={inputClass} value={pitch} onChange={(event) => setPitch(event.target.value)} />
                      </Field>
                    </div>
                  </>
                )}

                {actionType === "manual_delivery" && (
                  <>
                    <Field label="Delivery Type">
                      <input className={inputClass} value={deliveryType} onChange={(event) => setDeliveryType(event.target.value)} />
                    </Field>
                    <Field label="Product Name">
                      <input className={inputClass} value={productName} onChange={(event) => setProductName(event.target.value)} />
                    </Field>
                  </>
                )}

                {actionType === "approved_command" && (
                  <Field label="Approved Command Key">
                    <select
                      value={commandKey}
                      onChange={(event) => setCommandKey(event.target.value)}
                      className={inputClass}
                    >
                      {approvedCommandOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}

                <Field label={needsReason(actionType) ? "Reason Required" : "Reason / Staff Note"}>
                  <textarea
                    className={`${inputClass} min-h-28 resize-none`}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Explain why this action is being queued..."
                  />
                </Field>

                {!canManagePlayers && (
                  <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-xs font-bold text-yellow-100">
                    Your role can view action history but cannot queue Minecraft actions.
                  </div>
                )}

                {feedback && (
                  <div className={`rounded-xl border p-3 text-sm font-bold ${
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
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-purple-400/30 bg-purple-500/20 px-5 py-3 text-sm font-black text-purple-100 transition hover:bg-purple-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Queue Action
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[2rem] border border-white/10 bg-black/25 p-5">
            <p className="text-sm font-black text-purple-200">
              Recent Player Actions
            </p>

            {loadingActions ? (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-gray-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading actions...
              </div>
            ) : actions.length > 0 ? (
              <div className="mt-4 grid max-h-[360px] gap-3 overflow-y-auto pr-1">
                {actions.map((action) => (
                  <div
                    key={action.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-white">{minecraftActionLabels[action.action_type]}</p>
                        <p className="mt-1 text-sm text-gray-300">
                          {getMinecraftActionPayloadSummary(action)}
                        </p>
                      </div>
                      <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-black uppercase text-blue-200">
                        {action.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-5 text-center text-sm text-gray-400">
                No recent actions for this player.
              </div>
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-xs leading-6 text-yellow-100">
            <Sparkles className="mr-2 inline h-4 w-4" />
            These actions are queued for Ultimate Bridge v2. Do not deploy the new jar until the planned restart window.
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-gray-400">
        {label}
      </span>
      {children}
    </label>
  );
}