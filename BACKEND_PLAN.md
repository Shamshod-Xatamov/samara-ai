# Samara AI — Backend ishlab chiqish rejasi

> Bu hujjat [PLAN.md](./PLAN.md) ning davomi. PLAN.md frontend prototipni tasvirlaydi va u **bajarilgan**.
> Bu yerda mock ma'lumotni real backend bilan almashtirish rejasi.

## 0. Kelishilgan qarorlar

| Savol | Qaror |
|---|---|
| Hosting | Vercel (majburiy emas — VPS'ga ham ko'chiriladi) |
| Ma'lumotlar bazasi | PostgreSQL — lokalda Docker, demoda Neon |
| DB drayveri | `pg` (node-postgres) — provayderga bog'lanmaydi |
| Backend tili | TypeScript — alohida Python servis yo'q |
| ML/statistika | TypeScript'da yoziladi (regressiya, Holt, z-score, IQR) |
| EES formulasi | Biz taklif qilamiz, sozlanadigan vaznlar bilan (3-bo'lim) |
| Ma'lumot manbasi | Mijozning haqiqiy Excel fayllari + generator |

### Ochiq qolgan blokerlar

- ⚠️ **Mijozning namuna Excel fayllari kerak** (1–2 ta). 2-bosqichda parser va ustun mappingni aynan shu tuzilmaga sozlaymiz. Fayl kelmaguncha kanonik sxema (3.2-bo'lim) bo'yicha ishlaymiz — Gemini mapping qatlami tufayli fayl kelganda katta refactor talab qilinmaydi.
- ⚠️ AI joriy etish xarajati (ROI maxrajidagi qiymat) mijozdan olinishi kerak. Vaqtincha sozlamalardan kiritiladigan maydon qilamiz.

---

## 1. Texnologiyalar

```
Next.js 16.3.1 (App Router, Route Handlers)   — backend va frontend bir kodbazada
Prisma 7 ORM + PostgreSQL                     — DB, migratsiya va Prisma Studio
@prisma/adapter-pg                            — pg drayveri: lokal, Neon va VPS bir xil ishlaydi
Docker Compose                                — lokal Postgres
jose (JWT) + @node-rs/argon2                  — sessiya va parol hash
papaparse + exceljs                           — server-side CSV/XLSX parse
@google/genai                                 — Gemini SDK
exceljs + @react-pdf/renderer                 — hisobot eksporti
zod                                           — API validatsiya (allaqachon bor)
```

> **Diqqat:** Next.js 16 da `middleware.ts` **deprecated**, uning o'rniga `src/proxy.ts`.
> Har bosqichda kod yozishdan oldin `node_modules/next/dist/docs/` dagi tegishli qo'llanma o'qiladi (AGENTS.md talabi).

### Papka tuzilmasi (qo'shiladigan)

```
src/
  app/api/…/route.ts        — HTTP endpointlar
  generated/prisma/         — Prisma generatsiya qiladi (git'ga kirmaydi)
  lib/
    db.ts                   — Prisma client (singleton + pg adapter)
    auth/                   — sessiya, parol, guard
    api/                    — response helper, xatolik formati, validatsiya
    parsing/                — CSV/XLSX parser, tip aniqlash
    quality/                — profiling, cleaning
    metrics/                — KPI, seriyalar, agregatsiya
    economics/              — EES, ROI, before/after, what-if
    analytics/              — forecast (Holt/regressiya), anomaly (z-score/IQR)
    ai/                     — Gemini client, task'lar, cache, prompt'lar
    reports/                — PDF/XLSX/CSV generator
  services/                 — UI chaqiradigan typed client (fetch wrapper)
  config/routes.ts          — route ro'yxati (proxy uchun, importsiz)
  proxy.ts                  — route himoyasi
prisma/
  schema.prisma             — sxema
  migrations/               — migratsiya tarixi
  seed.ts                   — demo tashkilot va foydalanuvchi
scripts/
  emulator.ts               — real-time ingest emulyatori
```

---

## 2. Ma'lumotlar bazasi sxemasi

### Tashkilot va foydalanuvchi

| Jadval | Asosiy ustunlar |
|---|---|
| `organizations` | id, name, sector, timezone, currency, created_at |
| `users` | id, org_id, email (uniq), password_hash, full_name, role, language |
| `sessions` | id, user_id, expires_at, user_agent, created_at |
| `org_settings` | org_id (PK), thresholds jsonb, notifications jsonb, ees_config jsonb, ai_investment_cost |

`thresholds` va `notifications` [src/data/settings.ts](src/data/settings.ts) dagi `AppSettings` tipiga aynan mos — UI o'zgarmaydi, faqat manba `localStorage` dan API'ga ko'chadi.

### Ma'lumot pipeline

| Jadval | Asosiy ustunlar |
|---|---|
| `datasets` | id, org_id, name, original_filename, format, size_bytes, row_count, column_count, status, quality_score, uploaded_by, created_at |
| `dataset_columns` | id, dataset_id, source_name, canonical_key, data_type, position, null_count, distinct_count, min, max, mean, stddev, mapping_confidence, mapped_by (`ai`/`user`) |
| `dataset_rows` | id, dataset_id, row_index, raw jsonb, clean jsonb, issues jsonb — index: (dataset_id, row_index) |
| `quality_issues` | id, dataset_id, column_key, issue_type, count, affected_pct, severity, suggested_fix, applied |
| `cleaning_runs` | id, dataset_id, status, quality_before, quality_after, valid_rows_before, valid_rows_after, stage_log jsonb, started_at, finished_at |

`issue_type` — [src/data/processing.ts](src/data/processing.ts) dagi `ProcessingIssueKey`: `missing` / `duplicate` / `type` / `outlier`.

### Metrika va tahlil

| Jadval | Asosiy ustunlar |
|---|---|
| `metric_snapshots` | id, org_id, dataset_id, period_key, bucket_label, bucket_start, bucket_end, metrics jsonb |
| `forecasts` | id, org_id, dataset_id, metric_key, horizon, model, points jsonb, confidence, mape, ai_insight jsonb, generated_at |
| `anomalies` | id, org_id, dataset_id, metric_key, detected_at, severity, observed, expected, deviation_pct, z_score, method, status, trend jsonb, ai_explanation jsonb |
| `decisions` | id, org_id, code, anomaly_id, title, summary, priority, status, confidence, payload jsonb, reviewed_at, reviewed_by, feedback |

`metrics` jsonb kaliti [src/data/dashboard.ts](src/data/dashboard.ts) dagi `DashboardPoint` bilan bir xil: `efficiency`, `cost`, `processing`, `accuracy`, `productivity`.

`decisions.payload` — [src/data/decisions.ts](src/data/decisions.ts) dagi `DecisionRecommendation` tipining aynan o'zi (factors, effects, steps).

### Real-time va hisobot

| Jadval | Asosiy ustunlar |
|---|---|
| `ingest_keys` | id, org_id, name, key_hash, last_used_at, revoked_at |
| `stream_events` | id, org_id, ts, received, processed, latency_ms, error_rate, source, payload jsonb |
| `alerts` | id, org_id, rule_key, severity, title, detail, status, triggered_at, resolved_at, ai_explanation |
| `reports` | id, org_id, type, period_start, period_end, format, status, blob_url, size_bytes, payload jsonb, ai_summary jsonb, created_by, created_at |
| `ai_cache` | id, org_id, cache_key (uniq), task, model, response jsonb, tokens_in, tokens_out, created_at, expires_at |

---

## 3. Hisoblash formulalari

### 3.1. Kanonik ustun sxemasi

Har qanday yuklangan fayl quyidagi kanonik kalitlarga map qilinadi (Gemini yordamida, foydalanuvchi tuzatishi mumkin):

| Kanonik kalit | Tip | Majburiy | Izoh |
|---|---|---|---|
| `sana` | date | ✅ | Vaqt o'qi |
| `bolim` | text | ✗ | Kesim (dimension) |
| `obyekt` | text | ✗ | Mahsulot / jarayon |
| `daromad` | number | ⚠️ | mln so'm |
| `xarajat` | number | ✅ | mln so'm |
| `mehnat_soat` | number | ⚠️ | Sarflangan mehnat vaqti |
| `hajm` | number | ✗ | Yozuv / birlik soni |
| `xato_soni` | number | ✗ | Xatolar soni |
| `qayta_ishlash_vaqti` | number | ✗ | soniya |
| `avtomatlashtirilgan` | number/bool | ✗ | Avtomatlashtirilgan amal ulushi |

⚠️ = bo'lmasa, tegishli KPI "ma'lumot yetarli emas" holatida ko'rsatiladi (soxta raqam chiqarilmaydi).

### 3.2. Iqtisodiy samaradorlik indeksi (EES)

Vaznli kompozit indeks, har bir komponent min-max normallashtiriladi:

```
Nᵢ = clamp( (xᵢ − x_worst) / (x_best − x_worst), 0, 1 )
EES = 100 × Σ (wᵢ × Nᵢ)
```

`x_worst` odatda AI'gacha bo'lgan bazaviy davr qiymati, `x_best` — maqsad qiymat. Ikkalasi ham `org_settings.ees_config` dan sozlanadi.

| # | Komponent | Ko'rsatkich | Yo'nalish | Default vazn |
|---|---|---|---|---|
| 1 | Vaqt samaradorligi | o'rtacha `qayta_ishlash_vaqti` | past yaxshi | 0.20 |
| 2 | Xarajat samaradorligi | `xarajat / hajm` (birlik xarajat) | past yaxshi | 0.25 |
| 3 | Mehnat unumdorligi | `daromad / mehnat_soat` | yuqori yaxshi | 0.20 |
| 4 | Avtomatlashtirish | `avtomatlashtirilgan` ulushi | yuqori yaxshi | 0.15 |
| 5 | Sifat | `1 − xato_soni / hajm` | yuqori yaxshi | 0.20 |

Σw = 1.00. Vaznlar sozlamalarda o'zgartiriladi; UI'da qaysi vazn ishlatilgani ko'rsatiladi (himoyada savol bo'lsa javob tayyor).

### 3.3. Iqtisodiy ko'rsatkichlar

```
Tejalgan xarajat   = (birlik_xarajat_bazaviy − birlik_xarajat_joriy) × hajm_joriy
Tejalgan mehnat    = (soat_per_birlik_bazaviy − soat_per_birlik_joriy) × hajm_joriy
Unumdorlik o'sishi = (P_joriy / P_bazaviy − 1) × 100,   P = daromad / mehnat_soat
ROI                = (yillik_tejam − ai_joriy_etish_xarajati) / ai_joriy_etish_xarajati × 100
```

### 3.4. What-if (ssenariy tahlili)

Slider'lar: `avtomatlashtirish` (%) va `aniqlik` (%). Elastiklik koeffitsientlari sozlamalarda:

```
Δvaqt    = −k_t × Δavtomatlashtirish
Δxarajat = −k_c × Δavtomatlashtirish − k_a × Δaniqlik
Δxato    = −k_e × Δaniqlik
→ yangi EES, yangi ROI, yangi tejam
```

Koeffitsientlar tarixiy ma'lumotdan regressiya bilan baholanadi (mavjud bo'lsa), aks holda default qiymat + UI'da "baholangan" belgisi.

