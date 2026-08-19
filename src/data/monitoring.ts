export type StreamPoint = {
  label: string;
  received: number;
  processed: number;
  latency: number;
  errorRate: number;
};

export type MonitoringSeverity = "success" | "warning" | "critical" | "info";

export type MonitoringFeedItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  severity: MonitoringSeverity;
  status?: "active" | "resolved";
};

export const initialStreamData: StreamPoint[] = [
  { label: "20:12", received: 1168, processed: 1159, latency: 356, errorRate: 0.62 },
  { label: "20:14", received: 1185, processed: 1178, latency: 371, errorRate: 0.7 },
  { label: "20:16", received: 1204, processed: 1194, latency: 384, errorRate: 0.68 },
  { label: "20:18", received: 1192, processed: 1186, latency: 365, errorRate: 0.61 },
  { label: "20:20", received: 1228, processed: 1217, latency: 402, errorRate: 0.74 },
  { label: "20:22", received: 1241, processed: 1234, latency: 418, errorRate: 0.79 },
  { label: "20:24", received: 1219, processed: 1212, latency: 394, errorRate: 0.71 },
  { label: "20:26", received: 1262, processed: 1251, latency: 431, errorRate: 0.82 },
  { label: "20:28", received: 1278, processed: 1266, latency: 446, errorRate: 0.89 },
  { label: "20:30", received: 1254, processed: 1248, latency: 421, errorRate: 0.76 },
  { label: "20:32", received: 1288, processed: 1276, latency: 458, errorRate: 0.91 },
  { label: "20:34", received: 1269, processed: 1260, latency: 438, errorRate: 0.84 },
  { label: "20:36", received: 1296, processed: 1284, latency: 472, errorRate: 0.96 },
  { label: "20:38", received: 1274, processed: 1268, latency: 447, errorRate: 0.83 },
  { label: "20:40", received: 1248, processed: 1241, latency: 426, errorRate: 0.8 },
];

export const monitoringEvents: MonitoringFeedItem[] = [
  {
    id: "batch-processed",
    title: "Yangi paket qayta ishlandi",
    detail: "2 481 ta yozuv 1.18 soniyada tekshirildi.",
    time: "Hozirgina",
    severity: "success",
  },
  {
    id: "forecast-updated",
    title: "AI prognozi yangilandi",
    detail: "30 kunlik xarajat prognozi qayta hisoblandi.",
    time: "1 daq oldin",
    severity: "info",
  },
  {
    id: "quality-check",
    title: "Sifat nazorati yakunlandi",
    detail: "Ma'lumot sifati 96.8% darajada tasdiqlandi.",
    time: "3 daq oldin",
    severity: "success",
  },
  {
    id: "queue-balanced",
    title: "Navbat avtomatik taqsimlandi",
    detail: "Yuklama 2- va 3-worker orasida muvozanatlandi.",
    time: "6 daq oldin",
    severity: "info",
  },
  {
    id: "model-validation",
    title: "Model validatsiyadan o'tdi",
    detail: "Aniqlik 94.7%, og'ish me'yor ichida.",
    time: "11 daq oldin",
    severity: "success",
  },
];

export const monitoringAlerts: MonitoringFeedItem[] = [
  {
    id: "latency-near-limit",
    title: "Kechikish chegaraga yaqinlashdi",
    detail: "Eng yuqori qiymat 472 ms, belgilangan chegara 500 ms.",
    time: "4 daq oldin",
    severity: "warning",
    status: "active",
  },
  {
    id: "cost-spike",
    title: "Operatsion xarajat sakrashi",
    detail: "Xarajat kutilgan qiymatdan 18.4% yuqori qayd etildi.",
    time: "14:32",
    severity: "critical",
    status: "resolved",
  },
  {
    id: "error-restored",
    title: "Xato ulushi me'yorga qaytdi",
    detail: "Ko'rsatkich 2.3% dan 0.8% gacha pasaydi.",
    time: "12:24",
    severity: "success",
    status: "resolved",
  },
  {
    id: "model-drift",
    title: "Model og'ishi tekshirildi",
    detail: "Drift darajasi 1.2%; qayta o'qitish talab qilinmaydi.",
    time: "10:08",
    severity: "info",
    status: "resolved",
  },
];

export const pipelineServices = [
  {
    name: "Ma'lumot oqimi",
    detail: "Demo stream",
    latency: "42 ms",
    availability: "99.99%",
  },
  {
    name: "Qayta ishlash",
    detail: "3 worker faol",
    latency: "1.24 s",
    availability: "99.96%",
  },
  {
    name: "AI tahlili",
    detail: "Model v2.4",
    latency: "286 ms",
    availability: "99.92%",
  },
  {
    name: "Iqtisodiy qatlam",
    detail: "EES hisoblash",
    latency: "64 ms",
    availability: "100%",
  },
];

export const resourceUsage = [
  { label: "CPU", value: 62, tone: "primary" },
  { label: "Xotira", value: 71, tone: "accent" },
  { label: "Navbat", value: 28, tone: "info" },
] as const;

export const economicSignals = [
  { label: "Operatsion xarajat", value: "124.5 mln", change: "−12.4%", positive: true },
  { label: "Unumdorlik", value: "89%", change: "+4.8%", positive: true },
  { label: "EES", value: "86.4", change: "+3.2", positive: true },
];
