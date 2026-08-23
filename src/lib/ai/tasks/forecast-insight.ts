import { z } from "zod";

import { runStructuredTask, type AiTaskResult } from "../gemini";

/**
 * Gemini vazifasi: tayyor prognoz natijasini o'zbek tilida izohlash.
 * AI raqam hisoblamaydi — unga Holt modeli chiqargan qiymatlar beriladi.
 */

const validator = z.object({
  insightTitle: z.string(),
  insight: z.string(),
  factors: z
    .array(
      z.object({
        label: z.string(),
        value: z.number().min(0).max(100),
      }),
    )
    .min(2)
    .max(4),
});

export type ForecastInsight = z.infer<typeof validator>;

const responseSchema = {
  type: "object",
  properties: {
    insightTitle: {
      type: "string",
      description: "Qisqa sarlavha, 3-6 so'z, o'zbek tilida",
    },
    insight: {
      type: "string",
      description: "2-3 jumlalik izoh: nima kutilmoqda va nima uchun",
    },
    factors: {
      type: "array",
      description: "Natijaga ta'sir qiluvchi omillar, ulushlari yig'indisi 100",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          value: { type: "integer", description: "Ulush, foizda" },
        },
        required: ["label", "value"],
      },
    },
  },
  required: ["insightTitle", "insight", "factors"],
};

const SYSTEM_INSTRUCTION = `Sen korxona iqtisodiyoti bo'yicha tahlilchisan.
Senga statistik model (Holt chiziqli trend) chiqargan tayyor prognoz beriladi.

Qoidalar:
- Yangi raqam O'YLAB TOPMA. Faqat berilgan qiymatlarni izohla.
- Prognozning ishonchliligi MAPE bilan berilgan: MAPE yuqori bo'lsa, izohda ehtiyotkorlik bildir.
- Omillar (factors) — bu taxminiy sabablar, ulushlari yig'indisi 100 bo'lsin.
- Faqat o'zbek tilida, lotin yozuvida yoz. Qisqa va aniq bo'l.
- "Sun'iy intellekt aytdiki" kabi iboralardan foydalanma.`;

export type ForecastInsightInput = {
  orgId: string;
  metricLabel: string;
  unit: string;
  positiveWhen: "up" | "down";
  recent: Array<{ label: string; value: number }>;
  forecast: Array<{ label: string; value: number }>;
  changePct: number | null;
  mape: number | null;
  horizon: number;
};

export function explainForecast(
  input: ForecastInsightInput,
): Promise<AiTaskResult<ForecastInsight>> {
  const recentText = input.recent
    .map((point) => `${point.label}: ${point.value}`)
    .join(", ");
  const forecastText = input.forecast
    .map((point) => `${point.label}: ${point.value}`)
    .join(", ");

  const prompt = `KO'RSATKICH: ${input.metricLabel} (${input.unit})
Yaxshi yo'nalish: ${input.positiveWhen === "up" ? "o'sish" : "pasayish"}

SO'NGGI KUZATUVLAR: ${recentText}

PROGNOZ (${input.horizon} qadam oldinga): ${forecastText}

Kutilayotgan o'zgarish: ${input.changePct === null ? "aniqlanmadi" : `${input.changePct.toFixed(1)}%`}
Model xatosi (MAPE): ${input.mape === null ? "baholanmadi" : `${input.mape.toFixed(1)}%`}

Shu prognozni rahbariyat uchun izohla.`;

  return runStructuredTask({
    task: "forecast-insight",
    orgId: input.orgId,
    systemInstruction: SYSTEM_INSTRUCTION,
    prompt,
    responseSchema,
    validator,
    cacheInput: {
      metric: input.metricLabel,
      recent: input.recent,
      forecast: input.forecast,
      horizon: input.horizon,
    },
  });
}
