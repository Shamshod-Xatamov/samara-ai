/**
 * Mustaqil sinov fayllari generatori.
 *
 * Maqsad — AI qatlamini HAQIQATAN sinash. Fayllar asosiy namunadan ataylab
 * farq qiladi: ustun nomlari kanonik sxemaga o'xshamaydi va o'lchov birliklari
 * boshqacha. Shunday qilib evristik moslashtirish ishlamaydi va Gemini
 * semantikani tushunishi kerak bo'ladi.
 *
 * Ishga tushirish:
 *   pnpm data:test          — barcha variantlar
 *   pnpm data:test zavod    — faqat bitta variant
 */

import { mkdir } from "node:fs/promises";
import path from "node:path";

import ExcelJS from "exceljs";

const OUTPUT_DIR = path.join(process.cwd(), "namuna-malumotlar");

type Injection = {
  cost?: number;
  cycle?: number;
  defect?: number;
  labor?: number;
  label: string;
};

type Variant = {
  key: string;
  file: string;
  sheet: string;
  start: string;
  end: string;
  headers: string[];
  /** Ustun qiymatlarini fayl birligiga o'tkazish (kanonik → fayl) */
  scale: {
    revenue: number;
    cost: number;
    labor: number;
    cycle: number;
    automation: number;
  };
  units: Array<{ name: string; unit: string; canonical: string; factor: string }>;
  shops: Array<{ name: string; baseUnits: number; article: string }>;
  injected: Record<string, Injection>;
};

const VARIANTS: Variant[] = [
  {
    key: "korxona",
    file: "sinov-korxona-2026.xlsx",
    sheet: "Ishlab chiqarish",
    start: "2026-03-01",
    end: "2026-08-19",
    headers: [
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
    ],
    // Fayl so'mda va minutda yozadi; kanonik birlik — mln so'm, soat, soniya.
    scale: { revenue: 1_000_000, cost: 1_000_000, labor: 60, cycle: 1 / 60, automation: 1 },
    units: [
      { name: "Sotuv_summasi_som", unit: "so'm", canonical: "daromad", factor: "0.000001" },
      { name: "Ishlab_chiqarish_xarajati_som", unit: "so'm", canonical: "xarajat", factor: "0.000001" },
      { name: "Sarflangan_vaqt_minut", unit: "minut", canonical: "mehnat_soat", factor: "0.0167" },
      { name: "Sikl_vaqti_minut", unit: "minut", canonical: "qayta_ishlash_vaqti", factor: "60" },
    ],
    shops: [
      { name: "1-sex (mexanika)", baseUnits: 260, article: "MX-1180" },
      { name: "2-sex (yig'uv)", baseUnits: 300, article: "YG-2240" },
      { name: "3-sex (qadoqlash)", baseUnits: 210, article: "QD-3050" },
    ],
    injected: {
      "2026-05-12": { cost: 1.38, label: "xarajat sakrashi +38%" },
      "2026-06-25": { cycle: 1.85, label: "sikl vaqti +85%" },
      "2026-07-09": { defect: 3.2, label: "brak soni 3.2 barobar" },
      "2026-08-05": { labor: 1.45, label: "mehnat vaqti +45%" },
    },
  },
  {
    key: "zavod",
    file: "sinov-zavod-2026.xlsx",
    sheet: "Vypusk",
    start: "2026-02-01",
    end: "2026-08-19",
    // Ustun nomlari ruscha transliteratsiyada — O'zbekiston korxonalarida
    // keng tarqalgan holat va butunlay boshqa lingvistik sinov.
    headers: [
      "data_otcheta",
      "uchastok",
      "product_code",
      "vypusk_sht",
      "vyruchka_ming_som",
      "sebestoimost_ming_som",
      "trudozatraty_chas",
      "brak_sht",
      "takt_vremya_sek",
      "avtomatizatsiya_dolya",
    ],
    // Ming so'mda, soatda, soniyada; avtomatlashtirish esa ULUSH (0–1).
    scale: { revenue: 1_000, cost: 1_000, labor: 1, cycle: 1, automation: 0.01 },
    units: [
      { name: "vyruchka_ming_som", unit: "ming so'm", canonical: "daromad", factor: "0.001" },
      { name: "sebestoimost_ming_som", unit: "ming so'm", canonical: "xarajat", factor: "0.001" },
      { name: "avtomatizatsiya_dolya", unit: "ulush (0–1)", canonical: "avtomatlashtirilgan", factor: "100" },
    ],
    shops: [
      { name: "Uchastok A", baseUnits: 240, article: "PR-4410" },
      { name: "Uchastok B", baseUnits: 320, article: "PR-4520" },
      { name: "Uchastok C", baseUnits: 190, article: "PR-4630" },
    ],
    injected: {
      "2026-04-17": { cost: 1.42, label: "sebestoimost +42%" },
      "2026-05-28": { cycle: 1.7, label: "takt vaqti +70%" },
      "2026-06-30": { defect: 2.8, label: "brak 2.8 barobar" },
      "2026-07-22": { labor: 1.5, label: "mehnat vaqti +50%" },
    },
  },
];

