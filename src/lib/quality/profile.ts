import type { ParsedTable } from "@/lib/parsing/parse-file";
import {
  isEmptyValue,
  parseBooleanValue,
  parseDateValue,
  parseNumeric,
  toStorableValue,
  type RawCell,
} from "@/lib/parsing/values";

/**
 * Ma'lumot sifatini profiling qilish.
 *
 * Bu qatlamda AI ishlatilmaydi — barcha ko'rsatkich deterministik hisoblanadi,
 * shuning uchun natija takrorlanadigan va tekshiriladigan bo'ladi.
 */

export type InferredType = "DATE" | "NUMBER" | "TEXT" | "BOOLEAN" | "UNKNOWN";

export type ColumnProfile = {
  position: number;
  sourceName: string;
  dataType: InferredType;
  nullCount: number;
  /** Qiymat bor, lekin ustun tipiga umuman mos kelmagan kataklar */
  invalidCount: number;
  /** Format noto'g'ri, lekin avtomatik tuzatiladi ("1,424", "1 240") */
  coercedCount: number;
  distinctCount: number;
  minValue: number | null;
  maxValue: number | null;
  meanValue: number | null;
  stdDev: number | null;
  q1: number | null;
  q3: number | null;
  outlierCount: number;
  sampleValues: Array<string | number | boolean | null>;
};

export type TableProfile = {
  columns: ColumnProfile[];
  rowCount: number;
  /** Takroriy qatorlarning indekslari (birinchi nusxa saqlanadi) */
  duplicateRowIndexes: number[];
  /** Hech qanday muammosi bo'lmagan qatorlar soni */
  validRows: number;
  qualityScore: number;
  breakdown: {
    completeness: number;
    validity: number;
    uniqueness: number;
    consistency: number;
    usability: number;
  };
};

const TYPE_CONFIDENCE_THRESHOLD = 0.7;
const SAMPLE_LIMIT = 200;

