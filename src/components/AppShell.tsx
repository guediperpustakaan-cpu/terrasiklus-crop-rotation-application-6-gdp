"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Leaf, Menu, Sprout, BookOpen, X } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dasbor", icon: LayoutDashboard },
  { href: "/petak", label: "Petak", icon: Sprout },
  { href: "/katalog", label: "Katalog Tanaman", icon: BookOpen },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7faf6]">
      <header className="sticky top-0 z-40 border-b border-leaf-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-600 text-white shadow-sm">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-leaf-900">
              Terra<span className="text-leaf-500">Siklus</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-leaf-100 text-leaf-800"
                      : "text-leaf-700 hover:bg-leaf-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <button
            className="rounded-lg p-2 text-leaf-700 transition hover:bg-leaf-50 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open ? (
          <nav className="border-t border-leaf-100 bg-white px-4 py-2 md:hidden">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-leaf-800 hover:bg-leaf-50"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        ) : null}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>

      <footer className="border-t border-leaf-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-leaf-600 sm:px-6">
          TerraSiklus — Rotasi tanaman cerdas & pemantauan kesehatan tanah untuk petani kecil.
        </div>
      </footer>
    </div>
  );
}
