-- =====================================================================
-- SCRIPT SETUP TABEL PENDAFTARAN KADERISASI & CALON ANGGOTA (REGISTRANTS)
-- GP ANSOR KABUPATEN BOGOR DIGITAL SUITE
-- =====================================================================

-- 1. BUAT TABEL REKAP PENDAFTARAN KADERISASI DAN CALON ANGGOTA
CREATE TABLE IF NOT EXISTS public.ansor_bogor_registrants (
    id text PRIMARY KEY, -- Format ID: 'ANSOR-XXXXXX' (Calon Anggota) atau 'KADER-XXXXXX' (Kaderisasi)
    registration_type text NOT NULL DEFAULT 'member', -- 'member' (Calon Anggota) atau 'kaderisasi' (Pelatihan Kaderisasi)
    name text NOT NULL,
    nik varchar(16) NOT NULL,
    email text NOT NULL,
    whatsapp text NOT NULL,
    district text NOT NULL, -- Domisili Kecamatan di Kabupaten Bogor
    reason text, -- Alasan bergabung / mengikuti kegiatan
    status text NOT NULL DEFAULT 'pending', -- Status: 'pending', 'approved', 'rejected'
    created_at timestamp with time zone DEFAULT now(),
    
    -- Atribut Tambahan Khusus Jalur Kaderisasi (Optional / Nullable)
    desa text, -- Desa / Kelurahan domisili
    kabupaten text DEFAULT 'Kabupaten Bogor', -- Kabupaten / Kota domisili
    tempat_lahir text,
    tanggal_lahir text, -- Format tanggal lahir bebas (bisa string / dd/mm/yyyy)
    ukuran_kaos varchar(10), -- Ukuran kaos (S, M, L, XL, XXL, dll.)
    pendidikan_akhir text, -- Pendidikan terakhir (SMA, S1, dll.)
    pendidikan_pesantren text, -- Riwayat pesantren jika ada
    pekerjaan text, -- Pekerjaan saat ini
    golongan_darah varchar(5), -- Golongan darah (A, B, AB, O)
    status_pernikahan text, -- Status pernikahan
    pamflet_file text -- Informasi/URL pamflet referensi atau berkas pendaftaran
);

-- 2. AKTIFKAN ATURAN KEAMANAN ROW LEVEL SECURITY (RLS)
ALTER TABLE public.ansor_bogor_registrants ENABLE ROW LEVEL SECURITY;

-- 3. BUAT POLICIES SUPABASE AGAR DATA BISA DI-UPDATE/DI-BACA LANGSUNG SECARA REAL-TIME DARI WEB
DROP POLICY IF EXISTS "Allow public read access to Registrants data" ON public.ansor_bogor_registrants;
CREATE POLICY "Allow public read access to Registrants data" 
    ON public.ansor_bogor_registrants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access to Registrants data" ON public.ansor_bogor_registrants;
CREATE POLICY "Allow public insert access to Registrants data" 
    ON public.ansor_bogor_registrants FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access to Registrants data" ON public.ansor_bogor_registrants;
CREATE POLICY "Allow public update access to Registrants data" 
    ON public.ansor_bogor_registrants FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete access to Registrants data" ON public.ansor_bogor_registrants;
CREATE POLICY "Allow public delete access to Registrants data" 
    ON public.ansor_bogor_registrants FOR DELETE USING (true);

-- 4. INDEKS UNTUK OPTIMALISASI PENCARIAN & FILTERING DATA
CREATE INDEX IF NOT EXISTS idx_registrants_type ON public.ansor_bogor_registrants(registration_type);
CREATE INDEX IF NOT EXISTS idx_registrants_status ON public.ansor_bogor_registrants(status);
CREATE INDEX IF NOT EXISTS idx_registrants_nik ON public.ansor_bogor_registrants(nik);
