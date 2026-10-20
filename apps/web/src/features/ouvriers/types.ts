export type Ouvrier = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string;
  tauxHoraire: number | null;
};

export type CreateOuvrierDto = {
  firstName: string;
  lastName: string;
  email: string;
  tauxHoraire: number;
  phone?: string;
  address?: string;
  numeroCv?: string;
  mutuelle?: string;
  contactUrgence?: string;
};

export type CreatedOuvrier = Ouvrier & { tempPassword: string };

export type PointageResume = {
  id: string;
  startTime: string;
  endTime: string | null;
  totalMinutes?: number | null;
  totalHours: number | null;
  status: string;
  taches: string[];
  comment: string | null;
  chantier: { id: string; name: string };
};

export type ChantierResume = {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string | null;
};

export type OuvrierDetail = Ouvrier & {
  address: string | null;
  numeroCv: string | null;
  mutuelle: string | null;
  contactUrgence: string | null;
  createdAt: string;
  chantiers: ChantierResume[];
  pointages: PointageResume[];
};
