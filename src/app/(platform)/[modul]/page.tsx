import { Construction } from "lucide-react";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { navigationItems } from "@/config/navigation";

const completedModules = new Set([
  "/dashboard",
  "/malumotlar",
  "/qayta-ishlash",
  "/ai-tahlil",
  "/iqtisodiy-samaradorlik",
  "/monitoring",
  "/qarorlar",
  "/hisobotlar",
]);
const moduleItems = navigationItems.filter((item) => !completedModules.has(item.href));

export const dynamicParams = false;

export function generateStaticParams() {
  return moduleItems.map((item) => ({ modul: item.href.slice(1) }));
}

export default async function ModulePlaceholderPage({
  params,
}: PageProps<"/[modul]">) {
  const { modul } = await params;
  const page = moduleItems.find((item) => item.href === `/${modul}`);

  if (!page) {
    notFound();
  }

  const Icon = page.icon;

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader title={page.title} description={page.description} />

      <section className="mt-8 rounded-xl border border-border bg-surface p-6 shadow-card sm:p-8">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
            <Icon className="size-6" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-foreground">
              {page.title} moduli
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Bu modul reja bo&apos;yicha keyingi bosqichlarda ishlab chiqiladi.
              Hozir navigatsiya va sahifa tuzilmasi tayyor.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-warning-soft px-3 py-1.5 text-xs font-semibold text-warning">
            <Construction className="size-3.5" aria-hidden="true" />
            Rejalashtirilgan
          </span>
        </div>
      </section>
    </div>
  );
}
