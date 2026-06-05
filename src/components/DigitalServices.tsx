import React, { useState } from "react";
import { QrCode, ExternalLink, UserCheck, FileText, Smartphone, GraduationCap, Search, Eye, X, ChevronRight } from "lucide-react";
import { useCMS } from "../context/CMSContext";

export default function DigitalServices() {
  const { digitalServices, menuStatus, kaderisasiData } = useCMS();
  const [showPublicModal, setShowPublicModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "pkd" | "diklatsar" | "susbalan_pkl">("all");

  // If all are disabled, do not render this section at all
  if (!menuStatus.kaderisasi && !menuStatus.alumni && !menuStatus.epersuratan) {
    return null;
  }

  const { kaderisasi, epersuratan } = digitalServices;

  return (
    <section id="layanan-digital" className="py-24 bg-transparent relative overflow-hidden border-b border-emerald-500/10">
      {/* Visual Ambient Blur Accents */}
      <div className="absolute top-[30%] -right-[10%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] -left-[10%] w-[350px] h-[350px] bg-teal-500/5 rounded-full blur-[110px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center relative mb-16 select-none">
          <span className="inline-block px-3 py-1.5 border border-emerald-600/20 bg-emerald-50 text-emerald-700 text-[10px] tracking-[0.25em] font-extrabold uppercase rounded-full">
            PORTAL LAYANAN DIGITAL
          </span>
          <h3 className="font-display font-light text-3xl sm:text-4xl text-emerald-950 tracking-tight mt-4">
            Aplikasi Utama & <span className="italic font-serif text-emerald-600 font-normal">Sistem Terpadu</span>
          </h3>
          <p className="text-xs sm:text-sm text-emerald-800/70 max-w-lg mx-auto mt-3 font-semibold leading-relaxed font-sans">
            Menghubungkan darmabakti kader dan tertib administrasi PC GP Ansor Kabupaten Bogor melalui inovasi platform digital terkini.
          </p>
        </div>

        {/* Services Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-[1380px] mx-auto">
          
          {/* SERVICE CARD 1: KADERISASI PRESENSI */}
          {menuStatus.kaderisasi && (
            <div 
              id="kaderisasi-section"
              className="bg-white/90 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(16,185,129,0.02)] border border-emerald-555/15 p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center justify-between transition-all duration-300 hover:shadow-xl hover:border-emerald-500/35 hover:-translate-y-1 relative group"
            >
              {/* Highlight bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-600 rounded-t-3xl" />
              
              {/* Left Column: Details */}
              <div className="flex-1 flex flex-col justify-between text-left h-full space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 border border-emerald-500/10 flex items-center justify-center text-emerald-700">
                    <UserCheck className="w-6 h-6 animate-pulse" />
                  </div>
                  <h4 className="font-display font-black text-xl text-emerald-950 tracking-tight">
                    {kaderisasi.title || "Presensi Kaderisasi"}
                  </h4>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-semibold font-sans">
                    {kaderisasi.description || "Sistem pendataan kehadiran, kelayakan materi, serta portofolio kaderisasi GP Ansor Kabupaten Bogor secara digital terpadu."}
                  </p>
                </div>

                <div className="pt-2">
                  <a
                    href={kaderisasi.linkUrl || "https://presensi.ansorbogor.or.id"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md hover:shadow-emerald-600/10 border border-emerald-500/10"
                  >
                    Buka Aplikasi Presensi
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Right Column: QR CODE MODULE */}
              <div className="w-44 h-52 shrink-0 bg-emerald-50/50 border border-emerald-500/12 rounded-2xl p-4 flex flex-col items-center justify-between text-center select-none shadow-xs">
                <div className="relative w-32 h-32 bg-white rounded-xl border border-emerald-500/15 p-2 flex items-center justify-center shadow-xs overflow-hidden group/qr">
                  {kaderisasi.qrCodeUrl ? (
                    <img 
                      src={kaderisasi.qrCodeUrl} 
                      alt="QR Code Presensi" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(kaderisasi.linkUrl || "https://presensi.ansorbogor.or.id")}`} 
                      alt="QR Code Presensi Auto" 
                      className="w-full h-full object-contain transition-transform duration-300 group-hover/qr:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  {/* Subtle decorative target overlay */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover/qr:border-emerald-500/20 rounded-xl transition-all" />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-800 flex items-center gap-1.5 justify-center mt-1">
                    <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                    Pindai Masuk
                  </span>
                  <p className="text-[8px] text-slate-400 font-semibold mt-0.5 leading-none">Akses cepat smartphone</p>
                </div>
              </div>
            </div>
          )}

          {/* SERVICE CARD 2: ALUMNI & CERTIFICATE */}
          {menuStatus.alumni && (
            <div 
              id="alumni-section"
              className="bg-white/90 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(16,185,129,0.02)] border border-emerald-555/15 p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center justify-between transition-all duration-300 hover:shadow-xl hover:border-emerald-500/35 hover:-translate-y-1 relative group"
            >
              {/* Highlight bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-t-3xl" />
              
              {/* Left Column: Details */}
              <div className="flex-1 flex flex-col justify-between text-left h-full space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100/70 border border-amber-500/10 flex items-center justify-center text-amber-700">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h4 className="font-display font-black text-xl text-emerald-950 tracking-tight">
                    Sistem Alumni & Sertifikat
                  </h4>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-semibold font-sans">
                    Pencarian data alumni pelatihan kaderisasi PKD, DIKLATSAR, PKL/SUSBALAN secara transparan, peninjauan kelulusan, &amp; pengunduhan sertifikat resmi.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveTab("all");
                      setShowPublicModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md hover:shadow-emerald-700/10 border border-emerald-700 font-sans"
                  >
                    Buka Direktori Alumni
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: QR CODE MODULE */}
              <div className="w-44 h-52 shrink-0 bg-emerald-50/50 border border-emerald-500/12 rounded-2xl p-4 flex flex-col items-center justify-between text-center select-none shadow-xs">
                <div className="relative w-32 h-32 bg-white rounded-xl border border-emerald-500/15 p-2 flex items-center justify-center shadow-xs overflow-hidden group/qr">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(window.location.origin + "/#alumni-sertifikat")}`} 
                    alt="QR Code Alumni Auto" 
                    className="w-full h-full object-contain transition-transform duration-300 group-hover/qr:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 border-2 border-transparent group-hover/qr:border-emerald-500/20 rounded-xl transition-all" />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-800 flex items-center gap-1.5 justify-center mt-1">
                    <Search className="w-3.5 h-3.5 text-emerald-600" />
                    Pencarian Instan
                  </span>
                  <p className="text-[8px] text-slate-400 font-semibold mt-0.5 leading-none">Akses cepat smartphone</p>
                </div>
              </div>
            </div>
          )}

          {/* SERVICE CARD 3: E-PERSURATAN */}
          {menuStatus.epersuratan && (
            <div 
              id="epersuratan-section"
              className={`bg-white/90 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(16,185,129,0.02)] border border-emerald-555/15 p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center justify-between transition-all duration-300 hover:shadow-xl hover:border-emerald-500/35 hover:-translate-y-1 relative group ${
                menuStatus.kaderisasi && menuStatus.alumni && menuStatus.epersuratan 
                  ? "xl:col-span-2" 
                  : ""
              }`}
            >
              {/* Highlight bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-600 rounded-t-3xl" />
              
              {/* Left Column: Details */}
              <div className="flex-1 flex flex-col justify-between text-left h-full space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 border border-emerald-500/10 flex items-center justify-center text-emerald-700">
                    <FileText className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h4 className="font-display font-black text-xl text-emerald-950 tracking-tight">
                    {epersuratan.title || "E-Persuratan PC GP Ansor"}
                  </h4>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-semibold font-sans">
                    {epersuratan.description || "Platform korespondensi digital penomoran surat resmi, pengarsipan rekomendasi, serta disposisi dewan pimpinan cabang secara berdaulat."}
                  </p>
                </div>

                <div className="pt-2">
                  <a
                    href={epersuratan.linkUrl || "https://epersuratan.ansorbogor.or.id"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md hover:shadow-emerald-600/10 border border-emerald-500/10"
                  >
                    Buka Portal E-Persuratan
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Right Column: QR CODE MODULE */}
              <div className="w-44 h-52 shrink-0 bg-emerald-50/50 border border-emerald-500/12 rounded-2xl p-4 flex flex-col items-center justify-between text-center select-none shadow-xs">
                <div className="relative w-32 h-32 bg-white rounded-xl border border-emerald-555/15 p-2 flex items-center justify-center shadow-xs overflow-hidden group/qr">
                  {epersuratan.qrCodeUrl ? (
                    <img 
                      src={epersuratan.qrCodeUrl} 
                      alt="QR Code E-Persuratan" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(epersuratan.linkUrl || "https://epersuratan.ansorbogor.or.id")}`} 
                      alt="QR Code E-Persuratan Auto" 
                      className="w-full h-full object-contain transition-transform duration-300 group-hover/qr:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  {/* Subtle decorative target overlay */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover/qr:border-emerald-500/20 rounded-xl transition-all" />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-800 flex items-center gap-1.5 justify-center mt-1">
                    <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                    Pindai Masuk
                  </span>
                  <p className="text-[8px] text-slate-400 font-semibold mt-0.5 leading-none">Akses cepat smartphone</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* PUBLIC DATA KADERISASI REKAP DIALOG MODAL Overlay */}
      {showPublicModal && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-up text-left">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <GraduationCap className="w-5.5 h-5.5 text-white" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg leading-tight">Rekap Data Kaderisasi Resmi</h4>
                  <p className="text-white/70 text-[11px] font-medium font-sans">Pimpinan Cabang Gerakan Pemuda Ansor Kabupaten Bogor</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPublicModal(false)}
                className="text-white/60 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Controls Section */}
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Category selector */}
              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                {(["all", "pkd", "diklatsar", "susbalan_pkl"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === tab
                        ? "bg-emerald-700 text-white shadow-sm"
                        : "bg-white hover:bg-slate-100 border border-slate-200 text-slate-600"
                    }`}
                  >
                    {tab === "all" ? "Semua" : tab === "pkd" ? "PKD" : tab === "diklatsar" ? "DIKLATSAR" : "PKL / SUSBALAN"}
                  </button>
                ))}
              </div>

              {/* Live Search bar */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari PAC, lokasi, atau angkatan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-700 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>
            </div>

            {/* List Content */}
            <div className="p-6 overflow-y-auto bg-white flex-1 space-y-8 min-h-[300px]">
              {(() => {
                const query = searchQuery.toLowerCase().trim();
                const filtered = (kaderisasiData || []).filter((row) => {
                  return (
                    row.group.toLowerCase().includes(query) ||
                    row.lokasi.toLowerCase().includes(query) ||
                    row.angkatan.toLowerCase().includes(query) ||
                    row.noSertifikat.toLowerCase().includes(query)
                  );
                });

                const pkdRows = filtered.filter((r) => r.type === "pkd");
                const diklatsarRows = filtered.filter((r) => r.type === "diklatsar");
                const susbalanPklRows = filtered.filter((r) => r.type === "susbalan_pkl");

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-16 space-y-2 select-none">
                      <Search className="w-12 h-12 text-slate-300 mx-auto" />
                      <p className="text-sm font-semibold text-slate-500">Hasil pencarian tidak ditemukan</p>
                      <p className="text-xs text-slate-400">Pastikan ejaan nama PAC, wilayah, atau tahun benar.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-10">
                    {/* PKD Table Category */}
                    {(activeTab === "all" || activeTab === "pkd") && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-l-4 border-emerald-600 pl-3">
                          <h5 className="font-display font-extrabold text-[#115e21] tracking-wider uppercase text-xs">
                            Pelatihan Kepemimpinan Dasar (PKD)
                          </h5>
                          <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">{pkdRows.length} Pos PKD</span>
                        </div>

                        <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-xs">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-[#e2f0d9] text-emerald-950 font-bold border-b border-emerald-900/20">
                                <th className="p-3 text-center w-10">No</th>
                                <th className="p-3">PAC Pendataan</th>
                                <th className="p-3">Kaderisasi Angkatan</th>
                                <th className="p-3 text-center">Lulusan</th>
                                <th className="p-3">Lokasi Kegiatan</th>
                                <th className="p-3 text-nowrap">Tanggal Pelaksanaan</th>
                                <th className="p-3">No Sertifikat</th>
                                <th className="p-3 text-center">Cetak</th>
                                <th className="p-3 text-center">Link Folder</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                              {pkdRows.length === 0 ? (
                                <tr>
                                  <td colSpan={9} className="p-4 text-center text-slate-400 italic">Tidak ada data PKD yang cocok</td>
                                </tr>
                              ) : (
                                pkdRows.map((row, idx) => (
                                  <tr key={row.id} className="hover:bg-slate-50/50 transition-all font-medium">
                                    <td className="p-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                                    <td className="p-3 font-semibold text-emerald-950">{row.group}</td>
                                    <td className="p-3">Angkatan {row.angkatan}</td>
                                    <td className="p-3 text-center font-bold text-emerald-600">{row.pesertaLulus} org</td>
                                    <td className="p-3 max-w-[150px] truncate" title={row.lokasi}>{row.lokasi}</td>
                                    <td className="p-3 text-slate-500 text-nowrap">{row.tanggal}</td>
                                    <td className="p-3 font-mono text-[10px] text-slate-500" title={row.noSertifikat}>{row.noSertifikat || "-"}</td>
                                    <td className="p-3 text-center">
                                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                                        row.cetak === "yes" 
                                          ? "bg-emerald-100 text-emerald-800" 
                                          : row.cetak === "no" 
                                          ? "bg-red-100 text-red-800" 
                                          : "bg-amber-100 text-amber-800"
                                      }`}>
                                        {row.cetak === "yes" ? "Yes" : row.cetak === "no" ? "No" : "Belum"}
                                      </span>
                                    </td>
                                    <td className="p-3 text-center">
                                      {row.linkSertifikat ? (
                                        <a 
                                          href={row.linkSertifikat} 
                                          target="_blank" 
                                          rel="noreferrer" 
                                          className="text-cyan-600 hover:text-cyan-700 font-bold inline-flex items-center gap-1 cursor-pointer hover:underline justify-center"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                          <span>Drive</span>
                                        </a>
                                      ) : (
                                        <span className="text-slate-300">-</span>
                                      )}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* DIKLATSAR Table Category */}
                    {(activeTab === "all" || activeTab === "diklatsar") && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-l-4 border-amber-600 pl-3">
                          <h5 className="font-display font-extrabold text-[#78350f] tracking-wider uppercase text-xs">
                            Pendidikan & Latihan Dasar Banser (DIKLATSAR)
                          </h5>
                          <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">{diklatsarRows.length} Satkoryon</span>
                        </div>

                        <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-xs">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-amber-50 text-amber-955 font-bold border-b border-amber-900/20">
                                <th className="p-3 text-center w-10">No</th>
                                <th className="p-3">Satkoryon Banser</th>
                                <th className="p-3">Kaderisasi Angkatan</th>
                                <th className="p-3 text-center">Lulusan</th>
                                <th className="p-3">Lokasi Kegiatan</th>
                                <th className="p-3 text-nowrap">Tanggal Pelaksanaan</th>
                                <th className="p-3">No Sertifikat</th>
                                <th className="p-3 text-center">Cetak</th>
                                <th className="p-3 text-center">Link Folder</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                              {diklatsarRows.length === 0 ? (
                                <tr>
                                  <td colSpan={9} className="p-4 text-center text-slate-400 italic">Tidak ada data DIKLATSAR yang cocok</td>
                                </tr>
                              ) : (
                                diklatsarRows.map((row, idx) => (
                                  <tr key={row.id} className="hover:bg-slate-50/50 transition-all font-medium">
                                    <td className="p-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                                    <td className="p-3 font-semibold text-amber-950">{row.group}</td>
                                    <td className="p-3">Angkatan {row.angkatan}</td>
                                    <td className="p-3 text-center font-bold text-amber-600">{row.pesertaLulus} org</td>
                                    <td className="p-3 max-w-[150px] truncate" title={row.lokasi}>{row.lokasi}</td>
                                    <td className="p-3 text-slate-500 text-nowrap">{row.tanggal}</td>
                                    <td className="p-3 font-mono text-[10px] text-slate-500" title={row.noSertifikat}>{row.noSertifikat || "-"}</td>
                                    <td className="p-3 text-center">
                                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                                        row.cetak === "yes" 
                                          ? "bg-emerald-100 text-emerald-800" 
                                          : row.cetak === "no" 
                                          ? "bg-red-100 text-red-800" 
                                          : "bg-amber-100 text-amber-800"
                                      }`}>
                                        {row.cetak === "yes" ? "Yes" : row.cetak === "no" ? "No" : "Belum"}
                                      </span>
                                    </td>
                                    <td className="p-3 text-center">
                                      {row.linkSertifikat ? (
                                        <a 
                                          href={row.linkSertifikat} 
                                          target="_blank" 
                                          rel="noreferrer" 
                                          className="text-cyan-600 hover:text-cyan-700 font-bold inline-flex items-center gap-1 cursor-pointer hover:underline justify-center"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                          <span>Drive</span>
                                        </a>
                                      ) : (
                                        <span className="text-slate-300">-</span>
                                      )}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* PKL & SUSBALAN Table Category */}
                    {(activeTab === "all" || activeTab === "susbalan_pkl") && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-l-4 border-teal-600 pl-3">
                          <h5 className="font-display font-extrabold text-[#0f5b5b] tracking-wider uppercase text-xs">
                            Kursus Kader Senior (PKL / SUSBALAN)
                          </h5>
                          <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">{susbalanPklRows.length} Posko Senior</span>
                        </div>

                        <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-xs">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-teal-50 text-teal-955 font-bold border-b border-teal-900/20">
                                <th className="p-3 text-center w-10">No</th>
                                <th className="p-3">Satuan Kader Utama</th>
                                <th className="p-3">Tingkatan Angkatan</th>
                                <th className="p-3 text-center">Lulusan</th>
                                <th className="p-3">Lokasi Kegiatan</th>
                                <th className="p-3 text-nowrap">Tanggal Pelaksanaan</th>
                                <th className="p-3">No Sertifikat</th>
                                <th className="p-3 text-center">Cetak</th>
                                <th className="p-3 text-center">Link Folder</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                              {susbalanPklRows.length === 0 ? (
                                <tr>
                                  <td colSpan={9} className="p-4 text-center text-slate-400 italic">Tidak ada data kursus utama yang cocok</td>
                                </tr>
                              ) : (
                                susbalanPklRows.map((row, idx) => (
                                  <tr key={row.id} className="hover:bg-slate-50/50 transition-all font-medium">
                                    <td className="p-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                                    <td className="p-3 font-semibold text-teal-950">{row.group}</td>
                                    <td className="p-3">Angkatan {row.angkatan}</td>
                                    <td className="p-3 text-center font-bold text-teal-600">{row.pesertaLulus} org</td>
                                    <td className="p-3 max-w-[150px] truncate" title={row.lokasi}>{row.lokasi}</td>
                                    <td className="p-3 text-slate-500 text-nowrap">{row.tanggal}</td>
                                    <td className="p-3 font-mono text-[10px] text-slate-500" title={row.noSertifikat}>{row.noSertifikat || "-"}</td>
                                    <td className="p-3 text-center">
                                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                                        row.cetak === "yes" 
                                          ? "bg-emerald-100 text-emerald-800" 
                                          : row.cetak === "no" 
                                          ? "bg-red-100 text-red-800" 
                                          : "bg-amber-100 text-amber-800"
                                      }`}>
                                        {row.cetak === "yes" ? "Yes" : row.cetak === "no" ? "No" : "Belum"}
                                      </span>
                                    </td>
                                    <td className="p-3 text-center">
                                      {row.linkSertifikat ? (
                                        <a 
                                          href={row.linkSertifikat} 
                                          target="_blank" 
                                          rel="noreferrer" 
                                          className="text-cyan-600 hover:text-cyan-700 font-bold inline-flex items-center gap-1 cursor-pointer hover:underline justify-center"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                          <span>Drive</span>
                                        </a>
                                      ) : (
                                        <span className="text-slate-300">-</span>
                                      )}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>* Data di atas disinkronisasi langsung oleh Satkorcab Banser & Sekretariat PC GP Ansor.</span>
              <button
                type="button"
                onClick={() => setShowPublicModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all cursor-pointer text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
