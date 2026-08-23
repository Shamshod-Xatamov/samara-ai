import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL topilmadi. `.env` faylini tekshiring (`.env.example` dan nusxa oling).",
  );
}

// Prisma 7 driver adapter orqali ishlaydi. Ostida `pg` turgani uchun
// lokal Postgres, Neon va VPS bir xil kod bilan ishlaydi.
function createPrismaClient() {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

// `next dev` hot reload'da har safar yangi client yaratilsa, ulanishlar tugaydi.
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
