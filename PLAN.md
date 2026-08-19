# Samara AI — MVP ishlab chiqish rejasi

## 1. Loyiha maqsadi

Korxona ma'lumotlarini real vaqtga yaqin rejimda kuzatish, AI tahlili natijalarini iqtisodiy ko'rsatkichlarga aylantirish va boshqaruv qarorlarini qo'llab-quvvatlash uchun professional web-platforma prototipini yaratish.

Ushbu versiyaning asosiy vazifasi — dissertatsiya himoyasi va mijoz namoyishi uchun tushunarli, ishonchli ko'rinadigan va interaktiv MVP tayyorlash. Platforma production darajadagi ERP/CRM/IoT integratsiyasi emas, keyinchalik backend ulash mumkin bo'lgan sifatli frontend prototip bo'ladi.

## 2. Kelishilgan MVP chegarasi

- Interfeys tili: faqat o'zbek tili (lotin yozuvi).
- Login: faqat email va parol, bitta `Kirish` tugmasi.
- Ro'yxatdan o'tish va parolni tiklash hozircha bo'lmaydi.
- Asosiy ma'lumotlar demo/mock holatda ishlaydi.
- Real-time oqim brauzer ichida simulyatsiya qilinadi.
- CSV/XLSX yuklash interfeysi va ma'lumot preview'i bo'ladi.
- Grafiklar, filtrlar va asosiy tugmalar interaktiv bo'ladi.
- Iqtisodiy samaradorlik indeksi (EES) demo qiymat bilan ko'rsatiladi; haqiqiy formula mijoz tomonidan berilgandan keyin ulanadi.
- Arxitektura keyinchalik FastAPI, PostgreSQL va WebSocket ulashga tayyor bo'ladi.

## 3. Texnologiyalar

- Next.js, App Router
- React va TypeScript
- Tailwind CSS
- Dizayn komponentlari uchun shadcn/ui yondashuvi
- Ikonkalar uchun Lucide React
- Grafiklar uchun Recharts
- Forma validatsiyasi uchun React Hook Form va Zod
- Sana/vaqt formatlash uchun date-fns
- XLSX/CSV preview uchun SheetJS yoki Papa Parse
- Kod sifati uchun ESLint va Prettier

Global state kutubxonasi faqat zarurat tug'ilsa qo'shiladi. Dastlab server/client componentlar va lokal React state yetarli bo'ladi.

## 4. Axborot arxitekturasi

### Ochiq sahifa

- `/` — platforma imkoniyatlari va iqtisodiy natijalarni tushuntiruvchi landing page
- `/kirish` — email va parol orqali kirish

### Himoyalangan platforma sahifalari

- `/dashboard` — boshqaruv paneli, umumiy KPI va asosiy dinamikalar
- `/malumotlar` — CSV/XLSX yuklash, demo dataset va manbalar tarixi
- `/qayta-ishlash` — ma'lumot sifati va tozalash natijalari
- `/ai-tahlil` — prognozlash va anomaliyalarni aniqlash
- `/iqtisodiy-samaradorlik` — iqtisodiy KPI, AI'dan oldin/keyin va ssenariy tahlili
- `/monitoring` — real vaqt oqimi, tizim holati va ogohlantirishlar
- `/qarorlar` — AI/algoritmik tavsiyalar va kutilayotgan iqtisodiy ta'sir
- `/hisobotlar` — hisobotlar ro'yxati va demo eksport
- `/sozlamalar` — profil va interfeysning minimal sozlamalari

## 5. Ilova karkasi va navigatsiya

Desktop holatda chap tomonda yig'iladigan sidebar, yuqorida esa ixcham topbar ishlatiladi.

### Sidebar

- Logo va platforma nomi
- Asosiy navigatsiya
- Aktiv sahifa aniq ko'rsatiladi
- Pastki qismda foydalanuvchi va chiqish amali
- Kichik ekranlarda drawer ko'rinishiga o'tadi

### Topbar

