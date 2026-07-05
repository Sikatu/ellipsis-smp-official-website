import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  Megaphone,
  Send,
  ShieldCheck,
  Sparkles,
  Terminal,
  UsersRound,
} from "lucide-react";
import type { MinecraftActionType } from "../../types/minecraftActions";
import {
  createMinecraftAdminAction,
  minecraftActionLabels,
} from "../../services/minecraftActions";

type AdminServerOperationsPanelProps = {
  canManageServer: boolean;
};

const serverActions: Array<{
  label: string;
  helper: string;
  actionType: MinecraftActionType;
}> = [
  {
    label: "Server Broadcast",
    helper: "Standard in-game broadcast for events, reminders, and notices.",
    actionType: "server_broadcast",
  },
  {
    label: "Title Broadcast",
    helper: "Large title message for major announcements.",
    actionType: "title_broadcast",
  },
  {
    label: "Actionbar Broadcast",
    helper: "Compact actionbar message for quick reminders.",
    actionType: "actionbar_broadcast",
  },
  {
    label: "Sound Broadcast",
    helper: "Plays a sound to all online players.",
    actionType: "sound_broadcast",
  },
  {
    label: "Maintenance Enable",
    helper: "Queues maintenance mode enable command.",
    actionType: "maintenance_enable",
  },
  {
    label: "Maintenance Disable",
    helper: "Queues maintenance mode disable command.",
    actionType: "maintenance_disable",
  },
  {
    label: "Whitelist Add",
    helper: "Adds a player to the Minecraft whitelist.",
    actionType: "whitelist_add",
  },
  {
    label: "Whitelist Remove",
    helper: "Removes a player from the Minecraft whitelist.",
    actionType: "whitelist_remove",
  },
  {
    label: "Approved Command",
    helper: "Runs only a pre-approved command key from bridge config.yml.",
    actionType: "approved_command",
  },
];

const approvedCommandOptions = [
  { label: "Example Broadcast", value: "example-broadcast" },
  { label: "Example Reward", value: "example-reward" },
];

function isBroadcast(actionType: MinecraftActionType) {
  return [
    "server_broadcast",
    "title_broadcast",
    "actionbar_broadcast",
    "sound_broadcast",
  ].includes(actionType);
}

function isWhitelist(actionType: MinecraftActionType) {
  return actionType === "whitelist_add" || actionType === "whitelist_remove";
}

function isMaintenance(actionType: MinecraftActionType) {
  return actionType === "maintenance_enable" || actionType === "maintenance_disable";
}