### 3.5. Prognoz (Gemini emas — statistika)

- **Model:** Holt chiziqli trend (level + trend eksponensial silliqlash), fallback — oddiy chiziqli regressiya.
- **Ishonch oralig'i:** qoldiqlar standart og'ishidan ±1.96σ√h.
- **Sifat mezoni:** MAPE (oxirgi 20% ma'lumotda backtest) — UI'dagi `confidence` maydoniga shu asosda qiymat beriladi.
- Natija `forecasts` jadvaliga saqlanadi, [src/data/ai-analytics.ts](src/data/ai-analytics.ts) dagi `ForecastPoint` shakliga mos.

### 3.6. Anomaliya aniqlash (Gemini emas — statistika)

- **Rolling z-score:** oxirgi N nuqta o'rtachasi va σ; `|z| > 3` → critical, `|z| > 2` → warning.
- **IQR:** `x < Q1 − 1.5·IQR` yoki `x > Q3 + 1.5·IQR`.
- **Trend buzilishi:** prognozdan og'ish ketma-ket 3 nuqtada ishonch oralig'idan tashqarida.
- Har bir anomaliya `anomalies` jadvaliga yoziladi. Sabab va tavsiya — Gemini (4-bosqich).

---

## 4. Gemini AI qatlami

### 4.1. Asosiy tamoyil

> **Raqamni kod hisoblaydi. Gemini raqamni izohlaydi.**

Gemini'ga hech qachon "prognoz qil" yoki "anomaliya top" deb aytilmaydi. Unga tayyor statistika beriladi va o'zbek tilida izoh + tavsiya so'raladi. Bu:
- himoyada himoya qilinadigan (metodologiya aniq),
- takrorlanadigan (bir xil kirish → bir xil raqam),
- arzon (kam token).

### 4.2. Gemini task'lari

Har bir task **structured output** (`responseSchema`) bilan ishlaydi va natija UI'da allaqachon mavjud TypeScript tipiga to'g'ridan-to'g'ri mos tushadi.

| Task | Kirish | Chiqish tipi | Cache |
|---|---|---|---|
| `column-mapping` | ustun nomlari + 5 qator namuna | `{sourceName, canonicalKey, confidence, reason}[]` | dataset bo'yicha |
| `quality-strategy` | aniqlangan muammolar statistikasi | `IssueDetail[]` ([processing.ts](src/data/processing.ts)) | dataset bo'yicha |
| `forecast-insight` | prognoz nuqtalari + trend + MAPE | `{insightTitle, insight, factors[]}` | metric+horizon bo'yicha |
| `anomaly-explanation` | anomaliya statistikasi + kontekst | `{description, causes[], recommendation, impact}` | anomaly id bo'yicha |
| `decision-generate` | anomaliya + iqtisodiy kontekst | `DecisionRecommendation` ([decisions.ts](src/data/decisions.ts)) | anomaly id bo'yicha |
| `report-summary` | hisobot KPI jadvali | `{executiveSummary, keyFindings[], risks[], recommendations[]}` | report id bo'yicha |
| `dashboard-brief` | joriy KPI + o'zgarishlar | `{headline, sentences[]}` | org+period+soat bo'yicha |
| `dataset-chat` | savol + dataset sxemasi + agregatlar | `{answer, usedColumns[], chartHint?}` | cache yo'q |

### 4.3. Xarajat nazorati

- Model zanjiri: `gemini-3.7-flash` → `gemini-3.5-flash` → `gemini-2.5-flash`.
  Google tomonida model band bo'lsa (503 `high demand`), keyingisiga o'tiladi.
  Bu kvota masalasi emas — yuklama har bir model uchun alohida.
- Har bir natija `ai_cache` da saqlanadi — sahifa qayta ochilganda API chaqirilmaydi.
- `cache_key` = `task + kirish ma'lumotining hash`i. Ma'lumot o'zgarmasa — chaqiruv yo'q.
- Monitoring sahifasida har tickda AI chaqirilmaydi. Faqat yangi alert paydo bo'lganda 1 marta, va throttle bilan.
- Rate limit: foydalanuvchi boshiga daqiqasiga N ta AI so'rov.
- AI ishlamay qolsa — UI raqamlarni baribir ko'rsatadi, faqat izoh o'rnida "AI izohi hozircha mavjud emas" holati chiqadi. **AI hech qachon sahifani buzmaydi.**

---

## 5. API kontrakti

Barcha javoblar: `{ ok: true, data }` yoki `{ ok: false, error: { code, message, details? } }`. Xato xabarlari o'zbek tilida.

### Auth
```
POST   /api/auth/login          { email, password } → user + cookie
POST   /api/auth/logout
GET    /api/auth/me
```

### Sozlamalar
```
GET    /api/settings
PATCH  /api/settings
```

### Ma'lumot manbalari
```
GET    /api/datasets
POST   /api/datasets                    multipart, CSV/XLSX
POST   /api/datasets/demo               generator bilan demo dataset
GET    /api/datasets/:id
GET    /api/datasets/:id/rows?limit&offset
POST   /api/datasets/:id/mapping        AI mappingni tasdiqlash/tuzatish
DELETE /api/datasets/:id
```

### Qayta ishlash
```
GET    /api/datasets/:id/quality
POST   /api/datasets/:id/clean          → cleaning_run id
GET    /api/cleaning-runs/:id           progress polling
```

### Metrika va iqtisod
```
GET    /api/metrics?period=&datasetId=
GET    /api/metrics/series?period=&metric=
GET    /api/economics?period=
POST   /api/economics/what-if           { automation, accuracy }
```

### AI
```
GET    /api/ai/forecast?metric=&horizon=
GET    /api/ai/anomalies
GET    /api/ai/summary?scope=dashboard
POST   /api/ai/chat                     { question, datasetId }
```

### Qarorlar
```
GET    /api/decisions
POST   /api/decisions/generate
PATCH  /api/decisions/:id               { status, feedback }
```

### Monitoring
```
POST   /api/ingest                      x-api-key sarlavhasi bilan
GET    /api/monitoring/stream           SSE
GET    /api/monitoring/overview
GET    /api/monitoring/alerts
PATCH  /api/alerts/:id
```

### Hisobotlar
```
GET    /api/reports
POST   /api/reports                     { type, periodStart, periodEnd, format }
GET    /api/reports/:id
GET    /api/reports/:id/download
```

---

## 6. Bosqichlar

### 0-bosqich — Poydevor

- [x] `docker-compose.yml` — lokal Postgres
- [x] Prisma 7 + `@prisma/adapter-pg` o'rnatish, `.env.example`
- [x] Auth sxemasi va birinchi migratsiya (`init_auth`)
- [x] `src/lib/api/response.ts` — response helper, xatolik kodlari, error wrapper
- [x] `src/services` — UI uchun typed fetch client (UI hech qachon `fetch` ni to'g'ridan chaqirmaydi)
- [x] `prisma/seed.ts` — demo tashkilot, foydalanuvchi, sozlamalar, EES konfiguratsiyasi
- [x] `pnpm build` va `pnpm lint` toza
- [ ] Qolgan jadvallar ([2-bo'lim](#2-malumotlar-bazasi-sxemasi)) — 2-bosqichda qo'shiladi

### 1-bosqich — Auth va sozlamalar

- [x] argon2 parol hash, sessiya cookie (httpOnly, secure, sameSite)
- [x] Bazadagi sessiya — serverdan bekor qilish mumkin
- [x] `login` / `logout` / `me` endpointlari
- [x] `src/proxy.ts` — platforma route'larini himoyalash, `?keyin=` bilan qaytarish
- [x] [login-form.tsx](src/components/auth/login-form.tsx) real API'ga ulandi + real xato holati
- [x] [app-topbar.tsx](src/components/layout/app-topbar.tsx) — haqiqiy foydalanuvchi va tashkilot nomi
- [x] Chiqish tugmasi sessiyani bazadan o'chiradi
- [x] `GET`/`PATCH /api/settings` — profil, tashkilot, chegaralar, bildirishnomalar
- [x] **Iqtisodiy hisob** bo'limi: AI joriy etish xarajati, bazaviy davr, EES vaznlari
      (saqlashda yig'indi 1 ga normallashtiriladi)
- [x] [settings-view.tsx](src/features/settings/settings-view.tsx) — API'ga ulandi,
      `localStorage` olib tashlandi
- [ ] Parolni o'zgartirish endpointi

### 2-bosqich — Ma'lumot pipeline

- [x] Namuna ma'lumot generatori (`pnpm data:generate`) — 3 ta ataylab nuqsonli fayl
- [x] Server-side CSV/XLSX parser (`papaparse` + `exceljs`), tip aniqlash, ustun statistikasi
- [x] Qiymat normallashtirish: `"1,424"`, `"1 240"`, `"N/A"`, Excel serial sana
- [x] `POST /api/datasets` — fayl → `datasets` + `dataset_columns` + `dataset_rows`
- [x] `GET /api/datasets`, `GET /api/datasets/:id`, `DELETE /api/datasets/:id`
- [x] Real sifat profiling: missing / duplicate / type error / outlier (IQR) — haqiqiy hisoblash
- [x] Sifat balli formulasi (5 komponent): yaroqli qatorlar 30% + to'liqlik 25% +
      yaroqlilik 20% + takrorsizlik 15% + izchillik 10%
- [x] Evristik ustun mapping (`guessCanonicalKey`) — Gemini ishlamasa zaxira sifatida
- [x] `src/lib/ai/gemini.ts` — kesh, model zanjiri, timeout, graceful degradation
- [x] **Gemini `column-mapping`** — ustun nomlari → kanonik sxema + o'lchov birligi (`unitScale`)
- [x] `POST /api/datasets/:id/mapping` — AI mapping va foydalanuvchi tuzatishi
- [ ] Mapping tasdiqlash UI (AI taklifi + foydalanuvchi tuzatishi)
- [x] `POST /api/datasets/:id/clean` — median to'ldirish, dedup, format normalizatsiya,
      `unitScale` qo'llash, IQR winsorization; har bir o'zgarish `issues` da qayd etiladi
- [x] `GET /api/datasets/:id/clean` — tozalash tarixi
- [x] Real oldin/keyin sifat balli (`cleaning_runs` jadvalida saqlanadi)
**2-bosqich yakunlandi.** Qolgan yaxshilanishlar:

- [ ] **Gemini `quality-strategy`** — har bir muammoga tozalash tavsiyasi
- [ ] Outlier'ni kesim bo'yicha aniqlash (`bolim` / `obyekt` guruhlarida) — hozir global IQR
      ko'p tarqoq ustunlarda ortiqcha signal beradi
- [ ] `POST /api/datasets/:id/clean` — real tozalash (median to'ldirish, dedup, tip konversiya, IQR winsorization), `clean` ustuniga yozish
- [ ] Before/after sifat balli haqiqiy hisoblangan qiymat bo'ladi
- [x] `POST /api/datasets/demo` — namuna faylni tizimga yuklaydi
- [x] `src/services/api-client.ts` + `src/services/datasets.ts` — typed fetch qatlami
- [x] [data-sources-view.tsx](src/features/data-sources/data-sources-view.tsx) — real upload,
      dataset ro'yxati, o'chirish, mapping paneli (AI taklifi + qo'lda tuzatish), preview
- [x] [processing-view.tsx](src/features/processing/processing-view.tsx) — real sifat muammolari,
      tozalash tugmasi, bosqichlar va oldin/keyin natija
- [x] Bo'sh holat: dataset yo'q bo'lsa "Ma'lumot yuklash" ga yo'naltiradi

**Tekshirilgan natijalar (namuna fayllar):**

| Fayl | Sifat | Yaroqli qatorlar |
|---|---|---|
| `ishlab-chiqarish-2025-2026.xlsx` | 96 → 100 | 1 273 → 1 412 |
| `operatsion-jarayonlar.csv` | 97 → 100 | 1 693 → 1 725 |
| `sifatsiz-malumot-namunasi.csv` | 84 → 99 | 187 → 320 |

> 📎 Bu bosqichda mijozning namuna Excel fayllari kerak bo'ladi.

### 3-bosqich — Metrika va iqtisod

- [x] Davr bo'linishi (`period.ts`): bugun / 7 kun / 30 kun / chorak / yil
- [x] Agregatsiya servisi: tozalangan qatorlardan davr bo'yicha KPI va seriyalar
- [x] Manba tanlash: kanonik sxemaga eng ko'p bog'langan, eng katta dataset
- [x] EES hisoblagichi (3.2) + sozlanadigan vaznlar; ustuni yo'q komponent
      hisobdan chiqariladi va `coverage` sifatida ko'rsatiladi
- [x] ROI, tejam, unumdorlik (3.3); bazaviy davr — ma'lumotning birinchi 60 kuni
- [x] Before/after taqqoslash — bir xil hajmga keltirilgan (30 kunlik ekvivalent)
- [x] What-if hisoblagichi (3.4) elastiklik koeffitsientlari bilan
- [x] `GET /api/metrics`, `GET /api/economics`, `POST /api/economics`
- [x] [dashboard-view.tsx](src/features/dashboard/dashboard-view.tsx) va [economic-efficiency-view.tsx](src/features/economic-efficiency/economic-efficiency-view.tsx) ulandi
- [x] Ma'lumot yetarli bo'lmagan KPI'lar uchun "—" va sabab ko'rsatiladi
- [ ] `metric_snapshots` keshi — hozir har so'rovda hisoblanadi (1400 qatorda tez)
- [ ] Elastiklik koeffitsientlarini tarixiy ma'lumotdan regressiya bilan baholash

**Tekshirilgan natijalar** (`ishlab-chiqarish-2025-2026.xlsx`, 30 kunlik davr):

| Ko'rsatkich | Bazaviy (sen–okt 2025) | Joriy (iyul–avg 2026) |
|---|---|---|
| EES | 42.6 | **84.9** |
| Qayta ishlash vaqti | 8.42 s | **2.30 s** |
| Mehnat vaqti | 1 130 soat/oy | **806 soat/oy** |
| Operatsion xarajat | 143.5 mln/oy | **117.8 mln/oy** |
| Xatolar darajasi | 4.66% | **1.73%** |

Tejam 25.6 mln so'm/oy, 324 soat/oy, ROI 73.3%.

### 4-bosqich — AI qatlami

- [x] `src/lib/ai/gemini.ts` — client, structured output, model zanjiri, timeout, xato holati
- [x] `ai_cache` qatlami + cache key hash
- [x] **Holt-Winters** prognoz (haftalik mavsumiylik) + MAPE backtest
- [x] Mavsumiy tuzatilgan z-score / IQR anomaliya detektori → `anomalies`
- [x] **Gemini `forecast-insight`** va **`anomaly-explanation`**
- [x] **Gemini `decision-generate`** — anomaliyadan to'liq qaror tavsiyasi
- [x] Qaror statusi va feedback saqlash; qaror yopilsa anomaliya ham yopiladi
- [x] AI xatosida graceful degradation — statistika baribir ko'rsatiladi
- [x] `GET /api/ai/forecast`, `GET /api/ai/anomalies`,
      `POST /api/ai/anomalies/:id/explain`, `GET|POST /api/decisions`,
      `PATCH /api/decisions/:id`
- [x] [ai-analytics-view.tsx](src/features/ai-analytics/ai-analytics-view.tsx) va [decisions-view.tsx](src/features/decisions/decisions-view.tsx) ulandi
- [ ] `dashboard-brief` — dashboard uchun AI xulosa
- [ ] Rate limit (AI endpointlariga)

**Model tanlash va validatsiya:**

| | Holt (mavsumiysiz) | Holt-Winters (mavsum 7 kun) |
|---|---|---|
| Xarajat MAPE | 30.7% | **5.1%** |
| Ishonch | 69.3% | **94.9%** |
| Ishonch oralig'i | −1.46 … 9.69 (manfiy!) | 2.96 … 6.64 |

Anomaliya detektori generator ataylab qo'ygan xarajat sakrashlarini topdi:
`2026-06-17` (+26.7%, z=8.17) va `2026-08-14` (+23.1%, z=4.92).

### 5-bosqich — Real vaqt monitoringi

> **Mijoz qarori bilan scope'dan chiqarildi.** [monitoring-view.tsx](src/features/monitoring/monitoring-view.tsx)
> sahifasiga ochiq namoyish banneri qo'yildi: oqim brauzerda generatsiya qilinishi
> va real manba ulanmagani aniq yozilgan.

- [ ] `ingest_keys` — API key generatsiya va sozlamalarda ko'rsatish
- [ ] `POST /api/ingest` — tashqi tizimdan real yozuv qabul qilish
- [ ] Threshold engine: sozlamalardagi latency / errorRate / aiAccuracy / costIncrease bo'yicha alert yaratish
- [ ] `GET /api/monitoring/stream` — SSE
- [ ] `scripts/emulator.ts` — sensor emulyatori (`pnpm emulate`), mavsumiylik va anomaliya bilan
- [ ] Alert bo'yicha bir martalik **Gemini izohi** (throttled)
- [ ] [monitoring-view.tsx](src/features/monitoring/monitoring-view.tsx) — `setInterval` + `Math.random()` olib tashlanadi

### 6-bosqich — Hisobotlar

> **Mijoz qarori bilan scope'dan chiqarildi.** [reports-view.tsx](src/features/reports/reports-view.tsx)
> sahifasiga ochiq namoyish banneri qo'yildi.

- [ ] Hisobot ma'lumotini yig'ish servisi (tur bo'yicha bo'limlar)
- [ ] **Gemini `report-summary`** — executive summary, xulosalar, risklar, tavsiyalar
- [ ] XLSX (`exceljs`), CSV, PDF (`@react-pdf/renderer`) generatorlari
- [ ] Fayl saqlash (Vercel Blob) + `GET /api/reports/:id/download`
- [ ] Hisobot tarixi real DB'dan
- [ ] [reports-view.tsx](src/features/reports/reports-view.tsx) ulanadi

### 7-bosqich — Yakunlash

- [ ] Barcha sahifalarda loading / empty / error holatlari
- [ ] Rate limiting va input hajm cheklovlari
- [ ] Connection pooling tekshiruvi (Vercel'da Neon'ning pooled connection string'i)
- [ ] Demo seed skripti — bir buyruq bilan to'liq to'ldirilgan demo
- [ ] `pnpm lint` + `pnpm build` toza
- [ ] Vercel deploy + env o'zgaruvchilari
- [ ] `README.md` — o'rnatish va ishga tushirish yo'riqnomasi

### Bonus (vaqt qolsa)

- [ ] `POST /api/ai/chat` — dataset bilan tabiiy tilda suhbat. Himoyada eng kuchli demo elementi.

---

## 7. Prioritet

Agar vaqt yoki byudjet siqilsa:

| Prioritet | Bosqichlar | Nima beradi |
|---|---|---|
| **P0 — shart** | 0, 1, 2, 3 | Real auth, real ma'lumot, real hisoblangan KPI. Appni "mock" bo'lishdan chiqaradi |
| **P1 — asosiy qiymat** | 4 | AI qatlami. Proyektning "AI platformasi" degan da'vosini haqiqiy qiladi |
| **P2 — muhim** | 6, 7 | Hisobotlar va yakuniy sifat |
| **P3 — oxirgi** | 5 | Real-time monitoring. Emulyator bilan ham ishonarli ko'rinadi |

**0–4 bosqichsiz** platforma hali ham chiroyli maket bo'lib qoladi. Shu sababli ular birinchi.

---

## 8. Muhim tamoyillar

1. **UI API shakliga bog'lanmaydi** — orada `src/services` qatlami turadi.
2. **Har bir raqamning kelib chiqishi bor** — hech qayerda hardcoded qiymat qolmaydi.
3. **AI qulamasa, app qulamaydi** — AI izohi opsional qatlam.
4. **Demo va real ma'lumot ajratiladi** — UI'da aniq belgi bilan.
5. **Barcha xato xabarlari o'zbek tilida.**
6. **Har bosqich oxirida `pnpm lint` va `pnpm build` toza bo'ladi.**
