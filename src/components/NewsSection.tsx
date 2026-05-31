import { useState } from "react";
import { Calendar, User, ArrowRight, BookOpen } from "lucide-react";
import { useCMS } from "../context/CMSContext";
import { NewsArticle } from "../types";

interface NewsSectionProps {
  onNewsSelect: (article: NewsArticle) => void;
}

export default function NewsSection({ onNewsSelect }: NewsSectionProps) {
  const { news } = useCMS();
  const [activeCategory, setActiveCategory] = useState("Semua");

  const categories = ["Semua", "Pengkaderan", "Sosial Kemanusiaan", "Ekonomi Kreatif", "Kebangsaan", "Keagamaan"];

  const filteredNews = activeCategory === "Semua"
    ? news
    : news.filter((item) => item.category === activeCategory);

  return (
    <section id="berita" className="py-24 bg-gradient-to-b from-white to-slate-50 text-slate-800 relative border-b border-slate-200/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center relative mb-12">
          <span className="inline-block px-3 py-1 border border-emerald-600/20 bg-emerald-50 text-emerald-700 text-[10px] tracking-[0.25em] font-extrabold uppercase rounded-full">
            KABAR GERAKAN
          </span>
          <h3 className="font-display font-light text-3xl sm:text-4xl text-slate-900 tracking-tight mt-4">
            Kabar Terbaru & <span className="italic font-serif text-emerald-600 font-normal">Syi'ar Perjuangan</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2.5 font-medium leading-relaxed">
            Menyajikan catatan berkala, rilisan pers resmi, dan artikel pemikiran kader muda Nahdlatul Ulama Kabupaten Bogor.
          </p>
        </div>

        {/* Categories Tab Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4.5 py-1.5 text-[11px] tracking-wider uppercase font-extrabold rounded-full border transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/10"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* News Grid Column cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {filteredNews.map((article) => (
            <article
              key={article.id}
              onClick={() => onNewsSelect(article)}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/50 shadow-sm hover:border-emerald-500/30 hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px] flex flex-col justify-between cursor-pointer group"
            >
              {/* Image and Tag banner */}
              <div className="relative h-48 overflow-hidden bg-zinc-950">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity transition-transform duration-700 group-hover:scale-103"
                  referrerPolicy="no-referrer"
                />
                
                <span className="absolute top-4 left-4 bg-emerald-650 text-white font-extrabold text-[8px] tracking-[0.2em] uppercase px-3 py-1 rounded-full shadow-md border border-white/15 font-mono">
                  {article.category}
                </span>
              </div>

              {/* Contents body metadata */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Date and Author */}
                  <div className="flex items-center gap-4 text-[9px] text-slate-400 tracking-widest uppercase font-bold font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-600" />
                      {article.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-emerald-600" />
                      {article.author.split(" ")[0]}
                    </span>
                  </div>

                  <h4 className="font-display font-bold text-base text-slate-800 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {article.title}
                  </h4>
                  
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-3 font-medium font-sans">
                    {article.excerpt}
                  </p>
                </div>

                {/* Footer trigger Read */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-extrabold text-emerald-700">
                  <span className="flex items-center gap-1.5 uppercase tracking-widest group-hover:text-emerald-900 transition-colors">
                    Baca Artikel
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[8px] uppercase font-mono tracking-widest bg-slate-50 text-slate-400 px-2.5 py-1 rounded border border-slate-200/50">
                    {article.readTime}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty state when no categories found */}
        {filteredNews.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-bold text-sm">Tidak ada berita dalam kategori ini saat ini.</p>
          </div>
        )}

      </div>
    </section>
  );
}
