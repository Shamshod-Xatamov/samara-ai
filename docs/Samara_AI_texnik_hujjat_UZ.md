# SAMARA AI AXBOROT-TAHLILIY PLATFORMASI

## TEXNIK HUJJAT

### Sun’iy intellekt asosida korxonaning iqtisodiy samaradorligini kuzatish, tahlil qilish va boshqaruv qarorlarini qo‘llab-quvvatlash tizimi

**Dissertatsiya (PhD) va diplom ishiga ilova qilish uchun tayyorlangan texnik tavsif**

Tashkilot: ________________________________________________

Oliy ta’lim yoki ilmiy muassasa: ___________________________

Ish muallifi: _____________________________________________

Ilmiy rahbar: _____________________________________________

Kafedra yoki bo‘lim: ______________________________________

Hujjat versiyasi: **1.0**

Tayyorlangan sana: **2026-yil**

Toshkent — 2026

<!-- PAGE BREAK -->

## HUJJAT PASPORTI

| Ko‘rsatkich | Qiymat |
|---|---|
| Hujjat nomi | “Samara AI” axborot-tahliliy platformasining texnik hujjati |
| Tizim turi | Korxona ma’lumotlarini qayta ishlash, statistik tahlil va qarorlarni qo‘llab-quvvatlash veb-platformasi |
| Asosiy soha | Iqtisodiy samaradorlik, ishlab chiqarish va operatsion jarayonlar tahlili |
| Interfeys tili | O‘zbek tili, lotin yozuvi |
| Arxitektura | Birlashtirilgan veb-ilova, qatlamli modul arxitekturasi |
| Asosiy texnologiyalar | Next.js 16.3.1, React 19.2.8, TypeScript, PostgreSQL, Prisma 7.9.1, Gemini API |
| Ma’lumot almashinuvi | HTTP/HTTPS va JSON; fayl qabul qilish uchun multipart/form-data |
| Qabul qilinadigan fayllar | CSV va XLSX, 15 MB gacha |
| Ma’lumotlar bazasi | PostgreSQL |
| Hujjatning maqsadi | Tizimning vazifasi, tuzilishi, ishlash algoritmlari va foydalanish tartibini rasmiy bayon qilish |

## VERSIYALAR TARIXI

| Versiya | Sana | O‘zgarish mazmuni | Muallif |
|---|---|---|---|
| 1.0 | 2026-yil | Dasturiy kod asosida birlamchi rasmiy texnik hujjat tayyorlandi | __________________ |

## TASDIQLASH VARAG‘I

| Lavozim | F.I.Sh. | Imzo | Sana |
|---|---|---|---|
| Ish muallifi | __________________ | __________ | __________ |
| Ilmiy rahbar | __________________ | __________ | __________ |
| Mas’ul mutaxassis | __________________ | __________ | __________ |

<!-- PAGE BREAK -->

## ANNOTATSIYA

Ushbu texnik hujjatda “Samara AI” axborot-tahliliy platformasining maqsadi, funksional imkoniyatlari, dasturiy arxitekturasi, ma’lumotlar bazasi, hisoblash usullari, sun’iy intellekt qatlami, axborot xavfsizligi va ekspluatatsiya tartibi bayon etilgan. Platforma korxonaning CSV yoki XLSX shaklidagi operatsion ma’lumotlarini qabul qiladi, ularning sifatini baholaydi, ustunlarni yagona kanonik sxemaga bog‘laydi, ma’lumotlarni tozalaydi va keyingi iqtisodiy-statistik tahlil uchun tayyorlaydi.

Tizimning analitik qatlami vaqt qatorlarini shakllantirish, Holt yoki Holt–Winters usuli bilan prognozlash, rolling z-score va Tukey IQR mezonlari orqali noodatiy holatlarni aniqlash, iqtisodiy samaradorlik indeksi — EES, xarajat tejalishi, mehnat vaqti tejalishi, unumdorlik o‘sishi va investitsiya qaytimi — ROI ni hisoblash vazifalarini bajaradi. Generativ sun’iy intellekt statistik yoki iqtisodiy raqamlarni o‘zi yaratmaydi; u tayyor va tekshiriladigan hisob-kitoblarni izohlaydi, turli nomlangan ustunlarni semantik jihatdan moslashtiradi hamda aniqlangan muammolar bo‘yicha tuzilmalashtirilgan boshqaruv tavsiyalarini shakllantiradi.

Hujjat dissertatsiya yoki diplom ishining “Dasturiy ta’minotning texnik tavsifi”, “Tizim arxitekturasi”, “Algoritmik ta’minot”, “Ma’lumotlar bazasi” va “Amaliy natijalar” bo‘limlarida foydalanishga mo‘ljallangan. Bayon amaldagi dasturiy kod, ma’lumotlar sxemasi va API kontraktlariga tayangan.

**Kalit so‘zlar:** sun’iy intellekt, iqtisodiy samaradorlik, EES, ROI, vaqt qatori, Holt–Winters, anomaliya, z-score, IQR, ma’lumot sifati, PostgreSQL, Next.js, qarorlarni qo‘llab-quvvatlash.

## MUNDARIJA

1. Kirish
2. Tizimning umumiy tavsifi
3. Funksional talablar va foydalanuvchi rollari
4. Dasturiy arxitektura
5. Texnologik stek
6. Tizimning funksional bo‘limlari
7. Ma’lumotlarni qabul qilish va kanoniklashtirish
8. Ma’lumot sifati va tozalash algoritmlari
9. Metrikalar va iqtisodiy hisob-kitoblar
10. Prognozlash va anomaliyalarni aniqlash
11. Sun’iy intellekt qatlami
12. Qarorlarni qo‘llab-quvvatlash mexanizmi
13. Ma’lumotlar bazasi arxitekturasi
14. API tavsifi
15. Axborot xavfsizligi
16. Ishlash unumdorligi va ishonchlilik
17. O‘rnatish va ishga tushirish
18. Foydalanish ssenariysi
19. Sinov va qabul qilish mezonlari
20. Tizim chegaralari va rivojlantirish yo‘nalishlari
21. Xulosa
22. Ilovalar

<!-- PAGE BREAK -->

# 1. KIRISH

## 1.1. Mavzuning dolzarbligi

Korxonalarda iqtisodiy va operatsion ma’lumotlar ko‘pincha bir nechta jadval, hisobot va axborot manbalarida saqlanadi. Ustun nomlari, o‘lchov birliklari, sana formatlari va ma’lumot sifati turlicha bo‘lgani sababli rahbariyat uchun yagona, izchil va tezkor tahlil olish murakkablashadi. Bundan tashqari, faqat texnik ko‘rsatkichlarni chiqarish boshqaruv qarori uchun yetarli emas: o‘zgarishning iqtisodiy ta’siri, ehtimoliy sababi va bajariladigan harakat ham ko‘rsatilishi kerak.

“Samara AI” platformasi ushbu muammoni ma’lumotni qabul qilishdan boshlab qaror tavsiyasigacha bo‘lgan uzluksiz raqamli zanjir orqali hal qiladi. Tizim ma’lumot sifati, statistik tahlil, iqtisodiy baholash va generativ izohlash vazifalarini bitta veb-muhitda birlashtiradi. Natijada foydalanuvchi turli dasturlar o‘rtasida qo‘lda ma’lumot ko‘chirish o‘rniga yagona boshqaruv oynasida asosiy ko‘rsatkichlarni kuzatadi.

## 1.2. Ishlab chiqish maqsadi

Platformaning bosh maqsadi — korxona ma’lumotlarini tekshiriladigan algoritmlar asosida qayta ishlash, iqtisodiy samaradorlikni miqdoriy baholash, kelajak dinamikasini prognozlash, noodatiy holatlarni aniqlash va rahbariyat uchun tushunarli tavsiyalar shakllantirishdir.

## 1.3. Asosiy vazifalar

- CSV va XLSX fayllarni xavfsiz qabul qilish va jadval ko‘rinishiga keltirish;
- ustun turi, bo‘sh qiymat, format xatosi, dublikat va chet qiymatlarni aniqlash;
- turli korxonalardagi ustun nomlarini yagona kanonik lug‘atga bog‘lash;
- dastlabki yozuvni saqlagan holda tozalangan yozuvni alohida shakllantirish;
- vaqt davrlari bo‘yicha KPI va dinamik qatorlarni hisoblash;
- iqtisodiy samaradorlik indeksini ochiq formula asosida hisoblash;
- xarajat, vaqt, unumdorlik va ROI ko‘rsatkichlarini bazaviy davr bilan taqqoslash;
- vaqt qatorlarini statistik prognozlash va model xatosini baholash;
- mavsumiylikni hisobga olgan holda anomaliyalarni aniqlash;
- hisoblangan natijalarni sun’iy intellekt yordamida izohlash;
- aniqlangan muammo uchun ustuvorlik, ta’sir va amalga oshirish bosqichlarini shakllantirish;
- foydalanuvchi, tashkilot va hisoblash parametrlarini markazlashgan holda saqlash.

## 1.4. Tadqiqot obyekti va predmeti

Tadqiqot obyekti — korxonaning ishlab chiqarish, xizmat ko‘rsatish yoki operatsion jarayonlaridan hosil bo‘ladigan davriy ma’lumotlar. Tadqiqot predmeti — ushbu ma’lumotlarni avtomatik tozalash, statistik tahlil qilish, iqtisodiy samaradorlikka aylantirish va qaror qabul qilishga mos ko‘rinishda taqdim etish usullari.

## 1.5. Qo‘llanish sohasi

Platforma ishlab chiqarish korxonalari, xizmat ko‘rsatish tashkilotlari, tahliliy bo‘limlar, raqamlashtirish markazlari va iqtisodiy samaradorlikni nazorat qiluvchi boshqaruv tuzilmalarida qo‘llanishi mumkin. Kanonik sxema tufayli tizim aniq bir fayl nomi yoki bitta ustun tuzilishiga qattiq bog‘lanmagan.

# 2. TIZIMNING UMUMIY TAVSIFI

## 2.1. Tizim nomi va mohiyati

Tizimning nomi — **Samara AI**. U iqtisodiy intellekt va qarorlarni qo‘llab-quvvatlash uchun yaratilgan veb-platformadir. “Samara” atamasi tizimning markaziy natijasini — texnologik jarayonlarning iqtisodiy foydasini aniq ko‘rsatishni ifodalaydi.

## 2.2. Muammo va taklif etilayotgan yechim

| Muammo | Platformadagi yechim |
|---|---|
| Fayllarning ustun nomlari va birliklari turlicha | Kanonik sxema, evristik va AI asosidagi mapping |
| Bo‘sh, takroriy yoki noto‘g‘ri qiymatlar | Profiling, sifat balli va deterministik tozalash |
| Texnik ko‘rsatkichning biznes ma’nosi ko‘rinmaydi | EES, tejalgan xarajat, vaqt, unumdorlik va ROI |
| Kelajakdagi o‘zgarishni oldindan ko‘rish qiyin | Holt/Holt–Winters prognozi va 95% ishonch oralig‘i |
| Noodatiy holatlar ko‘p qator ichida yo‘qoladi | Rolling z-score va Tukey IQR aniqlash mexanizmi |
| Tahlil natijasidan amaliy reja tuzish ko‘p vaqt oladi | Tuzilmalashtirilgan AI izohi va qaror tavsiyasi |
| Hisoblash mezonlari tashkilotga mos emas | EES vaznlari, bazaviy davr va chegaralarni sozlash |

## 2.3. Tizimning asosiy tamoyillari

1. **Raqamlar deterministik hisoblanadi.** Metrika, prognoz va anomaliya uchun aniq matematik algoritmlar qo‘llanadi.
2. **Sun’iy intellekt izohlovchi qatlamdir.** U mavjud natijani tushuntiradi va harakat rejasini ishlab chiqadi.
3. **Dastlabki ma’lumot yo‘qolmaydi.** Har bir qatorning asl ko‘rinishi `raw`, tozalangan ko‘rinishi esa `clean` maydonida alohida saqlanadi.
4. **Tashkilotlar ma’lumoti ajratiladi.** Har bir asosiy so‘rov tashkilot identifikatori bo‘yicha cheklanadi.
5. **Yetishmayotgan ko‘rsatkich yashirilmaydi.** Hisoblash uchun ustun bo‘lmasa, nol chiqarish o‘rniga qiymat mavjud emasligi qaytariladi.
6. **Hisoblash shaffof.** EES komponentlari, vaznlari, qamrovi, prognoz parametrlari va aniqlash chegaralari foydalanuvchiga ko‘rsatiladi.
7. **Interfeys moslashuvchan.** Katta va kichik ekranlar uchun yon menyu, mobil panel va gorizontal aylantiriladigan jadvallar mavjud.

