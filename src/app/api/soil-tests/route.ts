import { NextResponse } from "next/server";
import { db } from "@/db";
import { soilTests } from "@/db/schema";
import { getSoilTests } from "@/lib/data";

export const dynamic = "force-dynamic";

const toNumeric = (v: unknown): string | null =>
  v === null || v === undefined || v === "" ? null : String(v);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const plotId = searchParams.get("plotId");
  if (!plotId) return NextResponse.json({ error: "plotId wajib" }, { status: 400 });
  return NextResponse.json(await getSoilTests(Number(plotId)));
}

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  const plotId = Number(body.plotId);
  const testedOn = String(body.testedOn ?? "");
  if (!plotId || !testedOn) {
    return NextResponse.json({ error: "Petak dan tanggal uji wajib diisi" }, { status: 400 });
  }
  const created = (
    await db
      .insert(soilTests)
      .values({
        plotId,
        testedOn,
        ph: toNumeric(body.ph),
        n: toNumeric(body.n),
        p: toNumeric(body.p),
        k: toNumeric(body.k),
        organicMatter: toNumeric(body.organicMatter),
        notes: (body.notes as string)?.trim() || null,
      })
      .returning()
  )[0];
  return NextResponse.json(created, { status: 201 });
}
