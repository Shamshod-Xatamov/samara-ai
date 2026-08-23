# Samara AI

Sun'iy intellekt asosida iqtisodiy samaradorlikni real vaqt rejimida kuzatish, tahlil qilish va boshqaruv qarorlarini qo'llab-quvvatlash platformasi.

## Ishga tushirish

Talab: Node.js 20+, pnpm va Docker.

```bash
# 1. Muhit o'zgaruvchilari
cp .env.example .env
# .env ichida SESSION_SECRET ni to'ldiring:
#   openssl rand -base64 32

# 2. Ma'lumotlar bazasi (Postgres)
pnpm db:up

# 3. Paketlar va sxema
pnpm install
pnpm db:migrate
pnpm db:seed

# 4. Ishga tushirish
pnpm dev
```

Brauzerda [http://localhost:3000](http://localhost:3000) manzilini oching.

### Demo hisob

| Email | Parol |
| --- | --- |
| `analitik@tashkilot.uz` | `Samara2026!` |

## Asosiy buyruqlar

```bash
pnpm dev          # ishlab chiqish serveri
pnpm lint         # ESLint
pnpm build        # production build
pnpm start        # production server

pnpm db:up        # Postgres konteynerini ko'tarish
pnpm db:down      # konteynerni to'xtatish
pnpm db:migrate   # migratsiya yaratish va qo'llash
pnpm db:seed      # demo ma'lumot
pnpm db:studio    # bazani brauzerda ko'rish
pnpm db:reset     # bazani tozalab qayta qurish

pnpm data:generate  # namuna CSV/XLSX fayllarni yaratish
```

> **Eslatma:** `prisma generate` ishlagandan keyin `pnpm dev` ni qayta ishga tushiring.
> Dev server Prisma client'ni xotirada saqlaydi, shuning uchun yangi jadvallar
> qayta ishga tushirilmaguncha ko'rinmaydi.

## Namuna ma'lumotlar

`pnpm data:generate` buyrug'i `namuna-malumotlar/` papkasida uchta fayl yaratadi.
Ular ataylab nuqsonli — bo'sh kataklar, dublikatlar, `"1,424"` kabi format
xatolari va outlier'lar bilan, chunki qayta ishlash moduli aynan shularni
topishi va tuzatishi kerak.

| Fayl | Mazmuni |
| --- | --- |
| `ishlab-chiqarish-2025-2026.xlsx` | 12 oylik ishlab chiqarish hisoboti, 1 420 qator |
| `operatsion-jarayonlar.csv` | Jarayon loglari, 1 732 qator |
| `sifatsiz-malumot-namunasi.csv` | Sifati past kichik namuna, 331 qator |
| `sinov-korxona-2026.xlsx` | AI'ni sinash uchun mustaqil fayl (`pnpm data:test`) |

AI qatlamini o'zingiz tekshirish uchun:
[SINOV-YORIQNOMASI.md](./namuna-malumotlar/SINOV-YORIQNOMASI.md)

## Ma'lumotlar bazasi

PostgreSQL + Prisma 7. Ulanish `DATABASE_URL` orqali sozlanadi — lokal Docker,
Neon yoki VPS'dagi Postgres uchun kod o'zgarmaydi, faqat shu qator almashadi.

## Hujjatlar

- [DEPLOY.md](./DEPLOY.md) — Vercel va Neon'ga chiqarish yo'riqnomasi
- [PLAN.md](./PLAN.md) — frontend prototip rejasi (bajarilgan)
- [BACKEND_PLAN.md](./BACKEND_PLAN.md) — backend arxitekturasi, formulalar va bosqichlar
- [UI_CHECKLIST.md](./UI_CHECKLIST.md) — UI nazorat bandlari
