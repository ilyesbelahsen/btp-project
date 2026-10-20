import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateIndemniteDto {
  @ApiProperty({ example: 'Panier repas' })
  @IsString()
  @Length(1, 120)
  libelle: string;

  @ApiPropertyOptional({ example: 12.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  montant?: number;

  @ApiPropertyOptional({
    example: 'Selon convention collective et jours travailles',
  })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  regle?: string;
}
