# 📌 Panduan Deploy Website PC GP Ansor Kabupaten Bogor (Edisi Perbaikan)
> **Khusus untuk Admin & Pengguna Awam (Non-IT)**  
> Panduan praktis langkah-demi-langkah untuk mempublikasikan website, mengatasi masalah layar kosong (blank putih), serta menghubungkannya ke alamat website resmi **ansorbogoronline.or.id**.

---

## 🛠️ KENAPA SEBELUMNYA TAMPILAN WEBSITE BLANK (KOSONG)?
Jika setelah Anda deploy tampilan website berwarna putih kosong (blank), ada dua penyebab utama yang sekarang **sudah kami perbaiki**:
1. **Masalah Alamat File (Relative Asset Path)**: Sebelumnya, website mencari file pendukung di alamat utama (`/assets/`), sedangkan di GitHub Pages alamatnya masuk ke sub-folder (`/ansorbogoronline/assets/`). Kami sudah memperbaikinya dengan mengubah konfigurasi di `vite.config.ts` menggunakan `"base": "./"` (relative path). Alamat aset sekarang adaptif otomatis!
2. **Salah Mengunggah File (Salah Upload)**: GitHub Pages tidak bisa membaca file mentah seperti `.tsx`, `package.json`, atau folder `src`. Yang harus diunggah adalah hasil kompilasi website berupa folder **`dist`** (berisi HTML, JS, dan CSS murni yang siap dibaca browser).

Berikut adalah cara deploy terbaru yang sangat gampang tanpa perlu skill pemrograman!

---

