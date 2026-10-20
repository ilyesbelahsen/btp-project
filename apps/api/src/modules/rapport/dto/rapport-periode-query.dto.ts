import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class RapportPeriodeQueryDto {
  @IsDateString()
  dateFrom!: string;

  @IsDateString()
  dateTo!: string;

  @IsOptional()
  @IsUUID()
  chantierId?: string;
}