export function formatEur(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR");
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
