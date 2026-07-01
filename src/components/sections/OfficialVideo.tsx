import { motion } from "framer-motion";
import { PlayCircle, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import SectionTitle from "../ui/SectionTitle";

function OfficialVideo() {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const video = videoRef.current;

        if (!video) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    video.play().catch(() => {
                        // Browser may block autoplay if settings require manual interaction.
                    });
                } else {
                    video.pause();
                }
            },
            {
                threshold: 0.45,
            }
        );

        observer.observe(video);

        return () => observer.disconnect();
    }, []);

    return (
        <section id="trailer" className="bg-transparent px-6 py-24 text-white">
            <div className="mx-auto max-w-7xl">
                <SectionTitle
                    label="Official Trailer"
                    title="Watch the Ellipsis SMP Experience"
                    description="Get a cinematic preview of the world, community, and custom survival experience waiting for you."
                    accent="gold"
                />

                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-[2rem] border border-purple-500/25 bg-white/5 p-3 shadow-[0_0_60px_rgba(168,85,247,0.22)] backdrop-blur"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_35%)]" />

                    <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
                        <video
                            ref={videoRef}
                            src="/ellipsis-trailer.mp4"
                            controls
                            controlsList="nodownload noplaybackrate"
                            disablePictureInPicture
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            className="aspect-video w-full bg-black object-cover"
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>

                    <div className="relative mt-5 flex flex-col gap-3 px-2 pb-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-yellow-300">
                            <Sparkles className="h-4 w-4" />
                            Ellipsis SMP Official Video
                        </p>

                        <p className="flex items-center gap-2 text-sm text-gray-400">
                            <PlayCircle className="h-4 w-4 text-purple-300" />
                            Auto-plays while visible
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default OfficialVideo;