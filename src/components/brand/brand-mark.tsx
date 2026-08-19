type BrandMarkProps = {
  compact?: boolean;
  showSubtitle?: boolean;
};

export function BrandMark({
  compact = false,
  showSubtitle = true,
}: BrandMarkProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-[11px] bg-primary shadow-sm ring-1 ring-inset ring-white/15">
        <svg
          viewBox="0 0 28 28"
          className="size-7"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 19.5 9.25 15l3.25 2.8L19.2 9.5 23 12.8"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="19.2" cy="9.5" r="2.2" fill="white" opacity="0.75" />
        </svg>
      </span>

      {!compact && (
        <span className="flex flex-col">
          <span className="text-[15px] font-extrabold leading-5 tracking-[-0.025em] text-foreground">
            Samara <span className="text-primary">AI</span>
          </span>
          {showSubtitle && (
            <span className="text-[10.5px] font-medium leading-4 text-muted">
              Iqtisodiy intellekt platformasi
            </span>
          )}
        </span>
      )}
    </div>
  );
}
