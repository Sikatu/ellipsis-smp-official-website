import { Link } from "react-router-dom";
import PageShell from "./PageShell";
import GlassPanel from "../components/ui/GlassPanel";

function NotFoundPage() {
  return (
    <PageShell>
      <section className="flex min-h-[75vh] items-center px-4 py-32 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <GlassPanel className="p-8 md:p-12">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-purple-300">
              404
            </p>

            <h1 className="mt-5 text-4xl font-black text-white md:text-6xl">
              This path vanished into the void.
            </h1>

            <p className="mt-5 text-sm leading-7 text-gray-300 md:text-base">
              The page you are looking for does not exist or may have moved.
              Return to the official Ellipsis SMP experience.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/"
                className="rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-sm font-black text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] transition hover:scale-[1.02]"
              >
                Back Home
              </Link>

              <Link
                to="/marketplace"
                className="rounded-2xl border border-purple-500/30 bg-white/[0.06] px-6 py-4 text-sm font-black text-purple-100 transition hover:bg-white/[0.1]"
              >
                Visit Marketplace
              </Link>
            </div>
          </GlassPanel>
        </div>
      </section>
    </PageShell>
  );
}

export default NotFoundPage;
