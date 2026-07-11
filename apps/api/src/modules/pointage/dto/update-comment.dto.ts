import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({ example: 'Pose des parpaings terminée, RAS.', maxLength: 500 })
  @IsString()
  @MaxLength(500, {
    message: 'Le commentaire ne peut pas dépasser 500 caractères',
  })
  comment: string;
}
