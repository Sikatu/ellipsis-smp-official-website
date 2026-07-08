import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
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
import StatusChip from "../ui/StatusChip";
import { formatOrderAge, getOrderAgeMinutes } from "../../lib/orderAge";
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
  const [isExpanded, setIsExpanded] = useState(false);
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
  const orderReference = order.payment_reference || order.id;
  const ageMinutes = getOrderAgeMinutes(order);

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
        <strong className="text-[#8b91ad]">{field}:</strong>
        <span className="max-w-[150px] truncate font-mono text-white" title={displayText}>
          {displayText}
        </span>
        {isCopyable && (
          <button
            type="button"
            onClick={() => copyToClipboard(displayText, field)}
            className="flex shrink-0 items-center gap-1 rounded-[6px] bg-white/[0.06] px-2 py-0.5 text-xs text-[#c4b5fd] transition hover:bg-white/[0.1]"
            title={`Copy ${field}`}
          >
            {isCopied ? <CheckCircle2 className="h-3 w-3 text-[#34d399]" /> : <Copy className="h-3 w-3" />}
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
        className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-bold text-[#c4c9dc] transition hover:bg-white/[0.06]"
      >
        {isCopied ? <CheckCircle2 className="h-4 w-4 text-[#34d399]" /> : icon}
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
          className={`inline-flex w-full items-center justify-center gap-2 rounded-[10px] border px-4 py-2.5 text-[13px] font-bold transition ${
            isCurrent
              ? "cursor-not-allowed border-white/[0.06] bg-white/[0.02] text-[#565d78]"
              : !canManageOrders || updatingStatus !== null
                ? "cursor-not-allowed border-white/[0.04] bg-white/[0.02] text-[#42475c]"
                : activeClass
          }`}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
          {label}
        </button>

        {!canManageOrders && (
          <div className="absolute right-0 bottom-full z-10 mb-2 hidden w-56 rounded-[10px] border border-white/10 bg-[#0c0c17] p-2 text-xs text-white shadow-xl group-hover:block">
            Your Support role can view this order but cannot change its status.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border-b border-white/[0.05] last:border-b-0">
      <button
        type="button"
        onClick={() => setIsExpanded((value) => !value)}
        className="grid w-full grid-cols-[1fr_auto] items-center gap-3 px-4 py-3.5 text-left text-[13px] transition hover:bg-white/[0.02] sm:grid-cols-[1.4fr_1fr_1fr_0.8fr_0.9fr]"
      >
        <div className="min-w-0">
          <p className="truncate font-bold text-white">{order.product_name}</p>
          <p className="mt-0.5 truncate text-[11px] text-[#8b91ad]">
            {order.minecraft_username || "No IGN"}
            <span className="font-mono sm:hidden"> &middot; {orderReference}</span>
          </p>
        </div>

        <span className="hidden truncate font-mono text-xs text-[#9aa0b8] sm:block">
          {orderReference}
        </span>

        <span
          className={`hidden text-[13px] font-bold sm:block ${
            ageMinutes > 30 ? "text-[#fca5a5]" : "text-[#9aa0b8]"
          }`}
        >
          {formatOrderAge(ageMinutes)}
        </span>

        <span className="hidden font-bold text-[#fde047] sm:block">{order.product_price}</span>

        <div className="flex items-center justify-end gap-2 sm:justify-start">
          <StatusChip status={order.status} />
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-[#6b7192] transition ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-white/[0.06] bg-black/15 p-4 sm:p-5">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs text-[#6b7192]">{new Date(order.created_at).toLocaleString()}</p>

              <div className="mt-3 grid gap-2.5 text-[13px] text-[#c4c9dc] sm:grid-cols-2 lg:grid-cols-3">
                <CopyButton text={order.payment_reference || order.id} field="Order ID" />
                <CopyButton text={order.minecraft_username} field="IGN" />
                <CopyButton text={order.discord_username} field="Discord" fallback="N/A" />

                <p><strong className="text-[#8b91ad]">Customer:</strong> <span className="text-white">{order.customer_name}</span></p>
                <p><strong className="text-[#8b91ad]">Category:</strong> <span className="text-white">{order.product_category}</span></p>
                <p><strong className="text-[#8b91ad]">Quantity:</strong> <span className="text-white">{order.quantity || "N/A"}</span></p>
                <p><strong className="text-[#8b91ad]">Payment:</strong> <span className="text-white">{order.payment_method}</span></p>
                <p className="col-span-full"><strong className="text-[#8b91ad]">Staff Notes:</strong> <span className="text-white">{order.staff_notes || "None"}</span></p>
              </div>

              {showFulfillmentTools && (
                <div
                  className={`mt-5 rounded-[11px] border p-4 ${
                    readyToDeliver
                      ? "border-[rgba(52,211,153,0.25)] bg-[rgba(52,211,153,0.06)]"
                      : "border-[rgba(251,191,36,0.2)] bg-[rgba(251,191,36,0.06)]"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p
                        className={`text-[11px] font-bold uppercase tracking-[0.1em] ${
                          readyToDeliver ? "text-[#6ee7b7]" : "text-[#fbbf24]"
                        }`}
                      >
                        {readyToDeliver ? "Ready to Deliver" : "Prep Needed"}
                      </p>
                      <p className="mt-1 text-[13px] text-[#9aa0b8]">
                        Copy staff-ready messages and complete the checklist before delivery.
                      </p>
                    </div>
                    {readyToDeliver ? (
                      <PackageCheck className="h-5 w-5 text-[#34d399]" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-[#fbbf24]" />
                    )}
                  </div>

                  <div className="mt-3.5 grid gap-2 sm:grid-cols-3">
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

                  <div className="mt-3.5 grid gap-2">
                    {checklistItems.map((item) => (
                      <label
                        key={item.key}
                        className="flex cursor-pointer items-center gap-3 rounded-[10px] border border-white/[0.07] bg-black/20 px-3 py-2 text-[13px] text-[#c4c9dc]"
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
                          className="h-4 w-4 accent-[#a855f7]"
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid content-start gap-2 sm:grid-cols-2 lg:min-w-[240px] lg:grid-cols-1">
              <StatusActionButton
                targetStatus="verified"
                label="Verify"
                icon={<ShieldCheck className="h-4 w-4" />}
                activeClass="border-[rgba(96,165,250,0.35)] bg-[rgba(96,165,250,0.1)] text-[#60a5fa] hover:bg-[rgba(96,165,250,0.16)]"
              />

              <StatusActionButton
                targetStatus="delivered"
                label="Deliver"
                icon={<Truck className="h-4 w-4" />}
                activeClass="border-[rgba(52,211,153,0.35)] bg-[rgba(52,211,153,0.1)] text-[#34d399] hover:bg-[rgba(52,211,153,0.16)]"
              />

              <StatusActionButton
                targetStatus="rejected"
                label="Reject"
                icon={<XCircle className="h-4 w-4" />}
                activeClass="border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.1)] text-[#f87171] hover:bg-[rgba(248,113,113,0.16)]"
              />

              {feedback && (
                <div
                  className={`rounded-[10px] border p-3 text-[13px] font-bold ${
                    feedback.type === "success"
                      ? "border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.08)] text-[#6ee7b7]"
                      : feedback.type === "error"
                        ? "border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] text-[#fca5a5]"
                        : "border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.08)] text-[#fbbf24]"
                  }`}
                >
                  {feedback.text}
                </div>
              )}

              <button
                type="button"
                onClick={() => onViewReceipt(order.receipt_url)}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/[0.08] bg-black/20 px-4 py-2.5 text-[13px] font-bold text-[#c4c9dc] transition hover:bg-black/35"
              >
                <Eye className="h-4 w-4" />
                View Receipt
              </button>

              <div className="relative group flex flex-col">
                <button
                  type="button"
                  onClick={() => onEditNotes(order)}
                  disabled={!canManageOrders}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-[rgba(251,191,36,0.2)] bg-[rgba(251,191,36,0.06)] px-4 py-2.5 text-[13px] font-bold text-[#fbbf24] transition hover:bg-[rgba(251,191,36,0.12)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <NotebookPen className="h-4 w-4" />
                  Staff Notes
                </button>
                {!canManageOrders && (
                  <div className="absolute right-0 bottom-full z-10 mb-2 hidden w-48 rounded-[10px] border border-white/10 bg-[#0c0c17] p-2 text-xs text-white shadow-xl group-hover:block">
                    Your Support role can view this order but cannot change its status.
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowAuditLog(!showAuditLog)}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[rgba(96,165,250,0.2)] bg-[rgba(96,165,250,0.06)] px-4 py-2.5 text-[13px] font-bold text-[#60a5fa] transition hover:bg-[rgba(96,165,250,0.12)]"
              >
                {showAuditLog ? "Hide Audit Log" : "View Audit Log"}
              </button>
            </div>
          </div>

          <AdminStatusTimeline order={order} />

          {showAuditLog && (
            <div className="mt-4">
              <h3 className="mb-2 text-[13px] font-bold text-[#60a5fa]">Order Audit History</h3>
              <AdminAuditLog orderId={order.id} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
