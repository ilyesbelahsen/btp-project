import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DEPENSE_CATEGORIE_RULES } from '../depense/depense-categories.constants';
import {
  durationHours,
  durationMinutes,
  roundMoney,
} from '../../common/precision';
import { resolveZoneMajoration } from '../zone/zone.service';
import { RapportPeriodeQueryDto } from './dto/rapport-periode-query.dto';
import { UpdateTresorerieDto } from './dto/update-tresorerie.dto';

export type DashboardStats = {
  chantiersActifs: number;
  caTotalHT: number;
  depensesTotales: number;
  coutMainOeuvre: number;
  coutTotal: number;
  margeGlobale: number;
};

type AlertLevel = 'ok' | 'warning' | 'critical';

// BR-C-015 : statut vert (dans le budget) ou rouge (en dépassement)
type StatutBudget = 'ok' | 'depassement';

export type SuiviBudgetaire = {
  budget: number;
  coutReel: number;
  ecart: number;
  statut: StatutBudget;
};

export type ChantierSyntheseData = {
  id: string;
  name: string;
  status: string;
  zoneCategorie: number | null;
  prixVenteHT: number;
  depensesTotales: number;
  coutMainOeuvre: number;
  coutTotal: number;
  marge: number;
  tauxRentabilite: number | null;
  alertLevel: AlertLevel;
};

export type IndicateursChantier = {
  chantierId: string;
  chantierName: string;
  perimetre: 'chantier';
  periodeDebut: string;
  periodeFin: string | null;
  budgetMainOeuvre: number;
  budgetMateriaux: number;
  budgetTotal: number;
  coefficient: number;
  chargeFixe: number;
  margeVisee: number;
  prixVenteHT: number;
  coutDepenses: number;
  coutMainOeuvre: number;
  coutMainOeuvreMajore: number;
  coutTotal: number;
  coutReel: number;
  totalMinutesValides: number;
  marge: number;
  margeNette: number;
  tauxRentabilite: number | null;
  suiviMainOeuvre: SuiviBudgetaire;
  suiviMateriaux: SuiviBudgetaire;
};

// BR-C-016 : même comparaison budget vs réel déclinée par tâche
export type SuiviTache = {
  tacheId: string;
  libelle: string;
  minutesMainOeuvre: number;
  heuresMainOeuvre: number;
  coutMainOeuvreInterne: number;
  coutMainOeuvreMajore: number;
  depensesMainOeuvre: number;
  depensesMateriaux: number;
  coutTotal: number;
  suiviMainOeuvre: SuiviBudgetaire;
  suiviMateriaux: SuiviBudgetaire;
};

export type ReportingGlobal = {
  dateFrom: string;
  dateTo: string;
  chantierId: string | null;
  capitalInitial: number;
  totalEntrees: number;
  totalSorties: number;
  soldeNet: number;
  tresorerieFinale: number;
  coutMainOeuvre: number;
  coutSousTraitance: number;
  coutMateriaux: number;
  coutAutres: number;
  coutTotal: number;
  serie: Array<{
    date: string;
    entrees: number;
    sorties: number;
    soldeCumule: number;
  }>;
  chantiers: Array<{
    id: string;
    name: string;
    status: string;
    startDate: string;
    endDate: string | null;
    coutMainOeuvre: number;
    coutSousTraitance: number;
    coutMateriaux: number;
    coutAutres: number;
    coutTotal: number;
  }>;
};

@Injectable()
export class RapportService {
  constructor(private readonly prisma: PrismaService) {}

  // US-001 : prix de vente HT = budget total × coefficient + marge
  private prixVenteHT(
    budget: number | null,
    coefficient: number | null | undefined,
    marge: number | null,
  ): number {
    return roundMoney((budget ?? 0) * (coefficient ?? 1) + (marge ?? 0));
  }

  // BR-C-015 : statut vert (dans le budget) ou rouge (en dépassement)
  private suivi(budget: number | null, coutReel: number): SuiviBudgetaire {
    const budgetPrevu = budget ?? 0;
    return {
      budget: roundMoney(budgetPrevu),
      coutReel: roundMoney(coutReel),
      ecart: roundMoney(budgetPrevu - coutReel),
      statut: coutReel > budgetPrevu ? 'depassement' : 'ok',
    };
  }

