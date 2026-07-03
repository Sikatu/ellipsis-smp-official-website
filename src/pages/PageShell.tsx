import { type ReactNode } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import BackgroundGlow from "../components/ui/BackgroundGlow";
import ScrollProgressBar from "../components/ui/ScrollProgressBar";
import ScrollToTop from "../components/ui/ScrollToTop";
import SocialHub from "../components/ui/SocialHub";

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#030014] text-white">
      <ScrollProgressBar />
      <BackgroundGlow />
      <Navbar />
      <main>{children}</main>
      <SocialHub />
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default PageShell;
