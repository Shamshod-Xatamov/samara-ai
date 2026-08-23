import type { NextRequest } from "next/server";
import { z } from "zod";

import {
  ApiErrorCode,
  apiFail,
  apiOk,
  withApiErrorHandling,
} from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guard";
import { loadOrgEconomics } from "@/lib/economics/config";
import { calculateSavings } from "@/lib/economics/kpi";
import { calculateWhatIf } from "@/lib/economics/whatif";
import {
  evaluatePeriod,
  filterByRange,
  laborHoursPerUnitOf,
  qualityRatioOf,
  toEesInputs,
  unitCostOf,
  type Aggregate,
} from "@/lib/metrics/compute";
import {
  PERIODS,
  isPeriodKey,
  resolvePeriodRange,
  startOfDay,
} from "@/lib/metrics/period";
import { describeSourceError, loadMetricSource } from "@/lib/metrics/source";

const DAY_MS = 86_400_000;

/**
 * Oldin/keyin taqqoslash bir xil hajmga keltiriladi: bazaviy davrda hajm
 * boshqacha bo'lgani uchun mutlaq qiymatlarni to'g'ridan-to'g'ri solishtirish
 * noto'g'ri bo'lardi. Har ikki davr "joriy hajmda, 30 kunlik" ko'rinishga o'tkaziladi.
 */
function monthlyEquivalent(
  perUnit: number | null,
  currentVolume: number | null,
  currentDays: number,
) {
  if (perUnit === null || currentVolume === null || currentDays <= 0) return null;

  return perUnit * (currentVolume / currentDays) * 30;
}

function volumeOf(aggregate: Aggregate) {
  return aggregate.volume ?? (aggregate.rowCount || null);
}

const whatIfSchema = z.object({
  automation: z.number().min(0).max(100),
  accuracy: z.number().min(0).max(100),
  period: z.string().optional(),
  datasetId: z.string().optional(),
});

async function buildContext(orgId: string, periodParam: string, datasetId?: string) {
  const loaded = await loadMetricSource(orgId, datasetId);
  if (!loaded.ok) return { ok: false as const, error: loaded.error };

  const { source } = loaded;
  const { eesConfig, investment } = await loadOrgEconomics(orgId);
  const definition = PERIODS[periodParam as keyof typeof PERIODS];
  const range = resolvePeriodRange(definition.key, source.latestDate);

  const currentRows = filterByRange(source.rows, range.from, range.to);
  const current = evaluatePeriod(currentRows, eesConfig);

  const baselineDays = eesConfig.baselineDays ?? 60;
  const baselineTo = new Date(
    startOfDay(source.earliestDate).getTime() + (baselineDays - 1) * DAY_MS,
  );
  const baselineRows = filterByRange(source.rows, source.earliestDate, baselineTo);
  const baseline = evaluatePeriod(baselineRows, eesConfig);

  return {
    ok: true as const,
    source,
    eesConfig,
    investment,
    definition,
    range,
    baselineTo,
    current,
    baseline,
    currentRowCount: currentRows.length,
    baselineRowCount: baselineRows.length,
  };
}

