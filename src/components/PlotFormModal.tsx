"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiSend } from "@/lib/api";
import { Button, Field, Input, Modal, Select } from "./ui";

const SOIL_TYPES = [
  "Lempung",
  "Lempung berpasir",
  "Lempung berliat",
  "Tanah liat",
  "Tanah berpasir",
  "Tanah gambut",
  "Tanah vulkanik",
];

export function PlotFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [soilType, setSoilType] = useState(SOIL_TYPES[0]);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => apiSend("/api/plots", "POST", { name, area, soilType }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["plots"] });
      setName("");
      setArea("");
      setError(null);
      onClose();
    },
    onError: (e: Error) => setError(e.message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tambah Petak Baru"
      description="Setiap petak dipantau riwayat tanam dan kesehatan tanahnya secara terpisah."
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return setError("Nama petak wajib diisi");
          mutation.mutate();
        }}
      >
        <Field label="Nama Petak">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Petak D — Bedengan Utara"
          />
        </Field>
        <Field label="Luas (m²)">
          <Input
            type="number"
            step="0.01"
            min="0"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="12.5"
          />
        </Field>
        <Field label="Jenis Tanah">
          <Select value={soilType} onChange={(e) => setSoilType(e.target.value)}>
            {SOIL_TYPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>

        {error ? (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Menyimpan..." : "Simpan Petak"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
