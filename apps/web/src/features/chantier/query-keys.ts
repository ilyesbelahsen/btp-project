export const chantierKeys = {
  all: ["chantiers"] as const,
  list: () => [...chantierKeys.all, "list"] as const,
  detail: (id: string) => [...chantierKeys.all, id, "detail"] as const,
  taches: (id: string) => [...chantierKeys.all, id, "taches"] as const,
  ouvriers: (id: string) => [...chantierKeys.all, id, "ouvriers"] as const,
};
