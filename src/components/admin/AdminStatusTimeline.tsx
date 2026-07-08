import { useState, useEffect } from "react";
import { Clock3, ShieldCheck, Truck, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import type { Order, OrderAuditLog, OrderStatus } from "../../types/admin";
import { fetchAuditLogsForOrder } from "../../services/admin";

type AdminStatusTimelineProps = {
  order: Order;
};

const statusMeta: Record<OrderStatus, { label: string; icon: any; color: string }> = {
  pending: { label: "Order Submitted", icon: Clock3, color: "text-[#fbbf24]" },
  verified: { label: "Payment Verified", icon: ShieldCheck, color: "text-[#60a5fa]" },
  delivered: { label: "Delivered", icon: Truck, color: "text-[#34d399]" },
  rejected: { label: "Rejected", icon: AlertTriangle, color: "text-[#f87171]" },
};

export function AdminStatusTimeline({ order }: AdminStatusTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [logs, setLogs] = useState<OrderAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (isExpanded && !hasFetched) {
      setIsLoading(true);
      fetchAuditLogsForOrder(order.id).then(({ data }) => {
        setLogs(data);
        setHasFetched(true);
        setIsLoading(false);
      });
    }
  }, [isExpanded, hasFetched, order.id]);

  // Generate fallback timeline if no relevant audit logs
  const statusUpdates = logs.filter(log => log.action === "status_update" && log.next_status);
  
  const timelineEvents = [];

  if (statusUpdates.length > 0) {
    timelineEvents.push({
      status: "pending" as OrderStatus,
      timestamp: order.created_at,
      label: statusMeta.pending.label,
    });
    
    statusUpdates.forEach(log => {
      timelineEvents.push({
        status: log.next_status as OrderStatus,
        timestamp: log.created_at,
        label: statusMeta[log.next_status as OrderStatus].label,
      });
    });
  } else {
    // Fallback
    timelineEvents.push({
      status: "pending" as OrderStatus,
      timestamp: order.created_at,
      label: statusMeta.pending.label,
    });
    
    if (order.status !== "pending") {
      timelineEvents.push({
        status: order.status,
        timestamp: order.created_at, // inaccurate but safe fallback
        label: statusMeta[order.status].label + " (Fallback)",
      });
    }
  }

  return (
    <div className="mt-4 rounded-[11px] border border-white/[0.07] bg-black/20 p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-[13px] font-bold text-[#c4c9dc] outline-none transition hover:text-white"
      >
        <span className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-[#6b7192]" />
          Status Timeline
        </span>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isExpanded && (
        <div className="mt-4 border-t border-white/[0.06] pt-4">
          {isLoading ? (
            <p className="text-xs text-[#6b7192]">Loading timeline...</p>
          ) : (
            <div className="flex flex-col gap-4">
              {timelineEvents.map((event, idx) => {
                const Icon = statusMeta[event.status].icon;
                const isLast = idx === timelineEvents.length - 1;
                return (
                  <div key={idx} className="relative flex gap-4">
                    {!isLast && (
                      <div className="absolute left-[11px] top-6 h-full w-px bg-white/[0.08]" />
                    )}
                    <div className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/50 ${statusMeta[event.status].color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-white">{event.label}</p>
                      <p className="mt-0.5 text-xs text-[#6b7192]">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
