import type { CanonicalKey } from "@/lib/parsing/canonical";

import { apiRequest, jsonRequest, type ClientResult } from "./api-client";

export type DatasetStatus =
  | "UPLOADED"
  | "PROFILED"
  | "MAPPED"
  | "CLEANED"
  | "FAILED";

export type DatasetSummary = {
  id: string;
  name: string;
  format: "CSV" | "XLSX";
  sizeLabel: string;
  rows: number;
  columns: number;
  quality: number | null;
  cleanedQuality: number | null;
  status: DatasetStatus;
  issueCount: number;
  createdAt: string;
};

export type DatasetColumnInfo = {
  id: string;
  position: number;
  sourceName: string;
  canonicalKey: CanonicalKey | null;
  dataType: "DATE" | "NUMBER" | "TEXT" | "BOOLEAN" | "UNKNOWN";
  nullCount: number;
  invalidCount: number;
  distinctCount: number;
  min: number | null;
  max: number | null;
  mean: number | null;
  stdDev: number | null;
  sampleValues: unknown;
  mappingConfidence: number | null;
  mappedBy: "AI" | "USER" | "HEURISTIC" | null;
  mappingReason: string | null;
  unitScale: number | null;
};

export type DatasetIssue = {
  id: string;
  columnName: string | null;
  issueType: "MISSING" | "DUPLICATE" | "TYPE_ERROR" | "OUTLIER";
  count: number;
  affectedPct: number;
  severity: "HIGH" | "MEDIUM" | "LOW";
  suggestedFix: string;
  aiRationale: string | null;
  applied: boolean;
};

export type DatasetPreviewRow = {
  index: number;
  values: unknown[];
  cleaned: Record<string, unknown> | null;
  isDuplicate: boolean;
};

export type DatasetDetail = {
  dataset: DatasetSummary;
  columns: DatasetColumnInfo[];
  issues: DatasetIssue[];
  preview: {
    headers: string[];
    rows: DatasetPreviewRow[];
    limit: number;
  };
};

export type QualityBreakdown = {
  completeness: number;
  validity: number;
  uniqueness: number;
  consistency: number;
  usability: number;
};

export type UploadResult = {
  dataset: DatasetSummary;
  breakdown: QualityBreakdown;
  validRows: number;
  issueCount: number;
  truncatedRows: number;
};

export type MappingResult = {
  source: "ai" | "user";
  cached?: boolean;
  model?: string;
  latencyMs?: number;
  columns: DatasetColumnInfo[];
};

export type CleaningStage = {
  key: string;
  label: string;
  description: string;
  affected: number;
};

export type CleaningResult = {
  runId: string;
  qualityBefore: number;
  qualityAfter: number;
  validRowsBefore: number;
  validRowsAfter: number;
  droppedDuplicates: number;
  droppedInvalid: number;
  breakdown: QualityBreakdown;
  stages: CleaningStage[];
};

export function listDatasets() {
  return apiRequest<DatasetSummary[]>("/api/datasets");
}

export function getDataset(id: string) {
  return apiRequest<DatasetDetail>(`/api/datasets/${id}`);
}

export function deleteDataset(id: string) {
  return jsonRequest<{ deleted: boolean }>(`/api/datasets/${id}`, "DELETE");
}

export function uploadDataset(file: File): Promise<ClientResult<UploadResult>> {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest<UploadResult>("/api/datasets", {
    method: "POST",
    body: formData,
  });
}

export function createDemoDataset() {
  return jsonRequest<UploadResult>("/api/datasets/demo", "POST");
}

export function runAiMapping(id: string) {
  return jsonRequest<MappingResult>(`/api/datasets/${id}/mapping`, "POST");
}

export function saveMapping(
  id: string,
  mappings: Array<{
    columnId: string;
    canonicalKey: CanonicalKey | null;
    unitScale?: number;
  }>,
) {
  return jsonRequest<MappingResult>(`/api/datasets/${id}/mapping`, "POST", {
    mappings,
  });
}

export function cleanDataset(id: string) {
  return jsonRequest<CleaningResult>(`/api/datasets/${id}/clean`, "POST");
}
