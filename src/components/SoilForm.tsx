"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiSend, today } from "@/lib/api";
import { Button, Field, Input, Modal, Textarea } from "./ui";

interface Props {
  plotId: number;
  open: boolean;
  onClose: () => void;
}

export function SoilForm({ plotId, open, onClose }: Props) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    testedOn: today(),
    ph: "",
    n: "",
    p: "",
    k: "",
    organicMatter: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const mutation = useMutation({
    mutationFn: () => apiSend("/api/soil-tests", "POST", { plotId, ...form }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plot", plotId] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      onClose();
    },
    onError: (e: Error) => setError(e.message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Catat Hasil Uji Tanah"
      description="Data ini dipakai mesin rotasi untuk menyesuaikan rekomendasi komoditas."
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <Field label="Tanggal Uji">
          <Input type="date" value={form.testedOn} onChange={set("testedOn")} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="pH Tanah" hint="Ideal 6,0 – 7,0">
            <Input type="number" step="0.1" min="0" max="14" value={form.ph} onChange={set("ph")} placeholder="6.5" />
          </Field>
          <Field label="Bahan Organik (%)" hint="Ideal > 3%">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.organicMatter}
              onChange={set("organicMatter")}
              placeholder="3.2"
            />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="N (%)">
            <Input type="number" step="0.01" min="0" value={form.n} onChange={set("n")} placeholder="0.18" />
          </Field>
          <Field label="P (ppm)">
            <Input type="number" step="0.1" min="0" value={form.p} onChange={set("p")} placeholder="22" />
          </Field>
          <Field label="K (ppm)">
            <Input type="number" step="0.1" min="0" value={form.k} onChange={set("k")} placeholder="150" />
          </Field>
        </div>
        <Field label="Catatan">
          <Textarea
            rows={3}
            value={form.notes}
            onChange={set("notes")}
            placeholder="Mis. sudah ditambah pupuk kandang 2 karung."
          />
        </Field>

        {error ? (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        ) : null}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="soil" disabled={mutation.isPending}>
            {mutation.isPending ? "Menyimpan..." : "Simpan Uji Tanah"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