export function AdminServerOperationsPanel({
  canManageServer,
}: AdminServerOperationsPanelProps) {
  const [actionType, setActionType] = useState<MinecraftActionType>("server_broadcast");
  const [targetUsername, setTargetUsername] = useState("");
  const [title, setTitle] = useState("Ellipsis SMP");
  const [message, setMessage] = useState("");
  const [sound, setSound] = useState("minecraft:entity.player.levelup");
  const [volume, setVolume] = useState("1");
  const [pitch, setPitch] = useState("1");
  const [commandKey, setCommandKey] = useState("example-broadcast");
  const [amount, setAmount] = useState("1");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedAction = useMemo(() => {
    return serverActions.find((item) => item.actionType === actionType) || serverActions[0];
  }, [actionType]);

  const target = isWhitelist(actionType) ? targetUsername.trim() : "SERVER";

  function getPayload(): Record<string, unknown> {
    if (
      actionType === "server_broadcast" ||
      actionType === "title_broadcast" ||
      actionType === "actionbar_broadcast"
    ) {
      return {
        title,
        message,
        audience: "all",
      };
    }

    if (actionType === "sound_broadcast") {
      return {
        title,
        message,
        sound,
        volume,
        pitch,
        audience: "all",
      };
    }

    if (actionType === "approved_command") {
      return {
        commandKey,
        amount: Number(amount) || 1,
        title,
        message,
        reason,
      };
    }

    if (isMaintenance(actionType)) {
      return {
        reason,
      };
    }

    return {};
  }

  function validate() {
    if (!canManageServer) {
      return "Your role cannot queue server operations.";
    }

    if (isWhitelist(actionType) && !targetUsername.trim()) {
      return "Enter the Minecraft username for this whitelist action.";
    }

    if (isBroadcast(actionType) && !message.trim()) {
      return "Broadcast message is required.";
    }

    if (actionType === "approved_command" && !commandKey.trim()) {
      return "Select an approved command key.";
    }

    if ((isMaintenance(actionType) || actionType === "approved_command") && !reason.trim()) {
      return "Add a reason or staff note before queueing this operation.";
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
      reason: reason.trim() || `Queued ${minecraftActionLabels[actionType]} from Server Ops.`,
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setNotice(
      result.warning ||
        `${minecraftActionLabels[actionType]} queued successfully. The bridge will execute it after deployment or when online.`
    );

    if (isBroadcast(actionType)) {
      setMessage("");
    }
  }

  return (
    <section className="mt-6">
      <div className="rounded-[2rem] border border-cyan-400/20 bg-cyan-500/[0.07] p-6 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
              <Terminal className="h-4 w-4" />
              Server Operations
            </div>

            <h2 className="mt-4 text-3xl font-black text-white">
              Owner-level bridge controls.
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-300">
              Queue server-wide announcements, maintenance actions, whitelist changes,
              and approved bridge commands. These actions never send raw custom commands;
              the bridge only executes configured safe templates.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
            <div className="font-black">Safe Command Engine</div>
            <div className="text-emerald-100/80">Approved templates only</div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
            Operation Library
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {serverActions.map((action) => {
              const isActive = actionType === action.actionType;

              return (
                <button
                  key={action.actionType}
                  type="button"
                  onClick={() => setActionType(action.actionType)}
                  disabled={!canManageServer}
                  className={`rounded-2xl border p-4 text-left transition ${
                    isActive
                      ? "border-cyan-300/60 bg-cyan-500/15 text-white"
                      : "border-white/10 bg-black/20 text-gray-300 hover:border-cyan-300/30 hover:text-white"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <div className="flex items-center gap-2 font-black">
                    {isBroadcast(action.actionType) ? (
                      <Megaphone className="h-4 w-4" />
                    ) : isWhitelist(action.actionType) ? (
                      <UsersRound className="h-4 w-4" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}
                    {action.label}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-gray-400">
                    {action.helper}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
            Queue Details
          </p>

          <h3 className="mt-3 text-2xl font-black text-white">
            {minecraftActionLabels[actionType]}
          </h3>

          <p className="mt-1 text-sm leading-6 text-gray-400">
            {selectedAction.helper}
          </p>

          <div className="mt-5 grid gap-4">
            {isWhitelist(actionType) && (
              <Field label="Minecraft Username">
                <input
                  value={targetUsername}
                  onChange={(event) => setTargetUsername(event.target.value)}
                  placeholder="Player IGN"
                  className="input"
                />
              </Field>
            )}

            {isBroadcast(actionType) && (
              <>
                <Field label="Title">
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="input"
                    placeholder="Ellipsis SMP"
                  />
                </Field>

                <Field label="Message">
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={4}
                    maxLength={220}
                    className="input resize-none"
                    placeholder="Example: Server restart in 10 minutes. Please secure your items."
                  />
                  <div className="mt-2 text-right text-xs text-gray-500">
                    {message.length}/220
                  </div>
                </Field>
              </>
            )}

            {actionType === "sound_broadcast" && (
              <>
                <Field label="Sound">
                  <input
                    value={sound}
                    onChange={(event) => setSound(event.target.value)}
                    className="input"
                  />
                </Field>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Volume">
                    <input
                      value={volume}
                      onChange={(event) => setVolume(event.target.value)}
                      className="input"
                    />
                  </Field>

                  <Field label="Pitch">
                    <input
                      value={pitch}
                      onChange={(event) => setPitch(event.target.value)}
                      className="input"
                    />
                  </Field>
                </div>
              </>
            )}

            {actionType === "approved_command" && (
              <>
                <Field label="Approved Command Key">
                  <select
                    value={commandKey}
                    onChange={(event) => setCommandKey(event.target.value)}
                    className="input"
                  >
                    {approvedCommandOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Amount / Value">
                  <input
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className="input"
                    placeholder="1"
                  />
                </Field>
              </>
            )}

            <Field label={isMaintenance(actionType) || actionType === "approved_command" ? "Reason Required" : "Reason / Staff Note"}>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={4}
                className="input resize-none"
                placeholder="Document why this server operation is being queued..."
              />
            </Field>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-gray-300">
              <div className="font-black text-white">Target</div>
              <div className="mt-1 font-mono text-cyan-200">{target || "N/A"}</div>
            </div>

            {!canManageServer && (
              <div className="flex items-start gap-3 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm text-yellow-100">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                Your role can view this panel but cannot queue server operations.
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {notice && (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
                {notice}
              </div>
            )}

            <button
              type="button"
              onClick={handleQueue}
              disabled={!canManageServer || isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-400/15 px-5 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-400/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Queue Server Operation
            </button>
          </div>
        </div>
      </div>
    </section>
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