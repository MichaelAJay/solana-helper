import { IsBoolean, IsOptional } from 'class-validator';

export class ListWalletsDto {
  @IsBoolean()
  @IsOptional()
  is_safe?: boolean;
}
