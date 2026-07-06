import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Coins,
  Crown,
  Gauge,
  Loader2,
  Lock,
  Megaphone,
  Radio,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  UsersRound,
  Zap,
} from "lucide-react";
import type { MinecraftActionType } from "../../types/minecraftActions";
import {
  createMinecraftAdminAction,
  minecraftActionLabels,
} from "../../services/minecraftActions";

type AdminServerOperationsPanelProps = {
  canManageServer: boolean;
};

type OperationCategory =
  | "Broadcasting"
  | "Safe Commands"
  | "Economy & Rewards"
  | "Player Access"
  | "Moderation";

type RiskLevel = "Low" | "Medium" | "High" | "Critical";

type FieldKey =
  | "title"
  | "subtitle"
  | "message"
  | "sound"
  | "volume"
  | "pitch"
  | "rank"
  | "amount"
  | "crate"
  | "duration"
  | "reason";

type OperationDefinition = {
  id: string;
  label: string;
  helper: string;
  operatorNote: string;
  category: OperationCategory;
  actionType: MinecraftActionType;
  risk: RiskLevel;
  requiresPlayer?: boolean;
  requiresReason?: boolean;
  commandKey?: string;
  fields: FieldKey[];
  templateHint: string;
};

const operations: OperationDefinition[] = [
  {
    id: "actionbar_broadcast",
    label: "Actionbar Pulse",
    helper: "Compact server-wide reminder without interrupting gameplay.",
    operatorNote: "Best for quick reminders, vote nudges, and restart notices.",
    category: "Broadcasting",
    actionType: "actionbar_broadcast",
    risk: "Low",
    fields: ["message"],
    templateHint: "bridge template: actionbar_broadcast -> all players",
  },
  {
    id: "server_broadcast",
    label: "Server Broadcast",
    helper: "Standard in-game broadcast for announcements and public notices.",
    operatorNote: "Use when every player should clearly see the message.",
    category: "Broadcasting",
    actionType: "server_broadcast",
    risk: "Low",
    fields: ["title", "message"],
    templateHint: "bridge template: server_broadcast -> all players",
  },
  {
    id: "title_broadcast",
    label: "Title Override",
    helper: "Large title overlay for high-visibility announcements.",
    operatorNote: "Use sparingly for major server events or urgent alerts.",
    category: "Broadcasting",
    actionType: "title_broadcast",
    risk: "Medium",
    fields: ["title", "subtitle"],
    templateHint: "bridge template: title_broadcast -> title + subtitle",
  },
  {
    id: "sound_broadcast",
    label: "Sound Signal",
    helper: "Plays a configured sound to all online players.",
    operatorNote: "Good for event starts, milestone moments, and attention pings.",
    category: "Broadcasting",
    actionType: "sound_broadcast",
    risk: "Medium",
    fields: ["sound", "volume", "pitch"],
    templateHint: "bridge template: sound_broadcast -> sound/volume/pitch",
  },
  {
    id: "test_say",
    label: "Console Say Test",
    helper: "Safe approved-command test from config.yml.",
    operatorNote: "Use this first after every bridge command-library update.",
    category: "Safe Commands",
    actionType: "approved_command",
    risk: "Low",
    commandKey: "test_say",
    fields: ["message"],
    templateHint: "approved command: test_say -> say {message}",
  },
  {
    id: "test_actionbar",
    label: "Config Actionbar Test",
    helper: "Safe CMI actionbar test using the approved command library.",
    operatorNote: "Confirms config-driven commands work without a jar rebuild.",
    category: "Safe Commands",
    actionType: "approved_command",
    risk: "Low",
    commandKey: "test_actionbar",
    fields: ["message"],
    templateHint: "approved command: test_actionbar -> cmi actionbarmsg all {message}",
  },
  {
    id: "rank_set",
    label: "Rank Authority",
    helper: "Set a player's LuckPerms rank using an approved template.",
    operatorNote: "Owner-grade operation. Confirm the rank before queueing.",
    category: "Economy & Rewards",
    actionType: "approved_command",
    risk: "High",
    requiresPlayer: true,
    requiresReason: true,
    commandKey: "rank_set",
    fields: ["rank", "reason"],
    templateHint: "approved command: rank_set -> lp user {player} parent set {rank}",
  },
  {
    id: "money_give",
    label: "Economy Grant",
    helper: "Give in-game money through the approved CMI economy template.",
    operatorNote: "Use for purchase fulfillment, event rewards, or correction grants.",
    category: "Economy & Rewards",
    actionType: "approved_command",
    risk: "Medium",
    requiresPlayer: true,
    requiresReason: true,
    commandKey: "money_give",
    fields: ["amount", "reason"],
    templateHint: "approved command: money_give -> cmi money give {player} {amount}",
  },
  {
    id: "crate_key_give",
    label: "Crate Key Grant",
    helper: "Give crate keys using the approved ExcellentCrates template.",
    operatorNote: "Confirm exact crate ID before using this live.",
    category: "Economy & Rewards",
    actionType: "approved_command",
    risk: "Medium",
    requiresPlayer: true,
    requiresReason: true,
    commandKey: "crate_key_give",
    fields: ["crate", "amount", "reason"],
    templateHint: "approved command: crate_key_give -> excellentcrates key give {player} {crate} {amount}",
  },
  {
    id: "whitelist_add",
    label: "Whitelist Add",
    helper: "Adds a player to the Minecraft whitelist.",
    operatorNote: "Use for controlled access and onboarding moments.",
    category: "Player Access",
    actionType: "whitelist_add",
    risk: "Medium",
    requiresPlayer: true,
    requiresReason: true,
    fields: ["reason"],
    templateHint: "bridge template: whitelist_add -> minecraft:whitelist add {player}",
  },
  {
    id: "whitelist_remove",
    label: "Whitelist Remove",
    helper: "Removes a player from the Minecraft whitelist.",
    operatorNote: "High-impact access control. Confirm before queueing.",
    category: "Player Access",
    actionType: "whitelist_remove",
    risk: "High",
    requiresPlayer: true,
    requiresReason: true,
    fields: ["reason"],
    templateHint: "bridge template: whitelist_remove -> minecraft:whitelist remove {player}",
  },
  {
    id: "maintenance_enable",
    label: "Maintenance Lock",
    helper: "Queues maintenance mode enable command.",
    operatorNote: "Use only when the server needs controlled maintenance.",
    category: "Player Access",
    actionType: "maintenance_enable",
    risk: "High",
    requiresReason: true,
    fields: ["reason"],
    templateHint: "bridge template: maintenance_enable -> configured safe command",
  },
  {
    id: "maintenance_disable",
    label: "Maintenance Release",
    helper: "Queues maintenance mode disable command.",
    operatorNote: "Use after maintenance is complete and access is safe.",
    category: "Player Access",
    actionType: "maintenance_disable",
    risk: "Medium",
    requiresReason: true,
    fields: ["reason"],
    templateHint: "bridge template: maintenance_disable -> configured safe command",
  },
  {
    id: "player_warn",
    label: "Player Warning",
    helper: "Issues a warning through the approved moderation template.",
    operatorNote: "Document the reason clearly for audit history.",
    category: "Moderation",
    actionType: "approved_command",
    risk: "Medium",
    requiresPlayer: true,
    requiresReason: true,
    commandKey: "player_warn",
    fields: ["reason"],
    templateHint: "approved command: player_warn -> cmi warn {player} {reason}",
  },
];

