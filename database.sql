-- ============================================
-- GeoTriage AI — Supabase Database Setup
-- ============================================

-- 1. Buat tabel laporan_bencana
CREATE TABLE laporan_bencana (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  latitude FLOAT8 NOT NULL,
  longitude FLOAT8 NOT NULL,
  image_url TEXT NOT NULL,
  jenis_bencana TEXT NOT NULL,
  tingkat_keparahan TEXT NOT NULL,
  detail_dampak TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Aktifkan Row Level Security
ALTER TABLE laporan_bencana ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Semua orang bisa INSERT (untuk pelaporan warga)
CREATE POLICY "Allow public insert"
  ON laporan_bencana
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 4. Policy: Semua orang bisa SELECT (untuk dashboard)
CREATE POLICY "Allow public read"
  ON laporan_bencana
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================
-- INSTRUKSI STORAGE BUCKET
-- ============================================
-- 
-- Buat Storage Bucket di Supabase Dashboard:
-- 1. Buka Supabase Dashboard > Storage
-- 2. Klik "New Bucket"
-- 3. Nama bucket: bencana_images
-- 4. Centang "Public bucket" agar file bisa diakses via public URL
-- 5. Klik "Create bucket"
--
-- Tambahkan policy untuk upload:
-- 1. Klik bucket "bencana_images" > Policies
-- 2. Buat policy baru untuk INSERT:
--    - Policy name: "Allow public upload"
--    - Target roles: anon, authenticated
--    - WITH CHECK: true
-- 3. Buat policy baru untuk SELECT:
--    - Policy name: "Allow public read"
--    - Target roles: anon, authenticated
--    - USING: true
-- ============================================
