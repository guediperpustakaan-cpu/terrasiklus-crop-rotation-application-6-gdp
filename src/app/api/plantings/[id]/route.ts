import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { plantings } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as {
    harvestedOn?: string | null;
    notes?: string | null;
  };
  const updated = (
    await db
      .update(plantings)
      .set({
        ...(body.harvestedOn !== undefined ? { harvestedOn: body.harvestedOn || null } : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
      })
      .where(eq(plantings.id, Number(id)))
      .returning()
  )[0];
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await db.delete(plantings).where(eq(plantings.id, Number(id)));
  return NextResponse.json({ ok: true });
}
