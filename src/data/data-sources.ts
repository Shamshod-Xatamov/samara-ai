export type DatasetCell = string | number | boolean | null;

export type DatasetStatus = "ready" | "processing" | "warning";

export type Dataset = {
  id: string;
  name: string;
  format: "CSV" | "XLSX";
  size: string;
  rows: number;
  columns: number;
  quality: number;
  uploadedAt: string;
  status: DatasetStatus;
  preview: DatasetCell[][];
};

export const initialDatasets: Dataset[] = [
  {
    id: "production-august",
    name: "ishlab-chiqarish-avgust.csv",
    format: "CSV",
    size: "1.8 MB",
    rows: 8420,
    columns: 8,
    quality: 96,
    uploadedAt: "Bugun, 09:42",
    status: "ready",
    preview: [
      ["sana", "bo'lim", "mahsulot", "daromad_mln", "xarajat_mln", "vaqt_soat", "unumdorlik", "holat"],
      ["2026-08-19", "Yig'uv", "Modul A-24", 42.8, 31.2, 7.4, 88, "Me'yorida"],
      ["2026-08-19", "Qadoqlash", "Modul B-11", 38.4, 29.7, 8.1, 82, "Me'yorida"],
      ["2026-08-18", "Sifat", "Modul A-24", 45.1, 32.4, 6.8, 91, "Yuqori"],
      ["2026-08-18", "Yig'uv", "Modul C-08", 35.6, 28.9, 8.7, 78, "Tekshiruv"],
      ["2026-08-17", "Qadoqlash", "Modul B-11", 40.2, 30.1, 7.6, 86, "Me'yorida"],
      ["2026-08-17", "Sifat", "Modul C-08", 37.9, 29.4, 7.9, 84, "Me'yorida"],
    ],
  },
  {
    id: "ai-metrics-q2",
    name: "ai-metrikalar-q2.xlsx",
    format: "XLSX",
    size: "2.4 MB",
    rows: 5960,
    columns: 7,
    quality: 92,
    uploadedAt: "Kecha, 16:18",
    status: "ready",
    preview: [
      ["vaqt", "model", "aniqlik", "kechikish_ms", "yozuvlar", "anomaliya", "status"],
      ["2026-08-19 09:00", "Forecast v2", 94.7, 186, 1240, 2, "Faol"],
      ["2026-08-19 08:00", "Forecast v2", 94.3, 192, 1188, 1, "Faol"],
      ["2026-08-19 07:00", "Anomaly v1", 92.8, 174, 1102, 4, "Faol"],
      ["2026-08-18 18:00", "Forecast v2", 94.1, 189, 1340, 0, "Faol"],
      ["2026-08-18 17:00", "Anomaly v1", 92.5, 181, 1276, 3, "Faol"],
    ],
  },
  {
    id: "operations-demo",
    name: "operatsion-demo.csv",
    format: "CSV",
    size: "860 KB",
    rows: 4040,
    columns: 6,
    quality: 84,
    uploadedAt: "17-avgust, 11:05",
    status: "warning",
    preview: [
      ["jarayon", "boshlanish", "yakun", "davomiylik_s", "xarajat_mln", "xato"],
      ["Qabul qilish", "08:10", "08:18", 480, 1.24, false],
      ["Tekshirish", "08:19", "08:31", 720, 2.18, false],
      ["Qayta ishlash", "08:32", "08:58", 1560, 4.82, true],
      ["Tasdiqlash", "09:02", "09:11", 540, 1.76, false],
      ["Eksport", "09:12", "09:16", 240, 0.68, false],
    ],
  },
];

export const demoDataset: Dataset = {
  id: "economic-demo",
  name: "iqtisodiy-samaradorlik-demo.csv",
  format: "CSV",
  size: "24 KB",
  rows: 120,
  columns: 7,
  quality: 100,
  uploadedAt: "Hozirgina",
  status: "ready",
  preview: [
    ["oy", "daromad_mln", "xarajat_mln", "tejalgan_mln", "vaqt_soat", "roi", "ees"],
    ["Yanvar", 186.4, 148.2, 8.1, 262, 18.4, 71.2],
    ["Fevral", 192.8, 144.7, 9.6, 284, 20.1, 74.6],
    ["Mart", 204.1, 141.3, 11.2, 316, 23.8, 78.3],
    ["Aprel", 218.6, 136.8, 13.4, 352, 26.4, 81.7],
    ["May", 229.3, 131.2, 15.1, 386, 29.2, 84.1],
    ["Iyun", 241.7, 124.5, 17.6, 428, 31.8, 86.4],
  ],
};
