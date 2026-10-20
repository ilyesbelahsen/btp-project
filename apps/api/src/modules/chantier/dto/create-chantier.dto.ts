import {
  IsString,
  MinLength,
  IsNumber,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateChantierDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  address: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  client: string;

  @ApiProperty({
    description:
      "Budget prévisionnel main d'œuvre HT (interne + sous-traitance)",
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  budgetMainOeuvre: number;

  @ApiProperty({ description: 'Budget prévisionnel matériaux HT' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  budgetMateriaux: number;

  @ApiProperty({ description: 'Prix de vente HT saisi par le patron' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  prixVenteHT: number;

  @ApiProperty({
    example: 1.2,
    description:
      'Coefficient appliqué au budget total pour calculer la marge visée',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  coefficient: number;

  @ApiProperty({ enum: [1, 2, 3, 4] })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  zoneCategorie: number;

  @ApiProperty({ example: '2026-03-01' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
