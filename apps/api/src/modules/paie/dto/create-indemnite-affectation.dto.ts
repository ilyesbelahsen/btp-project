import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';

export class CreateIndemniteAffectationDto {
  @ApiProperty()
  @IsUUID()
  indemniteId: string;

  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty({ example: '2026-10-01' })
  @IsDateString()
  dateFrom: string;

  @ApiProperty({ example: '2026-10-31' })
  @IsDateString()
  dateTo: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantite?: number;

  @ApiPropertyOptional({ example: 'Affectation octobre 2026' })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  note?: string;
}
