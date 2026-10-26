"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Info, ShieldAlert, Sparkles, XCircle } from "lucide-react";
import type { Recommendation } from "@/lib/types";
import { Badge, Button } from "./ui";
import { demandColor } from "@/lib/api";

const STATUS_STYLE: Record<
  Recommendation["status"],
  { ring: string; badge: string; bar: string; icon: React.ElementType; label: string }
> = {
  direkomendasikan: {
    ring: "border-leaf-200",
    badge: "border-leaf-200 bg-leaf-50 text-leaf-700",
    bar: "bg-leaf-500",
    icon: CheckCircle2,
    label: "Direkomendasikan",
  },
  "hati-hati": {
    ring: "border-amber-200",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    bar: "bg-amber-500",
    icon: ShieldAlert,
    label: "Hati-hati",
  },
  hindari: {
    ring: "border-rose-200",
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    bar: "bg-rose-500",
    icon: XCircle,
    label: "Hindari",
  },
};

export function RotationEngine({
  recommendations,
  onPlan,
}: {
  recommendations: Recommendation[];
  onPlan: (cropId: number) => void;
}) {
  const [filter, setFilter] = useState<"semua" | Recommendation["status"]>("semua");
  const [expanded, setExpanded] = useState<number | null>(
    recommendations[0]?.cropId ?? null,
  );
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    const list =
      filter === "semua" ? recommendations : recommendations.filter((r) => r.status === filter);
    return showAll ? list : list.slice(0, 6);
  }, [recommendations, filter, showAll]);

  const counts = useMemo(
    () => ({
      direkomendasikan: recommendations.filter((r) => r.status === "direkomendasikan").length,
      "hati-hati": recommendations.filter((r) => r.status === "hati-hati").length,
      hindari: recommendations.filter((r) => r.status === "hindari").length,
    }),
    [recommendations],
  );

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-leaf-900">
            <Sparkles className="h-5 w-5 text-leaf-600" /> Rekomendasi Rotasi
          </h2>
          <p className="mt-1 text-sm text-leaf-600">
            Skor dihitung dari keluarga botani, kebutuhan hara, dan hasil uji tanah terakhir.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["semua", "direkomendasikan", "hati-hati", "hindari"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition ${
              filter === f
                ? "border-leaf-600 bg-leaf-600 text-white"
                : "border-leaf-200 bg-white text-leaf-700 hover:bg-leaf-50"
            }`}
          >
            {f === "semua" ? `Semua (${recommendations.length})` : `${f} (${counts[f]})`}
          </button>
        ))}
      </div>

      <ul className="mt-4 space-y-3">
        {filtered.map((r) => {
          const s = STATUS_STYLE[r.status];
          const Icon = s.icon;
          const open = expanded === r.cropId;
          return (
            <li key={r.cropId} className={`rounded-2xl border ${s.ring} bg-white p-4`}>
              <button
                className="flex w-full items-start justify-between gap-3 text-left"
                onClick={() => setExpanded(open ? null : r.cropId)}
              >
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-bold text-leaf-900">
                    {r.cropName}
                    <span className="text-xs font-normal text-leaf-500 italic">
                      {r.familyName}
                    </span>
                    <Badge className={demandColor(r.nutrientDemand)}>
                      Hara {r.nutrientDemand}
                    </Badge>
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-1.5 w-32 overflow-hidden rounded-full bg-leaf-100">
                      <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${r.score}%` }} />
                    </div>
                    <span className="text-xs font-bold text-leaf-800">Skor {r.score}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Badge className={s.badge}>
                    <Icon className="h-3.5 w-3.5" /> {s.label}
                  </Badge>
                  <ChevronDown
                    className={`h-4 w-4 text-leaf-400 transition ${open ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              {open ? (
                <div className="mt-3 space-y-2 border-t border-leaf-100 pt-3">
                  {r.reasons.map((reason, i) => (
                    <p key={i} className="flex items-start gap-2 text-sm text-leaf-700">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-leaf-400" />
                      {reason}
                    </p>
                  ))}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span className="text-xs text-leaf-600">
                      Perkiraan umur panen: {r.daysToHarvest ?? "-"} hari
                    </span>
                    <Button
                      variant={r.status === "hindari" ? "outline" : "primary"}
                      onClick={() => onPlan(r.cropId)}
                    >
                      Rencanakan Tanam
                    </Button>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {!showAll && recommendations.length > 6 ? (
        <button
          onClick={() => setShowAll(true)}
          className="mt-4 w-full rounded-xl border border-leaf-200 py-2.5 text-sm font-semibold text-leaf-700 transition hover:bg-leaf-50"
        >
          Tampilkan semua komoditas
        </button>
      ) : null}
    </div>
  );
}
