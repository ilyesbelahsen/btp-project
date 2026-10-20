import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpsertZoneMajorationDto {
  @ApiProperty({ example: 0.15, description: 'Taux décimal, 15 % = 0.15' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(10)
  tauxMajoration: number;

  @ApiPropertyOptional({
    example: '2026-10-03T00:00:00.000Z',
    description: "Date à partir de laquelle le taux s'applique",
  })
  @IsOptional()
  @IsDateString()
  dateEffet?: string;
}
