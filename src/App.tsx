import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import AdsBanner from "./components/AdsBanner";
import Programs from "./components/Programs";
import About from "./components/About";
import Leaders from "./components/Leaders";
import JoinCTA from "./components/JoinCTA";
import NewsSection from "./components/NewsSection";
import GallerySection from "./components/GallerySection";
import Footer from "./components/Footer";
import Modals from "./components/Modals";
import { ProgramItem, NewsArticle } from "./types";
import { CMSProvider, useCMS } from "./context/CMSContext";
import CMSDashboard from "./components/CMSDashboard";
import DigitalServices from "./components/DigitalServices";
import AICopilot from "./components/AICopilot";

function MainAppContent() {
  // Modal states
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<ProgramItem | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);

  // Back to Top button visibility
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { isCmsOpen, menuStatus, theme } = useCMS();

  useEffect(() => {
    // Listen to custom cross-modal redirection events
    const handleOpenJoin = () => {
      setIsJoinOpen(true);
    };

    window.addEventListener("open-join-modal", handleOpenJoin);

    // Monitor scroll to toggle back to top button
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("open-join-modal", handleOpenJoin);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleScrollToSection = (targetId: string) => {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const offset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  if (isCmsOpen) {
    return (
      <>
        <CMSDashboard />
        <AICopilot />
      </>
    );
  }

  return (
    <div className={`relative min-h-screen flex flex-col justify-between overflow-x-hidden transition-all duration-500 selection:bg-emerald-100 selection:text-emerald-800 ${
      theme === "dark"
        ? "bg-[#010a04] text-emerald-100/90 dark"
        : "bg-gradient-to-b from-[#FFFFFF] via-[#FDFDFD] to-[#F7FAF8] text-slate-800"
    }`}>
      
      {/* Soft colorful background blobs matching the reference design layout */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute top-[8%] -left-[10%] w-[650px] h-[650px] bg-amber-400/8 rounded-full blur-[130px]" />
        <div className="absolute top-[28%] -right-[15%] w-[700px] h-[700px] bg-emerald-400/10 rounded-full blur-[140px]" />
        <div className="absolute top-[52%] -left-[12%] w-[680px] h-[680px] bg-rose-400/6 rounded-full blur-[130px]" />
        <div className="absolute top-[75%] -right-[10%] w-[650px] h-[650px] bg-sky-400/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-[2%] left-[10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[130px]" />
      </div>

      {/* HEADER NAVBAR */}
      <Navbar onJoinClick={() => setIsJoinOpen(true)} />

      {/* CORE BODY SECTIONS */}
      <main className="flex-grow">
        
        {/* Hero Banner Section */}
        <Hero
          onJoinClick={() => setIsJoinOpen(true)}
          onAboutClick={() => handleScrollToSection("tentang-kami")}
          onVideoClick={() => setIsVideoOpen(true)}
        />

        {/* Responsive Ads Placement Banner */}
        <AdsBanner />

        {/* Core Programs Action Cards */}
        {menuStatus.programs && (
          <Programs onProgramSelect={(item) => setSelectedProgram(item)} />
        )}

        {/* Digital Services (Kaderisasi and E-Persuratan) */}
        {(menuStatus.kaderisasi || menuStatus.alumni || menuStatus.epersuratan) && (
          <DigitalServices />
        )}

        {/* About Organization Profile Section */}
        {menuStatus.about && (
          <About onVideoClick={() => setIsVideoOpen(true)} />
        )}

        {/* Structural Organogram Pimpinan Section */}
        {menuStatus.leaders && (
          <Leaders />
        )}

        {/* Call-to-Action Membership Banner */}
        <JoinCTA onJoinClick={() => setIsJoinOpen(true)} />

        {/* News Desk List Feed */}
        {menuStatus.news && (
          <NewsSection onNewsSelect={(article) => setSelectedNews(article)} />
        )}

        {/* Photo Gallery Grid */}
        {menuStatus.gallery && (
          <GallerySection />
        )}

      </main>

      {/* MASTER FOOTER */}
      <Footer />

      {/* COMBINED MODALS LAYERS */}
      <Modals
        isJoinOpen={isJoinOpen}
        onJoinClose={() => setIsJoinOpen(false)}
        selectedProgram={selectedProgram}
        onProgramClose={() => setSelectedProgram(null)}
        isVideoOpen={isVideoOpen}
        onVideoClose={() => setIsVideoOpen(false)}
        selectedNews={selectedNews}
        onNewsClose={() => setSelectedNews(null)}
      />

      {/* FLOATING KEMBALI KE ATAS (BACK TO TOP) BUTTON */}
      {showScrollTop && (
        <button
          type="button"
          onClick={handleScrollToTop}
          className="fixed bottom-24 right-6 z-35 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white w-10 h-10 rounded-full shadow-2xl border border-emerald-500/20 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:translate-y-[-2px] cursor-pointer pointer-events-auto"
          title="Kembali ke Atas"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-4 h-4 scroll-smooth" />
        </button>
      )}

      {/* AI COPILOT CHATBOT FOR CS ASSISTANCE */}
      <AICopilot />


    </div>
  );
}

export default function App() {
  return (
    <CMSProvider>
      <MainAppContent />
    </CMSProvider>
  );
}
