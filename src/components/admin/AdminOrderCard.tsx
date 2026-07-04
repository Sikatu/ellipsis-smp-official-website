import { useState } from "react";
import { Eye, NotebookPen, CheckCircle2, Copy, ShieldCheck, Truck, XCircle, Loader2 } from "lucide-react";
import type { Order, OrderStatus } from "../../types/admin";
import { AdminStatusTimeline } from "./AdminStatusTimeline";
import { AdminAuditLog } from "./AdminAuditLog";

type AdminOrderCardProps = {
  order: Order;
  canManageOrders: boolean;
  onViewReceipt: (path: string | null) => void;
  onEditNotes: (order: Order) => void;
  onUpdateStatus: (id: string, status: OrderStatus) => Promise<{ error: Error | null; warning: string | null } | void>;
};

const statusStyles: Record<OrderStatus, string> = {
  pending: "border-yellow-400/25 bg-yellow-400/10 text-yellow-200",
  verified: "border-blue-400/25 bg-blue-500/10 text-blue-200",
  delivered: "border-emerald-400/25 bg-emerald-500/10 text-emerald-200",
  rejected: "border-red-400/25 bg-red-500/10 text-red-200",
};

export function AdminOrderCard({
  order,
  canManageOrders,
  onViewReceipt,
  onEditNotes,
  onUpdateStatus,
}: AdminOrderCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<OrderStatus | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);

  async function handleStatusClick(newStatus: OrderStatus) {
    if (!canManageOrders || updatingStatus) return;
    setUpdatingStatus(newStatus);
    setFeedback(null);
    const result = await onUpdateStatus(order.id, newStatus);
    setUpdatingStatus(null);

    if (result) {
      if (result.error) {
        setFeedback({ type: "error", text: result.error.message });
      } else if (result.warning) {
        setFeedback({ type: "warning", text: result.warning });
      } else {
        setFeedback({ type: "success", text: `Status updated to ${newStatus}` });
        setTimeout(() => setFeedback(null), 3000);
      }
    } else {
      setFeedback({ type: "success", text: `Status updated to ${newStatus}` });
      setTimeout(() => setFeedback(null), 3000);
    }
  }

  async function copyToClipboard(text: string, field: string) {
    if (!text || text === "N/A") return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 1500);
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 1500);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  function CopyButton({ text, field, fallback = "N/A" }: { text: string | null; field: string; fallback?: string }) {
    const isCopied = copiedField === field;
    const displayText = text || fallback;
    const isCopyable = text && text !== "N/A";

    return (
      <div className="flex items-center gap-2">
        <strong>{field}:</strong> 
        <span className="font-mono text-white truncate max-w-[150px]" title={displayText}>{displayText}</span>
        {isCopyable && (
          <button
            onClick={() => copyToClipboard(text, field)}
            className="flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-xs text-purple-200 transition hover:bg-white/20 shrink-0"
            title={`Copy ${field}`}
          >
            {isCopied ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span className="hidden sm:inline">{isCopied ? "Copied" : "Copy"}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <article className="rounded-[2rem] border border-purple-500/25 bg-white/[0.06] p-5 shadow-[0_0_40px_rgba(168,85,247,0.12)] sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative group">
              <select
                value={order.status}
                onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                disabled={!canManageOrders}
                className={`rounded-full border px-3 py-1 text-xs font-black uppercase outline-none appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-80 ${statusStyles[order.status]}`}
              >
                <option value="pending" className="bg-gray-900">Pending</option>
                <option value="verified" className="bg-gray-900">Verified</option>
                <option value="delivered" className="bg-gray-900">Delivered</option>
                <option value="rejected" className="bg-gray-900">Rejected</option>
              </select>
              {!canManageOrders && (
                <div className="absolute left-0 bottom-full mb-2 hidden w-48 rounded bg-black p-2 text-xs text-white group-hover:block z-10 border border-purple-500/50 shadow-xl">
                  Your Support role can view this order but cannot change its status.
                </div>
              )}
            </div>
            <span className="text-sm text-gray-400">
              {new Date(order.created_at).toLocaleString()}
            </span>
          </div>

          <h2 className="mt-3 break-words text-2xl font-black">
            {order.product_name}
          </h2>
          <p className="mt-1 font-black text-yellow-300">
            {order.product_price}
          </p>

          <div className="mt-4 grid gap-3 text-sm text-gray-300 sm:grid-cols-2 lg:grid-cols-3">
            <CopyButton text={order.payment_reference || order.id} field="Order ID" />
            <CopyButton text={order.minecraft_username} field="IGN" />
            <CopyButton text={order.discord_username} field="Discord" fallback="N/A" />
            
            <p><strong>Customer:</strong> <span className="text-white">{order.customer_name}</span></p>
            <p><strong>Category:</strong> <span className="text-white">{order.product_category}</span></p>
            <p><strong>Quantity:</strong> <span className="text-white">{order.quantity || "N/A"}</span></p>
            <p><strong>Payment:</strong> <span className="text-white">{order.payment_method}</span></p>
            <p className="col-span-full"><strong>Staff Notes:</strong> <span className="text-white">{order.staff_notes || "None"}</span></p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-5">
            <div className="relative group flex flex-col">
              <button
                onClick={() => handleStatusClick("verified")}
                disabled={!canManageOrders || order.status === "verified" || updatingStatus !== null}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2 font-black transition text-sm ${
                  order.status === "verified"
                    ? "border-white/10 bg-white/5 text-gray-500 cursor-not-allowed"
                    : !canManageOrders || updatingStatus !== null
                    ? "border-white/5 bg-white/5 text-gray-600 cursor-not-allowed"
                    : "border-blue-500/50 bg-blue-500/20 text-blue-200 hover:bg-blue-500/30"
                }`}
              >
                {updatingStatus === "verified" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Verify
              </button>
              {!canManageOrders && (
                <div className="absolute bottom-full left-0 mb-2 hidden w-48 rounded bg-black p-2 text-xs text-white group-hover:block z-10 border border-purple-500/50 shadow-xl">
                  Your Support role can view this order but cannot change its status.
                </div>
              )}
            </div>

            <div className="relative group flex flex-col">
              <button
                onClick={() => handleStatusClick("delivered")}
                disabled={!canManageOrders || order.status === "delivered" || updatingStatus !== null}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2 font-black transition text-sm ${
                  order.status === "delivered"
                    ? "border-white/10 bg-white/5 text-gray-500 cursor-not-allowed"
                    : !canManageOrders || updatingStatus !== null
                    ? "border-white/5 bg-white/5 text-gray-600 cursor-not-allowed"
                    : "border-emerald-500/50 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30"
                }`}
              >
                {updatingStatus === "delivered" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                Deliver
              </button>
              {!canManageOrders && (
                <div className="absolute bottom-full left-0 mb-2 hidden w-48 rounded bg-black p-2 text-xs text-white group-hover:block z-10 border border-purple-500/50 shadow-xl">
                  Your Support role can view this order but cannot change its status.
                </div>
              )}
            </div>

            <div className="relative group flex flex-col">
              <button
                onClick={() => handleStatusClick("rejected")}
                disabled={!canManageOrders || order.status === "rejected" || updatingStatus !== null}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2 font-black transition text-sm ${
                  order.status === "rejected"
                    ? "border-white/10 bg-white/5 text-gray-500 cursor-not-allowed"
                    : !canManageOrders || updatingStatus !== null
                    ? "border-white/5 bg-white/5 text-gray-600 cursor-not-allowed"
                    : "border-red-500/50 bg-red-500/20 text-red-200 hover:bg-red-500/30"
                }`}
              >
                {updatingStatus === "rejected" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                Reject
              </button>
              {!canManageOrders && (
                <div className="absolute bottom-full left-0 mb-2 hidden w-48 rounded bg-black p-2 text-xs text-white group-hover:block z-10 border border-purple-500/50 shadow-xl">
                  Your Support role can view this order but cannot change its status.
                </div>
              )}
            </div>
          </div>

          {feedback && (
            <div className={`mt-3 rounded-xl border p-3 text-sm font-bold ${
              feedback.type === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" :
              feedback.type === "error" ? "border-red-500/30 bg-red-500/10 text-red-200" :
              "border-yellow-500/30 bg-yellow-500/10 text-yellow-200"
            }`}>
              {feedback.text}
            </div>
          )}
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[260px] lg:grid-cols-1 content-start">
          <button
            type="button"
            onClick={() => onViewReceipt(order.receipt_url)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-purple-500/25 bg-black/30 px-4 py-3 font-black transition hover:bg-black/50"
          >
            <Eye className="h-4 w-4" />
            View Receipt
          </button>

          <div className="relative group flex flex-col">
            <button
              type="button"
              onClick={() => onEditNotes(order)}
              disabled={!canManageOrders}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-4 py-3 font-black text-yellow-200 transition hover:bg-yellow-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <NotebookPen className="h-4 w-4" />
              Staff Notes
            </button>
            {!canManageOrders && (
              <div className="absolute right-0 bottom-full mb-2 hidden w-48 rounded bg-black p-2 text-xs text-white group-hover:block z-10 border border-yellow-500/50 shadow-xl">
                Your Support role can view this order but cannot change its status.
              </div>
            )}
          </div>
          
          <button
            type="button"
            onClick={() => setShowAuditLog(!showAuditLog)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-500/25 bg-blue-500/10 px-4 py-3 font-black text-blue-200 transition hover:bg-blue-500/20 text-sm"
          >
            {showAuditLog ? "Hide Audit Log" : "View Audit Log"}
          </button>
        </div>
      </div>

      <AdminStatusTimeline order={order} />

      {showAuditLog && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-bold text-blue-300">Order Audit History</h3>
          <AdminAuditLog orderId={order.id} />
        </div>
      )}
    </article>
  );
}
