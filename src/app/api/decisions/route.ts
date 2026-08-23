import { apiFail, apiOk, withApiErrorHandling } from "@/lib/api/response";
import { generateDecision } from "@/lib/ai/tasks/decision-generate";
import { requireUser } from "@/lib/auth/guard";
import { getAnalysisMetric } from "@/lib/analytics/series";
import { prisma } from "@/lib/db";
import { loadOrgEconomics } from "@/lib/economics/config";
import { calculateSavings } from "@/lib/economics/kpi";
import { evaluatePeriod, filterByRange } from "@/lib/metrics/compute";
import { PERIODS, resolvePeriodRange, startOfDay } from "@/lib/metrics/period";
import { loadMetricSource } from "@/lib/metrics/source";

/**
 * Serverless funksiyaning default chegarasi 10 soniya, bu esa
 * AI so'rovi yoki katta faylni qayta ishlash uchun yetmaydi.
 */
export const maxDuration = 120;
const DAY_MS = 86_400_000;
/** Bir marta generatsiyada nechta qaror tayyorlanadi — AI xarajatini cheklaydi. */
const MAX_GENERATED = 4;

function serializeDecision(decision: {
  id: string;
  code: string;
  title: string;
  summary: string;
  priority: string;
  status: string;
  confidence: number;
  payload: unknown;
  feedback: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
  anomalyId: string | null;
}) {
  return {
    id: decision.id,
    code: decision.code,
    title: decision.title,
    summary: decision.summary,
    priority: decision.priority,
    status: decision.status,
    confidence: decision.confidence,
    payload: decision.payload,
    feedback: decision.feedback,
    anomalyId: decision.anomalyId,
    createdAt: decision.createdAt.toISOString(),
    reviewedAt: decision.reviewedAt?.toISOString() ?? null,
  };
}

export const GET = withApiErrorHandling(async () => {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const decisions = await prisma.decision.findMany({
    where: { orgId: guard.user.organization.id },
    orderBy: [{ createdAt: "desc" }],
    include: {
      anomaly: {
        select: {
          id: true,
          metricKey: true,
          detectedAt: true,
          severity: true,
          observed: true,
          expected: true,
          deviationPct: true,
          zScore: true,
          trend: true,
        },
      },
    },
  });

  return apiOk(
    decisions.map((decision) => ({
      ...serializeDecision(decision),
      anomaly: decision.anomaly
        ? {
            id: decision.anomaly.id,
            metricKey: decision.anomaly.metricKey,
            metricLabel:
              getAnalysisMetric(decision.anomaly.metricKey)?.label ??
              decision.anomaly.metricKey,
            unit: getAnalysisMetric(decision.anomaly.metricKey)?.unit ?? "",
            date: decision.anomaly.detectedAt.toISOString().slice(0, 10),
            severity: decision.anomaly.severity,
            observed: decision.anomaly.observed,
            expected: decision.anomaly.expected,
            deviationPct: decision.anomaly.deviationPct,
            zScore: decision.anomaly.zScore,
            trend: decision.anomaly.trend,
          }
        : null,
    })),
  );
});

