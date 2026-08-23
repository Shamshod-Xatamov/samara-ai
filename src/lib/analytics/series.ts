import {
  aggregateRows,
  rowDate,
  type CleanRow,
} from "@/lib/metrics/compute";
import { formatBucketLabel, startOfDay } from "@/lib/metrics/period";

import type { SeriesPoint } from "./forecast";

/**
 * Kanonik qatorlardan bir o'lchovli kunlik qator quradi.
 * Prognoz ham, anomaliya ham shu qatordan foydalanadi.
 */

export type AnalysisMetricKey =
  | "xarajat"
  | "qayta_ishlash_vaqti"
  | "unumdorlik"
  | "xato_ulushi"
  | "hajm";

export type AnalysisMetric = {
  key: AnalysisMetricKey;
  label: string;
  shortLabel: string;
  unit: string;
  decimals: number;
  positiveWhen: "up" | "down";
  /** Qaysi kanonik ustunlar bo'lmasa hisoblab bo'lmaydi */
  requires: string[];
};

export const ANALYSIS_METRICS: AnalysisMetric[] = [
  {
    key: "xarajat",
    label: "Operatsion xarajat",
    shortLabel: "Xarajat",
    unit: "mln so'm",
    decimals: 2,
    positiveWhen: "down",
    requires: ["xarajat"],
  },
  {
    key: "qayta_ishlash_vaqti",
    label: "Qayta ishlash vaqti",
    shortLabel: "Vaqt",
    unit: "soniya",
    decimals: 2,
    positiveWhen: "down",
    requires: ["qayta_ishlash_vaqti"],
  },
  {
    key: "unumdorlik",
    label: "Mehnat unumdorligi",
    shortLabel: "Unumdorlik",
    unit: "mln so'm / soat",
    decimals: 3,
    positiveWhen: "up",
    requires: ["daromad", "mehnat_soat"],
  },
  {
    key: "xato_ulushi",
    label: "Xatolar ulushi",
    shortLabel: "Xatolar",
    unit: "%",
    decimals: 2,
    positiveWhen: "down",
    requires: ["xato_soni", "hajm"],
  },
  {
    key: "hajm",
    label: "Ishlab chiqarish hajmi",
    shortLabel: "Hajm",
    unit: "birlik",
    decimals: 0,
    positiveWhen: "up",
    requires: ["hajm"],
  },
];

export function getAnalysisMetric(key: string) {
  return ANALYSIS_METRICS.find((metric) => metric.key === key) ?? null;
}

export function availableMetrics(mappedKeys: string[]) {
  return ANALYSIS_METRICS.filter((metric) =>
    metric.requires.every((key) => mappedKeys.includes(key)),
  );
}

function valueFor(metric: AnalysisMetricKey, rows: CleanRow[]): number | null {
  const aggregate = aggregateRows(rows);

  switch (metric) {
    case "xarajat":
      return aggregate.cost;
    case "qayta_ishlash_vaqti":
      return aggregate.processingSeconds;
    case "hajm":
      return aggregate.volume;
    case "unumdorlik":
      return aggregate.revenue !== null && aggregate.laborHours
        ? aggregate.revenue / aggregate.laborHours
        : null;
    case "xato_ulushi":
      return aggregate.errors !== null && aggregate.volume
        ? (aggregate.errors / aggregate.volume) * 100
        : null;
  }
}

/** Kunlik qator. Ma'lumoti yo'q kunlar tashlab yuboriladi (to'ldirilmaydi). */
export function buildDailySeries(
  rows: CleanRow[],
  metric: AnalysisMetricKey,
): SeriesPoint[] {
  const buckets = new Map<number, CleanRow[]>();

  for (const row of rows) {
    const date = rowDate(row);
    if (!date) continue;

    const key = startOfDay(date).getTime();
    const existing = buckets.get(key);

    if (existing) existing.push(row);
    else buckets.set(key, [row]);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a - b)
    .map(([timestamp, bucketRows]) => {
      const date = new Date(timestamp);
      const value = valueFor(metric, bucketRows);

      return value === null
        ? null
        : {
            label: formatBucketLabel(date, "day", "month"),
            date: date.toISOString().slice(0, 10),
            value: Math.round(value * 10000) / 10000,
          };
    })
    .filter((point): point is SeriesPoint => point !== null);
}
