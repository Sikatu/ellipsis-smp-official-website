import { motion } from "framer-motion";

function LoadingScreen() {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-[#030014] text-white"
        >
            <div className="flex flex-col items-center">
                <motion.img
                    src="/ellipsis-logo-384.webp"
                    alt="Ellipsis SMP"
                    width="384"
                    height="384"
                    className="h-40 w-auto drop-shadow-[0_0_70px_rgba(168,85,247,0.95)]"
                    animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                />

                <p className="mt-6 text-sm font-black uppercase tracking-[0.3em] text-purple-300">
                    Loading Ellipsis SMP
                </p>
            </div>
        </motion.div>
    );
}

export default LoadingScreen;
