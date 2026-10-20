import {
  IsString,
  MinLength,
  IsEmail,
  IsOptional,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOuvrierDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  firstName: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Taux horaire — obligatoire pour calcul coût MO',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  tauxHoraire: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  numeroCv?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mutuelle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactUrgence?: string;
}
