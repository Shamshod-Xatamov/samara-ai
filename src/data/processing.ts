export type ProcessingIssueKey = "missing" | "duplicate" | "type" | "outlier";

export type ProcessingIssue = {
  key: ProcessingIssueKey;
  label: string;
  count: number;
  affected: string;
  description: string;
};

export type IssueDetail = {
  field: string;
  problem: string;
  count: number;
  solution: string;
  severity: "high" | "medium" | "low";
};

export type ProcessingDataset = {
  id: string;
  name: string;
  format: "CSV" | "XLSX";
  rows: number;
  columns: number;
  initialQuality: number;
  finalQuality: number;
  validRowsBefore: number;
  validRowsAfter: number;
  issues: ProcessingIssue[];
  details: IssueDetail[];
};

export const processingDatasets: ProcessingDataset[] = [
  {
    id: "production-august",
    name: "ishlab-chiqarish-avgust.csv",
    format: "CSV",
    rows: 8420,
    columns: 8,
    initialQuality: 84,
    finalQuality: 98,
    validRowsBefore: 7124,
    validRowsAfter: 8376,
    issues: [
      {
        key: "missing",
        label: "Bo'sh qiymatlar",
        count: 128,
        affected: "1.52%",
        description: "To'ldirilmagan kataklar",
      },
      {
        key: "duplicate",
        label: "Dublikatlar",
        count: 46,
        affected: "0.55%",
        description: "Takrorlangan yozuvlar",
      },
      {
        key: "type",
        label: "Tip xatolari",
        count: 23,
        affected: "0.27%",
        description: "Formatga mos kelmagan qiymat",
      },
      {
        key: "outlier",
        label: "Outlierlar",
        count: 67,
        affected: "0.80%",
        description: "Me'yordan tashqari qiymatlar",
      },
    ],
    details: [
      {
        field: "xarajat_mln",
        problem: "Bo'sh qiymat",
        count: 72,
        solution: "Median bilan to'ldirish",
        severity: "high",
      },
      {
        field: "vaqt_soat",
        problem: "Bo'sh qiymat",
        count: 56,
        solution: "Bo'lim o'rtachasi bilan to'ldirish",
        severity: "medium",
      },
      {
        field: "yozuv_id",
        problem: "Takroriy yozuv",
        count: 46,
        solution: "Eng so'nggi yozuvni saqlash",
        severity: "high",
      },
      {
        field: "daromad_mln",
        problem: "Noto'g'ri raqam formati",
        count: 23,
        solution: "Raqam formatiga o'tkazish",
        severity: "medium",
      },
      {
        field: "unumdorlik",
        problem: "Statistik outlier",
        count: 67,
        solution: "IQR chegarasi bilan yumshatish",
        severity: "low",
      },
    ],
  },
  {
    id: "ai-metrics-q2",
    name: "ai-metrikalar-q2.xlsx",
    format: "XLSX",
    rows: 5960,
    columns: 7,
    initialQuality: 92,
    finalQuality: 99,
    validRowsBefore: 5483,
    validRowsAfter: 5948,
    issues: [
      {
        key: "missing",
        label: "Bo'sh qiymatlar",
        count: 38,
        affected: "0.64%",
        description: "To'ldirilmagan kataklar",
      },
      {
        key: "duplicate",
        label: "Dublikatlar",
        count: 12,
        affected: "0.20%",
        description: "Takrorlangan yozuvlar",
      },
      {
        key: "type",
        label: "Tip xatolari",
        count: 9,
        affected: "0.15%",
        description: "Formatga mos kelmagan qiymat",
      },
      {
        key: "outlier",
        label: "Outlierlar",
        count: 31,
        affected: "0.52%",
        description: "Me'yordan tashqari qiymatlar",
      },
    ],
    details: [
      {
        field: "aniqlik",
        problem: "Bo'sh qiymat",
        count: 38,
        solution: "Model kesimida interpolatsiya",
        severity: "medium",
      },
      {
        field: "vaqt",
        problem: "Takroriy timestamp",
        count: 12,
        solution: "Takroriy vaqtni birlashtirish",
        severity: "high",
      },
      {
        field: "kechikish_ms",
        problem: "Noto'g'ri raqam formati",
        count: 9,
        solution: "Raqam formatiga o'tkazish",
        severity: "medium",
      },
      {
        field: "kechikish_ms",
        problem: "Statistik outlier",
        count: 31,
        solution: "99-persentil bilan cheklash",
        severity: "low",
      },
    ],
  },
  {
    id: "operations-demo",
    name: "operatsion-demo.csv",
    format: "CSV",
    rows: 4040,
    columns: 6,
    initialQuality: 76,
    finalQuality: 97,
    validRowsBefore: 3071,
    validRowsAfter: 3972,
    issues: [
      {
        key: "missing",
        label: "Bo'sh qiymatlar",
        count: 186,
        affected: "4.60%",
        description: "To'ldirilmagan kataklar",
      },
      {
        key: "duplicate",
        label: "Dublikatlar",
        count: 84,
        affected: "2.08%",
        description: "Takrorlangan yozuvlar",
      },
      {
        key: "type",
        label: "Tip xatolari",
        count: 41,
        affected: "1.01%",
        description: "Formatga mos kelmagan qiymat",
      },
      {
        key: "outlier",
        label: "Outlierlar",
        count: 109,
        affected: "2.70%",
        description: "Me'yordan tashqari qiymatlar",
      },
    ],
    details: [
      {
        field: "yakun",
        problem: "Bo'sh qiymat",
        count: 112,
        solution: "Jarayon logidan tiklash",
        severity: "high",
      },
      {
        field: "xarajat_mln",
        problem: "Bo'sh qiymat",
        count: 74,
        solution: "Jarayon medianasi bilan to'ldirish",
        severity: "medium",
      },
      {
        field: "jarayon_id",
        problem: "Takroriy yozuv",
        count: 84,
        solution: "Dublikatlarni birlashtirish",
        severity: "high",
      },
      {
        field: "davomiylik_s",
        problem: "Noto'g'ri raqam formati",
        count: 41,
        solution: "Soniyaga standartlashtirish",
        severity: "medium",
      },
      {
        field: "davomiylik_s",
        problem: "Statistik outlier",
        count: 109,
        solution: "IQR chegarasida tekshirish",
        severity: "low",
      },
    ],
  },
];

export const processingStages = [
  { label: "Tuzilmani tekshirish", description: "Ustun va sxema tekshiruvi", threshold: 12 },
  { label: "Bo'sh qiymatlar", description: "Missing value'larni to'ldirish", threshold: 34 },
  { label: "Dublikatlar", description: "Takroriy yozuvlarni birlashtirish", threshold: 56 },
  { label: "Tip va formatlar", description: "Qiymatlarni standartlashtirish", threshold: 78 },
  { label: "Outlier nazorati", description: "Chetdagi qiymatlarni tekshirish", threshold: 100 },
] as const;
