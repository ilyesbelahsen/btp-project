import { DepenseService } from './depense.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { CreateDepenseDto } from './dto/create-depense.dto';
import type { ControleDepenseDto } from './dto/controle-depense.dto';

describe('DepenseService', () => {
  const chantierFindFirst = jest.fn();
  const tacheFindFirst = jest.fn();
  const depenseFindFirst = jest.fn();
  const depenseCreate = jest.fn();
  const depenseUpdateMany = jest.fn();
  const depenseControleHistoriqueCreate = jest.fn();
  const prisma = {
    chantier: { findFirst: chantierFindFirst },
    tacheChantier: { findFirst: tacheFindFirst },
    depense: {
      findFirst: depenseFindFirst,
      create: depenseCreate,
    },
    $transaction: jest.fn(async (callback) =>
      callback({
        depense: { updateMany: depenseUpdateMany },
        depenseControleHistorique: {
          create: depenseControleHistoriqueCreate,
        },
      }),
    ),
  } as unknown as PrismaService;
  const service = new DepenseService(prisma);
  const dto: CreateDepenseDto = {
    chantierId: 'chantier-1',
    tacheId: 'tache-1',
    categorie: 'MATERIEL',
    montant: 120,
    date: '2026-09-30',
    description: 'Sacs de ciment',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    chantierFindFirst.mockResolvedValue({ id: dto.chantierId });
    tacheFindFirst.mockResolvedValue({ id: dto.tacheId });
  });

  it('returns the existing expense when the idempotency key is retried', async () => {
    const existingDepense = {
      id: 'depense-1',
      chantierId: dto.chantierId,
      companyId: 'company-1',
      tacheId: dto.tacheId,
      categorie: dto.categorie,
      montant: dto.montant,
      description: dto.description,
      date: new Date(dto.date),
      createdAt: new Date(dto.date),
      updatedAt: new Date(dto.date),
      idempotencyKey: 'request-1',
      tache: { libelle: 'Gros œuvre' },
    };
    depenseFindFirst.mockResolvedValue(existingDepense);

    const result = await service.create('company-1', dto, 'request-1');

    expect(result.id).toBe(existingDepense.id);
    expect(depenseCreate).not.toHaveBeenCalled();
    expect(depenseFindFirst).toHaveBeenCalledWith({
      where: { companyId: 'company-1', idempotencyKey: 'request-1' },
      include: { tache: { select: { libelle: true } } },
    });
  });

  it('rejects an expense only when a reason is provided and records the decision', async () => {
    const pendingDepense = {
      id: 'depense-1',
      companyId: 'company-1',
      statutControle: 'A_CONTROLER',
    };
    const updatedDepense = {
      ...pendingDepense,
      chantierId: dto.chantierId,
      tacheId: dto.tacheId,
      tache: { libelle: 'Gros œuvre' },
      statutControle: 'REJETEE',
      motifRejet: 'Facture illisible',
    };
    depenseFindFirst
      .mockResolvedValueOnce(pendingDepense)
      .mockResolvedValueOnce(updatedDepense);
    depenseUpdateMany.mockResolvedValue({ count: 1 });

    const controlDto: ControleDepenseDto = {
      statut: 'REJETEE',
      motifRejet: 'Facture illisible',
    };
    const result = await service.controler(
      'depense-1',
      'company-1',
      'user-1',
      controlDto,
    );

    expect(result.statutControle).toBe('REJETEE');
    expect(depenseUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'depense-1',
          companyId: 'company-1',
          statutControle: { in: ['A_CONTROLER', 'REJETEE'] },
        },
        data: expect.objectContaining({
          statutControle: 'REJETEE',
          motifRejet: 'Facture illisible',
          controleeParId: 'user-1',
        }),
      }),
    );
    expect(depenseControleHistoriqueCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          depenseId: 'depense-1',
          companyId: 'company-1',
          statut: 'REJETEE',
          motif: 'Facture illisible',
          auteurId: 'user-1',
        }),
      }),
    );
  });

  it('does not allow a rejected decision without a reason', async () => {
    depenseFindFirst.mockResolvedValue({
      id: 'depense-1',
      companyId: 'company-1',
      statutControle: 'A_CONTROLER',
    });

    await expect(
      service.controler('depense-1', 'company-1', 'user-1', {
        statut: 'REJETEE',
      }),
    ).rejects.toThrow('Le motif de rejet est obligatoire');
    expect(depenseUpdateMany).not.toHaveBeenCalled();
  });

  it('does not change an already accepted expense', async () => {
    depenseFindFirst.mockResolvedValue({
      id: 'depense-1',
      companyId: 'company-1',
      statutControle: 'ACCEPTEE',
    });

    await expect(
      service.controler('depense-1', 'company-1', 'user-1', {
        statut: 'REJETEE',
        motifRejet: 'Correction',
      }),
    ).rejects.toThrow('Une dépense acceptée ne peut plus être contrôlée');
    expect(depenseUpdateMany).not.toHaveBeenCalled();
  });
});
