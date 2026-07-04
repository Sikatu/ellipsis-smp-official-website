import { useState, useEffect } from "react";
import { Clock3, ShieldCheck, Truck, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import type { Order, OrderAuditLog, OrderStatus } from "../../types/admin";
import { fetchAuditLogsForOrder } from "../../services/admin";

type AdminStatusTimelineProps = {
  order: Order;
};

const statusMeta: Record<OrderStatus, { label: string; icon: any; color: string }> = {
  pending: { label: "Order Submitted", icon: Clock3, color: "text-yellow-300" },
  verified: { label: "Payment Verified", icon: ShieldCheck, color: "text-blue-300" },
  delivered: { label: "Delivered", icon: Truck, color: "text-emerald-300" },
  rejected: { label: "Rejected", icon: AlertTriangle, color: "text-red-300" },
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
    <div className="mt-4 rounded-2xl border border-purple-500/20 bg-black/20 p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-sm font-black text-purple-200 outline-none transition hover:text-purple-100"
      >
        <span className="flex items-center gap-2">
          <Clock3 className="h-4 w-4" />
          Status Timeline
        </span>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isExpanded && (
        <div className="mt-4 border-t border-purple-500/20 pt-4">
          {isLoading ? (
            <p className="text-xs text-gray-400">Loading timeline...</p>
          ) : (
            <div className="flex flex-col gap-4">
              {timelineEvents.map((event, idx) => {
                const Icon = statusMeta[event.status].icon;
                const isLast = idx === timelineEvents.length - 1;
                return (
                  <div key={idx} className="relative flex gap-4">
                    {!isLast && (
                      <div className="absolute left-[11px] top-6 h-full w-px bg-white/10" />
                    )}
                    <div className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/50 ${statusMeta[event.status].color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">{event.label}</p>
                      <p className="mt-1 text-xs text-gray-400">
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
