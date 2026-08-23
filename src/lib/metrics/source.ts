import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type { CanonicalKey } from "@/lib/parsing/canonical";

import type { CleanRow } from "./compute";
import { rowDate } from "./compute";

/**
 * Metrika uchun ma'lumot manbasini tanlash.
 *
 * Bir nechta dataset birlashtirilmaydi: ishlab chiqarish hisoboti va jarayon
 * loglarini qo'shish xarajatni ikki marta sanashga olib kelardi. Shuning uchun
 * bitta dataset tanlanadi va uning qaysi ekani javobda ko'rsatiladi.
 */

/** Metrikalarni hisoblash uchun eng kam talab. */
export const REQUIRED_KEYS: CanonicalKey[] = ["sana", "xarajat"];

export type MetricSource = {
  dataset: {
    id: string;
    name: string;
    rowCount: number;
    qualityScore: number | null;
    cleanedQualityScore: number | null;
  };
  rows: CleanRow[];
  earliestDate: Date;
  latestDate: Date;
  /** Bog'lanmagan kanonik kalitlar — qaysi KPI hisoblanmasligini tushuntiradi */
  availableKeys: CanonicalKey[];
};

export type MetricSourceError =
  | { reason: "no-dataset" }
  | { reason: "not-cleaned"; datasetName: string }
  | { reason: "missing-keys"; datasetName: string; missing: CanonicalKey[] }
  | { reason: "no-rows"; datasetName: string };

function mappedKeyCount(dataset: { columns: Array<{ canonicalKey: string | null }> }) {
  return dataset.columns.filter((column) => column.canonicalKey !== null).length;
}

/**
 * Standart manba — eng "boy" tozalangan dataset:
 * avval kanonik sxemaga eng ko'p bog'langani, keyin eng ko'p qatorlisi.
 * Eng oxirgi yuklangani emas: kichik sinov fayli asosiy hisobotni siqib
 * chiqarmasligi kerak.
 */
async function pickDefaultDataset(orgId: string) {
  const candidates = await prisma.dataset.findMany({
    where: { orgId, status: "CLEANED" },
    include: { columns: true },
  });

  const usable = candidates.filter((dataset) => {
    const keys = dataset.columns.map((column) => column.canonicalKey);
    return REQUIRED_KEYS.every((key) => keys.includes(key));
  });

  if (usable.length === 0) return candidates[0] ?? null;

  return usable.sort(
    (a, b) =>
      mappedKeyCount(b) - mappedKeyCount(a) ||
      b.rowCount - a.rowCount ||
      b.updatedAt.getTime() - a.updatedAt.getTime(),
  )[0];
}

export async function loadMetricSource(
  orgId: string,
  datasetId?: string,
): Promise<{ ok: true; source: MetricSource } | { ok: false; error: MetricSourceError }> {
  const dataset = datasetId
    ? await prisma.dataset.findFirst({
        where: { id: datasetId, orgId },
        include: { columns: true },
      })
    : await pickDefaultDataset(orgId);

  if (!dataset) {
    return { ok: false, error: { reason: "no-dataset" } };
  }

  if (dataset.status !== "CLEANED") {
    return {
      ok: false,
      error: { reason: "not-cleaned", datasetName: dataset.name },
    };
  }

  const mappedKeys = dataset.columns
    .map((column) => column.canonicalKey)
    .filter((key): key is CanonicalKey => key !== null);

  const missing = REQUIRED_KEYS.filter((key) => !mappedKeys.includes(key));

  if (missing.length > 0) {
    return {
      ok: false,
      error: { reason: "missing-keys", datasetName: dataset.name, missing },
    };
  }

  const records = await prisma.datasetRow.findMany({
    // Tozalanmagan (dublikat yoki chiqarib tashlangan) qatorlar hisobga olinmaydi.
    where: { datasetId: dataset.id, clean: { not: Prisma.DbNull } },
    orderBy: { rowIndex: "asc" },
    select: { clean: true },
  });

  const rows = records
    .map((record) => record.clean as CleanRow)
    .filter((row) => row !== null);

  const dates = rows
    .map(rowDate)
    .filter((date): date is Date => date !== null)
    .sort((a, b) => a.getTime() - b.getTime());

  if (dates.length === 0) {
    return { ok: false, error: { reason: "no-rows", datasetName: dataset.name } };
  }

  return {
    ok: true,
    source: {
      dataset: {
        id: dataset.id,
        name: dataset.name,
        rowCount: dataset.rowCount,
        qualityScore: dataset.qualityScore,
        cleanedQualityScore: dataset.cleanedQualityScore,
      },
      rows,
      earliestDate: dates[0],
      latestDate: dates[dates.length - 1],
      availableKeys: mappedKeys,
    },
  };
}

export function describeSourceError(error: MetricSourceError) {
  switch (error.reason) {
    case "no-dataset":
      return "Hali tozalangan ma'lumot to'plami yo'q. Avval fayl yuklang va qayta ishlang.";
    case "not-cleaned":
      return `"${error.datasetName}" hali tozalanmagan. Qayta ishlash sahifasida tozalashni ishga tushiring.`;
    case "missing-keys":
      return `"${error.datasetName}" da majburiy ustunlar bog'lanmagan: ${error.missing.join(", ")}. Ma'lumot manbalari sahifasida mapping'ni tekshiring.`;
    case "no-rows":
      return `"${error.datasetName}" da sanali qator topilmadi.`;
  }
}
