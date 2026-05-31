import { useState, ChangeEvent, FormEvent } from "react";
import { X, Check, ArrowRight, Shield, Award, Calendar, User, Eye, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProgramItem, NewsArticle } from "../types";
import { useCMS } from "../context/CMSContext";

interface ModalsProps {
  // Join Modal state
  isJoinOpen: boolean;
  onJoinClose: () => void;
  
  // Program Modal state
  selectedProgram: ProgramItem | null;
  onProgramClose: () => void;

  // Video Modal state
  isVideoOpen: boolean;
  onVideoClose: () => void;

  // News Modal state
  selectedNews: NewsArticle | null;
  onNewsClose: () => void;
}

const BOGOR_DISTRICTS = [
  "Babakan Madang", "Bo Jong Gede", "Caringin", "Cariu", "Ciampea", "Ciawi", "Cibinong", "Cibungbulang", "Cigombong", "Cigudeg", "Cijeruk", "Cileungsi", "Ciomas", "Cisarua", "Ciseeng", "Citeureup", "Dramaga", "Gunung Putri", "Gunung Sindur", "Jasinga", "Jonggol", "Kemang", "Klapanunggal", "Leuwiliang", "Leuwisadeng", "Megamendung", "Nanggung", "Pamijahan", "Parung Panjang", "Parung", "Ranca Bungur", "Rumpin", "Sukajaya", "Sukamakmur", "Sukaraja", "Tajur Halang", "Tamansari", "Tenjo", "Tenjolaya"
];

