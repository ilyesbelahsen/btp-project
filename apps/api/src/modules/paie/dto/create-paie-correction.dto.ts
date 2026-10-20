import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaieCorrectionDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  userId: string;

  @ApiProperty({ example: '2026-09-01' })
  @IsDateString()
  dateFrom: string;

  @ApiProperty({ example: '2026-09-30' })
  @IsDateString()
  dateTo: string;

  @ApiPropertyOptional({ description: 'Heures majorées corrigées' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1000)
  heuresMajorees?: number;

  @ApiPropertyOptional({ description: 'Nombre d indemnités corrigé' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(366)
  nombreIndemnites?: number;

  @ApiProperty({ description: 'Motif de la correction' })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  motif: string;
}
