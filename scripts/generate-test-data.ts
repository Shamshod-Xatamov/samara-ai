/**
 * Mustaqil sinov fayli generatori.
 *
 * Maqsad — AI qatlamini HAQIQATAN sinash. Shuning uchun fayl asosiy namunadan
 * ataylab farq qiladi:
 *
 *  1. Ustun nomlari butunlay boshqacha ("Sotuv_summasi_som", "Sikl_vaqti_minut")
 *     — evristik moslashtirish deyarli ishlamaydi, Gemini semantikani tushunishi kerak.
 *  2. Uchta ustunda o'lchov birligi kanonikdan farq qiladi:
 *     so'm → mln so'm, minut → soat, minut → soniya.
 *     Bu `unitScale` ni tekshiradi.
 *  3. Ikkita ustun ham "minut" da, lekin turli kanonik kalitga tegishli:
 *     "Sarflangan_vaqt_minut" → mehnat_soat
 *     "Sikl_vaqti_minut"      → qayta_ishlash_vaqti
 *     Bu faqat ma'noni tushungan model uchun hal qilinadi.
 *  4. Aniq sanalarga anomaliyalar joylashtirilgan — detektor topishi kerak.
 *
 * Ishga tushirish:  pnpm data:test
 */

import { mkdir } from "node:fs/promises";
import path from "node:path";

import ExcelJS from "exceljs";

const OUTPUT_DIR = path.join(process.cwd(), "namuna-malumotlar");
const OUTPUT_FILE = "sinov-korxona-2026.xlsx";

const START_DATE = new Date("2026-03-01T00:00:00Z");
const END_DATE = new Date("2026-08-19T00:00:00Z");

/**
 * Ataylab joylashtirilgan anomaliyalar.
 * Sinov yakunida detektor aynan shu sanalarni topishi kerak.
 */
type Injection = {
  cost?: number;
  cycle?: number;
  defect?: number;
  labor?: number;
  label: string;
};

const INJECTED: Record<string, Injection> = {
  "2026-05-12": { cost: 1.38, label: "xarajat sakrashi +38%" },
  "2026-06-25": { cycle: 1.85, label: "sikl vaqti +85%" },
  "2026-07-09": { defect: 3.2, label: "brak soni 3.2 barobar" },
  "2026-08-05": { labor: 1.45, label: "mehnat vaqti +45%" },
};

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

const SHOPS = [
  { name: "1-sex (mexanika)", baseUnits: 260, article: "MX-1180" },
  { name: "2-sex (yig'uv)", baseUnits: 300, article: "YG-2240" },
  { name: "3-sex (qadoqlash)", baseUnits: 210, article: "QD-3050" },
];

const PRICE_PER_UNIT_SOM = 9_200;

