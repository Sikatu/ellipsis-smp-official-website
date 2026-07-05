type AdminSettingsPanelProps = {
  realtimeStatus: "connecting" | "live" | "error";
  lastUpdated: string;
  orderCount: number;
};

export function AdminSettingsPanel({
  realtimeStatus,
  lastUpdated,
  orderCount,
}: AdminSettingsPanelProps) {
  return (
    <section className="mt-6 grid gap-5 lg:grid-cols-3">
      <div className="rounded-[2rem] border border-purple-500/20 bg-white/[0.045] p-6">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-300">
          Realtime
        </p>
        <h3 className="mt-3 text-2xl font-black capitalize text-white">
          {realtimeStatus}
        </h3>
        <p className="mt-2 text-sm text-gray-400">
          Last updated: {lastUpdated || "N/A"}
        </p>
      </div>

      <div className="rounded-[2rem] border border-blue-500/20 bg-blue-500/[0.06] p-6">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-300">
          Orders Loaded
        </p>
        <h3 className="mt-3 text-2xl font-black text-white">
          {orderCount}
        </h3>
        <p className="mt-2 text-sm text-gray-400">
          Based on the current Supabase order query.
        </p>
      </div>

      <div className="rounded-[2rem] border border-yellow-400/20 bg-yellow-400/[0.06] p-6">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-300">
          Future Settings
        </p>
        <h3 className="mt-3 text-2xl font-black text-white">
          Control Center
        </h3>
        <p className="mt-2 text-sm leading-6 text-gray-300">
          Later this can manage webhook toggles, staff notification settings,
          delivery checklist rules, and Minecraft bridge controls.
        </p>
      </div>
    </section>
  );
}
