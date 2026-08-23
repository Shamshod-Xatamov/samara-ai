import type { NextRequest } from "next/server";

import {
  ApiErrorCode,
  apiFail,
  apiOk,
  withApiErrorHandling,
} from "@/lib/api/response";
import { explainAnomaly } from "@/lib/ai/tasks/anomaly-explanation";
import { requireUser } from "@/lib/auth/guard";
import { getAnalysisMetric } from "@/lib/analytics/series";
import { prisma } from "@/lib/db";

/**
 * Serverless funksiyaning default chegarasi 10 soniya, bu esa
 * AI so'rovi yoki katta faylni qayta ishlash uchun yetmaydi.
 */
export const maxDuration = 60;

export const POST = withApiErrorHandling(
  async (
    _request: NextRequest,
    context: RouteContext<"/api/ai/anomalies/[id]/explain">,
  ) => {
    const guard = await requireUser();
    if (!guard.ok) return guard.response;

    const { id } = await context.params;
    const orgId = guard.user.organization.id;

    const anomaly = await prisma.anomaly.findFirst({ where: { id, orgId } });

    if (!anomaly) {
      return apiFail(ApiErrorCode.notFound, "Anomaliya topilmadi.", 404);
    }

    const metric = getAnalysisMetric(anomaly.metricKey);
    const trend = Array.isArray(anomaly.trend)
      ? (anomaly.trend as Array<{ label: string; actual: number }>)
      : [];

    const result = await explainAnomaly({
      orgId,
      metricLabel: metric?.label ?? anomaly.metricKey,
      unit: metric?.unit ?? "",
      date: anomaly.detectedAt.toISOString().slice(0, 10),
      observed: anomaly.observed,
      expected: anomaly.expected,
      deviationPct: anomaly.deviationPct,
      zScore: anomaly.zScore,
      severity: anomaly.severity,
      method: anomaly.method,
      trend,
    });

    if (!result.ok) {
      // Izoh bo'lmasa ham anomaliya statistikasi ko'rinib turadi.
      return apiFail("AI_UNAVAILABLE", result.message, 503);
    }

    await prisma.anomaly.update({
      where: { id: anomaly.id },
      data: { aiExplanation: result.data },
    });

    return apiOk({
      explanation: result.data,
      cached: result.cached,
      model: result.model,
    });
  },
);