- Joriy sahifa nomi
- Davr filtri
- Tashkilot nomi
- Bildirishnomalar
- Foydalanuvchi profili

## 6. Dizayn yo'nalishi

Vizual uslub ilmiy, texnologik va moliyaviy platformaga mos bo'ladi: yengil kulrang tashqi fon, alohida oq sidebar va content frame, ko'k asosiy actionlar hamda samaradorlik uchun yashil-ko'kimtir aksentlar. Ortiqcha gradient, neon effekt, katta soyalar va dekorativ elementlardan foydalanilmaydi.

### Asosiy ranglar

| Token | Rang | Vazifa |
| --- | --- | --- |
| `--background` | `#EDF1F6` | Sahifa foni |
| `--surface` | `#FFFFFF` | Kartalar va panellar |
| `--sidebar` | `#FFFFFF` | Asosiy navigatsiya paneli |
| `--primary` | `#2559C7` | Asosiy tugma va aktiv holat |
| `--primary-hover` | `#1D49AB` | Hover holati |
| `--accent` | `#087D72` | Samaradorlik va iqtisodiy aksent |
| `--text` | `#172033` | Asosiy matn |
| `--text-muted` | `#6A778B` | Ikkinchi darajali matn |
| `--border` | `#E1E7EF` | Chegara va ajratgichlar |
| `--success` | `#16A34A` | Normal va ijobiy natija |
| `--warning` | `#D97706` | Ogohlantirish |
| `--danger` | `#DC2626` | Kritik holat va xato |

Ranglar faqat ma'no bilan ishlatiladi. Masalan, xarajatning kamayishi yashil, latency oshishi qizil bo'ladi. Faqat rangga tayanilmaydi: ikonka, matn va belgi ham beriladi.

### Tipografiya va o'lchamlar

- Asosiy shrift: Manrope; metrik raqamlar uchun JetBrains Mono.
- Asosiy matn: 14–16 px.
- Sahifa sarlavhasi: 24–28 px.
- KPI qiymatlari: 26–32 px.
- Burchak radiusi: 10–14 px.
- Spacing: 4 px asosidagi yagona tizim.
- Kartalarda juda katta soya emas, yengil border va minimal soya ishlatiladi.

## 7. `globals.css` strategiyasi

Barcha asosiy vizual qiymatlar `src/app/globals.css` ichidagi CSS variable'lar orqali boshqariladi:

- ranglar;
- radiuslar;
- fon va surface qiymatlari;
- matn ranglari;
- chart ranglari;
- sidebar o'lchamlari;
- focus ring;
- transition tezligi.

Komponentlarda tasodifiy hex ranglar yozilmaydi. Bu keyinchalik butun platforma ko'rinishini bitta fayldan xavfsiz boshqarish imkonini beradi. Birinchi versiyada sifatli light theme qilinadi; dark theme MVP scope'iga kirmaydi.

## 8. Sahifalar bo'yicha funksional reja

### 8.1. Kirish

- Platforma logotipi va qisqa izoh
- Email va parol maydonlari
- Parolni ko'rsatish/yashirish
- Validatsiya va xato holati
- Loading holatidagi `Kirish` tugmasi
- Demo kirishdan so'ng dashboardga yo'naltirish

### 8.2. Boshqaruv paneli

- Iqtisodiy samaradorlik balli
- Qayta ishlash vaqti
- AI aniqligi
- Avtomatlashtirish darajasi
- Operatsion xarajat
- Tejalgan xarajat
- Tejalgan ish vaqti
- ROI
- Oldingi davrga nisbatan o'zgarish
- 2–3 ta eng foydali grafik
- So'nggi alertlar va qisqa tavsiyalar

Boshqaruv paneli barcha modullarni bitta sahifaga tiqmaydi; umumiy holatni tez tushunishga xizmat qiladi.

### 8.3. Ma'lumotlar manbalari ✅

