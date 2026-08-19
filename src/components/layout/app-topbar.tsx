"use client";

import {
  AlertTriangle,
  Bell,
  Building2,
  ChevronDown,
  ChevronRight,
  FileCheck2,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  defaultSettings,
  readStoredSettings,
  SETTINGS_UPDATED_EVENT,
  type AppSettings,
} from "@/data/settings";

type AppTopbarProps = {
  mobileMenuOpen: boolean;
  onOpenMenu: () => void;
};

type OpenMenu = "notifications" | "account" | null;

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

export function AppTopbar({
  mobileMenuOpen,
  onOpenMenu,
}: AppTopbarProps) {
  const router = useRouter();
  const menusRef = useRef<HTMLDivElement>(null);
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [account, setAccount] = useState({
    profile: defaultSettings.profile,
    organization: defaultSettings.organization,
  });

  useEffect(() => {
    function applySettings(settings: AppSettings) {
      setAccount({
        profile: settings.profile,
        organization: settings.organization,
      });
    }

    function handleSettingsUpdate(event: Event) {
      const customEvent = event as CustomEvent<AppSettings>;
      applySettings(customEvent.detail ?? readStoredSettings());
    }

    applySettings(readStoredSettings());
    window.addEventListener(SETTINGS_UPDATED_EVENT, handleSettingsUpdate);

    return () => window.removeEventListener(SETTINGS_UPDATED_EVENT, handleSettingsUpdate);
  }, []);

  useEffect(() => {
    if (!openMenu) return;

    function handlePointerDown(event: MouseEvent) {
      if (!menusRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenu]);

  function toggleMenu(menu: Exclude<OpenMenu, null>) {
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  function handleLogout() {
    sessionStorage.removeItem("ai-samaradorlik-foydalanuvchi");
    router.replace("/kirish");
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface/90 px-3 backdrop-blur-md sm:px-4 md:h-16 md:px-7">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          className="grid size-9 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-surface-muted hover:text-foreground md:hidden"
          onClick={onOpenMenu}
          aria-label="Navigatsiyani ochish"
          aria-controls="primary-navigation"
          aria-expanded={mobileMenuOpen}
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>

        <span className="text-sm font-extrabold tracking-[-0.02em] text-foreground md:hidden">
          Samara <span className="text-primary">AI</span>
        </span>

        <nav
          className="hidden items-center gap-2 text-[13px] text-muted md:flex"
          aria-label="Sahifa yo'nalishi"
        >
          <span className="font-semibold text-muted-strong">Samara AI</span>
          <ChevronRight className="size-3.5 text-faint" aria-hidden="true" />
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
            <Building2 className="size-3.5 text-faint" aria-hidden="true" />
            {account.organization.name}
          </span>
        </nav>
      </div>

      <div ref={menusRef} className="flex shrink-0 items-center gap-2.5">
        <div className="relative">
          <button
            type="button"
            className="relative grid size-10 place-items-center rounded-lg border border-border bg-surface text-muted shadow-sm transition-all duration-150 hover:border-border-strong hover:bg-surface-muted hover:text-foreground"
            onClick={() => toggleMenu("notifications")}
            aria-label="Bildirishnomalar, 2 ta yangi"
            aria-expanded={openMenu === "notifications"}
            aria-haspopup="dialog"
            aria-controls="notifications-popover"
          >
            <Bell className="size-[18px]" aria-hidden="true" />
            <span
              className="absolute right-2 top-2 size-2 rounded-full border-2 border-surface bg-danger"
              aria-hidden="true"
            />
          </button>

          {openMenu === "notifications" && (
            <div
              id="notifications-popover"
              role="dialog"
              aria-labelledby="notifications-title"
              className="rise-in absolute right-0 top-full z-50 mt-2 w-[min(21rem,calc(100vw-1rem))] overflow-hidden rounded-xl border border-border bg-surface shadow-floating"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
                <div>
                  <p
                    id="notifications-title"
                    className="text-sm font-bold text-foreground"
                  >
                    Bildirishnomalar
                  </p>
                  <p className="mt-0.5 text-[13px] text-muted">
                    Tizimdagi so&apos;nggi o&apos;zgarishlar
                  </p>
                </div>
                <span className="rounded-full bg-danger-soft px-2 py-1 text-xs font-bold text-danger">
                  2 ta yangi
                </span>
              </div>

              <div className="divide-y divide-border">
                <div className="flex gap-3 px-4 py-3.5">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-warning-soft text-warning">
                    <AlertTriangle className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      Kechikish me&apos;yordan oshdi
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      Joriy qiymat 620 ms, belgilangan chegara 500 ms.
                    </p>
                    <p className="mt-1.5 font-mono text-xs text-faint">
                      5 daqiqa oldin
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 px-4 py-3.5">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-success-soft text-success">
                    <FileCheck2 className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      Oylik hisobot tayyor
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      Iqtisodiy samaradorlik hisoboti shakllantirildi.
                    </p>
                    <p className="mt-1.5 font-mono text-xs text-faint">
                      18 daqiqa oldin
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface pl-1.5 pr-2.5 text-sm text-foreground shadow-sm transition-all duration-150 hover:border-border-strong hover:bg-surface-muted"
            onClick={() => toggleMenu("account")}
            aria-label={`Foydalanuvchi profili: ${account.profile.fullName}`}
            aria-expanded={openMenu === "account"}
            aria-haspopup="dialog"
            aria-controls="account-popover"
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft font-mono text-xs font-bold text-primary ring-1 ring-inset ring-primary/15">
              {getInitials(account.profile.fullName)}
            </span>
            <span className="hidden max-w-36 truncate text-[12px] font-bold sm:inline">
              {account.profile.fullName}
            </span>
            <ChevronDown
              className={`size-3.5 text-faint transition-transform duration-150 ${
                openMenu === "account" ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>

          {openMenu === "account" && (
            <div
              id="account-popover"
              role="dialog"
              aria-label="Foydalanuvchi profili"
              className="rise-in absolute right-0 top-full z-50 mt-2 w-[min(21rem,calc(100vw-1rem))] overflow-hidden rounded-xl border border-border bg-surface shadow-floating"
            >
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-soft font-mono text-xs font-bold text-primary ring-1 ring-inset ring-primary/20">
                    {getInitials(account.profile.fullName)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">
                      {account.profile.fullName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {account.profile.email}
                    </p>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-lg border border-border bg-surface-muted">
                  <div className="flex min-h-11 items-center justify-between gap-3 px-3 py-2.5">
                    <span className="ui-label text-faint">Rol</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2 py-1 text-[13px] font-bold text-primary">
                      <ShieldCheck className="size-3" aria-hidden="true" />
                      {account.profile.role}
                    </span>
                  </div>
                  <div className="flex min-h-11 items-center justify-between gap-3 border-t border-border px-3 py-2.5">
                    <span className="ui-label text-faint">Tashkilot</span>
                    <span className="truncate text-xs font-semibold text-foreground">
                      {account.organization.name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border p-2">
                <Link
                  href="/sozlamalar"
                  className="flex min-h-10 items-center gap-3 rounded-lg px-2.5 text-[13px] font-semibold text-muted-strong transition-colors hover:bg-surface-muted hover:text-foreground"
                  onClick={() => setOpenMenu(null)}
                >
                  <span className="grid size-8 place-items-center rounded-md bg-surface-muted text-muted ring-1 ring-inset ring-border">
                    <Settings className="size-4" aria-hidden="true" />
                  </span>
                  Sozlamalar
                </Link>
                <button
                  type="button"
                  className="mt-1 flex min-h-10 w-full items-center gap-3 rounded-lg px-2.5 text-left text-[13px] font-semibold text-danger transition-colors hover:bg-danger-soft"
                  onClick={handleLogout}
                >
                  <span className="grid size-8 place-items-center rounded-md bg-danger-soft">
                    <LogOut className="size-4" aria-hidden="true" />
                  </span>
                  Tizimdan chiqish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
