"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Columns3,
  Database,
  FileSpreadsheet,
  FileText,
  HardDrive,
  LoaderCircle,
  Rows3,
  Search,
  SearchX,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  Wand2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { formatNumber, formatRelativeDateTime } from "@/lib/format";
import { CANONICAL_COLUMNS, type CanonicalKey } from "@/lib/parsing/canonical";
import {
  cleanDataset,
  createDemoDataset,
  deleteDataset,
  getDataset,
  listDatasets,
  runAiMapping,
  saveMapping,
  uploadDataset,
  type DatasetColumnInfo,
  type DatasetDetail,
  type DatasetSummary,
} from "@/services/datasets";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ["csv", "xlsx"];

type UploadState = {
  status: "idle" | "processing" | "success" | "error";
  message?: string;
  fileName?: string;
};

const STATUS_LABELS: Record<DatasetSummary["status"], string> = {
  UPLOADED: "Yuklandi",
  PROFILED: "Tekshirildi",
  MAPPED: "Bog'landi",
  CLEANED: "Tozalandi",
  FAILED: "Xato",
};

const TYPE_LABELS: Record<DatasetColumnInfo["dataType"], string> = {
  DATE: "Sana",
  NUMBER: "Raqam",
  TEXT: "Matn",
  BOOLEAN: "Mantiqiy",
  UNKNOWN: "Noma'lum",
};

const MAPPED_BY_LABELS: Record<
  NonNullable<DatasetColumnInfo["mappedBy"]>,
  string
> = {
  AI: "AI",
  USER: "Qo'lda",
  HEURISTIC: "Avto",
};

function DatasetIcon({ format }: { format: DatasetSummary["format"] }) {
  if (format === "XLSX") {
    return <FileSpreadsheet className="size-[18px]" strokeWidth={1.9} aria-hidden="true" />;
  }

  return <FileText className="size-[18px]" strokeWidth={1.9} aria-hidden="true" />;
}

function QualityBadge({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-1 font-mono text-xs font-bold text-muted">
        —
      </span>
    );
  }

  const className =
    value >= 90
      ? "bg-success-soft text-success"
      : value >= 80
        ? "bg-warning-soft text-warning"
        : "bg-danger-soft text-danger";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-mono text-xs font-bold ${className}`}>
      <ShieldCheck className="size-3" aria-hidden="true" />
      {value}%
    </span>
  );
}

function ConfidenceBadge({ value }: { value: number | null }) {
  if (value === null) return null;

  const className =
    value >= 90
      ? "bg-success-soft text-success"
      : value >= 70
        ? "bg-primary-soft text-primary"
        : "bg-warning-soft text-warning";

  return (
    <span className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[11px] font-bold ${className}`}>
      {value}%
    </span>
  );
}

