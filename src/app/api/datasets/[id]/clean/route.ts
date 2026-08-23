import type { NextRequest } from "next/server";

import {
  ApiErrorCode,
  apiFail,
  apiOk,
  withApiErrorHandling,
} from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import type { RawCell } from "@/lib/parsing/values";
import { cleanTable } from "@/lib/quality/clean";

/**
 * Serverless funksiyaning default chegarasi 10 soniya, bu esa
 * AI so'rovi yoki katta faylni qayta ishlash uchun yetmaydi.
 */
export const maxDuration = 60;
/** Bitta so'rovda yangilanadigan qatorlar soni. */
const UPDATE_CHUNK = 500;

export const POST = withApiErrorHandling(
  async (
    _request: NextRequest,
    context: RouteContext<"/api/datasets/[id]/clean">,
  ) => {
    const guard = await requireUser();
    if (!guard.ok) return guard.response;

    const { id } = await context.params;

    const dataset = await prisma.dataset.findFirst({
      where: { id, orgId: guard.user.organization.id },
      include: { columns: { orderBy: { position: "asc" } } },
    });

    if (!dataset) {
      return apiFail(ApiErrorCode.notFound, "Ma'lumot to'plami topilmadi.", 404);
    }

    const rows = await prisma.datasetRow.findMany({
      where: { datasetId: dataset.id },
      orderBy: { rowIndex: "asc" },
      select: { rowIndex: true, raw: true, isDuplicate: true },
    });

    if (rows.length === 0) {
      return apiFail(
        ApiErrorCode.validation,
        "Tozalash uchun ma'lumot yo'q.",
        422,
      );
    }

    const run = await prisma.cleaningRun.create({
      data: {
        datasetId: dataset.id,
        status: "RUNNING",
        qualityBefore: dataset.qualityScore ?? 0,
        validRowsBefore:
          dataset.validRowCount ??
          rows.filter((row) => !row.isDuplicate).length,
      },
    });

    try {
      const outcome = cleanTable({
        columns: dataset.columns.map((column) => ({
          position: column.position,
          sourceName: column.sourceName,
          canonicalKey: column.canonicalKey,
          dataType: column.dataType,
          unitScale: column.unitScale,
        })),
        rows: rows.map((row) => ({
          rowIndex: row.rowIndex,
          raw: (Array.isArray(row.raw) ? row.raw : []) as RawCell[],
          isDuplicate: row.isDuplicate,
        })),
      });

      // Qatorlarni to'plamlab yangilaymiz — 1400 ta alohida UPDATE o'rniga
      // har 500 tasi uchun bitta so'rov.
      for (let start = 0; start < outcome.rows.length; start += UPDATE_CHUNK) {
        const chunk = outcome.rows.slice(start, start + UPDATE_CHUNK);

        const indexes = chunk.map((row) => row.rowIndex);
        const cleans = chunk.map((row) =>
          row.clean === null ? null : JSON.stringify(row.clean),
        );
        const issues = chunk.map((row) => JSON.stringify(row.issues));

        await prisma.$executeRaw`
          UPDATE dataset_rows AS r
          SET clean = d.clean::jsonb, issues = d.issues::jsonb
          FROM unnest(
            ${indexes}::int[],
            ${cleans}::text[],
            ${issues}::text[]
          ) AS d(row_index, clean, issues)
          WHERE r.dataset_id = ${dataset.id}::uuid
            AND r.row_index = d.row_index
        `;
      }

      const [updatedRun] = await prisma.$transaction([
        prisma.cleaningRun.update({
          where: { id: run.id },
          data: {
            status: "COMPLETED",
            qualityAfter: outcome.qualityAfter,
            validRowsAfter: outcome.validRowsAfter,
            stageLog: {
              stages: outcome.stages,
              breakdown: outcome.breakdownAfter,
              droppedDuplicates: outcome.droppedDuplicates,
              droppedInvalid: outcome.droppedInvalid,
            },
            finishedAt: new Date(),
          },
        }),
        prisma.dataset.update({
          where: { id: dataset.id },
          data: {
            status: "CLEANED",
            cleanedQualityScore: outcome.qualityAfter,
          },
        }),
        prisma.qualityIssue.updateMany({
          where: { datasetId: dataset.id },
          data: { applied: true },
        }),
      ]);

      return apiOk({
        runId: updatedRun.id,
        qualityBefore: run.qualityBefore,
        qualityAfter: outcome.qualityAfter,
        validRowsBefore: run.validRowsBefore,
        validRowsAfter: outcome.validRowsAfter,
        droppedDuplicates: outcome.droppedDuplicates,
        droppedInvalid: outcome.droppedInvalid,
        breakdown: outcome.breakdownAfter,
        stages: outcome.stages,
      });
    } catch (error) {
      await prisma.cleaningRun.update({
        where: { id: run.id },
        data: {
          status: "FAILED",
          errorMessage:
            error instanceof Error ? error.message : "Noma'lum xato",
          finishedAt: new Date(),
        },
      });

      throw error;
    }
  },
);

export const GET = withApiErrorHandling(
  async (
    _request: NextRequest,
    context: RouteContext<"/api/datasets/[id]/clean">,
  ) => {
    const guard = await requireUser();
    if (!guard.ok) return guard.response;

    const { id } = await context.params;

    const dataset = await prisma.dataset.findFirst({
      where: { id, orgId: guard.user.organization.id },
      select: { id: true },
    });

    if (!dataset) {
      return apiFail(ApiErrorCode.notFound, "Ma'lumot to'plami topilmadi.", 404);
    }

    const runs = await prisma.cleaningRun.findMany({
      where: { datasetId: dataset.id },
      orderBy: { startedAt: "desc" },
      take: 10,
    });

    return apiOk(
      runs.map((run) => ({
        id: run.id,
        status: run.status,
        qualityBefore: run.qualityBefore,
        qualityAfter: run.qualityAfter,
        validRowsBefore: run.validRowsBefore,
        validRowsAfter: run.validRowsAfter,
        stageLog: run.stageLog,
        errorMessage: run.errorMessage,
        startedAt: run.startedAt.toISOString(),
        finishedAt: run.finishedAt?.toISOString() ?? null,
      })),
    );
  },
);
