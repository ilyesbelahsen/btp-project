import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartPointageDto } from './dto/start-pointage.dto';
import { SaveTachesDto } from './dto/save-taches.dto';
import { SaveRepartitionDto } from './dto/save-repartition.dto';
import { SoumettrePointageDto } from './dto/soumettre-pointage.dto';
import { HistoriqueQueryDto } from './dto/historique-query.dto';
import { FindPointagesQueryDto } from './dto/find-pointages-query.dto';
import { CorrigerPointageDto } from './dto/corriger-pointage.dto';
import { ValiderBatchDto } from './dto/valider-batch.dto';
import { RejeterPointageDto } from './dto/rejeter-pointage.dto';
import { TACHE_TYPES } from './tache-types.constants';
import { durationMinutes } from '../../common/precision';

@Injectable()
export class PointageService {
  constructor(private readonly prisma: PrismaService) {}

  async startPointage(
    userId: string,
    companyId: string,
    dto: StartPointageDto,
  ) {
    // BR-020 : le chantier doit être actif et affecté à l ouvrier courant.
    const chantier = await this.prisma.chantier.findFirst({
      where: {
        id: dto.chantierId,
        companyId,
        status: 'EN_COURS',
        ouvriers: { some: { id: userId } },
      },
    });

    if (!chantier) {
      throw new NotFoundException(
        'Chantier introuvable ou non autorisé. Sélectionnez un chantier actif qui vous est affecté.',
      );
    }

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
    const totalMinutes = Math.max(
      0,
      Math.round((endTime.getTime() - pointage.startTime.getTime()) / 60_000),
    );
    const totalHours = totalMinutes / 60;

    const updated = await this.prisma.pointage.updateMany({
      where: { id, companyId },
      data: {
        endTime,
        totalMinutes,
        totalHours,
        status: 'TERMINE',
      },
    });

    if (updated.count === 0)
      throw new NotFoundException('Pointage introuvable');

    return this.prisma.pointage.findUniqueOrThrow({
      where: { id },
      include: { chantier: { select: { id: true, name: true } } },
    });
  }

  async cancelPointage(id: string, userId: string, companyId: string) {
    const deleted = await this.prisma.pointage.deleteMany({
      where: { id, userId, companyId, status: 'EN_COURS' },
    });

    if (deleted.count === 0) {
      throw new ConflictException('Seul un pointage en cours peut être annulé');
    }
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

    const taches = await this.prisma.tacheChantier.findMany({
      where: {
        id: { in: dto.taches },
        chantierId: pointage.chantierId,
        companyId,
      },
      select: { id: true },
    });
    if (taches.length !== dto.taches.length) {
      throw new BadRequestException(
        'Une tâche sélectionnée ne appartient pas à ce chantier',
      );
    }

    const updated = await this.prisma.pointage.updateMany({
      where: { id, companyId },
      data: { taches: dto.taches },
    });

    if (updated.count === 0)
      throw new NotFoundException('Pointage introuvable');

    return this.prisma.pointage.findUniqueOrThrow({
      where: { id },
      select: { id: true, taches: true },
    });
  }

  async saveRepartition(
    id: string,
    userId: string,
    companyId: string,
    dto: SaveRepartitionDto,
  ) {
    const pointage = await this.prisma.pointage.findFirst({
      where: { id, userId, companyId },
      select: {
        id: true,
        chantierId: true,
        totalMinutes: true,
        totalHours: true,
        status: true,
      },
    });

    if (!pointage) throw new NotFoundException('Pointage introuvable');
    if (durationMinutes(pointage) <= 0 || pointage.status === 'EN_COURS') {
      throw new BadRequestException(
        'La répartition est disponible lorsque le pointage est terminé',
      );
    }

    const taskIds = dto.repartitions.map((item) => item.tacheId);
    if (new Set(taskIds).size !== taskIds.length) {
      throw new BadRequestException(
        'Une tâche ne peut être ventilée qu une fois',
      );
    }

    const tasks = await this.prisma.tacheChantier.findMany({
      where: {
        id: { in: taskIds },
        chantierId: pointage.chantierId,
        companyId,
      },
      select: { id: true },
    });
    if (tasks.length !== taskIds.length) {
      throw new BadRequestException('Une tâche ne correspond pas au chantier');
    }

    const requestedMinutes = dto.repartitions.reduce(
      (total, item) => total + item.minutes,
      0,
    );
    const actualMinutes = durationMinutes(pointage);
    if (requestedMinutes !== actualMinutes) {
      throw new BadRequestException(
        `La ventilation doit totaliser ${actualMinutes} minutes`,
      );
    }

    await this.prisma.$transaction([
      this.prisma.pointageTache.deleteMany({
        where: { pointageId: id, companyId },
      }),
      this.prisma.pointageTache.createMany({
        data: dto.repartitions.map((item) => ({
          pointageId: id,
          tacheId: item.tacheId,
          companyId,
          minutes: item.minutes,
        })),
      }),
    ]);

    return this.prisma.pointageTache.findMany({
      where: { pointageId: id, companyId },
      select: { tacheId: true, minutes: true },
    });
  }

