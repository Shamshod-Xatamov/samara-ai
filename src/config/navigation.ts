import {
  Activity,
  BadgeDollarSign,
  BrainCircuit,
  Database,
  FileBarChart,
  LayoutDashboard,
  Lightbulb,
  Settings,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

export type NavigationItem = {
  title: string;
  shortTitle: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

export const navigationGroups: NavigationGroup[] = [
  {
    label: "Umumiy",
    items: [
      {
        title: "Boshqaruv paneli",
        shortTitle: "Boshqaruv paneli",
        description: "Asosiy KPI va tizim holatining umumiy ko'rinishi.",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Ma'lumot va tahlil",
    items: [
      {
        title: "Ma'lumot manbalari",
        shortTitle: "Ma'lumotlar",
        description: "CSV, Excel va demo ma'lumotlar to'plamini boshqarish.",
        href: "/malumotlar",
        icon: Database,
      },
      {
        title: "Ma'lumotlarni qayta ishlash",
        shortTitle: "Qayta ishlash",
        description: "Ma'lumot sifati, xatolar va tozalash jarayonlari.",
        href: "/qayta-ishlash",
        icon: SlidersHorizontal,
      },
      {
        title: "AI tahlili",
        shortTitle: "AI tahlili",
        description: "Prognozlash va anomaliyalarni aniqlash natijalari.",
        href: "/ai-tahlil",
        icon: BrainCircuit,
      },
      {
        title: "Iqtisodiy samaradorlik",
        shortTitle: "Samaradorlik",
        description: "Iqtisodiy KPI, taqqoslash va ssenariy tahlili.",
        href: "/iqtisodiy-samaradorlik",
        icon: BadgeDollarSign,
      },
    ],
  },
  {
    label: "Boshqaruv",
    items: [
      {
        title: "Real vaqt monitoringi",
        shortTitle: "Monitoring",
        description: "Jarayonlar, tizim holati va ogohlantirishlarni kuzatish.",
        href: "/monitoring",
        icon: Activity,
      },
      {
        title: "Qarorlarni qo'llab-quvvatlash",
        shortTitle: "Qarorlar",
        description: "Muammolar, tavsiyalar va kutilayotgan iqtisodiy ta'sir.",
        href: "/qarorlar",
        icon: Lightbulb,
      },
      {
        title: "Hisobotlar",
        shortTitle: "Hisobotlar",
        description: "Davriy va iqtisodiy hisobotlarni shakllantirish.",
        href: "/hisobotlar",
        icon: FileBarChart,
      },
    ],
  },
  {
    label: "Tizim",
    items: [
      {
        title: "Sozlamalar",
        shortTitle: "Sozlamalar",
        description: "Profil, tashkilot va bildirishnoma parametrlarini boshqarish.",
        href: "/sozlamalar",
        icon: Settings,
      },
    ],
  },
];

export const navigationItems = navigationGroups.flatMap((group) => group.items);

export function getPageInfo(pathname: string) {
  return (
    navigationItems.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    ) ?? navigationItems[0]
  );
}
