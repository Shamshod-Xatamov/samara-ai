/**
 * Prognozlash — Holt-Winters (mavsumiy) va Holt (mavsumiysiz) modellari.
 *
 * Bu yerda AI ISHLATILMAYDI. Sabab: LLM raqamli qatorni ekstrapolyatsiya
 * qilishda ishonchsiz va natijasi takrorlanmaydi. Eksponensial silliqlash
 * esa klassik, tekshiriladigan va MAPE bilan baholanadi.
 *
 * Model tanlash:
 *  - kuzatuvlar soni ≥ 2 × mavsum uzunligi bo'lsa → Holt-Winters (additiv);
 *    kunlik ishlab chiqarish ma'lumotida haftalik tebranish kuchli
 *    (dam olish kunlari hajm keskin tushadi) va uni hisobga olmaslik
 *    MAPE'ni sun'iy ravishda oshiradi;
 *  - aks holda → oddiy Holt chiziqli trend.
 *
 * Gemini keyinroq faqat natijani o'zbek tilida izohlaydi.
 */

export type SeriesPoint = { label: string; date: string; value: number };

export type ForecastPoint = {
  label: string;
  date: string;
  /** Kuzatilgan qiymat (prognoz qismida null) */
  actual: number | null;
  /** Model qiymati (tarixiy qismda ham to'ldiriladi — moslikni ko'rsatish uchun) */
  predicted: number | null;
  lower: number | null;
  upper: number | null;
};

export type ForecastModel = "holt" | "holt-winters";

export type ForecastResult = {
  points: ForecastPoint[];
  model: ForecastModel;
  /** Mavsum uzunligi (Holt-Winters uchun), aks holda null */
  seasonLength: number | null;
  alpha: number;
  beta: number;
  gamma: number | null;
  /** O'rtacha absolyut foiz xato (backtest), % */
  mape: number | null;
  /** Ishonch darajasi: 100 − MAPE, 0–100 oralig'ida */
  confidence: number | null;
  /** Prognoz davridagi kutilayotgan o'zgarish, % */
  changePct: number | null;
  direction: "up" | "down" | "flat";
  horizon: number;
};

export type ForecastOptions = {
  /** Mavsum uzunligi; 0 yoki undefined bo'lsa mavsumiylik hisobga olinmaydi */
  seasonLength?: number;
  /** Ko'rsatkich manfiy bo'lolmasa (xarajat, hajm) — oraliq 0 da kesiladi */
  nonNegative?: boolean;
};

type Fit = {
  fitted: number[];
  residuals: number[];
  sse: number;
  /** Kelajakni bashorat qilish funksiyasi (h ≥ 1) */
  predict: (step: number) => number;
};

// --- Holt (mavsumiysiz) ---

function fitHolt(values: number[], alpha: number, beta: number): Fit {
  let level = values[0];
  let trend = values.length > 1 ? values[1] - values[0] : 0;

  const fitted: number[] = [level];
  const residuals: number[] = [];
  let sse = 0;

  for (let index = 1; index < values.length; index += 1) {
    const prediction = level + trend;
    fitted.push(prediction);

    const error = values[index] - prediction;
    residuals.push(error);
    sse += error * error;

    const previousLevel = level;
    level = alpha * values[index] + (1 - alpha) * (level + trend);
    trend = beta * (level - previousLevel) + (1 - beta) * trend;
  }

  return {
    fitted,
    residuals,
    sse,
    predict: (step) => level + step * trend,
  };
}

// --- Holt-Winters (additiv mavsumiylik) ---

