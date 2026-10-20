import { Module } from '@nestjs/common';
import { PaieController } from './paie.controller';
import { PaieService } from './paie.service';

@Module({
  controllers: [PaieController],
  providers: [PaieService],
})
export class PaieModule {}
