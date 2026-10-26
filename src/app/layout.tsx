import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "TerraSiklus — Kalkulator Rotasi Tanaman & Kesehatan Tanah",
  description:
    "Rencanakan rotasi tanaman berdasarkan keluarga botani dan riwayat tanah untuk mencegah hama serta mengoptimalkan hara.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
