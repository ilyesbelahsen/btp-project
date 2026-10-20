import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class RepartitionTacheDto {
  @IsString()
  tacheId: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  minutes: number;
}

export class SaveRepartitionDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RepartitionTacheDto)
  repartitions: RepartitionTacheDto[];
}
