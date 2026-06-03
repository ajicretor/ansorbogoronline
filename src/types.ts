export interface StatItem {
  id: string;
  value: string;
  label: string;
  icon: string;
}

export interface ProgramItem {
  id: string;
  title: string;
  description: string;
  extendedDescription: string;
  iconName: string;
  imageUrl: string;
  stats?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  imageUrl: string;
  readTime: string;
  author: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  description: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  socials?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface AboutConfig {
  historyTitleLine: string;
  historyTitleAnsor: string;
  description: string;
  historyParagraph1: string;
  historyParagraph2: string;
  keyGoals: string[];
}

export interface StrategicPillar {
  iconName: string;
  title: string;
  desc: string;
}

export interface ImpactStat {
  id: string;
  value: string;
  label: string;
  description: string;
}

export interface ContactConfig {
  address: string;
  phone: string;
  email: string;
  website: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
}

export interface MenuStatus {
  general: boolean;
  about: boolean;
  programs: boolean;
  news: boolean;
  gallery: boolean;
  leaders: boolean;
  contact: boolean;
  analytics: boolean;
  kaderisasi: boolean;
  alumni: boolean;
  epersuratan: boolean;
}

export interface DigitalServiceConfig {
  title: string;
  description: string;
  linkUrl: string;
  qrCodeUrl: string;
}

export interface DigitalServicesState {
  kaderisasi: DigitalServiceConfig;
  epersuratan: DigitalServiceConfig;
}

export interface CMSUser {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  role: "superadmin" | "sekretariat" | "ketuacabang";
}

export interface MenuLabels {
  beranda: string;
  kaderisasi: string;
  epersuratan: string;
  about: string;
  programs: string;
  news: string;
  gallery: string;
}

export interface KaderisasiRow {
  id: string;
  type: "pkd" | "diklatsar" | "susbalan_pkl";
  group: string; // PAC / Satkoryon
  angkatan: string;
  pesertaLulus: number;
  lokasi: string;
  tanggal: string;
  noSertifikat: string;
  cetak: "yes" | "no" | "belum";
  linkSertifikat: string;
}

export interface AdsConfig {
  enabled: boolean;
  imageUrl: string;
  targetUrl: string;
  altText: string;
  scriptCode?: string;
}

export interface Registrant {
  id: string; // generated format e.g. ANSOR-XXXXXX
  name: string;
  nik: string;
  email: string;
  whatsapp: string;
  district: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  
  // Optional Kaderisasi Fields
  registrationType?: "member" | "kaderisasi";
  desa?: string;
  kabupaten?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  ukuranKaos?: string;
  pendidikanAkhir?: string;
  pendidikanPesantren?: string;
  pekerjaan?: string;
  golonganDarah?: string;
  statusPernikahan?: string;
  pamfletFile?: string;
}






