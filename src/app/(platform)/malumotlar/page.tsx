import type { Metadata } from "next";

import { DataSourcesView } from "@/features/data-sources/data-sources-view";

export const metadata: Metadata = {
  title: "Ma'lumot manbalari",
  description: "CSV va XLSX ma'lumotlar to'plamini yuklash, tekshirish va boshqarish.",
};

export default function DataSourcesPage() {
  return <DataSourcesView />;
}
