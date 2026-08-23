import {
  isEmptyValue,
  parseBooleanValue,
  parseDateValue,
  parseNumeric,
  type RawCell,
} from "@/lib/parsing/values";

import { QUALITY_WEIGHTS, type InferredType } from "./profile";

/**
 * Ma'lumotni tozalash.
 *
 * Barcha amallar deterministik va tushuntiriladigan:
 *  - bo'sh raqam → ustun **medianasi** (o'rtacha emas: median outlier'ga chidamli)
 *  - bo'sh matn  → "Aniqlanmagan" (yangi ma'lumot o'ylab topilmaydi)
 *  - format xatosi → normallashtirish ("1,424" → 1.424)
 *  - o'lchov birligi → `unitScale` ko'paytuvchisi (so'm → mln so'm)
 *  - outlier → IQR chegarasida kesish (winsorization, qator o'chirilmaydi)
 *  - dublikat → birinchi nusxa saqlanadi, qolgani chiqarib tashlanadi
 *  - sanasi yo'q qator → vaqt o'qiga joylashtirib bo'lmaydi, chiqarib tashlanadi
 */

export type CleanColumnSpec = {
  position: number;
  sourceName: string;
  canonicalKey: string | null;
  dataType: InferredType;
  unitScale: number | null;
};

export type CleaningStageKey =
  | "structure"
  | "missing"
  | "duplicate"
  | "format"
  | "outlier";

export type CleaningStage = {
  key: CleaningStageKey;
  label: string;
  description: string;
  affected: number;
};

export type CleanValue = string | number | boolean | null;

export type CleanedRow = {
  rowIndex: number;
  /** `null` — qator chiqarib tashlandi */
  clean: Record<string, CleanValue> | null;
  issues: string[];
};

export type CleaningOutcome = {
  rows: CleanedRow[];
  stages: CleaningStage[];
  qualityAfter: number;
  breakdownAfter: {
    completeness: number;
    validity: number;
    uniqueness: number;
    consistency: number;
    usability: number;
  };
  validRowsAfter: number;
  droppedDuplicates: number;
  droppedInvalid: number;
};

type NormalizedCell = {
  value: CleanValue;
  wasEmpty: boolean;
  /** Format tuzatildi ("1,424" → 1.424) */
  wasFixed: boolean;
  /** O'lchov birligi kanonik birlikka keltirildi (so'm → mln so'm) */
  wasScaled: boolean;
  wasInvalid: boolean;
};

