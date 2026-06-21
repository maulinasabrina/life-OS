export interface CompletionTier {
  label: string;
  className: string;
}

/**
 * Qualitative label for a completion percentage, translated to English
 * from the reference design (Indonesian: Belum mulai / Lumayan / Bagus).
 */
export function completionTier(percent: number, hasStarted: boolean): CompletionTier {
  if (!hasStarted) {
    return { label: 'Not started', className: 'bg-(--color-border) text-(--color-ink-soft)' };
  }
  if (percent >= 70) {
    return { label: 'Good', className: 'bg-(--color-sage-soft) text-(--color-sage)' };
  }
  if (percent >= 35) {
    return { label: 'Decent', className: 'bg-(--color-terracotta-soft) text-(--color-terracotta)' };
  }
  return { label: 'Needs work', className: 'bg-(--color-error-soft) text-(--color-error)' };
}
