import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TacheDto } from './tache.dto';

export class SaveTachesDevisDto {
  @ApiProperty({ type: [TacheDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TacheDto)
  taches: TacheDto[];
}
