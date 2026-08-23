"use client";

import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeDollarSign,
  Calculator,
  Clock3,
  Database,
  Gauge,
  Info,
  LoaderCircle,
  RotateCcw,
  Target,
  TrendingUp,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/layout/page-header";
import { formatDate, formatNumber } from "@/lib/format";
import {
  getEconomics,
  runWhatIf,
  type ComparisonMetric,
  type EconomicsResponse,
  type PeriodKey,
  type WhatIfResponse,
} from "@/services/metrics";

const periodOptions: Array<{ key: PeriodKey; label: string }> = [
  { key: "week", label: "7 kun" },
  { key: "month", label: "30 kun" },
  { key: "quarter", label: "Chorak" },
  { key: "year", label: "Yil" },
];

const componentColors: Record<string, string> = {
  time: "var(--chart-1)",
  cost: "var(--chart-2)",
  labor: "var(--chart-5)",
  automation: "var(--chart-3)",
  quality: "var(--chart-4)",
};

function changeOf(metric: ComparisonMetric) {
  if (metric.before === null || metric.after === null || metric.before === 0) {
    return null;
  }

  return ((metric.after - metric.before) / Math.abs(metric.before)) * 100;
}

function KpiCard({
  label,
  value,
  unit,
  detail,
  icon: Icon,
  tone,
  note,
}: {
  label: string;
  value: string;
  unit?: string;
  detail: string;
  icon: LucideIcon;
  tone: "primary" | "success" | "accent";
  note?: string;
}) {
  const toneClass = {
    primary: "bg-primary-soft text-primary",
    success: "bg-success-soft text-success",
    accent: "bg-accent-soft text-accent",
  }[tone];

  return (
    <article className="min-w-0 rounded-lg border border-border bg-surface p-3.5 shadow-card sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="min-h-8 text-[13px] font-semibold leading-4 text-muted">{label}</p>
        <span className={`grid size-8 shrink-0 place-items-center rounded-md ${toneClass}`}>
          <Icon className="size-4" strokeWidth={1.8} aria-hidden="true" />
        </span>
      </div>

      <div className="mt-2.5 flex min-w-0 items-end gap-1.5">
        <p className="truncate font-mono text-xl font-bold leading-none tracking-[-0.045em] text-foreground sm:text-[1.4rem]">
          {value}
        </p>
        {unit && <p className="mb-0.5 truncate text-xs font-semibold text-muted">{unit}</p>}
      </div>

      <p className="mt-3 border-t border-border pt-2.5 text-[11px] leading-4 text-faint sm:text-xs">
        {note ?? detail}
      </p>
    </article>
  );
}

function ScenarioSlider({
  label,
  value,
  baseline,
  min,
  max,
  onChange,
  icon: Icon,
}: {
  label: string;
  value: number;
  baseline: number | null;
  min: number;
  max: number;
  onChange: (value: number) => void;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-lg border border-border bg-canvas p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-foreground">
          <Icon className="size-3.5 text-primary" aria-hidden="true" />
          {label}
        </span>
        <span className="font-mono text-sm font-bold text-primary">{value.toFixed(1)}%</span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={0.5}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-muted accent-primary"
        aria-label={label}
      />

      <div className="mt-1.5 flex justify-between text-[11px] font-medium text-faint">
        <span>{min}%</span>
        {baseline !== null && <span>joriy: {baseline.toFixed(1)}%</span>}
        <span>{max}%</span>
      </div>
    </div>
  );
}

