export function durationMinutes(duration: {
  totalMinutes?: number | null;
  totalHours?: number | null;
}): number {
  if (duration.totalMinutes != null) return duration.totalMinutes;
  return duration.totalHours == null ? 0 : Math.round(duration.totalHours * 60);
}

export function durationHours(duration: {
  totalMinutes?: number | null;
  totalHours?: number | null;
}): number {
  return durationMinutes(duration) / 60;
}

export function roundMoney(amount: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round((amount + Number.EPSILON) * factor) / factor;
}
