import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CorrigerPointageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  taches?: string[];
}
