import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SoumettrePointageDto {
  @ApiPropertyOptional({
    example: 'Retard de livraison du matériel.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'Le commentaire ne peut pas dépasser 500 caractères',
  })
  comment?: string;
}
