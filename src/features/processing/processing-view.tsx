"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Braces,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  FileText,
  LoaderCircle,
  Play,
  RotateCcw,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import {
  processingDatasets,
  processingStages,
  type ProcessingDataset,
  type ProcessingIssueKey,
} from "@/data/processing";

type ProcessingStatus = "idle" | "processing" | "completed";

const issuePresentation: Record<
  ProcessingIssueKey,
  {
    icon: typeof AlertTriangle;
    iconClass: string;
    barClass: string;
  }
> = {
  missing: {
    icon: AlertTriangle,
    iconClass: "bg-warning-soft text-warning",
    barClass: "bg-warning",
  },
  duplicate: {
    icon: Copy,
    iconClass: "bg-primary-soft text-primary",
    barClass: "bg-primary",
  },
  type: {
    icon: Braces,
    iconClass: "bg-danger-soft text-danger",
    barClass: "bg-danger",
  },
  outlier: {
    icon: ScanSearch,
    iconClass: "bg-accent-soft text-accent",
    barClass: "bg-accent",
  },
};

const severityPresentation = {
  high: { label: "Yuqori", className: "bg-danger-soft text-danger" },
  medium: { label: "O'rta", className: "bg-warning-soft text-warning" },
  low: { label: "Past", className: "bg-info-soft text-info" },
};

function formatNumber(value: number) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getRemainingCount(count: number, status: ProcessingStatus, progress: number) {
  if (status === "completed") return 0;
  if (status === "idle") return count;
  return Math.max(0, Math.ceil(count * (1 - progress / 100)));
}

function DatasetPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedDataset =
    processingDatasets.find((item) => item.id === value) ?? processingDatasets[0];

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={pickerRef} className="relative w-full sm:w-[19rem]">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="group flex h-12 w-full items-center gap-2.5 rounded-lg border border-border bg-surface px-2.5 text-left shadow-sm transition-[border-color,box-shadow,background-color] hover:border-border-strong hover:bg-surface-muted/60 focus-visible:border-primary"
        aria-label={`Datasetni tanlash. Tanlangan: ${selectedDataset.name}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="processing-dataset-options"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary-soft text-primary ring-1 ring-inset ring-primary/10">
          <FileText className="size-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-bold text-foreground">
            {selectedDataset.name}
          </span>
          <span className="mt-0.5 block text-xs font-medium text-muted">
            {selectedDataset.format} · {formatNumber(selectedDataset.rows)} qator
          </span>
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          id="processing-dataset-options"
          role="listbox"
          aria-label="Qayta ishlash uchun datasetlar"
          className="rise-in absolute right-0 top-full z-50 mt-2 w-full min-w-[18rem] overflow-hidden rounded-xl border border-border bg-surface p-1.5 shadow-floating"
        >
          <p className="px-2.5 pb-1.5 pt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-faint">
            Datasetni tanlang
          </p>
          <div className="space-y-1">
            {processingDatasets.map((item) => {
              const isSelected = item.id === value;

              return (
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  key={item.id}
                  onClick={() => {
                    onChange(item.id);
                    setIsOpen(false);
                    triggerRef.current?.focus();
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors ${
                    isSelected ? "bg-primary-soft" : "hover:bg-surface-muted"
                  }`}
                >
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-md border font-mono text-[11px] font-bold ${
                      isSelected
                        ? "border-primary/15 bg-surface text-primary"
                        : "border-border bg-surface-muted text-muted"
                    }`}
                  >
                    {item.format}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold text-foreground">
                      {item.name}
                    </span>
                    <span className="mt-0.5 block text-xs font-medium text-muted">
                      {formatNumber(item.rows)} qator · {item.columns} ustun · {item.initialQuality}% sifat
                    </span>
                  </span>
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-full ${
                      isSelected ? "bg-primary text-white" : "border border-border"
                    }`}
                  >
                    {isSelected && <Check className="size-3" strokeWidth={2.5} aria-hidden="true" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function QualityScore({
  dataset,
  status,
  progress,
}: {
  dataset: ProcessingDataset;
  status: ProcessingStatus;
  progress: number;
}) {
  const score =
    status === "completed"
      ? dataset.finalQuality
      : status === "processing"
        ? Math.round(
            dataset.initialQuality +
              (dataset.finalQuality - dataset.initialQuality) * (progress / 100),
          )
        : dataset.initialQuality;
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative size-36">
      <svg
        className="size-full -rotate-90"
        viewBox="0 0 120 120"
        role="img"
        aria-label={`Ma'lumot sifati ${score} foiz`}
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
          stroke={status === "completed" ? "var(--success)" : "var(--primary)"}
          strokeLinecap="round"
          strokeWidth="9"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset,stroke] duration-300"
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <p className="font-mono text-3xl font-bold tracking-[-0.06em] text-foreground">
          {score}%
        </p>
        <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-faint">
          sifat balli
        </p>
      </div>
    </div>
  );
}

