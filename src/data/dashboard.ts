export type PeriodKey = "today" | "week" | "month" | "quarter" | "year";

export type ChartMetricKey =
  | "efficiency"
  | "cost"
  | "processing"
  | "accuracy"
  | "productivity";

export type DashboardPoint = {
  label: string;
  efficiency: number;
  cost: number;
  processing: number;
  accuracy: number;
  productivity: number;
};

export const periodOptions: Array<{ key: PeriodKey; label: string }> = [
  { key: "today", label: "Bugun" },
  { key: "week", label: "7 kun" },
  { key: "month", label: "30 kun" },
  { key: "quarter", label: "Chorak" },
  { key: "year", label: "Yil" },
];

export const periodLabels: Record<PeriodKey, string> = {
  today: "bugungi kun",
  week: "so'nggi 7 kun",
  month: "so'nggi 30 kun",
  quarter: "joriy chorak",
  year: "so'nggi 12 oy",
};

export const chartMetrics: Array<{
  key: ChartMetricKey;
  label: string;
  shortLabel: string;
  unit: string;
  color: string;
  minimum: number;
  maximum: number;
}> = [
  {
    key: "efficiency",
    label: "Samaradorlik",
    shortLabel: "Indeks",
    unit: "%",
    color: "var(--chart-1)",
    minimum: 60,
    maximum: 100,
  },
  {
    key: "cost",
    label: "Xarajat",
    shortLabel: "Xarajat",
    unit: " mln so'm",
    color: "var(--chart-2)",
    minimum: 100,
    maximum: 155,
  },
  {
    key: "processing",
    label: "Qayta ishlash",
    shortLabel: "Vaqt",
    unit: " s",
    color: "var(--chart-3)",
    minimum: 0.8,
    maximum: 2.4,
  },
  {
    key: "accuracy",
    label: "AI aniqligi",
    shortLabel: "Aniqlik",
    unit: "%",
    color: "var(--chart-4)",
    minimum: 80,
    maximum: 100,
  },
  {
    key: "productivity",
    label: "Unumdorlik",
    shortLabel: "Unumdorlik",
    unit: "%",
    color: "var(--chart-5)",
    minimum: 55,
    maximum: 100,
  },
];

export const dashboardMetrics = [
  {
    label: "Samaradorlik indeksi",
    value: "86.4%",
    change: "+3.2%",
    comparison: "oldingi davrga nisbatan",
    direction: "up",
    icon: "gauge",
  },
  {
    label: "Qayta ishlash vaqti",
    value: "1.24",
    suffix: "soniya",
    change: "−18.6%",
    comparison: "tezroq natija",
    direction: "down",
    icon: "clock",
  },
  {
    label: "AI aniqligi",
    value: "94.7%",
    change: "+2.1%",
    comparison: "aniqlik o'sishi",
    direction: "up",
    icon: "brain",
  },
  {
    label: "Avtomatlashtirish",
    value: "78%",
    change: "+5.4%",
    comparison: "jarayonlar ulushi",
    direction: "up",
    icon: "workflow",
  },
  {
    label: "Operatsion xarajat",
    value: "124.5",
    suffix: "mln so'm",
    change: "−12.4%",
    comparison: "xarajat kamaydi",
    direction: "down",
    icon: "wallet",
  },
  {
    label: "Tejalgan xarajat",
    value: "17.6",
    suffix: "mln so'm",
    change: "+8.7%",
    comparison: "qo'shimcha tejash",
    direction: "up",
    icon: "piggy-bank",
  },
  {
    label: "Tejalgan vaqt",
    value: "428",
    suffix: "soat",
    change: "+46",
    comparison: "shu davrda",
    direction: "up",
    icon: "timer",
  },
  {
    label: "Investitsiya qaytimi",
    value: "31.8%",
    change: "+4.5%",
    comparison: "ROI o'sishi",
    direction: "up",
    icon: "chart",
  },
] as const;

