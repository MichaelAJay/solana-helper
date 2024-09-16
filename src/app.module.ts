import { Module, Post } from '@nestjs/common';
import { AppController } from './app.controller';
import { BlockchainClientModule } from './blockchain-client/blockchain-client.module';

@Module({
  imports: [BlockchainClientModule],
  controllers: [AppController],
})
export class AppModule {}