## 📂 DAFTAR ISI
1. [Langkah 1: Membuat File Siap Pakai (Folder `dist`)](#1-build-dist)
2. [Langkah 2: Mengunggah Folder `dist` ke GitHub](#2-upload-ke-github)
3. [Langkah 3: Menghubungkan Google Spreadsheet (Database)](#3-database-google-sheets)
4. [Langkah 4: Mengaktifkan Domain Resmi (ansorbogoronline.or.id)](#4-koneksi-domain)
5. [Langkah 5: Cara Login CMS Setelah Online](#5-login-cms)

---

<a name="1-build-dist"></a>
## 1. 📦 LANGKAH 1: MEMBUAT FILE SIAP PAKAI (FOLDER `dist`)
Sebelum mengunggah ke GitHub, kita harus mengubah kode mentah menjadi kode siap pakai/siap baca oleh browser.

### Jika Anda Melakukannya di Komputer Sendiri (Local):
1. Pastikan Anda sudah menginstal aplikasi [Node.js](https://nodejs.org/) di komputer Anda.
2. Buka aplikasi Terminal / Command Prompt (CMD), lalu masuk ke folder project website Anda.
3. Ketik perintah ini untuk mengunduh modul pendukung (cukup sekali saja):
   ```bash
   npm install
   ```
4. Ketik perintah ini untuk membuat folder hasil kompilasi:
   ```bash
   npm run build
   ```
5. Setelah selesai, Anda akan melihat sebuah folder baru bernama **`dist`** muncul di dalam folder website Anda. Folder `dist` inilah yang berisi file-file asli website Anda (seperti `index.html`, folder `assets`, dll).

---

<a name="2-upload-ke-github"></a>
## 2. 🚀 LANGKAH 2: CARA UPLOAD KE GITHUB (Gratis Selamanya)
GitHub akan bertindak sebagai hosting gratis yang super cepat untuk website kita.

### A. Membuat Akun & Repositori Baru di GitHub:
1. Buka situs [github.com](https://github.com/) dan buat akun (gratis).
2. Di pojok kanan atas, klik tombol **"+"** lalu pilih **New repository** (Repositori Baru).
3. Beri nama repositori Anda: **`ansorbogoronline`** (samakan dengan nama repositori Anda saat ini).
4. Pilih opsi **Public**.
5. Jangan centang apa pun di bawahnya, langsung klik tombol **Create repository**.

### B. Mengunggah Isi Folder `dist` (Bukan Folder Mentah!):
1. Pada halaman repositori baru Anda yang masih kosong, klik tulisan **"uploading an existing file"**.
2. **PENTING**: Masuklah ke dalam folder **`dist`** yang ada di komputer Anda.
3. Blok/pilih semua file yang ada di **DALAM** folder `dist` (biasanya ada file `index.html`, folder `assets`, dan beberapa file `.svg` atau `.png`).
4. Tarik (drag & drop) semua file tersebut langsung ke layar browser GitHub.
5. Tunggu hingga semua file selesai terunggah.
6. Klik tombol hijau **Commit changes** di bagian bawah halaman.

### C. Mengaktifkan Hosting Otomatis (GitHub Pages):
1. Masuk ke tab **Settings** (Pengaturan) di bagian atas halaman repositori GitHub Anda.
2. Di menu sebelah kiri, cari dan klik menu **Pages**.
3. Di bawah bagian **Build and deployment**:
   * Pada pilihan *Source*, biarkan **Deploy from a branch**.
   * Pada pilihan *Branch*, ubah dari `None` menjadi **`main`** atau **`master`** (pilih folder `/ (root)` di sebelahnya).
4. Klik **Save**.
5. Tunggu 1–2 menit, lalu segarkan halaman (refresh). Anda akan melihat kotak berwarna hijau bertuliskan:  
   *“Your site is live at `https://ajicretor.github.io/ansorbogoronline/`”* 🎉

---

<a name="3-database-google-sheets"></a>
## 3. 📊 LANGKAH 3: CARA MENGHUBUNGKAN GOOGLE SPREADSHEET (DATABASE SEBAGAI ADMIN)
Sistem web ini menggunakan Google Spreadsheet untuk mengisi link formulir, daftar alumni kaderisasi, dan cetak sertifikat secara dinamis dari dashboard admin tanpa bantuan progammer.

1. **Buat File Google Sheets**:
   * Buka [Google Sheets](https://sheets.google.com). Buat spreadsheet baru bernama `DATA_ALUMNI_KADERISASI_BOGOR`.
2. **Ambil Link Spreadsheet**:
   * Klik tombol **Bagikan (Share)** di pojok kanan atas Google Sheets.
   * Ubah akses yang awalnya "Dibatasi" menjadi **"Siapa saja yang memiliki link dapat melihat (Anyone with link can view)"**.
   * Salin (Copy) link Google Sheets tersebut.
3. **Pasang Link ke Tombol Terkait di Web**:
   * Masuk ke **CMS PANEL** di pojok kanan atas web Anda.
   * Pilih menu **Layanan: Kaderisasi** atau **Seksi Digital Services**.
   * Pada kolom **Link URL**, tempelkan (paste) link Google Sheets (atau Google Form pendaftaran) yang sudah disalin tadi.
   * Klik **Simpan**. Selesai! Link di tombol halaman depan otomatis berubah saat itu juga.

---

<a name="4-koneksi-domain"></a>
## 4. 🌐 LANGKAH 4: CARA UPGRADE KE DOMAIN RESMI (`ansorbogoronline.or.id`)
Setelah website Anda tampil lancar di GitHub Pages, ikuti langkah berikut untuk mengganti alamat gratisan GitHub menjadi domain resmi organisasi.

### A. Membeli Domain:
Jika belum membeli, Anda bisa membelinya di registrar lokal Indonesia (seperti Niagahoster, Domainesia, Idwebhost, dll). Pilih domain akhiran `.or.id`.

### B. Konfigurasi DNS di Portal Domain Anda:
1. Login ke panel klien tempat Anda membeli domain.
2. Cari menu **DNS Management** atau **Manage DNS** untuk domain `ansorbogoronline.or.id`.
3. Tambahkan **4 baris Record tipe A** dengan data berikut:
   
   | Type | Host | IP Address (Milik GitHub) |
   |------|---|---|
   | **A** | `@` | `185.199.108.153` |
   | **A** | `@` | `185.199.109.153` |
   | **A** | `@` | `185.199.110.153` |
   | **A** | `@` | `185.199.111.153` |

4. Tambahkan juga **1 baris Record tipe CNAME** untuk subdomain `www`:
   
   | Type | Host | Target |
   |------|---|---|
   | **CNAME** | `www` | `ajicretor.github.io.` *(pastikan diakhiri tanda titik)* |

### C. Pasang Domain di Pengaturan GitHub:
1. Kembali ke halaman repositori GitHub Anda, klik **Settings** -> **Pages**.
2. Masukkan nama domain Anda: `ansorbogoronline.or.id` pada kolom **Custom domain**.
3. Klik **Save**.
4. Centang pilihan **Enforce HTTPS** (sangat penting agar web menggunakan protokol gembok hijau terkunci aman).
5. Pasang domain ini membutuhkan waktu transfer (propagasi DNS) sekitar **1 hingga 24 jam** agar dapat diakses sepenuhnya di seluruh Indonesia.

---

<a name="5-login-cms"></a>
## 5. 🔑 LANGKAH 5: CARA LOGIN CMS SETELAH JAM ONLINE (STATIC FALLBACK)
Karena GitHub Pages adalah hosting statis (tidak menjalankan database server), kami telah merancang **fitur pintar (Static Fallback)** secara otomatis!

Meskipun website ditaruh di hosting gratisan GitHub, Anda tetap bisa Login ke **CMS Panel** menggunakan akun default berikut ini:

* **Akun Super Admin**:
  * **Username**: `admin`
  * **Password**: `adminansor1934`
* **Akun Sekretariat**:
  * **Username**: `sekretariat`
  * **Password**: `sekretariat1934`

Setelah login, Anda bisa mengedit Berita, Program, Galeri, Kontak, hingga Status Layanan secara langsung di browser Anda. Pembaruan akan tersimpan secara instan di browser Anda menggunakan aman di LocalStorage!

---
*Selamat mengelola sistem digitalisasi organisasi **PC GP Ansor Kabupaten Bogor**! Teruslah berkhidmat untuk umat dan bangsa!* 💚🇮🇩
