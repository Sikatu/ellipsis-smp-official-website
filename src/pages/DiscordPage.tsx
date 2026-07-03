import PageShell from "./PageShell";
import Discord from "../components/sections/Discord";
import PageHero from "../components/ui/PageHero";
import GlassPanel from "../components/ui/GlassPanel";
import SectionDivider from "../components/ui/SectionDivider";
import CallToAction from "../components/ui/CallToAction";

const communityCards = [
  ["Support", "Ask questions, request help, and reach the team when you need guidance."],
  ["Announcements", "Stay updated with server news, changes, events, and important notices."],
  ["Events", "Join community activities, seasonal moments, and server-wide experiences."],
  ["Tickets", "A support-first structure ready for future ticketing upgrades."],
];

function DiscordPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Community Hub"
        title="Discord is where Ellipsis SMP feels alive."
        description="The server does not end when you log off. Join Discord for support, announcements, tickets, events, community updates, and player interaction."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid items-stretch gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {communityCards.map(([title, description]) => (
              <GlassPanel
                key={title}
                className="p-6 transition hover:-translate-y-1 hover:border-blue-300/40 hover:bg-blue-400/[0.08]"
              >
                <p className="text-2xl font-black text-white">{title}</p>
                <p className="mt-3 text-sm leading-6 text-gray-300">
                  {description}
                </p>
              </GlassPanel>
            ))}
          </div>

          <GlassPanel className="relative overflow-hidden p-8 md:p-10">
            <div className="absolute bottom-[-6rem] right-[-6rem] h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
            <p className="relative text-xs font-black uppercase tracking-[0.28em] text-blue-300">
              Beyond Gameplay
            </p>
            <h2 className="relative mt-5 text-4xl font-black leading-tight text-white md:text-6xl">
              Meet players before you meet them in-game.
            </h2>
            <p className="relative mt-5 text-sm leading-7 text-gray-300 md:text-base">
              Discord is the community layer of Ellipsis SMP. It connects
              players, staff, announcements, support, tickets, and updates in
              one active space.
            </p>
          </GlassPanel>
        </div>
      </section>

      <SectionDivider />

      <Discord />

      <CallToAction
        eyebrow="Stay Connected"
        title="Become part of the Ellipsis SMP community."
        description="Join the Discord, meet other players, follow announcements, and stay connected with the full server experience."
        primaryLabel="Visit Marketplace"
        primaryHref="/marketplace"
        secondaryLabel="Learn About Ellipsis"
        secondaryHref="/about"
      />
    </PageShell>
  );
}

export default DiscordPage;