import { Module } from '@nestjs/common';
import { DepenseController } from './depense.controller';
import { DepenseService } from './depense.service';

@Module({
  controllers: [DepenseController],
  providers: [DepenseService]
})
export class DepenseModule {}
