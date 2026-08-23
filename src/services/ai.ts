import { apiRequest, jsonRequest } from "./api-client";

export type ForecastPoint = {
  label: string;
  date: string;
  actual: number | null;
  predicted: number | null;
  lower: number | null;
  upper: number | null;
};

export type ForecastResponse = {
  metric: {
    key: string;
    label: string;
    shortLabel: string;
    unit: string;
    decimals: number;
    positiveWhen: "up" | "down";
  };
  availableMetrics: Array<{
    key: string;
    label: string;
    shortLabel: string;
    unit: string;
  }>;
  source: { datasetId: string; datasetName: string; latestDate: string };
  forecast: {
    points: ForecastPoint[];
    boundaryLabel: string;
    horizon: number;
    model: "holt" | "holt-winters";
    seasonLength: number | null;
    alpha: number;
    beta: number;
    gamma: number | null;
    mape: number | null;
    confidence: number | null;
    changePct: number | null;
    direction: "up" | "down" | "flat";
  };
  insight: {
    insightTitle: string;
    insight: string;
    factors: Array<{ label: string; value: number }>;
    cached: boolean;
    model: string;
  } | null;
  insightError: string | null;
};

export type AnomalyExplanation = {
  description: string;
  causes: Array<{ label: string; value: number }>;
  recommendation: string;
  impact: string;
};

export type AnomalyItem = {
  id: string;
  metricKey: string;
  metricLabel: string;
  unit: string;
  decimals: number;
  date: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  method: string;
  observed: number;
  expected: number;
  deviationPct: number;
  zScore: number | null;
  status: "OPEN" | "REVIEWED" | "RESOLVED";
  trend: Array<{ label: string; expected: number; actual: number }>;
  aiExplanation: AnomalyExplanation | null;
  decisions: Array<{ id: string; code: string; status: string }>;
};

export type AnomaliesResponse = {
  source: { datasetId: string; datasetName: string; latestDate: string };
  detection: {
    method: string;
    criticalZ: number;
    warningZ: number;
    windowDays: number;
  };
  metrics: Array<{ key: string; label: string; unit: string }>;
  anomalies: AnomalyItem[];
};

export type DecisionPayload = {
  problem: string;
  factors: Array<{ label: string; change: string; contribution: number }>;
  recommendation: string;
  rationale: string;
  effects: Array<{ label: string; value: string; detail: string }>;
  steps: Array<{ title: string; owner: string; duration: string }>;
  metricLabel: string;
  unit: string;
  model?: string;
};

export type DecisionItem = {
  id: string;
  code: string;
  title: string;
  summary: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM";
  status: "NEW" | "REVIEWED" | "PLANNED";
  confidence: number;
  payload: DecisionPayload;
  feedback: string | null;
  anomalyId: string | null;
  createdAt: string;
  reviewedAt: string | null;
  anomaly: {
    id: string;
    metricKey: string;
    metricLabel: string;
    unit: string;
    date: string;
    severity: string;
    observed: number;
    expected: number;
    deviationPct: number;
    zScore: number | null;
    trend: Array<{ label: string; expected: number; actual: number }>;
  } | null;
};

export function getForecast(metric: string, horizon: number) {
  const query = new URLSearchParams({ metric, horizon: String(horizon) });
  return apiRequest<ForecastResponse>(`/api/ai/forecast?${query.toString()}`);
}

export function getAnomalies(refresh = false) {
  const query = refresh ? "?refresh=1" : "";
  return apiRequest<AnomaliesResponse>(`/api/ai/anomalies${query}`);
}

export function explainAnomaly(id: string) {
  return jsonRequest<{
    explanation: AnomalyExplanation;
    cached: boolean;
    model: string;
  }>(`/api/ai/anomalies/${id}/explain`, "POST");
}

export function getDecisions() {
  return apiRequest<DecisionItem[]>("/api/decisions");
}

export function generateDecisions() {
  return jsonRequest<{
    created: DecisionItem[];
    skipped?: number;
    message: string;
  }>("/api/decisions", "POST");
}

export function updateDecision(
  id: string,
  input: { status?: "NEW" | "REVIEWED" | "PLANNED"; feedback?: string | null },
) {
  return jsonRequest<{
    id: string;
    status: string;
    feedback: string | null;
    reviewedAt: string | null;
  }>(`/api/decisions/${id}`, "PATCH", input);
}
