import "dotenv/config";

import { hash } from "@node-rs/argon2";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { defaultSettings } from "../src/data/settings";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL topilmadi. `.env` faylini tekshiring.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const DEMO_EMAIL = "analitik@tashkilot.uz";
const DEMO_PASSWORD = "Samara2026!";

/**
 * Iqtisodiy samaradorlik indeksi (EES) konfiguratsiyasi.
 * Formula va izohlar: BACKEND_PLAN.md, 3.2-bo'lim.
 * Vaznlar yig'indisi 1.00 bo'lishi shart.
 */
const defaultEesConfig = {
  weights: {
    time: 0.2,
    cost: 0.25,
    labor: 0.2,
    automation: 0.15,
    quality: 0.2,
  },
  // Min-max normallashtirish chegaralari: worst → 0 ball, best → 100 ball.
  bounds: {
    time: { worst: 8.4, best: 1.0, unit: "soniya" },
    cost: { worst: 150, best: 100, unit: "mln so'm" },
    labor: { worst: 0.15, best: 0.35, unit: "mln so'm / soat" },
    automation: { worst: 40, best: 95, unit: "%" },
    quality: { worst: 0.9, best: 0.995, unit: "ulush" },
  },
  // What-if ssenariysi uchun elastiklik koeffitsientlari (3.4-bo'lim).
  // Tarixiy ma'lumot yetarli bo'lganda regressiya bilan qayta baholanadi.
  elasticity: {
    timePerAutomation: 0.012,
    costPerAutomation: 0.008,
    costPerAccuracy: 0.006,
    errorPerAccuracy: 0.05,
  },
  /** AI'gacha bo'lgan bazaviy davr uzunligi (kun) */
  baselineDays: 60,
};

/**
 * AI joriy etish xarajati, mln so'm.
 * DIQQAT: bu taxminiy qiymat — ROI hisobi shunga bog'liq.
 * Mijoz haqiqiy raqamni bergach, Sozlamalar sahifasidan almashtiriladi.
 */
const ASSUMED_AI_INVESTMENT = 180;

async function main() {
  const organization = await prisma.organization.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      name: defaultSettings.organization.name,
      sector: defaultSettings.organization.sector,
      timezone: defaultSettings.organization.timezone,
      currency: defaultSettings.organization.currency,
      settings: {
        create: {
          thresholds: defaultSettings.thresholds,
          notifications: defaultSettings.notifications,
          eesConfig: defaultEesConfig,
          aiInvestmentCost: ASSUMED_AI_INVESTMENT,
        },
      },
    },
  });

  const passwordHash = await hash(DEMO_PASSWORD);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { passwordHash, isActive: true },
    create: {
      orgId: organization.id,
      email: DEMO_EMAIL,
      passwordHash,
      fullName: defaultSettings.profile.fullName,
      role: "ADMIN",
      language: defaultSettings.profile.language,
    },
  });

  console.log("✅ Seed yakunlandi");
  console.log(`   Tashkilot : ${organization.name}`);
  console.log(`   Email     : ${user.email}`);
  console.log(`   Parol     : ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error("❌ Seed xatosi:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
