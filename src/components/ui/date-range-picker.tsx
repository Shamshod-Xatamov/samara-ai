"use client";

import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export type DateRangeValue = {
  from: Date;
  to: Date;
};

type DraftRange = {
  from: Date | null;
  to: Date | null;
};

type DateRangePreset = {
  label: string;
  from: Date;
  to: Date;
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function sameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function isBetween(day: Date, from: Date, to: Date) {
  const time = startOfDay(day).getTime();
  return time > startOfDay(from).getTime() && time < startOfDay(to).getTime();
}

export function formatCompactDateRange(range: DateRangeValue, locale = "uz-UZ") {
  const sameYear = range.from.getFullYear() === range.to.getFullYear();
  const sameMonth = sameYear && range.from.getMonth() === range.to.getMonth();
  const month = new Intl.DateTimeFormat(locale, { month: "short" });

  if (sameMonth) {
    return `${range.from.getDate()}–${range.to.getDate()} ${month.format(range.to)}`;
  }

  const dayMonth = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
  });

  if (sameYear) {
    return `${dayMonth.format(range.from)} – ${dayMonth.format(range.to)}`;
  }

  const full = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${full.format(range.from)} – ${full.format(range.to)}`;
}

export function DateRangePicker({
  value,
  onChange,
  minDate,
  maxDate,
  presets = [],
  triggerLabel = "Boshqa davr",
  dialogLabel = "Sana oralig'ini tanlang",
  align = "right",
}: {
  value: DateRangeValue | null;
  onChange: (value: DateRangeValue | null) => void;
  minDate?: Date;
  maxDate?: Date;
  presets?: DateRangePreset[];
  triggerLabel?: string;
  dialogLabel?: string;
  align?: "left" | "right";
}) {
  const floor = useMemo(() => (minDate ? startOfDay(minDate) : null), [minDate]);
  const cap = useMemo(
    () => startOfDay(maxDate ?? new Date()),
    [maxDate],
  );
  const initialAnchor = value?.from ?? floor ?? cap;
  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(initialAnchor));
  const [draft, setDraft] = useState<DraftRange>({
    from: value?.from ?? null,
    to: value?.to ?? null,
  });
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const weekdayLabels = useMemo(() => {
    const monday = new Date(2024, 0, 1);
    return Array.from({ length: 7 }, (_, index) =>
      new Intl.DateTimeFormat("uz-UZ", { weekday: "narrow" }).format(
        addDays(monday, index),
      ),
    );
  }, []);

  const days = useMemo(() => {
    const mondayOffset = (viewMonth.getDay() + 6) % 7;
    const firstCell = addDays(viewMonth, -mondayOffset);
    return Array.from({ length: 42 }, (_, index) => addDays(firstCell, index));
  }, [viewMonth]);

  const monthLabel = new Intl.DateTimeFormat("uz-UZ", {
    month: "long",
    year: "numeric",
  }).format(viewMonth);
  const previewEnd =
    draft.from && !draft.to && hoveredDay && hoveredDay > draft.from
      ? hoveredDay
      : null;
  const effectiveEnd = draft.to ?? previewEnd;
  const earliestMonth = floor ? startOfMonth(floor) : null;
  const latestMonth = startOfMonth(cap);
  const canGoPrevious =
    !earliestMonth || viewMonth.getTime() > earliestMonth.getTime();
  const canGoNext = viewMonth.getTime() < latestMonth.getTime();
  const resolvedTriggerLabel = value
    ? formatCompactDateRange(value)
    : triggerLabel;

  function togglePicker() {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    const anchor = value?.from ?? floor ?? cap;
    setDraft({ from: value?.from ?? null, to: value?.to ?? null });
    setHoveredDay(null);
    setViewMonth(startOfMonth(anchor));
    setIsOpen(true);
  }

  function isDisabled(day: Date) {
    const time = startOfDay(day).getTime();
    return time > cap.getTime() || Boolean(floor && time < floor.getTime());
  }

  function selectDay(date: Date) {
    const day = startOfDay(date);
    if (isDisabled(day)) return;

    if (!draft.from || draft.to) {
      setDraft({ from: day, to: null });
      setHoveredDay(null);
      return;
    }

    if (day.getTime() < draft.from.getTime()) {
      setDraft({ from: day, to: draft.from });
    } else {
      setDraft({ from: draft.from, to: day });
    }
    setHoveredDay(null);
  }

  function applyRange() {
    if (!draft.from) return;
    onChange({ from: draft.from, to: draft.to ?? draft.from });
    setIsOpen(false);
  }

  function clearRange() {
    onChange(null);
    setDraft({ from: null, to: null });
    setHoveredDay(null);
    setIsOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={togglePicker}
        aria-label="Maxsus prognoz davrini tanlash"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-pressed={value !== null}
        className={`inline-flex h-8 items-center gap-1.5 rounded px-2.5 text-xs font-bold transition-colors ${
          value
            ? "bg-accent-soft text-accent ring-1 ring-inset ring-accent/20"
            : "text-muted hover:bg-surface-muted hover:text-foreground"
        }`}
      >
        <CalendarDays className="size-3.5" aria-hidden="true" />
        <span className="max-w-36 truncate">{resolvedTriggerLabel}</span>
        <ChevronDown
          className={`size-3.5 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="false"
          aria-label={dialogLabel}
          tabIndex={-1}
          className={`rise-in absolute top-full z-50 mt-2 w-[19.75rem] max-w-[calc(100vw-2rem)] select-none rounded-xl border border-border bg-surface p-3 shadow-floating outline-none ${
            align === "left" ? "left-0" : "right-0"
          }`}
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="ui-label text-faint">{dialogLabel}</span>
            {value && (
              <button
                type="button"
                onClick={clearRange}
                className="rounded-md px-2 py-1 text-xs font-semibold text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                Tozalash
              </button>
            )}
          </div>

          <div className="my-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Oldingi oy"
              disabled={!canGoPrevious}
              onClick={() =>
                setViewMonth(
                  new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1),
                )
              }
              className="grid size-8 place-items-center rounded-md text-muted transition-colors hover:bg-surface-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <span className="text-sm font-bold capitalize text-foreground">
              {monthLabel}
            </span>
            <button
              type="button"
              aria-label="Keyingi oy"
              disabled={!canGoNext}
              onClick={() =>
                setViewMonth(
                  new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1),
                )
              }
              className="grid size-8 place-items-center rounded-md text-muted transition-colors hover:bg-surface-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7">
            {weekdayLabels.map((label, index) => (
              <span
                className="py-1 text-center font-mono text-[11px] font-bold uppercase text-faint"
                key={`${label}-${index}`}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {days.map((day) => {
              const inMonth = day.getMonth() === viewMonth.getMonth();
              const disabled = isDisabled(day);
              const isStart = Boolean(draft.from && sameDay(day, draft.from));
              const isEnd = Boolean(effectiveEnd && sameDay(day, effectiveEnd));
              const inRange = Boolean(
                draft.from && effectiveEnd && isBetween(day, draft.from, effectiveEnd),
              );

              return (
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={new Intl.DateTimeFormat("uz-UZ", {
                    dateStyle: "full",
                  }).format(day)}
                  aria-pressed={isStart || isEnd}
                  onClick={() => selectDay(day)}
                  onMouseEnter={() => !disabled && setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`relative flex h-8 items-center justify-center rounded-md font-mono text-[11px] font-medium transition-colors focus-visible:z-10 ${
                    !inMonth ? "text-faint/45" : "text-foreground"
                  } ${disabled ? "cursor-not-allowed text-faint/25" : ""} ${
                    inRange ? "rounded-none bg-primary-soft text-primary" : ""
                  } ${
                    isStart || isEnd
                      ? "bg-primary font-bold text-white shadow-sm"
                      : ""
                  } ${
                    !disabled && !inRange && !isStart && !isEnd
                      ? "hover:bg-surface-muted"
                      : ""
                  }`}
                  key={day.toISOString()}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 border-t border-border pt-3">
            {presets.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {presets.map((preset) => (
                  <button
                    type="button"
                    onClick={() => {
                      setDraft({
                        from: startOfDay(preset.from),
                        to: startOfDay(preset.to),
                      });
                      setHoveredDay(null);
                      setViewMonth(startOfMonth(preset.from));
                    }}
                    className="rounded-md border border-border px-2 py-1 text-[11px] font-semibold text-muted transition-colors hover:border-border-strong hover:bg-surface-muted hover:text-foreground"
                    key={preset.label}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <span className="min-w-0 truncate text-[11px] font-medium text-faint">
                {draft.from
                  ? `Tanlandi: ${formatCompactDateRange({
                      from: draft.from,
                      to: draft.to ?? draft.from,
                    })}`
                  : "Boshlanish va tugash sanasini tanlang"}
              </span>
              <button
                type="button"
                disabled={!draft.from}
                onClick={applyRange}
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                Qo&apos;llash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
