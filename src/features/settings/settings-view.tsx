"use client";

import {
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Gauge,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Mail,
  MonitorCheck,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { defaultSettings, SETTINGS_UPDATED_EVENT } from "@/data/settings";
import { logout } from "@/services/auth";
import {
  getSettings,
  saveSettings,
  type SettingsPayload,
} from "@/services/settings";

/** Sozlamalar to'liq shakli — profil, tashkilot, chegaralar va iqtisod. */
type AppSettings = SettingsPayload;

type SettingsTab =
  | "profile"
  | "organization"
  | "economics"
  | "thresholds"
  | "notifications";

const settingsTabs: Array<{
  key: SettingsTab;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    key: "profile",
    label: "Profil",
    description: "Shaxsiy ma'lumotlar",
    icon: UserRound,
  },
  {
    key: "organization",
    label: "Tashkilot",
    description: "Ish muhiti parametrlari",
    icon: Building2,
  },
  {
    key: "economics",
    label: "Iqtisodiy hisob",
    description: "ROI va EES parametrlari",
    icon: Gauge,
  },
  {
    key: "thresholds",
    label: "Monitoring chegaralari",
    description: "Alert va ogohlantirishlar",
    icon: SlidersHorizontal,
  },
  {
    key: "notifications",
    label: "Bildirishnomalar",
    description: "Kanal va xabar turlari",
    icon: Bell,
  },
];

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "AK"
  );
}

function FormField({
  label,
  hint,
  value,
  type = "text",
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  type?: "text" | "email";
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-muted-strong">{label}</span>
      {hint && <span className="ml-2 text-[11px] font-medium text-faint">{hint}</span>}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-lg border border-border bg-surface px-3 text-[13px] font-medium text-foreground shadow-sm outline-none transition-colors placeholder:text-faint hover:border-border-strong focus:border-primary focus:ring-2 focus:ring-primary/10"
      />
    </label>
  );
}

function ReadOnlyField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div>
      <p className="text-xs font-bold text-muted-strong">{label}</p>
      <div className="mt-2 flex h-10 items-center gap-2.5 rounded-lg border border-border bg-surface-muted/60 px-3">
        <Icon className="size-4 shrink-0 text-faint" strokeWidth={1.9} aria-hidden="true" />
        <span className="truncate text-[13px] font-semibold text-muted">{value}</span>
        <LockKeyhole className="ml-auto size-3.5 shrink-0 text-faint" aria-label="O'zgarmas maydon" />
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
          <Icon className="size-[1.1rem]" strokeWidth={1.9} aria-hidden="true" />
        </span>
        <div>
          <p className="ui-label text-primary">{eyebrow}</p>
          <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
        </div>
      </div>
      {action && <div className="shrink-0 self-start">{action}</div>}
    </header>
  );
}

