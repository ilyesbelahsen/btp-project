import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { ZoneService } from './zone.service';

describe('ZoneService', () => {
  const findMany = jest.fn();
  const upsert = jest.fn();
  const prisma = {
    zoneMajoration: { findMany, upsert },
  } as unknown as PrismaService;
  const service = new ZoneService(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns company-scoped configurations with defaults for missing zones', async () => {
    findMany.mockResolvedValue([
      {
        zoneCategorie: 2,
        tauxMajoration: 0.15,
        dateEffet: new Date('2026-10-01'),
      },
    ]);

    await expect(service.findAll('company-1')).resolves.toEqual([
      expect.objectContaining({ zoneCategorie: 1, tauxMajoration: 0 }),
      expect.objectContaining({ zoneCategorie: 2, tauxMajoration: 0.15 }),
      expect.objectContaining({ zoneCategorie: 3, tauxMajoration: 0.25 }),
      expect.objectContaining({ zoneCategorie: 4, tauxMajoration: 0.5 }),
    ]);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { companyId: 'company-1' } }),
    );
  });

  it('rejects a zone outside the supported categories', async () => {
    await expect(
      service.upsert('company-1', 5, { tauxMajoration: 0.2 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(upsert).not.toHaveBeenCalled();
  });

  it('writes a dated version for the current company', async () => {
    upsert.mockResolvedValue({ id: 'config-1' });

    await service.upsert('company-1', 2, {
      tauxMajoration: 0.2,
      dateEffet: '2026-10-03T00:00:00.000Z',
    });

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          companyId_zoneCategorie_dateEffet: {
            companyId: 'company-1',
            zoneCategorie: 2,
            dateEffet: new Date('2026-10-03T00:00:00.000Z'),
          },
        },
      }),
    );
  });
});