  async soumettrePointage(
    id: string,
    userId: string,
    companyId: string,
    dto: SoumettrePointageDto = {},
  ) {
    const pointage = await this.prisma.pointage.findUnique({ where: { id } });

    if (!pointage || pointage.companyId !== companyId) {
      throw new NotFoundException('Pointage introuvable');
    }
    if (pointage.userId !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez pas soumettre le pointage d une autre personne',
      );
    }
    if (!['TERMINE', 'REJETE'].includes(pointage.status)) {
      throw new ConflictException(
        'Seul un pointage terminé ou rejeté peut être soumis',
      );
    }

    const updated = await this.prisma.pointage.updateMany({
      where: { id, companyId, userId, status: { in: ['TERMINE', 'REJETE'] } },
      data: {
        status: 'SOUMIS',
        rejectionReason: null,
        ...(dto.comment !== undefined ? { comment: dto.comment } : {}),
      },
    });

    if (updated.count === 0) {
      throw new ConflictException('Le pointage ne peut plus être soumis');
    }

    return this.prisma.pointage.findUniqueOrThrow({
      where: { id },
      include: { chantier: { select: { id: true, name: true } } },
    });
  }

  async rejeterPointage(
    id: string,
    companyId: string,
    dto: RejeterPointageDto,
  ) {
    const pointage = await this.prisma.pointage.findFirst({
      where: { id, companyId },
    });

    if (!pointage) throw new NotFoundException('Pointage introuvable');
    if (pointage.status !== 'SOUMIS') {
      throw new ConflictException('Seul un pointage soumis peut être rejeté');
    }

    const updated = await this.prisma.pointage.updateMany({
      where: { id, companyId, status: 'SOUMIS' },
      data: { status: 'REJETE', rejectionReason: dto.reason },
    });

    if (updated.count === 0) {
      throw new ConflictException('Le pointage ne peut plus être rejeté');
    }

    return this.prisma.pointage.findUniqueOrThrow({
      where: { id },
      include: { chantier: { select: { id: true, name: true } } },
    });
  }

  async corrigerEtResoumettre(
    id: string,
    userId: string,
    companyId: string,
    dto: CorrigerPointageDto,
  ) {
    const pointage = await this.prisma.pointage.findUnique({ where: { id } });

    if (!pointage || pointage.companyId !== companyId) {
      throw new NotFoundException('Pointage introuvable');
    }
    if (pointage.userId !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez pas corriger le pointage d une autre personne',
      );
    }
    if (pointage.status !== 'REJETE') {
      throw new ConflictException('Seul un pointage rejeté peut être corrigé');
    }

    const newStart = dto.startTime
      ? new Date(dto.startTime)
      : pointage.startTime;
    const newEnd = dto.endTime ? new Date(dto.endTime) : pointage.endTime;
    const totalMinutes = newEnd
      ? Math.max(
          0,
          Math.round((newEnd.getTime() - newStart.getTime()) / 60_000),
        )
      : (pointage.totalMinutes ??
        (pointage.totalHours === null
          ? null
          : Math.round(pointage.totalHours * 60)));
    const totalHours = totalMinutes === null ? null : totalMinutes / 60;

    const updated = await this.prisma.pointage.updateMany({
      where: { id, companyId, userId, status: 'REJETE' },
      data: {
        startTime: newStart,
        endTime: newEnd,
        totalMinutes,
        totalHours,
        ...(dto.taches !== undefined && { taches: dto.taches }),
        status: 'SOUMIS',
        rejectionReason: null,
        correctedAt: new Date(),
        correctedById: userId,
      },
    });

    if (updated.count === 0) {
      throw new ConflictException('Le pointage ne peut plus être corrigé');
    }

    return this.prisma.pointage.findUniqueOrThrow({
      where: { id },
      include: { chantier: { select: { id: true, name: true } } },
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
      select: { startTime: true, totalMinutes: true, totalHours: true },
      orderBy: { startTime: 'desc' },
    });

    const totalMinutes = pointages.reduce(
      (acc, pointage) =>
        acc +
        (pointage.totalMinutes ??
          (pointage.totalHours == null
            ? 0
            : Math.round(pointage.totalHours * 60))),
      0,
    );
    const totalHeures = totalMinutes / 60;

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

  // CA1-CA4 : liste paginée pour le patron avec filtres optionnels
  async findAllForPatron(companyId: string, filters: FindPointagesQueryDto) {
    const where: Record<string, unknown> = { companyId };
    if (filters.userId) where.userId = filters.userId;
    if (filters.chantierId) where.chantierId = filters.chantierId;
    if (filters.status) where.status = filters.status;
    if (filters.dateFrom || filters.dateTo) {
      where.startTime = {
        ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
        ...(filters.dateTo && {
          lte: new Date(filters.dateTo + 'T23:59:59.999Z'),
        }),
      };
    }

    return this.prisma.pointage.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        chantier: { select: { id: true, name: true } },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async corrigerPointage(
    id: string,
    companyId: string,
    correctedById: string,
    dto: CorrigerPointageDto,
  ) {
    const pointage = await this.prisma.pointage.findFirst({
      where: { id, companyId },
    });
    if (!pointage) throw new NotFoundException('Pointage introuvable');

    // CA4 : un pointage validé ne peut pas être modifié
    if (pointage.status === 'VALIDE') {
      throw new ConflictException(
        'Un pointage validé ne peut pas être modifié',
      );
    }

    const newStart = dto.startTime
      ? new Date(dto.startTime)
      : pointage.startTime;
    const newEnd =
      dto.endTime !== undefined
        ? dto.endTime
          ? new Date(dto.endTime)
          : null
        : pointage.endTime;

    // Recalcul automatique de totalHours si les heures changent
    const totalMinutes = newEnd
      ? Math.max(
          0,
          Math.round((newEnd.getTime() - newStart.getTime()) / 60_000),
        )
      : null;
    const totalHours = totalMinutes === null ? null : totalMinutes / 60;

    const updated = await this.prisma.pointage.updateMany({
      where: { id, companyId },
      data: {
        startTime: newStart,
        endTime: newEnd,
        totalMinutes,
        totalHours,
        ...(dto.taches !== undefined && { taches: dto.taches }),
        // CA3 : traçabilité de la correction
        correctedAt: new Date(),
        correctedById,
      },
    });

    if (updated.count === 0)
      throw new NotFoundException('Pointage introuvable');

    return this.prisma.pointage.findUniqueOrThrow({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        chantier: { select: { id: true, name: true } },
      },
    });
  }

  async validerPointage(id: string, companyId: string) {
    const pointage = await this.prisma.pointage.findFirst({
      where: { id, companyId },
    });
    if (!pointage) throw new NotFoundException('Pointage introuvable');
    // Idempotent : déjà validé
    if (pointage.status === 'VALIDE') return pointage;
    if (pointage.status !== 'SOUMIS') {
      throw new ConflictException('Seul un pointage soumis peut être validé');
    }

    const updated = await this.prisma.pointage.updateMany({
      where: { id, companyId, status: 'SOUMIS' },
      data: { status: 'VALIDE' },
    });

    if (updated.count === 0) {
      throw new NotFoundException('Pointage introuvable ou non terminable');
    }

    return this.prisma.pointage.findUniqueOrThrow({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        chantier: { select: { id: true, name: true } },
      },
    });
  }

  async validerBatch(dto: ValiderBatchDto, companyId: string) {
    const result = await this.prisma.pointage.updateMany({
      where: { id: { in: dto.ids }, companyId, status: 'SOUMIS' },
      data: { status: 'VALIDE' },
    });
    return { validated: result.count };
  }
}
