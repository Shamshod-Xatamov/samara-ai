import type { NextRequest } from "next/server";

import {
  ApiErrorCode,
  apiFail,
  apiOk,
  withApiErrorHandling,
} from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guard";
import { loadOrgEconomics } from "@/lib/economics/config";
import { calculateSavings, percentChange } from "@/lib/economics/kpi";
import {
  buildSeries,
  evaluatePeriod,
  filterByRange,
  qualityRatioOf,
} from "@/lib/metrics/compute";
import {
  PERIODS,
  isPeriodKey,
  resolvePeriodRange,
  startOfDay,
} from "@/lib/metrics/period";
import { describeSourceError, loadMetricSource } from "@/lib/metrics/source";

const DAY_MS = 86_400_000;

type Kpi = {
  key: string;
  label: string;
  value: number | null;
  unit: string;
  decimals: number;
  /** Oldingi davrga nisbatan o'zgarish, % */
  change: number | null;
  /** Mutlaq o'zgarish — foizsiz ko'rsatiladigan KPI'lar uchun */
  absoluteChange: number | null;
  /** Qaysi yo'nalish yaxshi hisoblanadi */
  positiveWhen: "up" | "down";
  comparison: string;
  /** Qiymat hisoblanmagan bo'lsa sabab */
  note?: string;
};