export const chartData: Record<PeriodKey, DashboardPoint[]> = {
  today: [
    { label: "08:00", efficiency: 76, cost: 146, processing: 2.1, accuracy: 86, productivity: 66 },
    { label: "10:00", efficiency: 78, cost: 142, processing: 1.9, accuracy: 88, productivity: 70 },
    { label: "12:00", efficiency: 81, cost: 138, processing: 1.7, accuracy: 90, productivity: 73 },
    { label: "14:00", efficiency: 80, cost: 137, processing: 1.65, accuracy: 91, productivity: 75 },
    { label: "16:00", efficiency: 84, cost: 130, processing: 1.42, accuracy: 93, productivity: 80 },
    { label: "18:00", efficiency: 85, cost: 127, processing: 1.31, accuracy: 94, productivity: 83 },
    { label: "20:00", efficiency: 86.4, cost: 124.5, processing: 1.24, accuracy: 94.7, productivity: 86 },
  ],
  week: [
    { label: "Du", efficiency: 72, cost: 151, processing: 2.2, accuracy: 84, productivity: 64 },
    { label: "Se", efficiency: 75, cost: 147, processing: 2.02, accuracy: 87, productivity: 68 },
    { label: "Ch", efficiency: 74, cost: 146, processing: 1.94, accuracy: 88, productivity: 71 },
    { label: "Pa", efficiency: 79, cost: 139, processing: 1.72, accuracy: 90, productivity: 74 },
    { label: "Ju", efficiency: 82, cost: 135, processing: 1.55, accuracy: 92, productivity: 79 },
    { label: "Sh", efficiency: 84, cost: 129, processing: 1.38, accuracy: 93.2, productivity: 83 },
    { label: "Ya", efficiency: 86.4, cost: 124.5, processing: 1.24, accuracy: 94.7, productivity: 86 },
  ],
  month: [
    { label: "1-hafta", efficiency: 69, cost: 154, processing: 2.3, accuracy: 83, productivity: 61 },
    { label: "2-hafta", efficiency: 72, cost: 150, processing: 2.12, accuracy: 85, productivity: 65 },
    { label: "3-hafta", efficiency: 74, cost: 147, processing: 1.98, accuracy: 87, productivity: 69 },
    { label: "4-hafta", efficiency: 77, cost: 143, processing: 1.82, accuracy: 89, productivity: 72 },
    { label: "5-hafta", efficiency: 80, cost: 137, processing: 1.62, accuracy: 91, productivity: 77 },
    { label: "6-hafta", efficiency: 82, cost: 133, processing: 1.5, accuracy: 92, productivity: 80 },
    { label: "7-hafta", efficiency: 84, cost: 128, processing: 1.35, accuracy: 93.5, productivity: 83 },
    { label: "Bugun", efficiency: 86.4, cost: 124.5, processing: 1.24, accuracy: 94.7, productivity: 86 },
  ],
  quarter: [
    { label: "1-hafta", efficiency: 64, cost: 153, processing: 2.35, accuracy: 81, productivity: 58 },
    { label: "2-hafta", efficiency: 66, cost: 151, processing: 2.28, accuracy: 82, productivity: 60 },
    { label: "3-hafta", efficiency: 67, cost: 149, processing: 2.18, accuracy: 84, productivity: 63 },
    { label: "4-hafta", efficiency: 70, cost: 146, processing: 2.03, accuracy: 85, productivity: 66 },
    { label: "5-hafta", efficiency: 72, cost: 145, processing: 1.91, accuracy: 87, productivity: 69 },
    { label: "6-hafta", efficiency: 74, cost: 141, processing: 1.78, accuracy: 88, productivity: 72 },
    { label: "7-hafta", efficiency: 76, cost: 138, processing: 1.68, accuracy: 90, productivity: 74 },
    { label: "8-hafta", efficiency: 78, cost: 134, processing: 1.57, accuracy: 91, productivity: 77 },
    { label: "9-hafta", efficiency: 81, cost: 131, processing: 1.47, accuracy: 92, productivity: 80 },
    { label: "10-hafta", efficiency: 82, cost: 129, processing: 1.4, accuracy: 93, productivity: 82 },
    { label: "11-hafta", efficiency: 84, cost: 127, processing: 1.32, accuracy: 94, productivity: 84 },
    { label: "12-hafta", efficiency: 86.4, cost: 124.5, processing: 1.24, accuracy: 94.7, productivity: 86 },
  ],
  year: [
    { label: "Sen", efficiency: 61, cost: 154, processing: 2.4, accuracy: 79, productivity: 55 },
    { label: "Okt", efficiency: 63, cost: 152, processing: 2.31, accuracy: 81, productivity: 58 },
    { label: "Noy", efficiency: 65, cost: 149, processing: 2.2, accuracy: 82, productivity: 60 },
    { label: "Dek", efficiency: 68, cost: 147, processing: 2.08, accuracy: 84, productivity: 64 },
    { label: "Yan", efficiency: 69, cost: 145, processing: 1.97, accuracy: 85, productivity: 67 },
    { label: "Fev", efficiency: 72, cost: 142, processing: 1.86, accuracy: 87, productivity: 70 },
    { label: "Mar", efficiency: 74, cost: 139, processing: 1.74, accuracy: 88, productivity: 73 },
    { label: "Apr", efficiency: 77, cost: 136, processing: 1.62, accuracy: 90, productivity: 76 },
    { label: "May", efficiency: 79, cost: 133, processing: 1.52, accuracy: 91, productivity: 79 },
    { label: "Iyun", efficiency: 82, cost: 130, processing: 1.42, accuracy: 92, productivity: 81 },
    { label: "Iyul", efficiency: 84, cost: 127, processing: 1.33, accuracy: 94, productivity: 84 },
    { label: "Avg", efficiency: 86.4, cost: 124.5, processing: 1.24, accuracy: 94.7, productivity: 86 },
  ],
};

export const efficiencyBreakdown = [
  { label: "Vaqt samaradorligi", value: 92, color: "bg-chart-1" },
  { label: "Xarajat samaradorligi", value: 85, color: "bg-chart-2" },
  { label: "Avtomatlashtirish", value: 78, color: "bg-chart-3" },
  { label: "AI aniqligi", value: 95, color: "bg-chart-4" },
] as const;

export const recentAlerts = [
  {
    title: "Server yuklamasi oshdi",
    detail: "Joriy yuklama 82%, belgilangan chegara 75%.",
    time: "12 daqiqa oldin",
    tone: "warning",
  },
  {
    title: "Xarajat limiti yaqinlashmoqda",
    detail: "Oylik limitning 89% qismi ishlatildi.",
    time: "1 soat oldin",
    tone: "danger",
  },
  {
    title: "AI modeli yangilandi",
    detail: "Aniqlik 92.6% dan 94.7% ga ko'tarildi.",
    time: "3 soat oldin",
    tone: "info",
  },
] as const;
