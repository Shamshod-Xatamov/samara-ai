import { createHash } from "node:crypto";

import { GoogleGenAI } from "@google/genai";
import type { z } from "zod";

import { prisma } from "@/lib/db";

/**
 * Gemini bilan ishlashning yagona nuqtasi.
 *
 * Asosiy qoidalar:
 *  1. AI hech qachon raqam hisoblamaydi — u tayyor statistikani izohlaydi.
 *  2. Har bir javob DB'da keshlanadi; bir xil kirish uchun API qayta chaqirilmaydi.
 *  3. Bu qatlam hech qachon exception tashlamaydi — xato bo'lsa `ok: false`
 *     qaytaradi va ilova AI izohisiz ishlashda davom etadi.
 */

export const GEMINI_MODELS = {
  /** Kundalik vazifalar — arzon va tez */
  fast: "gemini-3.7-flash",
  /** Uzunroq matn talab qiladigan vazifalar (hisobot xulosasi) */
  reasoning: "gemini-3.7-flash",
} as const;

/**
 * Model zanjiri. Birinchisi band bo'lsa (503 "high demand"), keyingisiga o'tamiz.
 * Bu kvota masalasi emas — Google tomonidagi vaqtinchalik yuklama, va u
 * har bir model uchun alohida. Zanjir demo paytida uzilib qolishning
 * oldini oladi.
 */
const MODEL_CHAIN = [
  "gemini-3.7-flash",
  "gemini-3.5-flash",
  "gemini-2.5-flash",
] as const;

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_TTL_HOURS = 24 * 30;
/** Vaqtinchalik xatolar orasidagi kutish (ms) */
const RETRY_DELAYS_MS = [600, 1800, 3000];

/** Qayta urinish ma'noli bo'lgan xatolar: model band yoki limit tugagan. */
function isTransientError(message: string) {
  return /\b(429|503|UNAVAILABLE|RESOURCE_EXHAUSTED|high demand|overloaded|deadline)\b/i.test(
    message,
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type AiFailureReason = "disabled" | "timeout" | "invalid" | "error";

export type AiTaskResult<T> =
  | { ok: true; data: T; cached: boolean; model: string; latencyMs: number }
  | { ok: false; reason: AiFailureReason; message: string };

export function isAiEnabled() {
  return Boolean(process.env.GEMINI_API_KEY);
}

let client: GoogleGenAI | null = null;

function getClient() {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  return client;
}

function buildCacheKey(task: string, input: unknown) {
  return createHash("sha256")
    .update(`${task}::${JSON.stringify(input)}`)
    .digest("hex");
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("AI so'rovi vaqti tugadi")),
          ms,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export type StructuredTaskOptions<T> = {
  /** Kesh va telemetriya uchun vazifa nomi, masalan "column-mapping" */
  task: string;
  orgId?: string;
  model?: string;
  systemInstruction: string;
  prompt: string;
  /** Gemini `responseSchema` — JSON tuzilmasini majburlaydi */
  responseSchema: Record<string, unknown>;
  /** Javobni tekshiradigan zod sxemasi */
  validator: z.ZodType<T>;
  /**
   * Kesh kaliti uchun kirish. Ma'lumot o'zgarmasa, API chaqirilmaydi.
   * Prompt matnining o'zi emas, aynan mazmunli kirish berilishi kerak.
   */
  cacheInput: unknown;
  ttlHours?: number;
  timeoutMs?: number;
};

export async function runStructuredTask<T>(
  options: StructuredTaskOptions<T>,
): Promise<AiTaskResult<T>> {
  if (!isAiEnabled()) {
    return {
      ok: false,
      reason: "disabled",
      message: "AI xizmati sozlanmagan (GEMINI_API_KEY topilmadi).",
    };
  }

  const modelChain = options.model ? [options.model] : [...MODEL_CHAIN];
  const cacheKey = buildCacheKey(options.task, options.cacheInput);

  // 1. Kesh
  try {
    const cached = await prisma.aiCache.findUnique({ where: { cacheKey } });

    if (cached && (!cached.expiresAt || cached.expiresAt > new Date())) {
      const parsed = options.validator.safeParse(cached.response);

      if (parsed.success) {
        return {
          ok: true,
          data: parsed.data,
          cached: true,
          model: cached.model,
          latencyMs: 0,
        };
      }

      // Sxema o'zgargan bo'lsa, eski keshni tashlab yuboramiz.
      await prisma.aiCache.delete({ where: { cacheKey } }).catch(() => undefined);
    }
  } catch (error) {
    console.error("[ai] kesh o'qishda xato:", error);
  }

  // 2. Gemini
  const started = Date.now();
  let rawText: string | undefined;
  let tokensIn: number | undefined;
  let tokensOut: number | undefined;

  let lastError = "";
  let usedModel = modelChain[0];

  for (let attempt = 0; attempt < modelChain.length; attempt += 1) {
    const model = modelChain[attempt];

    try {
      const response = await withTimeout(
        getClient().models.generateContent({
          model,
          contents: options.prompt,
          config: {
            systemInstruction: options.systemInstruction,
            temperature: 0,
            responseMimeType: "application/json",
            responseSchema: options.responseSchema,
          },
        }),
        options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      );

      rawText = response.text;
      tokensIn = response.usageMetadata?.promptTokenCount;
      tokensOut = response.usageMetadata?.candidatesTokenCount;
      usedModel = model;
      break;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);

      const hasNextModel = attempt < modelChain.length - 1;
      const canRetry = hasNextModel && isTransientError(lastError);

      console.error(
        `[ai] ${options.task} — ${model} javob bermadi (${attempt + 1}/${modelChain.length}):`,
        lastError,
      );

      if (!canRetry) {
        return {
          ok: false,
          reason: lastError.includes("vaqti tugadi") ? "timeout" : "error",
          message: isTransientError(lastError)
            ? "AI xizmati hozir band. Birozdan so'ng qayta urinib ko'ring."
            : "AI xizmatiga ulanib bo'lmadi.",
        };
      }

      await delay(RETRY_DELAYS_MS[attempt] ?? 3000);
    }
  }

  const latencyMs = Date.now() - started;

  if (!rawText) {
    return { ok: false, reason: "invalid", message: "AI bo'sh javob qaytardi." };
  }

  // 3. Tekshirish
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(rawText);
  } catch {
    console.error(`[ai] ${options.task}: JSON o'qib bo'lmadi`, rawText.slice(0, 300));
    return {
      ok: false,
      reason: "invalid",
      message: "AI javobi kutilgan formatda emas.",
    };
  }

  const validated = options.validator.safeParse(parsedJson);

  if (!validated.success) {
    console.error(`[ai] ${options.task}: sxema mos kelmadi`, validated.error.message);
    return {
      ok: false,
      reason: "invalid",
      message: "AI javobi kutilgan tuzilmaga mos kelmadi.",
    };
  }

  // 4. Keshga yozish — muvaffaqiyatsiz bo'lsa ham natija qaytariladi.
  const ttlHours = options.ttlHours ?? DEFAULT_TTL_HOURS;

  try {
    await prisma.aiCache.create({
      data: {
        cacheKey,
        task: options.task,
        orgId: options.orgId ?? null,
        model: usedModel,
        response: parsedJson as never,
        tokensIn,
        tokensOut,
        latencyMs,
        expiresAt: new Date(Date.now() + ttlHours * 3_600_000),
      },
    });
  } catch (error) {
    console.error("[ai] keshga yozishda xato:", error);
  }

  return {
    ok: true,
    data: validated.data,
    cached: false,
    model: usedModel,
    latencyMs,
  };
}
