import ExcelJS from "exceljs";
import Papa from "papaparse";

import type { RawCell } from "./values";

export const MAX_FILE_SIZE = 15 * 1024 * 1024;
export const MAX_ROWS = 100_000;
export const ACCEPTED_EXTENSIONS = ["csv", "xlsx"] as const;

export type ParsedTable = {
  headers: string[];
  rows: RawCell[][];
  /** MAX_ROWS chegarasi sababli tashlab yuborilgan qatorlar soni */
  truncatedRows: number;
};

export class ParseError extends Error {}

/** ExcelJS turli ko'rinishdagi obyektlar qaytaradi — hammasini oddiy qiymatga keltiramiz. */
function normalizeExcelCell(value: unknown): RawCell {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value;

  const type = typeof value;
  if (type === "string" || type === "number" || type === "boolean") {
    return value as RawCell;
  }

  if (type === "object") {
    const cell = value as Record<string, unknown>;

    // Formula kataklarida hisoblangan natija olinadi.
    if ("result" in cell) return normalizeExcelCell(cell.result);
    if ("text" in cell && typeof cell.text === "string") return cell.text;

    if (Array.isArray(cell.richText)) {
      return cell.richText
        .map((part) => (part as { text?: string }).text ?? "")
        .join("");
    }

    // Excel xato kataklari (#N/A, #DIV/0!) — bo'sh emas, lekin yaroqsiz.
    if ("error" in cell) return String(cell.error);
  }

  return String(value);
}

function cleanHeader(value: RawCell, index: number) {
  const text = value === null ? "" : String(value).trim();

  return text || `Ustun ${index + 1}`;
}

function isBlankRow(row: RawCell[]) {
  return row.every(
    (cell) => cell === null || (typeof cell === "string" && cell.trim() === ""),
  );
}

export function parseCsvBuffer(buffer: Buffer): ParsedTable {
  const text = buffer.toString("utf8").replace(/^﻿/, "");

  const result = Papa.parse<string[]>(text, {
    header: false,
    skipEmptyLines: "greedy",
    // Ajratgichni papaparse o'zi aniqlaydi (`,` `;` `\t`).
  });

  const table = result.data.filter((row) => Array.isArray(row));

  if (table.length === 0) {
    throw new ParseError("Faylda o'qish mumkin bo'lgan ma'lumot topilmadi.");
  }

  const [headerRow, ...dataRows] = table;
  const headers = headerRow.map((value, index) => cleanHeader(value, index));

  const limited = dataRows.slice(0, MAX_ROWS);
  const rows: RawCell[][] = limited
    .map((row) =>
      headers.map((_, index) => {
        const cell = row[index];
        if (cell === undefined || cell === null) return null;

        const trimmed = String(cell).trim();
        return trimmed === "" ? null : trimmed;
      }),
    )
    .filter((row) => !isBlankRow(row));

  return {
    headers,
    rows,
    truncatedRows: Math.max(0, dataRows.length - limited.length),
  };
}

export async function parseXlsxBuffer(buffer: Buffer): Promise<ParsedTable> {
  const workbook = new ExcelJS.Workbook();

  try {
    // ExcelJS Node Buffer'ni qabul qiladi, lekin tipida ArrayBuffer kutiladi.
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
  } catch {
    throw new ParseError(
      "Excel faylni o'qib bo'lmadi. Fayl buzilgan yoki qo'llab-quvvatlanmaydigan formatda.",
    );
  }

  const sheet = workbook.worksheets[0];

  if (!sheet) {
    throw new ParseError("Excel faylda hech qanday varaq topilmadi.");
  }

  const table: RawCell[][] = [];

  sheet.eachRow({ includeEmpty: false }, (row) => {
    // `row.values` 1-indeksdan boshlanadi, 0-element har doim bo'sh.
    const values = (row.values as unknown[]).slice(1);
    table.push(values.map(normalizeExcelCell));
  });

  if (table.length === 0) {
    throw new ParseError("Faylda o'qish mumkin bo'lgan ma'lumot topilmadi.");
  }

  const [headerRow, ...dataRows] = table;
  const headers = headerRow.map((value, index) => cleanHeader(value, index));

  const limited = dataRows.slice(0, MAX_ROWS);
  const rows = limited
    .map((row) => headers.map((_, index) => row[index] ?? null))
    .filter((row) => !isBlankRow(row));

  return {
    headers,
    rows,
    truncatedRows: Math.max(0, dataRows.length - limited.length),
  };
}

export function getFileExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

export async function parseTableFile(
  filename: string,
  buffer: Buffer,
): Promise<ParsedTable & { format: "CSV" | "XLSX" }> {
  const extension = getFileExtension(filename);

  if (extension === "csv") {
    return { ...parseCsvBuffer(buffer), format: "CSV" };
  }

  if (extension === "xlsx") {
    return { ...(await parseXlsxBuffer(buffer)), format: "XLSX" };
  }

  throw new ParseError("Faqat CSV yoki XLSX formatidagi faylni yuklash mumkin.");
}
