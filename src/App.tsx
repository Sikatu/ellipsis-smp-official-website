import { lazy, Suspense } from "react";
import Navbar from "./components/layout/Navbar";
import Hero from "./components/sections/Hero";

const Footer = lazy(() => import("./components/layout/Footer"));
const About = lazy(() => import("./components/sections/About"));
const Discord = lazy(() => import("./components/sections/Discord"));
const Featured = lazy(() => import("./components/sections/Featured"));
const Features = lazy(() => import("./components/sections/Features"));
const GameplayShowcase = lazy(() => import("./components/sections/GameplayShowcase"));
const OfficialVideo = lazy(() => import("./components/sections/OfficialVideo"));
const RankProgression = lazy(() => import("./components/sections/RankProgression"));
const RulesFAQ = lazy(() => import("./components/sections/RulesFAQ"));
const ServerStats = lazy(() => import("./components/sections/ServerStats"));
const StaffRanks = lazy(() => import("./components/sections/StaffRanks"));
const Store = lazy(() => import("./components/sections/Store"));
const Vote = lazy(() => import("./components/sections/Vote"));
const BackgroundGlow = lazy(() => import("./components/ui/BackgroundGlow"));
const ScrollProgressBar = lazy(() => import("./components/ui/ScrollProgressBar"));
const ScrollToTop = lazy(() => import("./components/ui/ScrollToTop"));

function App() {
  return (
    <div className="relative bg-[#030014] text-white">
      <Navbar />
      <Hero />

      <Suspense fallback={null}>
        <ScrollProgressBar />
        <BackgroundGlow />
        <About />
        <OfficialVideo />
        <Featured />
        <GameplayShowcase />
        <ServerStats />
        <RankProgression />
        <StaffRanks />
        <RulesFAQ />
        <Features />
        <Store />
        <Vote />
        <Discord />
        <Footer />
        <ScrollToTop />
      </Suspense>
    </div>
  );
}

export default App;
