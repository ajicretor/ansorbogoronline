import { StatItem, ProgramItem, NewsArticle, GalleryItem, TeamMember, FAQItem } from "./types";

export const STATS: StatItem[] = [
  {
    id: "active-members",
    value: "25.000+",
    label: "Anggota Aktif",
    icon: "Users",
  },
  {
    id: "sub-branches",
    value: "40",
    label: "Pimpinan Ranting",
    icon: "Home",
  },
  {
    id: "activities",
    value: "500+",
    label: "Kegiatan",
    icon: "Calendar",
  },
  {
    id: "districts",
    value: "40",
    label: "Kecamatan",
    icon: "MapPin",
  },
];

export const PROGRAMS: ProgramItem[] = [
  {
    id: "pengkaderan",
    title: "Pengkaderan",
    description: "Membentuk kader Ansor yang militan, berilmu dan berakhlak mulia.",
    extendedDescription: "Pengkaderan adalah jantung pergerakan GP Ansor. Melalui jenjang kaderisasi formal seperti Pelatihan Kepemimpinan Dasar (PKD), Pelatihan Kepemimpinan Lanjutan (PKL), serta Diklatsar Banser, kami melahirkan kader-kader muda Nahdlatul Ulama yang memiliki integritas moral tinggi, spirtualitas kokoh, loyalitas keorganisasian yang kuat, serta kapasitas intelektual yang memadai untuk menjawab tantangan zaman.",
    iconName: "ShieldCheck",
    imageUrl: "https://img.youtube.com/vi/F01FmR6k3_A/maxresdefault.jpg",
    stats: "30+ Angkatan PKD/Tahun",
  },
  {
    id: "sosial-kemanusiaan",
    title: "Sosial & Kemanusiaan",
    description: "Bergerak dalam aksi sosial, tanggap bencana dan bantuan kemanusiaan.",
    extendedDescription: "Melalui satuan khusus BANSER Tanggap Bencana (BAGANA) serta Unit Relawan Ansor Peduli, kami berkomitmen senantiasa hadir di garis depan setiap kali terjadi krisis kemanusiaan atau bencana alam di Kabupaten Bogor. Kegiatan kami mencakup evakuasi korban, pengelolaan dapur umum, distribusi bantuan pangan & obat-obatan, pemulihan pasbencana, hingga aksi donor darah rutin dan santunan kemiskinan ekstrim.",
    iconName: "HeartHandshake",
    imageUrl: "https://img.youtube.com/vi/dsNIOwcqaM8/maxresdefault.jpg",
    stats: "15+ Posko Bencana Aktif",
  },
  {
    id: "keagamaan",
    title: "Keagamaan",
    description: "Memperkuat pemahaman agama Ahlussunnah wal Jama'ah An-Nahdliyah.",
    extendedDescription: "Untuk merawat tradisi spiritualitas santri, kami memaksimalkan peran Majelis Dzikir dan Shalawat (MDS) Rijalul Ansor. Program ini mewadahi pengajian kitab kuning, pembacaan ratib dan tahlil, kajian Bahtsul Masail kepemudaan, khotbah Jumat keliling, serta dakwah digital inklusif yang menyebarkan paham Islam ramah, moderat (Tawasuth), toleran (Tasamuh), dan seimbang (Tawazun) di kalangan milenial.",
    iconName: "BookOpen",
    imageUrl: "https://img.youtube.com/vi/WvW_bX_tFf8/maxresdefault.jpg",
    stats: "120+ Majelis Rutin/Bulan",
  },
  {
    id: "ekonomi-kreatif",
    title: "Ekonomi Kreatif",
    description: "Mendorong kemandirian ekonomi pemuda melalui kewirausahaan.",
    extendedDescription: "Kemandirian organisasi hanya bisa dicapai bila kadernya berdaya secara finansial. Bidang Ekonomi Kreatif GP Ansor Bogor mendirikan Inkubator Bisnis Pemuda, memfasilitasi sertifikasi halal produk UMKM kader, menyelenggarakan pelatihan teknik pemasaran digital, serta mengelola Koperasi Ansor Mandiri untuk membuka akses modal bagi jejaring pengusaha muda di pelosok Bogor.",
    iconName: "TrendingUp",
    imageUrl: "https://img.youtube.com/vi/UoxeAox0p3s/maxresdefault.jpg",
    stats: "250+ UMKM Binaan",
  },
  {
    id: "kebangsaan",
    title: "Kebangsaan",
    description: "Meneguhkan semangat nasionalisme dan menjaga keutuhan NKRI.",
    extendedDescription: "Hubbul Wathan Minal Iman (Cinta Tanah Air sebagian dari Iman) merupakan doktrin fundamental pemuda Ansor. Upaya mengawal NKRI kami realisasikan lewat Apel Kebangsaan, pengamanan rumah ibadah agama lain di hari besar (Banser Serbaguna), edukasi wawasan kebangsaan ke sekolah-sekolah untuk mencegah radikalisme, serta program dialog lintas iman guna merawat tenun kebhinekaan di wilayah Kabupaten Bogor.",
    iconName: "Flag",
    imageUrl: "https://img.youtube.com/vi/A_Ff8XpxtwA/maxresdefault.jpg",
    stats: "100% Cinta Tanah Air",
  },
];

