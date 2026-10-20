import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DepenseStatutControle } from '@prisma/client';

export class ControleDepenseDto {
  @ApiProperty({ enum: DepenseStatutControle })
  @IsEnum(DepenseStatutControle)
  statut: DepenseStatutControle;

  @ApiPropertyOptional({
    description: 'Motif obligatoire lorsque la dépense est rejetée',
  })
  @ValidateIf((dto: ControleDepenseDto) => dto.statut === 'REJETEE')
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  @IsOptional()
  motifRejet?: string;
}
