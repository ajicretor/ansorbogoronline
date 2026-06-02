import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dns from "dns";
import { GoogleGenAI } from "@google/genai";

// Set default DNS resolution to ipv4first to avoid dual-stack host resolution issues
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const DEFAULT_SERVER_USERS = [
  { id: "1", username: "admin", passwordHash: "adminansor1934", name: "Septa Aji", role: "superadmin" },
  { id: "2", username: "sekretariat", passwordHash: "sekretariat1934", name: "Sekretariat Cabang", role: "sekretariat" },
  { id: "3", username: "ketua", passwordHash: "ketuaansor1934", name: "Ketua Pimpinan Cabang", role: "ketuacabang" }
];

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/);
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const results: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    let currentField = '';
    let insideQuotes = false;
    const row: string[] = [];
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        row.push(currentField.trim().replace(/^["']|["']$/g, ''));
        currentField = '';
      } else {
        currentField += char;
      }
    }
    row.push(currentField.trim().replace(/^["']|["']$/g, ''));
    
    const obj: Record<string, string> = {};
    headers.forEach((h, index) => {
      obj[h.toLowerCase()] = row[index] || '';
    });
    results.push(obj);
  }
  return results;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Secure Login
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, error: "Username & Password wajib diisi!" });
      }

      const u = username.trim().toLowerCase();
      const p = password.trim();

      let activeUsers = DEFAULT_SERVER_USERS;
      const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://ccalbsgweohipcvxauli.supabase.co";
      const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjYWxic2d3ZW9oaXBjdnhhdWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNDc5MjQsImV4cCI6MjA5NTYyMzkyNH0.olxAt361Hyb0cLSM_B5V2ZOMibWVgawYgFSmnPK0nuc";

      const cleanUrl = supabaseUrl.replace(/['"]/g, "").trim().replace(/\/+$/, "");
      const cleanKey = supabaseKey.replace(/['"]/g, "").trim();

      if (cleanUrl && cleanKey) {
        try {
          console.log(`Fetching CMS users from Supabase DB: ${cleanUrl}`);
          const fetchRes = await fetch(`${cleanUrl}/rest/v1/ansor_bogor_users?select=*`, {
            headers: {
              "apikey": cleanKey,
              "Authorization": `Bearer ${cleanKey}`
            }
          });

          if (fetchRes.ok) {
            const dbUsers = await fetchRes.json();
            if (Array.isArray(dbUsers) && dbUsers.length > 0) {
              const converted = dbUsers.map((row: any, idx: number) => {
                const rowUsername = (row.username || row.user || '').trim().toLowerCase();
                const rowPassword = (row.password || row.passwordhash || row.pass || '').trim();
                const rowName = (row.name || row.nama || '').trim();
                const rowRole = (row.role || row.jabatan || 'sekretariat').trim().toLowerCase();

                return {
                  id: row.id || `db-${idx + 1}`,
                  username: rowUsername,
                  passwordHash: rowPassword,
                  name: rowName || rowUsername,
                  role: (rowRole === 'superadmin' || rowRole === 'admin') ? 'superadmin' : (rowRole === 'ketuacabang' ? 'ketuacabang' : 'sekretariat')
                };
              }).filter(user => user.username && user.passwordHash);

              if (converted.length > 0) {
                activeUsers = converted;
                console.log(`Loaded ${converted.length} users successfully from Supabase "ansor_bogor_users" table.`);
              } else {
                console.warn("Supabase user query parsed but produced no valid users. Utilizing fallback users.");
              }
            } else {
              console.warn("Supabase user array was empty or invalid format. Utilizing fallback users.");
            }
          } else {
            console.error(`Supabase fetch failed with status ${fetchRes.status}. Utilizing fallback users.`);
          }
        } catch (dbErr) {
          console.error("Error reading Supabase users, falling back to server default users:", dbErr);
        }
      }

      // Check match
      const matched = activeUsers.find(
        x => x.username.toLowerCase() === u && String(x.passwordHash) === p
      );

      if (matched) {
        return res.json({
          success: true,
          user: {
            username: matched.username,
            name: matched.name,
            role: matched.role
          }
        });
      } else {
        return res.status(401).json({
          success: false,
          error: "Kombinasi Username & Password tidak sesuai!"
        });
      }
    } catch (err: any) {
      console.error("Login endpoint exception:", err);
      return res.status(500).json({ success: false, error: "Server error occurred during login verification." });
    }
  });

  // API Route for AI Copilot Chat Support (CS Advisor)
  app.post("/api/copilot", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ success: false, error: "Messages array wajib disertakan!" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("GEMINI_API_KEY is not defined. Using friendly local fallback instructions.");
        return res.json({
          success: true,
          text: "Halo sahabat! Saya adalah **Copilot AI Ansor**, asisten pemandu untuk GP Ansor Kabupaten Bogor Digital Suite.\n\nSelamat datang di aplikasi ini! Tampaknya sistem administrator belum mengonfigurasi **GEMINI_API_KEY** di menu **Settings > Secrets** pada platform Anda.\n\nTetapi jangan khawatir! Sebagai panduan cepat penggunaan:\n- **CMS Konten**: Klik tombol **CMS Portal** di pojok kanan bawah atau masuk via link khusus. Gunakan akun contoh seperti `admin` (Super Admin) dengan password `adminansor1934` untuk mulai mempublikasikan konten!\n- **Branding & Hero (Branding & Teks)**: Untuk mengedit Judul website, Subjudul, Video Profil, dan Statistik.\n- **Berita & Syi'ar**: Gunakan menu **Berita (News)** untuk merilis kegiatan dakwah dan kepemudaan.\n- **Peran Pengguna**: Ada Super Admin, Sekretariat, dan Ketua Cabang dengan batasan akses masing-masing.\n- **Mode Gelap**: Klik ikon Bulan/Matahari di bar navigasi atas untuk beralih mode visual.\n\nPastikan untuk menambahkan kunci API di menu rahasia agar saya bisa mengobrol secara cerdas dan interaktif bersama Anda!"
        });
      }

      // Initialize Google GenAI client lazily to avoid startup crash if key gets reconfigured
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      const systemInstruction = `Anda adalah "Copilot AI Ansor", asisten virtual cerdas (CS / Customer Service) khusus untuk aplikasi digital "PC GP Ansor Kabupaten Bogor Digital Suite & CMS Control Panel".
Tugas utama Anda adalah membimbing sahabat dan administrator kader untuk memahami fitur-fitur yang ada di website ini secara runtut, penuh kehangatan, bersahaja, bersahabat, andal, dan solutif.

Berikut adalah pemandu fiturnya:
1. **CMS Konten (Dashboard Admin)**:
   - Akses berada di pojok kanan bawah landing page dengan tombol "CMS Portal" (atau masuk dengan login).
   - Pengguna Default untuk pengujian/demonstrasi:
     * **Super Admin**: Username \`admin\` | Password \`adminansor1934\` (Akses penuh untuk seluruh modul, termasuk branding, pilar, pimpinan, izin).
     * **Sekretariat**: Username \`sekretariat\` | Password \`sekretariat1934\` (Akses Terbatas: Hanya mengelola Berita, Galeri, dan melihat Monitor Pembaca).
     * **Ketua Cabang**: Username \`ketua\` | Password \`ketuaansor1934\` (Akses Terbatas: Mengarahkan pantauan organisasi, Berita, Galeri, Monitor Pembaca).
2. **Modul Pengelolaan Utama**:
   - **Branding & Hero**: Mengubah nama pimpinan cabang, subjudul, ikon media sosial, video profil, statistik dampak (anggota aktif, kader, majelis taklim).
   - **Tentang & Pilar**: Mengatur visi khidmat pemuda Ansor, pilar khidmat (Keagamaan, Kebangsaan, Kepemudaan, Kepeloporan).
   - **Program Kerja**: Rencana aksi strategis yang dapat ditambah, diedit, atau dihapus dengan penentuan target dinamis.
   - **Berita (News)**: Tempat merilis berita syi'ar, informasi kaderisasi, dengan tombol "+ Buat Berita" lengkap dengan input judul, subjudul, penulis, dan thumbnail.
   - **Galeri Kegiatan**: Portofolio visual dokumentasi momen istimewa GP Ansor Bogor.
   - **Dewan Pimpinan**: Menampilkan organigram tatanan pengurus inti PC GP Ansor Kabupaten Bogor beserta foto jabatan mereka.
   - **Layanan Digital**: Integrasi pintasan sistem eksternal, seperti tautan Kartu Tanda Anggota (KTA) digital, Pendaftaran Kaderisasi, dan E-Persurat-an Cabang.
   - **Izin Akses & Monitor Pembaca**: Pengecekan statistik log, analitik klik, pembaca berita, serta pengaturan khusus penugasan staf.
3. **Fitur Antarmuka Utama**:
   - **Mode Gelap / Terang (Dark/Light Dynamic Toggle)**: Pengguna dapat mengklik ikon Bulan/Matahari di bar navigasi atas atau sudut CMS untuk beralih skema warna untuk kenyamanan baca di malam hari.
   - **Sinkronisasi Supabase**: Integrasi database andal agar perubahan tersimpan permanen di cloud database Supabase.

Gunakan salam hangat sahabat pemuda Ansor ("Halo Sahabat!", "Assalamu'alaikum wr. wb. Sahabat!") dalam bahasa Indonesia yang penuh kesantunan, berwibawa, bersemangat organisasi pemuda Islam (Nahdlatul Ulama), serta berikan panduan ringkas dan jelas.`;

      // Structure chat messages complying with @google/genai contents pattern
      // Ensure the message history strictly starts with a "user" message and alternates to prevent Gemini 400 bad request error.
      const firstUserIndex = messages.findIndex((m: any) => m.role === "user");
      let contents: any[] = [];
      
      if (firstUserIndex !== -1) {
        const apiMessages = messages.slice(firstUserIndex);
        let expectedRole = "user";
        
        for (const m of apiMessages) {
          const role = m.role === "user" ? "user" : "model";
          if (role === expectedRole) {
            contents.push({
              role: role,
              parts: [{ text: m.content || "" }]
            });
            expectedRole = expectedRole === "user" ? "model" : "user";
          } else if (contents.length > 0) {
            // Append content if roles are consecutive of the same type to preserve context
            contents[contents.length - 1].parts[0].text += "\n" + (m.content || "");
          }
        }
      }

      // Fallback if no user message found in history
      if (contents.length === 0) {
        return res.json({
          success: true,
          text: "Halo Sahabat! Ada yang bisa saya bantu hari ini mengenai panduan PC GP Ansor Kabupaten Bogor Digital Suite?"
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      return res.json({
        success: true,
        text: response.text || "Mohon maaf sahabat, saya tidak mendapat respons yang memadai. Bisa silakan ulangi?"
      });

    } catch (error: any) {
      console.error("Copilot Coprocessing error details:", error);
      return res.status(500).json({
        success: false,
        error: "Terjadi gangguan pada pemrosesan asisten AI. Silakan periksa kembali server API."
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite development middleware.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`Mounted production build directory: ${distPath}`);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
