import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import RouteScrollToTop from "./components/ui/RouteScrollToTop";

const HomePage = lazy(() => import("./pages/HomePage"));
const MarketplacePage = lazy(() => import("./pages/MarketplacePage"));
const VotePage = lazy(() => import("./pages/VotePage"));
const DiscordPage = lazy(() => import("./pages/DiscordPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const TrackOrderPage = lazy(() => import("./pages/TrackOrderPage"));
const PlayerProfilePage = lazy(() => import("./pages/PlayerProfilePage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030014] text-white">
      <div className="rounded-3xl border border-purple-500/25 bg-white/[0.06] px-8 py-6 text-center shadow-[0_0_60px_rgba(168,85,247,0.25)] backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-300">
          Ellipsis SMP
        </p>
        <p className="mt-3 text-lg font-black">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteScrollToTop />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/vote" element={<VotePage />} />
          <Route path="/discord" element={<DiscordPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/track" element={<TrackOrderPage />} />
          <Route path="/profile" element={<PlayerProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
