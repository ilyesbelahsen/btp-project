import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOuvrierDto } from './dto/create-ouvrier.dto';

const TEMP_PASSWORD = 'BTP@2026';
const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async createOuvrier(companyId: string, dto: CreateOuvrierDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing)
      throw new ConflictException('Cette adresse email est déjà utilisée');

    const passwordHash = await bcrypt.hash(TEMP_PASSWORD, SALT_ROUNDS);

    const ouvrier = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: passwordHash,
        role: 'OUVRIER',
        companyId,
        tauxHoraire: dto.tauxHoraire,
        phone: dto.phone,
        address: dto.address,
        numeroCv: dto.numeroCv,
        mutuelle: dto.mutuelle,
        contactUrgence: dto.contactUrgence,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        tauxHoraire: true,
      },
    });

    // Le mot de passe temporaire est retourné pour que le patron le communique à l'ouvrier
    return { ...ouvrier, tempPassword: TEMP_PASSWORD };
  }

  findAllOuvriers(companyId: string) {
    return this.prisma.user.findMany({
      where: { companyId, role: 'OUVRIER' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        tauxHoraire: true,
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  async findOuvrierDetail(id: string, companyId: string) {
    const ouvrier = await this.prisma.user.findFirst({
      where: { id, companyId, role: 'OUVRIER' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        numeroCv: true,
        mutuelle: true,
        contactUrgence: true,
        tauxHoraire: true,
        role: true,
        createdAt: true,
        // CA4 : chantiers affectés via M:M
        chantiers: {
          select: {
            id: true,
            name: true,
            status: true,
            startDate: true,
            endDate: true,
          },
          orderBy: { startDate: 'desc' },
        },
        // CA3 : historique des pointages
        pointages: {
          where: { companyId },
          select: {
            id: true,
            startTime: true,
            endTime: true,
            totalMinutes: true,
            totalHours: true,
            status: true,
            taches: true,
            comment: true,
            chantier: { select: { id: true, name: true } },
          },
          orderBy: { startTime: 'desc' },
        },
      },
    });

    if (!ouvrier) throw new NotFoundException('Ouvrier introuvable');
    return ouvrier;
  }
}
