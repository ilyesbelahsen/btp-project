import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Depense, Prisma, TacheChantier } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepenseDto } from './dto/create-depense.dto';
import { ControleDepenseDto } from './dto/controle-depense.dto';
import { DEPENSE_CATEGORIE_RULES } from './depense-categories.constants';

export type DepenseWithTache = Depense & { tacheLibelle: string | null };

@Injectable()
export class DepenseService {
  constructor(private readonly prisma: PrismaService) {}

  private withTacheLibelle(
    depense: Depense & { tache: Pick<TacheChantier, 'libelle'> | null },
  ): DepenseWithTache {
    const { tache, ...rest } = depense;
    return { ...rest, tacheLibelle: tache?.libelle ?? null };
  }

  async create(
    companyId: string,
    dto: CreateDepenseDto,
    idempotencyKey?: string,
    createdById?: string,
    requesterRole?: string,
  ): Promise<DepenseWithTache> {
    if (!DEPENSE_CATEGORIE_RULES[dto.categorie].disponibleEnSaisie) {
      throw new BadRequestException(
        'Cette catégorie historique ne peut plus être utilisée pour une nouvelle dépense',
      );
    }

    const chantier = await this.prisma.chantier.findFirst({
      where: { id: dto.chantierId, companyId },
    });
    if (!chantier) throw new NotFoundException('Chantier introuvable');

    if (requesterRole === 'CONDUCTEUR') {
      const accessible = await this.prisma.chantier.findFirst({
        where: {
          id: dto.chantierId,
          companyId,
          conducteurs: { some: { id: createdById } },
        },
        select: { id: true },
      });
      if (!accessible) throw new NotFoundException('Chantier introuvable');
    }

    // BR-C-011 : la tâche doit appartenir au même chantier et à la même entreprise
    const tache = await this.prisma.tacheChantier.findFirst({
      where: { id: dto.tacheId, chantierId: dto.chantierId, companyId },
    });
    if (!tache) throw new NotFoundException('Tâche introuvable');

    if (idempotencyKey) {
      const existingDepense = await this.prisma.depense.findFirst({
        where: { companyId, idempotencyKey },
        include: { tache: { select: { libelle: true } } },
      });
      if (existingDepense) return this.withTacheLibelle(existingDepense);
    }

    try {
      const depense = await this.prisma.depense.create({
        data: {
          chantierId: dto.chantierId,
          companyId,
          tacheId: dto.tacheId,
          categorie: dto.categorie,
          montant: dto.montant,
          date: new Date(dto.date),
          description: dto.description?.trim() ?? '',
          fournisseur: dto.fournisseur?.trim() || null,
          createdById,
          idempotencyKey,
        },
        include: { tache: { select: { libelle: true } } },
      });
      return this.withTacheLibelle(depense);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        idempotencyKey
      ) {
        const existingDepense = await this.prisma.depense.findFirst({
          where: { companyId, idempotencyKey },
          include: { tache: { select: { libelle: true } } },
        });
        if (existingDepense) return this.withTacheLibelle(existingDepense);
      }
      throw error;
    }
  }

  async findByChantier(
    chantierId: string,
    companyId: string,
    userId?: string,
    userRole?: string,
  ): Promise<DepenseWithTache[]> {
    if (userRole === 'CONDUCTEUR') {
      const accessible = await this.prisma.chantier.findFirst({
        where: {
          id: chantierId,
          companyId,
          conducteurs: { some: { id: userId } },
        },
        select: { id: true },
      });
      if (!accessible) throw new NotFoundException('Chantier introuvable');
    }
    const depenses = await this.prisma.depense.findMany({
      where: { chantierId, companyId },
      include: { tache: { select: { libelle: true } } },
      orderBy: { date: 'desc' },
    });
    return depenses.map((depense) => this.withTacheLibelle(depense));
  }

  async controler(
    id: string,
    companyId: string,
    auteurId: string,
    dto: ControleDepenseDto,
  ): Promise<DepenseWithTache> {
    const motifRejet = dto.motifRejet?.trim() || null;
    if (dto.statut === 'REJETEE' && !motifRejet) {
      throw new BadRequestException('Le motif de rejet est obligatoire');
    }

    const depense = await this.prisma.depense.findFirst({
      where: { id, companyId },
    });
    if (!depense) throw new NotFoundException('Dépense introuvable');
    if (depense.statutControle === 'ACCEPTEE') {
      throw new ConflictException(
        'Une dépense acceptée ne peut plus être contrôlée',
      );
    }

    const controleeAt = new Date();
    await this.prisma.$transaction(async (transaction) => {
      const updated = await transaction.depense.updateMany({
        where: {
          id,
          companyId,
          statutControle: { in: ['A_CONTROLER', 'REJETEE'] },
        },
        data: {
          statutControle: dto.statut,
          motifRejet: dto.statut === 'REJETEE' ? motifRejet : null,
          controleeAt,
          controleeParId: auteurId,
        },
      });
      if (updated.count === 0) {
        throw new ConflictException('La dépense ne peut plus être contrôlée');
      }

      await transaction.depenseControleHistorique.create({
        data: {
          depenseId: id,
          companyId,
          statut: dto.statut,
          motif: dto.statut === 'REJETEE' ? motifRejet : null,
          auteurId,
          createdAt: controleeAt,
        },
      });
    });

    return this.findOneWithTache(id, companyId);
  }

  async historique(id: string, companyId: string) {
    const depense = await this.prisma.depense.findFirst({
      where: { id, companyId },
      select: { id: true },
    });
    if (!depense) throw new NotFoundException('Dépense introuvable');

    return this.prisma.depenseControleHistorique.findMany({
      where: { depenseId: id, companyId },
      include: {
        auteur: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async findOneWithTache(
    id: string,
    companyId: string,
  ): Promise<DepenseWithTache> {
    const depense = await this.prisma.depense.findFirst({
      where: { id, companyId },
      include: { tache: { select: { libelle: true } } },
    });
    if (!depense) throw new NotFoundException('Dépense introuvable');
    return this.withTacheLibelle(depense);
  }
}
