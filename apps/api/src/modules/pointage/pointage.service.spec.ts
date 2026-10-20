import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PointageService } from './pointage.service';

type PrismaPointageMock = {
  chantier: {
    findFirst: jest.Mock;
  };
  findUnique: jest.Mock;
  findFirst: jest.Mock;
  create: jest.Mock;
  updateMany: jest.Mock;
  findUniqueOrThrow: jest.Mock;
};

describe('PointageService', () => {
  function createService() {
    const pointage: PrismaPointageMock = {
      chantier: {
        findFirst: jest.fn(),
      },
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    };
    const tacheChantier = { findMany: jest.fn() };
    const pointageTache = {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
      findMany: jest.fn(),
    };
    return {
      service: new PointageService({
        chantier: pointage.chantier,
        pointage,
        tacheChantier,
        pointageTache,
        $transaction: jest.fn().mockResolvedValue([]),
      } as never),
      pointage,
      tacheChantier,
      pointageTache,
    };
  }

  it('starts a pointage only on an active chantier assigned to the worker', async () => {
    const { service, pointage } = createService();
    pointage.chantier.findFirst.mockResolvedValue({
      id: 'chantier-1',
      companyId: 'company-a',
      status: 'EN_COURS',
    });
    pointage.findFirst.mockResolvedValue(null);
    pointage.create.mockResolvedValue({ id: 'pointage-1' });

    await service.startPointage('user-1', 'company-a', {
      chantierId: 'chantier-1',
    });

    expect(pointage.chantier.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'chantier-1',
        companyId: 'company-a',
        status: 'EN_COURS',
        ouvriers: { some: { id: 'user-1' } },
      },
    });
    expect(pointage.create).toHaveBeenCalled();
  });

  it('rejects a chantier from the same company when the worker is not assigned', async () => {
    const { service, pointage } = createService();
    pointage.chantier.findFirst.mockResolvedValue(null);

    await expect(
      service.startPointage('user-1', 'company-a', {
        chantierId: 'chantier-1',
      }),
    ).rejects.toThrow(NotFoundException);
    expect(pointage.findFirst).not.toHaveBeenCalled();
    expect(pointage.create).not.toHaveBeenCalled();
  });

  it('rejects a chantier from another company without creating a pointage', async () => {
    const { service, pointage } = createService();
    pointage.chantier.findFirst.mockResolvedValue(null);

    await expect(
      service.startPointage('user-1', 'company-a', {
        chantierId: 'chantier-from-company-b',
      }),
    ).rejects.toThrow(NotFoundException);
    expect(pointage.create).not.toHaveBeenCalled();
  });

  it('rejects a completed chantier', async () => {
    const { service, pointage } = createService();
    pointage.chantier.findFirst.mockResolvedValue(null);

    await expect(
      service.startPointage('user-1', 'company-a', {
        chantierId: 'completed-chantier',
      }),
    ).rejects.toThrow(NotFoundException);
    expect(pointage.create).not.toHaveBeenCalled();
  });

  it('rejects a pointage from another company before mutation', async () => {
    const { service, pointage } = createService();
    pointage.findUnique.mockResolvedValue({
      id: 'pointage-1',
      companyId: 'company-b',
      userId: 'user-1',
      status: 'EN_COURS',
      startTime: new Date(Date.now() - 3_600_000),
    });

    await expect(
      service.stopPointage('pointage-1', 'user-1', 'company-a'),
    ).rejects.toThrow(NotFoundException);
    expect(pointage.updateMany).not.toHaveBeenCalled();
  });

  it('includes the JWT company in an authorized mutation', async () => {
    const { service, pointage } = createService();
    pointage.findUnique.mockResolvedValue({
      id: 'pointage-1',
      companyId: 'company-a',
      userId: 'user-1',
      status: 'EN_COURS',
      startTime: new Date(Date.now() - 3_600_000),
    });
    pointage.updateMany.mockResolvedValue({ count: 1 });
    pointage.findUniqueOrThrow.mockResolvedValue({ id: 'pointage-1' });

    await service.stopPointage('pointage-1', 'user-1', 'company-a');

    expect(pointage.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'pointage-1', companyId: 'company-a' },
      }),
    );
  });

  it('submits a completed pointage owned by the worker', async () => {
    const { service, pointage } = createService();
    pointage.findUnique.mockResolvedValue({
      id: 'pointage-1',
      companyId: 'company-a',
      userId: 'user-1',
      status: 'TERMINE',
    });
    pointage.updateMany.mockResolvedValue({ count: 1 });
    pointage.findUniqueOrThrow.mockResolvedValue({
      id: 'pointage-1',
      status: 'SOUMIS',
    });

    await service.soumettrePointage('pointage-1', 'user-1', 'company-a');

    expect(pointage.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'pointage-1',
        companyId: 'company-a',
        userId: 'user-1',
        status: { in: ['TERMINE', 'REJETE'] },
      },
      data: { status: 'SOUMIS', rejectionReason: null },
    });
  });

  it('rejects submission by another worker or from an invalid status', async () => {
    const { service, pointage } = createService();
    pointage.findUnique.mockResolvedValue({
      id: 'pointage-1',
      companyId: 'company-a',
      userId: 'user-2',
      status: 'TERMINE',
    });

    await expect(
      service.soumettrePointage('pointage-1', 'user-1', 'company-a'),
    ).rejects.toThrow(ForbiddenException);

    pointage.findUnique.mockResolvedValue({
      id: 'pointage-1',
      companyId: 'company-a',
      userId: 'user-1',
      status: 'EN_COURS',
    });
    await expect(
      service.soumettrePointage('pointage-1', 'user-1', 'company-a'),
    ).rejects.toThrow(ConflictException);
  });

  it('rejects only submitted pointages and stores the reason', async () => {
    const { service, pointage } = createService();
    pointage.findFirst.mockResolvedValue({
      id: 'pointage-1',
      companyId: 'company-a',
      status: 'SOUMIS',
    });
    pointage.updateMany.mockResolvedValue({ count: 1 });
    pointage.findUniqueOrThrow.mockResolvedValue({
      id: 'pointage-1',
      status: 'REJETE',
    });

    await service.rejeterPointage('pointage-1', 'company-a', {
      reason: 'Heure de fin à corriger',
    });

    expect(pointage.updateMany).toHaveBeenCalledWith({
      where: { id: 'pointage-1', companyId: 'company-a', status: 'SOUMIS' },
      data: { status: 'REJETE', rejectionReason: 'Heure de fin à corriger' },
    });

    pointage.findFirst.mockResolvedValue({
      id: 'pointage-1',
      companyId: 'company-a',
      status: 'TERMINE',
    });
    await expect(
      service.rejeterPointage('pointage-1', 'company-a', { reason: 'Motif' }),
    ).rejects.toThrow(ConflictException);
  });

  it('corrects and resubmits a rejected pointage', async () => {
    const { service, pointage } = createService();
    pointage.findUnique.mockResolvedValue({
      id: 'pointage-1',
      companyId: 'company-a',
      userId: 'user-1',
      status: 'REJETE',
      startTime: new Date('2026-09-01T08:00:00.000Z'),
      endTime: new Date('2026-09-01T16:00:00.000Z'),
      totalHours: 8,
    });
    pointage.updateMany.mockResolvedValue({ count: 1 });
    pointage.findUniqueOrThrow.mockResolvedValue({
      id: 'pointage-1',
      status: 'SOUMIS',
    });

    await service.corrigerEtResoumettre('pointage-1', 'user-1', 'company-a', {
      taches: ['MACONNERIE'],
    });

    expect(pointage.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'pointage-1',
          companyId: 'company-a',
          userId: 'user-1',
          status: 'REJETE',
        },
        data: {
          startTime: new Date('2026-09-01T08:00:00.000Z'),
          endTime: new Date('2026-09-01T16:00:00.000Z'),
          totalHours: 8,
          totalMinutes: 480,
          taches: ['MACONNERIE'],
          status: 'SOUMIS',
          rejectionReason: null,
          // Jest's asymmetric matcher is intentionally untyped here.
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          correctedAt: expect.any(Date),
          correctedById: 'user-1',
        },
      }),
    );
  });

  it('stores the exact duration for a single task allocation', async () => {
    const { service, pointage, tacheChantier, pointageTache } = createService();
    pointage.findFirst.mockResolvedValue({
      id: 'pointage-1',
      userId: 'user-1',
      companyId: 'company-a',
      chantierId: 'chantier-1',
      status: 'TERMINE',
      totalMinutes: 70,
      totalHours: 70 / 60,
    });
    tacheChantier.findMany.mockResolvedValue([{ id: 'tache-1' }]);
    pointageTache.findMany.mockResolvedValue([
      { tacheId: 'tache-1', minutes: 70 },
    ]);

    await expect(
      service.saveRepartition('pointage-1', 'user-1', 'company-a', {
        repartitions: [{ tacheId: 'tache-1', minutes: 70 }],
      }),
    ).resolves.toEqual([{ tacheId: 'tache-1', minutes: 70 }]);
  });

  it('requires multiple task allocations to match the exact duration', async () => {
    const { service, pointage, tacheChantier, pointageTache } = createService();
    pointage.findFirst.mockResolvedValue({
      id: 'pointage-1',
      userId: 'user-1',
      companyId: 'company-a',
      chantierId: 'chantier-1',
      status: 'TERMINE',
      totalMinutes: 70,
      totalHours: 70 / 60,
    });
    tacheChantier.findMany.mockResolvedValue([
      { id: 'tache-1' },
      { id: 'tache-2' },
    ]);
    pointageTache.findMany.mockResolvedValue([
      { tacheId: 'tache-1', minutes: 30 },
      { tacheId: 'tache-2', minutes: 30 },
    ]);

    await expect(
      service.saveRepartition('pointage-1', 'user-1', 'company-a', {
        repartitions: [
          { tacheId: 'tache-1', minutes: 30 },
          { tacheId: 'tache-2', minutes: 30 },
        ],
      }),
    ).rejects.toThrow('totaliser 70 minutes');

    await expect(
      service.saveRepartition('pointage-1', 'user-1', 'company-a', {
        repartitions: [
          { tacheId: 'tache-1', minutes: 35 },
          { tacheId: 'tache-2', minutes: 35 },
        ],
      }),
    ).resolves.toHaveLength(2);
  });

  it('accepts the exact proportional result for several tasks', async () => {
    const { service, pointage, tacheChantier, pointageTache } = createService();
    pointage.findFirst.mockResolvedValue({
      id: 'pointage-1',
      userId: 'user-1',
      companyId: 'company-a',
      chantierId: 'chantier-1',
      status: 'TERMINE',
      totalMinutes: 26,
      totalHours: 26 / 60,
    });
    tacheChantier.findMany.mockResolvedValue([
      { id: 'tache-1' },
      { id: 'tache-2' },
    ]);
    pointageTache.findMany.mockResolvedValue([
      { tacheId: 'tache-1', minutes: 13 },
      { tacheId: 'tache-2', minutes: 13 },
    ]);

    await expect(
      service.saveRepartition('pointage-1', 'user-1', 'company-a', {
        repartitions: [
          { tacheId: 'tache-1', minutes: 13 },
          { tacheId: 'tache-2', minutes: 13 },
        ],
      }),
    ).resolves.toHaveLength(2);
  });
});
