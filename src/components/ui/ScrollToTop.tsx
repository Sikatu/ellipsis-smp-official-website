import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        function handleScroll() {
            setIsVisible(window.scrollY > 600);
        }

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (!isVisible) return null;

    return (
        <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll back to top"
            className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/40 bg-black/70 text-purple-200 shadow-[0_0_30px_rgba(168,85,247,0.35)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-purple-500/20 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
        >
            <ArrowUp className="h-5 w-5" />
        </button>
    );
}

export default ScrollToTop;