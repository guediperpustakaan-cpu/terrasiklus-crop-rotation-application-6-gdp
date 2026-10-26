import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  crops,
  farms,
  plantFamilies,
  plantings,
  plots,
  profiles,
  soilTests,
} from "@/db/schema";
import type {
  CropDTO,
  DashboardDTO,
  FarmDTO,
  NextAction,
  NutrientDemand,
  PlantingDTO,
  PlotDTO,
  SoilTestDTO,
} from "./types";

const num = (v: string | number | null): number | null =>
  v === null || v === undefined ? null : Number(v);

const toDateStr = (v: unknown): string =>
  typeof v === "string" ? v : new Date(v as string).toISOString().slice(0, 10);

export async function getDefaultFarm(): Promise<FarmDTO | null> {
  const rows = await db.select().from(farms).orderBy(asc(farms.id)).limit(1);
  if (rows.length) {
    const f = rows[0];
    return { id: f.id, name: f.name, location: f.location, ownerId: f.ownerId };
  }
  // buat profil + kebun default
  let owner = (await db.select().from(profiles).orderBy(asc(profiles.id)).limit(1))[0];
  if (!owner) {
    owner = (await db.insert(profiles).values({ username: "petani_demo" }).returning())[0];
  }
  const created = (
    await db
      .insert(farms)
      .values({ ownerId: owner.id, name: "Kebun Saya", location: "Indonesia" })
      .returning()
  )[0];
  return { id: created.id, name: created.name, location: created.location, ownerId: created.ownerId };
}

export async function getCrops(): Promise<CropDTO[]> {
  const rows = await db
    .select({
      id: crops.id,
      commonName: crops.commonName,
      familyId: crops.familyId,
      familyName: plantFamilies.name,
      nutrientDemand: crops.nutrientDemand,
      daysToHarvest: crops.daysToHarvest,
      notes: crops.notes,
    })
    .from(crops)
    .innerJoin(plantFamilies, eq(crops.familyId, plantFamilies.id))
    .orderBy(asc(plantFamilies.name), asc(crops.commonName));
  return rows.map((r) => ({ ...r, nutrientDemand: r.nutrientDemand as NutrientDemand }));
}

export async function getPlantings(plotId?: number): Promise<PlantingDTO[]> {
  const base = db
    .select({
      id: plantings.id,
      plotId: plantings.plotId,
      cropId: plantings.cropId,
      cropName: crops.commonName,
      familyId: crops.familyId,
      familyName: plantFamilies.name,
      nutrientDemand: crops.nutrientDemand,
      plantedOn: plantings.plantedOn,
      harvestedOn: plantings.harvestedOn,
      notes: plantings.notes,
      daysToHarvest: crops.daysToHarvest,
    })
    .from(plantings)
    .innerJoin(crops, eq(plantings.cropId, crops.id))
    .innerJoin(plantFamilies, eq(crops.familyId, plantFamilies.id))
    .$dynamic();

  const rows = await (plotId ? base.where(eq(plantings.plotId, plotId)) : base).orderBy(
    desc(plantings.plantedOn),
  );

  return rows.map((r) => ({
    ...r,
    nutrientDemand: r.nutrientDemand as NutrientDemand,
    plantedOn: toDateStr(r.plantedOn),
    harvestedOn: r.harvestedOn ? toDateStr(r.harvestedOn) : null,
  }));
}

export async function getSoilTests(plotId: number): Promise<SoilTestDTO[]> {
  const rows = await db
    .select()
    .from(soilTests)
    .where(eq(soilTests.plotId, plotId))
    .orderBy(desc(soilTests.testedOn));
  return rows.map((r) => ({
    id: r.id,
    plotId: r.plotId,
    testedOn: toDateStr(r.testedOn),
    ph: num(r.ph),
    n: num(r.n),
    p: num(r.p),
    k: num(r.k),
    organicMatter: num(r.organicMatter),
    notes: r.notes,
  }));
}

export async function getPlots(farmId: number): Promise<PlotDTO[]> {
  const plotRows = await db
    .select()
    .from(plots)
    .where(eq(plots.farmId, farmId))
    .orderBy(asc(plots.id));

  const allPlantings = await getPlantings();
  const soilRows = await db.select().from(soilTests).orderBy(desc(soilTests.testedOn));

  return plotRows.map((p) => {
    const hist = allPlantings.filter((pl) => pl.plotId === p.id);
    const active = hist.find((pl) => !pl.harvestedOn) ?? null;
    const soil = soilRows.find((s) => s.plotId === p.id);
    return {
      id: p.id,
      farmId: p.farmId,
      name: p.name,
      area: num(p.area),
      soilType: p.soilType,
      activePlanting: active,
      lastPlanting: hist[0] ?? null,
      plantingCount: hist.length,
      latestSoilTest: soil
        ? {
            id: soil.id,
            plotId: soil.plotId,
            testedOn: toDateStr(soil.testedOn),
            ph: num(soil.ph),
            n: num(soil.n),
            p: num(soil.p),
            k: num(soil.k),
            organicMatter: num(soil.organicMatter),
            notes: soil.notes,
          }
        : null,
    };
  });
}

