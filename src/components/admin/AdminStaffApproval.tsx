import { useState } from "react";
import { MailPlus } from "lucide-react";
import { approveAdminEmail } from "../../services/admin";
import type { AdminRole } from "../../types/admin";

import { canApproveStaff } from "../../lib/adminPermissions";

type AdminStaffApprovalProps = {
  userRole?: AdminRole | null;
};

const roles: { label: string; value: AdminRole; description: string }[] = [
  { label: "Owner", value: "owner", description: "Full access and staff approval." },
  { label: "Manager", value: "manager", description: "Verify, deliver, reject, and add notes." },
  { label: "Support", value: "support", description: "View orders, receipts, and support info." },
];

export function AdminStaffApproval({ userRole }: AdminStaffApprovalProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AdminRole>("support");
  const [inviteMessage, setInviteMessage] = useState("");

  if (!canApproveStaff(userRole)) return null;

  async function handleApprove() {
    setInviteMessage("");
    const { error, normalizedEmail } = await approveAdminEmail(inviteEmail, inviteRole, userRole);

    if (error) {
      setInviteMessage(error.message);
      return;
    }

    if (normalizedEmail) {
      setInviteMessage(`Approved ${normalizedEmail} as ${inviteRole}.`);
      setInviteEmail("");
      setInviteRole("support");
    }
  }

  return (
    <div className="mt-6 rounded-[1.75rem] border border-blue-400/20 bg-blue-500/10 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-blue-300">
            Owner Staff Approval
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            Approve a staff email
          </h2>
          <p className="mt-2 text-sm text-blue-100/80">
            Staff can register first. Approve their email here to unlock
            dashboard access.
          </p>
        </div>

        <div className="grid flex-1 gap-3 lg:max-w-2xl lg:grid-cols-[1fr_150px_auto]">
          <input
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
            placeholder="staff@email.com"
            className="rounded-2xl border border-blue-400/25 bg-black/35 px-4 py-3 text-white outline-none"
          />
          <select
            value={inviteRole}
            onChange={(event) => setInviteRole(event.target.value as AdminRole)}
            className="rounded-2xl border border-blue-400/25 bg-black/35 px-4 py-3 text-white outline-none"
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleApprove}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500/25 px-5 py-3 font-black text-blue-100 transition hover:bg-blue-500/35"
          >
            <MailPlus className="h-4 w-4" />
            Approve
          </button>
        </div>
      </div>

      {inviteMessage && (
        <p className="mt-4 rounded-2xl border border-blue-300/20 bg-black/20 p-3 text-sm font-bold text-blue-100">
          {inviteMessage}
        </p>
      )}
    </div>
  );
}