function fitHoltWinters(
  values: number[],
  season: number,
  alpha: number,
  beta: number,
  gamma: number,
): Fit {
  const firstCycle = values.slice(0, season);
  const secondCycle = values.slice(season, season * 2);

  const meanOf = (list: number[]) =>
    list.reduce((total, value) => total + value, 0) / list.length;

  let level = meanOf(firstCycle);
  // Boshlang'ich trend: ikkinchi va birinchi sikl o'rtachalari farqi.
  let trend = (meanOf(secondCycle) - level) / season;
  const seasonal = firstCycle.map((value) => value - level);

  const fitted: number[] = [];
  const residuals: number[] = [];
  let sse = 0;

  for (let index = 0; index < values.length; index += 1) {
    const seasonIndex = index % season;
    const prediction = level + trend + seasonal[seasonIndex];
    fitted.push(prediction);

    // Birinchi sikl boshlang'ich qiymatlarni belgilashga ketgan —
    // uni xatoga qo'shish modelni noto'g'ri baholaydi.
    if (index >= season) {
      const error = values[index] - prediction;
      residuals.push(error);
      sse += error * error;
    }

    const previousLevel = level;
    level =
      alpha * (values[index] - seasonal[seasonIndex]) +
      (1 - alpha) * (level + trend);
    trend = beta * (level - previousLevel) + (1 - beta) * trend;
    seasonal[seasonIndex] =
      gamma * (values[index] - level) + (1 - gamma) * seasonal[seasonIndex];
  }

  const lastIndex = values.length - 1;

  return {
    fitted,
    residuals,
    sse,
    predict: (step) =>
      level + step * trend + seasonal[(lastIndex + step) % season],
  };
}

// --- Parametrlarni tanlash ---

function optimiseHolt(values: number[]) {
  let best = { alpha: 0.3, beta: 0.1, sse: Number.POSITIVE_INFINITY };

  for (let alpha = 0.05; alpha <= 0.95; alpha += 0.05) {
    for (let beta = 0.02; beta <= 0.6; beta += 0.02) {
      const { sse } = fitHolt(values, alpha, beta);
      if (sse < best.sse) best = { alpha, beta, sse };
    }
  }

  return { alpha: best.alpha, beta: best.beta };
}

function optimiseHoltWinters(values: number[], season: number) {
  let best = {
    alpha: 0.3,
    beta: 0.1,
    gamma: 0.2,
    sse: Number.POSITIVE_INFINITY,
  };

  for (let alpha = 0.05; alpha <= 0.95; alpha += 0.1) {
    for (let beta = 0.02; beta <= 0.4; beta += 0.06) {
      for (let gamma = 0.05; gamma <= 0.65; gamma += 0.1) {
        const { sse } = fitHoltWinters(values, season, alpha, beta, gamma);
        if (sse < best.sse) best = { alpha, beta, gamma, sse };
      }
    }
  }

  return { alpha: best.alpha, beta: best.beta, gamma: best.gamma };
}

function meanAbsolutePercentageError(actual: number[], predicted: number[]) {
  let total = 0;
  let count = 0;

  for (let index = 0; index < actual.length; index += 1) {
    if (actual[index] === 0) continue;
    total += Math.abs((actual[index] - predicted[index]) / actual[index]);
    count += 1;
  }

  return count > 0 ? (total / count) * 100 : null;
}

/**
 * Backtest: model faqat oldingi qism bo'yicha o'qitiladi va yashirilgan
 * oxirgi 20% ni bashorat qiladi. Bu MAPE'ni haqiqiy prognoz sifatida
 * baholaydi — o'zini o'zi tekshirish emas.
 */
function backtest(values: number[], season: number | null) {
  const holdout = Math.max(2, Math.round(values.length * 0.2));
  const trainSize = values.length - holdout;

  const minimumTrain = season ? season * 2 : 4;
  if (trainSize < minimumTrain) return null;

  const train = values.slice(0, trainSize);
  const test = values.slice(trainSize);

  const fit = season
    ? (() => {
        const params = optimiseHoltWinters(train, season);
        return fitHoltWinters(train, season, params.alpha, params.beta, params.gamma);
      })()
    : (() => {
        const params = optimiseHolt(train);
        return fitHolt(train, params.alpha, params.beta);
      })();

  const predicted = test.map((_, index) => fit.predict(index + 1));

  return meanAbsolutePercentageError(test, predicted);
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 86_400_000);
}

