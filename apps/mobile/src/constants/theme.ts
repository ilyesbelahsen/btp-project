export const COLORS = {
  primary: "#2563eb",
  primaryLight: "#eff6ff",
  success: "#16a34a",
  successLight: "#dcfce7",
  danger: "#dc2626",
  dangerLight: "#fee2e2",
  warning: "#f59e0b",
  warningLight: "#fef3c7",
  purple: "#7c3aed",
  purpleLight: "#ede9fe",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
  gray900: "#111827",
  white: "#ffffff",
} as const;

export const STATUS_CONFIG = {
  EN_COURS: { label: "En cours", color: COLORS.primary },
  TERMINE: { label: "Terminé", color: COLORS.success },
  VALIDE: { label: "Validé", color: COLORS.purple },
} as const;
