import PageShell from "./PageShell";
import GlassPanel from "../components/ui/GlassPanel";
import { LinkButton } from "../components/ui/Button";

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
              <LinkButton to="/" size="md" className="py-4">
                Back Home
              </LinkButton>

              <LinkButton to="/marketplace" variant="secondary" size="md" className="py-4">
                Visit Marketplace
              </LinkButton>
            </div>
          </GlassPanel>
        </div>
      </section>
    </PageShell>
  );
}

export default NotFoundPage;
