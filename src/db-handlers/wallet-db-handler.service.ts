import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Keypair } from '@solana/web3.js';

@Injectable()
export class WalletDbHandlerService {

    constructor(private readonly prismaService: PrismaService) {};

    async createWallet(wallet: Keypair, label?: string) {
        await this.prismaService.wallet.create({
            data: {
                publicKey: wallet.publicKey.toString(),
                privateKey: Buffer.from(wallet.secretKey).toString('hex'),
                label
            }
        })
    };

    async retrieveWallet(publicKey: string) {
        return await this.prismaService.wallet.findUniqueOrThrow({
            where: { publicKey }
        })
    }

    async listWallets(isSafe: boolean) {

        // select: {
        //     publicKey: true,
        //     privateKey: isSafe,
        //     label: true,
        //     createdAt: true,
        //     updatedAt: true
        // }
        /**
         * Consider pagination
         */
        return await this.prismaService.wallet.findMany({
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
