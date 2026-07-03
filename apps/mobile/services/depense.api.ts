import { apiClient } from "./api-client";

interface Depense {
  id: string;
  chantierId: string;
  categorie: "MATERIEL" | "MAIN_OEUVRE" | "TRANSPORT" | "AUTRE";
  montant: number;
  description: string;
  date: string;
}

export const depenseApi = {
  findAll: (chantierId?: string) =>
    apiClient.get<Depense[]>("/depenses", { params: { chantierId } }),
};
