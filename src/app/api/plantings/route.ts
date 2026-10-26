import { NextResponse } from "next/server";
import { db } from "@/db";
import { plantings } from "@/db/schema";
import { getCrops, getPlantings } from "@/lib/data";
import { checkRotation } from "@/lib/rotation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const plotId = searchParams.get("plotId");
  return NextResponse.json(await getPlantings(plotId ? Number(plotId) : undefined));
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    plotId?: number;
    cropId?: number;
    plantedOn?: string;
    harvestedOn?: string | null;
    notes?: string | null;
    force?: boolean;
  };

  if (!body.plotId || !body.cropId || !body.plantedOn) {
    return NextResponse.json(
      { error: "Petak, komoditas, dan tanggal tanam wajib diisi" },
      { status: 400 },
    );
  }

  const crops = await getCrops();
  const crop = crops.find((c) => c.id === body.cropId);
  if (!crop) return NextResponse.json({ error: "Komoditas tidak ditemukan" }, { status: 400 });

  const history = await getPlantings(body.plotId);
  const check = checkRotation(crop, history);

  if (check.status === "bahaya" && !body.force) {
    return NextResponse.json({ blocked: true, check }, { status: 409 });
  }

  const created = (
    await db
      .insert(plantings)
      .values({
        plotId: body.plotId,
        cropId: body.cropId,
        plantedOn: body.plantedOn,
        harvestedOn: body.harvestedOn || null,
        notes: body.notes?.trim() || null,
      })
      .returning()
  )[0];

  return NextResponse.json({ planting: created, check }, { status: 201 });
}
