import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Chantier } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChantierDto } from './dto/create-chantier.dto';
import { UpdateChantierDto } from './dto/update-chantier.dto';

export type ChantierWithPrixVente = Chantier & { prixVenteHT: number };

@Injectable()
export class ChantierService {
  constructor(private readonly prisma: PrismaService) {}

  // US-001 : marge visée = prix de vente - (budget total × coefficient)
  private withPrixVente(chantier: Chantier): ChantierWithPrixVente {
    return {
      ...chantier,
      prixVenteHT:
        (chantier.budget ?? 0) * chantier.coefficient + (chantier.marge ?? 0),
    };
  }

  async create(
    companyId: string,
    dto: CreateChantierDto,
  ): Promise<ChantierWithPrixVente> {
    const chantier = await this.prisma.chantier.create({
      data: {
        name: dto.name,
        address: dto.address,
        client: dto.client,
        budgetMainOeuvre: dto.budgetMainOeuvre,
        budgetMateriaux: dto.budgetMateriaux,
        // BR-C-001 : budget total = somme des budgets MO + matériaux, calculé côté API
        budget: dto.budgetMainOeuvre + dto.budgetMateriaux,
        marge:
          dto.prixVenteHT -
          (dto.budgetMainOeuvre + dto.budgetMateriaux) * dto.coefficient,
        coefficient: dto.coefficient,
        zoneCategorie: dto.zoneCategorie,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        companyId,
      },
    });
    return this.withPrixVente(chantier);
  }

  async findAll(companyId: string): Promise<ChantierWithPrixVente[]> {
    const chantiers = await this.prisma.chantier.findMany({
      where: { companyId },
      orderBy: { startDate: 'desc' },
    });
    return chantiers.map((chantier) => this.withPrixVente(chantier));
  }

  async findAssignedByUser(
    userId: string,
    companyId: string,
    role: string,
  ): Promise<ChantierWithPrixVente[]> {
    return this.prisma.chantier
      .findMany({
        where: {
          companyId,
          ...(role === 'CONDUCTEUR'
            ? { conducteurs: { some: { id: userId } } }
            : { status: 'EN_COURS', ouvriers: { some: { id: userId } } }),
        },
        orderBy: { startDate: 'desc' },
      })
      .then((chantiers) =>
        chantiers.map((chantier) => this.withPrixVente(chantier)),
      );
  }

