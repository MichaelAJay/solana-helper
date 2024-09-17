import { Injectable } from '@nestjs/common';
import { BlockchainClient } from './blockchain-client.interface';
import { CalculateTxCostReturn, CreateAccountReturn, SendTxReturn } from './types/return';
import { Connection, Keypair, LAMPORTS_PER_SOL, sendAndConfirmTransaction, SystemProgram, Transaction } from '@solana/web3.js';
import { AccountDbHandlerService } from 'src/db-handlers/account-db-handler.service';
import { BlockchainClientUtilityService } from './blockchain-client-utility.service';

@Injectable()
export class BlockchainClientService implements BlockchainClient {
    private connection: Connection;

    constructor(private readonly walletDbHandler: AccountDbHandlerService, private readonly utilService: BlockchainClientUtilityService) {
        this.connection = new Connection("http://127.0.0.1:8899", "confirmed");
    }

    async createAccount(label?: string): Promise<CreateAccountReturn> {
        try {
            const wallet = Keypair.generate();
            await this.walletDbHandler.createAccount(wallet, label);
            return { success: true };
        } catch (err) {
            throw err;
        }
    }
    async listAccounts(isSafe = true): Promise<any> {
        try {
            const wallets = await this.walletDbHandler.listAccounts(isSafe);
            return Object.values(wallets);
        } catch (err) {
            throw err;
        }
    }
    async getAccountBalance(publicKeyStr: string): Promise<number> {
        try {
            const wallet = this.utilService.publicKeyFromString(publicKeyStr);
            const result = await this.connection.getBalance(wallet) / LAMPORTS_PER_SOL;
            return result;
        } catch (err) {
            throw err;
        }
    }
    /**
     * @param amt expressed in BASE units (e.g. 'BTC' instead of 'satoshis', 'ETH' instead of 'gwei', 'SOL' instead of 'lamports')
     */
    async airdropToAccount(publicKeyStr: string, amt: number) {
        try {
            const publicKey = this.utilService.publicKeyFromString(publicKeyStr);
            // This is mainly here for reference
            const preDropBalance = await this.getAccountBalance(publicKeyStr);
            const airdropSignature = await this.connection.requestAirdrop(publicKey, amt * LAMPORTS_PER_SOL);
            await this.connection.confirmTransaction(airdropSignature);
            const postDropBalance = await this.getAccountBalance(publicKeyStr);
            return { oldBalance: preDropBalance, newBalance: postDropBalance };
        } catch (err) {
            throw err;
        }
    }
    /**
     * @param amt expressed in BASE units (e.g. 'BTC' instead of 'satoshis', 'ETH' instead of 'gwei', 'SOL' instead of 'lamports')
     */
    async sendTx(fromPubkeyStr: string, toPubkeyStr: string, amt: number): Promise<SendTxReturn> {
        try {
            const toPubkey = this.utilService.publicKeyFromString(toPubkeyStr);
            const fromWallet = await this.walletDbHandler.retrieveAccount(fromPubkeyStr);
            const fromKeypair = this.utilService.restoreKeypair(fromWallet.privateKey);

            const transferTransaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: fromKeypair.publicKey,
                    toPubkey,
                    lamports: amt * LAMPORTS_PER_SOL
                })
            )

            await sendAndConfirmTransaction(this.connection, transferTransaction, [fromKeypair]);

            return { success: true };
        } catch (err) {
            throw err;
        }
    }
    async calculateTxCost(): Promise<CalculateTxCostReturn> {
        throw new Error('Method not implemented.');
    }
    // async createAccount(keypair: Keypair) {
    //     const fromPubkey = Keypair.generate();
    //     await this.airdropToAccount(fromPubkey.publicKey.toString(), 10);

    //     // amount of space to reserve for the account
    //     const space = 0;

    //     // Seed the created account with lamports for rent exemption
    //     const rentExemptionAmount = await this.connection.getMinimumBalanceForRentExemption(space);

    //     const createAccountParams = {
    //         fromPubkey: fromPubkey.publicKey,
    //         newAccountPubkey: keypair.publicKey,
    //         lamports: rentExemptionAmount,
    //         space,
    //         programId: SystemProgram.programId
    //     };

    //     const createAccountTransaction = new Transaction().add(
    //         SystemProgram.createAccount(createAccountParams)
    //     );

    //     await sendAndConfirmTransaction(this.connection, createAccountTransaction, [fromPubkey, keypair])
    //     return []
    // }
}
