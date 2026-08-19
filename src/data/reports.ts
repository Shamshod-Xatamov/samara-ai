export type ReportTypeKey =
  | "daily"
  | "weekly"
  | "monthly"
  | "economic"
  | "ai"
  | "management";

export type ReportFormat = "pdf" | "excel" | "csv";
export type ReportStatus = "ready" | "scheduled";

export type ReportType = {
  key: ReportTypeKey;
  title: string;
  description: string;
  frequency: string;
  sectionCount: number;
  iconKey: "calendar" | "trend" | "chart" | "economy" | "ai" | "management";
  sections: string[];
};

export type ReportHistoryItem = {
  id: string;
  title: string;
  type: ReportTypeKey;
  period: string;
  format: ReportFormat;
  size: string;
  createdAt: string;
  status: ReportStatus;
};

export const reportTypes: ReportType[] = [
  {
    key: "daily",
    title: "Kunlik operatsion",
    description: "Oqim, qayta ishlash va tizim holatining qisqa yakuni.",
    frequency: "Har kuni",
    sectionCount: 5,
    iconKey: "calendar",
    sections: [
      "Umumiy KPI",
      "Qayta ishlash tezligi",
      "Kechikish va xatolar",
      "Tizim hodisalari",
      "Faol ogohlantirishlar",
    ],
  },
  {
    key: "weekly",
    title: "Haftalik natijalar",
    description: "Hafta dinamikasi, samaradorlik va muhim o'zgarishlar.",
    frequency: "Har hafta",
    sectionCount: 6,
    iconKey: "trend",
    sections: [
      "Umumiy KPI",
      "Haftalik dinamika",
      "Processing performance",
      "AI natijalari",
      "Aniqlangan anomaliyalar",
      "Boshqaruv tavsiyalari",
    ],
  },
  {
    key: "monthly",
    title: "Oylik boshqaruv",
    description: "Rahbariyat uchun texnologik va iqtisodiy natijalar.",
    frequency: "Har oy",
    sectionCount: 8,
    iconKey: "chart",
    sections: [
      "Ijro xulosasi",
      "Umumiy KPI",
      "Qayta ishlash natijalari",
      "AI performance",
      "Iqtisodiy samaradorlik",
      "Xarajat tejalishi",
      "Prognoz",
      "Boshqaruv tavsiyalari",
    ],
  },
  {
    key: "economic",
    title: "Iqtisodiy samaradorlik",
    description: "EES, ROI, tejam va oldin-keyin taqqoslash hisoboti.",
    frequency: "Talab bo'yicha",
    sectionCount: 7,
    iconKey: "economy",
    sections: [
      "Economic Efficiency Score",
      "ROI va qaytim",
      "Operatsion xarajat",
      "Tejalgan mehnat vaqti",
      "Unumdorlik o'sishi",
      "Oldin va keyin",
      "What-if natijalari",
    ],
  },
  {
    key: "ai",
    title: "AI tahlili",
    description: "Model aniqligi, prognoz va anomaliyalar bo'yicha tahlil.",
    frequency: "Talab bo'yicha",
    sectionCount: 6,
    iconKey: "ai",
    sections: [
      "Model holati",
      "AI aniqligi",
      "30 kunlik prognoz",
      "Aniqlangan anomaliyalar",
      "Asosiy omillar",
      "AI izohlari",
    ],
  },
  {
    key: "management",
    title: "Rahbariyat hisoboti",
    description: "Qaror qabul qilish uchun ixcham executive summary.",
    frequency: "Talab bo'yicha",
    sectionCount: 6,
    iconKey: "management",
    sections: [
      "Ijro xulosasi",
      "Asosiy iqtisodiy KPI",
      "Kritik signallar",
      "Kutilayotgan risklar",
      "Ustuvor tavsiyalar",
      "Keyingi harakatlar",
    ],
  },
];

export const initialReportHistory: ReportHistoryItem[] = [
  {
    id: "RPT-0082",
    title: "Haftalik samaradorlik hisoboti",
    type: "weekly",
    period: "13–19 avg 2026",
    format: "pdf",
    size: "2.4 MB",
    createdAt: "Bugun, 20:42",
    status: "ready",
  },
  {
    id: "RPT-0081",
    title: "Iqtisodiy samaradorlik hisoboti",
    type: "economic",
    period: "1–19 avg 2026",
    format: "excel",
    size: "684 KB",
    createdAt: "Bugun, 14:05",
    status: "ready",
  },
  {
    id: "RPT-0080",
    title: "AI tahlili va anomaliyalar",
    type: "ai",
    period: "13–19 avg 2026",
    format: "pdf",
    size: "1.8 MB",
    createdAt: "Kecha, 18:20",
    status: "ready",
  },
  {
    id: "RPT-0079",
    title: "Kunlik operatsion hisobot",
    type: "daily",
    period: "18 avg 2026",
    format: "csv",
    size: "126 KB",
    createdAt: "Kecha, 20:00",
    status: "ready",
  },
  {
    id: "RPT-0078",
    title: "Oylik boshqaruv hisoboti",
    type: "monthly",
    period: "1–31 iyul 2026",
    format: "pdf",
    size: "4.1 MB",
    createdAt: "1 avg, 09:15",
    status: "ready",
  },
  {
    id: "RPT-0083",
    title: "Kunlik operatsion hisobot",
    type: "daily",
    period: "19 avg 2026",
    format: "pdf",
    size: "—",
    createdAt: "Bugun, 23:00",
    status: "scheduled",
  },
];

export const reportKpiRows = [
  ["Samaradorlik indeksi", "86.4 / 100", "+3.2%"],
  ["Operatsion xarajat", "124.5 mln so'm", "−12.4%"],
  ["Qayta ishlash vaqti", "1.24 soniya", "−18.6%"],
  ["AI aniqligi", "94.7%", "+2.1%"],
  ["Unumdorlik", "89.0%", "+4.8%"],
  ["Xato ulushi", "0.80%", "−0.4%"],
] as const;