## 2.4. Kutiladigan amaliy natija

Tizim joriy etilganda ma’lumotlarni tekshirish va birlashtirishga sarflanadigan qo‘l mehnati kamayadi, ko‘rsatkichlarning kelib chiqishi izchil bo‘ladi, noodatiy holatlar erta ko‘rinadi va iqtisodiy qarorlar dalillarga tayanadi. Platforma rahbariyat, tahlilchi va texnik mutaxassis o‘rtasida yagona axborot tilini yaratadi.

# 3. FUNKSIONAL TALABLAR VA FOYDALANUVCHI ROLLARI

## 3.1. Foydalanuvchi rollari

Ma’lumotlar sxemasida uchta rol ko‘zda tutilgan:

| Rol | Mazmuni |
|---|---|
| `ADMIN` | Tashkilot, foydalanuvchi va asosiy parametrlarni boshqarishga mo‘ljallangan rol |
| `ANALYST` | Ma’lumot yuklash, qayta ishlash, tahlil va tavsiyalar bilan ishlashga mo‘ljallangan rol |
| `VIEWER` | Natijalarni ko‘rish uchun mo‘ljallangan rol |

Joriy API qatlamida himoyalangan operatsiyalar faol va avtorizatsiyadan o‘tgan foydalanuvchi uchun ochiladi. Rol qiymati foydalanuvchi yozuvida saqlanadi, sessiyani tekshirishda bazadan olinadi va foydalanuvchi interfeysida ko‘rsatiladi; operatsiyalar kesimida yanada mayda ruxsat matritsasini qo‘llash tizimni kengaytirish bosqichiga tegishli.

## 3.2. Asosiy funksional talablar

- foydalanuvchini email va parol bilan autentifikatsiya qilish;
- sessiyani serverda yaratish, tekshirish va bekor qilish;
- tashkilot doirasida ma’lumotlar to‘plamlarini ro‘yxatlash;
- fayl yuklash, ko‘rish va o‘chirish;
- ustunlarni avtomatik va qo‘lda bog‘lash;
- sifat muammolarini ko‘rsatish va tozalashni bajarish;
- tanlangan davr bo‘yicha ko‘rsatkichlarni qayta hisoblash;
- prognoz ko‘rsatkichi va gorizontini tanlash;
- anomaliyalarni daraja bo‘yicha saralash va izohlash;
- iqtisodiy ssenariy parametrlarini interaktiv o‘zgartirish;
- tavsiyani ko‘rib chiqilgan yoki rejalashtirilgan holatga o‘tkazish;
- hisobot turini, davrini va eksport formatini tanlash;
- profil, tashkilot, iqtisodiy va bildirishnoma parametrlarini saqlash.

## 3.3. Nofunksional talablar

- foydalanuvchi interfeysi kamida 320 piksel kenglikdagi ekranda ishlashi;
- server javoblari yagona JSON kontraktida bo‘lishi;
- xatolik tafsilotlari foydalanuvchiga xavfsiz va o‘zbekcha xabar bilan qaytarilishi;
- maxfiy kalitlar dasturiy kodda emas, muhit o‘zgaruvchilarida saqlanishi;
- bir xil AI so‘rovi qayta yuborilmasligi uchun kesh ishlatilishi;
- ma’lumotlar bazasi migratsiyalari versiyalar bilan boshqarilishi;
- statistik natijalar bir xil kirish uchun takrorlanuvchi bo‘lishi;
- AI xizmati mavjud bo‘lmaganda asosiy sonli tahlil ishlashda davom etishi.

# 4. DASTURIY ARXITEKTURA

## 4.1. Arxitektura turi

Platforma frontend va backend imkoniyatlarini bitta Next.js kod bazasida birlashtirgan qatlamli monolit arxitekturaga ega. Ushbu yondashuv kichik va o‘rta hajmdagi joriy etish uchun joylashtirishni soddalashtiradi, shu bilan birga domen funksiyalarini alohida modullarga ajratgani sababli keyinchalik servislar bo‘yicha bo‘lish imkonini saqlab qoladi.

## 4.2. Mantiqiy qatlamlar

| Qatlam | Vazifasi | Asosiy joylashuvi |
|---|---|---|
| Taqdimot qatlami | Sahifalar, formalar, grafiklar, jadval va holatlar | `src/app`, `src/features`, `src/components` |
| Mijoz servis qatlami | UI va API o‘rtasidagi tiplangan so‘rovlar | `src/services` |
| HTTP/API qatlami | So‘rovni qabul qilish, validatsiya, avtorizatsiya va javob | `src/app/api` |
| Domen qatlami | Tozalash, metrika, iqtisod, prognoz va anomaliya algoritmlari | `src/lib` |
| AI integratsiya qatlami | Gemini chaqiruvlari, sxema nazorati, kesh va zaxira model | `src/lib/ai` |
| Ma’lumotlarga kirish qatlami | Prisma Client va PostgreSQL adapteri | `src/lib/db.ts`, `prisma` |
| Himoya qatlami | Marshrutni oldindan tekshirish va server sessiyasi | `src/proxy.ts`, `src/lib/auth` |

## 4.3. Umumiy ishlash sxemasi

```text
Foydalanuvchi brauzeri
        │
        ▼
Next.js sahifalari va React komponentlari
        │
        ▼
Tiplangan mijoz servislar (`src/services`)
        │ HTTP/JSON yoki multipart/form-data
        ▼
Next.js Route Handler API qatlami
        │
        ├── Sessiyani va tashkilot chegarasini tekshirish
        ├── Zod orqali kirish ma’lumotini tekshirish
        │
        ▼
Domen algoritmlari
        ├── parsing va profiling
        ├── cleaning va mapping
        ├── metrika va iqtisodiy hisob
        ├── prognoz va anomaliya
        └── AI izohi va qaror tavsiyasi
        │                         │
        ▼                         ▼
Prisma ORM → PostgreSQL      Gemini API → AI kesh
```

## 4.4. Server va mijoz komponentlari

Marshrut sahifalari App Router orqali tashkil etilgan. Interaktiv bo‘limlarda `"use client"` direktivasiga ega React komponentlari ishlaydi. Ular tanlov, filtr, grafik, forma va yuklanish holatini boshqaradi. API Route Handler’lari server muhitida ishlaydi, ma’lumotlar bazasi va maxfiy AI kalitiga faqat server tomonidan murojaat qiladi.

## 4.5. Marshrutlar tuzilishi

Ochiq marshrutlar:

- `/` — platforma haqida umumiy axborot va imkoniyatlar;
- `/kirish` — autentifikatsiya;
- `/namoyish` — asosiy panelning faqat ko‘rish uchun ajratilgan ko‘rinishi.

Himoyalangan marshrutlar:

- `/dashboard`;
- `/malumotlar`;
- `/qayta-ishlash`;
- `/ai-tahlil`;
- `/iqtisodiy-samaradorlik`;
- `/monitoring`;
- `/qarorlar`;
- `/hisobotlar`;
- `/sozlamalar`.

`src/proxy.ts` himoyalangan sahifaga sessiyasiz kirishni `/kirish` ga yo‘naltiradi. Foydalanuvchi dastlab so‘ragan ichki yo‘l `keyin` parametri orqali saqlanadi. Ochiq yo‘naltirish hujumini cheklash uchun faqat `/` belgisi bilan boshlanadigan va `//` bilan boshlanmaydigan ichki yo‘l qabul qilinadi.

# 5. TEXNOLOGIK STEK

| Texnologiya | Versiya | Vazifasi |
|---|---:|---|
| Node.js | 20 yoki undan yuqori | Server bajarilish muhiti |
| pnpm | 11.13.1 | Paketlar va ishga tushirish skriptlari |
| Next.js | 16.3.1 | App Router, server rendering, API Route Handler va proxy |
| React | 19.2.8 | Interaktiv foydalanuvchi interfeysi |
| TypeScript | 5.x | Statik tiplar va kod ishonchliligi |
| Tailwind CSS | 4.x | Dizayn va moslashuvchan maket |
| Recharts | 3.10.1 | Chiziqli, maydonli va ustunli grafiklar |
| React Hook Form | 7.85.0 | Forma holati va yuborish jarayoni |
| Zod | 4.4.3 | Mijoz va server validatsiyasi, AI javob sxemasi |
| PostgreSQL | 17 bilan mos | Asosiy relyatsion ma’lumotlar bazasi |
| Prisma | 7.9.1 | ORM, migratsiya va tiplangan ma’lumotlar qatlami |
| `@prisma/adapter-pg` | 7.9.1 | PostgreSQL drayver adapteri |
| `jose` | 6.2.10 | JWT imzolash va tekshirish |
| `@node-rs/argon2` | 2.1.0 | Argon2id asosida parol xeshlash |
| Papa Parse | 5.6.0 | CSV fayllarni tahlil qilish |
| ExcelJS | 4.4.0 | XLSX fayllarni o‘qish va katak qiymatlarini olish |
| Google GenAI SDK | 2.18.0 | Gemini modellari bilan integratsiya |
| Lucide React | 1.33.0 | Interfeys ikonkalari |

## 5.1. Texnologiyalarni tanlash asoslari

Next.js frontend va server API’ni bitta tiplangan TypeScript loyihasida yuritish imkonini beradi. PostgreSQL tranzaksion ishonchlilik, JSONB maydonlari va keng tarqalgan joylashtirish imkoniyatlari sabab tanlangan. Prisma ma’lumotlar sxemasi bilan kod tiplarini uyg‘unlashtiradi. Klassik statistika TypeScript domen qatlamida bajarilgani sabab alohida hisoblash servisini yuritish zarurati kamayadi. Gemini esa qat’iy JSON sxemali izoh va tavsiyalar uchun qo‘llanadi.

# 6. TIZIMNING FUNKSIONAL BO‘LIMLARI

## 6.1. Ochiq bosh sahifa

**Maqsadi.** Platformaning mohiyati, qo‘llanish sohasi, asosiy modullari va ma’lumotdan qarorgacha bo‘lgan jarayonni foydalanuvchiga tushuntirish.

**Tarkibi:**

- platforma qiymat taklifi va tizimga kirish chaqirig‘i;
- ma’lumotlar markazi, AI tahlili, iqtisodiy samaradorlik, monitoring, qarorlar va hisobotlar imkoniyatlari;
- asosiy natijalar paneli;
- “ma’lumotni ulang — tahlil qiling — qaror qabul qiling” jarayon izohi;
- faqat ko‘rish uchun ajratilgan boshqaruv paneli ko‘rinishi.

Ko‘rgazmali panel `iframe` ichida `sandbox`, `inert`, fokusni bloklash va ustki qatlam bilan izolyatsiya qilingan. Bu tashqi foydalanuvchining ichki elementlarni faollashtirishiga yo‘l qo‘ymaydi.

## 6.2. Kirish bo‘limi

**Maqsadi.** Ro‘yxatdan o‘tgan foydalanuvchini aniqlash va himoyalangan platformaga sessiya yaratish.

**Ishlash tartibi:**

1. Foydalanuvchi email va parolni kiritadi.
2. Mijoz tomonda email formati va parolning kamida 6 belgidan iboratligi tekshiriladi.
3. `POST /api/auth/login` so‘rovi yuboriladi.
4. Server emailni kichik harfga keltiradi, foydalanuvchini topadi va Argon2id xeshiga nisbatan parolni tekshiradi.
5. Faol foydalanuvchi uchun bazada 7 kunlik sessiya yozuvi yaratiladi.
6. Sessiya identifikatori, foydalanuvchi va tashkilot identifikatorlari HS256 algoritmi bilan imzolangan JWT ga joylanadi.
7. Token `HttpOnly`, `SameSite=Lax`, production muhitida `Secure` atributli cookie sifatida yoziladi.
8. Foydalanuvchi dastlab talab qilgan ichki sahifaga yoki `/dashboard` ga yo‘naltiriladi.

Xavfsizlik maqsadida “foydalanuvchi topilmadi” va “parol noto‘g‘ri” holatlari bir xil xabar bilan qaytariladi. Bu ro‘yxatdan o‘tgan email manzillarni aniqlashga qarshi himoya beradi.

## 6.3. Ilova karkasi va navigatsiya

