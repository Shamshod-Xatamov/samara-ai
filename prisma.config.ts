import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node --import tsx prisma/seed.ts",
  },
  datasource: {
    /**
     * Migratsiya connection pooler orqali ishlamaydi (Neon pgbouncer
     * tranzaksiya rejimida DDL'ni qo'llab-quvvatlamaydi), shuning uchun
     * CLI uchun to'g'ridan-to'g'ri ulanish ustun turadi.
     * Ish vaqtida esa `src/lib/db.ts` pooled `DATABASE_URL` dan foydalanadi.
     */
    url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL,
  },
});
