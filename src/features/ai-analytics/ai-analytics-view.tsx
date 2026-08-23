"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  Database,
  Info,
  LoaderCircle,
  RefreshCw,
  ScanSearch,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/layout/page-header";
import { formatDate, formatNumber } from "@/lib/format";
import {
  explainAnomaly,
  getAnomalies,
  getForecast,
  type AnomaliesResponse,
  type AnomalyItem,
  type ForecastResponse,
} from "@/services/ai";

type Tab = "forecast" | "anomalies";

const HORIZONS = [7, 14, 30];

const severityStyles: Record<
  AnomalyItem["severity"],
  { label: string; badge: string; dot: string }
> = {
  CRITICAL: {
    label: "Kritik",
    badge: "bg-danger-soft text-danger",
    dot: "bg-danger",
  },
  WARNING: {
    label: "Ogohlantirish",
    badge: "bg-warning-soft text-warning",
    dot: "bg-warning",
  },
  INFO: { label: "Kuzatuv", badge: "bg-info-soft text-info", dot: "bg-info" },
};

function EmptyState({ message }: { message: string }) {
  return (
    <div className="mt-6 grid min-h-56 place-content-center rounded-lg border border-dashed border-border-strong bg-surface p-8 text-center shadow-card">
      <Database className="mx-auto size-7 text-faint" aria-hidden="true" />
      <h2 className="mt-4 text-sm font-bold text-foreground">Tahlil uchun ma&apos;lumot yo&apos;q</h2>
      <p className="mt-1.5 max-w-md text-[13px] leading-5 text-muted">{message}</p>
      <Link
        href="/malumotlar"
        className="mx-auto mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-primary-hover"
      >
        Ma&apos;lumot manbalariga o&apos;tish
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}

function ForecastPanel() {
  const [metricKey, setMetricKey] = useState("xarajat");
  const [horizon, setHorizon] = useState(7);
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    void getForecast(metricKey, horizon).then((response) => {
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
  }, [metricKey, horizon]);

  if (isLoading && !data) {
    return (
      <div className="grid min-h-64 place-content-center text-center">
        <LoaderCircle className="mx-auto size-6 animate-spin text-primary" aria-hidden="true" />
        <p className="mt-3 text-xs font-medium text-muted">Prognoz hisoblanmoqda...</p>
      </div>
    );
  }

  if (!data) return <EmptyState message={error} />;

  const { forecast, metric, insight } = data;
  const TrendIcon = forecast.direction === "up" ? TrendingUp : TrendingDown;
  const isPositive =
    forecast.direction === "flat"
      ? true
      : metric.positiveWhen === "up"
        ? forecast.direction === "up"
        : forecast.direction === "down";

  return (
    <>
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-3 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex max-w-full gap-1 overflow-x-auto rounded-md bg-surface-muted p-1" role="tablist">
          {data.availableMetrics.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={item.key === metricKey}
              onClick={() => setMetricKey(item.key)}
              className={`h-8 shrink-0 rounded px-3 text-xs font-bold transition-colors ${
                item.key === metricKey
                  ? "bg-surface text-foreground shadow-sm ring-1 ring-border/80"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {item.shortLabel}
            </button>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-1 rounded-md bg-surface-muted p-1">
          {HORIZONS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setHorizon(value)}
              aria-pressed={horizon === value}
              className={`h-8 rounded px-3 text-xs font-bold transition-colors ${
                horizon === value
                  ? "bg-surface text-foreground shadow-sm ring-1 ring-border/80"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {value} kun
            </button>
          ))}
        </div>
      </div>

      <section className="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3">
        {[
          {
            label: "Kutilayotgan o'zgarish",
            value:
              forecast.changePct === null
                ? "—"
                : `${forecast.changePct > 0 ? "+" : ""}${formatNumber(forecast.changePct, 1)}%`,
            detail: `${horizon} kun ichida`,
            tone: isPositive ? "success" : "danger",
          },
          {
            label: "Model ishonchi",
            value: forecast.confidence === null ? "—" : `${formatNumber(forecast.confidence, 1)}%`,
            detail: `MAPE ${formatNumber(forecast.mape, 1)}%`,
            tone: "primary",
          },
          {
            label: "Model",
            value: forecast.model === "holt-winters" ? "Holt-Winters" : "Holt",
            detail:
              forecast.seasonLength !== null
                ? `mavsum ${forecast.seasonLength} kun`
                : "mavsumiylik yo'q",
            tone: "primary",
          },
          {
            label: "Parametrlar",
            value: `α ${forecast.alpha}`,
            detail: `β ${forecast.beta}${forecast.gamma !== null ? ` · γ ${forecast.gamma}` : ""}`,
            tone: "primary",
          },
        ].map((card) => (
          <article className="rounded-lg border border-border bg-surface p-3.5 shadow-card sm:p-4" key={card.label}>
            <p className="text-xs font-bold uppercase tracking-[0.07em] text-faint">{card.label}</p>
            <p
              className={`mt-2.5 truncate font-mono text-xl font-bold tracking-[-0.045em] sm:text-[1.4rem] ${
                card.tone === "success"
                  ? "text-success"
                  : card.tone === "danger"
                    ? "text-danger"
                    : "text-foreground"
              }`}
            >
              {card.value}
            </p>
            <p className="mt-1 text-xs font-medium text-muted">{card.detail}</p>
          </article>
        ))}
      </section>

      <section className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="ui-label text-faint">Prognoz</p>
              <h2 className="mt-1 flex items-center gap-2 text-base font-bold tracking-[-0.02em] text-foreground">
                {metric.label}
                <TrendIcon
                  className={`size-4 ${isPositive ? "text-success" : "text-danger"}`}
                  aria-hidden="true"
                />
              </h2>
            </div>
            <p className="text-[13px] text-muted">{metric.unit}</p>
          </div>

          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecast.points} margin={{ top: 6, right: 6, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="forecast-band" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.16} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                  minTickGap={18}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                  formatter={(value, name) =>
                    typeof value === "number"
                      ? [formatNumber(value, metric.decimals), String(name)]
                      : [String(value), String(name)]
                  }
                />
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="none"
                  fill="url(#forecast-band)"
                  connectNulls
                  name="Yuqori chegara"
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="none"
                  fill="var(--surface)"
                  connectNulls
                  name="Quyi chegara"
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  name="Kuzatilgan"
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                  connectNulls
                  name="Prognoz"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-3 text-xs font-semibold text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded bg-chart-1" aria-hidden="true" />
              Kuzatilgan
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded border-t-2 border-dashed border-primary" aria-hidden="true" />
              Prognoz
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-primary/15" aria-hidden="true" />
              95% ishonch oralig&apos;i
            </span>
          </div>
        </div>

        <aside className="rounded-lg border border-primary/15 bg-primary-soft p-5 shadow-card">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>

          {insight ? (
            <>
              <p className="ui-label mt-4 text-primary">AI izohi</p>
              <h2 className="mt-1.5 text-base font-bold leading-6 tracking-[-0.02em] text-foreground">
                {insight.insightTitle}
              </h2>
              <p className="mt-2 text-[13px] leading-5 text-muted-strong">{insight.insight}</p>

              <div className="mt-4 space-y-2.5 border-t border-primary/10 pt-3">
                <p className="text-xs font-bold text-muted-strong">Asosiy omillar</p>
                {insight.factors.map((factor) => (
                  <div key={factor.label}>
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-muted-strong">{factor.label}</span>
                      <span className="font-mono font-bold text-foreground">{factor.value}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface/70">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${factor.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-[11px] text-muted">
                {insight.model}
                {insight.cached ? " · keshdan" : ""}
              </p>
            </>
          ) : (
            <>
              <p className="ui-label mt-4 text-primary">AI izohi</p>
              <p className="mt-2 text-[13px] leading-5 text-muted-strong">
                {data.insightError ?? "AI izohi hozircha mavjud emas."}
              </p>
              <p className="mt-3 text-[11px] leading-4 text-muted">
                Prognoz raqamlari statistik model bilan hisoblangan va AI&apos;dan
                mustaqil — izoh bo&apos;lmasa ham natija to&apos;g&apos;ri.
              </p>
            </>
          )}
        </aside>
      </section>

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-xs leading-5 text-muted shadow-card">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <span>
          Prognoz {forecast.model === "holt-winters" ? "Holt-Winters (mavsumiy eksponensial silliqlash)" : "Holt chiziqli trend"}{" "}
          modeli bilan hisoblangan. Ishonch darajasi oxirgi 20% ma&apos;lumotda
          backtest orqali baholangan (MAPE {formatNumber(forecast.mape, 1)}%).
          Manba: {data.source.datasetName}.
        </span>
      </div>
    </>
  );
}

function AnomalyPanel() {
  const [data, setData] = useState<AnomaliesResponse | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [explainingId, setExplainingId] = useState<string | null>(null);
  const [explainError, setExplainError] = useState("");
  const [filter, setFilter] = useState<"all" | AnomalyItem["severity"]>("all");

  const load = useCallback(async (refresh: boolean) => {
    const response = await getAnomalies(refresh);

    setIsLoading(false);
    setIsRefreshing(false);

    if (!response.ok) {
      setError(response.message);
      setData(null);
      return;
    }

    setError("");
    setData(response.data);
    setSelectedId((current) => current ?? response.data.anomalies[0]?.id ?? null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void getAnomalies(false).then((response) => {
      if (cancelled) return;

      setIsLoading(false);

      if (!response.ok) {
        setError(response.message);
        setData(null);
        return;
      }

      setError("");
      setData(response.data);
      setSelectedId(response.data.anomalies[0]?.id ?? null);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleExplain(id: string) {
    setExplainingId(id);
    setExplainError("");

    const response = await explainAnomaly(id);
    setExplainingId(null);

    if (!response.ok) {
      setExplainError(response.message);
      return;
    }

    setData((current) =>
      current
        ? {
            ...current,
            anomalies: current.anomalies.map((item) =>
              item.id === id ? { ...item, aiExplanation: response.data.explanation } : item,
            ),
          }
        : current,
    );
  }

  if (isLoading && !data) {
    return (
      <div className="grid min-h-64 place-content-center text-center">
        <LoaderCircle className="mx-auto size-6 animate-spin text-primary" aria-hidden="true" />
        <p className="mt-3 text-xs font-medium text-muted">Anomaliyalar qidirilmoqda...</p>
      </div>
    );
  }

  if (!data) return <EmptyState message={error} />;

  const filtered =
    filter === "all"
      ? data.anomalies
      : data.anomalies.filter((item) => item.severity === filter);

  const selected = data.anomalies.find((item) => item.id === selectedId) ?? filtered[0] ?? null;

  const counts = data.anomalies.reduce<Record<string, number>>((totals, item) => {
    totals[item.severity] = (totals[item.severity] ?? 0) + 1;
    return totals;
  }, {});

  return (
    <>
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-3 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-md bg-surface-muted p-1">
          {(["all", "CRITICAL", "WARNING", "INFO"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
              className={`h-8 shrink-0 rounded px-3 text-xs font-bold transition-colors ${
                filter === key
                  ? "bg-surface text-foreground shadow-sm ring-1 ring-border/80"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {key === "all" ? `Barchasi ${data.anomalies.length}` : `${severityStyles[key].label} ${counts[key] ?? 0}`}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setIsRefreshing(true);
            void load(true);
          }}
          disabled={isRefreshing}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-surface px-3 text-xs font-bold text-foreground shadow-sm transition-colors hover:border-border-strong hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />
          Qayta tekshirish
        </button>
      </div>

      <section className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-[21rem_minmax(0,1fr)]">
        <div className="max-h-[32rem] overflow-y-auto rounded-lg border border-border bg-surface p-2 shadow-card">
          {filtered.length === 0 ? (
            <div className="grid min-h-40 place-content-center text-center">
              <ScanSearch className="mx-auto size-6 text-faint" aria-hidden="true" />
              <p className="mt-3 text-xs font-bold text-foreground">Anomaliya topilmadi</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((item) => {
                const style = severityStyles[item.severity];
                const isSelected = item.id === selected?.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    aria-pressed={isSelected}
                    className={`flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left transition-colors ${
                      isSelected
                        ? "border-primary/30 bg-primary-soft/65"
                        : "border-transparent hover:bg-canvas"
                    }`}
                  >
                    <span className={`mt-1.5 size-2 shrink-0 rounded-full ${style.dot}`} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-bold text-foreground">
                          {item.metricLabel}
                        </span>
                        <span className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${style.badge}`}>
                          {item.deviationPct > 0 ? "+" : ""}
                          {formatNumber(item.deviationPct, 1)}%
                        </span>
                      </span>
                      <span className="mt-1 flex items-center gap-2 text-[11px] font-medium text-muted">
                        <span>{formatDate(item.date)}</span>
                        {item.zScore !== null && (
                          <span className="font-mono">z={formatNumber(item.zScore, 2)}</span>
                        )}
                        {item.aiExplanation && (
                          <Sparkles className="size-3 text-primary" aria-hidden="true" />
                        )}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selected && (
          <div className="min-w-0 rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${severityStyles[selected.severity].badge}`}
                >
                  {severityStyles[selected.severity].label}
                </span>
                <h2 className="mt-2 text-base font-bold tracking-[-0.02em] text-foreground">
                  {selected.metricLabel}
                </h2>
                <p className="mt-1 text-[13px] text-muted">
                  {formatDate(selected.date)} ·{" "}
                  {selected.method === "zscore" ? "rolling z-score" : "IQR chegarasi"}
                </p>
              </div>

              {!selected.aiExplanation && (
                <button
                  type="button"
                  onClick={() => void handleExplain(selected.id)}
                  disabled={explainingId === selected.id}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-surface px-3 text-xs font-bold text-foreground shadow-sm transition-colors hover:border-border-strong hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {explainingId === selected.id ? (
                    <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <BrainCircuit className="size-3.5" aria-hidden="true" />
                  )}
                  AI bilan izohlash
                </button>
              )}
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Kuzatilgan", value: formatNumber(selected.observed, selected.decimals) },
                { label: "Kutilgan", value: formatNumber(selected.expected, selected.decimals) },
                {
                  label: "Og'ish",
                  value: `${selected.deviationPct > 0 ? "+" : ""}${formatNumber(selected.deviationPct, 1)}%`,
                },
                { label: "z-score", value: formatNumber(selected.zScore, 2) },
              ].map((item) => (
                <div className="rounded-md border border-border bg-canvas p-2.5" key={item.label}>
                  <dt className="text-[11px] font-bold uppercase tracking-[0.06em] text-faint">
                    {item.label}
                  </dt>
                  <dd className="mt-1 font-mono text-sm font-bold text-foreground">{item.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={selected.trend} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={48}
                    tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid var(--border)",
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expected"
                    stroke="var(--text-muted)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                    name="Kutilgan"
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="var(--danger)"
                    strokeWidth={2}
                    dot={{ r: 2.5 }}
                    name="Kuzatilgan"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {explainError && (
              <p className="mt-3 flex items-start gap-2 rounded-md border border-warning/20 bg-warning-soft px-3 py-2 text-[13px] font-medium leading-5 text-warning">
                <AlertTriangle className="mt-px size-4 shrink-0" aria-hidden="true" />
                {explainError}
              </p>
            )}

            {selected.aiExplanation && (
              <div className="mt-4 rounded-lg border border-primary/15 bg-primary-soft p-4">
                <p className="ui-label flex items-center gap-1.5 text-primary">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  AI izohi
                </p>
                <p className="mt-2 text-[13px] leading-5 text-muted-strong">
                  {selected.aiExplanation.description}
                </p>

                <div className="mt-3 space-y-2">
                  <p className="text-xs font-bold text-muted-strong">Ehtimoliy sabablar</p>
                  {selected.aiExplanation.causes.map((cause) => (
                    <div key={cause.label}>
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="text-muted-strong">{cause.label}</span>
                        <span className="font-mono font-bold text-foreground">{cause.value}%</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface/70">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${cause.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 rounded-md border border-primary/10 bg-surface/75 p-3">
                  <p className="text-xs font-bold text-muted-strong">Tavsiya</p>
                  <p className="mt-1 text-[13px] leading-5 text-muted-strong">
                    {selected.aiExplanation.recommendation}
                  </p>
                  <p className="mt-2 text-[11px] font-medium text-muted">
                    Kutilayotgan ta&apos;sir: {selected.aiExplanation.impact}
                  </p>
                </div>
              </div>
            )}

            <Link
              href="/qarorlar"
              className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-primary-hover"
            >
              Qaror tavsiyalariga o&apos;tish
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        )}
      </section>

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-xs leading-5 text-muted shadow-card">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <span>
          Aniqlash usuli: {data.detection.method}. Hafta kuni bo&apos;yicha mavsumiy
          tuzatish qo&apos;llanadi — dam olish kunlaridagi tabiiy pasayish anomaliya
          deb belgilanmaydi. Kritik chegara z ≥ {data.detection.criticalZ},
          ogohlantirish z ≥ {data.detection.warningZ}.
        </span>
      </div>
    </>
  );
}

export function AiAnalyticsView() {
  const [tab, setTab] = useState<Tab>("forecast");

  return (
    <div className="mx-auto w-full max-w-6xl pb-2">
      <PageHeader
        eyebrow="Sun'iy intellekt"
        title="AI tahlili"
        description="Prognozlash va anomaliyalarni aniqlash natijalari."
      />

      <div className="mt-5 flex gap-1 rounded-lg border border-border bg-surface p-1.5 shadow-card" role="tablist">
        {(
          [
            { key: "forecast", label: "Prognozlash", icon: TrendingUp },
            { key: "anomalies", label: "Anomaliyalar", icon: ScanSearch },
          ] as const
        ).map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={tab === item.key}
              onClick={() => setTab(item.key)}
              className={`inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md text-[13px] font-bold transition-colors ${
                tab === item.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        {tab === "forecast" ? <ForecastPanel /> : <AnomalyPanel />}
      </div>
    </div>
  );
}
