"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BellRing,
  BrainCircuit,
  ChartNoAxesCombined,
  CheckCircle2,
  Clock3,
  Gauge,
  Info,
  Lightbulb,
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
import {
  chartData,
  chartMetrics,
  dashboardMetrics,
  efficiencyBreakdown,
  periodLabels,
  periodOptions,
  recentAlerts,
  type ChartMetricKey,
  type DashboardPoint,
  type PeriodKey,
} from "@/data/dashboard";

const metricIcons = {
  gauge: Gauge,
  clock: Clock3,
  brain: BrainCircuit,
  workflow: Workflow,
  wallet: WalletCards,
  "piggy-bank": PiggyBank,
  timer: TimerReset,
  chart: ChartNoAxesCombined,
};

const alertStyles = {
  warning: {
    icon: AlertTriangle,
    iconClass: "bg-warning-soft text-warning",
    dotClass: "bg-warning",
  },
  danger: {
    icon: BellRing,
    iconClass: "bg-danger-soft text-danger",
    dotClass: "bg-danger",
  },
  info: {
    icon: Info,
    iconClass: "bg-info-soft text-info",
    dotClass: "bg-info",
  },
};

function formatMetricValue(value: number) {
  return value.toFixed(2).replace(/\.?0+$/, "");
}

type DashboardTooltipProps = {
  active?: boolean;
  payload?: Array<{
    value?: number | string;
    payload?: DashboardPoint;
  }>;
  label?: string | number;
  metric: (typeof chartMetrics)[number];
};

function DashboardTooltip({
  active,
  payload,
  label,
  metric,
}: DashboardTooltipProps) {
  if (!active || !payload?.length) return null;

  const rawValue = payload[0]?.value;
  const value = typeof rawValue === "number" ? rawValue : Number(rawValue ?? 0);

  return (
    <div className="min-w-36 rounded-lg border border-border bg-surface px-3 py-2.5 shadow-floating">
      <p className="text-[13px] font-semibold text-muted">{label}</p>
      <p className="mt-1 font-mono text-sm font-bold text-foreground">
        {formatMetricValue(value)}
        {metric.unit}
      </p>
    </div>
  );
}

function MetricCard({ metric }: { metric: (typeof dashboardMetrics)[number] }) {
  const Icon = metricIcons[metric.icon];
  const TrendIcon = metric.direction === "up" ? ArrowUpRight : ArrowDownRight;

  return (
    <article className="group min-w-0 rounded-lg border border-border bg-surface p-3.5 shadow-card transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="min-h-8 text-[13px] font-semibold leading-4 text-muted">
          {metric.label}
        </p>
        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-surface-muted text-muted-strong ring-1 ring-inset ring-border/80 transition-colors group-hover:bg-primary-soft group-hover:text-primary">
          <Icon className="size-4" strokeWidth={1.8} aria-hidden="true" />
        </span>
      </div>

      <div className="mt-2.5 flex min-w-0 items-end gap-1.5">
        <p className="truncate font-mono text-xl font-bold leading-none tracking-[-0.045em] text-foreground sm:text-[1.4rem]">
          {metric.value}
        </p>
        {"suffix" in metric && (
          <p className="mb-0.5 truncate text-xs font-semibold text-muted">
            {metric.suffix}
          </p>
        )}
      </div>

      <div className="mt-3 flex min-w-0 items-center gap-1.5 border-t border-border pt-2.5">
        <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-success-soft px-1.5 py-0.5 font-mono text-[11px] font-bold text-success sm:text-xs">
          <TrendIcon className="size-3" aria-hidden="true" />
          {metric.change}
        </span>
        <span className="truncate text-[11px] text-faint sm:text-xs">
          {metric.comparison}
        </span>
      </div>
    </article>
  );
}

