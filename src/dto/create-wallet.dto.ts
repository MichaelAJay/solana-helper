import { IsOptional, IsString } from 'class-validator';

export class CreateWalletDto {
  @IsString()
  @IsOptional()
  label?: string;
}
