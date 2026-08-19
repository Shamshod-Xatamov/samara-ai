import type { Metadata } from "next";

import { ProcessingView } from "@/features/processing/processing-view";

export const metadata: Metadata = {
  title: "Ma'lumotlarni qayta ishlash",
  description: "Ma'lumot sifati, xatolar va avtomatik tozalash jarayoni.",
};

export default function ProcessingPage() {
  return <ProcessingView />;
}
