import { useRef } from "react";
import { ChevronLeft, ChevronRight, ShieldCheck, HeartHandshake, BookOpen, TrendingUp, Flag, ArrowRight } from "lucide-react";
import { useCMS } from "../context/CMSContext";
import { ProgramItem } from "../types";

interface ProgramsProps {
  onProgramSelect: (item: ProgramItem) => void;
}

export default function Programs({ onProgramSelect }: ProgramsProps) {
  const { programs } = useCMS();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Map icon strings to Lucide components
  const getProgramIcon = (iconName: string) => {
    switch (iconName) {
      case "ShieldCheck":
        return <ShieldCheck className="w-5 h-5 text-white" />;
      case "HeartHandshake":
        return <HeartHandshake className="w-5 h-5 text-white" />;
      case "BookOpen":
        return <BookOpen className="w-5 h-5 text-white" />;
      case "TrendingUp":
        return <TrendingUp className="w-5 h-5 text-white" />;
      case "Flag":
        return <Flag className="w-5 h-5 text-white" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-white" />;
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <section id="program" className="pt-8 pb-20 bg-transparent relative overflow-hidden border-b border-emerald-500/10">
      {/* Immersive ambient glows */}
      <div className="absolute top-[40%] -left-[15%] w-[450px] h-[450px] bg-emerald-550/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] -right-[10%] w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[110px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title Header */}
        <div className="text-center relative mb-16">
          <span className="inline-block px-3 py-1.5 border border-emerald-600/20 bg-emerald-50 text-emerald-700 text-[10px] tracking-[0.25em] font-extrabold uppercase rounded-full">
            PROGRAM KERJA UTAMA
          </span>
          <h3 className="font-display font-light text-3xl sm:text-4xl text-emerald-950 tracking-tight mt-4">
            Aktivitas Strategis & <span className="italic font-serif text-emerald-600 font-normal">Karya Nyata</span>
          </h3>
          <p className="text-xs sm:text-sm text-emerald-800/70 max-w-xl mx-auto mt-3 font-semibold leading-relaxed font-sans">
            Mendedikasikan energi terbaik, kepemimpinan modern, dan gagasan inovatif bagi kemajuan pemuda serta ekosistem sosial di Kabupaten Bogor.
          </p>
        </div>

        {/* Carousel Container Wrapper with Slider Controls */}
        <div className="relative group/slider px-4">
          
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute left-[-16px] xl:left-[-24px] top-1/2 translate-y-[-50%] z-10 w-10 h-10 bg-white hover:bg-emerald-600 hover:text-white text-emerald-750 hover:text-white rounded-full shadow-lg border border-emerald-500/10 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Previous programs"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Scrolling Cards Row */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-6 -mx-4 px-4 pr-12 text-left"
            style={{ scrollbarWidth: "none" }}
          >
            {programs.map((program) => (
              <div
                key={program.id}
                className="snap-start flex-shrink-0 w-80 sm:w-85 bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(16,185,129,0.02)] border border-emerald-500/10 overflow-hidden transform transition-all duration-300 hover:translate-y-[-6px] hover:border-emerald-500/30 hover:shadow-xl flex flex-col justify-between"
              >
                {/* Image Block with Badge and floating icon */}
                <div className="relative h-48 overflow-hidden group/img">
                  <img
                    src={program.imageUrl}
                    alt={program.title}
                    className="w-full h-full object-cover transition-transform duration-700 scale-100 group-hover/img:scale-105 opacity-90 group-hover/img:opacity-100"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src.includes("maxresdefault.jpg")) {
                        target.src = target.src.replace("maxresdefault.jpg", "hqdefault.jpg");
                      } else if (target.src.includes("hqdefault.jpg")) {
                        target.src = target.src.replace("hqdefault.jpg", "0.jpg");
                      } else if (!target.src.includes("unsplash.com")) {
                        target.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60";
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
                  
                  {/* Rounded Icon container floating inside image */}
                  <div className="absolute bottom-4 left-4 w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg border border-white/10">
                    {getProgramIcon(program.iconName)}
                  </div>
                </div>

                {/* Content info block */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h4 className="font-display font-extrabold text-base text-emerald-950 hover:text-emerald-750 transition-colors">
                      {program.title}
                    </h4>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-3 font-semibold font-sans">
                      {program.description}
                    </p>
                  </div>

                  {/* Trigger Detail click Link */}
                  <div className="mt-6 pt-4 border-t border-emerald-500/10 flex items-center justify-between">
                    <button
                      type="button"
                      id={`expand-${program.id}`}
                      onClick={() => onProgramSelect(program)}
                      className="text-[10px] tracking-[0.15em] font-extrabold text-emerald-700 hover:text-emerald-900 transition-all flex items-center gap-1.5 cursor-pointer uppercase"
                    >
                      Selengkapnya
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    {program.stats && (
                      <span className="text-[9px] uppercase font-mono tracking-widest font-bold bg-emerald-50/80 border border-emerald-500/15 text-emerald-700 px-2.5 py-1 rounded-full">
                        {program.stats.split(" ")[0]} AKTIF
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute right-[-16px] xl:right-[-24px] top-1/2 translate-y-[-50%] z-10 w-10 h-10 bg-white hover:bg-emerald-600 hover:text-white text-emerald-750 hover:text-white rounded-full shadow-lg border border-emerald-500/10 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Next programs"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
        </div>

      </div>
    </section>
  );
}
