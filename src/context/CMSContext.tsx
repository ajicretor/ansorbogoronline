import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  ProgramItem, NewsArticle, TeamMember, GalleryItem, FAQItem,
  AboutConfig, StrategicPillar, ImpactStat, ContactConfig, MenuStatus,
  DigitalServicesState, DigitalServiceConfig, CMSUser, MenuLabels, KaderisasiRow, AdsConfig,
  Registrant
} from "../types";
import { PROGRAMS, NEWS, LEADERS, GALLERY, FAQS } from "../data";
import { getSupabaseCMSData, setSupabaseCMSData } from "../lib/supabase";

export interface HeroConfig {
  titleLine1: string;
  titleLine2: string;
  titleAnsorGold: string;
  subtitle: string;
  videoUrl: string;
  ytChannel: string;
  igPage: string;
  customLogoUrl?: string;
}

interface CMSContextType {
  heroConfig: HeroConfig;
  setHeroConfig: (config: HeroConfig) => void;
  aboutConfig: AboutConfig;
  setAboutConfig: (config: AboutConfig) => void;
  strategicPillars: StrategicPillar[];
  setStrategicPillars: (pillars: StrategicPillar[]) => void;
  impactStats: ImpactStat[];
  setImpactStats: (stats: ImpactStat[]) => void;
  contactConfig: ContactConfig;
  setContactConfig: (config: ContactConfig) => void;
  faqs: FAQItem[];
  setFaqs: (faqs: FAQItem[]) => void;
  programs: ProgramItem[];
  setPrograms: (programs: ProgramItem[]) => void;
  news: NewsArticle[];
  setNews: (news: NewsArticle[]) => void;
  leaders: TeamMember[];
  setLeaders: (leaders: TeamMember[]) => void;
  gallery: GalleryItem[];
  setGallery: (gallery: GalleryItem[]) => void;
  
  // Menu configuration enabled/disabled states
  menuStatus: MenuStatus;
  setMenuStatus: (status: MenuStatus) => void;

  // Digital services (Kaderisasi and E-Persuratan)
  digitalServices: DigitalServicesState;
  setDigitalServices: (services: DigitalServicesState) => void;

  // Customizable menu/tab labels
  menuLabels: MenuLabels;
  setMenuLabels: (labels: MenuLabels) => void;

  // Portal users state
  users: CMSUser[];
  setUsers: (users: CMSUser[]) => void;

  // Recruitment/Training data state
  kaderisasiData: KaderisasiRow[];
  setKaderisasiData: (rows: KaderisasiRow[]) => void;

  // Registrants/Calon Anggota database
  registrantsData: Registrant[];
  setRegistrantsData: (rows: Registrant[]) => void;

  // Official Pamphlet state for Kaderisasi Form
  officialPamphlet: string;
  setOfficialPamphlet: (pamphlet: string) => void;

  // Advertisement Banner Configuration
  adsConfig: AdsConfig;
  setAdsConfig: (config: AdsConfig) => void;
  
  // High-level Actions
  resetToDefault: () => void;
  publishAllToSupabase: () => Promise<{ success: boolean; message: string }>;
  isCmsOpen: boolean;
  setIsCmsOpen: (open: boolean) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}


const defaultHeroConfig: HeroConfig = {
  titleLine1: "BERTAUHID, BERSATU,",
  titleLine2: "BERMASHLAHAT UNTUK",
  titleAnsorGold: "KABUPATEN BOGOR",
  subtitle: "Sinergi Pemuda Ansor Menjaga Tradisi Keislaman Aswaja dan Mengawal NKRI di Bumi Tegar Beriman.",
  videoUrl: "https://www.youtube.com/embed/dsNIOwcqaM8?autoplay=1&rel=0",
  ytChannel: "https://www.youtube.com/channel/UCcxstrHuxuIqUJbQuxUTb8g",
  igPage: "https://www.instagram.com/ansorbogoronline/",
  customLogoUrl: "",
};

const defaultAboutConfig: AboutConfig = {
  historyTitleLine: "GP Ansor",
  historyTitleAnsor: "Kabupaten Bogor",
  description: "Gerakan Pemuda Ansor adalah pilar kepemudaan di bawah naungan Nahdlatul Ulama. GP Ansor Kabupaten Bogor berkomitmen penuh menjadi wadah pemersatu, inkubator kemandirian, dan akselerator karier profesional pemuda muslim dalam menjaga keutuhan berekosistem sosial dan kebangsaan NKRI.",
  historyParagraph1: "Dilahirkan di tengah pergolakan revolusi kemerdekaan pada 24 April 1934 di Banyuwangi, Gerakan Pemuda Ansor telah melalui pasang surut sejarah mengawal kedaulatan Indonesia. Kami tumbuh bersama tekad perjuangan para Kiai dan Ulama Nahdlatul Ulama dalam menjaga kemaslahatan umat dari segala ancaman ideologi ekstremisme maupun perpecahan sosial.",
  historyParagraph2: "Di Kabupaten Bogor, dengan bentang wilayah geografi 40 kecamatan yang sangat luas, PC GP Ansor hadir sebagai simpul perekat kebhinekaan. Kami merajut potensi ribuan pemuda tani, santri pedesaan, hingga darmabakti akademisi perkotaan menuju satu wadah perjuangan kolektif yang berdaulat, mandiri secara ekonomi, serta unggul secara peradaban berlandaskan Ahlussunnah wal Jama'ah.",
  keyGoals: [
    "Berpegang teguh pada naskah perjuangan Ahlussunnah wal Jama'ah An-Nahdliyah",
    "Berkomitmen penuh pada keutuhan Negara Kesatuan Republik Indonesia",
    "Mengembangkan jejaring kepemudaan adaptif era kecerdasan buatan",
    "Bersinergi lintas institusi demi kemaslahatan Kabupaten Bogor"
  ]
};

