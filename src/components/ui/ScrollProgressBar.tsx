import { useEffect, useState } from "react";

function ScrollProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        function updateProgress() {
            const scrollTop = window.scrollY;
            const pageHeight =
                document.documentElement.scrollHeight - window.innerHeight;

            setProgress(pageHeight > 0 ? (scrollTop / pageHeight) * 100 : 0);
        }

        updateProgress();
        window.addEventListener("scroll", updateProgress);

        return () => window.removeEventListener("scroll", updateProgress);
    }, []);

    return (
        <div className="fixed left-0 top-0 z-[60] h-1 w-full bg-transparent">
            <div
                className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-yellow-400 shadow-[0_0_18px_rgba(168,85,247,0.75)] transition-[width] duration-150"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}

export default ScrollProgressBar;