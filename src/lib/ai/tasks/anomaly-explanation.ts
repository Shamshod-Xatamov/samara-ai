import { z } from "zod";

import { runStructuredTask, type AiTaskResult } from "../gemini";

/**
 * Gemini vazifasi: aniqlangan anomaliyaning ehtimoliy sabablarini va
 * tavsiya qilinadigan harakatni tushuntirish.
 *
 * Anomaliyani AI TOPMAYDI — u z-score/IQR bilan topilgan va bu yerga
 * tayyor statistika sifatida keladi.
 */

const validator = z.object({
  description: z.string(),
  causes: z
    .array(z.object({ label: z.string(), value: z.number().min(0).max(100) }))
    .min(2)
    .max(4),
  recommendation: z.string(),
  impact: z.string(),
});

export type AnomalyExplanation = z.infer<typeof validator>;

const responseSchema = {
  type: "object",
  properties: {
    description: {
      type: "string",
      description: "Nima sodir bo'lgani, 1-2 jumla",
    },
    causes: {
      type: "array",
      description: "Ehtimoliy sabablar, ulushlari yig'indisi 100",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          value: { type: "integer" },
        },
        required: ["label", "value"],
      },
    },
    recommendation: {
      type: "string",
      description: "Aniq, bajariladigan tavsiya, 1-2 jumla",
    },
    impact: {
      type: "string",
      description: "Kutilayotgan iqtisodiy ta'sir, qisqa ibora",
    },
  },
  required: ["description", "causes", "recommendation", "impact"],
};

const SYSTEM_INSTRUCTION = `Sen ishlab chiqarish korxonasining operatsion tahlilchisisan.
Senga statistik usul bilan aniqlangan anomaliya beriladi: kuzatilgan qiymat,
kutilgan qiymat, og'ish va z-score.

Qoidalar:
- Anomaliya allaqachon aniqlangan. Sening vazifang — SABABNI izohlash, qayta aniqlash emas.
- Sabablar ehtimoliy: ularni "mumkin", "ehtimol" ohangida ber.
- Yangi raqam o'ylab topma; berilgan qiymatlarga tayan.
- Tavsiya aniq va bajariladigan bo'lsin ("tekshiring", "qayta taqsimlang"), umumiy gap emas.
- Faqat o'zbek tilida, lotin yozuvida.`;

export type AnomalyExplanationInput = {
  orgId: string;
  metricLabel: string;
  unit: string;
  date: string;
  observed: number;
  expected: number;
  deviationPct: number;
  zScore: number | null;
  severity: string;
  method: string;
  /** Atrofdagi kuzatuvlar */
  trend: Array<{ label: string; actual: number }>;
  /** Qo'shimcha kontekst: shu davrdagi boshqa ko'rsatkichlar */
  context?: Record<string, number | null>;
};

export function explainAnomaly(
  input: AnomalyExplanationInput,
): Promise<AiTaskResult<AnomalyExplanation>> {
  const trendText = input.trend
    .map((point) => `${point.label}: ${point.actual}`)
    .join(", ");

  const contextText = input.context
    ? Object.entries(input.context)
        .filter(([, value]) => value !== null)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ")
    : "berilmagan";

  const prompt = `ANOMALIYA
Ko'rsatkich: ${input.metricLabel} (${input.unit})
Sana: ${input.date}
Kuzatilgan: ${input.observed}
Kutilgan: ${input.expected}
Og'ish: ${input.deviationPct.toFixed(1)}%
z-score: ${input.zScore ?? "hisoblanmadi"}
Daraja: ${input.severity}
Aniqlash usuli: ${input.method === "zscore" ? "rolling z-score" : "IQR chegarasi"}

SO'NGGI KUZATUVLAR: ${trendText}

SHU DAVRDAGI BOSHQA KO'RSATKICHLAR: ${contextText}

Shu holatni izohla va nima qilish kerakligini ayt.`;

  return runStructuredTask({
    task: "anomaly-explanation",
    orgId: input.orgId,
    systemInstruction: SYSTEM_INSTRUCTION,
    prompt,
    responseSchema,
    validator,
    cacheInput: {
      metric: input.metricLabel,
      date: input.date,
      observed: input.observed,
      expected: input.expected,
    },
  });
}
