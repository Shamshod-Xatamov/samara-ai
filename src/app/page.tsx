import type { Metadata } from "next";

import { LandingPage } from "@/features/landing/landing-page";

export const metadata: Metadata = {
  title: "AI asosidagi iqtisodiy intellekt platformasi",
  description:
    "Korxona ma'lumotlarini real vaqtga yaqin kuzatish, AI yordamida tahlil qilish va iqtisodiy natijalarni o'lchash uchun Samara AI platformasi.",
};

export default function Home() {
  return <LandingPage />;
}