function weekdayFactor(date: Date) {
  const day = date.getUTCDay();
  if (day === 0) return 0.44;
  if (day === 6) return 0.7;
  return 1;
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

type Cell = string | number | null;

function generateRows(): Cell[][] {
  const rows: Cell[][] = [];
  const totalDays =
    (END_DATE.getTime() - START_DATE.getTime()) / 86_400_000;

  for (
    let date = new Date(START_DATE);
    date <= END_DATE;
    date.setUTCDate(date.getUTCDate() + 1)
  ) {
    const iso = toIsoDate(date);
    const progress =
      (date.getTime() - START_DATE.getTime()) / 86_400_000 / totalDays;

    // Davr davomida barqaror yaxshilanish.
    const unitCostSom = lerp(5_800, 4_700, progress);
    const laborMinutesPerUnit = lerp(2.76, 1.95, progress);
    const defectRate = lerp(0.041, 0.016, progress);
    const cycleMinutes = lerp(8.4, 2.1, progress);
    const automation = lerp(52, 91, progress);

    const injected: Injection | undefined = INJECTED[iso];

    for (const shop of SHOPS) {
      const units = Math.max(
        25,
        Math.round(shop.baseUnits * weekdayFactor(date) * (1 + noise(0.09))),
      );

      rows.push([
        iso,
        shop.name,
        shop.article,
        units,
        Math.round(units * PRICE_PER_UNIT_SOM * (1 + noise(0.03))),
        Math.round(
          units * unitCostSom * (injected?.cost ?? 1) * (1 + noise(0.05)),
        ),
        round(
          units * laborMinutesPerUnit * (injected?.labor ?? 1) * (1 + noise(0.06)),
          1,
        ),
        Math.max(
          0,
          Math.round(units * defectRate * (injected?.defect ?? 1) * (1 + noise(0.2))),
        ),
        round(cycleMinutes * (injected?.cycle ?? 1) * (1 + noise(0.07)), 2),
        round(automation * (1 + noise(0.02)), 1),
      ]);
    }
  }

  return rows;
}

/** Haqiqiy fayllardagi kabi nuqsonlarni qo'shadi. */
function applyMess(rows: Cell[][], numericColumns: number[]) {
  const stats = { missing: 0, duplicate: 0, typeError: 0, outlier: 0 };
  const result = rows.map((row) => [...row]);

  for (const row of result) {
    for (const columnIndex of numericColumns) {
      const value = row[columnIndex];
      if (typeof value !== "number") continue;

      const roll = random();

      if (roll < 0.016) {
        row[columnIndex] = random() < 0.5 ? null : "N/A";
        stats.missing += 1;
      } else if (roll < 0.032) {
        // Vergulli kasr — Excel'da matn sifatida saqlanadi.
        row[columnIndex] = String(value).replace(".", ",");
        stats.typeError += 1;
      } else if (roll < 0.038) {
        row[columnIndex] = round(value * (9 + random() * 5), 2);
        stats.outlier += 1;
      }
    }
  }

  const duplicateCount = Math.round(result.length * 0.007);

  for (let index = 0; index < duplicateCount; index += 1) {
    const source = result[Math.floor(random() * result.length)];
    const position = Math.floor(random() * result.length);
    result.splice(position, 0, [...source]);
    stats.duplicate += 1;
  }

  return { rows: result, stats };
}

const HEADERS = [
  "Otchet_sanasi",
  "Sex",
  "Artikul",
  "Chiqarilgan_mahsulot_soni",
  "Sotuv_summasi_som",
  "Ishlab_chiqarish_xarajati_som",
  "Sarflangan_vaqt_minut",
  "Brak_soni",
  "Sikl_vaqti_minut",
  "Robotlashtirish_foizi",
];

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const clean = generateRows();
  const { rows, stats } = applyMess(clean, [3, 4, 5, 6, 7, 8, 9]);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Samara AI — sinov generatori";
  // Qat'iy sana: fayl bayt darajasida ham takrorlanadigan bo'lishi uchun.
  workbook.created = new Date("2026-08-19T00:00:00Z");
  workbook.modified = workbook.created;

  const sheet = workbook.addWorksheet("Ishlab chiqarish");
  sheet.addRow(HEADERS);
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).alignment = { vertical: "middle", wrapText: true };
  sheet.columns = HEADERS.map((header) => ({
    width: Math.min(30, Math.max(14, header.length + 2)),
  }));

  for (const row of rows) sheet.addRow(row);
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  const filePath = path.join(OUTPUT_DIR, OUTPUT_FILE);
  await workbook.xlsx.writeFile(filePath);

  console.log(`✅ Sinov fayli yaratildi: ${filePath}`);
  console.log(`   Qatorlar: ${rows.length}, ustunlar: ${HEADERS.length}`);
  console.log(`   Davr: ${toIsoDate(START_DATE)} — ${toIsoDate(END_DATE)}`);
  console.log("");
  console.log("   Kiritilgan nuqsonlar:");
  console.log(`     bo'sh qiymatlar : ${stats.missing}`);
  console.log(`     format xatolari : ${stats.typeError}`);
  console.log(`     dublikatlar     : ${stats.duplicate}`);
  console.log(`     outlier'lar     : ${stats.outlier}`);
  console.log("");
  console.log("   Ataylab joylashtirilgan anomaliyalar:");
  for (const [date, info] of Object.entries(INJECTED)) {
    console.log(`     ${date} — ${info.label}`);
  }
}

main().catch((error) => {
  console.error("❌ Generator xatosi:", error);
  process.exitCode = 1;
});