  private calculerParametresBudgetaires(chantier: {
    budget: number | null;
    budgetMainOeuvre: number | null;
    budgetMateriaux: number | null;
    coefficient: number | null;
    marge: number | null;
  }) {
    const budgetTotal = chantier.budget ?? 0;
    const coefficient = chantier.coefficient ?? 1;

    return {
      budgetMainOeuvre: chantier.budgetMainOeuvre ?? 0,
      budgetMateriaux: chantier.budgetMateriaux ?? 0,
      budgetTotal,
      coefficient,
      chargeFixe: budgetTotal * (coefficient - 1),
      margeVisee: chantier.marge ?? 0,
    };
  }

  private calculerCouts(
    depenses: Array<{ montant: number }>,
    pointages: Array<{
      totalMinutes?: number | null;
      totalHours: number | null;
      user: { tauxHoraire: number | null };
    }>,
  ) {
    const depensesTotales = depenses.reduce(
      (sum, depense) => sum + depense.montant,
      0,
    );
    const coutMainOeuvre = pointages.reduce(
      (sum, pointage) =>
        sum + durationHours(pointage) * (pointage.user.tauxHoraire ?? 0),
      0,
    );

    return {
      depensesTotales: roundMoney(depensesTotales),
      coutMainOeuvre: roundMoney(coutMainOeuvre),
      coutTotal: roundMoney(depensesTotales + coutMainOeuvre),
    };
  }

  private periodeRapport(dto: RapportPeriodeQueryDto) {
    const dateFrom = new Date(`${dto.dateFrom}T00:00:00.000Z`);
    const dateTo = new Date(`${dto.dateTo}T23:59:59.999Z`);
    if (dateFrom > dateTo) {
      throw new BadRequestException(
        'La date de début doit être antérieure à la date de fin',
      );
    }
    return { dateFrom, dateTo };
  }

