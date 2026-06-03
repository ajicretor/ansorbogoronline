import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { X, Check, ArrowRight, Shield, Award, Calendar, User, Eye, Sparkles, Upload, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProgramItem, NewsArticle, Registrant } from "../types";
import { useCMS } from "../context/CMSContext";

interface ModalsProps {
  // Join Modal state
  isJoinOpen: boolean;
  onJoinClose: () => void;
  initialRegType?: "select" | "member" | "kaderisasi";
  
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
  initialRegType,
  selectedProgram,
  onProgramClose,
  isVideoOpen,
  onVideoClose,
  selectedNews,
  onNewsClose,
}: ModalsProps) {
  const { heroConfig, registrantsData, setRegistrantsData, officialPamphlet } = useCMS();
  // Form handling inside Join Modal
  const [regType, setRegType] = useState<"select" | "member" | "kaderisasi">("select");

  // State for official flyer interactive hover magnifier
  const [zoomScale, setZoomScale] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: any) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  // Sync state with preselected pathways when opening Join modal
  useEffect(() => {
    if (isJoinOpen) {
      setRegType(initialRegType || "select");
      setFormStep("input");
      setFormErrors({});
    }
  }, [isJoinOpen, initialRegType]);
  const [formData, setFormData] = useState({
    name: "",
    nik: "",
    email: "",
    whatsapp: "",
    district: "",
    reason: "",
    terms: false,
    
    // Extra fields for Kaderisasi
    desa: "",
    kabupaten: "Kabupaten Bogor",
    tempatLahir: "",
    tanggalLahir: "",
    ukuranKaos: "L",
    pendidikanAkhir: "SMA / Sederajat",
    pendidikanPesantren: "",
    pekerjaan: "",
    golonganDarah: "O",
    statusPernikahan: "Belum Kawin",
    pamfletFile: ""
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setFormErrors((prev) => ({ ...prev, pamfletFile: "Ukuran file pamflet tidak boleh melebihi 2MB" }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, pamfletFile: reader.result as string }));
        setFormErrors((prev) => ({ ...prev, pamfletFile: "" }));
      };
      reader.onerror = () => {
        setFormErrors((prev) => ({ ...prev, pamfletFile: "Gagal membaca berkas pamflet" }));
      };
      reader.readAsDataURL(file);
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
      errors.whatsapp = "No. HP/WhatsApp harus antara 10 hingga 14 digit angka";
    }
    if (!formData.district) errors.district = "Pilih kecamatan domisili Anda";
    if (!formData.terms) errors.terms = "Anda harus menyetujui syarat & ketentuan";

    // Kaderisasi extra validations
    if (regType === "kaderisasi") {
      if (!formData.desa.trim()) errors.desa = "Nama desa / kelurahan harus diisi";
      if (!formData.kabupaten.trim()) errors.kabupaten = "Kabupaten / Kota harus diisi";
      if (!formData.tempatLahir.trim()) errors.tempatLahir = "Tempat lahir harus diisi";
      if (!formData.tanggalLahir.trim()) errors.tanggalLahir = "Tanggal lahir harus diisi";
      if (!formData.pekerjaan.trim()) errors.pekerjaan = "Pekerjaan saat ini harus diisi";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormStep("loading");
    setTimeout(() => {
      const prefix = regType === "kaderisasi" ? "KADER-" : "ANSOR-";
      const randomId = prefix + Math.floor(100000 + Math.random() * 900000);
      setGeneratedCardId(randomId);

      // Create new pending registrant record with optional Kaderisasi details
      const newCandidate: Registrant = {
        id: randomId,
        name: formData.name,
        nik: formData.nik,
        email: formData.email,
        whatsapp: formData.whatsapp,
        district: formData.district,
        reason: formData.reason || "",
        status: "pending",
        createdAt: new Date().toISOString(),
        registrationType: regType,
        ...(regType === "kaderisasi" ? {
          desa: formData.desa,
          kabupaten: formData.kabupaten,
          tempatLahir: formData.tempatLahir,
          tanggalLahir: formData.tanggalLahir,
          ukuranKaos: formData.ukuranKaos,
          pendidikanAkhir: formData.pendidikanAkhir,
          pendidikanPesantren: formData.pendidikanPesantren,
          pekerjaan: formData.pekerjaan,
          golonganDarah: formData.golonganDarah,
          statusPernikahan: formData.statusPernikahan,
          pamfletFile: formData.pamfletFile,
        } : {})
      };

      // Persist in state and database
      setRegistrantsData([newCandidate, ...registrantsData]);
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
      desa: "",
      kabupaten: "Kabupaten Bogor",
      tempatLahir: "",
      tanggalLahir: "",
      ukuranKaos: "L",
      pendidikanAkhir: "SMA / Sederajat",
      pendidikanPesantren: "",
      pekerjaan: "",
      golonganDarah: "O",
      statusPernikahan: "Belum Kawin",
      pamfletFile: ""
    });
    setFormErrors({});
    setFormStep("input");
    setRegType("select");
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
              className={`relative w-full ${formStep === "success" ? "max-w-md" : regType === "kaderisasi" ? "max-w-2xl" : regType === "select" ? "max-w-xl" : "max-w-lg"} bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden text-slate-800 z-10 transition-all duration-300`}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-50/50 via-white to-white border-b border-slate-100 px-6 py-5 text-slate-900 relative text-left">
                <h3 className="text-lg sm:text-xl font-display font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  {regType === "select" && "Pilih Jalur Pendaftaran"}
                  {regType === "member" && "Pendaftaran Anggota GP Ansor"}
                  {regType === "kaderisasi" && "Pendaftaran Kaderisasi Resmi GP Ansor"}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-sans">
                  {regType === "select" && "Silakan pilih jenis pendaftaran yang ingin Anda ikuti"}
                  {regType === "member" && "Bergabunglah dengan GP Ansor PC Kabupaten Bogor Sekarang"}
                  {regType === "kaderisasi" && "Formulir keikutsertaan Diklat Kaderisasi Resmi (PKD, DIKLATSAR BANSER, dll.)"}
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
                {regType === "select" && formStep === "input" && (
                  <div className="space-y-5 py-4 text-left">
                    <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider font-mono text-center">
                      Selamat Datang di Portal Registrasi PC GP Ansor Kabupaten Bogor
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Frame 1: Pendaftaran Anggota */}
                      <button
                        type="button"
                        onClick={() => { setRegType("member"); setFormErrors({}); }}
                        className="flex flex-col items-center justify-between p-6 bg-slate-50 hover:bg-slate-100/90 border-2 border-slate-200/60 hover:border-emerald-600 rounded-2xl transition-all group text-center cursor-pointer min-h-[220px]"
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
                            <User className="w-5 h-5" />
                          </div>
                          <h4 className="font-display font-bold text-sm text-slate-900 mb-1.5">
                            Daftar Anggota GP Ansor
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium font-sans leading-relaxed">
                            Pendaftaran umum anggota baru untuk memperoleh Kartu Anggota Digital (CAD) PC GP Ansor Kabupaten Bogor.
                          </p>
                        </div>
                        <span className="mt-4 px-4 py-1.5 bg-emerald-600 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-full group-hover:bg-emerald-700 transition-colors">
                          Pilih Daftar Anggota &rarr;
                        </span>
                      </button>

                      {/* Frame 2: Daftar Kaderisasi */}
                      <button
                        type="button"
                        onClick={() => { setRegType("kaderisasi"); setFormErrors({}); }}
                        className="flex flex-col items-center justify-between p-6 bg-slate-50 hover:bg-slate-100/90 border-2 border-slate-200/60 hover:border-amber-500 rounded-2xl transition-all group text-center cursor-pointer min-h-[220px]"
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
                            <Award className="w-5 h-5" />
                          </div>
                          <h4 className="font-display font-bold text-sm text-slate-900 mb-1.5">
                            Daftar Kaderisasi Resmi
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium font-sans leading-relaxed">
                            Formulir pendaftaran bagi calon peserta kegiatan kaderisasi (PKD, DIKLATSAR Banser, & Pendidikan Lanjutan).
                          </p>
                        </div>
                        <span className="mt-4 px-4 py-1.5 bg-amber-600 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-full group-hover:bg-amber-700 transition-colors">
                          Pilih Daftar Kaderisasi &rarr;
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* --- FLOW A: ORDINARY MEMBER REGISTRATION FORM （EXISTING FORM） --- */}
                {regType === "member" && formStep === "input" && (
                  <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
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
                        className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-4 transition-all bg-slate-50/50 ${formErrors.name ? "border-red-400 focus:ring-red-500/10" : "border-slate-200 focus:ring-emerald-555/10 focus:border-emerald-500"}`}
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
                        className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-4 transition-all bg-slate-50/50 ${formErrors.nik ? "border-red-400 focus:ring-red-500/10" : "border-slate-200 focus:ring-emerald-555/10 focus:border-emerald-500"}`}
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
                          className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-4 transition-all bg-slate-50/50 ${formErrors.email ? "border-red-400 focus:ring-red-500/10" : "border-slate-200 focus:ring-emerald-555/10 focus:border-emerald-500"}`}
                        />
                        {formErrors.email && (
                          <p className="text-red-500 text-xs mt-1.5 font-medium font-sans">{formErrors.email}</p>
                        )}
                      </div>

                      {/* WhatsApp */}
                      <div>
                        <label htmlFor="whatsapp" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                          No. WhatsApp / HP <span className="text-emerald-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="whatsapp"
                          id="whatsapp"
                          value={formData.whatsapp}
                          onChange={handleInputChange}
                          placeholder="0812xxxxxxxx"
                          className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-4 transition-all bg-slate-50/50 ${formErrors.whatsapp ? "border-red-400 focus:ring-red-500/10" : "border-slate-200 focus:ring-emerald-555/10 focus:border-emerald-500"}`}
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
                        className="w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-4 transition-all bg-slate-50/50 resize-none font-sans border-slate-200 focus:ring-emerald-555/10 focus:border-emerald-500"
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

                    {/* Bottom Navigator */}
                    <div className="flex justify-between items-center gap-4 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => { setRegType("select"); setFormErrors({}); }}
                        className="px-5 py-2.5 border border-slate-250 hover:bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] rounded-xl transition-all cursor-pointer font-sans"
                      >
                        Pilih Jalur
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest text-[11px] rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        Kirim Pendaftaran
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                )}


                {/* --- FLOW B: TRAINING/KADERISASI FORM (NEW DETAILED MODAL) --- */}
                {regType === "kaderisasi" && formStep === "input" && (
                  <form onSubmit={handleFormSubmit} className="space-y-5 text-left">
                    {officialPamphlet && (
                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 mb-2 text-left">
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest font-mono mb-2">● Pamflet / Flyer Kegiatan Resmi</p>
                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                          <div
                            className="relative w-28 sm:w-24 aspect-[3/4] rounded-xl overflow-hidden shadow-md border border-slate-250 bg-slate-100 shrink-0 mx-auto sm:mx-0 cursor-zoom-in group"
                            onMouseEnter={() => setZoomScale(true)}
                            onMouseLeave={() => setZoomScale(false)}
                            onMouseMove={handleMouseMove}
                          >
                            <img
                              src={officialPamphlet}
                              alt="Pamflet Kegiatan Resmi"
                              referrerPolicy="no-referrer"
                              style={{
                                transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                                transform: zoomScale ? 'scale(2.8)' : 'scale(1)'
                              }}
                              className="w-full h-full object-contain select-none transition-transform duration-150 ease-out"
                            />
                          </div>
                          <div className="flex-1 space-y-1.5 self-center font-sans">
                            <h4 className="text-xs font-bold text-slate-800 leading-snug">Pamflet Kegiatan Kaderisasi PC GP Ansor</h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              Sistem otomatis mendeteksi pamflet aktif kaderisasi PC GP Ansor Kabupaten Bogor. <strong className="text-amber-600">Sorot/arahkan pointer kursor ke gambar pamflet untuk memperbesar rincian info</strong>.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 1. NAMA LENGKAP */}
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
                          placeholder="Ahmad Hidayatullah"
                          className={`w-full px-3 py-2 rounded-lg border text-xs text-slate-800 focus:outline-none focus:ring-4 transition-all bg-slate-50/50 ${formErrors.name ? "border-red-400 focus:ring-red-500/10" : "border-slate-200 focus:ring-amber-500/10 focus:border-amber-500"}`}
                        />
                        {formErrors.name && (
                          <p className="text-red-500 text-[10px] mt-1 font-semibold">{formErrors.name}</p>
                        )}
                      </div>

                      {/* 2. NIK */}
                      <div>
                        <label htmlFor="nik" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                          NIK KTP (16 Digit) <span className="text-emerald-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="nik"
                          id="nik"
                          maxLength={16}
                          value={formData.nik}
                          onChange={handleInputChange}
                          placeholder="3201xxxxxxxxxxxx"
                          className={`w-full px-3 py-2 rounded-lg border text-xs text-slate-800 focus:outline-none focus:ring-4 transition-all bg-slate-50/50 ${formErrors.nik ? "border-red-400 focus:ring-red-500/10" : "border-slate-200 focus:ring-amber-500/10 focus:border-amber-500"}`}
                        />
                        {formErrors.nik && (
                          <p className="text-red-500 text-[10px] mt-1 font-semibold">{formErrors.nik}</p>
                        )}
                      </div>

                      {/* 3. DESA */}
                      <div>
                        <label htmlFor="desa" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                          Desa / Kelurahan <span className="text-emerald-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="desa"
                          id="desa"
                          value={formData.desa}
                          onChange={handleInputChange}
                          placeholder="Contoh: Sukamanah"
                          className={`w-full px-3 py-2 rounded-lg border text-xs text-slate-800 focus:outline-none focus:ring-4 transition-all bg-slate-50/50 ${formErrors.desa ? "border-red-400 focus:ring-red-500/10" : "border-slate-200 focus:ring-amber-500/10 focus:border-amber-500"}`}
                        />
                        {formErrors.desa && (
                          <p className="text-red-500 text-[10px] mt-1 font-semibold">{formErrors.desa}</p>
                        )}
                      </div>

                      {/* 4. KECAMATAN */}
                      <div>
                        <label htmlFor="district" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                          Kecamatan Domisili <span className="text-emerald-600">*</span>
                        </label>
                        <select
                          name="district"
                          id="district"
                          value={formData.district}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 rounded-lg border text-xs text-slate-800 focus:outline-none focus:ring-4 bg-slate-50/50 ${formErrors.district ? "border-red-400 focus:ring-red-500/10" : "border-slate-200 focus:ring-amber-500/10 focus:border-amber-500"} transition-all`}
                        >
                          <option value="">Pilih Kecamatan...</option>
                          {BOGOR_DISTRICTS.map((dist) => (
                            <option key={dist} value={dist}>{dist}</option>
                          ))}
                        </select>
                        {formErrors.district && (
                          <p className="text-red-500 text-[10px] mt-1 font-semibold">{formErrors.district}</p>
                        )}
                      </div>

                      {/* 5. KABUPATEN / KOTA */}
                      <div>
                        <label htmlFor="kabupaten" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                          Kabupaten / Kota <span className="text-emerald-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="kabupaten"
                          id="kabupaten"
                          value={formData.kabupaten}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-lg border text-xs text-slate-800 focus:outline-none focus:ring-4 transition-all bg-slate-50/50 border-slate-200 focus:ring-amber-500/10 focus:border-amber-500"
                        />
                        {formErrors.kabupaten && (
                          <p className="text-red-500 text-[10px] mt-1 font-semibold">{formErrors.kabupaten}</p>
                        )}
                      </div>

                      {/* 6. TEMPAT LAHIR */}
                      <div>
                        <label htmlFor="tempatLahir" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                          Tempat Lahir <span className="text-emerald-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="tempatLahir"
                          id="tempatLahir"
                          value={formData.tempatLahir}
                          onChange={handleInputChange}
                          placeholder="Bogor"
                          className={`w-full px-3 py-2 rounded-lg border text-xs text-slate-800 focus:outline-none focus:ring-4 transition-all bg-slate-50/50 ${formErrors.tempatLahir ? "border-red-400 focus:ring-red-500/10" : "border-slate-200 focus:ring-amber-500/10 focus:border-amber-500"}`}
                        />
                        {formErrors.tempatLahir && (
                          <p className="text-red-500 text-[10px] mt-1 font-semibold">{formErrors.tempatLahir}</p>
                        )}
                      </div>

                      {/* 7. TANGGAL LAHIR */}
                      <div>
                        <label htmlFor="tanggalLahir" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                          Tanggal Lahir <span className="text-emerald-600">*</span>
                        </label>
                        <input
                          type="date"
                          name="tanggalLahir"
                          id="tanggalLahir"
                          value={formData.tanggalLahir}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 rounded-lg border text-xs text-slate-800 focus:outline-none focus:ring-4 transition-all bg-slate-50/50 ${formErrors.tanggalLahir ? "border-red-400 focus:ring-red-500/10" : "border-slate-200 focus:ring-amber-500/10 focus:border-amber-500"}`}
                        />
                        {formErrors.tanggalLahir && (
                          <p className="text-red-500 text-[10px] mt-1 font-semibold">{formErrors.tanggalLahir}</p>
                        )}
                      </div>

                      {/* 8. UKURAN KAOS */}
                      <div>
                        <label htmlFor="ukuranKaos" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                          Ukuran Kaos <span className="text-emerald-600">*</span>
                        </label>
                        <select
                          name="ukuranKaos"
                          id="ukuranKaos"
                          value={formData.ukuranKaos}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-lg border text-xs text-slate-800 focus:outline-none focus:ring-4 transition-all bg-slate-50/50 border-slate-200 focus:ring-amber-500/10 focus:border-amber-500 cursor-pointer"
                        >
                          <option value="S">S (Small)</option>
                          <option value="M">M (Medium)</option>
                          <option value="L">L (Large)</option>
                          <option value="XL">XL (Extra Large)</option>
                          <option value="XXL">XXL (Double Extra Large)</option>
                          <option value="XXXL">XXXL (Triple Extra Large)</option>
                        </select>
                      </div>

                      {/* 9. NO HP */}
                      <div>
                        <label htmlFor="whatsapp" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                          No. Handphone (WhatsApp) <span className="text-emerald-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="whatsapp"
                          id="whatsapp"
                          value={formData.whatsapp}
                          onChange={handleInputChange}
                          placeholder="0812xxxxxxxx"
                          className={`w-full px-3 py-2 rounded-lg border text-xs text-slate-800 focus:outline-none focus:ring-4 transition-all bg-slate-50/50 ${formErrors.whatsapp ? "border-red-400 focus:ring-red-500/10" : "border-slate-200 focus:ring-amber-500/10 focus:border-amber-500"}`}
                        />
                        {formErrors.whatsapp && (
                          <p className="text-red-500 text-[10px] mt-1 font-semibold">{formErrors.whatsapp}</p>
                        )}
                      </div>

                      {/* 10. EMAIL */}
                      <div>
                        <label htmlFor="email" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                          Alamat Email Aktif <span className="text-emerald-600">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="email@domain.com"
                          className={`w-full px-3 py-2 rounded-lg border text-xs text-slate-800 focus:outline-none focus:ring-4 transition-all bg-slate-50/50 ${formErrors.email ? "border-red-400 focus:ring-red-500/10" : "border-slate-200 focus:ring-amber-500/10 focus:border-amber-500"}`}
                        />
                        {formErrors.email && (
                          <p className="text-red-500 text-[10px] mt-1 font-semibold">{formErrors.email}</p>
                        )}
                      </div>

                      {/* 11. PENDIDIKAN AKHIR */}
                      <div>
                        <label htmlFor="pendidikanAkhir" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                          Pendidikan Terakhir <span className="text-emerald-600">*</span>
                        </label>
                        <select
                          name="pendidikanAkhir"
                          id="pendidikanAkhir"
                          value={formData.pendidikanAkhir}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-lg border text-xs text-slate-800 focus:outline-none focus:ring-4 transition-all bg-slate-50/50 border-slate-200 focus:ring-amber-500/10 focus:border-amber-500 cursor-pointer"
                        >
                          <option value="SD">SD (Sekolah Dasar)</option>
                          <option value="SMP">SMP / Sederajat</option>
                          <option value="SMA / Sederajat">SMA / Sederajat</option>
                          <option value="Diploma (D3)">Diploma (D3)</option>
                          <option value="Sarjana (S1)">Sarjana (S1)</option>
                          <option value="Magister (S2)">Magister (S2)</option>
                          <option value="Doktor (S3)">Doktor (S3)</option>
                        </select>
                      </div>

                      {/* 12. PENDIDIKAN PESANTREN */}
                      <div>
                        <label htmlFor="pendidikanPesantren" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                          Pendidikan Pesantren (Nama Ponpes, Jika Ada)
                        </label>
                        <input
                          type="text"
                          name="pendidikanPesantren"
                          id="pendidikanPesantren"
                          value={formData.pendidikanPesantren}
                          onChange={handleInputChange}
                          placeholder="Nama Pondok Pesantren / Lama Belajar"
                          className="w-full px-3 py-2 rounded-lg border text-xs text-slate-800 focus:outline-none focus:ring-4 transition-all bg-slate-50/50 border-slate-200 focus:ring-amber-500/10 focus:border-amber-500"
                        />
                      </div>

                      {/* 13. PEKERJAAN */}
                      <div>
                        <label htmlFor="pekerjaan" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                          Pekerjaan Saat Ini <span className="text-emerald-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="pekerjaan"
                          id="pekerjaan"
                          value={formData.pekerjaan}
                          onChange={handleInputChange}
                          placeholder="Swasta / Guru / Wiraswasta"
                          className={`w-full px-3 py-2 rounded-lg border text-xs text-slate-800 focus:outline-none focus:ring-4 transition-all bg-slate-50/50 ${formErrors.pekerjaan ? "border-red-400 focus:ring-red-500/10" : "border-slate-200 focus:ring-amber-500/10 focus:border-amber-500"}`}
                        />
                        {formErrors.pekerjaan && (
                          <p className="text-red-500 text-[10px] mt-1 font-semibold">{formErrors.pekerjaan}</p>
                        )}
                      </div>

                      {/* 14. GOLONGAN DARAH */}
                      <div>
                        <label htmlFor="golonganDarah" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                          Golongan Darah <span className="text-emerald-600">*</span>
                        </label>
                        <select
                          name="golonganDarah"
                          id="golonganDarah"
                          value={formData.golonganDarah}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-lg border text-xs text-slate-800 focus:outline-none focus:ring-4 transition-all bg-slate-50/50 border-slate-200 focus:ring-amber-500/10 focus:border-amber-500 cursor-pointer"
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="AB">AB</option>
                          <option value="O">O</option>
                          <option value="Tidak Tahu">Tidak Tahu / Belum Cek</option>
                        </select>
                      </div>

                      {/* 15. STATUS PERNIKAHAN */}
                      <div className="md:col-span-2">
                        <label htmlFor="statusPernikahan" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                          Status Pernikahan <span className="text-emerald-600">*</span>
                        </label>
                        <select
                          name="statusPernikahan"
                          id="statusPernikahan"
                          value={formData.statusPernikahan}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-lg border text-xs text-slate-800 focus:outline-none focus:ring-4 transition-all bg-slate-50/50 border-slate-200 focus:ring-amber-500/10 focus:border-amber-500 cursor-pointer"
                        >
                          <option value="Belum Kawin">Belum Kawin</option>
                          <option value="Kawin">Kawin</option>
                          <option value="Cerai Hidup">Cerai Hidup</option>
                          <option value="Cerai Mati">Cerai Mati</option>
                        </select>
                      </div>
                    </div>

                    {/* Catatan Syarat Berkas */}
                    <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-left border-dashed">
                      <p className="text-[11px] text-amber-800 font-bold leading-relaxed font-sans flex items-start gap-1.5">
                        <span className="shrink-0 text-amber-600 mt-0.5 font-bold font-sans text-xs">***)</span>
                        <span>Peserta wajib membawa KTP/KK dan surat rekomendasi dari PAC setempat.</span>
                      </p>
                    </div>

                    {/* Sumpah Setia (Terms checkbox) */}
                    <div className="flex items-start gap-2.5 pt-2 border-t border-slate-100 font-sans">
                      <input
                        type="checkbox"
                        name="terms"
                        id="terms"
                        checked={formData.terms}
                        onChange={handleInputChange}
                        className="mt-1 w-4 h-4 rounded text-amber-600 accent-amber-600 bg-white border-slate-200"
                      />
                      <label htmlFor="terms" className="text-[11px] text-slate-500 leading-relaxed font-sans font-medium">
                        Saya bersedia dan siap taat menjalankan amalan ajaran Islam Ahlussunnah wal Jama'ah An-Nahdliyah, setia mempertahankan persatuan NKRI, berkhidmat penuh mengabdikan diri di bawah panji-panji perkumpulan Gerakan Pemuda Ansor Nahdlatul Ulama, serta taat dan patuh kepada pimpinan gerakan pemuda ansor. <span className="text-emerald-600">*</span>
                      </label>
                    </div>
                    {formErrors.terms && (
                      <p className="text-red-500 text-xs font-medium font-sans text-left">{formErrors.terms}</p>
                    )}

                    {/* Bottom Navigator */}
                    <div className="flex justify-between items-center gap-4 pt-4 border-t border-slate-150">
                      <button
                        type="button"
                        onClick={() => { setRegType("select"); setFormErrors({}); }}
                        className="px-5 py-2.5 border border-slate-250 hover:bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] rounded-xl transition-all cursor-pointer font-sans"
                      >
                        Pilih Jalur
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold uppercase tracking-wider text-[11px] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        Kirim Pendaftaran
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                )}

                {formStep === "loading" && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-2 border-emerald-600 border-t-slate-150 rounded-full animate-spin"></div>
                    <h4 className="font-display font-semibold text-base mt-6 text-slate-800">
                      Memproses Pendaftaran Anda...
                    </h4>
                    <p className="text-xs text-slate-500 mt-2 text-center max-w-xs font-sans font-medium">
                      Sistem sedang mengolah dan menghasilkan berkas digital terverifikasi dalam database GP Ansor Kabupaten Bogor.
                    </p>
                  </div>
                )}

                {formStep === "success" && (
                  <div className="py-2 text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 border border-amber-200 rounded-full flex items-center justify-center mb-4 animate-bounce">
                      <Shield className="w-5 h-5 stroke-[2.5px]" />
                    </div>
                    <h4 className="font-display font-bold text-xl text-slate-900">
                      Pendaftaran Terkirim!
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-650 max-w-sm mx-auto mt-2 font-sans font-medium leading-relaxed text-center">
                      Terima kasih! Berkas Anda telah masuk ke sistem antrean {regType === "kaderisasi" ? "Calon Kader Kaderisasi Resmi" : "Kader Baru"} GP Ansor Kabupaten Bogor. <span className="font-bold text-amber-700">Status berkas saat ini masih "PENDING"</span> dan memerlukan persetujuan manual oleh Admin.
                    </p>

                    {/* DIGITAL CARD PREVIEW (PENDING WATERMARK OVERLAY) */}
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mt-6 w-full max-w-sm rounded-xl p-6 bg-gradient-to-br from-amber-600 via-amber-800 to-slate-900 text-white relative shadow-xl border border-amber-500/10 overflow-hidden"
                    >
                      {/* Blurred Watermark overlay */}
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1.5px] flex flex-col items-center justify-center z-10 p-4">
                        <div className="bg-amber-500 text-slate-950 px-3 py-1.5 rounded-full font-bold text-[9px] tracking-widest uppercase shadow-lg flex items-center gap-1.5 border border-amber-400">
                          <Shield className="w-3.5 h-3.5 animate-pulse text-red-700 fill-current" />
                          PENDING APPROVAL
                        </div>
                        <p className="text-[10px] text-amber-200/90 mt-2.5 font-semibold font-sans max-w-[240px] text-center leading-relaxed">
                          Berkas akan dirilis setelah diverifikasi oleh Admin/PAC GP Ansor Kabupaten Bogor.
                        </p>
                      </div>

                      {/* Card Content (slightly faint behind overlay) */}
                      <div className="flex justify-between items-start border-b border-white/10 pb-4 opacity-30">
                        <div className="text-left">
                          <p className="text-[9px] text-amber-200 font-mono tracking-widest uppercase font-bold">
                            {regType === "kaderisasi" ? "KARTU CAD LIST KADERISASI" : "KARTU ANGGOTA DIGITAL (CAD)"}
                          </p>
                          <h5 className="font-display font-bold text-base mt-1 tracking-widest text-white uppercase">
                            GP ANSOR BOGOR
                          </h5>
                        </div>
                        <Award className="w-6 h-6 text-amber-250" />
                      </div>

                      <div className="mt-6 text-left space-y-3 opacity-30">
                        <div>
                          <p className="text-[8px] text-white/60 tracking-widest uppercase font-mono">
                            NAMA LENGKAP PENDAFTAR
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
                              ID REGISTRASI
                            </p>
                            <p className="text-xs font-mono font-bold text-amber-250">
                              {generatedCardId}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between opacity-30">
                        <span className="inline-flex items-center gap-1.5 text-[9px] bg-white/10 text-white py-1 px-2.5 rounded-full font-semibold border border-white/20 font-mono tracking-wide">
                          <Sparkles className="w-3 h-3 text-amber-250" />
                          PENDING CAD
                        </span>
                        <span className="text-[9px] text-white/50 italic font-mono">
                          2026/2027
                        </span>
                      </div>
                    </motion.div>

                    {/* REDIRECT BANNER TO HIGH-FIDELITY OFFICIAL GOOGLE PLAY APP */}
                    <div className="mt-6 w-full bg-emerald-50/90 border border-emerald-200 rounded-xl p-4 text-left space-y-3.5 shadow-sm font-sans">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 bg-emerald-600 text-white rounded-lg text-xs font-bold shrink-0">
                          KTA
                        </div>
                        <div>
                          <h5 className="text-xs sm:text-sm font-bold text-emerald-950 font-display">
                            Langkah Wajib Selanjutnya: Pengisian KTA Ansor
                          </h5>
                          <p className="text-[11px] text-emerald-800 leading-relaxed mt-1 font-medium">
                            Untuk mendapatkan status keanggotaan penuh, calon anggota **diarahkan langsung** untuk mengunduh aplikasi resmi **KTA Ansor** di Google Play Store dan mengisi berkas pendaftaran di sana:
                          </p>
                        </div>
                      </div>

                      <div className="bg-white border border-emerald-100 rounded-lg p-2.5 flex items-center justify-between gap-2 overflow-hidden">
                        <div className="text-[10px] text-emerald-900 truncate font-mono select-all">
                          https://play.google.com/store/apps/details?id=com.si_tech.siapps&pcampaignid=web_share
                        </div>
                        <span className="text-[9px] bg-emerald-100 text-emerald-805 px-2 py-0.5 rounded font-bold uppercase shrink-0 font-mono">
                          PLAY STORE
                        </span>
                      </div>

                      <a
                        href="https://play.google.com/store/apps/details?id=com.si_tech.siapps&pcampaignid=web_share"
                        target="_blank"
                        rel="noreferrer referrer"
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold uppercase tracking-wider text-[11px] rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md text-center hover:scale-[1.01]"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        Unduh KTA Ansor di Play Store
                      </a>
                    </div>

                    <button
                      type="button"
                      id="finish-join"
                      onClick={resetJoinForm}
                      className="mt-6 w-full px-6 py-2.5 border border-slate-200 hover:border-slate-350 text-slate-800 bg-white hover:bg-slate-50 rounded-lg text-xs tracking-widest uppercase font-bold shadow-sm transition-colors cursor-pointer"
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
