"use client";

import { useEffect, useState } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="relative flex h-dvh overflow-hidden bg-background md:gap-3 md:p-3">
      <AppSidebar
        mobileOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {isMobileMenuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default bg-foreground/40 backdrop-blur-[2px] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Navigatsiyani yopish"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-canvas md:rounded-shell md:border md:border-border md:shadow-shell">
        <AppTopbar
          mobileMenuOpen={isMobileMenuOpen}
          onOpenMenu={() => setIsMobileMenuOpen(true)}
        />
        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 md:px-8 md:py-7">
          {children}
        </main>
      </div>
    </div>
  );
}