export function DataSourcesView() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DatasetDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });

  const [isMapping, setIsMapping] = useState(false);
  const [mappingNotice, setMappingNotice] = useState("");
  const [mappingError, setMappingError] = useState("");
  const [overrides, setOverrides] = useState<Record<string, CanonicalKey | "">>({});
  const [isSavingMapping, setIsSavingMapping] = useState(false);

  const [isCleaning, setIsCleaning] = useState(false);

  /** Tanlovni o'zgartirganda bog'liq holatlar birga tozalanadi. */
  const selectDataset = useCallback((id: string | null) => {
    setSelectedId(id);
    setDetail(null);
    setMappingNotice("");
    setMappingError("");
    setOverrides({});
    setIsLoadingDetail(id !== null);
  }, []);

  const refreshList = useCallback(async () => {
    const result = await listDatasets();
    setIsLoadingList(false);

    if (!result.ok) {
      setListError(result.message);
      return [];
    }

    setListError("");
    setDatasets(result.data);

    return result.data;
  }, []);

  useEffect(() => {
    let cancelled = false;

    void listDatasets().then((result) => {
      if (cancelled) return;

      setIsLoadingList(false);

      if (!result.ok) {
        setListError(result.message);
        return;
      }

      setDatasets(result.data);

      if (result.data.length > 0) {
        selectDataset(result.data[0].id);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selectDataset]);

  useEffect(() => {
    if (!selectedId) return;

    let cancelled = false;

    void getDataset(selectedId).then((result) => {
      if (cancelled) return;

      setIsLoadingDetail(false);
      setDetail(result.ok ? result.data : null);
      if (!result.ok) setListError(result.message);
    });

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const filteredDatasets = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("uz-UZ");
    if (!query) return datasets;

    return datasets.filter(
      (dataset) =>
        dataset.name.toLocaleLowerCase("uz-UZ").includes(query) ||
        dataset.format.toLocaleLowerCase("uz-UZ").includes(query),
    );
  }, [datasets, searchQuery]);

  const totalRows = datasets.reduce((total, dataset) => total + dataset.rows, 0);
  const qualityValues = datasets
    .map((dataset) => dataset.cleanedQuality ?? dataset.quality)
    .filter((value): value is number => value !== null);
  const averageQuality = qualityValues.length
    ? Math.round(
        qualityValues.reduce((total, value) => total + value, 0) /
          qualityValues.length,
      )
    : 0;

  async function handleUpload(file?: File) {
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setUploadState({
        status: "error",
        message: "Faqat CSV yoki XLSX formatidagi faylni yuklash mumkin.",
        fileName: file.name,
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadState({
        status: "error",
        message: "Fayl hajmi 15 MB dan oshmasligi kerak.",
        fileName: file.name,
      });
      return;
    }

    setUploadState({ status: "processing", fileName: file.name });

    const result = await uploadDataset(file);

    if (inputRef.current) inputRef.current.value = "";

    if (!result.ok) {
      setUploadState({
        status: "error",
        message: result.message,
        fileName: file.name,
      });
      return;
    }

    setUploadState({
      status: "success",
      fileName: file.name,
      message: `${formatNumber(result.data.dataset.rows)} ta qator o'qildi, ${formatNumber(result.data.validRows)} tasi tahlilga yaroqli.`,
    });

    setSearchQuery("");
    selectDataset(result.data.dataset.id);
    await refreshList();
  }

  async function handleDemoDataset() {
    setUploadState({ status: "processing", fileName: "Namuna ma'lumot" });

    const result = await createDemoDataset();

    if (!result.ok) {
      setUploadState({ status: "error", message: result.message });
      return;
    }

    setUploadState({
      status: "success",
      fileName: result.data.dataset.name,
      message: `Namuna dataset yaratildi: ${formatNumber(result.data.dataset.rows)} qator.`,
    });

    setSearchQuery("");
    selectDataset(result.data.dataset.id);
    await refreshList();
  }

  async function handleDelete(id: string) {
    const result = await deleteDataset(id);
    if (!result.ok) {
      setListError(result.message);
      return;
    }

    const remaining = await refreshList();

    if (selectedId === id) {
      selectDataset(remaining[0]?.id ?? null);
    }
  }

  async function handleAiMapping() {
    if (!selectedId) return;

    setIsMapping(true);
    setMappingError("");
    setMappingNotice("");

    const result = await runAiMapping(selectedId);
    setIsMapping(false);

    if (!result.ok) {
      setMappingError(result.message);
      return;
    }

    setDetail((current) =>
      current ? { ...current, columns: result.data.columns } : current,
    );
    setOverrides({});

    const mapped = result.data.columns.filter((column) => column.canonicalKey).length;
    setMappingNotice(
      result.data.cached
        ? `Avval hisoblangan natija ishlatildi — ${mapped} ta ustun bog'landi.`
        : `${result.data.model} ${mapped} ta ustunni bog'ladi (${((result.data.latencyMs ?? 0) / 1000).toFixed(1)} s).`,
    );

    await refreshList();
  }

  async function handleSaveMapping() {
    if (!selectedId || !detail) return;

    const changes = Object.entries(overrides).map(([columnId, key]) => ({
      columnId,
      canonicalKey: key === "" ? null : key,
    }));

    if (changes.length === 0) return;

    setIsSavingMapping(true);
    setMappingError("");

    const result = await saveMapping(selectedId, changes);
    setIsSavingMapping(false);

    if (!result.ok) {
      setMappingError(result.message);
      return;
    }

    setDetail((current) =>
      current ? { ...current, columns: result.data.columns } : current,
    );
    setOverrides({});
    setMappingNotice("O'zgarishlar saqlandi.");
  }

  async function handleClean() {
    if (!selectedId) return;

    setIsCleaning(true);
    const result = await cleanDataset(selectedId);
    setIsCleaning(false);

    if (!result.ok) {
      setMappingError(result.message);
      return;
    }

    setMappingNotice(
      `Tozalandi: sifat ${result.data.qualityBefore} → ${result.data.qualityAfter}, yaroqli qatorlar ${formatNumber(result.data.validRowsBefore)} → ${formatNumber(result.data.validRowsAfter)}.`,
    );

    const refreshed = await getDataset(selectedId);
    if (refreshed.ok) setDetail(refreshed.data);
    await refreshList();
  }

  const selected = detail?.dataset ?? null;
  const hasOverrides = Object.keys(overrides).length > 0;
  const mappedCount =
    detail?.columns.filter((column) => column.canonicalKey).length ?? 0;

  return (
    <div className="mx-auto w-full max-w-6xl pb-2">
      <PageHeader
        eyebrow="Ma'lumotlar bazasi"
        title="Ma'lumot manbalari"
        description="Tahlil uchun CSV va XLSX fayllarni yuklang, tekshiring va boshqaring."
        action={
          <button
            type="button"
            onClick={() => void handleDemoDataset()}
            disabled={uploadState.status === "processing"}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3.5 text-[13px] font-bold text-white shadow-sm transition-[background-color,transform] hover:bg-primary-hover active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Sparkles className="size-3.5" aria-hidden="true" />
            Namuna dataset
          </button>
        }
      />

      {listError && (
        <div className="mt-4 flex items-start gap-2.5 rounded-md border border-danger/20 bg-danger-soft px-3.5 py-3" role="alert">
          <AlertCircle className="mt-px size-[18px] shrink-0 text-danger" aria-hidden="true" />
          <p className="text-sm font-medium leading-5 text-danger">{listError}</p>
        </div>
      )}

      <section className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3" aria-label="Ma'lumotlar statistikasi">
        {[
          { label: "Jami datasetlar", value: String(datasets.length), detail: "faol manba", icon: Database },
          { label: "Jami yozuvlar", value: formatNumber(totalRows), detail: "qator", icon: Rows3 },
          { label: "O'rtacha sifat", value: qualityValues.length ? `${averageQuality}%` : "—", detail: "sifat balli", icon: ShieldCheck },
          { label: "Bog'langan ustunlar", value: selected ? `${mappedCount}/${selected.columns}` : "—", detail: "kanonik sxema", icon: Columns3 },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <article className="rounded-lg border border-border bg-surface p-3.5 shadow-card sm:p-4" key={item.label}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.07em] text-faint sm:text-[13px]">
                  {item.label}
                </p>
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-surface-muted text-muted-strong ring-1 ring-inset ring-border/80">
                  <Icon className="size-4" strokeWidth={1.9} aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 font-mono text-xl font-bold tracking-[-0.045em] text-foreground sm:text-[1.4rem]">
                {item.value}
              </p>
              <p className="mt-1 text-xs font-medium text-muted">{item.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-4 grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5">
          <div>
            <p className="ui-label text-faint">Yangi manba</p>
            <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">Fayl yuklash</h2>
            <p className="mt-1 text-[13px] leading-5 text-muted">
              Fayl serverda o&apos;qiladi, sifati tekshiriladi va bazaga saqlanadi.
            </p>
          </div>

          <label
            htmlFor="dataset-file"
            className={`mt-4 flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed px-5 py-7 text-center transition-[border-color,background-color] ${
              isDragging
                ? "border-primary bg-primary-soft"
                : uploadState.status === "error"
                  ? "border-danger/45 bg-danger-soft/50"
                  : uploadState.status === "success"
                    ? "border-success/40 bg-success-soft/50"
                    : "border-border-strong bg-canvas hover:border-primary/45 hover:bg-primary-soft/35"
            }`}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              void handleUpload(event.dataTransfer.files[0]);
            }}
          >
            <input
              ref={inputRef}
              id="dataset-file"
              type="file"
              accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="sr-only"
              disabled={uploadState.status === "processing"}
              onChange={(event) => void handleUpload(event.target.files?.[0])}
            />

            {uploadState.status === "processing" ? (
              <>
                <span className="grid size-11 place-items-center rounded-lg bg-primary-soft text-primary">
                  <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
                </span>
                <p className="mt-4 text-sm font-bold text-foreground">Fayl qayta ishlanmoqda...</p>
                <p className="mt-1 max-w-64 truncate text-[13px] text-muted">{uploadState.fileName}</p>
              </>
            ) : uploadState.status === "success" ? (
              <>
                <span className="grid size-11 place-items-center rounded-lg bg-success-soft text-success">
                  <CheckCircle2 className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-4 max-w-full truncate text-sm font-bold text-foreground">{uploadState.fileName}</p>
                <p className="mt-1 text-[13px] leading-5 text-success">{uploadState.message}</p>
                <span className="mt-3 text-xs font-bold text-primary">Boshqa fayl tanlash</span>
              </>
            ) : uploadState.status === "error" ? (
              <>
                <span className="grid size-11 place-items-center rounded-lg bg-danger-soft text-danger">
                  <AlertCircle className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-4 text-sm font-bold text-foreground">Fayl qabul qilinmadi</p>
                <p className="mt-1 text-[13px] leading-5 text-danger">{uploadState.message}</p>
                <span className="mt-3 text-xs font-bold text-primary">Qayta tanlash</span>
              </>
            ) : (
              <>
                <span className="grid size-11 place-items-center rounded-lg bg-primary-soft text-primary">
                  <UploadCloud className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-4 text-sm font-bold text-foreground">Faylni shu yerga tashlang</p>
                <p className="mt-1 text-[13px] leading-5 text-muted">yoki tanlash uchun bosing</p>
              </>
            )}
          </label>

          <div className="mt-3 flex items-center justify-between gap-3 text-xs font-medium text-faint">
            <span>CSV, XLSX</span>
            <span>Maksimal hajm: 15 MB</span>
          </div>
        </div>

        <div className="min-w-0 rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="ui-label text-faint">Manbalar</p>
              <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">Datasetlar ro&apos;yxati</h2>
            </div>
            <label className="relative block sm:w-56">
              <span className="sr-only">Datasetlarni qidirish</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-faint" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Datasetni qidirish"
                className="h-9 w-full rounded-md border border-border bg-canvas pl-9 pr-3 text-[13px] font-medium text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-faint focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </label>
          </div>

          <div className="mt-4 space-y-2">
            {isLoadingList ? (
              <div className="grid min-h-48 place-content-center text-center">
                <LoaderCircle className="mx-auto size-6 animate-spin text-primary" aria-hidden="true" />
                <p className="mt-3 text-xs font-medium text-muted">Yuklanmoqda...</p>
              </div>
            ) : filteredDatasets.length ? (
              filteredDatasets.map((dataset) => {
                const isSelected = dataset.id === selectedId;

                return (
                  <div
                    key={dataset.id}
                    className={`group flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-[border-color,background-color,box-shadow] ${
                      isSelected
                        ? "border-primary/30 bg-primary-soft/65 shadow-sm"
                        : "border-border bg-surface hover:border-border-strong hover:bg-canvas"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => selectDataset(dataset.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      aria-pressed={isSelected}
                    >
                      <span
                        className={`grid size-10 shrink-0 place-items-center rounded-md ${
                          isSelected ? "bg-primary text-white" : "bg-surface-muted text-muted-strong"
                        }`}
                      >
                        <DatasetIcon format={dataset.format} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="truncate text-xs font-bold text-foreground">{dataset.name}</span>
                          <span className="shrink-0 rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[11px] font-bold text-muted">
                            {dataset.format}
                          </span>
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-muted">
                          <span>{formatNumber(dataset.rows)} qator</span>
                          <span>{dataset.columns} ustun</span>
                          <span>{dataset.sizeLabel}</span>
                          <span>{formatRelativeDateTime(dataset.createdAt)}</span>
                          <span className="rounded bg-surface-muted px-1.5 py-0.5 font-bold text-muted-strong">
                            {STATUS_LABELS[dataset.status]}
                          </span>
                        </span>
                      </span>

                      <QualityBadge value={dataset.cleanedQuality ?? dataset.quality} />
                      <ChevronRight
                        className={`size-4 shrink-0 transition-transform ${isSelected ? "translate-x-0.5 text-primary" : "text-faint group-hover:translate-x-0.5"}`}
                        aria-hidden="true"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDelete(dataset.id)}
                      className="grid size-8 shrink-0 place-items-center rounded-md text-faint transition-colors hover:bg-danger-soft hover:text-danger"
                      aria-label={`${dataset.name} datasetini o'chirish`}
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="grid min-h-48 place-content-center text-center">
                <SearchX className="mx-auto size-6 text-faint" aria-hidden="true" />
                <p className="mt-3 text-xs font-bold text-foreground">
                  {datasets.length === 0 ? "Hali dataset yuklanmagan" : "Dataset topilmadi"}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {datasets.length === 0
                    ? "Fayl yuklang yoki namuna dataset yarating."
                    : "Qidiruv so'zini o'zgartirib ko'ring."}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {isLoadingDetail && (
        <div className="mt-4 grid min-h-32 place-content-center rounded-lg border border-border bg-surface text-center shadow-card">
          <LoaderCircle className="mx-auto size-6 animate-spin text-primary" aria-hidden="true" />
          <p className="mt-3 text-xs font-medium text-muted">Ma&apos;lumot o&apos;qilmoqda...</p>
        </div>
      )}

      {!isLoadingDetail && detail && selected && (
        <>
          <section className="mt-4 rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="ui-label text-faint">Kanonik sxema</p>
                <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">
                  Ustunlarni bog&apos;lash
                </h2>
                <p className="mt-1 max-w-xl text-[13px] leading-5 text-muted">
                  Metrikalarni hisoblash uchun fayl ustunlari yagona sxemaga bog&apos;lanadi.
                  AI taklifini tekshiring va kerak bo&apos;lsa tuzating.
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleAiMapping()}
                  disabled={isMapping}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-surface px-3 text-xs font-bold text-foreground shadow-sm transition-colors hover:border-border-strong hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isMapping ? (
                    <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <BrainCircuit className="size-3.5" aria-hidden="true" />
                  )}
                  {isMapping ? "AI tahlil qilmoqda..." : "AI bilan aniqlash"}
                </button>

                {hasOverrides && (
                  <button
                    type="button"
                    onClick={() => void handleSaveMapping()}
                    disabled={isSavingMapping}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingMapping ? (
                      <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <CheckCircle2 className="size-3.5" aria-hidden="true" />
                    )}
                    Saqlash
                  </button>
                )}
              </div>
            </div>

            {mappingError && (
              <p className="mt-3 flex items-start gap-2 rounded-md border border-warning/20 bg-warning-soft px-3 py-2 text-[13px] font-medium leading-5 text-warning" role="alert">
                <AlertCircle className="mt-px size-4 shrink-0" aria-hidden="true" />
                {mappingError}
              </p>
            )}

            {mappingNotice && !mappingError && (
              <p className="mt-3 flex items-start gap-2 rounded-md border border-success/20 bg-success-soft px-3 py-2 text-[13px] font-medium leading-5 text-success">
                <CheckCircle2 className="mt-px size-4 shrink-0" aria-hidden="true" />
                {mappingNotice}
              </p>
            )}

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.07em] text-faint">Fayl ustuni</th>
                    <th className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.07em] text-faint">Tip</th>
                    <th className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.07em] text-faint">Kanonik kalit</th>
                    <th className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.07em] text-faint">Izoh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {detail.columns.map((column) => {
                    const currentKey =
                      overrides[column.id] ?? (column.canonicalKey ?? "");

                    return (
                      <tr key={column.id} className="align-top">
                        <td className="max-w-56 px-3 py-3">
                          <p className="truncate text-xs font-bold text-foreground" title={column.sourceName}>
                            {column.sourceName}
                          </p>
                          <p className="mt-0.5 text-[11px] font-medium text-faint">
                            {column.nullCount > 0 ? `${column.nullCount} bo'sh` : "to'liq"}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <span className="rounded bg-surface-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-strong">
                            {TYPE_LABELS[column.dataType]}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <select
                              value={currentKey}
                              onChange={(event) =>
                                setOverrides((current) => ({
                                  ...current,
                                  [column.id]: event.target.value as CanonicalKey | "",
                                }))
                              }
                              className="h-8 min-w-40 rounded-md border border-border bg-canvas px-2 text-xs font-medium text-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-4 focus:ring-primary/10"
                              aria-label={`${column.sourceName} uchun kanonik kalit`}
                            >
                              <option value="">— bog&apos;lanmagan —</option>
                              {CANONICAL_COLUMNS.map((canonical) => (
                                <option key={canonical.key} value={canonical.key}>
                                  {canonical.label}
                                  {canonical.unit ? ` (${canonical.unit})` : ""}
                                </option>
                              ))}
                            </select>
                            <ConfidenceBadge value={column.mappingConfidence} />
                            {column.mappedBy && (
                              <span className="shrink-0 rounded bg-surface-muted px-1.5 py-0.5 text-[11px] font-bold text-muted">
                                {MAPPED_BY_LABELS[column.mappedBy]}
                              </span>
                            )}
                          </div>
                          {column.unitScale !== null && column.unitScale !== 1 && (
                            <p className="mt-1 font-mono text-[11px] font-bold text-accent">
                              birlik × {column.unitScale}
                            </p>
                          )}
                        </td>
                        <td className="max-w-72 px-3 py-3">
                          <p className="text-[11px] leading-4 text-muted">
                            {column.mappingReason ?? "—"}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section
            id="dataset-preview"
            className="mt-4 scroll-mt-6 overflow-hidden rounded-lg border border-border bg-surface shadow-card"
          >
            <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary-soft text-primary">
                  <DatasetIcon format={selected.format} />
                </span>
                <div className="min-w-0">
                  <p className="ui-label text-faint">Ma&apos;lumot preview&apos;i</p>
                  <h2 className="mt-1 truncate text-sm font-bold text-foreground">{selected.name}</h2>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <QualityBadge value={selected.cleanedQuality ?? selected.quality} />
                <button
                  type="button"
                  onClick={() => void handleClean()}
                  disabled={isCleaning}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-surface px-3 text-xs font-bold text-foreground shadow-sm transition-colors hover:border-border-strong hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCleaning ? (
                    <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Wand2 className="size-3.5" aria-hidden="true" />
                  )}
                  {isCleaning ? "Tozalanmoqda..." : "Tozalash"}
                </button>
                <Link
                  href="/qayta-ishlash"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-primary-hover"
                >
                  Qayta ishlashga o&apos;tish
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <dl className="grid grid-cols-2 border-b border-border bg-canvas sm:grid-cols-4">
              {[
                { label: "Qatorlar", value: formatNumber(selected.rows), icon: Rows3 },
                { label: "Ustunlar", value: String(selected.columns), icon: Columns3 },
                { label: "Hajmi", value: selected.sizeLabel, icon: HardDrive },
                { label: "Yuklangan", value: formatRelativeDateTime(selected.createdAt), icon: CheckCircle2 },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    className={`flex items-center gap-2.5 px-4 py-3 ${index % 2 ? "border-l border-border" : ""} ${
                      index > 1 ? "border-t border-border sm:border-t-0" : ""
                    } ${index === 2 ? "sm:border-l" : ""}`}
                    key={item.label}
                  >
                    <Icon className="size-3.5 shrink-0 text-faint" aria-hidden="true" />
                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-[0.07em] text-faint">{item.label}</dt>
                      <dd className="mt-0.5 text-xs font-bold text-foreground">{item.value}</dd>
                    </div>
                  </div>
                );
              })}
            </dl>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border bg-surface-muted/70">
                    <th className="w-12 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-faint">#</th>
                    {detail.preview.headers.map((header, index) => (
                      <th
                        className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-[0.07em] text-muted-strong"
                        key={`${header}-${index}`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {detail.preview.rows.map((row) => (
                    <tr
                      className={`transition-colors hover:bg-canvas ${row.isDuplicate ? "bg-warning-soft/40" : ""}`}
                      key={row.index}
                    >
                      <td className="px-4 py-3 font-mono text-[11px] font-bold text-faint">
                        {row.index + 1}
                      </td>
                      {detail.preview.headers.map((_, cellIndex) => {
                        const cell = row.values[cellIndex] ?? null;
                        const value =
                          typeof cell === "boolean"
                            ? cell
                              ? "Ha"
                              : "Yo'q"
                            : cell === null
                              ? "—"
                              : String(cell);

                        return (
                          <td
                            className={`max-w-52 truncate whitespace-nowrap px-4 py-3 text-xs font-medium ${
                              cell === null ? "text-faint" : "text-muted-strong"
                            }`}
                            key={`${row.index}-${cellIndex}`}
                            title={value}
                          >
                            {value}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-2 border-t border-border bg-canvas px-4 py-3 text-[11px] font-medium text-muted sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <span>
                Preview: {detail.preview.rows.length} / {formatNumber(selected.rows)} qator
              </span>
              <span>Sariq fon — takroriy yozuv</span>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
