"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Info,
  Lightbulb,
  LoaderCircle,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { formatDate } from "@/lib/format";
import {
  generateDecisions,
  getDecisions,
  updateDecision,
  type DecisionItem,
} from "@/services/ai";

type StatusFilter = "all" | DecisionItem["status"];

const priorityStyles: Record<
  DecisionItem["priority"],
  { label: string; badge: string; border: string }
> = {
  CRITICAL: {
    label: "Kritik",
    badge: "bg-danger-soft text-danger",
    border: "border-danger/30",
  },
  HIGH: {
    label: "Yuqori",
    badge: "bg-warning-soft text-warning",
    border: "border-warning/30",
  },
  MEDIUM: {
    label: "O'rta",
    badge: "bg-info-soft text-info",
    border: "border-info/30",
  },
};

const statusStyles: Record<DecisionItem["status"], { label: string; badge: string }> = {
  NEW: { label: "Yangi", badge: "bg-primary-soft text-primary" },
  REVIEWED: { label: "Ko'rib chiqilgan", badge: "bg-success-soft text-success" },
  PLANNED: { label: "Rejalashtirilgan", badge: "bg-accent-soft text-accent" },
};

export function DecisionsView() {
  const [decisions, setDecisions] = useState<DecisionItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [feedbackDraft, setFeedbackDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    const response = await getDecisions();
    setIsLoading(false);

    if (!response.ok) {
      setError(response.message);
      return;
    }

    setError("");
    setDecisions(response.data);
    setSelectedId((current) => current ?? response.data[0]?.id ?? null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void getDecisions().then((response) => {
      if (cancelled) return;

      setIsLoading(false);

      if (!response.ok) {
        setError(response.message);
        return;
      }

      setError("");
      setDecisions(response.data);
      setSelectedId(response.data[0]?.id ?? null);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const selected = decisions.find((item) => item.id === selectedId) ?? null;

  /** Tanlov o'zgarganda izoh maydoni shu qarorning izohini ko'rsatadi. */
  function selectDecision(id: string) {
    setSelectedId(id);
    setFeedbackDraft(decisions.find((item) => item.id === id)?.feedback ?? "");
  }

  async function handleGenerate() {
    setIsGenerating(true);
    setError("");
    setNotice("");

    const response = await generateDecisions();
    setIsGenerating(false);

    if (!response.ok) {
      setError(response.message);
      return;
    }

    setNotice(response.data.message);
    await load();

    if (response.data.created.length > 0) {
      setSelectedId(response.data.created[0].id);
      setFeedbackDraft("");
    }
  }

  async function handleStatus(status: DecisionItem["status"]) {
    if (!selected) return;

    setIsSaving(true);
    const response = await updateDecision(selected.id, {
      status,
      feedback: feedbackDraft.trim() || null,
    });
    setIsSaving(false);

    if (!response.ok) {
      setError(response.message);
      return;
    }

    setDecisions((current) =>
      current.map((item) =>
        item.id === selected.id
          ? {
              ...item,
              status: response.data.status as DecisionItem["status"],
              feedback: response.data.feedback,
              reviewedAt: response.data.reviewedAt,
            }
          : item,
      ),
    );
    setNotice("Holat saqlandi.");
  }

  const filtered =
    filter === "all" ? decisions : decisions.filter((item) => item.status === filter);

  const counts = decisions.reduce<Record<string, number>>((totals, item) => {
    totals[item.status] = (totals[item.status] ?? 0) + 1;
    return totals;
  }, {});

  if (isLoading) {
    return (
      <div className="mx-auto grid min-h-64 w-full max-w-6xl place-content-center text-center">
        <LoaderCircle className="mx-auto size-6 animate-spin text-primary" aria-hidden="true" />
        <p className="mt-3 text-xs font-medium text-muted">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl pb-2">
      <PageHeader
        eyebrow="Boshqaruv"
        title="Qarorlarni qo'llab-quvvatlash"
        description="Aniqlangan muammolar, tavsiya qilingan harakatlar va kutilayotgan iqtisodiy ta'sir."
        action={
          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={isGenerating}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3.5 text-[13px] font-bold text-white shadow-sm transition-[background-color,transform] hover:bg-primary-hover active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? (
              <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="size-3.5" aria-hidden="true" />
            )}
            {isGenerating ? "Tayyorlanmoqda..." : "AI bilan tayyorlash"}
          </button>
        }
      />

      {error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-md border border-danger/20 bg-danger-soft px-3.5 py-3" role="alert">
          <AlertTriangle className="mt-px size-[18px] shrink-0 text-danger" aria-hidden="true" />
          <p className="text-sm font-medium leading-5 text-danger">{error}</p>
        </div>
      )}

      {notice && !error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-md border border-success/20 bg-success-soft px-3.5 py-3">
          <CheckCircle2 className="mt-px size-[18px] shrink-0 text-success" aria-hidden="true" />
          <p className="text-sm font-medium leading-5 text-success">{notice}</p>
        </div>
      )}

      {decisions.length === 0 ? (
        <div className="mt-6 grid min-h-56 place-content-center rounded-lg border border-dashed border-border-strong bg-surface p-8 text-center shadow-card">
          <Lightbulb className="mx-auto size-7 text-faint" aria-hidden="true" />
          <h2 className="mt-4 text-sm font-bold text-foreground">Hali qaror tavsiyasi yo&apos;q</h2>
          <p className="mt-1.5 max-w-md text-[13px] leading-5 text-muted">
            Tavsiyalar aniqlangan anomaliyalardan tayyorlanadi. Avval AI tahlili
            sahifasida anomaliyalarni tekshiring, so&apos;ng shu yerda
            &laquo;AI bilan tayyorlash&raquo; tugmasini bosing.
          </p>
          <Link
            href="/ai-tahlil"
            className="mx-auto mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-surface px-3.5 text-xs font-bold text-foreground shadow-sm transition-colors hover:bg-canvas"
          >
            AI tahliliga o&apos;tish
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-5 flex gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-1.5 shadow-card">
            {(["all", "NEW", "REVIEWED", "PLANNED"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                aria-pressed={filter === key}
                className={`h-8 shrink-0 rounded-md px-3 text-[13px] font-bold transition-colors ${
                  filter === key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted hover:bg-surface-muted hover:text-foreground"
                }`}
              >
                {key === "all"
                  ? `Barchasi ${decisions.length}`
                  : `${statusStyles[key].label} ${counts[key] ?? 0}`}
              </button>
            ))}
          </div>

          <section className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-[21rem_minmax(0,1fr)]">
            <div className="max-h-[34rem] overflow-y-auto rounded-lg border border-border bg-surface p-2 shadow-card">
              <div className="space-y-1">
                {filtered.map((item) => {
                  const priority = priorityStyles[item.priority];
                  const isSelected = item.id === selectedId;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectDecision(item.id)}
                      aria-pressed={isSelected}
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${
                        isSelected
                          ? "border-primary/30 bg-primary-soft/65"
                          : "border-transparent hover:bg-canvas"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] font-bold text-muted">
                          {item.code}
                        </span>
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${priority.badge}`}>
                          {priority.label}
                        </span>
                      </span>
                      <span className="mt-1.5 block text-xs font-bold leading-4 text-foreground">
                        {item.title}
                      </span>
                      <span className="mt-1.5 flex items-center gap-2 text-[11px] font-medium text-muted">
                        <span className={`rounded px-1.5 py-0.5 font-bold ${statusStyles[item.status].badge}`}>
                          {statusStyles[item.status].label}
                        </span>
                        <span>{formatDate(item.createdAt)}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selected && (
              <div className="min-w-0 space-y-4">
                <div className={`rounded-lg border bg-surface p-4 shadow-card sm:p-5 ${priorityStyles[selected.priority].border}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-muted">
                          {selected.code}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${priorityStyles[selected.priority].badge}`}>
                          {priorityStyles[selected.priority].label}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${statusStyles[selected.status].badge}`}>
                          {statusStyles[selected.status].label}
                        </span>
                      </div>
                      <h2 className="mt-2 text-base font-bold tracking-[-0.02em] text-foreground">
                        {selected.title}
                      </h2>
                      <p className="mt-1 text-[13px] leading-5 text-muted">{selected.summary}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="font-mono text-2xl font-bold tracking-[-0.05em] text-primary">
                        {selected.confidence}%
                      </p>
                      <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-faint">
                        ishonch
                      </p>
                    </div>
                  </div>

                  {selected.anomaly && (
                    <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-4">
                      {[
                        { label: "Ko'rsatkich", value: selected.anomaly.metricLabel },
                        { label: "Sana", value: selected.anomaly.date },
                        {
                          label: "Kuzatilgan",
                          value: `${selected.anomaly.observed} ${selected.anomaly.unit}`,
                        },
                        {
                          label: "Og'ish",
                          value: `${selected.anomaly.deviationPct > 0 ? "+" : ""}${selected.anomaly.deviationPct.toFixed(1)}%`,
                        },
                      ].map((item) => (
                        <div className="rounded-md border border-border bg-canvas p-2.5" key={item.label}>
                          <dt className="text-[11px] font-bold uppercase tracking-[0.06em] text-faint">
                            {item.label}
                          </dt>
                          <dd className="mt-1 truncate text-xs font-bold text-foreground" title={item.value}>
                            {item.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>

                <div className="rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5">
                  <p className="ui-label flex items-center gap-1.5 text-faint">
                    <AlertTriangle className="size-3.5" aria-hidden="true" />
                    Muammo
                  </p>
                  <p className="mt-2 text-[13px] leading-5 text-muted-strong">
                    {selected.payload.problem}
                  </p>

                  <div className="mt-4 space-y-2.5 border-t border-border pt-4">
                    <p className="text-xs font-bold text-muted-strong">Hissa qo&apos;shgan omillar</p>
                    {selected.payload.factors.map((factor) => (
                      <div key={factor.label}>
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="text-muted-strong">{factor.label}</span>
                          <span className="font-mono font-bold text-foreground">
                            {factor.change} · {factor.contribution}%
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${factor.contribution}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-primary/15 bg-primary-soft p-4 shadow-card sm:p-5">
                  <p className="ui-label flex items-center gap-1.5 text-primary">
                    <Target className="size-3.5" aria-hidden="true" />
                    Tavsiya qilingan harakat
                  </p>
                  <p className="mt-2 text-[13px] font-medium leading-5 text-foreground">
                    {selected.payload.recommendation}
                  </p>
                  <p className="mt-2 text-[13px] leading-5 text-muted-strong">
                    {selected.payload.rationale}
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {selected.payload.effects.map((effect) => (
                      <div className="rounded-md border border-primary/10 bg-surface/75 p-3" key={effect.label}>
                        <p className="flex items-center gap-1.5 text-[11px] font-bold text-muted-strong">
                          <TrendingUp className="size-3 text-primary" aria-hidden="true" />
                          {effect.label}
                        </p>
                        <p className="mt-1.5 font-mono text-sm font-bold text-foreground">
                          {effect.value}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-4 text-muted">{effect.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5">
                  <p className="ui-label flex items-center gap-1.5 text-faint">
                    <ClipboardList className="size-3.5" aria-hidden="true" />
                    Amalga oshirish qadamlari
                  </p>

                  <div className="mt-3 space-y-1">
                    {selected.payload.steps.map((step, index) => (
                      <div className="relative flex gap-3 pb-4 last:pb-0" key={step.title}>
                        {index < selected.payload.steps.length - 1 && (
                          <span
                            className="absolute left-[15px] top-8 h-[calc(100%-1.25rem)] w-px bg-border"
                            aria-hidden="true"
                          />
                        )}
                        <span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-full border border-border bg-surface-muted text-xs font-bold text-muted-strong">
                          {index + 1}
                        </span>
                        <div className="min-w-0 pt-0.5">
                          <p className="text-[13px] font-bold text-foreground">{step.title}</p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[11px] font-medium text-muted">
                            <span className="inline-flex items-center gap-1">
                              <Users className="size-3" aria-hidden="true" />
                              {step.owner}
                            </span>
                            <span>{step.duration}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5">
                  <p className="ui-label text-faint">Qaror holati</p>

                  <label className="mt-3 block">
                    <span className="text-xs font-bold text-muted-strong">Izoh</span>
                    <textarea
                      value={feedbackDraft}
                      onChange={(event) => setFeedbackDraft(event.target.value)}
                      rows={3}
                      placeholder="Qaror bo'yicha izohingizni yozing"
                      className="mt-1.5 w-full rounded-md border border-border bg-canvas px-3 py-2 text-[13px] text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-faint focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                  </label>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void handleStatus("REVIEWED")}
                      disabled={isSaving}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-surface px-3 text-xs font-bold text-foreground shadow-sm transition-colors hover:border-border-strong hover:bg-canvas disabled:opacity-60"
                    >
                      <CheckCircle2 className="size-3.5" aria-hidden="true" />
                      Ko&apos;rib chiqildi
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleStatus("PLANNED")}
                      disabled={isSaving}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-60"
                    >
                      <ClipboardList className="size-3.5" aria-hidden="true" />
                      Rejaga kiritish
                    </button>
                  </div>

                  {selected.reviewedAt && (
                    <p className="mt-3 text-[11px] text-faint">
                      Oxirgi o&apos;zgarish: {formatDate(selected.reviewedAt)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>
        </>
      )}

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-xs leading-5 text-muted shadow-card">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <span>
          Tavsiyalar statistik usul bilan aniqlangan anomaliyalar va korxonaning
          joriy iqtisodiy ko&apos;rsatkichlari asosida tayyorlanadi. Muammoni AI
          topmaydi — u topilgan muammoga harakat rejasini tuzadi.
        </span>
      </div>
    </div>
  );
}
