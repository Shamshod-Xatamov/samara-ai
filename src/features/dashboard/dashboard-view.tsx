"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BellRing,
  BrainCircuit,
  ChartNoAxesCombined,
  Clock3,
  Database,
  Gauge,
  Info,
  Lightbulb,
  LoaderCircle,
  PiggyBank,
  Sparkles,
  TimerReset,
  WalletCards,
  Workflow,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/layout/page-header";
import { formatDate, formatNumber } from "@/lib/format";
import { recentAlerts } from "@/data/dashboard";
import {
  getMetrics,
  type EesComponent,
  type Kpi,
  type MetricPoint,
  type MetricsResponse,
  type PeriodKey,
} from "@/services/metrics";

const periodOptions: Array<{ key: PeriodKey; label: string }> = [
  { key: "today", label: "Bugun" },
  { key: "week", label: "7 kun" },
  { key: "month", label: "30 kun" },
  { key: "quarter", label: "Chorak" },
  { key: "year", label: "Yil" },
];

const periodLabels: Record<PeriodKey, string> = {
  today: "so'nggi kun",
  week: "so'nggi 7 kun",
  month: "so'nggi 30 kun",
  quarter: "so'nggi chorak",
  year: "so'nggi 12 oy",
};

type ChartMetricKey = "efficiency" | "cost" | "processing" | "accuracy" | "productivity";

const chartMetrics: Array<{
  key: ChartMetricKey;
  label: string;
  unit: string;
  decimals: number;
}> = [
  { key: "efficiency", label: "Samaradorlik", unit: "%", decimals: 1 },
  { key: "cost", label: "Xarajat", unit: " mln so'm", decimals: 1 },
  { key: "processing", label: "Qayta ishlash", unit: " s", decimals: 2 },
  { key: "accuracy", label: "Aniqlik", unit: "%", decimals: 1 },
  { key: "productivity", label: "Unumdorlik", unit: "%", decimals: 1 },
];

const kpiIcons: Record<string, typeof Gauge> = {
  efficiency: Gauge,
  processing: Clock3,
  accuracy: BrainCircuit,
  automation: Workflow,
  cost: WalletCards,
  savedCost: PiggyBank,
  savedHours: TimerReset,
  roi: ChartNoAxesCombined,
};

const componentBarColors: Record<string, string> = {
  time: "bg-chart-1",
  cost: "bg-chart-2",
  labor: "bg-chart-5",
  automation: "bg-chart-3",
  quality: "bg-chart-4",
};

