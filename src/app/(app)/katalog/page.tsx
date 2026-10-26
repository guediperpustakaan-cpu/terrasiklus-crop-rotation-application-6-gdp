"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Leaf, Search } from "lucide-react";
import { apiGet, demandColor } from "@/lib/api";
import type { CropDTO } from "@/lib/types";
import { Badge, Input, Spinner } from "@/components/ui";

export default function CatalogPage() {
  const [q, setQ] = useState("");
  const [family, setFamily] = useState<string>("semua");

  const { data, isLoading } = useQuery({
    queryKey: ["crops"],
    queryFn: () => apiGet<CropDTO[]>("/api/crops"),
  });

  const families = useMemo(
    () => ["semua", ...Array.from(new Set((data ?? []).map((c) => c.familyName))).sort()],
    [data],
  );

  const filtered = useMemo(
    () =>
      (data ?? []).filter(
        (c) =>
          (family === "semua" || c.familyName === family) &&
          c.commonName.toLowerCase().includes(q.toLowerCase()),
      ),
    [data, q, family],
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-wide text-leaf-500 uppercase">
          Data Referensi
        </p>
        <h1 className="text-2xl font-extrabold text-leaf-900 sm:text-3xl">Katalog Tanaman</h1>
        <p className="mt-1 text-sm text-leaf-600">
          Komoditas dikelompokkan berdasarkan keluarga botani dan tingkat kebutuhan hara —
          dasar perhitungan rotasi TerraSiklus.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-leaf-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari komoditas, mis. tomat"
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {families.map((f) => (
          <button
            key={f}
            onClick={() => setFamily(f)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              family === f
                ? "border-leaf-600 bg-leaf-600 text-white"
                : "border-leaf-200 bg-white text-leaf-700 hover:bg-leaf-50"
            }`}
          >
            {f === "semua" ? "Semua Keluarga" : f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-leaf-900">{c.commonName}</h3>
                  <p className="text-xs text-leaf-500 italic">{c.familyName}</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-50 text-leaf-600">
                  <Leaf className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className={demandColor(c.nutrientDemand)}>Hara {c.nutrientDemand}</Badge>
                <Badge className="border-leaf-200 bg-white text-leaf-700">
                  {c.daysToHarvest ?? "-"} hari panen
                </Badge>
              </div>
              {c.notes ? <p className="mt-3 text-sm text-leaf-700">{c.notes}</p> : null}
            </div>
          ))}
          {!filtered.length ? (
            <p className="col-span-full py-10 text-center text-sm text-leaf-600">
              Tidak ada komoditas yang cocok dengan pencarian Anda.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
