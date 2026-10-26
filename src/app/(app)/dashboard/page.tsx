"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarClock,
  Droplets,
  FlaskConical,
  Grid2x2,
  MapPin,
  Plus,
  Scissors,
  Sprout,
  Repeat,
} from "lucide-react";
import { apiGet, formatDate } from "@/lib/api";
import type { DashboardDTO, NextAction } from "@/lib/types";
import { Button, EmptyState, Spinner } from "@/components/ui";
import { PlotCard } from "@/components/PlotCard";
import { PlotFormModal } from "@/components/PlotFormModal";

const ACTION_ICON: Record<NextAction["type"], React.ElementType> = {
  panen: Scissors,
  tanam: Sprout,
  "uji-tanah": FlaskConical,
  rotasi: Repeat,
};

const URGENCY: Record<NextAction["urgency"], string> = {
  tinggi: "border-rose-200 bg-rose-50 text-rose-700",
  sedang: "border-amber-200 bg-amber-50 text-amber-700",
  rendah: "border-leaf-200 bg-leaf-50 text-leaf-700",
};

export default function DashboardPage() {
  const [modal, setModal] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiGet<DashboardDTO>("/api/dashboard"),
  });

  if (isLoading || !data) return <Spinner />;

  const stats = [
    { label: "Total Petak", value: data.stats.totalPlots, icon: Grid2x2, suffix: "" },
    { label: "Sedang Ditanami", value: data.stats.activePlantings, icon: Sprout, suffix: "" },
    { label: "Total Luas", value: data.stats.totalArea.toFixed(1), icon: MapPin, suffix: " m²" },
    {
      label: "Rata-rata pH",
      value: data.stats.avgPh ?? "-",
      icon: Droplets,
      suffix: "",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold tracking-wide text-leaf-500 uppercase">Dasbor</p>
          <h1 className="text-2xl font-extrabold text-leaf-900 sm:text-3xl">
            {data.farm?.name ?? "Kebun Saya"}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-leaf-600">
            <MapPin className="h-4 w-4" />
            {data.farm?.location ?? "Lokasi belum diisi"}
          </p>
        </div>
        <Button onClick={() => setModal(true)}>
          <Plus className="h-4 w-4" /> Tambah Petak
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, suffix }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-leaf-600">{label}</span>
              <Icon className="h-4 w-4 text-leaf-400" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-leaf-900">
              {value}
              <span className="text-sm font-semibold text-leaf-500">{suffix}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-leaf-900">Tanaman Aktif</h2>
            <Link href="/petak" className="text-sm font-semibold text-leaf-600 hover:underline">
              Kelola petak
            </Link>
          </div>

          {data.activePlantings.length ? (
            <div className="space-y-3">
              {data.activePlantings.map((p) => (
                <Link
                  key={p.id}
                  href={`/petak/${p.plotId}`}
                  className="card block p-4 transition hover:border-leaf-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-leaf-900">
                        {p.cropName}{" "}
                        <span className="text-xs font-normal text-leaf-500 italic">
                          {p.familyName}
                        </span>
                      </p>
                      <p className="text-xs text-leaf-600">
                        {p.plotName} · ditanam {formatDate(p.plantedOn)}
                      </p>
                    </div>
                    <span className="flex items-center gap-1.5 rounded-full bg-leaf-50 px-3 py-1 text-xs font-semibold text-leaf-700">
                      <CalendarClock className="h-3.5 w-3.5" />
                      Perkiraan panen {formatDate(p.estimatedHarvest)}
                    </span>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-leaf-100">
                    <div
                      className={`h-full rounded-full ${p.progress >= 100 ? "bg-amber-500" : "bg-leaf-500"}`}
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-right text-xs text-leaf-600">
                    {p.progress}% menuju panen
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Sprout className="h-6 w-6" />}
              title="Belum ada tanaman aktif"
              description="Catat penanaman baru pada salah satu petak untuk mulai memantau musim tanam."
              action={
                <Link href="/petak">
                  <Button variant="outline">Pilih Petak</Button>
                </Link>
              }
            />
          )}

          <h2 className="pt-2 text-lg font-bold text-leaf-900">Petak Kebun</h2>
          {data.plots.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {data.plots.map((plot) => (
                <PlotCard key={plot.id} plot={plot} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Grid2x2 className="h-6 w-6" />}
              title="Belum ada petak"
              description="Tambahkan petak pertama Anda untuk mulai merencanakan rotasi tanaman."
              action={<Button onClick={() => setModal(true)}>Tambah Petak</Button>}
            />
          )}
        </section>

        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-leaf-900">
            <AlertTriangle className="h-5 w-5 text-amber-500" /> Aksi Berikutnya
          </h2>
          {data.nextActions.length ? (
            <ul className="space-y-3">
              {data.nextActions.map((a, i) => {
                const Icon = ACTION_ICON[a.type];
                return (
                  <li key={i}>
                    <Link
                      href={`/petak/${a.plotId}`}
                      className={`block rounded-2xl border p-4 transition hover:shadow-sm ${URGENCY[a.urgency]}`}
                    >
                      <p className="flex items-center gap-2 text-sm font-bold">
                        <Icon className="h-4 w-4" /> {a.title}
                      </p>
                      <p className="mt-1 text-xs opacity-90">{a.detail}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="card p-6 text-center text-sm text-leaf-600">
              Semua terkendali 🌿 Tidak ada aksi mendesak saat ini.
            </div>
          )}
        </section>
      </div>

      <PlotFormModal open={modal} onClose={() => setModal(false)} />
    </div>
  );
}
