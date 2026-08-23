import { AppShell } from "@/components/layout/app-shell";

/**
 * Namoyish sahifasi qat'iy faqat-ko'rish rejimida.
 *
 * `inert` butun daraxtni fokus va hodisalardan chiqaradi: havolalar bosilmaydi,
 * tugmalar ishlamaydi, klaviatura bilan ham ichkariga kirib bo'lmaydi.
 * Bu iframe tomonidagi himoyaga qo'shimcha qatlam — sahifa to'g'ridan-to'g'ri
 * ochilsa ham interaktiv bo'lmaydi.
 */
export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div inert className="contents">
      <AppShell>{children}</AppShell>
    </div>
  );
}
