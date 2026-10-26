export type NutrientDemand = "tinggi" | "sedang" | "rendah";

export interface CropDTO {
  id: number;
  commonName: string;
  familyId: number;
  familyName: string;
  nutrientDemand: NutrientDemand;
  daysToHarvest: number | null;
  notes: string | null;
}

export interface PlantingDTO {
  id: number;
  plotId: number;
  cropId: number;
  cropName: string;
  familyId: number;
  familyName: string;
  nutrientDemand: NutrientDemand;
  plantedOn: string;
  harvestedOn: string | null;
  notes: string | null;
  daysToHarvest: number | null;
}

export interface SoilTestDTO {
  id: number;
  plotId: number;
  testedOn: string;
  ph: number | null;
  n: number | null;
  p: number | null;
  k: number | null;
  organicMatter: number | null;
  notes: string | null;
}

export interface PlotDTO {
  id: number;
  farmId: number;
  name: string;
  area: number | null;
  soilType: string | null;
  activePlanting: PlantingDTO | null;
  lastPlanting: PlantingDTO | null;
  latestSoilTest: SoilTestDTO | null;
  plantingCount: number;
}

export interface FarmDTO {
  id: number;
  name: string;
  location: string | null;
  ownerId: number;
}

export type RecommendationStatus = "direkomendasikan" | "hati-hati" | "hindari";

export interface Recommendation {
  cropId: number;
  cropName: string;
  familyName: string;
  nutrientDemand: NutrientDemand;
  daysToHarvest: number | null;
  score: number;
  status: RecommendationStatus;
  reasons: string[];
}

export interface NextAction {
  plotId: number;
  plotName: string;
  title: string;
  detail: string;
  urgency: "tinggi" | "sedang" | "rendah";
  type: "panen" | "tanam" | "uji-tanah" | "rotasi";
}

export interface PlotDetailDTO {
  plot: PlotDTO;
  history: PlantingDTO[];
  soilTests: SoilTestDTO[];
  crops: CropDTO[];
  recommendations: Recommendation[];
}

export interface DashboardDTO {
  farm: FarmDTO | null;
  stats: {
    totalPlots: number;
    activePlantings: number;
    totalArea: number;
    avgPh: number | null;
    soilTests: number;
  };
  plots: PlotDTO[];
  activePlantings: (PlantingDTO & { plotName: string; estimatedHarvest: string | null; progress: number })[];
  nextActions: NextAction[];
}
