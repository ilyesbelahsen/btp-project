import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsUUID } from 'class-validator';

export class SaveTachesDto {
  @ApiProperty({ example: ['task-uuid-1', 'task-uuid-2'], isArray: true })
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(100)
  taches: string[];
}
