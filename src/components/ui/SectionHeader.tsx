import { type ReactNode } from "react";

export type SectionHeaderTone = "purple" | "blue" | "gold" | "pink";

type SectionHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  tone?: SectionHeaderTone;
};

const toneClasses: Record<SectionHeaderTone, string> = {
  purple: "text-purple-300",
  blue: "text-blue-300",
  gold: "text-yellow-300",
  pink: "text-pink-300",
};

function SectionHeader({ eyebrow, title, description, tone = "purple" }: SectionHeaderProps) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      {eyebrow && (
        <p className={`text-xs font-black uppercase tracking-[0.25em] ${toneClasses[tone]}`}>
          {eyebrow}
        </p>
      )}

      <h2 className="mt-3 break-words text-3xl font-black leading-tight text-white sm:text-4xl md:text-6xl">
        {title}
      </h2>

      {description && (
        <p className="mt-4 text-sm leading-7 text-gray-300 md:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeader;