const defaultStrategicPillars: StrategicPillar[] = [
  {
    iconName: "Laptop",
    title: "Digital Dakwah Hub",
    desc: "Transformasi syi'ar digital interaktif, podcast, dan naskah moderasi beragama berbasis media modern guna meraih milenial & gen-z."
  },
  {
    iconName: "Lightbulb",
    title: "Inkubator Ekonomi Kreatif",
    desc: "Mengembangkan wirausaha muda, startup digital, kemandirian UMKM santri, dan koperasi pemuda berdaya di 40 Kecamatan Bogor."
  },
  {
    iconName: "GraduationCap",
    title: "Professional Academy",
    desc: "Menyiapkan kompetensi kepemimpinan abad-21, administrasi modern, literasi kebijakan publik, serta kesiapan karier global."
  },
  {
    iconName: "Heart",
    title: "Garda Humanity & BAGANA",
    desc: "Kesiapsiagaan reaksi cepat kebencanaan alam, aksi sosial keliling, pengamanan terpadu, dan pertolongan pertama taktis."
  }
];

const defaultImpactStats: ImpactStat[] = [
  {
    id: "stat-1",
    value: "40",
    label: "Kecamatan Aktif",
    description: "Menghubungkan simpul pemuda di seluruh Kab. Bogor"
  },
  {
    id: "stat-2",
    value: "5.500+",
    label: "Kader Militan",
    description: "Angkatan muda profesional, berkarakter & handal"
  },
  {
    id: "stat-3",
    value: "24/7",
    label: "Pengabdian Umat",
    description: "Kesiapsiagaan aksi kemানুsaan & tanggap bencana"
  },
  {
    id: "stat-4",
    value: "5",
    label: "Lembaga Otonom",
    description: "Fokus taktis di bidang silat, barisan ansor serbaguna & MDS"
  }
];

const defaultContactConfig: ContactConfig = {
  address: "Jl. Tegar Beriman, Cibinong, Kabupaten Bogor, Jawa Barat",
  phone: "+62 812-3456-7890",
  email: "info@ansorkabogor.or.id",
  website: "www.ansorkabogor.or.id",
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
  youtube: "https://youtube.com",
  tiktok: "https://tiktok.com"
};

const defaultAdsConfig: AdsConfig = {
  enabled: true,
  imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1080&auto=format&fit=crop",
  targetUrl: "https://instagram.com/ansorbogoronline/",
  altText: "Ayo Gabung Pengkaderan Sahabat Ansor Banser Bogor",
  scriptCode: ""
};

const defaultMenuStatus: MenuStatus = {
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
  epersuratan: true,
  registrants: true,
  services: true,
  users: true
};

const defaultDigitalServices: DigitalServicesState = {
  kaderisasi: {
    title: "Presensi Kaderisasi",
    description: "Sistem pendataan kehadiran, kelayakan materi, serta portofolio kaderisasi GP Ansor Kabupaten Bogor secara digital terpadu.",
    linkUrl: "https://presensi.ansorbogor.or.id",
    qrCodeUrl: ""
  },
  epersuratan: {
    title: "E-Persuratan PC GP Ansor",
    description: "Platform korespondensi digital penomoran surat resmi, pengarsipan rekomendasi, serta disposisi dewan pimpinan cabang.",
    linkUrl: "https://epersuratan.ansorbogor.or.id",
    qrCodeUrl: ""
  }
};

const defaultMenuLabels: MenuLabels = {
  beranda: "Beranda",
  kaderisasi: "Kaderisasi",
  epersuratan: "E-Persuratan",
  about: "Tentang Kami",
  programs: "Program",
  news: "Berita",
  gallery: "Galeri"
};

const defaultUsers: CMSUser[] = [];

