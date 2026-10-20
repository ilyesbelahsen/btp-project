export function pointageMinutes(pointage: {
  totalMinutes?: number | null;
  totalHours?: number | null;
}): number | null {
  if (pointage.totalMinutes != null) return pointage.totalMinutes;
  if (pointage.totalHours == null) return null;
  return Math.round(pointage.totalHours * 60);
}

export function formatDurationMinutes(minutes: number | null): string {
  if (minutes == null) return "—";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes} min`;
  if (remainingMinutes === 0) return `${hours} h`;
  return `${hours} h ${String(remainingMinutes).padStart(2, "0")}`;
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