/** Ochiq anomaliyalardan qaror tavsiyalarini generatsiya qiladi. */
export const POST = withApiErrorHandling(async () => {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const orgId = guard.user.organization.id;

  // Qaror biriktirilmagan, eng jiddiy anomaliyalar tanlanadi.
  const candidates = await prisma.anomaly.findMany({
    where: { orgId, status: "OPEN", decisions: { none: {} } },
    orderBy: [{ severity: "asc" }, { detectedAt: "desc" }],
    take: MAX_GENERATED,
  });

  if (candidates.length === 0) {
    return apiOk({ created: [], message: "Yangi qaror uchun ochiq anomaliya yo'q." });
  }

  const loaded = await loadMetricSource(orgId);
  const { eesConfig, investment } = await loadOrgEconomics(orgId);

  let economics = {
    periodLabel: "30 kun",
    cost: null as number | null,
    volume: null as number | null,
    laborHours: null as number | null,
    processingSeconds: null as number | null,
    automation: null as number | null,
    ees: null as number | null,
    savedCost: null as number | null,
  };

  if (loaded.ok) {
    const definition = PERIODS.month;
    const range = resolvePeriodRange("month", loaded.source.latestDate);
    const currentRows = filterByRange(loaded.source.rows, range.from, range.to);
    const current = evaluatePeriod(currentRows, eesConfig);

    const baselineDays = eesConfig.baselineDays ?? 60;
    const baselineTo = new Date(
      startOfDay(loaded.source.earliestDate).getTime() + (baselineDays - 1) * DAY_MS,
    );
    const baseline = evaluatePeriod(
      filterByRange(loaded.source.rows, loaded.source.earliestDate, baselineTo),
      eesConfig,
    );

    const savings = calculateSavings({
      baseline: baseline.aggregate,
      current: current.aggregate,
      currentDays: definition.days,
      investment,
    });

    economics = {
      periodLabel: `${range.from.toISOString().slice(0, 10)} — ${range.to.toISOString().slice(0, 10)}`,
      cost: current.aggregate.cost,
      volume: current.aggregate.volume,
      laborHours: current.aggregate.laborHours,
      processingSeconds: current.aggregate.processingSeconds,
      automation: current.aggregate.automation,
      ees: current.ees.score,
      savedCost: savings.savedCost,
    };
  }

  const lastDecision = await prisma.decision.findFirst({
    where: { orgId },
    orderBy: { createdAt: "desc" },
    select: { code: true },
  });

  let sequence = lastDecision
    ? Number(lastDecision.code.replace(/\D/g, "")) || 0
    : 0;

  const created: ReturnType<typeof serializeDecision>[] = [];
  const failures: string[] = [];

  // Chaqiruvlar parallel: ketma-ket bo'lsa 4 ta anomaliya ~40 soniya olardi
  // va serverless funksiya chegarasiga yaqinlashardi.
  const generated = await Promise.all(
    candidates.map(async (anomaly) => {
      const metric = getAnalysisMetric(anomaly.metricKey);

      return {
        anomaly,
        metric,
        result: await generateDecision({
          orgId,
          metricLabel: metric?.label ?? anomaly.metricKey,
          unit: metric?.unit ?? "",
          date: anomaly.detectedAt.toISOString().slice(0, 10),
          observed: anomaly.observed,
          expected: anomaly.expected,
          deviationPct: anomaly.deviationPct,
          zScore: anomaly.zScore,
          severity: anomaly.severity,
          economics,
        }),
      };
    }),
  );

  for (const { anomaly, metric, result } of generated) {
    if (!result.ok) {
      failures.push(result.message);
      continue;
    }

    sequence += 1;
    const code = `DEC-${String(sequence).padStart(3, "0")}`;

    const decision = await prisma.decision.create({
      data: {
        orgId,
        anomalyId: anomaly.id,
        code,
        title: result.data.title,
        summary: result.data.summary,
        priority: result.data.priority,
        confidence: Math.round(result.data.confidence),
        payload: {
          problem: result.data.problem,
          factors: result.data.factors,
          recommendation: result.data.recommendation,
          rationale: result.data.rationale,
          effects: result.data.effects,
          steps: result.data.steps,
          metricLabel: metric?.label ?? anomaly.metricKey,
          unit: metric?.unit ?? "",
          model: result.model,
        },
      },
    });

    created.push(serializeDecision(decision));
  }

  if (created.length === 0) {
    return apiFail(
      "AI_UNAVAILABLE",
      failures[0] ?? "Qaror generatsiya qilinmadi.",
      503,
    );
  }

  return apiOk({
    created,
    skipped: failures.length,
    message: `${created.length} ta qaror tavsiyasi tayyorlandi.`,
  });
});