const categoryOrder: OperationCategory[] = [
  "Broadcasting",
  "Safe Commands",
  "Economy & Rewards",
  "Player Access",
  "Moderation",
];

const riskStyles: Record<RiskLevel, string> = {
  Low: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
  Medium: "border-cyan-300/25 bg-cyan-400/10 text-cyan-100",
  High: "border-amber-300/25 bg-amber-400/10 text-amber-100",
  Critical: "border-red-300/25 bg-red-400/10 text-red-100",
};

const fieldLabels: Record<FieldKey, string> = {
  title: "Title",
  subtitle: "Subtitle",
  message: "Message",
  sound: "Sound",
  volume: "Volume",
  pitch: "Pitch",
  rank: "Rank",
  amount: "Amount",
  crate: "Crate ID",
  duration: "Duration",
  reason: "Operator Reason / Audit Note",
};

function isBroadcast(actionType: MinecraftActionType) {
  return [
    "server_broadcast",
    "title_broadcast",
    "actionbar_broadcast",
    "sound_broadcast",
  ].includes(actionType);
}

function categoryIcon(category: OperationCategory) {
  switch (category) {
    case "Broadcasting":
      return Megaphone;
    case "Safe Commands":
      return ShieldCheck;
    case "Economy & Rewards":
      return Coins;
    case "Player Access":
      return UsersRound;
    case "Moderation":
      return ShieldAlert;
    default:
      return Terminal;
  }
}

