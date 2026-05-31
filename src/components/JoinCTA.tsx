import { Sparkles, Send, Users, ShieldAlert, Award } from "lucide-react";

interface JoinCTAProps {
  onJoinClick: () => void;
}

export default function JoinCTA({ onJoinClick }: JoinCTAProps) {
  return (
    <div id="gabung-section" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Container Banner with Rounded Corners & Background Photo */}
      <div className="relative rounded-3xl overflow-hidden bg-emerald-950 p-8 sm:p-12 lg:p-14 shadow-[0_24px_50px_rgba(2,110,50,0.15)] border border-emerald-800/40 z-10">
        
        {/* Background Overlays */}
        <div className="absolute inset-0 z-0 opacity-[0.05] mix-blend-luminosity scale-105 pointer-events-none select-none">
          <img
            src="https://img.youtube.com/vi/A_Ff8XpxtwA/maxresdefault.jpg"
            alt="GP Ansor Members Roster"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        
        {/* Dynamic deep warm dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#011408] via-emerald-950 to-[#02240e] opacity-95 z-0 pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] z-0 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
          
          {/* Left Column: Core Badge and Big Display Title + 3 modern bullets */}
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/10 bg-white/5 text-white text-[10px] tracking-[0.25em] font-extrabold uppercase rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              COLLECTIVE INVOLVEMENT
            </span>
            <h3 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
              Membangun Generasi Muda <br />
              <span className="italic font-serif text-emerald-400 font-normal">Kader Pergerakan Abad 21</span>
            </h3>

            {/* 3 Demographic Perks Panels */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Users className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Kolaborasi</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal font-sans font-medium">Jejaring sinergis pemuda profesional & cendekiawan.</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Award className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Portofolio</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal font-sans font-medium">Inkubator wirausaha, loka karya & akademi karier.</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Integritas</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal font-sans font-medium">Spiritualitas Ahlussunnah wal Jama'ah yang adaptif.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Explanatory summary text and Capsule Button */}
          <div className="lg:col-span-5 space-y-6 lg:pl-4">
            <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed font-semibold font-sans">
              Bersama kita kokoh, bersama kita memberi manfaat bagi sesama umat. Ayo berkontribusi secara nyata, tingkatkan kepemimpinan, dan bangun warisan sosial berkelanjutan di Kabupaten Bogor.
            </p>
            <button
              type="button"
              id="cta-join-trigger"
              onClick={onJoinClick}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-[11px] tracking-widest uppercase rounded-full font-bold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 border border-emerald-400/20"
            >
              Gabung Sekarang
              <Send className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
