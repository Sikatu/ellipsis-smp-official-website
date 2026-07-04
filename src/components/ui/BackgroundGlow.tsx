import { motion, useReducedMotion } from "framer-motion";

const stars = Array.from({ length: 30 }, (_, index) => {
    const left = (index * 37) % 100;
    const top = (index * 61) % 100;

    return {
        id: index,
        left: `${left}%`,
        top: `${top}%`,
        size: index % 4 === 0 ? "h-1.5 w-1.5" : "h-1 w-1",
        delay: (index % 7) * 0.35,
    };
});

function BackgroundGlow() {
    const shouldReduceMotion = useReducedMotion();

    return (
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#030014]">
            <motion.div
                className="absolute left-1/2 top-0 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-purple-700/30 blur-[100px] sm:h-[520px] sm:w-[520px] sm:blur-[130px]"
                animate={
                    shouldReduceMotion
                        ? undefined
                        : { scale: [1, 1.15, 1], opacity: [0.45, 0.7, 0.45] }
                }
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
                className="absolute right-0 top-1/3 h-[300px] w-[300px] rounded-full bg-blue-600/20 blur-[100px] sm:h-[440px] sm:w-[440px] sm:blur-[130px]"
                animate={
                    shouldReduceMotion
                        ? undefined
                        : { scale: [1, 1.2, 1], opacity: [0.35, 0.6, 0.35] }
                }
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
                className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-yellow-500/10 blur-[100px] sm:h-[440px] sm:w-[440px] sm:blur-[130px]"
                animate={
                    shouldReduceMotion
                        ? undefined
                        : { scale: [1, 1.18, 1], opacity: [0.25, 0.45, 0.25] }
                }
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px]" />

            {stars.map((star) => (
                <motion.span
                    key={star.id}
                    className={`absolute rounded-full bg-white/70 ${star.size}`}
                    style={{ left: star.left, top: star.top }}
                    animate={
                        shouldReduceMotion
                            ? undefined
                            : { opacity: [0.15, 0.9, 0.15], scale: [1, 1.6, 1] }
                    }
                    transition={{
                        duration: 3,
                        delay: star.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}

export default BackgroundGlow;
