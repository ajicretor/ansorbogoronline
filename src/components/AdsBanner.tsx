import { useCMS } from "../context/CMSContext";
import { Megaphone, ExternalLink } from "lucide-react";

export default function AdsBanner() {
  const { adsConfig } = useCMS();

  if (!adsConfig || !adsConfig.enabled) {
    return null;
  }

  // If there is an embed script configuration, prioritize rendering it in a secure sandbox
  if (adsConfig.scriptCode?.trim()) {
    return (
      <div className="w-full max-w-[970px] mx-auto my-3 sm:my-4 px-4 font-sans">
        <div className="relative group overflow-hidden bg-slate-950 rounded-2xl border border-emerald-500/10 shadow-lg shadow-emerald-950/10 transition-all duration-300 hover:border-emerald-500/20 flex flex-col items-center justify-center p-3 pt-5 pb-3">
          
          {/* Decorative Top tag */}
          <div className="absolute top-0 right-4 bg-emerald-800 text-white text-[8px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded-b-md z-10 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <Megaphone className="w-2.5 h-2.5 text-emerald-300" />
            Mitra Iklan
          </div>

          <div className="w-full overflow-hidden flex justify-center py-1">
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
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[970px] mx-auto my-3 sm:my-4 px-4 font-sans">
      <div className="relative group overflow-hidden bg-slate-950 rounded-2xl border border-emerald-500/10 shadow-lg shadow-emerald-950/10 transition-all duration-300 hover:border-emerald-500/20">
        
        {/* Decorative Top tag */}
        <div className="absolute top-0 right-4 bg-emerald-800 text-white text-[8px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded-b-md z-10 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <Megaphone className="w-2.5 h-2.5 text-emerald-300" />
          Kemitraan
        </div>

        <a 
          href={adsConfig.targetUrl || "#"} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full"
        >
          {/* Inner Aspect ratio container (970:150 ratio) */}
          <div className="relative w-full aspect-[970/150] min-h-[70px] md:h-[150px] overflow-hidden flex items-center justify-center">
            
            {adsConfig.imageUrl ? (
              <img 
                src={adsConfig.imageUrl} 
                alt={adsConfig.altText || "Iklan Kemitraan PC GP Ansor Bogor"}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover select-none transition-transform duration-700 group-hover:scale-102"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-emerald-900 to-emerald-950 flex flex-col items-center justify-center px-6 py-4 text-center text-white">
                <span className="text-sm md:text-xl font-bold tracking-wide text-emerald-300">
                  {adsConfig.altText || "Iklan Kemitraan PC GP Ansor Bogor"}
                </span>
                <span className="text-xs text-neutral-400 mt-2 flex items-center gap-1.5 justify-center">
                  Hubungi kami untuk kerja sama kemitraan strategis <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                </span>
              </div>
            )}

            {/* Subtle Overlay on hover */}
            <div className="absolute inset-0 bg-emerald-950/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="bg-slate-900/90 text-white text-xs font-bold tracking-wider uppercase px-4 py-2 rounded-full border border-white/10 shadow-lg flex items-center gap-2 scale-90 group-hover:scale-100 transition-transform duration-300">
                Kunjungi Situs Kemitraan <ExternalLink className="w-4 h-4 text-emerald-400" />
              </span>
            </div>

          </div>
        </a>

      </div>
    </div>
  );
}
