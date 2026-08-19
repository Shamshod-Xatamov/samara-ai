"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  ChartNoAxesCombined,
  CheckCircle2,
  Database,
  Info,
  LoaderCircle,
  RefreshCw,
  ScanSearch,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/layout/page-header";
import {
  DateRangePicker,
  formatCompactDateRange,
  type DateRangeValue,
} from "@/components/ui/date-range-picker";
import {
  aiPeriods,
  anomalies,
  forecastData,
  forecastMetrics,
  type AiPeriodKey,
  type AnomalySeverity,
  type AnomalyTrendPoint,
  type ForecastMetricKey,
  type ForecastPoint,
} from "@/data/ai-analytics";

type AnalysisTab = "forecast" | "anomalies";
type SeverityFilter = "all" | AnomalySeverity;

const DEMO_TODAY = new Date(2026, 7, 19);
const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-4)"];

function addDemoDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

const FORECAST_START_DATE = addDemoDays(DEMO_TODAY, 1);
const FORECAST_END_DATE = addDemoDays(DEMO_TODAY, 30);

const forecastDatePresets = [
  { label: "Keyingi 7 kun", from: FORECAST_START_DATE, to: addDemoDays(DEMO_TODAY, 7) },
  { label: "Keyingi 30 kun", from: FORECAST_START_DATE, to: addDemoDays(DEMO_TODAY, 30) },
];

function getPeriodForRange(range: DateRangeValue): AiPeriodKey {
  const days = Math.round((range.to.getTime() - range.from.getTime()) / 86_400_000) + 1;
  if (days <= 7) return "seven";
  return "thirty";
}

const severityStyles: Record<
  AnomalySeverity,
  {
    label: string;
    icon: LucideIcon;
    badgeClass: string;
    iconClass: string;
    dotClass: string;
  }
> = {
  critical: {
    label: "Kritik",
    icon: ShieldAlert,
    badgeClass: "bg-danger-soft text-danger",
    iconClass: "bg-danger-soft text-danger",
    dotClass: "bg-danger",
  },
  warning: {
    label: "Ogohlantirish",
    icon: AlertTriangle,
    badgeClass: "bg-warning-soft text-warning",
    iconClass: "bg-warning-soft text-warning",
    dotClass: "bg-warning",
  },
  info: {
    label: "Kuzatuv",
    icon: Info,
    badgeClass: "bg-info-soft text-info",
    iconClass: "bg-info-soft text-info",
    dotClass: "bg-info",
  },
};

function formatForecastValue(
  value: number,
  metric: (typeof forecastMetrics)[number],
) {
  const formatted = value.toFixed(metric.decimals);
  return metric.unit === "%" ? `${formatted}%` : `${formatted} ${metric.unit}`;
}

