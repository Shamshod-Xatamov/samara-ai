export type AiPeriodKey = "seven" | "thirty";
export type ForecastMetricKey =
  | "operatingCost"
  | "processingTime"
  | "productivity";
export type AnomalySeverity = "critical" | "warning" | "info";

export type ForecastPoint = {
  label: string;
  actual: number | null;
  predicted: number | null;
};

export type AnomalyTrendPoint = {
  label: string;
  expected: number;
  actual: number;
};

export type DetectedAnomaly = {
  id: string;
  title: string;
  metric: string;
  severity: AnomalySeverity;
  time: string;
  change: string;
  current: string;
  expected: string;
  impact: string;
  description: string;
  recommendation: string;
  causes: Array<{ label: string; value: number }>;
  trend: AnomalyTrendPoint[];
};

export const aiPeriods: Array<{ key: AiPeriodKey; label: string }> = [
  { key: "seven", label: "7 kun" },
  { key: "thirty", label: "30 kun" },
];

export const forecastMetrics: Array<{
  key: ForecastMetricKey;
  label: string;
  shortLabel: string;
  unit: string;
  decimals: number;
  positiveWhen: "up" | "down";
  insightTitle: string;
  insight: string;
  factors: Array<{ label: string; value: number }>;
}> = [
  {
    key: "operatingCost",
    label: "Operatsion xarajat",
    shortLabel: "Xarajat",
    unit: "mln so'm",
    decimals: 1,
    positiveWhen: "down",
    insightTitle: "Xarajat bosimi kutilmoqda",
    insight:
      "Joriy yuklama saqlansa, operatsion xarajat qisqa davrda oshishi mumkin. Asosiy omil — server yuklamasi va qo'lda bajarilayotgan amallar.",
    factors: [
      { label: "Server yuklamasi", value: 46 },
      { label: "Qo'lda bajariladigan ish", value: 31 },
      { label: "Ma'lumot hajmi", value: 23 },
    ],
  },
  {
    key: "processingTime",
    label: "Qayta ishlash vaqti",
    shortLabel: "Vaqt",
    unit: "soniya",
    decimals: 2,
    positiveWhen: "down",
    insightTitle: "Qayta ishlash tezlashadi",
    insight:
      "Tozalangan dataset va avtomatlashtirilgan pipeline hisobiga o'rtacha qayta ishlash vaqti pasayishi prognoz qilinmoqda.",
    factors: [
      { label: "Pipeline optimizatsiyasi", value: 52 },
      { label: "Kesh samarasi", value: 29 },
      { label: "Kamaygan xatolar", value: 19 },
    ],
  },
  {
    key: "productivity",
    label: "Unumdorlik",
    shortLabel: "Unumdorlik",
    unit: "%",
    decimals: 1,
    positiveWhen: "up",
    insightTitle: "Unumdorlik o'sishi barqaror",
    insight:
      "Takroriy vazifalarni avtomatlashtirish va aniqroq ma'lumot oqimi xodimlar unumdorligini izchil oshirishi kutilmoqda.",
    factors: [
      { label: "Avtomatlashtirish", value: 49 },
      { label: "Tejalgan vaqt", value: 34 },
      { label: "AI aniqligi", value: 17 },
    ],
  },
];

function createForecastSeries(
  actualLabels: string[],
  forecastLabels: string[],
  actualValues: number[],
  forecastValues: number[],
): ForecastPoint[] {
  const boundaryValue = actualValues.at(-1) ?? 0;

  return [
    ...actualLabels.map((label, index) => ({
      label,
      actual: actualValues[index],
      predicted: index === actualLabels.length - 1 ? boundaryValue : null,
    })),
    ...forecastLabels.map((label, index) => ({
      label,
      actual: null,
      predicted: forecastValues[index],
    })),
  ];
}

export const forecastData: Record<
  AiPeriodKey,
  {
    confidence: number;
    boundaryLabel: string;
    series: Record<ForecastMetricKey, ForecastPoint[]>;
  }
