import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { BrandMark } from "@/components/brand/brand-mark";

export const metadata: Metadata = {
  title: "Tizimga kirish",
  description: "Samara AI iqtisodiy intellekt platformasiga kirish.",
};

export default function LoginPage() {
  return (
    <main className="relative grid min-h-svh place-items-center overflow-hidden bg-canvas px-5 py-10">
      <div
        className="pointer-events-none absolute left-1/2 top-[-18rem] size-[38rem] -translate-x-1/2 rounded-full bg-primary/7 blur-3xl"
        aria-hidden="true"
      />

      <Link
        href="/"
        className="absolute left-4 top-4 z-10 inline-flex h-10 items-center gap-2 rounded-md border border-border bg-surface px-3 text-xs font-bold text-muted-strong shadow-sm transition-[color,border-color,background-color] hover:border-border-strong hover:bg-surface-muted hover:text-foreground sm:left-6 sm:top-6"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Bosh sahifaga qaytish
      </Link>

      <section className="relative w-full max-w-[430px] rounded-xl border border-border bg-surface px-6 py-8 shadow-floating sm:px-9 sm:py-10">
        <div className="flex justify-center">
          <Link href="/" aria-label="Samara AI bosh sahifasi">
            <BrandMark />
          </Link>
        </div>

        <div className="mt-8 text-center">
          <h1 className="text-2xl font-extrabold tracking-[-0.035em] text-foreground">
            Tizimga kirish
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Davom etish uchun email va parolingizni kiriting.
          </p>
        </div>

        <LoginForm />
      </section>
    </main>
  );
}
