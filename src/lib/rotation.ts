import type {
  CropDTO,
  NutrientDemand,
  PlantingDTO,
  Recommendation,
  SoilTestDTO,
} from "./types";

const NITROGEN_FIXERS = ["Fabaceae"];

const DEMAND_LABEL: Record<NutrientDemand, string> = {
  tinggi: "Tinggi",
  sedang: "Sedang",
  rendah: "Rendah",
};

export function monthsBetween(from: string, to: Date = new Date()): number {
  const d = new Date(from);
  return Math.floor((to.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
}

export interface RotationCheck {
  status: "aman" | "peringatan" | "bahaya";
  message: string;
  reasons: string[];
}

/** Cek apakah menanam sebuah komoditas di petak ini aman berdasarkan riwayat. */
export function checkRotation(crop: CropDTO, history: PlantingDTO[]): RotationCheck {
  const sorted = [...history].sort(
    (a, b) => new Date(b.plantedOn).getTime() - new Date(a.plantedOn).getTime(),
  );
  const reasons: string[] = [];
  const sameFamily = sorted.find((p) => p.familyId === crop.familyId);

  if (!sorted.length) {
    return {
      status: "aman",
      message: "Petak belum memiliki riwayat tanam. Semua pilihan aman.",
      reasons: ["Belum ada riwayat tanam pada petak ini."],
    };
  }

  const last = sorted[0];
  if (last.familyId === crop.familyId) {
    return {
      status: "bahaya",
      message: `Musim sebelumnya petak ini ditanami ${last.cropName} dari keluarga ${crop.familyName}. Menanam keluarga yang sama berturut-turut memicu ledakan hama dan penyakit tanah.`,
      reasons: [
        `Tanaman terakhir (${last.cropName}) berasal dari keluarga botani yang sama: ${crop.familyName}.`,
        "Disarankan menunggu minimal 2-3 musim sebelum mengulang keluarga yang sama.",
      ],
    };
  }

  if (sameFamily) {
    const months = monthsBetween(sameFamily.plantedOn);
    if (months < 24) {
      reasons.push(
        `Keluarga ${crop.familyName} terakhir ditanam ${months} bulan lalu (${sameFamily.cropName}). Idealnya jeda 24 bulan.`,
      );
      return {
        status: "peringatan",
        message: `Keluarga ${crop.familyName} pernah ditanam di petak ini ${months} bulan lalu. Masih berisiko terhadap patogen tanah yang bertahan.`,
        reasons,
      };
    }
  }

  if (last.nutrientDemand === "tinggi" && crop.nutrientDemand === "tinggi") {
    return {
      status: "peringatan",
      message: `Tanaman sebelumnya (${last.cropName}) berkebutuhan hara tinggi. Menanam komoditas rakus hara lagi dapat menguras kesuburan tanah.`,
      reasons: [
        "Dua musim berturut-turut dengan kebutuhan hara tinggi menguras nitrogen tanah.",
        "Pertimbangkan tanaman polong (Fabaceae) atau tambahkan kompos terlebih dahulu.",
      ],
    };
  }

  return {
    status: "aman",
    message: `Rotasi sehat: ${crop.familyName} berbeda keluarga dengan tanaman sebelumnya (${last.familyName}).`,
    reasons: [
      `Keluarga tanaman berbeda (${last.familyName} → ${crop.familyName}) untuk memutus siklus hama.`,
    ],
  };
}

/** Mesin rekomendasi rotasi: memberi skor pada seluruh katalog. */
export function recommendCrops(
  crops: CropDTO[],
  history: PlantingDTO[],
  soil: SoilTestDTO | null,
): Recommendation[] {
  const sorted = [...history].sort(
    (a, b) => new Date(b.plantedOn).getTime() - new Date(a.plantedOn).getTime(),
  );
  const last = sorted[0] ?? null;
  const recentFamilies = sorted.slice(0, 3).map((p) => p.familyId);

  const results = crops.map<Recommendation>((crop) => {
    let score = 55;
    const reasons: string[] = [];
    let status: Recommendation["status"] = "direkomendasikan";

    if (!last) {
      score = 70;
      reasons.push("Petak baru tanpa riwayat tanam — semua keluarga aman ditanam.");
    } else if (last.familyId === crop.familyId) {
      score -= 45;
      status = "hindari";
      reasons.push(
        `Keluarga sama dengan musim lalu (${last.cropName} – ${crop.familyName}). Berisiko hama & penyakit menumpuk.`,
      );
    } else {
      score += 20;
      reasons.push(
        `Keluarga tanaman berbeda (${last.familyName} → ${crop.familyName}) untuk mencegah hama.`,
      );

      const sameFamilyPast = sorted.find((p) => p.familyId === crop.familyId);
      if (sameFamilyPast) {
        const months = monthsBetween(sameFamilyPast.plantedOn);
        if (months < 12) {
          score -= 25;
          status = "hati-hati";
          reasons.push(`Keluarga ini baru ditanam ${months} bulan lalu. Jeda idealnya 24 bulan.`);
        } else if (months < 24) {
          score -= 8;
          reasons.push(`Keluarga ini terakhir ditanam ${months} bulan lalu — jeda cukup, tetap pantau.`);
        } else {
          score += 6;
          reasons.push(`Jeda keluarga sudah ${months} bulan, aman untuk diulang.`);
        }
      } else if (recentFamilies.length) {
        score += 8;
        reasons.push("Keluarga ini belum pernah ditanam di petak ini — menambah keragaman rotasi.");
      }
    }

    // Logika hara
    if (last) {
      const prevHigh = last.nutrientDemand === "tinggi";
      const isFixer = NITROGEN_FIXERS.includes(crop.familyName);
      if (prevHigh && isFixer) {
        score += 22;
        reasons.push(
          `${last.cropName} rakus hara. ${crop.commonName} (polong) mengikat nitrogen dan memulihkan kesuburan tanah.`,
        );
      } else if (prevHigh && crop.nutrientDemand === "tinggi") {
        score -= 18;
        if (status === "direkomendasikan") status = "hati-hati";
        reasons.push("Dua musim beruntun berkebutuhan hara tinggi berisiko menguras tanah.");
      } else if (prevHigh && crop.nutrientDemand === "rendah") {
        score += 10;
        reasons.push("Kebutuhan hara rendah cocok menyusul tanaman rakus hara.");
      } else if (NITROGEN_FIXERS.includes(last.familyName) && crop.nutrientDemand === "tinggi") {
        score += 18;
        reasons.push(
          `Tanah baru diperkaya nitrogen oleh ${last.cropName}. Cocok untuk ${crop.commonName} yang butuh hara ${DEMAND_LABEL[crop.nutrientDemand].toLowerCase()}.`,
        );
      }
    }

    // Logika kesehatan tanah
    if (soil) {
      if (soil.n !== null && soil.n < 0.12) {
        if (NITROGEN_FIXERS.includes(crop.familyName)) {
          score += 15;
          reasons.push(`Nitrogen tanah rendah (${soil.n}%). Tanaman polong membantu menaikkannya.`);
        } else if (crop.nutrientDemand === "tinggi") {
          score -= 12;
          reasons.push(`Nitrogen tanah rendah (${soil.n}%) sementara tanaman ini butuh hara tinggi.`);
        }
      }
      if (soil.ph !== null) {
        if (soil.ph < 5.5 && ["Brassicaceae", "Fabaceae"].includes(crop.familyName)) {
          score -= 10;
          if (status === "direkomendasikan") status = "hati-hati";
          reasons.push(`pH tanah ${soil.ph} terlalu masam untuk ${crop.familyName}. Lakukan pengapuran.`);
        } else if (soil.ph >= 6 && soil.ph <= 7) {
          score += 5;
          reasons.push(`pH tanah ${soil.ph} berada pada rentang ideal.`);
        }
      }
      if (soil.organicMatter !== null && soil.organicMatter < 2 && crop.nutrientDemand === "tinggi") {
        score -= 8;
        reasons.push(`Bahan organik rendah (${soil.organicMatter}%). Tambahkan kompos sebelum tanam.`);
      }
    }

    score = Math.max(5, Math.min(99, Math.round(score)));
    if (score < 40 && status !== "hindari") status = "hati-hati";
    if (score < 25) status = "hindari";

    return {
      cropId: crop.id,
      cropName: crop.commonName,
      familyName: crop.familyName,
      nutrientDemand: crop.nutrientDemand,
      daysToHarvest: crop.daysToHarvest,
      score,
      status,
      reasons,
    };
  });

  return results.sort((a, b) => b.score - a.score);
}
