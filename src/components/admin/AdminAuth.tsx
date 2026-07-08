import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Session } from "@supabase/supabase-js";
import { KeyRound, Lock, UserPlus } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { requestPendingProfile } from "../../services/admin";
import Button from "../ui/Button";
import type { AccessState, AuthMode } from "../../types/admin";

type AdminAuthProps = {
  authMode: AuthMode;
  setAuthMode: Dispatch<SetStateAction<AuthMode>>;
  accessState: AccessState;
  setAccessState: Dispatch<SetStateAction<AccessState>>;
  setSession: Dispatch<SetStateAction<Session | null>>;
  verifyAdminAccess: (session: Session) => Promise<void>;
};

function getAccessMessage(accessState: AccessState) {
  if (accessState === "pending") return "Your admin account exists, but it is waiting for owner approval.";
  if (accessState === "rejected") return "This admin account is not approved. Contact the owner if this is a mistake.";
  if (accessState === "setup") return "Admin approval tables are not set up yet. Run the Admin 3.0 SQL setup in Supabase first.";
  return "";
}

export function AdminAuth({
  authMode,
  setAuthMode,
  accessState,
  setAccessState,
  setSession,
  verifyAdminAccess,
}: AdminAuthProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function login() {
    setAuthLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setAuthLoading(false);

    if (error || !data.session) {
      setMessage(error?.message || "Login failed.");
      return;
    }

    setSession(data.session);
    await verifyAdminAccess(data.session);
  }

  async function register() {
    setAuthLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          display_name: displayName.trim(),
        },
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });

    setAuthLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data.session) {
      setSession(data.session);
      await requestPendingProfile(data.session, displayName);
      await verifyAdminAccess(data.session);
      return;
    }

    setAccessState("signed-out");
    setAuthMode("login");
    setMessage("Account created. Check your email if confirmation is required, then ask the owner to approve your admin access.");
  }

  const accessMessage = getAccessMessage(accessState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#030014] px-4 py-10 text-white">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-purple-500/25 bg-white/[0.06] p-8 shadow-[0_0_60px_rgba(168,85,247,0.25)]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-200">
            <Lock className="h-7 w-7" />
          </div>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-purple-300">
            Ellipsis SMP Admin
          </p>
          <h1 className="mt-4 text-3xl font-black">
            {authMode === "login" ? "Staff Login" : "Request Admin Access"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-300">
            Staff may create their own credentials, but admin access only
            activates after the owner approves their email and role.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-purple-500/20 bg-black/35 p-1">
            {[
              ["login", "Login"],
              ["register", "Request Access"],
            ].map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setAuthMode(mode as AuthMode);
                  setMessage("");
                }}
                className={`rounded-xl px-3 py-3 text-sm font-black transition ${
                  authMode === mode
                    ? "bg-purple-500/25 text-white"
                    : "text-purple-200 hover:bg-white/[0.06]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {authMode === "register" && (
              <input
                className="w-full rounded-2xl border border-purple-500/25 bg-black/40 px-4 py-3 text-white outline-none focus:border-purple-300"
                placeholder="Display name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            )}

            <input
              className="w-full rounded-2xl border border-purple-500/25 bg-black/40 px-4 py-3 text-white outline-none focus:border-purple-300"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <input
              className="w-full rounded-2xl border border-purple-500/25 bg-black/40 px-4 py-3 text-white outline-none focus:border-purple-300"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <Button
              onClick={authMode === "login" ? login : register}
              disabled={authLoading || accessState === "checking"}
              size="lg"
              fullWidth
            >
              {authMode === "login" ? (
                <KeyRound className="h-4 w-4" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {authLoading || accessState === "checking"
                ? "Please wait..."
                : authMode === "login"
                  ? "Login"
                  : "Create Account"}
            </Button>

            {(message || accessMessage) && (
              <div className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-4 text-sm font-bold text-yellow-100">
                {message || accessMessage}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-purple-500/20 bg-white/[0.045] p-8">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-300">
            Safe Admin Flow
          </p>
          <h2 className="mt-4 text-3xl font-black text-white">
            Staff can create credentials. Access still stays protected.
          </h2>

          <div className="mt-6 grid gap-3">
            {[
              ["1", "Staff creates account", "They use email and password on this page."],
              ["2", "Owner approves email", "Approval happens from Supabase or the owner panel."],
              ["3", "Role controls access", "Owner, manager, and support have different permissions."],
            ].map(([step, title, description]) => (
              <div
                key={step}
                className="rounded-2xl border border-purple-500/20 bg-black/30 p-4"
              >
                <p className="text-xs font-black uppercase text-purple-300">
                  Step {step}
                </p>
                <h3 className="mt-2 font-black text-white">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-gray-300">
                  {description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm leading-6 text-red-100">
            No one gets admin dashboard access just because they signed up.
            They must be approved in the admin profile table first.
          </div>
        </div>
      </div>
    </main>
  );
}
