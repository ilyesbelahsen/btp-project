import { IsNumber, Min } from 'class-validator';

export class UpdateTresorerieDto {
  @IsNumber()
  @Min(0)
  capitalInitial!: number;
}