export const NEWS: NewsArticle[] = [
  {
    id: "news-diklatsar-parung",
    title: "Cetak Kader Unggul, GP Ansor Kabupaten Bogor Sukses Gelar Diklatsar Banser di Parung",
    excerpt: "Sebanyak 150 peserta resmi dibaiat menjadi anggota Barisan Ansor Serbaguna (Banser) setelah melalui penggemblengan fisik dan mental selama 3 hari.",
    content: "Pimpinan Anak Cabang (PAC) GP Ansor Kecamatan Parung sukses menyelenggarakan Pendidikan dan Latihan Dasar (Diklatsar) Banser Angkatan V di Pondok Pesantren Al-Hamidiyah. Acara yang berlangsung meriah ini bertujuan menyaring pemuda-pemuda terbaik Bogor menjadi pilar pertahanan organisasi dan ulama, serta pembela keutuhan NKRI dengan bekal keimanan dan akhlak mulia.",
    date: "24 Mei 2026",
    category: "Pengkaderan",
    imageUrl: "https://img.youtube.com/vi/F01FmR6k3_A/0.jpg",
    readTime: "4 Menit Baca",
    author: "Humas PC Ansor Bogor",
  },
  {
    id: "news-sosial-sukajaya",
    title: "Tanggap Bencana, BAGANA Ansor Bogor Salurkan Logistik Korban Longsor di Sukajaya",
    excerpt: "Merespon bencana longsor akibat curah hujan tinggi, tim Banser Tanggap Bencana langsung mendirikan posko darurat and membagikan bahan makanan.",
    content: "Banser Tanggap Bencana (Bagana) Kabupaten Bogor bergerak cepat menuju lokasi terdampak tanah longsor di pelosok Kecamatan Sukajaya. Tim relawan mengantarkan bantuan matras, piring terbang, selimut hangat, makanan bayi berkualitas, dan sembako bagi puluhan keluarga yang terisolasi. Koordinator lapangan menyatakan komitmen mengawal pemulihan trauma korban hingga situasi kondusif kembali.",
    date: "18 Mei 2026",
    category: "Sosial Kemanusiaan",
    imageUrl: "https://img.youtube.com/vi/dsNIOwcqaM8/0.jpg",
    readTime: "5 Menit Baca",
    author: "Relawan BAGANA",
  },
  {
    id: "news-ekraf-workshop",
    title: "Geliat Wirausaha Pemuda Desa: GP Ansor Bogor Luncurkan Inkubator Bisnis Digital",
    excerpt: "Guna menekan angka pengangguran pemuda pasca-pandemi, bidang perekonomian menyelenggarakan sertifikasi UMKM dan mentoring digital gratis.",
    content: "Bertempat di Gedung Pusdiklat Pemkab Bogor, PC GP Ansor Kabupaten Bogor meluncurkan program 'Ansor Preneur Academy'. Melalui kelas interaktif ini, puluhan pemuda didampingi langsung oleh praktisi e-commerce nasional untuk belajar digital branding, pengemasan modern, hingga pengurusan sertifikat Halal MUI Indonesia secara gratis, mendorong ketahanan ekonomi mandiri umat.",
    date: "10 Mei 2026",
    category: "Ekonomi Kreatif",
    imageUrl: "https://img.youtube.com/vi/UoxeAox0p3s/0.jpg",
    readTime: "3 Menit Baca",
    author: "Divisi Ekraf PC Ansor",
  },
];

