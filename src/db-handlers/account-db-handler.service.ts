import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Keypair } from '@solana/web3.js';
import { AccountEnvironment } from 'src/blockchain-client/constants/account-environment.constant';

@Injectable()
export class AccountDbHandlerService {
  constructor(private readonly prismaService: PrismaService) {}

  async createAccount(
    wallet: Keypair,
    env: AccountEnvironment,
    label?: string,
  ) {
    if (label === 'SYSTEM') {
      throw new Error('SYSTEM is a reserved label');
    }

    return await this.prismaService.account.create({
      data: {
        publicKey: wallet.publicKey.toString(),
        secretKey: Buffer.from(wallet.secretKey).toString('hex'),
        label,
        environment: env, // Default is 'LOCAL'
      },
    });
  }

  async retrieveAccount(publicKey: string) {
    return await this.prismaService.account.findUniqueOrThrow({
      where: { publicKey },
    });
  }

  async retrieveSystemAccount(environment: AccountEnvironment) {
    return await this.prismaService.account.findFirstOrThrow({
      where: { environment, label: 'SYSTEM' },
    });
  }

  async listAccounts(isSafe: boolean, environment: AccountEnvironment) {
    /**
     * Consider pagination
     */
    return await this.prismaService.account.findMany({
      where: { environment },
      select: {
        publicKey: true,
        secretKey: !isSafe,
        label: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
