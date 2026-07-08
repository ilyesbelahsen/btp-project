import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  private async seed() {
    const existing = await this.prisma.company.findFirst();
    if (existing) {
      this.logger.log('Base de données déjà initialisée — seed ignoré');
      return;
    }

    this.logger.log('Initialisation des données de démonstration…');

    const SALT_ROUNDS = 10;
    const DEFAULT_PASSWORD = 'Password123!';
    const hash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

    // ── Company ───────────────────────────────────────────────────────────────
    const company = await this.prisma.company.create({
      data: { name: 'BTP Construction SARL' },
    });

    // ── Users ─────────────────────────────────────────────────────────────────
    const [, , ouvrier1, ouvrier2, ouvrier3] = await Promise.all([
      this.prisma.user.create({
        data: {
          email: 'patron@btp.fr',
          password: hash,
          firstName: 'Jean',
          lastName: 'Dupont',
          role: 'PATRON',
          companyId: company.id,
        },
      }),
      this.prisma.user.create({
        data: {
          email: 'comptable@btp.fr',
          password: hash,
          firstName: 'Marie',
          lastName: 'Martin',
          role: 'COMPTABLE',
          companyId: company.id,
        },
      }),
      this.prisma.user.create({
        data: {
          email: 'ouvrier1@btp.fr',
          password: hash,
          firstName: 'Thomas',
          lastName: 'Bernard',
          role: 'OUVRIER',
          companyId: company.id,
        },
      }),
      this.prisma.user.create({
        data: {
          email: 'ouvrier2@btp.fr',
          password: hash,
          firstName: 'Lucas',
          lastName: 'Moreau',
          role: 'OUVRIER',
          companyId: company.id,
        },
      }),
      this.prisma.user.create({
        data: {
          email: 'ouvrier3@btp.fr',
          password: hash,
          firstName: 'Antoine',
          lastName: 'Petit',
          role: 'OUVRIER',
          companyId: company.id,
        },
      }),
    ]);

    // ── Chantiers ─────────────────────────────────────────────────────────────
    const now = new Date();
    const [chantier1, chantier2] = await Promise.all([
      this.prisma.chantier.create({
        data: {
          name: 'Résidence Les Cèdres',
          address: '12 rue des Cèdres, 75001 Paris',
          status: 'EN_COURS',
          budget: 450_000,
          startDate: new Date('2026-03-01'),
          companyId: company.id,
        },
      }),
      this.prisma.chantier.create({
        data: {
          name: 'Centre Commercial Lumière',
          address: '45 avenue Lumière, 69003 Lyon',
          status: 'EN_COURS',
          budget: 1_200_000,
          startDate: new Date('2026-01-15'),
          companyId: company.id,
        },
      }),
      this.prisma.chantier.create({
        data: {
          name: 'École Primaire Voltaire',
          address: '8 rue Voltaire, 31000 Toulouse',
          status: 'TERMINE',
          budget: 280_000,
          startDate: new Date('2025-09-01'),
          endDate: new Date('2026-06-30'),
          companyId: company.id,
        },
      }),
    ]);

    // ── Pointages ─────────────────────────────────────────────────────────────

    // Ouvrier1 — journée d'hier validée
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(yesterday);
    yesterdayStart.setHours(7, 30, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(16, 30, 0, 0);

    await this.prisma.pointage.create({
      data: {
        userId: ouvrier1.id,
        chantierId: chantier1.id,
        companyId: company.id,
        status: 'VALIDE',
        startTime: yesterdayStart,
        endTime: yesterdayEnd,
        totalHours: 9,
        comment: 'Pose des fondations — travaux conformes au plan',
      },
    });

    // Ouvrier1 — journée en cours aujourd'hui
    const todayStart = new Date(now);
    todayStart.setHours(7, 45, 0, 0);

    await this.prisma.pointage.create({
      data: {
        userId: ouvrier1.id,
        chantierId: chantier1.id,
        companyId: company.id,
        status: 'EN_COURS',
        startTime: todayStart,
      },
    });

    // Ouvrier2 — pointage soumis hier sur chantier2
    const o2Start = new Date(yesterday);
    o2Start.setHours(8, 0, 0, 0);
    const o2End = new Date(yesterday);
    o2End.setHours(17, 0, 0, 0);

    await this.prisma.pointage.create({
      data: {
        userId: ouvrier2.id,
        chantierId: chantier2.id,
        companyId: company.id,
        status: 'TERMINE',
        startTime: o2Start,
        endTime: o2End,
        totalHours: 9,
      },
    });

    // Ouvrier3 — deux journées passées sur chantier1
    for (let daysAgo = 3; daysAgo <= 4; daysAgo++) {
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      const s = new Date(d);
      s.setHours(8, 0, 0, 0);
      const e = new Date(d);
      e.setHours(16, 0, 0, 0);

      await this.prisma.pointage.create({
        data: {
          userId: ouvrier3.id,
          chantierId: chantier1.id,
          companyId: company.id,
          status: 'VALIDE',
          startTime: s,
          endTime: e,
          totalHours: 8,
        },
      });
    }

    // ── Dépenses ──────────────────────────────────────────────────────────────
    await Promise.all([
      this.prisma.depense.create({
        data: {
          chantierId: chantier1.id,
          companyId: company.id,
          categorie: 'MATERIEL',
          montant: 3_500,
          description: 'Achat de parpaings et ciment',
          date: new Date('2026-03-10'),
        },
      }),
      this.prisma.depense.create({
        data: {
          chantierId: chantier1.id,
          companyId: company.id,
          categorie: 'TRANSPORT',
          montant: 800,
          description: 'Location camion-grue',
          date: new Date('2026-03-15'),
        },
      }),
      this.prisma.depense.create({
        data: {
          chantierId: chantier2.id,
          companyId: company.id,
          categorie: 'MAIN_OEUVRE',
          montant: 12_000,
          description: 'Sous-traitant électricité',
          date: new Date('2026-02-20'),
        },
      }),
      this.prisma.depense.create({
        data: {
          chantierId: chantier2.id,
          companyId: company.id,
          categorie: 'MATERIEL',
          montant: 6_200,
          description: 'Fourniture acier et ferraillage',
          date: new Date('2026-02-05'),
        },
      }),
    ]);

    this.logger.log('✅ Seed terminé avec succès');
    this.logger.log('─────────────────────────────────────────');
    this.logger.log('  Comptes de démonstration (mot de passe : Password123!)');
    this.logger.log('  PATRON     → patron@btp.fr');
    this.logger.log('  COMPTABLE  → comptable@btp.fr');
    this.logger.log('  OUVRIER 1  → ouvrier1@btp.fr');
    this.logger.log('  OUVRIER 2  → ouvrier2@btp.fr');
    this.logger.log('  OUVRIER 3  → ouvrier3@btp.fr');
    this.logger.log('─────────────────────────────────────────');
  }
}
