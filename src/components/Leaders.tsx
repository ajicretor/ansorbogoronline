import { Award, Shield, User, Users, Briefcase, Mail, Phone, Calendar } from "lucide-react";
import { useCMS } from "../context/CMSContext";
import { motion } from "motion/react";
import AnsorLogo from "./AnsorLogo";

export default function Leaders() {
  const { leaders } = useCMS();

  // Find leaders according to standard GP Ansor hierarchy fields
  const ketuaList = leaders.filter(
    (leader) =>
      leader.role.toLowerCase().includes("ketua") &&
      !leader.role.toLowerCase().includes("wakil ketua")
  );
  
  const sekretarisList = leaders.filter(
    (leader) => leader.role.toLowerCase().includes("sekretaris")
  );
  
  const bendaharaList = leaders.filter(
    (leader) => leader.role.toLowerCase().includes("bendahara")
  );

  // Remaining board members are placed as other key administrators
  const otherLeaders = leaders.filter(
    (leader) =>
      !ketuaList.some((l) => l.id === leader.id) &&
      !sekretarisList.some((l) => l.id === leader.id) &&
      !bendaharaList.some((l) => l.id === leader.id)
  );

  return (
    <section
      id="pengurus"
      className="py-24 bg-transparent relative overflow-hidden text-slate-800 border-b border-emerald-500/10"
    >
      {/* Soft ambiance background decorative circles (No event patterns) */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-100/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-[300px] h-[300px] bg-emerald-55/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center relative mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-emerald-600/20 bg-emerald-50 text-emerald-700 text-[10px] tracking-[0.2em] font-bold uppercase rounded-full">
            <Users className="w-3.5 h-3.5" />
            STRUKTUR PIMPINAN
          </span>
          <h3 className="font-display font-light text-3xl sm:text-4xl text-emerald-950 tracking-tight mt-4">
            Struktur & <span className="italic font-serif text-emerald-600 font-normal">Komposisi Pengurus</span>
          </h3>
          <p className="mt-4 text-emerald-800/70 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed font-sans font-semibold">
            Nakhoda harian perjuangan Pimpinan Cabang GP Ansor Kabupaten Bogor yang mengonsolidasikan barisan pemuda Ahlussunnah wal Jama'ah se-Kabupaten Bogor.
          </p>
        </div>

        {/* --- DYNAMIC & HIGHLY POLISHED ORGANOGRAM CHART --- */}
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          
          {/* TIER 1: KETUA UMUM (President / Chairman) */}
          <div className="flex flex-col items-center w-full mb-12 relative">
            <div className="flex flex-wrap justify-center gap-6">
              {ketuaList.length > 0 ? (
                ketuaList.map((leader) => (
                  <motion.div
                    key={leader.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative bg-white border-2 border-emerald-500/30 rounded-2xl p-5 shadow-lg flex flex-col items-center text-center w-64 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500 hover:shadow-xl group"
                  >
                    <div className="absolute -top-3.5 bg-emerald-600 text-white text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-md font-mono flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      KETUA CABANG
                    </div>

                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 border border-emerald-100 shadow-inner mt-4 relative">
                      <img
                        src={leader.imageUrl}
                        alt={leader.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src.includes("maxresdefault.jpg")) {
                            target.src = target.src.replace("maxresdefault.jpg", "hqdefault.jpg");
                          } else if (target.src.includes("hqdefault.jpg")) {
                            target.src = target.src.replace("hqdefault.jpg", "0.jpg");
                          } else if (!target.src.includes("unsplash.com")) {
                            target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80";
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-bold text-slate-950 font-display tracking-tight hover:text-emerald-600 transition-colors">
                        {leader.name}
                      </h4>
                      <p className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-widest font-mono mt-1">
                        Ketua PC GP Ansor
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic">Data Ketua Belum Terpasang</div>
              )}
            </div>

            {/* Hierarchical Connecting Line down to Tier 2 */}
            <div className="w-0.5 h-12 bg-gradient-to-b from-emerald-500/50 to-slate-200 mt-2 hidden md:block" />
          </div>

          {/* TIER 2: SEKRETARIS & BENDAHARA (Secretary & Treasurer) */}
          <div className="w-full mb-12 relative flex flex-col items-center">
            
            {/* Horizontal connector bar linking Secretary and Treasurer offices */}
            <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-slate-200 hidden md:block" />
            <div className="h-6 w-0.5 bg-slate-200 hidden md:block" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl w-full z-10">
              {/* Sekretaris Panel */}
              <div className="flex flex-col items-center relative">
                {sekretarisList.length > 0 ? (
                  sekretarisList.map((leader) => (
                    <motion.div
                      key={leader.id}
                      initial={{ opacity: 0, x: -15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-md flex flex-col items-center text-center w-full max-w-xs transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/60 hover:shadow-lg group"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 shadow-inner relative">
                        <img
                          src={leader.imageUrl}
                          alt={leader.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.src.includes("maxresdefault.jpg")) {
                              target.src = target.src.replace("maxresdefault.jpg", "hqdefault.jpg");
                            } else if (target.src.includes("hqdefault.jpg")) {
                              target.src = target.src.replace("hqdefault.jpg", "0.jpg");
                            } else if (!target.src.includes("unsplash.com")) {
                              target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80";
                            }
                          }}
                        />
                      </div>
                      <div className="mt-3">
                        <h4 className="text-xs font-bold text-slate-900 font-display">
                          {leader.name}
                        </h4>
                        <p className="text-[9px] text-emerald-650 font-bold uppercase tracking-widest font-mono mt-1">
                          Sekretaris PC GP Ansor
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 italic">Data Sekretaris Belum Terpasang</div>
                )}
              </div>

              {/* Bendahara Panel */}
              <div className="flex flex-col items-center relative">
                {bendaharaList.length > 0 ? (
                  bendaharaList.map((leader) => (
                    <motion.div
                      key={leader.id}
                      initial={{ opacity: 0, x: 15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-md flex flex-col items-center text-center w-full max-w-xs transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/60 hover:shadow-lg group"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 shadow-inner relative">
                        <img
                          src={leader.imageUrl}
                          alt={leader.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.src.includes("maxresdefault.jpg")) {
                              target.src = target.src.replace("maxresdefault.jpg", "hqdefault.jpg");
                            } else if (target.src.includes("hqdefault.jpg")) {
                              target.src = target.src.replace("hqdefault.jpg", "0.jpg");
                            } else if (!target.src.includes("unsplash.com")) {
                              target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80";
                            }
                          }}
                        />
                      </div>
                      <div className="mt-3">
                        <h4 className="text-xs font-bold text-slate-900 font-display">
                          {leader.name}
                        </h4>
                        <p className="text-[9px] text-emerald-650 font-bold uppercase tracking-widest font-mono mt-1">
                          Bendahara PC GP Ansor
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 italic">Data Bendahara Belum Terpasang</div>
                )}
              </div>
            </div>

            {/* Connecting line to Tier 3 elements */}
            <div className="w-0.5 h-10 bg-slate-200 mt-2 hidden md:block" />
          </div>

          {/* TIER 3: OTHER KEY ADMINISTRATORS & BANSER COMMANDERS */}
          <div className="w-full relative flex flex-col items-center">
            
            {/* Horizontal connector line for lower administrative tier */}
            <div className="absolute top-0 left-1/6 right-1/6 h-0.5 bg-slate-150 hidden md:block" />
            <div className="h-6 w-0.5 bg-slate-150 hidden md:block" />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-2xl w-full z-10">
              {otherLeaders.map((leader, i) => (
                <motion.div
                  key={leader.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="bg-white border border-slate-150/80 rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-md group text-left"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 shadow-inner flex-shrink-0 relative">
                    <img
                      src={leader.imageUrl}
                      alt={leader.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src.includes("maxresdefault.jpg")) {
                          target.src = target.src.replace("maxresdefault.jpg", "hqdefault.jpg");
                        } else if (target.src.includes("hqdefault.jpg")) {
                          target.src = target.src.replace("hqdefault.jpg", "0.jpg");
                        } else if (!target.src.includes("unsplash.com")) {
                          target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80";
                        }
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                      {leader.name}
                    </h4>
                    <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider font-mono mt-0.5 whitespace-normal leading-relaxed">
                      {leader.role.replace(" PC GP Ansor Kabupaten Bogor", "").replace(" Pimpinan Cabang GP Ansor Kabupaten Bogor", "")}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Dedicated Institutional Signature Tag */}
          <div className="mt-16 flex items-center gap-3 py-2 px-4 bg-emerald-50/50 border border-emerald-100 rounded-full shadow-xs">
            {/* GP Ansor Little Emblem */}
            <div className="w-6 h-6 flex-shrink-0">
              <AnsorLogo className="w-full h-full" />
            </div>
            <p className="text-[10px] font-semibold text-emerald-800 tracking-wide">
              PIMPINAN CABANG GP ANSOR KABUPATEN BOGOR MAKSIMAL KHIDMAH
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
