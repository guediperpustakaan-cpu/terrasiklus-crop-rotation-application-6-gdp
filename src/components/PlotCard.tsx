"use client";

import Link from "next/link";
import { ArrowUpRight, FlaskConical, Layers, Sprout } from "lucide-react";
import type { PlotDTO } from "@/lib/types";
import { Badge } from "./ui";
import { demandColor, formatDate } from "@/lib/api";

export function PlotCard({ plot }: { plot: PlotDTO }) {
  const active = plot.activePlanting;
  const soil = plot.latestSoilTest;

  return (
    <Link
      href={`/petak/${plot.id}`}
      className="group card flex flex-col gap-4 p-5 transition hover:-translate-y-0.5 hover:border-leaf-300 hover:shadow-lg hover:shadow-leaf-900/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-leaf-900">
            {plot.name}
            <ArrowUpRight className="h-4 w-4 text-leaf-400 transition group-hover:translate-x-0.5 group-hover:text-leaf-600" />
          </h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-leaf-600">
            <span className="inline-flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" />
              {plot.area ? `${plot.area} m²` : "Luas belum diisi"}
            </span>
            <span>·</span>
            <span>{plot.soilType ?? "Jenis tanah belum diisi"}</span>
          </p>
        </div>
        <Badge
          className={
            active
              ? "border-leaf-200 bg-leaf-50 text-leaf-700"
              : "border-soil-200 bg-soil-50 text-soil-700"
          }
        >
          {active ? "Ditanami" : "Kosong"}
        </Badge>
      </div>

      <div className="rounded-xl bg-leaf-50/60 p-3">
        {active ? (
          <>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-leaf-900">
              <Sprout className="h-4 w-4 text-leaf-600" />
              {active.cropName}
              <span className="text-xs font-normal text-leaf-600 italic">
                ({active.familyName})
              </span>
            </p>
            <p className="mt-1 text-xs text-leaf-600">
              Ditanam {formatDate(active.plantedOn)} ·{" "}
              <span className={`rounded px-1.5 py-0.5 ${demandColor(active.nutrientDemand)}`}>
                Hara {active.nutrientDemand}
              </span>
            </p>
          </>
        ) : plot.lastPlanting ? (
          <p className="text-xs text-leaf-700">
            Terakhir ditanami <b>{plot.lastPlanting.cropName}</b> ({plot.lastPlanting.familyName}),
            panen {formatDate(plot.lastPlanting.harvestedOn)}. Siap untuk rotasi berikutnya.
          </p>
        ) : (
          <p className="text-xs text-leaf-700">Belum ada riwayat tanam pada petak ini.</p>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-leaf-600">
        <span className="inline-flex items-center gap-1.5">
          <FlaskConical className="h-3.5 w-3.5" />
          {soil ? `pH ${soil.ph ?? "-"} · N ${soil.n ?? "-"}% · BO ${soil.organicMatter ?? "-"}%` : "Belum ada uji tanah"}
        </span>
        <span>{plot.plantingCount} riwayat</span>
      </div>
    </Link>
  );
}
