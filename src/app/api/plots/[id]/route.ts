import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { plots } from "@/db/schema";
import { getCrops, getPlantings, getPlot, getSoilTests } from "@/lib/data";
import { recommendCrops } from "@/lib/rotation";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const plotId = Number(id);
  const plot = await getPlot(plotId);
  if (!plot) return NextResponse.json({ error: "Petak tidak ditemukan" }, { status: 404 });

  const [history, soil, crops] = await Promise.all([
    getPlantings(plotId),
    getSoilTests(plotId),
    getCrops(),
  ]);
  const recommendations = recommendCrops(crops, history, soil[0] ?? null);

  return NextResponse.json({ plot, history, soilTests: soil, crops, recommendations });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as {
    name?: string;
    area?: string | number | null;
    soilType?: string | null;
  };
  const updated = (
    await db
      .update(plots)
      .set({
        ...(body.name ? { name: body.name.trim() } : {}),
        ...(body.area !== undefined
          ? { area: body.area === null || body.area === "" ? null : String(body.area) }
          : {}),
        ...(body.soilType !== undefined ? { soilType: body.soilType || null } : {}),
      })
      .where(eq(plots.id, Number(id)))
      .returning()
  )[0];
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await db.delete(plots).where(eq(plots.id, Number(id)));
  return NextResponse.json({ ok: true });
}
