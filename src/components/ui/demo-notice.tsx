import { FlaskConical } from "lucide-react";

/**
 * Hali real manbaga ulanmagan sahifalar uchun ochiq ogohlantirish.
 *
 * Platformaning qolgan qismi bazadan hisoblangan haqiqiy ma'lumot ko'rsatadi.
 * Farqni yashirmaslik muhim: demoda yoki himoyada qaysi raqam real, qaysi biri
 * namoyish uchun ekani aniq bo'lishi kerak.
 */
export function DemoNotice({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      className="mt-5 flex items-start gap-3 rounded-lg border border-warning/25 bg-warning-soft px-4 py-3.5 shadow-card"
      role="note"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-warning/15 text-warning">
        <FlaskConical className="size-[18px]" strokeWidth={1.9} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-bold text-warning">{title}</p>
        <p className="mt-1 text-xs leading-5 text-warning/90">{description}</p>
      </div>
    </div>
  );
}
