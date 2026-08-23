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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import {
  cleanDataset,
  getDataset,
  listDatasets,
  type CleaningResult,
  type DatasetDetail,
  type DatasetIssue,
  type DatasetSummary,
} from "@/services/datasets";

type ProcessingStatus = "idle" | "processing" | "completed";
type IssueKey = DatasetIssue["issueType"];

const ISSUE_ORDER: IssueKey[] = ["MISSING", "DUPLICATE", "TYPE_ERROR", "OUTLIER"];

const issuePresentation: Record<
  IssueKey,
  {
    label: string;
    description: string;
    icon: typeof AlertTriangle;
    iconClass: string;
    barClass: string;
  }
> = {
  MISSING: {
    label: "Bo'sh qiymatlar",
    description: "To'ldirilmagan kataklar",
    icon: AlertTriangle,
    iconClass: "bg-warning-soft text-warning",
    barClass: "bg-warning",
  },
  DUPLICATE: {
    label: "Dublikatlar",
    description: "Takrorlangan yozuvlar",
    icon: Copy,
    iconClass: "bg-primary-soft text-primary",
    barClass: "bg-primary",
  },
  TYPE_ERROR: {
    label: "Tip xatolari",
    description: "Formatga mos kelmagan qiymat",
    icon: Braces,
    iconClass: "bg-danger-soft text-danger",
    barClass: "bg-danger",
  },
  OUTLIER: {
    label: "Outlierlar",
    description: "Me'yordan tashqari qiymatlar",
    icon: ScanSearch,
    iconClass: "bg-accent-soft text-accent",
    barClass: "bg-accent",
  },
};

const severityPresentation = {
  HIGH: { label: "Yuqori", className: "bg-danger-soft text-danger" },
  MEDIUM: { label: "O'rta", className: "bg-warning-soft text-warning" },
  LOW: { label: "Past", className: "bg-info-soft text-info" },
};

/** Tozalash boshlanmasdan oldin ko'rsatiladigan bosqichlar. */
const DEFAULT_STAGES = [
  { key: "structure", label: "Tuzilmani tekshirish", description: "Ustun va sxema tekshiruvi" },
  { key: "missing", label: "Bo'sh qiymatlar", description: "Median va rejim bilan to'ldirish" },
  { key: "duplicate", label: "Dublikatlar", description: "Takroriy yozuvlarni chiqarish" },
  { key: "format", label: "Tip va formatlar", description: "Qiymat va o'lchov birligini standartlashtirish" },
  { key: "outlier", label: "Outlier nazorati", description: "IQR chegarasida tekshirish" },
];

