import type { NextRequest } from "next/server";

import {
  ApiErrorCode,
  apiFail,
  apiOk,
  withApiErrorHandling,
} from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guard";
import {
  serializeColumn,
  serializeDatasetSummary,
  serializeIssue,
} from "@/lib/datasets/serialize";
import { prisma } from "@/lib/db";

const PREVIEW_ROW_LIMIT = 50;

export const GET = withApiErrorHandling(
  async (_request: NextRequest, context: RouteContext<"/api/datasets/[id]">) => {
    const guard = await requireUser();
    if (!guard.ok) return guard.response;

    const { id } = await context.params;

    const dataset = await prisma.dataset.findFirst({
      // orgId shartisiz boshqa tashkilotning datasetini ochish mumkin bo'lardi.
      where: { id, orgId: guard.user.organization.id },
      include: {
        columns: { orderBy: { position: "asc" } },
        issues: { orderBy: { count: "desc" } },
        _count: { select: { issues: true } },
      },
    });

    if (!dataset) {
      return apiFail(ApiErrorCode.notFound, "Ma'lumot to'plami topilmadi.", 404);
    }

    const rows = await prisma.datasetRow.findMany({
      where: { datasetId: dataset.id },
      orderBy: { rowIndex: "asc" },
      take: PREVIEW_ROW_LIMIT,
      select: { rowIndex: true, raw: true, clean: true, isDuplicate: true },
    });

    return apiOk({
      dataset: serializeDatasetSummary(dataset),
      columns: dataset.columns.map(serializeColumn),
      issues: dataset.issues.map(serializeIssue),
      preview: {
        headers: dataset.columns.map((column) => column.sourceName),
        rows: rows.map((row) => ({
          index: row.rowIndex,
          values: row.raw,
          cleaned: row.clean,
          isDuplicate: row.isDuplicate,
        })),
        limit: PREVIEW_ROW_LIMIT,
      },
    });
  },
);

export const DELETE = withApiErrorHandling(
  async (_request: NextRequest, context: RouteContext<"/api/datasets/[id]">) => {
    const guard = await requireUser();
    if (!guard.ok) return guard.response;

    const { id } = await context.params;

    const deleted = await prisma.dataset.deleteMany({
      where: { id, orgId: guard.user.organization.id },
    });

    if (deleted.count === 0) {
      return apiFail(ApiErrorCode.notFound, "Ma'lumot to'plami topilmadi.", 404);
    }

    return apiOk({ deleted: true });
  },
);
