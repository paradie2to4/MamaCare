import { getCurrentWeek, getTrimester } from './pregnancy-week.util';

describe('getCurrentWeek', () => {
  it('returns week 1 on the LMP date itself', () => {
    const lmp = new Date('2026-01-01T00:00:00Z');
    expect(getCurrentWeek(lmp, lmp)).toBe(1);
  });

  it('returns week 24 exactly 23 weeks after LMP', () => {
    const lmp = new Date('2026-01-01T00:00:00Z');
    const now = new Date(lmp.getTime() + 23 * 7 * 24 * 60 * 60 * 1000);
    expect(getCurrentWeek(lmp, now)).toBe(24);
  });

  it('clamps to 42 for dates far past term', () => {
    const lmp = new Date('2020-01-01T00:00:00Z');
    const now = new Date('2026-01-01T00:00:00Z');
    expect(getCurrentWeek(lmp, now)).toBe(42);
  });

  it('clamps to 1 for a future LMP date', () => {
    const lmp = new Date('2027-01-01T00:00:00Z');
    const now = new Date('2026-01-01T00:00:00Z');
    expect(getCurrentWeek(lmp, now)).toBe(1);
  });
});

describe('getTrimester', () => {
  it('classifies weeks into trimesters', () => {
    expect(getTrimester(10)).toBe(1);
    expect(getTrimester(20)).toBe(2);
    expect(getTrimester(35)).toBe(3);
  });
});
