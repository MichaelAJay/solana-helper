import { Module } from '@nestjs/common';
import { AccountDbHandlerService } from './account-db-handler.service';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService, AccountDbHandlerService],
  exports: [AccountDbHandlerService]
})
export class DbHandlersModule {}