const MONTH_LABELS = [
  "yan", "fev", "mar", "apr", "may", "iyun",
  "iyul", "avg", "sen", "okt", "noy", "dek",
];

function labelFor(date: Date) {
  return `${date.getUTCDate()}-${MONTH_LABELS[date.getUTCMonth()]}`;
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

export function forecastSeries(
  series: SeriesPoint[],
  horizon: number,
  options: ForecastOptions = {},
): ForecastResult | null {
  const values = series.map((point) => point.value);

  if (values.length < 6) return null;

  const requestedSeason = options.seasonLength ?? 0;
  // Mavsumiy model uchun kamida ikkita to'liq sikl kerak.
  const season =
    requestedSeason >= 2 && values.length >= requestedSeason * 2
      ? requestedSeason
      : null;

  let fit: Fit;
  let alpha: number;
  let beta: number;
  let gamma: number | null = null;

  if (season) {
    const params = optimiseHoltWinters(values, season);
    alpha = params.alpha;
    beta = params.beta;
    gamma = params.gamma;
    fit = fitHoltWinters(values, season, alpha, beta, gamma);
  } else {
    const params = optimiseHolt(values);
    alpha = params.alpha;
    beta = params.beta;
    fit = fitHolt(values, alpha, beta);
  }

  // Qoldiqlar standart og'ishi — ishonch oralig'i shundan chiqadi.
  const residualMean =
    fit.residuals.reduce((total, value) => total + value, 0) /
    Math.max(1, fit.residuals.length);
  const variance =
    fit.residuals.reduce((total, value) => total + (value - residualMean) ** 2, 0) /
    Math.max(1, fit.residuals.length);
  const sigma = Math.sqrt(variance);

  const historical: ForecastPoint[] = series.map((point, index) => ({
    label: point.label,
    date: point.date,
    actual: point.value,
    predicted: round(fit.fitted[index]),
    lower: null,
    upper: null,
  }));

  const lastDate = new Date(`${series[series.length - 1].date}T00:00:00Z`);
  const future: ForecastPoint[] = [];

  for (let step = 1; step <= horizon; step += 1) {
    const prediction = fit.predict(step);
    // Kengayuvchi oraliq: noaniqlik gorizont bilan √h tezligida o'sadi.
    const margin = 1.96 * sigma * Math.sqrt(step);
    const date = addDays(lastDate, step);

    const lower = prediction - margin;

    future.push({
      label: labelFor(date),
      date: date.toISOString().slice(0, 10),
      actual: null,
      predicted: round(prediction),
      // Xarajat yoki hajm manfiy bo'lolmaydi — oraliq nolda kesiladi.
      lower: round(options.nonNegative ? Math.max(0, lower) : lower),
      upper: round(prediction + margin),
    });
  }

  // Tarixiy va prognoz qismini uzluksiz chizish uchun oxirgi nuqta ulanadi.
  if (historical.length > 0) {
    const last = historical[historical.length - 1];
    last.lower = last.predicted;
    last.upper = last.predicted;
  }

  const mape = backtest(values, season);
  const lastActual = values[values.length - 1];
  const lastForecast = future[future.length - 1]?.predicted ?? lastActual;
  const changePct =
    lastActual !== 0 ? ((lastForecast - lastActual) / Math.abs(lastActual)) * 100 : null;

  return {
    points: [...historical, ...future],
    model: season ? "holt-winters" : "holt",
    seasonLength: season,
    alpha: Math.round(alpha * 100) / 100,
    beta: Math.round(beta * 100) / 100,
    gamma: gamma === null ? null : Math.round(gamma * 100) / 100,
    mape: mape === null ? null : Math.round(mape * 10) / 10,
    confidence:
      mape === null ? null : Math.round(Math.max(0, Math.min(100, 100 - mape)) * 10) / 10,
    changePct: changePct === null ? null : Math.round(changePct * 10) / 10,
    direction:
      changePct === null || Math.abs(changePct) < 1
        ? "flat"
        : changePct > 0
          ? "up"
          : "down",
    horizon,
  };
}