function formatAxisValue(value: number) {
  if (value >= 10000) return `${Math.round(value / 1000)}k`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function ForecastTooltip({
  active,
  payload,
  label,
  metric,
}: {
  active?: boolean;
  payload?: Array<{
    dataKey?: string | number;
    value?: number | string;
    payload?: ForecastPoint;
  }>;
  label?: string | number;
  metric: (typeof forecastMetrics)[number];
}) {
  const visibleItems = payload?.filter((item) => item.value !== null && item.value !== undefined);

  if (!active || !visibleItems?.length) return null;

  return (
    <div className="min-w-44 rounded-lg border border-border bg-surface px-3 py-2.5 shadow-floating">
      <p className="text-xs font-bold text-muted">{label}</p>
      <div className="mt-2 space-y-1.5">
        {visibleItems.map((item) => {
          const isActual = item.dataKey === "actual";
          const value = Number(item.value ?? 0);

          return (
            <div className="flex items-center justify-between gap-4" key={String(item.dataKey)}>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
                <span
                  className={`size-2 rounded-full ${isActual ? "bg-primary" : "bg-accent"}`}
                  aria-hidden="true"
                />
                {isActual ? "Haqiqiy" : "Prognoz"}
              </span>
              <span className="font-mono text-xs font-bold text-foreground">
                {formatForecastValue(value, metric)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AnomalyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    dataKey?: string | number;
    value?: number | string;
    payload?: AnomalyTrendPoint;
  }>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-40 rounded-lg border border-border bg-surface px-3 py-2.5 shadow-floating">
      <p className="text-xs font-bold text-muted">{label}</p>
      <div className="mt-2 space-y-1.5">
        {payload.map((item) => (
          <div className="flex items-center justify-between gap-4" key={String(item.dataKey)}>
            <span className="text-xs font-medium text-muted">
              {item.dataKey === "actual" ? "Haqiqiy" : "Kutilgan"}
            </span>
            <span className="font-mono text-xs font-bold text-foreground">
              {formatAxisValue(Number(item.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FactorTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string }>;
}) {
  const item = payload?.[0];
  if (!active || !item) return null;

  return (
    <div className="rounded-md border border-border bg-surface px-2.5 py-2 shadow-floating">
      <p className="text-[11px] font-semibold text-muted">{item.name}</p>
      <p className="mt-0.5 font-mono text-xs font-bold text-foreground">{item.value}%</p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: "neutral" | "primary" | "success" | "danger";
}) {
  const iconClass = {
    neutral: "bg-surface-muted text-muted-strong",
    primary: "bg-primary-soft text-primary",
    success: "bg-success-soft text-success",
    danger: "bg-danger-soft text-danger",
  }[tone];

  return (
    <article className="rounded-lg border border-border bg-surface p-3.5 shadow-card sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-semibold text-muted">{label}</p>
        <span className={`grid size-8 shrink-0 place-items-center rounded-md ${iconClass}`}>
          <Icon className="size-4" strokeWidth={1.9} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 font-mono text-xl font-bold tracking-[-0.045em] text-foreground sm:text-[1.4rem]">
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-muted">{detail}</p>
    </article>
  );
}

function ForecastPanel() {
  const [period, setPeriod] = useState<AiPeriodKey>("thirty");
  const [customRange, setCustomRange] = useState<DateRangeValue | null>(null);
  const [metricKey, setMetricKey] = useState<ForecastMetricKey>("operatingCost");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState("bugun, 20:42");

  useEffect(() => {
    if (!isRefreshing) return;

    const timer = window.setTimeout(() => {
      setIsRefreshing(false);
      setRefreshCount((current) => current + 1);
      setLastUpdated("hozirgina");
    }, 900);

    return () => window.clearTimeout(timer);
  }, [isRefreshing]);

  const metric = useMemo(
    () => forecastMetrics.find((item) => item.key === metricKey) ?? forecastMetrics[0],
    [metricKey],
  );
  const effectivePeriod = customRange ? getPeriodForRange(customRange) : period;
  const periodData = forecastData[effectivePeriod];
  const series = periodData.series[metricKey];
  const currentValue = [...series].reverse().find((point) => point.actual !== null)?.actual ?? 0;
  const predictedValue = [...series].reverse().find((point) => point.predicted !== null)?.predicted ?? 0;
  const rawChange = ((predictedValue - currentValue) / currentValue) * 100;
  const isPositive = metric.positiveWhen === "up" ? rawChange >= 0 : rawChange <= 0;
  const confidence = Math.min(99.4, periodData.confidence + refreshCount * 0.1);
  const selectedPeriodLabel = customRange
    ? formatCompactDateRange(customRange)
    : (aiPeriods.find((item) => item.key === period)?.label ?? "30 kun");
  const ChangeIcon = rawChange >= 0 ? TrendingUp : TrendingDown;

  return (
    <div role="tabpanel" aria-label="Prognozlash">
      <section className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3" aria-label="Prognoz ko'rsatkichlari">
        <SummaryCard
          label="Joriy natija"
          value={formatForecastValue(currentValue, metric)}
          detail="oxirgi haqiqiy qiymat"
          icon={Activity}
        />
        <SummaryCard
          label={`${selectedPeriodLabel} prognozi`}
          value={formatForecastValue(predictedValue, metric)}
          detail="davr yakunidagi qiymat"
          icon={ChartNoAxesCombined}
          tone="primary"
        />
        <SummaryCard
          label="Kutilayotgan o'zgarish"
          value={`${rawChange > 0 ? "+" : ""}${rawChange.toFixed(1)}%`}
          detail={isPositive ? "ijobiy yo'nalish" : "e'tibor talab qiladi"}
          icon={ChangeIcon}
          tone={isPositive ? "success" : "danger"}
        />
        <SummaryCard
          label="Model ishonchi"
          value={`${confidence.toFixed(1)}%`}
          detail="validatsiya natijasi"
          icon={Target}
          tone="success"
        />
      </section>

      <section className="mt-4 grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="ui-label text-faint">Haqiqiy va prognoz</p>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <h2 className="text-base font-bold tracking-[-0.02em] text-foreground">
                  {metric.label}
                </h2>
                <span className="font-mono text-sm font-bold text-primary">
                  {formatForecastValue(predictedValue, metric)}
                </span>
              </div>
              <p className="mt-1 text-[13px] text-muted">
                {selectedPeriodLabel} uchun AI prognozi
              </p>
            </div>

            <div className="flex shrink-0 flex-nowrap items-center gap-2">
              <div
                className="grid shrink-0 grid-cols-3 gap-1 rounded-md bg-surface-muted p-1"
                role="tablist"
                aria-label="Prognoz ko'rsatkichi"
              >
                {forecastMetrics.map((item) => {
                  const isActive = item.key === metricKey;

                  return (
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      key={item.key}
                      onClick={() => setMetricKey(item.key)}
                      className={`h-8 rounded px-2.5 text-xs font-bold transition-colors ${
                        isActive
                          ? "bg-surface text-foreground shadow-sm ring-1 ring-border/80"
                          : "text-muted hover:text-foreground"
                      }`}
                    >
                      {item.shortLabel}
                    </button>
                  );
                })}
              </div>

              <div
                className="flex shrink-0 gap-1 rounded-md border border-border bg-surface p-1"
                role="group"
                aria-label="Prognoz davri"
              >
                {aiPeriods.map((item) => {
                  const isActive = !customRange && item.key === period;

                  return (
                    <button
                      type="button"
                      aria-pressed={isActive}
                      key={item.key}
                      onClick={() => {
                        setPeriod(item.key);
                        setCustomRange(null);
                      }}
                      className={`h-8 rounded px-2.5 text-xs font-bold transition-colors ${
                        isActive
                          ? "bg-primary text-white shadow-sm"
                          : "text-muted hover:bg-surface-muted hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
                <DateRangePicker
                  value={customRange}
                  onChange={setCustomRange}
                  minDate={FORECAST_START_DATE}
                  maxDate={FORECAST_END_DATE}
                  presets={forecastDatePresets}
                  triggerLabel="Boshqa"
                  dialogLabel="Prognoz oralig'i"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 h-[19rem] w-full" aria-label={`${metric.label} prognoz grafigi`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
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
                  minTickGap={18}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--faint)", fontSize: 11, fontWeight: 600 }}
                  tickFormatter={formatAxisValue}
                  domain={["auto", "auto"]}
                  width={50}
                />
                <Tooltip
                  cursor={{ stroke: "var(--border-strong)", strokeDasharray: "3 4" }}
                  content={<ForecastTooltip metric={metric} />}
                />
                <ReferenceLine
                  x={periodData.boundaryLabel}
                  stroke="var(--border-strong)"
                  strokeDasharray="4 5"
                  label={{
                    value: "Bugun",
                    position: "insideTopLeft",
                    fill: "var(--muted)",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Haqiqiy"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: "var(--surface)", strokeWidth: 3 }}
                  connectNulls
                  animationDuration={420}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="Prognoz"
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                  strokeDasharray="7 5"
                  dot={false}
                  activeDot={{ r: 4, fill: "var(--surface)", strokeWidth: 3 }}
                  connectNulls
                  animationDuration={420}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
                <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
                Haqiqiy qiymat
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
                <span className="w-3 border-t-2 border-dashed border-accent" aria-hidden="true" />
                AI prognozi
              </span>
            </div>
            <span className="text-xs font-medium text-faint" aria-live="polite">
              Yangilandi: {lastUpdated}
            </span>
          </div>
        </div>

        <aside className="flex flex-col rounded-lg border border-primary/15 bg-primary-soft p-5 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-primary text-white shadow-sm">
              <Sparkles className="size-[18px]" aria-hidden="true" />
            </span>
            <span className="rounded-full bg-surface/80 px-2.5 py-1 text-[11px] font-bold text-primary ring-1 ring-inset ring-primary/10">
              AI izohi
            </span>
          </div>

          <h2 className="mt-4 text-base font-bold leading-6 tracking-[-0.02em] text-foreground">
            {metric.insightTitle}
          </h2>
          <p className="mt-2 text-[13px] leading-5 text-muted-strong">{metric.insight}</p>

          <div className="mt-5 rounded-lg border border-primary/10 bg-surface/75 p-3.5">
            <p className="ui-label text-faint">Asosiy omillar</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="relative size-28 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metric.factors}
                      dataKey="value"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={33}
                      outerRadius={50}
                      paddingAngle={3}
                      stroke="none"
                      animationDuration={420}
                    >
                      {metric.factors.map((factor, index) => (
                        <Cell
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          key={factor.label}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<FactorTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
                  <span className="font-mono text-sm font-bold text-foreground">100%</span>
                  <span className="text-[11px] font-semibold text-faint">ulush</span>
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-2.5">
                {metric.factors.map((factor, index) => (
                  <div className="flex items-center justify-between gap-2" key={factor.label}>
                    <span className="inline-flex min-w-0 items-center gap-2 text-[11px] font-semibold text-muted">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        aria-hidden="true"
                      />
                      <span className="truncate">{factor.label}</span>
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground">
                      {factor.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto pt-4">
            <button
              type="button"
              onClick={() => setIsRefreshing(true)}
              disabled={isRefreshing}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-3 text-[13px] font-bold text-white shadow-sm transition-[background-color,transform] hover:bg-primary-hover active:translate-y-px disabled:cursor-not-allowed disabled:opacity-75"
            >
              {isRefreshing ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="size-4" aria-hidden="true" />
              )}
              {isRefreshing ? "Model hisoblamoqda..." : "Prognozni yangilash"}
            </button>
            <Link
              href="/iqtisodiy-samaradorlik"
              className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-primary/15 bg-surface/75 px-3 text-[13px] font-bold text-foreground transition-colors hover:bg-surface"
            >
              Iqtisodiy ta&apos;sir
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}

function AnomaliesPanel() {
  const [filter, setFilter] = useState<SeverityFilter>("all");
  const [selectedId, setSelectedId] = useState(anomalies[0].id);

  const filteredAnomalies = useMemo(
    () =>
      filter === "all"
        ? anomalies
        : anomalies.filter((anomaly) => anomaly.severity === filter),
    [filter],
  );
  const selectedAnomaly =
    filteredAnomalies.find((anomaly) => anomaly.id === selectedId) ??
    filteredAnomalies[0] ??
    anomalies[0];
  const selectedStyle = severityStyles[selectedAnomaly.severity];
  const SelectedIcon = selectedStyle.icon;
  const chartColor = {
    critical: "var(--danger)",
    warning: "var(--warning)",
    info: "var(--info)",
  }[selectedAnomaly.severity];

  const filters: Array<{ key: SeverityFilter; label: string }> = [
    { key: "all", label: "Barchasi" },
    { key: "critical", label: "Kritik" },
    { key: "warning", label: "Ogohlantirish" },
    { key: "info", label: "Kuzatuv" },
  ];

  return (
    <div role="tabpanel" aria-label="Anomaliyalar">
      <section className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3" aria-label="Anomaliya ko'rsatkichlari">
        <SummaryCard
          label="Aniqlangan holatlar"
          value="6"
          detail="so'nggi 30 kun ichida"
          icon={ScanSearch}
          tone="primary"
        />
        <SummaryCard
          label="Kritik holat"
          value="1"
          detail="tezkor tekshiruv kerak"
          icon={ShieldAlert}
          tone="danger"
        />
        <SummaryCard
          label="Ko'rib chiqilgan"
          value="3"
          detail="50% holat yopilgan"
          icon={CheckCircle2}
          tone="success"
        />
        <SummaryCard
          label="Taxminiy ta'sir"
          value="8.4 mln"
          detail="so'm / oy"
          icon={WalletCards}
          tone="danger"
        />
      </section>

      <section className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
          <div className="border-b border-border p-4">
            <p className="ui-label text-faint">Aniqlangan hodisalar</p>
            <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">
              Anomaliyalar ro&apos;yxati
            </h2>
            <div className="mt-3 flex max-w-full gap-1 overflow-x-auto rounded-md bg-surface-muted p-1">
              {filters.map((item) => {
                const isActive = filter === item.key;

                return (
                  <button
                    type="button"
                    key={item.key}
                    aria-pressed={isActive}
                    onClick={() => {
                      setFilter(item.key);
                      const next =
                        item.key === "all"
                          ? anomalies[0]
                          : anomalies.find((anomaly) => anomaly.severity === item.key);
                      if (next) setSelectedId(next.id);
                    }}
                    className={`h-8 shrink-0 rounded px-2 text-[11px] font-bold transition-colors ${
                      isActive
                        ? "bg-surface text-foreground shadow-sm ring-1 ring-border/80"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="divide-y divide-border p-1.5">
            {filteredAnomalies.map((anomaly) => {
              const style = severityStyles[anomaly.severity];
              const Icon = style.icon;
              const isSelected = anomaly.id === selectedAnomaly.id;

              return (
                <button
                  type="button"
                  onClick={() => setSelectedId(anomaly.id)}
                  className={`flex w-full gap-3 rounded-lg px-2.5 py-3 text-left transition-colors ${
                    isSelected ? "bg-primary-soft" : "hover:bg-surface-muted"
                  }`}
                  aria-pressed={isSelected}
                  key={anomaly.id}
                >
                  <span className={`grid size-8 shrink-0 place-items-center rounded-md ${style.iconClass}`}>
                    <Icon className="size-4" strokeWidth={1.9} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-bold leading-5 text-foreground">
                      {anomaly.metric}
                    </span>
                    <span className="mt-0.5 block truncate text-xs font-medium text-muted">
                      {anomaly.time}
                    </span>
                  </span>
                  <span
                    className={`mt-0.5 shrink-0 rounded-full px-2 py-1 font-mono text-[11px] font-bold ${style.badgeClass}`}
                  >
                    {anomaly.change}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          <div className="rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="ui-label text-faint">Og&apos;ish dinamikasi</p>
                <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">
                  {selectedAnomaly.metric}
                </h2>
                <p className="mt-1 text-[13px] text-muted">Kutilgan diapazon va haqiqiy natija</p>
              </div>
              <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${selectedStyle.badgeClass}`}>
                <span className={`size-1.5 rounded-full ${selectedStyle.dotClass}`} aria-hidden="true" />
                {selectedStyle.label}
              </span>
            </div>

            <div className="mt-4 h-[15.5rem] w-full" aria-label={`${selectedAnomaly.metric} anomaliya grafigi`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={selectedAnomaly.trend}
                  margin={{ top: 12, right: 12, left: -10, bottom: 0 }}
                  barGap={3}
                >
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
                    minTickGap={16}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--faint)", fontSize: 11, fontWeight: 600 }}
                    tickFormatter={formatAxisValue}
                    domain={["auto", "auto"]}
                    width={52}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--surface-muted)" }}
                    content={<AnomalyTooltip />}
                  />
                  <Bar
                    dataKey="expected"
                    name="Kutilgan"
                    fill="var(--surface-muted)"
                    stroke="var(--faint)"
                    strokeWidth={1}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                    animationDuration={380}
                  />
                  <Bar
                    dataKey="actual"
                    name="Haqiqiy"
                    fill={chartColor}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                    animationDuration={420}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: chartColor }}
                  aria-hidden="true"
                />
                Haqiqiy qiymat
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
                <span className="size-2 rounded-sm border border-faint bg-surface-muted" aria-hidden="true" />
                Kutilgan qiymat
              </span>
            </div>
          </div>

          <article className="rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5">
            <div className="flex items-start gap-3">
              <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${selectedStyle.iconClass}`}>
                <SelectedIcon className="size-[18px]" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="ui-label text-faint">Tanlangan hodisa</p>
                    <h2 className="mt-1 text-base font-bold leading-6 tracking-[-0.02em] text-foreground">
                      {selectedAnomaly.title}
                    </h2>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-faint">{selectedAnomaly.time}</span>
                </div>
                <p className="mt-2 text-[13px] leading-5 text-muted">{selectedAnomaly.description}</p>
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-1 overflow-hidden rounded-lg border border-border bg-surface-muted sm:grid-cols-3">
              {[
                { label: "Haqiqiy", value: selectedAnomaly.current },
                { label: "Kutilgan", value: selectedAnomaly.expected },
                { label: "Taxminiy ta'sir", value: selectedAnomaly.impact },
              ].map((item, index) => (
                <div
                  className={`px-3.5 py-3 ${index > 0 ? "border-t border-border sm:border-l sm:border-t-0" : ""}`}
                  key={item.label}
                >
                  <dt className="text-[11px] font-bold uppercase tracking-[0.07em] text-faint">
                    {item.label}
                  </dt>
                  <dd className="mt-1.5 font-mono text-xs font-bold text-foreground">{item.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_17rem]">
              <div className="rounded-lg border border-primary/10 bg-primary-soft p-3.5">
                <p className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <BrainCircuit className="size-3.5" aria-hidden="true" />
                  AI tavsiyasi
                </p>
                <p className="mt-2 text-[13px] leading-5 text-muted-strong">
                  {selectedAnomaly.recommendation}
                </p>
                <Link
                  href="/qarorlar"
                  className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-primary-hover"
                >
                  Qarorni ko&apos;rib chiqish
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>

              <div className="rounded-lg border border-border p-3.5">
                <p className="ui-label text-faint">Ehtimoliy sabablar</p>
                <div className="mt-3 space-y-3">
                  {selectedAnomaly.causes.map((cause) => (
                    <div key={cause.label}>
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-muted">{cause.label}</span>
                        <span className="font-mono text-xs font-bold text-foreground">{cause.value}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${cause.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

export function AiAnalyticsView() {
  const [activeTab, setActiveTab] = useState<AnalysisTab>("forecast");

  return (
    <div className="mx-auto w-full max-w-6xl pb-2">
      <PageHeader
        eyebrow="Sun'iy intellekt"
        title="AI tahlili"
        description="Ko'rsatkichlarni prognozlang, noodatiy o'zgarishlarni aniqlang va sabablarini tushuning."
        action={
          <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-[13px] font-bold text-muted-strong shadow-sm">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-30" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            Model faol
            <span className="font-mono text-xs text-success">94.7%</span>
          </div>
        }
      />

      <div className="mt-5 flex flex-col gap-3 rounded-lg border border-border bg-surface p-1.5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-1" role="tablist" aria-label="AI tahlil turi">
          {[
            { key: "forecast" as const, label: "Prognozlash", icon: ChartNoAxesCombined },
            { key: "anomalies" as const, label: "Anomaliyalar", icon: ScanSearch },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;

            return (
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-[13px] font-bold transition-colors ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:bg-surface-muted hover:text-foreground"
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 px-2 pb-1 sm:pb-0">
          <span className="grid size-7 place-items-center rounded-md bg-surface-muted text-muted">
            <Database className="size-3.5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-[11px] font-bold uppercase tracking-[0.07em] text-faint">
              Dataset
            </span>
            <span className="block truncate text-xs font-bold text-foreground">
              ishlab-chiqarish-avgust.csv
            </span>
          </span>
        </div>
      </div>

      {activeTab === "forecast" ? <ForecastPanel /> : <AnomaliesPanel />}

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-xs leading-5 text-muted shadow-card">
        <BrainCircuit className="size-4 shrink-0 text-primary" aria-hidden="true" />
        Natijalar demo model asosida hisoblangan. Production rejimida model versiyasi, aniqlik tarixi va audit yozuvlari saqlanadi.
      </div>
    </div>
  );
}
