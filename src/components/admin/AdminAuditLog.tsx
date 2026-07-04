import { useEffect, useState } from "react";
import { fetchAuditLogs, fetchAuditLogsForOrder } from "../../services/admin";
import type { OrderAuditLog } from "../../types/admin";
import { History, FileText } from "lucide-react";

type AdminAuditLogProps = {
  orderId?: string;
  isGlobal?: boolean;
};

export function AdminAuditLog({ orderId, isGlobal = false }: AdminAuditLogProps) {
  const [logs, setLogs] = useState<OrderAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      setIsLoading(true);
      const { data } = isGlobal && !orderId
        ? await fetchAuditLogs()
        : await fetchAuditLogsForOrder(orderId!);
      setLogs(data);
      setIsLoading(false);
    }

    loadLogs();
  }, [orderId, isGlobal]);

  if (isLoading) {
    return <p className="text-sm text-gray-400 p-4">Loading audit logs...</p>;
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-gray-400">
        <History className="mx-auto mb-2 h-6 w-6 opacity-50" />
        No audit logs found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[1.5rem] border border-white/10 bg-black/20">
      <table className="w-full text-left text-sm text-gray-300">
        <thead className="bg-white/5 text-xs font-black uppercase text-gray-400">
          <tr>
            <th className="px-4 py-3">Time</th>
            {isGlobal && <th className="px-4 py-3">Order ID</th>}
            <th className="px-4 py-3">Staff</th>
            <th className="px-4 py-3">Action</th>
            <th className="px-4 py-3">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {logs.map((log) => (
            <tr key={log.id} className="transition hover:bg-white/[0.02]">
              <td className="whitespace-nowrap px-4 py-3 text-xs">
                {new Date(log.created_at).toLocaleString()}
              </td>
              {isGlobal && (
                <td className="px-4 py-3 font-mono text-xs text-purple-300">
                  {log.order_id?.slice(0, 8)}...
                </td>
              )}
              <td className="px-4 py-3 text-xs text-blue-200">
                {log.admin_email}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex rounded-full bg-white/10 px-2 py-1 text-xs font-bold text-white">
                  {log.action}
                </span>
              </td>
              <td className="px-4 py-3 text-xs">
                {log.action === "status_update" && (
                  <span className="text-gray-400">
                    <span className="line-through">{log.previous_status || "unknown"}</span> 
                    {" → "} 
                    <span className="font-bold text-white">{log.next_status}</span>
                  </span>
                )}
                {log.action === "staff_notes_update" && (
                  <span className="inline-flex items-center gap-1 text-yellow-200">
                    <FileText className="h-3 w-3" />
                    Notes updated
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
