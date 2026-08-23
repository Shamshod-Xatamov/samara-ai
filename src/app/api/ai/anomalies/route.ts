import type { NextRequest } from "next/server";

import { apiFail, apiOk, withApiErrorHandling } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guard";
import { detectAnomalies, rankAnomalies } from "@/lib/analytics/anomaly";
import {
  availableMetrics,
  buildDailySeries,
  getAnalysisMetric,
} from "@/lib/analytics/series";
import { prisma } from "@/lib/db";
import { describeSourceError, loadMetricSource } from "@/lib/metrics/source";

/** Tahlil oynasi — juda uzoq tarix eski anomaliyalar bilan ro'yxatni to'ldiradi. */
const ANALYSIS_WINDOW_DAYS = 120;
const MAX_RESULTS = 40;

export const GET = withApiErrorHandling(async (request: NextRequest) => {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const orgId = guard.user.organization.id;
  const url = new URL(request.url);
  const refresh = url.searchParams.get("refresh") === "1";

  const loaded = await loadMetricSource(orgId);

  if (!loaded.ok) {
    return apiFail("NO_METRIC_SOURCE", describeSourceError(loaded.error), 409);
  }

  const { source } = loaded;
  const supported = availableMetrics(source.availableKeys);

  // Aniqlash faqat so'ralganda yoki bazada hali yozuv bo'lmaganda ishlaydi:
  // har bir sahifa ochilishida qayta hisoblash keraksiz yuk.
  const existingCount = await prisma.anomaly.count({ where: { orgId } });

  if (refresh || existingCount === 0) {
    const cutoff = new Date(
      source.latestDate.getTime() - ANALYSIS_WINDOW_DAYS * 86_400_000,
    );

    for (const metric of supported) {
      const series = buildDailySeries(source.rows, metric.key).filter(
        (point) => new Date(`${point.date}T00:00:00Z`) >= cutoff,
      );

      const detected = detectAnomalies(metric.key, series);

      for (const anomaly of detected) {
        const fingerprint = `${source.dataset.id}:${anomaly.metricKey}:${anomaly.date}`;

        await prisma.anomaly.upsert({
          where: { fingerprint },
          // Mavjud yozuvda status va AI izohi saqlanib qoladi.
          update: {
            observed: anomaly.observed,
            expected: anomaly.expected,
            deviationPct: anomaly.deviationPct,
            zScore: anomaly.zScore,
            severity: anomaly.severity,
            method: anomaly.method,
            trend: anomaly.trend,
          },
          create: {
            orgId,
            datasetId: source.dataset.id,
            metricKey: anomaly.metricKey,
            detectedAt: new Date(`${anomaly.date}T00:00:00Z`),
            severity: anomaly.severity,
            method: anomaly.method,
            observed: anomaly.observed,
            expected: anomaly.expected,
            deviationPct: anomaly.deviationPct,
            zScore: anomaly.zScore,
            trend: anomaly.trend,
            context: { label: anomaly.label, datasetName: source.dataset.name },
            fingerprint,
          },
        });
      }
    }
  }

  const records = await prisma.anomaly.findMany({
    where: { orgId },
    orderBy: [{ detectedAt: "desc" }],
    take: MAX_RESULTS,
    include: { decisions: { select: { id: true, code: true, status: true } } },
  });

  const items = records.map((record) => {
    const metric = getAnalysisMetric(record.metricKey);

    return {
      id: record.id,
      metricKey: record.metricKey,
      metricLabel: metric?.label ?? record.metricKey,
      unit: metric?.unit ?? "",
      decimals: metric?.decimals ?? 2,
      date: record.detectedAt.toISOString().slice(0, 10),
      severity: record.severity,
      method: record.method,
      observed: record.observed,
      expected: record.expected,
      deviationPct: record.deviationPct,
      zScore: record.zScore,
      status: record.status,
      trend: record.trend,
      aiExplanation: record.aiExplanation,
      decisions: record.decisions,
    };
  });

  const ranked = rankAnomalies(
    items.map((item) => ({
      metricKey: item.metricKey,
      date: item.date,
      label: item.date,
      observed: item.observed,
      expected: item.expected,
      deviationPct: item.deviationPct,
      zScore: item.zScore,
      severity: item.severity,
      method: item.method as "zscore" | "iqr",
      trend: [],
    })),
  );

  const order = new Map(
    ranked.map((item, index) => [`${item.metricKey}:${item.date}`, index]),
  );

  items.sort(
    (a, b) =>
      (order.get(`${a.metricKey}:${a.date}`) ?? 0) -
      (order.get(`${b.metricKey}:${b.date}`) ?? 0),
  );

  return apiOk({
    source: {
      datasetId: source.dataset.id,
      datasetName: source.dataset.name,
      latestDate: source.latestDate.toISOString().slice(0, 10),
    },
    detection: {
      method: "rolling z-score (oyna 14 kun) + Tukey IQR",
      criticalZ: 3,
      warningZ: 2,
      windowDays: ANALYSIS_WINDOW_DAYS,
    },
    metrics: supported.map((metric) => ({
      key: metric.key,
      label: metric.label,
      unit: metric.unit,
    })),
    anomalies: items,
  });
});
