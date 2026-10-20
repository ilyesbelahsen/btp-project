import { Module } from '@nestjs/common';
import { RapportController } from './rapport.controller';
import { RapportService } from './rapport.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RapportController],
  providers: [RapportService],
})
export class RapportModule {}
