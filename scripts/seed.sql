-- TerraSiklus seed data
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

INSERT INTO crops (common_name, family_id, nutrient_demand, days_to_harvest, notes)
SELECT v.common_name, f.id, v.nutrient_demand, v.days, v.notes
FROM (VALUES
  ('Tomat','Solanaceae','tinggi',90,'Butuh ajir dan sinar matahari penuh.'),
  ('Cabai Rawit','Solanaceae','tinggi',100,'Rentan antraknosa saat musim hujan.'),
  ('Terong','Solanaceae','tinggi',85,'Rentan hama kutu kebul.'),
  ('Kentang','Solanaceae','tinggi',110,'Jangan tanam setelah tomat.'),
  ('Kacang Panjang','Fabaceae','rendah',55,'Mengikat nitrogen, bagus setelah tanaman rakus hara.'),
  ('Buncis','Fabaceae','rendah',60,'Penyubur tanah alami.'),
  ('Kedelai','Fabaceae','rendah',85,'Cocok untuk pemulihan lahan.'),
  ('Kacang Tanah','Fabaceae','rendah',100,'Memperbaiki struktur tanah berpasir.'),
  ('Sawi Hijau','Brassicaceae','tinggi',40,'Cepat panen, butuh nitrogen.'),
  ('Kubis','Brassicaceae','tinggi',90,'Rentan ulat krop.'),
  ('Brokoli','Brassicaceae','tinggi',80,'Butuh tanah gembur dan kaya kompos.'),
  ('Lobak','Brassicaceae','sedang',45,'Memecah tanah padat.'),
  ('Mentimun','Cucurbitaceae','tinggi',55,'Butuh rambatan.'),
  ('Labu Siam','Cucurbitaceae','tinggi',120,'Perlu ruang luas.'),
  ('Semangka','Cucurbitaceae','tinggi',85,'Butuh drainase baik.'),
  ('Wortel','Apiaceae','sedang',100,'Butuh tanah berpasir gembur.'),
  ('Seledri','Apiaceae','sedang',80,'Butuh kelembapan stabil.'),
  ('Bawang Merah','Amaryllidaceae','rendah',65,'Rentan ulat grayak.'),
  ('Bawang Daun','Amaryllidaceae','rendah',60,'Bisa ditanam sela.'),
  ('Selada','Asteraceae','rendah',35,'Cocok sebagai tanaman penyelang.'),
  ('Jagung Manis','Poaceae','tinggi',75,'Sangat rakus nitrogen.'),
  ('Bayam','Amaranthaceae','sedang',30,'Panen cepat, cocok penyelang.'),
  ('Bit Merah','Amaranthaceae','sedang',70,'Butuh kalium cukup.'),
  ('Kangkung','Convolvulaceae','rendah',28,'Toleran lahan basah.'),
  ('Ubi Jalar','Convolvulaceae','rendah',120,'Penutup tanah, menekan gulma.'),
  ('Jahe','Zingiberaceae','sedang',240,'Butuh naungan parsial.'),
  ('Kunyit','Zingiberaceae','sedang',270,'Tahan hama, bagus sebagai jeda rotasi.')
) AS v(common_name, family_name, nutrient_demand, days, notes)
JOIN plant_families f ON f.name = v.family_name
WHERE NOT EXISTS (SELECT 1 FROM crops c WHERE c.common_name = v.common_name);

INSERT INTO profiles (username) VALUES ('petani_demo') ON CONFLICT (username) DO NOTHING;

INSERT INTO farms (owner_id, name, location)
SELECT p.id, 'Kebun Lestari', 'Sleman, Yogyakarta'
FROM profiles p
WHERE p.username = 'petani_demo'
  AND NOT EXISTS (SELECT 1 FROM farms WHERE name = 'Kebun Lestari');

INSERT INTO plots (farm_id, name, area, soil_type)
SELECT f.id, v.name, v.area, v.soil
FROM farms f, (VALUES
  ('Petak A', 12.50, 'Lempung berpasir'),
  ('Petak B', 8.00, 'Lempung'),
  ('Petak C', 15.00, 'Tanah liat')
) AS v(name, area, soil)
WHERE f.name = 'Kebun Lestari'
  AND NOT EXISTS (SELECT 1 FROM plots p WHERE p.name = v.name AND p.farm_id = f.id);

-- riwayat tanam contoh
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

INSERT INTO soil_tests (plot_id, tested_on, ph, n, p, k, organic_matter, notes)
SELECT p.id, (CURRENT_DATE - 15)::date, v.ph, v.n, v.p, v.k, v.om, v.notes
FROM (VALUES
  ('Petak A', 6.30, 0.18, 22.0, 140.0, 3.10, 'Kondisi baik setelah penambahan kompos.'),
  ('Petak B', 5.40, 0.09, 12.0, 85.0, 1.80, 'Perlu pengapuran.'),
  ('Petak C', 6.80, 0.22, 30.0, 180.0, 4.20, 'Subur.')
) AS v(plot_name, ph, n, p, k, om, notes)
JOIN plots p ON p.name = v.plot_name
WHERE NOT EXISTS (SELECT 1 FROM soil_tests s WHERE s.plot_id = p.id);
