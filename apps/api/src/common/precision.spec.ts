import { durationHours, durationMinutes, roundMoney } from './precision';

describe('precision helpers', () => {
  it('prefers canonical minutes over legacy decimal hours', () => {
    expect(durationMinutes({ totalMinutes: 95, totalHours: 1.5 })).toBe(95);
    expect(durationHours({ totalMinutes: 95, totalHours: 1.5 })).toBe(95 / 60);
  });

  it('converts legacy hours using minute rounding', () => {
    expect(durationMinutes({ totalHours: 1.583333333 })).toBe(95);
  });

  it('keeps monetary calculations at cent precision', () => {
    expect(roundMoney(12.345)).toBe(12.35);
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
  });
});
