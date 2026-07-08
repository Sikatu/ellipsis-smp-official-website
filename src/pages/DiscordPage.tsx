import {
  ArrowRight,
  Bell,
  BookOpen,
  CheckCircle2,
  Crown,
  ExternalLink,
  Globe2,
  Megaphone,
  MessageCircle,
  Music2,
  PlayCircle,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageShell from "./PageShell";
import Discord from "../components/sections/Discord";
import PageHero from "../components/ui/PageHero";
import GlassPanel from "../components/ui/GlassPanel";
import GradientText from "../components/ui/GradientText";
import SectionDivider from "../components/ui/SectionDivider";
import CallToAction from "../components/ui/CallToAction";
import {
  discordInviteUrl,
  socialLinks,
} from "../data/links";

const communityStats = [
  { icon: MessageCircle, label: "Main Hub", value: "Discord" },
  { icon: Ticket, label: "Support", value: "Tickets" },
  { icon: Bell, label: "Updates", value: "Announcements" },
  { icon: Users, label: "Players", value: "Community" },
];

const supportRoutes = [
  {
    icon: Ticket,
    title: "Open a Ticket",
    description:
      "Use tickets for purchases, rank questions, crate support, furniture, plushies, rewards, and account help.",
    href: "/tickets",
    internal: true,
    action: "Open ticket",
    tone: "border-yellow-400/25 bg-yellow-400/10 text-yellow-100",
  },
  {
    icon: MessageCircle,
    title: "Join Discord",
    description:
      "Join the main server hub for announcements, community chat, support, and event updates.",
    href: discordInviteUrl,
    internal: false,
    action: "Join now",
    tone: "border-purple-400/25 bg-purple-500/10 text-purple-100",
  },
];

const communityUses = [
  {
    icon: Megaphone,
    title: "Announcements",
    description: "Follow server updates, changes, events, downtime notices, and important staff posts.",
  },
  {
    icon: ReceiptText,
    title: "Order Support",
    description: "Use support routes when a receipt, order, rank, crate, or delivery needs review.",
  },
  {
    icon: Crown,
    title: "Community Events",
    description: "Keep up with seasonal events, giveaways, milestones, and group activities.",
  },
  {
    icon: BookOpen,
    title: "New Player Help",
    description: "Ask questions, learn server systems, and get pointed toward the right next step.",
  },
  {
    icon: ShieldCheck,
    title: "Staff Guidance",
    description: "Reach staff through the proper channels instead of losing requests in public chat.",
  },
  {
    icon: Sparkles,
    title: "Content Updates",
    description: "See marketplace highlights, gameplay changes, social clips, and community moments.",
  },
];

const socialRoutes = [
  {
    icon: Music2,
    title: "TikTok",
    description: "Short clips, moments, and quick community highlights.",
    href: socialLinks.tiktok,
  },
  {
    icon: PlayCircle,
    title: "YouTube",
    description: "Videos, previews, and longer Ellipsis SMP updates.",
    href: socialLinks.youtube,
  },
  {
    icon: Globe2,
    title: "Facebook",
    description: "Community posts, announcements, and server presence.",
    href: socialLinks.facebook,
  },
];

const goodCommunityHabits = [
  "Use tickets for private support instead of public chat.",
  "Include your Minecraft username when asking for order help.",
  "Keep receipts until staff verifies and delivers your purchase.",
  "Watch announcements before asking about new updates.",
];

function DiscordPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Community 3.0"
        title={
          <>
            The official Discord hub for support, updates, and{" "}
            <GradientText tone="indigo">the Ellipsis community.</GradientText>
          </>
        }
        description="Join Discord to stay connected with announcements, tickets, events, staff support, social updates, and players beyond the Minecraft server."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {communityStats.map((item) => {
            const Icon = item.icon;

            return (
              <GlassPanel key={item.label} className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0 text-blue-200" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-blue-300">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-black text-white">
                      {item.value}
                    </p>
                  </div>
                </div>
              </GlassPanel>
            );
          })}
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-12 text-white sm:px-6 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
          <div className="grid gap-4">
            {supportRoutes.map((route) => {
              const Icon = route.icon;

              const content = (
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-black/35">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">
                        {route.title}
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-200">
                        {route.description}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black/35 px-5 py-3 text-sm font-black text-white">
                    {route.action}
                    {!route.internal && <ExternalLink className="h-4 w-4" />}
                  </span>
                </div>
              );

              if (route.internal) {
                return (
                  <Link
                    key={route.title}
                    to={route.href}
                    className={`group rounded-[1.5rem] border p-6 transition hover:-translate-y-1 hover:bg-white/[0.08] ${route.tone}`}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <a
                  key={route.title}
                  href={route.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`group rounded-[1.5rem] border p-6 transition hover:-translate-y-1 hover:bg-white/[0.08] ${route.tone}`}
                >
                  {content}
                </a>
              );
            })}
          </div>

          <GlassPanel className="relative overflow-hidden p-0">
            <div className="relative min-h-[420px]">
              <img
                src="/gameplay/community-moments.webp"
                alt="Ellipsis SMP community moments"
                loading="lazy"
                decoding="async"
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="text-xs font-black uppercase text-blue-200">
                  Beyond Gameplay
                </p>
                <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
                  Meet the community before you meet them in-game.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-300 sm:text-base">
                  Discord connects players, staff, support, tickets,
                  announcements, events, and updates in one official space.
                </p>
              </div>
            </div>
          </GlassPanel>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 text-white sm:px-6">
        <div className="mb-8 text-center">
          <p className="text-xs font-black uppercase text-blue-300">
            What Discord Is For
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
            One community hub, clear reasons to use it.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-300">
            Community 3.0 makes Discord feel like part of the official website
            experience, especially for support and returning players.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {communityUses.map((item) => {
            const Icon = item.icon;

            return (
              <GlassPanel
                key={item.title}
                className="p-6 transition hover:-translate-y-1 hover:border-blue-300/40 hover:bg-blue-400/[0.08]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-200">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-black text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-gray-300">
                  {item.description}
                </p>
              </GlassPanel>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 text-white sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <GlassPanel className="p-6 sm:p-8">
            <p className="text-xs font-black uppercase text-emerald-300">
              Better Support
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
              Help is easier when requests go to the right place.
            </h2>
            <div className="mt-6 grid gap-3">
              {goodCommunityHabits.map((habit) => (
                <div
                  key={habit}
                  className="flex items-start gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/10 px-4 py-3 text-sm leading-6 text-emerald-50"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  <span>{habit}</span>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-6 sm:p-8">
            <p className="text-xs font-black uppercase text-purple-300">
              Social Channels
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
              Follow Ellipsis outside Discord too.
            </h2>
            <div className="mt-6 grid gap-3">
              {socialRoutes.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.title}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between gap-4 rounded-2xl border border-purple-500/20 bg-white/[0.045] p-4 transition hover:border-purple-300/45 hover:bg-white/[0.08]"
                  >
                    <span className="flex items-center gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-200">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block font-black text-white">
                          {social.title}
                        </span>
                        <span className="mt-1 block text-sm leading-5 text-gray-300">
                          {social.description}
                        </span>
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-purple-200 transition group-hover:translate-x-1" />
                  </a>
                );
              })}
            </div>
          </GlassPanel>
        </div>
      </section>

      <SectionDivider />

      <Discord />

      <CallToAction
        eyebrow="Stay Connected"
        title="Become part of the Ellipsis SMP community."
        description="Join Discord, meet other players, follow announcements, and stay connected with the full server experience."
        primaryLabel="Visit Marketplace"
        primaryHref="/marketplace"
        secondaryLabel="Learn About Ellipsis"
        secondaryHref="/about"
      />
    </PageShell>
  );
}

export default DiscordPage;
