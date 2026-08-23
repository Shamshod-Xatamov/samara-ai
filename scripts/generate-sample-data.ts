/**
 * Namuna ma'lumot generatori.
 *
 * Maqsad — mijozdan haqiqiy fayl kelgunicha pipeline'ni sinash uchun
 * ishonarli ishlab chiqarish ma'lumotini yaratish. Fayllar ataylab
 * "iflos": bo'sh kataklar, dublikatlar, format xatolari va outlier'lar bor,
 * chunki qayta ishlash moduli aynan shularni topishi kerak.
 *
 * Ishga tushirish:  pnpm data:generate
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import ExcelJS from "exceljs";

const OUTPUT_DIR = path.join(process.cwd(), "namuna-malumotlar");

const START_DATE = new Date("2025-09-01T00:00:00Z");
const END_DATE = new Date("2026-08-19T00:00:00Z");
/** AI platformasi joriy etilgan sana — shu nuqtadan keyin ko'rsatkichlar yaxshilanadi. */
const AI_ROLLOUT_DATE = new Date("2026-02-01T00:00:00Z");
/** To'liq samaraga chiqish davri (kun). */
const AI_RAMP_DAYS = 150;

// --- Deterministik tasodifiylik (har safar bir xil fayl chiqishi uchun) ---

