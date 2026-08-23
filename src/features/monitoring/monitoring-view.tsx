"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  Check,
  CheckCircle2,
  CircleGauge,
  Clock3,
  Database,
  Gauge,
  Info,
  Pause,
  Play,
  ServerCog,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Waypoints,
  XCircle,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/layout/page-header";
import { DemoNotice } from "@/components/ui/demo-notice";
import {
  economicSignals,
  initialStreamData,
  monitoringAlerts,
  monitoringEvents,
  pipelineServices,
  resourceUsage,
  type MonitoringFeedItem,
  type MonitoringSeverity,
  type StreamPoint,
} from "@/data/monitoring";

type FeedTab = "events" | "alerts";
type TimeRange = "five" | "fifteen" | "hour";

const rangeOptions: Array<{ key: TimeRange; label: string; points: number }> = [
  { key: "five", label: "5 daq", points: 6 },
  { key: "fifteen", label: "15 daq", points: 10 },
  { key: "hour", label: "1 soat", points: 15 },
];

const severityPresentation: Record<
  MonitoringSeverity,
  {
    icon: LucideIcon;
    iconClass: string;
    dotClass: string;
    badgeClass: string;
    label: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconClass: "bg-success-soft text-success",
    dotClass: "bg-success",
    badgeClass: "bg-success-soft text-success",
    label: "Normal",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "bg-warning-soft text-warning",
    dotClass: "bg-warning",
    badgeClass: "bg-warning-soft text-warning",
    label: "Ogohlantirish",
  },
  critical: {
    icon: XCircle,
    iconClass: "bg-danger-soft text-danger",
    dotClass: "bg-danger",
    badgeClass: "bg-danger-soft text-danger",
    label: "Kritik",
  },
  info: {
    icon: Info,
    iconClass: "bg-info-soft text-info",
    dotClass: "bg-info",
    badgeClass: "bg-info-soft text-info",
    label: "Axborot",
  },
};

const resourceToneClasses = {
  primary: "bg-primary",
  accent: "bg-accent",
  info: "bg-info",
};

function formatInteger(value: number) {
  return new Intl.NumberFormat("uz-UZ").format(value);
}

function formatClock(date: Date) {
  return new Intl.DateTimeFormat("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function MetricSparkline({ values, color }: { values: number[]; color: string }) {
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = Math.max(maximum - minimum, 1);
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 72;
      const y = 28 - ((value - minimum) / range) * 22;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="h-8 w-[4.5rem] overflow-visible" viewBox="0 0 72 32" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="72"
        cy={Number(points.split(" ").at(-1)?.split(",")[1] ?? 16)}
        r="3"
        fill="var(--surface)"
        stroke={color}
        strokeWidth="2"
      />
    </svg>
  );
}

function MetricCard({
  label,
  value,
  detail,
  badge,
  icon: Icon,
  iconClass,
  values,
  chartColor,
}: {
  label: string;
  value: string;
  detail: string;
  badge: string;
  icon: LucideIcon;
  iconClass: string;
  values: number[];
  chartColor: string;
}) {
  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-semibold text-muted">{label}</p>
        <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${iconClass}`}>
          <Icon className="size-[1.05rem]" strokeWidth={1.9} aria-hidden="true" />
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="whitespace-nowrap font-mono text-[1.45rem] font-bold leading-none tracking-[-0.04em] text-foreground">
            {value}
          </p>
          <p className="mt-2 truncate text-xs font-medium text-faint">{detail}</p>
        </div>
        <MetricSparkline values={values} color={chartColor} />
      </div>
      <div className="mt-3 border-t border-border pt-2.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-1 text-[11px] font-bold text-success">
          <Check className="size-3" strokeWidth={2.5} aria-hidden="true" />
          {badge}
        </span>
      </div>
    </article>
  );
}

function StreamTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string | number; value?: number | string }>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;

  const labels: Record<string, { label: string; unit: string; color: string }> = {
    received: { label: "Qabul qilindi", unit: "/s", color: "var(--primary)" },
    processed: { label: "Qayta ishlandi", unit: "/s", color: "var(--chart-5)" },
    latency: { label: "Kechikish", unit: " ms", color: "var(--accent)" },
  };

  return (
    <div className="min-w-48 rounded-lg border border-border bg-surface p-3 shadow-floating">
      <p className="text-xs font-bold text-muted-strong">{label}</p>
      <div className="mt-2 space-y-2">
        {payload.map((item) => {
          const config = labels[String(item.dataKey)];
          if (!config) return null;

          return (
            <div className="flex items-center justify-between gap-5" key={String(item.dataKey)}>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                <span className="size-2 rounded-full" style={{ backgroundColor: config.color }} />
                {config.label}
              </span>
              <span className="font-mono text-xs font-bold text-foreground">
                {formatInteger(Number(item.value ?? 0))}{config.unit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FeedItem({ item }: { item: MonitoringFeedItem }) {
  const presentation = severityPresentation[item.severity];
  const Icon = presentation.icon;

  return (
    <article className="flex gap-3 py-3.5 first:pt-0 last:pb-0">
      <span className={`grid size-8 shrink-0 place-items-center rounded-md ${presentation.iconClass}`}>
        <Icon className="size-4" strokeWidth={1.9} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[13px] font-bold leading-5 text-foreground">{item.title}</p>
          <span className="shrink-0 pt-0.5 text-[11px] font-medium text-faint">{item.time}</span>
        </div>
        <p className="mt-1 text-xs leading-5 text-muted">{item.detail}</p>
        {item.status && (
          <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
            item.status === "active"
              ? severityPresentation[item.severity].badgeClass
              : "bg-surface-muted text-muted"
          }`}>
            {item.status === "active" ? "Faol" : "Yopilgan"}
          </span>
        )}
      </div>
    </article>
  );
}

