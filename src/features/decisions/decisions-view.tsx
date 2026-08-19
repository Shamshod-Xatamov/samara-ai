"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CalendarCheck2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Eye,
  Gauge,
  Layers3,
  Lightbulb,
  ListChecks,
  MoveDownRight,
  Sparkles,
  Target,
  TrendingUp,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import {
  decisionRecommendations,
  type DecisionPriority,
  type DecisionRecommendation,
  type DecisionStatus,
} from "@/data/decisions";

type DecisionFilter = "all" | DecisionStatus;

const priorityStyles: Record<
  DecisionPriority,
  {
    label: string;
    badgeClass: string;
    iconClass: string;
    borderClass: string;
    icon: LucideIcon;
  }
> = {
  critical: {
    label: "Kritik",
    badgeClass: "bg-danger-soft text-danger",
    iconClass: "bg-danger-soft text-danger",
    borderClass: "bg-danger",
    icon: TriangleAlert,
  },
  high: {
    label: "Yuqori",
    badgeClass: "bg-warning-soft text-warning",
    iconClass: "bg-warning-soft text-warning",
    borderClass: "bg-warning",
    icon: AlertTriangle,
  },
  medium: {
    label: "O'rta",
    badgeClass: "bg-info-soft text-info",
    iconClass: "bg-info-soft text-info",
    borderClass: "bg-info",
    icon: Eye,
  },
};

const statusStyles: Record<
  DecisionStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  new: {
    label: "Yangi",
    badgeClass: "bg-primary-soft text-primary",
    dotClass: "bg-primary",
  },
  reviewed: {
    label: "Ko'rib chiqildi",
    badgeClass: "bg-accent-soft text-accent",
    dotClass: "bg-accent",
  },
  planned: {
    label: "Rejaga qo'shildi",
    badgeClass: "bg-success-soft text-success",
    dotClass: "bg-success",
  },
};

const filterOptions: Array<{ key: DecisionFilter; label: string }> = [
  { key: "all", label: "Barchasi" },
  { key: "new", label: "Yangi" },
  { key: "reviewed", label: "Ko'rib chiqildi" },
  { key: "planned", label: "Rejada" },
];

