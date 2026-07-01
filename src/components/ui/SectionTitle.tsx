type SectionTitleProps = {
    label: string;
    title: string;
    description: string;
    accent?: "purple" | "blue" | "gold" | "pink";
};

const accentClasses = {
    purple: "text-purple-400",
    blue: "text-blue-400",
    gold: "text-yellow-300",
    pink: "text-pink-300",
};

function SectionTitle({
    label,
    title,
    description,
    accent = "purple",
}: SectionTitleProps) {
    return (
        <div className="mb-14 text-center">
            <p className={`mb-3 text-sm font-bold uppercase tracking-[0.3em] ${accentClasses[accent]}`}>
                {label}
            </p>
            <h2 className="text-4xl font-black md:text-6xl">{title}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-400">{description}</p>
        </div>
    );
}

export default SectionTitle;