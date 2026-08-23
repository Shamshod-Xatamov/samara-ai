import type { NextRequest } from "next/server";

import {
  ApiErrorCode,
  apiFail,
  apiOk,
  withApiErrorHandling,
} from "@/lib/api/response";
import { explainForecast } from "@/lib/ai/tasks/forecast-insight";
import { requireUser } from "@/lib/auth/guard";
import { forecastSeries } from "@/lib/analytics/forecast";
import {
  availableMetrics,
  buildDailySeries,
  getAnalysisMetric,
} from "@/lib/analytics/series";
import { describeSourceError, loadMetricSource } from "@/lib/metrics/source";

/**
 * Serverless funksiyaning default chegarasi 10 soniya, bu esa
 * AI so'rovi yoki katta faylni qayta ishlash uchun yetmaydi.
 */
export const maxDuration = 60;
const MAX_HISTORY_POINTS = 45;

export const GET = withApiErrorHandling(async (request: NextRequest) => {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const metricKey = url.searchParams.get("metric") ?? "xarajat";
  const horizon = Math.min(
    30,
    Math.max(3, Number(url.searchParams.get("horizon") ?? 7)),
  );

  const metric = getAnalysisMetric(metricKey);

  if (!metric) {
    return apiFail(ApiErrorCode.validation, "Ko'rsatkich noto'g'ri.", 422);
  }

  const orgId = guard.user.organization.id;
  const loaded = await loadMetricSource(orgId);

  if (!loaded.ok) {
    return apiFail("NO_METRIC_SOURCE", describeSourceError(loaded.error), 409);
  }

  const { source } = loaded;
  const supported = availableMetrics(source.availableKeys);

  if (!supported.some((item) => item.key === metric.key)) {
    return apiFail(
      "METRIC_UNAVAILABLE",
      `"${metric.label}" uchun kerakli ustunlar bog'lanmagan: ${metric.requires.join(", ")}.`,
      409,
    );
  }

  const series = buildDailySeries(source.rows, metric.key);
  // Uzoq tarix trendni "yuvib" yuboradi — oxirgi oyna aniqroq prognoz beradi.
  const recent = series.slice(-MAX_HISTORY_POINTS);
  const forecast = forecastSeries(recent, horizon, {
    // Kunlik ishlab chiqarish ma'lumotida haftalik tebranish kuchli.
    seasonLength: 7,
    // Xarajat, hajm va vaqt manfiy bo'lolmaydi.
    nonNegative: true,
  });

  if (!forecast) {
    return apiFail(
      "NOT_ENOUGH_DATA",
      "Prognoz uchun ma'lumot yetarli emas (kamida 6 ta kuzatuv kerak).",
      409,
    );
  }

  const boundaryIndex = recent.length - 1;

  // AI izohi ixtiyoriy qatlam: ishlamasa ham prognoz qaytariladi.
  const insight = await explainForecast({
    orgId,
    metricLabel: metric.label,
    unit: metric.unit,
    positiveWhen: metric.positiveWhen,
    recent: recent.slice(-7).map((point) => ({
      label: point.label,
      value: Number(point.value.toFixed(metric.decimals)),
    })),
    forecast: forecast.points
      .slice(boundaryIndex + 1)
      .map((point) => ({
        label: point.label,
        value: Number((point.predicted ?? 0).toFixed(metric.decimals)),
      })),
    changePct: forecast.changePct,
    mape: forecast.mape,
    horizon,
  });

  return apiOk({
    metric: {
      key: metric.key,
      label: metric.label,
      shortLabel: metric.shortLabel,
      unit: metric.unit,
      decimals: metric.decimals,
      positiveWhen: metric.positiveWhen,
    },
    availableMetrics: supported.map((item) => ({
      key: item.key,
      label: item.label,
      shortLabel: item.shortLabel,
      unit: item.unit,
    })),
    source: {
      datasetId: source.dataset.id,
      datasetName: source.dataset.name,
      latestDate: source.latestDate.toISOString().slice(0, 10),
    },
    forecast: {
      points: forecast.points,
      boundaryLabel: recent[boundaryIndex]?.label ?? "",
      horizon,
      model: forecast.model,
      seasonLength: forecast.seasonLength,
      alpha: forecast.alpha,
      beta: forecast.beta,
      gamma: forecast.gamma,
      mape: forecast.mape,
      confidence: forecast.confidence,
      changePct: forecast.changePct,
      direction: forecast.direction,
    },
    insight: insight.ok
      ? { ...insight.data, cached: insight.cached, model: insight.model }
      : null,
    insightError: insight.ok ? null : insight.message,
  });
});
