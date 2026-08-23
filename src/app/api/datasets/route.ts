import type { NextRequest } from "next/server";

import {
  ApiErrorCode,
  apiFail,
  apiOk,
  withApiErrorHandling,
} from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guard";
import { createDatasetFromFile, validateUpload } from "@/lib/datasets/create";
import { serializeDatasetSummary } from "@/lib/datasets/serialize";
import { prisma } from "@/lib/db";
import { ParseError } from "@/lib/parsing/parse-file";

/**
 * Serverless funksiyaning default chegarasi 10 soniya, bu esa
 * AI so'rovi yoki katta faylni qayta ishlash uchun yetmaydi.
 */
export const maxDuration = 60;

export const GET = withApiErrorHandling(async () => {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const datasets = await prisma.dataset.findMany({
    where: { orgId: guard.user.organization.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { issues: true } } },
  });

  return apiOk(datasets.map(serializeDatasetSummary));
});

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return apiFail(
      ApiErrorCode.invalidJson,
      "Faylni o'qib bo'lmadi. So'rov formati noto'g'ri.",
      400,
    );
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return apiFail(ApiErrorCode.validation, "Fayl tanlanmagan.", 422);
  }

  const validationError = validateUpload(file.name, file.size);

  if (validationError) {
    return apiFail(ApiErrorCode.validation, validationError, 422);
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    const { dataset, profile, issues, truncatedRows } =
      await createDatasetFromFile({
        orgId: guard.user.organization.id,
        userId: guard.user.id,
        filename: file.name,
        buffer,
      });

    return apiOk(
      {
        dataset: serializeDatasetSummary({ ...dataset, _count: { issues: issues.length } }),
        breakdown: profile.breakdown,
        validRows: profile.validRows,
        issueCount: issues.length,
        truncatedRows,
      },
      201,
    );
  } catch (error) {
    if (error instanceof ParseError) {
      return apiFail(ApiErrorCode.validation, error.message, 422);
    }

    throw error;
  }
});
