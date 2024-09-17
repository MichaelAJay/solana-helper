import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAccountDto {
  @IsNumber()
  @IsOptional() // optional for validation
  amt: number;

  @IsString()
  @IsOptional()
  label?: string;
}
