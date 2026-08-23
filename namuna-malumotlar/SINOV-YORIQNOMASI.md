# AI qanday ishlashini o'zingiz tekshirish

Fayl: **`sinov-korxona-2026.xlsx`** — 520 qator, 10 ustun, 2026-mart — 2026-avgust.

Bu fayl boshqa namunalardan **ataylab farq qiladi**, chunki maqsad — AI'ni
haqiqatan sinash, oldindan tayyorlangan javobni ko'rsatish emas.

---

## Nima uchun bu fayl qiyin

Ustun nomlari kanonik sxemaga umuman o'xshamaydi va uchtasida o'lchov birligi
boshqacha:

| Fayldagi ustun | Nima aslida | Qiyinligi |
| --- | --- | --- |
| `Otchet_sanasi` | sana | — |
| `Sex` | bo'lim | Qisqartma, kontekstsiz tushunarsiz |
| `Artikul` | mahsulot kodi | — |
| `Chiqarilgan_mahsulot_soni` | hajm | — |
| `Sotuv_summasi_som` | daromad | **so'mda**, kanonik birlik — mln so'm |
| `Ishlab_chiqarish_xarajati_som` | xarajat | **so'mda** |
| `Sarflangan_vaqt_minut` | mehnat vaqti | **minutda**, kanonik — soat |
| `Brak_soni` | xatolar soni | "brak" — kalit so'zlar ro'yxatida yo'q |
| `Sikl_vaqti_minut` | qayta ishlash vaqti | **minutda**, kanonik — soniya |
| `Robotlashtirish_foizi` | avtomatlashtirish | "robot" — noodatiy atama |

**Eng qiyin joyi:** `Sarflangan_vaqt_minut` va `Sikl_vaqti_minut` — ikkalasi ham
minutda, lekin turli kanonik kalitga tegishli va konversiya **teskari
yo'nalishda**: birinchisi 60 ga bo'linadi (minut → soat), ikkinchisi 60 ga
ko'paytiriladi (minut → soniya). Buni kalit so'z qoidasi bilan hal qilib
bo'lmaydi — faqat ma'noni tushungan model uddalaydi.

---

## 1-sinov: ustunlarni tanish

1. **Ma'lumotlar** sahifasini oching
2. `sinov-korxona-2026.xlsx` faylini yuklang
3. Pastda **"Ustunlarni bog'lash"** panelida **"AI bilan aniqlash"** tugmasini bosing

### To'g'ri javob

| Ustun | Kanonik kalit | Koeffitsient |
| --- | --- | --- |
| `Otchet_sanasi` | sana | 1 |
| `Sex` | bo'lim | 1 |
| `Artikul` | mahsulot / jarayon | 1 |
| `Chiqarilgan_mahsulot_soni` | hajm | 1 |
| `Sotuv_summasi_som` | daromad | **0.000001** |
| `Ishlab_chiqarish_xarajati_som` | xarajat | **0.000001** |
| `Sarflangan_vaqt_minut` | mehnat vaqti | **0.0167** |
| `Brak_soni` | xatolar soni | 1 |
| `Sikl_vaqti_minut` | qayta ishlash vaqti | **60** |
| `Robotlashtirish_foizi` | avtomatlashtirish | 1 |

Koeffitsient ustundan pastda `birlik × 0.000001` ko'rinishida yashil rangda
ko'rinadi. Har bir qatorda AI o'z qarorini bir jumlada izohlaydi.

> **Diqqat:** natija 9–15 soniya kutiladi. Ikkinchi marta bosilsa **0 ms** da
> keladi va "Avval hisoblangan natija ishlatildi" deb yozadi — bu kesh ishlagani,
> xato emas.

---

## 2-sinov: sifat va tozalash

Faylga ataylab nuqson kiritilgan:

