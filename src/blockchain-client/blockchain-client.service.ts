import { Injectable } from '@nestjs/common';
import { BlockchainClient } from './blockchain-client.interface';
import { CalculateTxCostReturn, CreateAccountReturn, SendTxReturn } from './types/return';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from '@solana/web3.js';
import { AccountDbHandlerService } from 'src/db-handlers/account-db-handler.service';
import { BlockchainClientUtilityService } from './blockchain-client-utility.service';

@Injectable()
export class BlockchainClientService implements BlockchainClient {
    private connection: Connection;

    constructor(private readonly accountDbHandler: AccountDbHandlerService, private readonly utilService: BlockchainClientUtilityService) {
        this.connection = new Connection("http://127.0.0.1:8899", "confirmed");
    }

    async createAccount(amt: number, label?: string): Promise<CreateAccountReturn> {
        try {
            // Create system wallet to airdrop funds to new user account
            const fromPubkey = Keypair.generate();

            // amount of space to reserve for the account
            const space = 0;

            // Seed the created account with lamports for rent exemption
            const rentExemptionAmount = await this.connection.getMinimumBalanceForRentExemption(space); // lamports
            const amtToFund = amt * LAMPORTS_PER_SOL + rentExemptionAmount;
            const airdropSignature = await this.connection.requestAirdrop(fromPubkey.publicKey, 2 * amtToFund);
            await this.connection.confirmTransaction(airdropSignature);

            const newAccountKeypair = Keypair.generate();
            const createAccountParams = {
                fromPubkey: fromPubkey.publicKey,
                newAccountPubkey: newAccountKeypair.publicKey,
                lamports: amtToFund,
                space,
                programId: SystemProgram.programId
            };

            const createAccountTransaction = new Transaction().add(SystemProgram.createAccount(createAccountParams));
            await sendAndConfirmTransaction(this.connection, createAccountTransaction, [fromPubkey, newAccountKeypair]);

            const { secretKey, ...account} = await this.accountDbHandler.createAccount(newAccountKeypair, label);

            return { success: true, account };
        } catch (err) {
            throw err;
        }
    }
    async listAccounts(isSafe = true): Promise<any> {
        try {
            const wallets = await this.accountDbHandler.listAccounts(isSafe);
            return Object.values(wallets);
        } catch (err) {
            throw err;
        }
    }
    async getAccountBalance(input: string | PublicKey, getBaseUnit: boolean): Promise<number> {
        try {
            const account = this.utilService.generatePublicKey(input);
            const result = await this.connection.getBalance(account);
            return getBaseUnit ?  result / LAMPORTS_PER_SOL : result;
        } catch (err) {
            throw err;
        }
    }
    /**
     * @param amt expressed in BASE units (e.g. 'BTC' instead of 'satoshis', 'ETH' instead of 'gwei', 'SOL' instead of 'lamports')
     */
    async sendTx(fromPubkeyStr: string, toPubkeyInput: string | PublicKey, amt: number): Promise<SendTxReturn> {
        try {
            const toPubkey = this.utilService.generatePublicKey(toPubkeyInput);
            const fromWallet = await this.accountDbHandler.retrieveAccount(fromPubkeyStr);
            const fromKeypair = this.utilService.restoreKeypair(fromWallet.secretKey);

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
}
