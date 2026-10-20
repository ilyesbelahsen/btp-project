export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(hours?: number | null): string {
  return formatDurationMinutes(hours == null ? null : Math.round(hours * 60));
}

export function formatDurationLabel(hours: number): string {
  return formatDurationMinutes(Math.round(hours * 60));
}

export function formatDurationMinutes(minutes: number | null): string {
  if (minutes == null) return "—";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes} min`;
  if (remainingMinutes === 0) return `${hours} h`;
  return `${hours} h ${String(remainingMinutes).padStart(2, "0")}`;
}

export function currentMois(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function shiftMois(mois: string, delta: number): string {
  const [y, m] = mois.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function moisLabel(mois: string): string {
  const [y, m] = mois.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

export function elapsedDurationLabel(startTimeIso: string): string {
  const now = new Date();
  const start = new Date(startTimeIso);
  const elapsedSeconds = Math.max(
    0,
    Math.floor((now.getTime() - start.getTime()) / 1_000),
  );
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