> = {
  seven: {
    confidence: 96.2,
    boundaryLabel: "19-avg",
    series: {
      operatingCost: createForecastSeries(
        ["13-avg", "14-avg", "15-avg", "16-avg", "17-avg", "18-avg", "19-avg"],
        ["20-avg", "21-avg", "22-avg", "23-avg", "24-avg", "25-avg", "26-avg"],
        [120.8, 121.4, 121.1, 122.6, 123.2, 123.8, 124.5],
        [124.9, 125.4, 125.8, 126.4, 126.9, 127.3, 127.8],
      ),
      processingTime: createForecastSeries(
        ["13-avg", "14-avg", "15-avg", "16-avg", "17-avg", "18-avg", "19-avg"],
        ["20-avg", "21-avg", "22-avg", "23-avg", "24-avg", "25-avg", "26-avg"],
        [1.42, 1.38, 1.36, 1.33, 1.29, 1.27, 1.24],
        [1.22, 1.2, 1.19, 1.16, 1.14, 1.12, 1.11],
      ),
      productivity: createForecastSeries(
        ["13-avg", "14-avg", "15-avg", "16-avg", "17-avg", "18-avg", "19-avg"],
        ["20-avg", "21-avg", "22-avg", "23-avg", "24-avg", "25-avg", "26-avg"],
        [82.8, 83.6, 84.1, 84.9, 85.7, 86.8, 87.6],
        [88.0, 88.4, 89.1, 89.5, 90.0, 90.4, 90.8],
      ),
    },
  },
  thirty: {
    confidence: 94.7,
    boundaryLabel: "19-avg",
    series: {
      operatingCost: createForecastSeries(
        ["21-iyl", "26-iyl", "31-iyl", "5-avg", "10-avg", "15-avg", "19-avg"],
        ["24-avg", "29-avg", "3-sen", "8-sen", "13-sen", "18-sen"],
        [118.2, 118.9, 120.1, 121.4, 122.2, 123.6, 124.5],
        [125.3, 126.1, 126.8, 127.6, 128.4, 129.1],
      ),
      processingTime: createForecastSeries(
        ["21-iyl", "26-iyl", "31-iyl", "5-avg", "10-avg", "15-avg", "19-avg"],
        ["24-avg", "29-avg", "3-sen", "8-sen", "13-sen", "18-sen"],
        [1.56, 1.51, 1.47, 1.4, 1.34, 1.29, 1.24],
        [1.2, 1.17, 1.14, 1.1, 1.08, 1.05],
      ),
      productivity: createForecastSeries(
        ["21-iyl", "26-iyl", "31-iyl", "5-avg", "10-avg", "15-avg", "19-avg"],
        ["24-avg", "29-avg", "3-sen", "8-sen", "13-sen", "18-sen"],
        [80.4, 81.2, 82.3, 83.7, 85.0, 86.2, 87.6],
        [88.3, 89.1, 90.0, 90.9, 91.6, 92.4],
      ),
    },
  },
};

