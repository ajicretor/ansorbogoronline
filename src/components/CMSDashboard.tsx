import React, { useState, useEffect } from "react";
import { useCMS } from "../context/CMSContext";
import { 
  X, Save, RotateCcw, Plus, Trash2, Edit2, Check, Database, Upload,
  FileText, LayoutGrid, Users, Image as ImageIcon, HelpCircle, ArrowLeft, Eye, MessageSquare, Sparkles,
  MapPin, Phone, Mail, Globe, Laptop, Lightbulb, GraduationCap, Heart, Star, Compass, BookOpen,
  Activity, TrendingUp, Sliders, Smartphone, QrCode, UserCheck, Lock, User, LogOut, Shield, Award, Copy, Terminal, Share2, ShieldCheck,
  Sun, Moon, Download
} from "lucide-react";
import AnsorLogo from "./AnsorLogo";
import { supabase } from "../lib/supabase";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  ProgramItem, NewsArticle, TeamMember, GalleryItem, FAQItem,
  AboutConfig, StrategicPillar, ImpactStat, ContactConfig, MenuStatus,
  DigitalServicesState, CMSUser, MenuLabels, KaderisasiRow, AdsConfig, Registrant
} from "../types";

export default function CMSDashboard() {
  const {
    heroConfig, setHeroConfig,
    aboutConfig, setAboutConfig,
    strategicPillars, setStrategicPillars,
    impactStats, setImpactStats,
    contactConfig, setContactConfig,
    adsConfig, setAdsConfig,
    programs, setPrograms,
    news, setNews,
    leaders, setLeaders,
    gallery, setGallery,
    digitalServices, setDigitalServices,
    menuStatus, setMenuStatus,
    menuLabels, setMenuLabels,
    users, setUsers,
    kaderisasiData, setKaderisasiData,
    registrantsData, setRegistrantsData,
    officialPamphlet, setOfficialPamphlet,
    resetToDefault,
    publishAllToSupabase,
    syncFromSupabase,
    setIsCmsOpen,
    theme,
    toggleTheme,
    lastSyncError
  } = useCMS();

  // --- LOGIN & AUTHENTICATION STATES ---
  const [currentUser, setCurrentUser] = useState<{ username: string; name: string; role: "superadmin" | "sekretariat" | "ketuacabang" } | null>(() => {
    const saved = sessionStorage.getItem("ansor_cms_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoadingAuth(true);

    const u = loginUsername.trim();
    const p = loginPassword;

    try {
      let data = null;
      let success = false;
      let userObj: { username: string; name: string; role: "superadmin" | "sekretariat" | "ketuacabang" } | null = null;

      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ username: u, password: p })
        });

        if (res.ok) {
          data = await res.json();
          if (data && data.success) {
            success = true;
            userObj = data.user;
          }
        } else {
          // If the endpoint is missing/returns a 404/5xx due to static deployment (like GitHub Pages)
          console.warn(`Host returned status ${res.status}. Attempting static client-side fallback.`);
          throw new Error("API not successfully resolved. Switching to fallback.");
        }
      } catch (fetchErr) {
        console.warn("Server login unavailable or failed, applying client-side fallback:", fetchErr);
        const lowerU = u.toLowerCase();

        // 1. Check client-side custom users context (e.g. added in User Management tab)
        const matchedLocal = users.find(
          x => x.username.toLowerCase() === lowerU && x.passwordHash === p
        );

        if (matchedLocal) {
          success = true;
          userObj = {
            username: matchedLocal.username,
            name: matchedLocal.name,
            role: matchedLocal.role
          };
        } else {
          // 2. Check hardcoded fallback accounts
          const staticUsers = [
            { id: "1", username: "admin", passwordHash: "adminansor1934", name: "Septa Aji", role: "superadmin" as const },
            { id: "2", username: "sekretariat", passwordHash: "sekretariat1934", name: "Sekretariat Cabang", role: "sekretariat" as const }
          ];
          const matchedStatic = staticUsers.find(
            x => x.username === lowerU && x.passwordHash === p
          );

          if (matchedStatic) {
            success = true;
            userObj = {
              username: matchedStatic.username,
              name: matchedStatic.name,
              role: matchedStatic.role
            };
          }
        }
      }

      if (success && userObj) {
        sessionStorage.setItem("ansor_cms_user", JSON.stringify(userObj));
        setCurrentUser(userObj);
        if (userObj.role === "superadmin") {
          setActiveTab("general");
        } else {
          setActiveTab("programs");
        }
        triggerToast(`Selamat datang kembali, ${userObj.name}!`);
      } else {
        setLoginError("Kombinasi Username & Password tidak sesuai!");
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setLoginError("Gagal menghubungi server untuk autentikasi!");
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Selected tab in the CMS (including users & labels configuration)
  type TabType = "general" | "about" | "programs" | "news" | "gallery" | "leaders" | "contact" | "analytics" | "services" | "users" | "registrants";
  const [activeTab, setActiveTab ] = useState<TabType>("general");
  const [isSyncingDb, setIsSyncingDb] = useState(false);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  // Check connection to Supabase table ‘ansor_bogor_cms’ on mount
  useEffect(() => {
    async function checkConnection() {
      try {
        const { data, error } = await supabase.from("ansor_bogor_cms").select("key").limit(1);
        if (error) {
          setDbConnected(false);
        } else {
          setDbConnected(true);
        }
      } catch (err) {
        setDbConnected(false);
      }
    }
    checkConnection();
  }, []);

  const handleManualDBSync = async () => {
    if (isSyncingDb) return;
    setIsSyncingDb(true);
    triggerToast("Menghubungi Supabase & mengunduh data ril terbaru...", "success");
    try {
      const success = await syncFromSupabase();
      if (success) {
        setDbConnected(true);
        triggerToast("Sinkronisasi Berhasil! Seluruh data diperbarui dari database.", "success");
      } else {
        setDbConnected(false);
        triggerToast("Sinkronisasi Gagal. Masih menampilkan data lokal (fallback).", "error");
      }
    } catch (err: any) {
      setDbConnected(false);
      triggerToast(`Koneksi gagal: ${err.message || err}`, "error");
    } finally {
      setIsSyncingDb(false);
    }
  };

  const [isSqlExpanded, setIsSqlExpanded] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Dynamic role permissions configured by Super Admin
  const [rolePermissions, setRolePermissions] = useState<Record<"sekretariat" | "ketuacabang", TabType[]>>(() => {
    try {
      const persisted = localStorage.getItem("ansor_cms_role_permissions");
      if (persisted) {
        const parsed = JSON.parse(persisted);
        if (parsed.sekretariat) {
          if (!parsed.sekretariat.includes("analytics")) parsed.sekretariat.push("analytics");
          if (!parsed.sekretariat.includes("registrants")) parsed.sekretariat.push("registrants");
        }
        if (parsed.ketuacabang) {
          if (!parsed.ketuacabang.includes("analytics")) parsed.ketuacabang.push("analytics");
          if (!parsed.ketuacabang.includes("registrants")) parsed.ketuacabang.push("registrants");
        }
        return parsed;
      }
    } catch (e) {
      console.error("Error loading role permissions:", e);
    }
    return {
      sekretariat: ["news", "gallery", "analytics", "registrants"],
      ketuacabang: ["news", "gallery", "analytics", "registrants"]
    };
  });

  // Automatically save permissions when edited
  useEffect(() => {
    localStorage.setItem("ansor_cms_role_permissions", JSON.stringify(rolePermissions));
  }, [rolePermissions]);

  // Safeguard tab permissions dynamically
  useEffect(() => {
    if (currentUser && currentUser.role !== "superadmin") {
      const role = currentUser.role;
      const allowed = rolePermissions[role] || [];
      if (!allowed.includes(activeTab)) {
        const fallback = allowed.length > 0 ? allowed[0] : null;
        if (fallback) {
          setActiveTab(fallback);
        }
      }
    }
  }, [currentUser, activeTab, rolePermissions]);

  // Selection states for editing/creating items
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Registrant filters & searches
  const [registrantSearch, setRegistrantSearch] = useState("");
  const [registrantFilterDistrict, setRegistrantFilterDistrict] = useState("");
  const [registrantFilterStatus, setRegistrantFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");

  // Sub-tab inside Calon Anggota (Registrants) CMS
  const [registrantSubTab, setRegistrantSubTab] = useState<"all" | "kaderisasi">("all");
  // State for draft official training pamphlet Base64 uploaded in the CMS
  const [draftPamphlet, setDraftPamphlet] = useState<string>(officialPamphlet || "");

  useEffect(() => {
    setDraftPamphlet(officialPamphlet || "");
  }, [officialPamphlet]);

  // Success toast/message state
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const triggerToast = (text: string, type: "success" | "error" = "success") => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg(null), 3500);
  };

  // --- ANALYTICS STATES & DYNAMIC SERVER-SIDE INTELLIGENCE ---
  const [selectedRange, setSelectedRange] = useState<"7d" | "30d">("7d");
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const [data7Days, setData7Days] = useState<Array<{ date: string; pageviews: number; uniques: number; reads: number; bounce: number }>>([
    { date: "22 Mei", pageviews: 890, uniques: 410, reads: 320, bounce: 26 },
    { date: "23 Mei", pageviews: 1120, uniques: 490, reads: 410, bounce: 25 },
    { date: "24 Mei", pageviews: 950, uniques: 450, reads: 330, bounce: 28 },
    { date: "25 Mei", pageviews: 1420, uniques: 620, reads: 590, bounce: 24 },
    { date: "26 Mei", pageviews: 1310, uniques: 580, reads: 480, bounce: 23 },
    { date: "27 Mei", pageviews: 1680, uniques: 790, reads: 640, bounce: 22 },
    { date: "28 Mei (Hari Ini)", pageviews: 1845, uniques: 920, reads: 798, bounce: 21 }
  ]);

  const [data30Days, setData30Days] = useState<Array<{ date: string; pageviews: number; uniques: number; reads: number; bounce: number }>>([
    { date: "01 Mei", pageviews: 650, uniques: 310, reads: 220, bounce: 28 },
    { date: "04 Mei", pageviews: 780, uniques: 380, reads: 280, bounce: 27 },
    { date: "07 Mei", pageviews: 890, uniques: 420, reads: 310, bounce: 26 },
    { date: "10 Mei", pageviews: 1100, uniques: 520, reads: 420, bounce: 25 },
    { date: "13 Mei", pageviews: 940, uniques: 450, reads: 330, bounce: 25 },
    { date: "16 Mei", pageviews: 1250, uniques: 590, reads: 490, bounce: 24 },
    { date: "19 Mei", pageviews: 1420, uniques: 670, reads: 580, bounce: 23 },
    { date: "22 Mei", pageviews: 1210, uniques: 580, reads: 490, bounce: 24 },
    { date: "25 Mei", pageviews: 1540, uniques: 710, reads: 630, bounce: 22 },
    { date: "28 Mei (Hari Ini)", pageviews: 1845, uniques: 920, reads: 798, bounce: 21 }
  ]);

  const [liveLogs, setLiveLogs] = useState<Array<{ id: string, message: string, time: string, isNew?: boolean }>>([
    { id: "log-1", message: "🟢 Pembaca dari Babakan Madang membuka artikel 'PKD Raya PC Ansor Bogor'", time: "Baru saja" },
    { id: "log-2", message: "🟢 Pengunjung dari Gunung Putri melamar pendaftaran keanggotaan Ansor", time: "2 menit yang lalu" },
    { id: "log-3", message: "🟢 Pembaca dari Ciawi membuka Galeri Dokumentasi Kegiatan", time: "5 menit yang lalu" },
    { id: "log-4", message: "🟢 Seseorang di Cibinong membaca rilis pers dewan pimpinan", time: "12 menit yang lalu" },
    { id: "log-5", message: "🟢 Pengunjung dari Jonggol mengunduh berkas lampiran", time: "20 menit yang lalu" }
  ]);

  const currentDataset = selectedRange === "7d" ? data7Days : data30Days;

  // Real-time Polling of Intel Monitoring statistics from our server
  useEffect(() => {
    let isMounted = true;

    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/analytics/stats");
        if (res.ok) {
          const stats = await res.json();
          if (stats.success && isMounted) {
            if (stats.data7Days) setData7Days(stats.data7Days);
            if (stats.data30Days) setData30Days(stats.data30Days);
            
            if (stats.liveLogs) {
              setLiveLogs(prev => {
                const prevIds = new Set(prev.map(l => l.id));
                return stats.liveLogs.map((log: any) => ({
                  ...log,
                  isNew: !prevIds.has(log.id)
                }));
              });
            }
          }
        }
      } catch (err) {
        console.error("Error polling analytics:", err);
      }
    };

    fetchAnalytics(); // Immediate run

    const interval = setInterval(fetchAnalytics, 3500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const renderDisabledSeksiWarning = (key: keyof MenuStatus, sName: string) => {
    if (menuStatus[key]) return null;
    return (
      <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center text-red-400 shrink-0">
            <X className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider">Seksi "{sName}" Dinonaktifkan di Landing Page</h4>
            <p className="text-[11px] text-red-200 leading-relaxed mt-0.5">Konten di bawah ini tetap dapat diedit secara normal, namun bagian seksi ini disembunyikan dari pengunjung landing page publik.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setMenuStatus({ ...menuStatus, [key]: true });
            triggerToast(`Seksi ${sName} diaktifkan kembali!`);
          }}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold tracking-wider rounded-xl uppercase hover:scale-[1.02] active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          ✓ Aktifkan Sekarang
        </button>
      </div>
    );
  };

  // Helper to read and convert local gallery images to Base64 (max limit 3.5MB to ensure safe localStorage fit)
  const handleImageUploadHelper = (
    e: React.ChangeEvent<HTMLInputElement>, 
    callback: (base64: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3.5 * 1024 * 1024) {
        alert("Ukuran gambar terlalu besar! Silakan pilih foto dengan ukuran maksimal 3.5MB agar pas disimpan di memori lokal.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          callback(reader.result);
          triggerToast("✓ Gambar berhasil dimuat dari galeri!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // --- 1. HERO & BRANDING STATE ---
  const [heroForm, setHeroForm] = useState(heroConfig);
  const handleHeroSave = (e: React.FormEvent) => {
    e.preventDefault();
    setHeroConfig(heroForm);
    triggerToast("Pengaturan umum branding & hero berhasil disimpan!");
  };

  // --- 1b. IMPACT STATISTICS STATE ---
  const [statsForm, setStatsForm] = useState<ImpactStat[]>(impactStats);
  const handleStatsSave = (e: React.FormEvent) => {
    e.preventDefault();
    setImpactStats(statsForm);
    triggerToast("Informasi metrik pencapaian (Impact Stats) berhasil diperbarui!");
  };

  const handleStatFieldChange = (index: number, field: keyof ImpactStat, value: string) => {
    const updated = [...statsForm];
    updated[index] = { ...updated[index], [field]: value };
    setStatsForm(updated);
  };

  // --- 2. ABOUT & PILAR GERAKAN STATE ---
  const [aboutForm, setAboutForm] = useState<AboutConfig>(aboutConfig);
  const [pillarsForm, setPillarsForm] = useState<StrategicPillar[]>(strategicPillars);

  const handleAboutSave = (e: React.FormEvent) => {
    e.preventDefault();
    setAboutConfig(aboutForm);
    triggerToast("Informasi sejarah & deskripsi profil organisasi berhasil disimpan!");
  };

  const handlePillarsSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStrategicPillars(pillarsForm);
    triggerToast("4 Pilar Utama Gerakan berhasil disimpan!");
  };

  const handlePillarFieldChange = (index: number, field: keyof StrategicPillar, value: string) => {
    const updated = [...pillarsForm];
    updated[index] = { ...updated[index], [field]: value };
    setPillarsForm(updated);
  };

  const handleGoalChange = (index: number, value: string) => {
    const updatedGoals = [...aboutForm.keyGoals];
    updatedGoals[index] = value;
    setAboutForm({ ...aboutForm, keyGoals: updatedGoals });
  };

  // --- 3. PROGRAMS STATE & CRUD ---
  const [programForm, setProgramForm] = useState<Partial<ProgramItem>>({
    title: "", description: "", extendedDescription: "", iconName: "ShieldCheck", imageUrl: "", stats: ""
  });

  const startProgramEdit = (item: ProgramItem) => {
    setEditingId(item.id);
    setIsCreating(false);
    setProgramForm(item);
  };

  const handleProgramSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!programForm.title || !programForm.description) {
      triggerToast("Judul dan ringkasan program wajib diisi!", "error");
      return;
    }

    setPrograms(programs.map(p => p.id === editingId ? { ...p, ...programForm } as ProgramItem : p));
    triggerToast("Detail program berhasil diperbarui!");
    cancelEdit();
  };

  // --- 4. NEWS STATE & CRUD ---
  const [newsForm, setNewsForm] = useState<Partial<NewsArticle>>({
    title: "", excerpt: "", content: "", date: "", category: "Pengkaderan", imageUrl: "", readTime: "", author: ""
  });

  const startNewsEdit = (item: NewsArticle) => {
    setEditingId(item.id);
    setIsCreating(false);
    setNewsForm(item);
  };

  const startNewsCreate = () => {
    setEditingId(null);
    setIsCreating(true);
    setNewsForm({
      id: "news-" + Date.now(),
      title: "",
      excerpt: "",
      content: "",
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      category: "Pengkaderan",
      imageUrl: "https://img.youtube.com/vi/dsNIOwcqaM8/0.jpg",
      readTime: "5 Menit Baca",
      author: "Humas PC Ansor"
    });
  };

  const handleNewsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title || !newsForm.content) {
      triggerToast("Judul dan isi berita wajib diisi!", "error");
      return;
    }

    if (isCreating) {
      setNews([newsForm as NewsArticle, ...news]);
      triggerToast("Kabar kegiatan baru berhasil ditambahkan!");
    } else {
      setNews(news.map(n => n.id === editingId ? { ...n, ...newsForm } as NewsArticle : n));
      triggerToast("Kabar kegiatan berhasil diperbarui!");
    }
    cancelEdit();
  };

  const deleteNewsItem = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kabar kegiatan ini?")) {
      setNews(news.filter(n => n.id !== id));
      triggerToast("Kabar kegiatan berhasil dihapus.");
    }
  };

  // News content helper function for formatting markdown inserts
  const handleInsertEditorTag = (tagStart: string, tagEnd = "", placeholder = "") => {
    const textarea = document.getElementById("news-content-textarea") as HTMLTextAreaElement | null;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const rawVal = newsForm.content || "";
    const selectedText = rawVal.substring(startPos, endPos) || placeholder;

    const beforeText = rawVal.substring(0, startPos);
    const afterText = rawVal.substring(endPos, rawVal.length);

    const insertedText = `${tagStart}${selectedText}${tagEnd}`;
    const newContent = beforeText + insertedText + afterText;

    setNewsForm({ ...newsForm, content: newContent });

    // Put focus back and restore selection cursor safely
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = startPos + tagStart.length + selectedText.length + tagEnd.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  // --- 5. GALLERY STATE & CRUD ---
  const [galleryForm, setGalleryForm] = useState<Partial<GalleryItem>>({
    title: "", category: "Kegiatan", imageUrl: "", description: ""
  });

  const startGalleryEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setIsCreating(false);
    setGalleryForm(item);
  };

  const startGalleryCreate = () => {
    setEditingId(null);
    setIsCreating(true);
    setGalleryForm({
      id: "gal-" + Date.now(),
      title: "",
      category: "Kegiatan",
      imageUrl: "https://img.youtube.com/vi/dsNIOwcqaM8/0.jpg",
      description: ""
    });
  };

  const handleGallerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.title || !galleryForm.imageUrl) {
      triggerToast("Judul dan url foto wajib diisi!", "error");
      return;
    }

    if (isCreating) {
      setGallery([...gallery, galleryForm as GalleryItem]);
      triggerToast("Foto dokumentasi kegiatan berhasil ditambahkan!");
    } else {
      setGallery(gallery.map(g => g.id === editingId ? { ...g, ...galleryForm } as GalleryItem : g));
      triggerToast("Foto dokumentasi berhasil diperbarui!");
    }
    cancelEdit();
  };

  const deleteGalleryItem = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus foto dokumentasi ini?")) {
      setGallery(gallery.filter(g => g.id !== id));
      triggerToast("Foto dokumentasi berhasil dihapus.");
    }
  };

  // --- 6. LEADERS STATE & CRUD ---
  const [leaderForm, setLeaderForm] = useState<Partial<TeamMember>>({
    name: "", role: "", imageUrl: ""
  });

  const startLeaderEdit = (item: TeamMember) => {
    setEditingId(item.id);
    setIsCreating(false);
    setLeaderForm(item);
  };

  const startLeaderCreate = () => {
    setEditingId(null);
    setIsCreating(true);
    setLeaderForm({
      id: "leader-" + Date.now(),
      name: "",
      role: "",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80"
    });
  };

  const handleLeaderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaderForm.name || !leaderForm.role) {
      triggerToast("Nama dan jabatan pimpinan wajib diisi!", "error");
      return;
    }

    if (isCreating) {
      setLeaders([...leaders, leaderForm as TeamMember]);
      triggerToast("Profil pimpinan baru berhasil ditambahkan!");
    } else {
      setLeaders(leaders.map(l => l.id === editingId ? { ...l, ...leaderForm } as TeamMember : l));
      triggerToast("Profil pimpinan berhasil diperbarui!");
    }
    cancelEdit();
  };

  const deleteLeaderItem = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus pimpinan ini dari dewan formasi?")) {
      setLeaders(leaders.filter(l => l.id !== id));
      triggerToast("Profil pimpinan berhasil dihapus.");
    }
  };

  // --- 7. FOOTER CONTACT STATE ---
  const [contactForm, setContactForm] = useState<ContactConfig>(contactConfig);
  const handleContactSave = (e: React.FormEvent) => {
    e.preventDefault();
    setContactConfig(contactForm);
    triggerToast("Informasi kontak footer dan koordinas peta berhasil disimpan!");
  };

  // --- 7b. ADS BANNER CONFIGURATION STATE ---
  const [adsForm, setAdsForm] = useState<AdsConfig>(adsConfig);
  const handleAdsSave = (e: React.FormEvent) => {
    e.preventDefault();
    setAdsConfig(adsForm);
    triggerToast("Konfigurasi banner iklan kemitraan berhasil diperbarui!");
  };

  // --- 8. DIGITAL SERVICES STATE ---
  const [servicesForm, setServicesForm] = useState<DigitalServicesState>(digitalServices);
  const handleServicesSave = (e: React.FormEvent) => {
    e.preventDefault();
    setDigitalServices(servicesForm);
    triggerToast("Konfigurasi tautan & QR Code Layanan Digital berhasil diperbarui!");
  };

  // --- 8b. CUSTOM MENU LABELS STATE ---
  const [menuLabelsForm, setMenuLabelsForm] = useState<MenuLabels>(menuLabels);
  const handleMenuLabelsSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMenuLabels(menuLabelsForm);
    triggerToast("Nama-nama menu / navigasi berhasil diperbarui dan disosialisasikan!");
  };

  // --- 8c. PORTAL USER MANAGEMENT CRUD (SUPER ADMIN - CONNECTED TO SUPABASE TABLE 'ansor_bogor_users') ---
  const LOCAL_FALLBACK_USERS: CMSUser[] = [
    { id: "1", username: "admin", passwordHash: "adminansor1934", name: "Septa Aji", role: "superadmin" },
    { id: "2", username: "sekretariat", passwordHash: "sekretariat1934", name: "Sekretariat Cabang", role: "sekretariat" },
    { id: "3", username: "ketua", passwordHash: "ketuaansor1934", name: "Ketua Pimpinan Cabang", role: "ketuacabang" }
  ];

  const [supabaseUsers, setSupabaseUsers] = useState<CMSUser[]>([]);
  const [isLoadingSupabaseUsers, setIsLoadingSupabaseUsers] = useState(false);
  const [supabaseUsersError, setSupabaseUsersError] = useState("");

  const fetchSupabaseUsers = async () => {
    setIsLoadingSupabaseUsers(true);
    setSupabaseUsersError("");
    try {
      const { data, error } = await supabase
        .from("ansor_bogor_users")
        .select("*")
        .order("username", { ascending: true });

      if (error) {
        console.error("Error fetching users from Supabase:", error);
        const msg = error.message;
        if (msg.includes("schema cache") || msg.includes("does not exist") || msg.includes("404")) {
          setSupabaseUsersError("Tabel 'ansor_bogor_users' belum terbuat dalam Supabase Anda. Website otomatis beralih menggunakan akun simulasi/demo di bawah agar fungsionalitas login & demo tetap bekerja prima.");
          setSupabaseUsers(LOCAL_FALLBACK_USERS);
        } else {
          setSupabaseUsersError(msg);
          setSupabaseUsers(LOCAL_FALLBACK_USERS);
        }
      } else if (data) {
        const mapped: CMSUser[] = data.map((u: any, idx: number) => ({
          id: u.username || `dbuser-${idx}`,
          username: u.username,
          passwordHash: u.password,
          name: u.name,
          role: (u.role === "superadmin" ? "superadmin" : u.role === "ketuacabang" ? "ketuacabang" : "sekretariat") as "superadmin" | "sekretariat" | "ketuacabang"
        }));
        setSupabaseUsers(mapped);
      }
    } catch (err: any) {
      console.error("Failed to fetch custom users:", err);
      setSupabaseUsersError("Gagal menghubungkan basis data. Menampilkan akun demo bawaan.");
      setSupabaseUsers(LOCAL_FALLBACK_USERS);
    } finally {
      setIsLoadingSupabaseUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users" && isSuperAdmin) {
      fetchSupabaseUsers();
    }
  }, [activeTab]);

  const [userForm, setUserForm] = useState<{ id: string; username: string; passwordHash: string; name: string; role: "superadmin" | "sekretariat" | "ketuacabang" }>({
    id: "",
    username: "",
    passwordHash: "",
    name: "",
    role: "sekretariat"
  });
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [userEditingId, setUserEditingId] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const resetUserForm = () => {
    setUserForm({ id: "", username: "", passwordHash: "", name: "", role: "sekretariat" });
    setIsEditingUser(false);
    setUserEditingId(null);
    setShowUserModal(false);
  };

  const handleUserSubmitDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.username.trim() || !userForm.passwordHash.trim() || !userForm.name.trim()) {
      triggerToast("Semua kolom pengelola sesi wajib diisi!", "error");
      return;
    }

    const cleanedUsername = userForm.username.trim().toLowerCase();

    try {
      setIsLoadingSupabaseUsers(true);
      const { error } = await supabase
        .from("ansor_bogor_users")
        .upsert({
          username: cleanedUsername,
          password: userForm.passwordHash,
          name: userForm.name,
          role: userForm.role
        });

      if (error) {
        console.error("Error upserting user:", error);
        const msg = error.message || "";
        if (msg.includes("schema cache") || msg.includes("does not exist") || msg.includes("404")) {
          triggerToast("Tabel 'ansor_bogor_users' belum terpasang di Supabase. Tempel & jalankan instruksi SQL di editor Supabase Anda!", "error");
        } else {
          triggerToast(`Gagal menyimpan pengguna ke database: ${error.message}`, "error");
        }
      } else {
        triggerToast(isEditingUser ? "Informasi akun pengguna berhasil diperbarui di Supabase!" : "Akun pengelola baru berhasil ditambahkan ke Supabase!");
        resetUserForm();
        await fetchSupabaseUsers();
      }
    } catch (err: any) {
      console.error("Failed to submit user to Supabase:", err);
      triggerToast(`Koneksi database terputus: ${err.message || err}`, "error");
    } finally {
      setIsLoadingSupabaseUsers(false);
    }
  };

  const startEditUserDirect = (u: CMSUser) => {
    setUserForm({ id: u.username, username: u.username, passwordHash: u.passwordHash, name: u.name, role: u.role });
    setIsEditingUser(true);
    setUserEditingId(u.username);
    setShowUserModal(true);
  };

  const deleteUserItemDirect = async (username: string) => {
    if (currentUser?.username.toLowerCase() === username.toLowerCase()) {
      triggerToast("Anda tidak bisa menghapus akun login Anda yang sedang aktif!", "error");
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus akun pengelola '${username}' dari database Supabase?`)) {
      try {
        setIsLoadingSupabaseUsers(true);
        const { error } = await supabase
          .from("ansor_bogor_users")
          .delete()
          .eq("username", username);

        if (error) {
          console.error("Error deleting user:", error);
          const msg = error.message || "";
          if (msg.includes("schema cache") || msg.includes("does not exist") || msg.includes("404")) {
            triggerToast("Gagal menghapus: Tabel 'ansor_bogor_users' belum dibuat di database Supabase Anda.", "error");
          } else {
            triggerToast(`Gagal menghapus pengguna: ${error.message}`, "error");
          }
        } else {
          triggerToast(`Pengelola '${username}' berhasil dihapus secara permanen.`);
          if (userEditingId === username) {
            resetUserForm();
          }
          await fetchSupabaseUsers();
        }
      } catch (err: any) {
        console.error("Error deleting user from database:", err);
        triggerToast(`Koneksi terputus: ${err.message || err}`, "error");
      } finally {
        setIsLoadingSupabaseUsers(false);
      }
    }
  };

  // --- 8d. DATA KADERISASI CRUD STATES & HANDLERS ---
  const [isKaderisasiModalOpen, setIsKaderisasiModalOpen] = useState(false);
  const [editingKaderisasiRow, setEditingKaderisasiRow] = useState<KaderisasiRow | null>(null);
  const [kaderisasiFilterTab, setKaderisasiFilterTab] = useState<"all" | "pkd" | "diklatsar" | "susbalan_pkl">("all");
  const [kaderisasiSearch, setKaderisasiSearch] = useState("");
  const [kaderisasiForm, setKaderisasiForm] = useState<{
    id?: string;
    type: "pkd" | "diklatsar" | "susbalan_pkl";
    group: string;
    angkatan: string;
    pesertaLulus: number;
    lokasi: string;
    tanggal: string;
    noSertifikat: string;
    cetak: "yes" | "no" | "belum";
    linkSertifikat: string;
  }>({
    type: "pkd",
    group: "",
    angkatan: "",
    pesertaLulus: 0,
    lokasi: "",
    tanggal: "",
    noSertifikat: "",
    cetak: "yes",
    linkSertifikat: ""
  });

  const startAddKaderisasi = () => {
    setEditingKaderisasiRow(null);
    setKaderisasiForm({
      type: "pkd",
      group: "",
      angkatan: "",
      pesertaLulus: 0,
      lokasi: "",
      tanggal: "",
      noSertifikat: "",
      cetak: "yes",
      linkSertifikat: ""
    });
    setIsKaderisasiModalOpen(true);
  };

  const startEditKaderisasi = (row: KaderisasiRow) => {
    setEditingKaderisasiRow(row);
    setKaderisasiForm({
      id: row.id,
      type: row.type,
      group: row.group,
      angkatan: row.angkatan,
      pesertaLulus: row.pesertaLulus,
      lokasi: row.lokasi,
      tanggal: row.tanggal,
      noSertifikat: row.noSertifikat,
      cetak: row.cetak,
      linkSertifikat: row.linkSertifikat
    });
    setIsKaderisasiModalOpen(true);
  };

  const handleKaderisasiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kaderisasiForm.group.trim() || !kaderisasiForm.angkatan.trim() || !kaderisasiForm.lokasi.trim() || !kaderisasiForm.tanggal.trim()) {
      triggerToast("PAC/Satkoryon, Angkatan, Lokasi, dan Tanggal wajib diisi!", "error");
      return;
    }

    if (editingKaderisasiRow) {
      // Edit mode
      const updated = kaderisasiData.map((row) => 
        row.id === editingKaderisasiRow.id 
          ? {
              ...row,
              type: kaderisasiForm.type,
              group: kaderisasiForm.group.trim(),
              angkatan: kaderisasiForm.angkatan.trim(),
              pesertaLulus: Number(kaderisasiForm.pesertaLulus) || 0,
              lokasi: kaderisasiForm.lokasi.trim(),
              tanggal: kaderisasiForm.tanggal.trim(),
              noSertifikat: kaderisasiForm.noSertifikat.trim(),
              cetak: kaderisasiForm.cetak,
              linkSertifikat: kaderisasiForm.linkSertifikat.trim()
            }
          : row
      );
      setKaderisasiData(updated);
      triggerToast("Data kaderisasi berhasil diperbarui!");
    } else {
      // Insert mode
      const newRow: KaderisasiRow = {
        id: "kaderisasi-" + Date.now(),
        type: kaderisasiForm.type,
        group: kaderisasiForm.group.trim(),
        angkatan: kaderisasiForm.angkatan.trim(),
        pesertaLulus: Number(kaderisasiForm.pesertaLulus) || 0,
        lokasi: kaderisasiForm.lokasi.trim(),
        tanggal: kaderisasiForm.tanggal.trim(),
        noSertifikat: kaderisasiForm.noSertifikat.trim(),
        cetak: kaderisasiForm.cetak,
        linkSertifikat: kaderisasiForm.linkSertifikat.trim()
      };
      setKaderisasiData([...kaderisasiData, newRow]);
      triggerToast("Data kaderisasi baru berhasil ditambahkan!");
    }
    setIsKaderisasiModalOpen(false);
  };

  const handleDeleteKaderisasi = (id: string, group: string, angkatan: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data kaderisasi ${group} Angkatan ${angkatan}?`)) {
      setKaderisasiData(kaderisasiData.filter((row) => row.id !== id));
      triggerToast("Data kaderisasi berhasil dihapus.");
    }
  };

  const handleApproveRegistrant = (id: string) => {
    const updated = registrantsData.map(r => r.id === id ? { ...r, status: "approved" as const } : r);
    setRegistrantsData(updated);
    triggerToast("Calon anggota berhasil disetujui (Approved)!", "success");
  };

  const handleRejectRegistrant = (id: string) => {
    const updated = registrantsData.map(r => r.id === id ? { ...r, status: "rejected" as const } : r);
    setRegistrantsData(updated);
    triggerToast("Calon anggota telah ditolak (Rejected).", "error");
  };

  const handleDeleteRegistrant = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus calon anggota bernama "${name}" secara permanen?`)) {
      const updated = registrantsData.filter(r => r.id !== id);
      setRegistrantsData(updated);
      triggerToast("Data calon anggota berhasil dihapus.", "success");
    }
  };

  const downloadKaderisasiCSV = (dataList: Registrant[]) => {
    try {
      const kaderisasiAttendees = dataList.filter(r => r.registrationType === "kaderisasi");
      if (kaderisasiAttendees.length === 0) {
        triggerToast("Tidak ada data calon pendaftar kaderisasi untuk diunduh.", "error");
        return;
      }

      // Headers for ALL columns filled by participants
      const headers = [
        "No",
        "ID Pendaftaran",
        "Tanggal Terdaftar",
        "Nama Lengkap",
        "NIK",
        "No HP / WhatsApp",
        "Email",
        "Kecamatan Domisili",
        "Desa",
        "Kabupaten / Kota",
        "Tempat Lahir",
        "Tanggal Lahir",
        "Usia",
        "Ukuran Kaos",
        "Pendidikan Akhir",
        "Pendidikan Pesantren",
        "Pekerjaan",
        "Golongan Darah",
        "Status Pernikahan",
        "Alasan Bergabung",
        "Status Kelayakan"
      ];

      // Format CSV rows
      const rows = kaderisasiAttendees.map((r, index) => {
        let ageStr = "-";
        if (r.tanggalLahir) {
          const parts = r.tanggalLahir.split("-");
          const birthYear = parseInt(parts[0]);
          if (!isNaN(birthYear)) {
            ageStr = (2026 - birthYear).toString() + " Tahun";
          }
        }

        return [
          (index + 1).toString(),
          r.id || "",
          r.createdAt ? new Date(r.createdAt).toLocaleDateString("id-ID") : "",
          r.name || "",
          `="${r.nik || ""}"`, // Protect numeric NIK from Excel truncation
          `="${r.whatsapp || ""}"`, // Protect phone numbers
          r.email || "",
          r.district || "",
          r.desa || "",
          r.kabupaten || "",
          r.tempatLahir || "",
          r.tanggalLahir || "",
          ageStr,
          r.ukuranKaos || "",
          r.pendidikanAkhir || "",
          r.pendidikanPesantren || "",
          r.pekerjaan || "",
          r.golonganDarah || "",
          r.statusPernikahan || "",
          (r.reason || "").replace(/"/g, '""'), // escape quotes
          r.status || ""
        ];
      });

      // Construct content
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(val => `"${val}"`).join(","))
      ].join("\n");

      // Trigger user browser download
      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Rekap_Pendaftaran_Kaderisasi_GP_Ansor_Full_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      triggerToast("Unduh rekap data kaderisasi lengkap (Excel/CSV) sukses!", "success");
    } catch (err: any) {
      console.error(err);
      triggerToast("Gagal mengunduh berkas lengkap.", "error");
    }
  };

  const handleOfficialPamphletChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB restriction
        triggerToast("Ukuran berkas pamflet kegiatan tidak boleh melebihi 2MB", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const b64 = reader.result as string;
        setDraftPamphlet(b64);
        triggerToast("Pamflet kegiatan berhasil dimuat. Silakan klik tombol Simpan untuk memublikasikannya!", "success");
      };
      reader.onerror = () => {
        triggerToast("Gagal mengunggah pamflet kegiatan", "error");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveOfficialPamphlet = () => {
    setOfficialPamphlet(draftPamphlet);
    triggerToast("Pamflet kegiatan kaderisasi resmi berhasil disimpan dan langsung terintegrasi ke seluruh sistem!", "success");
  };

  const handleRemoveOfficialPamphlet = () => {
    if (confirm("Apakah Anda yakin ingin menghapus pamflet kegiatan kaderisasi resmi ini?")) {
      setDraftPamphlet("");
      setOfficialPamphlet("");
      triggerToast("Brosur/Pamflet kegiatan resmi dicabut dari sistem.", "success");
    }
  };

  const handleDownloadPDF = (filteredArray: Registrant[]) => {
    try {
      if (!filteredArray || filteredArray.length === 0) {
        triggerToast("Tidak ada data calon anggota untuk diunduh.", "error");
        return;
      }

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Headers of GP Ansor
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(11, 115, 61); // Emerald green for GP Ansor branding
      doc.text("GERAKAN PEMUDA ANSOR KABUPATEN BOGOR", 14, 20);
      
      doc.setFontSize(9.5);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text("Pimpinan Cabang GP Ansor Kabupaten Bogor, Jawa Barat", 14, 25);
      doc.text("Sistem Informasi Digital Keanggotaan & Administrasi Calon Kader Baru", 14, 29);
      
      // Divider
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.4);
      doc.line(14, 32, 196, 32);

      // Title
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59); // Slate-900
      doc.text("LAPORAN DATA PENERIMAAN CALON ANGGOTA", 14, 40);

      // Metadata info box styling
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 100);
      doc.text(`Tanggal Cetak: ${new Date().toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB`, 14, 46);
      doc.text(`Total Calon Anggota: ${filteredArray.length} Orang`, 14, 51);
      
      const currentFilters = [];
      if (registrantFilterDistrict) currentFilters.push(`Kecamatan: ${registrantFilterDistrict}`);
      if (registrantFilterStatus !== "all") currentFilters.push(`Status: ${registrantFilterStatus.toUpperCase()}`);
      if (registrantSearch) currentFilters.push(`Kata Kunci: "${registrantSearch}"`);
      const filterText = currentFilters.join(", ") || "Semua Data";
      doc.text(`Filter Terpasang: ${filterText}`, 14, 56);

      // Set up the table data
      const tableHeaders = [["No", "ID CAD", "Tgl Terdaftar", "Nama Lengkap", "NIK", "Domisili", "WhatsApp", "Status"]];
      const tableBody = filteredArray.map((row, index) => [
        (index + 1).toString(),
        row.id,
        new Date(row.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        row.name,
        row.nik,
        `Kec. ${row.district}`,
        row.whatsapp,
        row.status.toUpperCase()
      ]);

      autoTable(doc, {
        startY: 61,
        head: tableHeaders,
        body: tableBody,
        theme: "striped",
        headStyles: {
          fillColor: [11, 115, 61], // Ansor emerald gold
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8.5
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [40, 40, 40]
        },
        columnStyles: {
          0: { cellWidth: 8, halign: "center" },
          1: { cellWidth: 20, fontStyle: "bold" },
          2: { cellWidth: 20 },
          3: { cellWidth: 35, fontStyle: "bold" },
          4: { cellWidth: 30 },
          5: { cellWidth: 32 },
          6: { cellWidth: 25 },
          7: { cellWidth: 16, fontStyle: "bold", halign: "center" }
        },
        didParseCell: (data) => {
          if (data.column.index === 7 && data.cell.section === "body") {
            const statusVal = data.cell.text[0];
            if (statusVal === "APPROVED") {
              data.cell.styles.textColor = [16, 122, 16]; // Deep Green
            } else if (statusVal === "PENDING") {
              data.cell.styles.textColor = [190, 110, 10]; // Amber
            } else if (statusVal === "REJECTED") {
              data.cell.styles.textColor = [185, 28, 28]; // Red
            }
          }
        },
        styles: {
          cellPadding: 2,
          valign: "middle"
        }
      });

      // Footer template
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7.5);
        doc.setTextColor(150, 150, 150);
        doc.text(
          "Sistem Informasi Digital Administrasi & Keanggotaan PC GP Ansor Kabupaten Bogor",
          14,
          287
        );
        doc.text(
          `Halaman ${i} dari ${pageCount}`,
          196,
          287,
          { align: "right" }
        );
      }

      const fileDate = new Date().toISOString().slice(0, 10);
      doc.save(`Calon_Anggota_GP_Ansor_Bogor_${fileDate}.pdf`);
      triggerToast("Laporan PDF Calon Anggota berhasil diunduh!", "success");
    } catch (error: any) {
      console.error("PDF download failed:", error);
      triggerToast(`Gagal mengunduh PDF: ${error.message || error}`, "error");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setNewsForm({ title: "", excerpt: "", content: "", date: "", category: "Pengkaderan", imageUrl: "", readTime: "", author: "" });
    setProgramForm({ title: "", description: "", extendedDescription: "", iconName: "ShieldCheck", imageUrl: "", stats: "" });
    setLeaderForm({ name: "", role: "", imageUrl: "" });
    setGalleryForm({ title: "", category: "Kegiatan", imageUrl: "", description: "" });
    resetUserForm();
  };

  // Synchronize dynamic form bindings when context loads or resets
  React.useEffect(() => {
    setHeroForm(heroConfig);
  }, [heroConfig]);

  React.useEffect(() => {
    setStatsForm(impactStats);
  }, [impactStats]);

  React.useEffect(() => {
    setAboutForm(aboutConfig);
  }, [aboutConfig]);

  React.useEffect(() => {
    setPillarsForm(strategicPillars);
  }, [strategicPillars]);

  React.useEffect(() => {
    setContactForm(contactConfig);
  }, [contactConfig]);

  React.useEffect(() => {
    setAdsForm(adsConfig);
  }, [adsConfig]);

  React.useEffect(() => {
    setServicesForm(digitalServices);
  }, [digitalServices]);

  React.useEffect(() => {
    setMenuLabelsForm(menuLabels);
  }, [menuLabels]);

  // --- LOGIN GATED RENDER ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-emerald-50/40 text-slate-800 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        
        {/* Subtle decorative background glow circles */}
        <div className="absolute top-[-20%] right-[-10%] w-[45rem] h-[45rem] rounded-full bg-teal-200/40 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-15%] w-[45rem] h-[45rem] rounded-full bg-emerald-100/50 blur-[140px] pointer-events-none" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[35rem] h-[35rem] rounded-full bg-rose-100/40 blur-[120px] pointer-events-none" />

        {/* Floating Custom Toast Alarm */}
        {alertMsg && (
          <div className="fixed top-5 right-5 z-[100] px-5 py-3 rounded-xl border shadow-2xl bg-white border-emerald-200 text-emerald-800 flex items-center gap-3 animate-fade-in">
            <div className={`w-2 h-2 rounded-full ${alertMsg.type === "success" ? "bg-emerald-500" : "bg-red-500"}`} />
            <span className="text-sm font-semibold">{alertMsg.text}</span>
          </div>
        )}

        {/* Professional Central Login Card */}
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-emerald-200/60 rounded-[32px] p-8 shadow-xl relative z-10 flex flex-col gap-6.5 text-center">
          
          {/* Top Brand Logo and Header Info */}
          <div className="space-y-3.5">
            <div className="w-20 h-20 mx-auto filter drop-shadow-[0_4px_12px_rgba(16,185,129,0.15)] select-none">
              <AnsorLogo className="w-full h-full" />
            </div>
            <div>
              <h2 className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-[0.2em] leading-none font-mono">
                GP Ansor PC Kabupaten Bogor
              </h2>
              <h1 className="text-2xl font-black font-display text-slate-900 mt-1.5 leading-tight tracking-tight">
                Verifikasi Portal CMS
              </h1>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed max-w-sm mx-auto">
                Silakan masuk menggunakan kredensial Anda untuk memvalidasi hak akses, memperbarui naskah syiar, program kerja, atau melakukan sinkronisasi modul.
              </p>
            </div>
          </div>

          {/* Form Element */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-xs font-semibold leading-relaxed flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-ping" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="username-input" className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 block">
                Nama Pengguna (Username)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username-input"
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-white/60 border border-emerald-200 text-slate-900 placeholder-slate-400 rounded-xl pl-10 pr-4 py-3 text-xs tracking-wide focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="silahkan login sahabat"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password-input" className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 block">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password-input"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-white/60 border border-emerald-200 text-slate-900 placeholder-slate-400 rounded-xl pl-10 pr-4 py-3 text-xs tracking-wide focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoadingAuth}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase shadow-[0_4px_14px_-2px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mt-5 cursor-pointer"
            >
              <UserCheck className={`w-4 h-4 text-emerald-100 ${isLoadingAuth ? "animate-pulse" : ""}`} />
              {isLoadingAuth ? "Memverifikasi..." : "Verifikasi Sesi Masuk"}
            </button>
          </form>

          {/* Bottom Back To Public Portal link */}
          <div className="pt-4 border-t border-emerald-100">
            <button
              type="button"
              onClick={() => setIsCmsOpen(false)}
              className="text-slate-500 hover:text-emerald-600 text-xs font-semibold flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Landing Page Publik
            </button>
          </div>

        </div>

        {/* Footer text */}
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold select-none">
          SYSTEMA SECURITY ENTRANCE V.10
        </span>

      </div>
    );
  }

  const isSuperAdmin = currentUser?.role === "superadmin";

  return (
    <div className={`min-h-screen w-full max-w-full overflow-x-hidden flex flex-col font-sans relative transition-all duration-300 ${
      theme === 'dark'
        ? 'bg-[#010a04] text-[#ecfdf5] dark'
        : 'bg-[#f0fdf4] text-slate-800'
    }`}>
      
      {/* Soft gorgeous pastel blur blobs matching the beautiful design mockup (like Alterra & Al Flow) */}
      <div className={`absolute top-[-10%] right-[-10%] w-[55rem] h-[55rem] rounded-full blur-[130px] pointer-events-none transition-all duration-300 ${
        theme === 'dark' ? 'bg-emerald-950/20' : 'bg-emerald-100/30'
      }`} />
      <div className={`absolute bottom-[-10%] left-[-10%] w-[55rem] h-[55rem] rounded-full blur-[140px] pointer-events-none transition-all duration-300 ${
        theme === 'dark' ? 'bg-amber-950/10' : 'bg-teal-100/40'
      }`} />

      {/* Toast Alert pop-up */}
      {alertMsg && (
        <div className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-xl border shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-0 ${
          alertMsg.type === "success" 
            ? theme === "dark" ? "bg-[#011406] border-emerald-800 text-emerald-100" : "bg-white border-emerald-200 text-emerald-800"
            : theme === "dark" ? "bg-[#180202] border-red-800 text-red-105" : "bg-white border-red-200 text-red-800"
        }`}>
          <div className={`w-2 h-2 rounded-full ${alertMsg.type === "success" ? "bg-emerald-500" : "bg-red-500"}`} />
          <span className="text-sm font-semibold">{alertMsg.text}</span>
        </div>
      )}

      {/* DASHBOARD NAVBAR HEADER WITH RESPONSIVE LAYOUT CARING */}
      <header className={`border-b px-4 md:px-6 py-3 md:py-4 sticky top-0 z-40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs relative transition-all duration-300 w-full max-w-full overflow-hidden ${
        theme === 'dark'
          ? 'border-emerald-950/60 bg-[#011406]/94'
          : 'border-emerald-200/70 bg-white/90 backdrop-blur-md'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 md:w-9 md:h-9 flex-shrink-0">
            <AnsorLogo className="w-full h-full filter drop-shadow-[0_2px_6px_rgba(16,185,129,0.15)]" />
          </div>
          <div>
            <h1 className={`text-sm md:text-base font-bold flex items-center gap-1.5 md:gap-2 tracking-wide font-display transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              CMS KONTEN <span className={`text-[9px] md:text-[10px] px-1.5 md:px-2.2 py-0.5 rounded-full border font-bold uppercase transition-all ${theme === 'dark' ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/40' : 'bg-emerald-100/70 text-emerald-800 border-emerald-200'}`}>ADMIN PANEL</span>
            </h1>
            <p className={`text-[9px] md:text-[10px] font-mono hidden md:block transition-colors ${theme === 'dark' ? 'text-emerald-500/80' : 'text-slate-500'}`}>GP Ansor PC Kabupaten Bogor Digital Suite</p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2.5 relative z-10 overflow-x-auto scrollbar-none py-1 sm:py-0">
          {/* Supabase Connection Status Pill */}
          <button
            type="button"
            onClick={handleManualDBSync}
            disabled={isSyncingDb}
            className={`px-2 md:px-3 py-1.5 rounded-lg border text-[10px] md:text-xs flex items-center gap-1.5 transition-all font-semibold shrink-0 cursor-pointer ${
              dbConnected === null
                ? "bg-amber-50/50 border-amber-200 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300"
                : dbConnected === true
                ? "bg-emerald-50/70 border-emerald-200/80 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800/40 dark:text-emerald-300 hover:bg-emerald-100/60"
                : "bg-red-50/70 border-red-200/80 text-red-700 dark:bg-red-950/25 dark:border-red-900/30 dark:text-red-300 hover:bg-red-100/50"
            }`}
            title="Sikronisasi Data Server Supabase"
          >
            <Database className={`w-3.5 h-3.5 ${isSyncingDb ? "animate-spin text-emerald-500" : dbConnected === true ? "text-emerald-500" : "text-amber-500 animate-pulse"}`} />
            <span>
              {dbConnected === null ? (
                "Cek koneksi..."
              ) : dbConnected === true ? (
                <span>Koneksi OK {isSyncingDb && "(Sinkronisasi...)"}</span>
              ) : (
                "Offline"
              )}
            </span>
          </button>

          {/* Default Restore for superadmin */}
          {isSuperAdmin && (
            <button
              type="button"
              onClick={resetToDefault}
              className="px-2 md:px-3 py-1.5 rounded-lg border border-emerald-200/80 bg-emerald-50/70 text-emerald-800 hover:text-emerald-955 hover:bg-emerald-100 text-[10px] md:text-xs flex items-center gap-1 md:gap-1.5 transition-all cursor-pointer font-semibold shrink-0"
              title="Reset ke pengaturan bawaan awal"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsCmsOpen(false)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 md:px-3.5 py-1.5 rounded-lg text-[10px] md:text-xs font-semibold flex items-center gap-1 md:gap-1.5 transition-all shadow-md hover:shadow-emerald-600/15 cursor-pointer shrink-0"
            title="Ke Beranda Depan"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Landing Page</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="px-2 md:px-3 py-1.5 rounded-lg border border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-800/40 dark:bg-emerald-955/40 text-emerald-850 hover:text-emerald-950 dark:text-emerald-100 hover:bg-emerald-100 text-[10px] md:text-xs flex items-center gap-1 md:gap-1.5 transition-colors cursor-pointer font-semibold shrink-0"
            title="Ganti Tema (Gelap/Terang)"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* User Status and Logout Section inside Header */}
          <div className="flex items-center gap-1.5 sm:gap-2 border-l border-emerald-200 pl-2 ml-0.5 shrink-0">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-[11px] md:text-xs font-bold text-slate-800 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isSuperAdmin ? "bg-amber-400" : "bg-teal-400 animate-pulse"}`} />
                {currentUser?.name?.split(" ")[0]}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem("ansor_cms_user");
                setCurrentUser(null);
                triggerToast("Keluar dari sesi admin berhasil.");
              }}
              className="p-1.5 rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all cursor-pointer"
              title="Keluar Sesi CMS"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* COMPACT DASHBOARD GRID CONTAINER */}
      <div className="flex flex-grow flex-col md:flex-row overflow-hidden relative z-10 md:h-[calc(100vh-73px)] w-full max-w-full">
        
        {/* SIDE BAR NAVIGATION - 7 CUSTOM MODULES MATCHING LANDING PAGE */}
        <aside className={`w-full md:w-64 border-b md:border-b-0 md:border-r p-4 flex flex-col justify-between shadow-xs transition-colors duration-300 ${
          theme === 'dark'
            ? 'border-emerald-950/60 bg-[#011406]/90'
            : 'border-emerald-200/80 bg-[#f0fdf4]/50 backdrop-blur-md'
        }`}>
          <div className="space-y-4 select-none flex-grow md:overflow-y-auto md:pr-1 custom-scrollbar">
            {[
              {
                id: "profil-branding",
                title: "PROFIL & BRANDING",
                items: [
                  { key: "general" as const, label: "Branding & Hero", icon: Sparkles },
                  { key: "about" as const, label: "Tentang & Pilar", icon: Compass },
                  { key: "leaders" as const, label: "Dewan Pimpinan", icon: Users },
                ]
              },
              {
                id: "publikasi-kegiatan",
                title: "PUBLIKASI & HISTORI",
                items: [
                  { key: "news" as const, label: "Berita (News)", icon: FileText },
                  { key: "gallery" as const, label: "Galeri Kegiatan", icon: ImageIcon },
                  { key: "programs" as const, label: "Program Kerja", icon: LayoutGrid },
                ]
              },
              {
                id: "kaderisasi-layanan",
                title: "KADERISASI & LAYANAN",
                items: [
                  { key: "registrants" as const, label: "Calon Anggota", icon: ShieldCheck },
                  { key: "services" as const, label: "Layanan Digital", icon: Smartphone },
                ]
              },
              {
                id: "analisis-konfig",
                title: "SETTING & MONITOR",
                items: [
                  { key: "contact" as const, label: "Kontak & Footer", icon: MapPin },
                  { key: "analytics" as const, label: "Monitor Pembaca", icon: Activity },
                  { key: "users" as const, label: "Label Navigasi", icon: Sliders },
                ]
              }
            ].map((section) => {
              // Filter out items in the section that are NOT permitted for current user
              const permittedItems = section.items.filter(tabItem => {
                return isSuperAdmin || (currentUser && rolePermissions[currentUser.role]?.includes(tabItem.key));
              });

              if (permittedItems.length === 0) return null;

              return (
                <div key={section.id} className="space-y-1 text-left">
                  <p className={`text-[9px] uppercase font-mono tracking-widest font-extrabold px-3 py-1 mt-2.5 transition-colors ${
                    theme === 'dark' ? 'text-emerald-400/80 border-b border-emerald-950/40 pb-1 mb-1.5' : 'text-emerald-800/80 border-b border-emerald-100/60 pb-1 mb-1.5'
                  }`}>
                    {section.title}
                  </p>
                  
                  {permittedItems.map((tabItem) => {
                    const TabIcon = tabItem.icon;
                    const isEnabled = menuStatus[tabItem.key] !== false;
                    const isSelected = activeTab === tabItem.key;
                    
                    return (
                      <div key={tabItem.key} className="relative group/nav">
                        <button
                          disabled={false}
                          onClick={() => { 
                            setActiveTab(tabItem.key); 
                            cancelEdit(); 
                          }}
                          className={`w-full text-left pl-3.5 pr-11 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                            isSelected 
                              ? theme === 'dark'
                                ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/25 border border-emerald-500/30 text-emerald-300 shadow-sm font-bold scale-[1.01]"
                                : "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-800 shadow-sm font-bold scale-[1.01]" 
                              : theme === 'dark'
                                ? "text-emerald-100/75 hover:text-white hover:bg-emerald-950/40 border border-transparent cursor-pointer"
                                : "text-emerald-850 hover:text-emerald-955 hover:bg-emerald-100/60 border border-transparent cursor-pointer"
                          }`}
                        >
                          <TabIcon className={`w-4 h-4 ${
                            isSelected 
                              ? "text-emerald-500" 
                              : theme === 'dark' ? "text-emerald-400/80" : "text-emerald-500/60 font-medium"
                          }`} />
                          <span className="truncate">{tabItem.label}</span>
                        </button>
                        
                        <button
                          type="button"
                          disabled={!isSuperAdmin}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isSuperAdmin) return;
                            const nextVal = !menuStatus[tabItem.key];
                            setMenuStatus({ ...menuStatus, [tabItem.key]: nextVal });
                            triggerToast(`Menu ${tabItem.label} berhasil ${nextVal ? 'diaktifkan' : 'dinonaktifkan'}!`);
                          }}
                          className={`absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center transition-all border shrink-0 ${
                            !isSuperAdmin
                              ? "bg-emerald-50 text-emerald-300 border-emerald-200/50 cursor-not-allowed"
                              : isEnabled 
                                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200 cursor-pointer" 
                                : "bg-red-50 hover:bg-red-100 text-red-600 border-red-200 cursor-pointer"
                          }`}
                          title={!isSuperAdmin ? "Hanya Super Admin yang dapat mengubah status aktifasi seksi" : `${tabItem.label}: ${isEnabled ? 'Aktif di Publik (Klik untuk Matikan)' : 'Nonaktif di Publik (Klik untuk Aktifkan)'}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${!isSuperAdmin ? "bg-emerald-200" : isEnabled ? "bg-emerald-500" : "bg-red-500"}`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-emerald-200/80 mt-6">
            <div className={`p-3 border rounded-xl shadow-xs text-left ${
              theme === 'dark'
                ? 'bg-emerald-950/20 border-emerald-905/30 text-emerald-300'
                : 'bg-emerald-50/60 border-emerald-200/80 text-emerald-800'
            }`}>
              <h5 className={`text-[10px] uppercase font-bold tracking-wider ${theme === 'dark' ? 'text-emerald-400' : 'text-[#0f766e]'}`}>Status Database</h5>
              <div className="flex items-center gap-1.5 mt-1.5 font-sans">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className={`text-[10px] font-mono font-bold ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-800'}`}>LOKAL ENGINE : AKTIF</span>
              </div>
              <p className={`text-[9px] mt-1 leading-relaxed ${theme === 'dark' ? 'text-emerald-400/70' : 'text-[#0f766e]/70'}`}>Semua konten disimpan dalam penyimpanan lokal browser ini secara aman.</p>
            </div>

            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem("ansor_cms_user");
                setCurrentUser(null);
                triggerToast("Keluar dari sesi admin berhasil.");
              }}
              className={`mt-3 w-full py-2.5 px-4 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-sm border ${
                theme === 'dark'
                  ? 'border-red-900/50 bg-red-950/20 text-red-400 hover:bg-red-950 hover:text-white hover:border-red-600'
                  : 'border-red-200 bg-red-50 text-red-650 hover:bg-red-600 hover:text-white hover:border-red-650'
              }`}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>KONTROL LOGOUT SESI</span>
            </button>
          </div>
        </aside>

        {/* WORKSPACE AREA */}
        <main className={`${theme === 'light' ? 'cms-main-workspace' : ''} flex-grow p-4 md:p-8 overflow-y-auto overflow-x-hidden md:h-full max-h-full w-full max-w-full relative z-10`}>
          
          {/* BANNER NOTIFIKASI SINKRONISASI & ASISTEN SUPABASE */}
          {isSuperAdmin && (
            <div className="mb-6 space-y-4">
            {lastSyncError && (
              <div className="bg-red-50 border border-red-200 text-red-900 text-xs p-4 rounded-2xl font-medium leading-relaxed text-left flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-start gap-2.5">
                  <span className="text-sm shrink-0 mt-0.5">🚨</span>
                  <div>
                    <h5 className="font-bold text-red-950 text-[12px] uppercase tracking-wide">Peringatan: Gagal Menulis ke Cloud Database Supabase!</h5>
                    <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">
                      Perubahan yang Anda buat baru saja disimpan secara lokal di browser perangkat Anda, namun <span className="font-bold text-red-800">gagal disimpan di Server Clouddb Supabase</span>. Ini berarti perangkat lain (seperti Safari, handphone lain, dll) belum bisa melihat berita terupdate ini sampai struktur tabel Anda dipulihkan.
                    </p>
                    <p className="font-mono text-[10px] text-red-700 bg-red-100/50 px-2.3 py-1 rounded-xl mt-2 inline-block">
                      {lastSyncError}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSqlExpanded(true)}
                  className="px-4 py-2 bg-red-650 hover:bg-red-700 hover:shadow-md hover:shadow-red-500/10 text-white font-bold rounded-xl text-[11px] whitespace-nowrap self-start md:self-center transition-all cursor-pointer transform active:scale-95 shrink-0"
                >
                  Lihat Solusi SQL &raquo;
                </button>
              </div>
            )}

            {/* EXPANDABLE SQL ASSISTANT */}
            <div className={`border rounded-2xl transition-all duration-300 shadow-sm ${
              isSqlExpanded 
                ? "bg-slate-900 border-[#1e293b] text-slate-100 p-6 text-left"
                : "bg-emerald-50/60 border-emerald-250 text-emerald-950 p-4 leading-relaxed text-xs text-left"
            }`}>
              {!isSqlExpanded ? (
                <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm shrink-0">💡</span>
                    <p className="text-[11px] sm:text-xs text-emerald-950">
                      <span className="font-bold">Tips Sinkronisasi Ril:</span> Pastikan Anda sudah membuat tabel <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-900 text-[11px]">ansor_bogor_cms</code> dan mengaktifkan RLS Policies di Supabase Anda agar berita otomatis terupdate ke safari/chrome di seluruh HP handphone &amp; laptop lain!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSqlExpanded(true)}
                    className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-[11px] whitespace-nowrap transition-all cursor-pointer shadow-sm"
                  >
                    Buka Panduan SQL Setup
                  </button>
                </div>
              ) : (
                <div className="space-y-4 font-sans">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-emerald-400">⚡</span>
                      <h4 className="font-bold text-xs tracking-wide uppercase text-white font-display">Asisten Pemulihan &amp; Setup Database Supabase</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSqlExpanded(false)}
                      className="text-[11px] text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Sistem web PC GP Ansor Kabupaten Bogor menggunakan pendekatan <span className="text-emerald-400 font-semibold">Offline-first (LocalStorage)</span> sekaligus menyinkronkan data secara <span className="text-emerald-400 font-semibold">Real-time ke cloud database Supabase</span>. Agar perubahan berita di browser Anda langsung tampil pada Safari, Chrome, atau perangkat pimpinan/pengunjung lainnya secara instan, Anda hanya perlu menyalin script SQL di bawah ini dan menjalankannya sekali saja di panel Supabase Anda.
                  </p>

                  <div className="space-y-2">
                    <h5 className="font-bold text-[11px] text-white flex items-center gap-1.5">
                      <span>Langkah Memasang Basis Data Ril:</span>
                    </h5>
                    <ol className="list-decimal list-inside text-[11px] text-slate-350 space-y-1.5 pl-1 leading-relaxed">
                      <li>Buka Dashboard proyek <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline inline-flex items-center gap-0.5 font-bold">Supabase (supabase.com)</a> milik Anda.</li>
                      <li>Di menu sebelah kiri, masuk ke bagian <span className="font-bold text-white font-mono bg-slate-800 px-1 py-0.5 rounded">SQL Editor</span>.</li>
                      <li>Klik <span className="font-bold text-white font-mono bg-slate-800 px-1 py-0.5 rounded">New Query +</span> dan tempelkan (paste) script SQL di bawah ini.</li>
                      <li>Klik tombol hijau <span className="font-bold text-emerald-400 font-mono bg-[#022A12] px-2.5 py-1 rounded border border-emerald-900 cursor-pointer">Run</span> di pojok kanan atas. Selesai!</li>
                    </ol>
                  </div>

                  {/* SQL CODE VIEWER */}
                  <div className="relative rounded-xl border border-slate-800 overflow-hidden bg-[#060a08]/90">
                    <div className="flex items-center justify-between bg-slate-950 px-4 py-2 text-[10px] text-slate-400 border-b border-slate-850">
                      <span className="font-mono text-[9px]">setup_cms_and_users.sql</span>
                      <button
                        type="button"
                        onClick={() => {
                          const sqlCode = `-- 1. BUAT TABEL CMS KONTEN UTAMA\nCREATE TABLE IF NOT EXISTS public.ansor_bogor_cms (\n    key text PRIMARY KEY,\n    value jsonb DEFAULT '{}'::jsonb,\n    updated_at timestamp with time zone DEFAULT now()\n);\n\n-- AKTIFKAN ATURAN KEAMANAN ROW LEVEL SECURITY (RLS)\nALTER TABLE public.ansor_bogor_cms ENABLE ROW LEVEL SECURITY;\n\n-- BUAT POLICIES SUPABASE AGAR DATA BISA DI-UPDATE LANGSUNG DARI WEB\nDROP POLICY IF EXISTS "Allow public read access to CMS data" ON public.ansor_bogor_cms;\nCREATE POLICY "Allow public read access to CMS data" \n    ON public.ansor_bogor_cms FOR SELECT USING (true);\n\nDROP POLICY IF EXISTS "Allow public insert access to CMS data" ON public.ansor_bogor_cms;\nCREATE POLICY "Allow public insert access to CMS data" \n    ON public.ansor_bogor_cms FOR INSERT WITH CHECK (true);\n\nDROP POLICY IF EXISTS "Allow public update access to CMS data" ON public.ansor_bogor_cms;\nCREATE POLICY "Allow public update access to CMS data" \n    ON public.ansor_bogor_cms FOR UPDATE USING (true) WITH CHECK (true);\n\nDROP POLICY IF EXISTS "Allow public delete access to CMS data" ON public.ansor_bogor_cms;\nCREATE POLICY "Allow public delete access to CMS data" \n    ON public.ansor_bogor_cms FOR DELETE USING (true);\n\n\n-- 2. BUAT TABEL AKUN PENGGUNA CMS KUSTOM\nCREATE TABLE IF NOT EXISTS public.ansor_bogor_users (\n    username text PRIMARY KEY,\n    password text NOT NULL,\n    name text NOT NULL,\n    role text NOT NULL DEFAULT 'sekretariat',\n    created_at timestamp with time zone DEFAULT now()\n);\n\n-- AKTIFKAN ATURAN KEAMANAN ROW LEVEL SECURITY (RLS)\nALTER TABLE public.ansor_bogor_users ENABLE ROW LEVEL SECURITY;\n\n-- BUAT POLICIES BAGI TABEL PENGGUNA\nDROP POLICY IF EXISTS "Allow public select access to Users data" ON public.ansor_bogor_users;\nCREATE POLICY "Allow public select access to Users data" \n    ON public.ansor_bogor_users FOR SELECT USING (true);\n\nDROP POLICY IF EXISTS "Allow public insert/update access to Users data" ON public.ansor_bogor_users;\nCREATE POLICY "Allow public insert/update access to Users data" \n    ON public.ansor_bogor_users FOR INSERT WITH CHECK (true);\n\nDROP POLICY IF EXISTS "Allow public modify access to Users data" ON public.ansor_bogor_users;\nCREATE POLICY "Allow public modify access to Users data" \n    ON public.ansor_bogor_users FOR UPDATE USING (true) WITH CHECK (true);\n\nDROP POLICY IF EXISTS "Allow public delete access to Users data" ON public.ansor_bogor_users;\nCREATE POLICY "Allow public delete access to Users data" \n    ON public.ansor_bogor_users FOR DELETE USING (true);\n\n\n-- 3. SISIPKAN AKUN ADMIN DEFAULT DAN SEKRETARIAT KONDISIONAL\nINSERT INTO public.ansor_bogor_users (username, password, name, role)\nVALUES \n    ('admin', 'adminansor1934', 'Septa Aji', 'superadmin'),\n    ('sekretariat', 'sekretariat1934', 'Sekretariat Cabang', 'sekretariat')\nON CONFLICT (username) DO NOTHING;`;
                          navigator.clipboard.writeText(sqlCode);
                          setCopiedSql(true);
                          triggerToast("Script SQL berhasil disalin ke clipboard!");
                          setTimeout(() => setCopiedSql(false), 3000);
                        }}
                        className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-350 hover:text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 font-bold"
                      >
                        {copiedSql ? "Tersalin!" : "Salin Kode SQL"}
                      </button>
                    </div>
                    <pre className="p-4 overflow-x-auto text-[10px] font-mono text-emerald-400 leading-relaxed text-left max-h-[180px]">
{`-- 1. BUAT TABEL CMS KONTEN UTAMA
CREATE TABLE IF NOT EXISTS public.ansor_bogor_cms (
    key text PRIMARY KEY,
    value jsonb DEFAULT '{}'::jsonb,
    updated_at timestamp with time zone DEFAULT now()
);

-- AKTIFKAN ATURAN KEAMANAN ROW LEVEL SECURITY (RLS)
ALTER TABLE public.ansor_bogor_cms ENABLE ROW LEVEL SECURITY;

-- BUAT POLICIES SUPABASE AGAR DATA BISA DI-UPDATE LANGSUNG DARI WEB
DROP POLICY IF EXISTS "Allow public read access to CMS data" ON public.ansor_bogor_cms;
CREATE POLICY "Allow public read access to CMS data" 
    ON public.ansor_bogor_cms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access to CMS data" ON public.ansor_bogor_cms;
CREATE POLICY "Allow public insert access to CMS data" 
    ON public.ansor_bogor_cms FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access to CMS data" ON public.ansor_bogor_cms;
CREATE POLICY "Allow public update access to CMS data" 
    ON public.ansor_bogor_cms FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete access to CMS data" ON public.ansor_bogor_cms;
CREATE POLICY "Allow public delete access to CMS data" 
    ON public.ansor_bogor_cms FOR DELETE USING (true);


-- 2. BUAT TABEL AKUN PENGGUNA CMS KUSTOM
CREATE TABLE IF NOT EXISTS public.ansor_bogor_users (
    username text PRIMARY KEY,
    password text NOT NULL,
    name text NOT NULL,
    role text NOT NULL DEFAULT 'sekretariat',
    created_at timestamp with time zone DEFAULT now()
);

-- AKTIFKAN ATURAN KEAMANAN ROW LEVEL SECURITY (RLS)
ALTER TABLE public.ansor_bogor_users ENABLE ROW LEVEL SECURITY;

-- BUAT POLICIES BAGI TABEL PENGGUNA
DROP POLICY IF EXISTS "Allow public select access to Users data" ON public.ansor_bogor_users;
CREATE POLICY "Allow public select access to Users data" 
    ON public.ansor_bogor_users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert/update access to Users data" ON public.ansor_bogor_users;
CREATE POLICY "Allow public insert/update access to Users data" 
    ON public.ansor_bogor_users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public modify access to Users data" ON public.ansor_bogor_users;
CREATE POLICY "Allow public modify access to Users data" 
    ON public.ansor_bogor_users FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete access to Users data" ON public.ansor_bogor_users;
CREATE POLICY "Allow public delete access to Users data" 
    ON public.ansor_bogor_users FOR DELETE USING (true);


-- 3. SISIPKAN AKUN ADMIN DEFAULT DAN SEKRETARIAT KONDISIONAL
INSERT INTO public.ansor_bogor_users (username, password, name, role)
VALUES 
    ('admin', 'adminansor1934', 'Septa Aji', 'superadmin'),
    ('sekretariat', 'sekretariat1934', 'Sekretariat Cabang', 'sekretariat')
ON CONFLICT (username) DO NOTHING;`}
                    </pre>
                  </div>
                  
                  <div className="bg-slate-950 p-3 rounded-xl text-[11px] leading-relaxed text-slate-400 border border-slate-850 flex items-start gap-2">
                    <span className="text-xs">💡</span>
                    <p>Setelah Anda menjalankan SQL di atas, silakan klik tombol <span className="font-bold text-white border-b border-white border-dashed">Database: Terhubung / Offline</span> di header halaman ini untuk memicu penarikan data awal. Perubahan dari kontributor, perangkat mana pun akan langsung tersimpan di cloud serta sinkron di Safari, Chrome, Android &amp; Desktop lainnya secara instan!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {/* TAB 1: HERO CONFIG & IMPACT STATS */}
          {activeTab === "general" && (
            <div className="w-full max-w-7xl xl:max-w-full space-y-8 text-left">
              <div>
                <h2 className="text-xl font-bold font-display text-white">Kelola Hero Banner & Branding Utama</h2>
                <p className="text-neutral-400 text-xs mt-1">Ubah judul utama, latar belakang, serta integrasi pemutar video dan sosial media Pimpinan Cabang Bogor.</p>
              </div>

              {/* MASTER SECTION ENABLE / DISABLE CONTROLLER */}
              <div className="bg-[#031d0b]/30 border border-emerald-500/15 rounded-2xl p-6 space-y-4 shadow-sm bg-gradient-to-r from-[#031d0b]/20 to-teal-950/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-xs font-bold text-ansor-gold uppercase tracking-wider flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-emerald-400" />
                      Status Visibilitas Menu & Landing Page
                    </h3>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Aktifkan atau nonaktifkan visibilitas setiap modul publik serta tab internal secara instan.</p>
                  </div>
                  
                  {/* Master Button to turn everything ON or OFF */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuStatus({
                          general: true,
                          about: true,
                          programs: true,
                          news: true,
                          gallery: true,
                          leaders: true,
                          contact: true,
                          analytics: true,
                          kaderisasi: true,
                          alumni: true,
                          epersuratan: true
                        });
                        triggerToast("Semua seksi & menu berhasil diaktifkan!");
                      }}
                      className="px-3 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-350 border border-emerald-500/20 text-[9px] font-bold tracking-wider rounded-lg uppercase transition-all"
                    >
                      Aktifkan Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuStatus({
                          general: true, // keep general active as fallback
                          about: false,
                          programs: false,
                          news: false,
                          gallery: false,
                          leaders: false,
                          contact: false,
                          analytics: false,
                          kaderisasi: false,
                          alumni: false,
                          epersuratan: false
                        });
                        triggerToast("Semua seksi opsional berhasil dinonaktifkan!");
                      }}
                      className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/40 text-red-300 border border-red-500/20 text-[9px] font-bold tracking-wider rounded-lg uppercase transition-all"
                    >
                      Nonaktifkan Semua
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                  {[
                    { key: "general" as const, name: "Branding & Hero (Utama)", desc: "Pengaturan identitas visual website" },
                    { key: "about" as const, name: "Tentang & Pilar", desc: "Profil GP Ansor Bogor" },
                    { key: "programs" as const, name: "Program Utama", desc: "Sektor darmabakti kerja" },
                    { key: "registrants" as const, name: "Pendaftaran Calon Anggota", desc: "Layanan registrasi kader baru" },
                    { key: "news" as const, name: "Berita (News)", desc: "Artikel & Berita rilis" },
                    { key: "gallery" as const, name: "Galeri Kegiatan", desc: "Potret dokumentasi PC" },
                    { key: "leaders" as const, name: "Dewan Pimpinan", desc: "Struktur Organisasi" },
                    { key: "contact" as const, name: "Kontak & Footer", desc: "Saluran alamat fisik" },
                    { key: "services" as const, name: "Layanan Digital Pihak Ketiga", desc: "Pengaturan link eksternal & QR Code" },
                    { key: "analytics" as const, name: "Monitor Pembaca", desc: "Sistem statistik portal" },
                    { key: "users" as const, name: "Label Navigasi", desc: "Opsi label nama menu navigasi" },
                    { key: "kaderisasi" as const, name: "Aplikasi Presensi Kaderisasi", desc: "Sistem absensi & pendataan kehadiran kader terpadu" },
                    { key: "alumni" as const, name: "Sistem Alumni & Cetak Sertifikat", desc: "Pencarian data verifikasi berkas" },
                    { key: "epersuratan" as const, name: "Layanan: E-Persuratan", desc: "Sistem persuratan & administrasi" }
                  ].map((item) => {
                    const isEnabled = menuStatus[item.key];
                    return (
                      <div 
                        key={item.key} 
                        className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between h-28 ${
                          isEnabled 
                            ? "bg-emerald-950/10 border-emerald-500/25 hover:border-emerald-500/40 shadow-xs" 
                            : "bg-red-950/5 border-white/5 hover:border-white/10 opacity-70"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-xs font-bold text-white tracking-tight truncate">{item.name}</span>
                            <span className={`w-2 h-2 rounded-full shrink-0 ${isEnabled ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" : "bg-red-500"}`} />
                          </div>
                          <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed line-clamp-2">{item.desc}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2.5 border-t border-white/5 pt-2">
                          <span className={`text-[9px] font-semibold uppercase font-mono tracking-wider ${isEnabled ? "text-emerald-400" : "text-red-400"}`}>
                            {isEnabled ? "● AKTIF" : "○ MATI"}
                          </span>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setMenuStatus({
                                ...menuStatus,
                                [item.key]: !isEnabled
                              });
                              triggerToast(`Menu ${item.name} berhasil ${!isEnabled ? 'diaktifkan' : 'dinonaktifkan'}!`);
                            }}
                            className={`px-2.5 py-1 rounded-md text-[8px] font-extrabold uppercase tracking-widest cursor-pointer transition-all ${
                              isEnabled 
                                ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400" 
                                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                            }`}
                          >
                            Ubah
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleHeroSave} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-5">
                <h3 className="text-xs font-bold text-ansor-gold uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
                  <Sparkles className="w-4 h-4" />
                  Kustomisasi Banner Hero & Link Channel
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="text-xs font-semibold text-neutral-300">Judul Utama - Baris Pertama (Putih)</label>
                    <input
                      type="text"
                      value={heroForm.titleLine1}
                      onChange={e => setHeroForm({ ...heroForm, titleLine1: e.target.value })}
                      className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors font-semibold"
                      placeholder="BERTAUHID, BERSATU,"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="text-xs font-semibold text-neutral-300">Judul Utama - Baris Kedua (Putih)</label>
                    <input
                      type="text"
                      value={heroForm.titleLine2}
                      onChange={e => setHeroForm({ ...heroForm, titleLine2: e.target.value })}
                      className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors font-semibold"
                      placeholder="BERMASHLAHAT UNTUK"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="text-xs font-semibold text-neutral-300">Judul Utama - Sorotan Emas (Accent)</label>
                    <input
                      type="text"
                      value={heroForm.titleAnsorGold}
                      onChange={e => setHeroForm({ ...heroForm, titleAnsorGold: e.target.value })}
                      className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-emerald-350 focus:outline-none focus:border-emerald-500 transition-colors font-bold"
                      placeholder="KABUPATEN BOGOR"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="text-xs font-semibold text-neutral-300">Sub-Deskripsi Hero Banner</label>
                    <textarea
                      rows={3}
                      value={heroForm.subtitle}
                      onChange={e => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                      className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors leading-relaxed"
                      placeholder="Sinergi Pemuda Ansor Menjaga Tradisi Keislaman Aswaja..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">Video Profil (Embed Link YouTube)</label>
                    <input
                      type="text"
                      value={heroForm.videoUrl}
                      onChange={e => setHeroForm({ ...heroForm, videoUrl: e.target.value })}
                      className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                      placeholder="https://www.youtube.com/embed/XXXXXX?autoplay=1"
                    />
                    <p className="text-[10px] text-white/40">Gunakan format embed url: `https://www.youtube.com/embed/VIDEO_ID`</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">Link Channel Youtube Utama</label>
                    <input
                      type="text"
                      value={heroForm.ytChannel}
                      onChange={e => setHeroForm({ ...heroForm, ytChannel: e.target.value })}
                      className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                      placeholder="https://www.youtube.com/channel/..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">Link Halaman Instagram Resmi</label>
                    <input
                      type="text"
                      value={heroForm.igPage}
                      onChange={e => setHeroForm({ ...heroForm, igPage: e.target.value })}
                      className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                      placeholder="https://www.instagram.com/..."
                    />
                  </div>

                  <div className="space-y-1.5 col-span-1 md:col-span-2 border-t border-white/5 pt-4">
                    <label className="text-xs font-semibold text-emerald-400 flex items-center gap-2">
                      <ImageIcon className="w-3.5 h-3.5" />
                      Logo Utama PC GP Ansor (Header & Footer)
                    </label>
                    <p className="text-[10px] text-white/50">Unggah dari galeri HP/Komputer Anda, atau masukkan alamat web link URL image:</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={heroForm.customLogoUrl || ""}
                        onChange={e => setHeroForm({ ...heroForm, customLogoUrl: e.target.value })}
                        className="flex-1 bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                        placeholder="Masukkan URL Gambar atau Unggah File..."
                      />
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          id="logo-gallery-upload"
                          className="hidden"
                          onChange={e => handleImageUploadHelper(e, (base64) => setHeroForm({ ...heroForm, customLogoUrl: base64 }))}
                        />
                        <label
                          htmlFor="logo-gallery-upload"
                          className="px-4 py-2.5 bg-emerald-950/45 hover:bg-emerald-900/60 text-emerald-300 rounded-xl border border-emerald-500/35 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shrink-0"
                        >
                          <ImageIcon className="w-4 h-4 text-emerald-400" />
                          Unggah Berkas
                        </label>
                        {heroForm.customLogoUrl && (
                          <button
                            type="button"
                            onClick={() => setHeroForm({ ...heroForm, customLogoUrl: "" })}
                            className="p-2.5 bg-red-950/45 hover:bg-red-950/60 text-red-300 border border-red-500/25 rounded-xl text-xs font-bold transition-all"
                            title="Reset Logo"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex justify-end">
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Simpan Perubahan Hero / Branding
                  </button>
                </div>
              </form>

              {/* METRIC / IMPACT STATS FORM */}
              <form onSubmit={handleStatsSave} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-5">
                <h3 className="text-xs font-bold text-ansor-gold uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
                  <Star className="w-4 h-4" />
                  Kustomisasi 4 Metrik Capaian Utama (Impact Stats)
                </h3>
                <p className="text-slate-400 text-xs">Ubah angka bulat, teks judul metrik serta penjelasan ringkas di banner bawah Hero.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {statsForm.map((stat, idx) => (
                    <div key={stat.id} className="bg-[#011406]/55 p-4 rounded-xl border border-white/5 space-y-3 text-left">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[10px] font-mono font-bold text-emerald-400">METRIK KE-{idx + 1}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1 space-y-1">
                          <label className="text-[10px] text-slate-300 font-semibold uppercase">Angka</label>
                          <input
                            type="text"
                            required
                            value={stat.value}
                            onChange={(e) => handleStatFieldChange(idx, "value", e.target.value)}
                            className="w-full bg-[#020d04] border border-white/15 rounded-lg px-2 text-center py-2 text-xs text-white uppercase font-bold"
                            placeholder="40"
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] text-slate-300 font-semibold uppercase">Nama Label</label>
                          <input
                            type="text"
                            required
                            value={stat.label}
                            onChange={(e) => handleStatFieldChange(idx, "label", e.target.value)}
                            className="w-full bg-[#020d04] border border-white/15 rounded-lg px-3 py-2 text-xs text-white font-semibold"
                            placeholder="Kecamatan Aktif"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-350 font-semibold">Keterangan Singkat</label>
                        <input
                          type="text"
                          required
                          value={stat.description}
                          onChange={(e) => handleStatFieldChange(idx, "description", e.target.value)}
                          className="w-full bg-[#020d04] border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                          placeholder="Menghubungkan simpul pemuda di seluruh Bogor"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-white/5 flex justify-end">
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Simpan 4 Metrik Capaian
                  </button>
                </div>
              </form>

              {/* GRID 2: PUBLIC NAVIGATION LABELS CONFIG */}
              <div className="bg-[#021408]/45 border border-white/10 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-ansor-gold uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    Pengaturan Nama Menu / Penamaan Tab Navigasi Publik
                  </h3>
                  <p className="text-neutral-400 text-[11px] mt-1">
                    Label nama-nama di bawah ini akan mengganti teks judul link navigasi di landing page website utama secara instan.
                  </p>
                </div>

                <form onSubmit={handleMenuLabelsSave} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300 block">1. Menu Beranda</label>
                      <input
                        type="text"
                        required
                        value={menuLabelsForm.beranda}
                        onChange={e => setMenuLabelsForm({ ...menuLabelsForm, beranda: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder="Beranda"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300 block">2. Menu Kaderisasi</label>
                      <input
                        type="text"
                        required
                        value={menuLabelsForm.kaderisasi}
                        onChange={e => setMenuLabelsForm({ ...menuLabelsForm, kaderisasi: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder="Kaderisasi"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300 block">3. Menu E-Persuratan</label>
                      <input
                        type="text"
                        required
                        value={menuLabelsForm.epersuratan}
                        onChange={e => setMenuLabelsForm({ ...menuLabelsForm, epersuratan: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder="E-Persuratan"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300 block">4. Menu Tentang Kami</label>
                      <input
                        type="text"
                        required
                        value={menuLabelsForm.about}
                        onChange={e => setMenuLabelsForm({ ...menuLabelsForm, about: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder="Tentang Kami"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300 block">5. Menu Program Kerja</label>
                      <input
                        type="text"
                        required
                        value={menuLabelsForm.programs}
                        onChange={e => setMenuLabelsForm({ ...menuLabelsForm, programs: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder="Program Kerja"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300 block">6. Menu Berita & Kabar</label>
                      <input
                        type="text"
                        required
                        value={menuLabelsForm.news}
                        onChange={e => setMenuLabelsForm({ ...menuLabelsForm, news: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder="Berita"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300 block">7. Menu Galeri Foto</label>
                      <input
                        type="text"
                        required
                        value={menuLabelsForm.gallery}
                        onChange={e => setMenuLabelsForm({ ...menuLabelsForm, gallery: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder="Galeri"
                      />
                    </div>

                  </div>

                  <div className="pt-3 border-t border-white/5 flex justify-end">
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-98"
                    >
                      <Save className="w-4 h-4" />
                      Simpan Perubahan Label Menu
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: ABOUT / PROFIL & 4 PILAR GERAKAN */}
          {activeTab === "about" && (
            <div className="w-full max-w-7xl xl:max-w-full space-y-8 text-left">
              {renderDisabledSeksiWarning("about", "Tentang & Pilar Gerakan")}
              
              <div>
                <h2 className="text-xl font-bold font-display text-white">Kelola Sejarah, Profil & 4 Pilar Gerakan</h2>
                <p className="text-neutral-400 text-xs mt-1">Sesuaikan informasi narasi kebangsaan, naskah visi tujuan, sejarah ormas, serta 4 pilar prioritas pimpinan cabang.</p>
              </div>

              {/* ABOUT BIOGRAPHY FORM */}
              <form onSubmit={handleAboutSave} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-5">
                <h3 className="text-xs font-bold text-ansor-gold uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
                  <BookOpen className="w-4 h-4" />
                  Garis Besar & Naskah Narasi Profil Sejarah
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">Judul Profil (Baris Utama)</label>
                    <input
                      type="text"
                      required
                      value={aboutForm.historyTitleLine}
                      onChange={e => setAboutForm({ ...aboutForm, historyTitleLine: e.target.value })}
                      className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">Judul Profil (Sorotan Hijau)</label>
                    <input
                      type="text"
                      required
                      value={aboutForm.historyTitleAnsor}
                      onChange={e => setAboutForm({ ...aboutForm, historyTitleAnsor: e.target.value })}
                      className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-emerald-300 font-bold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="text-xs font-semibold text-neutral-300">Deskripsi Ringkasan Profil Utama</label>
                    <textarea
                      rows={3}
                      required
                      value={aboutForm.description}
                      onChange={e => setAboutForm({ ...aboutForm, description: e.target.value })}
                      className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="text-xs font-semibold text-neutral-300">Sejarah Paragraf 1 (Bila Klik 'Ketahui Sejarah Kami')</label>
                    <textarea
                      rows={4}
                      required
                      value={aboutForm.historyParagraph1}
                      onChange={e => setAboutForm({ ...aboutForm, historyParagraph1: e.target.value })}
                      className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="text-xs font-semibold text-neutral-300">Sejarah Paragraf 2 (Kelanjutan Wilayah Bogor)</label>
                    <textarea
                      rows={4}
                      required
                      value={aboutForm.historyParagraph2}
                      onChange={e => setAboutForm({ ...aboutForm, historyParagraph2: e.target.value })}
                      className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* 4 CHECKMARK GOALS */}
                  <div className="col-span-1 md:col-span-2 border-t border-white/5 pt-4 space-y-4">
                    <label className="text-xs font-extrabold text-[#10b981] uppercase tracking-wider block">
                      ✓ 4 Visi Komitmen Utama Rukun Perjuangan (Bullets)
                    </label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {aboutForm.keyGoals.map((goal, idx) => (
                        <div key={idx} className="space-y-1">
                          <label className="text-[10px] text-slate-350 font-semibold font-mono">KOMITMEN KE-{idx + 1}</label>
                          <input
                            type="text"
                            required
                            value={goal}
                            onChange={e => handleGoalChange(idx, e.target.value)}
                            className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                            placeholder="Tulis visi rukun komitmen..."
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex justify-end">
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Simpan Perubahan Sejarah & Sejarah
                  </button>
                </div>
              </form>

              {/* 4 STRATEGIC PILLARS EDIT FORM */}
              <form onSubmit={handlePillarsSave} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-5">
                <h3 className="text-xs font-bold text-ansor-gold uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
                  <Compass className="w-4 h-4" />
                  Kustomisasi 4 Pilar Utama Gerakan (Digital Dakwah, Ekonomi, Profesional Academy & Kemanusiaan)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pillarsForm.map((pilar, idx) => (
                    <div key={idx} className="bg-[#011406]/55 p-5 rounded-2xl border border-white/5 space-y-3.5 text-left">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[10px] font-mono font-bold text-emerald-400">PILAR KE-{idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-white/50">Icon:</span>
                          <select
                            value={pilar.iconName}
                            onChange={e => handlePillarFieldChange(idx, "iconName", e.target.value)}
                            className="bg-[#020d04] border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-emerald-300 font-semibold focus:outline-none"
                          >
                            <option value="Laptop">Laptop (Digital)</option>
                            <option value="Lightbulb">Lightbulb (Ekraf/Ide)</option>
                            <option value="GraduationCap">GraduationCap (Pendidikan)</option>
                            <option value="Heart">Heart (Kemanusiaan)</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-300 font-semibold uppercase">Judul Pilar</label>
                        <input
                          type="text"
                          required
                          value={pilar.title}
                          onChange={(e) => handlePillarFieldChange(idx, "title", e.target.value)}
                          className="w-full bg-[#020d04] border border-white/15 rounded-lg px-3 py-2 text-xs text-white font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-350 font-semibold">Teks Ringkas Keterangan Pilar</label>
                        <textarea
                          rows={3}
                          required
                          value={pilar.desc}
                          onChange={(e) => handlePillarFieldChange(idx, "desc", e.target.value)}
                          className="w-full bg-[#020d04] border border-white/15 rounded-lg px-3 py-2 text-xs text-white leading-relaxed font-sans"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-white/5 flex justify-end">
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Simpan 4 Pilar Gerakan
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: PROGRAM KERJA UTAMA */}
          {activeTab === "programs" && (
            <div className="w-full max-w-7xl xl:max-w-full space-y-6 text-left">
              {renderDisabledSeksiWarning("programs", "Program Kerja")}
              <div>
                <h2 className="text-xl font-bold font-display text-white">Kelola Program Perjuangan Unggulan</h2>
                <p className="text-neutral-400 text-xs mt-1">Sesuaikan 5 bidang utama perjuangan fungsional organisasi kemasyarakatan GP Ansor Bogor.</p>
              </div>

              {editingId ? (
                <form onSubmit={handleProgramSubmit} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-5">
                  <h3 className="text-sm font-bold text-ansor-gold uppercase tracking-wider flex items-center gap-2">
                    <Edit2 className="w-4 h-4" />
                    Edit Detail Program
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5 col-span-1 md:col-span-2">
                      <label className="text-xs font-semibold text-neutral-300">Judul Bidang Program</label>
                      <input
                        type="text"
                        required
                        value={programForm.title}
                        onChange={e => setProgramForm({ ...programForm, title: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-1 md:col-span-2">
                      <label className="text-xs font-semibold text-neutral-300">Ringkasan Singkat (Muncul di Kartu Depan)</label>
                      <input
                        type="text"
                        required
                        value={programForm.description}
                        onChange={e => setProgramForm({ ...programForm, description: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-1 md:col-span-2">
                      <label className="text-xs font-semibold text-neutral-300">Deskripsi Lengkap Detail Kegiatan (Muncul saat Klik 'Selengkapnya')</label>
                      <textarea
                        rows={6}
                        required
                        value={programForm.extendedDescription}
                        onChange={e => setProgramForm({ ...programForm, extendedDescription: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">Statistik Pencapaian / Milestone Badge</label>
                      <input
                        type="text"
                        required
                        value={programForm.stats}
                        onChange={e => setProgramForm({ ...programForm, stats: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                        placeholder="30+ Angkatan PKD/Tahun"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">Sandi Simbol Icon (Lucide)</label>
                      <select
                        value={programForm.iconName}
                        onChange={e => setProgramForm({ ...programForm, iconName: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                      >
                        <option value="ShieldCheck">ShieldCheck (Kaderisasi)</option>
                        <option value="HeartHandshake">HeartHandshake (Sosial)</option>
                        <option value="BookOpen">BookOpen (Keagamaan)</option>
                        <option value="TrendingUp">TrendingUp (Ekonomi Kreatif)</option>
                        <option value="Flag">Flag (Nasionalisme Kebangsaan)</option>
                        <option value="Laptop">Laptop (Dakwah Digital)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 col-span-1 md:col-span-2">
                      <label className="text-xs font-semibold text-neutral-300">URL Gambar Cover Layanan</label>
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          required
                          value={programForm.imageUrl}
                          onChange={e => setProgramForm({ ...programForm, imageUrl: e.target.value })}
                          className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            id="program-image-upload"
                            className="hidden"
                            onChange={e => handleImageUploadHelper(e, (base64) => setProgramForm({ ...programForm, imageUrl: base64 }))}
                          />
                          <label
                            htmlFor="program-image-upload"
                            className="px-3.5 py-1.5 bg-emerald-950/40 hover:bg-[#042f1a] border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            Ganti Cover Gambar
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md"
                    >
                      Simpan Detail Program
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {programs.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white/[0.02] border border-white/10 p-5 rounded-2xl flex justify-between items-start gap-4 transition-all hover:border-white/15"
                    >
                      <div className="space-y-1.5 text-left">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] text-white/50 font-mono tracking-widest uppercase bg-neutral-900 border border-white/5 px-2.5 py-1 rounded inline-block">
                            ID: {item.id}
                          </span>
                          {item.stats && (
                            <span className="text-[9px] text-[#22c55e] border border-[#22c55e]/30 bg-[#22c55e]/5 px-2.5 py-0.5 rounded-full font-bold">
                              {item.stats}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white tracking-snug">{item.title}</h4>
                        <p className="text-white/40 text-xs leading-normal line-clamp-2">{item.description}</p>
                      </div>

                      <div className="flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => startProgramEdit(item)}
                          className="p-2 border border-white/5 hover:border-white/15 bg-white/5 hover:bg-white/10 rounded-xl hover:text-white text-neutral-300 transition-all cursor-pointer"
                          title="Edit program"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BERITA & KEGIATAN */}
          {activeTab === "news" && (
            <div className="w-full max-w-7xl xl:max-w-full space-y-6 text-left">
              {renderDisabledSeksiWarning("news", "Berita (News)")}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-display text-white">Kelola Berita & Kegiatan Terbaru</h2>
                  <p className="text-neutral-400 text-xs mt-1">Kelola publikasi naskah berita, pengkaderan dan kegiatan sosial GP Ansor Kabupaten Bogor.</p>
                </div>
                {!editingId && !isCreating && (
                  <button
                    type="button"
                    onClick={startNewsCreate}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Buat Berita (News)
                  </button>
                )}
              </div>

              {editingId || isCreating ? (
                <form onSubmit={handleNewsSubmit} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-5">
                  <h3 className="text-sm font-bold text-ansor-gold uppercase tracking-wider flex items-center gap-2">
                    <Edit2 className="w-4 h-4" />
                    {isCreating ? "Tambah Artikel Baru" : "Edit Naskah Artikel"}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5 col-span-1 md:col-span-2">
                      <label className="text-xs font-semibold text-neutral-300">Judul Berita/Kegiatan</label>
                      <input
                        type="text"
                        required
                        value={newsForm.title}
                        onChange={e => setNewsForm({ ...newsForm, title: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder="Cetak Kader Unggul, GP Ansor Kabupaten Bogor sukses menggelar..."
                      />
                    </div>

                    <div className="space-y-1.5 col-span-1 md:col-span-2">
                      <label className="text-xs font-semibold text-neutral-300">Ringkasan / Excerpt</label>
                      <input
                        type="text"
                        required
                        value={newsForm.excerpt}
                        onChange={e => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder="Sebanyak 150 peserta resmi dibaiat menjadi barisan Ansor serbaguna setelah..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">Kategori Berita</label>
                      <input
                        type="text"
                        required
                        value={newsForm.category}
                        onChange={e => setNewsForm({ ...newsForm, category: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder="Contoh: Pengkaderan, Kegiatan, Sosial"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">Penulis</label>
                      <input
                        type="text"
                        required
                        value={newsForm.author}
                        onChange={e => setNewsForm({ ...newsForm, author: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                        placeholder="Humas PC Ansor Bogor"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-1 md:col-span-2">
                      <label className="text-xs font-semibold text-neutral-300">Foto Artikel / Berita</label>
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          required
                          value={newsForm.imageUrl}
                          onChange={e => setNewsForm({ ...newsForm, imageUrl: e.target.value })}
                          className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                          placeholder="https://img.youtube.com/vi/VIDEO_ID/0.jpg"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            id="news-gallery-upload"
                            className="hidden"
                            onChange={e => handleImageUploadHelper(e, (base64) => setNewsForm({ ...newsForm, imageUrl: base64 }))}
                          />
                          <label
                            htmlFor="news-gallery-upload"
                            className="px-3.5 py-1.5 bg-emerald-950/40 hover:bg-[#042f1a] border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            Ganti Gambar Berkas
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">Lama Baca</label>
                      <input
                        type="text"
                        required
                        value={newsForm.readTime}
                        onChange={e => setNewsForm({ ...newsForm, readTime: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                        placeholder="5 Menit Baca"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">Tanggal Publikasi</label>
                      <input
                        type="text"
                        required
                        value={newsForm.date}
                        onChange={e => setNewsForm({ ...newsForm, date: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                        placeholder="24 Mei 2026"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-1 md:col-span-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-neutral-300">Isi Konten Berita Lengkap</label>
                        <span className="text-[10px] font-mono text-emerald-400 select-none">Mode Markdown & HTML didukung</span>
                      </div>
                      
                      {/* Premium Posting Editor Action Toolbar */}
                      <div className="flex flex-wrap gap-1 bg-[#010903] border border-white/10 rounded-t-xl px-3 py-2 items-center">
                        <button
                          type="button"
                          onClick={() => handleInsertEditorTag("**", "**", "teks_tebal")}
                          className="px-2.5 py-1 text-[11px] font-bold text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 rounded cursor-pointer transition-all flex items-center justify-center font-sans tracking-wide"
                          title="Tebal (Bold)"
                        >
                          <span className="font-bold font-serif text-xs mr-1">B</span> Tebal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertEditorTag("*", "*", "teks_miring")}
                          className="px-2.5 py-1 text-[11px] font-bold text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 rounded cursor-pointer transition-all flex items-center justify-center font-sans tracking-wide"
                          title="Miring (Italic)"
                        >
                          <span className="italic font-serif text-xs mr-1">I</span> Miring
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertEditorTag("<u>", "</u>", "teks_garis_bawah")}
                          className="px-2.5 py-1 text-[11px] font-bold text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 rounded cursor-pointer transition-all flex items-center justify-center font-sans tracking-wide"
                          title="Garis Bawah (Underline)"
                        >
                          <span className="underline font-serif text-xs mr-1">U</span> Garis Bawah
                        </button>
                        <div className="h-4 w-px bg-white/10 mx-1" />
                        <button
                          type="button"
                          onClick={() => handleInsertEditorTag("### ", "", "Sub-Judul Berita")}
                          className="px-2.5 py-1 text-[11px] font-bold text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 rounded cursor-pointer transition-all flex items-center justify-center font-sans tracking-wide"
                          title="Kepala Paragraf (Heading)"
                        >
                          H3 Sub-judul
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertEditorTag("> ", "", "Kutipan pernyataan resmi...")}
                          className="px-2.5 py-1 text-[11px] font-bold text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 rounded cursor-pointer transition-all flex items-center justify-center font-sans tracking-wide"
                          title="Kutipan (Blockquote)"
                        >
                          “ Kutipan
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertEditorTag("- ", "", "Item penting")}
                          className="px-2.5 py-1 text-[11px] font-bold text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 rounded cursor-pointer transition-all flex items-center justify-center font-sans tracking-wide"
                          title="Daftar Bullets (List)"
                        >
                          • Daftar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertEditorTag("[", "](https://link-tujuan.com)", "Teks Tautan")}
                          className="px-2.5 py-1 text-[11px] font-bold text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 rounded cursor-pointer transition-all flex items-center justify-center font-sans tracking-wide"
                          title="Sematkan Tautan (Insert Link)"
                        >
                          🔗 Sematkan Link
                        </button>
                        <div className="h-4 w-px bg-white/10 mx-1 ml-auto sm:ml-0" />
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Kosongkan seluruh naskah berita?")) {
                              setNewsForm({ ...newsForm, content: "" });
                            }
                          }}
                          className="px-2.5 py-1 text-[10px] font-bold text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 rounded cursor-pointer transition-all flex items-center justify-center ml-auto font-sans tracking-wide"
                          title="Hapus naskah"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" /> Kosongkan
                        </button>
                      </div>

                      <textarea
                        id="news-content-textarea"
                        rows={11}
                        required
                        value={newsForm.content}
                        onChange={e => setNewsForm({ ...newsForm, content: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 border-t-0 rounded-b-xl rounded-t-none px-4 py-3.5 text-xs text-white focus:outline-none focus:border-emerald-500/30 leading-relaxed font-sans shadow-inner transition-colors"
                        placeholder="Tulis naskah berita lengkap di sini dengan dukungan formatting tolbar di atas..."
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="bg-[#047857] hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
                    >
                      Simpan Konten Berita
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {news.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white/[0.02] border border-white/10 hover:border-white/15 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all"
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-20 h-16 rounded-lg bg-zinc-950 overflow-hidden flex-shrink-0 border border-white/10">
                          <img src={item.imageUrl} alt="" className="w-full h-full object-cover opacity-75" referrerPolicy="no-referrer" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase font-mono tracking-wider font-extrabold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">{item.category}</span>
                            <span className="text-[10px] text-white/50">{item.date}</span>
                          </div>
                          <h4 className="text-sm font-semibold text-white leading-snug line-clamp-1">{item.title}</h4>
                          <p className="text-white/40 text-xs line-clamp-1">{item.excerpt}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => startNewsEdit(item)}
                          className="p-2 border border-white/5 hover:border-white/15 bg-white/5 hover:bg-white/10 rounded-xl hover:text-white text-neutral-300 transition-all cursor-pointer"
                          title="Edit berita"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteNewsItem(item.id)}
                          className="p-2 border border-white/5 hover:border-white/10 hover:border-red-500/20 bg-white/5 hover:bg-red-950/40 rounded-xl hover:text-red-400 text-neutral-400 transition-all cursor-pointer"
                          title="Hapus berita"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {news.length === 0 && (
                    <div className="text-center py-12 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
                      <FileText className="w-12 h-12 text-white/20 mx-auto mb-3" />
                      <p className="text-white/50 text-xs">Belum ada kabar kegiatan terisi. Silakan tambahkan kabar pertama Anda!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: GALLERY DOKUMENTASI */}
          {activeTab === "gallery" && (
            <div className="w-full max-w-7xl xl:max-w-full space-y-6 text-left">
              {renderDisabledSeksiWarning("gallery", "Galeri Kegiatan")}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-display text-white">Kelola Foto Galeri Dokumentasi</h2>
                  <p className="text-neutral-400 text-xs mt-1">Kelola album rekam jejak perjuangan, apel akbar, pengamanan kemanusiaan dll.</p>
                </div>
                {!editingId && !isCreating && (
                  <button
                    type="button"
                    onClick={startGalleryCreate}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Foto
                  </button>
                )}
              </div>

              {editingId || isCreating ? (
                <form onSubmit={handleGallerySubmit} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-5">
                  <h3 className="text-sm font-bold text-ansor-gold uppercase tracking-wider flex items-center gap-2">
                    <Edit2 className="w-4 h-4" />
                    {isCreating ? "Tambah Foto Dokumentasi Baru" : "Edit Foto Dokumentasi"}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5 col-span-1 md:col-span-2">
                      <label className="text-xs font-semibold text-neutral-300">Deskripsi Ringkas Judul Foto</label>
                      <input
                        type="text"
                        required
                        value={galleryForm.title}
                        onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                        placeholder="Apel Kesetiaan NKRI 10.000 Banser"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">Kategori Berkas</label>
                      <input
                        type="text"
                        required
                        value={galleryForm.category}
                        onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                        placeholder="Kebangsaan / Pengkaderan"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">Keterangan Tambahan / Lokasi Acara</label>
                      <input
                        type="text"
                        value={galleryForm.description || ""}
                        onChange={e => setGalleryForm({ ...galleryForm, description: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                        placeholder="Kegiatan Apel Akbar Banser Kabupaten Bogor..."
                      />
                    </div>

                    <div className="space-y-1.5 col-span-1 md:col-span-2">
                      <label className="text-xs font-semibold text-neutral-300">Gambar Dokumentasi Kegiatan</label>
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          required
                          value={galleryForm.imageUrl}
                          onChange={e => setGalleryForm({ ...galleryForm, imageUrl: e.target.value })}
                          className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                          placeholder="Masukkan URL foto atau unggah langsung..."
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            id="galleryitem-upload"
                            className="hidden"
                            onChange={e => handleImageUploadHelper(e, (base64) => setGalleryForm({ ...galleryForm, imageUrl: base64 }))}
                          />
                          <label
                            htmlFor="galleryitem-upload"
                            className="px-3.5 py-1.5 bg-emerald-950/40 hover:bg-[#042f1a] border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            Upload JPG/PNG
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
                    >
                      Simpan Foto
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gallery.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between group"
                    >
                      <div className="relative h-36 bg-zinc-950 overflow-hidden border-b border-white/5">
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover opacity-70" referrerPolicy="no-referrer" />
                        <span className="absolute top-2 left-2 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-md">
                          {item.category}
                        </span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between text-left">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-white leading-tight line-clamp-1">{item.title}</h4>
                          <p className="text-[11px] text-white/50 leading-relaxed line-clamp-2">{item.description}</p>
                        </div>

                        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-white/5">
                          <button
                            type="button"
                            onClick={() => startGalleryEdit(item)}
                            className="p-1.5 border border-white/5 hover:border-white/15 bg-white/5 hover:bg-white/10 rounded-lg hover:text-white text-neutral-300 transition-all cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteGalleryItem(item.id)}
                            className="p-1.5 border border-white/5 hover:border-red-500/20 bg-white/5 hover:bg-red-950/40 rounded-lg hover:text-red-400 text-neutral-400 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: DEWAN PIMPINAN */}
          {activeTab === "leaders" && (
            <div className="w-full max-w-7xl xl:max-w-full space-y-6 text-left">
              {renderDisabledSeksiWarning("leaders", "Dewan Pimpinan")}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-display text-white">Kelola Anggota Dewan Pimpinan</h2>
                  <p className="text-neutral-400 text-xs mt-1">Kelola jajaran inti pengurus Harian Pimpinan Cabang GP Ansor Kabupaten Bogor.</p>
                </div>
                {!editingId && !isCreating && (
                  <button
                    type="button"
                    onClick={startLeaderCreate}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Pimpinan
                  </button>
                )}
              </div>

              {editingId || isCreating ? (
                <form onSubmit={handleLeaderSubmit} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-5">
                  <h3 className="text-sm font-bold text-ansor-gold uppercase tracking-wider flex items-center gap-2">
                    <Edit2 className="w-4 h-4" />
                    {isCreating ? "Tambah Profil Pimpinan Baru" : "Edit Profil Pimpinan"}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">Nama Pimpinan (Beserta Gelar)</label>
                      <input
                        type="text"
                        required
                        value={leaderForm.name}
                        onChange={e => setLeaderForm({ ...leaderForm, name: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                        placeholder="H. Dhamiry Ghozali"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">Jabatan Kepengurusan PC</label>
                      <input
                        type="text"
                        required
                        value={leaderForm.role}
                        onChange={e => setLeaderForm({ ...leaderForm, role: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                        placeholder="Ketua PC GP Ansor Kabupaten Bogor"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-1 md:col-span-2">
                      <label className="text-xs font-semibold text-neutral-300">Foto Anggota Pimpinan</label>
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          required
                          value={leaderForm.imageUrl}
                          onChange={e => setLeaderForm({ ...leaderForm, imageUrl: e.target.value })}
                          className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                          placeholder="Link URL foto atau unggah baru..."
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            id="leader-gallery-upload"
                            className="hidden"
                            onChange={e => handleImageUploadHelper(e, (base64) => setLeaderForm({ ...leaderForm, imageUrl: base64 }))}
                          />
                          <label
                            htmlFor="leader-gallery-upload"
                            className="px-3.5 py-1.5 bg-emerald-950/40 hover:bg-[#042f1a] border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            Ganti Foto Profil
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md"
                    >
                      Simpan Pimpinan
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leaders.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white/[0.02] border border-white/10 p-4 rounded-2xl flex items-center justify-between gap-4 transition-all hover:border-white/15"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-neutral-900 border border-white/10">
                          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-xs sm:text-sm font-bold text-white">{item.name}</h4>
                          <p className="text-white/40 text-[10px] mt-0.5">{item.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => startLeaderEdit(item)}
                          className="p-2 border border-white/5 hover:border-white/10 bg-white/5 hover:bg-white/10 rounded-lg hover:text-white text-neutral-300 transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteLeaderItem(item.id)}
                          className="p-2 border border-white/5 hover:border-red-500/20 bg-white/5 hover:bg-red-950/40 rounded-lg hover:text-red-400 text-neutral-400 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: OUTBOUND CONTACTS */}
          {activeTab === "contact" && (
            <div className="w-full max-w-7xl xl:max-w-full space-y-6 text-left">
              {renderDisabledSeksiWarning("contact", "Informasi Kontak Footer")}
              
              <div>
                <h2 className="text-xl font-bold font-display text-white">Kelola Informasi Kontak & Footer</h2>
                <p className="text-neutral-400 text-xs mt-1">Mutakhirkan alamat surat resmi, saluran telepon darurat, link website serta email publik PC GP Ansor Bogor.</p>
              </div>

              <form onSubmit={handleContactSave} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-5">
                <h3 className="text-xs font-bold text-ansor-gold uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
                  <MapPin className="w-4 h-4" />
                  Koordinasi Alamat Fisik & Saluran Telepon
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="text-xs font-semibold text-neutral-300">Alamat Kantor Sekretariat Utama</label>
                    <input
                      type="text"
                      required
                      value={contactForm.address}
                      onChange={e => setContactForm({ ...contactForm, address: e.target.value })}
                      className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                      placeholder="Jl. Tegar Beriman, Cibinong, Kabupaten Bogor..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">Nomor Telepon Hotline / WhatsApp</label>
                    <input
                      type="text"
                      required
                      value={contactForm.phone}
                      onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">Surat Elektronik (Email) Resmi</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">Domain Website Resmi</label>
                    <input
                      type="text"
                      required
                      value={contactForm.website}
                      onChange={e => setContactForm({ ...contactForm, website: e.target.value })}
                      className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <h3 className="text-xs font-bold text-ansor-gold uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3 pt-2">
                  <Share2 className="w-4 h-4" />
                  Saluran Media Sosial Resmi (Footer)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">Tautan Instagram (IG)</label>
                    <input
                      type="text"
                      value={contactForm.instagram || ""}
                      onChange={e => setContactForm({ ...contactForm, instagram: e.target.value })}
                      className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                      placeholder="Contoh: https://instagram.com/ansorkabogor"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">Tautan Facebook (FB)</label>
                    <input
                      type="text"
                      value={contactForm.facebook || ""}
                      onChange={e => setContactForm({ ...contactForm, facebook: e.target.value })}
                      className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                      placeholder="Contoh: https://facebook.com/ansorkabogor"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">Tautan YouTube (YT)</label>
                    <input
                      type="text"
                      value={contactForm.youtube || ""}
                      onChange={e => setContactForm({ ...contactForm, youtube: e.target.value })}
                      className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                      placeholder="Contoh: https://youtube.com/@ansorkabogor"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">Tautan TikTok</label>
                    <input
                      type="text"
                      value={contactForm.tiktok || ""}
                      onChange={e => setContactForm({ ...contactForm, tiktok: e.target.value })}
                      className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                      placeholder="Contoh: https://tiktok.com/@ansorkabogor"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex justify-end">
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Simpan Kontak Footer
                  </button>
                </div>
              </form>

              {/* ADS CONFIGURATION PANEL */}
              <form onSubmit={handleAdsSave} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-5">
                <h3 className="text-xs font-bold text-ansor-gold uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
                  <Sliders className="w-4 h-4 text-emerald-500" />
                  Pengaturan Banner Iklan / Ads (970 x 150 px)
                </h3>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white uppercase tracking-wider block">Status Penayangan Banner Iklan</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* OPTION 1: NONAKTIF */}
                    <div
                      onClick={() => setAdsForm({ ...adsForm, enabled: false })}
                      className={`group relative overflow-hidden px-4 py-3.5 rounded-2xl border transition-all duration-300 cursor-pointer text-left flex items-center gap-3.5 ${
                        !adsForm.enabled
                          ? "bg-red-950/20 border-red-500/40 shadow-sm shadow-red-950/20"
                          : "bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.03]"
                      }`}
                    >
                      {/* The custom indicator box from the reference image: pink/red rounded box with center red dot */}
                      <div className={`w-9 h-9 rounded-[14px] flex items-center justify-center transition-all ${
                        !adsForm.enabled
                          ? "bg-red-500/15 border border-red-500/30"
                          : "bg-neutral-900 border border-white/5"
                      }`}>
                        <span className={`w-2.5 h-2.5 rounded-full bg-red-500 transition-all ${!adsForm.enabled ? "scale-110" : "opacity-30"}`} />
                      </div>
                      <div className="space-y-0.5">
                        <div className={`text-xs font-bold transition-all ${!adsForm.enabled ? "text-red-400" : "text-neutral-400"}`}>
                          Tidak Aktif (Sembunyikan)
                        </div>
                        <p className="text-[10px] text-neutral-400 font-sans">Sembunyikan iklan dari website utama.</p>
                      </div>
                    </div>

                    {/* OPTION 2: AKTIF */}
                    <div
                      onClick={() => setAdsForm({ ...adsForm, enabled: true })}
                      className={`group relative overflow-hidden px-4 py-3.5 rounded-2xl border transition-all duration-300 cursor-pointer text-left flex items-center gap-3.5 ${
                        adsForm.enabled
                          ? "bg-emerald-950/25 border-emerald-500/40 shadow-sm shadow-emerald-950/20"
                          : "bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.03]"
                      }`}
                    >
                      {/* The custom indicator box matching reference image but in green */}
                      <div className={`w-9 h-9 rounded-[14px] flex items-center justify-center transition-all ${
                        adsForm.enabled
                          ? "bg-emerald-500/15 border border-emerald-500/30"
                          : "bg-neutral-900 border border-white/5"
                      }`}>
                        <span className={`w-2.5 h-2.5 rounded-full bg-emerald-500 transition-all ${adsForm.enabled ? "animate-pulse scale-110" : "opacity-30"}`} />
                      </div>
                      <div className="space-y-0.5">
                        <div className={`text-xs font-bold transition-all ${adsForm.enabled ? "text-emerald-400" : "text-neutral-400"}`}>
                          Aktif (Tampilkan Iklan)
                        </div>
                        <p className="text-[10px] text-neutral-400 font-sans">Tampilkan banner iklan secara publik.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <span>Kode Script Iklan / Embed Kode &lt;script&gt; iklan (Adsterra / AdSense / dll)</span>
                    </label>
                    <textarea
                      value={adsForm.scriptCode || ""}
                      onChange={e => setAdsForm({ ...adsForm, scriptCode: e.target.value })}
                      className="w-full bg-[#010903] border border-amber-500/20 rounded-xl px-4 py-2.5 text-xs text-amber-200 font-mono focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all h-36"
                      placeholder="Tempel kode <script> iklan Anda disini..."
                    />
                    <p className="text-[9.5px] text-amber-200/60 leading-relaxed">
                      💡 **Catatan Penting**: Tempelkan kode `&lt;script&gt;` di atas, website utama akan merender banner iklan hasil script tersebut (seperti iframe ad network 728x90 px) secara aman.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex justify-between items-center text-left">
                  <div className="text-[10px] text-neutral-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                    Banner 970x150 responsif otomatis di laptop, tablet, mobile
                  </div>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Simpan Banner Iklan
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 8: MONITORING PEMBACA (READER ANALYTICS) */}
          {activeTab === "analytics" && (
            <div className="w-full max-w-7xl xl:max-w-full space-y-6 text-left">
              {renderDisabledSeksiWarning("analytics", "Monitoring Pembaca")}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-display text-white">Sistem Monitoring Intelijen Pembaca</h2>
                  <p className="text-neutral-400 text-xs mt-1">Pantau tren statistik pengunjung, rujukan demografis, live stream aktivitas pembaca, serta efektivitas syi'ar digital PC GP Ansor Bogor.</p>
                </div>

                {/* Range Selector */}
                <div className="flex bg-[#020d04] border border-white/10 p-1 rounded-xl self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => { setSelectedRange("7d"); setHoveredPoint(null); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedRange === "7d" 
                        ? "bg-emerald-600 text-white shadow-xs" 
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    7 Hari Terakhir
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedRange("30d"); setHoveredPoint(null); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedRange === "30d" 
                        ? "bg-emerald-600 text-white shadow-xs" 
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    30 Hari Terakhir
                  </button>
                </div>
              </div>

              {/* STATS OVERVIEW CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* CARD 1 */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Total Pageviews</span>
                    <div className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                      +18.4%
                    </div>
                  </div>
                  <h3 className="text-2xl font-black font-display text-white mt-2 leading-none">
                    {currentDataset.reduce((sum, item) => sum + item.pageviews, 0).toLocaleString("id-ID")}
                  </h3>
                  <p className="text-[10px] text-neutral-500 mt-1">Total akumulasi halaman dibuka</p>
                </div>

                {/* CARD 2 */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Pembaca Unik</span>
                    <div className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                      +12.8%
                    </div>
                  </div>
                  <h3 className="text-2xl font-black font-display text-white mt-2 leading-none">
                    {currentDataset.reduce((sum, item) => sum + item.uniques, 0).toLocaleString("id-ID")}
                  </h3>
                  <p className="text-[10px] text-neutral-500 mt-1">Pengunjung unik dari IP terpisah</p>
                </div>

                {/* CARD 3 */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Durasi Sesi</span>
                    <div className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                      +6.2%
                    </div>
                  </div>
                  <h3 className="text-2xl font-black font-display text-white mt-2 leading-none">3m 45s</h3>
                  <p className="text-[10px] text-neutral-500 mt-1">Rata-rata waktu membaca artikel</p>
                </div>

                {/* CARD 4 */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Rasio Pantulan (Bounce)</span>
                    <div className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                      -4.5%
                    </div>
                  </div>
                  <h3 className="text-2xl font-black font-display text-white mt-2 leading-none">
                    {(currentDataset.reduce((sum, item) => sum + item.bounce, 0) / currentDataset.length).toFixed(1)}%
                  </h3>
                  <p className="text-[10px] text-neutral-500 mt-1">Meninggalkan halaman tanpa interaksi</p>
                </div>
              </div>

              {/* CHART CARD WITH CUSTOM PROGRAMMATIC SVG RESIZE GRID */}
              <div className="bg-[#020d04] border border-white/10 rounded-2xl p-6 relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-ansor-gold" />
                      Grafik Trend Rentang Interaksi Pembaca
                    </h3>
                    <p className="text-[11px] text-neutral-400">Visualisasi realtime perbandingan tayangan halaman (Pageviews) vs Pembaca Unik.</p>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-mono shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                      <span className="text-emerald-300 font-bold">Pageviews</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#b2a05d]" />
                      <span className="text-ansor-gold font-bold">Pembaca Unik</span>
                    </div>
                  </div>
                </div>

                {/* RENDER CUSTOM SVG GRAPH */}
                {(() => {
                  const maxVal = Math.max(...currentDataset.map(d => d.pageviews), 100) * 1.15;
                  const w = 1000;
                  const h = 320;
                  const pL = 70;
                  const pR = 30;
                  const pT = 20;
                  const pB = 40;
                  const innerW = w - pL - pR;
                  const innerH = h - pT - pB;

                  const pts = currentDataset.map((d, index) => {
                    const x = pL + (index / (currentDataset.length - 1)) * innerW;
                    const y = h - pB - (d.pageviews / maxVal) * innerH;
                    return { x, y, ...d, index };
                  });

                  const uniqPts = currentDataset.map((d, index) => {
                    const x = pL + (index / (currentDataset.length - 1)) * innerW;
                    const y = h - pB - (d.uniques / maxVal) * innerH;
                    return { x, y, ...d, index };
                  });

                  // Path builders
                  const pvPath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                  const pvArea = `${pvPath} L ${pts[pts.length - 1].x} ${h - pB} L ${pts[0].x} ${h - pB} Z`;

                  const uniqPath = uniqPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                  const uniqArea = `${uniqPath} L ${uniqPts[uniqPts.length - 1].x} ${h - pB} L ${uniqPts[0].x} ${h - pB} Z`;

                  const activeIdx = hoveredPoint !== null ? hoveredPoint : currentDataset.length - 1;
                  const activePV = pts[activeIdx];
                  const activeUniq = uniqPts[activeIdx];

                  return (
                    <div className="relative">
                      {/* Responsive container */}
                      <svg 
                        viewBox={`0 0 ${w} ${h}`} 
                        className="w-full overflow-visible select-none"
                        onMouseMove={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const clientX = e.clientX - rect.left;
                          const ratio = clientX / rect.width;
                          const approxX = ratio * w;
                          let closest = 0;
                          let minD = Infinity;
                          pts.forEach((p, index) => {
                            const d = Math.abs(p.x - approxX);
                            if (d < minD) {
                              minD = d;
                              closest = index;
                            }
                          });
                          setHoveredPoint(closest);
                        }}
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        {/* Define gradients for premium area glow */}
                        <defs>
                          <linearGradient id="pvGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
                          </linearGradient>
                          <linearGradient id="uniqGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#b2a05d" stopOpacity="0.20" />
                            <stop offset="100%" stopColor="#b2a05d" stopOpacity="0.00" />
                          </linearGradient>
                        </defs>

                        {/* Y Axis Grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                          const y = h - pB - ratio * innerH;
                          const labelVal = Math.round(ratio * maxVal);
                          return (
                            <g key={i}>
                              <line 
                                x1={pL} 
                                y1={y} 
                                x2={w - pR} 
                                y2={y} 
                                stroke="rgba(255,255,255,0.05)" 
                                strokeDasharray="3 3" 
                              />
                              <text 
                                x={pL - 12} 
                                y={y + 4} 
                                textAnchor="end" 
                                className="fill-neutral-500 font-mono text-[10px] font-medium"
                              >
                                {labelVal}
                              </text>
                            </g>
                          );
                        })}

                        {/* X Axis dates */}
                        {pts.map((p, i) => {
                          const isEnd = i === pts.length - 1;
                          const isStart = i === 0;
                          return (
                            <text
                              key={i}
                              x={p.x}
                              y={h - 15}
                              textAnchor={isStart ? "start" : isEnd ? "end" : "middle"}
                              className="fill-neutral-400 font-sans text-[10px] font-semibold"
                            >
                              {p.date}
                            </text>
                          );
                        })}

                        {/* Areas */}
                        <path d={pvArea} fill="url(#pvGlow)" />
                        <path d={uniqArea} fill="url(#uniqGlow)" />

                        {/* Lines */}
                        <path d={pvPath} stroke="#10b981" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        <path d={uniqPath} stroke="#b2a05d" strokeWidth="2.5" strokeDasharray="4 2" fill="none" strokeLinecap="round" />

                        {/* Guided Vertical Indicator line on hover */}
                        {hoveredPoint !== null && (
                          <line 
                            x1={activePV.x} 
                            y1={pT} 
                            x2={activePV.x} 
                            y2={h - pB} 
                            stroke="rgba(16, 185, 129, 0.3)" 
                            strokeWidth="1.5" 
                            strokeDasharray="2 2"
                          />
                        )}

                        {/* Point circles matching */}
                        {pts.map((p, i) => {
                          const isHovered = activeIdx === i;
                          return (
                            <g key={i}>
                              <circle 
                                cx={p.x} 
                                cy={p.y} 
                                r={isHovered ? 5.5 : 3} 
                                fill="#10b981" 
                                stroke="#020d04" 
                                strokeWidth="1.5"
                                className="transition-all duration-150"
                              />
                              <circle 
                                cx={uniqPts[i].x} 
                                cy={uniqPts[i].y} 
                                r={isHovered ? 5.5 : 3} 
                                fill="#b2a05d" 
                                stroke="#020d04" 
                                strokeWidth="1.5"
                                className="transition-all duration-150"
                              />
                            </g>
                          );
                        })}
                      </svg>

                      {/* STAT FLOATER TOOLTIP ASSET CARD */}
                      <div className="mt-4 bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <Activity className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                              Data Terfokus: <span className="text-white font-bold">{activePV.date}</span>
                            </p>
                            <p className="text-[11px] text-neutral-300 mt-0.5">Metrik pembaca detail tercatat</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                          <div>
                            <span className="text-[9px] text-neutral-500 uppercase font-mono block">Pageviews</span>
                            <span className="text-sm font-bold text-emerald-400">{activePV.pageviews}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-neutral-500 uppercase font-mono block">Unik (IP)</span>
                            <span className="text-sm font-bold text-ansor-gold">{activePV.uniques}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-neutral-500 uppercase font-mono block">Rasio Bounce</span>
                            <span className="text-sm font-bold text-white">{activePV.bounce}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* TWO COLUMN GRID BELOW GRAPH */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* INTERACTIVE LIVE LOGGER PORT - 3 COLUMNS */}
                <div className="lg:col-span-3 bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Aktivitas Pembaca Real-Time
                      </h4>
                      <p className="text-[10px] text-neutral-400 mt-0.5">Log siaran radar kunjungan portal GP Ansor se-Kabupaten Bogor.</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-[#020d04] border border-emerald-500/20 text-emerald-400 text-[9px] font-mono">
                      LIVE FEED
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1 text-left">
                    {liveLogs.map((log) => (
                      <div 
                        key={log.id} 
                        className={`p-3 rounded-xl border flex items-start gap-3 transition-all duration-500 ${
                          log.isNew 
                            ? "bg-emerald-950/20 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.05)] translate-x-1" 
                            : "bg-white/[0.01] border-white/5"
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${log.isNew ? "bg-emerald-400 animate-pulse" : "bg-neutral-600"}`} />
                        <div className="flex-grow min-w-0">
                          <p className="text-xs font-medium text-neutral-200 leading-relaxed break-words">{log.message}</p>
                          <span className="text-[9px] font-mono text-neutral-500 mt-1 block">{log.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DEMOGRAPHICS - 2 COLUMNS */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3">
                      Asal Kecamatan Teraktif
                    </h4>
                    
                    <div className="space-y-3">
                      {[
                        { district: "Cibinong", count: "4.120 rilis", share: 82 },
                        { district: "Babakan Madang", count: "3.110 rilis", share: 68 },
                        { district: "Gunung Putri", count: "2.420 rilis", share: 52 },
                        { district: "Ciawi", count: "2.110 rilis", share: 44 },
                        { district: "Jonggol", count: "1.320 rilis", share: 28 }
                      ].map((d, i) => (
                        <div key={i} className="space-y-1 text-left">
                          <div className="flex justify-between text-xs font-medium text-neutral-300">
                            <span>{d.district}</span>
                            <span className="text-neutral-400 text-[10px] font-mono">{d.count}</span>
                          </div>
                          <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-1000"
                              style={{ width: `${d.share}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: LAYANAN DIGITAL (KADERISASI & E-PERSURATAN) */}
          {activeTab === "services" && (
            <div className="w-full max-w-7xl xl:max-w-full space-y-6 text-left">
              <div>
                <h2 className="text-xl font-bold font-display text-white">Sistem Kelola Portal & Layanan Digital</h2>
                <p className="text-neutral-400 text-xs mt-1">
                  Atur tautan eksternal, keterangan peluncuran, penayangan navigasi menu, serta unggahan berkas gambar QR Code unik untuk Sistem Presensi Kaderisasi dan Portal E-Persuratan PC GP Ansor Kabupaten Bogor.
                </p>
              </div>

              <form onSubmit={handleServicesSave} className="space-y-6">
                {/* SUB APPLICATION 1: KADERISASI */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-3">
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      1. Aplikasi Presensi Kaderisasi
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-neutral-300">Status Publikasi:</span>
                      <button
                        type="button"
                        onClick={() => setMenuStatus({ ...menuStatus, kaderisasi: !menuStatus.kaderisasi })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          menuStatus.kaderisasi 
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" 
                            : "bg-red-500/15 border-red-500/30 text-red-400"
                        }`}
                      >
                        {menuStatus.kaderisasi ? "● Aktif di Landing Page" : "○ Nonaktif"}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Form Input fields */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-300">Judul Aplikasi / Judul Layanan</label>
                        <input
                          type="text"
                          required
                          value={servicesForm.kaderisasi.title}
                          onChange={e => setServicesForm({
                            ...servicesForm,
                            kaderisasi: { ...servicesForm.kaderisasi, title: e.target.value }
                          })}
                          className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                          placeholder="Presensi Kaderisasi"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-300">Tautan Tujuan Web Aplikasi (Link URL)</label>
                        <input
                          type="url"
                          required
                          value={servicesForm.kaderisasi.linkUrl}
                          onChange={e => setServicesForm({
                            ...servicesForm,
                            kaderisasi: { ...servicesForm.kaderisasi, linkUrl: e.target.value }
                          })}
                          className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                          placeholder="https://presensi.ansorbogor.or.id"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-300">Penjelasan Singkat Layanan</label>
                        <textarea
                          rows={3}
                          required
                          value={servicesForm.kaderisasi.description}
                          onChange={e => setServicesForm({
                            ...servicesForm,
                            kaderisasi: { ...servicesForm.kaderisasi, description: e.target.value }
                          })}
                          className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white leading-relaxed"
                          placeholder="Keterangan fungsional aplikasi ini..."
                        />
                      </div>
                    </div>

                    {/* QR Code Upload Block */}
                    <div className="col-span-1 flex flex-col items-center justify-between text-center bg-white/[0.01] border border-white/5 rounded-xl p-4 space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">QR Code Gambar</span>
                        <p className="text-[9px] text-neutral-500 leading-tight">Gunakan QR Code kustom Anda sendiri</p>
                      </div>

                      <div className="w-28 h-28 bg-[#020d04] border border-white/10 rounded-lg p-2 flex items-center justify-center relative group overflow-hidden">
                        {servicesForm.kaderisasi.qrCodeUrl ? (
                          <>
                            <img 
                              src={servicesForm.kaderisasi.qrCodeUrl} 
                              alt="Kaderisasi QR" 
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                            <button
                              type="button"
                              onClick={() => setServicesForm({
                                ...servicesForm,
                                kaderisasi: { ...servicesForm.kaderisasi, qrCodeUrl: "" }
                              })}
                              className="absolute inset-0 bg-red-950/80 text-red-255 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer"
                            >
                              Hapus Gambar
                            </button>
                          </>
                        ) : (
                          <div className="text-center p-1">
                            <QrCode className="w-8 h-8 text-neutral-600 mx-auto animate-pulse" />
                            <span className="text-[8px] text-neutral-400 font-medium block mt-1">Menggunakan Auto QR-Code</span>
                          </div>
                        )}
                      </div>

                      <div className="w-full">
                        <label className="w-full block py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-neutral-200 cursor-pointer transition-all text-center">
                          Unggah QR Baru
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => handleImageUploadHelper(e, (base64) => setServicesForm({
                              ...servicesForm,
                              kaderisasi: { ...servicesForm.kaderisasi, qrCodeUrl: base64 }
                            }))}
                          />
                        </label>
                      </div>
                    </div>

                  </div>
                </div>

                {/* SUB APPLICATION 2: E-PERSURATAN */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-3">
                    <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-400" />
                      2. Sistem E-Persuratan Cabang
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-neutral-300">Status Publikasi:</span>
                      <button
                        type="button"
                        onClick={() => setMenuStatus({ ...menuStatus, epersuratan: !menuStatus.epersuratan })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          menuStatus.epersuratan 
                            ? "bg-teal-500/15 border-teal-500/30 text-teal-400" 
                            : "bg-red-500/15 border-red-500/30 text-red-400"
                        }`}
                      >
                        {menuStatus.epersuratan ? "● Aktif di Landing Page" : "○ Nonaktif"}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Form Input fields */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-300">Judul Aplikasi / Judul Layanan</label>
                        <input
                          type="text"
                          required
                          value={servicesForm.epersuratan.title}
                          onChange={e => setServicesForm({
                            ...servicesForm,
                            epersuratan: { ...servicesForm.epersuratan, title: e.target.value }
                          })}
                          className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                          placeholder="E-Persuratan PC GP Ansor"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-300">Tautan Tujuan Web Aplikasi (Link URL)</label>
                        <input
                          type="url"
                          required
                          value={servicesForm.epersuratan.linkUrl}
                          onChange={e => setServicesForm({
                            ...servicesForm,
                            epersuratan: { ...servicesForm.epersuratan, linkUrl: e.target.value }
                          })}
                          className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                          placeholder="https://epersuratan.ansorbogor.or.id"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-300">Penjelasan Singkat Layanan</label>
                        <textarea
                          rows={3}
                          required
                          value={servicesForm.epersuratan.description}
                          onChange={e => setServicesForm({
                            ...servicesForm,
                            epersuratan: { ...servicesForm.epersuratan, description: e.target.value }
                          })}
                          className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white leading-relaxed"
                          placeholder="Keterangan fungsional aplikasi ini..."
                        />
                      </div>
                    </div>

                    {/* QR Code Upload Block */}
                    <div className="col-span-1 flex flex-col items-center justify-between text-center bg-white/[0.01] border border-white/5 rounded-xl p-4 space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">QR Code Gambar</span>
                        <p className="text-[9px] text-neutral-500 leading-tight">Gunakan QR Code kustom Anda sendiri</p>
                      </div>

                      <div className="w-28 h-28 bg-[#020d04] border border-white/10 rounded-lg p-2 flex items-center justify-center relative group overflow-hidden">
                        {servicesForm.epersuratan.qrCodeUrl ? (
                          <>
                            <img 
                              src={servicesForm.epersuratan.qrCodeUrl} 
                              alt="E-Persuratan QR" 
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                            <button
                              type="button"
                              onClick={() => setServicesForm({
                                ...servicesForm,
                                epersuratan: { ...servicesForm.epersuratan, qrCodeUrl: "" }
                              })}
                              className="absolute inset-0 bg-red-950/80 text-red-255 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer"
                            >
                              Hapus Gambar
                            </button>
                          </>
                        ) : (
                          <div className="text-center p-1">
                            <QrCode className="w-8 h-8 text-neutral-600 mx-auto animate-pulse" />
                            <span className="text-[8px] text-neutral-400 font-medium block mt-1">Menggunakan Auto QR-Code</span>
                          </div>
                        )}
                      </div>

                      <div className="w-full">
                        <label className="w-full block py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-neutral-200 cursor-pointer transition-all text-center">
                          Unggah QR Baru
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => handleImageUploadHelper(e, (base64) => setServicesForm({
                              ...servicesForm,
                              epersuratan: { ...servicesForm.epersuratan, qrCodeUrl: base64 }
                            }))}
                          />
                        </label>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex justify-end">
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-98"
                  >
                    <Save className="w-4 h-4" />
                    Simpan Perubahan Portal Layanan
                  </button>
                </div>
              </form>

              {/* SECTION 3: REKAP DATA KADERISASI */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-6 mt-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-xs font-bold text-[#b4deb5] uppercase tracking-wider flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-400" />
                      3. Rekap Data Kaderisasi PC GP Ansor Kabupaten Bogor
                    </h3>
                    <p className="text-neutral-400 text-[11px] mt-1">
                      Kompilasi formal diklat utama: Pelatihan Kepemimpinan Dasar (PKD), DIKLATSAR BANSER, serta PKL / SUSBALAN secara realtime.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={startAddKaderisasi}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg active:scale-95 text-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    Input Data Kaderisasi
                  </button>
                </div>

                {/* Live Stats Overview widgets */}
                {(() => {
                  const totalPkdGraduates = kaderisasiData.filter(r => r.type === "pkd").reduce((sum, r) => sum + r.pesertaLulus, 0);
                  const totalDiklatsarGraduates = kaderisasiData.filter(r => r.type === "diklatsar").reduce((sum, r) => sum + r.pesertaLulus, 0);
                  const totalPklGraduates = kaderisasiData.filter(r => r.type === "susbalan_pkl").reduce((sum, r) => sum + r.pesertaLulus, 0);
                  const overallGraduates = kaderisasiData.reduce((sum, r) => sum + r.pesertaLulus, 0);

                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {/* CARD 1: PKD */}
                      <div className="bg-white border border-emerald-500/10 p-5 sm:p-6 rounded-[24px] flex items-center justify-between gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-md group shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-left min-w-0">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-[#e6fcf0] border border-emerald-100 flex items-center justify-center text-[#006b54] shadow-xs">
                            <GraduationCap className="w-7 h-7 text-[#006b54]" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-800 font-display">Total PKD Lulus</h4>
                            <p className="text-xs sm:text-sm text-[#006b54] font-extrabold uppercase tracking-wide font-sans mt-0.5 whitespace-nowrap">PELATIHAN DASAR</p>
                            <p className="text-[10px] sm:text-xs text-slate-400 mt-1 font-sans">Kabupaten Bogor</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-center flex-shrink-0 ml-auto pl-4 border-l border-slate-100 min-w-[72px]">
                          <span className="text-3xl sm:text-4xl font-extrabold text-[#f43f5e] font-sans tracking-tight block leading-none">{totalPkdGraduates}</span>
                          <span className="text-[10px] sm:text-xs font-bold text-[#006b54] uppercase font-sans tracking-wider block mt-1.5 leading-none">KADER</span>
                        </div>
                      </div>

                      {/* CARD 2: DIKLATSAR */}
                      <div className="bg-white border border-amber-500/10 p-5 sm:p-6 rounded-[24px] flex items-center justify-between gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-md group shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-left min-w-0">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-amber-50/65 border border-amber-100 flex items-center justify-center text-amber-700 shadow-xs">
                            <Shield className="w-7 h-7 text-amber-600" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-800 font-display">Total DIKLATSAR</h4>
                            <p className="text-xs sm:text-sm text-[#006b54] font-extrabold uppercase tracking-wide font-sans mt-0.5 whitespace-nowrap">PENDIDIKAN BANSER</p>
                            <p className="text-[10px] sm:text-xs text-slate-400 mt-1 font-sans">Kabupaten Bogor</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-center flex-shrink-0 ml-auto pl-4 border-l border-slate-100 min-w-[72px]">
                          <span className="text-3xl sm:text-4xl font-extrabold text-[#f43f5e] font-sans tracking-tight block leading-none">{totalDiklatsarGraduates}</span>
                          <span className="text-[10px] sm:text-xs font-bold text-[#006b54] uppercase font-sans tracking-wider block mt-1.5 leading-none">BANSER</span>
                        </div>
                      </div>

                      {/* CARD 3: PKL & SUSBALAN */}
                      <div className="bg-white border border-emerald-500/10 p-5 sm:p-6 rounded-[24px] flex items-center justify-between gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-md group shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-left min-w-0">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-[#e6fcf0] border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-xs">
                            <Award className="w-7 h-7 text-[#006b54]" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-800 font-display">PKL & SUSBALAN</h4>
                            <p className="text-xs sm:text-sm text-[#006b54] font-extrabold uppercase tracking-wide font-sans mt-0.5 whitespace-nowrap">KURSUS SENIOR</p>
                            <p className="text-[10px] sm:text-xs text-slate-400 mt-1 font-sans">Kabupaten Bogor</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-center flex-shrink-0 ml-auto pl-4 border-l border-slate-100 min-w-[72px]">
                          <span className="text-3xl sm:text-4xl font-extrabold text-[#f43f5e] font-sans tracking-tight block leading-none">{totalPklGraduates}</span>
                          <span className="text-[10px] sm:text-xs font-bold text-[#006b54] uppercase font-sans tracking-wider block mt-1.5 leading-none">KADER</span>
                        </div>
                      </div>

                      {/* CARD 4: TOTAL ALUMNI */}
                      <div className="bg-white border border-emerald-500/10 p-5 sm:p-6 rounded-[24px] flex items-center justify-between gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-md group shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-left min-w-0">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-[#e6fcf0] border border-emerald-100 flex items-center justify-center text-emerald-800 shadow-xs">
                            <Users className="w-7 h-7 text-[#006b54]" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-800 font-display">Total Alumni</h4>
                            <p className="text-xs sm:text-sm text-[#006b54] font-extrabold uppercase tracking-wide font-sans mt-0.5 whitespace-nowrap">SEMUA JENJANG</p>
                            <p className="text-[10px] sm:text-xs text-slate-400 mt-1 font-sans">Kabupaten Bogor</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-center flex-shrink-0 ml-auto pl-4 border-l border-slate-100 min-w-[72px]">
                          <span className="text-3xl sm:text-4xl font-extrabold text-[#f43f5e] font-sans tracking-tight block leading-none">{overallGraduates}</span>
                          <span className="text-[10px] sm:text-xs font-bold text-[#006b54] uppercase font-sans tracking-wider block mt-1.5 leading-none">ANGGOTA</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Filters Row */}
                <div className="bg-[#041207]/40 border border-white/5 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                    <button
                      type="button"
                      onClick={() => setKaderisasiFilterTab("all")}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        kaderisasiFilterTab === "all"
                          ? "bg-emerald-600 text-white"
                          : "bg-white/5 hover:bg-white/10 text-neutral-300"
                      }`}
                    >
                      Tampilkan Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setKaderisasiFilterTab("pkd")}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        kaderisasiFilterTab === "pkd"
                          ? "bg-emerald-600 text-white"
                          : "bg-white/5 hover:bg-white/10 text-neutral-300"
                      }`}
                    >
                      PKD Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setKaderisasiFilterTab("diklatsar")}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        kaderisasiFilterTab === "diklatsar"
                          ? "bg-emerald-600 text-white"
                          : "bg-white/5 hover:bg-white/10 text-neutral-300"
                      }`}
                    >
                      DIKLATSAR Banser Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setKaderisasiFilterTab("susbalan_pkl")}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        kaderisasiFilterTab === "susbalan_pkl"
                          ? "bg-emerald-600 text-white"
                          : "bg-white/5 hover:bg-white/10 text-neutral-300"
                      }`}
                    >
                      PKL & SUSBALAN Only
                    </button>
                  </div>

                  <div className="w-full md:w-64">
                    <input
                      type="text"
                      placeholder="Cari wilayah/lokasi/sertifikat..."
                      value={kaderisasiSearch}
                      onChange={(e) => setKaderisasiSearch(e.target.value)}
                      className="w-full bg-[#020d04] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Tabular Lists block dynamically constructed */}
                {(() => {
                  const query = kaderisasiSearch.toLowerCase().trim();
                  const filtered = kaderisasiData.filter(row => {
                    return (
                      row.group.toLowerCase().includes(query) ||
                      row.lokasi.toLowerCase().includes(query) ||
                      row.angkatan.toLowerCase().includes(query) ||
                      row.noSertifikat.toLowerCase().includes(query)
                    );
                  });

                  const pkdRows = filtered.filter(r => r.type === "pkd");
                  const diklatsarRows = filtered.filter(r => r.type === "diklatsar");
                  const susbalanPklRows = filtered.filter(r => r.type === "susbalan_pkl");

                  return (
                    <div className="space-y-8">
                      {/* PKD Table */}
                      {(kaderisasiFilterTab === "all" || kaderisasiFilterTab === "pkd") && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-l-2 border-emerald-500 pl-2">
                            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                              1. Pelatihan Kepemimpinan Dasar (PKD)
                            </h4>
                            <span className="text-[10px] text-neutral-400 font-mono">({pkdRows.length} Pos Pembinaan)</span>
                          </div>

                          <div className="overflow-x-auto border border-emerald-950 rounded-xl bg-[#020d04]">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-[#122e17] text-[#c3e6cb] font-semibold border-b border-emerald-950">
                                  <th className="p-2.5 text-center w-10">No</th>
                                  <th className="p-2.5">PAC</th>
                                  <th className="p-2.5">PKD Angkatan</th>
                                  <th className="p-2.5 text-center">Peserta Lulus</th>
                                  <th className="p-2.5">Lokasi Kaderisasi</th>
                                  <th className="p-2.5">Tanggal</th>
                                  <th className="p-2.5">No. Sertifikat</th>
                                  <th className="p-2.5 text-center">Cetak</th>
                                  <th className="p-2.5">Link Sertifikat</th>
                                  <th className="p-2.5 text-center w-24">Aksi</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {pkdRows.length === 0 ? (
                                  <tr>
                                    <td colSpan={10} className="p-6 text-center text-neutral-500 italic">Tidak ada data PKD yang cocok</td>
                                  </tr>
                                ) : (
                                  pkdRows.map((row, idx) => (
                                    <tr key={row.id} className="hover:bg-emerald-950/20 transition-all text-neutral-300">
                                      <td className="p-2.5 text-center font-mono text-[11px] text-neutral-500">{idx + 1}</td>
                                      <td className="p-2.5 font-bold text-white">{row.group}</td>
                                      <td className="p-2.5">Angkatan {row.angkatan}</td>
                                      <td className="p-2.5 text-center font-bold text-emerald-400">{row.pesertaLulus} org</td>
                                      <td className="p-2.5 max-w-[150px] truncate" title={row.lokasi}>{row.lokasi}</td>
                                      <td className="p-2.5 text-neutral-400">{row.tanggal}</td>
                                      <td className="p-2.5 font-mono text-[10px] text-neutral-400" title={row.noSertifikat}>{row.noSertifikat || "-"}</td>
                                      <td className="p-2.5 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                          row.cetak === "yes" 
                                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" 
                                            : row.cetak === "no" 
                                            ? "bg-red-500/15 text-red-400 border border-red-500/30" 
                                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                        }`}>
                                          {row.cetak === "yes" ? "Yes" : row.cetak === "no" ? "No" : "Belum"}
                                        </span>
                                      </td>
                                      <td className="p-2.5">
                                        {row.linkSertifikat ? (
                                          <a 
                                            href={row.linkSertifikat} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="text-cyan-400 hover:text-cyan-300 font-bold inline-flex items-center gap-1 cursor-pointer hover:underline"
                                          >
                                            <Eye className="w-3 h-3" />
                                            <span>Buka Drive</span>
                                          </a>
                                        ) : (
                                          <span className="text-[10px] text-neutral-500">-</span>
                                        )}
                                      </td>
                                      <td className="p-2.5 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => startEditKaderisasi(row)}
                                            className="text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 p-1 rounded-lg transition-all cursor-pointer"
                                            title="Edit Data"
                                          >
                                            <Edit2 className="w-3 h-3" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteKaderisasi(row.id, row.group, row.angkatan)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 rounded-lg transition-all cursor-pointer"
                                            title="Hapus Data"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* DIKLATSAR Table */}
                      {(kaderisasiFilterTab === "all" || kaderisasiFilterTab === "diklatsar") && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-l-2 border-amber-500 pl-2">
                            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                              2. Pendidikan & Latihan Dasar Banser (DIKLATSAR)
                            </h4>
                            <span className="text-[10px] text-neutral-400 font-mono">({diklatsarRows.length} Satkoryon)</span>
                          </div>

                          <div className="overflow-x-auto border border-amber-950 rounded-xl bg-[#020d04]">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-[#302511] text-[#fbe1bb] font-semibold border-b border-amber-950">
                                  <th className="p-2.5 text-center w-10">No</th>
                                  <th className="p-2.5">Satkoryon</th>
                                  <th className="p-2.5">Diklatsar Angkatan</th>
                                  <th className="p-2.5 text-center">Peserta Lulus</th>
                                  <th className="p-2.5">Lokasi Kaderisasi</th>
                                  <th className="p-2.5">Tanggal</th>
                                  <th className="p-2.5">No. Sertifikat</th>
                                  <th className="p-2.5 text-center">Cetak</th>
                                  <th className="p-2.5">Link Sertifikat</th>
                                  <th className="p-2.5 text-center w-24">Aksi</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {diklatsarRows.length === 0 ? (
                                  <tr>
                                    <td colSpan={10} className="p-6 text-center text-neutral-500 italic">Tidak ada data DIKLATSAR yang cocok</td>
                                  </tr>
                                ) : (
                                  diklatsarRows.map((row, idx) => (
                                    <tr key={row.id} className="hover:bg-amber-955/10 transition-all text-neutral-300">
                                      <td className="p-2.5 text-center font-mono text-[11px] text-neutral-500">{idx + 1}</td>
                                      <td className="p-2.5 font-bold text-white">{row.group}</td>
                                      <td className="p-2.5">Angkatan {row.angkatan}</td>
                                      <td className="p-2.5 text-center font-bold text-amber-400">{row.pesertaLulus} org</td>
                                      <td className="p-2.5 max-w-[150px] truncate" title={row.lokasi}>{row.lokasi}</td>
                                      <td className="p-2.5 text-neutral-400">{row.tanggal}</td>
                                      <td className="p-2.5 font-mono text-[10px] text-neutral-400" title={row.noSertifikat}>{row.noSertifikat || "-"}</td>
                                      <td className="p-2.5 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                          row.cetak === "yes" 
                                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" 
                                            : row.cetak === "no" 
                                            ? "bg-red-500/15 text-red-400 border border-red-500/30" 
                                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                        }`}>
                                          {row.cetak === "yes" ? "Yes" : row.cetak === "no" ? "No" : "Belum"}
                                        </span>
                                      </td>
                                      <td className="p-2.5">
                                        {row.linkSertifikat ? (
                                          <a 
                                            href={row.linkSertifikat} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="text-cyan-400 hover:text-cyan-300 font-bold inline-flex items-center gap-1 cursor-pointer hover:underline"
                                          >
                                            <Eye className="w-3 h-3" />
                                            <span>Buka Drive</span>
                                          </a>
                                        ) : (
                                          <span className="text-[10px] text-neutral-500">-</span>
                                        )}
                                      </td>
                                      <td className="p-2.5 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => startEditKaderisasi(row)}
                                            className="text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 p-1 rounded-lg transition-all cursor-pointer"
                                            title="Edit Data"
                                          >
                                            <Edit2 className="w-3 h-3" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteKaderisasi(row.id, row.group, row.angkatan)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 rounded-lg transition-all cursor-pointer"
                                            title="Hapus Data"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* PKL & SUSBALAN Table */}
                      {(kaderisasiFilterTab === "all" || kaderisasiFilterTab === "susbalan_pkl") && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-l-2 border-teal-500 pl-2">
                            <h4 className="text-xs font-bold text-teal-400 uppercase tracking-widest">
                              3. Kursus Senior (PKL & SUSBALAN)
                            </h4>
                            <span className="text-[10px] text-neutral-400 font-mono">({susbalanPklRows.length} Posko Senior)</span>
                          </div>

                          <div className="overflow-x-auto border border-teal-950 rounded-xl bg-[#020d04]">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-[#112d2d] text-[#c9ecec] font-semibold border-b border-teal-950">
                                  <th className="p-2.5 text-center w-10">No</th>
                                  <th className="p-2.5">Satuan/Wilayah</th>
                                  <th className="p-2.5">Angkatan</th>
                                  <th className="p-2.5 text-center">Peserta Lulus</th>
                                  <th className="p-2.5">Lokasi Kaderisasi</th>
                                  <th className="p-2.5">Tanggal</th>
                                  <th className="p-2.5">No. Sertifikat</th>
                                  <th className="p-2.5 text-center">Cetak</th>
                                  <th className="p-2.5">Link Sertifikat</th>
                                  <th className="p-2.5 text-center w-24">Aksi</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {susbalanPklRows.length === 0 ? (
                                  <tr>
                                    <td colSpan={10} className="p-6 text-center text-neutral-500 italic">Tidak ada data PKL / Susbalan yang cocok</td>
                                  </tr>
                                ) : (
                                  susbalanPklRows.map((row, idx) => (
                                    <tr key={row.id} className="hover:bg-teal-955/10 transition-all text-neutral-300">
                                      <td className="p-2.5 text-center font-mono text-[11px] text-neutral-500">{idx + 1}</td>
                                      <td className="p-2.5 font-bold text-white">{row.group}</td>
                                      <td className="p-2.5">Angkatan {row.angkatan}</td>
                                      <td className="p-2.5 text-center font-bold text-teal-400">{row.pesertaLulus} org</td>
                                      <td className="p-2.5 max-w-[150px] truncate" title={row.lokasi}>{row.lokasi}</td>
                                      <td className="p-2.5 text-neutral-400">{row.tanggal}</td>
                                      <td className="p-2.5 font-mono text-[10px] text-neutral-400" title={row.noSertifikat}>{row.noSertifikat || "-"}</td>
                                      <td className="p-2.5 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                          row.cetak === "yes" 
                                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" 
                                            : row.cetak === "no" 
                                            ? "bg-red-500/15 text-red-400 border border-red-500/30" 
                                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                        }`}>
                                          {row.cetak === "yes" ? "Yes" : row.cetak === "no" ? "No" : "Belum"}
                                        </span>
                                      </td>
                                      <td className="p-2.5">
                                        {row.linkSertifikat ? (
                                          <a 
                                            href={row.linkSertifikat} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="text-cyan-400 hover:text-cyan-300 font-bold inline-flex items-center gap-1 cursor-pointer hover:underline"
                                          >
                                            <Eye className="w-3 h-3" />
                                            <span>Buka Drive</span>
                                          </a>
                                        ) : (
                                          <span className="text-[10px] text-neutral-500">-</span>
                                        )}
                                      </td>
                                      <td className="p-2.5 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => startEditKaderisasi(row)}
                                            className="text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 p-1 rounded-lg transition-all cursor-pointer"
                                            title="Edit Data"
                                          >
                                            <Edit2 className="w-3 h-3" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteKaderisasi(row.id, row.group, row.angkatan)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 rounded-lg transition-all cursor-pointer"
                                            title="Hapus Data"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
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

              {/* FORM MODAL POPUP FOR INPUT & EDIT INDIVIDUAL KADERISASI */}
              {isKaderisasiModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-[#031105] border border-emerald-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up text-left">
                    <div className="bg-emerald-950/40 px-6 py-4 border-b border-emerald-900/30 flex items-center justify-between">
                      <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
                        <GraduationCap className="w-4 h-4" />
                        {editingKaderisasiRow ? "Edit Rekap Data Kaderisasi" : "Input Baru Rekap Data Kaderisasi"}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsKaderisasiModalOpen(false)}
                        className="text-neutral-400 hover:text-white transition-all cursor-pointer p-1 rounded-lg hover:bg-white/5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleKaderisasiSubmit} className="p-6 space-y-4">
                      {/* Dynamic type dropdown selection */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-300 block">Kategori Pelatihan/Kaderisasi</label>
                        <select
                          value={kaderisasiForm.type}
                          onChange={(e) => setKaderisasiForm({ ...kaderisasiForm, type: e.target.value as any })}
                          className="w-full bg-[#010902]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase font-bold"
                        >
                          <option value="pkd">PKD (Pelatihan Kepemimpinan Dasar)</option>
                          <option value="diklatsar">DIKLATSAR BANSER</option>
                          <option value="susbalan_pkl">PKL / SUSBALAN</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-neutral-300 block">PAC / Satkoryon / Unit</label>
                          <input
                            type="text"
                            required
                            value={kaderisasiForm.group}
                            onChange={(e) => setKaderisasiForm({ ...kaderisasiForm, group: e.target.value })}
                            className="w-full bg-[#010902]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                            placeholder="e.g. Cileungsi"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-neutral-300 block">Angkatan Ke- (Romawi/Angka)</label>
                          <input
                            type="text"
                            required
                            value={kaderisasiForm.angkatan}
                            onChange={(e) => setKaderisasiForm({ ...kaderisasiForm, angkatan: e.target.value })}
                            className="w-full bg-[#010902]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                            placeholder="e.g. I, XXVIII"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-neutral-300 block">Peserta Lulus (Orang)</label>
                          <input
                            type="number"
                            min="0"
                            required
                            value={kaderisasiForm.pesertaLulus}
                            onChange={(e) => setKaderisasiForm({ ...kaderisasiForm, pesertaLulus: parseInt(e.target.value) || 0 })}
                            className="w-full bg-[#010902]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                            placeholder="e.g. 67"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-neutral-300 block">Status Cetak Sertifikat</label>
                          <select
                            value={kaderisasiForm.cetak}
                            onChange={(e) => setKaderisasiForm({ ...kaderisasiForm, cetak: e.target.value as any })}
                            className="w-full bg-[#010902]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold"
                          >
                            <option value="yes">Sudah Dicetak (Yes)</option>
                            <option value="no">Belum Dicetak (No)</option>
                            <option value="belum">Proses/Tunda (Belum)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-300 block">Lokasi Pelaksanaan</label>
                        <input
                          type="text"
                          required
                          value={kaderisasiForm.lokasi}
                          onChange={(e) => setKaderisasiForm({ ...kaderisasiForm, lokasi: e.target.value })}
                          className="w-full bg-[#010902]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                          placeholder="e.g. PP Al istianah Desa Cileungsi"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-300 block">Tanggal Kegiatan</label>
                        <input
                          type="text"
                          required
                          value={kaderisasiForm.tanggal}
                          onChange={(e) => setKaderisasiForm({ ...kaderisasiForm, tanggal: e.target.value })}
                          className="w-full bg-[#010902]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                          placeholder="e.g. 13-15 Desember 2019"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-300 block">Nomor Sertifikat / SK Resmi</label>
                        <input
                          type="text"
                          value={kaderisasiForm.noSertifikat}
                          onChange={(e) => setKaderisasiForm({ ...kaderisasiForm, noSertifikat: e.target.value })}
                          className="w-full bg-[#010902]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                          placeholder="e.g. 128 / IX-22-06 (2019-2023)..."
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-300 block">Tautan Folder Berkas (Google Drive / Link)</label>
                        <input
                          type="url"
                          value={kaderisasiForm.linkSertifikat}
                          onChange={(e) => setKaderisasiForm({ ...kaderisasiForm, linkSertifikat: e.target.value })}
                          className="w-full bg-[#010902]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                          placeholder="https://drive.google.com/..."
                        />
                      </div>

                      <div className="pt-4 border-t border-white/5 flex justify-end gap-2 px-1">
                        <button
                          type="button"
                          onClick={() => setIsKaderisasiModalOpen(false)}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
                        >
                          <Check className="w-4 h-4" />
                          {editingKaderisasiRow ? "Simpan Perubahan" : "Simpan Data Baru"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 10: USER MANAGEMENT & CUSTOM MENU LABELS (EXCLUSIVE SUPER ADMIN) */}
          {activeTab === "users" && isSuperAdmin && (
            <div className="w-full max-w-7xl xl:max-w-full space-y-8 text-left">
              <div>
                <h2 className="text-xl font-bold font-display text-white">Sistem Pengguna & Label Navigasi</h2>
                <p className="text-neutral-400 text-xs mt-1">
                  Konfigurasikan label representasi menu navigasi utama publik serta pahami manajemen izin otorisasi yang terhubung ke database Supabase Anda.
                </p>
              </div>

              {/* KOLOM UTAMA DAFTAR DATA PENGGUNA (FULL WIDTH) */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg space-y-4 text-slate-800 text-left font-sans">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-[#022A12] flex items-center gap-2 font-display uppercase tracking-wide">
                      <Users className="w-5 h-5 text-emerald-600" />
                      Daftar Pengguna Website
                    </h4>
                    <p className="text-slate-500 text-xs">
                      Kelola semua hak akses panel administratif yang aman dan terdaftar di server database Supabase Anda.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <button
                      type="button"
                      onClick={() => {
                        resetUserForm();
                        setShowUserModal(true);
                      }}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Pengguna Baru
                    </button>
                    <button
                      type="button"
                      onClick={fetchSupabaseUsers}
                      className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold px-3 py-2 rounded-xl border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isLoadingSupabaseUsers ? "animate-spin" : ""}`} />
                      Segarkan Data
                    </button>
                  </div>
                </div>

                {supabaseUsersError && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3.5 rounded-xl font-medium leading-relaxed text-left flex items-start gap-2">
                    <span className="text-sm mt-0.5 shrink-0">💡</span>
                    <div>
                      <p className="font-bold text-amber-950 mb-0.5">Berjalan dalam Mode Fallback Lokal</p>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        Tabel <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-amber-900">ansor_bogor_users</code> belum terdeteksi. Sistem menampilkan akun default di bawah agar navigasi login admin terus berfungsi dengan lancar.
                      </p>
                    </div>
                  </div>
                )}

                {isLoadingSupabaseUsers && supabaseUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2.5">
                    <RotateCcw className="w-7 h-7 animate-spin text-emerald-700" />
                    <span className="text-xs font-mono">Menghubungkan &amp; Mengunduh sandi...</span>
                  </div>
                ) : supabaseUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2 border border-dashed border-slate-200 rounded-xl">
                    <User className="w-9 h-9 text-slate-300" />
                    <div className="text-xs font-semibold text-slate-500">Tidak ada pengelola rujukan rill</div>
                    <p className="text-[10px] text-slate-400 text-center max-w-[280px]">
                      Gunakan tombol "Tambah Pengguna Baru" di atas untuk mengisi database pertama Anda.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                          <th className="px-4 py-3">Username</th>
                          <th className="px-4 py-3">Password / Kata Sandi</th>
                          <th className="px-4 py-3">Nama Lengkap</th>
                          <th className="px-4 py-3">Hak Akses Role</th>
                          <th className="px-4 py-3 text-right">Aksi Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {supabaseUsers.map((user) => (
                          <tr key={user.username} className="hover:bg-slate-50/50 transition-all font-sans">
                            <td className="px-4 py-3 font-bold text-slate-900 font-mono text-[12px] truncate max-w-[150px]">
                              {user.username}
                            </td>
                            <td className="px-4 py-3 text-slate-600 font-mono text-[11px] truncate max-w-[150px]" title={user.passwordHash}>
                              {user.passwordHash}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-800 truncate max-w-[200px]">
                              {user.name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                                user.role === "superadmin" 
                                  ? "bg-amber-100 text-amber-800 border border-amber-200" 
                                  : user.role === "ketuacabang"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-indigo-50 text-indigo-800 border border-indigo-150"
                              }`}>
                                {user.role === "superadmin" ? "Super Admin" : user.role === "ketuacabang" ? "Ketua" : "Sekretaris"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap space-x-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => startEditUserDirect(user)}
                                className="px-2.5 py-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5 text-[11px] font-bold"
                                title="Edit Akun"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteUserItemDirect(user.username)}
                                className="px-2.5 py-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5 text-[11px] font-bold"
                                title="Hapus Akun"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* OTORITAS SUPER ADMIN: MANAJEMEN HAK AKSES MENU */}
              <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-md space-y-6 text-slate-800 text-left font-sans">
                <div className="space-y-1 border-b border-slate-100 pb-4">
                  <h4 className="text-base font-extrabold text-[#022A12] flex items-center gap-2 font-display uppercase tracking-wide">
                    <ShieldCheck className="w-5.5 h-5.5 text-emerald-600" />
                    Manajemen Otoritas Akses Menu (Super Admin Only)
                  </h4>
                  <p className="text-slate-500 text-xs">
                    Atur secara dinamis menu/tab mana saja di panel admin ini yang diaktifkan bagi peran <strong>Ketua</strong> dan <strong>Sekretaris (Sekretariat)</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ROLE: KETUA CABANG */}
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">Peran: Ketua Cabang (ketuacabang)</h5>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800">
                      {[
                        { key: "general" as const, label: "Branding & Hero" },
                        { key: "about" as const, label: "Tentang & Pilar" },
                        { key: "programs" as const, label: "Program Kerja" },
                        { key: "registrants" as const, label: "Calon Anggota" },
                        { key: "news" as const, label: "Berita (News)" },
                        { key: "gallery" as const, label: "Galeri Kegiatan" },
                        { key: "leaders" as const, label: "Dewan Pimpinan" },
                        { key: "contact" as const, label: "Kontak & Footer" },
                        { key: "services" as const, label: "Layanan Digital" },
                        { key: "analytics" as const, label: "Monitor Pembaca" },
                        { key: "users" as const, label: "Label Navigasi" },
                      ].map((menuItem) => {
                        const isAllowed = rolePermissions.ketuacabang.includes(menuItem.key);
                        return (
                          <label key={menuItem.key} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200/50 transition-all cursor-pointer text-xs select-none font-medium">
                            <input
                              type="checkbox"
                              checked={isAllowed}
                              onChange={() => {
                                const current = [...rolePermissions.ketuacabang];
                                let updated: TabType[];
                                if (current.includes(menuItem.key)) {
                                  updated = current.filter(t => t !== menuItem.key);
                                } else {
                                  updated = [...current, menuItem.key];
                                }
                                setRolePermissions({
                                  ...rolePermissions,
                                  ketuacabang: updated
                                });
                                triggerToast("Hak akses Ketua Cabang berhasil diperbarui!");
                              }}
                              className="accent-emerald-700 rounded cursor-pointer w-4 h-4 shrink-0"
                            />
                            <span className={isAllowed ? "text-slate-900 font-bold" : "text-slate-400 font-normal"}>
                              {menuItem.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* ROLE: SEKRETARIAT CABANG */}
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                      <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">Peran: Sekretaris (sekretariat)</h5>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800">
                      {[
                        { key: "general" as const, label: "Branding & Hero" },
                        { key: "about" as const, label: "Tentang & Pilar" },
                        { key: "programs" as const, label: "Program Kerja" },
                        { key: "registrants" as const, label: "Calon Anggota" },
                        { key: "news" as const, label: "Berita (News)" },
                        { key: "gallery" as const, label: "Galeri Kegiatan" },
                        { key: "leaders" as const, label: "Dewan Pimpinan" },
                        { key: "contact" as const, label: "Kontak & Footer" },
                        { key: "services" as const, label: "Layanan Digital" },
                        { key: "analytics" as const, label: "Monitor Pembaca" },
                        { key: "users" as const, label: "Label Navigasi" },
                      ].map((menuItem) => {
                        const isAllowed = rolePermissions.sekretariat.includes(menuItem.key);
                        return (
                          <label key={menuItem.key} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200/50 transition-all cursor-pointer text-xs select-none font-medium">
                            <input
                              type="checkbox"
                              checked={isAllowed}
                              onChange={() => {
                                const current = [...rolePermissions.sekretariat];
                                let updated: TabType[];
                                if (current.includes(menuItem.key)) {
                                  updated = current.filter(t => t !== menuItem.key);
                                } else {
                                  updated = [...current, menuItem.key];
                                }
                                setRolePermissions({
                                  ...rolePermissions,
                                  sekretariat: updated
                                });
                                triggerToast("Hak akses Sekretaris Cabang berhasil diperbarui!");
                              }}
                              className="accent-indigo-700 rounded cursor-pointer w-4 h-4 shrink-0"
                            />
                            <span className={isAllowed ? "text-slate-900 font-bold" : "text-slate-400 font-normal"}>
                              {menuItem.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                {/* RECOVERY BUTTON */}
                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Apakah Anda yakin ingin menyetel ulang hak akses kedua peran ini ke pengaturan awal? (Berdasarkan instruksi, akses terbatas secara standar memiliki menu Kabar Syi'ar, Galeri Kegiatan, dan Monitor Pembaca)")) {
                        setRolePermissions({
                          sekretariat: ["news", "gallery", "analytics"],
                          ketuacabang: ["news", "gallery", "analytics"]
                        });
                        triggerToast("Hak akses berhasil di-reset ke peraturan standar!");
                      }
                    }}
                    className="px-4 py-2 bg-slate-150 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Hak Akses Standar (Kabar, Galeri, & Monitor)
                  </button>
                </div>
              </div>

              {/* MODAL INPUT/EDIT PENGGUNA BARU */}
              {showUserModal && (
                <div 
                  className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 font-sans transition-opacity duration-200"
                  id="user-crud-modal"
                  onClick={(e) => {
                    if ((e.target as HTMLElement).id === "user-crud-modal") {
                      resetUserForm();
                    }
                  }}
                >
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-200 scale-100 animate-[bounceSimple_0.25s_ease-out] border border-slate-100 flex flex-col text-left">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 px-6 py-4 flex items-center justify-between text-white">
                      <h4 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider font-display">
                        <UserCheck className="w-4 h-4 text-emerald-300" />
                        {isEditingUser ? "Ubah Data Pengguna" : "Input Data Pengguna Baru"}
                      </h4>
                      <button
                        type="button"
                        onClick={resetUserForm}
                        className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                        title="Tutup Form"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Body Form */}
                    <form onSubmit={handleUserSubmitDirect} className="p-6 space-y-4 text-slate-800">
                      <div className="space-y-1 text-left">
                        <label className="text-xs font-bold text-slate-700 block">Username (Huruf Kecil, Unik)</label>
                        <input
                          type="text"
                          required
                          disabled={isEditingUser}
                          value={userForm.username}
                          onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                          className={`w-full border rounded-xl px-3 py-2.5 text-xs font-mono transition-all text-left ${
                            isEditingUser 
                              ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed" 
                              : "bg-slate-50 text-slate-900 border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                          }`}
                          placeholder="e.g. miftah_ansor"
                        />
                        {!isEditingUser && (
                          <p className="text-[10px] text-slate-400 font-mono italic">* Gunakan huruf kecil tanpa spasi</p>
                        )}
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-xs font-bold text-slate-700 block">Kata Sandi (Password)</label>
                        <input
                          type="text"
                          required
                          value={userForm.passwordHash}
                          onChange={(e) => setUserForm({ ...userForm, passwordHash: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-mono focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-left"
                          placeholder="Masukkan kata sandi baru"
                        />
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-xs font-bold text-slate-700 block">Nama Lengkap Pemilik</label>
                        <input
                          type="text"
                          required
                          value={userForm.name}
                          onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-left"
                          placeholder="e.g. Sahabat Miftahudin"
                        />
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-xs font-bold text-slate-700 block">Hak Akses Modul (Role)</label>
                        <select
                          value={userForm.role}
                          onChange={(e) => setUserForm({ ...userForm, role: e.target.value as "superadmin" | "sekretariat" | "ketuacabang" })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-semibold text-left cursor-pointer"
                        >
                          <option value="sekretariat">Sekretariat Cabang (Akses Terbatas)</option>
                          <option value="ketuacabang">Ketua Cabang (Akses Terbatas)</option>
                          <option value="superadmin">Super Admin (Akses Penuh)</option>
                        </select>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 mt-5">
                        <button
                          type="button"
                          onClick={resetUserForm}
                          disabled={isLoadingSupabaseUsers}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-755 font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Tutup / Batal
                        </button>
                        <button
                          type="submit"
                          disabled={isLoadingSupabaseUsers}
                          className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md disabled:bg-emerald-700 disabled:opacity-80 disabled:cursor-wait"
                        >
                          {isLoadingSupabaseUsers ? (
                            <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                          ) : isEditingUser ? (
                            <Save className="w-3.5 h-3.5" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}
                          {isLoadingSupabaseUsers 
                            ? "Memproses..." 
                            : isEditingUser 
                            ? "Simpan Perubahan" 
                            : "Simpan Pengguna"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* GRID 2: PUBLIC NAVIGATION LABELS CONFIG */}
              <div className="bg-[#021408]/40 border border-white/10 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-ansor-gold uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    Pengaturan Nama Menu / Penamaan Tab Navigasi Publik
                  </h3>
                  <p className="text-neutral-400 text-[11px] mt-1">
                    Label nama-nama di bawah ini akan mengganti teks judul link navigasi di landing page website utama secara instan.
                  </p>
                </div>

                <form onSubmit={handleMenuLabelsSave} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300 block">1. Menu Beranda</label>
                      <input
                        type="text"
                        required
                        value={menuLabelsForm.beranda}
                        onChange={e => setMenuLabelsForm({ ...menuLabelsForm, beranda: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                        placeholder="Beranda"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300 block">2. Menu Kaderisasi</label>
                      <input
                        type="text"
                        required
                        value={menuLabelsForm.kaderisasi}
                        onChange={e => setMenuLabelsForm({ ...menuLabelsForm, kaderisasi: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                        placeholder="Kaderisasi"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300 block">3. Menu E-Persuratan</label>
                      <input
                        type="text"
                        required
                        value={menuLabelsForm.epersuratan}
                        onChange={e => setMenuLabelsForm({ ...menuLabelsForm, epersuratan: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                        placeholder="E-Persuratan"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300 block">4. Menu Tentang Kami</label>
                      <input
                        type="text"
                        required
                        value={menuLabelsForm.about}
                        onChange={e => setMenuLabelsForm({ ...menuLabelsForm, about: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                        placeholder="Tentang Kami"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300 block">5. Menu Program Kerja</label>
                      <input
                        type="text"
                        required
                        value={menuLabelsForm.programs}
                        onChange={e => setMenuLabelsForm({ ...menuLabelsForm, programs: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                        placeholder="Program Kerja"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300 block">6. Menu Berita & Kabar</label>
                      <input
                        type="text"
                        required
                        value={menuLabelsForm.news}
                        onChange={e => setMenuLabelsForm({ ...menuLabelsForm, news: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                        placeholder="Berita"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300 block">7. Menu Galeri Foto</label>
                      <input
                        type="text"
                        required
                        value={menuLabelsForm.gallery}
                        onChange={e => setMenuLabelsForm({ ...menuLabelsForm, gallery: e.target.value })}
                        className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                        placeholder="Galeri"
                      />
                    </div>

                  </div>

                  <div className="pt-3 border-t border-white/5 flex justify-end">
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-98"
                    >
                      <Save className="w-4 h-4" />
                      Simpan Perubahan Label Menu
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

          {/* --- 11. REGISTRANTS REVIEW MENU --- */}
          {activeTab === "registrants" && (() => {
            const getWhatsAppCleanUrl = (phone: string, name: string) => {
              let clean = phone.replace(/\D/g, "");
              if (clean.startsWith("0")) {
                clean = "62" + clean.slice(1);
              } else if (clean.startsWith("8")) {
                clean = "62" + clean;
              }
              const message = encodeURIComponent(`Assalamu'alaikum Wr. Wb., Sahabat ${name}! Saya dari PC GP Ansor Kabupaten Bogor berkait pendaftaran Anda.`);
              return `https://wa.me/${clean}?text=${message}`;
            };

            const filteredRegistrants = registrantsData.filter((r) => {
              const matchesSearch = r.name.toLowerCase().includes(registrantSearch.toLowerCase()) || 
                                    r.nik.includes(registrantSearch) || 
                                    r.whatsapp.includes(registrantSearch);
              const matchesDistrict = !registrantFilterDistrict || r.district === registrantFilterDistrict;
              const matchesStatus = registrantFilterStatus === "all" || r.status === registrantFilterStatus;
              return matchesSearch && matchesDistrict && matchesStatus;
            });

            const totalCandidates = registrantsData.length;
            const pendingCandidates = registrantsData.filter(r => r.status === 'pending').length;
            const approvedCandidates = registrantsData.filter(r => r.status === 'approved').length;
            const rejectedCandidates = registrantsData.filter(r => r.status === 'rejected').length;

            const BOGOR_DISTRICTS = [
              "Babakan Madang", "Bo Jong Gede", "Caringin", "Cariu", "Ciampea", "Ciawi", "Cibinong", "Cibungbulang", "Cigombong", "Cigudeg", "Cijeruk", "Cileungsi", "Ciomas", "Cisarua", "Ciseeng", "Citeureup", "Dramaga", "Gunung Putri", "Gunung Sindur", "Jasinga", "Jonggol", "Kemang", "Klapanunggal", "Leuwiliang", "Leuwisadeng", "Megamendung", "Nanggung", "Pamijahan", "Parung Panjang", "Parung", "Ranca Bungur", "Rumpin", "Sukajaya", "Sukamakmur", "Sukaraja", "Tajur Halang", "Tamansari", "Tenjo", "Tenjolaya"
            ];

            return (
              <div className="space-y-6">
                
                {/* Header Information */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-5">
                  <div className="space-y-1 text-left">
                    <h2 className="text-xl font-bold font-display text-white tracking-tight flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-ansor-gold" />
                      Kelola & Penerimaan Calon Anggota
                    </h2>
                    <p className="text-neutral-400 text-xs font-medium font-sans">
                      Catat, review, approved, atau tolak pendaftaran kader baru GP Ansor Kabupaten Bogor secara manual.
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownloadPDF(filteredRegistrants)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:scale-[1.01] cursor-pointer"
                    title="Ekspor daftar calon anggota yang tampil saat ini ke file PDF"
                  >
                    <Download className="w-4 h-4 text-emerald-205" />
                    Unduh Laporan PDF
                  </button>
                </div>

                {/* Dashboard KPI Mini Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#021408]/40 border border-white/10 rounded-2xl p-4 flex flex-col justify-between text-left shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400 text-[10px] uppercase font-mono tracking-wider font-extrabold font-sans">Total Pelamar</span>
                      <Users className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="mt-2.5">
                      <p className="text-2xl font-black text-white font-display">{totalCandidates}</p>
                      <p className="text-[10px] text-neutral-500 font-sans mt-0.5">Sudah terdaftar di sistem</p>
                    </div>
                  </div>

                  <div className="bg-[#021408]/40 border border-amber-500/20 rounded-2xl p-4 flex flex-col justify-between text-left shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-500/60" />
                    <div className="flex items-center justify-between">
                      <span className="text-amber-300 text-[10px] uppercase font-mono tracking-wider font-extrabold font-sans">Menunggu (Pending)</span>
                      <Shield className="w-4 h-4 text-amber-500 animate-pulse" />
                    </div>
                    <div className="mt-2.5">
                      <p className="text-2xl font-black text-amber-500 font-display">{pendingCandidates}</p>
                      <p className="text-[10px] text-neutral-500 font-sans mt-0.5 font-sans">Membutuhkan persetujuan</p>
                    </div>
                  </div>

                  <div className="bg-[#021408]/40 border border-emerald-500/20 rounded-2xl p-4 flex flex-col justify-between text-left shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1.5 h-full bg-emerald-500/60" />
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-300 text-[10px] uppercase font-mono tracking-wider font-extrabold font-sans">Telah Disetujui</span>
                      <UserCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="mt-2.5">
                      <p className="text-2xl font-black text-emerald-400 font-display">{approvedCandidates}</p>
                      <p className="text-[10px] text-neutral-500 font-sans mt-0.5 font-sans">CAD aktif diterbitkan</p>
                    </div>
                  </div>

                  <div className="bg-[#021408]/40 border border-red-500/20 rounded-2xl p-4 flex flex-col justify-between text-left shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1.5 h-full bg-red-500/60" />
                    <div className="flex items-center justify-between">
                      <span className="text-red-300 text-[10px] uppercase font-mono tracking-wider font-extrabold font-sans">Ditolak / Arsip</span>
                      <X className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="mt-2.5">
                      <p className="text-2xl font-black text-red-400 font-display">{rejectedCandidates}</p>
                      <p className="text-[10px] text-neutral-500 font-sans mt-0.5 font-sans">Tidak disetujui / Diarsipkan</p>
                    </div>
                  </div>
                </div>

                {/* Warning Banner Information */}
                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 text-left flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-ansor-gold shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-emerald-400 font-display">Informasi Alur Pendaftaran & KTA</p>
                    <p className="text-[11px] text-neutral-300/90 leading-relaxed font-sans">
                      Aplikasi tidak langsung menyetujui CAD secara otomatis secara default. Admin membutuhkan waktu mengonfirmasi keaslian identitas. <span className="text-ansor-gold font-bold">Setelah disetujui, harap arahkan calon anggota untuk mengunduh aplikasi resmi KTA Ansor</span> di Google Play Store lewat tombol WhatsApp di bawah ini guna memproses Kartu Tanda Anggota utama mereka secara nasional.
                    </p>
                  </div>
                </div>

                {/* SUB-TAB NAVIGATOR */}
                <div className="flex border-b border-white/5 gap-1.5 mt-2 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setRegistrantSubTab("all")}
                    className={`px-5 py-3 text-xs uppercase tracking-wider font-bold transition-all border-b-2 font-mono flex items-center gap-2 cursor-pointer shrink-0 ${
                      registrantSubTab === "all"
                        ? "border-ansor-gold text-white bg-white/5 rounded-t-xl"
                        : "border-transparent text-neutral-400 hover:text-white hover:bg-white/5 rounded-t-xl"
                    }`}
                  >
                    <Users className="w-4 h-4 text-emerald-400" />
                    Database Umum Calon Anggota
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegistrantSubTab("kaderisasi")}
                    className={`px-5 py-3 text-xs uppercase tracking-wider font-bold transition-all border-b-2 font-mono flex items-center gap-2 cursor-pointer shrink-0 ${
                      registrantSubTab === "kaderisasi"
                        ? "border-ansor-gold text-white bg-white/5 rounded-t-xl"
                        : "border-transparent text-neutral-400 hover:text-white hover:bg-white/5 rounded-t-xl"
                    }`}
                  >
                    <Award className="w-4 h-4 text-amber-500" />
                    Rekap Pendaftaran Kaderisasi Resmi
                  </button>
                </div>

                {registrantSubTab === "all" ? (
                  <>
                    {/* Filter and Search Bar controls */}
                    <div className="bg-[#021408]/30 border border-white/5 rounded-2xl p-4 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:gap-4">
                      <div className="flex-1 text-left">
                        <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block mb-1 font-bold font-sans">Cari Berdasarkan Nama, NIK, atau WhatsApp</label>
                        <input
                          type="text"
                          value={registrantSearch}
                          onChange={(e) => setRegistrantSearch(e.target.value)}
                          placeholder="Ketik nama atau nomor identitas..."
                          className="w-full bg-[#020d04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none transition-all font-medium font-sans"
                        />
                      </div>

                      <div className="w-full lg:w-56 text-left">
                        <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block mb-1 font-bold font-sans">Filter Kecamatan</label>
                        <select
                          value={registrantFilterDistrict}
                          onChange={(e) => setRegistrantFilterDistrict(e.target.value)}
                          className="w-full bg-[#020d04] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none transition-all font-semibold font-sans cursor-pointer"
                        >
                          <option value="">Semua Kecamatan</option>
                          {BOGOR_DISTRICTS.map((dist) => (
                            <option key={dist} value={dist}>{dist}</option>
                          ))}
                        </select>
                      </div>

                      <div className="w-full lg:w-48 text-left">
                        <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block mb-1 font-bold font-sans">Status Persetujuan</label>
                        <select
                          value={registrantFilterStatus}
                          onChange={(e) => setRegistrantFilterStatus(e.target.value as any)}
                          className="w-full bg-[#020d04] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none transition-all font-semibold font-sans cursor-pointer"
                        >
                          <option value="all">Semua Status</option>
                          <option value="pending">Menunggu (Pending)</option>
                          <option value="approved">Disetujui (Approved)</option>
                          <option value="rejected">Ditolak (Rejected)</option>
                        </select>
                      </div>
                    </div>

                    {/* Table and Candidate List */}
                    <div className="bg-[#021408]/40 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                          <thead>
                            <tr className="border-b border-white/5 bg-[#021307] text-neutral-400 text-[10px] tracking-wider uppercase font-mono font-bold">
                              <th className="px-5 py-4 w-[160px]">Tanggal Daftar</th>
                              <th className="px-5 py-4">Data Calon Anggota</th>
                              <th className="px-5 py-4">Kecamatan Domisili</th>
                              <th className="px-5 py-4">Alasan Bergabung</th>
                              <th className="px-5 py-4 text-center w-[150px]">Status</th>
                              <th className="px-5 py-4 text-right w-[180px]">Kelola Persetujuan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-sans">
                            {filteredRegistrants.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-5 py-12 text-center text-xs text-neutral-500 font-medium font-sans">
                                  Tidak ada calon anggota yang cocok dengan filter pencarian Anda.
                                </td>
                              </tr>
                            ) : (
                              filteredRegistrants.map((registrant) => (
                                <tr key={registrant.id} className="hover:bg-white/5 transition-colors text-white text-xs align-top">
                                  <td className="px-5 py-4 font-mono text-[11px] text-neutral-400 font-bold leading-relaxed">
                                    {new Date(registrant.createdAt).toLocaleDateString("id-ID", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    })}
                                  </td>
                                  <td className="px-5 py-4 space-y-1.5 text-left">
                                    <div className="space-y-0.5">
                                      <p className="font-extrabold text-white text-xs sm:text-sm capitalize font-display tracking-tight flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-emerald-400" />
                                        {registrant.name}
                                      </p>
                                      <p className="text-[10px] text-neutral-404 font-mono tracking-wider uppercase">NIK: {registrant.nik}</p>
                                    </div>
                                    <div className="space-y-1 text-neutral-300 text-[11px]">
                                      <p className="flex items-center gap-1 font-medium font-sans">Email: {registrant.email}</p>
                                      <a
                                        href={getWhatsAppCleanUrl(registrant.whatsapp, registrant.name)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[9px] px-2.5 py-0.5 rounded-full transition-all tracking-wider font-mono shadow-xs hover:scale-[1.02]"
                                      >
                                        <Phone className="w-2.5 h-2.5 fill-current" />
                                        WA: {registrant.whatsapp}
                                      </a>
                                    </div>

                                    {registrant.registrationType === "kaderisasi" && (
                                      <div className="mt-2 pt-2 border-t border-white/5 space-y-1.5 text-[11px] text-neutral-300">
                                        <div className="flex flex-wrap gap-1">
                                          <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[9px] font-bold rounded-full px-2 py-0.5 tracking-wider uppercase font-mono">
                                            Calon Kader GP Ansor
                                          </span>
                                          {registrant.ukuranKaos && (
                                            <span className="bg-[#10b981]/10 text-[#34d399] border border-emerald-500/20 text-[9px] font-bold rounded-full px-2 py-0.5 tracking-wider uppercase font-mono">
                                              Kaos: {registrant.ukuranKaos}
                                            </span>
                                          )}
                                          {registrant.pendidikanAkhir && (
                                            <span className="bg-white/5 text-neutral-300 border border-white/10 text-[9px] font-bold rounded-full px-2 py-0.5 tracking-wider uppercase font-mono">
                                              Pndk: {registrant.pendidikanAkhir}
                                            </span>
                                          )}
                                        </div>
                                        <div className="space-y-0.5 text-[10px] text-neutral-404 font-sans">
                                          <p>
                                            TTL: <span className="text-neutral-200 font-semibold">{registrant.tempatLahir}, {registrant.tanggalLahir}</span>
                                          </p>
                                          <p>
                                            Alamat: <span className="text-neutral-200 font-semibold">Desa {registrant.desa}, {registrant.kabupaten}</span>
                                          </p>
                                          {registrant.pekerjaan && (
                                            <p>
                                              Pekerjaan: <span className="text-neutral-200 font-semibold">{registrant.pekerjaan}</span>
                                            </p>
                                          )}
                                          {registrant.pendidikanPesantren && (
                                            <p>
                                              Pesantren: <span className="text-neutral-350 italic">"{registrant.pendidikanPesantren}"</span>
                                            </p>
                                          )}
                                        </div>
                                        
                                        {/* PAMFLET KEGIATAN PREVIEW */}
                                        {registrant.pamfletFile ? (
                                          <div className="mt-2 p-1.5 bg-[#010903] border border-white/10 rounded-lg max-w-[200px]">
                                            <p className="text-[9px] font-bold text-amber-400 tracking-wider uppercase font-mono mb-1">
                                              Pamflet Kegiatan:
                                            </p>
                                            <div className="flex gap-2 items-center">
                                              <a 
                                                href={registrant.pamfletFile} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="relative block w-10 h-10 rounded-md overflow-hidden bg-white hover:opacity-90 shrink-0 border border-white/10"
                                                title="Click to view full image in a new tab"
                                              >
                                                <img
                                                  src={registrant.pamfletFile}
                                                  alt="Pamflet Kegiatan"
                                                  referrerPolicy="no-referrer"
                                                  className="w-full h-full object-cover"
                                                />
                                              </a>
                                              <div className="flex flex-col text-left">
                                                <span className="text-[9px] text-[#34d399] font-bold font-mono">pamflet.png</span>
                                                <a
                                                  href={registrant.pamfletFile}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-[8px] text-[#34d399] hover:underline font-bold font-mono transition-all block mt-0.5"
                                                >
                                                  Buka Penuh ↗
                                                </a>
                                              </div>
                                            </div>
                                          </div>
                                        ) : (
                                          <p className="text-[9px] text-neutral-500 italic mt-1 font-sans">
                                            (Belum ada pamflet kegiatan diupload)
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-5 py-4">
                                    <span className="inline-flex items-center gap-1 bg-[#10b981]/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2.5 py-1 font-bold text-[10px] uppercase font-mono">
                                      <MapPin className="w-3 h-3 text-ansor-gold" />
                                      Kec. {registrant.district}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4 max-w-xs text-neutral-350 leading-relaxed text-[11px] font-sans">
                                    {registrant.reason || (
                                      <span className="text-neutral-500 italic">Tidak menulis alasan khusus.</span>
                                    )}
                                  </td>
                                  <td className="px-5 py-4 text-center">
                                    {registrant.status === "pending" && (
                                      <span className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-400 border border-amber-500/40 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider font-mono animate-pulse">
                                        <Activity className="w-3 h-3 animate-pulse" />
                                        PENDING
                                      </span>
                                    )}
                                    {registrant.status === "approved" && (
                                      <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider font-mono">
                                        <UserCheck className="w-3 h-3" />
                                        APPROVED
                                      </span>
                                    )}
                                    {registrant.status === "rejected" && (
                                      <span className="inline-flex items-center gap-1.5 bg-[#ef4444]/20 text-[#fca5a5] border border-[#f87171]/40 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider font-mono">
                                        <X className="w-3 h-3" />
                                        REJECTED
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-5 py-4 text-right">
                                    <div className="flex flex-col gap-1.5 items-end">
                                      <div className="flex gap-1.5">
                                        {registrant.status !== "approved" && (
                                          <button
                                            onClick={() => handleApproveRegistrant(registrant.id)}
                                            className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold p-1.5 rounded-lg border border-emerald-600 cursor-pointer shadow-sm transition-all"
                                            title="Setujui Pelamar"
                                          >
                                            <Check className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                        {registrant.status !== "rejected" && (
                                          <button
                                            onClick={() => handleRejectRegistrant(registrant.id)}
                                            className="bg-amber-600/35 hover:bg-amber-600 font-bold p-1.5 rounded-lg border border-amber-500 text-amber-200 hover:text-white cursor-pointer shadow-sm transition-all"
                                            title="Tolak Pelamar"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                        <button
                                          onClick={() => handleDeleteRegistrant(registrant.id, registrant.name)}
                                          className="bg-red-500/20 hover:bg-red-600 text-red-300 hover:text-white p-1.5 rounded-lg border border-red-500/30 hover:border-red-600 cursor-pointer shadow-sm transition-all"
                                          title="Hapus / Blokir"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                      <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest font-black font-sans">
                                        ID: {registrant.id}
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* SUB-TAB REKAP KADERISASI */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                      
                      {/* Left: Upload Official Pamphlet PC GP Ansor */}
                      <div className="lg:col-span-7 bg-[#021408]/40 border border-white/10 rounded-2xl p-5 flex flex-col justify-between text-left space-y-4">
                        <div className="space-y-1.5">
                          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 font-display">
                            <Upload className="w-4 h-4 text-ansor-gold" />
                            Unggah Pamflet Kegiatan Kaderisasi PC GP Ansor
                          </h3>
                          <p className="text-neutral-400 text-[11px] font-sans">
                            Unggah pamflet/flyer kegiatan kaderisasi resmi saat ini. Flyer yang diunggah akan langsung ditampilkan kepada calon peserta saat mereka membuka formulir pendaftaran di halaman utama website.
                          </p>
                        </div>

                        {!draftPamphlet ? (
                          <div className="border border-dashed border-white/10 hover:border-ansor-gold rounded-xl p-6 transition-all bg-[#010903] flex flex-col items-center justify-center text-center cursor-pointer relative group">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleOfficialPamphletChange}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            <Upload className="w-6 h-6 text-neutral-400 group-hover:text-ansor-gold group-hover:scale-110 transition-all mb-2" />
                            <p className="text-xs font-bold text-neutral-200">Klik / Tarik Pamflet Kegiatan ke Sini</p>
                            <p className="text-[10px] text-neutral-500 mt-1">Format gambar: Portrait (PNG, JPG, Maksimal 2MB)</p>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-[#010903] border border-white/10 rounded-xl">
                            <div className="relative w-20 h-24 rounded-lg overflow-hidden border border-white/10 bg-white shrink-0 sm:mx-0 mx-auto">
                              <img
                                src={draftPamphlet}
                                alt="Official Pamphlet"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 text-left space-y-2.5 w-full">
                              <div>
                                {draftPamphlet !== officialPamphlet ? (
                                  <>
                                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">⚠️ Draf Belum Disimpan</p>
                                    <p className="text-[11px] text-neutral-300 font-sans">Silakan klik tombol "Simpan Pamflet" agar aktif di formulir pendaftaran.</p>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">● Pamflet Aktif</p>
                                    <p className="text-[11px] text-neutral-300 font-sans">Aktif terintegrasi di form pendaftar kaderisasi & pop-up utama.</p>
                                  </>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2 pt-1 font-sans">
                                {draftPamphlet !== officialPamphlet && (
                                  <button
                                    type="button"
                                    onClick={handleSaveOfficialPamphlet}
                                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] px-3.5 py-2 rounded-lg transition-all font-bold cursor-pointer shadow-md"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                    Simpan Pamflet
                                  </button>
                                )}
                                <a
                                  href={draftPamphlet}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 bg-white/5 hover:bg-white/10 text-white text-[10px] px-2.5 py-2 rounded-lg border border-white/10 transition-all font-bold"
                                >
                                  Lihat Penuh ↗
                                </a>
                                <button
                                  type="button"
                                  onClick={handleRemoveOfficialPamphlet}
                                  className="inline-flex items-center gap-1 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-[10px] px-2.5 py-2 rounded-lg transition-all font-bold cursor-pointer"
                                >
                                  <Trash2 className="w-3 shrink-0" />
                                  Hapus Pamflet
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Export and statistics of education */}
                      <div className="lg:col-span-5 bg-[#021408]/40 border border-white/10 rounded-2xl p-5 flex flex-col justify-between text-left">
                        <div className="space-y-2">
                          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 font-display">
                            <FileText className="w-4 h-4 text-emerald-450" />
                            Rekapitulasi Berkas Pelamar
                          </h3>
                          <p className="text-neutral-450 text-[11px] leading-relaxed font-sans">
                            Gunakan tombol di bawah ini untuk mengunduh rekapitulasi data pendaftar kaderisasi resmi. Hasil unduhan berupa spreadsheet yang menampilkan seluruh kolom lengkap yang diisi oleh calon kader (NIK, Kaos, Pendidikan, Pesantren, Pekerjaan, Alamat, Golongan Darah, Status Nikah, dll).
                          </p>
                        </div>

                        <div className="space-y-2 pt-4">
                          <button
                            type="button"
                            onClick={() => downloadKaderisasiCSV(registrantsData)}
                            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#10b981] hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-98 cursor-pointer"
                            title="Unduh seluruh kolom data yang diisi peserta dalam format spreadsheet CSV/Excel"
                          >
                            <Download className="w-4 h-4 text-slate-950" />
                            Unduh Rekap Lengkap (Excel / CSV)
                          </button>
                          
                          <div className="text-center">
                            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono font-bold">
                              Ekspor Data Multi-Kolom Aktif
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Table of Kaderisasi */}
                    <div className="bg-[#021408]/40 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                      <div className="p-4 border-b border-white/5 bg-[#010c04] flex items-center justify-between flex-wrap gap-2">
                        <h4 className="text-xs font-bold text-emerald-400 font-mono tracking-widest uppercase flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-ansor-gold" />
                          List Rekap Data Pendaftaran Kaderisasi GP Ansor
                        </h4>
                        <span className="bg-[#10b981]/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] rounded-full font-bold font-mono">
                          {registrantsData.filter(r => r.registrationType === "kaderisasi").length} Calon Anggota
                        </span>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                          <thead>
                            <tr className="border-b border-white/5 bg-[#021307] text-neutral-400 text-[10px] tracking-wider uppercase font-mono font-bold">
                              <th className="px-5 py-3 w-[60px] text-center">No</th>
                              <th className="px-5 py-3">Nama Lengkap</th>
                              <th className="px-5 py-3 w-[150px]">Kecamatan</th>
                              <th className="px-5 py-3 w-[150px]">Kab / Kota</th>
                              <th className="px-5 py-3 w-[130px]">Tanggal Lahir</th>
                              <th className="px-5 py-3 w-[90px]">Usia</th>
                              <th className="px-5 py-3 w-[140px]">No HP / WA</th>
                              <th className="px-5 py-3 w-[90px] text-center">Pamflet</th>
                              <th className="px-5 py-3 w-[100px] text-center">Status</th>
                              <th className="px-5 py-3 w-[110px] text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-sans">
                            {(() => {
                              const kaderisasiOnly = registrantsData.filter(r => r.registrationType === "kaderisasi");

                              if (kaderisasiOnly.length === 0) {
                                return (
                                  <tr>
                                    <td colSpan={10} className="px-5 py-12 text-center text-xs text-neutral-500 font-medium font-sans">
                                      Belum ada calon peserta pendaftaran kaderisasi dalam sistem.
                                    </td>
                                  </tr>
                                );
                              }

                              return kaderisasiOnly.map((registrant, index) => {
                                // Age automatically calculated: Year 2026 (local clock) minus birth year
                                let age = "-";
                                if (registrant.tanggalLahir) {
                                  const birthYear = parseInt(registrant.tanggalLahir.split("-")[0]);
                                  if (!isNaN(birthYear)) {
                                    age = `${2026 - birthYear} Tahun`;
                                  }
                                }

                                return (
                                  <tr key={registrant.id} className="hover:bg-white/5 transition-colors text-white text-xs align-middle">
                                    <td className="px-5 py-4 text-center font-mono text-[10px] text-neutral-400 font-bold">
                                      {index + 1}
                                    </td>
                                    <td className="px-5 py-4 text-left">
                                      <p className="font-extrabold text-white text-xs sm:text-sm capitalize font-display flex items-center gap-1">
                                        <User className="w-3.5 h-3.5 text-[#34d399]" />
                                        {registrant.name}
                                      </p>
                                      <p className="text-[9px] text-[#34d399] font-mono tracking-wider font-semibold capitalize mt-1">
                                        Desa: {registrant.desa || "-"}
                                      </p>
                                    </td>
                                    <td className="px-5 py-4">
                                      <span className="font-semibold text-neutral-200">
                                        Kec. {registrant.district}
                                      </span>
                                    </td>
                                    <td className="px-5 py-4 text-neutral-300 font-medium whitespace-nowrap">
                                      {registrant.kabupaten || "Kabupaten Bogor"}
                                    </td>
                                    <td className="px-5 py-4 font-mono text-[11px] text-neutral-300">
                                      {registrant.tanggalLahir ? (
                                        new Date(registrant.tanggalLahir).toLocaleDateString("id-ID", {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric"
                                        })
                                      ) : "-"}
                                    </td>
                                    <td className="px-5 py-4 font-bold text-amber-400 font-mono text-[11px]">
                                      {age}
                                    </td>
                                    <td className="px-5 py-4 text-left">
                                      <a
                                        href={getWhatsAppCleanUrl(registrant.whatsapp, registrant.name)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[9px] px-3 py-1 rounded-full transition-all tracking-wider font-mono shadow-sm"
                                        title="Chat WhatsApp calon kader"
                                      >
                                        <Phone className="w-2.5 h-2.5 fill-current" />
                                        {registrant.whatsapp}
                                      </a>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                      {registrant.pamfletFile ? (
                                        <div className="flex justify-center">
                                          <a 
                                            href={registrant.pamfletFile} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="relative block w-8 h-8 rounded border border-white/10 hover:border-ansor-gold overflow-hidden"
                                            title="Click to view brochure"
                                          >
                                            <img src={registrant.pamfletFile} alt="pamflet" className="w-full h-full object-cover" />
                                          </a>
                                        </div>
                                      ) : (
                                        <span className="text-neutral-500 text-[10px] italic">Tidak ada</span>
                                      )}
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                      {registrant.status === "pending" && (
                                        <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-400 border border-amber-500/35 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase font-mono">
                                          PENDING
                                        </span>
                                      )}
                                      {registrant.status === "approved" && (
                                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-450 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase font-mono">
                                          DISETUJUI
                                        </span>
                                      )}
                                      {registrant.status === "rejected" && (
                                        <span className="inline-flex items-center gap-1 bg-red-500/15 text-red-350 border border-red-500/30 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase font-mono">
                                          DITOLAK
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                      <div className="flex items-center justify-end gap-1">
                                        {registrant.status !== "approved" && (
                                          <button
                                            onClick={() => handleApproveRegistrant(registrant.id)}
                                            className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold p-1 rounded-md border border-emerald-600 cursor-pointer shadow-sm transition-all"
                                            title="Setujui Pelamar"
                                          >
                                            <Check className="w-3 h-3" />
                                          </button>
                                        )}
                                        {registrant.status !== "rejected" && (
                                          <button
                                            onClick={() => handleRejectRegistrant(registrant.id)}
                                            className="bg-amber-600/35 hover:bg-amber-600 font-bold p-1 rounded-md border border-amber-550 text-amber-100 hover:text-white cursor-pointer shadow-sm transition-all"
                                            title="Tolak Pelamar"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        )}
                                        <button
                                          onClick={() => handleDeleteRegistrant(registrant.id, registrant.name)}
                                          className="bg-red-500/20 hover:bg-red-600 text-red-300 hover:text-white p-1 rounded-md border border-red-500/30 cursor-pointer shadow-sm transition-all"
                                          title="Hapus"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}

              </div>
            );
          })()}

        </main>
      </div>

    </div>
  );
}
