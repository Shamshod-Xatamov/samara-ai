"use client";

import { Activity, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandMark } from "@/components/brand/brand-mark";
import { navigationGroups } from "@/config/navigation";

type AppSidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

export function AppSidebar({ mobileOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      id="primary-navigation"
      aria-label="Asosiy navigatsiya"
      className={`fixed inset-y-2 left-2 z-50 w-[min(var(--sidebar-width),calc(100vw-3rem))] flex-col overflow-hidden rounded-xl border border-border bg-sidebar shadow-floating md:static md:z-auto md:flex md:h-full md:w-[var(--sidebar-width)] md:shrink-0 md:rounded-shell md:shadow-shell ${
        mobileOpen ? "flex" : "hidden"
      }`}
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/80 px-5">
        <Link
          href="/dashboard"
          className="rounded-md focus-visible:outline-none focus-visible:ring-2"
          onClick={onClose}
          aria-label="Samara AI bosh sahifasi"
        >
          <BrandMark />
        </Link>

        <button
          type="button"
          className="grid size-9 place-items-center rounded-md text-muted transition-colors hover:bg-surface-muted hover:text-foreground md:hidden"
          onClick={onClose}
          aria-label="Navigatsiyani yopish"
        >
          <X className="size-[19px]" aria-hidden="true" />
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-5">
          {navigationGroups.map((group, groupIndex) => {
            const headingId = `nav-group-${groupIndex}`;

            return (
              <section key={group.label} aria-labelledby={headingId}>
                <h2 id={headingId} className="ui-label mb-1.5 px-3 text-faint">
                  {group.label}
                </h2>

                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                    return (
                      <Link
                        href={item.href}
                        key={item.href}
                        onClick={onClose}
                        className={`group relative flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-[13px] font-semibold transition-all duration-150 ${
                          isActive
                            ? "bg-primary-soft text-primary ring-1 ring-inset ring-primary/15"
                            : "text-muted-strong hover:bg-surface-muted hover:text-foreground"
                        }`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {isActive && (
                          <span
                            className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary"
                            aria-hidden="true"
                          />
                        )}
                        <Icon
                          className={`size-[18px] shrink-0 transition-colors ${
                            isActive
                              ? "text-primary"
                              : "text-faint group-hover:text-muted-strong"
                          }`}
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                        <span>{item.shortTitle}</span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </nav>

      <div className="shrink-0 border-t border-border px-4 py-3.5">
        <div className="flex items-center gap-3 rounded-lg bg-surface-muted px-3 py-2.5 ring-1 ring-inset ring-border/70">
          <span className="relative grid size-8 shrink-0 place-items-center rounded-md bg-accent-soft text-accent">
            <Activity className="size-4" aria-hidden="true" />
            <span
              className="absolute -right-0.5 -top-0.5 size-2 rounded-full border-2 border-surface-muted bg-success"
              aria-hidden="true"
            />
          </span>
          <div className="min-w-0">
            <p className="ui-label text-faint">Tizim holati</p>
            <p className="mt-0.5 truncate text-xs font-semibold text-foreground">
              Barcha xizmatlar faol
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
