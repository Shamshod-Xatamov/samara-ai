import type { Aggregate } from "@/lib/metrics/compute";
import {
  laborHoursPerUnitOf,
  qualityRatioOf,
  unitCostOf,
} from "@/lib/metrics/compute";

/**
 * Iqtisodiy ko'rsatkichlar: tejam, unumdorlik o'sishi va ROI.
 * Formulalar: BACKEND_PLAN.md, 3.3-bo'lim.
 */

export type SavingsInput = {
  /** AI joriy etilishidan oldingi bazaviy davr */
  baseline: Aggregate;
  /** Joriy davr */
  current: Aggregate;
  /** Joriy davr necha kunni qamraydi — yillik ko'rsatkichga keltirish uchun */
  currentDays: number;
  /** AI joriy etish xarajati, mln so'm */
  investment: number | null;
};

export type SavingsResult = {
  /** Joriy davrda tejalgan xarajat, mln so'm */
  savedCost: number | null;
  /** Joriy davrda tejalgan mehnat vaqti, soat */
  savedHours: number | null;
  /** Yillik ko'rinishga keltirilgan tejam, mln so'm */
  annualisedSaving: number | null;
  /** Unumdorlik o'sishi, % */
  productivityGain: number | null;
  /** Investitsiya qaytimi, % */
  roi: number | null;
  /** Xato ulushining o'zgarishi, foiz punkti */
  errorRateChange: number | null;
};

function volumeOf(aggregate: Aggregate) {
  return aggregate.volume ?? (aggregate.rowCount || null);
}

function safeDivide(numerator: number | null, denominator: number | null) {
  if (numerator === null || denominator === null || denominator === 0) return null;
  return numerator / denominator;
}

export function calculateSavings(input: SavingsInput): SavingsResult {
  const { baseline, current, currentDays, investment } = input;

  const currentVolume = volumeOf(current);
  const baselineUnitCost = unitCostOf(baseline);
  const currentUnitCost = unitCostOf(current);
  const baselineHoursPerUnit = laborHoursPerUnitOf(baseline);
  const currentHoursPerUnit = laborHoursPerUnitOf(current);

  const savedCost =
    baselineUnitCost !== null && currentUnitCost !== null && currentVolume !== null
      ? (baselineUnitCost - currentUnitCost) * currentVolume
      : null;

  const savedHours =
    baselineHoursPerUnit !== null &&
    currentHoursPerUnit !== null &&
    currentVolume !== null
      ? (baselineHoursPerUnit - currentHoursPerUnit) * currentVolume
      : null;

  const annualisedSaving =
    savedCost !== null && currentDays > 0 ? (savedCost / currentDays) * 365 : null;

  const baselineProductivity = safeDivide(baseline.revenue, baseline.laborHours);
  const currentProductivity = safeDivide(current.revenue, current.laborHours);

  const productivityGain =
    baselineProductivity !== null &&
    currentProductivity !== null &&
    baselineProductivity !== 0
      ? (currentProductivity / baselineProductivity - 1) * 100
      : null;

  const roi =
    annualisedSaving !== null && investment !== null && investment > 0
      ? ((annualisedSaving - investment) / investment) * 100
      : null;

  const baselineQuality = qualityRatioOf(baseline);
  const currentQuality = qualityRatioOf(current);

  const errorRateChange =
    baselineQuality !== null && currentQuality !== null
      ? (currentQuality - baselineQuality) * 100
      : null;

  return {
    savedCost,
    savedHours,
    annualisedSaving,
    productivityGain,
    roi,
    errorRateChange,
  };
}

/** Ikki qiymat orasidagi foiz o'zgarish. */
export function percentChange(current: number | null, previous: number | null) {
  if (current === null || previous === null || previous === 0) return null;

  return ((current - previous) / Math.abs(previous)) * 100;
}
