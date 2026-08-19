export type EfficiencyComponent = {
  label: string;
  value: number;
  color: string;
};

export type ComparisonMetric = {
  key: string;
  label: string;
  shortLabel: string;
  before: number;
  after: number;
  beforeLabel: string;
  afterLabel: string;
  beforeIndex: number;
  afterIndex: number;
  change: string;
  changeLabel: string;
  positiveDirection: "up" | "down";
};

export const economicKpis = [
  {
    key: "roi",
    label: "Investitsiya qaytimi",
    value: "31.8%",
    change: "+4.5%",
    detail: "oldingi davrga nisbatan",
    tone: "primary",
    icon: "chart",
  },
  {
    key: "cost",
    label: "Tejalgan xarajat",
    value: "22.0",
    suffix: "mln so'm / oy",
    change: "−14.7%",
    detail: "operatsion xarajat",
    tone: "success",
    icon: "wallet",
  },
  {
    key: "labor",
    label: "Tejalgan mehnat vaqti",
    value: "350",
    suffix: "soat / oy",
    change: "−29.2%",
    detail: "qo'lda bajariladigan ish",
    tone: "success",
    icon: "clock",
  },
  {
    key: "productivity",
    label: "Unumdorlik o'sishi",
    value: "+23.6%",
    change: "72% → 89%",
    detail: "AI joriy etilgandan keyin",
    tone: "accent",
    icon: "trend",
  },
] as const;

export const efficiencyComponents: EfficiencyComponent[] = [
  { label: "Vaqt samaradorligi", value: 92, color: "var(--chart-1)" },
  { label: "Xarajat samaradorligi", value: 85, color: "var(--chart-2)" },
  { label: "Mehnat unumdorligi", value: 89, color: "var(--chart-5)" },
  { label: "Avtomatlashtirish", value: 78, color: "var(--chart-3)" },
  { label: "AI aniqligi", value: 94.7, color: "var(--chart-4)" },
];

export const comparisonMetrics: ComparisonMetric[] = [
  {
    key: "processing",
    label: "Qayta ishlash vaqti",
    shortLabel: "Qayta ishlash",
    before: 8.4,
    after: 2.1,
    beforeLabel: "8.4 soniya",
    afterLabel: "2.1 soniya",
    beforeIndex: 100,
    afterIndex: 25,
    change: "−75.0%",
    changeLabel: "tezlashdi",
    positiveDirection: "down",
  },
  {
    key: "labor",
    label: "Mehnat vaqti",
    shortLabel: "Mehnat vaqti",
    before: 1200,
    after: 850,
    beforeLabel: "1,200 soat",
    afterLabel: "850 soat",
    beforeIndex: 100,
    afterIndex: 70.8,
    change: "−350 soat",
    changeLabel: "oylik tejash",
    positiveDirection: "down",
  },
  {
    key: "cost",
    label: "Operatsion xarajat",
    shortLabel: "Xarajat",
    before: 150,
    after: 128,
    beforeLabel: "150 mln so'm",
    afterLabel: "128 mln so'm",
    beforeIndex: 100,
    afterIndex: 85.3,
    change: "−22 mln",
    changeLabel: "oylik tejash",
    positiveDirection: "down",
  },
  {
    key: "error",
    label: "Xatolar darajasi",
    shortLabel: "Xatolar",
    before: 4.8,
    after: 1.7,
    beforeLabel: "4.8%",
    afterLabel: "1.7%",
    beforeIndex: 100,
    afterIndex: 35.4,
    change: "−64.6%",
    changeLabel: "xatolar kamayishi",
    positiveDirection: "down",
  },
  {
    key: "productivity",
    label: "Unumdorlik",
    shortLabel: "Unumdorlik",
    before: 72,
    after: 89,
    beforeLabel: "72%",
    afterLabel: "89%",
    beforeIndex: 100,
    afterIndex: 123.6,
    change: "+23.6%",
    changeLabel: "o'sish",
    positiveDirection: "up",
  },
];

export const scenarioPresets = [
  { key: "conservative", label: "Ehtiyotkor", automation: 70, accuracy: 91 },
  { key: "balanced", label: "Balansli", automation: 80, accuracy: 95 },
  { key: "active", label: "Faol", automation: 90, accuracy: 97 },
] as const;

