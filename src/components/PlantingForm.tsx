"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { apiSend, today } from "@/lib/api";
import type { CropDTO, PlantingDTO } from "@/lib/types";
import { checkRotation } from "@/lib/rotation";
import { Button, Field, Input, Modal, Select, Textarea } from "./ui";

interface Props {
  plotId: number;
  crops: CropDTO[];
  history: PlantingDTO[];
  open: boolean;
  onClose: () => void;
  initialCropId?: number | null;
}

export function PlantingForm({
  plotId,
  crops,
  history,
  open,
  onClose,
  initialCropId,
}: Props) {
  const qc = useQueryClient();
  const [cropId, setCropId] = useState<number | "">("");
  const [plantedOn, setPlantedOn] = useState(today());
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [force, setForce] = useState(false);

  useEffect(() => {
    if (open) {
      setCropId(initialCropId ?? crops[0]?.id ?? "");
      setPlantedOn(today());
      setNotes("");
      setError(null);
      setForce(false);
    }
  }, [open, initialCropId, crops]);

  const selected = crops.find((c) => c.id === cropId) ?? null;
  const check = useMemo(
    () => (selected ? checkRotation(selected, history) : null),
    [selected, history],
  );

  const mutation = useMutation({
    mutationFn: () =>
      apiSend("/api/plantings", "POST", { plotId, cropId, plantedOn, notes, force: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plot", plotId] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["plots"] });
      onClose();
    },
    onError: (e: Error) => setError(e.message),
  });

  const blocked = check?.status === "bahaya" && !force;

  const grouped = useMemo(() => {
    const map = new Map<string, CropDTO[]>();
    crops.forEach((c) => {
      const arr = map.get(c.familyName) ?? [];
      arr.push(c);
      map.set(c.familyName, arr);
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [crops]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Catat Penanaman"
      description="Mesin rotasi akan memeriksa riwayat petak ini sebelum menyimpan."
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!cropId) return setError("Pilih komoditas terlebih dahulu");
          if (blocked) return;
          mutation.mutate();
        }}
      >
        <Field label="Komoditas">
          <Select value={cropId} onChange={(e) => setCropId(Number(e.target.value))}>
            {grouped.map(([family, list]) => (
              <optgroup key={family} label={family}>
                {list.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.commonName} — hara {c.nutrientDemand}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
        </Field>

        <Field label="Tanggal Tanam">
          <Input type="date" value={plantedOn} onChange={(e) => setPlantedOn(e.target.value)} />
        </Field>

        <Field label="Catatan (hama/penyakit/perlakuan)">
          <Textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Mis. ditemukan kutu kebul, dipasang perangkap kuning."
          />
        </Field>

        {check ? (
          <div
            className={`rounded-2xl border p-4 text-sm ${
              check.status === "aman"
                ? "border-leaf-200 bg-leaf-50 text-leaf-800"
                : check.status === "peringatan"
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            <p className="flex items-start gap-2 font-semibold">
              {check.status === "aman" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : check.status === "peringatan" ? (
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              {check.message}
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs opacity-90">
              {check.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
            {check.status === "bahaya" ? (
              <label className="mt-3 flex items-center gap-2 text-xs font-medium">
                <input
                  type="checkbox"
                  checked={force}
                  onChange={(e) => setForce(e.target.checked)}
                  className="h-4 w-4 rounded border-rose-300"
                />
                Saya memahami risikonya dan tetap ingin menanam.
              </label>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        ) : null}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" disabled={mutation.isPending || blocked}>
            {mutation.isPending ? "Menyimpan..." : "Simpan Penanaman"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
