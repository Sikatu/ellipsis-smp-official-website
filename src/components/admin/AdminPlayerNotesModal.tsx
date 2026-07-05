import { useEffect, useState } from "react";
import { Loader2, MessageSquareText, Save, X } from "lucide-react";
import type { PlayerAdminNote } from "../../types/playerAdminNotes";
import {
  fetchPlayerAdminNote,
  savePlayerAdminNote,
} from "../../services/playerAdminNotes";

type AdminPlayerNotesModalProps = {
  isOpen: boolean;
  minecraftUsername: string;
  discordUsername: string | null;
  canManagePlayers: boolean;
  onClose: () => void;
};

export function AdminPlayerNotesModal({
  isOpen,
  minecraftUsername,
  discordUsername,
  canManagePlayers,
  onClose,
}: AdminPlayerNotesModalProps) {
  const [noteRecord, setNoteRecord] = useState<PlayerAdminNote | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!isOpen || !minecraftUsername) return;

    let isMounted = true;

    async function loadNote() {
      setLoading(true);
      setFeedback(null);

      const result = await fetchPlayerAdminNote(minecraftUsername);

      if (!isMounted) return;

      if (result.error) {
        setFeedback({ type: "error", text: result.error.message });
      } else {
        setNoteRecord(result.data);
        setNote(result.data?.note || "");
      }

      setLoading(false);
    }

    loadNote();

    return () => {
      isMounted = false;
    };
  }, [isOpen, minecraftUsername]);

  if (!isOpen) return null;

  async function handleSave() {
    if (!canManagePlayers || saving) return;

    setSaving(true);
    setFeedback(null);

    const result = await savePlayerAdminNote({
      minecraftUsername,
      discordUsername,
      note,
    });

    if (result.error) {
      setFeedback({ type: "error", text: result.error.message });
    } else {
      setNoteRecord(result.data);
      setFeedback({ type: "success", text: "Player note saved." });
    }

    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[2rem] border border-emerald-400/25 bg-[#12091f] p-5 shadow-[0_0_60px_rgba(16,185,129,0.2)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
              Player Notes
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
            aria-label="Close player notes"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="mt-6 flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-8 text-gray-300">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading player note...
          </div>
        ) : (
          <>
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
              <label className="flex items-center gap-2 text-sm font-black text-emerald-200">
                <MessageSquareText className="h-4 w-4" />
                Internal Staff Note
              </label>

              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                disabled={!canManagePlayers}
                rows={8}
                placeholder="Add internal notes about this player, delivery history, warnings, payment behavior, or staff reminders..."
                className="mt-3 w-full resize-none rounded-2xl border border-purple-500/20 bg-black/40 p-4 text-sm leading-6 text-white outline-none placeholder:text-gray-600 focus:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
              />

              {!canManagePlayers && (
                <p className="mt-3 rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-xs font-bold text-yellow-100">
                  Your Support role can view notes but cannot edit them.
                </p>
              )}
            </div>

            <div className="mt-4 grid gap-3 text-xs text-gray-500 sm:grid-cols-2">
              <p>Created: {noteRecord ? new Date(noteRecord.created_at).toLocaleString() : "No note yet"}</p>
              <p>Updated: {noteRecord ? new Date(noteRecord.updated_at).toLocaleString() : "No note yet"}</p>
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

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-gray-300 transition hover:bg-white/10"
              >
                Close
              </button>

              {canManagePlayers && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/20 px-5 py-3 text-sm font-black text-emerald-100 transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Note
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
