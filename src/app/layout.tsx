import type { Metadata } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Samara AI",
    template: "%s | Samara AI",
  },
  description:
    "Sun'iy intellekt asosida iqtisodiy samaradorlikni real vaqt rejimida kuzatish va tahlil qilish platformasi.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uz" data-scroll-behavior="smooth">
      <body className={`${manrope.variable} ${jetBrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