Himoyalangan sahifalar yagona `AppShell` tarkibida ochiladi. Chap yon panelda funksional guruhlar, yuqori panelda tashkilot, bildirishnoma va foydalanuvchi menyusi ko‘rsatiladi. Kichik ekranlarda yon panel modal tortma ko‘rinishiga o‘tadi; tashqi maydonni bosish yoki `Escape` tugmasi uni yopadi. Sahifa tanlanganda faol marshrut rang va vertikal belgi bilan ajratiladi.

Navigatsiya to‘rt guruhga bo‘lingan:

- **Umumiy:** boshqaruv paneli;
- **Ma’lumot va tahlil:** manbalar, qayta ishlash, AI tahlili, iqtisodiy samaradorlik;
- **Boshqaruv:** monitoring, qarorlar, hisobotlar;
- **Tizim:** sozlamalar.

## 6.4. Boshqaruv paneli — `/dashboard`

**Maqsadi.** Rahbar yoki tahlilchiga tanlangan davrdagi umumiy iqtisodiy va texnologik holatni bitta sahifada ko‘rsatish.

**Asosiy qismlar:**

1. **Davr filtri.** Bugun, 7 kun, 30 kun, chorak yoki yil oralig‘ini tanlaydi. Davr ma’lumotlar to‘plamidagi eng oxirgi sanaga nisbatan aniqlanadi.
2. **KPI kartalari.** EES, qayta ishlash vaqti, aniqlik, avtomatlashtirish, operatsion xarajat, tejalgan xarajat, tejalgan vaqt va ROI ni ko‘rsatadi.
3. **O‘zgarish indikatori.** Joriy va oldingi teng uzunlikdagi davrni taqqoslab foiz yoki mutlaq farqni chiqaradi. Har bir KPI uchun ijobiy yo‘nalish alohida beriladi: masalan, xarajat va vaqtning pasayishi ijobiy, unumdorlikning o‘sishi ijobiy.
4. **Dinamik grafik.** Foydalanuvchi samaradorlik, xarajat, qayta ishlash, aniqlik yoki unumdorlik qatorini tanlaydi.
5. **EES tarkibi.** Vaqt, xarajat, mehnat, avtomatlashtirish va sifat komponentlari alohida progress ko‘rinishida chiqadi.
6. **Operatsion xabarlar sohasi.** So‘nggi ogohlantirishlar va tavsiyalarga tezkor o‘tish vazifasini bajaradi.
7. **Manba va bazaviy davr.** Hisob qaysi ma’lumotlar to‘plamidan va qaysi boshlang‘ich davrdan olingani ko‘rsatiladi.

Dinamik KPI, grafik va EES ma’lumotlari `GET /api/metrics` orqali hisoblanadi. Shu sababli foydalanuvchi davrni o‘zgartirganda server yangi kesimni qaytaradi.

## 6.5. Ma’lumot manbalari — `/malumotlar`

**Maqsadi.** Tahlil uchun kiruvchi fayllarni qabul qilish, profiling natijalarini ko‘rish, ustunlarni kanonik sxemaga bog‘lash va ma’lumotlar to‘plamlarini boshqarish.

**Bo‘limlari:**

- jami to‘plamlar, yozuvlar, o‘rtacha sifat va bog‘langan ustunlar statistikasi;
- bosish yoki sudrab tashlash orqali fayl yuklash;
- format va 15 MB hajm chegarasini tekshirish;
- to‘plamlar ro‘yxati, qidiruv, holat va sifat belgisi;
- to‘plamni tanlash, ko‘rish yoki o‘chirish;
- ustun nomi, aniqlangan turi, kanonik kalit, moslik ishonchi va izoh jadvali;
- AI orqali semantik mappingni ishga tushirish;
- foydalanuvchi tomonidan mappingni tahrirlash va tasdiqlash;
- birinchi 50 qatorlik ko‘rish jadvali;
- tozalashga yoki qayta ishlash sahifasiga o‘tish.

To‘plam holati `UPLOADED`, `PROFILED`, `MAPPED`, `CLEANED` yoki `FAILED` qiymatlaridan biri bilan yuritiladi. Amalda fayl qabul qilingan zahoti profiling bajariladi va holat `PROFILED` bo‘ladi.

## 6.6. Ma’lumotlarni qayta ishlash — `/qayta-ishlash`

**Maqsadi.** Ma’lumot sifatini tushuntirish, muammolar bo‘yicha tozalash rejasini ko‘rsatish va deterministik tozalash jarayonini bajarish.

**Sahifa qismlari:**

- qayta ishlanadigan to‘plamni tanlash;
- bo‘sh qiymat, dublikat, tip xatosi va outlier sonlari;
- umumiy sifat balli va holat;
- yaroqli qatorlar, jami qatorlar va muammolar yig‘indisi;
- besh bosqichli pipeline: tuzilma, bo‘sh qiymatlar, dublikatlar, format, outlier;
- muammo, maydon, soni, tavsiya etilgan yechim va jiddiylik jadvali;
- tozalashni boshlash yoki takroriy ishga tushirish;
- tozalashdan oldingi va keyingi ko‘rsatkichlar.

Jarayon natijasida har bir yozuvning tozalangan obyekt ko‘rinishi va bajarilgan tuzatishlar ro‘yxati bazaga yoziladi. Katta to‘plamda bazani ortiqcha so‘rov bilan yuklamaslik uchun yangilashlar 500 qatordan iborat bloklarda bajariladi.

## 6.7. AI tahlili — `/ai-tahlil`

Sahifa ikki ichki bo‘limdan tashkil topgan.

### 6.7.1. Prognozlash

- mavjud kanonik ustunlarga qarab tahlil qilinadigan metrikalarni ko‘rsatadi;
- xarajat, qayta ishlash vaqti, unumdorlik, xato ulushi yoki hajmni tanlash imkonini beradi;
- 7, 14 yoki 30 kunlik gorizontni tanlaydi;
- kuzatilgan, modelga moslashtirilgan va kelajak qiymatlarini grafikda chiqaradi;
- 95 foizlik ishonch oralig‘ini ko‘rsatadi;
- Holt yoki Holt–Winters model turi, α, β, zarur holatda γ parametrlarini beradi;
- MAPE va undan hosil qilingan model ishonchini ko‘rsatadi;
- tayyor prognoz uchun o‘zbekcha AI izohi va ehtimoliy omillarni chiqaradi.

### 6.7.2. Anomaliyalar

- anomaliyalarni kritik, ogohlantirish va kuzatuv darajasi bo‘yicha filtrlaydi;
- qayta statistik tekshirishni ishga tushiradi;
- kuzatilgan, kutilgan, foiz og‘ish va z-score qiymatini ko‘rsatadi;
- anomaliya atrofidagi trendni grafikda chizadi;
- AI orqali ehtimoliy sabab, tavsiya va ta’sir izohini oladi;
- qaror tavsiyalari sahifasiga bog‘laydi.

## 6.8. Iqtisodiy samaradorlik — `/iqtisodiy-samaradorlik`

**Maqsadi.** Texnik va operatsion o‘zgarishlarni iqtisodiy natijaga aylantirish.

**Asosiy qismlar:**

- 7 kun, 30 kun, chorak yoki yil filtri;
- ROI, tejalgan xarajat, tejalgan mehnat vaqti va unumdorlik o‘sishi;
- joriy va bazaviy EES qiymati;
- EES komponentlari va amaldagi vaznlar;
- qayta ishlash vaqti, mehnat, xarajat, xato darajasi va unumdorlik bo‘yicha “oldin–keyin” taqqoslash;
- turli birlikdagi metrikalarni bitta grafikda ko‘rsatish uchun bazaviy qiymatni 100 deb oladigan indekslangan diagramma;
- avtomatlashtirish va ma’lumot aniqligi qiymatlarini o‘zgartiradigan what-if ssenariysi;
- ssenariy bo‘yicha EES, qayta ishlash vaqti, tejam va ROI ning yangi bahosi.

Slider qiymati o‘zgarganda so‘rovlar sonini kamaytirish uchun 350 millisekundlik kechiktirish qo‘llanadi. Hisob serverdagi tashkilot konfiguratsiyasi asosida bajariladi.

## 6.9. Monitoring markazi — `/monitoring`

**Maqsadi.** Ma’lumot oqimi, qayta ishlash tezligi, kechikish, xato ulushi, xizmatlar va infratuzilma holatini real vaqtga yaqin ko‘rinishda birlashtirish.

**Tarkibi:**

- oqimni davom ettirish yoki pauza qilish boshqaruvi;
- qabul qilingan, qayta ishlangan va navbatdagi yozuvlar yig‘indisi;
- qayta ishlash tezligi, kechikish, aniqlik va xato ulushi kartalari;
- 5 daqiqa, 15 daqiqa yoki 1 soatlik telemetriya grafigi;
- 500 ms kechikish chegarasi;
- hodisalar va alertlar tasmasi;
- texnik oqimning iqtisodiy signallarga bog‘langan paneli;
- ma’lumot oqimi, qayta ishlash, AI tahlili va iqtisodiy qatlam servislarining holati;
- CPU, xotira va navbat yuklamasi.

Joriy taqdimot mexanizmi React holati va brauzer taymeri orqali har 2 soniyada yangi telemetriya nuqtasini qo‘shadi, so‘nggi 15 nuqtani saqlaydi va shu asosda grafiklarni yangilaydi. Bu qatlam ma’lumotlar bazasiga yozuv kiritmaydi. Tashqi oqim manbasi bilan integratsiyada shu vizual tuzilma serverdan uzatiladigan telemetriyani qabul qiluvchi qatlam bilan almashtiriladi.

## 6.10. Qarorlarni qo‘llab-quvvatlash — `/qarorlar`

**Maqsadi.** Statistik aniqlangan muammoni rahbariyat uchun bajariladigan qaror loyihasiga aylantirish.

**Imkoniyatlari:**

- ochiq anomaliyalardan qaror tavsiyasini shakllantirish;
- bir ishga tushirishda eng ko‘pi bilan to‘rtta tavsiya tayyorlash;
- tavsiyalarni parallel shakllantirish;
- yangi, ko‘rib chiqilgan va rejalashtirilgan holatlar bo‘yicha filtr;
- tavsiya kodi, sarlavha, ustuvorlik va ishonch darajasi;
- muammo tavsifi va omillarning ulushi;
- tavsiya etilgan harakat va uning asoslanishi;
- kutiladigan iqtisodiy ta’sirlar;
- mas’ul bo‘lim va muddat ko‘rsatilgan amalga oshirish qadamlari;
- foydalanuvchi izohini 2000 belgigacha saqlash;
- tavsiyani ko‘rib chiqilgan yoki rejalashtirilgan holatga o‘tkazish.

Tavsiya ko‘rib chiqilganda tegishli anomaliya `REVIEWED`, rejalashtirilganda esa `RESOLVED` holatiga o‘tkaziladi. Bu tahlildan boshqaruv chorasi va nazoratgacha bo‘lgan kuzatiladigan bog‘lanishni hosil qiladi.

## 6.11. Hisobotlar markazi — `/hisobotlar`

**Maqsadi.** Texnologik va iqtisodiy natijalarni tanlangan davr va format bo‘yicha rasmiylashtirish.

**Hisobot turlari:**

- kunlik operatsion hisobot;
- haftalik natijalar;
- oylik boshqaruv hisoboti;
- iqtisodiy samaradorlik hisoboti;
- AI tahlili hisoboti;
- rahbariyat uchun qisqa xulosa.

Foydalanuvchi hisobot turi, sana oralig‘i va PDF, Excel yoki CSV formatini tanlaydi. Joriy eksport mexanizmi brauzer qatlamida ishlaydi: PDF uchun chop etishga mos yangi oyna, Excel uchun HTML jadval asosidagi `.xls` fayl, CSV uchun UTF-8 BOM bilan ajratilgan matnli fayl yaratiladi. Tayyor hisobotlar ro‘yxati komponent holatida yuritiladi va format bo‘yicha filtrlanadi. Server tomonda doimiy hisobot arxivi, rejalashtiruvchi va hisobot API’si alohida kengaytirish vazifasi hisoblanadi.

## 6.12. Sozlamalar — `/sozlamalar`

**Maqsadi.** Foydalanuvchi, tashkilot va hisoblash muhitining parametrlarini markazdan boshqarish.

**Ichki bo‘limlari:**

