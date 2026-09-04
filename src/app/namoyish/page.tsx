import type { Metadata } from "next";

import { DashboardView } from "@/features/dashboard/dashboard-view";

export const metadata: Metadata = {
  title: "Namoyish",
  description: "Samara AI boshqaruv panelining faqat ko'rish uchun namoyishi.",
  // Ochiq namoyish sahifasi qidiruv natijalarida chiqmasligi kerak.
  robots: { index: false, follow: false },
};

/**
 * Landing sahifasidagi planshet ichida ko'rsatiladigan sahifa.
 *
 * Sessiyasiz ochiladi, lekin haqiqiy ma'lumotga tegmaydi — dashboardning
 * barcha raqamlari lokal statik namuna ma'lumotidan olinadi.
 */
export default function PreviewPage() {
  return <DashboardView />;
}
