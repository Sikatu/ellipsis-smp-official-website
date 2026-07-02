import SectionTitle from "../ui/SectionTitle";

function OfficialVideo() {
    return (
        <section id="video" className="relative px-4 py-20 sm:px-6">
            <div className="mx-auto max-w-6xl">
                <SectionTitle
                    label="Official Trailer"
                    title="Watch the Ellipsis SMP Trailer"
                    description="Get a quick look at the world, gameplay, and survival experience waiting for you."
                />

                <div className="mt-10 overflow-hidden rounded-3xl border border-purple-500/30 bg-black shadow-[0_0_60px_rgba(168,85,247,0.25)]">
                    <video
                        controls
                        controlsList="nodownload noplaybackrate"
                        disablePictureInPicture
                        playsInline
                        preload="metadata"
                        poster="/ellipsis-logo-640.webp"
                        className="aspect-video w-full bg-black object-contain"
                    >
                        <source src="/ellipsis-trailer.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>
        </section>
    );
}

export default OfficialVideo;