1. **Profil:** to‘liq ism va platforma tili; email va rol o‘zgarmas axborot sifatida ko‘rsatiladi.
2. **Tashkilot:** nom va faoliyat sohasini tahrirlash; vaqt mintaqasi hamda valyutani axborot sifatida ko‘rsatish. Server API’si ushbu to‘rtta maydonni validatsiya qilish va saqlashni qo‘llab-quvvatlaydi.
3. **Iqtisodiy hisob:** AI joriy etish xarajati, bazaviy davr uzunligi va beshta EES vazni.
4. **Monitoring chegaralari:** maksimal kechikish, maksimal xato ulushi, minimal AI aniqligi va xarajat o‘sishi.
5. **Bildirishnomalar:** ichki xabar, kritik va ogohlantiruvchi email, kunlik xulosa, haftalik hisobot va ovozli signal.

EES vaznlari saqlanish vaqtida yig‘indisi 1 ga keltiriladi. Saqlangan iqtisodiy parametrlar keyingi metrika va ssenariy hisoblarida darhol ishlatiladi. “Tizimdan chiqish” amali sessiyani bazadan o‘chiradi va cookie’ni bekor qiladi.

# 7. MA’LUMOTLARNI QABUL QILISH VA KANONIKLASHTIRISH

## 7.1. Fayl qabul qilish cheklovlari

| Parametr | Qiymat |
|---|---|
| Format | `.csv`, `.xlsx` |
| Maksimal fayl hajmi | 15 MB |
| Maksimal o‘qiladigan qator | 100 000 |
| XLSX varag‘i | Birinchi ishchi varaq |
| Ko‘rish chegarasi | Birinchi 50 qator |

Cheklovlar mijoz interfeysida va serverda mustaqil tekshiriladi. Shu sababli mijoz tekshiruvini chetlab o‘tgan so‘rov serverda ham rad etiladi.

## 7.2. CSV va XLSX parsing

CSV uchun Papa Parse ajratgichni vergul, nuqtali vergul yoki tabulyatsiya orasidan avtomatik aniqlaydi. Fayl boshidagi UTF-8 BOM olib tashlanadi, bo‘sh qatorlar o‘tkazib yuboriladi. Birinchi qator sarlavha sifatida olinadi; bo‘sh sarlavha `Ustun N` shaklida nomlanadi.

XLSX uchun ExcelJS ishlatiladi. Formula katagida hisoblangan `result`, formatlangan katakda `text`, boy matnda `richText` qismlari olinadi. Excel xato qiymatlari matn ko‘rinishida saqlanib, profilingda yaroqsiz qiymat sifatida aniqlanishi mumkin. Sana obyektlari va mantiqiy qiymatlar o‘z turida qabul qilinadi.

## 7.3. Qiymatlarni normallashtirish

Sonlarni o‘qish algoritmi bo‘sh joy, nozik bo‘sh joy, foiz belgisi, vergul va nuqta ajratgichlarini hisobga oladi. Bir vaqtning o‘zida vergul va nuqta bo‘lsa, oxirgi kelgan belgi kasr ajratgichi deb olinadi. Bir nechta bir xil ajratgich minglik guruhlash belgisi sifatida tozalanadi. Raqam o‘qilgan, lekin formatni o‘zgartirish talab etilgan holat `coerced` sifatida qayd etiladi.

Sanalar quyidagi shakllarda qabul qilinadi:

- `YYYY-MM-DD`, `YYYY/MM/DD`, `YYYY.MM.DD`;
- `DD-MM-YYYY`, `DD/MM/YYYY`, `DD.MM.YYYY`;
- vaqt qismi mavjud bo‘lsa, sana qismi;
- Excel serial sanasi, 20 000 dan 60 000 gacha bo‘lgan qiymat.

Mantiqiy qiymatlar o‘zbek, ingliz va rus tilidagi keng tarqalgan belgilar, shuningdek `1/0` va `+` orqali aniqlanadi.

## 7.4. Kanonik ustunlar lug‘ati

| Kalit | Turi | Talab | Birlik | Vazifasi |
|---|---|---|---|---|
| `sana` | DATE | Majburiy | sana | Vaqt o‘qi va barcha davriy hisoblar |
| `bolim` | TEXT | Ixtiyoriy | — | Bo‘lim, sex, uchastka yoki jamoa kesimi |
| `obyekt` | TEXT | Ixtiyoriy | — | Mahsulot, jarayon yoki operatsiya |
| `hajm` | NUMBER | Tavsiya etiladi | dona/yozuv | Birlik xarajat va sifat ulushi maxraji |
| `daromad` | NUMBER | Tavsiya etiladi | mln so‘m | Mehnat unumdorligi surati |
| `xarajat` | NUMBER | Majburiy | mln so‘m | Operatsion va iqtisodiy hisoblar |
| `mehnat_soat` | NUMBER | Tavsiya etiladi | soat | Vaqt tejalishi va unumdorlik |
| `xato_soni` | NUMBER | Ixtiyoriy | dona | Sifat va xato ulushi |
| `qayta_ishlash_vaqti` | NUMBER | Ixtiyoriy | soniya | Jarayon tezligi |
| `avtomatlashtirilgan` | NUMBER | Ixtiyoriy | foiz | Avtomatlashtirish darajasi |

## 7.5. Mapping mexanizmi

Fayl qabul qilinganda avval sarlavhadagi kalit so‘zlar bo‘yicha evristik moslik hisoblanadi. To‘liq nom mosligiga 95 foizgacha, qisman kalit so‘z mosligiga qamrov va so‘z pozitsiyasiga qarab 88 foizgacha ishonch beriladi. Noto‘g‘ri taxmin qilish xavfi bo‘lsa, ustun bog‘lanmasdan qoladi.

AI mapping bosqichida ustun nomi, aniqlangan turi, beshtagacha qiymat va min–max diapazon Gemini’ga yuboriladi. Model faqat ruxsat etilgan kanonik kalitlardan birini yoki “aniqlanmadi” holatini qaytaradi. Bir kanonik kalitga bir necha ustun da’vogarlik qilsa, eng yuqori ishonchli ustun saqlanadi. Foydalanuvchi yakuniy mappingni tahrirlashi mumkin; qo‘lda tasdiqlangan moslik 100 foizlik ishonch va `USER` manbasi bilan yoziladi.

## 7.6. O‘lchov birligini keltirish

`unitScale` koeffitsienti qiymatni kanonik birlikka ko‘paytirib o‘tkazadi. Masalan, xarajat so‘mda bo‘lsa mln so‘mga o‘tish uchun `0.000001`, vaqt daqiqada bo‘lsa soniyaga o‘tish uchun `60` koeffitsienti qo‘llanishi mumkin. Mapping saqlanganda koeffitsient ustun metadata’sida yuritiladi, tozalashda esa har bir tegishli qiymatga qo‘llanadi.

# 8. MA’LUMOT SIFATI VA TOZALASH ALGORITMLARI

## 8.1. Ustun turini aniqlash

Ustunning ko‘pi bilan dastlabki 200 ta to‘ldirilgan qiymati tekshiriladi. Qiymatlarning kamida 70 foizi sana yoki son sifatida o‘qilsa, tegishli tur belgilanadi. Sana tekshiruvi son tekshiruvidan avval bajariladi. Mantiqiy tur uchun 90 foizlik moslik talab qilinadi. Aks holda ustun matn sifatida qabul qilinadi.

## 8.2. Profiling ko‘rsatkichlari

Har bir ustun uchun quyidagilar hisoblanadi:

- bo‘sh qiymatlar soni;
- yaroqsiz va format o‘zgartirish bilan o‘qilgan qiymatlar soni;
- noyob qiymatlar soni;
- minimum, maksimum, o‘rtacha va standart og‘ish;
- birinchi va uchinchi kvartil — Q1 va Q3;
- Tukey mezoni bo‘yicha outlier soni;
- ko‘pi bilan 8 ta to‘ldirilgan qiymat.

Butun jadval uchun dublikatlar qatorning JSON ko‘rinishidagi izini taqqoslash orqali aniqlanadi. Birinchi nusxa asl yozuv deb qabul qilinadi, keyingi aynan bir xil yozuvlar dublikat hisoblanadi.

## 8.3. Sifat balli

Sifat balli beshta komponentning vaznli yig‘indisidir:

```text
C  = 1 − missingCells / totalCells                 (to‘liqlik)
V  = 1 − invalidCells / totalCells                 (yaroqlilik)
U  = 1 − duplicateRows / rowCount                  (noyoblik)
K  = 1 − outlierCells / numericCells               (izchillik)
F  = validRows / rowCount                           (foydalanishga yaroqlilik)

Quality = 100 × (0.25×C + 0.20×V + 0.15×U + 0.10×K + 0.30×F)
```

Formatni tozalash orqali tuzatiladigan qiymat yaroqsizlik hisobida 0.5 vazn bilan olinadi. Natija butun songa yaxlitlanadi, komponentlar esa 0.1 foiz aniqlikda saqlanadi. Foydalanishga yaroqlilikning eng katta — 0.30 vaznga ega bo‘lishi bitta xato katak butun qatorni tahlildan chiqarishi mumkinligi bilan asoslanadi.

## 8.4. Muammo jiddiyligi

Bo‘sh qiymat uchun ta’sir ulushi 3 foiz yoki undan katta bo‘lsa `HIGH`, 1–3 foiz oralig‘ida `MEDIUM`, 1 foizdan kam bo‘lsa `LOW` belgilanadi. Butunlay o‘qilmaydigan tip xatosi 1 foizdan boshlab yuqori darajaga ko‘tariladi. Outlier har doim xato bo‘lmasligi mumkinligi sababli uning jiddiyligi yumshoqroq baholanadi.

## 8.5. Tozalash qoidalari

| Muammo | Amal |
|---|---|
| Bo‘sh son | Dublikatsiz qatorlar bo‘yicha ustun medianasi bilan to‘ldirish |
| Bo‘sh mantiqiy qiymat | Eng ko‘p uchraydigan qiymat bilan to‘ldirish |
| Bo‘sh matn | Ustun modasi, u bo‘lmasa `Aniqlanmagan` |
| Noto‘g‘ri son yoki sana formati | Standart songa yoki ISO `YYYY-MM-DD` sanaga keltirish |
| O‘lchov birligi | `unitScale` ga ko‘paytirish |
| Dublikat | Birinchi nusxani saqlab, keyingi nusxaning `clean` qiymatini bo‘sh qoldirish |
| Sana yo‘q yoki o‘qilmaydi | Vaqt o‘qiga qo‘yib bo‘lmagani uchun qatorni tahlildan chiqarish |
| Outlier | Q1−1.5×IQR va Q3+1.5×IQR chegarasida winsorization |

Median o‘rtacha qiymatga nisbatan chet qiymatlarga chidamli bo‘lgani uchun sonlarni to‘ldirishda tanlangan. Winsorization qatorni butunlay o‘chirmasdan, chet qiymatni statistik chegaraga olib keladi.

## 8.6. Audit izi

Har bir qator uchun bajarilgan tuzatishlar `issues` JSON ro‘yxatida `format:key`, `scale:key`, `missing:key`, `invalid:key`, `outlier:key`, `duplicate` yoki `missing_date` ko‘rinishida saqlanadi. Tozalash ishga tushirilganda `CleaningRun` yozuvi yaratiladi, unda oldingi va keyingi sifat, yaroqli qatorlar, bosqichlar, yakun va xato holati qayd etiladi.

# 9. METRIKALAR VA IQTISODIY HISOB-KITOBLAR

## 9.1. Metrika manbasini tanlash

Hisoblashda bir nechta to‘plam avtomatik qo‘shilmaydi, chunki turli mazmundagi fayllarni birlashtirish xarajat yoki hajmni ikki marta sanashga olib kelishi mumkin. Standart manba quyidagi tartibda tanlanadi:

1. holati `CLEANED` bo‘lgan to‘plamlar olinadi;
2. `sana` va `xarajat` kanonik kalitlari mavjud bo‘lishi talab etiladi;
3. eng ko‘p kanonik kalit bog‘langan to‘plam ustun turadi;
4. keyin qatorlar soni va so‘nggi yangilanish vaqti hisobga olinadi.

Hisobga faqat `clean` maydoni mavjud qatorlar kiradi. Majburiy ustun yo‘q, to‘plam tozalanmagan yoki sanali qator topilmagan bo‘lsa, API sababni aniq qaytaradi.

## 9.2. Agregatsiya qoidalari

| Ko‘rsatkich | Agregatsiya |
|---|---|
| Hajm | Yig‘indi |
| Daromad | Yig‘indi |
| Xarajat | Yig‘indi |
| Mehnat soati | Yig‘indi |
| Xatolar soni | Yig‘indi |
| Qayta ishlash vaqti | O‘rtacha |
| Avtomatlashtirish | O‘rtacha |

