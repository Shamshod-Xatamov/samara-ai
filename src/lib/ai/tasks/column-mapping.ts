import { z } from "zod";

import {
  CANONICAL_COLUMNS,
  CANONICAL_KEYS,
  type CanonicalKey,
} from "@/lib/parsing/canonical";

import { runStructuredTask, type AiTaskResult } from "../gemini";

/**
 * Gemini vazifasi: fayldagi ixtiyoriy ustun nomlarini kanonik sxemaga bog'lash.
 *
 * Bu AI chindan qo'l keladigan joy — ustun nomlari har bir korxonada har xil
 * ("Ishlab chiqarish xarajati (mln so'm)", "zatraty", "cost_total"), va ularni
 * qat'iy qoidalar bilan qamrab bo'lmaydi.
 */

const NO_MATCH = "aniqlanmadi";

export type MappingCandidate = {
  sourceName: string;
  dataType: string;
  sampleValues: unknown[];
  minValue: number | null;
  maxValue: number | null;
};

export type ResolvedMapping = {
  sourceName: string;
  canonicalKey: CanonicalKey | null;
  confidence: number;
  unitScale: number | null;
  reason: string;
};

const responseValidator = z.object({
  mappings: z.array(
    z.object({
      sourceName: z.string(),
      canonicalKey: z.string(),
      confidence: z.number().min(0).max(100),
      unitScale: z.number().positive().optional(),
      reason: z.string(),
    }),
  ),
});

const responseSchema = {
  type: "object",
  properties: {
    mappings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          sourceName: {
            type: "string",
            description: "Fayldagi ustun nomi, o'zgartirilmagan holda",
          },
          canonicalKey: {
            type: "string",
            enum: [...CANONICAL_KEYS, NO_MATCH],
          },
          confidence: {
            type: "integer",
            description: "0-100 oralig'ida ishonch darajasi",
          },
          unitScale: {
            type: "number",
            description:
              "Qiymatni kanonik birlikka keltirish koeffitsienti. Birlik mos bo'lsa 1.",
          },
          reason: {
            type: "string",
            description: "Qisqa izoh, o'zbek tilida, bir jumla",
          },
        },
        required: ["sourceName", "canonicalKey", "confidence", "unitScale", "reason"],
      },
    },
  },
  required: ["mappings"],
};

const SYSTEM_INSTRUCTION = `Sen korxona ma'lumotlari bilan ishlaydigan data muhandisisan.
Vazifang — yuklangan jadval ustunlarini qat'iy belgilangan kanonik sxemaga bog'lash.

Qoidalar:
- Faqat aniq mos kelgan holatda bog'la. Ishonching bo'lmasa "${NO_MATCH}" qaytar — noto'g'ri bog'lash bog'lamaslikdan yomonroq.
- Har bir kanonik kalit ko'pi bilan bitta ustunga bog'lanadi. Bir nechta nomzod bo'lsa, eng mosini tanla.
- Identifikator ustunlari (ID, kod, raqam) metrika emas — ularni "${NO_MATCH}" deb belgila.
- unitScale: ustundagi qiymatni kanonik birlikka keltiruvchi ko'paytuvchi.
  Masalan xarajat so'mda berilgan bo'lsa, kanonik birlik "mln so'm" bo'lgani uchun unitScale = 0.000001.
  Vaqt daqiqada berilgan bo'lsa, kanonik birlik "soniya" bo'lgani uchun unitScale = 60.
  Birlik mos kelsa yoki aniqlanmasa unitScale = 1.
- Namuna qiymatlar va min/max diapazonga qara: ular birlikni aniqlashda ustun nomidan ko'ra ishonchliroq.
- Izohni o'zbek tilida, bir jumlada yoz.`;

function buildPrompt(columns: MappingCandidate[]) {
  const dictionary = CANONICAL_COLUMNS.map(
    (column) =>
      `- ${column.key} (${column.label}${column.unit ? `, birlik: ${column.unit}` : ""}, tip: ${column.type}) — ${column.description}`,
  ).join("\n");

  const candidates = columns
    .map((column, index) => {
      const samples = column.sampleValues
        .slice(0, 5)
        .map((value) => JSON.stringify(value))
        .join(", ");

      const range =
        column.minValue !== null && column.maxValue !== null
          ? `, diapazon: ${column.minValue} … ${column.maxValue}`
          : "";

      return `${index + 1}. "${column.sourceName}" (aniqlangan tip: ${column.dataType}${range})\n   namunalar: ${samples || "yo'q"}`;
    })
    .join("\n");

  return `KANONIK SXEMA:
${dictionary}

FAYLDAGI USTUNLAR:
${candidates}

Har bir ustun uchun bittadan mapping qaytar.`;
}

export async function mapColumnsWithAi(input: {
  orgId: string;
  columns: MappingCandidate[];
}): Promise<AiTaskResult<ResolvedMapping[]>> {
  const result = await runStructuredTask({
    task: "column-mapping",
    orgId: input.orgId,
    systemInstruction: SYSTEM_INSTRUCTION,
    prompt: buildPrompt(input.columns),
    responseSchema,
    validator: responseValidator,
    // Kesh kaliti: ustun nomlari va namunalar. Bir xil tuzilmali fayl
    // qayta yuklansa, API qayta chaqirilmaydi.
    cacheInput: input.columns.map((column) => ({
      name: column.sourceName,
      type: column.dataType,
      samples: column.sampleValues.slice(0, 5),
    })),
  });

  if (!result.ok) return result;

  const byName = new Map(
    result.data.mappings.map((mapping) => [mapping.sourceName, mapping]),
  );

  // Bir kanonik kalit bir necha ustunga tushib qolmasligi kerak —
  // eng yuqori ishonchlisi saqlanadi.
  const claimed = new Map<string, number>();

  for (const mapping of result.data.mappings) {
    if (mapping.canonicalKey === NO_MATCH) continue;

    const current = claimed.get(mapping.canonicalKey);
    if (current === undefined || mapping.confidence > current) {
      claimed.set(mapping.canonicalKey, mapping.confidence);
    }
  }

  const used = new Set<string>();

  const resolved: ResolvedMapping[] = input.columns.map((column) => {
    const mapping = byName.get(column.sourceName);

    if (!mapping || mapping.canonicalKey === NO_MATCH) {
      return {
        sourceName: column.sourceName,
        canonicalKey: null,
        confidence: 0,
        unitScale: null,
        reason: mapping?.reason ?? "Kanonik sxemada mos kalit topilmadi.",
      };
    }

    const isBest =
      claimed.get(mapping.canonicalKey) === mapping.confidence &&
      !used.has(mapping.canonicalKey);

    if (!isBest) {
      return {
        sourceName: column.sourceName,
        canonicalKey: null,
        confidence: 0,
        unitScale: null,
        reason: `"${mapping.canonicalKey}" kaliti boshqa, ishonchliroq ustunga bog'landi.`,
      };
    }

    used.add(mapping.canonicalKey);

    return {
      sourceName: column.sourceName,
      canonicalKey: mapping.canonicalKey as CanonicalKey,
      confidence: Math.round(mapping.confidence),
      unitScale: mapping.unitScale ?? 1,
      reason: mapping.reason,
    };
  });

  return { ...result, data: resolved };
}
