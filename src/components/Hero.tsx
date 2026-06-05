import { Play, ArrowRight, Instagram, Facebook, Youtube, Activity } from "lucide-react";
import { motion } from "motion/react";
import AnsorLogo from "./AnsorLogo";
import { useCMS } from "../context/CMSContext";

interface HeroProps {
  onJoinClick: () => void;
  onAboutClick: () => void;
  onVideoClick: () => void;
}

export default function Hero({ onJoinClick, onAboutClick, onVideoClick }: HeroProps) {
  const { heroConfig, impactStats } = useCMS();

  return (
    <section
      id="beranda"
      className="relative min-h-[95vh] sm:min-h-screen flex flex-col justify-center pt-32 pb-20 overflow-hidden bg-transparent text-emerald-950"
    >
      {/* Immersive Atmospheric Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {/* Colorful glowing ambient blobs matching the reference design */}
        <div className="absolute -top-[10%] -left-[5%] w-[600px] h-[600px] bg-amber-400/8 rounded-full blur-[140px]" />
        <div className="absolute top-[35%] -right-[10%] w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-[5%] left-[20%] w-[500px] h-[500px] bg-rose-400/5 rounded-full blur-[150px]" />
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.025)_1px,transparent_1px)] [background-size:24px_24px] opacity-80" />
      </div>

       <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT: Texts and core branding CTAs */}
          <div className="lg:col-span-12 text-left space-y-8">
            
            {/* Berkhidmat | Bersatu | Berdaya Tag */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block"
            >
              <span className="inline-block px-4 py-1.5 border border-emerald-500/20 bg-emerald-50/70 backdrop-blur-md text-emerald-700 text-[10px] tracking-[0.25em] font-extrabold uppercase rounded-full shadow-xs">
                BERKHIDMAT  •  BERSATU  •  BERDAYA
              </span>
            </motion.div>

            {/* Giant Dynamic Display Title */}
            <div className="space-y-4">
              <motion.h2
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="font-display font-light text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[1] text-emerald-950"
              >
                {heroConfig.titleLine1} <span className="italic font-serif text-emerald-600 font-normal">{heroConfig.titleAnsorGold}</span>
              </motion.h2>
              <motion.h2
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight uppercase leading-[1] text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-emerald-650 to-teal-600 drop-shadow-sm"
              >
                {heroConfig.titleLine2}
              </motion.h2>
            </div>

            {/* Subtitle brief */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-emerald-900/70 text-sm sm:text-base max-w-xl leading-relaxed font-sans font-semibold"
            >
              {heroConfig.subtitle}
            </motion.p>

            {/* CTA action buttons */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <button
                type="button"
                id="hero-about-trigger"
                onClick={onAboutClick}
                className="px-6 py-3 border border-emerald-550/20 bg-white/90 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50 text-[11px] tracking-widest uppercase rounded-full font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 group shadow-[0_4px_20px_0_rgba(16,185,129,0.04)]"
              >
                Tentang Kami
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 text-emerald-650" />
              </button>

              <button
                type="button"
                id="hero-video-trigger"
                onClick={onVideoClick}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] tracking-widest uppercase rounded-full font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 shadow-[0_8px_25px_0_rgba(16,185,129,0.15)] hover:shadow-emerald-500/20 border border-emerald-500/20"
              >
                <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-white p-[1px]">
                  <Play className="w-2 h-2 fill-current text-white" />
                </div>
                Lihat Kegiatan PC
              </button>
            </motion.div>

          </div>

        </div>

        {/* ORGANIZATIONAL PORTFOLIO METRICS / IMPACT DASHBOARD BAR FOR 20-40 AGE GROUP */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-10 border-t border-emerald-500/10"
        >
          {impactStats.map((stat) => (
            <div key={stat.id} className="p-5 rounded-2xl bg-white/90 backdrop-blur-sm border border-emerald-550/10 hover:border-emerald-500/30 hover:bg-white transition-all duration-300 text-left space-y-1 shadow-[0_4px_20px_0_rgba(16,185,129,0.02)] hover:shadow-lg">
              <h4 className="font-display font-light text-3xl sm:text-4xl text-emerald-600">{stat.value}</h4>
              <p className="text-[10px] text-emerald-800 uppercase tracking-widest font-extrabold">{stat.label}</p>
              <p className="text-[10px] text-slate-500 font-semibold">{stat.description}</p>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
