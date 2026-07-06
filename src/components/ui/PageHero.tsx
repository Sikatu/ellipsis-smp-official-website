import { type ReactNode } from "react";

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  children?: ReactNode;
};

function PageHero({ eyebrow, title, description, children }: PageHeroProps) {
  return (
    <section className="relative mx-auto max-w-7xl px-4 pb-10 pt-32 sm:px-6">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-purple-500/25 bg-white/[0.06] p-5 shadow-[0_0_70px_rgba(168,85,247,0.18)] backdrop-blur-xl sm:rounded-[2rem] sm:p-8 md:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_35%)]" />

        <div className="relative max-w-4xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-yellow-400/80 to-transparent" />
            <p className="text-xs font-black uppercase tracking-[0.28em] text-purple-300">
              {eyebrow}
            </p>
          </div>

          <h1 className="mt-5 break-words text-3xl font-black leading-tight text-white sm:text-4xl md:text-6xl">
            {title}
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-gray-300 md:text-lg">
            {description}
          </p>

          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
}

export default PageHero;