const defaultKaderisasiRows: KaderisasiRow[] = [
  // PKD Category
  {
    id: "pkd-1",
    type: "pkd",
    group: "Cileungsi",
    angkatan: "I",
    pesertaLulus: 67,
    lokasi: "PP Al istianah Desa Cileungsi",
    tanggal: "13-15 Desember 2019",
    noSertifikat: "128 / IX-22-06 (2019-2023) / PKD-I / XII / 2019",
    cetak: "yes",
    linkSertifikat: "https://drive.google.com/drive/folders/1ZbcVebdEBc0R6TPdN2V3otfrXWjBbCtw?usp=drive_link"
  },
  {
    id: "pkd-2",
    type: "pkd",
    group: "Pamijahan",
    angkatan: "II",
    pesertaLulus: 50,
    lokasi: "PP Uswatun hasanah Desa Pamijahan",
    tanggal: "28-30 Desember 2019",
    noSertifikat: "128 / IX-22-16 (2019-2023) / PKD-II / II / 2019",
    cetak: "no",
    linkSertifikat: "https://drive.google.com/drive/folders/1spV_a4KgYWMrHCrYx12sE7pulr7OMNw?usp=drive_link"
  },
  {
    id: "pkd-3",
    type: "pkd",
    group: "Cibungbulang",
    angkatan: "III",
    pesertaLulus: 50,
    lokasi: "PP Roudhotusibyan Desa Cibungbulang",
    tanggal: "10-12 Januari 2020",
    noSertifikat: "129 / IX-22-15 (2019-2023) / PKD-III / I / 2020",
    cetak: "no",
    linkSertifikat: ""
  },
  {
    id: "pkd-4",
    type: "pkd",
    group: "Virtual ( Cibinong )",
    angkatan: "IV",
    pesertaLulus: 72,
    lokasi: "Virtual Zoom Meeting",
    tanggal: "08-12 Juli 2020",
    noSertifikat: "129 / IX-22-40 (2019-2023) / PKD-IV / VI / 2020",
    cetak: "yes",
    linkSertifikat: "https://drive.google.com/drive/folders/1_GwSRGKMRYg-PGfq3a4cpWaTzORtYRPC?usp=drive_link"
  },
  {
    id: "pkd-5",
    type: "pkd",
    group: "Cisarua",
    angkatan: "V",
    pesertaLulus: 25,
    lokasi: "Villa syarimel jl cidokom desa citeko",
    tanggal: "25-27 September 2020",
    noSertifikat: "129 / IX-22-24 (2019-2023) / PKD-V / IX / 2020",
    cetak: "yes",
    linkSertifikat: "https://drive.google.com/drive/folders/179kfiDqBmWUkXQOp-Xyya7bvDEYeSNjm?usp=drive_link"
  },
  {
    id: "pkd-28",
    type: "pkd",
    group: "Bojonggede",
    angkatan: "XXVIII",
    pesertaLulus: 41,
    lokasi: "Ponpes Sulamul Mubtadiin Desa Susukan Kec Bojonggede",
    tanggal: "13-15 Februari 2026",
    noSertifikat: "05.041 / PC-IX-22/SK-01/PKD-XXVIII/II/2026",
    cetak: "yes",
    linkSertifikat: ""
  },
  // DIKLATSAR Category
  {
    id: "diklatsar-1",
    type: "diklatsar",
    group: "Megamendung",
    angkatan: "I",
    pesertaLulus: 80,
    lokasi: "Alam Boriska Resto Kp Sukamanah",
    tanggal: "05-07 Maret 2021",
    noSertifikat: "130/ IX-22-25 (2019-2023) / DIKLATSAR-I / III / 2021",
    cetak: "yes",
    linkSertifikat: ""
  },
  {
    id: "diklatsar-2",
    type: "diklatsar",
    group: "Leuwiliang",
    angkatan: "II",
    pesertaLulus: 80,
    lokasi: "PP. Al-Bahrain Kp. Sengkol Rt. 02/11 Desa Karehkel",
    tanggal: "12-14 Maret 2021",
    noSertifikat: "130/ IX-22-13 (2019-2023) / DIKLATSAR-II / III / 2021",
    cetak: "yes",
    linkSertifikat: ""
  },
  {
    id: "diklatsar-3",
    type: "diklatsar",
    group: "Tanjungsari",
    angkatan: "III",
    pesertaLulus: 80,
    lokasi: "Yayasan Pendidikan Al-Ittihad Kp. Dukut, Rt.01/01 Desa Sirnarasa",
    tanggal: "19-21 Maret 2021",
    noSertifikat: "130/ IX-22-35 (2019-2023) / DIKLATSAR-III / III / 2021",
    cetak: "yes",
    linkSertifikat: ""
  },
  {
    id: "diklatsar-4",
    type: "diklatsar",
    group: "Parung",
    angkatan: "IV",
    pesertaLulus: 80,
    lokasi: "PP. Padepokan Ngasah Roso Ayyatirohman",
    tanggal: "15-17 Oktober 2021",
    noSertifikat: "130/ IX-22-09 (2019-2023) / DIKLATSAR-IV / XI / 2021",
    cetak: "yes",
    linkSertifikat: ""
  },
  // SUSBALAN_PKL Category
  {
    id: "susbalan_pkl-1",
    type: "susbalan_pkl",
    group: "PKL",
    angkatan: "I",
    pesertaLulus: 51,
    lokasi: "Pusdiklat Karya Nyata Cinagara Caringin Bogor",
    tanggal: "10-13 Maret 2022",
    noSertifikat: "001/ IX-22 (2019-2023) / PKL-I / III / 2022",
    cetak: "yes",
    linkSertifikat: ""
  },
  {
    id: "susbalan_pkl-2",
    type: "susbalan_pkl",
    group: "Susbalan",
    angkatan: "I",
    pesertaLulus: 61,
    lokasi: "PP Al Hisainiyyah Pasir Muncang Caringin Bogor",
    tanggal: "10-13 Maret 2022",
    noSertifikat: "002/ IX-22 (2019-2023) / SISBALAN-I / III / 2022",
    cetak: "yes",
    linkSertifikat: ""
  }
];

