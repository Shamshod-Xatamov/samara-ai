import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  Check,
  CircleDollarSign,
  Database,
  FileChartColumn,
  Gauge,
  Lightbulb,
  Radio,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

import { BrandMark } from "@/components/brand/brand-mark";

const modules = [
  {
    icon: Database,
    title: "Ma'lumotlar markazi",
    description:
      "CSV va XLSX fayllarni yuklang, ma'lumot sifatini tekshiring va barcha manbalarni yagona joyda boshqaring.",
  },
  {
    icon: BrainCircuit,
    title: "AI tahlili",
    description:
      "Prognozlar, anomaliyalar va muhim o'zgarishlarni AI yordamida tez aniqlang.",
  },
  {
    icon: CircleDollarSign,
    title: "Iqtisodiy samaradorlik",
    description:
      "ROI, tejalgan xarajat, vaqt va unumdorlikni tushunarli biznes ko'rsatkichlariga aylantiring.",
  },
  {
    icon: Radio,
    title: "Real vaqt monitoringi",
    description:
      "Jarayonlar holati, kechikish va kritik chegaralarni real vaqtga yaqin rejimda kuzating.",
  },
  {
    icon: Lightbulb,
    title: "Qarorlar markazi",
    description:
      "Muammo sababi, tavsiya qilingan harakat va kutilayotgan iqtisodiy ta'sirni birga ko'ring.",
  },
  {
    icon: FileChartColumn,
    title: "Aqlli hisobotlar",
    description:
      "Kunlik, haftalik va oylik natijalarni rahbariyat uchun tayyor formatda shakllantiring.",
  },
] as const;

const outcomes = [
  { value: "86.4%", label: "Samaradorlik indeksi" },
  { value: "−12.4%", label: "Operatsion xarajat" },
  { value: "94.7%", label: "AI aniqligi" },
  { value: "31.8%", label: "Investitsiya qaytimi" },
] as const;

const processSteps = [
  {
    number: "01",
    title: "Ma'lumotni ulang",
    description: "Fayl yoki mavjud tizimlardan keladigan ma'lumotlarni bir joyga jamlang.",
  },
  {
    number: "02",
    title: "AI bilan tahlil qiling",
    description: "Platforma o'zgarishlar, anomaliyalar va iqtisodiy ta'sirni aniqlaydi.",
  },
  {
    number: "03",
    title: "Aniq qaror qabul qiling",
    description: "Muhim KPI va tavsiyalar asosida eng samarali harakatni tanlang.",
  },
] as const;

function ProductPreview() {
  return (
    <figure className="relative mx-auto w-full max-w-[660px] lg:ml-auto">
      <div
        className="absolute -inset-8 -z-10 rounded-[3rem] bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative rounded-[1.15rem] border border-foreground/80 bg-foreground p-[6px] shadow-floating sm:rounded-[1.4rem] sm:p-[9px]">
        <span
          className="absolute left-1/2 top-[3px] z-20 size-1 -translate-x-1/2 rounded-full bg-faint/60 sm:top-1 sm:size-1.5"
          aria-hidden="true"
        />

        <div className="relative aspect-[16/10] overflow-hidden rounded-[0.8rem] bg-background ring-1 ring-white/10 sm:rounded-[0.95rem]">
          <iframe
            src="/dashboard?preview=landing"
            title="Samara AI boshqaruv panelining faqat ko'rish uchun namoyishi"
            tabIndex={-1}
            scrolling="no"
            className="pointer-events-none absolute left-0 top-0 h-[416.667%] w-[416.667%] origin-top-left scale-[0.24] border-0 sm:h-[238.095%] sm:w-[238.095%] sm:scale-[0.42]"
          />
          <span className="absolute inset-0 z-10" aria-hidden="true" />
        </div>
      </div>

      <div className="relative mx-auto h-3 w-[94%] rounded-b-[65%] border-x border-b border-border-strong bg-surface shadow-[0_10px_18px_rgb(23_32_51_/_0.12)] sm:h-4">
        <span
          className="absolute left-1/2 top-0 h-1.5 w-16 -translate-x-1/2 rounded-b-md bg-border sm:w-24"
          aria-hidden="true"
        />
      </div>

      <figcaption className="mt-5 flex items-center justify-center gap-2 text-[10px] font-bold text-muted">
        <span className="relative flex size-2" aria-hidden="true">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-30" />
          <span className="relative inline-flex size-2 rounded-full bg-success" />
        </span>
        Platformaning jonli, faqat ko&apos;rish uchun namoyishi
      </figcaption>
    </figure>
  );
}

