export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error ?? "Gagal memuat data");
  return res.json() as Promise<T>;
}

export async function apiSend<T>(
  url: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error((data as { error?: string })?.error ?? "Terjadi kesalahan") as Error & {
      payload?: unknown;
      status?: number;
    };
    err.payload = data;
    err.status = res.status;
    throw err;
  }
  return data as T;
}

export const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const today = () => new Date().toISOString().slice(0, 10);

export const demandColor = (d: string) =>
  d === "tinggi"
    ? "bg-rose-50 text-rose-700 border-rose-200"
    : d === "sedang"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-leaf-50 text-leaf-700 border-leaf-200";
