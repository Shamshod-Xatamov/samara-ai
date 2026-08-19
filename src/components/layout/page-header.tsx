type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow && (
          <p className="ui-label mb-2 text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[1.65rem] font-bold leading-tight tracking-[-0.03em] text-foreground sm:text-[1.8rem]">
          {title}
        </h1>
        <p className="mt-1.5 text-sm leading-6 text-muted">
          {description}
        </p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