export default function Modals({
  isJoinOpen,
  onJoinClose,
  selectedProgram,
  onProgramClose,
  isVideoOpen,
  onVideoClose,
  selectedNews,
  onNewsClose,
}: ModalsProps) {
  const { heroConfig } = useCMS();
  // Form handling inside Join Modal
  const [formData, setFormData] = useState({
    name: "",
    nik: "",
    email: "",
    whatsapp: "",
    district: "",
    reason: "",
    terms: false,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formStep, setFormStep] = useState<"input" | "loading" | "success">("input");
  const [generatedCardId, setGeneratedCardId] = useState("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Nama lengkap harus diisi";
    if (!/^\d{16}$/.test(formData.nik)) errors.nik = "NIK harus terdiri dari 16 digit angka";
    if (!formData.email.trim()) {
      errors.email = "Email harus diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Format email tidak valid";
    }
    if (!/^\d{10,14}$/.test(formData.whatsapp)) {
      errors.whatsapp = "No. WhatsApp harus antara 10 hingga 14 digit angka";
    }
    if (!formData.district) errors.district = "Pilih kecamatan domisili Anda";
    if (!formData.terms) errors.terms = "Anda harus menyetujui syarat & ketentuan";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormStep("loading");
    setTimeout(() => {
      // Simulate registration
      const randomId = "ANSOR-" + Math.floor(100000 + Math.random() * 900000);
      setGeneratedCardId(randomId);
      setFormStep("success");
    }, 1800);
  };

  const resetJoinForm = () => {
    setFormData({
      name: "",
      nik: "",
      email: "",
      whatsapp: "",
      district: "",
      reason: "",
      terms: false,
    });
    setFormErrors({});
    setFormStep("input");
    onJoinClose();
  };

  return (
    <>
      <AnimatePresence>
        {/* --- 1. JOIN (REGISTRATION) MODAL --- */}
        {isJoinOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetJoinForm}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden text-slate-800 z-10"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-50/50 via-white to-white border-b border-slate-100 px-6 py-5 text-slate-900 relative">
                <h3 className="text-lg sm:text-xl font-display font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  Pendaftaran Anggota GP Ansor
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-sans">
                  Bergabunglah dengan GP Ansor PC Kabupaten Bogor Sekarang
                </p>
                <button
                  type="button"
                  id="close-join-modal"
                  onClick={resetJoinForm}
                  className="absolute top-5 right-5 hover:bg-slate-100 p-1.5 rounded-full transition-colors text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

               {/* Form Content */}
              <div className="p-6 max-h-[75vh] overflow-y-auto">
                {formStep === "input" && (
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                        Nama Lengkap Sesuai KTP <span className="text-emerald-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Contoh: Ahmad Hidayatullah"
                        className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-4 transition-all bg-slate-50/50 ${formErrors.name ? "border-red-400 focus:ring-red-500/10" : "border-slate-200 focus:ring-emerald-550/10 focus:border-emerald-500"}`}
                      />
                      {formErrors.name && (
                        <p className="text-red-500 text-xs mt-1.5 font-medium font-sans">{formErrors.name}</p>
                      )}
                    </div>

                    {/* NIK */}
                    <div>
                      <label htmlFor="nik" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                        No. Induk Kependudukan (NIK) <span className="text-emerald-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="nik"
                        id="nik"
                        maxLength={16}
                        value={formData.nik}
                        onChange={handleInputChange}
                        placeholder="16 digit angka KTP"
                        className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-4 transition-all bg-slate-50/50 ${formErrors.nik ? "border-red-400 focus:ring-red-500/10" : "border-slate-200 focus:ring-emerald-550/10 focus:border-emerald-500"}`}
                      />
                      {formErrors.nik && (
                        <p className="text-red-500 text-xs mt-1.5 font-medium font-sans">{formErrors.nik}</p>
                      )}
                    </div>

                    {/* Grid Email and WhatsApp */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Email */}
                      <div>
                        <label htmlFor="email" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                          Email Aktif <span className="text-emerald-600">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="ahmad@example.com"
                          className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-4 transition-all bg-slate-50/50 ${formErrors.email ? "border-red-400 focus:ring-red-500/10" : "border-slate-200 focus:ring-emerald-550/10 focus:border-emerald-500"}`}
                        />
                        {formErrors.email && (
                          <p className="text-red-500 text-xs mt-1.5 font-medium font-sans">{formErrors.email}</p>
                        )}
                      </div>

                      {/* WhatsApp */}
                      <div>
                        <label htmlFor="whatsapp" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                          No. WhatsApp <span className="text-emerald-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="whatsapp"
                          id="whatsapp"
                          value={formData.whatsapp}
                          onChange={handleInputChange}
                          placeholder="0812xxxxxxxx"
                          className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-4 transition-all bg-slate-50/50 ${formErrors.whatsapp ? "border-red-400 focus:ring-red-500/10" : "border-slate-200 focus:ring-emerald-550/10 focus:border-emerald-500"}`}
                        />
                        {formErrors.whatsapp && (
                          <p className="text-red-500 text-xs mt-1.5 font-medium font-sans">{formErrors.whatsapp}</p>
                        )}
                      </div>
                    </div>

                    {/* District Selector */}
                    <div>
                      <label htmlFor="district" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                        Domisili Kecamatan (Bogor) <span className="text-emerald-600">*</span>
                      </label>
                      <select
                        name="district"
                        id="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 focus:outline-none focus:ring-4 bg-slate-50 border-slate-200 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all`}
                      >
                        <option value="" className="bg-white text-slate-600 font-semibold font-sans">Pilih Kecamatan...</option>
                        {BOGOR_DISTRICTS.map((dist) => (
                          <option key={dist} value={dist} className="bg-white text-slate-850 font-bold font-sans">
                            {dist}
                          </option>
                        ))}
                      </select>
                      {formErrors.district && (
                        <p className="text-red-500 text-xs mt-1.5 font-medium font-sans">{formErrors.district}</p>
                      )}
                    </div>

                    {/* Reason for joining */}
                    <div>
                      <label htmlFor="reason" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                        Alasan Ingin Bergabung (Opsional)
                      </label>
                      <textarea
                        name="reason"
                        id="reason"
                        rows={3}
                        value={formData.reason}
                        onChange={handleInputChange}
                        placeholder="Sebutkan motivasi Anda bergabung menjadi bagian dari GP Ansor..."
                        className="w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-4 transition-all bg-slate-50/50 resize-none font-sans border-slate-200 focus:ring-emerald-550/10 focus:border-emerald-500"
                      />
                    </div>

                    {/* Terms Checkbox */}
                    <div className="flex items-start gap-2.5 pt-2">
                      <input
                        type="checkbox"
                        name="terms"
                        id="terms"
                        checked={formData.terms}
                        onChange={handleInputChange}
                        className="mt-1 w-4 h-4 rounded text-emerald-600 accent-emerald-600 bg-white border-slate-200"
                      />
                      <label htmlFor="terms" className="text-[11px] text-slate-500 leading-relaxed font-sans text-left font-medium">
                        Saya bersumpah setia kepada Pancasila, UUD 1945, NKRI, serta tunduk sepenuhnya pada ketetapan jam'iyyah Nahdlatul Ulama beserta ajaran Islam Ahlussunnah wal Jama'ah An-Nahdliyah. <span className="text-emerald-600">*</span>
                      </label>
                    </div>
                    {formErrors.terms && (
                      <p className="text-red-500 text-xs font-medium font-sans text-left">{formErrors.terms}</p>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      id="submit-join-form"
                      className="w-full mt-4 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest text-[11px] rounded-full transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      Kirim Pendaftaran
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

                {formStep === "loading" && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-2 border-emerald-600 border-t-slate-150 rounded-full animate-spin"></div>
                    <h4 className="font-display font-semibold text-base mt-6 text-slate-800">
                      Memproses Pendaftaran Anda...
                    </h4>
                    <p className="text-xs text-slate-500 mt-2 text-center max-w-xs font-sans font-medium">
                      Sistem sedang mengolah dan menghasilkan ID keanggotaan digital terverifikasi dalam database GP Ansor Bogor.
                    </p>
                  </div>
                )}

                {formStep === "success" && (
                  <div className="py-2 text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mb-4 animate-bounce">
                      <Check className="w-5 h-5 stroke-[2.5px]" />
                    </div>
                    <h4 className="font-display font-bold text-xl text-slate-900">
                      Pendaftaran Berhasil!
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-650 max-w-sm mx-auto mt-2 font-sans font-medium">
                      Selamat, Anda resmi terdaftar sebagai calon kader GP Ansor Kabupaten Bogor. Perwakilan PAC tingkat Kecamatan {formData.district} akan segera bersilaturahmi dengan Anda.
                    </p>

                    {/* DIGITAL CARD PREVIEW */}
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mt-6 w-full max-w-sm rounded-xl p-6 bg-gradient-to-br from-emerald-600 via-emerald-750 to-emerald-850 text-white relative shadow-xl border border-emerald-500/10 overflow-hidden"
                    >
                      {/* Card graphics overlay */}
                      <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/5 rounded-full blur-2xl" />
                      <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 bg-emerald-500/10 rounded-full blur-xl" />

                      {/* Card Content */}
                      <div className="flex justify-between items-start border-b border-white/10 pb-4">
                        <div className="text-left">
                          <p className="text-[9px] text-emerald-250 font-mono tracking-widest uppercase font-bold">
                            KARTU ANGGOTA DIGITAL (CAD)
                          </p>
                          <h5 className="font-display font-bold text-base mt-1 tracking-widest text-white uppercase">
                            GP ANSOR BOGOR
                          </h5>
                        </div>
                        <Award className="w-6 h-6 text-emerald-250" />
                      </div>

                      <div className="mt-6 text-left space-y-3">
                        <div>
                          <p className="text-[8px] text-white/60 tracking-widest uppercase font-mono">
                            NAMA LENGKAP CAD
                          </p>
                          <p className="font-semibold text-base font-display tracking-tight text-white capitalize">
                            {formData.name}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-[8px] text-white/60 tracking-widest uppercase font-mono">
                              KECAMATAN DOMISILI
                            </p>
                            <p className="text-xs font-semibold text-white/90 font-sans">
                              {formData.district}
                            </p>
                          </div>
                          <div>
                            <p className="text-[8px] text-white/60 tracking-widest uppercase font-mono">
                              ID KEANGGOTAAN
                            </p>
                            <p className="text-xs font-mono font-bold text-emerald-250">
                              {generatedCardId}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-[9px] bg-white/10 text-white py-1 px-2.5 rounded-full font-semibold border border-white/20 font-mono tracking-wide">
                          <Sparkles className="w-3 h-3 text-emerald-250" />
                          VERIFIED CAD
                        </span>
                        <span className="text-[9px] text-white/50 italic font-mono">
                          2026/2027
                        </span>
                      </div>
                    </motion.div>

                    <button
                      type="button"
                      id="finish-join"
                      onClick={resetJoinForm}
                      className="mt-6 px-6 py-2.5 border border-slate-200 hover:border-slate-350 text-slate-800 bg-white hover:bg-slate-50 rounded-lg text-xs tracking-widest uppercase font-bold shadow-sm transition-colors cursor-pointer"
                    >
                      Selesai & Tutup
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* --- 2. PROGRAM DETAIL MODAL --- */}
        {selectedProgram && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onProgramClose}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-800 z-10"
            >
              {/* Cover Photo */}
              <div className="relative h-64 w-full">
                <img
                  src={selectedProgram.imageUrl}
                  alt={selectedProgram.title}
                  className="w-full h-full object-cover opacity-90"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <button
                  type="button"
                  id="close-program-modal"
                  onClick={onProgramClose}
                  className="absolute top-4 right-4 bg-black/40 hover:bg-black/80 border border-white/10 p-1.5 rounded-full text-white backdrop-blur-sm transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="absolute bottom-6 left-6 right-6 text-white text-left">
                  <span className="bg-emerald-650 text-white font-bold font-mono text-[9px] tracking-widest px-2.5 py-1 rounded inline-block mb-2 uppercase">
                    PROGRAM UNGGULAN PC
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-display font-light text-white tracking-tight">
                    {selectedProgram.title}
                  </h3>
                </div>
              </div>

              {/* Description Content */}
              <div className="p-8 text-left space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest font-mono">
                    Deskripsi Program Lengkap
                  </h4>
                  <p className="mt-3 text-slate-600 leading-relaxed text-sm font-sans font-medium">
                    {selectedProgram.extendedDescription}
                  </p>
                </div>

                {selectedProgram.stats && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-emerald-600">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold">Capaian & Frekuensi</p>
                        <p className="font-semibold text-slate-800 text-sm mt-0.5 font-sans">{selectedProgram.stats}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono tracking-widest uppercase text-emerald-650 bg-emerald-50 border border-emerald-200/50 py-1 px-3 rounded-full font-bold">
                      Sukses Realisasi
                    </span>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-105 flex justify-end gap-3 items-center">
                  <button
                    type="button"
                    onClick={onProgramClose}
                    className="px-5 py-2 hover:text-slate-800 rounded-xl text-xs uppercase tracking-widest text-slate-400 transition-colors cursor-pointer font-bold"
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    id="program-join-trigger"
                    onClick={() => {
                      onProgramClose();
                      // Timeout to let closing complete
                      setTimeout(() => {
                        resetJoinForm();
                        // wait a bit and trigger isJoinOpen from App
                        const evt = new CustomEvent("open-join-modal");
                        window.dispatchEvent(evt);
                      }, 200);
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold tracking-wider text-xs rounded-full transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm animate-pulse-subtle"
                  >
                    Daftar Sebagai Kader
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* --- 3. VIDEO PRESENTATION PLAYER MODAL --- */}
        {isVideoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onVideoClose}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-10"
            >
              <button
                type="button"
                id="close-video-modal"
                onClick={onVideoClose}
                className="absolute top-4 right-4 bg-white/5 hover:bg-white hover:text-black border border-white/15 p-2 rounded-full cursor-pointer z-20 transition-all text-white"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Elegant Mock Video Player / Actual Embed code */}
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-zinc-950">
                {/* Embedded Video */}
                <iframe
                  className="w-full h-full absolute inset-0 pointer-events-auto"
                  src={heroConfig.videoUrl}
                  title="Video Profil GP Ansor Kabupaten Bogor"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* --- 4. NEWS FULL ARTICLE PREVIEW MODAL --- */}
        {selectedNews && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onNewsClose}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-3xl bg-white border border-slate-200/80 rounded-2xl shadow-2xl overflow-hidden text-slate-800 z-10 font-sans"
            >
              {/* Cover banner */}
              <div className="relative h-72 w-full">
                <img
                  src={selectedNews.imageUrl}
                  alt={selectedNews.title}
                  className="w-full h-full object-cover opacity-95"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <button
                  type="button"
                  id="close-news-modal"
                  onClick={onNewsClose}
                  className="absolute top-4 right-4 bg-black/40 hover:bg-black/80 border border-white/10 p-1.5 rounded-full text-white backdrop-blur-sm transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="absolute bottom-6 left-6 right-6 text-white text-left">
                  <span className="bg-emerald-600 text-white font-bold font-mono text-[9px] tracking-widest px-2.5 py-1 rounded inline-block mb-3 uppercase shadow-sm">
                    {selectedNews.category}
                  </span>
                  <h3 className="text-xl md:text-2xl font-display font-light leading-tight tracking-tight text-white">
                    {selectedNews.title}
                  </h3>
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-slate-50 border-b border-slate-100 px-8 py-3.5 flex flex-wrap justify-between items-center text-xs text-slate-500 gap-3">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {selectedNews.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Oleh: {selectedNews.author}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded font-mono text-[10px] tracking-wider font-bold shadow-sm">
                  <Eye className="w-3.5 h-3.5 animate-pulse" />
                  {selectedNews.readTime}
                </span>
              </div>

              {/* Markdown-style content block */}
              <div className="p-8 text-left max-h-[45vh] overflow-y-auto">
                <div className="space-y-4 text-slate-600 leading-relaxed font-sans font-medium prose max-w-none">
                  <p className="font-semibold text-slate-800 border-l-4 border-emerald-500 bg-slate-50 pl-4 py-2.5 italic rounded-r-md">
                    {selectedNews.excerpt}
                  </p>
                  <p>
                    {selectedNews.content} Organisasi Pimpinan Cabang Gerakan Pemuda Ansor Kabupaten Bogor senantiasa bergerak dinamis mendampingi masyarakat serta memperkokoh kedaulatan bangsa. Kiprah nyata perjuangan kaderisasi ini diharapkan mampu melahirkan kepemimpinan muda yang transformatif dan konsisten menyebarkan kedamaian Islam yang rahmatan lil alamin.
                  </p>
                  <p>
                    Dalam pelaksanaan setiap aksi di lapangan, koordinasi berkesinambungan dilakukan bersama tokoh ulama Nahdlatul Ulama serta jajaran pemerintah daerah guna menjamin sasaran kemanfaatan yang tepat guna bagi warga Bogor.
                  </p>
                  <p>
                    Bagi masyarakat yang tertarik untuk turut serta memberikan dukungan atau mendaftarkan diri menjadi bagian dalam angkatan perjuangan kader berikutnya, pendaftaran kini tersedia secara digital melalui tautan registrasi di halaman web utama kami. Mari berkhidmat bersama demi kemakmuran umat dan bangsa Indonesia.
                  </p>
                </div>

                <div className="pt-8 mt-8 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {selectedNews.id}
                  </span>
                  <button
                    type="button"
                    onClick={onNewsClose}
                    className="px-5 py-2.5 border border-slate-200 hover:border-slate-350 text-slate-705 bg-white hover:bg-slate-50 rounded-xl text-xs tracking-widest uppercase transition-colors cursor-pointer font-bold shadow-sm"
                  >
                    Tutup Artikel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
