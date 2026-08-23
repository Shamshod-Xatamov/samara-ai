/**
 * Kanonik ustun sxemasi.
 *
 * Foydalanuvchi istalgan nomdagi ustunlar bilan fayl yuklaydi. Metrika
 * hisoblash uchun ular shu yagona lug'atga bog'lanadi (mapping).
 * Bog'lashni Gemini bajaradi, foydalanuvchi tuzatishi mumkin,
 * AI ishlamasa `guessCanonicalKey` evristikasi ishlaydi.
 *
 * Batafsil: BACKEND_PLAN.md, 3.1-bo'lim.
 */

export type CanonicalKey =
  | "sana"
  | "bolim"
  | "obyekt"
  | "hajm"
  | "daromad"
  | "xarajat"
  | "mehnat_soat"
  | "xato_soni"
  | "qayta_ishlash_vaqti"
  | "avtomatlashtirilgan";

export type CanonicalColumn = {
  key: CanonicalKey;
  label: string;
  type: "DATE" | "NUMBER" | "TEXT";
  /** Metrika hisoblash uchun shartmi */
  requirement: "required" | "recommended" | "optional";
  unit?: string;
  description: string;
  /** Evristik moslashtirish uchun kalit so'zlar (kichik harfda) */
  keywords: string[];
};

export const CANONICAL_COLUMNS: CanonicalColumn[] = [
  {
    key: "sana",
    label: "Sana",
    type: "DATE",
    requirement: "required",
    description: "Vaqt o'qi — barcha davriy metrikalar shunga tayanadi.",
    keywords: ["sana", "date", "kun", "vaqt", "sanasi", "дата", "period", "davr"],
  },
  {
    key: "bolim",
    label: "Bo'lim",
    type: "TEXT",
    requirement: "optional",
    description: "Tashkiliy kesim — bo'lim, sex yoki jamoa.",
    keywords: ["bolim", "bo'lim", "sex", "department", "otdel", "jamoa", "uchastka"],
  },
  {
    key: "obyekt",
    label: "Mahsulot / jarayon",
    type: "TEXT",
    requirement: "optional",
    description: "Mahsulot kodi, jarayon nomi yoki operatsiya turi.",
    keywords: ["mahsulot", "product", "jarayon", "operatsiya", "kod", "modul", "artikul"],
  },
  {
    key: "hajm",
    label: "Hajm",
    type: "NUMBER",
    requirement: "recommended",
    unit: "dona / yozuv",
    description: "Ishlab chiqarilgan dona yoki qayta ishlangan yozuvlar soni.",
    keywords: ["dona", "soni", "hajm", "miqdor", "count", "quantity", "kolichestvo", "ishlab chiqarilgan", "yozuv"],
  },
  {
    key: "daromad",
    label: "Daromad",
    type: "NUMBER",
    requirement: "recommended",
    unit: "mln so'm",
    description: "Tushum yoki sotuvdan olingan daromad.",
    keywords: ["daromad", "tushum", "revenue", "sotuv", "vyruchka", "dohod", "summa"],
  },
  {
    key: "xarajat",
    label: "Xarajat",
    type: "NUMBER",
    requirement: "required",
    unit: "mln so'm",
    description: "Operatsion yoki ishlab chiqarish xarajati.",
    // "sarf" ataylab yo'q: "sarflangan vaqt" ham, "sarflangan mablag'" ham bo'ladi.
    keywords: ["xarajat", "cost", "zatrat", "rasxod", "tannarx", "expense", "sarf-xarajat"],
  },
  {
    key: "mehnat_soat",
    label: "Mehnat vaqti",
    type: "NUMBER",
    requirement: "recommended",
    unit: "soat",
    description: "Sarflangan ish vaqti — unumdorlik va tejam hisobida ishlatiladi.",
    keywords: ["ish vaqti", "ish soati", "mehnat", "soat", "hour", "labor", "chas", "smena"],
  },
  {
    key: "xato_soni",
    label: "Xatolar soni",
    type: "NUMBER",
    requirement: "optional",
    unit: "dona",
    description: "Nuqson, brak yoki xatolik soni — sifat komponenti.",
    keywords: ["xato", "nuqson", "brak", "defect", "error", "oshibka", "sifatsiz"],
  },
  {
    key: "qayta_ishlash_vaqti",
    label: "Qayta ishlash vaqti",
    type: "NUMBER",
    requirement: "optional",
    unit: "soniya",
    description: "Bitta jarayon yoki yozuvga ketgan o'rtacha vaqt.",
    keywords: ["jarayon vaqti", "davomiylik", "qayta ishlash", "duration", "sek", "latency", "vremya"],
  },
  {
    key: "avtomatlashtirilgan",
    label: "Avtomatlashtirish darajasi",
    type: "NUMBER",
    requirement: "optional",
    unit: "%",
    description: "Avtomatlashtirilgan amallar ulushi.",
    keywords: ["avtomat", "automation", "avtomatlashtirish", "robot", "avtomatizatsiya"],
  },
];

export const CANONICAL_KEYS = CANONICAL_COLUMNS.map((column) => column.key);

export function getCanonicalColumn(key: string | null | undefined) {
  if (!key) return null;
  return CANONICAL_COLUMNS.find((column) => column.key === key) ?? null;
}

function normalizeHeader(header: string) {
  return header
    .toLocaleLowerCase("uz-UZ")
    .replace(/[''`’]/g, "'")
    .replace(/[_\-/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Gemini ishlamasa ishlatiladigan zaxira evristika.
 * Aniq mos kelmasa `null` qaytaradi — noto'g'ri taxmin qilishdan ko'ra
 * foydalanuvchidan so'ragan yaxshiroq.
 */
export function guessCanonicalKey(
  header: string,
): { key: CanonicalKey; confidence: number } | null {
  const normalized = normalizeHeader(header);
  if (!normalized) return null;

  let best: { key: CanonicalKey; confidence: number } | null = null;

  for (const column of CANONICAL_COLUMNS) {
    if (normalized === column.key || normalized === normalizeHeader(column.label)) {
      return { key: column.key, confidence: 95 };
    }

    for (const keyword of column.keywords) {
      const position = normalized.indexOf(keyword);
      if (position === -1) continue;

      // Kalit so'z sarlavhaning qancha qismini egallasa, ishonch shuncha yuqori.
      const coverage = keyword.length / Math.max(normalized.length, 1);
      // Sarlavha boshidagi so'z asosiy ma'noni bildiradi:
      // "Nuqsonli mahsulot" — bu mahsulot emas, nuqson soni.
      const positionBonus = position === 0 ? 14 : 0;

      const confidence = Math.round(50 + 30 * coverage + positionBonus);

      if (!best || confidence > best.confidence) {
        best = { key: column.key, confidence: Math.min(confidence, 88) };
      }
    }
  }

  return best;
}
