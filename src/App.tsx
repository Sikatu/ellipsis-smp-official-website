import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import About from "./components/sections/About";
import Discord from "./components/sections/Discord";
import Featured from "./components/sections/Featured";
import Features from "./components/sections/Features";
import GameplayShowcase from "./components/sections/GameplayShowcase";
import Hero from "./components/sections/Hero";
import OfficialVideo from "./components/sections/OfficialVideo";
import RankProgression from "./components/sections/RankProgression";
import RulesFAQ from "./components/sections/RulesFAQ";
import ServerStats from "./components/sections/ServerStats";
import StaffRanks from "./components/sections/StaffRanks";
import Store from "./components/sections/Store";
import Vote from "./components/sections/Vote";
import BackgroundGlow from "./components/ui/BackgroundGlow";
import ScrollProgressBar from "./components/ui/ScrollProgressBar";
import ScrollToTop from "./components/ui/ScrollToTop";

function App() {
  return (
    <div className="relative bg-[#030014] text-white">
      <ScrollProgressBar />
      <BackgroundGlow />
      <Navbar />
      <Hero />
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
    </div>
  );
}

export default App;