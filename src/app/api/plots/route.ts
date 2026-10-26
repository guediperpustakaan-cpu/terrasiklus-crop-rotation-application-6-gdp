import { NextResponse } from "next/server";
import { db } from "@/db";
import { plots } from "@/db/schema";
import { getDefaultFarm, getPlots } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const farm = await getDefaultFarm();
  if (!farm) return NextResponse.json([]);
  return NextResponse.json(await getPlots(farm.id));
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    area?: number | string | null;
    soilType?: string | null;
  };
  if (!body.name || !body.name.trim()) {
    return NextResponse.json({ error: "Nama petak wajib diisi" }, { status: 400 });
  }
  const farm = await getDefaultFarm();
  if (!farm) return NextResponse.json({ error: "Kebun tidak ditemukan" }, { status: 400 });

  const created = (
    await db
      .insert(plots)
      .values({
        farmId: farm.id,
        name: body.name.trim(),
        area: body.area !== undefined && body.area !== null && body.area !== ""
          ? String(body.area)
          : null,
        soilType: body.soilType?.trim() || null,
      })
      .returning()
  )[0];
  return NextResponse.json(created, { status: 201 });
}
