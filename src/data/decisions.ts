export type DecisionPriority = "critical" | "high" | "medium";
export type DecisionStatus = "new" | "reviewed" | "planned";

export type DecisionFactor = {
  label: string;
  change: string;
  contribution: number;
};

export type DecisionEffect = {
  label: string;
  value: string;
  detail: string;
};

export type DecisionStep = {
  title: string;
  owner: string;
  duration: string;
};

export type DecisionRecommendation = {
  id: string;
  code: string;
  title: string;
  summary: string;
  priority: DecisionPriority;
  status: DecisionStatus;
  createdAt: string;
  source: "Monitoring" | "AI tahlili";
  sourceHref: "/monitoring" | "/ai-tahlil";
  metric: string;
  currentValue: string;
  benchmark: string;
  change: string;
  confidence: number;
  problem: string;
  factors: DecisionFactor[];
  recommendation: string;
  rationale: string;
  effects: DecisionEffect[];
  steps: DecisionStep[];
};

export const decisionRecommendations: DecisionRecommendation[] = [
  {
    id: "cost-automation",
    code: "DEC-024",
    title: "4-jarayonni avtomatlashtirish",
    summary: "Operatsion xarajatdagi 18.4% o'sishni kamaytirish uchun resurslarni qayta taqsimlash.",
    priority: "critical",
    status: "new",
    createdAt: "Bugun, 14:36",
    source: "AI tahlili",
    sourceHref: "/ai-tahlil",
    metric: "Operatsion xarajat",
    currentValue: "148.2 mln so'm",
    benchmark: "125.2 mln so'm",
    change: "+18.4%",
    confidence: 94,
    problem:
      "Operatsion xarajat ketma-ket uchta kuzatuvda kutilgan diapazondan yuqori bo'ldi. O'sishning asosiy qismi server yuklamasi va qo'lda bajarilayotgan 4-jarayonga to'g'ri kelmoqda.",
    factors: [
      { label: "Server yuklamasi", change: "+23%", contribution: 48 },
      { label: "Qayta ishlash kechikishi", change: "+14%", contribution: 32 },
      { label: "Qo'lda bajariladigan amallar", change: "+11%", contribution: 20 },
    ],
    recommendation:
      "4-jarayonning takroriy amallarini avtomatlashtiring va yuqori yuklama vaqtida hisoblash resurslarini 2- hamda 3-worker orasida qayta taqsimlang.",
    rationale:
      "What-if tahlilida avtomatlashtirish darajasini 60% dan 80% gacha oshirish xarajat va vaqt bo'yicha eng muvozanatli natijani ko'rsatdi.",
    effects: [
      { label: "Xarajat kamayishi", value: "7–9%", detail: "8.4–10.8 mln so'm / oy" },
      { label: "Qayta ishlash vaqti", value: "−12%", detail: "o'rtacha 1.09 soniya" },
      { label: "Unumdorlik", value: "+8%", detail: "oylik natijaga ta'sir" },
    ],
    steps: [
      { title: "4-jarayon amallarini xaritalash", owner: "Operatsiyalar", duration: "1 kun" },
      { title: "Worker yuklamasini qayta sozlash", owner: "IT bo'limi", duration: "4 soat" },
      { title: "Natijani 7 kun monitoring qilish", owner: "Analitika", duration: "7 kun" },
    ],
  },
  {
    id: "latency-batching",
    code: "DEC-023",
    title: "Yozuvlarni paketlab qayta ishlash",
    summary: "500 ms chegarasidan oshgan kechikishni navbat optimizatsiyasi orqali pasaytirish.",
    priority: "high",
    status: "new",
    createdAt: "Bugun, 12:22",
    source: "Monitoring",
    sourceHref: "/monitoring",
    metric: "Qayta ishlash kechikishi",
    currentValue: "620 ms",
    benchmark: "≤ 500 ms",
    change: "+24.0%",
    confidence: 91,
    problem:
      "Yuqori yuklama oynasida so'rovlar navbati uzayib, kechikish belgilangan chegaradan oshdi. Holat bir xil endpointlarda takrorlanmoqda.",
    factors: [
      { label: "So'rovlar navbati", change: "+31%", contribution: 44 },
      { label: "API javob vaqti", change: "+19%", contribution: 36 },
      { label: "Tarmoq kechikishi", change: "+8%", contribution: 20 },
    ],
    recommendation:
      "Yozuvlarni kichik paketlarda qayta ishlashni yoqing, sekin endpointlarni profiling qiling va navbat uchun 450 ms ogohlantirish chegarasini belgilang.",
    rationale:
      "So'nggi 7 kunlik oqimda paketlash faol bo'lgan davrlarda o'rtacha kechikish 16–20% past bo'lgan.",
    effects: [
      { label: "Kechikish", value: "−18%", detail: "taxminan 508 ms" },
      { label: "Tejalgan vaqt", value: "+16 soat", detail: "haftasiga" },
      { label: "Xato ulushi", value: "−0.3%", detail: "navbat uzilishlari" },
    ],
    steps: [
      { title: "Batch hajmini 250 yozuvga sozlash", owner: "IT bo'limi", duration: "2 soat" },
      { title: "Sekin endpointlarni profiling qilish", owner: "Backend", duration: "1 kun" },
      { title: "Latency chegarasini yangilash", owner: "Analitika", duration: "30 daq" },
    ],
  },
  {
    id: "model-validation",
    code: "DEC-022",
    title: "Modelni yangi dataset bilan tekshirish",
    summary: "Aniqlikdagi 4.2% og'ishni yangi tozalangan ma'lumotlar bilan validatsiya qilish.",
    priority: "high",
    status: "reviewed",
    createdAt: "Kecha, 17:52",
    source: "AI tahlili",
    sourceHref: "/ai-tahlil",
    metric: "AI aniqligi",
    currentValue: "90.5%",
    benchmark: "≥ 92.0%",
    change: "−4.2%",
    confidence: 89,
    problem:
      "Yangi yuklangan dataset taqsimoti o'quv ma'lumotlaridan farq qilgani sababli model aniqligi maqsad ko'rsatkichidan pastga tushdi.",
    factors: [
      { label: "Ma'lumot siljishi", change: "+12%", contribution: 55 },
      { label: "Yangi kategoriyalar", change: "+7 tur", contribution: 27 },
      { label: "Bo'sh qiymatlar", change: "+2.1%", contribution: 18 },
    ],
    recommendation:
      "Modelni yangi tozalangan dataset bilan qayta validatsiya qiling. Aniqlik 92% dan past qolsa, nazoratli qayta o'qitishni boshlang.",
    rationale:
      "Og'ish model arxitekturasidan emas, yangi ma'lumot taqsimotidan kelib chiqayotganiga 89% ishonch mavjud.",
    effects: [
      { label: "AI aniqligi", value: "+3–5%", detail: "kutilayotgan tiklanish" },
      { label: "Noto'g'ri signal", value: "−38%", detail: "haftalik alertlar" },
      { label: "Xato qiymati", value: "−4.2 mln", detail: "oyiga" },
    ],
    steps: [
      { title: "Dataset drift hisobotini tasdiqlash", owner: "Data science", duration: "2 soat" },
      { title: "Modelni qayta validatsiya qilish", owner: "ML muhandis", duration: "1 kun" },
      { title: "A/B natijalarni solishtirish", owner: "Analitika", duration: "2 kun" },
    ],
  },
  {
    id: "report-automation",
    code: "DEC-021",
    title: "Haftalik hisobotni avtomatlashtirish",
    summary: "Takroriy hisobot amallarini avtomatlashtirib, qo'lda bajariladigan ishni qisqartirish.",
    priority: "medium",
    status: "planned",
    createdAt: "18-avg, 16:10",
    source: "AI tahlili",
    sourceHref: "/ai-tahlil",
    metric: "Qo'lda bajariladigan vaqt",
    currentValue: "6.8 soat / hafta",
    benchmark: "≤ 1.5 soat",
    change: "+5.3 soat",
    confidence: 96,
    problem:
      "Haftalik hisobotni yig'ish va formatlashda bir xil amallar muntazam takrorlanmoqda. Jarayonning 78% qismi avtomatlashtirilishi mumkin.",
    factors: [
      { label: "Ma'lumot yig'ish", change: "3.2 soat", contribution: 47 },
      { label: "Formatlash", change: "2.1 soat", contribution: 31 },
      { label: "Tekshirish", change: "1.5 soat", contribution: 22 },
    ],
    recommendation:
      "Tasdiqlangan shablon asosida haftalik hisobot generatsiyasini rejalashtiring va faqat istisno holatlarni qo'lda tekshiring.",
    rationale:
      "Jarayonda ma'lumot manbasi va format barqaror; avtomatlashtirish uchun qo'shimcha integratsiya talab qilinmaydi.",
    effects: [
      { label: "Tejalgan vaqt", value: "5.4 soat", detail: "haftasiga" },
      { label: "Unumdorlik", value: "+4.2%", detail: "analitika bo'limi" },
      { label: "Xatolar", value: "−62%", detail: "format xatolari" },
    ],
    steps: [
      { title: "Hisobot shablonini tasdiqlash", owner: "Analitika", duration: "2 soat" },
      { title: "Generatsiya jadvalini sozlash", owner: "IT bo'limi", duration: "3 soat" },
      { title: "Birinchi hisobotni tekshirish", owner: "Rahbariyat", duration: "30 daq" },
    ],
  },
  {
    id: "volume-observation",
    code: "DEC-020",
    title: "Ma'lumot hajmini kuzatishda davom etish",
    summary: "Yangi oqim patterni hozircha sifatga ta'sir qilmagan; infratuzilma o'zgarishi shart emas.",
    priority: "medium",
    status: "reviewed",
    createdAt: "18-avg, 09:18",
    source: "Monitoring",
    sourceHref: "/monitoring",
    metric: "Ma'lumot hajmi",
    currentValue: "14 020 yozuv",
    benchmark: "12 450 yozuv",
    change: "+12.6%",
    confidence: 87,
    problem:
      "Ma'lumotlar hajmi odatiy diapazondan oshdi, ammo qayta ishlash sifati, tezligi va xato darajasida salbiy ta'sir aniqlanmadi.",
    factors: [
      { label: "Yangi ma'lumot manbasi", change: "+980", contribution: 62 },
      { label: "Faollik o'sishi", change: "+410", contribution: 25 },
      { label: "Takroriy yozuvlar", change: "+180", contribution: 13 },
    ],
    recommendation:
      "Hajm o'sishini 14 kun davomida kuzating. Latency 500 ms yoki navbat 35% dan oshmaguncha infratuzilmani kengaytirmang.",
    rationale:
      "Joriy resurs yuklamasi xavfsiz diapazonda va qo'shimcha quvvat xarajati hozircha iqtisodiy asoslanmagan.",
    effects: [
      { label: "Ortiqcha xarajat", value: "0 so'm", detail: "erta scaling oldi olinadi" },
      { label: "Kuzatuv davri", value: "14 kun", detail: "avtomatik monitoring" },
      { label: "Risk", value: "Past", detail: "joriy yuklamada" },
    ],
    steps: [
      { title: "Hajm alertini 15 000 ga sozlash", owner: "Analitika", duration: "20 daq" },
      { title: "Latency va navbatni birga kuzatish", owner: "IT bo'limi", duration: "14 kun" },
      { title: "Davr yakunida qayta baholash", owner: "Rahbariyat", duration: "1 soat" },
    ],
  },
];
