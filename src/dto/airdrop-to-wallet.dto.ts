import { IsNumber } from 'class-validator';

export class AirdropToWalletDto {
  @IsNumber()
  amt: number;
}
