import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  ApiErrorCode,
  apiFail,
  apiOk,
  withApiErrorHandling,
} from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guard";
import { createDatasetFromFile } from "@/lib/datasets/create";
import { serializeDatasetSummary } from "@/lib/datasets/serialize";
import { ParseError } from "@/lib/parsing/parse-file";

/**
 * Demo dataset — `pnpm data:generate` yaratgan namuna faylni tizimga yuklaydi.
 * Bu haqiqiy upload oqimining o'zi, faqat fayl tanlash bosqichisiz.
 */
const DEMO_FILE = "ishlab-chiqarish-2025-2026.xlsx";

export const POST = withApiErrorHandling(async () => {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const filePath = path.join(process.cwd(), "namuna-malumotlar", DEMO_FILE);

  let buffer: Buffer;

  try {
    buffer = await readFile(filePath);
  } catch {
    return apiFail(
      ApiErrorCode.notFound,
      "Namuna fayl topilmadi. `pnpm data:generate` buyrug'ini ishga tushiring.",
      404,
    );
  }

  try {
    const { dataset, profile, issues, truncatedRows } =
      await createDatasetFromFile({
        orgId: guard.user.organization.id,
        userId: guard.user.id,
        filename: DEMO_FILE,
        buffer,
      });

    return apiOk(
      {
        dataset: serializeDatasetSummary({
          ...dataset,
          _count: { issues: issues.length },
        }),
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
