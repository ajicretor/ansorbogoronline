import { useState } from "react";
import { Play, Check, ChevronDown, ChevronUp, Star, Laptop, Lightbulb, GraduationCap, Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCMS } from "../context/CMSContext";

interface AboutProps {
  onVideoClick: () => void;
}

export default function About({ onVideoClick }: AboutProps) {
  const { aboutConfig, strategicPillars } = useCMS();
  const [showMoreHistory, setShowMoreHistory] = useState(false);

  const renderPillarIcon = (name: string) => {
    switch (name) {
      case "Laptop":
        return <Laptop className="w-5 h-5 transition-colors group-hover:text-white" />;
      case "Lightbulb":
        return <Lightbulb className="w-5 h-5 transition-colors group-hover:text-white" />;
      case "GraduationCap":
        return <GraduationCap className="w-5 h-5 transition-colors group-hover:text-white" />;
      case "Heart":
        return <Heart className="w-5 h-5 transition-colors group-hover:text-white" />;
      default:
        return <Laptop className="w-5 h-5 transition-colors group-hover:text-white" />;
    }
  };

  return (
    <section id="tentang-kami" className="py-24 bg-transparent text-emerald-950 relative overflow-hidden border-b border-emerald-500/10">
      {/* Decorative ambient background overlays */}
      <div className="absolute top-[25%] -left-[10%] w-[450px] h-[450px] bg-emerald-555/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT: Video Player Card Overlay */}
          <div className="lg:col-span-12 xl:col-span-5 text-center relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              onClick={onVideoClick}
              className="relative cursor-pointer group rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] w-full border border-emerald-500/15 flex items-center justify-center bg-emerald-950"
            >
              {/* Photo of GP Ansor gathering */}
              <img
                src="https://img.youtube.com/vi/dsNIOwcqaM8/maxresdefault.jpg"
                alt="GP Ansor Kabupaten Bogor"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-85"
                referrerPolicy="no-referrer"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent transition-opacity duration-300" />

              {/* Glowing Pulse Play Button */}
              <div className="absolute flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 group-hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform scale-100 group-hover:scale-110 relative">
                  {/* Ripples */}
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-15" />
                  <Play className="w-5 h-5 fill-current translate-x-0.5" />
                </div>
                <span className="bg-slate-950/80 border border-white/5 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] tracking-wider uppercase text-white font-bold select-none transition-transform">
                  Putar Video Profil
                </span>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Organizational Profile Content */}
          <div className="lg:col-span-12 xl:col-span-7 text-left space-y-8">
            <div className="space-y-2">
              <span className="inline-block px-3 py-1.5 border border-emerald-555/20 bg-emerald-50 text-emerald-700 text-[10px] tracking-[0.25em] font-extrabold uppercase rounded-full">
                TENTANG KAMI
              </span>
              <h3 className="font-display font-light text-3xl sm:text-4xl text-emerald-950 tracking-tight leading-none pt-2">
                {aboutConfig.historyTitleLine} <span className="italic font-serif text-emerald-600 font-normal">{aboutConfig.historyTitleAnsor}</span>
              </h3>
            </div>

            <p className="text-emerald-900/80 leading-relaxed text-sm sm:text-base font-semibold font-sans">
              {aboutConfig.description}
            </p>

            {/* Checkmark Bullets List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {aboutConfig.keyGoals.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-emerald-100/80 border border-emerald-500/20 text-emerald-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    <Check className="w-3 h-3 stroke-[2.5px]" />
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-900/80 font-semibold leading-normal font-sans">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            {/* Expansive timeline story trigger */}
            <div className="pt-2">
              <button
                type="button"
                id="toggle-history"
                onClick={() => setShowMoreHistory(!showMoreHistory)}
                className="px-6 py-3 border border-emerald-500/25 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] tracking-widest uppercase rounded-full font-bold transition-all duration-305 cursor-pointer inline-flex items-center gap-2 shadow-sm"
              >
                {showMoreHistory ? "Sembunyikan Sejarah" : "Ketahui Sejarah Kami"}
                {showMoreHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Animated History Accordion */}
            <AnimatePresence>
              {showMoreHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white/95 backdrop-blur-md border border-emerald-550/15 rounded-2xl p-6 sm:p-8 mt-4 text-xs sm:text-sm text-emerald-950/80 font-semibold space-y-4 leading-relaxed shadow-lg">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold uppercase tracking-wider text-[11px]">
                      <Star className="w-3.5 h-3.5 fill-current text-emerald-600" />
                      <span>Lintas Sejarah Kejuangan</span>
                    </div>
                    <p className="font-sans">
                      {aboutConfig.historyParagraph1}
                    </p>
                    <p className="font-sans">
                      {aboutConfig.historyParagraph2}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* BENTO COLUMN STRATEGIC PILLARS GRID */}
        <div className="mt-24 space-y-6">
          <div className="text-center space-y-2">
            <span className="inline-block px-3 py-1.5 border border-emerald-500/20 bg-emerald-50 text-emerald-700 text-[9px] tracking-[0.25em] font-extrabold uppercase rounded-full shadow-xs">
              4 PILAR UTAMA GERAKAN DIGITAL
            </span>
            <h4 className="font-display font-light text-2xl sm:text-3xl text-emerald-950">
              Akselerasi Pengabdian <span className="italic font-serif text-emerald-600">Berkelanjutan</span>
            </h4>
            <p className="text-xs text-slate-500 max-w-lg mx-auto font-semibold font-sans">
              Menghubungkan inovasi sosial, teknologi digital, kepemimpinan modern, dan spiritualitas secara tangguh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
            {strategicPillars.map((pilar, idx) => (
              <div 
                key={idx} 
                className="p-6 rounded-2xl bg-white/90 backdrop-blur-md border border-emerald-550/12 hover:border-emerald-500/35 hover:bg-white transition-all duration-300 space-y-4 group text-left shadow-[0_4px_20px_0_rgba(16,185,129,0.02)] hover:shadow-xl hover:-translate-y-1"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-600 text-emerald-600 transition-all">
                  {renderPillarIcon(pilar.iconName)}
                </div>
                <div className="space-y-1">
                  <h5 className="font-display font-bold text-sm text-emerald-950 group-hover:text-emerald-700 transition-colors">
                    {pilar.title}
                  </h5>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold font-sans">
                    {pilar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
