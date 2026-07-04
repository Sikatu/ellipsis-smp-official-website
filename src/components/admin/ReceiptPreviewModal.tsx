import { X, ExternalLink } from "lucide-react";

type ReceiptPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  label: string;
};

export function ReceiptPreviewModal({
  isOpen,
  onClose,
  url,
  label,
}: ReceiptPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="flex w-full max-w-4xl flex-col rounded-[2rem] border border-white/10 bg-[#0a0518] shadow-2xl overflow-hidden max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-white/10 bg-black/20 p-4 sm:px-6">
          <h2 className="truncate text-lg font-black text-white pr-4">
            {label}
          </h2>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-300 transition hover:bg-white/10 hover:text-white"
              title="Open in new tab"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/40">
          {url.toLowerCase().endsWith(".pdf") ? (
            <iframe
              src={url}
              className="h-[60vh] w-full rounded-xl bg-white"
              title="Receipt PDF"
            />
          ) : (
            <img
              src={url}
              alt="Receipt Preview"
              className="max-h-[60vh] object-contain rounded-xl"
            />
          )}
        </div>
      </div>
    </div>
  );
}
