import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaiePreviewQueryDto {
  @ApiProperty({ example: '2026-08-01' })
  @IsDateString()
  dateFrom: string;

  @ApiProperty({ example: '2026-08-31' })
  @IsDateString()
  dateTo: string;
}
