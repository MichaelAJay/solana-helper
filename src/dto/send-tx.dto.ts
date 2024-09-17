import { IsNumber, IsString } from 'class-validator';

export class SendTxDto {
  @IsString()
  fromPubkeyStr: string;

  @IsString()
  toPubkeyStr: string;

  @IsNumber()
  amt: number;
}