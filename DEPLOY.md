# Vercel'ga chiqarish

Talab qilinadi: GitHub hisobi, [Neon](https://neon.tech) va [Vercel](https://vercel.com)
hisoblari (ikkalasi ham bepul rejada yetarli).

---

## 1. Neon'da baza yaratish

1. [console.neon.tech](https://console.neon.tech) da yangi loyiha oching
2. Region: Yevropa (`eu-central-1`) — O'zbekistondan eng yaqini
3. **Connection string** bo'limida **ikkita** manzilni nusxa oling:

| Manzil | Qayerda ishlatiladi | Belgisi |
| --- | --- | --- |
| **Pooled connection** | Ilova ish vaqtida | host nomida `-pooler` bor |
| **Direct connection** | Faqat migratsiya | `-pooler` yo'q |

> **Nega ikkita?** Vercel serverless — har so'rov yangi ulanish ochadi, shuning
> uchun ish vaqtida pooler shart. Lekin migratsiya (jadval yaratish) pooler
> orqali ishlamaydi: pgbouncer tranzaksiya rejimida DDL'ni qo'llab-quvvatlamaydi.

---

## 2. Kodni GitHub'ga yuborish

```bash
git add .
git commit -m "Backend: ma'lumot pipeline, metrika, AI tahlili va qarorlar"
git push origin Backend
```

`.env` fayli `.gitignore` da — kalitlar hech qachon repoga tushmaydi.
`namuna-malumotlar/` esa **commit qilinadi**, chunki "Namuna dataset" tugmasi
shu fayllarni o'qiydi.

---

## 3. Vercel'ga ulash

1. [vercel.com/new](https://vercel.com/new) → `samara-ai` repositoriysini tanlang
2. **Framework Preset:** Next.js (avtomatik aniqlanadi)
3. **Build Command** va **Install Command** — o'zgartirmang, `package.json` dan olinadi
4. Deploy tugmasini **hali bosmang** — avval o'zgaruvchilarni kiriting

---

## 4. Environment Variables

Vercel'da **Settings → Environment Variables** bo'limiga o'ting va to'rttasini
qo'shing. Har birini **Production, Preview, Development** — uchalasiga belgilang.

| Nomi | Qiymati |
| --- | --- |
| `DATABASE_URL` | Neon'ning **pooled** manzili |
| `DIRECT_DATABASE_URL` | Neon'ning **direct** manzili |
| `SESSION_SECRET` | `openssl rand -base64 32` natijasi |
| `GEMINI_API_KEY` | Google AI Studio kaliti |

```bash
# Yangi sessiya kaliti yaratish:
openssl rand -base64 32
```

> **Muhim:** production uchun **yangi** `SESSION_SECRET` yarating. Lokal
> kalitni ishlatmang — u ishlab chiqish davomida turli joylarda ko'rinib
> ketgan bo'lishi mumkin.

> **Gemini kaliti haqida:** agar kalit chat, skrinshot yoki xabarda ko'ringan
> bo'lsa, [AI Studio](https://aistudio.google.com/apikey) da yangisini yarating
> va eskisini o'chiring. Deploy'dan oldin qilingani ma'qul.

---

## 5. Deploy va migratsiya

**Deploy** tugmasini bosing. Build jarayoni avtomatik ravishda:

```
prisma generate        → Prisma client
prisma migrate deploy  → 6 ta migratsiya Neon'ga qo'llanadi
next build             → ilova quriladi
```

Migratsiya qo'lda ishga tushirilmaydi — `build` skriptining ichida.

---

## 6. Boshlang'ich ma'lumot (bir marta)

Baza bo'sh, foydalanuvchi yo'q. Seed'ni **lokal mashinadan** Neon'ga qarshi
ishga tushiring:

```bash
DATABASE_URL="<pooled-manzil>" \
DIRECT_DATABASE_URL="<direct-manzil>" \
pnpm db:seed
```

Natijada quyidagilar yaratiladi:

- Demo tashkilot va sozlamalari (EES vaznlari, bazaviy davr, ROI parametri)
- Foydalanuvchi: `analitik@tashkilot.uz` / `Samara2026!`

> **Parolni darhol o'zgartiring** — Sozlamalar sahifasidan emas, hozircha
> `prisma/seed.ts` dagi `DEMO_PASSWORD` ni almashtirib, seed'ni qayta ishga
> tushirish orqali. Parol o'zgartirish endpointi hali yozilmagan.

---

## 7. Tekshirish

Deploy tugagach, ochilgan manzilda:

| Tekshiruv | Kutilayotgan natija |
| --- | --- |
| Bosh sahifa | Planshet ichida namoyish paneli ko'rinadi |
| `/kirish` | Login formasi, demo hisob bilan kiradi |
| Ma'lumotlar → **Namuna dataset** | 1 420 qatorli dataset yaratiladi |
| **AI bilan aniqlash** | 10–15 soniyada ustunlar bog'lanadi |
| Qayta ishlash → **Tozalash** | Sifat 96 → 100 |
| Dashboard | Real KPI va grafiklar |

---

## Nima sozlangan

Vercel muhitiga moslash uchun quyidagilar qilingan:

| Sozlama | Nega kerak |
| --- | --- |
| `maxDuration = 60` (AI route'larida) | Default chegara **10 soniya**, Gemini esa 9–15 soniya ishlaydi — usiz AI mapping uzilib qolardi |
| `maxDuration = 120` (qarorlar) | Bir nechta anomaliya uchun generatsiya |
| Qaror generatsiyasi **parallel** | Ketma-ket bo'lsa 4 ta anomaliya ~40 soniya olardi |
| `outputFileTracingIncludes` | Namuna fayllar bundle'ga qo'shiladi, aks holda "Namuna dataset" 404 berardi |
| `DIRECT_DATABASE_URL` | Migratsiya pooler orqali ishlamaydi |
| `prisma migrate deploy` build'da | Baza sxemasi deploy bilan birga yangilanadi |

---

## Muammo bo'lsa

**Login ishlamayapti, 500 xatosi**
`@node-rs/argon2` — native modul. Vercel loglarida `Cannot find module` bo'lsa,
`Settings → General → Node.js Version` ni **22.x** ga o'rnating va qayta deploy qiling.

**"Ma'lumot to'plami topilmadi" yoki bo'sh dashboard**
Seed ishga tushirilmagan (6-qadam) yoki hali fayl yuklanmagan.

**AI izohlari o'rniga "AI xizmati hozir band"**
Gemini 503 qaytargan. Kod avtomatik ravishda `gemini-3.7-flash` →
`gemini-3.5-flash` → `gemini-2.5-flash` zanjiri bo'ylab o'tadi; uchalasi ham
band bo'lsa birozdan keyin qayta urinib ko'ring. Raqamlar va grafiklar
AI'siz ham to'g'ri ko'rsatiladi.

**Migratsiya xatosi: `prepared statement does not exist`**
`DIRECT_DATABASE_URL` pooled manzilga qo'yilgan. Uni `-pooler` **siz** manzilga
almashtiring.
