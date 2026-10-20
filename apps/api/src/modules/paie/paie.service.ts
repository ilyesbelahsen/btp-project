import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { durationHours, roundMoney } from '../../common/precision';
import { PaiePreviewQueryDto } from './dto/paie-preview-query.dto';
import { CreatePaieCorrectionDto } from './dto/create-paie-correction.dto';
import { resolveZoneMajoration } from '../zone/zone.service';
import { CreateIndemniteDto } from './dto/create-indemnite.dto';
import { UpdateIndemniteDto } from './dto/update-indemnite.dto';
import { CreateIndemniteAffectationDto } from './dto/create-indemnite-affectation.dto';
import { UpdateIndemniteAffectationDto } from './dto/update-indemnite-affectation.dto';

export type PaiePreviewRow = {
  userId: string;
  firstName: string;
  lastName: string;
  tauxHoraire: number | null;
  totalHeuresTravaillees: number;
  heuresMajorees: number;
  coutMainOeuvreMajore: number;
  details: PaiePreviewDetail[];
  nombreIndemnites: number;
  montantIndemnites: number;
  indemnites: PaiePreviewIndemnite[];
  chantiers: string[];
  heuresMajoreesCorrigees: number | null;
  nombreIndemnitesCorrigees: number | null;
  heuresMajoreesRetenues: number;
  nombreIndemnitesRetenues: number;
  correction: {
    id: string;
    statut: 'EN_ATTENTE' | 'VALIDEE';
    motif: string;
    corrigeeAt: Date;
    corrigeePar: { id: string; firstName: string; lastName: string };
    valideeAt: Date | null;
    valideePar: { id: string; firstName: string; lastName: string } | null;
  } | null;
};

export type PaiePreviewDetail = {
  chantier: string;
  zoneCategorie: number;
  tauxHoraire: number | null;
  tauxMajoration: number;
  heuresValidees: number;
  coutMainOeuvreMajore: number;
};

export type PaiePreviewIndemnite = {
  id: string;
  libelle: string;
  montant: number | null;
  quantite: number;
};

type ComputedPaieRow = Omit<
  PaiePreviewRow,
  | 'heuresMajoreesCorrigees'
  | 'nombreIndemnitesCorrigees'
  | 'heuresMajoreesRetenues'
  | 'nombreIndemnitesRetenues'
  | 'correction'
>;

@Injectable()
export class PaieService {
  constructor(private readonly prisma: PrismaService) {}

  private periodeDates(dto: PaiePreviewQueryDto) {
    const dateFrom = new Date(dto.dateFrom);
    const dateTo = new Date(dto.dateTo);
    if (dateFrom > dateTo) {
      throw new BadRequestException(
        'La date de début doit être antérieure à la date de fin',
      );
    }
    return { dateFrom, dateTo };
  }

  private async computePreview(
    companyId: string,
    dto: PaiePreviewQueryDto,
  ): Promise<ComputedPaieRow[]> {
    const { dateFrom, dateTo } = this.periodeDates(dto);
    const pointages = await this.prisma.pointage.findMany({
      where: {
        companyId,
        status: 'VALIDE',
        startTime: {
          gte: dateFrom,
          lte: new Date(`${dto.dateTo}T23:59:59.999Z`),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            tauxHoraire: true,
          },
        },
        chantier: { select: { name: true, zoneCategorie: true } },
      },
      orderBy: { startTime: 'asc' },
    });
    const majorations = await this.prisma.zoneMajoration.findMany({
      where: { companyId },
      orderBy: { dateEffet: 'desc' },
    });
    const affectations = await this.prisma.indemniteAffectation.findMany({
      where: {
        companyId,
        dateFrom: { lte: new Date(`${dto.dateTo}T23:59:59.999Z`) },
        dateTo: { gte: dateFrom },
      },
      include: {
        indemnite: {
          select: { id: true, libelle: true, montant: true },
        },
      },
    });
    const affectationsParOuvrier = new Map<string, PaiePreviewIndemnite[]>();
    for (const affectation of affectations) {
      const indemnites = affectationsParOuvrier.get(affectation.userId) ?? [];
      indemnites.push({
        id: affectation.indemnite.id,
        libelle: affectation.indemnite.libelle,
        montant: affectation.indemnite.montant,
        quantite: affectation.quantite,
      });
      affectationsParOuvrier.set(affectation.userId, indemnites);
    }

