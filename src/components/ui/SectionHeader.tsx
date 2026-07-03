type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      {eyebrow && (
        <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-300">
          {eyebrow}
        </p>
      )}

      <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
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
