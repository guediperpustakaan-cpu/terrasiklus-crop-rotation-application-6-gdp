"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  FlaskConical,
  History,
  Layers,
  Plus,
  Scissors,
  Sprout,
  Trash2,
} from "lucide-react";
import { apiGet, apiSend, demandColor, formatDate, today } from "@/lib/api";
import type { PlotDetailDTO } from "@/lib/types";
import { Badge, Button, EmptyState, Spinner } from "@/components/ui";
import { RotationEngine } from "@/components/RotationEngine";
import { SoilForm } from "@/components/SoilForm";
import { PlantingForm } from "@/components/PlantingForm";

const soilMetric = (
  label: string,
  value: number | null,
  unit: string,
  status: "baik" | "waspada" | "netral",
) => ({ label, value, unit, status });

export default function PlotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const plotId = Number(id);
  const qc = useQueryClient();

  const [soilOpen, setSoilOpen] = useState(false);
  const [plantOpen, setPlantOpen] = useState(false);
  const [preselect, setPreselect] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["plot", plotId],
    queryFn: () => apiGet<PlotDetailDTO>(`/api/plots/${plotId}`),
  });

  const harvest = useMutation({
    mutationFn: (plantingId: number) =>
      apiSend(`/api/plantings/${plantingId}`, "PATCH", { harvestedOn: today() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plot", plotId] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const removePlanting = useMutation({
    mutationFn: (plantingId: number) => apiSend(`/api/plantings/${plantingId}`, "DELETE"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plot", plotId] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  if (isLoading || !data) return <Spinner />;

  const { plot, history, soilTests, crops, recommendations } = data;
  const soil = soilTests[0] ?? null;

  const metrics = soil
    ? [
        soilMetric(
          "pH",
          soil.ph,
          "",
          soil.ph === null ? "netral" : soil.ph >= 5.8 && soil.ph <= 7.2 ? "baik" : "waspada",
        ),
        soilMetric(
          "Nitrogen",
          soil.n,
          "%",
          soil.n === null ? "netral" : soil.n >= 0.12 ? "baik" : "waspada",
        ),
        soilMetric(
          "Fosfor",
          soil.p,
          " ppm",
          soil.p === null ? "netral" : soil.p >= 15 ? "baik" : "waspada",
        ),
        soilMetric(
          "Kalium",
          soil.k,
          " ppm",
          soil.k === null ? "netral" : soil.k >= 100 ? "baik" : "waspada",
        ),
        soilMetric(
          "Bahan Organik",
          soil.organicMatter,
          "%",
          soil.organicMatter === null ? "netral" : soil.organicMatter >= 2.5 ? "baik" : "waspada",
        ),
      ]
    : [];

  return (
    <div className="space-y-6">
      <Link
        href="/petak"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-leaf-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke daftar petak
      </Link>

      <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-leaf-900">{plot.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-leaf-600">
            <span className="inline-flex items-center gap-1.5">
              <Layers className="h-4 w-4" /> {plot.area ? `${plot.area} m²` : "Luas belum diisi"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              🪨 {plot.soilType ?? "Jenis tanah belum diisi"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <History className="h-4 w-4" /> {history.length} riwayat tanam
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setSoilOpen(true)}>
            <FlaskConical className="h-4 w-4" /> Uji Tanah
          </Button>
          <Button
            onClick={() => {
              setPreselect(null);
              setPlantOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Catat Tanam
          </Button>
        </div>
      </div>

      {plot.activePlanting ? (
        <div className="card flex flex-col gap-3 border-leaf-300 bg-leaf-50/50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge className="border-leaf-300 bg-white text-leaf-700">Sedang Ditanami</Badge>
            <p className="mt-2 text-lg font-bold text-leaf-900">
              {plot.activePlanting.cropName}{" "}
              <span className="text-sm font-normal text-leaf-600 italic">
                {plot.activePlanting.familyName}
              </span>
            </p>
            <p className="text-sm text-leaf-700">
              Ditanam {formatDate(plot.activePlanting.plantedOn)} · perkiraan umur{" "}
              {plot.activePlanting.daysToHarvest ?? "-"} hari
            </p>
          </div>
          <Button
            variant="soil"
            disabled={harvest.isPending}
            onClick={() => harvest.mutate(plot.activePlanting!.id)}
          >
            <Scissors className="h-4 w-4" /> Tandai Sudah Panen
          </Button>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <RotationEngine
            recommendations={recommendations}
            onPlan={(cropId) => {
              setPreselect(cropId);
              setPlantOpen(true);
            }}
          />

          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-leaf-900">
              <History className="h-5 w-5 text-leaf-600" /> Riwayat Tanam
            </h2>
            {history.length ? (
              <ol className="mt-4 space-y-3 border-l-2 border-leaf-100 pl-4">
                {history.map((h) => (
                  <li key={h.id} className="relative">
                    <span className="absolute top-2 -left-[21px] h-2.5 w-2.5 rounded-full bg-leaf-500" />
                    <div className="rounded-xl border border-leaf-100 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-leaf-900">
                          {h.cropName}{" "}
                          <span className="text-xs font-normal text-leaf-500 italic">
                            {h.familyName}
                          </span>
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge className={demandColor(h.nutrientDemand)}>
                            Hara {h.nutrientDemand}
                          </Badge>
                          <button
                            aria-label="Hapus riwayat"
                            onClick={() => removePlanting.mutate(h.id)}
                            className="rounded-lg p-1.5 text-leaf-400 transition hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-leaf-600">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(h.plantedOn)} →{" "}
                        {h.harvestedOn ? formatDate(h.harvestedOn) : "belum panen"}
                      </p>
                      {h.notes ? (
                        <p className="mt-2 rounded-lg bg-soil-50 px-2.5 py-1.5 text-xs text-soil-700">
                          {h.notes}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="mt-4">
                <EmptyState
                  icon={<Sprout className="h-6 w-6" />}
                  title="Belum ada riwayat"
                  description="Catat penanaman pertama agar mesin rotasi dapat bekerja."
                  action={<Button onClick={() => setPlantOpen(true)}>Catat Tanam</Button>}
                />
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-leaf-900">
                <FlaskConical className="h-5 w-5 text-soil-500" /> Kesehatan Tanah
              </h2>
              <Button variant="ghost" onClick={() => setSoilOpen(true)}>
                <Plus className="h-4 w-4" /> Catat
              </Button>
            </div>

            {soil ? (
              <>
                <p className="mt-1 text-xs text-leaf-600">
                  Uji terakhir: {formatDate(soil.testedOn)}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-3">
                  {metrics.map((m) => (
                    <div
                      key={m.label}
                      className={`rounded-xl border p-3 ${
                        m.status === "baik"
                          ? "border-leaf-200 bg-leaf-50"
                          : m.status === "waspada"
                            ? "border-amber-200 bg-amber-50"
                            : "border-leaf-100 bg-white"
                      }`}
                    >
                      <dt className="text-xs text-leaf-600">{m.label}</dt>
                      <dd className="text-lg font-bold text-leaf-900">
                        {m.value ?? "-"}
                        <span className="text-xs font-semibold text-leaf-500">{m.unit}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
                {soil.notes ? (
                  <p className="mt-3 rounded-xl bg-soil-50 p-3 text-xs text-soil-700">
                    {soil.notes}
                  </p>
                ) : null}

                {soilTests.length > 1 ? (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold text-leaf-700 uppercase">
                      Riwayat uji
                    </p>
                    <ul className="space-y-2">
                      {soilTests.slice(1).map((t) => (
                        <li
                          key={t.id}
                          className="flex items-center justify-between rounded-xl border border-leaf-100 px-3 py-2 text-xs text-leaf-700"
                        >
                          <span>{formatDate(t.testedOn)}</span>
                          <span>
                            pH {t.ph ?? "-"} · N {t.n ?? "-"}% · BO {t.organicMatter ?? "-"}%
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="mt-4">
                <EmptyState
                  icon={<FlaskConical className="h-6 w-6" />}
                  title="Belum ada uji tanah"
                  description="Masukkan hasil uji pH dan NPK untuk rekomendasi yang lebih akurat."
                  action={
                    <Button variant="soil" onClick={() => setSoilOpen(true)}>
                      Catat Uji Tanah
                    </Button>
                  }
                />
              </div>
            )}
          </section>

          <section className="card bg-leaf-50/50 p-5">
            <h3 className="font-bold text-leaf-900">Prinsip Rotasi TerraSiklus</h3>
            <ul className="mt-3 space-y-2 text-sm text-leaf-700">
              <li>🌿 Hindari menanam keluarga botani yang sama berturut-turut.</li>
              <li>🫘 Setelah tanaman rakus hara, tanam polong (Fabaceae) pengikat nitrogen.</li>
              <li>🧪 Jaga pH tanah 6,0–7,0 dan bahan organik di atas 3%.</li>
              <li>⏳ Beri jeda minimal 24 bulan sebelum mengulang keluarga yang sama.</li>
            </ul>
          </section>
        </div>
      </div>

      <SoilForm plotId={plotId} open={soilOpen} onClose={() => setSoilOpen(false)} />
      <PlantingForm
        plotId={plotId}
        crops={crops}
        history={history}
        open={plantOpen}
        initialCropId={preselect}
        onClose={() => setPlantOpen(false)}
      />
    </div>
  );
}
