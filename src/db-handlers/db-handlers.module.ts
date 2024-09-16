import { Module } from '@nestjs/common';
import { WalletDbHandlerService } from './wallet-db-handler.service';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService, WalletDbHandlerService],
  exports: [WalletDbHandlerService]
})
export class DbHandlersModule {}