function SystemStatus({
  isRunning,
  receivedTotal,
  processedTotal,
  lastUpdated,
}: {
  isRunning: boolean;
  receivedTotal: number;
  processedTotal: number;
  lastUpdated: string;
}) {
  return (
    <section className="mt-5 overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      <div className="grid lg:grid-cols-[minmax(17rem,1.15fr)_repeat(3,minmax(9rem,0.62fr))]">
        <div className="flex items-center gap-3 border-b border-border bg-success-soft/60 px-4 py-4 lg:border-b-0 lg:border-r sm:px-5">
          <span className="relative grid size-11 shrink-0 place-items-center rounded-lg bg-success text-white shadow-sm">
            {isRunning ? (
              <ShieldCheck className="size-5" strokeWidth={2} aria-hidden="true" />
            ) : (
              <Pause className="size-5" strokeWidth={2} aria-hidden="true" />
            )}
            {isRunning && (
              <span className="absolute -right-0.5 -top-0.5 flex size-3">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-40" />
                <span className="relative inline-flex size-3 rounded-full border-2 border-surface bg-success" />
              </span>
            )}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                {isRunning ? "Tizim normal ishlamoqda" : "Demo oqim pauzada"}
              </h2>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                isRunning ? "bg-success text-white" : "bg-warning text-white"
              }`}>
                {isRunning ? "Normal" : "Pauza"}
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-muted">
              4/4 servis faol · oxirgi signal {lastUpdated}
            </p>
          </div>
        </div>

        {[
          { label: "Qabul qilingan", value: formatInteger(receivedTotal), meta: "jami yozuv" },
          { label: "Qayta ishlangan", value: formatInteger(processedTotal), meta: "99.98% bajarildi" },
          { label: "Joriy navbat", value: formatInteger(Math.max(receivedTotal - processedTotal, 0)), meta: "nazorat ostida" },
        ].map((item) => (
          <div className="border-b border-border px-4 py-3.5 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0" key={item.label}>
            <p className="ui-label text-faint">{item.label}</p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <p className="font-mono text-base font-bold text-foreground">{item.value}</p>
              <span className="text-[11px] font-medium text-muted">{item.meta}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LiveChart({ data, isRunning }: { data: StreamPoint[]; isRunning: boolean }) {
  const [range, setRange] = useState<TimeRange>("fifteen");
  const pointCount = rangeOptions.find((option) => option.key === range)?.points ?? 10;
  const visibleData = data.slice(-pointCount);

  return (
    <section className="min-w-0 rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="ui-label text-faint">Jonli telemetriya</p>
            <span className={`size-1.5 rounded-full ${isRunning ? "animate-pulse bg-success" : "bg-warning"}`} />
          </div>
          <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">
            Oqim tezligi va kechikish
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            Qabul qilish, qayta ishlash va javob vaqti bir koordinatada.
          </p>
        </div>
        <div className="flex w-fit gap-1 rounded-md bg-surface-muted p-1" role="group" aria-label="Monitoring davri">
          {rangeOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              className={`h-7 rounded px-2.5 text-xs font-bold transition-colors ${
                range === option.key
                  ? "bg-surface text-foreground shadow-sm ring-1 ring-border"
                  : "text-muted hover:text-foreground"
              }`}
              onClick={() => setRange(option.key)}
              aria-pressed={range === option.key}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-y border-border py-2.5">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
          <span className="size-2 rounded-full bg-primary" /> Qabul qilindi
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
          <span className="size-2 rounded-full bg-chart-5" /> Qayta ishlandi
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
          <span className="size-2 rounded-full bg-accent" /> Kechikish
        </span>
        <span className="ml-auto hidden text-[11px] font-medium text-faint sm:inline">
          Chegara: 500 ms
        </span>
      </div>

      <div className="mt-4 h-[18.5rem] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={visibleData} margin={{ top: 8, right: 0, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="monitoring-throughput" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-5)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="var(--chart-5)" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 5" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              minTickGap={24}
              dy={9}
              tick={{ fill: "var(--muted)", fontSize: 11, fontWeight: 600 }}
            />
            <YAxis
              yAxisId="throughput"
              axisLine={false}
              tickLine={false}
              width={54}
              domain={[1000, 1400]}
              tick={{ fill: "var(--faint)", fontSize: 11, fontWeight: 600 }}
            />
            <YAxis
              yAxisId="latency"
              orientation="right"
              axisLine={false}
              tickLine={false}
              width={46}
              domain={[250, 550]}
              tickFormatter={(value: number) => `${value}`}
              tick={{ fill: "var(--faint)", fontSize: 11, fontWeight: 600 }}
            />
            <Tooltip cursor={{ stroke: "var(--border-strong)", strokeDasharray: "3 4" }} content={<StreamTooltip />} />
            <ReferenceLine
              yAxisId="latency"
              y={500}
              stroke="var(--warning)"
              strokeDasharray="5 5"
              strokeOpacity={0.7}
            />
            <Area
              yAxisId="throughput"
              type="monotone"
              dataKey="processed"
              stroke="var(--chart-5)"
              strokeWidth={2.25}
              fill="url(#monitoring-throughput)"
              dot={false}
              activeDot={{ r: 3.5, strokeWidth: 2, fill: "var(--surface)" }}
              animationDuration={360}
            />
            <Line
              yAxisId="throughput"
              type="monotone"
              dataKey="received"
              stroke="var(--primary)"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              activeDot={{ r: 3.5, strokeWidth: 2, fill: "var(--surface)" }}
              animationDuration={360}
            />
            <Line
              yAxisId="latency"
              type="monotone"
              dataKey="latency"
              stroke="var(--accent)"
              strokeWidth={2.25}
              dot={false}
              activeDot={{ r: 3.5, strokeWidth: 2, fill: "var(--surface)" }}
              animationDuration={360}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function ActivityFeed() {
  const [tab, setTab] = useState<FeedTab>("events");
  const items = tab === "events" ? monitoringEvents : monitoringAlerts;

  return (
    <aside className="flex min-h-0 flex-col rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="ui-label text-faint">Faoliyat markazi</p>
          <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">
            Jonli hodisalar
          </h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-bold text-muted-strong">
          <span className="size-1.5 animate-pulse rounded-full bg-success" />
          Avto
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-1 rounded-md bg-surface-muted p-1" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "events"}
          onClick={() => setTab("events")}
          className={`h-8 rounded text-xs font-bold transition-colors ${
            tab === "events" ? "bg-surface text-foreground shadow-sm ring-1 ring-border" : "text-muted"
          }`}
        >
          Hodisalar
          <span className="ml-1.5 text-[10px] text-faint">{monitoringEvents.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "alerts"}
          onClick={() => setTab("alerts")}
          className={`h-8 rounded text-xs font-bold transition-colors ${
            tab === "alerts" ? "bg-surface text-foreground shadow-sm ring-1 ring-border" : "text-muted"
          }`}
        >
          Alertlar
          <span className="ml-1.5 inline-flex min-w-4 justify-center rounded-full bg-warning-soft px-1 text-[10px] text-warning">
            1
          </span>
        </button>
      </div>

      <div className="mt-4 flex-1 divide-y divide-border" role="tabpanel">
        {items.map((item) => <FeedItem item={item} key={item.id} />)}
      </div>

      {tab === "alerts" && (
        <Link
          href="/qarorlar"
          className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-surface text-[13px] font-bold text-foreground transition-colors hover:bg-surface-muted"
        >
          Tavsiyalarni ko&apos;rish
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      )}
    </aside>
  );
}

function EconomicSignalStrip() {
  return (
    <section className="mt-4 overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      <div className="grid md:grid-cols-[1.15fr_repeat(3,minmax(0,1fr))]">
        <div className="flex items-center gap-3 border-b border-border bg-primary-soft/55 px-4 py-4 md:border-b-0 md:border-r sm:px-5">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-white">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="ui-label text-primary">Biznes telemetriyasi</p>
            <p className="mt-1 text-xs text-muted">Texnik oqimning iqtisodiy natijasi</p>
          </div>
        </div>
        {economicSignals.map((signal) => (
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0" key={signal.label}>
            <div>
              <p className="text-xs font-semibold text-muted">{signal.label}</p>
              <p className="mt-1 font-mono text-base font-bold text-foreground">{signal.value}</p>
            </div>
            <span className="rounded-full bg-success-soft px-2 py-1 font-mono text-[11px] font-bold text-success">
              {signal.change}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PipelineHealth() {
  const icons = [Database, ServerCog, BrainCircuit, CircleGauge];

  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="ui-label text-faint">Pipeline sog&apos;lig&apos;i</p>
          <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">Servislar holati</h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-bold text-success">
          <CheckCircle2 className="size-3" aria-hidden="true" /> 4/4 faol
        </span>
      </div>

      <div className="mt-4 grid overflow-hidden rounded-lg border border-border sm:grid-cols-2 xl:grid-cols-4">
        {pipelineServices.map((service, index) => {
          const Icon = icons[index];
          return (
            <article className="relative border-b border-border p-3.5 last:border-b-0 sm:border-r sm:[&:nth-child(2)]:border-r-0 sm:[&:nth-child(3)]:border-b-0 xl:border-b-0 xl:[&:nth-child(2)]:border-r xl:[&:nth-child(4)]:border-r-0" key={service.name}>
              <div className="flex items-start justify-between gap-2">
                <span className="grid size-8 place-items-center rounded-md bg-surface-subtle text-primary">
                  <Icon className="size-4" strokeWidth={1.9} aria-hidden="true" />
                </span>
                <span className="mt-1 size-2 rounded-full bg-success ring-4 ring-success-soft" title="Faol" />
              </div>
              <h3 className="mt-3 text-[13px] font-bold text-foreground">{service.name}</h3>
              <p className="mt-0.5 text-[11px] font-medium text-muted">{service.detail}</p>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5 text-[11px]">
                <span className="font-mono font-bold text-foreground">{service.latency}</span>
                <span className="font-semibold text-success">{service.availability}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ResourceHealth() {
  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="ui-label text-faint">Infratuzilma</p>
          <h2 className="mt-1 text-base font-bold text-foreground">Resurs yuklamasi</h2>
        </div>
        <span className="grid size-9 place-items-center rounded-lg bg-accent-soft text-accent">
          <Gauge className="size-4" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {resourceUsage.map((resource) => (
          <div key={resource.label}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-muted">{resource.label}</span>
              <span className="font-mono font-bold text-foreground">{resource.value}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-inset">
              <div
                className={`h-full rounded-full ${resourceToneClasses[resource.tone]}`}
                style={{ width: `${resource.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-border pt-3 text-xs leading-5 text-muted">
        <ShieldCheck className="size-4 shrink-0 text-success" aria-hidden="true" />
        Barcha resurslar xavfsiz diapazonda.
      </div>
    </section>
  );
}