export function LandingPage() {
  return (
    <main className="min-h-svh overflow-hidden bg-surface text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-surface/90 backdrop-blur-xl">
        <nav
          className="mx-auto flex h-[4.5rem] w-full max-w-7xl items-center justify-between px-5 sm:px-7 lg:px-10"
          aria-label="Asosiy navigatsiya"
        >
          <Link href="/" aria-label="Samara AI bosh sahifasi">
            <BrandMark showSubtitle={false} />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a className="text-xs font-semibold text-muted-strong transition-colors hover:text-foreground" href="#imkoniyatlar">
              Imkoniyatlar
            </a>
            <a className="text-xs font-semibold text-muted-strong transition-colors hover:text-foreground" href="#platforma">
              Platforma
            </a>
            <a className="text-xs font-semibold text-muted-strong transition-colors hover:text-foreground" href="#natijalar">
              Natijalar
            </a>
          </div>

          <Link
            href="/kirish"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-xs font-bold text-white shadow-sm transition-[background-color,transform] hover:bg-primary-hover active:translate-y-px"
          >
            Tizimga kirish
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </nav>
      </header>

      <section className="relative border-b border-border bg-canvas">
        <div
          className="pointer-events-none absolute left-1/2 top-[-20rem] size-[42rem] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-5 py-16 sm:px-7 sm:py-20 lg:grid-cols-[0.86fr_1.14fr] lg:px-10 lg:py-24 xl:gap-20 xl:py-28">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary-soft px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-primary">
              <Sparkles className="size-3.5" aria-hidden="true" />
              AI asosidagi iqtisodiy intellekt
            </div>

            <h1 className="mt-6 text-[2.65rem] font-extrabold leading-[1.08] tracking-[-0.055em] text-foreground sm:text-5xl lg:text-[3.45rem]">
              Ma&apos;lumotni aniq iqtisodiy natijaga aylantiring.
            </h1>

            <p className="mt-6 max-w-lg text-[15px] leading-7 text-muted-strong sm:text-base sm:leading-8">
              Samara AI korxona jarayonlarini real vaqtga yaqin kuzatadi, AI yordamida tahlil qiladi va rahbariyat uchun tushunarli qarorlarga aylantiradi.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/kirish"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-bold text-white shadow-sm transition-[background-color,transform,box-shadow] hover:bg-primary-hover hover:shadow-md active:translate-y-px"
              >
                Platformani ko&apos;rish
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <a
                href="#imkoniyatlar"
                className="inline-flex h-12 items-center justify-center rounded-md border border-border-strong bg-surface px-6 text-sm font-bold text-foreground shadow-sm transition-colors hover:bg-surface-muted"
              >
                Imkoniyatlar bilan tanishish
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
              {["Yagona boshqaruv oynasi", "Real vaqt monitoringi", "AI tavsiyalari"].map((item) => (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted" key={item}>
                  <Check className="size-3.5 text-success" strokeWidth={2.5} aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <ProductPreview />
        </div>
      </section>

      <section id="natijalar" className="border-b border-border bg-surface">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 px-5 py-8 sm:px-7 md:grid-cols-4 lg:px-10">
          {outcomes.map((outcome, index) => (
            <div
              className={`px-3 py-4 sm:px-6 ${index % 2 ? "border-l border-border" : ""} ${
                index > 1 ? "border-t border-border md:border-t-0" : ""
              } ${index === 2 ? "md:border-l" : ""}`}
              key={outcome.label}
            >
              <p className="font-mono text-xl font-bold tracking-[-0.04em] text-foreground sm:text-2xl">
                {outcome.value}
              </p>
              <p className="mt-1 text-[10px] font-semibold text-muted sm:text-xs">{outcome.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="imkoniyatlar" className="bg-surface py-20 sm:py-24">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-7 lg:px-10">
          <div className="max-w-2xl">
            <p className="ui-label text-primary">Platforma imkoniyatlari</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-foreground sm:text-4xl">
              Bitta tizim. To&apos;liq nazorat.
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-strong sm:text-base">
              Ma&apos;lumotni qabul qilishdan boshlab iqtisodiy natijani o&apos;lchashgacha bo&apos;lgan butun jarayon yagona muhitda.
            </p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module, index) => {
              const Icon = module.icon;

              return (
                <article className="group bg-surface p-6 transition-colors hover:bg-canvas sm:p-7" key={module.title}>
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-md bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <Icon className="size-[18px]" strokeWidth={1.9} aria-hidden="true" />
                    </span>
                    <span className="font-mono text-[10px] font-bold text-faint">0{index + 1}</span>
                  </div>
                  <h3 className="mt-6 text-base font-bold tracking-[-0.02em] text-foreground">{module.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-muted">{module.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="platforma" className="border-y border-border bg-canvas py-20 sm:py-24">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-5 sm:px-7 lg:grid-cols-2 lg:px-10 xl:gap-24">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-card sm:p-7">
            <div className="flex items-center justify-between border-b border-border pb-5">
              <div>
                <p className="ui-label text-faint">AI tavsiyasi</p>
                <h3 className="mt-1.5 text-lg font-bold tracking-[-0.025em] text-foreground">
                  Resurs taqsimotini optimallashtiring
                </h3>
              </div>
              <span className="grid size-10 place-items-center rounded-lg bg-primary text-white">
                <BrainCircuit className="size-[18px]" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-5 text-sm leading-7 text-muted">
              Qayta ishlash liniyasida takroriy yuklama aniqlandi. Ish oqimini avtomatlashtirish orqali haftasiga 5.4 soat tejash mumkin.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                ["5.4 soat", "Vaqt tejalishi"],
                ["+4.2%", "Unumdorlik"],
                ["2.6 mln", "Xarajat ta'siri"],
              ].map(([value, label]) => (
                <div className="rounded-md bg-surface-muted p-3" key={label}>
                  <p className="font-mono text-sm font-bold text-foreground">{value}</p>
                  <p className="mt-1 text-[9px] leading-4 text-muted">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-md border border-success/15 bg-success-soft px-3 py-2.5 text-[10px] font-bold text-success">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Tavsiya 94.7% aniqlik bilan shakllantirildi
            </div>
          </div>

          <div>
            <p className="ui-label text-primary">Qarordan oldingi aniqlik</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-foreground sm:text-4xl">
              Faqat raqamlar emas, keyingi eng yaxshi harakat.
            </h2>
            <p className="mt-5 text-sm leading-7 text-muted-strong sm:text-base">
              Samara AI texnik ko&apos;rsatkichlarni biznes tiliga tarjima qiladi: nima o&apos;zgardi, nima sabab bo&apos;ldi va qanday qaror ko&apos;proq samara beradi.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-accent-soft text-accent">
                  <Gauge className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Taqqoslanadigan natija</h3>
                  <p className="mt-1 text-xs leading-5 text-muted">AI joriy etilishidan oldin va keyingi holat.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary-soft text-primary">
                  <Workflow className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Amaliy tavsiyalar</h3>
                  <p className="mt-1 text-xs leading-5 text-muted">Kutilayotgan ta&apos;sir bilan ustuvor harakatlar.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-7 lg:px-10">
          <div className="text-center">
            <p className="ui-label text-primary">Qanday ishlaydi</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-foreground sm:text-4xl">
              Ma&apos;lumotdan qarorgacha uch qadam.
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-0">
            {processSteps.map((step, index) => (
              <article
                className={`relative px-1 md:px-8 ${index > 0 ? "md:border-l md:border-border" : ""}`}
                key={step.number}
              >
                <span className="font-mono text-xs font-bold text-primary">{step.number}</span>
                <h3 className="mt-4 text-lg font-bold tracking-[-0.025em] text-foreground">{step.title}</h3>
                <p className="mt-2 text-xs leading-6 text-muted">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-7 sm:pb-24 lg:px-10">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-xl bg-foreground px-6 py-12 text-center sm:px-10 sm:py-16">
          <div className="absolute left-1/2 top-0 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary-soft">
              <Activity className="size-3.5" aria-hidden="true" />
              Samara AI platformasi
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-white sm:text-4xl">
              Samaradorlikni taxmin qilmang. Uni o&apos;lchang.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-faint">
              Asosiy ko&apos;rsatkichlar, AI tahlili va iqtisodiy natijalarni bitta professional boshqaruv platformasida ko&apos;ring.
            </p>
            <Link
              href="/kirish"
              className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-6 text-sm font-bold text-foreground shadow-sm transition-colors hover:bg-surface-muted"
            >
              Tizimga kirish
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-canvas">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-10">
          <BrandMark />
          <p className="text-[10px] font-medium text-muted">
            © 2026 Samara AI. Iqtisodiy intellekt platformasi.
          </p>
        </div>
      </footer>
    </main>
  );
}
