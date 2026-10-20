import { RapportService } from './rapport.service';
import type { PrismaService } from '../prisma/prisma.service';

describe('RapportService', () => {
  const chantierFindMany = jest.fn();
  const chantierFindFirst = jest.fn();
  const prisma = {
    chantier: {
      findMany: chantierFindMany,
      findFirst: chantierFindFirst,
    },
  } as unknown as PrismaService;
  const service = new RapportService(prisma);

  const chantier = {
    id: 'chantier-1',
    name: 'Chantier A',
    status: 'EN_COURS',
    zoneCategorie: 2,
    budget: 1000,
    marge: 300,
    budgetMainOeuvre: 500,
    budgetMateriaux: 500,
    startDate: new Date('2026-09-01'),
    depenses: [{ montant: 100 }],
    pointages: [{ totalHours: 10, user: { tauxHoraire: 20 } }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses the same accepted expenses and validated labor cost in global and chantier margins', async () => {
    chantierFindMany.mockResolvedValue([chantier]);
    chantierFindFirst.mockResolvedValue({
      ...chantier,
      depenses: [{ montant: 100, categorie: 'MATERIEL' }],
    });

    const dashboard = await service.getDashboardStats('company-1');
    const detail = await service.getIndicateursChantier(
      'chantier-1',
      'company-1',
    );

    expect(dashboard).toMatchObject({
      caTotalHT: 1300,
      depensesTotales: 100,
      coutMainOeuvre: 200,
      coutTotal: 300,
      margeGlobale: 1000,
    });
    expect(detail).toMatchObject({
      coutDepenses: 100,
      coutMainOeuvre: 200,
      coutTotal: 300,
      marge: 1000,
    });
    expect(dashboard.margeGlobale).toBe(detail.marge);
  });

  it('filters the dashboard by active company, accepted expenses and validated pointages', async () => {
    chantierFindMany.mockResolvedValue([]);

    await service.getDashboardStats('company-1');

    expect(chantierFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { companyId: 'company-1', status: 'EN_COURS' },
        include: expect.objectContaining({
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
        }),
      }),
    );
  });
});