export const GET = withApiErrorHandling(async (request: NextRequest) => {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const periodParam = url.searchParams.get("period") ?? "month";
  const datasetId = url.searchParams.get("datasetId") ?? undefined;

  if (!isPeriodKey(periodParam)) {
    return apiFail(ApiErrorCode.validation, "Davr noto'g'ri ko'rsatilgan.", 422);
  }

  const context = await buildContext(
    guard.user.organization.id,
    periodParam,
    datasetId,
  );

  if (!context.ok) {
    return apiFail(
      "NO_METRIC_SOURCE",
      describeSourceError(context.error),
      409,
      context.error,
    );
  }

  const { current, baseline, definition, eesConfig, investment, source } = context;
  const currentVolume = volumeOf(current.aggregate);

  const savings = calculateSavings({
    baseline: baseline.aggregate,
    current: current.aggregate,
    currentDays: definition.days,
    investment,
  });

  const baselineQuality = qualityRatioOf(baseline.aggregate);
  const currentQuality = qualityRatioOf(current.aggregate);

  const comparison = [
    {
      key: "processing",
      label: "Qayta ishlash vaqti",
      unit: "soniya",
      decimals: 2,
      before: baseline.aggregate.processingSeconds,
      after: current.aggregate.processingSeconds,
      positiveDirection: "down" as const,
    },
    {
      key: "labor",
      label: "Mehnat vaqti",
      unit: "soat / oy",
      decimals: 0,
      before: monthlyEquivalent(
        laborHoursPerUnitOf(baseline.aggregate),
        currentVolume,
        definition.days,
      ),
      after: monthlyEquivalent(
        laborHoursPerUnitOf(current.aggregate),
        currentVolume,
        definition.days,
      ),
      positiveDirection: "down" as const,
    },
    {
      key: "cost",
      label: "Operatsion xarajat",
      unit: "mln so'm / oy",
      decimals: 1,
      before: monthlyEquivalent(
        unitCostOf(baseline.aggregate),
        currentVolume,
        definition.days,
      ),
      after: monthlyEquivalent(
        unitCostOf(current.aggregate),
        currentVolume,
        definition.days,
      ),
      positiveDirection: "down" as const,
    },
    {
      key: "error",
      label: "Xatolar darajasi",
      unit: "%",
      decimals: 2,
      before: baselineQuality === null ? null : (1 - baselineQuality) * 100,
      after: currentQuality === null ? null : (1 - currentQuality) * 100,
      positiveDirection: "down" as const,
    },
    {
      key: "productivity",
      label: "Mehnat unumdorligi",
      unit: "mln so'm / soat",
      decimals: 3,
      before:
        baseline.aggregate.revenue !== null && baseline.aggregate.laborHours
          ? baseline.aggregate.revenue / baseline.aggregate.laborHours
          : null,
      after:
        current.aggregate.revenue !== null && current.aggregate.laborHours
          ? current.aggregate.revenue / current.aggregate.laborHours
          : null,
      positiveDirection: "up" as const,
    },
  ];

  return apiOk({
    source: {
      datasetId: source.dataset.id,
      datasetName: source.dataset.name,
      earliestDate: source.earliestDate.toISOString().slice(0, 10),
      latestDate: source.latestDate.toISOString().slice(0, 10),
    },
    period: {
      key: periodParam,
      label: definition.label,
      from: context.range.from.toISOString().slice(0, 10),
      to: context.range.to.toISOString().slice(0, 10),
      rowCount: context.currentRowCount,
    },
    baseline: {
      from: source.earliestDate.toISOString().slice(0, 10),
      to: context.baselineTo.toISOString().slice(0, 10),
      days: eesConfig.baselineDays ?? 60,
      rowCount: context.baselineRowCount,
    },
    ees: {
      score: current.ees.score,
      baselineScore: baseline.ees.score,
      coverage: current.ees.coverage,
      components: current.ees.components,
      weights: eesConfig.weights,
    },
    savings: {
      ...savings,
      investment,
      investmentIsAssumption: investment !== null,
    },
    comparison,
    scenarioDefaults: {
      automation: current.aggregate.automation,
      accuracy: currentQuality === null ? null : currentQuality * 100,
    },
  });
});

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiFail(ApiErrorCode.invalidJson, "So'rov formati noto'g'ri.", 400);
  }

  const parsed = whatIfSchema.safeParse(body);

  if (!parsed.success) {
    return apiFail(
      ApiErrorCode.validation,
      "Ssenariy parametrlari noto'g'ri.",
      422,
      z.treeifyError(parsed.error),
    );
  }

  const periodParam = parsed.data.period ?? "month";

  if (!isPeriodKey(periodParam)) {
    return apiFail(ApiErrorCode.validation, "Davr noto'g'ri ko'rsatilgan.", 422);
  }

  const context = await buildContext(
    guard.user.organization.id,
    periodParam,
    parsed.data.datasetId,
  );

  if (!context.ok) {
    return apiFail("NO_METRIC_SOURCE", describeSourceError(context.error), 409);
  }

  const { current, baseline, definition, eesConfig, investment } = context;
  const currentInputs = toEesInputs(current.aggregate);

  const scenario = calculateWhatIf({
    current: currentInputs,
    targetAutomation: parsed.data.automation,
    targetAccuracy: parsed.data.accuracy,
    config: eesConfig,
  });

  const currentVolume = volumeOf(current.aggregate);

  // Ssenariydagi birlik xarajat asosida yangi tejam.
  const projectedAggregate: Aggregate = {
    ...current.aggregate,
    cost:
      scenario.projected.unitCost !== null && currentVolume !== null
        ? scenario.projected.unitCost * currentVolume
        : current.aggregate.cost,
  };

  const projectedSavings = calculateSavings({
    baseline: baseline.aggregate,
    current: projectedAggregate,
    currentDays: definition.days,
    investment,
  });

  const actualSavings = calculateSavings({
    baseline: baseline.aggregate,
    current: current.aggregate,
    currentDays: definition.days,
    investment,
  });

  return apiOk({
    current: {
      ees: current.ees.score,
      inputs: currentInputs,
      savings: actualSavings,
    },
    projected: {
      ees: scenario.ees.score,
      inputs: scenario.projected,
      components: scenario.ees.components,
      savings: projectedSavings,
    },
    deltas: scenario.deltas,
    /** Koeffitsientlar tarixiy ma'lumotdan emas, sozlamadan olingan. */
    estimateNote:
      "Ssenariy natijasi sozlamalardagi elastiklik koeffitsientlari asosida baholangan.",
  });
});
