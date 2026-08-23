import type { NextRequest } from "next/server";
import { z } from "zod";

import {
  ApiErrorCode,
  apiFail,
  apiOk,
  withApiErrorHandling,
} from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";

const updateSchema = z.object({
  status: z.enum(["NEW", "REVIEWED", "PLANNED"]).optional(),
  feedback: z.string().max(2000).nullable().optional(),
});

export const PATCH = withApiErrorHandling(
  async (request: NextRequest, context: RouteContext<"/api/decisions/[id]">) => {
    const guard = await requireUser();
    if (!guard.ok) return guard.response;

    const { id } = await context.params;

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return apiFail(ApiErrorCode.invalidJson, "So'rov formati noto'g'ri.", 400);
    }

    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return apiFail(
        ApiErrorCode.validation,
        "Ma'lumot noto'g'ri.",
        422,
        z.treeifyError(parsed.error),
      );
    }

    const existing = await prisma.decision.findFirst({
      where: { id, orgId: guard.user.organization.id },
    });

    if (!existing) {
      return apiFail(ApiErrorCode.notFound, "Qaror topilmadi.", 404);
    }

    const isReviewed =
      parsed.data.status !== undefined && parsed.data.status !== "NEW";

    const decision = await prisma.decision.update({
      where: { id: existing.id },
      data: {
        status: parsed.data.status,
        feedback: parsed.data.feedback,
        reviewedAt: isReviewed ? new Date() : existing.reviewedAt,
        reviewedById: isReviewed ? guard.user.id : existing.reviewedById,
      },
    });

    // Qaror ko'rib chiqilsa, tegishli anomaliya ham yopiladi.
    if (isReviewed && decision.anomalyId) {
      await prisma.anomaly.update({
        where: { id: decision.anomalyId },
        data: { status: parsed.data.status === "PLANNED" ? "RESOLVED" : "REVIEWED" },
      });
    }

    return apiOk({
      id: decision.id,
      status: decision.status,
      feedback: decision.feedback,
      reviewedAt: decision.reviewedAt?.toISOString() ?? null,
    });
  },
);
