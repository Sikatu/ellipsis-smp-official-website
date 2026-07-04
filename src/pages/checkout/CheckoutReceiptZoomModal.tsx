import { X } from "lucide-react";

type CheckoutReceiptZoomModalProps = {
  receiptPreviewUrl: string;
  onClose: () => void;
};

function CheckoutReceiptZoomModal({
  receiptPreviewUrl,
  onClose,
}: CheckoutReceiptZoomModalProps) {
  if (!receiptPreviewUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-md sm:p-4">
      <div className="w-full max-w-4xl rounded-[1.5rem] border border-purple-400/25 bg-[#080019]/95 p-3 shadow-[0_0_70px_rgba(168,85,247,0.25)] sm:rounded-[2rem] sm:p-4">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-purple-300">
              Receipt Zoom
            </p>
            <p className="mt-1 text-xs font-semibold text-gray-500">
              Review the uploaded receipt before submitting your claim.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/25 text-purple-100 transition hover:bg-white/10"
            aria-label="Close receipt preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[72vh] overflow-auto rounded-2xl border border-purple-500/15 bg-black/60 p-2 sm:max-h-[75vh] sm:p-3">
          <img
            src={receiptPreviewUrl}
            alt="Uploaded receipt zoom preview"
            decoding="async"
            className="mx-auto max-h-[68vh] w-full object-contain sm:max-h-[70vh]"
          />
        </div>
      </div>
    </div>
  );
}

export default CheckoutReceiptZoomModal;
