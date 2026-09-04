# Sinov fayli 2 — `sinov-zavod-2026.xlsx`

604 qator · 10 ustun · 2026-fevral — 2026-avgust

Bu fayl birinchi sinov faylidan (`sinov-korxona-2026.xlsx`) butunlay boshqacha:
ustun nomlari **ruscha transliteratsiyada** (O'zbekiston korxonalarida keng
tarqalgan holat) va o'lchov birliklari ham boshqa.

---

## Nima sinaladi

| Fayldagi ustun | Birligi | To'g'ri javob | Koeffitsient |
| --- | --- | --- | --- |
| `data_otcheta` | — | sana | 1 |
| `uchastok` | — | bo'lim | 1 |
| `product_code` | — | mahsulot / jarayon | 1 |
| `vypusk_sht` | dona | hajm | 1 |
| **`vyruchka_ming_som`** | **ming so'm** | daromad | **0.001** |
| **`sebestoimost_ming_som`** | **ming so'm** | xarajat | **0.001** |
| `trudozatraty_chas` | soat | mehnat vaqti | 1 |
| `brak_sht` | dona | xatolar soni | 1 |
| `takt_vremya_sek` | soniya | qayta ishlash vaqti | 1 |
| **`avtomatizatsiya_dolya`** | **ulush (0–1)** | avtomatlashtirish | **100** |

### Qiyin joylari

**1. Ruscha nomlar.** `vyruchka` (tushum), `sebestoimost` (tannarx),
`trudozatraty` (mehnat sarfi), `takt vremya` (sikl vaqti), `brak` (nuqson) —
bularning hech biri kalit so'zlar ro'yxatida yo'q.

**2. Ming so'm.** Qiymatlar `1099.886` ko'rinishida — bu 1 099 886 so'm, ya'ni
`1.099886` mln so'm. AI 1000 ga bo'lishi kerakligini namuna qiymatlar
diapazonidan tushunishi kerak.

**3. Ulush, foiz emas.** `avtomatizatsiya_dolya` da `0.524` yozilgan — bu 52.4%.
Kanonik birlik foiz bo'lgani uchun **100 ga ko'paytirish** kerak. Bu birinchi
faylda yo'q edi: u yerda hamma konversiya kichraytirish edi, bu yerda esa
kattalashtirish.

**4. `takt_vremya_sek` allaqachon soniyada** — koeffitsient 1. AI "sek" so'ziga
qarab keraksiz konversiya qilib yubormasligi kerak.

---

## Kiritilgan nuqsonlar

| Nuqson | Soni |
| --- | --- |
| Bo'sh kataklar | 73 |
| Format xatolari (`"1099,886"` ko'rinishida) | 83 |
| Dublikat qatorlar | 4 |
| Outlier qiymatlar | 24 |

Tozalashdan keyin sifat balli sezilarli oshishi kerak.

---

## Ataylab joylashtirilgan anomaliyalar

| Sana | Nima qilingan |
| --- | --- |
| **2026-04-17** | Tannarx 42% ga oshirilgan |
| **2026-05-28** | Takt vaqti 70% ga oshirilgan |
| **2026-06-30** | Brak 2.8 barobar oshirilgan |
| **2026-07-22** | Mehnat vaqti 50% ga oshirilgan |

Anomaliya detektori shu sanalarni topishi kerak. Mehnat vaqti oshgan kun
unumdorlik pasayishi orqali ham aks etishi mumkin — bu normal.

---

## Sinov tartibi

1. **Ma'lumotlar** → faylni yuklang
2. **AI bilan aniqlash** → yuqoridagi jadval bilan solishtiring
3. **Qayta ishlash** → **Tozalash va qayta ishlash**
4. **AI tahlili → Anomaliyalar** → **Qayta tekshirish**
5. **Qarorlar** → **AI bilan tayyorlash**

> **Eslatma:** tahlil sahifalari eng katta tozalangan datasetni tanlaydi.
> 4 va 5-qadamdan oldin boshqa datasetlarni o'chirib qo'ying, aks holda
> anomaliyalar eski fayl bo'yicha hisoblanadi.

---

## Faylni qayta yaratish

```bash
pnpm data:test zavod      # faqat shu fayl
pnpm data:test            # ikkala sinov fayli
```

Generator deterministik — har safar aynan bir xil fayl chiqadi.