  private dateKey(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  async updateTresorerie(
    companyId: string,
    dto: UpdateTresorerieDto,
  ) {
    return this.prisma.tresorerieConfiguration.upsert({
      where: { companyId },
      create: { companyId, capitalInitial: dto.capitalInitial },
      update: { capitalInitial: dto.capitalInitial },
      select: { capitalInitial: true, updatedAt: true },
    });
  }

  async getReportingGlobal(
    companyId: string,
    dto: RapportPeriodeQueryDto,
  ): Promise<ReportingGlobal> {
    const { dateFrom, dateTo } = this.periodeRapport(dto);
    const chantierWhere = {
      companyId,
      ...(dto.chantierId ? { id: dto.chantierId } : {}),
      startDate: { lte: dateTo },
      OR: [{ endDate: null }, { endDate: { gte: dateFrom } }],
    };
    const [configuration, chantiers] = await Promise.all([
      this.prisma.tresorerieConfiguration.findUnique({
        where: { companyId },
        select: { capitalInitial: true },
      }),
      this.prisma.chantier.findMany({
        where: chantierWhere,
        include: {
          depenses: {
            where: {
              statutControle: 'ACCEPTEE',
              date: { gte: dateFrom, lte: dateTo },
            },
            select: { montant: true, categorie: true, date: true },
          },
          pointages: {
            where: {
              status: 'VALIDE',
              startTime: { gte: dateFrom, lte: dateTo },
            },
            select: {
              totalMinutes: true,
              totalHours: true,
              startTime: true,
              user: { select: { tauxHoraire: true } },
            },
          },
        },
        orderBy: { startDate: 'asc' },
      }),
    ]);
    const capitalInitial = roundMoney(configuration?.capitalInitial ?? 0);
    const daily = new Map<string, { entrees: number; sorties: number }>();
    const currentDate = new Date(dateFrom);
    while (currentDate <= dateTo) {
      daily.set(this.dateKey(currentDate), { entrees: 0, sorties: 0 });
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    daily.get(this.dateKey(dateFrom))!.entrees = capitalInitial;

    let coutMainOeuvre = 0;
    let coutSousTraitance = 0;
    let coutMateriaux = 0;
    let coutAutres = 0;
    const chantierRows = chantiers.map((chantier) => {
      const row = {
        id: chantier.id,
        name: chantier.name,
        status: chantier.status,
        startDate: chantier.startDate.toISOString(),
        endDate: chantier.endDate?.toISOString() ?? null,
        coutMainOeuvre: 0,
        coutSousTraitance: 0,
        coutMateriaux: 0,
        coutAutres: 0,
        coutTotal: 0,
      };
      for (const pointage of chantier.pointages) {
        const cout = durationHours(pointage) * (pointage.user.tauxHoraire ?? 0);
        row.coutMainOeuvre += cout;
        coutMainOeuvre += cout;
        daily.get(this.dateKey(pointage.startTime))!.sorties += cout;
      }
      for (const depense of chantier.depenses) {
        const montant = depense.montant;
        if (depense.categorie === 'SOUS_TRAITANCE') {
          row.coutSousTraitance += montant;
          coutSousTraitance += montant;
        } else if (depense.categorie === 'MATERIEL') {
          row.coutMateriaux += montant;
          coutMateriaux += montant;
        } else {
          row.coutAutres += montant;
          coutAutres += montant;
        }
        daily.get(this.dateKey(depense.date))!.sorties += montant;
      }
      row.coutTotal =
        row.coutMainOeuvre +
        row.coutSousTraitance +
        row.coutMateriaux +
        row.coutAutres;
      return {
        ...row,
        coutMainOeuvre: roundMoney(row.coutMainOeuvre),
        coutSousTraitance: roundMoney(row.coutSousTraitance),
        coutMateriaux: roundMoney(row.coutMateriaux),
        coutAutres: roundMoney(row.coutAutres),
        coutTotal: roundMoney(row.coutTotal),
      };
    });
    const totalSorties = roundMoney(
      coutMainOeuvre + coutSousTraitance + coutMateriaux + coutAutres,
    );
    let soldeCumule = 0;
    const serie = [...daily.entries()].map(([date, values]) => {
      soldeCumule += values.entrees - values.sorties;
      return {
        date,
        entrees: roundMoney(values.entrees),
        sorties: roundMoney(values.sorties),
        soldeCumule: roundMoney(soldeCumule),
      };
    });
    const totalEntrees = roundMoney(serie.reduce((sum, day) => sum + day.entrees, 0));
    return {
      dateFrom: dto.dateFrom,
      dateTo: dto.dateTo,
      chantierId: dto.chantierId ?? null,
      capitalInitial,
      totalEntrees,
      totalSorties,
      soldeNet: roundMoney(totalEntrees - totalSorties),
      tresorerieFinale: roundMoney(totalEntrees - totalSorties),
      coutMainOeuvre: roundMoney(coutMainOeuvre),
      coutSousTraitance: roundMoney(coutSousTraitance),
      coutMateriaux: roundMoney(coutMateriaux),
      coutAutres: roundMoney(coutAutres),
      coutTotal: totalSorties,
      serie,
      chantiers: chantierRows,
    };
  }

  private async getChantiersFinanciers(companyId: string) {
    return this.prisma.chantier.findMany({
      where: { companyId, status: 'EN_COURS' },
      include: {
        depenses: {
          where: { statutControle: 'ACCEPTEE' },
          select: { montant: true },
        },
        pointages: {
          where: { status: 'VALIDE' },
          select: {
            totalMinutes: true,
            totalHours: true,
            user: { select: { tauxHoraire: true } },
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async getDashboardStats(companyId: string): Promise<DashboardStats> {
    const chantiers = await this.getChantiersFinanciers(companyId);

    const chantiersActifs = chantiers.length;
    const caTotalHT = chantiers.reduce(
      (sum, c) => sum + this.prixVenteHT(c.budget, c.coefficient, c.marge),
      0,
    );
    const couts = chantiers.reduce(
      (total, chantier) => {
        const coutsChantier = this.calculerCouts(
          chantier.depenses,
          chantier.pointages,
        );
        return {
          depensesTotales:
            total.depensesTotales + coutsChantier.depensesTotales,
          coutMainOeuvre: total.coutMainOeuvre + coutsChantier.coutMainOeuvre,
          coutTotal: total.coutTotal + coutsChantier.coutTotal,
        };
      },
      { depensesTotales: 0, coutMainOeuvre: 0, coutTotal: 0 },
    );
    const margeGlobale = chantiers.reduce((sum, chantier) => {
      const coutsChantier = this.calculerCouts(
        chantier.depenses,
        chantier.pointages,
      );
      const prixVenteHT = this.prixVenteHT(
        chantier.budget,
        chantier.coefficient,
        chantier.marge,
      );
      return (
        sum -
        (chantier.coefficient ?? 1) * coutsChantier.coutTotal +
        prixVenteHT
      );
    }, 0);

    return { chantiersActifs, caTotalHT, ...couts, margeGlobale };
  }

  async getChantiersSynthese(
    companyId: string,
  ): Promise<ChantierSyntheseData[]> {
    const chantiers = await this.getChantiersFinanciers(companyId);

    return chantiers.map((chantier) => {
      const couts = this.calculerCouts(chantier.depenses, chantier.pointages);
      const prixVenteHT = this.prixVenteHT(
        chantier.budget,
        chantier.coefficient,
        chantier.marge,
      );
      const marge = prixVenteHT - (chantier.coefficient ?? 1) * couts.coutTotal;
      const tauxRentabilite =
        prixVenteHT > 0 ? Math.round((marge / prixVenteHT) * 100) : null;

      // BR-024 : alerte si marge négative ou < 15 % du prix de vente
      const alertLevel: AlertLevel =
        marge < 0 ? 'critical' : marge < prixVenteHT * 0.15 ? 'warning' : 'ok';

      return {
        id: chantier.id,
        name: chantier.name,
        status: chantier.status,
        zoneCategorie: chantier.zoneCategorie,
        prixVenteHT,
        depensesTotales: couts.depensesTotales,
        coutMainOeuvre: couts.coutMainOeuvre,
        coutTotal: couts.coutTotal,
        marge,
        tauxRentabilite,
        alertLevel,
      };
    });
  }

  async getIndicateursChantier(
    chantierId: string,
    companyId: string,
  ): Promise<IndicateursChantier> {
    const chantier = await this.prisma.chantier.findFirst({
      where: { id: chantierId, companyId },
      include: {
        depenses: {
          where: { statutControle: 'ACCEPTEE' },
          select: { montant: true, categorie: true },
        },
        pointages: {
          where: { status: 'VALIDE' },
          select: {
            totalMinutes: true,
            totalHours: true,
            startTime: true,
            user: { select: { tauxHoraire: true } },
          },
        },
      },
    });
    if (!chantier) throw new NotFoundException('Chantier introuvable');

    const couts = this.calculerCouts(chantier.depenses, chantier.pointages);
    const majorations = this.prisma.zoneMajoration
      ? await this.prisma.zoneMajoration.findMany({
          where: { companyId },
          orderBy: { dateEffet: 'desc' },
        })
      : [];
    const coutMainOeuvreMajore = chantier.pointages.reduce((sum, pointage) => {
      const tauxMajoration = resolveZoneMajoration(
        chantier.zoneCategorie ?? 1,
        pointage.startTime,
        majorations,
      );
      return (
        sum +
        durationHours(pointage) *
          (pointage.user.tauxHoraire ?? 0) *
          (1 + tauxMajoration)
      );
    }, 0);
    const totalMinutesValides = chantier.pointages.reduce(
      (sum, pointage) => sum + durationMinutes(pointage),
      0,
    );
    const coutDepenses = couts.depensesTotales;
    const coutMainOeuvreInterne = couts.coutMainOeuvre;
    const coutTotal = couts.coutTotal;
    const budget = this.calculerParametresBudgetaires(chantier);
    const prixVenteHT = this.prixVenteHT(
      chantier.budget,
      chantier.coefficient,
      chantier.marge,
    );
    const margeNette = roundMoney(
      prixVenteHT - (chantier.coefficient ?? 1) * coutTotal,
    );
    // US-002 : taux de rentabilité basé sur la marge nette
    const tauxRentabilite =
      prixVenteHT > 0 ? roundMoney((margeNette / prixVenteHT) * 100) : null;

    const depensesMainOeuvre = chantier.depenses
      .filter(
        (d) =>
          DEPENSE_CATEGORIE_RULES[d.categorie].budgetImpact === 'MAIN_OEUVRE',
      )
      .reduce((sum, d) => sum + d.montant, 0);
    const depensesMateriaux = chantier.depenses
      .filter(
        (d) =>
          DEPENSE_CATEGORIE_RULES[d.categorie].budgetImpact === 'MATERIAUX',
      )
      .reduce((sum, d) => sum + d.montant, 0);

    // BR-C-013 : coût réel MO = main d'œuvre interne valorisée + sous-traitance
    const suiviMainOeuvre = this.suivi(
      chantier.budgetMainOeuvre,
      coutMainOeuvreMajore + depensesMainOeuvre,
    );
    // BR-C-014 : coût réel matériaux = dépenses de catégorie Matériaux
    const suiviMateriaux = this.suivi(
      chantier.budgetMateriaux,
      depensesMateriaux,
    );

    return {
      chantierId,
      chantierName: chantier.name,
      perimetre: 'chantier',
      periodeDebut: chantier.startDate.toISOString(),
      periodeFin: chantier.endDate?.toISOString() ?? null,
      ...budget,
      prixVenteHT,
      coutDepenses,
      coutMainOeuvre: coutMainOeuvreInterne,
      coutMainOeuvreMajore: roundMoney(coutMainOeuvreMajore),
      coutTotal,
      coutReel: coutTotal,
      totalMinutesValides,
      marge: margeNette,
      margeNette,
      tauxRentabilite,
      suiviMainOeuvre,
      suiviMateriaux,
    };
  }

  // BR-C-016 : suivi budgétaire décliné par tâche, trié par dépassement décroissant (CA3)
  async getSuiviTachesChantier(
    chantierId: string,
    companyId: string,
  ): Promise<SuiviTache[]> {
    const chantier = await this.prisma.chantier.findFirst({
      where: { id: chantierId, companyId },
    });
    if (!chantier) throw new NotFoundException('Chantier introuvable');

    const taches = await this.prisma.tacheChantier.findMany({
      where: { chantierId, companyId },
      include: {
        depenses: {
          where: { statutControle: 'ACCEPTEE' },
          select: { montant: true, categorie: true },
        },
        repartitions: {
          where: { companyId, pointage: { status: 'VALIDE' } },
          select: {
            minutes: true,
            pointage: {
              select: {
                startTime: true,
                user: { select: { tauxHoraire: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    const majorations = this.prisma.zoneMajoration
      ? await this.prisma.zoneMajoration.findMany({
          where: { companyId },
          orderBy: { dateEffet: 'desc' },
        })
      : [];

    const suivis = taches.map((tache) => {
      const minutesMainOeuvre = tache.repartitions.reduce(
        (sum, repartition) => sum + repartition.minutes,
        0,
      );
      const heuresMainOeuvre = tache.repartitions.reduce(
        (sum, repartition) => sum + repartition.minutes / 60,
        0,
      );
      const coutMainOeuvreInterne = tache.repartitions.reduce(
        (sum, repartition) =>
          sum +
          (repartition.minutes / 60) *
            (repartition.pointage.user.tauxHoraire ?? 0),
        0,
      );
      const coutMainOeuvreMajore = tache.repartitions.reduce(
        (sum, repartition) => {
          const tauxMajoration = resolveZoneMajoration(
            chantier.zoneCategorie ?? 1,
            repartition.pointage.startTime,
            majorations,
          );
          return (
            sum +
            (repartition.minutes / 60) *
              (repartition.pointage.user.tauxHoraire ?? 0) *
              (1 + tauxMajoration)
          );
        },
        0,
      );
      const depensesMainOeuvre = tache.depenses
        .filter(
          (d) =>
            DEPENSE_CATEGORIE_RULES[d.categorie].budgetImpact === 'MAIN_OEUVRE',
        )
        .reduce((sum, d) => sum + d.montant, 0);
      const depensesMateriaux = tache.depenses
        .filter(
          (d) =>
            DEPENSE_CATEGORIE_RULES[d.categorie].budgetImpact === 'MATERIAUX',
        )
        .reduce((sum, d) => sum + d.montant, 0);
      const coutReelMainOeuvre = coutMainOeuvreInterne + depensesMainOeuvre;
      const coutReelMainOeuvreMajore =
        coutMainOeuvreMajore + depensesMainOeuvre;

      return {
        tacheId: tache.id,
        libelle: tache.libelle,
        minutesMainOeuvre,
        heuresMainOeuvre: roundMoney(heuresMainOeuvre, 2),
        coutMainOeuvreInterne: roundMoney(coutMainOeuvreInterne),
        coutMainOeuvreMajore: roundMoney(coutMainOeuvreMajore),
        depensesMainOeuvre: roundMoney(depensesMainOeuvre),
        depensesMateriaux: roundMoney(depensesMateriaux),
        coutTotal: roundMoney(coutReelMainOeuvre + depensesMateriaux),
        suiviMainOeuvre: this.suivi(
          tache.budgetMainOeuvre,
          coutReelMainOeuvreMajore,
        ),
        suiviMateriaux: this.suivi(tache.budgetMateriaux, depensesMateriaux),
      };
    });

    // BR-C-015/CA3 : dépassement = part du coût réel excédant le budget, tri décroissant
    const depassement = (suivi: SuiviTache) =>
      Math.max(0, -suivi.suiviMainOeuvre.ecart) +
      Math.max(0, -suivi.suiviMateriaux.ecart);

    return suivis.sort((a, b) => depassement(b) - depassement(a));
  }
}
