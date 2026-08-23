import type { Dataset, DatasetColumn, QualityIssue } from "@/generated/prisma/client";

/**
 * DB yozuvlarini UI kutadigan shaklga aylantiradi.
 * UI hech qachon Prisma modelini to'g'ridan-to'g'ri ko'rmaydi.
 */

export type DatasetSummary = {
  id: string;
  name: string;
  format: "CSV" | "XLSX";
  sizeLabel: string;
  rows: number;
  columns: number;
  quality: number | null;
  cleanedQuality: number | null;
  status: Dataset["status"];
  issueCount: number;
  createdAt: string;
};

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function serializeDatasetSummary(
  dataset: Dataset & { _count?: { issues: number } },
): DatasetSummary {
  return {
    id: dataset.id,
    name: dataset.name,
    format: dataset.format,
    sizeLabel: formatFileSize(dataset.sizeBytes),
    rows: dataset.rowCount,
    columns: dataset.columnCount,
    quality: dataset.qualityScore,
    cleanedQuality: dataset.cleanedQualityScore,
    status: dataset.status,
    issueCount: dataset._count?.issues ?? 0,
    createdAt: dataset.createdAt.toISOString(),
  };
}

export function serializeColumn(column: DatasetColumn) {
  return {
    id: column.id,
    position: column.position,
    sourceName: column.sourceName,
    canonicalKey: column.canonicalKey,
    dataType: column.dataType,
    nullCount: column.nullCount,
    invalidCount: column.invalidCount,
    distinctCount: column.distinctCount,
    min: column.minValue,
    max: column.maxValue,
    mean: column.meanValue,
    stdDev: column.stdDev,
    sampleValues: column.sampleValues,
    mappingConfidence: column.mappingConfidence,
    mappedBy: column.mappedBy,
    mappingReason: column.mappingReason,
    unitScale: column.unitScale,
  };
}

export function serializeIssue(issue: QualityIssue) {
  return {
    id: issue.id,
    columnName: issue.columnName,
    issueType: issue.issueType,
    count: issue.count,
    affectedPct: issue.affectedPct,
    severity: issue.severity,
    suggestedFix: issue.suggestedFix,
    aiRationale: issue.aiRationale,
    applied: issue.applied,
  };
}
