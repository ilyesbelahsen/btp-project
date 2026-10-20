import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateIndemniteDto } from './create-indemnite.dto';

export class UpdateIndemniteDto extends PartialType(CreateIndemniteDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
