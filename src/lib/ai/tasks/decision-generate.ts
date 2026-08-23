import { z } from "zod";

import { runStructuredTask, type AiTaskResult } from "../gemini";

/**
 * Gemini vazifasi: anomaliya va iqtisodiy kontekstdan to'liq qaror tavsiyasi.
 *
 * Chiqish tuzilmasi src/data/decisions.ts dagi `DecisionRecommendation`
 * tipiga mos — UI allaqachon shu shaklni chizadi.
 *
 * Bu platformadagi AI eng ko'p qiymat beradigan joy: statistika "nima
 * bo'ldi" ni aytadi, AI esa "nima qilish kerak" degan savolga
 * tuzilmalashtirilgan javob beradi.
 */

const validator = z.object({
  title: z.string(),
  summary: z.string(),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM"]),
  confidence: z.number().min(0).max(100),
  problem: z.string(),
  factors: z
    .array(
      z.object({
        label: z.string(),
        change: z.string(),
        contribution: z.number().min(0).max(100),
      }),
    )
    .min(2)
    .max(4),
  recommendation: z.string(),
  rationale: z.string(),
  effects: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
        detail: z.string(),
      }),
    )
    .min(2)
    .max(4),
  steps: z
    .array(
      z.object({
        title: z.string(),
        owner: z.string(),
        duration: z.string(),
      }),
    )
    .min(2)
    .max(4),
});

export type GeneratedDecision = z.infer<typeof validator>;

const responseSchema = {
  type: "object",
  properties: {
    title: { type: "string", description: "Qaror sarlavhasi, 3-6 so'z" },
    summary: { type: "string", description: "Bir jumlalik xulosa" },
    priority: { type: "string", enum: ["CRITICAL", "HIGH", "MEDIUM"] },
    confidence: { type: "integer", description: "Ishonch darajasi 0-100" },
    problem: { type: "string", description: "Muammoning 2-3 jumlalik tavsifi" },
    factors: {
      type: "array",
      description: "Muammoga hissa qo'shgan omillar, contribution yig'indisi 100",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          change: { type: "string", description: "O'zgarish, masalan \"+23%\"" },
          contribution: { type: "integer" },
        },
        required: ["label", "change", "contribution"],
      },
    },
    recommendation: { type: "string", description: "Tavsiya qilingan harakat" },
    rationale: { type: "string", description: "Nega aynan shu harakat" },
    effects: {
      type: "array",
      description: "Kutilayotgan iqtisodiy natijalar",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          value: { type: "string", description: "Masalan \"−12%\" yoki \"8.4 mln so'm\"" },
          detail: { type: "string" },
        },
        required: ["label", "value", "detail"],
      },
    },
    steps: {
      type: "array",
      description: "Amalga oshirish qadamlari",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          owner: { type: "string", description: "Mas'ul bo'lim" },
          duration: { type: "string", description: "Masalan \"2 kun\"" },
        },
        required: ["title", "owner", "duration"],
      },
    },
  },
  required: [
    "title", "summary", "priority", "confidence", "problem",
    "factors", "recommendation", "rationale", "effects", "steps",
  ],
};

const SYSTEM_INSTRUCTION = `Sen ishlab chiqarish korxonasi rahbariyatiga qaror
tayyorlaydigan operatsion tahlilchisan.

Senga aniqlangan anomaliya va korxonaning joriy iqtisodiy ko'rsatkichlari beriladi.
Vazifang — bajariladigan qaror tavsiyasini tuzilmalashtirilgan holda tayyorlash.

Qoidalar:
- Faqat berilgan raqamlarga tayan. Yangi statistika o'ylab topma.
- Kutilayotgan effektlar (effects) real bo'lsin: berilgan xarajat va hajmga mutanosib.
  Masalan oylik xarajat 118 mln bo'lsa, "500 mln tejash" deb yozma.
- Qadamlar (steps) aniq mas'ul va muddat bilan bo'lsin.
- Ustuvorlik: og'ish 20% dan katta yoki z-score 3 dan yuqori bo'lsa CRITICAL;
  10–20% bo'lsa HIGH; aks holda MEDIUM.
- Ishonch darajasi (confidence) og'ishning aniqligi va ma'lumot hajmiga tayansin.
- Faqat o'zbek tilida, lotin yozuvida. Rasmiy, ammo sodda uslub.`;

export type DecisionInput = {
  orgId: string;
  metricLabel: string;
  unit: string;
  date: string;
  observed: number;
  expected: number;
  deviationPct: number;
  zScore: number | null;
  severity: string;
  /** Joriy davr iqtisodiy holati */
  economics: {
    periodLabel: string;
    cost: number | null;
    volume: number | null;
    laborHours: number | null;
    processingSeconds: number | null;
    automation: number | null;
    ees: number | null;
    savedCost: number | null;
  };
};

export function generateDecision(
  input: DecisionInput,
): Promise<AiTaskResult<GeneratedDecision>> {
  const { economics } = input;

  const prompt = `ANIQLANGAN MUAMMO
Ko'rsatkich: ${input.metricLabel} (${input.unit})
Sana: ${input.date}
Kuzatilgan qiymat: ${input.observed}
Kutilgan qiymat: ${input.expected}
Og'ish: ${input.deviationPct.toFixed(1)}%
z-score: ${input.zScore ?? "hisoblanmadi"}
Daraja: ${input.severity}

KORXONANING JORIY HOLATI (${economics.periodLabel})
Operatsion xarajat: ${economics.cost === null ? "—" : `${economics.cost.toFixed(1)} mln so'm`}
Ishlab chiqarish hajmi: ${economics.volume === null ? "—" : `${economics.volume.toFixed(0)} birlik`}
Mehnat vaqti: ${economics.laborHours === null ? "—" : `${economics.laborHours.toFixed(0)} soat`}
O'rtacha jarayon vaqti: ${economics.processingSeconds === null ? "—" : `${economics.processingSeconds.toFixed(2)} soniya`}
Avtomatlashtirish: ${economics.automation === null ? "—" : `${economics.automation.toFixed(1)}%`}
Samaradorlik indeksi: ${economics.ees === null ? "—" : economics.ees.toFixed(1)}
Joriy tejam: ${economics.savedCost === null ? "—" : `${economics.savedCost.toFixed(1)} mln so'm`}

Shu ma'lumot asosida rahbariyat uchun qaror tavsiyasini tayyorla.`;

  return runStructuredTask({
    task: "decision-generate",
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
      cost: economics.cost,
    },
  });
}
