import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveTachesDevisDto } from './dto/save-taches-devis.dto';
import { TacheDto } from './dto/tache.dto';
import { UpdateTacheDto } from './dto/update-tache.dto';

@Injectable()
export class TacheChantierService {
  constructor(private readonly prisma: PrismaService) {}

  async findByChantier(
    chantierId: string,
    companyId: string,
    userId?: string,
    userRole?: string,
  ) {
    const chantier = await this.prisma.chantier.findFirst({
      where: {
        id: chantierId,
        companyId,
        ...(userRole === 'CONDUCTEUR' && {
          conducteurs: { some: { id: userId } },
        }),
        ...(userRole === 'OUVRIER' && {
          status: 'EN_COURS',
          ouvriers: { some: { id: userId } },
        }),
      },
    });
    if (!chantier) throw new NotFoundException('Chantier introuvable');

    return this.prisma.tacheChantier.findMany({
      where: { chantierId, companyId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async saveBatch(
    chantierId: string,
    companyId: string,
    dto: SaveTachesDevisDto,
  ) {
    const chantier = await this.prisma.chantier.findFirst({
      where: { id: chantierId, companyId },
    });
    if (!chantier) throw new NotFoundException('Chantier introuvable');

    // Remplace toutes les tâches existantes importées depuis devis
    await this.prisma.tacheChantier.deleteMany({
      where: { chantierId, companyId },
    });

    return this.prisma.tacheChantier.createMany({
      data: dto.taches.map((t) => ({
        chantierId,
        companyId,
        libelle: t.libelle,
        prixVenduHT: t.prixVenduHT ?? null,
        budgetMainOeuvre: t.budgetMainOeuvre ?? null,
        budgetMateriaux: t.budgetMateriaux ?? null,
      })),
    });
  }

  async create(
    chantierId: string,
    companyId: string,
    dto: TacheDto,
    userId?: string,
    userRole?: string,
  ) {
    const chantier = await this.prisma.chantier.findFirst({
      where: {
        id: chantierId,
        companyId,
        ...(userRole === 'CONDUCTEUR' && {
          conducteurs: { some: { id: userId } },
        }),
      },
    });
    if (!chantier) throw new NotFoundException('Chantier introuvable');

    return this.prisma.tacheChantier.create({
      data: {
        chantierId,
        companyId,
        libelle: dto.libelle,
        prixVenduHT: dto.prixVenduHT ?? null,
        budgetMainOeuvre: dto.budgetMainOeuvre ?? null,
        budgetMateriaux: dto.budgetMateriaux ?? null,
      },
    });
  }

  async update(
    tacheId: string,
    chantierId: string,
    companyId: string,
    dto: UpdateTacheDto,
  ) {
    const tache = await this.prisma.tacheChantier.findUnique({
      where: { id: tacheId },
    });
    if (!tache) throw new NotFoundException('Tâche introuvable');
    if (tache.companyId !== companyId || tache.chantierId !== chantierId) {
      throw new NotFoundException('Tâche introuvable');
    }

    const updated = await this.prisma.tacheChantier.updateMany({
      where: { id: tacheId, chantierId, companyId },
      data: {
        ...(dto.libelle !== undefined && { libelle: dto.libelle }),
        ...(dto.prixVenduHT !== undefined && { prixVenduHT: dto.prixVenduHT }),
        ...(dto.budgetMainOeuvre !== undefined && {
          budgetMainOeuvre: dto.budgetMainOeuvre,
        }),
        ...(dto.budgetMateriaux !== undefined && {
          budgetMateriaux: dto.budgetMateriaux,
        }),
      },
    });

    if (updated.count === 0) throw new NotFoundException('Tâche introuvable');
    return this.prisma.tacheChantier.findUniqueOrThrow({
      where: { id: tacheId },
    });
  }

  async remove(tacheId: string, chantierId: string, companyId: string) {
    const tache = await this.prisma.tacheChantier.findUnique({
      where: { id: tacheId },
    });
    if (!tache) throw new NotFoundException('Tâche introuvable');
    if (tache.companyId !== companyId || tache.chantierId !== chantierId) {
      throw new NotFoundException('Tâche introuvable');
    }

    const deleted = await this.prisma.tacheChantier.deleteMany({
      where: { id: tacheId, chantierId, companyId },
    });
    if (deleted.count === 0) throw new NotFoundException('Tâche introuvable');
  }
}
