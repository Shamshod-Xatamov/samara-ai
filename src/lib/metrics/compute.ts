import {
  calculateEes,
  type EesConfig,
  type EesInputs,
  type EesResult,
} from "@/lib/economics/ees";

import {
  bucketStart,
  formatBucketLabel,
  type BucketUnit,
  type PeriodKey,
} from "./period";

/**
 * Tozalangan qatorlardan metrika hisoblash.
 *
 * Kirish — `dataset_rows.clean`, ya'ni kanonik kalitlar bo'yicha
 * normallashtirilgan obyektlar. Hech qanday AI ishlatilmaydi.
 */

export type CleanRow = Record<string, string | number | boolean | null>;

export type Aggregate = {
  rowCount: number;
  volume: number | null;
  revenue: number | null;
  cost: number | null;
  laborHours: number | null;
  errors: number | null;
  processingSeconds: number | null;
  automation: number | null;
};

const EMPTY_AGGREGATE: Aggregate = {
  rowCount: 0,
  volume: null,
  revenue: null,
  cost: null,
  laborHours: null,
  errors: null,
  processingSeconds: null,
  automation: null,
};

function numeric(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Yig'indi: birorta ham qiymat bo'lmasa `null` (0 emas — bu boshqa ma'no). */
function sumOf(rows: CleanRow[], key: string): number | null {
  let total = 0;
  let seen = false;

  for (const row of rows) {
    const value = numeric(row[key]);
    if (value === null) continue;
    total += value;
    seen = true;
  }

  return seen ? total : null;
}

function averageOf(rows: CleanRow[], key: string): number | null {
  let total = 0;
  let count = 0;

  for (const row of rows) {
    const value = numeric(row[key]);
    if (value === null) continue;
    total += value;
    count += 1;
  }

  return count > 0 ? total / count : null;
}

export function aggregateRows(rows: CleanRow[]): Aggregate {
  if (rows.length === 0) return EMPTY_AGGREGATE;

  return {
    rowCount: rows.length,
    volume: sumOf(rows, "hajm"),
    revenue: sumOf(rows, "daromad"),
    cost: sumOf(rows, "xarajat"),
    laborHours: sumOf(rows, "mehnat_soat"),
    errors: sumOf(rows, "xato_soni"),
    processingSeconds: averageOf(rows, "qayta_ishlash_vaqti"),
    automation: averageOf(rows, "avtomatlashtirilgan"),
  };
}

function divide(numerator: number | null, denominator: number | null) {
  if (numerator === null || denominator === null || denominator === 0) return null;
  return numerator / denominator;
}

/** Birlik xarajat — hajm bo'lmasa qator soniga bo'linadi. */
export function unitCostOf(aggregate: Aggregate) {
  const basis = aggregate.volume ?? (aggregate.rowCount || null);
  return divide(aggregate.cost, basis);
}

export function laborHoursPerUnitOf(aggregate: Aggregate) {
  const basis = aggregate.volume ?? (aggregate.rowCount || null);
  return divide(aggregate.laborHours, basis);
}

/** Sifat ulushi: 1 − xato / hajm. Xato ustuni bo'lmasa `null`. */
export function qualityRatioOf(aggregate: Aggregate) {
  const ratio = divide(aggregate.errors, aggregate.volume);
  if (ratio === null) return null;

  return Math.min(1, Math.max(0, 1 - ratio));
}

export function toEesInputs(aggregate: Aggregate): EesInputs {
  return {
    processingSeconds: aggregate.processingSeconds,
    unitCost: unitCostOf(aggregate),
    laborProductivity: divide(aggregate.revenue, aggregate.laborHours),
    automation: aggregate.automation,
    qualityRatio: qualityRatioOf(aggregate),
  };
}

export function evaluatePeriod(
  rows: CleanRow[],
  config: EesConfig,
): { aggregate: Aggregate; ees: EesResult } {
  const aggregate = aggregateRows(rows);

  return {
    aggregate,
    ees: calculateEes(toEesInputs(aggregate), config),
  };
}

// --- Vaqt o'qi bo'yicha bo'lish ---

export type MetricPoint = {
  label: string;
  bucketStart: string;
  efficiency: number | null;
  cost: number | null;
  processing: number | null;
  accuracy: number | null;
  productivity: number | null;
};

export function rowDate(row: CleanRow): Date | null {
  const value = row.sana;
  if (typeof value !== "string") return null;

  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function filterByRange(rows: CleanRow[], from: Date, to: Date) {
  return rows.filter((row) => {
    const date = rowDate(row);
    if (!date) return false;

    return date >= from && date <= to;
  });
}

export function buildSeries(
  rows: CleanRow[],
  unit: BucketUnit,
  period: PeriodKey,
  config: EesConfig,
): MetricPoint[] {
  const buckets = new Map<number, CleanRow[]>();

  for (const row of rows) {
    const date = rowDate(row);
    if (!date) continue;

    const key = bucketStart(date, unit).getTime();
    const existing = buckets.get(key);

    if (existing) existing.push(row);
    else buckets.set(key, [row]);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a - b)
    .map(([timestamp, bucketRows]) => {
      const date = new Date(timestamp);
      const { aggregate, ees } = evaluatePeriod(bucketRows, config);
      const laborComponent = ees.components.find(
        (component) => component.key === "labor",
      );
      const qualityRatio = qualityRatioOf(aggregate);

      return {
        label: formatBucketLabel(date, unit, period),
        bucketStart: date.toISOString().slice(0, 10),
        efficiency: ees.score,
        cost: aggregate.cost === null ? null : Math.round(aggregate.cost * 10) / 10,
        processing:
          aggregate.processingSeconds === null
            ? null
            : Math.round(aggregate.processingSeconds * 100) / 100,
        accuracy:
          qualityRatio === null ? null : Math.round(qualityRatio * 1000) / 10,
        productivity: laborComponent?.score ?? null,
      };
    });
}
