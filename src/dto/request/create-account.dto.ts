import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAccountDto {
  @ApiPropertyOptional({
    description:
      'The amount of SOL to fund the new account with. On devnet, this will be overridden by 2 SOL, the maximum allowable amount',
  })
  @IsNumber()
  @IsOptional() // optional for validation
  amt: number;

  @IsString()
  @IsOptional()
  label?: string;
}
