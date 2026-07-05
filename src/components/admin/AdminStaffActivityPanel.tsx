import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Loader2,
  PackageCheck,
  RefreshCcw,
  ShieldCheck,
  Terminal,
  UserRoundCheck,
  XCircle,
} from "lucide-react";
import {
  fetchStaffActivityDashboard,
  type StaffActivityDashboard,
} from "../../services/staffActivity";

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
    <section className="mt-6">
      <div className="rounded-[2rem] border border-cyan-400/20 bg-cyan-500/[0.06] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
              Staff Operations
            </p>
            <h2 className="mt-3 text-2xl font-black text-white">
              Staff Activity Dashboard
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-300">
              Track who handled orders, queued Minecraft actions, completed fulfillment tasks,
              and where staff attention is needed.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/25 bg-cyan-500/10 px-4 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Refresh
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`mt-4 rounded-xl border p-3 text-sm font-bold ${
          feedback.type === "success"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
            : "border-red-500/30 bg-red-500/10 text-red-200"
        }`}>
          {feedback.text}
        </div>
      )}

      {loading && !dashboard ? (
        <div className="mt-6 flex items-center justify-center gap-3 rounded-[2rem] border border-cyan-500/20 bg-white/[0.03] p-10 text-gray-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading staff activity...
        </div>
      ) : (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
              <UserRoundCheck className="h-5 w-5 text-cyan-300" />
              <p className="mt-3 text-xs font-black uppercase tracking-widest text-cyan-200">Active Staff</p>
              <p className="mt-2 text-2xl font-black text-white">{dashboard?.totals.staffActive || 0}</p>
            </div>

            <div className="rounded-2xl border border-purple-400/20 bg-purple-500/10 p-4">
              <PackageCheck className="h-5 w-5 text-purple-300" />
              <p className="mt-3 text-xs font-black uppercase tracking-widest text-purple-200">Order Updates</p>
              <p className="mt-2 text-2xl font-black text-white">{dashboard?.totals.orderUpdates || 0}</p>
            </div>

            <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
              <Terminal className="h-5 w-5 text-yellow-300" />
              <p className="mt-3 text-xs font-black uppercase tracking-widest text-yellow-200">MC Queued</p>
              <p className="mt-2 text-2xl font-black text-white">{dashboard?.totals.minecraftQueued || 0}</p>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              <p className="mt-3 text-xs font-black uppercase tracking-widest text-emerald-200">Completed</p>
              <p className="mt-2 text-2xl font-black text-white">{dashboard?.totals.minecraftCompleted || 0}</p>
            </div>

            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
              <XCircle className="h-5 w-5 text-red-300" />
              <p className="mt-3 text-xs font-black uppercase tracking-widest text-red-200">Failed</p>
              <p className="mt-2 text-2xl font-black text-white">{dashboard?.totals.minecraftFailed || 0}</p>
            </div>

            <div className="rounded-2xl border border-gray-400/20 bg-gray-500/10 p-4">
              <AlertTriangle className="h-5 w-5 text-gray-300" />
              <p className="mt-3 text-xs font-black uppercase tracking-widest text-gray-200">Cancelled</p>
              <p className="mt-2 text-2xl font-black text-white">{dashboard?.totals.minecraftCancelled || 0}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div>
              <h3 className="mb-3 text-xl font-black text-white">Staff Scoreboard</h3>

              <div className="grid gap-4">
                {topStaff.map((staff) => (
                  <article
                    key={staff.key}
                    className="rounded-[2rem] border border-cyan-500/20 bg-white/[0.06] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-5 w-5 text-cyan-300" />
                          <h4 className="text-xl font-black text-white">{staff.displayName}</h4>
                        </div>
                        <p className="mt-1 text-xs font-black uppercase tracking-widest text-gray-500">
                          {staff.role}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-right">
                        <p className="text-xs font-black uppercase tracking-widest text-cyan-200">Total</p>
                        <p className="text-2xl font-black text-white">{staff.totalActions}</p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                      <Stat label="Verified" value={staff.ordersVerified} />
                      <Stat label="Delivered" value={staff.ordersDelivered} />
                      <Stat label="Rejected" value={staff.ordersRejected} />
                      <Stat label="Queued MC" value={staff.minecraftQueued} />
                      <Stat label="Done MC" value={staff.minecraftCompleted} />
                      <Stat label="Failed MC" value={staff.minecraftFailed} />
                    </div>

                    <p className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                      <Clock3 className="h-3.5 w-3.5" />
                      Last activity: {staff.lastActivity ? new Date(staff.lastActivity).toLocaleString() : "N/A"}
                    </p>
                  </article>
                ))}

                {topStaff.length === 0 && (
                  <div className="rounded-[2rem] border border-cyan-500/20 bg-white/[0.02] p-10 text-center text-gray-400">
                    No staff activity found yet.
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-xl font-black text-white">Recent Activity</h3>

              <div className="grid max-h-[780px] gap-3 overflow-y-auto pr-1">
                {(dashboard?.events || []).map((event) => (
                  <article
                    key={event.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`rounded-full p-2 ${
                        event.type === "order"
                          ? "bg-purple-500/15 text-purple-200"
                          : "bg-yellow-500/15 text-yellow-200"
                      }`}>
                        {event.type === "order" ? <PackageCheck className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-black text-white">{event.title}</p>
                        <p className="mt-1 text-sm text-gray-300">{event.subtitle}</p>
                        <p className="mt-2 text-xs text-gray-500">
                          {event.staffName} • {new Date(event.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}

                {(dashboard?.events || []).length === 0 && (
                  <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-8 text-center text-gray-400">
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
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}
