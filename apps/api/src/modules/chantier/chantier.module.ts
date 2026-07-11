import { Module } from '@nestjs/common';
import { ChantierController } from './chantier.controller';
import { ChantierService } from './chantier.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ChantierController],
  providers: [ChantierService],
})
export class ChantierModule {}
