import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Clock3,
  Loader2,
  PackageCheck,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import {
  fetchStaffActivityDashboard,
  type StaffActivityDashboard,
} from "../../services/staffActivity";
import KpiTile from "./KpiTile";

export function AdminStaffActivityPanel() {
  const [dashboard, setDashboard] = useState<StaffActivityDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function loadDashboard() {
    setLoading(true);
    setFeedback(null);

    const result = await fetchStaffActivityDashboard();

    if (result.error) {
      setFeedback({ type: "error", text: result.error.message });
    } else {
      setDashboard(result.data);
      setFeedback({ type: "success", text: "Staff activity refreshed." });
      setTimeout(() => setFeedback(null), 2500);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const topStaff = useMemo(() => {
    return dashboard?.summaries.slice(0, 6) || [];
  }, [dashboard]);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b91ad]">
            Staff Operations
          </p>
          <h2 className="mt-2 text-xl font-extrabold text-white">
            Staff Activity Dashboard
          </h2>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-6 text-[#9aa0b8]">
            Track who handled orders, queued Minecraft actions, completed fulfillment tasks,
            and where staff attention is needed.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[13px] font-bold text-[#c4c9dc] transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          Refresh
        </button>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border p-3 text-[13px] font-bold ${
            feedback.type === "success"
              ? "border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.08)] text-[#6ee7b7]"
              : "border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] text-[#fca5a5]"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {loading && !dashboard ? (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-10 text-[13px] text-[#9aa0b8]">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading staff activity...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <KpiTile label="Active Staff" value={dashboard?.totals.staffActive || 0} />
            <KpiTile label="Order Updates" value={dashboard?.totals.orderUpdates || 0} />
            <KpiTile label="MC Queued" value={dashboard?.totals.minecraftQueued || 0} />
            <KpiTile label="Completed" value={dashboard?.totals.minecraftCompleted || 0} />
            <KpiTile
              label="Failed"
              value={dashboard?.totals.minecraftFailed || 0}
              tone={(dashboard?.totals.minecraftFailed || 0) > 0 ? "alert" : "neutral"}
            />
            <KpiTile label="Cancelled" value={dashboard?.totals.minecraftCancelled || 0} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <div>
              <h3 className="mb-3 text-[13px] font-extrabold text-white">Staff Scoreboard</h3>

              <div className="grid gap-3">
                {topStaff.map((staff) => (
                  <article
                    key={staff.key}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-[#8b91ad]" />
                          <h4 className="font-extrabold text-white">{staff.displayName}</h4>
                        </div>
                        <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-[#6b7192]">
                          {staff.role}
                        </p>
                      </div>

                      <div className="rounded-[10px] border border-white/[0.08] bg-black/20 px-3.5 py-2 text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-[#8b91ad]">Total</p>
                        <p className="text-lg font-extrabold text-white">{staff.totalActions}</p>
                      </div>
                    </div>

                    <div className="mt-3.5 grid grid-cols-3 gap-2 xl:grid-cols-6">
                      <Stat label="Verified" value={staff.ordersVerified} />
                      <Stat label="Delivered" value={staff.ordersDelivered} />
                      <Stat label="Rejected" value={staff.ordersRejected} />
                      <Stat label="Queued MC" value={staff.minecraftQueued} />
                      <Stat label="Done MC" value={staff.minecraftCompleted} />
                      <Stat label="Failed MC" value={staff.minecraftFailed} />
                    </div>

                    <p className="mt-3 flex items-center gap-1.5 text-xs text-[#6b7192]">
                      <Clock3 className="h-3.5 w-3.5" />
                      Last activity: {staff.lastActivity ? new Date(staff.lastActivity).toLocaleString() : "N/A"}
                    </p>
                  </article>
                ))}

                {topStaff.length === 0 && (
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-10 text-center text-[13px] text-[#6b7192]">
                    No staff activity found yet.
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-[13px] font-extrabold text-white">Recent Activity</h3>

              <div className="grid max-h-[780px] gap-2.5 overflow-y-auto pr-1">
                {(dashboard?.events || []).map((event) => (
                  <article
                    key={event.id}
                    className="rounded-[11px] border border-white/[0.07] bg-black/20 p-3.5"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`rounded-full p-1.5 ${
                          event.type === "order"
                            ? "bg-[rgba(168,85,247,0.14)] text-[#d8b4fe]"
                            : "bg-[rgba(251,191,36,0.14)] text-[#fbbf24]"
                        }`}
                      >
                        {event.type === "order" ? <PackageCheck className="h-3.5 w-3.5" /> : <Activity className="h-3.5 w-3.5" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-bold text-white">{event.title}</p>
                        <p className="mt-0.5 text-[13px] text-[#9aa0b8]">{event.subtitle}</p>
                        <p className="mt-1.5 text-xs text-[#6b7192]">
                          {event.staffName} &middot; {new Date(event.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}

                {(dashboard?.events || []).length === 0 && (
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-8 text-center text-[13px] text-[#6b7192]">
                    No recent activity yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[9px] border border-white/[0.07] bg-black/20 p-2.5">
      <p className="text-[11px] text-[#8b91ad]">{label}</p>
      <p className="mt-0.5 text-[15px] font-extrabold text-white">{value}</p>
    </div>
  );
}
