import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Copy,
  Eye,
  Loader2,
  MessageSquareText,
  NotebookPen,
  PackageCheck,
  ShieldCheck,
  Truck,
  XCircle,
} from "lucide-react";
import type { Order, OrderStatus } from "../../types/admin";
import {
  getDeliveryMessageTemplate,
  getOrderSummaryTemplate,
  getPlayerReplyTemplate,
  isReadyToDeliver,
} from "../../lib/adminOrderTemplates";
import { getAutomatedMinecraftActionForOrder } from "../../lib/orderMinecraftAutomation";
import { AdminStatusTimeline } from "./AdminStatusTimeline";
import { AdminAuditLog } from "./AdminAuditLog";

type AdminOrderCardProps = {
  order: Order;
  canManageOrders: boolean;
  onViewReceipt: (path: string | null) => void;
  onEditNotes: (order: Order) => void;
  onUpdateStatus: (id: string, status: OrderStatus) => Promise<{ error: Error | null; warning: string | null } | void>;
};

type ChecklistState = {
  receipt: boolean;
  item: boolean;
  ign: boolean;
};

const statusStyles: Record<OrderStatus, string> = {
  pending: "border-yellow-400/25 bg-yellow-400/10 text-yellow-200",
  verified: "border-blue-400/25 bg-blue-500/10 text-blue-200",
  delivered: "border-emerald-400/25 bg-emerald-500/10 text-emerald-200",
  rejected: "border-red-400/25 bg-red-500/10 text-red-200",
};