function ComparisonRow({ metric }: { metric: ComparisonMetric }) {
  const change = changeOf(metric);
  const isImprovement =
    change === null
      ? false
      : metric.positiveDirection === "up"
        ? change > 0
        : change < 0;

  const TrendIcon = change !== null && change > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-border py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-[13px] font-bold text-foreground">{metric.label}</p>
        <p className="mt-1 flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <span className="text-faint line-through">
            {formatNumber(metric.before, metric.decimals)}
          </span>
          <ArrowRight className="size-3 text-muted" aria-hidden="true" />
          <span className="font-bold text-foreground">
            {formatNumber(metric.after, metric.decimals)}
          </span>
          <span className="text-muted">{metric.unit}</span>
        </p>
      </div>

      {change !== null && (
        <span
          className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-1 font-mono text-[11px] font-bold ${
            isImprovement ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
          }`}
        >
          <TrendIcon className="size-3" aria-hidden="true" />
          {change > 0 ? "+" : "−"}
          {Math.abs(change).toFixed(1)}%
        </span>
      )}
    </div>
  );
}

export function EconomicEfficiencyView() {
  const [period, setPeriod] = useState<PeriodKey>("month");
  const [data, setData] = useState<EconomicsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [automation, setAutomation] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [scenario, setScenario] = useState<WhatIfResponse | null>(null);
  const [isScenarioLoading, setIsScenarioLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void getEconomics(period).then((response) => {
      if (cancelled) return;

      setIsLoading(false);

      if (!response.ok) {
        setError(response.message);
        setData(null);
        return;
      }

      setError("");
      setData(response.data);
      setAutomation(response.data.scenarioDefaults.automation);
      setAccuracy(response.data.scenarioDefaults.accuracy);
      setScenario(null);
    });

    return () => {
      cancelled = true;
    };
  }, [period]);

  // Slider to'xtaganda hisoblanadi — har bir piksel uchun so'rov yuborilmaydi.
  useEffect(() => {
    if (automation === null || accuracy === null) return;

    const timer = window.setTimeout(() => {
      setIsScenarioLoading(true);

      void runWhatIf({ automation, accuracy, period }).then((response) => {
        setIsScenarioLoading(false);
        if (response.ok) setScenario(response.data);
      });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [automation, accuracy, period]);

  if (isLoading && !data) {
    return (
      <div className="mx-auto grid min-h-64 w-full max-w-6xl place-content-center text-center">
        <LoaderCircle className="mx-auto size-6 animate-spin text-primary" aria-hidden="true" />
        <p className="mt-3 text-xs font-medium text-muted">Iqtisodiy ko&apos;rsatkichlar hisoblanmoqda...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-6xl pb-2">
        <PageHeader
          eyebrow="Iqtisodiy natija"
          title="Iqtisodiy samaradorlik"
          description="AI joriy etilishining moliyaviy va mehnat natijalarini baholang."
        />
        <div className="mt-6 grid min-h-56 place-content-center rounded-lg border border-dashed border-border-strong bg-surface p-8 text-center shadow-card">
          <Database className="mx-auto size-7 text-faint" aria-hidden="true" />
          <h2 className="mt-4 text-sm font-bold text-foreground">Hisoblash uchun ma&apos;lumot yo&apos;q</h2>
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

  const { savings, ees, comparison } = data;

  const chartData = comparison
    .filter((metric) => metric.before !== null && metric.after !== null)
    .map((metric) => ({
      label: metric.label,
      // Bazaviy davr 100 ball deb olinadi — birliklari har xil ko'rsatkichlarni
      // bitta grafikda solishtirish uchun.
      oldin: 100,
      keyin: metric.before ? ((metric.after ?? 0) / metric.before) * 100 : 0,
    }));

  return (
    <div className="mx-auto w-full max-w-6xl pb-2">
      <PageHeader
        eyebrow="Iqtisodiy natija"
        title="Iqtisodiy samaradorlik"
        description="AI joriy etilishining moliyaviy va mehnat natijalarini baholang."
        action={
          <div className="inline-flex h-9 max-w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 text-[13px] font-bold text-muted-strong shadow-sm">
            <Database className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate">{data.source.datasetName}</span>
          </div>
        }
      />

      <div className="mt-5 flex items-center justify-between gap-3 overflow-x-auto rounded-lg border border-border bg-surface p-1.5 shadow-card">
        <div className="flex min-w-max items-center gap-1" role="group" aria-label="Hisob davri">
          {periodOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              className={`h-8 rounded-md px-3 text-[13px] font-bold transition-colors ${
                period === option.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted hover:bg-surface-muted hover:text-foreground"
              }`}
              onClick={() => setPeriod(option.key)}
              aria-pressed={period === option.key}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="hidden shrink-0 pr-2 text-xs font-medium text-faint md:block">
          {formatDate(data.period.from)} — {formatDate(data.period.to)}
        </p>
      </div>

      <section className="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3" aria-label="Iqtisodiy ko'rsatkichlar">
        <KpiCard
          label="Investitsiya qaytimi"
          value={savings.roi === null ? "—" : `${formatNumber(savings.roi)}%`}
          detail="yillik ko'rinishda"
          icon={TrendingUp}
          tone="primary"
          note={
            savings.investment === null
              ? "Sozlamalarda joriy etish xarajatini kiriting"
              : `${formatNumber(savings.investment, 0)} mln so'm investitsiyaga nisbatan`
          }
        />
        <KpiCard
          label="Tejalgan xarajat"
          value={formatNumber(savings.savedCost)}
          unit="mln so'm"
          detail="bazaviy davrga nisbatan"
          icon={WalletCards}
          tone="success"
          note={`yillik: ${formatNumber(savings.annualisedSaving, 0)} mln so'm`}
        />
        <KpiCard
          label="Tejalgan mehnat vaqti"
          value={formatNumber(savings.savedHours, 0)}
          unit="soat"
          detail="bazaviy davrga nisbatan"
          icon={Clock3}
          tone="success"
        />
        <KpiCard
          label="Unumdorlik o'sishi"
          value={
            savings.productivityGain === null
              ? "—"
              : `${savings.productivityGain > 0 ? "+" : ""}${formatNumber(savings.productivityGain)}%`
          }
          detail="daromad / mehnat soati"
          icon={BadgeDollarSign}
          tone="accent"
        />
      </section>

      <section className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="ui-label text-faint">EES</p>
              <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">
                Samaradorlik indeksi
              </h2>
            </div>
            <span className="rounded-full bg-accent-soft px-2 py-1 text-xs font-bold text-accent">
              {ees.coverage >= 1 ? "To'liq" : `${Math.round(ees.coverage * 100)}%`}
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-center gap-3">
            <div className="text-center">
              <p className="font-mono text-4xl font-bold tracking-[-0.06em] text-foreground">
                {ees.score === null ? "—" : ees.score.toFixed(1)}
              </p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.1em] text-faint">
                joriy davr
              </p>
            </div>
            <ArrowRight className="size-4 rotate-180 text-muted" aria-hidden="true" />
            <div className="text-center">
              <p className="font-mono text-2xl font-bold tracking-[-0.05em] text-faint">
                {ees.baselineScore === null ? "—" : ees.baselineScore.toFixed(1)}
              </p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.1em] text-faint">
                bazaviy
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3.5 border-t border-border pt-4">
            {ees.components.map((component) => (
              <div key={component.key}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span className="text-[13px] font-medium text-muted">
                    {component.label}
                    <span className="ml-1.5 font-mono text-[11px] text-faint">
                      ×{component.weight}
                    </span>
                  </span>
                  <span className="font-mono text-[13px] font-bold text-foreground">
                    {component.score === null ? "—" : `${component.score.toFixed(0)}%`}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{
                      width: `${component.score ?? 0}%`,
                      backgroundColor: componentColors[component.key] ?? "var(--chart-1)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="ui-label text-faint">Taqqoslash</p>
              <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">
                AI&apos;dan oldin va keyin
              </h2>
              <p className="mt-1 text-[13px] leading-5 text-muted">
                Bazaviy davr: {formatDate(data.baseline.from)} — {formatDate(data.baseline.to)}
                {" · "}
                {data.baseline.rowCount} yozuv
              </p>
            </div>
          </div>

          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                  interval={0}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  unit="%"
                />
                <Tooltip
                  cursor={{ fill: "var(--surface-muted)" }}
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                  formatter={(value) =>
                    typeof value === "number" ? `${value.toFixed(1)}%` : String(value)
                  }
                />
                <Bar dataKey="oldin" fill="var(--surface-muted)" radius={[4, 4, 0, 0]} name="Oldin" />
                <Bar dataKey="keyin" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Keyin" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-2 text-[11px] text-faint">
            Bazaviy davr 100% deb olingan — turli o&apos;lchov birligidagi ko&apos;rsatkichlarni
            bitta shkalada solishtirish uchun.
          </p>

          <div className="mt-3 border-t border-border pt-1">
            {comparison.map((metric) => (
              <ComparisonRow key={metric.key} metric={metric} />
            ))}
          </div>
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-lg border border-border bg-surface shadow-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
          <div>
            <p className="ui-label text-primary">What-if tahlili</p>
            <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">
              Ssenariy parametrlarini o&apos;zgartiring
            </h2>
            <p className="mt-1 text-[13px] leading-5 text-muted">
              Avtomatlashtirish va aniqlik iqtisodiy natijalarga qanday ta&apos;sir qilishini baholang.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-1 text-[11px] font-bold text-warning">
            <Calculator className="size-3.5" aria-hidden="true" />
            Baholangan
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="ui-label text-faint">Parametrlar</p>
              <button
                type="button"
                onClick={() => {
                  setAutomation(data.scenarioDefaults.automation);
                  setAccuracy(data.scenarioDefaults.accuracy);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-muted transition-colors hover:text-foreground"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                Joriy holat
              </button>
            </div>

            <div className="mt-3 space-y-3">
              <ScenarioSlider
                label="Avtomatlashtirish darajasi"
                value={automation ?? 0}
                baseline={data.scenarioDefaults.automation}
                min={40}
                max={100}
                onChange={setAutomation}
                icon={Gauge}
              />
              <ScenarioSlider
                label="Ma'lumot aniqligi"
                value={accuracy ?? 0}
                baseline={data.scenarioDefaults.accuracy}
                min={90}
                max={100}
                onChange={setAccuracy}
                icon={Target}
              />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-canvas p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="ui-label text-faint">Kutilayotgan natija</p>
              {isScenarioLoading && (
                <LoaderCircle className="size-3.5 animate-spin text-primary" aria-hidden="true" />
              )}
            </div>

            {scenario ? (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Samaradorlik indeksi",
                    before: scenario.current.ees,
                    after: scenario.projected.ees,
                    decimals: 1,
                    unit: "",
                  },
                  {
                    label: "Qayta ishlash vaqti",
                    before: scenario.current.inputs.processingSeconds,
                    after: scenario.projected.inputs.processingSeconds,
                    decimals: 2,
                    unit: " s",
                  },
                  {
                    label: "Tejalgan xarajat",
                    before: scenario.current.savings.savedCost,
                    after: scenario.projected.savings.savedCost,
                    decimals: 1,
                    unit: " mln",
                  },
                  {
                    label: "Investitsiya qaytimi",
                    before: scenario.current.savings.roi,
                    after: scenario.projected.savings.roi,
                    decimals: 1,
                    unit: "%",
                  },
                ].map((item) => (
                  <div className="rounded-md border border-border bg-surface p-3" key={item.label}>
                    <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-faint">
                      {item.label}
                    </p>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-faint line-through">
                        {formatNumber(item.before, item.decimals)}
                      </span>
                      <ArrowRight className="size-3 shrink-0 text-primary" aria-hidden="true" />
                      <span className="font-mono text-sm font-bold text-foreground">
                        {formatNumber(item.after, item.decimals)}
                        {item.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 grid min-h-32 place-content-center text-center">
                <LoaderCircle className="mx-auto size-5 animate-spin text-primary" aria-hidden="true" />
                <p className="mt-2 text-xs text-muted">Ssenariy hisoblanmoqda...</p>
              </div>
            )}

            {scenario && (
              <p className="mt-3 border-t border-border pt-3 text-[11px] leading-4 text-faint">
                {scenario.estimateNote}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-xs leading-5 text-muted shadow-card">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <span>
          EES = 100 × Σ(vazn × normallashtirilgan komponent). Vaznlar va chegaralar
          tashkilot sozlamalarida saqlanadi.
          {savings.investment !== null && (
            <>
              {" "}ROI hisobida {formatNumber(savings.investment, 0)} mln so&apos;m joriy etish
              xarajati ishlatilgan — bu taxminiy qiymat, sozlamalardan o&apos;zgartiriladi.
            </>
          )}
        </span>
      </div>
    </div>
  );
}
