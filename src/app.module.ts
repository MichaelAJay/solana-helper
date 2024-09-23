import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { BlockchainClientModule } from './blockchain-client/blockchain-client.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), BlockchainClientModule],
  controllers: [AppController],
})
export class AppModule {}
