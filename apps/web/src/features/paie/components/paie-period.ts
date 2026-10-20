import type { PeriodePaie } from "@/features/paie/types";

export type PresetPeriode = "semaine" | "mois" | "mois-1" | "perso";

function dateValue(date: Date) {
  return date.toISOString().split("T")[0];
}

export function getWeekBounds(): PeriodePaie {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() + (now.getDay() === 0 ? -6 : 1 - now.getDay()));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { dateFrom: dateValue(monday), dateTo: dateValue(sunday) };
}

export function getMonthBounds(offset = 0): PeriodePaie {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const last = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return { dateFrom: dateValue(first), dateTo: dateValue(last) };
}

export function buildPeriode(
  preset: PresetPeriode,
  custom: PeriodePaie,
): PeriodePaie {
  if (preset === "semaine") return getWeekBounds();
  if (preset === "mois") return getMonthBounds();
  if (preset === "mois-1") return getMonthBounds(-1);
  return custom;
}