function median(sorted: number[]) {
  if (sorted.length === 0) return null;
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function quantile(sorted: number[], fraction: number) {
  if (sorted.length === 0) return null;
  if (sorted.length === 1) return sorted[0];

  const position = (sorted.length - 1) * fraction;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);

  if (lower === upper) return sorted[lower];

  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

function mostFrequent<T extends string | boolean>(values: T[]): T | null {
  if (values.length === 0) return null;

  const counts = new Map<T, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  let best: T | null = null;
  let bestCount = -1;

  for (const [value, count] of counts) {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  }

  return best;
}

/** Bitta katakni ustun tipiga qarab normallashtiradi. */
function normalizeCell(value: RawCell, column: CleanColumnSpec): NormalizedCell {
  if (isEmptyValue(value)) {
    return {
      value: null,
      wasEmpty: true,
      wasFixed: false,
      wasScaled: false,
      wasInvalid: false,
    };
  }

  if (column.dataType === "NUMBER") {
    const parsed = parseNumeric(value);

    if (parsed.value === null) {
      return {
        value: null,
        wasEmpty: false,
        wasFixed: false,
        wasScaled: false,
        wasInvalid: true,
      };
    }

    const scale = column.unitScale ?? 1;

    return {
      value: parsed.value * scale,
      wasEmpty: false,
      wasFixed: parsed.coerced,
      wasScaled: scale !== 1,
      wasInvalid: false,
    };
  }

  if (column.dataType === "DATE") {
    const parsed = parseDateValue(value);

    if (parsed.value === null) {
      return {
        value: null,
        wasEmpty: false,
        wasFixed: false,
        wasScaled: false,
        wasInvalid: true,
      };
    }

    const iso = parsed.value.toISOString().slice(0, 10);

    return {
      value: iso,
      wasEmpty: false,
      wasFixed: String(value).slice(0, 10) !== iso,
      wasScaled: false,
      wasInvalid: false,
    };
  }

  if (column.dataType === "BOOLEAN") {
    const parsed = parseBooleanValue(value);

    if (parsed === null) {
      return {
        value: null,
        wasEmpty: false,
        wasFixed: false,
        wasScaled: false,
        wasInvalid: true,
      };
    }

    // Matnli faylda "ha"/"yo'q" ni mantiqiy qiymatga o'girish — bu oddiy
    // o'qish, xato tuzatish emas. Shuning uchun "format tuzatildi" deb
    // sanalmaydi; faqat umuman o'qib bo'lmagan qiymatlar hisobga olinadi.
    return {
      value: parsed,
      wasEmpty: false,
      wasFixed: false,
      wasScaled: false,
      wasInvalid: false,
    };
  }

  const text = String(value).trim();

  return {
    value: text,
    wasEmpty: false,
    wasFixed: text !== String(value),
    wasScaled: false,
    wasInvalid: false,
  };
}

export function cleanTable(input: {
  columns: CleanColumnSpec[];
  rows: Array<{ rowIndex: number; raw: RawCell[]; isDuplicate: boolean }>;
}): CleaningOutcome {
  const { columns, rows } = input;

  // --- 1-bosqich: normallashtirish ---
  const normalized = rows.map((row) => ({
    rowIndex: row.rowIndex,
    isDuplicate: row.isDuplicate,
    cells: columns.map((column) =>
      normalizeCell(row.raw[column.position] ?? null, column),
    ),
  }));

  // --- 2-bosqich: ustun statistikasi (dublikatsiz qatorlar bo'yicha) ---
  const stats = columns.map((column, columnIndex) => {
    const numbers: number[] = [];
    const texts: string[] = [];
    const booleans: boolean[] = [];

    for (const row of normalized) {
      if (row.isDuplicate) continue;

      const cell = row.cells[columnIndex];
      if (cell.value === null) continue;

      if (typeof cell.value === "number") numbers.push(cell.value);
      else if (typeof cell.value === "boolean") booleans.push(cell.value);
      else texts.push(cell.value);
    }

    const sorted = [...numbers].sort((a, b) => a - b);
    const q1 = quantile(sorted, 0.25);
    const q3 = quantile(sorted, 0.75);
    const iqr = q1 !== null && q3 !== null ? q3 - q1 : null;

    return {
      column,
      median: median(sorted),
      lowerBound: iqr && iqr > 0 && q1 !== null ? q1 - 1.5 * iqr : null,
      upperBound: iqr && iqr > 0 && q3 !== null ? q3 + 1.5 * iqr : null,
      textMode: mostFrequent(texts),
      booleanMode: mostFrequent(booleans),
    };
  });

  const hasDateColumn = columns.some((column) => column.dataType === "DATE");

  // --- 3-bosqich: to'ldirish, tuzatish, kesish ---
  let filledCount = 0;
  let fixedCount = 0;
  let scaledCount = 0;
  let winsorizedCount = 0;
  let droppedDuplicates = 0;
  let droppedInvalid = 0;

  const cleanedRows: CleanedRow[] = normalized.map((row) => {
    if (row.isDuplicate) {
      droppedDuplicates += 1;
      return {
        rowIndex: row.rowIndex,
        clean: null,
        issues: ["duplicate"],
      };
    }

    // Sanasiz qatorni vaqt o'qiga qo'yib bo'lmaydi.
    if (hasDateColumn) {
      const dateMissing = columns.some((column, columnIndex) => {
        if (column.dataType !== "DATE") return false;
        return row.cells[columnIndex].value === null;
      });

      if (dateMissing) {
        droppedInvalid += 1;
        return {
          rowIndex: row.rowIndex,
          clean: null,
          issues: ["missing_date"],
        };
      }
    }

    const clean: Record<string, CleanValue> = {};
    const issues: string[] = [];

    columns.forEach((column, columnIndex) => {
      const cell = row.cells[columnIndex];
      const stat = stats[columnIndex];
      const key = column.canonicalKey ?? column.sourceName;

      let value = cell.value;

      if (cell.wasFixed) {
        fixedCount += 1;
        issues.push(`format:${key}`);
      }

      if (cell.wasScaled) {
        scaledCount += 1;
        issues.push(`scale:${key}`);
      }

      if (value === null) {
        if (column.dataType === "NUMBER" && stat.median !== null) {
          value = stat.median;
        } else if (column.dataType === "BOOLEAN" && stat.booleanMode !== null) {
          value = stat.booleanMode;
        } else if (column.dataType === "TEXT") {
          value = stat.textMode ?? "Aniqlanmagan";
        }

        if (value !== null) {
          filledCount += 1;
          issues.push(cell.wasInvalid ? `invalid:${key}` : `missing:${key}`);
        }
      } else if (
        typeof value === "number" &&
        stat.lowerBound !== null &&
        stat.upperBound !== null
      ) {
        if (value < stat.lowerBound) {
          value = stat.lowerBound;
          winsorizedCount += 1;
          issues.push(`outlier:${key}`);
        } else if (value > stat.upperBound) {
          value = stat.upperBound;
          winsorizedCount += 1;
          issues.push(`outlier:${key}`);
        }
      }

      clean[key] = value;
    });

    return { rowIndex: row.rowIndex, clean, issues };
  });

  // --- Tozalashdan keyingi sifat ---
  const keptRows = cleanedRows.filter((row) => row.clean !== null).length;
  const totalRows = rows.length;

  // Tozalangan qatorlarda bo'sh yoki yaroqsiz katak qolmaydi; hisob
  // profiling bilan bir xil formula bo'yicha yuritiladi.
  const remainingEmptyCells = cleanedRows.reduce((total, row) => {
    if (!row.clean) return total;
    return (
      total + Object.values(row.clean).filter((value) => value === null).length
    );
  }, 0);

  const keptCells = keptRows * columns.length;
  const asPercent = (value: number) => Math.round(value * 1000) / 10;

  const completeness =
    keptCells > 0 ? 1 - remainingEmptyCells / keptCells : 1;
  const validity = 1;
  const uniqueness =
    totalRows > 0 ? 1 - droppedDuplicates / totalRows : 1;
  const consistency = 1;
  const usability = totalRows > 0 ? keptRows / totalRows : 1;

  const qualityAfter = Math.round(
    (QUALITY_WEIGHTS.completeness * completeness +
      QUALITY_WEIGHTS.validity * validity +
      QUALITY_WEIGHTS.uniqueness * uniqueness +
      QUALITY_WEIGHTS.consistency * consistency +
      QUALITY_WEIGHTS.usability * usability) *
      100,
  );

  const stages: CleaningStage[] = [
    {
      key: "structure",
      label: "Tuzilmani tekshirish",
      description: `${columns.length} ta ustun va ${totalRows} ta qator tekshirildi`,
      affected: columns.length,
    },
    {
      key: "missing",
      label: "Bo'sh qiymatlar",
      description: "Raqamlar median, matnlar eng ko'p uchraydigan qiymat bilan to'ldirildi",
      affected: filledCount,
    },
    {
      key: "duplicate",
      label: "Dublikatlar",
      description: "Takroriy yozuvlar chiqarib tashlandi, birinchi nusxa saqlandi",
      affected: droppedDuplicates,
    },
    {
      key: "format",
      label: "Tip va formatlar",
      description:
        scaledCount > 0
          ? `Raqam va sana formati tuzatildi; ${scaledCount} ta qiymat kanonik o'lchov birligiga keltirildi`
          : "Raqam va sana formati standartlashtirildi",
      affected: fixedCount,
    },
    {
      key: "outlier",
      label: "Outlier nazorati",
      description: "IQR chegarasidan chiqqan qiymatlar chegarada kesildi",
      affected: winsorizedCount,
    },
  ];

  return {
    rows: cleanedRows,
    stages,
    qualityAfter,
    breakdownAfter: {
      completeness: asPercent(completeness),
      validity: asPercent(validity),
      uniqueness: asPercent(uniqueness),
      consistency: asPercent(consistency),
      usability: asPercent(usability),
    },
    validRowsAfter: keptRows,
    droppedDuplicates,
    droppedInvalid,
  };
}
