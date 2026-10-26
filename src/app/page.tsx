import Link from "next/link";
import {
  ArrowRight,
  Bug,
  CalendarCheck,
  FlaskConical,
  Leaf,
  LineChart,
  Sprout,
  Repeat,
} from "lucide-react";

const FEATURES = [
  {
    icon: Repeat,
    title: "Mesin Rotasi Cerdas",
    desc: "Rekomendasi otomatis berdasarkan keluarga botani tanaman musim sebelumnya agar siklus hama terputus.",
  },
  {
    icon: FlaskConical,
    title: "Pelacak Kesehatan Tanah",
    desc: "Catat pH, Nitrogen, Fosfor, Kalium, dan bahan organik untuk setiap petak dan pantau trennya.",
  },
  {
    icon: Bug,
    title: "Peringatan Hama Dini",
    desc: "Peringatan otomatis jika Anda menanam keluarga yang sama terlalu cepat di petak yang sama.",
  },
  {
    icon: CalendarCheck,
    title: "Daftar Aksi Berikutnya",
    desc: "Tahu persis kapan waktunya panen, menanam ulang, atau menguji tanah kembali.",
  },
];

const STEPS = [
  { n: "01", t: "Buat Petak", d: "Daftarkan kebun dan petak-petak Anda lengkap dengan luas serta jenis tanah." },
  { n: "02", t: "Catat Tanam", d: "Rekam apa yang ditanam, kapan ditanam, dan catatan hama atau penyakit." },
  { n: "03", t: "Dapatkan Rotasi", d: "Mesin TerraSiklus menilai seluruh katalog dan memberi skor rotasi beserta alasannya." },
  { n: "04", t: "Pantau Tanah", d: "Perbarui hasil uji tanah agar rekomendasi makin presisi tiap musim." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f7faf6]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-600 text-white">
            <Leaf className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-leaf-900">
            Terra<span className="text-leaf-500">Siklus</span>
          </span>
        </div>
        <Link
          href="/dashboard"
          className="rounded-xl bg-leaf-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-leaf-700"
        >
          Buka Dasbor
        </Link>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-leaf-200/50 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -left-20 h-72 w-72 rounded-full bg-soil-200/40 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-leaf-200 bg-white px-3 py-1 text-xs font-semibold text-leaf-700">
              <Sprout className="h-3.5 w-3.5" /> Untuk petani kecil & pekebun rumahan
            </span>
            <h1 className="mt-5 text-4xl leading-tight font-extrabold tracking-tight text-leaf-900 sm:text-5xl">
              Rotasi tanaman yang <span className="text-leaf-600">sehat</span>, tanah yang{" "}
              <span className="text-soil-500">subur</span>.
            </h1>
            <p className="mt-5 max-w-xl text-base text-leaf-700/90 sm:text-lg">
              TerraSiklus membantu Anda merencanakan musim tanam berdasarkan keluarga botani dan
              riwayat tanah—mencegah ledakan hama, menghemat pupuk, dan menjaga kesuburan petak
              Anda dari musim ke musim.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-leaf-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-leaf-700"
              >
                Mulai Sekarang <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/katalog"
                className="inline-flex items-center gap-2 rounded-xl border border-leaf-300 bg-white px-5 py-3 text-sm font-semibold text-leaf-700 transition hover:bg-leaf-50"
              >
                Lihat Katalog Tanaman
              </Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
              {[
                { k: "27+", v: "Komoditas" },
                { k: "11", v: "Keluarga botani" },
                { k: "100%", v: "Gratis dipakai" },
              ].map((s) => (
                <div key={s.v} className="rounded-2xl border border-leaf-100 bg-white p-4">
                  <dt className="text-2xl font-extrabold text-leaf-700">{s.k}</dt>
                  <dd className="text-xs text-leaf-600">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="animate-fade-up rounded-3xl border border-leaf-100 bg-white p-6 shadow-xl shadow-leaf-900/5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-leaf-900">Petak A · Musim Berikutnya</h3>
              <span className="rounded-full bg-leaf-100 px-2.5 py-1 text-xs font-semibold text-leaf-700">
                Analisis rotasi
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { n: "Kacang Panjang", f: "Fabaceae", s: 94, c: "bg-leaf-500", t: "Mengikat nitrogen setelah tomat yang rakus hara." },
                { n: "Bawang Merah", f: "Amaryllidaceae", s: 81, c: "bg-leaf-400", t: "Keluarga berbeda, kebutuhan hara rendah." },
                { n: "Tomat", f: "Solanaceae", s: 18, c: "bg-rose-400", t: "Keluarga sama dengan musim lalu — risiko hama tinggi." },
              ].map((r) => (
                <div key={r.n} className="rounded-2xl border border-leaf-100 bg-leaf-50/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-leaf-900">{r.n}</p>
                      <p className="text-xs text-leaf-600 italic">{r.f}</p>
                    </div>
                    <span className="text-sm font-bold text-leaf-800">{r.s}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-leaf-100">
                    <div className={`h-full rounded-full ${r.c}`} style={{ width: `${r.s}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-leaf-700">{r.t}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-soil-50 p-3 text-xs text-soil-700">
              <LineChart className="h-4 w-4 shrink-0" />
              Uji tanah terakhir: pH 6,3 · N 0,18% · Bahan organik 3,1%
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-center text-2xl font-extrabold text-leaf-900 sm:text-3xl">
          Semua yang Anda butuhkan untuk satu musim tanam
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-leaf-100 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-leaf-900/5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-50 text-leaf-600">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-bold text-leaf-900">{title}</h3>
              <p className="mt-1.5 text-sm text-leaf-700/90">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-extrabold text-leaf-900 sm:text-3xl">
            Cara kerjanya
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl bg-leaf-50/70 p-5">
                <span className="text-3xl font-extrabold text-leaf-300">{s.n}</span>
                <h3 className="mt-2 font-bold text-leaf-900">{s.t}</h3>
                <p className="mt-1 text-sm text-leaf-700/90">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="rounded-3xl bg-leaf-700 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Siap merencanakan musim depan?</h2>
          <p className="mx-auto mt-3 max-w-xl text-leaf-100">
            Catat petak Anda hari ini dan biarkan TerraSiklus menyusun rotasi terbaik beserta
            alasan agronomisnya.
          </p>
          <Link
            href="/dashboard"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-leaf-800 transition hover:bg-leaf-50"
          >
            Buka Dasbor <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-leaf-100 bg-white py-6 text-center text-xs text-leaf-600">
        © {new Date().getFullYear()} TerraSiklus · Dibuat untuk pertanian berkelanjutan.
      </footer>
    </div>
  );
}
