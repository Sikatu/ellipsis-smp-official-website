import { Link } from "react-router-dom";

type CallToActionProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

function CallToAction({
  eyebrow,
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: CallToActionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="rounded-[1.75rem] border border-purple-500/25 bg-gradient-to-br from-purple-950/40 via-black/60 to-blue-950/30 p-5 text-center shadow-[0_0_70px_rgba(168,85,247,0.18)] backdrop-blur-xl sm:rounded-[2rem] sm:p-8 md:p-12">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-300">
          {eyebrow}
        </p>

        <h2 className="mt-4 break-words text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">
          {title}
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-300 md:text-base">
          {description}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to={primaryHref}
            className="rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-sm font-black text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] transition hover:scale-[1.02]"
          >
            {primaryLabel}
          </Link>

          {secondaryLabel && secondaryHref && (
            <Link
              to={secondaryHref}
              className="rounded-2xl border border-purple-500/30 bg-white/[0.06] px-6 py-4 text-sm font-black text-purple-100 transition hover:bg-white/[0.1]"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default CallToAction;