const checklistItems: Array<{ key: keyof ChecklistState; label: string }> = [
  { key: "receipt", label: "Receipt/payment verified" },
  { key: "item", label: "Item/rank prepared in-game" },
  { key: "ign", label: "IGN confirmed before delivery" },
];

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
  const [deliveryChecklist, setDeliveryChecklist] = useState<ChecklistState>({
    receipt: false,
    item: false,
    ign: false,
  });
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);

  const checklistComplete = Object.values(deliveryChecklist).every(Boolean);
  const showFulfillmentTools = order.status === "pending" || order.status === "verified";
  const readyToDeliver = isReadyToDeliver(order);

  async function handleStatusClick(newStatus: OrderStatus) {
    if (!canManageOrders || updatingStatus) return;

    if (newStatus === "delivered" && !checklistComplete) {
      setFeedback({
        type: "warning",
        text: "Complete the delivery checklist before marking this order as delivered.",
      });
      return;
    }

    if (newStatus === "verified" && order.status !== "verified") {
      const preview = getAutomatedMinecraftActionForOrder(order);
      const confirmed = window.confirm(
        "This will automatically run a Minecraft action for this order:\n\n" +
          `${preview.reason}\n\n` +
          `Product on file: ${order.product_name} (${order.product_price}), qty ${order.quantity || "1"}\n\n` +
          "Confirm this matches the uploaded receipt before continuing.",
      );

      if (!confirmed) {
        return;
      }
    }

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
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
      setFeedback({ type: "error", text: "Copy failed. Please copy manually." });
    }
  }

  function CopyButton({ text, field, fallback = "N/A" }: { text: string | null; field: string; fallback?: string }) {
    const isCopied = copiedField === field;
    const displayText = text || fallback;
    const isCopyable = Boolean(text && text !== "N/A");

    return (
      <div className="flex items-center gap-2">
        <strong>{field}:</strong>
        <span className="max-w-[150px] truncate font-mono text-white" title={displayText}>
          {displayText}
        </span>
        {isCopyable && (
          <button
            type="button"
            onClick={() => copyToClipboard(displayText, field)}
            className="flex shrink-0 items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-xs text-purple-200 transition hover:bg-white/20"
            title={`Copy ${field}`}
          >
            {isCopied ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span className="hidden sm:inline">{isCopied ? "Copied" : "Copy"}</span>
          </button>
        )}
      </div>
    );
  }

  function TemplateButton({
    label,
    text,
    icon,
  }: {
    label: string;
    text: string;
    icon: React.ReactNode;
  }) {
    const isCopied = copiedField === label;

    return (
      <button
        type="button"
        onClick={() => copyToClipboard(text, label)}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-purple-500/25 bg-purple-500/10 px-3 py-2 text-xs font-black text-purple-100 transition hover:bg-purple-500/20"
      >
        {isCopied ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : icon}
        {isCopied ? "Copied" : label}
      </button>
    );
  }

  function StatusActionButton({
    targetStatus,
    label,
    icon,
    activeClass,
  }: {
    targetStatus: OrderStatus;
    label: string;
    icon: React.ReactNode;
    activeClass: string;
  }) {
    const isCurrent = order.status === targetStatus;
    const isLoading = updatingStatus === targetStatus;
    const isDisabled = !canManageOrders || isCurrent || updatingStatus !== null;

    return (
      <div className="group relative flex flex-col">
        <button
          type="button"
          onClick={() => handleStatusClick(targetStatus)}
          disabled={isDisabled}
          className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black transition ${
            isCurrent
              ? "cursor-not-allowed border-white/10 bg-white/5 text-gray-500"
              : !canManageOrders || updatingStatus !== null
                ? "cursor-not-allowed border-white/5 bg-white/5 text-gray-600"
                : activeClass
          }`}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
          {label}
        </button>

        {!canManageOrders && (
          <div className="absolute right-0 bottom-full z-10 mb-2 hidden w-56 rounded border border-purple-500/50 bg-black p-2 text-xs text-white shadow-xl group-hover:block">
            Your Support role can view this order but cannot change its status.
          </div>
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
                onChange={(event) => handleStatusClick(event.target.value as OrderStatus)}
                disabled={!canManageOrders}
                className={`cursor-pointer appearance-none rounded-full border px-3 py-1 text-xs font-black uppercase outline-none disabled:cursor-not-allowed disabled:opacity-80 ${statusStyles[order.status]}`}
              >
                <option value="pending" className="bg-gray-900">Pending</option>
                <option value="verified" className="bg-gray-900">Verified</option>
                <option value="delivered" className="bg-gray-900">Delivered</option>
                <option value="rejected" className="bg-gray-900">Rejected</option>
              </select>
              {!canManageOrders && (
                <div className="absolute left-0 bottom-full z-10 mb-2 hidden w-48 rounded border border-purple-500/50 bg-black p-2 text-xs text-white shadow-xl group-hover:block">
                  Your Support role can view this order but cannot change its status.
                </div>
              )}
            </div>
            <span className="text-sm text-gray-400">
              {new Date(order.created_at).toLocaleString()}
            </span>
          </div>

          <h2 className="mt-3 break-words text-2xl font-black">{order.product_name}</h2>
          <p className="mt-1 font-black text-yellow-300">{order.product_price}</p>

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

          {showFulfillmentTools && (
            <div className={`mt-6 rounded-2xl border p-4 ${
              readyToDeliver
                ? "border-emerald-400/25 bg-emerald-500/10"
                : "border-yellow-400/20 bg-yellow-400/10"
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className={`text-xs font-black uppercase tracking-[0.18em] ${
                    readyToDeliver ? "text-emerald-200" : "text-yellow-200"
                  }`}>
                    {readyToDeliver ? "Ready to Deliver" : "Prep Needed"}
                  </p>
                  <p className="mt-1 text-sm text-gray-300">
                    Copy staff-ready messages and complete the checklist before delivery.
                  </p>
                </div>
                {readyToDeliver ? (
                  <PackageCheck className="h-6 w-6 text-emerald-300" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-yellow-300" />
                )}
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <TemplateButton
                  label="Copy Delivery Message"
                  text={getDeliveryMessageTemplate(order)}
                  icon={<ClipboardList className="h-4 w-4" />}
                />
                <TemplateButton
                  label="Copy Player Reply"
                  text={getPlayerReplyTemplate(order)}
                  icon={<MessageSquareText className="h-4 w-4" />}
                />
                <TemplateButton
                  label="Copy Order Summary"
                  text={getOrderSummaryTemplate(order)}
                  icon={<Copy className="h-4 w-4" />}
                />
              </div>

              <div className="mt-4 grid gap-2">
                {checklistItems.map((item) => (
                  <label
                    key={item.key}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-gray-200"
                  >
                    <input
                      type="checkbox"
                      checked={deliveryChecklist[item.key]}
                      onChange={(event) =>
                        setDeliveryChecklist((current) => ({
                          ...current,
                          [item.key]: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 accent-emerald-400"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid content-start gap-2 sm:grid-cols-2 lg:min-w-[260px] lg:grid-cols-1">
          <StatusActionButton
            targetStatus="verified"
            label="Verify"
            icon={<ShieldCheck className="h-4 w-4" />}
            activeClass="border-blue-500/50 bg-blue-500/20 text-blue-200 hover:bg-blue-500/30"
          />

          <StatusActionButton
            targetStatus="delivered"
            label="Deliver"
            icon={<Truck className="h-4 w-4" />}
            activeClass="border-emerald-500/50 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30"
          />

          <StatusActionButton
            targetStatus="rejected"
            label="Reject"
            icon={<XCircle className="h-4 w-4" />}
            activeClass="border-red-500/50 bg-red-500/20 text-red-200 hover:bg-red-500/30"
          />

          {feedback && (
            <div className={`rounded-xl border p-3 text-sm font-bold ${
              feedback.type === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" :
              feedback.type === "error" ? "border-red-500/30 bg-red-500/10 text-red-200" :
              "border-yellow-500/30 bg-yellow-500/10 text-yellow-200"
            }`}>
              {feedback.text}
            </div>
          )}

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
              <div className="absolute right-0 bottom-full z-10 mb-2 hidden w-48 rounded border border-yellow-500/50 bg-black p-2 text-xs text-white shadow-xl group-hover:block">
                Your Support role can view this order but cannot change its status.
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowAuditLog(!showAuditLog)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-500/25 bg-blue-500/10 px-4 py-3 text-sm font-black text-blue-200 transition hover:bg-blue-500/20"
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

