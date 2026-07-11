import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class StartPointageDto {
  @ApiProperty({ example: 'uuid-du-chantier' })
  @IsString()
  @IsUUID()
  chantierId: string;
}
