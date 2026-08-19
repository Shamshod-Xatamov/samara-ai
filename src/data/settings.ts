export const SETTINGS_STORAGE_KEY = "samara-ai-settings";
export const SETTINGS_UPDATED_EVENT = "samara-settings-updated";

export type AppSettings = {
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
  thresholds: {
    latency: number;
    errorRate: number;
    aiAccuracy: number;
    costIncrease: number;
  };
  notifications: {
    inApp: boolean;
    criticalEmail: boolean;
    warningEmail: boolean;
    dailySummary: boolean;
    weeklyReport: boolean;
    sound: boolean;
  };
};

export const defaultSettings: AppSettings = {
  profile: {
    fullName: "Aziz Karimov",
    email: "analitik@tashkilot.uz",
    role: "Analitik",
    language: "O'zbekcha",
  },
  organization: {
    name: "Demo tashkilot",
    sector: "Ishlab chiqarish",
    timezone: "Asia/Tashkent (UTC+5)",
    currency: "UZS — O'zbekiston so'mi",
  },
  thresholds: {
    latency: 500,
    errorRate: 2,
    aiAccuracy: 92,
    costIncrease: 15,
  },
  notifications: {
    inApp: true,
    criticalEmail: true,
    warningEmail: true,
    dailySummary: false,
    weeklyReport: true,
    sound: false,
  },
};

export function readStoredSettings(): AppSettings {
  if (typeof window === "undefined") return defaultSettings;

  try {
    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!stored) return defaultSettings;
    const parsed = JSON.parse(stored) as Partial<AppSettings>;

    return {
      profile: { ...defaultSettings.profile, ...parsed.profile },
      organization: { ...defaultSettings.organization, ...parsed.organization },
      thresholds: { ...defaultSettings.thresholds, ...parsed.thresholds },
      notifications: { ...defaultSettings.notifications, ...parsed.notifications },
    };
  } catch {
    return defaultSettings;
  }
}
