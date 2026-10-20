import { Module } from '@nestjs/common';
import { TacheChantierController } from './tache-chantier.controller';
import { TacheChantierService } from './tache-chantier.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TacheChantierController],
  providers: [TacheChantierService],
})
export class TacheChantierModule {}
