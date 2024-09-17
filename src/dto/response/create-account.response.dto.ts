import { ApiProperty } from "@nestjs/swagger";
import { CreateAccountReturn } from "src/blockchain-client/types/return";

export class CreateAccountResponseDto implements CreateAccountReturn {
    @ApiProperty({ example: true })
    success: true;

    @ApiProperty({
        example: {
            publicKey: 'string',
            label: 'string',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
        }
    })
    account: Omit<{ publicKey: string; secretKey: string; label: string | null; createdAt: Date; updatedAt: Date; }, "secretKey"> & { secretKey?: string; };
}