function SummaryCard({
  label,
  value,
  detail,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  iconClass: string;
}) {
  return (
    <article className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3.5 shadow-card">
      <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${iconClass}`}>
        <Icon className="size-[1.1rem]" strokeWidth={1.9} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-muted">{label}</p>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p className="font-mono text-lg font-bold leading-none text-foreground">{value}</p>
          <span className="text-[11px] font-medium text-faint">{detail}</span>
        </div>
      </div>
    </article>
  );
}

function DecisionListItem({
  decision,
  status,
  selected,
  onSelect,
}: {
  decision: DecisionRecommendation;
  status: DecisionStatus;
  selected: boolean;
  onSelect: () => void;
}) {
  const priority = priorityStyles[decision.priority];
  const PriorityIcon = priority.icon;
  const statusStyle = statusStyles[status];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative w-full overflow-hidden rounded-lg border p-4 text-left transition-all ${
        selected
          ? "border-primary/35 bg-primary-soft/60 shadow-sm ring-1 ring-primary/10"
          : "border-border bg-surface hover:border-border-strong hover:bg-surface-muted/45"
      }`}
      aria-pressed={selected}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${priority.borderClass}`} aria-hidden="true" />
      <div className="flex items-start gap-3">
        <span className={`grid size-8 shrink-0 place-items-center rounded-md ${priority.iconClass}`}>
          <PriorityIcon className="size-4" strokeWidth={1.9} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="font-mono text-[11px] font-bold text-faint">{decision.code}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${priority.badgeClass}`}>
                {priority.label}
              </span>
            </div>
            <ChevronRight
              className={`size-4 shrink-0 transition-transform ${
                selected ? "translate-x-0.5 text-primary" : "text-faint group-hover:translate-x-0.5"
              }`}
              aria-hidden="true"
            />
          </div>

          <h3 className="mt-2 text-[13px] font-bold leading-5 text-foreground">{decision.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{decision.summary}</p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/80 pt-2.5">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusStyle.badgeClass}`}>
              <span className={`size-1.5 rounded-full ${statusStyle.dotClass}`} />
              {statusStyle.label}
            </span>
            <span className="text-[11px] font-medium text-faint">{decision.createdAt}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function MetricComparison({ decision }: { decision: DecisionRecommendation }) {
  const changeClass =
    decision.priority === "critical"
      ? "bg-danger-soft/50 text-danger"
      : decision.priority === "high"
        ? "bg-warning-soft/60 text-warning"
        : "bg-info-soft/60 text-info";

  return (
    <div className="mt-5 grid overflow-hidden rounded-lg border border-border sm:grid-cols-3">
      <div className="border-b border-border bg-surface-muted/55 px-4 py-3 sm:border-b-0 sm:border-r">
        <p className="ui-label text-faint">Joriy qiymat</p>
        <p className="mt-1.5 font-mono text-base font-bold text-foreground">{decision.currentValue}</p>
      </div>
      <div className="border-b border-border px-4 py-3 sm:border-b-0 sm:border-r">
        <p className="ui-label text-faint">Me&apos;yor</p>
        <p className="mt-1.5 font-mono text-base font-bold text-muted-strong">{decision.benchmark}</p>
      </div>
      <div className={`px-4 py-3 ${changeClass}`}>
        <p className="ui-label opacity-70">Farq</p>
        <p className="mt-1.5 font-mono text-base font-bold">{decision.change}</p>
      </div>
    </div>
  );
}

function FactorAnalysis({ decision }: { decision: DecisionRecommendation }) {
  return (
    <section className="border-t border-border px-4 py-5 sm:px-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="ui-label text-faint">AI tahlili</p>
          <h3 className="mt-1 text-sm font-bold text-foreground">Asosiy ehtimoliy omillar</h3>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary">
          <BadgeCheck className="size-3.5" aria-hidden="true" />
          {decision.confidence}% ishonch
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {decision.factors.map((factor, index) => (
          <article className="rounded-lg border border-border bg-surface-muted/50 p-3" key={factor.label}>
            <div className="flex items-center justify-between gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-surface font-mono text-[10px] font-bold text-primary ring-1 ring-border">
                {index + 1}
              </span>
              <span className="font-mono text-xs font-bold text-warning">{factor.change}</span>
            </div>
            <p className="mt-3 text-xs font-semibold leading-5 text-muted-strong">{factor.label}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-inset">
              <div className="h-full rounded-full bg-primary" style={{ width: `${factor.contribution}%` }} />
            </div>
            <p className="mt-1.5 text-[11px] font-medium text-faint">Ta&apos;sir ulushi: {factor.contribution}%</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function RecommendationBlock({ decision }: { decision: DecisionRecommendation }) {
  return (
    <section className="border-t border-border px-4 py-5 sm:px-5">
      <div className="relative overflow-hidden rounded-lg border border-primary/15 bg-primary-soft p-4 sm:p-5">
        <div className="absolute -right-8 -top-8 size-28 rounded-full bg-primary/5" aria-hidden="true" />
        <div className="relative flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-white shadow-sm">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="ui-label text-primary">Tavsiya qilingan harakat</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-foreground">{decision.recommendation}</p>
            <div className="mt-3 flex gap-2 rounded-md border border-primary/10 bg-surface/70 p-3">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <p className="text-xs leading-5 text-muted-strong">{decision.rationale}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ExpectedEffects({ decision }: { decision: DecisionRecommendation }) {
  return (
    <section className="border-t border-border px-4 py-5 sm:px-5">
      <p className="ui-label text-faint">Kutilayotgan iqtisodiy ta&apos;sir</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {decision.effects.map((effect) => {
          const normalizedLabel = effect.label.toLowerCase();
          const Icon =
            normalizedLabel.includes("vaqt") ||
            normalizedLabel.includes("kechikish") ||
            normalizedLabel.includes("davr")
              ? Clock3
              : normalizedLabel.includes("xarajat") || normalizedLabel.includes("qiymat")
                ? CircleDollarSign
                : TrendingUp;
          return (
            <article className="rounded-lg border border-success/15 bg-success-soft/60 p-3.5" key={effect.label}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-muted">{effect.label}</p>
                  <p className="mt-2 font-mono text-lg font-bold leading-none text-foreground">{effect.value}</p>
                </div>
                <Icon className="size-4 shrink-0 text-success" strokeWidth={1.9} aria-hidden="true" />
              </div>
              <p className="mt-2 text-[11px] font-medium text-success">{effect.detail}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ActionPlan({ decision }: { decision: DecisionRecommendation }) {
  return (
    <section className="border-t border-border px-4 py-5 sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="ui-label text-faint">Amalga oshirish</p>
          <h3 className="mt-1 text-sm font-bold text-foreground">Tavsiya etilgan reja</h3>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted">
          <ListChecks className="size-3.5 text-primary" aria-hidden="true" />
          {decision.steps.length} bosqich
        </span>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-border">
        {decision.steps.map((step, index) => (
          <div className="grid gap-2 border-b border-border px-3.5 py-3 last:border-b-0 sm:grid-cols-[2rem_minmax(0,1fr)_8rem_4.5rem] sm:items-center" key={step.title}>
            <span className="grid size-7 place-items-center rounded-full bg-primary-soft font-mono text-[11px] font-bold text-primary">
              {index + 1}
            </span>
            <p className="text-xs font-semibold leading-5 text-foreground">{step.title}</p>
            <span className="text-xs font-medium text-muted">{step.owner}</span>
            <span className="font-mono text-[11px] font-bold text-muted-strong sm:text-right">{step.duration}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function DecisionDetail({
  decision,
  status,
  feedback,
  onStatusChange,
}: {
  decision: DecisionRecommendation;
  status: DecisionStatus;
  feedback: string;
  onStatusChange: (status: DecisionStatus) => void;
}) {
  const priority = priorityStyles[decision.priority];
  const PriorityIcon = priority.icon;
  const statusStyle = statusStyles[status];

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      <header className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${priority.iconClass}`}>
              <PriorityIcon className="size-[1.1rem]" strokeWidth={1.9} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-faint">{decision.code}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${priority.badgeClass}`}>
                  {priority.label} muhimlik
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusStyle.badgeClass}`}>
                  <span className={`size-1.5 rounded-full ${statusStyle.dotClass}`} />
                  {statusStyle.label}
                </span>
              </div>
              <h2 className="mt-2 text-lg font-bold leading-7 tracking-[-0.025em] text-foreground">{decision.title}</h2>
              <p className="mt-1 text-xs font-medium text-muted">{decision.createdAt}</p>
            </div>
          </div>

          <Link
            href={decision.sourceHref}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 self-start rounded-md border border-border bg-surface px-2.5 text-xs font-bold text-muted-strong transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            Manba: {decision.source}
            <ArrowRight className="size-3" aria-hidden="true" />
          </Link>
        </div>

        <MetricComparison decision={decision} />

        <div className="mt-4">
          <p className="ui-label text-faint">Muammo tavsifi</p>
          <p className="mt-2 text-[13px] leading-6 text-muted-strong">{decision.problem}</p>
        </div>
      </header>

      <FactorAnalysis decision={decision} />
      <RecommendationBlock decision={decision} />
      <ExpectedEffects decision={decision} />
      <ActionPlan decision={decision} />

      <footer className="border-t border-border bg-surface-muted/45 p-4 sm:p-5">
        {feedback && (
          <div className="mb-3 flex items-center gap-2 rounded-md border border-success/15 bg-success-soft px-3 py-2 text-xs font-semibold text-success" role="status">
            <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
            {feedback}
          </div>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => onStatusChange("reviewed")}
            disabled={status !== "new"}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-surface px-3.5 text-[13px] font-bold text-foreground transition-colors hover:bg-surface-muted disabled:opacity-55"
          >
            <Check className="size-3.5" aria-hidden="true" />
            {status === "new" ? "Ko'rib chiqildi" : "Ko'rib chiqilgan"}
          </button>
          <button
            type="button"
            onClick={() => onStatusChange("planned")}
            disabled={status === "planned"}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-55"
          >
            <CalendarCheck2 className="size-3.5" aria-hidden="true" />
            {status === "planned" ? "Rejaga qo'shilgan" : "Rejaga qo'shish"}
          </button>
        </div>
      </footer>
    </article>
  );
}

export function DecisionsView() {
  const [filter, setFilter] = useState<DecisionFilter>("all");
  const [selectedId, setSelectedId] = useState(decisionRecommendations[0].id);
  const [statuses, setStatuses] = useState<Record<string, DecisionStatus>>(() =>
    Object.fromEntries(decisionRecommendations.map((decision) => [decision.id, decision.status])),
  );
  const [feedback, setFeedback] = useState("");

  const counts = useMemo(() => {
    const values = Object.values(statuses);
    return {
      all: values.length,
      new: values.filter((status) => status === "new").length,
      reviewed: values.filter((status) => status === "reviewed").length,
      planned: values.filter((status) => status === "planned").length,
    };
  }, [statuses]);

  const visibleDecisions = decisionRecommendations.filter(
    (decision) => filter === "all" || statuses[decision.id] === filter,
  );
  const selectedDecision =
    decisionRecommendations.find((decision) => decision.id === selectedId) ?? decisionRecommendations[0];

  function handleFilterChange(nextFilter: DecisionFilter) {
    setFilter(nextFilter);
    setFeedback("");
    const firstMatch = decisionRecommendations.find(
      (decision) => nextFilter === "all" || statuses[decision.id] === nextFilter,
    );
    if (firstMatch) setSelectedId(firstMatch.id);
  }

  function handleDecisionSelect(id: string) {
    setSelectedId(id);
    setFeedback("");
  }

  function handleStatusChange(nextStatus: DecisionStatus) {
    setStatuses((current) => ({ ...current, [selectedDecision.id]: nextStatus }));
    setFeedback(
      nextStatus === "planned"
        ? "Tavsiya amalga oshirish rejasiga qo'shildi."
        : "Tavsiya ko'rib chiqilgan deb belgilandi.",
    );
    if (filter !== "all") setFilter("all");
  }

  return (
    <div className="mx-auto w-full max-w-7xl pb-2">
      <PageHeader
        eyebrow="Boshqaruv signallari"
        title="Qarorlar markazi"
        description="Monitoring va AI natijalarini ustuvor, o'lchanadigan boshqaruv harakatlariga aylantiring."
        action={
          <div className="inline-flex h-9 items-center gap-2 rounded-lg border border-primary/15 bg-primary-soft px-3 text-[13px] font-bold text-primary shadow-sm">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {counts.new} ta yangi tavsiya
          </div>
        }
      />

      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Qarorlar umumiy ko'rsatkichlari">
        <SummaryCard
          label="Faol tavsiyalar"
          value={String(counts.new + counts.reviewed)}
          detail="ko'rib chiqish uchun"
          icon={Lightbulb}
          iconClass="bg-primary-soft text-primary"
        />
        <SummaryCard
          label="Kritik signal"
          value="1"
          detail="tezkor qaror kerak"
          icon={TriangleAlert}
          iconClass="bg-danger-soft text-danger"
        />
        <SummaryCard
          label="Kutilayotgan tejam"
          value="21.4 mln"
          detail="so'm / oy"
          icon={CircleDollarSign}
          iconClass="bg-success-soft text-success"
        />
        <SummaryCard
          label="Potensial vaqt tejash"
          value="37.4 soat"
          detail="haftasiga"
          icon={Clock3}
          iconClass="bg-accent-soft text-accent"
        />
      </section>

      <div className="mt-4 flex items-center justify-between gap-3 overflow-x-auto rounded-lg border border-border bg-surface p-1.5 shadow-card">
        <div className="flex min-w-max gap-1" role="tablist" aria-label="Qarorlar holati">
          {filterOptions.map((option) => {
            const active = filter === option.key;
            return (
              <button
                type="button"
                role="tab"
                aria-selected={active}
                key={option.key}
                onClick={() => handleFilterChange(option.key)}
                className={`inline-flex h-8 items-center gap-2 rounded-md px-3 text-xs font-bold transition-colors ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:bg-surface-muted hover:text-foreground"
                }`}
              >
                {option.label}
                <span className={`min-w-5 rounded-full px-1.5 py-0.5 text-[10px] ${
                  active ? "bg-white/15 text-white" : "bg-surface-muted text-faint"
                }`}>
                  {counts[option.key]}
                </span>
              </button>
            );
          })}
        </div>
        <span className="hidden shrink-0 items-center gap-1.5 pr-2 text-[11px] font-semibold text-faint md:inline-flex">
          <Target className="size-3.5" aria-hidden="true" />
          Muhimlik bo&apos;yicha tartiblangan
        </span>
      </div>

      <section className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(18rem,0.68fr)_minmax(0,1.32fr)]">
        <aside className="rounded-lg border border-border bg-surface p-3 shadow-card">
          <div className="flex items-center justify-between gap-3 px-1 pb-3">
            <div>
              <p className="ui-label text-faint">Qarorlar navbati</p>
              <p className="mt-1 text-xs text-muted">{visibleDecisions.length} ta natija</p>
            </div>
            <span className="grid size-8 place-items-center rounded-md bg-surface-muted text-muted-strong">
              <Layers3 className="size-4" aria-hidden="true" />
            </span>
          </div>

          {visibleDecisions.length > 0 ? (
            <div className="space-y-2.5">
              {visibleDecisions.map((decision) => (
                <DecisionListItem
                  key={decision.id}
                  decision={decision}
                  status={statuses[decision.id]}
                  selected={selectedDecision.id === decision.id}
                  onSelect={() => handleDecisionSelect(decision.id)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border-strong px-4 py-10 text-center">
              <CheckCircle2 className="mx-auto size-6 text-success" aria-hidden="true" />
              <p className="mt-2 text-sm font-bold text-foreground">Bu holatda tavsiya yo&apos;q</p>
              <p className="mt-1 text-xs text-muted">Boshqa filtrni tanlang.</p>
            </div>
          )}
        </aside>

        <DecisionDetail
          decision={selectedDecision}
          status={statuses[selectedDecision.id]}
          feedback={feedback}
          onStatusChange={handleStatusChange}
        />
      </section>

      <div className="mt-4 flex flex-col gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-xs leading-5 text-muted shadow-card sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2">
          <Gauge className="size-4 shrink-0 text-primary" aria-hidden="true" />
          Iqtisodiy ta&apos;sir qiymatlari demo model natijasi; real formula metodologiya tasdiqlangach ulanadi.
        </span>
        <Link href="/iqtisodiy-samaradorlik" className="inline-flex shrink-0 items-center gap-1 font-bold text-primary hover:text-primary-hover">
          Ssenariy tahlili
          <MoveDownRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
