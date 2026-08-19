"use client";

import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeDollarSign,
  BarChart3,
  Calculator,
  CheckCircle2,
  Clock3,
  Gauge,
  Info,
  RotateCcw,
  Sparkles,
  Target,
  TimerReset,
  TrendingUp,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/layout/page-header";
import {
  comparisonMetrics,
  economicKpis,
  efficiencyComponents,
  scenarioPresets,
  type ComparisonMetric,
} from "@/data/economic-efficiency";

const kpiIcons = {
  chart: BarChart3,
  wallet: WalletCards,
  clock: TimerReset,
  trend: TrendingUp,
};

const kpiToneClasses = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  accent: "bg-accent-soft text-accent",
};

function ComparisonTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    dataKey?: string | number;
    value?: number | string;
    payload?: ComparisonMetric;
  }>;
  label?: string | number;
}) {
  const metric = payload?.[0]?.payload;
  if (!active || !metric) return null;

  return (
    <div className="min-w-48 rounded-lg border border-border bg-surface px-3 py-2.5 shadow-floating">
      <p className="text-xs font-bold text-foreground">{label}</p>
      <div className="mt-2 space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
            <span className="size-2 rounded-sm border border-faint bg-surface-muted" aria-hidden="true" />
            AI&apos;dan oldin
          </span>
          <span className="font-mono text-xs font-bold text-foreground">
            {metric.beforeLabel}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
            <span className="size-2 rounded-sm bg-primary" aria-hidden="true" />
            AI&apos;dan keyin
          </span>
          <span className="font-mono text-xs font-bold text-primary">
            {metric.afterLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

function EconomicKpiCard({
  metric,
}: {
  metric: (typeof economicKpis)[number];
}) {
  const Icon = kpiIcons[metric.icon];
  const TrendIcon = metric.key === "productivity" || metric.key === "roi"
    ? ArrowUpRight
    : ArrowDownRight;

  return (
    <article className="group flex h-full flex-col rounded-lg border border-border bg-surface p-4 shadow-card transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-semibold leading-5 text-muted">{metric.label}</p>
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-md ${kpiToneClasses[metric.tone]}`}
        >
          <Icon className="size-[18px]" strokeWidth={1.9} aria-hidden="true" />
        </span>
      </div>

      <div className="mt-4 flex min-w-0 items-end gap-2">
        <p className="font-mono text-2xl font-bold leading-none tracking-[-0.05em] text-foreground">
          {metric.value}
        </p>
        {"suffix" in metric && (
          <span className="mb-0.5 truncate text-xs font-semibold text-muted">
            {metric.suffix}
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center gap-1.5 border-t border-border pt-3">
        <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-success-soft px-2 py-1 font-mono text-[11px] font-bold text-success">
          <TrendIcon className="size-3" aria-hidden="true" />
          {metric.change}
        </span>
        <span className="truncate text-xs font-medium text-faint">{metric.detail}</span>
      </div>
    </article>
  );
}

function EfficiencyScoreCard() {
  const score = 86.4;
  const scoreData = [{ name: "EES", value: score, fill: "var(--primary)" }];

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="ui-label text-faint">Umumiy iqtisodiy baho</p>
          <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">
            EES indeksi
          </h2>
        </div>
        <span className="rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-bold text-success">
          Yuqori
        </span>
      </div>

      <div className="mt-3 flex justify-center">
        <div className="relative size-44">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={scoreData}
              cx="50%"
              cy="50%"
              innerRadius="76%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar
                dataKey="value"
                background={{ fill: "var(--surface-muted)" }}
                cornerRadius={10}
                animationDuration={500}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
            <p className="font-mono text-3xl font-bold tracking-[-0.06em] text-foreground">
              {score}
            </p>
            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.09em] text-faint">
              100 dan
            </p>
          </div>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-surface-muted">
        <div className="px-3 py-2.5">
          <p className="text-[11px] font-semibold text-faint">Oldingi davr</p>
          <p className="mt-1 font-mono text-xs font-bold text-foreground">83.2 ball</p>
        </div>
        <div className="border-l border-border px-3 py-2.5">
          <p className="text-[11px] font-semibold text-faint">O&apos;zgarish</p>
          <p className="mt-1 font-mono text-xs font-bold text-success">+3.2 ball</p>
        </div>
      </div>
    </section>
  );
}

function EfficiencyComponentsStrip() {
  return (
    <section className="mt-4 rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="ui-label text-faint">Indeks tarkibi</p>
          <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">
            Samaradorlik komponentlari
          </h2>
        </div>
        <span className="text-xs font-medium text-muted">
          Indikativ qiymatlar · Avgust 2026
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-5">
        {efficiencyComponents.map((component) => (
          <article className="rounded-lg border border-border bg-canvas p-3" key={component.label}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold leading-5 text-muted">{component.label}</p>
              <span className="shrink-0 font-mono text-sm font-bold text-foreground">
                {component.value}%
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${component.value}%`,
                  backgroundColor: component.color,
                }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function BeforeAfterSection() {
  return (
    <section className="mt-4 grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="min-w-0 rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="ui-label text-faint">Bazaviy taqqoslash</p>
            <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">
              AI&apos;dan oldin va keyin
            </h2>
            <p className="mt-1 text-[13px] text-muted">
              Bazaviy holat 100 indeks sifatida normallashtirilgan
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary">
            <BadgeDollarSign className="size-3.5" aria-hidden="true" />
            Oylik baholash
          </span>
        </div>

        <div className="mt-5 h-[19rem] w-full" aria-label="AI dan oldin va keyin taqqoslash grafigi">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonMetrics}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 10, bottom: 0 }}
              barGap={3}
            >
              <CartesianGrid
                horizontal={false}
                stroke="var(--chart-grid)"
                strokeDasharray="3 5"
              />
              <XAxis
                type="number"
                domain={[0, 130]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--faint)", fontSize: 11, fontWeight: 600 }}
                tickFormatter={(value: number) => `${value}%`}
              />
              <YAxis
                type="category"
                dataKey="shortLabel"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted)", fontSize: 11, fontWeight: 600 }}
                width={96}
              />
              <Tooltip
                cursor={{ fill: "var(--surface-muted)" }}
                content={<ComparisonTooltip />}
              />
              <Bar
                dataKey="beforeIndex"
                name="AI'dan oldin"
                fill="var(--surface-muted)"
                stroke="var(--border-strong)"
                strokeWidth={1}
                radius={[0, 5, 5, 0]}
                maxBarSize={15}
                animationDuration={380}
              />
              <Bar
                dataKey="afterIndex"
                name="AI'dan keyin"
                fill="var(--primary)"
                radius={[0, 5, 5, 0]}
                maxBarSize={15}
                animationDuration={450}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
              <span className="size-2 rounded-sm border border-faint bg-surface-muted" aria-hidden="true" />
              AI&apos;dan oldin
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
              <span className="size-2 rounded-sm bg-primary" aria-hidden="true" />
              AI&apos;dan keyin
            </span>
          </div>
          <span className="text-xs font-medium text-faint">100 = bazaviy holat</span>
        </div>
      </div>

      <aside className="rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5">
        <p className="ui-label text-faint">Natijalar</p>
        <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">
          Asosiy o&apos;zgarishlar
        </h2>

        <div className="mt-4 divide-y divide-border">
          {comparisonMetrics.map((metric) => {
            const TrendIcon = metric.positiveDirection === "up" ? ArrowUpRight : ArrowDownRight;

            return (
              <div className="py-3 first:pt-0 last:pb-0" key={metric.key}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-muted">{metric.label}</span>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-success-soft px-2 py-1 font-mono text-[11px] font-bold text-success">
                    <TrendIcon className="size-3" aria-hidden="true" />
                    {metric.change}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-faint line-through">{metric.beforeLabel}</span>
                  <ArrowRight className="size-3 text-faint" aria-hidden="true" />
                  <span className="font-bold text-foreground">{metric.afterLabel}</span>
                </div>
                <p className="mt-1 text-[11px] font-medium text-muted">{metric.changeLabel}</p>
              </div>
            );
          })}
        </div>
      </aside>
    </section>
  );
}

