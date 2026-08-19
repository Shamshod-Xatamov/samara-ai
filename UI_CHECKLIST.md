# Samara AI — UI yakunlash checklisti

Har bir yangi sahifa yoki katta UI o'zgarishidan keyin quyidagi bandlar tekshiriladi.

## Navigatsiya

- Foydalanuvchi kirgan oqimidan ortga yoki bosh sahifaga qayta oladi.
- Logo va breadcrumb kerakli sahifaga olib boradi.
- Tugma va linklarning hech biri action'siz qolmaydi.
- Aktiv navigatsiya holati joriy route bilan mos keladi.

## Holatlar

- Formada validatsiya, loading va xato holati mavjud.
- Ma'lumotli komponentlarda loading, empty va error holatlari rejalashtirilgan.
- Demo va haqiqiy ma'lumot bir-biridan aniq ajratiladi.
- Read-only preview'da pointer va keyboard interaction yopiladi.

## Responsive va accessibility

- 320 px, 390 px, tablet va desktop o'lchamlarda horizontal overflow yo'q.
- Klaviatura focus holatlari ko'rinadi.
- Ikonka-only tugmalarda `aria-label` mavjud.
- Sarlavha iyerarxiyasi va matn kontrasti saqlanadi.

## Yakuniy tekshiruv

- Browser console'da error yo'q.
- Asosiy foydalanuvchi oqimi brauzerda bosib tekshirilgan.
- `npm run lint`, `npm run build` va `git diff --check` xatosiz o'tgan.
- Desktop va mobile screenshot vizual auditdan o'tgan.
