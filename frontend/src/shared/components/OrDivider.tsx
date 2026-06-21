export function OrDivider() {
  return (
    <div className="flex items-center gap-3" role="separator">
      <div className="h-px flex-1 bg-(--color-border)" />
      <span className="text-xs font-medium uppercase tracking-wide text-(--color-ink-soft)">
        or
      </span>
      <div className="h-px flex-1 bg-(--color-border)" />
    </div>
  );
}