function EfficiencyScore() {
  const score = 86.4;
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;

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
          Demo indeks
        </span>
      </div>

      <div className="mt-5 flex items-center justify-center">
        <div className="relative size-36">
          <svg
            className="size-full -rotate-90"
            viewBox="0 0 120 120"
            role="img"
            aria-label={`Samaradorlik indeksi ${score} ball`}
          >
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="var(--surface-muted)"
              strokeWidth="9"
            />
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
            />
          </svg>
          <div className="absolute inset-0 grid place-content-center text-center">
            <p className="font-mono text-3xl font-bold tracking-[-0.06em] text-foreground">
              {score}
            </p>
            <p className="mt-0.5 text-xs font-bold uppercase tracking-[0.1em] text-faint">
              100 dan
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3.5">
        {efficiencyBreakdown.map((item) => (
          <div key={item.label}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-[13px] font-medium text-muted">{item.label}</span>
              <span className="font-mono text-[13px] font-bold text-foreground">
                {item.value}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
              <div
                className={`h-full rounded-full ${item.color}`}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DashboardView() {
  const [period, setPeriod] = useState<PeriodKey>("week");
  const [activeMetricKey, setActiveMetricKey] =
    useState<ChartMetricKey>("efficiency");

  const activeMetric = useMemo(
    () => chartMetrics.find((metric) => metric.key === activeMetricKey)!,
    [activeMetricKey],
  );
  const currentData = chartData[period];
  const currentValue = currentData.at(-1)?.[activeMetric.key] ?? 0;

  return (
    <div className="mx-auto w-full max-w-6xl pb-2">
      <PageHeader
        eyebrow="Bugungi holat"
        title="Umumiy ko'rinish"
        description="Asosiy iqtisodiy va texnologik ko'rsatkichlarni bir joyda kuzating."
        action={
          <div className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-[13px] font-bold text-muted-strong shadow-sm">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-30" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            Monitoring faol
          </div>
        }
      />

      <div className="mt-5 flex items-center justify-between gap-3 overflow-x-auto rounded-lg border border-border bg-surface p-1.5 shadow-card">
        <div
          className="flex min-w-max items-center gap-1"
          role="group"
          aria-label="Ko'rsatkichlar davri"
        >
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
          Oxirgi yangilanish: bugun, 20:42
        </p>
      </div>

      <section
        className="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3"
        aria-label="Asosiy ko'rsatkichlar"
      >
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
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
                  {formatMetricValue(currentValue)}
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
                    <span className="hidden 2xl:inline">{metric.label}</span>
                    <span className="2xl:hidden">{metric.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="mt-5 h-[17.5rem] w-full"
            role="tabpanel"
            aria-label={`${activeMetric.label} grafigi`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={currentData}
                margin={{ top: 8, right: 4, left: -18, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="dashboard-area-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={activeMetric.color} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={activeMetric.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="var(--chart-grid)"
                  strokeDasharray="3 5"
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted)", fontSize: 11, fontWeight: 600 }}
                  dy={10}
                  minTickGap={14}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--faint)", fontSize: 11, fontWeight: 600 }}
                  domain={[activeMetric.minimum, activeMetric.maximum]}
                  tickFormatter={(value: number) =>
                    Number.isInteger(value) ? String(value) : value.toFixed(1)
                  }
                  width={48}
                />
                <Tooltip
                  cursor={{ stroke: activeMetric.color, strokeDasharray: "3 4" }}
                  content={<DashboardTooltip metric={activeMetric} />}
                />
                <Area
                  key={`${period}-${activeMetric.key}`}
                  type="monotone"
                  dataKey={activeMetric.key}
                  stroke={activeMetric.color}
                  strokeWidth={2.5}
                  fill="url(#dashboard-area-gradient)"
                  activeDot={{ r: 4, strokeWidth: 3, fill: "var(--surface)" }}
                  dot={false}
                  animationDuration={420}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
              <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
              Amaldagi natija
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
              <span className="h-px w-3 border-t border-dashed border-faint" aria-hidden="true" />
              Davr bo&apos;yicha o&apos;zgarish
            </span>
          </div>
        </div>

        <EfficiencyScore />
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
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-md ${style.iconClass}`}
                  >
                    <AlertIcon className="size-4" strokeWidth={1.9} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs font-bold text-foreground">{alert.title}</p>
                      <span className="shrink-0 text-xs font-medium text-faint">
                        {alert.time}
                      </span>
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

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-xs leading-5 text-muted shadow-card">
        <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />
        Barcha ko&apos;rsatkichlar demo ma&apos;lumotlari asosida shakllantirilgan. Real manba ulangach ular avtomatik yangilanadi.
      </div>
    </div>
  );
}