function formatNumber(value: number) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function DatasetPicker({
  datasets,
  value,
  onChange,
}: {
  datasets: DatasetSummary[];
  value: string | null;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = datasets.find((item) => item.id === value) ?? null;

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) setIsOpen(false);
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
        disabled={datasets.length === 0}
        className="group flex h-12 w-full items-center gap-2.5 rounded-lg border border-border bg-surface px-2.5 text-left shadow-sm transition-[border-color,box-shadow,background-color] hover:border-border-strong hover:bg-surface-muted/60 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-60"
        aria-label={`Datasetni tanlash. Tanlangan: ${selected?.name ?? "yo'q"}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="processing-dataset-options"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary-soft text-primary ring-1 ring-inset ring-primary/10">
          <FileText className="size-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-bold text-foreground">
            {selected?.name ?? "Dataset yo'q"}
          </span>
          <span className="mt-0.5 block text-xs font-medium text-muted">
            {selected
              ? `${selected.format} · ${formatNumber(selected.rows)} qator`
              : "Avval fayl yuklang"}
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
            {datasets.map((item) => {
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
                      {formatNumber(item.rows)} qator · {item.columns} ustun ·{" "}
                      {item.cleanedQuality ?? item.quality ?? "—"}% sifat
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
  score,
  isClean,
}: {
  score: number;
  isClean: boolean;
}) {
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
        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--surface-muted)" strokeWidth="9" />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke={isClean ? "var(--success)" : "var(--primary)"}
          strokeLinecap="round"
          strokeWidth="9"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset,stroke] duration-300"
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <p className="font-mono text-3xl font-bold tracking-[-0.06em] text-foreground">{score}%</p>
        <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-faint">
          sifat balli
        </p>
      </div>
    </div>
  );
}

export function ProcessingView() {
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DatasetDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<CleaningResult | null>(null);

  useEffect(() => {
    void listDatasets().then((response) => {
      setIsLoading(false);

      if (!response.ok) {
        setError(response.message);
        return;
      }

      setDatasets(response.data);
      setDatasetId((current) => current ?? response.data[0]?.id ?? null);
    });
  }, []);

  const applyDetail = useCallback((data: DatasetDetail) => {
    const isCleanedDataset = data.dataset.status === "CLEANED";

    setError("");
    setDetail(data);
    setStatus(isCleanedDataset ? "completed" : "idle");
    setProgress(isCleanedDataset ? 100 : 0);
  }, []);

  useEffect(() => {
    if (!datasetId) return;

    let cancelled = false;

    void getDataset(datasetId).then((response) => {
      if (cancelled) return;

      if (!response.ok) {
        setError(response.message);
        return;
      }

      applyDetail(response.data);
    });

    return () => {
      cancelled = true;
    };
  }, [datasetId, applyDetail]);

  /** Dataset almashganda oldingi tozalash natijasi ko'rsatilmasligi kerak. */
  function selectDataset(id: string) {
    setDatasetId(id);
    setResult(null);
  }

  // So'rov davomida progress ko'rsatiladi, lekin 95% dan oshmaydi —
  // 100% faqat server javob bergandan keyin qo'yiladi.
  useEffect(() => {
    if (status !== "processing") return;

    const interval = window.setInterval(() => {
      setProgress((current) => Math.min(95, current + 5));
    }, 120);

    return () => window.clearInterval(interval);
  }, [status]);

  const issuesByType = useMemo(() => {
    const totals: Record<IssueKey, number> = {
      MISSING: 0,
      DUPLICATE: 0,
      TYPE_ERROR: 0,
      OUTLIER: 0,
    };

    for (const issue of detail?.issues ?? []) {
      totals[issue.issueType] += issue.count;
    }

    return totals;
  }, [detail]);

  const totalIssueCount = ISSUE_ORDER.reduce(
    (total, key) => total + issuesByType[key],
    0,
  );

  const dataset = detail?.dataset ?? null;
  const isCleaned = status === "completed";
  const currentQuality = isCleaned
    ? (result?.qualityAfter ?? dataset?.cleanedQuality ?? dataset?.quality ?? 0)
    : (dataset?.quality ?? 0);

  const validRows = isCleaned
    ? (result?.validRowsAfter ?? null)
    : null;

  const stages = result?.stages ?? DEFAULT_STAGES.map((stage) => ({ ...stage, affected: 0 }));

  async function startProcessing() {
    if (!datasetId) return;

    setProgress(0);
    setStatus("processing");
    setError("");

    const response = await cleanDataset(datasetId);

    if (!response.ok) {
      setStatus("idle");
      setProgress(0);
      setError(response.message);
      return;
    }

    setResult(response.data);
    setProgress(100);
    setStatus("completed");

    const refreshedDetail = await getDataset(datasetId);
    if (refreshedDetail.ok) applyDetail(refreshedDetail.data);

    const refreshedList = await listDatasets();
    if (refreshedList.ok) setDatasets(refreshedList.data);
  }

  if (isLoading) {
    return (
      <div className="mx-auto grid min-h-64 w-full max-w-6xl place-content-center text-center">
        <LoaderCircle className="mx-auto size-6 animate-spin text-primary" aria-hidden="true" />
        <p className="mt-3 text-xs font-medium text-muted">Yuklanmoqda...</p>
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="mx-auto w-full max-w-6xl pb-2">
        <PageHeader
          eyebrow="Ma'lumot sifati"
          title="Ma'lumotlarni qayta ishlash"
          description="Xatolarni aniqlang, ma'lumotni standartlashtiring va AI tahliliga tayyorlang."
        />
        <div className="mt-6 grid min-h-56 place-content-center rounded-lg border border-dashed border-border-strong bg-surface p-8 text-center shadow-card">
          <FileText className="mx-auto size-7 text-faint" aria-hidden="true" />
          <h2 className="mt-4 text-sm font-bold text-foreground">Qayta ishlash uchun dataset yo&apos;q</h2>
          <p className="mt-1.5 max-w-sm text-[13px] leading-5 text-muted">
            Avval CSV yoki XLSX fayl yuklang. Fayl yuklangandan keyin sifat muammolari
            avtomatik aniqlanadi.
          </p>
          <Link
            href="/malumotlar"
            className="mx-auto mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-primary-hover"
          >
            Ma&apos;lumot yuklash
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl pb-2">
      <PageHeader
        eyebrow="Ma'lumot sifati"
        title="Ma'lumotlarni qayta ishlash"
        description="Xatolarni aniqlang, ma'lumotni standartlashtiring va AI tahliliga tayyorlang."
        action={
          <DatasetPicker
            datasets={datasets}
            value={datasetId}
            onChange={selectDataset}
          />
        }
      />

      {error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-md border border-danger/20 bg-danger-soft px-3.5 py-3" role="alert">
          <AlertTriangle className="mt-px size-[18px] shrink-0 text-danger" aria-hidden="true" />
          <p className="text-sm font-medium leading-5 text-danger">{error}</p>
        </div>
      )}

      <section className="mt-5 grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_18.5rem]">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {ISSUE_ORDER.map((key) => {
            const presentation = issuePresentation[key];
            const Icon = presentation.icon;
            const count = issuesByType[key];
            const remaining = isCleaned ? 0 : count;
            const share = dataset.rows > 0 ? (count / dataset.rows) * 100 : 0;

            return (
              <article className="rounded-lg border border-border bg-surface p-3.5 shadow-card sm:p-4" key={key}>
                <div className="flex items-start justify-between gap-2">
                  <span className={`grid size-8 place-items-center rounded-md ${presentation.iconClass}`}>
                    <Icon className="size-4" strokeWidth={1.9} aria-hidden="true" />
                  </span>
                  {isCleaned ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-1 text-[11px] font-bold text-success">
                      <Check className="size-3" aria-hidden="true" />
                      Tuzatildi
                    </span>
                  ) : (
                    <span className="font-mono text-xs font-bold text-faint">
                      {share.toFixed(2)}%
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-end justify-between gap-2">
                  <div>
                    <p className="text-[13px] font-bold text-muted">{presentation.label}</p>
                    <p className="mt-1 font-mono text-xl font-bold tracking-[-0.045em] text-foreground sm:text-[1.4rem]">
                      {formatNumber(remaining)}
                    </p>
                  </div>
                  <p className="hidden max-w-28 text-right text-[11px] leading-4 text-faint sm:block">
                    {presentation.description}
                  </p>
                </div>

                <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className={`h-full rounded-full transition-[width] duration-300 ${
                      isCleaned ? "bg-success" : presentation.barClass
                    }`}
                    style={{ width: isCleaned ? "100%" : `${Math.max(2, Math.min(100, share * 8))}%` }}
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
                isCleaned
                  ? "bg-success-soft text-success"
                  : status === "processing"
                    ? "bg-primary-soft text-primary"
                    : "bg-warning-soft text-warning"
              }`}
            >
              {isCleaned ? "Tayyor" : status === "processing" ? "Jarayonda" : "Tekshiruv kerak"}
            </span>
          </div>

          <div className="mt-4 flex justify-center">
            <QualityScore score={currentQuality} isClean={isCleaned} />
          </div>

          <dl className="mt-4 space-y-2.5 border-t border-border pt-4">
            <div className="flex items-center justify-between gap-3 text-xs">
              <dt className="text-muted">Yaroqli qatorlar</dt>
              <dd className="font-mono font-bold text-foreground">
                {validRows !== null ? formatNumber(validRows) : "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs">
              <dt className="text-muted">Aniqlangan muammolar</dt>
              <dd className="font-mono font-bold text-foreground">
                {formatNumber(isCleaned ? 0 : totalIssueCount)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs">
              <dt className="text-muted">Jami qatorlar</dt>
              <dd className="font-mono font-bold text-foreground">{formatNumber(dataset.rows)}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={() => void startProcessing()}
            disabled={status === "processing"}
            className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-3 text-xs font-bold text-white shadow-sm transition-[background-color,transform] hover:bg-primary-hover active:translate-y-px disabled:cursor-not-allowed disabled:opacity-75"
          >
            {status === "processing" ? (
              <>
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                Qayta ishlanmoqda {progress}%
              </>
            ) : isCleaned ? (
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

          {isCleaned && (
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
            {stages.map((stage, index) => {
              const threshold = ((index + 1) / stages.length) * 100;
              const previousThreshold = (index / stages.length) * 100;
              const isCompleted = isCleaned || progress >= threshold;
              const isActive =
                status === "processing" &&
                progress >= previousThreshold &&
                progress < threshold;

              return (
                <div className="relative flex gap-3 pb-4 last:pb-0" key={stage.key}>
                  {index < stages.length - 1 && (
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
                    <div className="flex items-baseline gap-2">
                      <p className={`text-[13px] font-bold ${isActive ? "text-primary" : "text-foreground"}`}>
                        {stage.label}
                      </p>
                      {isCleaned && stage.affected > 0 && (
                        <span className="font-mono text-[11px] font-bold text-success">
                          {formatNumber(stage.affected)}
                        </span>
                      )}
                    </div>
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
              {detail?.issues.length ?? 0} ta yozuv
            </span>
          </div>

          {detail && detail.issues.length > 0 ? (
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
                  {detail.issues.map((issue) => {
                    const severity = severityPresentation[issue.severity];

                    return (
                      <tr className="transition-colors hover:bg-canvas" key={issue.id}>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-bold text-foreground">
                          {issue.columnName ?? "— butun qator —"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-muted-strong">
                          {issuePresentation[issue.issueType].label}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs font-bold text-foreground">
                          {isCleaned ? 0 : formatNumber(issue.count)}
                        </td>
                        <td className="max-w-64 px-4 py-3 text-xs font-medium text-muted">
                          {issue.suggestedFix}
                        </td>
                        <td className="px-4 py-3">
                          {isCleaned ? (
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
          ) : (
            <div className="grid min-h-40 place-content-center text-center">
              <CheckCircle2 className="mx-auto size-6 text-success" aria-hidden="true" />
              <p className="mt-3 text-xs font-bold text-foreground">Muammo aniqlanmadi</p>
              <p className="mt-1 text-xs text-muted">Bu dataset tozalashsiz ham tahlilga yaroqli.</p>
            </div>
          )}
        </div>
      </section>

      {isCleaned && result && (
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
                  {formatNumber(result.droppedDuplicates)} ta dublikat chiqarildi, sifat balli{" "}
                  {result.qualityBefore}% dan {result.qualityAfter}% ga oshdi.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:min-w-[22rem]">
              {[
                { label: "Sifat", before: `${result.qualityBefore}%`, after: `${result.qualityAfter}%` },
                {
                  label: "Yaroqli qator",
                  before: formatNumber(result.validRowsBefore),
                  after: formatNumber(result.validRowsAfter),
                },
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
        Har bir tuzatish qator darajasida qayd etiladi: bo&apos;sh qiymat median bilan to&apos;ldiriladi,
        outlier IQR chegarasida kesiladi, dublikat esa chiqarib tashlanadi.
      </div>
    </div>
  );
}