const defaultRegistrants: Registrant[] = [
  {
    id: "ANSOR-108247",
    name: "Ahmad Jalaludin",
    nik: "3201011212890003",
    email: "ahmad.jalal@gmail.com",
    whatsapp: "081298765432",
    district: "Cibinong",
    reason: "Ingin berkontribusi aktif melestarikan kearifan lokal Aswaja dan berpartisipasi menjaga stabilitas daerah dalam barisan GP Ansor.",
    status: "pending",
    createdAt: "2026-06-02T05:14:00Z"
  },
  {
    id: "ANSOR-492723",
    name: "Muhammad Fikri",
    nik: "3201021503920005",
    email: "fikri.m@yahoo.com",
    whatsapp: "085698761234",
    district: "Megamendung",
    reason: "Menjalani panggilan hati membela Ulama dan keutuhan NKRI.",
    status: "pending",
    createdAt: "2026-06-02T07:22:00Z"
  }
];

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export function CMSProvider({ children }: { children: React.ReactNode }) {
  const [isCmsOpen, setIsCmsOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("ansor_theme") as "light" | "dark") || "light";
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("ansor_theme", next);
      return next;
    });
  };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const [heroConfig, setHeroConfigState] = useState<HeroConfig>(defaultHeroConfig);
  const [aboutConfig, setAboutConfigState] = useState<AboutConfig>(defaultAboutConfig);
  const [strategicPillars, setStrategicPillarsState] = useState<StrategicPillar[]>(defaultStrategicPillars);
  const [impactStats, setImpactStatsState] = useState<ImpactStat[]>(defaultImpactStats);
  const [contactConfig, setContactConfigState] = useState<ContactConfig>(defaultContactConfig);
  const [adsConfig, setAdsConfigState] = useState<AdsConfig>(defaultAdsConfig);
  const [menuStatus, setMenuStatusState] = useState<MenuStatus>(defaultMenuStatus);
  const [faqs, setFaqsState] = useState<FAQItem[]>(FAQS);
  const [programs, setProgramsState] = useState<ProgramItem[]>(PROGRAMS);
  const [news, setNewsState] = useState<NewsArticle[]>(NEWS);
  const [leaders, setLeadersState] = useState<TeamMember[]>(LEADERS);
  const [gallery, setGalleryState] = useState<GalleryItem[]>(GALLERY);
  const [digitalServices, setDigitalServicesState] = useState<DigitalServicesState>(defaultDigitalServices);
  
  // Custom Menu Labels State
  const [menuLabels, setMenuLabelsState] = useState<MenuLabels>(defaultMenuLabels);
  
  // CMS Users State
  const [users, setUsersState] = useState<CMSUser[]>(defaultUsers);

  // Kaderisasi Data State
  const [kaderisasiData, setKaderisasiDataState] = useState<KaderisasiRow[]>(defaultKaderisasiRows);

  // Registrants Data State
  const [registrantsData, setRegistrantsDataState] = useState<Registrant[]>(defaultRegistrants);

  // Official Pamphlet state
  const [officialPamphlet, setOfficialPamphletState] = useState<string>(() => {
    return localStorage.getItem("ansor_bogor_official_kaderisasi_pamphlet") || "";
  });

  // Load from local storage and sync with Supabase on mount
  useEffect(() => {
    // 1. First, load from localStorage instantly for zero-latency startup and backup fallback
    try {
      const storedHero = localStorage.getItem("ansor_bogor_hero");
      if (storedHero) setHeroConfigState(JSON.parse(storedHero));

      const storedAbout = localStorage.getItem("ansor_bogor_about");
      if (storedAbout) setAboutConfigState(JSON.parse(storedAbout));

      const storedPillars = localStorage.getItem("ansor_bogor_pillars");
      if (storedPillars) setStrategicPillarsState(JSON.parse(storedPillars));

      const storedStats = localStorage.getItem("ansor_bogor_stats");
      if (storedStats) setImpactStatsState(JSON.parse(storedStats));

      const storedContact = localStorage.getItem("ansor_bogor_contact");
      if (storedContact) setContactConfigState(JSON.parse(storedContact));

      const storedAds = localStorage.getItem("ansor_bogor_ads");
      if (storedAds) setAdsConfigState(JSON.parse(storedAds));

      const storedMenuStatus = localStorage.getItem("ansor_bogor_menu_status");
      if (storedMenuStatus) setMenuStatusState({ ...defaultMenuStatus, ...JSON.parse(storedMenuStatus) });

      const storedFaqs = localStorage.getItem("ansor_bogor_faqs");
      if (storedFaqs) setFaqsState(JSON.parse(storedFaqs));

      const storedPrograms = localStorage.getItem("ansor_bogor_programs");
      if (storedPrograms) setProgramsState(JSON.parse(storedPrograms));

      const storedNews = localStorage.getItem("ansor_bogor_news");
      if (storedNews) setNewsState(JSON.parse(storedNews));

      const storedLeaders = localStorage.getItem("ansor_bogor_leaders");
      if (storedLeaders) setLeadersState(JSON.parse(storedLeaders));

      const storedGallery = localStorage.getItem("ansor_bogor_gallery");
      if (storedGallery) setGalleryState(JSON.parse(storedGallery));

      const storedDigitalServices = localStorage.getItem("ansor_bogor_digital_services");
      if (storedDigitalServices) setDigitalServicesState(JSON.parse(storedDigitalServices));

      const storedMenuLabels = localStorage.getItem("ansor_bogor_menu_labels");
      if (storedMenuLabels) setMenuLabelsState(JSON.parse(storedMenuLabels));

      const storedUsers = localStorage.getItem("ansor_bogor_users");
      if (storedUsers) setUsersState(JSON.parse(storedUsers));

      const storedKaderisasi = localStorage.getItem("ansor_bogor_kaderisasi");
      if (storedKaderisasi) setKaderisasiDataState(JSON.parse(storedKaderisasi));

      const storedRegistrants = localStorage.getItem("ansor_bogor_registrants");
      if (storedRegistrants) setRegistrantsDataState(JSON.parse(storedRegistrants));

      const storedPamphlet = localStorage.getItem("ansor_bogor_official_kaderisasi_pamphlet");
      if (storedPamphlet) setOfficialPamphletState(storedPamphlet);
    } catch (e) {
      console.error("Local storage initialization failed:", e);
    }

    // 2. Load fresh data from Supabase asynchronously in background and cache it
    async function loadFromSupabase() {
      try {
        const dbData = await getSupabaseCMSData();
        if (!dbData) {
          console.log("Supabase table 'ansor_bogor_cms' is not queried (probably empty or table doesn't exist yet).");
          return;
        }

        console.log("Successfully fetched fresh database content from Supabase, syncing frontend...");

        if (dbData["ansor_bogor_hero"]) {
          setHeroConfigState(dbData["ansor_bogor_hero"]);
          localStorage.setItem("ansor_bogor_hero", JSON.stringify(dbData["ansor_bogor_hero"]));
        }
        if (dbData["ansor_bogor_about"]) {
          setAboutConfigState(dbData["ansor_bogor_about"]);
          localStorage.setItem("ansor_bogor_about", JSON.stringify(dbData["ansor_bogor_about"]));
        }
        if (dbData["ansor_bogor_pillars"]) {
          setStrategicPillarsState(dbData["ansor_bogor_pillars"]);
          localStorage.setItem("ansor_bogor_pillars", JSON.stringify(dbData["ansor_bogor_pillars"]));
        }
        if (dbData["ansor_bogor_stats"]) {
          setImpactStatsState(dbData["ansor_bogor_stats"]);
          localStorage.setItem("ansor_bogor_stats", JSON.stringify(dbData["ansor_bogor_stats"]));
        }
        if (dbData["ansor_bogor_contact"]) {
          setContactConfigState(dbData["ansor_bogor_contact"]);
          localStorage.setItem("ansor_bogor_contact", JSON.stringify(dbData["ansor_bogor_contact"]));
        }
        if (dbData["ansor_bogor_ads"]) {
          setAdsConfigState(dbData["ansor_bogor_ads"]);
          localStorage.setItem("ansor_bogor_ads", JSON.stringify(dbData["ansor_bogor_ads"]));
        }
        if (dbData["ansor_bogor_menu_status"]) {
          const merged = { ...defaultMenuStatus, ...dbData["ansor_bogor_menu_status"] };
          setMenuStatusState(merged);
          localStorage.setItem("ansor_bogor_menu_status", JSON.stringify(merged));
        }
        if (dbData["ansor_bogor_faqs"]) {
          setFaqsState(dbData["ansor_bogor_faqs"]);
          localStorage.setItem("ansor_bogor_faqs", JSON.stringify(dbData["ansor_bogor_faqs"]));
        }
        if (dbData["ansor_bogor_programs"]) {
          setProgramsState(dbData["ansor_bogor_programs"]);
          localStorage.setItem("ansor_bogor_programs", JSON.stringify(dbData["ansor_bogor_programs"]));
        }
        if (dbData["ansor_bogor_news"]) {
          setNewsState(dbData["ansor_bogor_news"]);
          localStorage.setItem("ansor_bogor_news", JSON.stringify(dbData["ansor_bogor_news"]));
        }
        if (dbData["ansor_bogor_leaders"]) {
          setLeadersState(dbData["ansor_bogor_leaders"]);
          localStorage.setItem("ansor_bogor_leaders", JSON.stringify(dbData["ansor_bogor_leaders"]));
        }
        if (dbData["ansor_bogor_gallery"]) {
          setGalleryState(dbData["ansor_bogor_gallery"]);
          localStorage.setItem("ansor_bogor_gallery", JSON.stringify(dbData["ansor_bogor_gallery"]));
        }
        if (dbData["ansor_bogor_digital_services"]) {
          setDigitalServicesState(dbData["ansor_bogor_digital_services"]);
          localStorage.setItem("ansor_bogor_digital_services", JSON.stringify(dbData["ansor_bogor_digital_services"]));
        }
        if (dbData["ansor_bogor_menu_labels"]) {
          setMenuLabelsState(dbData["ansor_bogor_menu_labels"]);
          localStorage.setItem("ansor_bogor_menu_labels", JSON.stringify(dbData["ansor_bogor_menu_labels"]));
        }
        if (dbData["ansor_bogor_users"]) {
          setUsersState(dbData["ansor_bogor_users"]);
          localStorage.setItem("ansor_bogor_users", JSON.stringify(dbData["ansor_bogor_users"]));
        }
        if (dbData["ansor_bogor_kaderisasi"]) {
          setKaderisasiDataState(dbData["ansor_bogor_kaderisasi"]);
          localStorage.setItem("ansor_bogor_kaderisasi", JSON.stringify(dbData["ansor_bogor_kaderisasi"]));
        }
        if (dbData["ansor_bogor_registrants"]) {
          setRegistrantsDataState(dbData["ansor_bogor_registrants"]);
          localStorage.setItem("ansor_bogor_registrants", JSON.stringify(dbData["ansor_bogor_registrants"]));
        }
        if (dbData["ansor_bogor_official_kaderisasi_pamphlet"]) {
          setOfficialPamphletState(dbData["ansor_bogor_official_kaderisasi_pamphlet"]);
          localStorage.setItem("ansor_bogor_official_kaderisasi_pamphlet", dbData["ansor_bogor_official_kaderisasi_pamphlet"]);
        }
      } catch (err) {
        console.error("Async Supabase data load failed:", err);
      }
    }

    loadFromSupabase();
  }, []);

  // Sync to database and localStorage helpers
  const setHeroConfig = (newVal: HeroConfig) => {
    setHeroConfigState(newVal);
    localStorage.setItem("ansor_bogor_hero", JSON.stringify(newVal));
    setSupabaseCMSData("ansor_bogor_hero", newVal);
  };

  const setAboutConfig = (newVal: AboutConfig) => {
    setAboutConfigState(newVal);
    localStorage.setItem("ansor_bogor_about", JSON.stringify(newVal));
    setSupabaseCMSData("ansor_bogor_about", newVal);
  };

  const setStrategicPillars = (newVal: StrategicPillar[]) => {
    setStrategicPillarsState(newVal);
    localStorage.setItem("ansor_bogor_pillars", JSON.stringify(newVal));
    setSupabaseCMSData("ansor_bogor_pillars", newVal);
  };

  const setImpactStats = (newVal: ImpactStat[]) => {
    setImpactStatsState(newVal);
    localStorage.setItem("ansor_bogor_stats", JSON.stringify(newVal));
    setSupabaseCMSData("ansor_bogor_stats", newVal);
  };

  const setContactConfig = (newVal: ContactConfig) => {
    setContactConfigState(newVal);
    localStorage.setItem("ansor_bogor_contact", JSON.stringify(newVal));
    setSupabaseCMSData("ansor_bogor_contact", newVal);
  };

  const setAdsConfig = (newVal: AdsConfig) => {
    setAdsConfigState(newVal);
    localStorage.setItem("ansor_bogor_ads", JSON.stringify(newVal));
    setSupabaseCMSData("ansor_bogor_ads", newVal);
  };

  const setFaqs = (newVal: FAQItem[]) => {
    setFaqsState(newVal);
    localStorage.setItem("ansor_bogor_faqs", JSON.stringify(newVal));
    setSupabaseCMSData("ansor_bogor_faqs", newVal);
  };

  const setPrograms = (newVal: ProgramItem[]) => {
    setProgramsState(newVal);
    localStorage.setItem("ansor_bogor_programs", JSON.stringify(newVal));
    setSupabaseCMSData("ansor_bogor_programs", newVal);
  };

  const setNews = (newVal: NewsArticle[]) => {
    setNewsState(newVal);
    localStorage.setItem("ansor_bogor_news", JSON.stringify(newVal));
    setSupabaseCMSData("ansor_bogor_news", newVal);
  };

  const setLeaders = (newVal: TeamMember[]) => {
    setLeadersState(newVal);
    localStorage.setItem("ansor_bogor_leaders", JSON.stringify(newVal));
    setSupabaseCMSData("ansor_bogor_leaders", newVal);
  };

  const setGallery = (newVal: GalleryItem[]) => {
    setGalleryState(newVal);
    localStorage.setItem("ansor_bogor_gallery", JSON.stringify(newVal));
    setSupabaseCMSData("ansor_bogor_gallery", newVal);
  };

  const setDigitalServices = (newVal: DigitalServicesState) => {
    setDigitalServicesState(newVal);
    localStorage.setItem("ansor_bogor_digital_services", JSON.stringify(newVal));
    setSupabaseCMSData("ansor_bogor_digital_services", newVal);
  };

  const setMenuStatus = (newVal: MenuStatus) => {
    setMenuStatusState(newVal);
    localStorage.setItem("ansor_bogor_menu_status", JSON.stringify(newVal));
    setSupabaseCMSData("ansor_bogor_menu_status", newVal);
  };

  const setMenuLabels = (newVal: MenuLabels) => {
    setMenuLabelsState(newVal);
    localStorage.setItem("ansor_bogor_menu_labels", JSON.stringify(newVal));
    setSupabaseCMSData("ansor_bogor_menu_labels", newVal);
  };

  const setUsers = (newVal: CMSUser[]) => {
    setUsersState(newVal);
    localStorage.setItem("ansor_bogor_users", JSON.stringify(newVal));
    setSupabaseCMSData("ansor_bogor_users", newVal);
  };

  const setKaderisasiData = (newVal: KaderisasiRow[]) => {
    setKaderisasiDataState(newVal);
    localStorage.setItem("ansor_bogor_kaderisasi", JSON.stringify(newVal));
    setSupabaseCMSData("ansor_bogor_kaderisasi", newVal);
  };

  const setRegistrantsData = (newVal: Registrant[]) => {
    setRegistrantsDataState(newVal);
    localStorage.setItem("ansor_bogor_registrants", JSON.stringify(newVal));
    setSupabaseCMSData("ansor_bogor_registrants", newVal);
  };

  const setOfficialPamphlet = (newVal: string) => {
    setOfficialPamphletState(newVal);
    localStorage.setItem("ansor_bogor_official_kaderisasi_pamphlet", newVal);
    setSupabaseCMSData("ansor_bogor_official_kaderisasi_pamphlet", newVal);
  };

  // Helper method to publish all current values to Supabase at once (useful for initial seeding)
  const publishAllToSupabase = async () => {
    try {
      const keys = [
        { k: "ansor_bogor_hero", v: heroConfig },
        { k: "ansor_bogor_about", v: aboutConfig },
        { k: "ansor_bogor_pillars", v: strategicPillars },
        { k: "ansor_bogor_stats", v: impactStats },
        { k: "ansor_bogor_contact", v: contactConfig },
        { k: "ansor_bogor_ads", v: adsConfig },
        { k: "ansor_bogor_menu_status", v: menuStatus },
        { k: "ansor_bogor_faqs", v: faqs },
        { k: "ansor_bogor_programs", v: programs },
        { k: "ansor_bogor_news", v: news },
        { k: "ansor_bogor_leaders", v: leaders },
        { k: "ansor_bogor_gallery", v: gallery },
        { k: "ansor_bogor_digital_services", v: digitalServices },
        { k: "ansor_bogor_menu_labels", v: menuLabels },
        { k: "ansor_bogor_users", v: users },
        { k: "ansor_bogor_kaderisasi", v: kaderisasiData },
        { k: "ansor_bogor_registrants", v: registrantsData },
        { k: "ansor_bogor_official_kaderisasi_pamphlet", v: officialPamphlet }
      ];

      let successCount = 0;
      let lastErrorReason = "";
      for (const item of keys) {
        const res = await setSupabaseCMSData(item.k, item.v);
        if (res.success) {
          successCount++;
        } else if (res.error) {
          lastErrorReason = res.error.message || res.error.details || JSON.stringify(res.error);
        }
      }

      if (successCount === keys.length) {
        return { success: true, message: "Seluruh konten berhasil diunggah dan disinkronkan ke basis data Supabase!" };
      } else if (successCount > 0) {
        return { 
          success: true, 
          message: `Berhasil mengunggah ${successCount} dari ${keys.length} data ke Supabase. Namun ada galat: "${lastErrorReason || 'Galat tidak diketahui'}"` 
        };
      } else {
        return { 
          success: false, 
          message: `Gagal mengunggah ke Supabase! Detail galat: "${lastErrorReason || 'Tabel kemungkinan belum dibuat atau RLS memblokir write'}"` 
        };
      }
    } catch (err: any) {
      console.error(err);
      return { success: false, message: `Gagal menghubungkan basis data Supabase: ${err.message || err}` };
    }
  };

  const resetToDefault = () => {
    if (confirm("Apakah Anda yakin ingin menyetel ulang semua konten kembali ke bawaan sistem?")) {
      setHeroConfigState(defaultHeroConfig);
      setAboutConfigState(defaultAboutConfig);
      setStrategicPillarsState(defaultStrategicPillars);
      setImpactStatsState(defaultImpactStats);
      setContactConfigState(defaultContactConfig);
      setAdsConfigState(defaultAdsConfig);
      setMenuStatusState(defaultMenuStatus);
      setFaqsState(FAQS);
      setProgramsState(PROGRAMS);
      setNewsState(NEWS);
      setLeadersState(LEADERS);
      setGalleryState(GALLERY);
      setDigitalServicesState(defaultDigitalServices);
      setMenuLabelsState(defaultMenuLabels);
      setUsersState(defaultUsers);
      setKaderisasiDataState(defaultKaderisasiRows);
      setRegistrantsDataState(defaultRegistrants);
      setOfficialPamphletState("");

      localStorage.removeItem("ansor_bogor_hero");
      localStorage.removeItem("ansor_bogor_about");
      localStorage.removeItem("ansor_bogor_pillars");
      localStorage.removeItem("ansor_bogor_stats");
      localStorage.removeItem("ansor_bogor_contact");
      localStorage.removeItem("ansor_bogor_ads");
      localStorage.removeItem("ansor_bogor_menu_status");
      localStorage.removeItem("ansor_bogor_faqs");
      localStorage.removeItem("ansor_bogor_programs");
      localStorage.removeItem("ansor_bogor_news");
      localStorage.removeItem("ansor_bogor_leaders");
      localStorage.removeItem("ansor_bogor_gallery");
      localStorage.removeItem("ansor_bogor_digital_services");
      localStorage.removeItem("ansor_bogor_menu_labels");
      localStorage.removeItem("ansor_bogor_users");
      localStorage.removeItem("ansor_bogor_kaderisasi");
      localStorage.removeItem("ansor_bogor_registrants");
      localStorage.removeItem("ansor_bogor_official_kaderisasi_pamphlet");

      // Silently set back defaults on Supabase as well
      setSupabaseCMSData("ansor_bogor_hero", defaultHeroConfig);
      setSupabaseCMSData("ansor_bogor_about", defaultAboutConfig);
      setSupabaseCMSData("ansor_bogor_pillars", defaultStrategicPillars);
      setSupabaseCMSData("ansor_bogor_stats", defaultImpactStats);
      setSupabaseCMSData("ansor_bogor_contact", defaultContactConfig);
      setSupabaseCMSData("ansor_bogor_ads", defaultAdsConfig);
      setSupabaseCMSData("ansor_bogor_menu_status", defaultMenuStatus);
      setSupabaseCMSData("ansor_bogor_faqs", FAQS);
      setSupabaseCMSData("ansor_bogor_programs", PROGRAMS);
      setSupabaseCMSData("ansor_bogor_news", NEWS);
      setSupabaseCMSData("ansor_bogor_leaders", LEADERS);
      setSupabaseCMSData("ansor_bogor_gallery", GALLERY);
      setSupabaseCMSData("ansor_bogor_digital_services", defaultDigitalServices);
      setSupabaseCMSData("ansor_bogor_menu_labels", defaultMenuLabels);
      setSupabaseCMSData("ansor_bogor_users", defaultUsers);
      setSupabaseCMSData("ansor_bogor_kaderisasi", defaultKaderisasiRows);
      setSupabaseCMSData("ansor_bogor_registrants", defaultRegistrants);
      setSupabaseCMSData("ansor_bogor_official_kaderisasi_pamphlet", "");
      
      alert("Konten berhasil di-reset kembali ke bawaan sistem!");
    }
  };

  return (
    <CMSContext.Provider
      value={{
        heroConfig,
        setHeroConfig,
        aboutConfig,
        setAboutConfig,
        strategicPillars,
        setStrategicPillars,
        impactStats,
        setImpactStats,
        contactConfig,
        setContactConfig,
        adsConfig,
        setAdsConfig,
        faqs,
        setFaqs,
        programs,
        setPrograms,
        news,
        setNews,
        leaders,
        setLeaders,
        gallery,
        setGallery,
        digitalServices,
        setDigitalServices,
        menuStatus,
        setMenuStatus,
        menuLabels,
        setMenuLabels,
        users,
        setUsers,
        kaderisasiData,
        setKaderisasiData,
        registrantsData,
        setRegistrantsData,
        officialPamphlet,
        setOfficialPamphlet,
        resetToDefault,
        publishAllToSupabase,
        isCmsOpen,
        setIsCmsOpen,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </CMSContext.Provider>
  );
}

export function useCMS() {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error("useCMS must be used within a CMSProvider");
  }
  return context;
}