const alertStyles = {
  warning: { icon: AlertTriangle, iconClass: "bg-warning-soft text-warning", dotClass: "bg-warning" },
  danger: { icon: BellRing, iconClass: "bg-danger-soft text-danger", dotClass: "bg-danger" },
  info: { icon: Info, iconClass: "bg-info-soft text-info", dotClass: "bg-info" },
};

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpiIcons[kpi.key] ?? Gauge;

  const delta = kpi.change ?? kpi.absoluteChange;
  const hasDelta = delta !== null && Number.isFinite(delta);
  const isImprovement = hasDelta
    ? kpi.positiveWhen === "up"
      ? delta > 0
      : delta < 0
    : false;

  const TrendIcon = hasDelta && delta > 0 ? ArrowUpRight : ArrowDownRight;
  const deltaText = hasDelta
    ? `${delta > 0 ? "+" : "−"}${Math.abs(delta).toFixed(1)}${kpi.change !== null ? "%" : ""}`
    : null;

  return (
    <article className="group min-w-0 rounded-lg border border-border bg-surface p-3.5 shadow-card transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="min-h-8 text-[13px] font-semibold leading-4 text-muted">{kpi.label}</p>
        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-surface-muted text-muted-strong ring-1 ring-inset ring-border/80 transition-colors group-hover:bg-primary-soft group-hover:text-primary">
          <Icon className="size-4" strokeWidth={1.8} aria-hidden="true" />
        </span>
      </div>

      <div className="mt-2.5 flex min-w-0 items-end gap-1.5">
        <p className="truncate font-mono text-xl font-bold leading-none tracking-[-0.045em] text-foreground sm:text-[1.4rem]">
          {formatNumber(kpi.value, kpi.decimals)}
        </p>
        <p className="mb-0.5 truncate text-xs font-semibold text-muted">{kpi.unit}</p>
      </div>

      <div className="mt-3 flex min-w-0 items-center gap-1.5 border-t border-border pt-2.5">
        {deltaText ? (
          <span
            className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[11px] font-bold sm:text-xs ${
              isImprovement ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
            }`}
          >
            <TrendIcon className="size-3" aria-hidden="true" />
            {deltaText}
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-surface-muted px-1.5 py-0.5 font-mono text-[11px] font-bold text-faint">
            —
          </span>
        )}
        <span className="truncate text-[11px] text-faint sm:text-xs" title={kpi.note ?? kpi.comparison}>
          {kpi.note ?? kpi.comparison}
        </span>
      </div>
    </article>
  );
}

function EfficiencyScore({
  score,
  components,
  coverage,
}: {
  score: number | null;
  components: EesComponent[];
  coverage: number;
}) {
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - ((score ?? 0) / 100) * circumference;

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="ui-label text-faint">Iqtisodiy samaradorlik</p>
          <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">
            Umumiy indeks
          </h2>
        </div>
        <span className="rounded-full bg-accent-soft px-2 py-1 text-xs font-bold text-accent">
          {coverage >= 1 ? "To'liq" : `${Math.round(coverage * 100)}% qamrov`}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-center">
        <div className="relative size-36">
          <svg
            className="size-full -rotate-90"
            viewBox="0 0 120 120"
            role="img"
            aria-label={`Samaradorlik indeksi ${score ?? 0} ball`}
          >
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--surface-muted)" strokeWidth="9" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="var(--primary)"
              strokeLinecap="round"
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-[stroke-dashoffset] duration-500"
            />
          </svg>
          <div className="absolute inset-0 grid place-content-center text-center">
            <p className="font-mono text-3xl font-bold tracking-[-0.06em] text-foreground">
              {score === null ? "—" : score.toFixed(1)}
            </p>
            <p className="mt-0.5 text-xs font-bold uppercase tracking-[0.1em] text-faint">
              100 dan
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3.5">
        {components.map((component) => (
          <div key={component.key}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-[13px] font-medium text-muted">{component.label}</span>
              <span className="font-mono text-[13px] font-bold text-foreground">
                {component.score === null ? "—" : `${component.score.toFixed(0)}%`}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
              <div
                className={`h-full rounded-full transition-[width] duration-500 ${componentBarColors[component.key] ?? "bg-chart-1"}`}
                style={{ width: `${component.score ?? 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DashboardTooltip({
  active,
  payload,
  label,
  metric,
}: {
  active?: boolean;
  payload?: Array<{ value?: number | string; payload?: MetricPoint }>;
  label?: string | number;
  metric: (typeof chartMetrics)[number];
}) {
  if (!active || !payload?.length) return null;

  const rawValue = payload[0]?.value;
  const value = typeof rawValue === "number" ? rawValue : Number(rawValue ?? 0);

  return (
    <div className="min-w-36 rounded-lg border border-border bg-surface px-3 py-2.5 shadow-floating">
      <p className="text-[13px] font-semibold text-muted">{label}</p>
      <p className="mt-1 font-mono text-sm font-bold text-foreground">
        {formatNumber(value, metric.decimals)}
        {metric.unit}
      </p>
    </div>
  );
}

export function DashboardView({
  demoData,
}: {
  /**
   * Landing sahifasidagi ochiq namoyish uchun tayyor ma'lumot.
   * Berilsa, API'ga so'rov yuborilmaydi — sahifa sessiyasiz ham ishlaydi.
   */
  demoData?: MetricsResponse;
} = {}) {
  const [period, setPeriod] = useState<PeriodKey>("month");
  const [activeMetricKey, setActiveMetricKey] = useState<ChartMetricKey>("efficiency");
  const [data, setData] = useState<MetricsResponse | null>(demoData ?? null);
  const [isLoading, setIsLoading] = useState(!demoData);
  const [error, setError] = useState("");

  useEffect(() => {
    if (demoData) return;

    let cancelled = false;

    void getMetrics(period).then((response) => {
      if (cancelled) return;

      setIsLoading(false);

      if (!response.ok) {
        setError(response.message);
        setData(null);
        return;
      }

      setError("");
      setData(response.data);
    });

    return () => {
      cancelled = true;
    };
  }, [period, demoData]);

  const activeMetric = useMemo(
    () => chartMetrics.find((metric) => metric.key === activeMetricKey)!,
    [activeMetricKey],
  );

  const series = data?.series ?? [];
  const currentValue = series.at(-1)?.[activeMetric.key] ?? null;

  if (isLoading && !data) {
    return (
      <div className="mx-auto grid min-h-64 w-full max-w-6xl place-content-center text-center">
        <LoaderCircle className="mx-auto size-6 animate-spin text-primary" aria-hidden="true" />
        <p className="mt-3 text-xs font-medium text-muted">Ko&apos;rsatkichlar hisoblanmoqda...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mx-auto w-full max-w-6xl pb-2">
        <PageHeader
          eyebrow="Bugungi holat"
          title="Umumiy ko'rinish"
          description="Asosiy iqtisodiy va texnologik ko'rsatkichlarni bir joyda kuzating."
        />
        <div className="mt-6 grid min-h-56 place-content-center rounded-lg border border-dashed border-border-strong bg-surface p-8 text-center shadow-card">
          <Database className="mx-auto size-7 text-faint" aria-hidden="true" />
          <h2 className="mt-4 text-sm font-bold text-foreground">Ko&apos;rsatkichlar hali hisoblanmadi</h2>
          <p className="mt-1.5 max-w-md text-[13px] leading-5 text-muted">{error}</p>
          <Link
            href="/malumotlar"
            className="mx-auto mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-primary-hover"
          >
            Ma&apos;lumot manbalariga o&apos;tish
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mx-auto w-full max-w-6xl pb-2">
      <PageHeader
        eyebrow="Bugungi holat"
        title="Umumiy ko'rinish"
        description="Asosiy iqtisodiy va texnologik ko'rsatkichlarni bir joyda kuzating."
        action={
          <div className="inline-flex h-9 max-w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 text-[13px] font-bold text-muted-strong shadow-sm">
            <Database className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate">{data.source.datasetName}</span>
          </div>
        }
      />

      <div className="mt-5 flex items-center justify-between gap-3 overflow-x-auto rounded-lg border border-border bg-surface p-1.5 shadow-card">
        <div className="flex min-w-max items-center gap-1" role="group" aria-label="Ko'rsatkichlar davri">
          {periodOptions.map((option) => {
            const isActive = period === option.key;

            return (
              <button
                key={option.key}
                type="button"
                className={`h-8 rounded-md px-3 text-[13px] font-bold transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted hover:bg-surface-muted hover:text-foreground"
                }`}
                onClick={() => setPeriod(option.key)}
                aria-pressed={isActive}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <p className="hidden shrink-0 pr-2 text-xs font-medium text-faint md:block">
          {formatDate(data.period.from)} — {formatDate(data.period.to)} · {data.period.rowCount} yozuv
          {isLoading && " · yangilanmoqda..."}
        </p>
      </div>

      <section className="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3" aria-label="Asosiy ko'rsatkichlar">
        {data.kpis.map((kpi) => (
          <KpiCard key={kpi.key} kpi={kpi} />
        ))}
      </section>

      <section className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_18.5rem]">
        <div className="min-w-0 rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="ui-label text-faint">Ko&apos;rsatkichlar dinamikasi</p>
              <div className="mt-1 flex items-baseline gap-2">
                <h2 className="text-base font-bold tracking-[-0.02em] text-foreground">
                  {activeMetric.label}
                </h2>
                <span className="font-mono text-sm font-bold text-primary">
                  {formatNumber(currentValue, activeMetric.decimals)}
                  {activeMetric.unit}
                </span>
              </div>
              <p className="mt-1 text-[13px] text-muted">
                {periodLabels[period]} bo&apos;yicha o&apos;zgarish
              </p>
            </div>

            <div
              className="flex max-w-full gap-1 overflow-x-auto rounded-md bg-surface-muted p-1"
              role="tablist"
              aria-label="Grafik ko'rsatkichi"
            >
              {chartMetrics.map((metric) => {
                const isActive = activeMetricKey === metric.key;

                return (
                  <button
                    key={metric.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`h-7 shrink-0 rounded px-2.5 text-xs font-bold transition-colors ${
                      isActive
                        ? "bg-surface text-foreground shadow-sm ring-1 ring-border/80"
                        : "text-muted hover:text-foreground"
                    }`}
                    onClick={() => setActiveMetricKey(metric.key)}
                  >
                    {metric.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 h-64 w-full sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 6, right: 6, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashboard-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  domain={["auto", "auto"]}
                />
                <Tooltip content={<DashboardTooltip metric={activeMetric} />} />
                <Area
                  type="monotone"
                  dataKey={activeMetric.key}
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#dashboard-area)"
                  dot={false}
                  connectNulls
                  animationDuration={420}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
              <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
              {data.source.datasetName} bo&apos;yicha hisoblangan
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
              Bazaviy davr: {formatDate(data.baseline.from)} — {formatDate(data.baseline.to)}
            </span>
          </div>
        </div>

        <EfficiencyScore
          score={data.ees.score}
          components={data.ees.components}
          coverage={data.ees.coverage}
        />
      </section>

      <section className="mt-4 grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]">
        <div className="rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="ui-label text-faint">Monitoring</p>
              <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">
                So&apos;nggi ogohlantirishlar
              </h2>
            </div>
            <Link
              href="/monitoring"
              className="inline-flex items-center gap-1 text-[13px] font-bold text-primary transition-colors hover:text-primary-hover"
            >
              Barchasi
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-border">
            {recentAlerts.map((alert) => {
              const style = alertStyles[alert.tone];
              const AlertIcon = style.icon;

              return (
                <article className="flex gap-3 py-3 first:pt-0 last:pb-0" key={alert.title}>
                  <span className={`grid size-8 shrink-0 place-items-center rounded-md ${style.iconClass}`}>
                    <AlertIcon className="size-4" strokeWidth={1.9} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs font-bold text-foreground">{alert.title}</p>
                      <span className="shrink-0 text-xs font-medium text-faint">{alert.time}</span>
                    </div>
                    <p className="mt-1 text-[13px] leading-5 text-muted">{alert.detail}</p>
                  </div>
                  <span className={`mt-2 size-1.5 shrink-0 rounded-full ${style.dotClass}`} />
                </article>
              );
            })}
          </div>
        </div>

        <aside className="relative overflow-hidden rounded-lg border border-primary/15 bg-primary-soft p-5 shadow-card">
          <div className="absolute -right-8 -top-8 size-28 rounded-full bg-primary/5" aria-hidden="true" />
          <div className="relative">
            <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            <p className="ui-label mt-4 text-primary">AI tavsiyasi</p>
            <h2 className="mt-1.5 text-base font-bold leading-6 tracking-[-0.02em] text-foreground">
              Hisobot jarayonini avtomatlashtiring
            </h2>
            <p className="mt-2 text-[13px] leading-5 text-muted-strong">
              Haftalik hisobot tayyorlashda 6.8 soat qo&apos;lda bajariladigan takroriy ish aniqlandi.
            </p>

            <div className="mt-4 rounded-lg border border-primary/10 bg-surface/75 p-3">
              <p className="flex items-center gap-1.5 text-xs font-bold text-muted-strong">
                <Lightbulb className="size-3.5 text-primary" aria-hidden="true" />
                Kutilayotgan samara
              </p>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <div>
                  <p className="font-mono text-sm font-bold text-foreground">5.4 soat</p>
                  <p className="mt-0.5 text-[11px] text-muted">haftalik tejash</p>
                </div>
                <div>
                  <p className="font-mono text-sm font-bold text-foreground">+4.2%</p>
                  <p className="mt-0.5 text-[11px] text-muted">unumdorlik</p>
                </div>
              </div>
            </div>

            <Link
              href="/qarorlar"
              className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-primary px-3 text-[13px] font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
            >
              Tavsiyani ko&apos;rish
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </aside>
      </section>

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-xs leading-5 text-muted shadow-card">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <span>
          KPI va grafiklar &laquo;{data.source.datasetName}&raquo; datasetining tozalangan{" "}
          {formatNumber(data.source.rowCount)} ta yozuvidan hisoblangan.
          Ogohlantirishlar va AI tavsiyalari keyingi bosqichda real ma&apos;lumotga ulanadi.
        </span>
      </div>
    </div>
  );
}