  async getConducteursAffectes(chantierId: string, companyId: string) {
    const chantier = await this.prisma.chantier.findFirst({
      where: { id: chantierId, companyId },
      include: {
        conducteurs: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });
    if (!chantier) throw new NotFoundException('Chantier introuvable');
    return chantier.conducteurs;
  }

  async assignConducteur(
    chantierId: string,
    userId: string,
    companyId: string,
  ) {
    const chantier = await this.prisma.chantier.findFirst({
      where: { id: chantierId, companyId },
    });
    if (!chantier) throw new NotFoundException('Chantier introuvable');
    const conducteur = await this.prisma.user.findFirst({
      where: { id: userId, companyId, role: 'CONDUCTEUR' },
    });
    if (!conducteur) throw new NotFoundException('Conducteur introuvable');
    return this.prisma.chantier.update({
      where: { id: chantierId },
      data: { conducteurs: { connect: { id: userId } } },
      include: {
        conducteurs: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async removeConducteur(
    chantierId: string,
    userId: string,
    companyId: string,
  ) {
    const chantier = await this.prisma.chantier.findFirst({
      where: { id: chantierId, companyId },
    });
    if (!chantier) throw new NotFoundException('Chantier introuvable');
    await this.prisma.chantier.update({
      where: { id: chantierId },
      data: { conducteurs: { disconnect: { id: userId } } },
    });
  }

  async getOuvriersAffectes(chantierId: string, companyId: string) {
    const chantier = await this.prisma.chantier.findFirst({
      where: { id: chantierId, companyId },
      include: {
        ouvriers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });
    if (!chantier) throw new NotFoundException('Chantier introuvable');
    return chantier.ouvriers;
  }

  async assignOuvrier(chantierId: string, userId: string, companyId: string) {
    const chantier = await this.prisma.chantier.findFirst({
      where: { id: chantierId, companyId },
    });
    if (!chantier) throw new NotFoundException('Chantier introuvable');

    const ouvrier = await this.prisma.user.findFirst({
      where: { id: userId, companyId },
    });
    if (!ouvrier) throw new NotFoundException('Ouvrier introuvable');

    return this.prisma.chantier.update({
      where: { id: chantierId },
      data: { ouvriers: { connect: { id: userId } } },
      include: {
        ouvriers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async removeOuvrier(chantierId: string, userId: string, companyId: string) {
    const chantier = await this.prisma.chantier.findFirst({
      where: { id: chantierId, companyId },
    });
    if (!chantier) throw new NotFoundException('Chantier introuvable');

    const pointageEnCours = await this.prisma.pointage.findFirst({
      where: { chantierId, userId, companyId, status: 'EN_COURS' },
    });
    if (pointageEnCours) {
      throw new ConflictException(
        "L'ouvrier a un pointage en cours sur ce chantier",
      );
    }

    await this.prisma.chantier.update({
      where: { id: chantierId },
      data: { ouvriers: { disconnect: { id: userId } } },
    });
  }

  async terminer(
    id: string,
    companyId: string,
  ): Promise<ChantierWithPrixVente> {
    const chantier = await this.prisma.chantier.findFirst({
      where: { id, companyId },
    });
    if (!chantier) throw new NotFoundException('Chantier introuvable');
    if (chantier.status !== 'EN_COURS') {
      throw new BadRequestException(
        'Seul un chantier en cours peut être clôturé',
      );
    }

    const updated = await this.prisma.chantier.updateMany({
      where: { id, companyId, status: 'EN_COURS' },
      data: { status: 'TERMINE' },
    });
    if (updated.count === 0)
      throw new NotFoundException('Chantier introuvable');

    return this.withPrixVente(
      await this.prisma.chantier.findUniqueOrThrow({ where: { id } }),
    );
  }

  async update(
    id: string,
    companyId: string,
    dto: UpdateChantierDto,
  ): Promise<ChantierWithPrixVente> {
    const chantier = await this.prisma.chantier.findFirst({
      where: { id, companyId },
    });
    if (!chantier) throw new NotFoundException('Chantier introuvable');
    if (chantier.status !== 'EN_COURS') {
      throw new BadRequestException('Seul un chantier en cours est modifiable');
    }

    // US-001 : la marge est recalculée à partir des valeurs économiques effectives
    const budgetMainOeuvre = dto.budgetMainOeuvre ?? chantier.budgetMainOeuvre;
    const budgetMateriaux = dto.budgetMateriaux ?? chantier.budgetMateriaux;
    const coefficient = dto.coefficient ?? chantier.coefficient;
    const prixVenteHT =
      dto.prixVenteHT ?? this.withPrixVente(chantier).prixVenteHT;
    const budgetModifie =
      dto.budgetMainOeuvre !== undefined || dto.budgetMateriaux !== undefined;

    const updated = await this.prisma.chantier.updateMany({
      where: { id, companyId, status: 'EN_COURS' },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.client !== undefined && { client: dto.client }),
        ...(dto.budgetMainOeuvre !== undefined && {
          budgetMainOeuvre: dto.budgetMainOeuvre,
        }),
        ...(dto.budgetMateriaux !== undefined && {
          budgetMateriaux: dto.budgetMateriaux,
        }),
        ...(budgetModifie && {
          budget: (budgetMainOeuvre ?? 0) + (budgetMateriaux ?? 0),
        }),
        ...(dto.coefficient !== undefined && { coefficient: dto.coefficient }),
        ...((dto.prixVenteHT !== undefined ||
          dto.coefficient !== undefined ||
          budgetModifie) && {
          marge:
            prixVenteHT -
            ((budgetMainOeuvre ?? 0) + (budgetMateriaux ?? 0)) * coefficient,
        }),
        ...(dto.zoneCategorie !== undefined && {
          zoneCategorie: dto.zoneCategorie,
        }),
        ...(dto.startDate !== undefined && {
          startDate: new Date(dto.startDate),
        }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
      },
    });
    if (updated.count === 0)
      throw new NotFoundException('Chantier introuvable');

    return this.withPrixVente(
      await this.prisma.chantier.findUniqueOrThrow({ where: { id } }),
    );
  }

  async remove(id: string, companyId: string): Promise<void> {
    const chantier = await this.prisma.chantier.findFirst({
      where: { id, companyId },
    });
    if (!chantier) throw new NotFoundException('Chantier introuvable');

    const pointageValide = await this.prisma.pointage.findFirst({
      where: { chantierId: id, companyId, status: 'VALIDE' },
    });
    if (pointageValide) {
      throw new ConflictException(
        'Impossible de supprimer : des pointages validés sont associés à ce chantier',
      );
    }

    // Cascade manuelle : dépenses et pointages non-validés (tâches cascadent par FK)
    await this.prisma.$transaction([
      this.prisma.depense.deleteMany({ where: { chantierId: id, companyId } }),
      this.prisma.pointage.deleteMany({ where: { chantierId: id, companyId } }),
      this.prisma.chantier.deleteMany({ where: { id, companyId } }),
    ]);
  }
}
