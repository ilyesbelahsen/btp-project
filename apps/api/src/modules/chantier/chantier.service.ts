import { Injectable } from '@nestjs/common';
import { Chantier } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChantierService {
  constructor(private readonly prisma: PrismaService) {}

  async findAssignedByUser(
    userId: string,
    companyId: string,
  ): Promise<Chantier[]> {
    const pointages = await this.prisma.pointage.findMany({
      where: {
        userId,
        companyId,
        chantier: {
          companyId,
          status: 'EN_COURS',
        },
      },
      distinct: ['chantierId'],
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        chantier: true,
      },
    });

    return pointages
      .map((pointage) => pointage.chantier)
      .filter((chantier): chantier is Chantier => chantier !== null);
  }
}
