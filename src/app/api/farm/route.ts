import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { farms } from "@/db/schema";
import { getDefaultFarm } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getDefaultFarm());
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as { name?: string; location?: string };
  const farm = await getDefaultFarm();
  if (!farm) return NextResponse.json({ error: "Kebun tidak ditemukan" }, { status: 404 });
  const updated = (
    await db
      .update(farms)
      .set({
        name: body.name?.trim() || farm.name,
        location: body.location?.trim() ?? farm.location,
      })
      .where(eq(farms.id, farm.id))
      .returning()
  )[0];
  return NextResponse.json(updated);
}
