import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { fetchTicketAuditLogs } from "../../services/tickets";
import type { TicketAuditLog } from "../../types/tickets";
import { getAuditStaffName } from "../../lib/adminPermissions";

export function AdminTicketAuditLog({ ticketId }: { ticketId: string }) {
  const [logs, setLogs] = useState<TicketAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      setIsLoading(true);
      const { data } = await fetchTicketAuditLogs(ticketId);
      setLogs(data);
      setIsLoading(false);
    }

    void loadLogs();
  }, [ticketId]);

  if (isLoading) {
    return <p className="p-4 text-sm text-gray-400">Loading audit logs...</p>;
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
              <td className="px-4 py-3 text-xs text-blue-200">{getAuditStaffName(log)}</td>
              <td className="px-4 py-3">
                <span className="inline-flex rounded-full bg-white/10 px-2 py-1 text-xs font-bold text-white">
                  {log.action}
                </span>
              </td>
              <td className="px-4 py-3 text-xs">
                {log.action === "status_update" && (
                  <span className="text-gray-400">
                    <span className="line-through">{log.previous_status || "unknown"}</span>
                    {" -> "}
                    <span className="font-bold text-white">{log.next_status}</span>
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
