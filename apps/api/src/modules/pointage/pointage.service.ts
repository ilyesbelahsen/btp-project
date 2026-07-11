import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartPointageDto } from './dto/start-pointage.dto';
import { SaveTachesDto } from './dto/save-taches.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { HistoriqueQueryDto } from './dto/historique-query.dto';
import { TACHE_TYPES } from './tache-types.constants';

@Injectable()
export class PointageService {
  constructor(private readonly prisma: PrismaService) {}

  async startPointage(
    userId: string,
    companyId: string,
    dto: StartPointageDto,
  ) {
    // BR-006 : un seul pointage ouvert par jour
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const existing = await this.prisma.pointage.findFirst({
      where: {
        userId,
        companyId,
        status: 'EN_COURS',
        startTime: { gte: startOfDay },
      },
    });

    if (existing) {
      throw new ConflictException('Un pointage est déjà en cours pour ce jour');
    }

    // BR-010 : vérifier que le chantier appartient à la même entreprise
    const chantier = await this.prisma.chantier.findFirst({
      where: { id: dto.chantierId, companyId },
    });

    if (!chantier) {
      throw new NotFoundException('Chantier introuvable ou non autorisé');
    }

    // BR-007 : horodatage UTC côté serveur
    return this.prisma.pointage.create({
      data: {
        userId,
        chantierId: dto.chantierId,
        companyId,
        startTime: new Date(),
        status: 'EN_COURS',
      },
      include: { chantier: { select: { id: true, name: true } } },
    });
  }

  async stopPointage(id: string, userId: string, companyId: string) {
    const pointage = await this.prisma.pointage.findUnique({ where: { id } });

    if (!pointage || pointage.companyId !== companyId) {
      throw new NotFoundException('Pointage introuvable');
    }

    if (pointage.userId !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez pas terminer le pointage d une autre personne',
      );
    }

    if (pointage.status !== 'EN_COURS') {
      throw new ConflictException('Ce pointage n est pas en cours');
    }

    // BR-007 : horodatage UTC côté serveur
    const endTime = new Date();
    // BR-009 : calcul durée côté API
    const totalHours =
      (endTime.getTime() - pointage.startTime.getTime()) / 3_600_000;

    return this.prisma.pointage.update({
      where: { id },
      data: {
        endTime,
        totalHours: Math.round(totalHours * 100) / 100,
        status: 'TERMINE',
      },
      include: { chantier: { select: { id: true, name: true } } },
    });
  }

  findTodayActive(userId: string, companyId: string) {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    return this.prisma.pointage.findFirst({
      where: {
        userId,
        companyId,
        status: 'EN_COURS',
        startTime: { gte: startOfDay },
      },
      include: { chantier: { select: { id: true, name: true } } },
    });
  }

  getTypesTaches() {
    return TACHE_TYPES;
  }

  async saveTaches(
    id: string,
    userId: string,
    companyId: string,
    dto: SaveTachesDto,
  ) {
    const pointage = await this.prisma.pointage.findUnique({ where: { id } });

    if (!pointage || pointage.companyId !== companyId) {
      throw new NotFoundException('Pointage introuvable');
    }

    if (pointage.userId !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez pas modifier le pointage d une autre personne',
      );
    }

    return this.prisma.pointage.update({
      where: { id },
      data: { taches: dto.taches },
      select: { id: true, taches: true },
    });
  }

  async updateComment(
    id: string,
    userId: string,
    companyId: string,
    dto: UpdateCommentDto,
  ) {
    const pointage = await this.prisma.pointage.findUnique({ where: { id } });

    if (!pointage || pointage.companyId !== companyId) {
      throw new NotFoundException('Pointage introuvable');
    }

    if (pointage.userId !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez pas modifier le pointage d une autre personne',
      );
    }

    return this.prisma.pointage.update({
      where: { id },
      data: { comment: dto.comment },
      select: { id: true, comment: true },
    });
  }

  async findHistorique(
    userId: string,
    companyId: string,
    query: HistoriqueQueryDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    // Filtre optionnel par mois (CA4)
    let dateFilter: { gte?: Date; lt?: Date } | undefined;
    if (query.mois) {
      const [year, month] = query.mois.split('-').map(Number);
      dateFilter = {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1),
      };
    }

    const where = {
      userId,
      companyId,
      ...(dateFilter ? { startTime: dateFilter } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.pointage.findMany({
        where,
        orderBy: { startTime: 'desc' }, // CA3
        skip,
        take: limit,
        include: { chantier: { select: { id: true, name: true } } },
      }),
      this.prisma.pointage.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findMesStats(userId: string, companyId: string, mois?: string) {
    let dateFilter: { gte: Date; lt: Date } | undefined;

    if (mois) {
      const [year, month] = mois.split('-').map(Number);
      dateFilter = {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1),
      };
    } else {
      // Mois courant par défaut
      const now = new Date();
      dateFilter = {
        gte: new Date(now.getFullYear(), now.getMonth(), 1),
        lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      };
    }

    // BR-018 : isolation userId + companyId ; BR-020 : calcul côté API
    const pointages = await this.prisma.pointage.findMany({
      where: {
        userId,
        companyId,
        status: { in: ['TERMINE', 'VALIDE'] },
        startTime: dateFilter,
      },
      select: { startTime: true, totalHours: true },
      orderBy: { startTime: 'desc' },
    });

    const totalHeures =
      Math.round(
        pointages.reduce((acc, p) => acc + (p.totalHours ?? 0), 0) * 100,
      ) / 100;

    const joursSet = new Set(
      pointages.map((p) => p.startTime.toISOString().split('T')[0]),
    );

    const dernierPointage = pointages[0]?.startTime ?? null;

    return {
      totalHeures,
      totalJours: joursSet.size,
      dernierPointage,
      mois:
        mois ??
        `${dateFilter.gte.getFullYear()}-${String(dateFilter.gte.getMonth() + 1).padStart(2, '0')}`,
    };
  }
}