- Drag-and-drop CSV/XLSX upload
- Fayl turi va hajmi validatsiyasi
- Fayl nomi, qatorlar, ustunlar, sana va sifat ko'rsatkichi
- Jadval preview'i
- `Demo ma'lumot yaratish` amali
- Oldingi datasetlar ro'yxati

### 8.4. Ma'lumotlarni qayta ishlash ✅

- Missing value, duplicate, type error va outlier statistikasi
- Umumiy ma'lumot sifati balli
- Muammolar ro'yxati
- `Tozalash va qayta ishlash` amali
- Jarayon progress'i va yakuniy natija

### 8.5. AI tahlili ✅

- `Prognozlash` va `Anomaliyalar` tablari
- 7/30 kunlik va maxsus davr tanlash
- Haqiqiy va prognoz qiymatlari grafigi
- Aniqlangan anomaliyalar ro'yxati
- Daraja, vaqt va ta'sir ko'rsatkichlari

### 8.6. Iqtisodiy samaradorlik ✅

- Iqtisodiy samaradorlik indeksi (EES)
- ROI, cost saving, labor saving va productivity KPI'lari
- AI joriy etilishidan oldin/keyin taqqoslash
- Farqlarni foiz va mutlaq qiymatda ko'rsatish
- Ssenariy tahlili boshqaruv elementlari
- Kutilayotgan natijani real vaqtda yangilash
- Formula mavjud bo'lmaguncha demo ekani aniq belgilanadi

### 8.7. Real vaqt monitoringi ✅

- Normal, ogohlantirish yoki kritik umumiy status
- Qabul qilingan va qayta ishlangan yozuvlar
- Latency, processing speed va error rate
- Start/pause demo stream boshqaruvi
- Jonli grafik va event feed
- Ogohlantirishlar tarixi

### 8.8. Qarorlarni qo'llab-quvvatlash ✅

- Muammo tavsifi
- Ehtimoliy sabablar
- Tavsiya qilingan harakat
- Kutilayotgan iqtisodiy ta'sir
- Muhimlik darajasi
- Tavsiyani ko'rib chiqilgan deb belgilash

### 8.9. Hisobotlar ✅

- Kunlik, haftalik, oylik va iqtisodiy hisobot kartalari
- Davr tanlash
- Generatsiya progress'i
- Demo PDF/XLSX/CSV eksport amallari
- Oldingi hisobotlar ro'yxati

### 8.10. Sozlamalar ✅

- Foydalanuvchi ma'lumotlari
- Tashkilot nomi
- Bildirishnoma chegaralari uchun demo maydonlar
- Chiqish amali

## 9. UX talablari

- Login va ichki oqimlardan landing sahifaga qaytish uchun aniq navigatsiya amali bo'ladi.
- Landing hero qismida soxta maket emas, mavjud dashboardning interaction'i yopilgan read-only preview'i ko'rsatiladi.
- Har bir sahifada bitta aniq asosiy action bo'ladi.
- Loading, empty, success, warning va error holatlari alohida dizayn qilinadi.
- Grafik tooltip'lari va raqam formatlari o'zbekcha bo'ladi.
- Pul qiymatlari `mln so'm`, vaqt `ms/soniya/soat`, foizlar esa bir xil aniqlikda ko'rsatiladi.
- Tugma, input va tablarda klaviatura focus holati bo'ladi.
- Matn kontrasti WCAG AA talabiga yaqin saqlanadi.
- Jadval va grafiklar kichik ekranda buzilmaydi; kerak bo'lsa gorizontal scroll ishlatiladi.
- Muhim raqamlar animatsiyadan ko'ra tez o'qilishga ustunlik beradi.
- Demo ekanini ko'rsatuvchi ma'lumotlar foydalanuvchini chalg'itmaydigan tarzda belgilanadi.

## 10. Komponentlar tuzilishi

- `AppSidebar`
- `AppTopbar`
- `PageHeader`
- `PeriodFilter`
- `KpiCard`
- `ChartCard`
- `StatusBadge`
- `DataTable`
- `UploadDropzone`
- `EmptyState`
- `ErrorState`
- `LoadingSkeleton`
- `AlertItem`
- `RecommendationCard`
- `BeforeAfterComparison`
- `WhatIfControl`
- `ReportCard`

