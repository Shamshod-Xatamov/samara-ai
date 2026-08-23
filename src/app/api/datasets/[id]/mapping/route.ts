import type { NextRequest } from "next/server";
import { z } from "zod";

import {
  ApiErrorCode,
  apiFail,
  apiOk,
  withApiErrorHandling,
} from "@/lib/api/response";
import { mapColumnsWithAi } from "@/lib/ai/tasks/column-mapping";
import { requireUser } from "@/lib/auth/guard";
import { serializeColumn } from "@/lib/datasets/serialize";
import { prisma } from "@/lib/db";
import { CANONICAL_KEYS } from "@/lib/parsing/canonical";

/** Foydalanuvchi AI taklifini tuzatgan holat. */
const overrideSchema = z.object({
  mappings: z
    .array(
      z.object({
        columnId: z.uuid(),
        canonicalKey: z.enum(CANONICAL_KEYS).nullable(),
        unitScale: z.number().positive().optional(),
      }),
    )
    .min(1),
});

export const POST = withApiErrorHandling(
  async (
    request: NextRequest,
    context: RouteContext<"/api/datasets/[id]/mapping">,
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

    // Bo'sh tana = AI mapping so'ralmoqda.
    const rawBody = await request.text();

    if (rawBody.trim().length > 0) {
      let body: unknown;

      try {
        body = JSON.parse(rawBody);
      } catch {
        return apiFail(ApiErrorCode.invalidJson, "So'rov formati noto'g'ri.", 400);
      }

      const parsed = overrideSchema.safeParse(body);

      if (!parsed.success) {
        return apiFail(
          ApiErrorCode.validation,
          "Mapping ma'lumoti noto'g'ri.",
          422,
          z.treeifyError(parsed.error),
        );
      }

      const columnIds = new Set(dataset.columns.map((column) => column.id));

      if (parsed.data.mappings.some((item) => !columnIds.has(item.columnId))) {
        return apiFail(
          ApiErrorCode.validation,
          "Ustun shu ma'lumot to'plamiga tegishli emas.",
          422,
        );
      }

      await prisma.$transaction(
        parsed.data.mappings.map((item) =>
          prisma.datasetColumn.update({
            where: { id: item.columnId },
            data: {
              canonicalKey: item.canonicalKey,
              unitScale: item.canonicalKey ? (item.unitScale ?? 1) : null,
              mappingConfidence: item.canonicalKey ? 100 : null,
              mappedBy: "USER",
              mappingReason: item.canonicalKey
                ? "Foydalanuvchi tomonidan tasdiqlandi."
                : null,
            },
          }),
        ),
      );

      const columns = await prisma.datasetColumn.findMany({
        where: { datasetId: dataset.id },
        orderBy: { position: "asc" },
      });

      await prisma.dataset.update({
        where: { id: dataset.id },
        data: { status: "MAPPED" },
      });

      return apiOk({
        source: "user" as const,
        columns: columns.map(serializeColumn),
      });
    }

    const result = await mapColumnsWithAi({
      orgId: guard.user.organization.id,
      columns: dataset.columns.map((column) => ({
        sourceName: column.sourceName,
        dataType: column.dataType,
        sampleValues: Array.isArray(column.sampleValues)
          ? column.sampleValues
          : [],
        minValue: column.minValue,
        maxValue: column.maxValue,
      })),
    });

    if (!result.ok) {
      // AI ishlamasa ham evristik mapping saqlanib qoladi — sahifa buzilmaydi.
      return apiFail(
        "AI_UNAVAILABLE",
        `${result.message} Avtomatik moslashtirish saqlanib qoldi, ustunlarni qo'lda tasdiqlashingiz mumkin.`,
        503,
      );
    }

    const byName = new Map(
      result.data.map((mapping) => [mapping.sourceName, mapping]),
    );

    await prisma.$transaction(
      dataset.columns.map((column) => {
        const mapping = byName.get(column.sourceName);

        return prisma.datasetColumn.update({
          where: { id: column.id },
          data: {
            canonicalKey: mapping?.canonicalKey ?? null,
            unitScale: mapping?.canonicalKey ? (mapping.unitScale ?? 1) : null,
            mappingConfidence: mapping?.canonicalKey
              ? mapping.confidence
              : null,
            mappedBy: "AI",
            mappingReason: mapping?.reason ?? null,
          },
        });
      }),
    );

    const columns = await prisma.datasetColumn.findMany({
      where: { datasetId: dataset.id },
      orderBy: { position: "asc" },
    });

    await prisma.dataset.update({
      where: { id: dataset.id },
      data: { status: "MAPPED" },
    });

    return apiOk({
      source: "ai" as const,
      cached: result.cached,
      model: result.model,
      latencyMs: result.latencyMs,
      columns: columns.map(serializeColumn),
    });
  },
);
