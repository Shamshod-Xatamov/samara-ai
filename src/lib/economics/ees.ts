import { z } from "zod";

/**
 * Iqtisodiy samaradorlik indeksi (EES).
 *
 * Formula: BACKEND_PLAN.md, 3.2-bo'lim.
 *
 *   Nᵢ = clamp( (xᵢ − x_worst) / (x_best − x_worst), 0, 1 )
 *   EES = 100 × Σ (wᵢ × Nᵢ)
 *
 * Vaznlar va chegaralar `org_settings.ees_config` da saqlanadi va
 * sozlanadi — indeks "qora quti" emas, har bir komponent alohida ko'rsatiladi.
 */

export const EES_COMPONENT_KEYS = [
  "time",
  "cost",
  "labor",
  "automation",
  "quality",
] as const;

export type EesComponentKey = (typeof EES_COMPONENT_KEYS)[number];

export const EES_COMPONENT_LABELS: Record<EesComponentKey, string> = {
  time: "Vaqt samaradorligi",
  cost: "Xarajat samaradorligi",
  labor: "Mehnat unumdorligi",
  automation: "Avtomatlashtirish",
  quality: "Sifat",
};

const boundSchema = z.object({
  worst: z.number(),
  best: z.number(),
  unit: z.string().optional(),
});

export const eesConfigSchema = z.object({
  weights: z.object({
    time: z.number(),
    cost: z.number(),
    labor: z.number(),
    automation: z.number(),
    quality: z.number(),
  }),
  bounds: z.object({
    time: boundSchema,
    cost: boundSchema,
    labor: boundSchema,
    automation: boundSchema,
    quality: boundSchema,
  }),
  /**
   * Elastiklik koeffitsientlari: avtomatlashtirish yoki aniqlik 1 foiz punktga
   * oshganda tegishli ko'rsatkich necha ulushga o'zgaradi.
   * Masalan timePerAutomation = 0.012 → +1 p.p. avtomatlashtirish vaqtni 1.2% qisqartiradi.
   */
  elasticity: z.object({
    timePerAutomation: z.number(),
    costPerAutomation: z.number(),
    costPerAccuracy: z.number(),
    errorPerAccuracy: z.number(),
    laborPerAutomation: z.number().optional(),
  }),
  /** AI'gacha bo'lgan bazaviy davr uzunligi (kun) */
  baselineDays: z.number().int().positive().optional(),
});

export type EesConfig = z.infer<typeof eesConfigSchema>;

export const DEFAULT_EES_CONFIG: EesConfig = {
  weights: { time: 0.2, cost: 0.25, labor: 0.2, automation: 0.15, quality: 0.2 },
  bounds: {
    time: { worst: 8.4, best: 1, unit: "soniya" },
    cost: { worst: 150, best: 100, unit: "mln so'm" },
    labor: { worst: 0.15, best: 0.35, unit: "mln so'm / soat" },
    automation: { worst: 40, best: 95, unit: "%" },
    quality: { worst: 0.9, best: 0.995, unit: "ulush" },
  },
  elasticity: {
    timePerAutomation: 0.012,
    costPerAutomation: 0.008,
    costPerAccuracy: 0.006,
    errorPerAccuracy: 0.05,
    laborPerAutomation: 0.01,
  },
  baselineDays: 60,
};

export function parseEesConfig(value: unknown): EesConfig {
  const parsed = eesConfigSchema.safeParse(value);
  return parsed.success ? parsed.data : DEFAULT_EES_CONFIG;
}

/** EES hisoblash uchun kerak bo'ladigan xom ko'rsatkichlar. */
export type EesInputs = {
  /** O'rtacha qayta ishlash vaqti, soniya */
  processingSeconds: number | null;
  /** Birlik xarajat, mln so'm / birlik */
  unitCost: number | null;
  /** Mehnat unumdorligi: daromad / mehnat soati */
  laborProductivity: number | null;
  /** Avtomatlashtirish darajasi, % */
  automation: number | null;
  /** Sifat ulushi: 1 − xato / hajm */
  qualityRatio: number | null;
};

export type EesComponent = {
  key: EesComponentKey;
  label: string;
  /** Xom qiymat (o'lchov birligida) */
  raw: number | null;
  /** 0–100 ga normallashtirilgan qiymat */
  score: number | null;
  weight: number;
  unit?: string;
};

export type EesResult = {
  /** 0–100; ma'lumot yetarli bo'lmasa null */
  score: number | null;
  components: EesComponent[];
  /** Hisobga kirgan vaznlarning yig'indisi (0–1) */
  coverage: number;
};

function normalize(value: number, worst: number, best: number) {
  if (best === worst) return 0;
  const ratio = (value - worst) / (best - worst);

  return Math.min(1, Math.max(0, ratio));
}

const INPUT_KEY_BY_COMPONENT: Record<EesComponentKey, keyof EesInputs> = {
  time: "processingSeconds",
  cost: "unitCost",
  labor: "laborProductivity",
  automation: "automation",
  quality: "qualityRatio",
};

/**
 * Ma'lumoti yo'q komponent hisobdan chiqariladi va qolgan vaznlar
 * qayta taqsimlanadi — aks holda ustuni yo'q fayl indeksni sun'iy pasaytirardi.
 * `coverage` qancha vazn qamralganini ko'rsatadi.
 */
export function calculateEes(inputs: EesInputs, config: EesConfig): EesResult {
  const components: EesComponent[] = EES_COMPONENT_KEYS.map((key) => {
    const raw = inputs[INPUT_KEY_BY_COMPONENT[key]];
    const bound = config.bounds[key];
    const weight = config.weights[key];

    return {
      key,
      label: EES_COMPONENT_LABELS[key],
      raw,
      score:
        raw === null
          ? null
          : Math.round(normalize(raw, bound.worst, bound.best) * 1000) / 10,
      weight,
      unit: bound.unit,
    };
  });

  const available = components.filter((component) => component.score !== null);
  const coverage = available.reduce(
    (total, component) => total + component.weight,
    0,
  );

  if (coverage === 0) {
    return { score: null, components, coverage: 0 };
  }

  const weighted = available.reduce(
    (total, component) => total + component.weight * (component.score ?? 0),
    0,
  );

  return {
    score: Math.round((weighted / coverage) * 10) / 10,
    components,
    coverage,
  };
}
