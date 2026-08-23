import type { SeriesPoint } from "./forecast";

/**
 * Anomaliya aniqlash — rolling z-score va Tukey IQR.
 *
 * Bu yerda ham AI ishlatilmaydi: aniqlash qat'iy statistik qoida bo'yicha
 * bajariladi, natija takrorlanadi va chegaralar tushuntiriladi.
 * Gemini keyinroq faqat "nega shunday bo'ldi" degan savolga javob beradi.
 */

export type DetectedAnomaly = {
  metricKey: string;
  date: string;
  label: string;
  observed: number;
  /** Model kutgan qiymat (oynaning o'rtachasi yoki median) */
  expected: number;
  deviationPct: number;
  zScore: number | null;
  severity: "CRITICAL" | "WARNING" | "INFO";
  method: "zscore" | "iqr";
  /** Atrofdagi nuqtalar — UI grafigi uchun */
  trend: Array<{ label: string; expected: number; actual: number }>;
};

export type AnomalyOptions = {
  /** Rolling oyna uzunligi */
  window?: number;
  /** Kritik chegara (standart og'ish) */
  criticalZ?: number;
  /** Ogohlantirish chegarasi */
  warningZ?: number;
  /** Grafikda ko'rsatiladigan atrof nuqtalari soni */
  contextSize?: number;
  /**
   * Mavsumiy davr, kunlarda. 7 — haftalik tsikl.
   * 0 bo'lsa mavsumiy tuzatish bajarilmaydi.
   */
  seasonLength?: number;
};

const DEFAULTS: Required<AnomalyOptions> = {
  window: 14,
  criticalZ: 3,
  warningZ: 2,
  contextSize: 7,
  seasonLength: 7,
};

function mean(values: number[]) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function standardDeviation(values: number[], average: number) {
  const variance =
    values.reduce((total, value) => total + (value - average) ** 2, 0) /
    values.length;

  return Math.sqrt(variance);
}

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

/**
 * Hafta kuni bo'yicha mavsumiy koeffitsientlar.
 *
 * Buni hisobga olmaslik jiddiy xatoga olib keladi: dam olish kunlarida hajm
 * tabiiy ravishda tushadi va z-score har yakshanbani "anomaliya" deb
 * belgilaydi. Natijada ro'yxat shovqinga to'lib, haqiqiy muammolar ko'rinmay
 * qoladi. Shuning uchun har bir kun O'Z hafta kuniga nisbatan baholanadi.
 */
function weekdayFactors(series: SeriesPoint[], seasonLength: number) {
  if (seasonLength < 2 || series.length < seasonLength * 2) return null;

  const overall = median(series.map((point) => point.value));
  if (overall === 0) return null;

  const byWeekday = new Map<number, number[]>();

  for (const point of series) {
    const weekday = new Date(`${point.date}T00:00:00Z`).getUTCDay();
    const existing = byWeekday.get(weekday);

    if (existing) existing.push(point.value);
    else byWeekday.set(weekday, [point.value]);
  }

  const factors = new Map<number, number>();

  for (const [weekday, values] of byWeekday) {
    // Kamida 2 ta kuzatuv bo'lmasa koeffitsient ishonchsiz — 1 qoldiriladi.
    const factor = values.length >= 2 ? median(values) / overall : 1;
    factors.set(weekday, factor > 0.05 ? factor : 1);
  }

  return factors;
}

function quantile(sorted: number[], fraction: number) {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];

  const position = (sorted.length - 1) * fraction;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);

  if (lower === upper) return sorted[lower];

  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

function buildTrend(
  series: SeriesPoint[],
  index: number,
  expected: number,
  contextSize: number,
) {
  const from = Math.max(0, index - contextSize + 1);

  return series.slice(from, index + 1).map((point) => ({
    label: point.label,
    expected: Math.round(expected * 1000) / 1000,
    actual: Math.round(point.value * 1000) / 1000,
  }));
}

/**
 * Rolling z-score: har bir nuqta o'zidan OLDINGI oyna bo'yicha baholanadi.
 * Nuqtaning o'zi o'rtachaga kirmaydi — aks holda anomaliya o'z chegarasini
 * kengaytirib, o'zini yashirib qo'yardi.
 */
export function detectAnomalies(
  metricKey: string,
  series: SeriesPoint[],
  options: AnomalyOptions = {},
): DetectedAnomaly[] {
  const config = { ...DEFAULTS, ...options };
  const anomalies: DetectedAnomaly[] = [];

  if (series.length < config.window + 2) return anomalies;

  const factors = weekdayFactors(series, config.seasonLength);

  const factorFor = (date: string) =>
    factors?.get(new Date(`${date}T00:00:00Z`).getUTCDay()) ?? 1;

  // Mavsumiy tuzatilgan qator — z-score aynan shu qator bo'yicha hisoblanadi.
  const adjusted = series.map((point) => point.value / factorFor(point.date));
  const values = series.map((point) => point.value);
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  const iqr = q3 - q1;
  const iqrLower = q1 - 1.5 * iqr;
  const iqrUpper = q3 + 1.5 * iqr;

  for (let index = config.window; index < series.length; index += 1) {
    const window = adjusted.slice(index - config.window, index);
    const average = mean(window);
    const sigma = standardDeviation(window, average);
    const observed = values[index];
    const observedAdjusted = adjusted[index];

    // Deviatsiyasi nolga teng oyna (o'zgarmas qiymat) — z-score ma'nosiz.
    const zScore = sigma > 0 ? (observedAdjusted - average) / sigma : null;
    const absoluteZ = zScore === null ? 0 : Math.abs(zScore);

    let severity: DetectedAnomaly["severity"] | null = null;
    let method: DetectedAnomaly["method"] = "zscore";

    if (absoluteZ >= config.criticalZ) {
      severity = "CRITICAL";
    } else if (absoluteZ >= config.warningZ) {
      severity = "WARNING";
    } else if (iqr > 0 && (observed < iqrLower || observed > iqrUpper)) {
      // Z-score chegaradan o'tmagan, lekin qiymat umumiy taqsimotdan tashqarida.
      severity = "INFO";
      method = "iqr";
    }

    if (!severity) continue;

    // Kutilgan qiymat asl o'lchov birligiga qaytariladi.
    const expected =
      method === "iqr"
        ? quantile(sorted, 0.5)
        : average * factorFor(series[index].date);
    const deviationPct =
      expected !== 0 ? ((observed - expected) / Math.abs(expected)) * 100 : 0;

    anomalies.push({
      metricKey,
      date: series[index].date,
      label: series[index].label,
      observed: Math.round(observed * 1000) / 1000,
      expected: Math.round(expected * 1000) / 1000,
      deviationPct: Math.round(deviationPct * 10) / 10,
      zScore: zScore === null ? null : Math.round(zScore * 100) / 100,
      severity,
      method,
      trend: buildTrend(series, index, expected, config.contextSize),
    });
  }

  return anomalies;
}

const SEVERITY_RANK: Record<DetectedAnomaly["severity"], number> = {
  CRITICAL: 0,
  WARNING: 1,
  INFO: 2,
};

/** Eng jiddiy va eng yangi anomaliyalar birinchi. */
export function rankAnomalies(anomalies: DetectedAnomaly[]) {
  return [...anomalies].sort(
    (a, b) =>
      SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
      b.date.localeCompare(a.date) ||
      Math.abs(b.deviationPct) - Math.abs(a.deviationPct),
  );
}
