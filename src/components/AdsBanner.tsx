import { useCMS } from "../context/CMSContext";
import { Megaphone } from "lucide-react";

export default function AdsBanner() {
  const { adsConfig } = useCMS();

  if (!adsConfig || !adsConfig.enabled) {
    return null;
  }

  const hasScript = !!adsConfig.scriptCode?.trim();

  return (
    <div className="w-full max-w-[728px] mx-auto my-3 sm:my-4 px-4 font-sans">
      <div className="relative group overflow-hidden bg-slate-950 rounded-xl border border-emerald-500/10 shadow-lg shadow-emerald-950/10 transition-all duration-300 hover:border-emerald-500/20 w-full h-[90px] flex items-center justify-center">
        
        {/* Decorative Top tag */}
        <div className="absolute top-0 right-4 bg-emerald-800 text-white text-[8px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded-b-md z-10 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <Megaphone className="w-2.5 h-2.5 text-emerald-300" />
          Kemitraan
        </div>

        {hasScript ? (
          <div className="w-full h-full flex justify-center items-center overflow-hidden">
            <iframe
              srcDoc={`
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <style>
                      html, body {
                        margin: 0;
                        padding: 0;
                        width: 100%;
                        height: 100%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        background: transparent;
                        overflow: hidden;
                      }
                    </style>
                  </head>
                  <body>
                    ${adsConfig.scriptCode}
                  </body>
                </html>
              `}
              width="728"
              height="90"
              style={{ border: "none", overflow: "hidden", maxWidth: "100%", height: "90px" }}
              title="Ansor Bogor Ads Partner Hub"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <div 
            className="w-full h-full bg-gradient-to-r from-emerald-950/90 to-slate-950 flex flex-col items-center justify-center text-center px-4 cursor-pointer hover:bg-emerald-950/70 transition-colors"
            onClick={() => {
              // Smooth scroll to footer/contact or open WhatsApp if they click the placeholder
              const contactElement = document.getElementById("hubungi-kami") || document.getElementById("contact");
              if (contactElement) {
                contactElement.scrollIntoView({ behavior: "smooth" });
              } else {
                window.open("https://wa.me/628123456789", "_blank");
              }
            }}
          >
            <span className="text-sm md:text-base font-bold tracking-wide text-emerald-300 group-hover:text-amber-300 transition-colors">
              Butuh space iklan, hubungi admin
            </span>
            <span className="text-[10px] text-neutral-400 mt-1">
              <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8464064075635048"
               crossorigin="anonymous"></script>
              // Klik di sini untuk pasang banner iklan kemitraan strategis Sahabat!
            </span>
          </div>
        )}

      </div>
    </div>
  );
}

