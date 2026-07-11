import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, ArrayMaxSize } from 'class-validator';
import { TACHE_TYPES, TacheType } from '../tache-types.constants';

export class SaveTachesDto {
  @ApiProperty({ example: ['COFFRAGE', 'BETON'], isArray: true })
  @IsArray()
  @IsIn(TACHE_TYPES, { each: true })
  @ArrayMaxSize(TACHE_TYPES.length)
  taches: TacheType[];
}
