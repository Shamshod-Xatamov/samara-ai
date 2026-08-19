"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
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
  UploadCloud,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import {
  demoDataset,
  initialDatasets,
  type Dataset,
  type DatasetCell,
} from "@/data/data-sources";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ["csv", "xlsx"];

type UploadState = {
  status: "idle" | "processing" | "success" | "error";
  message?: string;
  fileName?: string;
};

function formatNumber(value: number) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeCell(value: unknown): DatasetCell {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  return String(value);
}

function parseCsv(text: string): DatasetCell[][] {
  const cleanText = text.replace(/^\uFEFF/, "");
  const firstLine = cleanText.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < cleanText.length; index += 1) {
    const character = cleanText[index];
    const nextCharacter = cleanText[index + 1];

    if (character === '"' && quoted && nextCharacter === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      quoted = !quoted;
      continue;
    }

    if (character === delimiter && !quoted) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && nextCharacter === "\n") index += 1;
      row.push(cell.trim());
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += character;
  }

  row.push(cell.trim());
  if (row.some((value) => value !== "")) rows.push(row);

  return rows.map((sourceRow, rowIndex) =>
    sourceRow.map((value) => {
      if (rowIndex === 0) return value;
      if (value === "") return null;

      const normalizedNumber = value.replace(/\s/g, "").replace(",", ".");
      if (/^-?\d+(?:[.,]\d+)?$/.test(value.replace(/\s/g, ""))) {
        const number = Number(normalizedNumber);
        if (Number.isFinite(number)) return number;
      }

      return value;
    }),
  );
}

function calculateQuality(rows: DatasetCell[][], columnCount: number) {
  if (rows.length <= 1 || columnCount === 0) return 0;

  const dataRows = rows.slice(1);
  const totalCells = dataRows.length * columnCount;
  const filledCells = dataRows.reduce(
    (total, row) => total + row.slice(0, columnCount).filter((cell) => cell !== null && cell !== "").length,
    0,
  );

  return Math.round((filledCells / totalCells) * 100);
}

function DatasetIcon({ format }: { format: Dataset["format"] }) {
  if (format === "XLSX") {
    return <FileSpreadsheet className="size-[18px]" strokeWidth={1.9} aria-hidden="true" />;
  }

  return <FileText className="size-[18px]" strokeWidth={1.9} aria-hidden="true" />;
}