export function ProcessingView() {
  const [datasetId, setDatasetId] = useState(processingDatasets[0].id);
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [progress, setProgress] = useState(0);

  const dataset = useMemo(
    () => processingDatasets.find((item) => item.id === datasetId) ?? processingDatasets[0],
    [datasetId],
  );
  const totalIssueCount = dataset.issues.reduce((total, issue) => total + issue.count, 0);
  const remainingIssueCount = dataset.issues.reduce(
    (total, issue) => total + getRemainingCount(issue.count, status, progress),
    0,
  );
  const currentValidRows =
    status === "completed"
      ? dataset.validRowsAfter
      : status === "processing"
        ? Math.round(
            dataset.validRowsBefore +
              (dataset.validRowsAfter - dataset.validRowsBefore) * (progress / 100),
          )
        : dataset.validRowsBefore;

  useEffect(() => {
    if (status !== "processing") return;

    let currentProgress = 0;
    let completionTimer: number | undefined;
    const interval = window.setInterval(() => {
      currentProgress = Math.min(100, currentProgress + 4);
      setProgress(currentProgress);

      if (currentProgress === 100) {
        window.clearInterval(interval);
        completionTimer = window.setTimeout(() => setStatus("completed"), 280);
      }
    }, 105);

    return () => {
      window.clearInterval(interval);
      if (completionTimer) window.clearTimeout(completionTimer);
    };
  }, [status]);

  function changeDataset(nextDatasetId: string) {
    setDatasetId(nextDatasetId);
    setStatus("idle");
    setProgress(0);
  }

  function startProcessing() {
    setProgress(0);
    setStatus("processing");
  }

  return (
    <div className="mx-auto w-full max-w-6xl pb-2">
      <PageHeader
        eyebrow="Ma'lumot sifati"
        title="Ma'lumotlarni qayta ishlash"
        description="Xatolarni aniqlang, ma'lumotni standartlashtiring va AI tahliliga tayyorlang."
        action={
          <DatasetPicker value={datasetId} onChange={changeDataset} />
        }
      />

      <section className="mt-5 grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_18.5rem]">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {dataset.issues.map((issue) => {
            const presentation = issuePresentation[issue.key];
            const Icon = presentation.icon;
            const remaining = getRemainingCount(issue.count, status, progress);
            const resolvedPercent = Math.round(((issue.count - remaining) / issue.count) * 100);

            return (
              <article className="rounded-lg border border-border bg-surface p-3.5 shadow-card sm:p-4" key={issue.key}>
                <div className="flex items-start justify-between gap-2">
                  <span className={`grid size-8 place-items-center rounded-md ${presentation.iconClass}`}>
                    <Icon className="size-4" strokeWidth={1.9} aria-hidden="true" />
                  </span>
                  {status === "completed" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-1 text-[11px] font-bold text-success">
                      <Check className="size-3" aria-hidden="true" />
                      Tuzatildi
                    </span>
                  ) : (
                    <span className="font-mono text-xs font-bold text-faint">{issue.affected}</span>
                  )}
                </div>

                <div className="mt-3 flex items-end justify-between gap-2">
                  <div>
                    <p className="text-[13px] font-bold text-muted">{issue.label}</p>
                    <p className="mt-1 font-mono text-xl font-bold tracking-[-0.045em] text-foreground sm:text-[1.4rem]">
                      {formatNumber(remaining)}
                    </p>
                  </div>
                  <p className="hidden max-w-28 text-right text-[11px] leading-4 text-faint sm:block">
                    {issue.description}
                  </p>
                </div>

                <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className={`h-full rounded-full transition-[width] duration-300 ${
                      status === "completed" ? "bg-success" : presentation.barClass
                    }`}
                    style={{ width: `${status === "idle" ? 100 : Math.max(2, 100 - resolvedPercent)}%` }}
                  />
                </div>
              </article>
            );
          })}
        </div>

        <aside className="flex flex-col rounded-lg border border-border bg-surface p-5 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="ui-label text-faint">Umumiy holat</p>
              <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">
                Ma&apos;lumot sifati
              </h2>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-[11px] font-bold ${
                status === "completed"
                  ? "bg-success-soft text-success"
                  : status === "processing"
                    ? "bg-primary-soft text-primary"
                    : "bg-warning-soft text-warning"
              }`}
            >
              {status === "completed" ? "Tayyor" : status === "processing" ? "Jarayonda" : "Tekshiruv kerak"}
            </span>
          </div>

          <div className="mt-4 flex justify-center">
            <QualityScore dataset={dataset} status={status} progress={progress} />
          </div>

          <dl className="mt-4 space-y-2.5 border-t border-border pt-4">
            <div className="flex items-center justify-between gap-3 text-xs">
              <dt className="text-muted">Yaroqli qatorlar</dt>
              <dd className="font-mono font-bold text-foreground">{formatNumber(currentValidRows)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs">
              <dt className="text-muted">Qolgan muammolar</dt>
              <dd className="font-mono font-bold text-foreground">{formatNumber(remainingIssueCount)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs">
              <dt className="text-muted">Jami qatorlar</dt>
              <dd className="font-mono font-bold text-foreground">{formatNumber(dataset.rows)}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={startProcessing}
            disabled={status === "processing"}
            className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-3 text-xs font-bold text-white shadow-sm transition-[background-color,transform] hover:bg-primary-hover active:translate-y-px disabled:cursor-not-allowed disabled:opacity-75"
          >
            {status === "processing" ? (
              <>
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                Qayta ishlanmoqda {progress}%
              </>
            ) : status === "completed" ? (
              <>
                <RotateCcw className="size-4" aria-hidden="true" />
                Qayta ishga tushirish
              </>
            ) : (
              <>
                <Play className="size-4" fill="currentColor" aria-hidden="true" />
                Tozalash va qayta ishlash
              </>
            )}
          </button>

          {status === "completed" && (
            <Link
              href="/ai-tahlil"
              className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border-strong bg-surface text-xs font-bold text-foreground transition-colors hover:bg-surface-muted"
            >
              AI tahliliga o&apos;tish
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          )}
        </aside>
      </section>

      <section className="mt-4 grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="ui-label text-faint">Pipeline</p>
              <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">
                Qayta ishlash bosqichlari
              </h2>
            </div>
            <span className="font-mono text-xs font-bold text-primary">
              {status === "idle" ? "Tayyor" : `${progress}%`}
            </span>
          </div>

          <div className="mt-5 space-y-1">
            {processingStages.map((stage, index) => {
              const previousThreshold = index === 0 ? 0 : processingStages[index - 1].threshold;
              const isCompleted = status === "completed" || progress >= stage.threshold;
              const isActive = status === "processing" && progress >= previousThreshold && progress < stage.threshold;

              return (
                <div className="relative flex gap-3 pb-4 last:pb-0" key={stage.label}>
                  {index < processingStages.length - 1 && (
                    <span
                      className={`absolute left-[15px] top-8 h-[calc(100%-1.25rem)] w-px ${
                        isCompleted ? "bg-success/45" : "bg-border"
                      }`}
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full border text-xs font-bold ${
                      isCompleted
                        ? "border-success/25 bg-success-soft text-success"
                        : isActive
                          ? "border-primary/25 bg-primary-soft text-primary"
                          : "border-border bg-surface-muted text-faint"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="size-3.5" aria-hidden="true" />
                    ) : isActive ? (
                      <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className={`text-[13px] font-bold ${isActive ? "text-primary" : "text-foreground"}`}>
                      {stage.label}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-4 text-muted">{stage.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface shadow-card">
          <div className="flex items-center justify-between gap-3 border-b border-border p-4 sm:p-5">
            <div>
              <p className="ui-label text-faint">Aniqlangan muammolar</p>
              <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">
                Tozalash rejasi
              </h2>
            </div>
            <span className="rounded-full bg-surface-muted px-2.5 py-1 font-mono text-[11px] font-bold text-muted-strong">
              {dataset.details.length} turdagi muammo
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-surface-muted/70">
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.07em] text-faint">Maydon</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.07em] text-faint">Muammo</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.07em] text-faint">Soni</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.07em] text-faint">Yechim</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.07em] text-faint">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dataset.details.map((detail) => {
                  const severity = severityPresentation[detail.severity];

                  return (
                    <tr className="transition-colors hover:bg-canvas" key={`${detail.field}-${detail.problem}`}>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-bold text-foreground">
                        {detail.field}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-muted-strong">
                        {detail.problem}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-foreground">
                        {status === "completed"
                          ? 0
                          : getRemainingCount(detail.count, status, progress)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-muted">
                        {detail.solution}
                      </td>
                      <td className="px-4 py-3">
                        {status === "completed" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-1 text-[11px] font-bold text-success">
                            <CheckCircle2 className="size-3" aria-hidden="true" />
                            Tuzatildi
                          </span>
                        ) : (
                          <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${severity.className}`}>
                            {severity.label}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {status === "completed" && (
        <section className="mt-4 overflow-hidden rounded-lg border border-success/20 bg-success-soft/40 shadow-card">
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-success text-white shadow-sm">
                <Sparkles className="size-[18px]" aria-hidden="true" />
              </span>
              <div>
                <p className="ui-label text-success">Qayta ishlash yakunlandi</p>
                <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">
                  Dataset AI tahliliga tayyor
                </h2>
                <p className="mt-1 text-xs leading-5 text-muted">
                  {formatNumber(totalIssueCount)} ta muammo ko&apos;rib chiqildi, sifat balli {dataset.initialQuality}% dan {dataset.finalQuality}% ga oshdi.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:min-w-[22rem]">
              {[
                { label: "Sifat", before: `${dataset.initialQuality}%`, after: `${dataset.finalQuality}%` },
                { label: "Yaroqli qator", before: formatNumber(dataset.validRowsBefore), after: formatNumber(dataset.validRowsAfter) },
                { label: "Muammolar", before: formatNumber(totalIssueCount), after: "0" },
              ].map((item) => (
                <div className="rounded-md border border-success/15 bg-surface/80 p-2.5" key={item.label}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-faint">{item.label}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="font-mono text-[11px] font-bold text-faint line-through">{item.before}</span>
                    <ArrowRight className="size-3 text-success" aria-hidden="true" />
                    <span className="font-mono text-[13px] font-bold text-success">{item.after}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-[11px] leading-5 text-muted shadow-card">
        <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
        Tozalash qoidalari demo rejimida ishlaydi. Real manba ulanganda barcha o&apos;zgarishlar audit jurnalida saqlanadi.
      </div>
    </div>
  );
}
