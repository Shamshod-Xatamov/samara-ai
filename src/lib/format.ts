/**
 * O'zbekcha formatlash.
 *
 * `Intl` / `toLocaleDateString` ATAYLAB ishlatilmaydi: Node va brauzerdagi ICU
 * ma'lumotlari har xil bo'lishi mumkin va bir xil sana serverda "2026 M07 21",
 * brauzerda "21-iyl, 2026" deb chiqib, hydration xatosiga olib keladi.
 *
 * Shuning uchun format qo'lda, qat'iy belgilangan.
 */

const MONTHS_SHORT = [
  "yan", "fev", "mar", "apr", "may", "iyn",
  "iyl", "avg", "sen", "okt", "noy", "dek",
];

const MONTHS_LONG = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];

function toDate(value: string | Date): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  // "2026-08-19" ko'rinishidagi sana UTC sifatida o'qiladi —
  // vaqt mintaqasi tufayli kun surilib ketmasligi uchun.
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T00:00:00Z`
    : value;
  const date = new Date(normalized);

  return Number.isNaN(date.getTime()) ? null : date;
}

/** "19-avg 2026" */
export function formatDate(value: string | Date): string {
  const date = toDate(value);
  if (!date) return "—";

  return `${date.getUTCDate()}-${MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** "19-avgust 2026" */
export function formatDateLong(value: string | Date): string {
  const date = toDate(value);
  if (!date) return "—";

  return `${date.getUTCDate()}-${MONTHS_LONG[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

/**
 * Nisbiy sana: "Bugun, 09:42" / "Kecha, 16:18" / "17-avg 2026".
 * Vaqt foydalanuvchining mahalliy mintaqasida ko'rsatiladi, shuning uchun
 * bu funksiya faqat brauzerda chaqirilishi kerak.
 */
export function formatRelativeDateTime(value: string | Date): string {
  const date = toDate(value);
  if (!date) return "—";

  const now = new Date();
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

  if (date.toDateString() === now.toDateString()) return `Bugun, ${time}`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `Kecha, ${time}`;

  return `${date.getDate()}-${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Raqam: mingliklar orasida ingichka bo'shliq, kasr ajratgichi — nuqta.
 * Butun ilova bo'ylab bir xil ko'rinish uchun.
 */
export function formatNumber(
  value: number | null | undefined,
  decimals = 0,
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }

  const fixed = Math.abs(value).toFixed(decimals);
  const [whole, fraction] = fixed.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const sign = value < 0 ? "−" : "";

  return fraction ? `${sign}${grouped}.${fraction}` : `${sign}${grouped}`;
}

/** Foiz o'zgarishi: "+15.4%" / "−8.6%" */
export function formatChange(value: number | null, decimals = 1): string | null {
  if (value === null || !Number.isFinite(value)) return null;

  return `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value).toFixed(decimals)}%`;
}