function createRandom(seed: number) {
  let state = seed >>> 0;

  return function random() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = createRandom(20260819);

/** Normal taqsimotga yaqin shovqin (Box-Muller). */
function noise(scale: number) {
  const u = Math.max(random(), 1e-9);
  const v = random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * scale;
}

function lerp(from: number, to: number, ratio: number) {
  return from + (to - from) * ratio;
}

function round(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

// --- Biznes modeli ---

const DEPARTMENTS = [
  { name: "Yig'uv", baseUnits: 240, product: "Modul A-24" },
  { name: "Qadoqlash", baseUnits: 280, product: "Modul B-11" },
  { name: "Sifat nazorati", baseUnits: 190, product: "Modul C-08" },
  { name: "Ombor", baseUnits: 160, product: "Modul A-24" },
];

const PRICE_PER_UNIT = 0.0092; // mln so'm

/** AI joriy etilishining ta'siri: 0 = ta'sir yo'q, 1 = to'liq samara. */
function aiProgress(date: Date) {
  const days = (date.getTime() - AI_ROLLOUT_DATE.getTime()) / 86_400_000;
  if (days <= 0) return 0;
  return Math.min(1, days / AI_RAMP_DAYS);
}

/** Hafta kuni bo'yicha yuklama (dam olish kunlarida kamroq). */
function weekdayFactor(date: Date) {
  const day = date.getUTCDay();
  if (day === 0) return 0.42;
  if (day === 6) return 0.68;
  return 1;
}

/** Yillik mavsumiylik — qish oylarida biroz pastroq. */
function seasonFactor(date: Date) {
  const month = date.getUTCMonth();
  return 1 + 0.08 * Math.sin(((month - 3) / 12) * 2 * Math.PI);
}

/** Ataylab kiritilgan xarajat sakrashlari — anomaliya detektori shularni topishi kerak. */
const ANOMALY_DAYS = new Set([
  "2025-11-14",
  "2026-01-23",
  "2026-04-08",
  "2026-06-17",
  "2026-08-14",
]);

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

type ProductionRow = {
  sana: string;
  bolim: string;
  mahsulot: string;
  dona: number;
  daromad: number;
  xarajat: number;
  ishSoati: number;
  nuqson: number;
  jarayonVaqti: number;
  avtomatlashtirish: number;
};

function generateProductionRows(): ProductionRow[] {
  const rows: ProductionRow[] = [];

  for (
    let date = new Date(START_DATE);
    date <= END_DATE;
    date.setUTCDate(date.getUTCDate() + 1)
  ) {
    const progress = aiProgress(date);
    const isoDate = toIsoDate(date);
    const isAnomalyDay = ANOMALY_DAYS.has(isoDate);

    // AI joriy etilishi bilan yaxshilanadigan ko'rsatkichlar.
    const unitCost = lerp(0.0058, 0.0047, progress);
    const laborPerUnit = lerp(0.046, 0.0325, progress);
    const defectRate = lerp(0.048, 0.017, progress);
    const processSeconds = lerp(8.4, 2.1, progress);
    const automation = lerp(45, 89, progress);

    for (const department of DEPARTMENTS) {
      const units = Math.max(
        30,
        Math.round(
          department.baseUnits *
            weekdayFactor(date) *
            seasonFactor(date) *
            (1 + noise(0.09)),
        ),
      );

      const anomalyMultiplier = isAnomalyDay ? 1.18 + random() * 0.12 : 1;

      rows.push({
        sana: isoDate,
        bolim: department.name,
        mahsulot: department.product,
        dona: units,
        daromad: round(units * PRICE_PER_UNIT * (1 + noise(0.03)), 3),
        xarajat: round(
          units * unitCost * anomalyMultiplier * (1 + noise(0.05)),
          3,
        ),
        ishSoati: round(units * laborPerUnit * (1 + noise(0.06)), 2),
        nuqson: Math.max(
          0,
          Math.round(units * defectRate * (1 + noise(0.22))),
        ),
        jarayonVaqti: round(processSeconds * (1 + noise(0.07)), 2),
        avtomatlashtirish: round(automation * (1 + noise(0.02)), 1),
      });
    }
  }

  return rows;
}

// --- Ma'lumot sifatini "buzish" ---

type MessOptions = {
  missingRate: number;
  duplicateRate: number;
  typeErrorRate: number;
  outlierRate: number;
};

type Cell = string | number | null;

/**
 * Toza qatorlarni haqiqiy hayotdagi kabi nuqsonli holatga keltiradi.
 * Nuqsonlar sanab qaytariladi — keyin natijani tekshirish uchun kerak.
 */
function applyMess(
  rows: Cell[][],
  numericColumns: number[],
  options: MessOptions,
) {
  const stats = { missing: 0, duplicate: 0, typeError: 0, outlier: 0 };
  const result = rows.map((row) => [...row]);

  for (const row of result) {
    for (const columnIndex of numericColumns) {
      const value = row[columnIndex];
      if (typeof value !== "number") continue;

      const roll = random();

      if (roll < options.missingRate) {
        // Bo'sh katak: ba'zan bo'sh satr, ba'zan "N/A" kabi belgi.
        row[columnIndex] = random() < 0.5 ? null : "N/A";
        stats.missing += 1;
        continue;
      }

      if (roll < options.missingRate + options.typeErrorRate) {
        // Format xatosi: vergulli kasr yoki ming ajratgichi bo'lgan matn.
        row[columnIndex] =
          random() < 0.5
            ? String(value).replace(".", ",")
            : value.toLocaleString("ru-RU").replace(/ /g, " ");
        stats.typeError += 1;
        continue;
      }

      if (
        roll <
        options.missingRate + options.typeErrorRate + options.outlierRate
      ) {
        // Outlier: o'lchov birligi xato kiritilgan holat (masalan so'm/mln aralashib ketgan).
        row[columnIndex] = round(value * (8 + random() * 6), 2);
        stats.outlier += 1;
      }
    }
  }

  // Dublikatlar: mavjud qatorlarni nusxalab, tasodifiy joyga qo'yish.
  const duplicateCount = Math.round(result.length * options.duplicateRate);

  for (let index = 0; index < duplicateCount; index += 1) {
    const source = result[Math.floor(random() * result.length)];
    const position = Math.floor(random() * result.length);
    result.splice(position, 0, [...source]);
    stats.duplicate += 1;
  }

  return { rows: result, stats };
}

// --- Fayl yozish ---

async function writeXlsx(
  filePath: string,
  sheetName: string,
  headers: string[],
  rows: Cell[][],
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Samara AI — namuna generatori";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(sheetName);

  sheet.addRow(headers);
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).alignment = { vertical: "middle", wrapText: true };
  sheet.columns = headers.map((header) => ({
    width: Math.min(30, Math.max(14, header.length + 2)),
  }));

  for (const row of rows) {
    sheet.addRow(row);
  }

  sheet.views = [{ state: "frozen", ySplit: 1 }];

  await workbook.xlsx.writeFile(filePath);
}

function toCsvValue(value: Cell) {
  if (value === null || value === undefined) return "";

  const text = String(value);

  return /[",;\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

async function writeCsv(filePath: string, headers: string[], rows: Cell[][]) {
  const lines = [headers.map(toCsvValue).join(",")];

  for (const row of rows) {
    lines.push(row.map(toCsvValue).join(","));
  }

  // BOM — Excel'da o'zbekcha belgilar to'g'ri ochilishi uchun.
  await writeFile(filePath, `﻿${lines.join("\n")}\n`, "utf8");
}

// --- 2-fayl: operatsion jarayon loglari ---

const OPERATIONS = [
  { name: "Qabul qilish", baseSeconds: 480, baseCost: 1_240_000 },
  { name: "Tekshirish", baseSeconds: 720, baseCost: 2_180_000 },
  { name: "Qayta ishlash", baseSeconds: 1560, baseCost: 4_820_000 },
  { name: "Tasdiqlash", baseSeconds: 540, baseCost: 1_760_000 },
  { name: "Eksport", baseSeconds: 240, baseCost: 680_000 },
];

const OPERATORS = [
  "A. Karimov",
  "N. Yusupova",
  "S. Rahmonov",
  "D. Ismoilova",
  "B. To'xtayev",
];

function formatClock(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600) % 24;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const seconds = Math.floor(totalSeconds) % 60;

  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

function generateOperationRows(): Cell[][] {
  const rows: Cell[][] = [];
  let sequence = 1;

  for (
    let date = new Date("2026-06-01T00:00:00Z");
    date <= END_DATE;
    date.setUTCDate(date.getUTCDate() + 1)
  ) {
    if (weekdayFactor(date) < 0.5) continue;

    const progress = aiProgress(date);
    const speedFactor = lerp(1, 0.42, progress);
    const isoDate = toIsoDate(date);

    for (let batch = 0; batch < 5; batch += 1) {
      let cursor = 8 * 3600 + batch * 1800 + Math.floor(random() * 240);

      for (const operation of OPERATIONS) {
        const duration = Math.round(
          operation.baseSeconds * speedFactor * (1 + noise(0.12)),
        );
        const start = cursor;
        const end = start + duration;
        cursor = end + 60 + Math.floor(random() * 90);

        rows.push([
          `JAR-${String(sequence).padStart(5, "0")}`,
          isoDate,
          operation.name,
          formatClock(start),
          formatClock(end),
          duration,
          OPERATORS[Math.floor(random() * OPERATORS.length)],
          Math.round(operation.baseCost * speedFactor * (1 + noise(0.1))),
          random() < lerp(0.048, 0.017, progress) ? "ha" : "yo'q",
        ]);

        sequence += 1;
      }
    }
  }

  return rows;
}

// --- Asosiy oqim ---

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  // 1-fayl: asosiy ishlab chiqarish hisoboti (XLSX)
  const productionHeaders = [
    "Sana",
    "Bo'lim",
    "Mahsulot kodi",
    "Ishlab chiqarilgan mahsulot (dona)",
    "Sotuvdan tushum (mln so'm)",
    "Ishlab chiqarish xarajati (mln so'm)",
    "Sarflangan ish vaqti (soat)",
    "Nuqsonli mahsulot (dona)",
    "O'rtacha jarayon vaqti (sek)",
    "Avtomatlashtirish darajasi (%)",
  ];

  const production = generateProductionRows();
  const productionCells: Cell[][] = production.map((row) => [
    row.sana,
    row.bolim,
    row.mahsulot,
    row.dona,
    row.daromad,
    row.xarajat,
    row.ishSoati,
    row.nuqson,
    row.jarayonVaqti,
    row.avtomatlashtirish,
  ]);

  const messyProduction = applyMess(productionCells, [3, 4, 5, 6, 7, 8, 9], {
    missingRate: 0.014,
    duplicateRate: 0.006,
    typeErrorRate: 0.008,
    outlierRate: 0.004,
  });

  await writeXlsx(
    path.join(OUTPUT_DIR, "ishlab-chiqarish-2025-2026.xlsx"),
    "Ishlab chiqarish",
    productionHeaders,
    messyProduction.rows,
  );

  // 2-fayl: operatsion jarayon loglari (CSV)
  const operationHeaders = [
    "jarayon_id",
    "sana",
    "operatsiya",
    "boshlanish",
    "tugash",
    "davomiylik_sek",
    "operator",
    "xarajat_som",
    "xatolik",
  ];

  const operations = generateOperationRows();
  const messyOperations = applyMess(operations, [5, 7], {
    missingRate: 0.009,
    duplicateRate: 0.004,
    typeErrorRate: 0.006,
    outlierRate: 0.003,
  });

  await writeCsv(
    path.join(OUTPUT_DIR, "operatsion-jarayonlar.csv"),
    operationHeaders,
    messyOperations.rows,
  );

  // 3-fayl: sifati past namuna — tozalash modulini namoyish qilish uchun
  const lowQualitySource = productionCells.slice(-320);
  const lowQuality = applyMess(lowQualitySource, [3, 4, 5, 6, 7, 8, 9], {
    missingRate: 0.075,
    duplicateRate: 0.035,
    typeErrorRate: 0.042,
    outlierRate: 0.026,
  });

  await writeCsv(
    path.join(OUTPUT_DIR, "sifatsiz-malumot-namunasi.csv"),
    productionHeaders,
    lowQuality.rows,
  );

  console.log("✅ Namuna fayllar yaratildi:", OUTPUT_DIR);
  console.log("");
  console.table([
    {
      Fayl: "ishlab-chiqarish-2025-2026.xlsx",
      Qatorlar: messyProduction.rows.length,
      "Bo'sh": messyProduction.stats.missing,
      Dublikat: messyProduction.stats.duplicate,
      "Format xatosi": messyProduction.stats.typeError,
      Outlier: messyProduction.stats.outlier,
    },
    {
      Fayl: "operatsion-jarayonlar.csv",
      Qatorlar: messyOperations.rows.length,
      "Bo'sh": messyOperations.stats.missing,
      Dublikat: messyOperations.stats.duplicate,
      "Format xatosi": messyOperations.stats.typeError,
      Outlier: messyOperations.stats.outlier,
    },
    {
      Fayl: "sifatsiz-malumot-namunasi.csv",
      Qatorlar: lowQuality.rows.length,
      "Bo'sh": lowQuality.stats.missing,
      Dublikat: lowQuality.stats.duplicate,
      "Format xatosi": lowQuality.stats.typeError,
      Outlier: lowQuality.stats.outlier,
    },
  ]);
}

main().catch((error) => {
  console.error("❌ Generator xatosi:", error);
  process.exitCode = 1;
});
