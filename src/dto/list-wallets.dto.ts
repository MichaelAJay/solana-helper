import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class ListWalletsDto {
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value !== 'false')
  is_safe?: boolean;
}
