import { Injectable } from '@nestjs/common';
import { BlockchainClient } from './blockchain-client.interface';
import { CalculateTxCostReturn, CreateWalletReturn, GetWalletBalanceReturn, SendTxReturn } from './types/return';
import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';

@Injectable()
export class BlockchainClientService implements BlockchainClient {
    private connection: Connection;

    constructor() {
        this.connection = new Connection("http://127.0.0.1:8899", "confirmed");
    }

    async createWallet(): Promise<CreateWalletReturn> {
        const keypair = Keypair.generate();

        // What do I want to do with the keypair?
        return [];
    }
    async getWalletBalance(): Promise<GetWalletBalanceReturn> {
        throw new Error('Method not implemented.');
    }
    async sendTx(): Promise<SendTxReturn> {
        throw new Error('Method not implemented.');
    }
    async calculateTxCost(): Promise<CalculateTxCostReturn> {
        throw new Error('Method not implemented.');
    }
}