export async function getPlot(plotId: number): Promise<PlotDTO | null> {
  const row = (await db.select().from(plots).where(eq(plots.id, plotId)).limit(1))[0];
  if (!row) return null;
  const all = await getPlots(row.farmId);
  return all.find((p) => p.id === plotId) ?? null;
}

const daysBetween = (a: Date, b: Date) =>
  Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));

export async function getDashboard(): Promise<DashboardDTO> {
  const farm = await getDefaultFarm();
  if (!farm) {
    return {
      farm: null,
      stats: { totalPlots: 0, activePlantings: 0, totalArea: 0, avgPh: null, soilTests: 0 },
      plots: [],
      activePlantings: [],
      nextActions: [],
    };
  }
  const plotList = await getPlots(farm.id);
  const today = new Date();

  const active = plotList
    .filter((p) => p.activePlanting)
    .map((p) => {
      const pl = p.activePlanting!;
      const planted = new Date(pl.plantedOn);
      const elapsed = daysBetween(today, planted);
      const total = pl.daysToHarvest ?? 90;
      const estimated = new Date(planted.getTime() + total * 86400000)
        .toISOString()
        .slice(0, 10);
      return {
        ...pl,
        plotName: p.name,
        estimatedHarvest: estimated,
        progress: Math.max(0, Math.min(100, Math.round((elapsed / total) * 100))),
      };
    });

  const nextActions: NextAction[] = [];
  for (const p of plotList) {
    const pl = p.activePlanting;
    if (pl) {
      const planted = new Date(pl.plantedOn);
      const total = pl.daysToHarvest ?? 90;
      const remaining = total - daysBetween(today, planted);
      if (remaining <= 0) {
        nextActions.push({
          plotId: p.id,
          plotName: p.name,
          title: `Waktunya panen ${p.name}`,
          detail: `${pl.cropName} sudah melewati perkiraan umur panen (${total} hari). Segera panen dan catat hasilnya.`,
          urgency: "tinggi",
          type: "panen",
        });
      } else if (remaining <= 14) {
        nextActions.push({
          plotId: p.id,
          plotName: p.name,
          title: `Siapkan panen ${p.name}`,
          detail: `${pl.cropName} diperkirakan siap panen dalam ${remaining} hari.`,
          urgency: "sedang",
          type: "panen",
        });
      }
    } else {
      nextActions.push({
        plotId: p.id,
        plotName: p.name,
        title: `${p.name} kosong — rencanakan rotasi`,
        detail: p.lastPlanting
          ? `Tanaman terakhir: ${p.lastPlanting.cropName} (${p.lastPlanting.familyName}). Pilih keluarga berbeda untuk musim berikutnya.`
          : "Petak belum punya riwayat tanam. Mulai catat musim pertama Anda.",
        urgency: "sedang",
        type: "rotasi",
      });
    }

    if (!p.latestSoilTest) {
      nextActions.push({
        plotId: p.id,
        plotName: p.name,
        title: `Uji tanah ${p.name}`,
        detail: "Belum ada data uji tanah. Catat pH dan NPK untuk rekomendasi lebih akurat.",
        urgency: "rendah",
        type: "uji-tanah",
      });
    } else {
      const months = Math.floor(
        daysBetween(today, new Date(p.latestSoilTest.testedOn)) / 30,
      );
      if (months >= 6) {
        nextActions.push({
          plotId: p.id,
          plotName: p.name,
          title: `Perbarui uji tanah ${p.name}`,
          detail: `Uji tanah terakhir ${months} bulan lalu. Disarankan uji ulang setiap 6 bulan.`,
          urgency: "rendah",
          type: "uji-tanah",
        });
      }
      if (p.latestSoilTest.ph !== null && p.latestSoilTest.ph < 5.5) {
        nextActions.push({
          plotId: p.id,
          plotName: p.name,
          title: `Tanah ${p.name} terlalu masam`,
          detail: `pH ${p.latestSoilTest.ph}. Lakukan pengapuran (dolomit) sebelum musim tanam berikutnya.`,
          urgency: "tinggi",
          type: "uji-tanah",
        });
      }
    }
  }

  const urgencyRank = { tinggi: 0, sedang: 1, rendah: 2 } as const;
  nextActions.sort((a, b) => urgencyRank[a.urgency] - urgencyRank[b.urgency]);

  const phValues = plotList
    .map((p) => p.latestSoilTest?.ph)
    .filter((v): v is number => typeof v === "number");

  const soilCount = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(soilTests)
    .innerJoin(plots, eq(soilTests.plotId, plots.id))
    .where(eq(plots.farmId, farm.id));

  return {
    farm,
    stats: {
      totalPlots: plotList.length,
      activePlantings: active.length,
      totalArea: plotList.reduce((s, p) => s + (p.area ?? 0), 0),
      avgPh: phValues.length
        ? Math.round((phValues.reduce((a, b) => a + b, 0) / phValues.length) * 10) / 10
        : null,
      soilTests: soilCount[0]?.c ?? 0,
    },
    plots: plotList,
    activePlantings: active,
    nextActions,
  };
}

export async function harvestPlanting(id: number, harvestedOn: string, notes?: string) {
  await db
    .update(plantings)
    .set({ harvestedOn, ...(notes !== undefined ? { notes } : {}) })
    .where(and(eq(plantings.id, id)));
}