Biror ustunda umuman qiymat bo‘lmasa, yig‘indi nol emas, `null` sifatida qaytariladi. Bu “qiymat yo‘q” va “qiymat nol” ma’nolarini ajratadi.

## 9.3. Hosila KPI formulalari

```text
Birlik xarajat = jami xarajat / jami hajm

Birlik mehnat = jami mehnat soati / jami hajm

Mehnat unumdorligi = jami daromad / jami mehnat soati

Sifat ulushi = clamp(1 − xatolar soni / hajm, 0, 1)
```

Hajm ustuni mavjud bo‘lmasa, birlik xarajat va birlik mehnat uchun qatorlar soni maxraj sifatida ishlatiladi. Nolga bo‘lish yoki kerakli ma’lumot yo‘qligida natija `null` bo‘ladi.

## 9.4. Davrlar va taqqoslash

| Davr | Kun | Grafik bo‘lagi |
|---|---:|---|
| Bugun | 1 | Kun |
| 7 kun | 7 | Kun |
| 30 kun | 30 | Hafta |
| Chorak | 90 | Hafta |
| Yil | 365 | Oy |

Davrning oxirgi nuqtasi serverning joriy sanasi emas, tanlangan ma’lumotlar to‘plamidagi eng yangi sana hisoblanadi. Bu tarixiy to‘plamlar bilan ishlaganda bo‘sh oyna hosil bo‘lishining oldini oladi. Oldingi davr joriy davr bilan teng uzunlikda olinadi.

## 9.5. Iqtisodiy samaradorlik indeksi — EES

Har bir komponent tashkilot sozlamasidagi eng yomon va eng yaxshi chegara orasida 0–1 diapazonga normallashtiriladi:

```text
Nᵢ = clamp((xᵢ − worstᵢ) / (bestᵢ − worstᵢ), 0, 1)

EES = Σ(wᵢ × scoreᵢ) / Σ(wᵢ mavjud) ,  scoreᵢ = 100 × Nᵢ
```

| Komponent | Xom ko‘rsatkich | Standart vazn | Ijobiy yo‘nalish |
|---|---|---:|---|
| Vaqt samaradorligi | O‘rtacha qayta ishlash soniyasi | 0.20 | Pasayish |
| Xarajat samaradorligi | Birlik xarajat | 0.25 | Pasayish |
| Mehnat unumdorligi | Daromad / mehnat soati | 0.20 | O‘sish |
| Avtomatlashtirish | Avtomatlashtirilgan jarayonlar foizi | 0.15 | O‘sish |
| Sifat | 1 − xato / hajm | 0.20 | O‘sish |

`best` qiymati `worst` dan kichik bo‘lishi mumkin. Masalan, vaqt uchun `worst=8.4`, `best=1.0`; formuladagi manfiy maxraj pasaygan vaqtga yuqori ball beradi. Biror komponent hisoblanmasa, uning vazni chiqariladi va qolgan vaznlar qayta taqsimlanadi. `coverage` qiymati dastlabki vaznlarning qancha qismi hisobda qatnashganini bildiradi.

## 9.6. Tejam va ROI

```text
Tejalgan xarajat =
  (bazaviy birlik xarajat − joriy birlik xarajat) × joriy hajm

Tejalgan mehnat =
  (bazaviy birlik mehnat − joriy birlik mehnat) × joriy hajm

Yillik tejam = joriy davr tejalgan xarajati / davr kunlari × 365

Unumdorlik o‘sishi =
  (joriy unumdorlik / bazaviy unumdorlik − 1) × 100

ROI = (yillik tejam − joriy etish xarajati) /
      joriy etish xarajati × 100
```

Bazaviy davr odatda to‘plamning dastlabki 60 kuni, lekin 7–365 kun oralig‘ida sozlanadi. ROI faqat joriy etish xarajati musbat qiymatda kiritilganda hisoblanadi.

## 9.7. Oldin–keyin taqqoslash

Mutlaq xarajat va mehnat turli hajmdagi davrlar orasida to‘g‘ridan-to‘g‘ri solishtirilmaydi. Tizim birlik ko‘rsatkichlarini joriy hajm va 30 kunlik ekvivalentga keltiradi:

```text
Oylik ekvivalent = birlik ko‘rsatkich × (joriy hajm / davr kunlari) × 30
```

Shundan keyin qayta ishlash vaqti, mehnat, xarajat, xato va unumdorlik ko‘rsatkichlari taqqoslanadi.

## 9.8. What-if ssenariysi

Ssenariy foydalanuvchi tanlagan avtomatlashtirish va aniqlik maqsadining natijasini elastiklik koeffitsientlari bilan baholaydi:

```text
ΔA = maqsad avtomatlashtirish − joriy avtomatlashtirish
ΔQ = maqsad aniqlik − joriy aniqlik

Yangi vaqt = joriy vaqt × (1 − kₜ × ΔA)
Yangi birlik xarajat = joriy xarajat × (1 − kca × ΔA − kcq × ΔQ)
Yangi unumdorlik = joriy unumdorlik × (1 + kₗ × ΔA)
Yangi xato ulushi = joriy xato ulushi × (1 − kₑ × ΔQ)
```

Koeffitsient ta’siri 0.1 dan 2 gacha bo‘lgan ko‘paytiruvchi bilan cheklanadi. So‘ng yangi EES, tejam va ROI qayta hisoblanadi. Natija prognoz emas, parametrik baho ekanligi interfeysda ko‘rsatiladi.

# 10. PROGNOZLASH VA ANOMALIYALARNI ANIQLASH

## 10.1. Tahlil metrikalari

| Metrika | Talab qilinadigan kanonik ustunlar | Birlik |
|---|---|---|
| Operatsion xarajat | `xarajat` | mln so‘m |
| Qayta ishlash vaqti | `qayta_ishlash_vaqti` | soniya |
| Mehnat unumdorligi | `daromad`, `mehnat_soat` | mln so‘m/soat |
| Xatolar ulushi | `xato_soni`, `hajm` | foiz |
| Ishlab chiqarish hajmi | `hajm` | birlik |

Ma’lumotlar sana bo‘yicha kunlik guruhlanadi. Qiymati mavjud bo‘lmagan kun sun’iy ravishda to‘ldirilmaydi.

## 10.2. Holt modeli

Mavsumiylik uchun kuzatuv yetarli bo‘lmasa, Holt chiziqli trend modeli ishlaydi:

```text
lₜ = αyₜ + (1−α)(lₜ₋₁ + bₜ₋₁)
bₜ = β(lₜ − lₜ₋₁) + (1−β)bₜ₋₁
ŷₜ₊ₕ = lₜ + h×bₜ
```

Bu yerda `l` — daraja, `b` — trend, `α` va `β` — silliqlash parametrlari.

## 10.3. Holt–Winters modeli

Kunlik qator kamida ikki to‘liq 7 kunlik siklga ega bo‘lsa, additiv mavsumiy Holt–Winters modeli tanlanadi. Model daraja, trend va haftalik mavsum komponentini birgalikda yangilaydi. `α`, `β` va `γ` parametrlarining eng yaxshi kombinatsiyasi xatolar kvadratlari yig‘indisi eng kichik bo‘lgan grid qidiruv orqali topiladi.

Prognozga eng so‘nggi 45 kunlik qator beriladi. Uzoq tarixning eski rejimlari joriy trendni yuvib yubormasligi uchun ushbu cheklov qo‘llangan. Kamida 6 ta kuzatuv talab qilinadi; API gorizontni 3–30 kun oralig‘ida cheklaydi.

## 10.4. Modelni baholash

Oxirgi 20 foiz kuzatuv yashirin test qismi sifatida ajratiladi. Model oldingi 80 foizda moslashtirilib, yashirin qism prognoz qilinadi. MAPE quyidagicha hisoblanadi:

```text
MAPE = (100/n) × Σ |(yₜ − ŷₜ) / yₜ|
Ishonch = clamp(100 − MAPE, 0, 100)
```

Nol qiymatlar MAPE maxrajiga kiritilmaydi. Yetarli o‘quv qismi bo‘lmasa, MAPE va ishonch `null` qaytariladi.

## 10.5. Ishonch oralig‘i

Model qoldiqlarining standart og‘ishi `σ` hisoblanadi. Har bir `h` qadam uchun 95 foizlik taxminiy oraliq:

```text
ŷₜ₊ₕ ± 1.96 × σ × √h
```

Xarajat, hajm va vaqt kabi manfiy bo‘la olmaydigan ko‘rsatkichlarning quyi chegarasi nol bilan cheklanadi.

## 10.6. Rolling z-score

Har bir nuqta o‘zidan oldingi 14 kunlik oyna bilan baholanadi. Joriy nuqta oyna o‘rtachasi va standart og‘ishiga kiritilmaydi; aks holda katta chet qiymat o‘z chegarasini kengaytirib yuborishi mumkin.

```text
zₜ = (xₜ − μₜ₋₁) / σₜ₋₁

|z| ≥ 3  → CRITICAL
|z| ≥ 2  → WARNING
```

## 10.7. Haftalik mavsumiy tuzatish

Dam olish kunlaridagi tabiiy pasayish anomaliya deb belgilanmasligi uchun har bir hafta kuni bo‘yicha median koeffitsient hisoblanadi. Umumiy median nol bo‘lmasa, kun koeffitsienti `weekday median / overall median` ko‘rinishida olinadi. Har bir hafta kuni uchun kamida ikki kuzatuv bo‘lmasa, koeffitsient 1 ga teng deb olinadi. z-score mavsumiy tuzatilgan qator bo‘yicha, kutilgan qiymat esa yana asl birlikka qaytarilgan holda hisoblanadi.

## 10.8. Tukey IQR mezoni

z-score chegarasiga tushmagan, lekin umumiy taqsimotdan tashqaridagi qiymat quyidagicha aniqlanadi:

```text
IQR = Q3 − Q1
x < Q1 − 1.5×IQR yoki x > Q3 + 1.5×IQR → INFO
```

Bu holatda kutilgan qiymat qator medianasi sifatida olinadi.

## 10.9. Anomaliyalarni saqlash

Oxirgi 120 kunlik oyna tekshiriladi. Har bir anomaliya `datasetId:metricKey:date` iziga ega. Shu iz bo‘yicha `upsert` bajarilishi bir xil hodisaning ko‘p marta yozilishiga yo‘l qo‘ymaydi. Qayta hisoblash mavjud yozuvning sonli qiymatlarini yangilaydi, lekin foydalanuvchi bergan holat va AI izohini saqlab qoladi. API bir so‘rovda eng ko‘pi bilan 40 ta natija qaytaradi.

# 11. SUN’IY INTELLEKT QATLAMI

## 11.1. Arxitektura tamoyili

Platformadagi asosiy tamoyil:

> **Raqamni algoritm hisoblaydi, sun’iy intellekt natijani izohlaydi.**

Ushbu ajratish natijaning takrorlanuvchanligi, matematik asoslanganligi va himoya jarayonida tushuntirilishini ta’minlaydi. Generativ modelga xom vaqt qatoridan mustaqil prognoz yoki erkin raqam yaratish topshirilmaydi.

## 11.2. Amaldagi AI vazifalari

| Vazifa | Kirish | Tuzilmalashtirilgan chiqish |
|---|---|---|
| Ustun mapping | Nom, tur, qiymatlar, diapazon | Kanonik kalit, ishonch, birlik koeffitsienti, sabab |
| Prognoz izohi | So‘nggi nuqtalar, prognoz, MAPE | Sarlavha, 2–3 jumla, omillar |
| Anomaliya izohi | Kuzatilgan, kutilgan, og‘ish, z-score, trend | Tavsif, ehtimoliy sabablar, tavsiya, ta’sir |
| Qaror yaratish | Anomaliya va iqtisodiy kontekst | Ustuvorlik, muammo, omillar, harakat, ta’sir, qadamlar |

## 11.3. Strukturali javob nazorati

Gemini’ga `responseMimeType=application/json`, `responseSchema` va `temperature=0` parametrlari beriladi. Javob dastlab JSON sifatida o‘qiladi, keyin Zod sxemasi bilan qayta tekshiriladi. Sxemaga mos kelmagan javob foydalanuvchiga chiqarilmaydi.

## 11.4. Model zanjiri va xatoga chidamlilik

Asosiy modeldan vaqtinchalik `429`, `503`, `UNAVAILABLE`, `RESOURCE_EXHAUSTED`, yuqori yuklama yoki deadline xatosi kelganda keyingi model sinab ko‘riladi:

