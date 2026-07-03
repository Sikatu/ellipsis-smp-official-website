import { ExternalLink, Globe2, MessageCircle, Music2, Play } from "lucide-react";
import { discordInviteUrl, socialLinks } from "../../data/links";
import RevealSection from "./RevealSection";

const socials = [
  { label: "Discord", href: discordInviteUrl, icon: MessageCircle },
  { label: "TikTok", href: socialLinks.tiktok, icon: Music2 },
  { label: "Facebook", href: socialLinks.facebook, icon: Globe2 },
  { label: "YouTube", href: socialLinks.youtube, icon: Play },
];

function SocialHub() {
  return (
    <RevealSection>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-5 rounded-[2rem] border border-purple-500/20 bg-white/[0.055] p-5 shadow-[0_0_45px_rgba(168,85,247,0.12)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-purple-300">
              Follow Ellipsis SMP
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              Stay connected beyond the server.
            </h2>
            <p className="mt-1 text-sm text-gray-300">
              Follow updates, community moments, media, and announcements.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {socials.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-black/30 px-4 py-3 text-sm font-black text-purple-100 transition hover:-translate-y-0.5 hover:border-purple-300/50 hover:bg-white/[0.09]"
                >
                  <Icon className="h-4 w-4 transition group-hover:scale-110" />
                  {item.label}
                  <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </RevealSection>
  );
}

export default SocialHub;
