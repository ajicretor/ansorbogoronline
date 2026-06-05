import { useState, useEffect } from "react";
import { ArrowUp, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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

  // Registration type preselection state for direct modal pathways
  const [initialJoinType, setInitialJoinType] = useState<"select" | "member" | "kaderisasi">("select");

  // Pop-up brochure/pamphlet states
  const [showPromoPopup, setShowPromoPopup] = useState(false);

  // Back to Top button visibility
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { isCmsOpen, menuStatus, theme, officialPamphlet, news } = useCMS();

  // Deep linking and URL handler for dedicated news articles on direct load
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith("/news/")) {
      const newsId = path.split("/").pop();
      if (newsId && news && news.length > 0) {
        const found = news.find((item) => item.id === newsId);
        if (found) {
          setSelectedNews(found);
        }
      }
    }
  }, [news]);

  useEffect(() => {
    // Listen to custom cross-modal redirection events
    const handleOpenJoin = () => {
      setInitialJoinType("kaderisasi");
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

  // Real-time reader analytics tracker
  useEffect(() => {
    fetch("/api/analytics/hit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: "landing",
        title: "Landing Page Utama GP Ansor Bogor",
        referrer: document.referrer
      })
    }).catch(err => console.error("Analytics hit error:", err));
  }, []);

  useEffect(() => {
    if (selectedNews) {
      const newsPath = `/news/${selectedNews.id}`;
      if (window.location.pathname !== newsPath) {
        window.history.pushState(null, "", newsPath);
      }

      fetch("/api/analytics/hit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: newsPath,
          title: selectedNews.title,
          referrer: document.referrer
        })
      }).catch(err => console.error("Analytics news hit error:", err));
    }
  }, [selectedNews]);

  useEffect(() => {
    // Show promo popup if pamphlet exists and hasn't been shown in this window session
    if (officialPamphlet) {
      const hasShown = sessionStorage.getItem("ansor_bogor_promo_popup_shown");
      if (!hasShown) {
        // Safe timeout delay for fluid visual appearance
        const timer = setTimeout(() => {
          setShowPromoPopup(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [officialPamphlet]);

  useEffect(() => {
    // Auto-close floating banner after 60 seconds
    if (showPromoPopup) {
      const timer = setTimeout(() => {
        handleClosePromoPopup();
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [showPromoPopup]);

  const handleClosePromoPopup = () => {
    setShowPromoPopup(false);
    sessionStorage.setItem("ansor_bogor_promo_popup_shown", "true");
  };

  const handlePromoPopupClick = () => {
    sessionStorage.setItem("ansor_bogor_promo_popup_shown", "true");
    setShowPromoPopup(false);
    setInitialJoinType("kaderisasi");
    setIsJoinOpen(true);
  };

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
    return <CMSDashboard />;
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
        onJoinClose={() => {
          setIsJoinOpen(false);
          setInitialJoinType("select");
        }}
        initialRegType={initialJoinType}
        selectedProgram={selectedProgram}
        onProgramClose={() => setSelectedProgram(null)}
        isVideoOpen={isVideoOpen}
        onVideoClose={() => setIsVideoOpen(false)}
        selectedNews={selectedNews}
        onNewsClose={() => {
          setSelectedNews(null);
          if (window.location.pathname.startsWith("/news/")) {
            window.history.pushState(null, "", "/");
          }
        }}
      />

      {/* PAMPHLET ACTIVITY FLOATING BANNER */}
      <AnimatePresence>
        {showPromoPopup && officialPamphlet && (
          <div className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-[90] pointer-events-auto">
            {/* Main Floating Banner Card (240x440px) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, x: -60, y: 60 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -60, y: 60 }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="relative w-[240px] h-[440px] rounded-2xl overflow-hidden shadow-[0_12px_45px_rgba(0,0,0,0.75)] border-2 border-emerald-500/40 bg-[#010a03] group cursor-pointer"
              onClick={handlePromoPopupClick}
            >
              <div className="w-full h-full overflow-hidden p-2.5 pb-15 flex items-center justify-center bg-[#010903]">
                <img
                  src={officialPamphlet}
                  alt="Pamflet Kegiatan Resmi PC GP Ansor"
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-full object-contain rounded-lg border border-emerald-500/25 shadow-md transition-all duration-700 ease-out group-hover:scale-105"
                />
              </div>

              {/* Hover overlay hint */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/95 to-transparent p-4 pb-3.5 text-center font-sans">
                <p className="text-ansor-gold text-[8px] font-bold tracking-widest uppercase mb-0.5 font-mono">Daftar Kaderisasi</p>
                <h3 className="text-white text-[11px] font-bold tracking-tight font-sans leading-tight">Ketuk di Sini untuk Mendaftar</h3>
              </div>

              {/* Top Close indicator/button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // Avoid triggering redirection
                  handleClosePromoPopup();
                }}
                className="absolute top-2.5 right-2.5 bg-black/80 hover:bg-black text-white/95 hover:text-white w-7 h-7 rounded-full border border-white/10 flex items-center justify-center transition-all cursor-pointer pointer-events-auto z-20 shadow-xl hover:scale-110"
                title="Tutup Pamflet"
                id="close-promo-popup"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* 60 Seconds Timer visual progress line at the top */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-white/20 z-10 overflow-hidden">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 60, ease: "linear" }}
                  className="h-full bg-gradient-to-r from-emerald-450 to-teal-400"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
