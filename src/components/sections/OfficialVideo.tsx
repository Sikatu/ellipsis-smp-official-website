import { PlayCircle } from "lucide-react";
import { useState } from "react";
import SectionHeader from "../ui/SectionHeader";

function OfficialVideo() {
    const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

    return (
        <section id="video" className="relative px-4 py-20 sm:px-6">
            <div className="mx-auto max-w-6xl">
                <SectionHeader
                    eyebrow="Official Trailer"
                    title="Watch the Ellipsis SMP Trailer"
                    description="Get a quick look at the world, gameplay, and survival experience waiting for you."
                />

                <div className="mt-10 overflow-hidden rounded-2xl border border-purple-500/30 bg-black shadow-[0_0_60px_rgba(168,85,247,0.25)] sm:rounded-3xl">
                    {shouldLoadVideo ? (
                        <video
                            controls
                            autoPlay
                            playsInline
                            preload="metadata"
                            poster="/images/showcase/spawn.webp"
                            className="aspect-video w-full bg-black object-contain"
                        >
                            <source src="/ellipsis-trailer.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShouldLoadVideo(true)}
                            className="group relative block aspect-video w-full overflow-hidden bg-black text-left"
                            aria-label="Load and play the Ellipsis SMP trailer"
                        >
                            <img
                                src="/images/showcase/spawn.webp"
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-95"
                            />
                            <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                            <span className="absolute inset-0 flex items-center justify-center p-4">
                                <span className="inline-flex items-center gap-3 rounded-2xl border border-purple-300/40 bg-black/70 px-5 py-4 text-sm font-black text-white shadow-[0_0_35px_rgba(168,85,247,0.35)] backdrop-blur-xl transition group-hover:scale-[1.03] sm:px-7">
                                    <PlayCircle className="h-6 w-6 text-purple-200" />
                                    Watch Trailer
                                </span>
                            </span>
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}

export default OfficialVideo;
