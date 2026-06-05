import { MapPin, Phone, Mail, Globe, Instagram, Facebook, Youtube, Bot } from "lucide-react";
import AnsorLogo from "./AnsorLogo";
import { useCMS } from "../context/CMSContext";

export default function Footer() {
  const { heroConfig, contactConfig, setIsCmsOpen } = useCMS();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="main-footer"
      className="bg-slate-950 text-slate-400 pt-16 pb-8 border-t border-slate-900 relative z-10 font-sans"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Columns Grid - Split into 2 elegant sections: Brand Info & Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 border-b border-slate-900 pb-10">
          
          {/* Col 1: Brand Info Column (Takes 7/12 width for description) */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="flex items-center gap-3">
              {/* Brand Logo */}
              <div className="relative w-10 h-10 flex-shrink-0">
                {heroConfig.customLogoUrl ? (
                  <img
                    src={heroConfig.customLogoUrl}
                    alt="Logo GP Ansor"
                    className="w-full h-full object-contain filter drop-shadow-md"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <AnsorLogo className="w-full h-full drop-shadow-md" />
                )}
              </div>

              <div className="text-left leading-tight text-white">
                <span className="block text-[9px] text-emerald-450 tracking-[0.2em] uppercase font-bold">
                  Pimpinan Cabang
                </span>
                <h4 className="font-display font-medium text-sm tracking-widest uppercase">
                  GP ANSOR <span className="font-light text-slate-500">KAB. BOGOR</span>
                </h4>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
              Bergerak bersama umat, berkhidmat untuk bangsa. Membangun generasi muda Nahdlatul Ulama yang berkarakter kokoh, rukun, berdaulat, dan berdaya saing tinggi.
            </p>

            {/* Social linkages rounded buttons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={contactConfig.instagram || "https://instagram.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900/30 hover:bg-emerald-600 hover:text-white transition-colors flex items-center justify-center border border-slate-800 group"
                aria-label="Instagram Page"
              >
                <Instagram className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
              </a>
              <a
                href={contactConfig.facebook || "https://facebook.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900/30 hover:bg-emerald-600 hover:text-white transition-colors flex items-center justify-center border border-slate-800 group"
                aria-label="Facebook Page"
              >
                <Facebook className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
              </a>
              <a
                href={contactConfig.youtube || "https://youtube.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900/30 hover:bg-emerald-600 hover:text-white transition-colors flex items-center justify-center border border-slate-800 group"
                aria-label="Youtube Channel"
              >
                <Youtube className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
              </a>
              <a
                href={contactConfig.tiktok || "https://tiktok.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900/30 hover:bg-emerald-600 hover:text-white transition-colors flex items-center justify-center border border-slate-800 group"
                aria-label="TikTok Page"
              >
                <svg
                  className="w-3.5 h-3.5 text-slate-400 fill-current group-hover:text-white transition-colors"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.09-1.43-.88-.6-1.61-1.4-2.11-2.34-.15-.28-.27-.58-.38-.88v7.54c.04 1.25-.19 2.53-.78 3.63-.61 1.18-1.67 2.14-2.93 2.65-1.57.65-3.37.7-4.98.15-1.55-.51-2.92-1.58-3.72-3.03-1.04-1.84-.96-4.27.18-6.02.93-1.47 2.56-2.46 4.31-2.61.94-.09 1.89.05 2.76.45v4.11c-.56-.25-1.18-.36-1.79-.29-.87.08-1.71.55-2.23 1.26-.64.84-.71 2.05-.18 2.93.51.87 1.5 1.39 2.5 1.34 1.05-.04 2-.72 2.33-1.72.19-.54.23-1.11.22-1.67V0h-.16z" />
                </svg>
              </a>

              {/* Bot CMS trigger button styled exactly like the user's reference logo */}
              <button
                type="button"
                onClick={() => setIsCmsOpen(true)}
                className="w-8 h-8 rounded-full bg-slate-900/30 hover:bg-[#1e9fe9] hover:border-[#1e9fe9] hover:text-white hover:shadow-md hover:shadow-sky-500/10 transition-all duration-300 active:scale-95 flex items-center justify-center cursor-pointer border border-slate-800 group"
                title="Kontrol CMS / Admin Panel"
              >
                <Bot className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors duration-300" />
              </button>
            </div>
          </div>

          {/* Col 2: Contact links (Takes remaining 5/12 width for detailed spacing) */}
          <div className="lg:col-span-5 text-left space-y-4 md:pl-10">
            <h5 className="font-display font-semibold text-white tracking-widest text-[10px] uppercase mb-5 border-l-2 border-emerald-500 pl-2.5">
              Kontak Kami
            </h5>
            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-400 font-sans">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{contactConfig.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>{contactConfig.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="select-all">{contactConfig.email}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>{contactConfig.website}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright Line */}
        <div className="pt-8 text-center text-[11px] text-slate-500 font-sans border-t border-slate-900/10">
          <p>© {currentYear} PC GP Ansor Kabupaten Bogor. Hak Cipta Dilindungi.</p>
        </div>

      </div>
    </footer>
  );
}
