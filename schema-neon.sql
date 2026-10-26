-- Terrasiklus Database Schema for Neon PostgreSQL
-- Dibuat untuk deployment Vercel dengan DATABASE_URL Neon

-- 1. Tabel Profiles (users)
CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Farms (kebun)
CREATE TABLE IF NOT EXISTS farms (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Plant Families (keluarga tanaman)
CREATE TABLE IF NOT EXISTS plant_families (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT
);

-- 4. Tabel Crops (komoditas)
CREATE TABLE IF NOT EXISTS crops (
  id SERIAL PRIMARY KEY,
  common_name VARCHAR(255) NOT NULL,
  family_id INTEGER REFERENCES plant_families(id) ON DELETE CASCADE,
  nutrient_demand VARCHAR(50) NOT NULL, -- 'tinggi' | 'sedang' | 'rendah'
  days_to_harvest INTEGER,
  notes TEXT,
  UNIQUE(common_name, family_id)
);

-- 5. Tabel Plots (petak)
CREATE TABLE IF NOT EXISTS plots (
  id SERIAL PRIMARY KEY,
  farm_id INTEGER REFERENCES farms(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  area NUMERIC(10, 2),
  soil_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(farm_id, name)
);

-- 6. Tabel Plantings (riwayat tanam)
CREATE TABLE IF NOT EXISTS plantings (
  id SERIAL PRIMARY KEY,
  plot_id INTEGER REFERENCES plots(id) ON DELETE CASCADE,
  crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
  planted_on DATE NOT NULL,
  harvested_on DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabel Soil Tests (hasil uji tanah)
CREATE TABLE IF NOT EXISTS soil_tests (
  id SERIAL PRIMARY KEY,
  plot_id INTEGER REFERENCES plots(id) ON DELETE CASCADE,
  tested_on DATE NOT NULL,
  ph NUMERIC(4, 2),
  n NUMERIC(6, 2), -- Nitrogen (%)
  p NUMERIC(6, 2), -- Fosfor (ppm)
  k NUMERIC(6, 2), -- Kalium (ppm)
  organic_matter NUMERIC(6, 2), -- Bahan organik (%)
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert data awal (seed data)

-- Keluarga tanaman
INSERT INTO plant_families (name, description) VALUES
('Solanaceae', 'Keluarga terong-terongan. Rakus hara, rentan layu bakteri & nematoda.'),
('Fabaceae', 'Keluarga polong-polongan. Pengikat nitrogen alami, penyubur tanah.'),
('Brassicaceae', 'Keluarga kubis-kubisan. Butuh nitrogen tinggi, rentan akar gada.'),
('Cucurbitaceae', 'Keluarga labu-labuan. Rakus hara dan air, rentan embun tepung.'),
('Apiaceae', 'Keluarga wortel & seledri. Akar dalam, kebutuhan hara sedang.'),
('Amaryllidaceae', 'Keluarga bawang. Kebutuhan hara rendah, menolak beberapa hama.'),
('Asteraceae', 'Keluarga selada & krisan. Cepat panen, hara ringan.'),
('Poaceae', 'Keluarga rumput & jagung. Sangat rakus nitrogen.'),
('Amaranthaceae', 'Keluarga bayam & bit. Toleran, hara sedang.'),
('Convolvulaceae', 'Keluarga ubi jalar & kangkung. Penutup tanah yang baik.'),
('Zingiberaceae', 'Keluarga jahe & kunyit. Rimpang, hara sedang.')
ON CONFLICT (name) DO NOTHING;

-- Komoditas (crops)
INSERT INTO crops (common_name, family_id, nutrient_demand, days_to_harvest, notes)
SELECT v.common_name, f.id, v.nutrient_demand, v.days, v.notes
FROM (VALUES
  ('Tomat', 'Solanaceae', 'tinggi', 90, 'Butuh ajir dan sinar matahari penuh.'),
  ('Cabai Rawit', 'Solanaceae', 'tinggi', 100, 'Rentan antraknosa saat musim hujan.'),
  ('Terong', 'Solanaceae', 'tinggi', 85, 'Rentan hama kutu kebul.'),
  ('Kentang', 'Solanaceae', 'tinggi', 110, 'Jangan tanam setelah tomat.'),
  ('Kacang Panjang', 'Fabaceae', 'rendah', 55, 'Mengikat nitrogen, bagus setelah tanaman rakus hara.'),
  ('Buncis', 'Fabaceae', 'rendah', 60, 'Penyubur tanah alami.'),
  ('Kedelai', 'Fabaceae', 'rendah', 85, 'Cocok untuk pemulihan lahan.'),
  ('Kacang Tanah', 'Fabaceae', 'rendah', 100, 'Memperbaiki struktur tanah berpasir.'),
  ('Sawi Hijau', 'Brassicaceae', 'tinggi', 40, 'Cepat panen, butuh nitrogen.'),
  ('Kubis', 'Brassicaceae', 'tinggi', 90, 'Rentan ulat krop.'),
  ('Brokoli', 'Brassicaceae', 'tinggi', 80, 'Butuh tanah gembur dan kaya kompos.'),
  ('Lobak', 'Brassicaceae', 'sedang', 45, 'Memecah tanah padat.'),
  ('Mentimun', 'Cucurbitaceae', 'tinggi', 55, 'Butuh rambatan.'),
  ('Labu Siam', 'Cucurbitaceae', 'tinggi', 120, 'Perlu ruang luas.'),
  ('Semangka', 'Cucurbitaceae', 'tinggi', 85, 'Butuh drainase baik.'),
  ('Wortel', 'Apiaceae', 'sedang', 100, 'Butuh tanah berpasir gembur.'),
  ('Seledri', 'Apiaceae', 'sedang', 80, 'Butuh kelembapan stabil.'),
  ('Bawang Merah', 'Amaryllidaceae', 'rendah', 65, 'Rentan ulat grayak.'),
  ('Bawang Daun', 'Amaryllidaceae', 'rendah', 60, 'Bisa ditanam sela.'),
  ('Selada', 'Asteraceae', 'rendah', 35, 'Cocok sebagai tanaman penyelang.'),
  ('Jagung Manis', 'Poaceae', 'tinggi', 75, 'Sangat rakus nitrogen.'),
  ('Bayam', 'Amaranthaceae', 'sedang', 30, 'Panen cepat, cocok penyelang.'),
  ('Bit Merah', 'Amaranthaceae', 'sedang', 70, 'Butuh kalium cukup.'),
  ('Kangkung', 'Convolvulaceae', 'rendah', 28, 'Toleran lahan basah.'),
  ('Ubi Jalar', 'Convolvulaceae', 'rendah', 120, 'Penutup tanah, menekak Gulma.'),
  ('Jahe', 'Zingiberaceae', 'sedang', 240, 'Butuh naungan parsial.'),
  ('Kunyit', 'Zingiberaceae', 'sedang', 270, 'Tahan hama, bagus sebagai jeda rotasi.')
) AS v(common_name, family_name, nutrient_demand, days, notes)
JOIN plant_families f ON f.name = v.family_name
WHERE NOT EXISTS (SELECT 1 FROM crops c WHERE c.common_name = v.common_name);

-- Profiles
INSERT INTO profiles (username) VALUES ('petani_demo') ON CONFLICT (username) DO NOTHING;

-- Farms
INSERT INTO farms (owner_id, name, location)
SELECT p.id, 'Kebun Lestari', 'Sleman, Yogyakarta'
FROM profiles p
WHERE p.username = 'petani_demo'
AND NOT EXISTS (SELECT 1 FROM farms WHERE name = 'Kebun Lestari');

-- Plots (petak)
INSERT INTO plots (farm_id, name, area, soil_type)
SELECT f.id, v.name, v.area, v.soil
FROM farms f, (VALUES
  ('Petak A', 12.50, 'Lempung berpasir'),
  ('Petak B', 8.00, 'Lempung'),
  ('Petak C', 15.00, 'Tanah liat')
) AS v(name, area, soil)
WHERE f.name = 'Kebun Lestari'
AND NOT EXISTS (SELECT 1 FROM plots p WHERE p.name = v.name AND p.farm_id = f.id);

-- Riwayat tanam contoh
INSERT INTO plantings (plot_id, crop_id, planted_on, harvested_on, notes)
SELECT p.id, c.id, v.planted::date, NULLIF(v.harvested,'')::date, v.notes
FROM (VALUES
  ('Petak A','Tomat', (CURRENT_DATE - 200)::text, (CURRENT_DATE - 110)::text, 'Serangan kutu kebul ringan.'),
  ('Petak A','Kacang Panjang', (CURRENT_DATE - 30)::text, '', 'Pertumbuhan bagus.'),
  ('Petak B','Sawi Hijau', (CURRENT_DATE - 60)::text, (CURRENT_DATE - 20)::text, 'Ulat daun teratasi dengan perangkap.'),
  ('Petak C','Jagung Manis', (CURRENT_DATE - 50)::text, '', 'Perlu pemupukan susulan.')
) AS v(plot_name, crop_name, planted, harvested, notes)
JOIN plots p ON p.name = v.plot_name
JOIN crops c ON c.common_name = v.crop_name
WHERE NOT EXISTS (
  SELECT 1 FROM plantings pl WHERE pl.plot_id = p.id AND pl.crop_id = c.id
);

-- Soil tests contoh
INSERT INTO soil_tests (plot_id, tested_on, ph, n, p, k, organic_matter, notes)
SELECT p.id, (CURRENT_DATE - 15)::date, v.ph, v.n, v.p, v.k, v.om, v.notes
FROM (VALUES
  ('Petak A', 6.30, 0.18, 22.0, 140.0, 3.10, 'Kondisi baik setelah penambahan kompos.'),
  ('Petak B', 5.40, 0.09, 12.0, 85.0, 1.80, 'Perlu pengapuran.'),
  ('Petak C', 6.80, 0.22, 30.0, 180.0, 4.20, 'Subur.')
) AS v(plot_name, ph, n, p, k, om, notes)
JOIN plots p ON p.name = v.plot_name
WHERE NOT EXISTS (SELECT 1 FROM soil_tests s WHERE s.plot_id = p.id);

-- Indeks untuk performa
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_farms_owner_id ON farms(owner_id);
CREATE INDEX IF NOT EXISTS idx_plots_farm_id ON plots(farm_id);
CREATE INDEX IF NOT EXISTS idx_crops_family_id ON crops(family_id);
CREATE INDEX IF NOT EXISTS idx_crops_common_name ON crops(common_name);
CREATE INDEX IF NOT EXISTS idx_plantings_plot_id ON plantings(plot_id);
CREATE INDEX IF NOT EXISTS idx_plantings_crop_id ON plantings(crop_id);
CREATE INDEX IF NOT EXISTS idx_soil_tests_plot_id ON soil_tests(plot_id);
CREATE INDEX IF NOT EXISTS idx_soil_tests_tested_on ON soil_tests(tested_on DESC);

-- Grant permissions (opsional untuk Neon)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;