export const GALLERY: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Apel Kesetiaan NKRI 10.000 Bouncer & Banser",
    category: "Kebangsaan",
    imageUrl: "https://img.youtube.com/vi/A_Ff8XpxtwA/0.jpg",
    description: "Kegiatan Apel Akbar Banser Kabupaten Bogor mengukuhkan komitmen cinta tanah air.",
  },
  {
    id: "gal-2",
    title: "Majelis Dzikir Rijalul Ansor bersama Habib",
    category: "Keagamaan",
    imageUrl: "https://img.youtube.com/vi/WvW_bX_tFf8/0.jpg",
    description: "Melantunkan selawat nabi demi keselamatan negeri di Masjid Agung Baitul Faizin Cibinong.",
  },
  {
    id: "gal-3",
    title: "Latihan Gabungan Tanggap Darurat Bencana",
    category: "Sosial Kemanusiaan",
    imageUrl: "https://img.youtube.com/vi/dsNIOwcqaM8/0.jpg",
    description: "Latihan mitigasi bencana banjir bandang dan penyelamatan korban air bersama tim SAR.",
  },
  {
    id: "gal-4",
    title: "Peluncuran Koperasi Ansor Bogor Mandiri",
    category: "Ekonomi Kreatif",
    imageUrl: "https://img.youtube.com/vi/Y0D_6PzB724/0.jpg",
    description: "Rapat Anggota Tahunan Koperasi Syariah yang dibentuk oleh kader-kader muda Ansor Bogor.",
  },
  {
    id: "gal-5",
    title: "Diklatsar Banser Zona Bogor Barat",
    category: "Pengkaderan",
    imageUrl: "https://img.youtube.com/vi/Tep_Q_L-n9c/0.jpg",
    description: "Upacara pembukaan Diklat Kepemimpinan dan Ketahanan Fisik di lapangan terbuka Leuwiliang.",
  },
  {
    id: "gal-6",
    title: "Pelatihan Protokoler dan Manajemen Humas",
    category: "Pengkaderan",
    imageUrl: "https://img.youtube.com/vi/UoxeAox0p3s/0.jpg",
    description: "Workshop kehumasan digital bagi perwakilan pengurus PAC GP Ansor se-Kabupaten Bogor.",
  },
];

export const LEADERS: TeamMember[] = [
  {
    id: "leader-1",
    name: "H. Ahmad Fauzan, S.E.",
    role: "Bendahara PC GP Ansor Kabupaten Bogor",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    id: "leader-2",
    name: "H. Angga",
    role: "Pimpinan Harian PC GP Ansor Kabupaten Bogor",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    id: "leader-3",
    name: "H. Dhamiry Ghozali",
    role: "Ketua PC GP Ansor Kabupaten Bogor",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    id: "leader-4",
    name: "M. Harun Al-Rasyid, M.Pd",
    role: "Sekretaris PC GP Ansor Kabupaten Bogor",
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    id: "leader-5",
    name: "Komandan Nandar S.",
    role: "Kepala Satkorcab Banser Kabupaten Bogor",
    imageUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&h=400&q=80",
  },
];

export const FAQS: FAQItem[] = [
  {
    id: "faq-1",
    question: "Apa saja syarat untuk bergabung menjadi anggota GP Ansor?",
    answer: "Syarat utama bergabung menjadi anggota GP Ansor adalah: Pemuda warga negara Indonesia beragama Islam usia 20 s.d 40 tahun, menyetujui Peraturan Dasar dan Peraturan Rumah Tangga (PD/PRT) GP Ansor, setia pada ideologi Pancasila dan NKRI, berhaluan Ahlussunnah wal Jama'ah An-Nahdliyah, serta bersedia mengikuti jalur kaderisasi formal tingkat awal (PKD/Diklatsar).",
  },
  {
    id: "faq-2",
    question: "Apa hubungan antara GP Ansor dengan Barisan Ansor Serbaguna (Banser)?",
    answer: "Banser (Barisan Ansor Serbaguna) merupakan lembaga semi-otonom di bawah naungan utama Gerakan Pemuda Ansor. Banser bertindak sebagai barisan serbaguna yang memiliki fungsi pengabdian, pengamanan, kemanusiaan, kedisiplinan, tanggap darurat, dan bela negara. Sederhananya, setiap anggota Banser pastilah kader GP Ansor, sementara tidak semua pengurus GP Ansor tergabung dalam Banser aktif.",
  },
  {
    id: "faq-3",
    question: "Membayar berapa biaya untuk ikut pelatihan PKD atau Diklatsar Banser?",
    answer: "Pelaksanaan kaderisasi (PKD/Diklatsar) umumnya diselenggarakan secara subsidi silang dibantu oleh Pimpinan Cabang atau Pimpinan Anak Cabang setempat serta donatur. Peserta biasanya hanya dikenakan kontribusi sangat terjangkau guna keperluan logistik makan, modul, sertifikat kelulusan resmi, kaos/atribut pelatihan, dan perlengkapan mandiri.",
  },
  {
    id: "faq-4",
    question: "Bagaimana cara masyarakat umum dapat memperoleh bantuan sosial kemanusiaan dari Ansor Bogor?",
    answer: "Masyarakat umum yang tertimpa musibah bencana atau membutuhkan bantuan kesejahteraan mendesak dapat melaporkan ke Posko Anak Cabang (PAC) GP Ansor terdekat di masing-masing kecamatan dari 40 kecamatan yang ada di Bogor, mendatangi kantor sekretariat PC GP Ansor Kabupaten Bogor di Cibinong, atau mengisi formulir kontak di website ini. Satuan BAGANA kami bersiaga 24/7.",
  },
];