    type UserAccumulator = {
      userId: string;
      firstName: string;
      lastName: string;
      tauxHoraire: number | null;
      totalHeuresTravaillees: number;
      heuresMajorees: number;
      coutMainOeuvreMajore: number;
      details: Map<string, PaiePreviewDetail>;
      chantiersSet: Set<string>;
      joursSet: Set<string>;
      indemnites: PaiePreviewIndemnite[];
    };

    const parOuvrier = new Map<string, UserAccumulator>();

    for (const pointage of pointages) {
      const userId = pointage.userId;
      if (!parOuvrier.has(userId)) {
        parOuvrier.set(userId, {
          userId,
          firstName: pointage.user.firstName,
          lastName: pointage.user.lastName,
          tauxHoraire: pointage.user.tauxHoraire,
          totalHeuresTravaillees: 0,
          heuresMajorees: 0,
          coutMainOeuvreMajore: 0,
          details: new Map(),
          chantiersSet: new Set(),
          joursSet: new Set(),
          indemnites: affectationsParOuvrier.get(userId) ?? [],
        });
      }

      const entry = parOuvrier.get(userId)!;
      const heures = durationHours(pointage);
      const zone = pointage.chantier.zoneCategorie ?? 1;
      const taux = resolveZoneMajoration(zone, pointage.startTime, majorations);
      const coutMainOeuvreMajore =
        heures * (pointage.user.tauxHoraire ?? 0) * (1 + taux);
      const detailKey = `${pointage.chantier.name}:${zone}`;
      const detail = entry.details.get(detailKey) ?? {
        chantier: pointage.chantier.name,
        zoneCategorie: zone,
        tauxHoraire: pointage.user.tauxHoraire,
        tauxMajoration: taux,
        heuresValidees: 0,
        coutMainOeuvreMajore: 0,
      };

      entry.totalHeuresTravaillees += heures;
      entry.heuresMajorees += heures * taux;
      entry.coutMainOeuvreMajore += coutMainOeuvreMajore;
      detail.heuresValidees += heures;
      detail.coutMainOeuvreMajore += coutMainOeuvreMajore;
      entry.details.set(detailKey, detail);
      entry.chantiersSet.add(pointage.chantier.name);

      // CA5 : une indemnité par jour effectué dans une zone
      const jour = pointage.startTime.toISOString().split('T')[0];
      entry.joursSet.add(jour);
    }

