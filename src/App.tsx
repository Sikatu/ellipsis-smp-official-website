import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import Navbar from "./components/layout/Navbar";
import Hero from "./components/sections/Hero";
import BackgroundGlow from "./components/ui/BackgroundGlow";
import ScrollProgressBar from "./components/ui/ScrollProgressBar";
import ScrollToTop from "./components/ui/ScrollToTop";

const About = lazy(() => import("./components/sections/About"));
const OfficialVideo = lazy(() => import("./components/sections/OfficialVideo"));
const Featured = lazy(() => import("./components/sections/Featured"));
const GameplayShowcase = lazy(() => import("./components/sections/GameplayShowcase"));
const ServerStats = lazy(() => import("./components/sections/ServerStats"));
const RankProgression = lazy(() => import("./components/sections/RankProgression"));
const StaffRanks = lazy(() => import("./components/sections/StaffRanks"));
const RulesFAQ = lazy(() => import("./components/sections/RulesFAQ"));
const Features = lazy(() => import("./components/sections/Features"));
const Store = lazy(() => import("./components/sections/Store"));
const Vote = lazy(() => import("./components/sections/Vote"));
const Discord = lazy(() => import("./components/sections/Discord"));
const Footer = lazy(() => import("./components/layout/Footer"));

function LazyOnVisible({
  children,
  minHeight = "360px",
}: {
  children: ReactNode;
  minHeight?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current || visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "700px" }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={ref} style={{ minHeight: visible ? undefined : minHeight }}>
      {visible ? <Suspense fallback={null}>{children}</Suspense> : null}
    </div>
  );
}

function App() {
  return (
    <div className="relative bg-[#030014] text-white">
      <ScrollProgressBar />
      <BackgroundGlow />
      <Navbar />
      <Hero />

      <LazyOnVisible><About /></LazyOnVisible>
      <LazyOnVisible><OfficialVideo /></LazyOnVisible>
      <LazyOnVisible><Featured /></LazyOnVisible>
      <LazyOnVisible><GameplayShowcase /></LazyOnVisible>
      <LazyOnVisible><ServerStats /></LazyOnVisible>
      <LazyOnVisible><RankProgression /></LazyOnVisible>
      <LazyOnVisible><StaffRanks /></LazyOnVisible>
      <LazyOnVisible><RulesFAQ /></LazyOnVisible>
      <LazyOnVisible><Features /></LazyOnVisible>
      <LazyOnVisible><Store /></LazyOnVisible>
      <LazyOnVisible><Vote /></LazyOnVisible>
      <LazyOnVisible><Discord /></LazyOnVisible>
      <LazyOnVisible minHeight="220px"><Footer /></LazyOnVisible>

      <ScrollToTop />
    </div>
  );
}

export default App;