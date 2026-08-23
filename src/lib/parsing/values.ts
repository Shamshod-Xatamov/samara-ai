/**
 * Katak qiymatlarini normallashtirish.
 *
 * Haqiqiy fayllarda raqamlar turli ko'rinishda keladi: "1,424", "1 240",
 * "12.5", "N/A", "—". Shu qatlam ularni bitta ko'rinishga keltiradi va
 * qaysi qiymat haqiqatan xato ekanini ajratadi.
 */

export type RawCell = string | number | boolean | Date | null;

/**
 * Bo'sh deb hisoblanadigan matnlar.
 * Diqqat: "yo'q" bu yerda YO'Q — u mantiqiy `false` degani, bo'sh katak emas.
 */
const EMPTY_MARKERS = new Set([
  "",
  "-",
  "—",
  "–",
  "n/a",
  "na",
  "null",
  "nil",
  "none",
  "#n/a",
  "#yo'q",
]);

const TRUE_MARKERS = new Set(["ha", "true", "1", "yes", "da", "bor", "+"]);
const FALSE_MARKERS = new Set(["yo'q", "yoq", "false", "0", "no", "net", "нет"]);

export function isEmptyValue(value: RawCell): boolean {
  if (value === null || value === undefined) return true;
  if (value instanceof Date) return false;
  if (typeof value === "number") return Number.isNaN(value);
  if (typeof value === "boolean") return false;

  return EMPTY_MARKERS.has(value.trim().toLocaleLowerCase("uz-UZ"));
}

export type NumericParseResult = {
  /** Muvaffaqiyatli o'qilgan raqam yoki null */
  value: number | null;
  /** Qiymat bor, lekin raqamga aylantirib bo'lmadi */
  invalid: boolean;
  /** Qiymat umuman yo'q (bo'sh katak) */
  empty: boolean;
  /**
   * Qiymat o'qildi, lekin buning uchun formatni tozalash kerak bo'ldi
   * ("1,424", "1 240", "85%"). Bu avtomatik tuzatiladigan sifat muammosi.
   */
  coerced: boolean;
};

/** Hech qanday tozalashsiz raqam sifatida o'qiladigan matn. */
const PLAIN_NUMBER = /^[+-]?\d+(?:\.\d+)?$/;

/**
 * Raqamni o'qiydi. Vergul ham, nuqta ham kasr ajratgichi bo'lishi mumkin;
 * bo'sh joy va nbsp esa mingliklar ajratgichi sifatida olib tashlanadi.
 */
export function parseNumeric(value: RawCell): NumericParseResult {
  if (value === null || value === undefined || isEmptyValue(value)) {
    return { value: null, invalid: false, empty: true, coerced: false };
  }

  if (typeof value === "number") {
    return { value, invalid: false, empty: false, coerced: false };
  }

  if (typeof value === "boolean") {
    return { value: value ? 1 : 0, invalid: false, empty: false, coerced: true };
  }

  if (value instanceof Date) {
    return { value: value.getTime(), invalid: false, empty: false, coerced: true };
  }

  // Tozalashsiz o'qilmaydigan matn — avtomatik tuzatiladigan format muammosi.
  const coerced = !PLAIN_NUMBER.test(value.trim());

  // Barcha bo'sh joy turlari (oddiy, nbsp, narrow nbsp) — mingliklar ajratgichi.
  let text = value.replace(/[\s   ]/g, "").replace(/%$/, "");

  const hasComma = text.includes(",");
  const hasDot = text.includes(".");

  if (hasComma && hasDot) {
    // Oxirgi kelgan belgi kasr ajratgichi, ikkinchisi mingliklar uchun.
    const decimalSeparator = text.lastIndexOf(",") > text.lastIndexOf(".") ? "," : ".";
    const groupSeparator = decimalSeparator === "," ? "." : ",";

    text = text.split(groupSeparator).join("");
    text = text.replace(decimalSeparator, ".");
  } else if (hasComma) {
    const commaCount = (text.match(/,/g) ?? []).length;
    // Bitta vergul — kasr ajratgichi; bir nechta — mingliklar ajratgichi.
    text = commaCount === 1 ? text.replace(",", ".") : text.split(",").join("");
  } else if (hasDot) {
    const dotCount = (text.match(/\./g) ?? []).length;
    if (dotCount > 1) text = text.split(".").join("");
  }

  if (!/^[+-]?\d*\.?\d+(?:[eE][+-]?\d+)?$/.test(text)) {
    return { value: null, invalid: true, empty: false, coerced: false };
  }

  const parsed = Number(text);

  return Number.isFinite(parsed)
    ? { value: parsed, invalid: false, empty: false, coerced }
    : { value: null, invalid: true, empty: false, coerced: false };
}

export type DateParseResult = {
  value: Date | null;
  invalid: boolean;
  empty: boolean;
};

const DATE_PATTERNS: Array<{
  pattern: RegExp;
  order: ["year", "month", "day"] | ["day", "month", "year"];
}> = [
  { pattern: /^(\d{4})[-./](\d{1,2})[-./](\d{1,2})$/, order: ["year", "month", "day"] },
  { pattern: /^(\d{1,2})[-./](\d{1,2})[-./](\d{4})$/, order: ["day", "month", "year"] },
];

export function parseDateValue(value: RawCell): DateParseResult {
  if (value === null || value === undefined || isEmptyValue(value)) {
    return { value: null, invalid: false, empty: true };
  }

  if (value instanceof Date) {
    return { value, invalid: false, empty: false };
  }

  // Excel serial sana (1900-yil epoxasi).
  if (typeof value === "number") {
    if (value > 20_000 && value < 60_000) {
      const excelEpoch = Date.UTC(1899, 11, 30);
      return {
        value: new Date(excelEpoch + value * 86_400_000),
        invalid: false,
        empty: false,
      };
    }

    return { value: null, invalid: true, empty: false };
  }

  if (typeof value === "boolean") {
    return { value: null, invalid: true, empty: false };
  }

  const text = value.trim();
  // "2026-08-19 14:32" kabi qiymatlarda faqat sana qismi olinadi.
  const datePart = text.split(/[T\s]/)[0];

  for (const { pattern, order } of DATE_PATTERNS) {
    const match = datePart.match(pattern);
    if (!match) continue;

    const parts = Object.fromEntries(
      order.map((field, index) => [field, Number(match[index + 1])]),
    ) as { year: number; month: number; day: number };

    if (parts.month < 1 || parts.month > 12 || parts.day < 1 || parts.day > 31) {
      return { value: null, invalid: true, empty: false };
    }

    const parsed = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));

    return Number.isNaN(parsed.getTime())
      ? { value: null, invalid: true, empty: false }
      : { value: parsed, invalid: false, empty: false };
  }

  return { value: null, invalid: true, empty: false };
}

export function parseBooleanValue(value: RawCell): boolean | null {
  if (isEmptyValue(value)) return null;
  if (typeof value === "boolean") return value;

  const text = String(value).trim().toLocaleLowerCase("uz-UZ");

  if (TRUE_MARKERS.has(text)) return true;
  if (FALSE_MARKERS.has(text)) return false;

  return null;
}

/** JSON'ga yoziladigan xavfsiz ko'rinish. */
export function toStorableValue(value: RawCell): string | number | boolean | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "number" && !Number.isFinite(value)) return null;

  return value;
}
