import { useState, ChangeEvent, FormEvent } from "react";
import { Send, MapPin, Phone, Mail, Globe, Check, MessageSquare } from "lucide-react";

export default function InquiryForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<"idle" | "sending" | "success">("idle");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.name.trim()) nextErrors.name = "Nama lengkap wajib diisi";
    if (!formData.phone.trim()) {
      nextErrors.phone = "No. Telepon wajib diisi";
    } else if (!/^\d{9,15}$/.test(formData.phone)) {
      nextErrors.phone = "No. Telepon tidak valid (hanya angka, 9-15 digit)";
    }
    if (!formData.subject.trim()) nextErrors.subject = "Subjek wajib diisi";
    if (!formData.message.trim()) nextErrors.message = "Pesan wajib diisi";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitStatus("sending");
    setTimeout(() => {
      setSubmitStatus("success");
      setFormData({ name: "", phone: "", subject: "", message: "" });
    }, 1500);
  };

  return (
    <section id="kontak" className="py-24 bg-[#002D1E] text-neutral-200 relative overflow-hidden border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center relative mb-16">
          <span className="inline-block px-3 py-1 border border-ansor-gold/30 bg-ansor-gold/5 text-ansor-gold text-[10px] tracking-[0.2em] font-medium uppercase rounded-sm">
            KANTOR PC ANSOR BOGOR
          </span>
          <h3 className="font-display font-light text-3xl sm:text-4xl text-white tracking-tight mt-4">
            Hubungi <span className="italic font-serif text-ansor-gold/90 font-normal">Sekretariat Kami</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-8">
          
          {/* LEFT: Contact details & Mock Map Coordinates */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <div>
              <h4 className="font-display font-medium text-lg sm:text-xl text-white tracking-tight">
                Sekretariat PC GP Ansor
              </h4>
              <p className="mt-2 text-white/50 text-xs sm:text-sm leading-relaxed font-sans">
                Pintu kami senantiasa terbuka bagi penyampaian aspirasi, kolaborasi gerakan pemuda, saran pembangunan, maupun pendaftaran kader utama.
              </p>
            </div>

            <div className="space-y-4">
              {/* Address info card */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/5 border border-white/10 text-ansor-gold rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-xs tracking-widest text-[#a1a1aa] uppercase font-mono">Alamat Sekretariat</h5>
                  <p className="text-xs sm:text-sm text-white/70 mt-1 leading-relaxed font-sans">
                    Jl. Tegar Beriman, Cibinong, Kabupaten Bogor, Jawa Barat, Indonesia
                  </p>
                </div>
              </div>

              {/* Phone info card */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/5 border border-white/10 text-ansor-gold rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-xs tracking-widest text-[#a1a1aa] uppercase font-mono">No. Layanan & WhatsApp</h5>
                  <p className="text-xs sm:text-sm text-white/70 mt-1 font-sans">
                    +62 812-3456-7890 (Layanan Advokasi & Aspirasi)
                  </p>
                </div>
              </div>

              {/* Email info card */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/5 border border-white/10 text-ansor-gold rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-xs tracking-widest text-[#a1a1aa] uppercase font-mono">Surat Elektronik (Email)</h5>
                  <p className="text-xs sm:text-sm text-ansor-gold mt-1 font-semibold select-all font-sans">
                    info@ansorkabogor.or.id
                  </p>
                </div>
              </div>
            </div>

            {/* Simulated Map Coordinates Overlay */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[16/9] border border-white/10 bg-zinc-950 flex flex-col justify-end group">
              {/* Textured Vector Design representing map lines */}
              <div className="absolute inset-0 z-0 bg-neutral-950/40">
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-15 stroke-white/20 stroke-[0.3]" strokeDasharray="1,1">
                  {/* Grid layout represent streets */}
                  <line x1="10" y1="0" x2="10" y2="100" />
                  <line x1="30" y1="0" x2="30" y2="100" />
                  <line x1="60" y1="0" x2="60" y2="100" />
                  <line x1="80" y1="0" x2="80" y2="100" />
                  <line x1="0" y1="20" x2="100" y2="20" />
                  <line x1="0" y1="50" x2="100" y2="50" />
                  <line x1="0" y1="75" x2="100" y2="75" />
                  
                  {/* Styled curves represent cibinong lake/park */}
                  <path d="M 0,40 Q 40,80 80,40 T 100,50" fill="none" stroke="#eab308" strokeWidth="4" className="opacity-90" />
                  <polygon points="55,42 63,55 47,55" fill="#eab308" className="animate-bounce" />
                </svg>
              </div>

              <div className="relative z-10 bg-[#002D1E]/90 backdrop-blur-md p-4 flex items-center justify-between text-white border-t border-white/10">
                <div className="text-left leading-tight">
                  <p className="text-[10px] text-ansor-gold font-bold tracking-widest uppercase font-mono">
                    KOORDINAT GPS BOGOR
                  </p>
                  <p className="text-[9px] text-white/40 mt-1 font-mono">
                    Lat: -6.48152 | Lon: 106.82255
                  </p>
                </div>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 border border-white/20 bg-white/5 hover:bg-white hover:text-black text-white font-semibold text-[10px] uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Buka Peta
                </a>
              </div>
            </div>

          </div>

          {/* RIGHT: Send Message Form */}
          <div className="lg:col-span-7 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 md:p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative">
            <h4 className="font-display font-medium text-lg sm:text-xl text-white leading-none text-left flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-ansor-gold" />
              Kirim Aspirasi & Pertanyaan
            </h4>
            <div className="w-12 h-1 bg-ansor-gold/70 mt-3 rounded-full mb-8" />

            {submitStatus === "success" ? (
              <div className="py-12 text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-ansor-gold/10 text-ansor-gold rounded-full flex items-center justify-center border border-ansor-gold/20 mb-4 animate-bounce">
                  <Check className="w-5 h-5 stroke-[2.5px]" />
                </div>
                <h5 className="font-display font-medium text-lg text-white">
                  Pesan Anda Terkirim!
                </h5>
                <p className="text-xs sm:text-sm text-white/50 max-w-sm mt-2 font-sans">
                  Terima kasih, aspirasi Anda berhasil terinput. Humas Pimpinan Cabang GP Ansor Kabupaten Bogor akan segera menelaah dan membalas kontak Anda.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitStatus("idle")}
                  className="mt-6 px-5 py-2.5 border border-white/20 bg-white/5 hover:bg-white hover:text-black hover:border-white text-[10px] tracking-widest uppercase rounded-full font-medium transition-colors cursor-pointer"
                >
                  Kirim Pesan Baru
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-left">
                {/* Name */}
                <div>
                  <label htmlFor="form-name" className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1.5 font-mono">
                    Nama Lengkap Anda <span className="text-ansor-gold">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="form-name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Contoh: Muhammad Rafiyudin"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm text-white placeholder-white/20 focus:outline-none focus:ring-4 transition-all bg-[#002D1E]/60 ${errors.name ? "border-red-500/50 focus:ring-red-500/10" : "border-white/10 focus:ring-ansor-gold/10 focus:border-ansor-gold"}`}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-xs mt-1.5 font-medium font-sans">{errors.name}</p>
                  )}
                </div>

                {/* Telephone */}
                <div>
                  <label htmlFor="form-phone" className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1.5 font-mono">
                    No. Telepon / WhatsApp <span className="text-ansor-gold">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    id="form-phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Contoh: 0857xxxxxxxx"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm text-white placeholder-white/20 focus:outline-none focus:ring-4 transition-all bg-[#002D1E]/60 ${errors.phone ? "border-red-500/50 focus:ring-red-500/10" : "border-white/10 focus:ring-ansor-gold/10 focus:border-ansor-gold"}`}
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-xs mt-1.5 font-medium font-sans">{errors.phone}</p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="form-subject" className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1.5 font-mono">
                    Subjek Keperluan <span className="text-ansor-gold">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    id="form-subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Contoh: Kerja Sama Sosialisasi / Tanya PKD"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm text-white placeholder-white/20 focus:outline-none focus:ring-4 transition-all bg-[#002D1E]/60 ${errors.subject ? "border-red-500/50 focus:ring-red-500/10" : "border-white/10 focus:ring-ansor-gold/10 focus:border-ansor-gold"}`}
                  />
                  {errors.subject && (
                    <p className="text-red-400 text-xs mt-1.5 font-medium font-sans">{errors.subject}</p>
                  )}
                </div>

                {/* Message Box */}
                <div>
                  <label htmlFor="form-message" className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1.5 font-mono">
                    Isi Pesan / Aspirasi Anda <span className="text-ansor-gold">*</span>
                  </label>
                  <textarea
                    name="message"
                    id="form-message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Sampaikan pesan Anda secara rinci, sopan dan santun..."
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm text-white placeholder-white/20 focus:outline-none focus:ring-4 transition-all bg-[#002D1E]/60 resize-none font-sans ${errors.message ? "border-red-500/50 focus:ring-red-500/10" : "border-white/10 focus:ring-ansor-gold/10 focus:border-ansor-gold"}`}
                  />
                  {errors.message && (
                    <p className="text-red-400 text-xs mt-1.5 font-medium font-sans">{errors.message}</p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  id="submit-message"
                  disabled={submitStatus === "sending"}
                  className="w-full mt-2 px-6 py-3 border border-ansor-gold/30 bg-ansor-gold/5 text-ansor-gold hover:bg-ansor-gold hover:text-slate-950 text-[11px] tracking-widest uppercase rounded-full font-medium transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitStatus === "sending" ? "Mengirim Aspirasi..." : "Kirim Aspirasi Pesan"}
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
