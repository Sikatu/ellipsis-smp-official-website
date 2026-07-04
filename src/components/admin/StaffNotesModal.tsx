import { useEffect, useState } from "react";
import { X, Save } from "lucide-react";

type StaffNotesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentNotes: string | null;
  onSave: (notes: string) => Promise<void>;
  orderId: string;
};

export function StaffNotesModal({
  isOpen,
  onClose,
  currentNotes,
  onSave,
  orderId,
}: StaffNotesModalProps) {
  const [notes, setNotes] = useState(currentNotes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setNotes(currentNotes || "");
      setError("");
    }
  }, [isOpen, currentNotes]);

  if (!isOpen) return null;

  async function handleSave() {
    setIsSaving(true);
    setError("");
    try {
      await onSave(notes);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save notes.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border border-purple-500/25 bg-[#0a0518] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase text-purple-300">
              Order {orderId}
            </p>
            <h2 className="mt-1 text-2xl font-black text-white">Staff Notes</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add internal notes about this order..."
            className="h-40 w-full resize-none rounded-2xl border border-purple-500/25 bg-black/40 p-4 text-white outline-none focus:border-purple-300"
          />
          {error && (
            <p className="mt-3 text-sm font-bold text-red-400">{error}</p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-2xl px-5 py-3 text-sm font-black text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-sm font-black text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Notes"}
          </button>
        </div>
      </div>
    </div>
  );
}