    return [...parOuvrier.values()].map((entry) => ({
      userId: entry.userId,
      firstName: entry.firstName,
      lastName: entry.lastName,
      tauxHoraire: entry.tauxHoraire,
      totalHeuresTravaillees: roundMoney(entry.totalHeuresTravaillees),
      heuresMajorees: roundMoney(entry.heuresMajorees),
      coutMainOeuvreMajore: roundMoney(entry.coutMainOeuvreMajore),
      details: [...entry.details.values()].map((detail) => ({
        ...detail,
        heuresValidees: roundMoney(detail.heuresValidees),
        coutMainOeuvreMajore: roundMoney(detail.coutMainOeuvreMajore),
      })),
      nombreIndemnites:
        entry.indemnites.length > 0
          ? roundMoney(
              entry.indemnites.reduce(
                (sum, indemnite) => sum + indemnite.quantite,
                0,
              ),
            )
          : entry.joursSet.size,
      montantIndemnites: roundMoney(
        entry.indemnites.reduce(
          (sum, indemnite) =>
            sum + (indemnite.montant ?? 0) * indemnite.quantite,
          0,
        ),
      ),
      indemnites: entry.indemnites,
      chantiers: [...entry.chantiersSet],
    }));
  }

  async getPreview(
    companyId: string,
    dto: PaiePreviewQueryDto,
  ): Promise<PaiePreviewRow[]> {
    const { dateFrom, dateTo } = this.periodeDates(dto);
    const computedRows = await this.computePreview(companyId, dto);
    const corrections = await this.prisma.paieCorrection.findMany({
      where: { companyId, dateFrom, dateTo },
      include: {
        corrigeePar: { select: { id: true, firstName: true, lastName: true } },
        valideePar: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    const correctionsByUser = new Map(
      corrections.map((correction) => [correction.userId, correction]),
    );

    return computedRows.map((row) => {
      const correction = correctionsByUser.get(row.userId);
      const heuresMajoreesCorrigees =
        correction?.heuresMajoreesCorrigees ?? null;
      const nombreIndemnitesCorrigees =
        correction?.nombreIndemnitesCorrigees ?? null;
      const correctionValidee = correction?.statut === 'VALIDEE';

      return {
        ...row,
        heuresMajoreesCorrigees,
        nombreIndemnitesCorrigees,
        heuresMajoreesRetenues:
          correctionValidee && heuresMajoreesCorrigees !== null
            ? heuresMajoreesCorrigees
            : row.heuresMajorees,
        nombreIndemnitesRetenues:
          correctionValidee && nombreIndemnitesCorrigees !== null
            ? nombreIndemnitesCorrigees
            : row.nombreIndemnites,
        correction: correction
          ? {
              id: correction.id,
              statut: correction.statut,
              motif: correction.motif,
              corrigeeAt: correction.corrigeeAt,
              corrigeePar: correction.corrigeePar,
              valideeAt: correction.valideeAt,
              valideePar: correction.valideePar,
            }
          : null,
      };
    });
  }

  async getExport(
    companyId: string,
    dto: PaiePreviewQueryDto,
  ): Promise<PaiePreviewRow[]> {
    const { dateFrom, dateTo } = this.periodeDates(dto);
    const pendingCorrection = await this.prisma.paieCorrection.findFirst({
      where: { companyId, dateFrom, dateTo, statut: 'EN_ATTENTE' },
      select: { id: true },
    });
    if (pendingCorrection) {
      throw new ConflictException(
        'Toutes les corrections de la période doivent être validées avant export',
      );
    }
    return this.getPreview(companyId, dto);
  }

  async createCorrection(
    companyId: string,
    auteurId: string,
    dto: CreatePaieCorrectionDto,
  ) {
    if (
      dto.heuresMajorees === undefined &&
      dto.nombreIndemnites === undefined
    ) {
      throw new BadRequestException(
        'Au moins une valeur de paie doit être corrigée',
      );
    }

    const { dateFrom, dateTo } = this.periodeDates(dto);
    const computedRow = (await this.computePreview(companyId, dto)).find(
      (row) => row.userId === dto.userId,
    );
    if (!computedRow) {
      throw new NotFoundException(
        'Aucun pointage validé pour cet ouvrier sur la période',
      );
    }

    const existing = await this.prisma.paieCorrection.findFirst({
      where: { companyId, userId: dto.userId, dateFrom, dateTo },
    });
    if (existing?.statut === 'VALIDEE') {
      throw new ConflictException(
        'Une correction validée ne peut plus être modifiée',
      );
    }

    const heuresMajoreesCorrigees =
      dto.heuresMajorees ?? existing?.heuresMajoreesCorrigees ?? null;
    const nombreIndemnitesCorrigees =
      dto.nombreIndemnites ?? existing?.nombreIndemnitesCorrigees ?? null;
    const corrigeeAt = new Date();

    const correction = await this.prisma.$transaction(async (transaction) => {
      const saved = existing
        ? await transaction.paieCorrection.update({
            where: { id: existing.id },
            data: {
              heuresMajoreesCalculees: computedRow.heuresMajorees,
              heuresMajoreesCorrigees,
              nombreIndemnitesCalculees: computedRow.nombreIndemnites,
              nombreIndemnitesCorrigees,
              motif: dto.motif.trim(),
              statut: 'EN_ATTENTE',
              corrigeeParId: auteurId,
              corrigeeAt,
              valideeParId: null,
              valideeAt: null,
            },
          })
        : await transaction.paieCorrection.create({
            data: {
              companyId,
              userId: dto.userId,
              dateFrom,
              dateTo,
              heuresMajoreesCalculees: computedRow.heuresMajorees,
              heuresMajoreesCorrigees,
              nombreIndemnitesCalculees: computedRow.nombreIndemnites,
              nombreIndemnitesCorrigees,
              motif: dto.motif.trim(),
              corrigeeParId: auteurId,
              corrigeeAt,
            },
          });

      await transaction.paieCorrectionHistorique.create({
        data: {
          correctionId: saved.id,
          companyId,
          action: 'CORRIGEE',
          heuresMajorees: heuresMajoreesCorrigees,
          indemnites: nombreIndemnitesCorrigees,
          motif: dto.motif.trim(),
          auteurId,
          createdAt: corrigeeAt,
        },
      });
      return saved;
    });

    return correction;
  }

  async validerCorrection(id: string, companyId: string, auteurId: string) {
    const correction = await this.prisma.paieCorrection.findFirst({
      where: { id, companyId },
    });
    if (!correction) throw new NotFoundException('Correction introuvable');
    if (correction.statut === 'VALIDEE') {
      throw new ConflictException('La correction est déjà validée');
    }

    const valideeAt = new Date();
    await this.prisma.$transaction(async (transaction) => {
      const updated = await transaction.paieCorrection.updateMany({
        where: { id, companyId, statut: 'EN_ATTENTE' },
        data: { statut: 'VALIDEE', valideeParId: auteurId, valideeAt },
      });
      if (updated.count === 0) {
        throw new ConflictException('La correction ne peut plus être validée');
      }
      await transaction.paieCorrectionHistorique.create({
        data: {
          correctionId: id,
          companyId,
          action: 'VALIDEE',
          heuresMajorees: correction.heuresMajoreesCorrigees,
          indemnites: correction.nombreIndemnitesCorrigees,
          auteurId,
          createdAt: valideeAt,
        },
      });
    });

    return this.prisma.paieCorrection.findFirstOrThrow({ where: { id } });
  }

  async getCorrectionHistory(id: string, companyId: string) {
    const correction = await this.prisma.paieCorrection.findFirst({
      where: { id, companyId },
      select: { id: true },
    });
    if (!correction) throw new NotFoundException('Correction introuvable');

    return this.prisma.paieCorrectionHistorique.findMany({
      where: { correctionId: id, companyId },
      include: {
        auteur: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private validateIndemniteDefinition(dto: CreateIndemniteDto) {
    if (dto.montant === undefined && !dto.regle?.trim()) {
      throw new BadRequestException(
        'Une indemnité doit définir un montant ou une règle de calcul',
      );
    }
  }

  async findIndemnites(companyId: string) {
    return this.prisma.indemnite.findMany({
      where: { companyId },
      orderBy: [{ actif: 'desc' }, { libelle: 'asc' }],
    });
  }

  async createIndemnite(companyId: string, dto: CreateIndemniteDto) {
    this.validateIndemniteDefinition(dto);
    return this.prisma.indemnite.create({
      data: {
        companyId,
        libelle: dto.libelle.trim(),
        montant: dto.montant,
        regle: dto.regle?.trim(),
      },
    });
  }

  async updateIndemnite(
    id: string,
    companyId: string,
    dto: UpdateIndemniteDto,
  ) {
    const existing = await this.prisma.indemnite.findFirst({
      where: { id, companyId },
    });
    if (!existing) throw new NotFoundException('Indemnité introuvable');

    const definition = {
      montant: dto.montant ?? existing.montant,
      regle: dto.regle ?? existing.regle,
    };
    if (definition.montant === null && !definition.regle?.trim()) {
      throw new BadRequestException(
        'Une indemnité doit définir un montant ou une règle de calcul',
      );
    }

    return this.prisma.indemnite.update({
      where: { id },
      data: {
        libelle: dto.libelle?.trim(),
        montant: dto.montant,
        regle: dto.regle?.trim(),
        actif: dto.actif,
      },
    });
  }

  async findIndemniteAffectations(companyId: string, userId?: string) {
    return this.prisma.indemniteAffectation.findMany({
      where: { companyId, ...(userId ? { userId } : {}) },
      include: {
        indemnite: true,
        user: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [{ dateFrom: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createIndemniteAffectation(
    companyId: string,
    createdById: string,
    dto: CreateIndemniteAffectationDto,
  ) {
    const dateFrom = new Date(dto.dateFrom);
    const dateTo = new Date(dto.dateTo);
    if (dateFrom > dateTo) {
      throw new BadRequestException(
        'La date de début doit être antérieure à la date de fin',
      );
    }

    const [indemnite, user] = await Promise.all([
      this.prisma.indemnite.findFirst({
        where: { id: dto.indemniteId, companyId, actif: true },
      }),
      this.prisma.user.findFirst({
        where: { id: dto.userId, companyId, role: 'OUVRIER' },
        select: { id: true },
      }),
    ]);
    if (!indemnite)
      throw new NotFoundException('Indemnité introuvable ou inactive');
    if (!user) throw new NotFoundException('Ouvrier introuvable');

    try {
      return await this.prisma.indemniteAffectation.create({
        data: {
          companyId,
          indemniteId: dto.indemniteId,
          userId: dto.userId,
          createdById,
          dateFrom,
          dateTo,
          quantite: dto.quantite ?? 1,
          note: dto.note?.trim(),
        },
        include: {
          indemnite: true,
          user: { select: { id: true, firstName: true, lastName: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
      });
    } catch (error: unknown) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException(
          'Cette indemnité est déjà affectée à cet ouvrier pour cette période',
        );
      }
      throw error;
    }
  }

  async deleteIndemniteAffectation(id: string, companyId: string) {
    const deleted = await this.prisma.indemniteAffectation.deleteMany({
      where: { id, companyId },
    });
    if (deleted.count === 0)
      throw new NotFoundException('Affectation introuvable');
    return { success: true };
  }

  async updateIndemniteAffectation(
    id: string,
    companyId: string,
    dto: UpdateIndemniteAffectationDto,
  ) {
    const existing = await this.prisma.indemniteAffectation.findFirst({
      where: { id, companyId },
    });
    if (!existing) throw new NotFoundException('Affectation introuvable');

    const dateFrom = dto.dateFrom ? new Date(dto.dateFrom) : existing.dateFrom;
    const dateTo = dto.dateTo ? new Date(dto.dateTo) : existing.dateTo;
    if (dateFrom > dateTo) {
      throw new BadRequestException(
        'La date de début doit être antérieure à la date de fin',
      );
    }

    try {
      return await this.prisma.indemniteAffectation.update({
        where: { id },
        data: {
          dateFrom,
          dateTo,
          quantite: dto.quantite,
          note: dto.note?.trim(),
        },
        include: {
          indemnite: true,
          user: { select: { id: true, firstName: true, lastName: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
      });
    } catch (error: unknown) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException(
          'Cette indemnité est déjà affectée à cet ouvrier pour cette période',
        );
      }
      throw error;
    }
  }
}