export function MonitoringView() {
  const [isRunning, setIsRunning] = useState(true);
  const [streamData, setStreamData] = useState(initialStreamData);
  const [totals, setTotals] = useState({ received: 8_429_420, processed: 8_428_129 });
  const [lastUpdated, setLastUpdated] = useState("20:42:06");
  const tickRef = useRef(0);

  useEffect(() => {
    if (!isRunning) return;

    const interval = window.setInterval(() => {
      tickRef.current += 1;
      const tick = tickRef.current;
      const received = Math.round(1250 + Math.sin(tick * 0.82) * 42 + Math.cos(tick * 0.37) * 18);
      const processed = received - Math.max(4, Math.round(8 + Math.sin(tick * 0.58) * 4));
      const latency = Math.round(420 + Math.sin(tick * 0.66) * 34 + Math.cos(tick * 0.31) * 13);
      const errorRate = Number((0.78 + Math.sin(tick * 0.48) * 0.15).toFixed(2));
      const now = new Date();

      setStreamData((current) => [
        ...current.slice(-14),
        {
          label: formatClock(now),
          received,
          processed,
          latency,
          errorRate,
        },
      ]);
      setTotals((current) => ({
        received: current.received + received * 2,
        processed: current.processed + processed * 2,
      }));
      setLastUpdated(formatClock(now));
    }, 2000);

    return () => window.clearInterval(interval);
  }, [isRunning]);

  const latest = streamData.at(-1) ?? initialStreamData.at(-1)!;
  const metricValues = useMemo(() => {
    const recent = streamData.slice(-8);
    return {
      throughput: recent.map((point) => point.processed),
      latency: recent.map((point) => point.latency),
      errorRate: recent.map((point) => point.errorRate),
      accuracy: [94.1, 94.3, 94.2, 94.5, 94.4, 94.6, 94.7, 94.7],
    };
  }, [streamData]);

  return (
    <div className="mx-auto w-full max-w-7xl pb-2">
      <PageHeader
        eyebrow="Real vaqt nazorati"
        title="Monitoring markazi"
        description="Ma'lumot oqimi, tizim tezligi va muhim ogohlantirishlarni real vaqtga yaqin rejimda boshqaring."
        action={
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-[13px] font-bold shadow-sm ${
              isRunning
                ? "border-success/20 bg-success-soft text-success"
                : "border-warning/20 bg-warning-soft text-warning"
            }`}>
              <span className={`size-2 rounded-full ${isRunning ? "animate-pulse bg-success" : "bg-warning"}`} />
              {isRunning ? "Jonli oqim" : "Pauzada"}
            </span>
            <button
              type="button"
              onClick={() => setIsRunning((current) => !current)}
              className={`inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-[13px] font-bold shadow-sm transition-colors ${
                isRunning
                  ? "border border-border bg-surface text-foreground hover:bg-surface-muted"
                  : "bg-primary text-white hover:bg-primary-hover"
              }`}
              aria-label={isRunning ? "Demo oqimni pauza qilish" : "Demo oqimni davom ettirish"}
            >
              {isRunning ? <Pause className="size-3.5" aria-hidden="true" /> : <Play className="size-3.5" aria-hidden="true" />}
              {isRunning ? "Pauza" : "Davom ettirish"}
            </button>
          </div>
        }
      />

      <DemoNotice
        title="Bu sahifa namoyish rejimida ishlaydi"
        description="Oqim ko'rsatkichlari brauzerda generatsiya qilinadi va bazaga yozilmaydi. Real vaqt manbasi (ERP, IoT yoki ingest API) ulanmagan. Platformaning qolgan sahifalari — dashboard, ma'lumotlar, AI tahlili, iqtisodiy samaradorlik va qarorlar — yuklangan ma'lumotdan haqiqiy hisoblangan raqamlarni ko'rsatadi."
      />

      <SystemStatus
        isRunning={isRunning}
        receivedTotal={totals.received}
        processedTotal={totals.processed}
        lastUpdated={lastUpdated}
      />

      <section className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Real vaqt ko'rsatkichlari">
        <MetricCard
          label="Qayta ishlash tezligi"
          value={`${formatInteger(latest.processed)}/s`}
          detail="Maqsad: 1 000/s dan yuqori"
          badge="Maqsaddan +24%"
          icon={Zap}
          iconClass="bg-primary-soft text-primary"
          values={metricValues.throughput}
          chartColor="var(--primary)"
        />
        <MetricCard
          label="Kechikish"
          value={`${latest.latency} ms`}
          detail="Chegara: 500 ms"
          badge="Me'yor ichida"
          icon={Clock3}
          iconClass="bg-accent-soft text-accent"
          values={metricValues.latency}
          chartColor="var(--accent)"
        />
        <MetricCard
          label="AI aniqligi"
          value="94.7%"
          detail="Model v2.4 · validatsiya"
          badge="+2.1% o'sish"
          icon={BrainCircuit}
          iconClass="bg-info-soft text-info"
          values={metricValues.accuracy}
          chartColor="var(--info)"
        />
        <MetricCard
          label="Xato ulushi"
          value={`${latest.errorRate.toFixed(2)}%`}
          detail="Chegara: 2.0%"
          badge="−0.4% pasaydi"
          icon={TriangleAlert}
          iconClass="bg-warning-soft text-warning"
          values={metricValues.errorRate}
          chartColor="var(--warning)"
        />
      </section>

      <section className="mt-4 grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(20rem,0.75fr)]">
        <LiveChart data={streamData} isRunning={isRunning} />
        <ActivityFeed />
      </section>

      <EconomicSignalStrip />

      <section className="mt-4 grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.55fr)]">
        <PipelineHealth />
        <ResourceHealth />
      </section>

      <div className="mt-4 flex flex-col gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-xs leading-5 text-muted shadow-card sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2">
          <Waypoints className="size-4 shrink-0 text-primary" aria-hidden="true" />
          Demo stream har 2 soniyada yangilanadi; real manba ulanganda shu monitoring oqimi saqlanadi.
        </span>
        <span className="shrink-0 font-mono text-[11px] font-bold text-muted-strong">dataset: demo-stream-v1</span>
      </div>
    </div>
  );
}