function ScenarioSlider({
  label,
  value,
  baseline,
  min,
  max,
  step = 1,
  onChange,
  icon: Icon,
}: {
  label: string;
  value: number;
  baseline: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  icon: LucideIcon;
}) {
  const fill = ((value - min) / (max - min)) * 100;

  return (
    <div className="rounded-lg border border-border bg-canvas p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary-soft text-primary">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[13px] font-bold text-foreground">{label}</p>
            <p className="mt-0.5 text-[11px] font-medium text-muted">
              Bazaviy: {baseline}%
            </p>
          </div>
        </div>
        <span className="rounded-md bg-surface px-2.5 py-1.5 font-mono text-sm font-bold text-primary shadow-sm ring-1 ring-inset ring-border">
          {value}%
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
        className="ui-range mt-5 w-full cursor-pointer"
        style={{ "--range-fill": `${fill}%` } as CSSProperties}
      />
      <div className="mt-1.5 flex items-center justify-between font-mono text-[11px] font-medium text-faint">
        <span>{min}%</span>
        <span>{max}%</span>
      </div>
    </div>
  );
}

function WhatIfSection() {
  const [automation, setAutomation] = useState(80);
  const [accuracy, setAccuracy] = useState(95);

  const result = useMemo(() => {
    const automationDelta = Math.max(0, automation - 60);
    const accuracyDelta = Math.max(0, accuracy - 88);

    return {
      laborSaving: Math.round(automationDelta * 11),
      costReduction: automationDelta * 0.42,
      productivityGrowth: automationDelta * 0.585,
      errorCostReduction: accuracyDelta * 4.6,
    };
  }, [accuracy, automation]);

  const activePreset = scenarioPresets.find(
    (preset) => preset.automation === automation && preset.accuracy === accuracy,
  )?.key;

  return (
    <section className="mt-4 overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div>
          <p className="ui-label text-primary">What-if tahlili</p>
          <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">
            Ssenariy parametrlarini o&apos;zgartiring
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-muted">
            Avtomatlashtirish va AI aniqligi iqtisodiy natijalarga qanday ta&apos;sir qilishini baholang.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-1 text-[11px] font-bold text-warning">
          <Calculator className="size-3.5" aria-hidden="true" />
          Demo hisob
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="ui-label text-faint">Tayyor ssenariylar</p>
            <button
              type="button"
              onClick={() => {
                setAutomation(60);
                setAccuracy(88);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted transition-colors hover:text-foreground"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Bazaviy holat
            </button>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-1 rounded-md bg-surface-muted p-1">
            {scenarioPresets.map((preset) => {
              const isActive = activePreset === preset.key;

              return (
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    setAutomation(preset.automation);
                    setAccuracy(preset.accuracy);
                  }}
                  className={`h-9 rounded px-2 text-xs font-bold transition-colors ${
                    isActive
                      ? "bg-surface text-foreground shadow-sm ring-1 ring-border/80"
                      : "text-muted hover:text-foreground"
                  }`}
                  key={preset.key}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <div className="mt-3 space-y-3">
            <ScenarioSlider
              label="Avtomatlashtirish darajasi"
              value={automation}
              baseline={60}
              min={60}
              max={95}
              onChange={setAutomation}
              icon={Gauge}
            />
            <ScenarioSlider
              label="AI aniqligi"
              value={accuracy}
              baseline={88}
              min={88}
              max={99}
              step={0.5}
              onChange={setAccuracy}
              icon={Target}
            />
          </div>
        </div>

        <div className="rounded-lg border border-primary/15 bg-primary-soft p-4 sm:p-5" aria-live="polite">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="ui-label text-primary">Kutilayotgan natija</p>
              <h3 className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">
                Ssenariyning iqtisodiy ta&apos;siri
              </h3>
            </div>
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-white shadow-sm">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {[
              {
                label: "Mehnat vaqti tejalishi",
                value: result.laborSaving > 0 ? `+${result.laborSaving}` : "0",
                suffix: "soat / oy",
                icon: Clock3,
              },
              {
                label: "Xarajat kamayishi",
                value:
                  result.costReduction > 0
                    ? `−${result.costReduction.toFixed(1)}%`
                    : "0.0%",
                suffix: "kutilayotgan",
                icon: WalletCards,
              },
              {
                label: "Unumdorlik o'sishi",
                value:
                  result.productivityGrowth > 0
                    ? `+${result.productivityGrowth.toFixed(1)}%`
                    : "0.0%",
                suffix: "bazaviy holatdan",
                icon: TrendingUp,
              },
              {
                label: "Xatolar qiymati",
                value:
                  result.errorCostReduction > 0
                    ? `−${result.errorCostReduction.toFixed(1)}%`
                    : "0.0%",
                suffix: "taxminiy kamayish",
                icon: CheckCircle2,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <article className="rounded-lg border border-primary/10 bg-surface/80 p-3.5" key={item.label}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold leading-5 text-muted">{item.label}</p>
                    <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  </div>
                  <p className="mt-3 font-mono text-xl font-bold tracking-[-0.045em] text-foreground">
                    {item.value}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-muted">{item.suffix}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-3 rounded-lg border border-primary/10 bg-surface/75 p-3.5">
            <p className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <Info className="size-3.5" aria-hidden="true" />
              Ssenariy izohi
            </p>
            <p className="mt-1.5 text-[13px] leading-5 text-muted-strong">
              Avtomatlashtirish {automation}% va AI aniqligi {accuracy}% bo&apos;lganda qo&apos;lda bajariladigan ishlar kamayib, jarayon barqarorligi oshishi kutiladi.
            </p>
          </div>

          <Link
            href="/qarorlar"
            className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-3 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-primary-hover"
          >
            Ssenariyni qarorga aylantirish
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function EconomicEfficiencyView() {
  return (
    <div className="mx-auto w-full max-w-6xl pb-2">
      <PageHeader
        eyebrow="Iqtisodiy baholash"
        title="Iqtisodiy samaradorlik"
        description="AI natijalarining xarajat, vaqt va unumdorlikka ta'sirini o'lchang va ssenariylarni baholang."
        action={
          <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-warning/20 bg-warning-soft px-3 text-[13px] font-bold text-warning shadow-sm">
            <Calculator className="size-4" aria-hidden="true" />
            Demo formula
          </div>
        }
      />

      <section className="mt-5 grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <EfficiencyScoreCard />
        <div className="grid grid-cols-2 gap-3">
          {economicKpis.map((metric) => (
            <EconomicKpiCard metric={metric} key={metric.key} />
          ))}
        </div>
      </section>

      <EfficiencyComponentsStrip />
      <BeforeAfterSection />
      <WhatIfSection />

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-warning/20 bg-warning-soft/65 px-4 py-3 text-xs leading-5 text-muted-strong shadow-card">
        <Info className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
        EES va ssenariy natijalari namoyish uchun shakllantirilgan. Yakuniy indeks formulasi dissertatsiyada metodologik tasdiqlangandan keyin aynan shu modulga ulanadi.
      </div>
    </div>
  );
}