function createRandom(seed: number) {
  let state = seed >>> 0;

  return function random() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lerp(from: number, to: number, ratio: number) {
  return from + (to - from) * ratio;
}

function round(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

const PRICE_PER_UNIT_SOM = 9_200;

function weekdayFactor(date: Date) {
  const day = date.getUTCDay();
  if (day === 0) return 0.44;
  if (day === 6) return 0.7;
  return 1;
}

type Cell = string | number | null;

function generate(variant: Variant, random: () => number) {
  const noise = (scale: number) => {
    const u = Math.max(random(), 1e-9);
    const v = random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * scale;
  };

  const start = new Date(`${variant.start}T00:00:00Z`);
  const end = new Date(`${variant.end}T00:00:00Z`);
  const totalDays = (end.getTime() - start.getTime()) / 86_400_000;

  const rows: Cell[][] = [];

  for (
    let date = new Date(start);
    date <= end;
    date.setUTCDate(date.getUTCDate() + 1)
  ) {
    const iso = date.toISOString().slice(0, 10);
    const progress = (date.getTime() - start.getTime()) / 86_400_000 / totalDays;

    // Davr davomida barqaror yaxshilanish — AI joriy etilishining ta'siri.
    const unitCostSom = lerp(5_800, 4_700, progress);
    const laborHoursPerUnit = lerp(0.046, 0.0325, progress);
    const defectRate = lerp(0.041, 0.016, progress);
    const cycleSeconds = lerp(504, 126, progress);
    const automationPct = lerp(52, 91, progress);

    const injected: Injection | undefined = variant.injected[iso];

    for (const shop of variant.shops) {
      const units = Math.max(
        25,
        Math.round(shop.baseUnits * weekdayFactor(date) * (1 + noise(0.09))),
      );

      const revenueSom = units * PRICE_PER_UNIT_SOM * (1 + noise(0.03));
      const costSom = units * unitCostSom * (injected?.cost ?? 1) * (1 + noise(0.05));
      const laborHours = units * laborHoursPerUnit * (injected?.labor ?? 1) * (1 + noise(0.06));
      const defects = Math.max(
        0,
        Math.round(units * defectRate * (injected?.defect ?? 1) * (1 + noise(0.2))),
      );
      const cycle = cycleSeconds * (injected?.cycle ?? 1) * (1 + noise(0.07));
      const automation = automationPct * (1 + noise(0.02));

      rows.push([
        iso,
        shop.name,
        shop.article,
        units,
        Math.round(revenueSom / variant.scale.revenue * 1000) / 1000,
        Math.round(costSom / variant.scale.cost * 1000) / 1000,
        round(laborHours * variant.scale.labor, 2),
        defects,
        round(cycle * variant.scale.cycle, 2),
        round(automation * variant.scale.automation, 3),
      ]);
    }
  }

  return rows;
}

/** Haqiqiy fayllardagi kabi nuqsonlarni qo'shadi. */
function applyMess(rows: Cell[][], numericColumns: number[], random: () => number) {
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

async function writeVariant(variant: Variant) {
  // Har bir variant o'z urug'i bilan — fayl har safar aynan bir xil chiqadi.
  const random = createRandom(
    [...variant.key].reduce((total, char) => total * 31 + char.charCodeAt(0), 7),
  );

  const clean = generate(variant, random);
  const { rows, stats } = applyMess(clean, [3, 4, 5, 6, 7, 8, 9], random);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Samara AI — sinov generatori";
  // Qat'iy sana: fayl bayt darajasida ham takrorlanadigan bo'lishi uchun.
  workbook.created = new Date("2026-08-19T00:00:00Z");
  workbook.modified = workbook.created;

  const sheet = workbook.addWorksheet(variant.sheet);
  sheet.addRow(variant.headers);
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).alignment = { vertical: "middle", wrapText: true };
  sheet.columns = variant.headers.map((header) => ({
    width: Math.min(30, Math.max(14, header.length + 2)),
  }));

  for (const row of rows) sheet.addRow(row);
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  await workbook.xlsx.writeFile(path.join(OUTPUT_DIR, variant.file));

  return { rows: rows.length, stats };
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const requested = process.argv[2];
  const selected = requested
    ? VARIANTS.filter((variant) => variant.key === requested)
    : VARIANTS;

  if (selected.length === 0) {
    console.error(
      `❌ "${requested}" varianti yo'q. Mavjud: ${VARIANTS.map((v) => v.key).join(", ")}`,
    );
    process.exitCode = 1;
    return;
  }

  for (const variant of selected) {
    const { rows, stats } = await writeVariant(variant);

    console.log("");
    console.log(`✅ ${variant.file}`);
    console.log(`   ${rows} qator · ${variant.headers.length} ustun · ${variant.start} — ${variant.end}`);
    console.log(
      `   nuqsonlar: ${stats.missing} bo'sh, ${stats.typeError} format xatosi, ` +
        `${stats.duplicate} dublikat, ${stats.outlier} outlier`,
    );
    console.log("   o'lchov birligi sinovlari:");
    for (const unit of variant.units) {
      console.log(
        `     ${unit.name.padEnd(30)} ${unit.unit.padEnd(12)} → ${unit.canonical.padEnd(20)} ×${unit.factor}`,
      );
    }
    console.log("   ataylab joylashtirilgan anomaliyalar:");
    for (const [date, info] of Object.entries(variant.injected)) {
      console.log(`     ${date} — ${info.label}`);
    }
  }
}

main().catch((error) => {
  console.error("❌ Generator xatosi:", error);
  process.exitCode = 1;
});
