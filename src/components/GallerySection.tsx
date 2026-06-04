import { useState } from "react";
import { X, Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useCMS } from "../context/CMSContext";

export default function GallerySection() {
  const { gallery } = useCMS();
  const [activeTab, setActiveTab] = useState("Semua");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const tabs = ["Semua", "Kebangsaan", "Keagamaan", "Sosial Kemanusiaan", "Pengkaderan", "Ekonomi Kreatif", "Kegiatan"];

  const filteredPhotos = activeTab === "Semua"
    ? gallery
    : gallery.filter((photo) => photo.category === activeTab);

  const handleNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length);
    }
  };

  const handlePrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length);
    }
  };

  return (
    <section id="galeri" className="py-24 bg-gradient-to-b from-white via-slate-50 to-white text-slate-800 relative overflow-hidden border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center relative mb-12">
          <span className="inline-block px-3 py-1 border border-emerald-600/20 bg-emerald-50 text-emerald-700 text-[10px] tracking-[0.25em] font-extrabold uppercase rounded-full">
            DOKUMENTASI KIPRAH
          </span>
          <h3 className="font-display font-light text-3xl sm:text-4xl text-slate-900 tracking-tight mt-4">
            Galeri <span className="italic font-serif text-emerald-600 font-normal">Kiprah Perjuangan</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2.5 font-medium leading-relaxed">
            Arsip visual momentum, aksi kerelawanan, kajian keagamaan, dan dedikasi pembangunan oleh para sahabat pemuda.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4.5 py-1.5 text-[11px] tracking-wider uppercase font-extrabold rounded-full border transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/10"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => setLightboxIndex(index)}
              className="group relative rounded-2xl overflow-hidden aspect-[3/2] bg-zinc-950 shadow-md border border-slate-200 hover:border-emerald-500/30 hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px] cursor-pointer"
            >
              <img
                src={photo.imageUrl}
                alt={photo.title}
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
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
              
              {/* Blur backdrop overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-left text-white" />

              {/* Tag Category inside photo grid */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-emerald-600 text-white font-bold text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-sm font-mono">
                  {photo.category}
                </span>
                <span className="bg-black/60 text-white/85 font-semibold text-[8px] tracking-widest uppercase px-2 py-0.5 rounded-sm font-mono">
                  600 x 400 px
                </span>
              </div>

              {/* Hover texts details overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5 text-left text-white translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <h4 className="font-display font-medium text-sm tracking-tight text-white">
                  {photo.title}
                </h4>
                <p className="text-[10px] text-white/75 line-clamp-1 mt-1 font-sans">
                  {photo.description}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="inline-flex items-center gap-1.5 text-[9px] tracking-widest text-[#5be49b] font-bold uppercase">
                    <Eye className="w-3 h-3 text-[#5be49b]" />
                    Lihat Foto
                  </span>
                  <span className="text-[8px] font-mono text-white/45 uppercase">
                    DIMENSI SEDANG
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* --- LIGHTBOX OVERLAY VIEW --- */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/98 text-white p-4 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 p-2 rounded-full cursor-pointer transition-colors z-20"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Left Arrow */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 translate-y-[-50%] bg-white/5 hover:bg-white/10 p-3 rounded-full cursor-pointer text-slate-350 z-10 hover:text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Main frame focus container */}
          <div className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center select-none">
            <img
              src={filteredPhotos[lightboxIndex].imageUrl}
              alt={filteredPhotos[lightboxIndex].title}
              className="max-h-[70vh] object-contain rounded-lg border border-white/10 shadow-2xl"
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
            
            {/* Context descriptions */}
            <div className="mt-6 text-center max-w-xl space-y-2">
              <span className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-[9px] tracking-widest uppercase rounded-sm font-mono inline-block">
                {filteredPhotos[lightboxIndex].category}
              </span>
              <h4 className="font-display font-medium text-base leading-tight tracking-tight text-white">
                {filteredPhotos[lightboxIndex].title}
              </h4>
              <p className="text-xs text-white/60 font-sans">
                {filteredPhotos[lightboxIndex].description}
              </p>
            </div>
          </div>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 top-1/2 translate-y-[-50%] bg-white/5 hover:bg-white/10 p-3 rounded-full cursor-pointer text-slate-350 z-10 hover:text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicators dots */}
          <div className="absolute bottom-6 left-1/2 translate-x-[-50%] flex gap-1.5">
            {filteredPhotos.map((_, idx) => (
              <span
                key={idx}
                className={`w-1 h-1 rounded-full transition-all ${
                  idx === lightboxIndex ? "bg-emerald-500 w-3.5" : "bg-white/20"
                }`}
              />
            ))}
          </div>

        </div>
      )}

    </section>
  );
}
