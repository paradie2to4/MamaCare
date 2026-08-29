const UNIT_TO_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

/** Parses a short duration string like "15m" or "30d" into milliseconds. */
export function parseDurationMs(duration: string): number {
  const match = /^(\d+)([smhd])$/.exec(duration.trim());
  if (!match) {
    throw new Error(`Invalid duration string: ${duration}`);
  }
  const [, amount, unit] = match;
  return Number(amount) * UNIT_TO_MS[unit];
}