1. `gemini-3.7-flash`;
2. `gemini-3.5-flash`;
3. `gemini-2.5-flash`.

Kutish oralig‘i bosqichma-bosqich 600, 1800 va 3000 ms qiymatlarga ega. Standart AI timeout’i 30 soniya. AI integratsiya funksiyasi istisnoni tashqi qatlamga uzatmaydi; `ok:false` natijasini qaytaradi. Shu sababli AI izohi mavjud bo‘lmasa ham statistik grafik va hisoblangan raqamlar ishlaydi.

## 11.5. Kesh mexanizmi

Kesh kaliti quyidagicha olinadi:

```text
cacheKey = SHA-256(task + "::" + JSON.stringify(meaningfulInput))
```

Natija PostgreSQL dagi `ai_cache` jadvalida model, tokenlar soni, kechikish va amal qilish muddati bilan saqlanadi. Standart muddat 30 kun. Bir xil mazmunli kirish qayta so‘ralsa, keshdagi javob Zod bilan tekshiriladi va tashqi API chaqirilmaydi. Sxemasi eskirgan kesh yozuvi avtomatik o‘chiriladi.

## 11.6. Maxfiylik va xarajat nazorati

AI kaliti faqat server muhitidagi `GEMINI_API_KEY` orqali olinadi va brauzer kodiga berilmaydi. Mapping uchun barcha fayl emas, ustun metama’lumoti va cheklangan qiymatlar yuboriladi. Prognoz izohida so‘nggi 7 nuqta va tayyor prognoz, qaror vazifasida esa agregat iqtisodiy kontekst ishlatiladi. Kesh va bir ishga tushirishdagi tavsiyalar limitlari tashqi chaqiruvlar sonini kamaytiradi.

# 12. QARORLARNI QO‘LLAB-QUVVATLASH MEXANIZMI

## 12.1. Jarayon zanjiri

```text
Tozalangan qatorlar
      ↓
Kunlik metrika qatori
      ↓
Statistik anomaliya
      ↓
Iqtisodiy kontekst: xarajat, hajm, mehnat, EES, tejam
      ↓
Tuzilmalashtirilgan AI tavsiyasi
      ↓
Foydalanuvchi ko‘rigi va izohi
      ↓
REVIEWED yoki PLANNED holati
      ↓
Bog‘langan anomaliya holatini yangilash
```

## 12.2. Nomzodlarni tanlash

Tizim faqat `OPEN` holatidagi va avval qaror bog‘lanmagan anomaliyalarni tanlaydi. Ular jiddiylik va sana bo‘yicha tartiblanadi, eng ko‘pi bilan to‘rttasi olinadi. Har bir nomzod uchun 30 kunlik iqtisodiy kontekst shakllantiriladi.

## 12.3. Tavsiya tarkibi

Tavsiya quyidagi majburiy qismlardan iborat:

- sarlavha va bir jumlalik xulosa;
- `CRITICAL`, `HIGH` yoki `MEDIUM` ustuvorlik;
- 0–100 oralig‘idagi ishonch;
- muammo tavsifi;
- 2–4 ta sabab omili va ulushi;
- bajariladigan tavsiya va asos;
- 2–4 ta iqtisodiy yoki operatsion ta’sir;
- 2–4 ta amalga oshirish qadami, mas’ul va muddat.

Har bir tavsiya tashkilot doirasida `DEC-NNN` kodi bilan saqlanadi. `payload` JSON maydoni tarkibni o‘zgaruvchan va kengaytiriladigan holda yuritishga imkon beradi.

# 13. MA’LUMOTLAR BAZASI ARXITEKTURASI

## 13.1. Umumiy tavsif

Ma’lumotlar PostgreSQL bazasida saqlanadi va Prisma ORM orqali boshqariladi. Asosiy kalitlarda UUID ishlatiladi. Vaqt maydonlari yaratilish va yangilanish auditini beradi. Ko‘p miqdordagi o‘zgaruvchan tuzilmalar — xom qator, tozalangan qator, sozlama, bosqich jurnali, trend va tavsiya — JSONB maydonlarida saqlanadi.

## 13.2. Jadvallar tavsifi

| Model/jadval | Asosiy vazifasi | Muhim maydonlar |
|---|---|---|
| `Organization` / `organizations` | Tashkilot chegarasi | name, sector, timezone, currency |
| `User` / `users` | Foydalanuvchi hisobi | orgId, email, passwordHash, role, isActive |
| `Session` / `sessions` | Bekor qilinadigan server sessiyasi | userId, expiresAt, userAgent, ipAddress |
| `OrgSettings` / `org_settings` | Tashkilot parametrlari | thresholds, notifications, eesConfig, aiInvestmentCost |
| `Dataset` / `datasets` | Yuklangan to‘plam metadata’si | format, sizeBytes, rowCount, status, qualityScore |
| `DatasetColumn` / `dataset_columns` | Ustun turi, statistika va mapping | sourceName, canonicalKey, q1, q3, unitScale |
| `DatasetRow` / `dataset_rows` | Asl va tozalangan qator | raw, clean, issues, isDuplicate |
| `QualityIssue` / `quality_issues` | Jamlangan sifat muammosi | issueType, count, affectedPct, severity, applied |
| `CleaningRun` / `cleaning_runs` | Tozalash ishga tushirilishi auditi | qualityBefore/After, stageLog, status |
| `AiCache` / `ai_cache` | Strukturali AI javoblar keshi | task, cacheKey, model, response, tokens, latency |
| `Anomaly` / `anomalies` | Statistik noodatiy holat | metricKey, observed, expected, zScore, trend, status |
| `Decision` / `decisions` | Qaror tavsiyasi va ko‘rik | code, priority, confidence, payload, feedback |

## 13.3. Asosiy bog‘lanishlar

- bitta tashkilotda ko‘p foydalanuvchi, to‘plam, anomaliya va qaror bo‘ladi;
- bitta tashkilot uchun bitta `OrgSettings` yozuvi mavjud;
- foydalanuvchida ko‘p sessiya va yuklangan to‘plam bo‘lishi mumkin;
- bitta to‘plamda ko‘p ustun, qator, sifat muammosi va tozalash ishga tushirilishi bo‘ladi;
- bitta anomaliyaga bir nechta qaror bog‘lanishi mumkin, amaliy generatsiya esa qarori yo‘q anomaliyani tanlaydi;
- qarorni ko‘rib chiqqan foydalanuvchi `reviewedById` orqali qayd etiladi.

## 13.4. O‘chirish siyosati

Tashkilot o‘chirilsa unga bog‘langan foydalanuvchi, sozlama, to‘plam, anomaliya va qarorlar `CASCADE` bilan o‘chadi. To‘plam o‘chirilsa uning ustun, qator, sifat va tozalash yozuvlari o‘chadi. Foydalanuvchi o‘chirilganda uning sessiyalari o‘chadi, lekin yuklagan to‘plam yoki ko‘rib chiqqan qarordagi foydalanuvchi havolasi `SET NULL` bo‘ladi. Qarorga bog‘langan anomaliya o‘chirilsa qaror saqlanib, havola bo‘shatiladi.

## 13.5. Indekslar va noyoblik

- foydalanuvchi emaili noyob;
- to‘plamlar `(orgId, createdAt)` bo‘yicha indekslangan;
- ustun `(datasetId, position)` bo‘yicha noyob;
- qator `(datasetId, rowIndex)` bo‘yicha noyob;
- AI kesh kaliti noyob;
- anomaliya fingerprint’i noyob;
- qaror kodi `(orgId, code)` bo‘yicha noyob;
- sessiya `userId` va `expiresAt` bo‘yicha indekslangan.

## 13.6. Tranzaksiyalar

Fayl metadata’si, ustunlar, qatorlar va sifat muammolari bitta Prisma tranzaksiyasida yaratiladi. Mapping ustun yangilanishlari tranzaksiyada bajariladi. Tozalash yakunida `CleaningRun`, `Dataset` va `QualityIssue` holatlari bir tranzaksiyada yangilanadi. Bu qisman yozilgan holatlar xavfini kamaytiradi.

# 14. API TAVSIFI

## 14.1. Yagona javob kontrakti

Muvaffaqiyatli javob:

```json
{
  "ok": true,
  "data": {}
}
```

