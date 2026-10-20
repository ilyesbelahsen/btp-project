import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertZoneMajorationDto } from './dto/upsert-zone-majoration.dto';

export const ZONE_CATEGORIES = [1, 2, 3, 4] as const;

export const DEFAULT_ZONE_TAUX_MAJORATION: Record<number, number> = {
  1: 0,
  2: 0.1,
  3: 0.25,
  4: 0.5,
};

export type ZoneMajorationConfiguration = {
  zoneCategorie: number;
  tauxMajoration: number;
  dateEffet: Date;
};

export function resolveZoneMajoration(
  zoneCategorie: number,
  datePointage: Date,
  configurations: ZoneMajorationConfiguration[],
): number {
  const configuration = configurations.find(
    (item) =>
      item.zoneCategorie === zoneCategorie && item.dateEffet <= datePointage,
  );
  return (
    configuration?.tauxMajoration ??
    DEFAULT_ZONE_TAUX_MAJORATION[zoneCategorie] ??
    0
  );
}

@Injectable()
export class ZoneService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string) {
    const configurations = await this.prisma.zoneMajoration.findMany({
      where: { companyId },
      orderBy: [{ zoneCategorie: 'asc' }, { dateEffet: 'desc' }],
    });

    return ZONE_CATEGORIES.map((zoneCategorie) => ({
      zoneCategorie,
      tauxMajoration:
        configurations.find((item) => item.zoneCategorie === zoneCategorie)
          ?.tauxMajoration ?? DEFAULT_ZONE_TAUX_MAJORATION[zoneCategorie],
      historique: configurations.filter(
        (item) => item.zoneCategorie === zoneCategorie,
      ),
    }));
  }

  async upsert(
    companyId: string,
    zoneCategorie: number,
    dto: UpsertZoneMajorationDto,
  ) {
    if (
      !ZONE_CATEGORIES.includes(
        zoneCategorie as (typeof ZONE_CATEGORIES)[number],
      )
    ) {
      throw new BadRequestException(
        'La catégorie de zone doit être comprise entre 1 et 4',
      );
    }

    const dateEffet = dto.dateEffet ? new Date(dto.dateEffet) : new Date();
    return this.prisma.zoneMajoration.upsert({
      where: {
        companyId_zoneCategorie_dateEffet: {
          companyId,
          zoneCategorie,
          dateEffet,
        },
      },
      create: {
        companyId,
        zoneCategorie,
        tauxMajoration: dto.tauxMajoration,
        dateEffet,
      },
      update: { tauxMajoration: dto.tauxMajoration },
    });
  }
}