Bir xil UI pattern qayta yozilmaydi; komponentlashtiriladi va sahifalarda qayta ishlatiladi.

## 11. Ma'lumot va kod arxitekturasi

- Route va layoutlar `src/app` ichida bo'ladi.
- Qayta ishlatiladigan UI `src/components` ichida saqlanadi.
- Demo ma'lumotlar `src/data` yoki `src/mocks` ichida bo'ladi.
- Type'lar `src/types` ichida markazlashtiriladi.
- Formatlash va hisoblash helperlari `src/lib` ichida bo'ladi.
- Backend so'rovlari uchun alohida service qatlam ajratiladi.
- UI komponentlari API response shakliga bevosita bog'lanmaydi.

## 12. Ish bosqichlari

### 0-bosqich — loyiha poydevori ✅

- Next.js loyihasini TypeScript bilan yaratish
- Tailwind, lint va format sozlamalari
- Papkalar arxitekturasi
- `globals.css` tokenlari
- Bazaviy UI komponentlari

### 1-bosqich — login va platforma karkasi ✅

- Professional marketing landing page
- Kirish sahifasi
- Demo autentifikatsiya oqimi
- Sidebar, topbar va responsive layout
- Route himoyasi

### 2-bosqich — dashboard ✅

- KPI kartalari
- Davr filtri
- Asosiy grafiklar
- Alert va tavsiya preview'i

### 3-bosqich — ma'lumotlar oqimi

- Upload sahifasi
- Dataset preview'i
- Data quality sahifasi
- Cleaning progress simulyatsiyasi

### 4-bosqich — AI va iqtisodiy tahlil

- Forecast va anomaly sahifasi
- Economic KPI
- Before/After comparison
- What-if analysis

### 5-bosqich — monitoring va qarorlar

- Demo real-time generator
- Monitoring grafiklari
- Status va alertlar
- Tavsiyalar sahifasi

### 6-bosqich — hisobot va sozlamalar

- Hisobotlar UI'i
- Demo eksport
- Minimal sozlamalar

### 7-bosqich — sifat nazorati

- Responsive tekshiruv
- O'zbekcha matnlarni tekshirish
- Empty/loading/error holatlari
- Accessibility tekshiruvi
- ESLint va production build
- Yakuniy vizual polish

## 13. Qabul qilish mezonlari

- Barcha ekranlar o'zbek tilida.
- Login orqali platformaga kirish mumkin.
- Sidebar orqali barcha asosiy sahifalar ochiladi.
- Boshqaruv panelidagi KPI va grafiklar turli ekranlarda to'g'ri ko'rinadi.
- Demo real-time ko'rsatkichlar nazoratli ravishda yangilanadi.
- CSV/XLSX tanlanganda preview yoki tushunarli validatsiya holati chiqadi.
- AI'dan oldin/keyin va ssenariy tahlili natijalari foydalanuvchi amallariga javob beradi.
- Ogohlantirish va tavsiyalar ma'lumot bilan mantiqan bog'langan.
- UI'da tasodifiy ranglar va nomuvofiq spacing mavjud emas.
- `npm run lint` va `npm run build` xatosiz yakunlanadi.

## 14. Hozirgi MVP scope'iga kirmaydigan ishlar

- Haqiqiy ERP, CRM, IoT va tashqi API integratsiyalari
- Production darajadagi FastAPI va PostgreSQL backend
- Haqiqiy ML modelni o'qitish va servis qilish
- Murakkab role/permission tizimi
- Email yuborish va parol tiklash
- Dark theme
- Mobil ilova
- Mijoz tasdiqlamagan Iqtisodiy samaradorlik indeksi formulasini yaratish

Bu imkoniyatlar keyingi bosqichlarda mavjud frontend arxitekturasini buzmasdan qo'shilishi mumkin.