Xato javobi:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Kiritilgan ma’lumotda xatolik bor.",
    "details": {}
  }
}
```

Markazlashgan xato kodlari: `INVALID_JSON`, `VALIDATION_ERROR`, `INVALID_CREDENTIALS`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `INTERNAL_ERROR`. Domen holatlari uchun `NO_METRIC_SOURCE`, `METRIC_UNAVAILABLE`, `NOT_ENOUGH_DATA` va `AI_UNAVAILABLE` kodlari ham ishlatiladi.

## 14.2. Endpointlar ro‘yxati

| Metod | Endpoint | Vazifasi | Himoya |
|---|---|---|---|
| POST | `/api/auth/login` | Email/parolni tekshirish va sessiya yaratish | Ochiq |
| POST | `/api/auth/logout` | Sessiyani bekor qilish | Cookie bo‘lsa |
| GET | `/api/auth/me` | Joriy foydalanuvchi va tashkilot | Sessiya |
| GET | `/api/datasets` | Tashkilot to‘plamlarini ro‘yxatlash | Sessiya |
| POST | `/api/datasets` | CSV/XLSX faylni qabul qilish va profiling | Sessiya |
| GET | `/api/datasets/{id}` | To‘plam, ustun, muammo va 50 qatorlik ko‘rinish | Sessiya va orgId |
| DELETE | `/api/datasets/{id}` | To‘plamni bog‘liq yozuvlari bilan o‘chirish | Sessiya va orgId |
| POST | `/api/datasets/{id}/mapping` | AI mapping yoki foydalanuvchi mappingini saqlash | Sessiya va orgId |
| POST | `/api/datasets/{id}/clean` | Tozalashni bajarish | Sessiya va orgId |
| GET | `/api/datasets/{id}/clean` | Oxirgi 10 ta tozalash tarixini olish | Sessiya va orgId |
| GET | `/api/metrics` | Davriy KPI, qator va EES | Sessiya |
| GET | `/api/economics` | EES, tejam va oldin–keyin taqqoslash | Sessiya |
| POST | `/api/economics` | What-if ssenariysini hisoblash | Sessiya |
| GET | `/api/ai/forecast` | Statistik prognoz va ixtiyoriy AI izohi | Sessiya |
| GET | `/api/ai/anomalies` | Anomaliyalarni olish yoki qayta hisoblash | Sessiya |
| POST | `/api/ai/anomalies/{id}/explain` | Bitta anomaliyani AI bilan izohlash | Sessiya va orgId |
| GET | `/api/decisions` | Qaror tavsiyalarini olish | Sessiya |
| POST | `/api/decisions` | Ochiq anomaliyalardan tavsiya yaratish | Sessiya |
| PATCH | `/api/decisions/{id}` | Holat va foydalanuvchi izohini yangilash | Sessiya va orgId |
| GET | `/api/settings` | Profil, tashkilot va hisob sozlamalarini olish | Sessiya |
| PATCH | `/api/settings` | Sozlamalarni validatsiya qilib saqlash | Sessiya |

## 14.3. Muhim so‘rov parametrlari

`GET /api/metrics`:

- `period`: `today`, `week`, `month`, `quarter`, `year`;
- `datasetId`: ixtiyoriy, aniq to‘plamni tanlaydi.

`GET /api/ai/forecast`:

- `metric`: tahlil metrikasi kaliti;
- `horizon`: 3–30, interfeysda 7, 14 yoki 30.

`GET /api/ai/anomalies`:

- `refresh=1`: statistik aniqlashni qayta ishga tushiradi.

`POST /api/economics`:

```json
{
  "automation": 85,
  "accuracy": 97,
  "period": "month",
  "datasetId": "ixtiyoriy-uuid"
}
```

## 14.4. Server bajarilish chegaralari

Fayl qabul qilish, mapping, tozalash, prognoz va anomaliya izohi marshrutlari uchun `maxDuration=60` soniya belgilangan. Bir necha tavsiya parallel yaratiladigan qaror marshruti uchun `maxDuration=120` soniya qo‘llanadi.

# 15. AXBOROT XAVFSIZLIGI

## 15.1. Autentifikatsiya va sessiya

- parollar Argon2id bilan xeshlanadi;
- cookie ichida parol yoki foydalanuvchi profili saqlanmaydi;
- JWT HS256 bilan kamida 32 belgili `SESSION_SECRET` yordamida imzolanadi;
- sessiya 7 kun amal qiladi;
- server `sessions` jadvalidagi yozuv, tugash vaqti va foydalanuvchi faolligini qayta tekshiradi;
- chiqish paytida sessiya bazadan o‘chiriladi va cookie bekor qilinadi;
- proxy faqat tezkor optimistik tekshiruv, API’dagi `requireUser()` esa yakuniy tekshiruvdir.

## 15.2. Tashkilotlararo izolyatsiya

To‘plam, anomaliya va qaror identifikatori bilan bajariladigan so‘rovda foydalanuvchining `organization.id` qiymati ham `where` shartiga qo‘shiladi. Bu boshqa tashkilot identifikatorini bilib qolgan foydalanuvchining begona yozuvni o‘qishi yoki o‘zgartirishini cheklaydi.

## 15.3. Kirish ma’lumotlarini tekshirish

- JSON tana o‘qilmasa `INVALID_JSON` qaytariladi;
- email, UUID, enum, son diapazoni va matn uzunligi Zod bilan tekshiriladi;
- fayl turi, hajmi va bo‘shligi serverda tekshiriladi;
- mappingdagi ustun identifikatorining aynan tanlangan to‘plamga tegishliligi nazorat qilinadi;
- ssenariy avtomatlashtirish va aniqligi 0–100 oralig‘ida cheklanadi;
- foydalanuvchi izohi 2000 belgidan oshmaydi.

## 15.4. Xatoliklarni xavfsiz qaytarish

Kutilmagan server xatosi markaziy o‘ram orqali ushlanadi. Stack trace yoki ichki istisno tafsiloti brauzerga yuborilmaydi; server jurnaliga yozilib, mijozga umumiy o‘zbekcha xabar qaytariladi.

## 15.5. Maxfiy konfiguratsiya

Quyidagi qiymatlar muhit o‘zgaruvchilarida saqlanadi:

- `DATABASE_URL` — ish vaqtidagi PostgreSQL ulanishi;
- `DIRECT_DATABASE_URL` — migratsiya uchun to‘g‘ridan-to‘g‘ri ulanish;
- `SESSION_SECRET` — JWT imzo kaliti;
- `GEMINI_API_KEY` — AI xizmat kaliti.

Haqiqiy kalitlar `.env.example` ga yozilmaydi. Production kalitlari hosting provayderining yopiq sozlamalarida saqlanishi kerak.

## 15.6. Tavsiya etiladigan qo‘shimcha choralar

Ekspluatatsiya miqyosi kengayganda quyidagilarni joriy qilish tavsiya etiladi:

- rol bo‘yicha endpoint darajasidagi ruxsat matritsasi;
- login va AI endpointlari uchun rate limiting;
- autentifikatsiya hodisalari auditi;
- CSRF himoyasini xavf modeli asosida kuchaytirish;
- fayl tarkibini antivirus bilan tekshirish;
- sessiya kalitini davriy almashtirish;
- baza zaxira nusxasi va tiklash sinovlari;
- xavfsizlik sarlavhalari uchun markaziy Content Security Policy.

# 16. ISHLASH UNUMDORLIGI VA ISHONCHLILIK

## 16.1. Unumdorlik yechimlari

- Prisma Client development hot-reload davrida global singleton sifatida saqlanadi;
- tozalangan qatorlar 500 tadan bloklanib `unnest` orqali yangilanadi;
- ma’lumot qatorlari `(datasetId,rowIndex)` indeksi bilan olinadi;
- dashboard uchun bir nechta to‘plam aralashtirilmaydi;
- prognoz eng so‘nggi 45 nuqta bilan chegaralanadi;
- anomaliya oynasi 120 kun va javob 40 yozuv bilan chegaralanadi;
- AI tavsiyalari bir ishga tushirishda 4 ta va parallel bajariladi;
- AI javoblari SHA-256 kalitli keshda 30 kun saqlanadi;
- what-if slider so‘rovlari 350 ms debounce bilan yuboriladi.

## 16.2. Ishonchlilik mexanizmlari

- ma’lumot yaratish va holat yangilashda tranzaksiyalar;
- AI ishlamasa ham asosiy hisoblarning davom etishi;
- tashqi model vaqtinchalik ishlamasa zaxira model zanjiri;
- eski kesh javobini joriy Zod sxemasi bilan tekshirish;
- dublikat anomaliyani noyob fingerprint bilan cheklash;
- xom va tozalangan ma’lumotni alohida saqlash;
- tozalash muvaffaqiyatsiz bo‘lsa `FAILED` holati va xato matnini qayd etish;
- barcha API javoblari uchun yagona natija shakli.

## 16.3. Masshtablash

Joriy arxitektura serverless yoki Node.js serverida ishlashi mumkin. PostgreSQL drayveri provayderga qattiq bog‘lanmagan: lokal Docker, boshqariladigan PostgreSQL yoki VPS ulanishi `DATABASE_URL` ni almashtirish orqali tanlanadi. Serverless muhitda pooled ulanish, migratsiyada direct ulanish qo‘llanadi.

Katta hajmga o‘tilganda fayl parsing va tozalashni fon ishchi jarayoniga chiqarish, obyekt saqlagich qo‘shish, oqim uchun WebSocket yoki Server-Sent Events, hisobotlar uchun navbat va observability tizimini alohida servis qilish maqsadga muvofiq.

# 17. O‘RNATISH VA ISHGA TUSHIRISH

## 17.1. Tizim talablari

- Node.js 20 yoki undan yuqori;
- pnpm;
- Docker va Docker Compose yoki tayyor PostgreSQL;
- kamida 32 belgili sessiya kaliti;
- AI izohlari uchun Gemini API kaliti.

## 17.2. Lokal ishga tushirish

```bash
cp .env.example .env
# .env ichida SESSION_SECRET ni to‘ldirish

pnpm db:up
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Ilova odatda `http://localhost:3000` manzilida ochiladi.

## 17.3. Asosiy buyruqlar

| Buyruq | Vazifasi |
|---|---|
| `pnpm dev` | Ishlab chiqish serverini boshlash |
| `pnpm lint` | ESLint tekshiruvi |
| `pnpm build` | Prisma Client va production build |
| `pnpm start` | Tayyor build’ni ishga tushirish |
| `pnpm db:up` | Lokal PostgreSQL konteynerini ko‘tarish |
| `pnpm db:down` | Konteynerni to‘xtatish |
| `pnpm db:migrate` | Development migratsiyasini qo‘llash |
| `pnpm db:deploy` | Production migratsiyasini qo‘llash |
| `pnpm db:seed` | Boshlang‘ich tashkilot va foydalanuvchini yaratish |
| `pnpm db:studio` | Prisma Studio’ni ochish |

## 17.4. Docker PostgreSQL

Lokal muhitda `postgres:17-alpine` tasviri ishlatiladi. Standart port 5432, baza nomi `samara`. Ma’lumot `samara-pgdata` Docker volume’ida saqlanadi. `pg_isready` asosidagi healthcheck 5 soniya oralig‘ida ulanishni tekshiradi.

## 17.5. Production joylashtirish

Vercel va Neon bilan ishlaganda:

1. Neon’da PostgreSQL baza yaratiladi.
2. Ish vaqti uchun pooled, migratsiya uchun direct ulanish olinadi.
3. `DATABASE_URL`, `DIRECT_DATABASE_URL`, `SESSION_SECRET`, `GEMINI_API_KEY` hosting muhitiga kiritiladi.
4. `vercel-build` jarayoni `prisma generate`, `prisma migrate deploy`, `next build` ketma-ketligini bajaradi.
5. Boshlang‘ich foydalanuvchi bir marta seed orqali yaratiladi.

Production uchun alohida kuchli sessiya kaliti va individual foydalanuvchi parollari qo‘llanishi shart.

# 18. FOYDALANISH SSENARIYSI

## 18.1. Ma’lumotdan qarorgacha asosiy oqim

1. Foydalanuvchi tizimga email va parol bilan kiradi.
2. “Ma’lumot manbalari” sahifasida CSV yoki XLSX faylni yuklaydi.
3. Tizim faylni o‘qiydi, ustun turini aniqlaydi va sifat profilini yaratadi.
4. Foydalanuvchi ustunlarning kanonik sxemaga mosligini tekshiradi.
5. Zarur bo‘lsa AI mapping ishga tushiriladi va foydalanuvchi natijani qo‘lda tasdiqlaydi.
6. “Qayta ishlash” sahifasida muammolar va tavsiya etilgan tuzatishlar ko‘riladi.
7. Tozalash bajariladi; sifat va yaroqli qatorlar natijasi qayd etiladi.
8. Dashboard’da davriy KPI, trend va EES ko‘riladi.
9. “AI tahlili” sahifasida metrika va prognoz gorizonti tanlanadi.
10. Anomaliyalar qayta tekshiriladi va muhim holat uchun AI izohi olinadi.
11. “Iqtisodiy samaradorlik” sahifasida bazaviy va joriy holat, tejam va ROI baholanadi.
12. What-if ssenariysida avtomatlashtirish va aniqlik maqsadlari o‘zgartiriladi.
13. “Qarorlar” sahifasida ochiq anomaliyalar uchun tavsiya yaratiladi.
14. Rahbar tavsiyani ko‘rib chiqadi, izoh qoldiradi va rejaga kiritadi.
15. Zarur kesim “Hisobotlar” sahifasida tanlanib, kerakli formatga chiqariladi.

## 18.2. Xatolik ssenariylari

- fayl formati noto‘g‘ri bo‘lsa yuklash rad etiladi;
- hajm 15 MB dan oshsa qayta ishlash boshlanmaydi;
- sanasiz yoki xarajatsiz to‘plam metrika manbasi bo‘la olmaydi;
- tozalanmagan to‘plam dashboard hisobiga kiritilmaydi;
- 6 tadan kam kuzatuvda prognoz hisoblanmaydi;
- kerakli ustun yo‘q bo‘lsa tegishli metrika tanlovda berilmaydi;
- AI kaliti yo‘q yoki xizmat javob bermasa sonli natijalar saqlanadi, faqat izoh berilmaydi;
- sessiya tugagan yoki bazadan o‘chirilgan bo‘lsa API 401 qaytaradi.

# 19. SINOV VA QABUL QILISH MEZONLARI

## 19.1. Funksional sinovlar

| № | Sinov | Kutiladigan natija |
|---:|---|---|
| 1 | To‘g‘ri email va parol bilan kirish | Sessiya yaratiladi va dashboard ochiladi |
| 2 | Noto‘g‘ri parol | Bir xil xavfsiz xato xabari, sessiya yaratilmaydi |
| 3 | Himoyalangan sahifani sessiyasiz ochish | Kirish sahifasiga yo‘naltirish |
| 4 | CSV fayl yuklash | Profil, ustunlar, qatorlar va muammolar bazaga yoziladi |
| 5 | XLSX formula va sana kataklari | Hisoblangan qiymat va sana to‘g‘ri o‘qiladi |
| 6 | 15 MB dan katta fayl | 422 validatsiya xatosi |
| 7 | Mappingni qo‘lda yangilash | Ustun `USER` manbasi va 100 ishonch bilan saqlanadi |
| 8 | Dublikatli to‘plamni tozalash | Birinchi nusxa qoladi, keyingi nusxa tahlildan chiqariladi |
| 9 | Bo‘sh sonni tozalash | Ustun medianasi yoziladi |
| 10 | Outlierni tozalash | IQR chegarasida kesiladi |
| 11 | Davrni o‘zgartirish | KPI va grafik yangi davr bo‘yicha qayta hisoblanadi |
| 12 | Yetishmayotgan EES komponenti | Qolgan vaznlar qayta taqsimlanadi va coverage kamayadi |
| 13 | Yetarli haftalik qator | Holt–Winters modeli tanlanadi |
| 14 | Kuchli og‘ish | z-score chegarasiga mos daraja yaratiladi |
| 15 | Anomaliyani takroran tekshirish | Noyob fingerprint sabab dublikat yozuv yaratilmaydi |
| 16 | Tavsiyani `PLANNED` qilish | Qaror saqlanadi, bog‘langan anomaliya `RESOLVED` bo‘ladi |
| 17 | EES vaznlarini saqlash | Vaznlar yig‘indisi 1 ga normallashtiriladi |
| 18 | AI xizmati mavjud emasligi | Statistika ishlaydi, izoh holati boshqariladi |

## 19.2. Matematik tekshiruvlar