export function AdminServerOperationsPanel({
  canManageServer,
}: AdminServerOperationsPanelProps) {
  const [operationId, setOperationId] = useState("actionbar_broadcast");
  const [targetUsername, setTargetUsername] = useState("");
  const [title, setTitle] = useState("Ellipsis SMP");
  const [subtitle, setSubtitle] = useState("");
  const [message, setMessage] = useState("");
  const [sound, setSound] = useState("minecraft:entity.player.levelup");
  const [volume, setVolume] = useState("1");
  const [pitch, setPitch] = useState("1");
  const [rank, setRank] = useState("sovereign");
  const [amount, setAmount] = useState("1");
  const [crate, setCrate] = useState("stellar");
  const [duration, setDuration] = useState("1h");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedOperation = useMemo(() => {
    return operations.find((item) => item.id === operationId) || operations[0];
  }, [operationId]);

  const groupedOperations = useMemo(() => {
    return categoryOrder.map((category) => ({
      category,
      items: operations.filter((item) => item.category === category),
    }));
  }, []);

  const target = selectedOperation.requiresPlayer ? targetUsername.trim() : "SERVER";
  const actionType = selectedOperation.actionType;

  function updateOperation(nextOperationId: string) {
    setOperationId(nextOperationId);
    setError(null);
    setNotice(null);
  }

  function getPayload(): Record<string, unknown> {
    if (actionType === "server_broadcast" || actionType === "actionbar_broadcast") {
      return {
        title,
        message,
        audience: "all",
      };
    }

    if (actionType === "title_broadcast") {
      return {
        title,
        subtitle,
        message: subtitle,
        audience: "all",
      };
    }

    if (actionType === "sound_broadcast") {
      return {
        sound,
        volume,
        pitch,
        audience: "all",
      };
    }

    if (actionType === "approved_command") {
      return {
        commandKey: selectedOperation.commandKey,
        title,
        subtitle,
        message,
        amount,
        value: amount,
        rank,
        crate,
        duration,
        reason,
      };
    }

    return {
      reason,
    };
  }

  function validate() {
    if (!canManageServer) {
      return "Your role cannot queue server operations.";
    }

    if (selectedOperation.requiresPlayer && !targetUsername.trim()) {
      return "Enter the Minecraft username for this operation.";
    }

    if (selectedOperation.fields.includes("message") && !message.trim()) {
      return "Message is required.";
    }

    if (selectedOperation.fields.includes("title") && !title.trim()) {
      return "Title is required.";
    }

    if (selectedOperation.fields.includes("subtitle") && !subtitle.trim()) {
      return "Subtitle is required.";
    }

    if (selectedOperation.fields.includes("rank") && !rank.trim()) {
      return "Rank is required.";
    }

    if (selectedOperation.fields.includes("amount") && !amount.trim()) {
      return "Amount is required.";
    }

    if (selectedOperation.fields.includes("crate") && !crate.trim()) {
      return "Crate ID is required.";
    }

    if (selectedOperation.fields.includes("reason") && !reason.trim()) {
      return "Operator reason is required for this operation.";
    }

    if (selectedOperation.requiresReason && !reason.trim()) {
      return "Add a reason or staff note before queueing this operation.";
    }

    if (actionType === "approved_command" && !selectedOperation.commandKey) {
      return "Approved command key is missing from this operation.";
    }

    return null;
  }

  async function handleQueue() {
    if (isSubmitting) return;

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setNotice(null);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setNotice(null);

    const result = await createMinecraftAdminAction({
      minecraftUsername: target,
      discordUsername: null,
      actionType,
      payload: getPayload(),
      reason:
        reason.trim() ||
        `Queued ${selectedOperation.label} from Operator Command Center.`,
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setNotice(
      result.warning ||
        `${selectedOperation.label} queued successfully. The bridge will process it through the safe command engine.`
    );

    if (isBroadcast(actionType) || selectedOperation.fields.includes("message")) {
      setMessage("");
    }
  }

  return (
    <section className="mt-6">
      <div className="relative overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-[#020817]/90 p-6 shadow-[0_0_60px_rgba(34,211,238,0.08)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:42px_42px]" />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-100">
              <Terminal className="h-4 w-4" />
              Operator Console
            </div>

            <h2 className="mt-4 max-w-3xl text-3xl font-black leading-tight text-white md:text-4xl">
              Operator Command Center
            </h2>

            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
              Queue bridge-safe server operations through approved templates only.
              Built for owner-level control, clear audit intent, and fast live-server execution.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[480px]">
            <StatusChip
              icon={<Activity className="h-4 w-4" />}
              label="Bridge Mode"
              value="Live Queue"
            />
            <StatusChip
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Command Safety"
              value="Allowlist"
            />
            <StatusChip
              icon={<Zap className="h-4 w-4" />}
              label="Config Reload"
              value="No Restart"
            />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)_330px]">
        <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_0_35px_rgba(168,85,247,0.06)]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
              Operation Library
            </p>
            <Radio className="h-4 w-4 text-cyan-200" />
          </div>

          <div className="mt-4 space-y-5">
            {groupedOperations.map(({ category, items }) => {
              const Icon = categoryIcon(category);

              return (
                <div key={category}>
                  <div className="mb-2 flex items-center gap-2 px-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                    <Icon className="h-3.5 w-3.5" />
                    {category}
                  </div>

                  <div className="space-y-2">
                    {items.map((operation) => {
                      const isActive = selectedOperation.id === operation.id;

                      return (
                        <button
                          key={operation.id}
                          type="button"
                          onClick={() => updateOperation(operation.id)}
                          disabled={!canManageServer}
                          className={`group w-full rounded-2xl border p-3 text-left transition ${
                            isActive
                              ? "border-cyan-300/60 bg-cyan-400/15 text-white shadow-[0_0_24px_rgba(34,211,238,0.10)]"
                              : "border-white/10 bg-black/20 text-slate-300 hover:border-cyan-300/25 hover:bg-white/[0.06] hover:text-white"
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-black">
                                {operation.label}
                              </div>
                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                                {operation.helper}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${riskStyles[operation.risk]}`}
                            >
                              {operation.risk}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <main className="rounded-[2rem] border border-cyan-300/15 bg-[#08071a]/90 p-5 shadow-[0_0_45px_rgba(34,211,238,0.06)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-400/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-purple-100">
                <Crown className="h-3.5 w-3.5" />
                Active Operation
              </div>

              <h3 className="mt-3 text-3xl font-black text-white">
                {selectedOperation.label}
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                {selectedOperation.operatorNote}
              </p>
            </div>

            <div className={`rounded-2xl border px-4 py-3 text-sm ${riskStyles[selectedOperation.risk]}`}>
              <div className="text-xs font-black uppercase tracking-[0.18em] opacity-80">
                Risk Level
              </div>
              <div className="mt-1 text-lg font-black">{selectedOperation.risk}</div>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {selectedOperation.requiresPlayer && (
              <Field label="Target Minecraft Username" helper="Exact IGN. The bridge sanitizes the value before execution.">
                <input
                  value={targetUsername}
                  onChange={(event) => setTargetUsername(event.target.value)}
                  placeholder="Player IGN"
                  className="input"
                />
              </Field>
            )}

            {selectedOperation.fields.includes("title") && (
              <Field label={fieldLabels.title}>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="input"
                  placeholder="Ellipsis SMP"
                />
              </Field>
            )}

            {selectedOperation.fields.includes("subtitle") && (
              <Field label={fieldLabels.subtitle}>
                <input
                  value={subtitle}
                  onChange={(event) => setSubtitle(event.target.value)}
                  className="input"
                  placeholder="Prepare for the next phase."
                />
              </Field>
            )}

            {selectedOperation.fields.includes("message") && (
              <Field label={fieldLabels.message}>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={4}
                  maxLength={220}
                  className="input resize-none"
                  placeholder="Example: Universal command library live test."
                />
                <div className="mt-2 text-right text-xs text-slate-500">
                  {message.length}/220
                </div>
              </Field>
            )}

            {selectedOperation.fields.includes("sound") && (
              <Field label={fieldLabels.sound}>
                <input
                  value={sound}
                  onChange={(event) => setSound(event.target.value)}
                  className="input"
                  placeholder="minecraft:entity.player.levelup"
                />
              </Field>
            )}

            {(selectedOperation.fields.includes("volume") || selectedOperation.fields.includes("pitch")) && (
              <div className="grid gap-3 sm:grid-cols-2">
                {selectedOperation.fields.includes("volume") && (
                  <Field label={fieldLabels.volume}>
                    <input
                      value={volume}
                      onChange={(event) => setVolume(event.target.value)}
                      className="input"
                      placeholder="1"
                    />
                  </Field>
                )}

                {selectedOperation.fields.includes("pitch") && (
                  <Field label={fieldLabels.pitch}>
                    <input
                      value={pitch}
                      onChange={(event) => setPitch(event.target.value)}
                      className="input"
                      placeholder="1"
                    />
                  </Field>
                )}
              </div>
            )}

            {selectedOperation.fields.includes("rank") && (
              <Field label={fieldLabels.rank} helper="Must match your LuckPerms group name.">
                <input
                  value={rank}
                  onChange={(event) => setRank(event.target.value)}
                  className="input"
                  placeholder="sovereign"
                />
              </Field>
            )}

            {selectedOperation.fields.includes("crate") && (
              <Field label={fieldLabels.crate} helper="Must match the ExcellentCrates crate ID.">
                <input
                  value={crate}
                  onChange={(event) => setCrate(event.target.value)}
                  className="input"
                  placeholder="stellar"
                />
              </Field>
            )}

            {selectedOperation.fields.includes("amount") && (
              <Field label={fieldLabels.amount}>
                <input
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="input"
                  placeholder="1"
                />
              </Field>
            )}

            {selectedOperation.fields.includes("duration") && (
              <Field label={fieldLabels.duration}>
                <input
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                  className="input"
                  placeholder="1h"
                />
              </Field>
            )}

            {selectedOperation.fields.includes("reason") && (
              <Field label={fieldLabels.reason} helper="Required for audit clarity and staff accountability.">
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={4}
                  className="input resize-none"
                  placeholder="Document why this operation is being queued..."
                />
              </Field>
            )}

            {!selectedOperation.fields.includes("reason") && (
              <Field label="Optional Operator Note">
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={3}
                  className="input resize-none"
                  placeholder="Optional note for audit context..."
                />
              </Field>
            )}

            <ExecutionPreview
              operation={selectedOperation}
              target={target}
              values={{
                title,
                subtitle,
                message,
                sound,
                volume,
                pitch,
                rank,
                amount,
                crate,
                duration,
                reason,
              }}
            />

            {!canManageServer && (
              <Feedback tone="warning">
                Your role can view this console but cannot queue server operations.
              </Feedback>
            )}

            {error && <Feedback tone="error">{error}</Feedback>}
            {notice && <Feedback tone="success">{notice}</Feedback>}

            <div className="sticky bottom-4 z-10 rounded-2xl border border-cyan-300/20 bg-[#050713]/95 p-3 shadow-[0_0_35px_rgba(34,211,238,0.12)] backdrop-blur">
              <button
                type="button"
                onClick={handleQueue}
                disabled={!canManageServer || isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-300/35 bg-cyan-400/15 px-5 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-400/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Queue Safe Operation
              </button>
            </div>
          </div>
        </main>

        <aside className="space-y-5">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
              System Intelligence
            </p>

            <div className="mt-4 space-y-3">
              <IntelRow
                icon={<ShieldCheck className="h-4 w-4" />}
                label="Execution Mode"
                value="Safe templates only"
              />
              <IntelRow
                icon={<Terminal className="h-4 w-4" />}
                label="Selected Action"
                value={minecraftActionLabels[actionType] || selectedOperation.label}
              />
              <IntelRow
                icon={<Gauge className="h-4 w-4" />}
                label="Target"
                value={target || "N/A"}
              />
              <IntelRow
                icon={<BadgeCheck className="h-4 w-4" />}
                label="Command Key"
                value={selectedOperation.commandKey || "native bridge action"}
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-purple-300/15 bg-purple-500/[0.06] p-5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-purple-200">
              <Sparkles className="h-4 w-4" />
              Operator Guidance
            </div>

            <div className="mt-4 space-y-4 text-sm leading-6 text-slate-300">
              <p>
                Start with low-risk commands after every bridge update. Use
                <span className="font-mono text-cyan-200"> Console Say Test </span>
                before rank, money, crate, whitelist, or moderation actions.
              </p>

              <p>
                New plugin commands should be added in
                <span className="font-mono text-cyan-200"> plugins/EllipsisBridge/config.yml </span>
                then activated with
                <span className="font-mono text-cyan-200"> /ellipsisbridge reload</span>.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-emerald-300/15 bg-emerald-500/[0.06] p-5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-emerald-200">
              <Lock className="h-4 w-4" />
              Safety Rules
            </div>

            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <li>Raw console commands are not accepted.</li>
              <li>Command keys must exist in bridge config.</li>
              <li>Broad selectors and OP commands are blocked by the plugin.</li>
              <li>High-risk actions require an operator reason.</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Field({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      {children}
      {helper && <span className="mt-2 block text-xs leading-5 text-slate-500">{helper}</span>}
    </label>
  );
}

function StatusChip({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-sm font-black text-white">{value}</div>
    </div>
  );
}

function IntelRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-1 break-words font-mono text-sm text-cyan-100">{value}</div>
    </div>
  );
}

function ExecutionPreview({
  operation,
  target,
  values,
}: {
  operation: OperationDefinition;
  target: string;
  values: Record<string, string>;
}) {
  const visibleFields = operation.fields.filter((field) => {
    const value = values[field] || "";
    return value.trim() !== "";
  });

  return (
    <div className="rounded-2xl border border-cyan-300/15 bg-black/30 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
            Execution Preview
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Preview only. The bridge still validates and sanitizes before execution.
          </p>
        </div>

        <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${riskStyles[operation.risk]}`}>
          {operation.risk}
        </span>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <PreviewItem label="Operation" value={operation.label} />
        <PreviewItem label="Target" value={target || "N/A"} />
        <PreviewItem label="Mode" value={operation.commandKey ? "Approved command" : "Native bridge action"} />
        <PreviewItem label="Template" value={operation.templateHint} />
      </div>

      {visibleFields.length > 0 && (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
            Payload
          </p>

          <div className="mt-2 space-y-1 font-mono text-xs text-slate-300">
            {visibleFields.map((field) => (
              <div key={field} className="flex gap-2">
                <span className="text-cyan-300">{field}:</span>
                <span className="break-all">{values[field]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
      <div className="mt-1 break-words font-mono text-sm text-white">{value}</div>
    </div>
  );
}

function Feedback({
  tone,
  children,
}: {
  tone: "warning" | "error" | "success";
  children: ReactNode;
}) {
  const styles = {
    warning: "border-yellow-400/20 bg-yellow-400/10 text-yellow-100",
    error: "border-red-400/20 bg-red-500/10 text-red-100",
    success: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
  };

  const Icon = tone === "success" ? Sparkles : AlertTriangle;

  return (
    <div className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${styles[tone]}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      {children}
    </div>
  );
}