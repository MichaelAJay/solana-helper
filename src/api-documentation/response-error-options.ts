import { ApiResponseOptions } from "@nestjs/swagger";

export const BlockchainNodeUnavailableApiResponseOptions: ApiResponseOptions = {
    description: "Connection to the blockchain node failed. Ensure that it's running."
}