export const GET = withApiErrorHandling(async (request: NextRequest) => {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const periodParam = url.searchParams.get("period") ?? "week";
  const datasetId = url.searchParams.get("datasetId") ?? undefined;

  if (!isPeriodKey(periodParam)) {
    return apiFail(ApiErrorCode.validation, "Davr noto'g'ri ko'rsatilgan.", 422);
  }

  const orgId = guard.user.organization.id;
  const loaded = await loadMetricSource(orgId, datasetId);

  if (!loaded.ok) {
    return apiFail(
      "NO_METRIC_SOURCE",
      describeSourceError(loaded.error),
      409,
      loaded.error,
    );
  }

  const { source } = loaded;
  const { eesConfig, investment } = await loadOrgEconomics(orgId);

  const definition = PERIODS[periodParam];
  // Oyna ma'lumotdagi eng so'nggi sanaga bog'lanadi — arxiv ma'lumot bilan
  // ishlaganda ham davr bo'sh qolmaydi.
  const range = resolvePeriodRange(periodParam, source.latestDate);

  const currentRows = filterByRange(source.rows, range.from, range.to);
  const previousRows = filterByRange(
    source.rows,
    range.previousFrom,
    range.previousTo,
  );

  const current = evaluatePeriod(currentRows, eesConfig);
  const previous = evaluatePeriod(previousRows, eesConfig);

  // Bazaviy davr — ma'lumotning birinchi N kuni (AI joriy etilishidan oldin).
  const baselineDays = eesConfig.baselineDays ?? 60;
  const baselineTo = new Date(
    startOfDay(source.earliestDate).getTime() + (baselineDays - 1) * DAY_MS,
  );
  const baselineRows = filterByRange(source.rows, source.earliestDate, baselineTo);
  const baseline = evaluatePeriod(baselineRows, eesConfig);

  const savings = calculateSavings({
    baseline: baseline.aggregate,
    current: current.aggregate,
    currentDays: definition.days,
    investment,
  });

  const previousSavings = calculateSavings({
    baseline: baseline.aggregate,
    current: previous.aggregate,
    currentDays: definition.days,
    investment,
  });

  const currentQuality = qualityRatioOf(current.aggregate);
  const previousQuality = qualityRatioOf(previous.aggregate);

  const kpis: Kpi[] = [
    {
      key: "efficiency",
      label: "Samaradorlik indeksi",
      value: current.ees.score,
      unit: "%",
      decimals: 1,
      change: percentChange(current.ees.score, previous.ees.score),
      absoluteChange:
        current.ees.score !== null && previous.ees.score !== null
          ? current.ees.score - previous.ees.score
          : null,
      positiveWhen: "up",
      comparison: "oldingi davrga nisbatan",
      note:
        current.ees.coverage < 1
          ? `Indeks vaznlarning ${Math.round(current.ees.coverage * 100)}% qismi bo'yicha hisoblandi`
          : undefined,
    },
    {
      key: "processing",
      label: "Qayta ishlash vaqti",
      value: current.aggregate.processingSeconds,
      unit: "soniya",
      decimals: 2,
      change: percentChange(
        current.aggregate.processingSeconds,
        previous.aggregate.processingSeconds,
      ),
      absoluteChange: null,
      positiveWhen: "down",
      comparison: "o'rtacha qiymat",
    },
    {
      key: "accuracy",
      label: "Ma'lumot aniqligi",
      value: currentQuality === null ? null : currentQuality * 100,
      unit: "%",
      decimals: 1,
      change: percentChange(
        currentQuality === null ? null : currentQuality * 100,
        previousQuality === null ? null : previousQuality * 100,
      ),
      absoluteChange: null,
      positiveWhen: "up",
      comparison: "xatosiz yozuvlar ulushi",
    },
    {
      key: "automation",
      label: "Avtomatlashtirish",
      value: current.aggregate.automation,
      unit: "%",
      decimals: 1,
      change: percentChange(
        current.aggregate.automation,
        previous.aggregate.automation,
      ),
      absoluteChange: null,
      positiveWhen: "up",
      comparison: "jarayonlar ulushi",
    },
    {
      key: "cost",
      label: "Operatsion xarajat",
      value: current.aggregate.cost,
      unit: "mln so'm",
      decimals: 1,
      change: percentChange(current.aggregate.cost, previous.aggregate.cost),
      absoluteChange: null,
      positiveWhen: "down",
      comparison: `${definition.label} davri uchun`,
    },
    {
      key: "savedCost",
      label: "Tejalgan xarajat",
      value: savings.savedCost,
      unit: "mln so'm",
      decimals: 1,
      change: percentChange(savings.savedCost, previousSavings.savedCost),
      absoluteChange: null,
      positiveWhen: "up",
      comparison: "bazaviy davrga nisbatan",
    },
    {
      key: "savedHours",
      label: "Tejalgan vaqt",
      value: savings.savedHours,
      unit: "soat",
      decimals: 0,
      change: null,
      absoluteChange:
        savings.savedHours !== null && previousSavings.savedHours !== null
          ? savings.savedHours - previousSavings.savedHours
          : null,
      positiveWhen: "up",
      comparison: "bazaviy davrga nisbatan",
    },
    {
      key: "roi",
      label: "Investitsiya qaytimi",
      value: savings.roi,
      unit: "%",
      decimals: 1,
      change: null,
      absoluteChange: null,
      positiveWhen: "up",
      comparison: "yillik ko'rinishda",
      note:
        investment === null
          ? "Sozlamalarda AI joriy etish xarajatini kiriting"
          : undefined,
    },
  ];

  return apiOk({
    source: {
      datasetId: source.dataset.id,
      datasetName: source.dataset.name,
      rowCount: source.dataset.rowCount,
      quality: source.dataset.cleanedQualityScore ?? source.dataset.qualityScore,
      earliestDate: source.earliestDate.toISOString().slice(0, 10),
      latestDate: source.latestDate.toISOString().slice(0, 10),
      availableKeys: source.availableKeys,
    },
    period: {
      key: periodParam,
      label: definition.label,
      from: range.from.toISOString().slice(0, 10),
      to: range.to.toISOString().slice(0, 10),
      rowCount: currentRows.length,
    },
    baseline: {
      from: source.earliestDate.toISOString().slice(0, 10),
      to: baselineTo.toISOString().slice(0, 10),
      days: baselineDays,
      rowCount: baselineRows.length,
    },
    kpis,
    series: buildSeries(currentRows, definition.bucket, periodParam, eesConfig),
    ees: {
      score: current.ees.score,
      coverage: current.ees.coverage,
      components: current.ees.components,
    },
  });
});
