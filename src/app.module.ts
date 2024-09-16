import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { BlockchainClientService } from './blockchain-client/blockchain-client.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [BlockchainClientService],
})
export class AppModule {}
