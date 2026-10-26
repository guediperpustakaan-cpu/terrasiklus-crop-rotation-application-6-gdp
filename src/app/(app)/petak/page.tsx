"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Grid2x2, Plus } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { PlotDTO } from "@/lib/types";
import { Button, EmptyState, Spinner } from "@/components/ui";
import { PlotCard } from "@/components/PlotCard";
import { PlotFormModal } from "@/components/PlotFormModal";

export default function PlotsPage() {
  const [modal, setModal] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["plots"],
    queryFn: () => apiGet<PlotDTO[]>("/api/plots"),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold tracking-wide text-leaf-500 uppercase">
            Manajemen Lahan
          </p>
          <h1 className="text-2xl font-extrabold text-leaf-900 sm:text-3xl">Petak Kebun</h1>
          <p className="mt-1 text-sm text-leaf-600">
            Kelola setiap bedengan: riwayat tanam, kesehatan tanah, dan rekomendasi rotasi.
          </p>
        </div>
        <Button onClick={() => setModal(true)}>
          <Plus className="h-4 w-4" /> Tambah Petak
        </Button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : data && data.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => (
            <PlotCard key={p.id} plot={p} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Grid2x2 className="h-6 w-6" />}
          title="Belum ada petak"
          description="Buat petak pertama Anda untuk mulai mencatat penanaman dan uji tanah."
          action={<Button onClick={() => setModal(true)}>Tambah Petak</Button>}
        />
      )}

      <PlotFormModal open={modal} onClose={() => setModal(false)} />
    </div>
  );
}