function ProfileSettings({
  settings,
  onChange,
}: {
  settings: AppSettings;
  onChange: (profile: AppSettings["profile"]) => void;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      <SectionHeader
        eyebrow="Hisob ma'lumotlari"
        title="Profil sozlamalari"
        description="Platformada ko'rinadigan ism va aloqa ma'lumotlarini boshqaring."
        icon={CircleUserRound}
      />

      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-muted/45 p-4 sm:flex-row sm:items-center">
          <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-primary font-mono text-base font-bold text-white shadow-sm">
            {getInitials(settings.profile.fullName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">{settings.profile.fullName}</p>
            <p className="mt-1 truncate text-xs text-muted">{settings.profile.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">
                {settings.profile.role}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-success">
                <span className="size-1.5 rounded-full bg-success" /> Faol hisob
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-surface px-2.5 py-1.5 text-[11px] font-semibold text-muted ring-1 ring-border">
            <ShieldCheck className="size-3.5 text-success" aria-hidden="true" />
            Himoyalangan sessiya
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <FormField
            label="To'liq ism"
            value={settings.profile.fullName}
            onChange={(fullName) => onChange({ ...settings.profile, fullName })}
          />
          <FormField
            label="Platforma tili"
            value={settings.profile.language}
            onChange={(language) => onChange({ ...settings.profile, language })}
          />
          <ReadOnlyField label="Email manzil" value={settings.profile.email} icon={Mail} />
          <ReadOnlyField label="Foydalanuvchi roli" value={settings.profile.role} icon={ShieldCheck} />
        </div>

        <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-info/15 bg-info-soft px-3.5 py-3 text-xs leading-5 text-info">
          <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Email manzil kritik alertlar va avtomatik hisobotlarni yuborish uchun ishlatiladi.
        </div>
      </div>
    </section>
  );
}

function OrganizationSettings({
  settings,
  onChange,
}: {
  settings: AppSettings;
  onChange: (organization: AppSettings["organization"]) => void;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      <SectionHeader
        eyebrow="Ish muhiti"
        title="Tashkilot sozlamalari"
        description="Hisobotlar va platforma navigatsiyasida ishlatiladigan tashkilot ma'lumotlari."
        icon={Building2}
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-bold text-success">
            <CheckCircle2 className="size-3" aria-hidden="true" /> Demo faol
          </span>
        }
      />

      <div className="p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Tashkilot nomi"
            value={settings.organization.name}
            onChange={(name) => onChange({ ...settings.organization, name })}
          />
          <FormField
            label="Faoliyat sohasi"
            value={settings.organization.sector}
            onChange={(sector) => onChange({ ...settings.organization, sector })}
          />
          <ReadOnlyField label="Vaqt mintaqasi" value={settings.organization.timezone} icon={MonitorCheck} />
          <ReadOnlyField label="Asosiy valyuta" value={settings.organization.currency} icon={Gauge} />
        </div>

        <div className="mt-5 grid overflow-hidden rounded-lg border border-border sm:grid-cols-3">
          {[
            { label: "Tashkilot ID", value: "ORG-DEMO-01" },
            { label: "Ma'lumot rejimi", value: "Demo dataset" },
            { label: "Integratsiyalar", value: "3 ta faol" },
          ].map((item) => (
            <div className="border-b border-border px-4 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0" key={item.label}>
              <p className="ui-label text-faint">{item.label}</p>
              <p className="mt-1.5 text-xs font-bold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ThresholdControl({
  label,
  description,
  value,
  unit,
  min,
  max,
  step,
  tone,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  tone: "warning" | "danger" | "primary" | "accent";
  onChange: (value: number) => void;
}) {
  const fill = ((value - min) / (max - min)) * 100;
  const toneClasses = {
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
    primary: "bg-primary-soft text-primary",
    accent: "bg-accent-soft text-accent",
  };

  return (
    <article className="rounded-lg border border-border bg-surface-muted/35 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[13px] font-bold text-foreground">{label}</h3>
          <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
        </div>
        <span className={`shrink-0 rounded-md px-2.5 py-1 font-mono text-xs font-bold ${toneClasses[tone]}`}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="ui-range mt-5 w-full"
        style={{ "--range-fill": `${fill}%` } as CSSProperties}
        aria-label={`${label}: ${value}${unit}`}
      />
      <div className="mt-2 flex justify-between font-mono text-[10px] font-medium text-faint">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </article>
  );
}

function ThresholdSettings({
  settings,
  onChange,
  onReset,
}: {
  settings: AppSettings;
  onChange: (thresholds: AppSettings["thresholds"]) => void;
  onReset: () => void;
}) {
  const thresholds = settings.thresholds;

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      <SectionHeader
        eyebrow="Alert qoidalari"
        title="Monitoring chegaralari"
        description="Ko'rsatkichlar ushbu qiymatlardan chiqsa avtomatik ogohlantirish yaratiladi."
        icon={SlidersHorizontal}
        action={
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 text-xs font-bold text-muted-strong transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Standartga qaytarish
          </button>
        }
      />

      <div className="p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-2">
          <ThresholdControl
            label="Maksimal kechikish"
            description="Latency bundan oshsa warning yaratiladi."
            value={thresholds.latency}
            unit=" ms"
            min={200}
            max={1000}
            step={50}
            tone="warning"
            onChange={(latency) => onChange({ ...thresholds, latency })}
          />
          <ThresholdControl
            label="Maksimal xato ulushi"
            description="Qayta ishlashdagi ruxsat etilgan xatolar."
            value={thresholds.errorRate}
            unit="%"
            min={0.5}
            max={5}
            step={0.1}
            tone="danger"
            onChange={(errorRate) => onChange({ ...thresholds, errorRate })}
          />
          <ThresholdControl
            label="Minimal AI aniqligi"
            description="Model aniqligi bundan pastlasa signal beriladi."
            value={thresholds.aiAccuracy}
            unit="%"
            min={80}
            max={99}
            step={0.5}
            tone="primary"
            onChange={(aiAccuracy) => onChange({ ...thresholds, aiAccuracy })}
          />
          <ThresholdControl
            label="Xarajat o'sishi"
            description="Operatsion xarajatning kritik o'sish chegarasi."
            value={thresholds.costIncrease}
            unit="%"
            min={5}
            max={30}
            step={1}
            tone="accent"
            onChange={(costIncrease) => onChange({ ...thresholds, costIncrease })}
          />
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-warning/15 bg-warning-soft px-3.5 py-3 text-xs leading-5 text-warning">
          <Gauge className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Bu chegaralar demo monitoring oqimiga qo&apos;llanadi. Juda tor diapazon ortiqcha alertlar yaratishi mumkin.
        </div>
      </div>
    </section>
  );
}

function ToggleSwitch({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3.5 first:pt-0 last:border-b-0 last:pb-0">
      <div>
        <p className="text-[13px] font-bold text-foreground">{label}</p>
        <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-border-strong"
        }`}
      >
        <span
          className={`absolute top-1 size-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "left-1 translate-x-5" : "left-1 translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function NotificationSettings({
  settings,
  onChange,
}: {
  settings: AppSettings;
  onChange: (notifications: AppSettings["notifications"]) => void;
}) {
  const notifications = settings.notifications;

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      <SectionHeader
        eyebrow="Xabar kanallari"
        title="Bildirishnoma sozlamalari"
        description="Qaysi hodisa va hisobotlar haqida xabar olishni tanlang."
        icon={Bell}
      />

      <div className="grid lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.7fr)]">
        <div className="p-4 sm:p-5 lg:border-r lg:border-border">
          <ToggleSwitch
            label="Platforma ichidagi bildirishnomalar"
            description="Topbardagi bildirishnoma markazida barcha muhim hodisalarni ko'rsatish."
            checked={notifications.inApp}
            onChange={(inApp) => onChange({ ...notifications, inApp })}
          />
          <ToggleSwitch
            label="Kritik alertlarni emailga yuborish"
            description="Critical darajadagi signal paydo bo'lishi bilan email xabari yuboriladi."
            checked={notifications.criticalEmail}
            onChange={(criticalEmail) => onChange({ ...notifications, criticalEmail })}
          />
          <ToggleSwitch
            label="Warning alertlarini emailga yuborish"
            description="Ogohlantirish chegarasidan chiqqan ko'rsatkichlar bo'yicha xabar olish."
            checked={notifications.warningEmail}
            onChange={(warningEmail) => onChange({ ...notifications, warningEmail })}
          />
          <ToggleSwitch
            label="Kunlik qisqa xulosa"
            description="Har kuni soat 20:00 da operatsion natijalar xulosasini olish."
            checked={notifications.dailySummary}
            onChange={(dailySummary) => onChange({ ...notifications, dailySummary })}
          />
          <ToggleSwitch
            label="Haftalik hisobot tayyor bo'lganda"
            description="Avtomatik haftalik hisobot generatsiyasi yakunlanganda xabar berish."
            checked={notifications.weeklyReport}
            onChange={(weeklyReport) => onChange({ ...notifications, weeklyReport })}
          />
          <ToggleSwitch
            label="Ovozli signal"
            description="Kritik hodisa paytida brauzerda qisqa ovozli signal ijro etish."
            checked={notifications.sound}
            onChange={(sound) => onChange({ ...notifications, sound })}
          />
        </div>

        <aside className="bg-surface-muted/45 p-4 sm:p-5">
          <p className="ui-label text-faint">Yetkazib berish</p>
          <div className="mt-3 space-y-3">
            <div className="rounded-lg border border-border bg-surface p-3.5">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-md bg-primary-soft text-primary">
                  <Bell className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-bold text-foreground">Platforma ichida</p>
                  <p className="mt-0.5 text-[11px] text-success">Faol · real vaqt</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-surface p-3.5">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-md bg-accent-soft text-accent">
                  <Mail className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground">Email</p>
                  <p className="mt-0.5 truncate text-[11px] text-muted">{settings.profile.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-primary/15 bg-primary-soft p-3.5">
            <p className="text-xs font-bold text-primary">Joriy konfiguratsiya</p>
            <p className="mt-1.5 text-xs leading-5 text-muted-strong">
              {Object.values(notifications).filter(Boolean).length} ta xabar turi faol. Kritik alertlar har doim topbarda saqlanadi.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}


const EES_WEIGHT_KEYS = [
  "time",
  "cost",
  "labor",
  "automation",
  "quality",
] as const;

function EconomicsSettings({
  settings,
  onChange,
}: {
  settings: AppSettings;
  onChange: (economics: AppSettings["economics"]) => void;
}) {
  const { economics } = settings;
  const weightTotal = EES_WEIGHT_KEYS.reduce(
    (total, key) => total + (economics.eesWeights[key] ?? 0),
    0,
  );

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      <SectionHeader
        eyebrow="Iqtisodiy hisob"
        title="ROI va EES parametrlari"
        description="Investitsiya qaytimi va samaradorlik indeksi shu qiymatlar asosida hisoblanadi."
        icon={Gauge}
      />

      <div className="p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-bold text-muted-strong">
              AI joriy etish xarajati
            </span>
            <span className="ml-2 text-[11px] font-medium text-faint">mln so&apos;m</span>
            <input
              type="number"
              min={0}
              step={1}
              value={economics.aiInvestmentCost ?? ""}
              placeholder="Masalan: 180"
              onChange={(event) =>
                onChange({
                  ...economics,
                  aiInvestmentCost:
                    event.target.value === "" ? null : Number(event.target.value),
                })
              }
              className="mt-2 h-10 w-full rounded-lg border border-border bg-surface px-3 text-[13px] font-medium text-foreground shadow-sm outline-none transition-colors placeholder:text-faint hover:border-border-strong focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
            <span className="mt-1.5 block text-[11px] leading-4 text-faint">
              ROI = (yillik tejam − shu qiymat) / shu qiymat × 100
            </span>
          </label>

          <label className="block">
            <span className="text-xs font-bold text-muted-strong">Bazaviy davr</span>
            <span className="ml-2 text-[11px] font-medium text-faint">kun</span>
            <input
              type="number"
              min={7}
              max={365}
              step={1}
              value={economics.baselineDays}
              onChange={(event) =>
                onChange({ ...economics, baselineDays: Number(event.target.value) })
              }
              className="mt-2 h-10 w-full rounded-lg border border-border bg-surface px-3 text-[13px] font-medium text-foreground shadow-sm outline-none transition-colors hover:border-border-strong focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
            <span className="mt-1.5 block text-[11px] leading-4 text-faint">
              Ma&apos;lumotning birinchi shuncha kuni &laquo;AI&apos;gacha&raquo; davr deb olinadi
            </span>
          </label>
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-muted-strong">
                Samaradorlik indeksi vaznlari
              </p>
              <p className="mt-1 text-[11px] leading-4 text-faint">
                EES = 100 × Σ(vazn × normallashtirilgan komponent)
              </p>
            </div>
            <span
              className={`rounded-full px-2 py-1 font-mono text-[11px] font-bold ${
                Math.abs(weightTotal - 1) < 0.01
                  ? "bg-success-soft text-success"
                  : "bg-warning-soft text-warning"
              }`}
            >
              yig&apos;indi {weightTotal.toFixed(2)}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {EES_WEIGHT_KEYS.map((key) => {
              const value = economics.eesWeights[key] ?? 0;

              return (
                <div className="rounded-lg border border-border bg-canvas p-3" key={key}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13px] font-bold text-foreground">
                      {economics.eesLabels[key] ?? key}
                    </span>
                    <span className="font-mono text-sm font-bold text-primary">
                      {value.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={0.6}
                    step={0.01}
                    value={value}
                    onChange={(event) =>
                      onChange({
                        ...economics,
                        eesWeights: {
                          ...economics.eesWeights,
                          [key]: Number(event.target.value),
                        },
                      })
                    }
                    className="mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-muted accent-primary"
                    aria-label={`${economics.eesLabels[key] ?? key} vazni`}
                  />
                </div>
              );
            })}
          </div>

          <p className="mt-4 flex items-start gap-2.5 rounded-lg border border-info/15 bg-info-soft px-3.5 py-3 text-xs leading-5 text-info">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Saqlashda vaznlar yig&apos;indisi avtomatik 1 ga keltiriladi, nisbatlar
            saqlanadi. O&apos;zgarish barcha davrlar uchun darhol qo&apos;llanadi.
          </p>
        </div>
      </div>
    </section>
  );
}

export function SettingsView() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [draft, setDraft] = useState<AppSettings | null>(null);
  const [saved, setSaved] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    void getSettings().then((response) => {
      if (cancelled) return;

      setIsLoading(false);

      if (!response.ok) {
        setError(response.message);
        return;
      }

      setDraft(response.data);
      setSaved(response.data);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const isDirty =
    draft !== null && saved !== null && JSON.stringify(draft) !== JSON.stringify(saved);
  const initials = getInitials(draft?.profile.fullName ?? "");

  function markChanged(next: AppSettings) {
    setDraft(next);
    setSaveMessage("");
  }

  async function handleSave() {
    if (!draft || !isDirty || isSaving) return;

    setIsSaving(true);
    setSaveMessage("");
    setError("");

    const response = await saveSettings({
      profile: {
        fullName: draft.profile.fullName,
        language: draft.profile.language,
      },
      organization: draft.organization,
      thresholds: draft.thresholds,
      notifications: draft.notifications,
      economics: {
        aiInvestmentCost: draft.economics.aiInvestmentCost,
        baselineDays: draft.economics.baselineDays,
        eesWeights: draft.economics.eesWeights,
      },
    });

    setIsSaving(false);

    if (!response.ok) {
      setError(response.message);
      return;
    }

    // Server vaznlarni normallashtirib qaytaradi — javobni manba deb olamiz.
    setDraft(response.data);
    setSaved(response.data);
    setSaveMessage("Barcha o'zgarishlar saqlandi");
    window.dispatchEvent(
      new CustomEvent(SETTINGS_UPDATED_EVENT, { detail: response.data }),
    );
  }

  async function handleLogout() {
    await logout();
    router.replace("/kirish");
    router.refresh();
  }

  if (isLoading) {
    return (
      <div className="mx-auto grid min-h-64 w-full max-w-6xl place-content-center text-center">
        <LoaderCircle className="mx-auto size-6 animate-spin text-primary" aria-hidden="true" />
        <p className="mt-3 text-xs font-medium text-muted">Sozlamalar yuklanmoqda...</p>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="mx-auto w-full max-w-6xl pb-2">
        <PageHeader
          eyebrow="Tizim boshqaruvi"
          title="Sozlamalar"
          description="Profil, tashkilot va monitoring parametrlarini yagona joydan boshqaring."
        />
        <div className="mt-6 rounded-lg border border-danger/20 bg-danger-soft p-6 text-center shadow-card">
          <p className="text-sm font-medium text-danger">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl pb-2">
      <PageHeader
        eyebrow="Tizim boshqaruvi"
        title="Sozlamalar"
        description="Profil, tashkilot va monitoring parametrlarini yagona joydan boshqaring."
        action={
          <div className="flex items-center gap-2">
            <span className={`hidden h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold shadow-sm sm:inline-flex ${
              isDirty
                ? "border-warning/15 bg-warning-soft text-warning"
                : "border-success/15 bg-success-soft text-success"
            }`}>
              {isDirty ? <Settings2 className="size-3.5" aria-hidden="true" /> : <CheckCircle2 className="size-3.5" aria-hidden="true" />}
              {isDirty ? "Saqlanmagan o'zgarish" : saveMessage || "Barcha o'zgarishlar saqlangan"}
            </span>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isSaving ? <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" /> : <Save className="size-3.5" aria-hidden="true" />}
              {isSaving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        }
      />

      {error && (
        <div className="mt-4 rounded-md border border-danger/20 bg-danger-soft px-3.5 py-3" role="alert">
          <p className="text-sm font-medium leading-5 text-danger">{error}</p>
        </div>
      )}

      <section className="mt-5 grid items-start gap-4 lg:grid-cols-[15.5rem_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-lg border border-border bg-surface shadow-card lg:sticky lg:top-0">
          <div className="border-b border-border p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary font-mono text-sm font-bold text-white shadow-sm">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold text-foreground">{draft.profile.fullName}</p>
                <p className="mt-0.5 truncate text-xs text-muted">{draft.profile.role}</p>
              </div>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-1 p-2 lg:block" aria-label="Sozlamalar bo'limlari">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  type="button"
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`group flex min-h-12 w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors lg:mb-1 ${
                    active
                      ? "bg-primary-soft text-primary ring-1 ring-inset ring-primary/15"
                      : "text-muted-strong hover:bg-surface-muted hover:text-foreground"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <span className={`grid size-8 shrink-0 place-items-center rounded-md ${active ? "bg-surface text-primary shadow-sm" : "bg-surface-muted text-faint group-hover:text-muted"}`}>
                    <Icon className="size-4" strokeWidth={1.9} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold">{tab.label}</span>
                    <span className={`mt-0.5 hidden truncate text-[10px] font-medium lg:block ${active ? "text-primary/70" : "text-faint"}`}>
                      {tab.description}
                    </span>
                  </span>
                  <ChevronRight className={`ml-auto hidden size-3.5 lg:block ${active ? "text-primary" : "text-faint"}`} aria-hidden="true" />
                </button>
              );
            })}
          </nav>

          <div className="border-t border-border p-2">
            <button
              type="button"
              onClick={handleLogout}
              className="flex min-h-10 w-full items-center gap-3 rounded-md px-2.5 text-left text-xs font-bold text-danger transition-colors hover:bg-danger-soft"
            >
              <span className="grid size-8 place-items-center rounded-md bg-danger-soft">
                <LogOut className="size-4" aria-hidden="true" />
              </span>
              Tizimdan chiqish
            </button>
          </div>
        </aside>

        <div className="min-w-0">
          {activeTab === "profile" && (
            <ProfileSettings
              settings={draft}
              onChange={(profile) => markChanged({ ...draft, profile })}
            />
          )}
          {activeTab === "organization" && (
            <OrganizationSettings
              settings={draft}
              onChange={(organization) => markChanged({ ...draft, organization })}
            />
          )}
          {activeTab === "economics" && (
            <EconomicsSettings
              settings={draft}
              onChange={(economics) => markChanged({ ...draft, economics })}
            />
          )}
          {activeTab === "thresholds" && (
            <ThresholdSettings
              settings={draft}
              onChange={(thresholds) => markChanged({ ...draft, thresholds })}
              onReset={() => markChanged({ ...draft, thresholds: defaultSettings.thresholds })}
            />
          )}
          {activeTab === "notifications" && (
            <NotificationSettings
              settings={draft}
              onChange={(notifications) => markChanged({ ...draft, notifications })}
            />
          )}
        </div>
      </section>

      <div className="mt-4 flex flex-col gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-xs leading-5 text-muted shadow-card sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2">
          <ShieldCheck className="size-4 shrink-0 text-success" aria-hidden="true" />
          Sozlamalar ma&apos;lumotlar bazasida saqlanadi va barcha
          hisob-kitoblarda darhol qo&apos;llanadi.
        </span>
        <span className="shrink-0 font-mono text-[11px] font-bold text-muted-strong">Samara AI · v0.1.0</span>
      </div>
    </div>
  );
}
