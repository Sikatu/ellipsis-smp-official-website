import { useState } from "react";
import { AlertTriangle, Megaphone, Send, Sparkles } from "lucide-react";
import { createServerBroadcastAction } from "../../services/minecraftActions";

type BroadcastStyle = "premium" | "event" | "warning" | "maintenance";

const styleOptions: Array<{
  value: BroadcastStyle;
  label: string;
  helper: string;
}> = [
  {
    value: "premium",
    label: "Premium",
    helper: "Elegant owner announcement with brand presence.",
  },
  {
    value: "event",
    label: "Event",
    helper: "Best for key all, build events, crates, rewards, and celebrations.",
  },
  {
    value: "warning",
    label: "Warning",
    helper: "Use for urgent reminders or important rule notices.",
  },
  {
    value: "maintenance",
    label: "Maintenance",
    helper: "Use for restarts, fixes, downtime, or bridge updates.",
  },
];

function getPreviewPrefix(style: BroadcastStyle) {
  if (style === "event") return "&d&lEVENT";
  if (style === "warning") return "&c&lWARNING";
  if (style === "maintenance") return "&e&lMAINTENANCE";
  return "&b&lELLIPSIS SMP";
}

export function AdminAnnouncementCenter() {
  const [title, setTitle] = useState("Ellipsis SMP");
  const [message, setMessage] = useState("");
  const [style, setStyle] = useState<BroadcastStyle>("premium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedStyle = styleOptions.find((option) => option.value === style) || styleOptions[0];
  const canSubmit = message.trim().length > 0 && !isSubmitting;

  async function handleSubmit() {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setNotice(null);
    setError(null);

    const result = await createServerBroadcastAction({
      title,
      message,
      style,
      audience: "all",
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setMessage("");
    setNotice(
      result.warning ||
        "Announcement queued. The Minecraft bridge will broadcast it shortly."
    );
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-pink-300/20 bg-pink-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-pink-200">
            <Megaphone className="h-4 w-4" />
            Owner Announcement Center
          </div>

          <h2 className="text-2xl font-black text-white md:text-3xl">
            Broadcast directly from the command center.
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-300">
            Queue announcements from the admin website and let the live Minecraft
            bridge deliver them in-game. Use this for events, warnings, maintenance,
            rewards, and owner-wide updates.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
          <div className="font-black">Bridge-backed</div>
          <div className="text-emerald-100/80">Delivered through Minecraft queue</div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-black/20 p-5">
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-gray-400">
              Announcement Title
            </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-gray-600 focus:border-pink-300/50"
              placeholder="Ellipsis SMP"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-gray-400">
              Message
            </label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={5}
              maxLength={220}
              className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-gray-600 focus:border-pink-300/50"
              placeholder="Example: Key all starts in 10 minutes. Stay online and gather at spawn."
            />
            <div className="mt-2 text-right text-xs text-gray-500">
              {message.length}/220
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-gray-400">
              Broadcast Style
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {styleOptions.map((option) => {
                const isActive = style === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStyle(option.value)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      isActive
                        ? "border-pink-300/50 bg-pink-300/10 text-white"
                        : "border-white/10 bg-black/20 text-gray-300 hover:border-white/20"
                    }`}
                  >
                    <div className="font-black">{option.label}</div>
                    <div className="mt-1 text-xs leading-5 text-gray-400">
                      {option.helper}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-300/20 bg-red-500/10 p-4 text-sm text-red-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {notice && (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
              {notice}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-pink-300 px-5 py-3 text-sm font-black text-black transition hover:bg-pink-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? "Queuing Announcement..." : "Queue Minecraft Broadcast"}
          </button>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
          <div className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-gray-400">
            Live Preview
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-5">
            <div className="text-xs font-black uppercase tracking-[0.22em] text-pink-200">
              Minecraft Broadcast
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-sm leading-7 text-gray-200">
              <span className="text-pink-200">{getPreviewPrefix(style)}</span>
              <span className="text-gray-500"> » </span>
              <span className="text-white">{title.trim() || "Ellipsis SMP"}</span>
              <br />
              <span>{message.trim() || "Your announcement message will appear here."}</span>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm font-black text-white">{selectedStyle.label} style</div>
              <p className="mt-1 text-xs leading-5 text-gray-400">{selectedStyle.helper}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4 text-xs leading-5 text-yellow-100">
            This queues a bridge action. If the bridge monitor is online, the message
            should broadcast within the normal action polling window.
          </div>
        </div>
      </div>
    </section>
  );
}
