# TerraSiklus — Kalkulator Rotasi Tanaman & Kesehatan Tanah

Aplikasi web open source untuk membantu petani kecil dan pekebun rumahan merencanakan rotasi tanaman berdasarkan keluarga botani dan riwayat kesehatan tanah. Mencegah ledakan hama, mengoptimalkan penggunaan pupuk, dan menjaga kesuburan tanah dari musim ke musim.

## 🌱 Fitur Utama

- **Mesin Rotasi Cerdas** — Rekomendasi komoditas berdasarkan keluarga botani tanaman musim sebelumnya
- **Pelacak Kesehatan Tanah** — Catat pH, Nitrogen, Fosfor, Kalium, dan bahan organik untuk setiap petak
- **Peringatan Hama Dini** — Peringatan otomatis jika menanam keluarga yang sama terlalu cepat
- **Daftar Aksi Berikutnya** — Tahu kapan waktunya panen, menanam ulang, atau menguji tanah kembali
- **Katalog Tanaman** — Referensi 40+ komoditas dengan tingkat kebutuhan hara
- **Dukungan Trakteer** — Widget donasi terintegrasi di sudut kanan bawah
- **Download Source Code** — Tombol unduh source code lengkap

## 🛠️ Teknologi

- **Framework**: Next.js 16.2.6 (App Router)
- **Database**: PostgreSQL (Neon / Drizzle ORM)
- **Styling**: Tailwind CSS 4.1.17
- **State Management**: @tanstack/react-query
- **Icons**: lucide-react
- **Type Checking**: TypeScript 5.9.3

## 🚀 Deployment ke Vercel

### 1. Persiapkan Database Neon

Buat database PostgreSQL di [Neon](https://neon.tech/) lalu salin `DATABASE_URL` dari dashboard.

### 2. Set Environment Variables

Buat file `.env` di root project (contoh `.env.example`):

```env
DATABASE_URL=postgresql://neondb_owner:npg_xxxxx@ep-xxxxx-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 3. Jalankan Schema ke Neon

```bash
# Gunakan psql atau Neon Console
psql $DATABASE_URL -f schema-neon.sql
```

### 4. Set Vercel Environment Variables

Di Vercel Dashboard → Settings → Environment Variables, tambahkan:

- `DATABASE_URL` = nilai dari Neon console

### 5. Deploy ke Vercel

```bash
vercel --prod
```

## 💻 Menjalankan Secara Lokal

```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev

# Build untuk produksi
npm run build

# Jalankan server produksi
npm start

# Cek typecheck
npm run typecheck

# Cek lint
npm run lint
```

## 🗄️ Database Schema

Schema lengkap terdapat di `schema-neon.sql`. Untuk menginisialisasi database:

```bash
npm run db:seed
```

Atau gunakan Drizzle Kit:

```bash
npm run db:push     # Push schema ke database
npm run db:generate # Generate migration
npm run db:studio    # Buka Drizzle Studio
```

## 📦 Download Source Code

Aplikasi ini menyediakan fitur download source code lengkap melalui tombol di sudut kanan bawah layar (ikon arrow ke bawah).

Atau kunungi repositori langsung: https://github.com/username/terra-siklus-crop-rotation

## 💚 Dukung Proyek

Aplikasi ini dikembangkan untuk petani kecil dan gratis dipakai. Jika proyek ini bermanfaat, Anda bisa membeli kopi kecil penulis melalui:

- **Floating Widget** di sudut kanan bawah layar
- **Trakteer**: https://trakteer.id/perpus_opera

Scan QR Code di aplikasi untuk menraktir:

```
https://trakteer.id/perpus_opera?amount=6000
```

Dibuat dengan ❤️ oleh MZF - 2026

## 📄 Lisensi

Proyek ini dilisensikan bawah [MIT License](LICENSE).

## 👥 Kontributor

- **MZF** — Pengembangan aplikasi & desain

---

**TerraSiklus** — Rotasi tanaman cerdas & pemantauan kesehatan tanah untuk petani kecil.