- sifat vaznlari yig‘indisi 1.00 ga teng;
- standart EES vaznlari yig‘indisi 1.00 ga teng;
- EES va komponent ballari 0–100 oralig‘idan chiqmaydi;
- `qualityRatio` 0–1 oralig‘iga kesiladi;
- prognozning manfiy bo‘lmasligi belgilangan metrikalarda quyi oraliq 0 dan pasaymaydi;
- MAPE hisobida nol maxraj ishlatilmaydi;
- z-score oynasi joriy nuqtani o‘z ichiga olmaydi;
- ROI faqat musbat investitsiya qiymatida hisoblanadi.

## 19.3. Xavfsizlik sinovlari

- buzilgan yoki muddati tugagan JWT rad etilishi;
- bazadan o‘chirilgan sessiya tokeni bilan API ishlamasligi;
- boshqa tashkilot UUID si bilan to‘plamni o‘qish va o‘chirish imkonsizligi;
- noto‘g‘ri JSON va enum qiymatlarining 4xx bilan qaytishi;
- login javobidan foydalanuvchi mavjudligini aniqlab bo‘lmasligi;
- cookie’ning `HttpOnly`, production’da `Secure` va `SameSite=Lax` bo‘lishi;
- xato javobida stack trace chiqmasligi.

## 19.4. Interfeys sinovlari

- 320 px va undan keng ekranda asosiy oqim ishlashi;
- mobil menyuning ochilishi, tashqi bosish va `Escape` bilan yopilishi;
- klaviatura fokusining ko‘rinishi;
- jadvalning kichik ekranda gorizontal aylanishi;
- loading, empty, success, warning va error holatlarining aniq ko‘rinishi;
- grafik tooltip’lari va o‘lchov birliklarining o‘zbekcha ko‘rinishi;
- rang bilan birga matn yoki ikonka orqali holat ifodalanishi.

# 20. TIZIM CHEGARALARI VA RIVOJLANTIRISH YO‘NALISHLARI

## 20.1. Amaldagi chegaralar

- fayl qabul qilish CSV va XLSX bilan cheklangan;
- XLSX faylning birinchi ishchi varag‘i o‘qiladi;
- bir to‘plamda ko‘pi bilan 100 000 qator qayta ishlanadi;
- metrika uchun `sana` va `xarajat` kanonik kalitlari talab qilinadi;
- avtomatik ravishda bir nechta to‘plam qo‘shilmaydi;
- tahlil kunlik agregatsiyaga asoslangan;
- monitoring telemetriyasi joriy taqdimot qatlamida brauzer taymeri bilan yangilanadi;
- hisobot eksporti joriy taqdimot qatlamida yaratiladi, doimiy server arxivi mavjud emas;
- foydalanuvchini mustaqil ro‘yxatdan o‘tkazish va parolni tiklash oqimi yo‘q;
- rol maydoni mavjud, ammo endpoint kesimidagi to‘liq ruxsat matritsasi hali ajratilmagan;
- xabar kanali parametrlari saqlanadi, email jo‘natish servisi alohida integratsiyani talab qiladi.

## 20.2. Rivojlantirish yo‘nalishlari

1. ERP, CRM, MES va IoT tizimlari uchun konnektorlar.
2. WebSocket yoki Server-Sent Events orqali server telemetriyasi.
3. Katta fayllar uchun obyekt saqlagich va fon navbati.
4. Serverda PDF/XLSX generatsiyasi va hisobotlar arxivi.
5. Email va platforma ichidagi real bildirishnoma servisi.
6. Admin panel, foydalanuvchi yaratish va nozik RBAC.
7. AI va login uchun taqsimlangan rate limiter.
8. Tashkilot ma’lumotida o‘rganilgan elastiklik koeffitsientlari.
9. Model monitoringi, drift tahlili va algoritm versiyalash.
10. Avtomatik testlar, yuklama sinovi va kuzatuv telemetriyasi.
11. Fayl ustunlari bo‘yicha foydalanuvchi tuzadigan formulalar.
12. Ko‘p tilli interfeys va lokalizatsiya.

# 21. XULOSA

“Samara AI” platformasi korxona ma’lumotlaridan boshqaruv qarorigacha bo‘lgan to‘liq analitik jarayonni yagona tizimda ifodalaydi. Uning asosiy ilmiy-amaliy afzalligi generativ sun’iy intellektni klassik statistik va iqtisodiy algoritmlardan ajratganidir. Sifat balli, EES, tejam, ROI, Holt–Winters prognozi va z-score/IQR anomaliya natijalari aniq formulalar bilan olinadi. Sun’iy intellekt esa ushbu tekshiriladigan natijalarni inson uchun tushunarli sabab, xulosa va bajariladigan reja shakliga keltiradi.

Qatlamli TypeScript arxitekturasi, PostgreSQL bazasi, tashkilotlararo izolyatsiya, bekor qilinadigan JWT sessiyasi, strukturali AI javobi va kesh mexanizmi tizimni keyingi ilmiy tajriba va amaliy joriy etish uchun mustahkam asosga aylantiradi. Ma’lumotning asl va tozalangan ko‘rinishini parallel saqlash, har bir tuzatishning audit izini yuritish va EES vaznlarini tashkilotga mos sozlash platformaning tushuntiriluvchanligini oshiradi.

Mazkur dasturiy yechim dissertatsiya ishida iqtisodiy samaradorlikni raqamli baholash, sun’iy intellekt yordamida tahliliy xulosalar olish va dalillarga asoslangan boshqaruv qarorlarini shakllantirishning amaliy realizatsiyasi sifatida qo‘llanishi mumkin.

<!-- PAGE BREAK -->

# 22. ILOVALAR

## Ilova A. Loyiha papkalari xaritasi

```text
realtimeAi/
├── prisma/
│   ├── schema.prisma              — ma’lumotlar modeli
│   ├── migrations/                — sxema migratsiyalari
│   └── seed.ts                    — boshlang‘ich yozuvlar
├── src/
│   ├── app/                       — sahifalar, layout va API
│   ├── components/                — umumiy UI komponentlari
│   ├── config/                    — marshrut va navigatsiya
│   ├── features/                  — funksional sahifa modullari
│   ├── lib/
│   │   ├── ai/                    — Gemini va AI vazifalari
│   │   ├── analytics/             — prognoz va anomaliya
│   │   ├── api/                   — javob formati
│   │   ├── auth/                  — JWT, sessiya, parol
│   │   ├── datasets/              — to‘plam yaratish va serializatsiya
│   │   ├── economics/             — EES, KPI va what-if
│   │   ├── metrics/               — agregatsiya va davr
│   │   ├── parsing/               — CSV/XLSX va qiymat normalizatsiyasi
│   │   └── quality/               — profiling, muammo, cleaning
│   ├── services/                  — tiplangan mijoz API qatlami
│   └── proxy.ts                   — sahifa himoyasi
├── docker-compose.yml             — lokal PostgreSQL
├── next.config.ts                 — Next.js konfiguratsiyasi
├── prisma.config.ts               — Prisma konfiguratsiyasi
├── package.json                   — paket va skriptlar
└── .env.example                   — muhit o‘zgaruvchilari namunasi
```

## Ilova B. To‘plam holatlari

| Holat | Mazmuni | Keyingi odatiy holat |
|---|---|---|
| `UPLOADED` | Fayl metama’lumoti qabul qilingan | `PROFILED` |
| `PROFILED` | Ustun va sifat statistikasi hisoblangan | `MAPPED` yoki `CLEANED` |
| `MAPPED` | Kanonik kalitlar tasdiqlangan | `CLEANED` |
| `CLEANED` | Tozalangan qatorlar tayyor | Tahlil |
| `FAILED` | Jarayonda xato yuz bergan | Tuzatish va qayta urinish |

## Ilova C. Muhim konstantalar

| Konstanta | Qiymat | Maqsad |
|---|---:|---|
| Maksimal fayl hajmi | 15 MB | Server va tarmoq yukini cheklash |
| Maksimal qator | 100 000 | Xotira va bajarilish vaqtini boshqarish |
| Preview qatori | 50 | Interfeys yukini kamaytirish |
| Tur ishonchi | 70% | Sana yoki son turini tanlash |
| Mantiqiy tur ishonchi | 90% | Noto‘g‘ri boolean aniqlashni kamaytirish |
| Profil namunasi | 200 qiymat | Tezkor tur aniqlash |
| AI kesh muddati | 30 kun | Tezlik va tashqi chaqiruv xarajati |
| AI timeout | 30 soniya | Uzoq bloklanishni cheklash |
| Prognoz tarixi | 45 kun | Joriy trendga e’tibor |
| Prognoz minimumi | 6 nuqta | Modelni ishga tushirish sharti |
| Haftalik mavsum | 7 kun | Haftalik siklni hisobga olish |
| Anomaliya oynasi | 14 kun | Rolling statistik baza |
| Anomaliya tahlili | 120 kun | Yaqin tarixga e’tibor |
| Kritik z-score | 3 | Yuqori og‘ish chegarasi |
| Ogohlantiruvchi z-score | 2 | Erta signal chegarasi |
| Tozalash bloki | 500 qator | Bazaga samarali yozish |
| Qarorlar limiti | 4 | Bitta ishga tushirishdagi AI yukini cheklash |
| Sessiya muddati | 7 kun | Foydalanuvchi sessiyasi |

## Ilova D. Atamalar va qisqartmalar

| Atama | Izoh |
|---|---|
| AI | Sun’iy intellekt |
| API | Dasturiy interfeys orqali ma’lumot almashish qatlami |
| KPI | Asosiy samaradorlik ko‘rsatkichi |
| EES | Economic Efficiency Score — iqtisodiy samaradorlik indeksi |
| ROI | Return on Investment — investitsiya qaytimi |
| MAPE | O‘rtacha absolyut foiz xatosi |
| IQR | Kvartillar oralig‘i: Q3−Q1 |
| z-score | Qiymatning o‘rtachadan standart og‘ish birliklaridagi masofasi |
| Winsorization | Chet qiymatni belgilangan statistik chegaraga keltirish |
| Mapping | Fayl ustunini kanonik kalitga bog‘lash |
| Kanonik sxema | Turli manbalarni yagona ma’no va birlikka keltiruvchi lug‘at |
| Profiling | Ustun va jadval sifat-statistikasini hisoblash |
| Dataset | Bitta fayldan olingan ma’lumotlar to‘plami |
| JWT | Imzolangan sessiya tokeni |
| ORM | Ma’lumotlar bazasi jadvallarini dastur obyektlari orqali boshqarish |
| JSONB | PostgreSQL’dagi indekslanadigan ikkilik JSON turi |
| Backtest | Modelni tarixning yashirilgan qismida sinash |
| Debounce | Tez-tez hodisalardan keyin so‘rovni qisqa muddatga kechiktirish |

## Ilova E. Dissertatsiya matnida foydalanish uchun qisqa tavsif

“Samara AI” — korxona ma’lumotlarini qabul qilish, sifatini baholash, kanoniklashtirish, statistik prognozlash, anomaliyalarni aniqlash va iqtisodiy samaradorlikni hisoblashga mo‘ljallangan veb-platformadir. Tizimning hisoblash yadrosi deterministik algoritmlarga, izohlash va boshqaruv tavsiyalarini shakllantirish qatlami esa generativ sun’iy intellektga asoslangan. Bunday gibrid yondashuv raqamli natijalarning takrorlanuvchanligini saqlagan holda ularni boshqaruv uchun tushunarli xulosaga aylantiradi.

## Ilova F. Foydalanilgan dasturiy manbalar

Ushbu texnik hujjat quyidagi amaldagi loyiha qismlarini tahlil qilish asosida tayyorlandi:

- `package.json` — texnologiyalar va ishga tushirish skriptlari;
- `prisma/schema.prisma` va migratsiyalar — ma’lumotlar sxemasi;
- `src/app` — sahifalar va HTTP endpointlar;
- `src/features` — foydalanuvchi bo‘limlari;
- `src/lib/parsing` — fayl va qiymatlarni o‘qish;
- `src/lib/quality` — sifat va tozalash;
- `src/lib/metrics` va `src/lib/economics` — ko‘rsatkichlar va formulalar;
- `src/lib/analytics` — prognoz va anomaliya;
- `src/lib/ai` — Gemini integratsiyasi va kesh;
- `src/lib/auth` va `src/proxy.ts` — autentifikatsiya va himoya;
- `src/services` — frontend va API o‘rtasidagi tiplangan aloqa;
- `docker-compose.yml`, `next.config.ts`, `prisma.config.ts` — infratuzilma konfiguratsiyasi.

---

**Hujjat yakuni**
