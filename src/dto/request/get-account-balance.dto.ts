import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

export class GetAccountBalanceDto {
    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value !== 'false')
    in_base_unit?: boolean
}