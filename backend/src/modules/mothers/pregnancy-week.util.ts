const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

/**
 * Pregnancy week is conventionally counted from the last menstrual period (LMP),
 * clamped to the clinically meaningful 1-42 week range.
 */
export function getCurrentWeek(lmpDate: Date, now: Date = new Date()): number {
  const elapsedMs = now.getTime() - lmpDate.getTime();
  const week = Math.floor(elapsedMs / MS_PER_WEEK) + 1;
  return Math.min(Math.max(week, 1), 42);
}

export function getTrimester(week: number): 1 | 2 | 3 {
  if (week <= 13) return 1;
  if (week <= 27) return 2;
  return 3;
}
