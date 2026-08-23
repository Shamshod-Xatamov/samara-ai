import { apiRequest, jsonRequest } from "./api-client";

export type Thresholds = {
  latency: number;
  errorRate: number;
  aiAccuracy: number;
  costIncrease: number;
};

export type Notifications = {
  inApp: boolean;
  criticalEmail: boolean;
  warningEmail: boolean;
  dailySummary: boolean;
  weeklyReport: boolean;
  sound: boolean;
};

export type EesWeights = {
  time: number;
  cost: number;
  labor: number;
  automation: number;
  quality: number;
};

export type SettingsPayload = {
  profile: {
    fullName: string;
    email: string;
    role: string;
    language: string;
  };
  organization: {
    name: string;
    sector: string;
    timezone: string;
    currency: string;
  };
  thresholds: Thresholds;
  notifications: Notifications;
  economics: {
    aiInvestmentCost: number | null;
    baselineDays: number;
    eesWeights: EesWeights;
    eesLabels: Record<string, string>;
  };
};

export type SettingsUpdate = {
  profile?: { fullName?: string; language?: string };
  organization?: Partial<SettingsPayload["organization"]>;
  thresholds?: Partial<Thresholds>;
  notifications?: Partial<Notifications>;
  economics?: {
    aiInvestmentCost?: number | null;
    baselineDays?: number;
    eesWeights?: Partial<EesWeights>;
  };
};

export function getSettings() {
  return apiRequest<SettingsPayload>("/api/settings");
}

export function saveSettings(update: SettingsUpdate) {
  return jsonRequest<SettingsPayload>("/api/settings", "PATCH", update);
}
