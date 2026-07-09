import { type ReactNode } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import BackgroundGlow from "../components/ui/BackgroundGlow";
import ScrollProgressBar from "../components/ui/ScrollProgressBar";
import ScrollToTop from "../components/ui/ScrollToTop";
import SocialHub from "../components/ui/SocialHub";
import { useSeo } from "../hooks/useSeo";

type PageShellProps = {
  children: ReactNode;
  seo?: {
    title: string;
    description: string;
    path: string;
    noindex?: boolean;
  };
};

function PageShell({ children, seo }: PageShellProps) {
  useSeo(
    seo || {
      title: "Ellipsis SMP | Premium Crossplay Minecraft SMP Server",
      description:
        "Join Ellipsis SMP, a premium crossplay Minecraft SMP server built for community, progression, custom content, cosmetics, voting rewards, and adventure.",
      path: "/",
    },
  );

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
