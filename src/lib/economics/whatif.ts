import { calculateEes, type EesConfig, type EesResult } from "./ees";
import type { EesInputs } from "./ees";

/**
 * Ssenariy (what-if) tahlili.
 *
 * Koeffitsientlar `org_settings.ees_config.elasticity` da saqlanadi va
 * "1 foiz punkt o'zgarish → ko'rsatkichning necha ulushga o'zgarishi" ma'nosini
 * bildiradi. Ular taxminiy: ma'lumot yetarli bo'lganda regressiya bilan
 * qayta baholanadi, shuning uchun natija "baholangan" deb belgilanadi.
 */

export type WhatIfInput = {
  current: EesInputs;
  /** Maqsad avtomatlashtirish darajasi, % */
  targetAutomation: number;
  /** Maqsad aniqlik darajasi, % */
  targetAccuracy: number;
  config: EesConfig;
};

export type WhatIfResult = {
  projected: EesInputs;
  ees: EesResult;
  deltas: {
    automation: number;
    accuracy: number;
    processingSeconds: number | null;
    unitCost: number | null;
    laborProductivity: number | null;
    qualityRatio: number | null;
  };
};

function scale(value: number | null, factor: number) {
  if (value === null) return null;
  // Koeffitsient haddan tashqari cho'zilib ketmasligi uchun chegara.
  return value * Math.min(2, Math.max(0.1, factor));
}

export function calculateWhatIf(input: WhatIfInput): WhatIfResult {
  const { current, config } = input;
  const elasticity = config.elasticity;

  const currentAutomation = current.automation ?? input.targetAutomation;
  const currentAccuracy =
    current.qualityRatio !== null ? current.qualityRatio * 100 : input.targetAccuracy;

  const deltaAutomation = input.targetAutomation - currentAutomation;
  const deltaAccuracy = input.targetAccuracy - currentAccuracy;

  const processingSeconds = scale(
    current.processingSeconds,
    1 - elasticity.timePerAutomation * deltaAutomation,
  );

  const unitCost = scale(
    current.unitCost,
    1 -
      elasticity.costPerAutomation * deltaAutomation -
      elasticity.costPerAccuracy * deltaAccuracy,
  );

  const laborProductivity = scale(
    current.laborProductivity,
    1 + (elasticity.laborPerAutomation ?? 0.01) * deltaAutomation,
  );

  const errorRate = current.qualityRatio === null ? null : 1 - current.qualityRatio;
  const projectedErrorRate = scale(
    errorRate,
    1 - elasticity.errorPerAccuracy * deltaAccuracy,
  );

  const qualityRatio =
    projectedErrorRate === null
      ? null
      : Math.min(1, Math.max(0, 1 - projectedErrorRate));

  const projected: EesInputs = {
    processingSeconds,
    unitCost,
    laborProductivity,
    automation: input.targetAutomation,
    qualityRatio,
  };

  const difference = (next: number | null, base: number | null) =>
    next === null || base === null ? null : next - base;

  return {
    projected,
    ees: calculateEes(projected, config),
    deltas: {
      automation: deltaAutomation,
      accuracy: deltaAccuracy,
      processingSeconds: difference(processingSeconds, current.processingSeconds),
      unitCost: difference(unitCost, current.unitCost),
      laborProductivity: difference(laborProductivity, current.laborProductivity),
      qualityRatio: difference(qualityRatio, current.qualityRatio),
    },
  };
}
