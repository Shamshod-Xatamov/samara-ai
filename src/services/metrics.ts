import { apiRequest, jsonRequest } from "./api-client";

export type PeriodKey = "today" | "week" | "month" | "quarter" | "year";

export type MetricSourceInfo = {
  datasetId: string;
  datasetName: string;
  rowCount: number;
  quality: number | null;
  earliestDate: string;
  latestDate: string;
  availableKeys: string[];
};

export type Kpi = {
  key: string;
  label: string;
  value: number | null;
  unit: string;
  decimals: number;
  change: number | null;
  absoluteChange: number | null;
  positiveWhen: "up" | "down";
  comparison: string;
  note?: string;
};

export type MetricPoint = {
  label: string;
  bucketStart: string;
  efficiency: number | null;
  cost: number | null;
  processing: number | null;
  accuracy: number | null;
  productivity: number | null;
};

export type EesComponent = {
  key: string;
  label: string;
  raw: number | null;
  score: number | null;
  weight: number;
  unit?: string;
};

export type MetricsResponse = {
  source: MetricSourceInfo;
  period: { key: PeriodKey; label: string; from: string; to: string; rowCount: number };
  baseline: { from: string; to: string; days: number; rowCount: number };
  kpis: Kpi[];
  series: MetricPoint[];
  ees: { score: number | null; coverage: number; components: EesComponent[] };
};

export type ComparisonMetric = {
  key: string;
  label: string;
  unit: string;
  decimals: number;
  before: number | null;
  after: number | null;
  positiveDirection: "up" | "down";
};

export type SavingsSummary = {
  savedCost: number | null;
  savedHours: number | null;
  annualisedSaving: number | null;
  productivityGain: number | null;
  roi: number | null;
  errorRateChange: number | null;
  investment: number | null;
  investmentIsAssumption: boolean;
};

export type EconomicsResponse = {
  source: Pick<MetricSourceInfo, "datasetId" | "datasetName" | "earliestDate" | "latestDate">;
  period: { key: PeriodKey; label: string; from: string; to: string; rowCount: number };
  baseline: { from: string; to: string; days: number; rowCount: number };
  ees: {
    score: number | null;
    baselineScore: number | null;
    coverage: number;
    components: EesComponent[];
    weights: Record<string, number>;
  };
  savings: SavingsSummary;
  comparison: ComparisonMetric[];
  scenarioDefaults: { automation: number | null; accuracy: number | null };
};

export type WhatIfResponse = {
  current: {
    ees: number | null;
    inputs: Record<string, number | null>;
    savings: SavingsSummary;
  };
  projected: {
    ees: number | null;
    inputs: Record<string, number | null>;
    components: EesComponent[];
    savings: SavingsSummary;
  };
  deltas: Record<string, number | null>;
  estimateNote: string;
};

export function getMetrics(period: PeriodKey, datasetId?: string) {
  const query = new URLSearchParams({ period });
  if (datasetId) query.set("datasetId", datasetId);

  return apiRequest<MetricsResponse>(`/api/metrics?${query.toString()}`);
}

export function getEconomics(period: PeriodKey, datasetId?: string) {
  const query = new URLSearchParams({ period });
  if (datasetId) query.set("datasetId", datasetId);

  return apiRequest<EconomicsResponse>(`/api/economics?${query.toString()}`);
}

export function runWhatIf(input: {
  automation: number;
  accuracy: number;
  period?: PeriodKey;
  datasetId?: string;
}) {
  return jsonRequest<WhatIfResponse>("/api/economics", "POST", input);
}
