import type { AdminProfile } from "../../types/admin";
import { getAdminDisplayName, roleDescriptions } from "../../lib/adminPermissions";

type AdminStaffPanelProps = {
  profile: AdminProfile | null;
};

export function AdminStaffPanel({ profile }: AdminStaffPanelProps) {
  const roles = [
    ["owner", "Owner", roleDescriptions.owner],
    ["manager", "Manager", roleDescriptions.manager],
    ["support", "Support", roleDescriptions.support],
  ];

  return (
    <section className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[2rem] border border-blue-500/20 bg-blue-500/[0.06] p-6">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-300">
          Staff Center
        </p>
        <h2 className="mt-3 text-2xl font-black text-white">
          {getAdminDisplayName(profile)}
        </h2>
        <p className="mt-2 text-sm text-gray-300">
          Current role: <span className="font-black uppercase text-blue-200">{profile?.role || "loading"}</span>
        </p>
        <p className="mt-4 text-sm leading-6 text-gray-300">
          Staff management currently supports owner approval and role-based permissions.
          Future upgrades can add staff activity summaries, workload tracking, and action history by staff.
        </p>
      </div>

      <div className="grid gap-3">
        {roles.map(([key, title, description]) => (
          <div
            key={key}
            className="rounded-2xl border border-purple-500/20 bg-white/[0.045] p-5"
          >
            <p className="text-xs font-black uppercase tracking-widest text-purple-300">
              {title}
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-300">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