| Nuqson | Soni |
| --- | --- |
| Bo'sh kataklar | 58 |
| Format xatolari (`"1234,5"` ko'rinishida) | 52 |
| Dublikat qatorlar | 4 |
| Outlier qiymatlar | 15 |

**Qayta ishlash** sahifasiga o'ting va **"Tozalash va qayta ishlash"** ni bosing.

Kutilayotgan natija: **sifat 96 → 100**, yaroqli qatorlar **462 → 516**.

Tozalashdan keyin `birlik` konversiyasi ham qo'llanadi: masalan
`Ishlab_chiqarish_xarajati_som` dagi `1 508 000` qiymati bazada `1.508`
(mln so'm) bo'lib saqlanadi.

---

## 3-sinov: anomaliyalarni topish

Faylga **4 ta anomaliya** ataylab joylashtirilgan:

| Sana | Nima qilingan |
| --- | --- |
| **2026-05-12** | Xarajat 38% ga oshirilgan |
| **2026-06-25** | Sikl vaqti 85% ga oshirilgan |
| **2026-07-09** | Brak soni 3.2 barobar oshirilgan |
| **2026-08-05** | Mehnat vaqti 45% ga oshirilgan |

**AI tahlili → Anomaliyalar** bo'limida **"Qayta tekshirish"** ni bosing.
Ro'yxatda shu to'rt sana chiqishi kerak.

Tekshirilgan natija:

```
2026-05-12  Xarajat    +15.6%  z=2.88   OGOHLANTIRISH
2026-06-25  Xarajat    +28.1%  z=5.02   KRITIK
            Vaqt       +54.6%  z=10.23  KRITIK
2026-07-09  Xatolar   +129.9%  z=12.19  KRITIK
2026-08-05  Vaqt       +19.4%  z=4.82   KRITIK
            Unumdorlik −17.8%  z=−3.22  KRITIK
```

`2026-08-05` da mehnat vaqtining oshishi **unumdorlik pasayishi** orqali ham
aks etgan — bu detektor zanjirli ta'sirni ham ko'rayotganini bildiradi.

Bittasini tanlab **"AI bilan izohlash"** ni bosing — Gemini ehtimoliy
sabablarni ulushlari bilan va bajariladigan tavsiyani beradi.

> **Muhim:** anomaliya sanashni AI QILMAYDI. Uni rolling z-score va IQR
> topadi. AI faqat "nega shunday bo'lgan bo'lishi mumkin" degan savolga
> javob beradi.

---

## 4-sinov: qaror tavsiyalari

**Qarorlar** sahifasida **"AI bilan tayyorlash"** ni bosing.

Gemini har bir ochiq anomaliya uchun to'liq qaror tuzadi: muammo tavsifi,
hissa qo'shgan omillar ulushlari bilan, tavsiya, kutilayotgan iqtisodiy
effektlar va mas'ul hamda muddat ko'rsatilgan qadamlar.

Tekshiring: AI keltirgan raqamlar (mehnat soati, avtomatlashtirish foizi,
xarajat) sizning **haqiqiy ma'lumotingizga** mos keladimi. Ular kontekstdan
olinadi, o'ylab topilmaydi.

---

## 5-sinov: prognoz

**AI tahlili → Prognozlash** bo'limi.

- Ko'rsatkich va gorizontni (7 / 14 / 30 kun) almashtiring
- **Model** kartasida `Holt-Winters (mavsum 7 kun)` yozilishi kerak
- **Model ishonchi** — MAPE asosida, oxirgi 20% ma'lumotda backtest orqali
- Soyalangan zona — 95% ishonch oralig'i

Prognoz raqamlarini ham AI hisoblamaydi. Agar Gemini javob bermasa, o'ng
tomondagi izoh o'rniga xabar chiqadi, **lekin grafik va raqamlar baribir
to'g'ri ko'rsatiladi**.

---

## Muhim cheklov

Hozir tahlil sahifalari (**Dashboard**, **AI tahlili**, **Iqtisodiy
samaradorlik**, **Qarorlar**) avtomatik ravishda **eng katta** tozalangan
datasetni tanlaydi.

Bazada `ishlab-chiqarish-2025-2026.xlsx` (1 420 qator) turgani uchun, sinov
fayli (520 qator) yuklansa ham prognoz va anomaliyalar **eski fayl bo'yicha**
hisoblanadi.

**Yechim:** 3, 4 va 5-sinovlardan oldin **Ma'lumotlar** sahifasida boshqa
datasetlarni o'chirib tashlang (har bir qator o'ng tomonidagi savat belgisi).
1 va 2-sinovlar bunga bog'liq emas — ular tanlangan fayl ustida ishlaydi.

---

## Faylni qayta yaratish

```bash
pnpm data:test
```

Generator deterministik — har safar aynan bir xil fayl chiqadi, shuning uchun
natijalarni taqqoslash mumkin. Manba kodi: `scripts/generate-test-data.ts`.
