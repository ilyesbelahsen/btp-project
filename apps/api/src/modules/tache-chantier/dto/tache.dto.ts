import {
  IsString,
  MinLength,
  IsOptional,
  IsNumber,
  IsPositive,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TacheDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  libelle: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  prixVenduHT?: number;

  @ApiPropertyOptional({
    description: "Budget prévisionnel main d'œuvre de la tâche",
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  budgetMainOeuvre?: number;

  @ApiPropertyOptional({
    description: 'Budget prévisionnel matériaux de la tâche',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  budgetMateriaux?: number;
}
