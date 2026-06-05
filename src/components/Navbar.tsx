import { useState, useEffect } from "react";
import { Menu, X, Moon, Sun } from "lucide-react";
import AnsorLogo from "./AnsorLogo";
import { useCMS } from "../context/CMSContext";

interface NavbarProps {
  onJoinClick: () => void;
}

export default function Navbar({ onJoinClick }: NavbarProps) {
  const { isCmsOpen, setIsCmsOpen, heroConfig, menuStatus, menuLabels, theme, toggleTheme } = useCMS();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("beranda");

  // Track scroll position to style navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Simple active link tracker
      const sections = ["beranda", "kaderisasi-section", "epersuratan-section", "tentang-kami", "program", "berita", "galeri"];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: menuLabels?.beranda || "Beranda", target: "beranda", enabled: true },
    { label: menuLabels?.kaderisasi || "Kaderisasi", target: "kaderisasi-section", enabled: menuStatus.kaderisasi },
    { label: menuLabels?.epersuratan || "E-Persuratan", target: "epersuratan-section", enabled: menuStatus.epersuratan },
    { label: menuLabels?.about || "Tentang Kami", target: "tentang-kami", enabled: menuStatus.about },
    { label: menuLabels?.programs || "Program", target: "program", enabled: menuStatus.programs },
    { label: menuLabels?.news || "Berita", target: "berita", enabled: menuStatus.news },
    { label: menuLabels?.gallery || "Galeri", target: "galeri", enabled: menuStatus.gallery },
  ].filter((link) => link.enabled);


  const handleScrollTo = (targetId: string) => {
    setIsOpen(false);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const offset = 80; // height of navbar
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <nav
      id="main-navigation"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        theme === "dark"
          ? isScrolled
            ? "bg-[#010e05]/90 backdrop-blur-md shadow-[0_8px_32px_0_rgba(2,130,67,0.15)] border-b border-emerald-500/20 py-3"
            : "bg-gradient-to-b from-[#010e05]/95 via-[#010e05]/60 to-transparent py-5"
          : isScrolled
            ? "bg-white/80 backdrop-blur-md shadow-[0_8px_32px_0_rgba(16,185,129,0.05)] border-b border-emerald-500/10 py-3"
            : "bg-gradient-to-b from-white/90 via-white/50 to-transparent py-5"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* LOGO AREA */}
          <div
            onClick={() => handleScrollTo("beranda")}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            {/* Handcrafted GP Ansor Logo Emblem */}
            <div className="relative w-9 h-9 flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
              {heroConfig.customLogoUrl ? (
                <img
                  src={heroConfig.customLogoUrl}
                  alt="Logo GP Ansor"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <AnsorLogo className="w-full h-full filter drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]" />
              )}
            </div>
            
            {/* Logo text */}
            <div className="text-left leading-tight">
              <span className={`block text-[8px] font-extrabold tracking-[0.25em] uppercase transition-colors duration-300 ${theme === 'dark' ? 'text-emerald-400' : isScrolled ? 'text-emerald-700' : 'text-emerald-600'}`}>
                Pimpinan Cabang
              </span>
              <h1 className={`font-display font-medium text-xs sm:text-sm tracking-widest uppercase transition-colors ${theme === 'dark' ? 'text-white' : 'text-emerald-950'}`}>
                GP ANSOR <span className={`font-light ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-800'}`}>KAB. BOGOR</span>
              </h1>
            </div>
          </div>

          {/* DESKTOP NAVIGATION LINKS */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.target}
                  type="button"
                  id={`nav-${link.target}`}
                  onClick={() => handleScrollTo(link.target)}
                  className={`px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] font-bold transition-all duration-300 cursor-pointer rounded-full ${
                    activeSection === link.target
                      ? theme === 'dark'
                        ? "text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 shadow-xs"
                        : "text-emerald-700 bg-emerald-150/60 border border-emerald-500/20 shadow-xs"
                      : theme === 'dark'
                        ? "text-emerald-100/85 hover:text-white hover:bg-emerald-950/30 border border-transparent"
                        : "text-emerald-900/80 hover:text-emerald-955 hover:bg-emerald-50/70 border border-transparent"
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="h-4 w-[1px] bg-emerald-500/15" />

            {/* THEME TOGGLE FOR DESKTOP */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3.5 py-1.5 border border-slate-200/80 hover:border-slate-300 dark:border-emerald-800/40 dark:hover:border-emerald-600/60 bg-white/40 dark:bg-emerald-950/25 text-slate-700 dark:text-emerald-100/90 text-[11px] uppercase tracking-wider font-bold rounded-xl transition-all duration-300 shadow-xs hover:scale-102 hover:bg-slate-50 dark:hover:bg-emerald-950/40 cursor-pointer active:scale-95"
              aria-label="Toggle dark/light theme"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>

          {/* MOBILE TOGGLE HAMBURGER */}
          <div className="flex lg:hidden items-center gap-2.5">
            {/* THEME TOGGLE FOR MOBILE (Sticky) */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200/80 dark:border-emerald-800/40 bg-white/40 dark:bg-emerald-950/25 text-slate-700 dark:text-emerald-100/95 text-[11px] font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
              aria-label="Toggle theme mobile"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-3 h-3 text-amber-500 animate-spin-slow" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3 h-3 text-slate-500" />
                  <span>Dark</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-emerald-800 hover:text-emerald-950 dark:text-emerald-300 dark:hover:text-emerald-100 p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 focus:outline-none transition-all cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE DRAWER */}
      {isOpen && (
        <div className={`lg:hidden absolute top-full left-0 right-0 border-b backdrop-blur-2xl py-4 px-6 shadow-2xl transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-[#010e05]/95 border-emerald-550/15'
            : 'bg-white/95 border-emerald-555/15'
        }`}>
          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => (
              <button
                key={link.target}
                type="button"
                onClick={() => handleScrollTo(link.target)}
                className={`w-full text-left py-2.5 px-4 rounded-lg text-xs tracking-widest uppercase transition-all ${
                  activeSection === link.target
                    ? theme === 'dark'
                      ? "text-emerald-305 bg-emerald-950/65 font-extrabold border border-emerald-500/20"
                      : "text-emerald-700 bg-emerald-50 font-extrabold border border-emerald-500/10"
                    : theme === 'dark'
                      ? "text-emerald-150 hover:text-white hover:bg-emerald-950/30"
                      : "text-emerald-900 hover:text-emerald-955 hover:bg-emerald-50/50"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
