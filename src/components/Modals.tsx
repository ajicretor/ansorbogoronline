import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { X, Check, ArrowRight, Shield, Award, Calendar, User, Eye, Sparkles, Upload, Trash2, Volume2, VolumeX, ThumbsUp, Type, Sun, Moon } from "lucide-react";
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

const parseInlineMarkdown = (txt: string): React.ReactNode[] => {
  if (!txt) return [];
  const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\)|_.*?_|\*.*?\*)/g;
  const parts = txt.split(regex);

  return parts.map((part, i) => {
    if (!part) return null;
    
    // Bold check
    if (part.startsWith('**') && part.endsWith('**')) {
      const innerText = part.slice(2, -2);
      return <strong key={i} className="font-bold text-emerald-600 dark:text-emerald-400 font-sans">{innerText}</strong>;
    }
    
    // Link check: [label](url)
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const closeBracket = part.indexOf('](');
      const label = part.slice(1, closeBracket);
      const url = part.slice(closeBracket + 2, -1);
      return (
        <a 
          key={i} 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-emerald-600 dark:text-emerald-400 underline font-semibold hover:text-emerald-500 transition-colors"
        >
          {label}
        </a>
      );
    }

    // Italic check
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      const innerText = part.slice(1, -1);
      return <em key={i} className="italic">{innerText}</em>;
    }

    return part;
  });
};

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

  // Professional News Comfort Mode Reader States
  const [readerTheme, setReaderTheme] = useState<'dark' | 'light' | 'sepia'>('dark');
  const [readerFontSize, setReaderFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [likesCount, setLikesCount] = useState<{[id: string]: number}>({});
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);

  // State for News share copy / comments section
  const [newsComments, setNewsComments] = useState<{ [id: string]: Array<{ author: string; content: string; time: string }> }>({
    "news-ekraf-workshop": [
      { author: "Sahabat M. Rifqi", content: "Luar biasa program ekonomi kreatif ini, sangat membantu kemandirian sahabat-sahabat kader di tingkat PAC Kabupaten Bogor.", time: "03 Juni 2026, 11:24" },
      { author: "Kader Sukajaya", content: "Sinergi yang sangat mantap! Semoga pelatihan kewirausahaan ini bisa berkelanjutan di PAC kecamatan lainnya.", time: "02 Juni 2026, 19:12" },
      { author: "Banser Protokoler", content: "Siap mendukung dan mengawal jalannya kemandirian ekonomi pemuda Ansor Bogor!", time: "01 Juni 2026, 14:05" }
    ],
    "news-kaderisasi-raya": [
      { author: "Sahabat Farhan", content: "Massa pembaiatan yang luar biasa! Selamat bergabung sahabat-sahabat banser baru, mari jaga Aqidah Aswaja An-Nahdliyah.", time: "03 Juni 2026, 09:40" },
      { author: "Banser Senior Cibinong", content: "Disiplin tinggi, khidmat tanpa batas. Selamat bertugas barisan Banser Kabupaten Bogor!", time: "02 Juni 2026, 17:35" }
    ]
  });
  const [newCommentText, setNewCommentText] = useState("");
  const [showCommentsSection, setShowCommentsSection] = useState(false);
  const [justCopied, setJustCopied] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState("Tersalin!");

  // Helper inside news detail to resolve or prep comments on draft news
  const getCommentsForArticle = (id: string, title: string) => {
    if (newsComments[id]) return newsComments[id];
    const charSum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const count = (charSum % 2) + 2; 
    const base = [
      { author: "Sahabat Patriot Ansor", content: `Kabar gembira bagi Nahdliyin Bogor! Tulisan tentang "${title}" memberi gambaran nyata gerakan kepemudaan kita.`, time: "3 Jam yang lalu" },
      { author: "Kader Ansor Kecamatan", content: "Rapatkan barisan, satu komando mengawal instruksi pimpinan cabang PC GP Ansor Kabupaten Bogor.", time: "5 Jam yang lalu" },
      { author: "Banser Husada", content: "Sinergi ikhlas untuk kemaslahatan umat. Semoga Allah meridhoi khidmat kita.", time: "1 Hari yang lalu" }
    ];
    return base.slice(0, count);
  };

  const handleAddComment = (newsId: string) => {
    if (!newCommentText.trim()) return;
    const current = newsComments[newsId] || getCommentsForArticle(newsId, selectedNews?.title || "");
    const updated = [
      {
        author: "Tamu / Pengunjung",
        content: newCommentText.trim(),
        time: "Baru Saja"
      },
      ...current
    ];
    setNewsComments({ ...newsComments, [newsId]: updated });
    setNewCommentText("");
  };

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

  // Sync news comments view reset when article opens
  useEffect(() => {
    if (selectedNews) {
      setShowCommentsSection(false);
      setNewCommentText("");
      setJustCopied(false);
      setIsPlayingSpeech(false);
      setScrollPercent(0);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedNews]);
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
        {/* --- 4. NEWS FULL ARTICLE IMMERSIVE READ-DECK --- */}
        {selectedNews && (() => {
          // Determine theme-specific color mapping
          let bgClass = "bg-stone-950 text-stone-100";
          let docClass = "bg-neutral-900/90 border-neutral-800 text-neutral-100";
          let textMutedClass = "text-neutral-400";
          let titleClass = "text-white font-sans";
          let quoteClass = "border-l-4 border-emerald-500 bg-emerald-950/25 text-emerald-300";
          let dividerClass = "border-neutral-800";
          let commentsBg = "bg-neutral-950/80 border-neutral-800";
          let commentCardBg = "bg-neutral-900 border-neutral-800/80";

          if (readerTheme === "light") {
            bgClass = "bg-[#f4f2f0] text-stone-850";
            docClass = "bg-[#faf9f6] border-[#e4dec2]/50 text-stone-800 shadow-xl";
            textMutedClass = "text-stone-500";
            titleClass = "text-stone-900 font-sans";
            quoteClass = "border-l-4 border-emerald-600 bg-emerald-50/70 text-emerald-800";
            dividerClass = "border-stone-200";
            commentsBg = "bg-[#f1efed] border-[#e5dec5]";
            commentCardBg = "bg-white border-stone-200/60";
          } else if (readerTheme === "sepia") {
            bgClass = "bg-[#ebdcb9] text-[#433422]";
            docClass = "bg-[#f4ecd8] border-[#dfcca4]/60 text-[#433422] shadow-xl";
            textMutedClass = "text-[#6c593d]";
            titleClass = "text-[#2e2111] font-sans";
            quoteClass = "border-l-4 border-amber-600 bg-amber-500/10 text-[#543b17]";
            dividerClass = "border-[#dfcca4]/50";
            commentsBg = "bg-[#ebdca6]/30 border-[#dbca98]";
            commentCardBg = "bg-[#faf5e8] border-[#ebdca6]/70";
          }

          // Font sizing style mapping
          let fontBodySz = "text-base leading-relaxed sm:text-lg sm:leading-loose";
          if (readerFontSize === "sm") {
            fontBodySz = "text-sm leading-relaxed sm:text-sm sm:leading-relaxed";
          } else if (readerFontSize === "lg") {
            fontBodySz = "text-lg leading-loose sm:text-xl sm:leading-loose";
          }

          const currentLikes = likesCount[selectedNews.id] || 
            (Number(selectedNews.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 25) + 32);

          const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
            const el = e.currentTarget;
            const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
            setScrollPercent(Math.min(100, Math.max(0, pct)));
          };

          const handleSpeechToggle = () => {
            if (!window.speechSynthesis) {
              alert("Browser Anda tidak mendukung text-to-speech audio.");
              return;
            }
            if (isPlayingSpeech) {
              window.speechSynthesis.cancel();
              setIsPlayingSpeech(false);
            } else {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(
                `${selectedNews.title}. Kabar Kategori ${selectedNews.category}. Oleh ${selectedNews.author}. Isi Kabar: ${selectedNews.content.replace(/[#*`_]/g, '')}`
              );
              utterance.lang = "id-ID";
              utterance.rate = 1.0;
              utterance.onend = () => setIsPlayingSpeech(false);
              utterance.onerror = () => setIsPlayingSpeech(false);
              window.speechSynthesis.speak(utterance);
              setIsPlayingSpeech(true);
            }
          };

          const handleIncrementLikes = () => {
            const prevVal = likesCount[selectedNews.id] || currentLikes;
            setLikesCount({
              ...likesCount,
              [selectedNews.id]: prevVal + 1
            });
          };

          return (
            <div 
              className={`fixed inset-0 z-50 overflow-y-auto transition-colors duration-300 font-sans ${bgClass}`}
              onScroll={handleScroll}
            >
              {/* Horizontal scroll progress bar */}
              <div 
                className="fixed top-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 z-[9999] transition-all duration-75"
                style={{ width: `${scrollPercent}%` }}
              />

              {/* Reader Floating Controls / Action Bar */}
              <header className={`sticky top-0 z-[50] w-full backdrop-blur-md px-4 py-3 sm:px-6 border-b flex justify-between items-center transition-all duration-300 ${
                readerTheme === "light" 
                  ? "bg-white/80 border-stone-200 text-stone-800 shadow-sm"
                  : readerTheme === "sepia"
                    ? "bg-[#f4ecd8]/90 border-[#dfcca4] text-[#433422] shadow-sm"
                    : "bg-neutral-950/80 border-neutral-800/80 text-white shadow-lg"
              }`}>
                {/* Left: Back Link */}
                <button
                  type="button"
                  onClick={onNewsClose}
                  className="flex items-center gap-2 hover:scale-105 active:scale-95 transition-all outline-none font-bold text-xs tracking-wide cursor-pointer text-emerald-500 border-0 bg-transparent"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span className="hidden sm:inline font-sans">Kembali Ke Portal</span>
                  <span className="sm:hidden font-sans">Kembali</span>
                </button>

                {/* Center: Controls panel */}
                <div className="flex items-center gap-3 md:gap-5">
                  {/* Speech reader AI */}
                  <button
                    type="button"
                    onClick={handleSpeechToggle}
                    className={`p-1.5 sm:px-3 sm:py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all border-0 cursor-pointer ${
                      isPlayingSpeech 
                        ? "bg-emerald-600/90 text-white animate-pulse" 
                        : "bg-emerald-600/10 hover:bg-emerald-600/25 text-emerald-500"
                    }`}
                    title={isPlayingSpeech ? "Berhentikan Suara" : "Dengarkan Berita (AI Reader)"}
                  >
                    {isPlayingSpeech ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span className="hidden md:inline">{isPlayingSpeech ? "Mengudara (Mute)" : "Dengarkan AI"}</span>
                  </button>

                  <div className="h-4 w-px bg-current opacity-20" />

                  {/* Sizing Toggles */}
                  <div className="flex items-center gap-1 bg-current/5 p-1 rounded-full border border-current/10">
                    <button
                      type="button"
                      onClick={() => setReaderFontSize("sm")}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all border-0 ${
                        readerFontSize === "sm" ? "bg-emerald-600 text-white" : "hover:bg-current/10 text-current bg-transparent"
                      }`}
                      title="Ukuran Font Kecil (A-)"
                    >
                      A-
                    </button>
                    <button
                      type="button"
                      onClick={() => setReaderFontSize("md")}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-all border-0 ${
                        readerFontSize === "md" ? "bg-emerald-600 text-white" : "hover:bg-current/10 text-current bg-transparent"
                      }`}
                      title="Ukuran Font Normal"
                    >
                      A
                    </button>
                    <button
                      type="button"
                      onClick={() => setReaderFontSize("lg")}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer transition-all border-0 ${
                        readerFontSize === "lg" ? "bg-emerald-600 text-white" : "hover:bg-current/10 text-current bg-transparent"
                      }`}
                      title="Ukuran Font Besar (A+)"
                    >
                      A+
                    </button>
                  </div>

                  <div className="h-4 w-px bg-current opacity-20" />

                  {/* Theme Switches */}
                  <div className="flex items-center gap-1 bg-current/5 p-1 rounded-full border border-current/10">
                    <button
                      type="button"
                      onClick={() => setReaderTheme("dark")}
                      className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all border-0 bg-transparent ${
                        readerTheme === "dark" ? "bg-stone-850 text-emerald-450 border border-emerald-500/20" : "text-current hover:bg-current/10"
                      }`}
                      title="Mode Malam"
                    >
                      <Moon className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setReaderTheme("sepia")}
                      className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all border-0 bg-transparent ${
                        readerTheme === "sepia" ? "bg-amber-600 text-[#f4ecd8]" : "text-current hover:bg-current/10"
                      }`}
                      title="Mode Sore (Eye Care Sepia)"
                    >
                      <Type className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setReaderTheme("light")}
                      className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all border-0 bg-transparent ${
                        readerTheme === "light" ? "bg-emerald-700 text-white" : "text-current hover:bg-current/10"
                      }`}
                      title="Mode Siang"
                    >
                      <Sun className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Right: Close button */}
                <button
                  type="button"
                  onClick={onNewsClose}
                  className="p-1.5 rounded-full hover:bg-current/10 active:scale-95 transition-all text-current cursor-pointer border-0 bg-transparent"
                  title="Tutup & Keluar"
                >
                  <X className="w-5 h-5" />
                </button>
              </header>

              {/* Main Reading Canvas */}
              <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 md:py-16">
                <article className={`p-6 sm:p-10 md:p-14 rounded-3xl border transition-all duration-300 font-sans ${docClass}`}>
                  {/* Article Category & Time Read Block */}
                  <div className="flex flex-wrap items-center gap-3 mb-6 select-none text-xs tracking-wider uppercase font-extrabold font-sans">
                    <span className="bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 font-sans">
                      <Sparkles className="w-3 h-3 fill-emerald-500" />
                      {selectedNews.category}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-30" />
                    <span className={textMutedClass}>{selectedNews.readTime}</span>
                  </div>

                  {/* Wide Immersive Headline Title */}
                  <h1 className={`text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-8 ${titleClass}`}>
                    {selectedNews.title}
                  </h1>

                  {/* Contributor Profile Header Card */}
                  <div className={`p-4 rounded-2xl border mb-10 flex flex-wrap items-center justify-between gap-4 select-none ${
                    readerTheme === "dark" ? "bg-black/20 border-neutral-800" : "bg-black/[0.02] border-stone-200"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-md font-sans border border-emerald-500/20">
                        {selectedNews.author.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className={`text-xs font-bold font-sans flex items-center gap-1 ${titleClass}`}>
                          {selectedNews.author}
                          <span className="inline-flex items-center bg-emerald-500/20 text-emerald-500 text-[8px] font-sans px-1 rounded-sm uppercase tracking-wide font-black">
                            ✓ Verified
                          </span>
                        </p>
                        <p className={`text-[10px] mt-0.5 ${textMutedClass}`}>Kontributor Redaksi PC GP Ansor Bogor</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-stone-500 leading-none">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500/85" />
                      <span className={`font-mono text-[11px] font-bold ${textMutedClass}`}>{selectedNews.date}</span>
                    </div>
                  </div>

                  {/* Full size news picture cover */}
                  {selectedNews.imageUrl && (
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-current/5 mb-12 group select-none">
                      <img
                        src={selectedNews.imageUrl}
                        alt={selectedNews.title}
                        className="w-full h-auto max-h-[500px] object-cover hover:scale-[1.02] transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-[10px] text-white/80 font-mono tracking-wide">Visual Dokumentasi • GP Ansor Bogor</span>
                      </div>
                    </div>
                  )}

                  {/* Short description block */}
                  <p className={`text-base font-medium font-sans mb-8 leading-relaxed italic opacity-95 pl-4 border-l-4 border-emerald-500/60 ${textMutedClass}`}>
                    "{selectedNews.excerpt}"
                  </p>

                  <div className="h-px w-full bg-current opacity-10 my-8" />

                  {/* Dynamic Structured News Body (Render markdown and custom spaces gracefully) */}
                  <div className={`space-y-6 break-words whitespace-pre-wrap ${fontBodySz} font-sans`}>
                    {selectedNews.content.split("\n\n").map((section, idx) => {
                      const text = section.trim();
                      if (!text) return null;

                      // Blockquote render check
                      if (text.startsWith(">")) {
                        const quoteText = text.replace(/^>\s*/gm, "");
                        return (
                          <blockquote key={idx} className={`p-4 my-2 rounded-xl border-l-[4px] leading-relaxed select-text italic ${quoteClass}`}>
                            {parseInlineMarkdown(quoteText)}
                          </blockquote>
                        );
                      }

                      // Header 3/4 check
                      if (text.startsWith("###")) {
                        return (
                          <h3 key={idx} className={`text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-2 font-sans ${titleClass}`}>
                            {parseInlineMarkdown(text.replace(/^###\s*/, ""))}
                          </h3>
                        );
                      }

                      // Header 1/2 check
                      if (text.startsWith("##")) {
                        return (
                          <h2 key={idx} className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-9 mb-3 border-b pb-2 ${titleClass} border-current/10`}>
                            {parseInlineMarkdown(text.replace(/^##\s*/, ""))}
                          </h2>
                        );
                      }

                      // List render check
                      if (text.startsWith("- ") || text.startsWith("* ") || /^\d+\.\s/.test(text)) {
                        const lines = text.split("\n");
                        const isOrdered = /^\d+\.\s/.test(text);
                        const listItems = lines.map((line, lIdx) => {
                          const cleanLine = line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "");
                          return (
                            <li key={lIdx} className="leading-relaxed">
                              {parseInlineMarkdown(cleanLine)}
                            </li>
                          );
                        });
                        
                        if (isOrdered) {
                          return (
                            <ol key={idx} className={`list-decimal pl-6 space-y-2 my-2 font-sans opacity-95 ${textMutedClass}`}>
                              {listItems}
                            </ol>
                          );
                        } else {
                          return (
                            <ul key={idx} className={`list-disc pl-6 space-y-2 my-2 font-sans opacity-95 ${textMutedClass}`}>
                              {listItems}
                            </ul>
                          );
                        }
                      }

                      // Standard paragraph custom spacing
                      return (
                        <p key={idx} className="opacity-95 leading-relaxed text-justify select-text">
                          {parseInlineMarkdown(text)}
                        </p>
                      );
                    })}
                  </div>

                  <div className={`h-px w-full my-12 ${dividerClass}`} />

                  {/* Interaction Block: Appreciation Clap and Share Tray */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-4">
                    {/* Clap block */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleIncrementLikes}
                        className="w-12 h-12 rounded-full cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all shadow-md group border border-emerald-500/30"
                        title="Beri Apresiasi Kabar (Suka / Hormat)"
                      >
                        <ThumbsUp className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
                      </button>
                      <div className="text-left font-sans">
                        <p className={`text-xs font-bold leading-none ${titleClass}`}>{currentLikes} Nahdliyin menyukai</p>
                        <p className={`text-[10px] mt-1 ${textMutedClass}`}>Apresiasi tulisan khidmat kontributor</p>
                      </div>
                    </div>
                                       {/* Social Shares */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold tracking-wider mr-2 uppercase ${textMutedClass}`}>Bagikan Redaksi</span>
                      {/* WA */}
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`[Ansor Bogor Online News]:\n"${selectedNews.title}"\n\nBaca laporan selengkapnya di portal resmi:\n${window.location.origin}/?news=${selectedNews.id}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-[#25D366] hover:bg-[#1ebd5d] text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm font-sans"
                        title="WhatsApp"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.031 2c-5.511 0-9.982 4.47-9.982 9.98 0 1.95.56 3.78 1.529 5.34l-1.026 3.75 3.843-1.01c1.5.91 3.25 1.44 5.122 1.44 5.51 0 9.98-4.47 9.98-9.98C22.013 6.47 17.542 2 12.031 2zm6.657 14.15c-.27.76-1.37 1.39-1.9 1.43-.53.04-1.2-.1-3.41-.98-2.83-1.12-4.66-3.99-4.8-4.18-.14-.19-1.15-1.53-1.15-2.92 0-1.39.73-2.07 1-2.35.26-.27.53-.34.71-.34H10c.18 0 .42-.07.65.48.24.58.81 1.98.88 2.12.07.14.12.3.02.49-.1.19-.15.3-.3.48-.15.17-.32.39-.46.52-.16.15-.33.32-.14.65.19.32.85 1.4 1.83 2.27 1.25 1.11 2.3 1.45 2.63 1.62.33.16.52.12.72-.1.2-.23.88-1.02 1.12-1.37.23-.35.47-.3.8-.17.33.12 2.1.99 2.46 1.17.36.18.6.27.69.42.08.15.08.87-.2 1.63z" />
                        </svg>
                      </a>
                      {/* FB */}
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + "/?news=" + selectedNews.id)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-[#3B5998] hover:bg-[#2d4373] text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm font-sans"
                        title="Facebook"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                        </svg>
                      </a>
                      {/* Telegram */}
                      <a
                        href={`https://t.me/share/url?url=${encodeURIComponent(window.location.origin + "/?news=" + selectedNews.id)}&text=${encodeURIComponent(selectedNews.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-[#0088cc] hover:bg-[#0077b3] text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm font-sans"
                        title="Telegram"
                      >
                        <svg className="w-3.5 h-3.5 translate-y-[0.5px] -translate-x-[0.5px]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.88 7.32l-1.68 7.92c-.12.56-.48.68-.96.4l-2.56-1.88-1.24 1.2c-.12.12-.24.24-.36.24l.16-2.52 4.6-4.16c.2-.16-.04-.24-.3-.08l-5.68 3.56-2.44-.76c-.52-.16-.52-.52.12-.76l9.6-3.72c.44-.16.84.12.64.96z" />
                        </svg>
                      </a>
                      {/* Copy Link */}
                      <button
                        type="button"
                        onClick={() => {
                          const directUrl = `${window.location.origin}/?news=${selectedNews.id}`;
                          navigator.clipboard.writeText(directUrl);
                          setCopiedMessage("Tersalin!");
                          setJustCopied(true);
                          setTimeout(() => setJustCopied(false), 2000);
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-sm relative text-white border-0 ${
                          justCopied ? "bg-emerald-600" : "bg-neutral-500 hover:bg-neutral-600"
                        }`}
                        title="Salin Tautan Resmi"
                      >
                        {justCopied ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </svg>
                        )}
                        {justCopied && (
                          <span className="absolute bg-emerald-600 px-1.5 py-0.5 rounded text-[8px] font-bold text-white bottom-full mb-1 left-1/2 -translate-x-1/2 shadow whitespace-nowrap font-sans">
                            Copied
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                {/* Comments Collapsible Form Area */}
                <div className={`mt-10 p-5 sm:p-7 rounded-2xl border transition-colors duration-300 ${commentsBg}`}>
                  <div className="flex justify-between items-center mb-6 select-none font-sans">
                    <h4 className={`text-xs sm:text-sm font-black uppercase tracking-wider font-sans flex items-center gap-2 ${titleClass}`}>
                      <span>💬</span> Kolom Diskusi ({getCommentsForArticle(selectedNews.id, selectedNews.title).length} Komentar)
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowCommentsSection(!showCommentsSection)}
                      className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] tracking-wide active:scale-95 transition-all cursor-pointer border-0"
                    >
                      {showCommentsSection ? "Sembunyikan" : "Tulis Opini"}
                    </button>
                  </div>

                  {showCommentsSection && (
                    <div className="space-y-4 mb-6 font-sans">
                      <textarea
                        placeholder="Ketik komentar atau opini suportif Anda selaku kader disini..."
                        value={newCommentText}
                        onChange={e => setNewCommentText(e.target.value)}
                        className={`w-full p-4 rounded-xl text-xs sm:text-sm outline-none border focus:border-emerald-500 leading-relaxed font-sans transition-all text-left ${
                          readerTheme === "dark" ? "bg-stone-900 border-neutral-800 text-white" : "bg-white border-stone-250 text-slate-800"
                        }`}
                        rows={3}
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleAddComment(selectedNews.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 hover:scale-[1.02] cursor-pointer border-0"
                        >
                          Kirim Komentar Positif
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Render existing comments scroll stack */}
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 font-sans">
                    {getCommentsForArticle(selectedNews.id, selectedNews.title).map((comment, index) => (
                      <div key={index} className={`p-4 rounded-xl text-left select-text shadow-sm transition-colors duration-300 ${commentCardBg}`}>
                        <div className="flex justify-between items-center mb-2 font-sans select-none text-[10px] sm:text-xs">
                          <span className={`font-bold ${titleClass}`}>{comment.author}</span>
                          <span className={textMutedClass}>{comment.time}</span>
                        </div>
                        <p className={`text-xs sm:text-sm leading-relaxed ${
                          readerTheme === "light" ? "text-stone-700" : readerTheme === "sepia" ? "text-[#54432d]" : "text-neutral-300"
                        }`}>{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Article footer credit line */}
                <div className={`mt-14 pt-6 border-t font-mono text-[9px] uppercase tracking-widest flex flex-wrap justify-between items-center gap-3 ${dividerClass} ${textMutedClass}`}>
                  <span>ID: {selectedNews.id}</span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" /> Jurnalisme Santri PC GP Ansor Bogor
                  </span>
                </div>
              </article>

              <div className="flex justify-center mt-12 select-none">
                <button
                  type="button"
                  onClick={onNewsClose}
                  className="bg-emerald-600 hover:bg-emerald-500 hover:scale-105 active:scale-95 text-white font-black tracking-widest uppercase text-xs px-8 py-3 rounded-2xl transition-all shadow-lg border border-emerald-500/20 cursor-pointer animate-pulse"
                >
                  Tutup Lembar Berita
                </button>
              </div>
            </div>
          </div>
        );
        })()}
      </AnimatePresence>
    </>
  );
}
