"use client";

import {
  BarChart3,
  Bot,
  Braces,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  FileBarChart,
  FileCheck2,
  FileClock,
  FileSpreadsheet,
  FileText,
  Gauge,
  LayoutDashboard,
  LoaderCircle,
  Printer,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { DemoNotice } from "@/components/ui/demo-notice";
import {
  DateRangePicker,
  type DateRangeValue,
} from "@/components/ui/date-range-picker";
import {
  initialReportHistory,
  reportKpiRows,
  reportTypes,
  type ReportFormat,
  type ReportHistoryItem,
  type ReportType,
  type ReportTypeKey,
} from "@/data/reports";

type GenerationStatus = "idle" | "generating" | "ready";
type HistoryFilter = "all" | ReportFormat;

const DEMO_TODAY = new Date(2026, 7, 19);
const MIN_REPORT_DATE = new Date(2026, 0, 1);
const DEFAULT_RANGE: DateRangeValue = {
  from: new Date(2026, 7, 1),
  to: DEMO_TODAY,
};

const reportTypeIcons: Record<ReportType["iconKey"], LucideIcon> = {
  calendar: CalendarDays,
  trend: TrendingUp,
  chart: BarChart3,
  economy: Gauge,
  ai: Bot,
  management: LayoutDashboard,
};

const formatOptions: Array<{
  key: ReportFormat;
  label: string;
  detail: string;
  icon: LucideIcon;
}> = [
  { key: "pdf", label: "PDF", detail: "Chop etish", icon: FileText },
  { key: "excel", label: "Excel", detail: "Jadval", icon: FileSpreadsheet },
  { key: "csv", label: "CSV", detail: "Ochiq format", icon: Braces },
];

const formatBadgeClasses: Record<ReportFormat, string> = {
  pdf: "bg-danger-soft text-danger",
  excel: "bg-success-soft text-success",
  csv: "bg-info-soft text-info",
};

const datePresets = [
  { label: "Bugun", from: DEMO_TODAY, to: DEMO_TODAY },
  { label: "Oxirgi 7 kun", from: new Date(2026, 7, 13), to: DEMO_TODAY },
  { label: "Oxirgi 30 kun", from: new Date(2026, 6, 21), to: DEMO_TODAY },
  { label: "Joriy oy", from: new Date(2026, 7, 1), to: DEMO_TODAY },
];

function formatReportPeriod(range: DateRangeValue) {
  const month = new Intl.DateTimeFormat("uz-UZ", { month: "short" });
  const sameDay = range.from.toDateString() === range.to.toDateString();
  const sameMonth =
    range.from.getFullYear() === range.to.getFullYear() &&
    range.from.getMonth() === range.to.getMonth();

  if (sameDay) {
    return `${range.from.getDate()} ${month.format(range.from)} ${range.from.getFullYear()}`;
  }

  if (sameMonth) {
    return `${range.from.getDate()}–${range.to.getDate()} ${month.format(range.to)} ${range.to.getFullYear()}`;
  }

  return `${range.from.getDate()} ${month.format(range.from)} – ${range.to.getDate()} ${month.format(range.to)} ${range.to.getFullYear()}`;
}

function safeFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[ʻ’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function downloadBlob(content: BlobPart, mimeType: string, fileName: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
}

function createCsv(report: ReportHistoryItem, reportType: ReportType) {
  const rows = [
    ["Samara AI hisoboti", report.title, ""],
    ["Hisobot davri", report.period, ""],
    ["Bo'lim", "Qiymat", "O'zgarish"],
    ...reportKpiRows,
    [],
    ["Hisobot tarkibi", "", ""],
    ...reportType.sections.map((section, index) => [`${index + 1}. ${section}`, "", ""]),
  ];

  return `\uFEFF${rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n")}`;
}

function createExcelTable(report: ReportHistoryItem, reportType: ReportType) {
  const kpiRows = reportKpiRows
    .map(
      (row) =>
        `<tr><td>${escapeHtml(row[0])}</td><td>${escapeHtml(row[1])}</td><td>${escapeHtml(row[2])}</td></tr>`,
    )
    .join("");
  const sectionRows = reportType.sections
    .map(
      (section, index) =>
        `<tr><td>${index + 1}</td><td colspan="2">${escapeHtml(section)}</td></tr>`,
    )
    .join("");

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="UTF-8"></head>
      <body>
        <table>
          <tr><th colspan="3">Samara AI — ${escapeHtml(report.title)}</th></tr>
          <tr><td>Hisobot davri</td><td colspan="2">${escapeHtml(report.period)}</td></tr>
          <tr><th>Ko'rsatkich</th><th>Qiymat</th><th>O'zgarish</th></tr>
          ${kpiRows}
          <tr><th colspan="3">Hisobot tarkibi</th></tr>
          ${sectionRows}
        </table>
      </body>
    </html>`;
}

function openPrintableReport(report: ReportHistoryItem, reportType: ReportType) {
  const reportWindow = window.open("", "_blank", "width=960,height=760");
  if (!reportWindow) return false;

  const kpiRows = reportKpiRows
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row[0])}</td>
          <td>${escapeHtml(row[1])}</td>
          <td class="change">${escapeHtml(row[2])}</td>
        </tr>`,
    )
    .join("");
  const sections = reportType.sections
    .map((section, index) => `<li><span>${index + 1}</span>${escapeHtml(section)}</li>`)
    .join("");

  reportWindow.document.write(`<!doctype html>
    <html lang="uz">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(report.title)}</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; color: #172033; font: 14px Arial, sans-serif; background: #fff; }
          main { width: 780px; margin: 0 auto; padding: 48px 28px; }
          header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 24px; border-bottom: 2px solid #2559c7; }
          .brand { font-size: 20px; font-weight: 800; } .brand span { color: #2559c7; }
          .meta { text-align: right; color: #6a778b; font-size: 12px; line-height: 1.6; }
          h1 { margin: 34px 0 8px; font-size: 27px; letter-spacing: -.5px; }
          .lead { margin: 0 0 30px; color: #6a778b; line-height: 1.6; }
          h2 { margin: 28px 0 12px; font-size: 15px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f6f8fb; color: #48566c; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; text-align: left; }
          th, td { border: 1px solid #e1e7ef; padding: 11px 12px; }
          td:nth-child(2), td:nth-child(3) { font-weight: 700; } .change { color: #16a34a; }
          ol { list-style: none; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          li { display: flex; align-items: center; gap: 10px; border: 1px solid #e1e7ef; border-radius: 8px; padding: 10px; }
          li span { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; background: #edf3ff; color: #2559c7; font-weight: 700; font-size: 11px; }
          footer { margin-top: 40px; border-top: 1px solid #e1e7ef; padding-top: 14px; color: #98a3b3; font-size: 10px; }
          @media print { main { width: auto; padding: 20px; } @page { margin: 12mm; } }
        </style>
      </head>
      <body>
        <main>
          <header><div class="brand">Samara <span>AI</span></div><div class="meta">${escapeHtml(report.id)}<br>${escapeHtml(report.period)}</div></header>
          <h1>${escapeHtml(report.title)}</h1>
          <p class="lead">AI Real-Time Economic Efficiency platformasi tomonidan shakllantirilgan demo hisobot.</p>
          <h2>Asosiy ko'rsatkichlar</h2>
          <table><thead><tr><th>Ko'rsatkich</th><th>Qiymat</th><th>O'zgarish</th></tr></thead><tbody>${kpiRows}</tbody></table>
          <h2>Hisobot tarkibi</h2><ol>${sections}</ol>
          <footer>Samara AI · Demo tashkilot · Hisobot avtomatik shakllantirilgan</footer>
        </main>
        <script>window.setTimeout(() => window.print(), 350);<\/script>
      </body>
    </html>`);
  reportWindow.document.close();
  return true;
}

function exportReport(report: ReportHistoryItem, reportType: ReportType) {
  const baseName = `${safeFileName(report.title)}-${report.id.toLowerCase()}`;

  if (report.format === "pdf") {
    return openPrintableReport(report, reportType);
  }

  if (report.format === "excel") {
    downloadBlob(
      `\uFEFF${createExcelTable(report, reportType)}`,
      "application/vnd.ms-excel;charset=utf-8",
      `${baseName}.xls`,
    );
    return true;
  }

  downloadBlob(createCsv(report, reportType), "text/csv;charset=utf-8", `${baseName}.csv`);
  return true;
}

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

function ReportTypeCard({
  reportType,
  selected,
  onSelect,
}: {
  reportType: ReportType;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = reportTypeIcons[reportType.iconKey];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group flex min-h-32 flex-col rounded-lg border p-3.5 text-left transition-all ${
        selected
          ? "border-primary/35 bg-primary-soft/60 shadow-sm ring-1 ring-primary/10"
          : "border-border bg-surface hover:border-border-strong hover:bg-surface-muted/45"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`grid size-8 place-items-center rounded-md ${
          selected ? "bg-primary text-white" : "bg-surface-subtle text-muted-strong group-hover:text-primary"
        }`}>
          <Icon className="size-4" strokeWidth={1.9} aria-hidden="true" />
        </span>
        {selected ? (
          <span className="grid size-5 place-items-center rounded-full bg-primary text-white">
            <Check className="size-3" strokeWidth={2.5} aria-hidden="true" />
          </span>
        ) : (
          <ChevronRight className="size-4 text-faint transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        )}
      </div>
      <h3 className="mt-3 text-[13px] font-bold text-foreground">{reportType.title}</h3>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{reportType.description}</p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-[11px] font-medium text-faint">
        <span>{reportType.frequency}</span>
        <span>{reportType.sectionCount} bo&apos;lim</span>
      </div>
    </button>
  );
}

function ReportBuilder({
  selectedType,
  range,
  format,
  status,
  progress,
  generatedReport,
  onTypeChange,
  onRangeChange,
  onFormatChange,
  onGenerate,
  onDownload,
}: {
  selectedType: ReportType;
  range: DateRangeValue;
  format: ReportFormat;
  status: GenerationStatus;
  progress: number;
  generatedReport: ReportHistoryItem | null;
  onTypeChange: (type: ReportTypeKey) => void;
  onRangeChange: (range: DateRangeValue) => void;
  onFormatChange: (format: ReportFormat) => void;
  onGenerate: () => void;
  onDownload: () => void;
}) {
  const SelectedIcon = reportTypeIcons[selectedType.iconKey];
  const progressStage =
    progress < 30
      ? "Ma'lumotlar yig'ilmoqda"
      : progress < 65
        ? "Ko'rsatkichlar hisoblanmoqda"
        : progress < 92
          ? "Hisobot formatlanmoqda"
          : "Fayl tayyorlanmoqda";

  return (
    <section className="mt-4 grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(23rem,0.92fr)]">
      <div className="rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="ui-label text-faint">1-qadam</p>
            <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">Hisobot turini tanlang</h2>
          </div>
          <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-bold text-muted">6 tur</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {reportTypes.map((reportType) => (
            <ReportTypeCard
              key={reportType.key}
              reportType={reportType}
              selected={selectedType.key === reportType.key}
              onSelect={() => onTypeChange(reportType.key)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5">
        <div>
          <p className="ui-label text-faint">2-qadam</p>
          <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">Hisobot parametrlarini sozlang</h2>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-lg border border-primary/15 bg-primary-soft/60 p-3.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-white shadow-sm">
            <SelectedIcon className="size-[1.1rem]" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">{selectedType.title}</p>
            <p className="mt-0.5 truncate text-xs text-muted">{selectedType.description}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="text-xs font-bold text-muted-strong">Hisobot davri</label>
            <span className="text-[11px] font-medium text-faint">{formatReportPeriod(range)}</span>
          </div>
          <div className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-border bg-surface-muted/45 px-3">
            <div className="flex min-w-0 items-center gap-2">
              <CalendarDays className="size-4 shrink-0 text-muted" aria-hidden="true" />
              <span className="truncate text-xs font-semibold text-muted-strong">Sana oralig&apos;i</span>
            </div>
            <DateRangePicker
              value={range}
              onChange={(value) => value && onRangeChange(value)}
              minDate={MIN_REPORT_DATE}
              maxDate={DEMO_TODAY}
              presets={datePresets}
              triggerLabel="Davrni tanlang"
              dialogLabel="Hisobot davrini tanlang"
              align="right"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-bold text-muted-strong">Eksport formati</label>
          <div className="mt-2 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Eksport formati">
            {formatOptions.map((option) => {
              const Icon = option.icon;
              const active = format === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onFormatChange(option.key)}
                  className={`rounded-lg border px-2 py-3 text-center transition-all ${
                    active
                      ? "border-primary/35 bg-primary-soft text-primary ring-1 ring-primary/10"
                      : "border-border text-muted hover:border-border-strong hover:bg-surface-muted"
                  }`}
                >
                  <Icon className="mx-auto size-[1.1rem]" strokeWidth={1.9} aria-hidden="true" />
                  <span className={`mt-1.5 block text-xs font-bold ${active ? "text-primary" : "text-foreground"}`}>
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-[10px] font-medium text-faint">{option.detail}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <label className="text-xs font-bold text-muted-strong">Hisobot tarkibi</label>
            <span className="text-[11px] font-medium text-faint">{selectedType.sections.length} bo&apos;lim</span>
          </div>
          <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {selectedType.sections.map((section) => (
              <div className="flex min-w-0 items-center gap-2 rounded-md bg-surface-muted px-2.5 py-2" key={section}>
                <span className="grid size-4 shrink-0 place-items-center rounded-full bg-success-soft text-success">
                  <Check className="size-2.5" strokeWidth={3} aria-hidden="true" />
                </span>
                <span className="truncate text-[11px] font-semibold text-muted-strong">{section}</span>
              </div>
            ))}
          </div>
        </div>

        {status === "generating" && (
          <div className="mt-4 rounded-lg border border-primary/15 bg-primary-soft/55 p-3.5" role="status">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-primary">
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                {progressStage}
              </span>
              <span className="font-mono text-xs font-bold text-primary">{progress}%</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary/10">
              <div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {status === "ready" && generatedReport && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-success/15 bg-success-soft p-3.5" role="status">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-success text-white">
              <CheckCircle2 className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground">Hisobot muvaffaqiyatli yaratildi</p>
              <p className="mt-0.5 truncate text-[11px] text-muted">{generatedReport.id} · {generatedReport.size}</p>
            </div>
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-surface px-2.5 text-xs font-bold text-success shadow-sm ring-1 ring-success/15 hover:bg-success-soft"
            >
              {format === "pdf" ? <Printer className="size-3.5" aria-hidden="true" /> : <Download className="size-3.5" aria-hidden="true" />}
              {format === "pdf" ? "Ochish" : "Yuklash"}
            </button>
          </div>
        )}

        <button
          type="button"
          disabled={status === "generating"}
          onClick={onGenerate}
          className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-65"
        >
          {status === "generating" ? (
            <><LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> Yaratilmoqda...</>
          ) : status === "ready" ? (
            <><RefreshCw className="size-4" aria-hidden="true" /> Qayta yaratish</>
          ) : (
            <><Sparkles className="size-4" aria-hidden="true" /> Hisobotni yaratish</>
          )}
        </button>
      </div>
    </section>
  );
}

function ReportHistory({
  history,
  onExport,
}: {
  history: ReportHistoryItem[];
  onExport: (report: ReportHistoryItem) => void;
}) {
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const visibleHistory = history.filter((report) => filter === "all" || report.format === filter);

  return (
    <section className="mt-4 overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      <header className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="ui-label text-faint">Arxiv</p>
          <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">Oldingi hisobotlar</h2>
        </div>
        <div className="flex w-fit gap-1 rounded-md bg-surface-muted p-1" role="tablist" aria-label="Hisobot formati">
          {[
            { key: "all" as const, label: "Barchasi" },
            { key: "pdf" as const, label: "PDF" },
            { key: "excel" as const, label: "Excel" },
            { key: "csv" as const, label: "CSV" },
          ].map((option) => (
            <button
              type="button"
              role="tab"
              aria-selected={filter === option.key}
              key={option.key}
              onClick={() => setFilter(option.key)}
              className={`h-7 rounded px-2.5 text-xs font-bold transition-colors ${
                filter === option.key
                  ? "bg-surface text-foreground shadow-sm ring-1 ring-border"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[58rem] border-collapse text-left">
          <thead className="bg-surface-muted/70">
            <tr className="border-b border-border">
              <th className="px-5 py-3 ui-label text-faint">Hisobot</th>
              <th className="px-4 py-3 ui-label text-faint">Davr</th>
              <th className="px-4 py-3 ui-label text-faint">Format</th>
              <th className="px-4 py-3 ui-label text-faint">Hajm</th>
              <th className="px-4 py-3 ui-label text-faint">Yaratilgan</th>
              <th className="px-4 py-3 ui-label text-faint">Holat</th>
              <th className="px-5 py-3 text-right ui-label text-faint">Amal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visibleHistory.map((report) => {
              const reportType = reportTypes.find((item) => item.key === report.type) ?? reportTypes[0];
              const TypeIcon = reportTypeIcons[reportType.iconKey];
              return (
                <tr className="transition-colors hover:bg-surface-muted/40" key={report.id}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-md bg-surface-subtle text-primary">
                        <TypeIcon className="size-4" strokeWidth={1.9} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="max-w-64 truncate text-xs font-bold text-foreground">{report.title}</p>
                        <p className="mt-0.5 font-mono text-[10px] font-semibold text-faint">{report.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-xs font-medium text-muted">{report.period}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${formatBadgeClasses[report.format]}`}>
                      {report.format === "excel" ? "XLS" : report.format}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[11px] font-semibold text-muted-strong">{report.size}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-xs font-medium text-muted">{report.createdAt}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      report.status === "ready"
                        ? "bg-success-soft text-success"
                        : "bg-warning-soft text-warning"
                    }`}>
                      {report.status === "ready" ? <FileCheck2 className="size-3" aria-hidden="true" /> : <FileClock className="size-3" aria-hidden="true" />}
                      {report.status === "ready" ? "Tayyor" : "Rejada"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      disabled={report.status !== "ready"}
                      onClick={() => onExport(report)}
                      className="inline-grid size-8 place-items-center rounded-md border border-border bg-surface text-muted transition-colors hover:bg-surface-muted hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
                      aria-label={`${report.title} faylini ochish`}
                    >
                      {report.format === "pdf" ? <Printer className="size-3.5" aria-hidden="true" /> : <Download className="size-3.5" aria-hidden="true" />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ReportsView() {
  const [selectedTypeKey, setSelectedTypeKey] = useState<ReportTypeKey>("economic");
  const [range, setRange] = useState<DateRangeValue>(DEFAULT_RANGE);
  const [format, setFormat] = useState<ReportFormat>("pdf");
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [generatedReport, setGeneratedReport] = useState<ReportHistoryItem | null>(null);
  const [history, setHistory] = useState(initialReportHistory);
  const [exportNotice, setExportNotice] = useState("");

  const selectedType = useMemo(
    () => reportTypes.find((report) => report.key === selectedTypeKey) ?? reportTypes[0],
    [selectedTypeKey],
  );

  useEffect(() => {
    if (generationStatus !== "generating") return;

    let nextProgress = 0;
    let completionTimer: number | undefined;
    const interval = window.setInterval(() => {
      nextProgress = Math.min(nextProgress + 8, 100);
      setProgress(nextProgress);

      if (nextProgress !== 100) return;

      window.clearInterval(interval);
      const readyReport: ReportHistoryItem = {
        id: `RPT-${String(
          84 + Math.max(0, history.length - initialReportHistory.length),
        ).padStart(4, "0")}`,
        title: `${selectedType.title} hisoboti`,
        type: selectedType.key,
        period: formatReportPeriod(range),
        format,
        size: format === "pdf" ? "1.9 MB" : format === "excel" ? "612 KB" : "148 KB",
        createdAt: "Hozirgina",
        status: "ready",
      };

      completionTimer = window.setTimeout(() => {
        setGeneratedReport(readyReport);
        setHistory((currentHistory) => [readyReport, ...currentHistory]);
        setGenerationStatus("ready");
      }, 240);
    }, 170);

    return () => {
      window.clearInterval(interval);
      if (completionTimer) window.clearTimeout(completionTimer);
    };
  }, [format, generationStatus, history.length, range, selectedType]);

  function resetGeneration() {
    setGenerationStatus("idle");
    setProgress(0);
    setGeneratedReport(null);
    setExportNotice("");
  }

  function handleTypeChange(type: ReportTypeKey) {
    setSelectedTypeKey(type);
    resetGeneration();
  }

  function handleRangeChange(nextRange: DateRangeValue) {
    setRange(nextRange);
    resetGeneration();
  }

  function handleFormatChange(nextFormat: ReportFormat) {
    setFormat(nextFormat);
    resetGeneration();
  }

  function handleGenerate() {
    setProgress(0);
    setGeneratedReport(null);
    setExportNotice("");
    setGenerationStatus("generating");
  }

  function handleExport(report: ReportHistoryItem) {
    const reportType = reportTypes.find((item) => item.key === report.type) ?? reportTypes[0];
    const opened = exportReport(report, reportType);
    setExportNotice(
      opened
        ? report.format === "pdf"
          ? "PDF preview yangi oynada ochildi. Print oynasidan PDF sifatida saqlashingiz mumkin."
          : `${report.format === "excel" ? "Excel" : "CSV"} fayli yuklandi.`
        : "Preview oynasi bloklandi. Brauzerda pop-up oynalarga ruxsat bering.",
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl pb-2">
      <PageHeader
        eyebrow="Hisobot va eksport"
        title="Hisobotlar markazi"
        description="Texnologik va iqtisodiy natijalarni tanlangan davr bo'yicha jamlang, eksport qiling va tarixini boshqaring."
        action={
          <div className="inline-flex h-9 items-center gap-2 rounded-lg border border-success/15 bg-success-soft px-3 text-[13px] font-bold text-success shadow-sm">
            <CalendarClock className="size-3.5" aria-hidden="true" />
            3 ta avtomatik hisobot
          </div>
        }
      />

      <DemoNotice
        title="Bu sahifa namoyish rejimida ishlaydi"
        description="Hisobot mazmuni oldindan tayyorlangan namuna ma'lumotdan olinadi va bazadagi haqiqiy ko'rsatkichlarga bog'lanmagan. Real hisobot generatsiyasi (PDF/XLSX va AI xulosasi) keyingi bosqichda qo'shiladi."
      />

      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Hisobotlar umumiy ko'rsatkichlari">
        <SummaryCard label="Jami hisobotlar" value="24" detail="shu oyda" icon={FileBarChart} iconClass="bg-primary-soft text-primary" />
        <SummaryCard label="Avtomatik jadval" value="3" detail="faol reja" icon={CalendarClock} iconClass="bg-accent-soft text-accent" />
        <SummaryCard label="So'nggi hisobot" value="20:42" detail="bugun" icon={Clock3} iconClass="bg-info-soft text-info" />
        <SummaryCard label="Ma'lumot qamrovi" value="8/8" detail="asosiy bo'lim" icon={ShieldCheck} iconClass="bg-success-soft text-success" />
      </section>

      <ReportBuilder
        selectedType={selectedType}
        range={range}
        format={format}
        status={generationStatus}
        progress={progress}
        generatedReport={generatedReport}
        onTypeChange={handleTypeChange}
        onRangeChange={handleRangeChange}
        onFormatChange={handleFormatChange}
        onGenerate={handleGenerate}
        onDownload={() => generatedReport && handleExport(generatedReport)}
      />

      {exportNotice && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-info/15 bg-info-soft px-4 py-3 text-xs font-semibold text-info" role="status">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
          {exportNotice}
        </div>
      )}

      <ReportHistory history={history} onExport={handleExport} />

      <div className="mt-4 flex flex-col gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-xs leading-5 text-muted shadow-card sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2">
          <FileCheck2 className="size-4 shrink-0 text-primary" aria-hidden="true" />
          Demo eksport brauzer ichida ishlaydi; backend ulanganda fayllar tashkilot arxivida saqlanadi.
        </span>
        <span className="shrink-0 font-mono text-[11px] font-bold text-muted-strong">Oxirgi sinxronlash: 20:42</span>
      </div>
    </div>
  );
}
