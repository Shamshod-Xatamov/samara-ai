/**
 * Davrlarni aniqlash va vaqt o'qini bo'laklarga bo'lish.
 *
 * UI'dagi davr filtri ([src/data/dashboard.ts] dagi `PeriodKey`) shu yerga tayanadi.
 * Har bir davr uchun: qancha kun qamraladi va nechta bo'lakka bo'linadi.
 */

export type PeriodKey = "today" | "week" | "month" | "quarter" | "year";

export type BucketUnit = "day" | "week" | "month";

export type PeriodDefinition = {
  key: PeriodKey;
  label: string;
  /** Davr necha kunni qamraydi */
  days: number;
  /** Bo'lak o'lchami */
  bucket: BucketUnit;
};

export const PERIODS: Record<PeriodKey, PeriodDefinition> = {
  today: { key: "today", label: "Bugun", days: 1, bucket: "day" },
  week: { key: "week", label: "7 kun", days: 7, bucket: "day" },
  month: { key: "month", label: "30 kun", days: 30, bucket: "week" },
  quarter: { key: "quarter", label: "Chorak", days: 90, bucket: "week" },
  year: { key: "year", label: "Yil", days: 365, bucket: "month" },
};

export const PERIOD_KEYS = Object.keys(PERIODS) as PeriodKey[];

export function isPeriodKey(value: string): value is PeriodKey {
  return PERIOD_KEYS.includes(value as PeriodKey);
}

const DAY_MS = 86_400_000;

export function startOfDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

/** Haftaning boshi — dushanba. */
export function startOfWeek(date: Date) {
  const day = startOfDay(date);
  // getUTCDay(): 0 = yakshanba, shuning uchun dushanbani 0 ga keltiramiz.
  const offset = (day.getUTCDay() + 6) % 7;

  return new Date(day.getTime() - offset * DAY_MS);
}

export function startOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function bucketStart(date: Date, unit: BucketUnit) {
  if (unit === "week") return startOfWeek(date);
  if (unit === "month") return startOfMonth(date);
  return startOfDay(date);
}

const MONTH_LABELS = [
  "Yan", "Fev", "Mar", "Apr", "May", "Iyun",
  "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek",
];

const WEEKDAY_LABELS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

export function formatBucketLabel(date: Date, unit: BucketUnit, period: PeriodKey) {
  if (unit === "month") {
    return MONTH_LABELS[date.getUTCMonth()];
  }

  if (unit === "week") {
    return `${date.getUTCDate()}-${MONTH_LABELS[date.getUTCMonth()].toLowerCase()}`;
  }

  // Bir haftalik davrda hafta kuni o'qishga qulayroq.
  if (period === "week") {
    return WEEKDAY_LABELS[(date.getUTCDay() + 6) % 7];
  }

  return `${date.getUTCDate()}-${MONTH_LABELS[date.getUTCMonth()].toLowerCase()}`;
}

export type PeriodRange = {
  from: Date;
  to: Date;
  /** Taqqoslash uchun oldingi, xuddi shunday uzunlikdagi davr */
  previousFrom: Date;
  previousTo: Date;
};

/**
 * Davr chegaralarini hisoblaydi.
 * `anchor` — ma'lumotdagi eng so'nggi sana (bugungi kun emas): demo va
 * arxiv ma'lumot bilan ishlaganda oyna bo'sh qolmasligi kerak.
 */
export function resolvePeriodRange(period: PeriodKey, anchor: Date): PeriodRange {
  const to = startOfDay(anchor);
  const definition = PERIODS[period];
  const from = new Date(to.getTime() - (definition.days - 1) * DAY_MS);
  const previousTo = new Date(from.getTime() - DAY_MS);
  const previousFrom = new Date(
    previousTo.getTime() - (definition.days - 1) * DAY_MS,
  );

  return { from, to, previousFrom, previousTo };
}