export const anomalies: DetectedAnomaly[] = [
  {
    id: "cost-spike",
    title: "Operatsion xarajat keskin oshdi",
    metric: "Operatsion xarajat",
    severity: "critical",
    time: "Bugun, 14:32",
    change: "+18.4%",
    current: "148.2 mln so'm",
    expected: "125.2 mln so'm",
    impact: "+8.4 mln so'm / oy",
    description:
      "Xarajat qiymati model kutgan diapazondan sezilarli yuqoriga chiqdi va ketma-ket uchta kuzatuvda saqlanib qoldi.",
    recommendation:
      "4-jarayondagi server yuklamasini tekshiring va qo'lda bajariladigan navbatni vaqtincha qayta taqsimlang.",
    causes: [
      { label: "Server yuklamasi", value: 48 },
      { label: "Qayta ishlash kechikishi", value: 32 },
      { label: "Qo'lda bajariladigan amallar", value: 20 },
    ],
    trend: [
      { label: "11:00", expected: 124, actual: 123 },
      { label: "11:30", expected: 124, actual: 125 },
      { label: "12:00", expected: 125, actual: 126 },
      { label: "12:30", expected: 125, actual: 130 },
      { label: "13:00", expected: 125, actual: 138 },
      { label: "13:30", expected: 125, actual: 144 },
      { label: "14:00", expected: 125, actual: 148.2 },
    ],
  },
  {
    id: "latency-rise",
    title: "Qayta ishlash kechikishi oshdi",
    metric: "Kechikish",
    severity: "warning",
    time: "Bugun, 12:18",
    change: "+21.7%",
    current: "620 ms",
    expected: "500 ms dan past",
    impact: "−3.8 soat / hafta",
    description:
      "Kechikish belgilangan 500 ms chegaradan oshdi. Holat yuqori yuklama vaqtida takrorlanmoqda.",
    recommendation:
      "Navbatdagi yozuvlarni paketlab qayta ishlashni yoqing va sekin endpointlarni profiling qiling.",
    causes: [
      { label: "So'rovlar navbati", value: 44 },
      { label: "API javob vaqti", value: 36 },
      { label: "Tarmoq kechikishi", value: 20 },
    ],
    trend: [
      { label: "09:00", expected: 430, actual: 418 },
      { label: "09:30", expected: 435, actual: 442 },
      { label: "10:00", expected: 440, actual: 467 },
      { label: "10:30", expected: 445, actual: 486 },
      { label: "11:00", expected: 450, actual: 522 },
      { label: "11:30", expected: 455, actual: 578 },
      { label: "12:00", expected: 460, actual: 620 },
    ],
  },
  {
    id: "accuracy-drift",
    title: "AI aniqligida og'ish kuzatildi",
    metric: "AI aniqligi",
    severity: "warning",
    time: "Kecha, 17:45",
    change: "−4.2%",
    current: "90.5%",
    expected: "94.7%",
    impact: "312 ta yozuv",
    description:
      "Yangi yuklangan dataset taqsimoti avvalgi o'quv ma'lumotlaridan farq qilgani sababli aniqlik pasaydi.",
    recommendation:
      "Modelni yangi tozalangan dataset bilan qayta tekshiring va aniqlik chegarasini 92% da saqlang.",
    causes: [
      { label: "Ma'lumot siljishi", value: 55 },
      { label: "Yangi kategoriyalar", value: 27 },
      { label: "Bo'sh qiymatlar", value: 18 },
    ],
    trend: [
      { label: "12-avg", expected: 94.2, actual: 94.5 },
      { label: "13-avg", expected: 94.3, actual: 94.1 },
      { label: "14-avg", expected: 94.4, actual: 93.8 },
      { label: "15-avg", expected: 94.5, actual: 93.2 },
      { label: "16-avg", expected: 94.6, actual: 92.1 },
      { label: "17-avg", expected: 94.7, actual: 91.3 },
      { label: "18-avg", expected: 94.7, actual: 90.5 },
    ],
  },
  {
    id: "volume-pattern",
    title: "Ma'lumot hajmida yangi pattern",
    metric: "Ma'lumot hajmi",
    severity: "info",
    time: "18-avg, 09:10",
    change: "+12.6%",
    current: "14,020 yozuv",
    expected: "12,450 yozuv",
    impact: "Nazorat talab qilinadi",
    description:
      "Yozuvlar hajmi odatiy diapazondan oshdi, ammo qayta ishlash sifati va xato darajasiga salbiy ta'sir aniqlanmadi.",
    recommendation:
      "Hajm o'sishini kuzatishda davom eting; hozircha infratuzilmani o'zgartirish talab qilinmaydi.",
    causes: [
      { label: "Yangi manba", value: 62 },
      { label: "Faollik o'sishi", value: 25 },
      { label: "Takroriy yozuvlar", value: 13 },
    ],
    trend: [
      { label: "12-avg", expected: 11800, actual: 11640 },
      { label: "13-avg", expected: 11900, actual: 12020 },
      { label: "14-avg", expected: 12000, actual: 12280 },
      { label: "15-avg", expected: 12100, actual: 12640 },
      { label: "16-avg", expected: 12200, actual: 13120 },
      { label: "17-avg", expected: 12300, actual: 13680 },
      { label: "18-avg", expected: 12450, actual: 14020 },
    ],
  },
];
