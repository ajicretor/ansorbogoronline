import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log('🏁 Starting static news pre-renderer for search-engines, crawlers & social media...');

  // Setup directories
  const distDir = path.join(__dirname, 'dist');
  const indexHtmlPath = path.join(distDir, 'index.html');

  if (!fs.existsSync(indexHtmlPath)) {
    console.error(`❌ Error: Base index.html not found in dist/ (${indexHtmlPath}). Please ensure "vite build" runs prior.`);
    process.exit(1);
  }

  // Load the built template HTML
  let templateHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

  // Load default fallback articles from offline list (aligned with src/data.ts)
  let articles = [
    {
      id: "news-diklatsar-parung",
      title: "Cetak Kader Unggul, GP Ansor Kabupaten Bogor Sukses Gelar Diklatsar Banser di Parung",
      excerpt: "Sebanyak 150 peserta resmi dibaiat menjadi anggota Barisan Ansor Serbaguna (Banser) setelah melalui penggemblengan fisik dan mental selama 3 hari.",
      imageUrl: "https://img.youtube.com/vi/F01FmR6k3_A/0.jpg",
    },
    {
      id: "news-sosial-sukajaya",
      title: "Tanggap Bencana, BAGANA Ansor Bogor Salurkan Logistik Korban Longsor di Sukajaya",
      excerpt: "Merespon bencana longsor akibat curah hujan tinggi, tim Banser Tanggap Bencana langsung mendirikan posko darurat and membagikan bahan makanan.",
      imageUrl: "https://img.youtube.com/vi/dsNIOwcqaM8/0.jpg",
    },
    {
      id: "news-ekraf-workshop",
      title: "Geliat Wirausaha Pemuda Desa: GP Ansor Bogor Luncurkan Inkubator Bisnis Digital",
      excerpt: "Guna menekan angka pengangguran pemuda pasca-pandemi, bidang perekonomian menyelenggarakan sertifikasi UMKM dan mentoring digital gratis.",
      imageUrl: "https://img.youtube.com/vi/UoxeAox0p3s/0.jpg",
    }
  ];

  // Try to load any dynamic real-time news data from Supabase
  const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://ccalbsgweohipcvxauli.supabase.co";
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjYWxic2d3ZW9oaXBjdnhhdWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNDc5MjQsImV4cCI6MjA5NTYyMzkyNH0.olxAt361Hyb0cLSM_B5V2ZOMibWVgawYgFSmnPK0nuc";

  const cleanUrl = supabaseUrl.replace(/['"]/g, "").trim().replace(/\/+$/, "");
  const cleanKey = supabaseKey.replace(/['"]/g, "").trim();

  if (cleanUrl && cleanKey) {
    try {
      console.log(`📡 Connecting to Supabase at: ${cleanUrl} to fetch live news feed...`);
      const res = await fetch(`${cleanUrl}/rest/v1/ansor_bogor_cms?key=eq.ansor_bogor_news&select=value`, {
        headers: {
          "apikey": cleanKey,
          "Authorization": `Bearer ${cleanKey}`
        }
      });
      if (res.ok) {
        const dbData = await res.json();
        if (Array.isArray(dbData) && dbData.length > 0 && dbData[0].value) {
          const liveArticles = dbData[0].value;
          if (Array.isArray(liveArticles) && liveArticles.length > 0) {
            console.log(`✅ Loaded ${liveArticles.length} live articles from Supabase!`);
            articles = liveArticles;
          }
        }
      } else {
        console.warn(`⚠️ Supabase fetch was not OK: ${res.statusText}. Using fallback news assets.`);
      }
    } catch (e) {
      console.warn("⚠️ Could not connect to Supabase database for news. Using default news list. Reason:", e.message);
    }
  }

  // Create news/ subdirectory in dist/
  const newsDir = path.join(distDir, 'news');
  if (!fs.existsSync(newsDir)) {
    fs.mkdirSync(newsDir, { recursive: true });
  }

  console.log(`\n📦 Generating static routes for ${articles.length} news articles...`);

  // We need to replace references of './assets/' or '/assets/' to '../../assets/' 
  // so that when browser accesses /news/[id]/ index.html, it traverses two directories up correctly.
  let basePageHtml = templateHtml
    .replace(/(href|src)="(\.\/)?assets\//g, '$1="../../assets/')
    .replace(/(href|src)="(\.\/)?favicon\.svg"/g, '$1="../../favicon.svg"')
    .replace(/(href|src)="\/favicon\.svg"/g, '$1="../../favicon.svg"');

  // Perform dynamic replacement for each article
  for (const article of articles) {
    if (!article.id) continue;

    console.log(`   👉 Pre-rendering news item ID: ${article.id}`);

    const articleTitle = article.title;
    const articleExcerpt = article.excerpt || article.description || article.content || "Media syi'ar dakwah virtual PC PC GP Ansor Kabupaten Bogor.";
    let imageUrl = article.imageUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1080&auto=format&fit=crop";

    // Handle relative images (ensure absolute for bots)
    if (imageUrl.startsWith("/")) {
      imageUrl = `https://ansorbogoronline.or.id${imageUrl}`;
    }

    const hostUrl = `https://ansorbogoronline.or.id/news/${article.id}`;

    // Custom tags replacement
    let newsHtml = basePageHtml
      // Replace Title Tag
      .replace(/<title>[^<]*<\/title>/, `<title>${articleTitle}</title>`)
      // Open Graph Tags
      .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/g, `<meta property="og:title" content="${articleTitle.replace(/"/g, '&quot;')}" />`)
      .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/g, `<meta property="og:description" content="${articleExcerpt.replace(/"/g, '&quot;')}" />`)
      .replace(/<meta property="og:image" content="[^"]*"\s*\/?>/g, `<meta property="og:image" content="${imageUrl}" />`)
      .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/g, `<meta property="og:url" content="${hostUrl}" />`)
      // Twitter Tags
      .replace(/<meta property="twitter:title" content="[^"]*"\s*\/?>/g, `<meta property="twitter:title" content="${articleTitle.replace(/"/g, '&quot;')}" />`)
      .replace(/<meta property="twitter:description" content="[^"]*"\s*\/?>/g, `<meta property="twitter:description" content="${articleExcerpt.replace(/"/g, '&quot;')}" />`)
      .replace(/<meta property="twitter:image" content="[^"]*"\s*\/?>/g, `<meta property="twitter:image" content="${imageUrl}" />`)
      .replace(/<meta property="twitter:url" content="[^"]*"\s*\/?>/g, `<meta property="twitter:url" content="${hostUrl}" />`);

    // Create the dedicated folder
    const articleFolder = path.join(newsDir, article.id);
    if (!fs.existsSync(articleFolder)) {
      fs.mkdirSync(articleFolder, { recursive: true });
    }

    // Write file
    fs.writeFileSync(path.join(articleFolder, 'index.html'), newsHtml, 'utf-8');
  }

  console.log('✅ All static news files successfully pre-rendered in dist/news/[id]/index.html!');
}

run().catch((err) => {
  console.error('❌ Error during news generation process:', err);
  process.exit(1);
});
