import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Keypair } from '@solana/web3.js';

@Injectable()
export class AccountDbHandlerService {

    constructor(private readonly prismaService: PrismaService) {};

    async createAccount(wallet: Keypair, label?: string) {
        await this.prismaService.account.create({
            data: {
                publicKey: wallet.publicKey.toString(),
                privateKey: Buffer.from(wallet.secretKey).toString('hex'),
                label
            }
        })
    };

    async retrieveAccount(publicKey: string) {
        return await this.prismaService.account.findUniqueOrThrow({
            where: { publicKey }
        })
    }

    async listAccounts(isSafe: boolean) {
        /**
         * Consider pagination
         */
        return await this.prismaService.account.findMany({
            select: {
                publicKey: true,
                privateKey: !isSafe,
                label: true,
                createdAt: true,
                updatedAt: true
            }
        });
    }
}
