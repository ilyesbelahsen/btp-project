import {
  IsString,
  IsEnum,
  IsNumber,
  IsPositive,
  IsDateString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DepenseCategorie } from '@prisma/client';

export class CreateDepenseDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  chantierId: string;

  @ApiProperty({
    description: 'Tâche du chantier à laquelle rattacher la dépense',
  })
  @IsString()
  @MinLength(1)
  @Matches(/\S/, { message: 'La tâche est requise' })
  tacheId: string;

  @ApiProperty({ enum: DepenseCategorie })
  @IsEnum(DepenseCategorie)
  categorie: DepenseCategorie;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  montant: number;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Fournisseur ou émetteur du justificatif',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  fournisseur?: string;
}