function inferType(values: RawCell[]): InferredType {
  const filled = values.filter((value) => !isEmptyValue(value));

  if (filled.length === 0) return "UNKNOWN";

  const sample = filled.slice(0, SAMPLE_LIMIT);

  let dateCount = 0;
  let numberCount = 0;
  let booleanCount = 0;

  for (const value of sample) {
    if (parseDateValue(value).value !== null) dateCount += 1;
    if (parseNumeric(value).value !== null) numberCount += 1;
    if (parseBooleanValue(value) !== null) booleanCount += 1;
  }

  const total = sample.length;

  // Sana tekshiruvi birinchi: "2026-08-19" raqam sifatida o'qilmasligi kerak.
  if (dateCount / total >= TYPE_CONFIDENCE_THRESHOLD) return "DATE";
  if (numberCount / total >= TYPE_CONFIDENCE_THRESHOLD) return "NUMBER";
  if (booleanCount / total >= 0.9) return "BOOLEAN";

  return "TEXT";
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

function profileColumn(
  sourceName: string,
  position: number,
  values: RawCell[],
): ColumnProfile {
  const dataType = inferType(values);

  let nullCount = 0;
  let invalidCount = 0;
  let coercedCount = 0;
  const distinct = new Set<string>();
  const numbers: number[] = [];

  for (const value of values) {
    if (isEmptyValue(value)) {
      nullCount += 1;
      continue;
    }

    distinct.add(String(toStorableValue(value)));

    if (dataType === "NUMBER") {
      const parsed = parseNumeric(value);
      if (parsed.value === null) {
        invalidCount += 1;
      } else {
        if (parsed.coerced) coercedCount += 1;
        numbers.push(parsed.value);
      }
    } else if (dataType === "DATE") {
      if (parseDateValue(value).value === null) invalidCount += 1;
    } else if (dataType === "BOOLEAN") {
      if (parseBooleanValue(value) === null) invalidCount += 1;
    }
  }

  const sampleValues = values
    .filter((value) => !isEmptyValue(value))
    .slice(0, 8)
    .map(toStorableValue);

  if (numbers.length === 0) {
    return {
      position,
      sourceName,
      dataType,
      nullCount,
      invalidCount,
      coercedCount,
      distinctCount: distinct.size,
      minValue: null,
      maxValue: null,
      meanValue: null,
      stdDev: null,
      q1: null,
      q3: null,
      outlierCount: 0,
      sampleValues,
    };
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  const mean = numbers.reduce((total, value) => total + value, 0) / numbers.length;
  const variance =
    numbers.reduce((total, value) => total + (value - mean) ** 2, 0) /
    numbers.length;

  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);

  // Tukey IQR qoidasi — statistikada standart outlier chegarasi.
  let outlierCount = 0;

  if (q1 !== null && q3 !== null) {
    const iqr = q3 - q1;

    if (iqr > 0) {
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      outlierCount = numbers.filter(
        (value) => value < lowerBound || value > upperBound,
      ).length;
    }
  }

  return {
    position,
    sourceName,
    dataType,
    nullCount,
    invalidCount,
    coercedCount,
    distinctCount: distinct.size,
    minValue: sorted[0],
    maxValue: sorted[sorted.length - 1],
    meanValue: mean,
    stdDev: Math.sqrt(variance),
    q1,
    q3,
    outlierCount,
    sampleValues,
  };
}

function findDuplicateRowIndexes(rows: RawCell[][]) {
  const seen = new Set<string>();
  const duplicates: number[] = [];

  rows.forEach((row, index) => {
    const fingerprint = JSON.stringify(row.map(toStorableValue));

    if (seen.has(fingerprint)) {
      duplicates.push(index);
      return;
    }

    seen.add(fingerprint);
  });

  return duplicates;
}

/**
 * Umumiy sifat balli — besh komponentning vaznli o'rtachasi.
 * Har bir komponent alohida ko'rsatiladi, shuning uchun ball "qora quti" emas.
 *
 * Vaznlarning eng kattasi `usability` da: bitta nuqsonli katak butun qatorni
 * tahlilga yaroqsiz qiladi, shuning uchun katak darajasidagi to'liqlik yolg'iz
 * o'zi ma'lumot sifatini haddan tashqari optimistik ko'rsatadi.
 */
export const QUALITY_WEIGHTS = {
  /** Yaroqli qatorlar ulushi — dublikatsiz, bo'sh va xato kataksiz */
  usability: 0.3,
  /** To'ldirilgan kataklar ulushi */
  completeness: 0.25,
  /** Tipga mos kataklar ulushi */
  validity: 0.2,
  /** Takrorlanmagan qatorlar ulushi */
  uniqueness: 0.15,
  /** Statistik chegara ichidagi qiymatlar ulushi */
  consistency: 0.1,
} as const;

function calculateQualityScore(input: {
  totalCells: number;
  missingCells: number;
  invalidCells: number;
  numericCells: number;
  outlierCells: number;
  rowCount: number;
  duplicateRows: number;
  validRows: number;
}) {
  const safeRatio = (part: number, whole: number) =>
    whole > 0 ? Math.min(1, Math.max(0, 1 - part / whole)) : 1;

  const completeness = safeRatio(input.missingCells, input.totalCells);
  const validity = safeRatio(input.invalidCells, input.totalCells);
  const uniqueness = safeRatio(input.duplicateRows, input.rowCount);
  const consistency = safeRatio(input.outlierCells, input.numericCells);
  const usability =
    input.rowCount > 0 ? input.validRows / input.rowCount : 1;

  const score =
    QUALITY_WEIGHTS.completeness * completeness +
    QUALITY_WEIGHTS.validity * validity +
    QUALITY_WEIGHTS.uniqueness * uniqueness +
    QUALITY_WEIGHTS.consistency * consistency +
    QUALITY_WEIGHTS.usability * usability;

  const asPercent = (value: number) => Math.round(value * 1000) / 10;

  return {
    qualityScore: Math.round(score * 100),
    breakdown: {
      completeness: asPercent(completeness),
      validity: asPercent(validity),
      uniqueness: asPercent(uniqueness),
      consistency: asPercent(consistency),
      usability: asPercent(usability),
    },
  };
}

export function profileTable(table: ParsedTable): TableProfile {
  const { headers, rows } = table;

  const columns = headers.map((sourceName, position) =>
    profileColumn(
      sourceName,
      position,
      rows.map((row) => row[position] ?? null),
    ),
  );

  const duplicateRowIndexes = findDuplicateRowIndexes(rows);
  const duplicateSet = new Set(duplicateRowIndexes);

  const totalCells = rows.length * headers.length;
  const missingCells = columns.reduce(
    (total, column) => total + column.nullCount,
    0,
  );
  // Tuzatib bo'lmaydigan xato to'liq, avtomatik tuzatiladigani yarim vaznda.
  const invalidCells = columns.reduce(
    (total, column) => total + column.invalidCount + column.coercedCount * 0.5,
    0,
  );
  const outlierCells = columns.reduce(
    (total, column) => total + column.outlierCount,
    0,
  );
  const numericCells = columns
    .filter((column) => column.dataType === "NUMBER")
    .reduce((total, column) => total + (rows.length - column.nullCount), 0);

  // Muammosiz qatorlar: dublikat emas, bo'sh yoki yaroqsiz kataksiz.
  let validRows = 0;

  rows.forEach((row, index) => {
    if (duplicateSet.has(index)) return;

    const hasProblem = columns.some((column) => {
      const value = row[column.position] ?? null;
      if (isEmptyValue(value)) return true;

      if (column.dataType === "NUMBER") return parseNumeric(value).value === null;
      if (column.dataType === "DATE") return parseDateValue(value).value === null;

      return false;
    });

    if (!hasProblem) validRows += 1;
  });

  const { qualityScore, breakdown } = calculateQualityScore({
    totalCells,
    missingCells,
    invalidCells,
    numericCells,
    outlierCells,
    rowCount: rows.length,
    duplicateRows: duplicateRowIndexes.length,
    validRows,
  });

  return {
    columns,
    rowCount: rows.length,
    duplicateRowIndexes,
    validRows,
    qualityScore,
    breakdown,
  };
}
