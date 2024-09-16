import { Module } from '@nestjs/common';
import { DbHandlersModule } from 'src/db-handlers/db-handlers.module';
import { BlockchainClientService } from './blockchain-client.service';
import { BlockchainClientUtilityService } from './blockchain-client-utility.service';

@Module({
    imports: [DbHandlersModule],
    providers: [BlockchainClientService, BlockchainClientUtilityService],
    exports: [BlockchainClientService]
})
export class BlockchainClientModule {}

