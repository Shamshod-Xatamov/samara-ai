import { guessCanonicalKey } from "@/lib/parsing/canonical";
import {
  MAX_FILE_SIZE,
  ParseError,
  getFileExtension,
  parseTableFile,
  ACCEPTED_EXTENSIONS,
} from "@/lib/parsing/parse-file";
import { toStorableValue } from "@/lib/parsing/values";
import { detectIssues } from "@/lib/quality/issues";
import { profileTable } from "@/lib/quality/profile";
import { prisma } from "@/lib/db";

export type CreateDatasetInput = {
  orgId: string;
  userId: string;
  filename: string;
  buffer: Buffer;
};

export function validateUpload(filename: string, size: number) {
  const extension = getFileExtension(filename);

  if (!ACCEPTED_EXTENSIONS.includes(extension as (typeof ACCEPTED_EXTENSIONS)[number])) {
    return "Faqat CSV yoki XLSX formatidagi faylni yuklash mumkin.";
  }

  if (size > MAX_FILE_SIZE) {
    const limitMb = Math.round(MAX_FILE_SIZE / (1024 * 1024));
    return `Fayl hajmi ${limitMb} MB dan oshmasligi kerak.`;
  }

  if (size === 0) {
    return "Fayl bo'sh.";
  }

  return null;
}

/**
 * Faylni o'qiydi, profiling qiladi va bazaga yozadi.
 *
 * Ustunlar bu bosqichda evristika bilan bog'lanadi — Gemini mapping'i
 * keyingi qadamda ishga tushadi va natijani aniqlashtiradi.
 */
export async function createDatasetFromFile(input: CreateDatasetInput) {
  const table = await parseTableFile(input.filename, input.buffer);

  if (table.rows.length === 0) {
    throw new ParseError("Faylda sarlavhadan boshqa ma'lumot topilmadi.");
  }

  const profile = profileTable(table);
  const issues = detectIssues(profile);
  const duplicateSet = new Set(profile.duplicateRowIndexes);

  return prisma.$transaction(async (tx) => {
    const dataset = await tx.dataset.create({
      data: {
        orgId: input.orgId,
        uploadedById: input.userId,
        name: input.filename,
        originalFilename: input.filename,
        format: table.format,
        sizeBytes: input.buffer.byteLength,
        rowCount: profile.rowCount,
        columnCount: table.headers.length,
        status: "PROFILED",
        qualityScore: profile.qualityScore,
        validRowCount: profile.validRows,
      },
    });

    await tx.datasetColumn.createMany({
      data: profile.columns.map((column) => {
        const guess = guessCanonicalKey(column.sourceName);

        return {
          datasetId: dataset.id,
          position: column.position,
          sourceName: column.sourceName,
          canonicalKey: guess?.key ?? null,
          dataType: column.dataType,
          nullCount: column.nullCount,
          distinctCount: column.distinctCount,
          invalidCount: column.invalidCount + column.coercedCount,
          minValue: column.minValue,
          maxValue: column.maxValue,
          meanValue: column.meanValue,
          stdDev: column.stdDev,
          q1: column.q1,
          q3: column.q3,
          sampleValues: column.sampleValues,
          mappingConfidence: guess?.confidence ?? null,
          mappedBy: guess ? ("HEURISTIC" as const) : null,
          mappingReason: guess
            ? "Ustun nomidagi kalit so'zlar bo'yicha avtomatik moslashtirildi."
            : null,
        };
      }),
    });

    await tx.datasetRow.createMany({
      data: table.rows.map((row, index) => ({
        datasetId: dataset.id,
        rowIndex: index,
        raw: row.map(toStorableValue),
        isDuplicate: duplicateSet.has(index),
      })),
    });

    if (issues.length > 0) {
      await tx.qualityIssue.createMany({
        data: issues.map((issue) => ({
          datasetId: dataset.id,
          columnName: issue.columnName,
          issueType: issue.issueType,
          count: issue.count,
          affectedPct: issue.affectedPct,
          severity: issue.severity,
          suggestedFix: issue.suggestedFix,
        })),
      });
    }

    return { dataset, profile, issues, truncatedRows: table.truncatedRows };
  });
}