function QualityBadge({ value }: { value: number }) {
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

export function DataSourcesView() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [datasets, setDatasets] = useState<Dataset[]>(initialDatasets);
  const [selectedId, setSelectedId] = useState(initialDatasets[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });

  const selectedDataset = datasets.find((dataset) => dataset.id === selectedId) ?? datasets[0];
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
  const averageQuality = Math.round(
    datasets.reduce((total, dataset) => total + dataset.quality, 0) / datasets.length,
  );

  async function processFile(file?: File) {
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
        message: "Fayl hajmi 10 MB dan oshmasligi kerak.",
        fileName: file.name,
      });
      return;
    }

    setUploadState({ status: "processing", fileName: file.name });

    try {
      let parsedRows: DatasetCell[][];

      if (extension === "csv") {
        parsedRows = parseCsv(await file.text());
      } else {
        const { readSheet } = await import("read-excel-file/browser");
        const rows = await readSheet(file);
        parsedRows = rows.map((row) => row.map(normalizeCell));
      }

      if (parsedRows.length < 2) {
        throw new Error("empty-dataset");
      }

      const columnCount = Math.max(...parsedRows.map((row) => row.length));
      const normalizedRows = parsedRows.map((row) =>
        Array.from({ length: columnCount }, (_, index) => normalizeCell(row[index])),
      );
      const datasetId = `${file.name}-${file.lastModified}`;
      const newDataset: Dataset = {
        id: datasetId,
        name: file.name,
        format: extension === "csv" ? "CSV" : "XLSX",
        size: formatFileSize(file.size),
        rows: normalizedRows.length - 1,
        columns: columnCount,
        quality: calculateQuality(normalizedRows, columnCount),
        uploadedAt: "Hozirgina",
        status: "ready",
        preview: normalizedRows.slice(0, 8),
      };

      await new Promise((resolve) => setTimeout(resolve, 350));
      setDatasets((current) => [newDataset, ...current.filter((dataset) => dataset.id !== datasetId)]);
      setSelectedId(datasetId);
      setSearchQuery("");
      setUploadState({
        status: "success",
        message: `${formatNumber(newDataset.rows)} ta qator muvaffaqiyatli o'qildi.`,
        fileName: file.name,
      });
    } catch {
      setUploadState({
        status: "error",
        message: "Faylni o'qib bo'lmadi. Uning tuzilishi va kodlashini tekshiring.",
        fileName: file.name,
      });
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function addDemoDataset() {
    setDatasets((current) => [demoDataset, ...current.filter((dataset) => dataset.id !== demoDataset.id)]);
    setSelectedId(demoDataset.id);
    setSearchQuery("");
    setUploadState({
      status: "success",
      fileName: demoDataset.name,
      message: "Demo dataset yaratildi va preview uchun tanlandi.",
    });

    window.setTimeout(() => {
      document.getElementById("dataset-preview")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <div className="mx-auto w-full max-w-6xl pb-2">
      <PageHeader
        eyebrow="Ma'lumotlar bazasi"
        title="Ma'lumot manbalari"
        description="Tahlil uchun CSV va XLSX fayllarni yuklang, tekshiring va boshqaring."
        action={
          <button
            type="button"
            onClick={addDemoDataset}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3.5 text-[13px] font-bold text-white shadow-sm transition-[background-color,transform] hover:bg-primary-hover active:translate-y-px"
          >
            <Sparkles className="size-3.5" aria-hidden="true" />
            Demo dataset yaratish
          </button>
        }
      />

      <section className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3" aria-label="Ma'lumotlar statistikasi">
        {[
          { label: "Jami datasetlar", value: String(datasets.length), detail: "faol manba", icon: Database },
          { label: "Jami yozuvlar", value: formatNumber(totalRows), detail: "qator", icon: Rows3 },
          { label: "O'rtacha sifat", value: `${averageQuality}%`, detail: "to'liqlik", icon: ShieldCheck },
          { label: "Saqlangan hajm", value: "5.1 MB", detail: "lokal demo", icon: HardDrive },
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
            <p className="mt-1 text-[13px] leading-5 text-muted">Fayl brauzer ichida o&apos;qiladi va preview darhol tayyorlanadi.</p>
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
              void processFile(event.dataTransfer.files[0]);
            }}
          >
            <input
              ref={inputRef}
              id="dataset-file"
              type="file"
              accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="sr-only"
              disabled={uploadState.status === "processing"}
              onChange={(event) => void processFile(event.target.files?.[0])}
            />

            {uploadState.status === "processing" ? (
              <>
                <span className="grid size-11 place-items-center rounded-lg bg-primary-soft text-primary">
                  <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
                </span>
                <p className="mt-4 text-sm font-bold text-foreground">Fayl o&apos;qilmoqda...</p>
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
            <span>Maksimal hajm: 10 MB</span>
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
            {filteredDatasets.length ? (
              filteredDatasets.map((dataset) => {
                const isSelected = dataset.id === selectedId;

                return (
                  <button
                    type="button"
                    key={dataset.id}
                    onClick={() => setSelectedId(dataset.id)}
                    className={`group flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-[border-color,background-color,box-shadow] ${
                      isSelected
                        ? "border-primary/30 bg-primary-soft/65 shadow-sm"
                        : "border-border bg-surface hover:border-border-strong hover:bg-canvas"
                    }`}
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
                        <span>{dataset.size}</span>
                        <span>{dataset.uploadedAt}</span>
                      </span>
                    </span>

                    <QualityBadge value={dataset.quality} />
                    <ChevronRight
                      className={`size-4 shrink-0 transition-transform ${isSelected ? "translate-x-0.5 text-primary" : "text-faint group-hover:translate-x-0.5"}`}
                      aria-hidden="true"
                    />
                  </button>
                );
              })
            ) : (
              <div className="grid min-h-48 place-content-center text-center">
                <SearchX className="mx-auto size-6 text-faint" aria-hidden="true" />
                <p className="mt-3 text-xs font-bold text-foreground">Dataset topilmadi</p>
                <p className="mt-1 text-xs text-muted">Qidiruv so&apos;zini o&apos;zgartirib ko&apos;ring.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {selectedDataset && (
        <section
          id="dataset-preview"
          className="mt-4 scroll-mt-6 overflow-hidden rounded-lg border border-border bg-surface shadow-card"
        >
          <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary-soft text-primary">
                <DatasetIcon format={selectedDataset.format} />
              </span>
              <div className="min-w-0">
                <p className="ui-label text-faint">Ma&apos;lumot preview&apos;i</p>
                <h2 className="mt-1 truncate text-sm font-bold text-foreground">{selectedDataset.name}</h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <QualityBadge value={selectedDataset.quality} />
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
              { label: "Qatorlar", value: formatNumber(selectedDataset.rows), icon: Rows3 },
              { label: "Ustunlar", value: String(selectedDataset.columns), icon: Columns3 },
              { label: "Hajmi", value: selectedDataset.size, icon: HardDrive },
              { label: "Yuklangan", value: selectedDataset.uploadedAt, icon: CheckCircle2 },
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
                  {selectedDataset.preview[0]?.map((cell, index) => (
                    <th
                      className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-[0.07em] text-muted-strong"
                      key={`${String(cell)}-${index}`}
                    >
                      {String(cell ?? `ustun_${index + 1}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {selectedDataset.preview.slice(1).map((row, rowIndex) => (
                  <tr className="transition-colors hover:bg-canvas" key={`${selectedDataset.id}-${rowIndex}`}>
                    <td className="px-4 py-3 font-mono text-[11px] font-bold text-faint">{rowIndex + 1}</td>
                    {selectedDataset.preview[0]?.map((_, cellIndex) => {
                      const cell = row[cellIndex];
                      const value =
                        typeof cell === "boolean" ? (cell ? "Ha" : "Yo'q") : cell === null ? "—" : String(cell);

                      return (
                        <td
                          className={`max-w-52 truncate whitespace-nowrap px-4 py-3 text-xs font-medium ${
                            cell === null ? "text-faint" : "text-muted-strong"
                          }`}
                          key={`${rowIndex}-${cellIndex}`}
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
            <span>Preview: {Math.max(0, selectedDataset.preview.length - 1)} / {formatNumber(selectedDataset.rows)} qator</span>
            <span>Faylning dastlabki qatorlari ko&apos;rsatilmoqda</span>
          </div>
        </section>
      )}
    </div>
  );
}
