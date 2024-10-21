import { Injectable, OnModuleInit } from '@nestjs/common';
import { BlockchainClient } from './blockchain-client.interface';
import {
  CalculateTxCostReturn,
  CreateAccountReturn,
  SendTxReturn,
} from './types/return';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { AccountDbHandlerService } from 'src/db-handlers/account-db-handler.service';
import { BlockchainClientUtilityService } from './blockchain-client-utility.service';
import { ConfigService } from '@nestjs/config';
import { AccountEnvironment, ACCOUNT_ENVIRONMENT } from './constants';
import bs58 from 'bs58';

type VALID_ENVIRONMENT_URLS =
  | 'http://localhost:8899'
  | 'https://api.devnet.solana.com';
const ENVIRONMENT_URLS: Record<VALID_ENVIRONMENT_URLS, AccountEnvironment> = {
  'http://localhost:8899': ACCOUNT_ENVIRONMENT.LOCAL,
  'https://api.devnet.solana.com': ACCOUNT_ENVIRONMENT.DEV,
};

@Injectable()
export class BlockchainClientService implements BlockchainClient, OnModuleInit {
  private connection: Connection;
  private environment: AccountEnvironment;
  private memoPublicKey: PublicKey;

  constructor(
    private readonly accountDbHandler: AccountDbHandlerService,
    private readonly utilService: BlockchainClientUtilityService,
    private readonly configService: ConfigService,
  ) {
    const connectionURL = this.configService.get<string>(
      'SOLANA_JSON_RPC_ENDPOINT_URL',
    );
    if (!connectionURL) {
      console.error(
        'SOLANA_JSON_RPC_ENDPOINT_URL is not defined in the environment variables.',
      );
      process.exit(1);
    }
    if (!(connectionURL in ENVIRONMENT_URLS)) {
      console.error(
        `The connection URL ${connectionURL} does not match any known environment.`,
      );
      process.exit(1);
    }
    this.connection = new Connection(connectionURL, 'confirmed');
    this.environment =
      ENVIRONMENT_URLS[connectionURL as keyof typeof ENVIRONMENT_URLS];

    this.memoPublicKey = new PublicKey(
      'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
    );
  }

  async onModuleInit() {
    try {
      const version = await this.connection.getVersion();
      console.log('Connected to Solana node. Version:', version);
    } catch (err) {
      console.error(
        `Failed to initialize BlockchainClient service ${this.environment === ACCOUNT_ENVIRONMENT.LOCAL ? '- ensure local node is running' : ''}:`,
        err.message,
      );
      process.exit(1);
    }
  }

  /**
   * If env is 'local', will create new account & airdrop funds to it
   * If env is 'dev', will
   * @param amt
   * @param label
   * @returns
   */
  async createAccount(
    amt: number,
    label?: string,
  ): Promise<CreateAccountReturn> {
    try {
      const newAccountKeypair = Keypair.generate();

      let fromPubkey: Keypair;
      // amount of space to reserve for the account
      const space = 0;
      // Seed the created account with lamports for rent exemption
      const rentExemptionAmount =
        await this.connection.getMinimumBalanceForRentExemption(space); // lamports

      // devnet wallets should be started with the minimal amount required to keep an account open
      const amtToFund =
        this.environment === ACCOUNT_ENVIRONMENT.LOCAL
          ? amt * LAMPORTS_PER_SOL + rentExemptionAmount
          : rentExemptionAmount;
      if (this.environment === ACCOUNT_ENVIRONMENT.LOCAL) {
        // Create system wallet to airdrop funds to new user account
        fromPubkey = Keypair.generate();
        const airdropSignature = await this.connection.requestAirdrop(
          fromPubkey.publicKey,
          2 * amtToFund,
        );
        await this.connection.confirmTransaction(airdropSignature);
      } else {
        // Dev environment
        const systemAccount = await this.accountDbHandler.retrieveSystemAccount(
          this.environment,
        );
        fromPubkey = this.utilService.restoreKeypair(systemAccount.secretKey);

        const availableBalance = await this.getAccountBalance(
          fromPubkey.publicKey,
          false,
        );

        // If available balance is less than twice the required rent balance
        if (availableBalance < amtToFund) {
          throw new Error(
            `Amount requested: ${amt}\nAvailable balance: ${availableBalance}`,
          );
        }
      }

      // Create system wallet to airdrop funds to new user account
      const createAccountParams = {
        fromPubkey: fromPubkey.publicKey,
        newAccountPubkey: newAccountKeypair.publicKey,
        lamports: amtToFund,
        space,
        programId: SystemProgram.programId,
      };

      const createAccountTransaction = new Transaction().add(
        SystemProgram.createAccount(createAccountParams),
      );
      await sendAndConfirmTransaction(
        this.connection,
        createAccountTransaction,
        [fromPubkey, newAccountKeypair],
      );

      const { secretKey, ...safeAccount } =
        await this.accountDbHandler.createAccount(
          newAccountKeypair,
          this.environment,
          label,
        );

      return { success: true, account: safeAccount };
    } catch (err) {
      throw err;
    }
  }
  async listAccounts(isSafe = true): Promise<any> {
    try {
      const wallets = await this.accountDbHandler.listAccounts(
        isSafe,
        this.environment,
      );
      return Object.values(wallets);
    } catch (err) {
      throw err;
    }
  }
  async getAccountBalance(
    input: string | PublicKey,
    getBaseUnit: boolean,
  ): Promise<number> {
    try {
      const account = this.utilService.generatePublicKey(input);
      const result = await this.connection.getBalance(account);
      return getBaseUnit ? result / LAMPORTS_PER_SOL : result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * @param amt expressed in BASE units (e.g. 'BTC' instead of 'satoshis', 'ETH' instead of 'gwei', 'SOL' instead of 'lamports')
   */
  async sendTx(
    fromPubkeyStr: string,
    toPubkeyInput: string | PublicKey,
    amt: number,
    invoiceId?: string,
  ): Promise<SendTxReturn> {
    try {
      const toPubkey = this.utilService.generatePublicKey(toPubkeyInput);
      const fromWallet =
        await this.accountDbHandler.retrieveAccount(fromPubkeyStr);
      const fromKeypair = this.utilService.restoreKeypair(fromWallet.secretKey);

      const transferTransaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromKeypair.publicKey,
          toPubkey,
          lamports: amt * LAMPORTS_PER_SOL,
        }),
      );

      if (invoiceId) {
        transferTransaction.add(
          new TransactionInstruction({
            keys: [
              {
                pubkey: fromKeypair.publicKey,
                isSigner: true,
                isWritable: true,
              },
            ],
            data: Buffer.from(invoiceId, 'utf-8'),
            programId: this.memoPublicKey,
          }),
        );
      }

      await sendAndConfirmTransaction(this.connection, transferTransaction, [
        fromKeypair,
      ]);

      return { success: true };
    } catch (err) {
      throw err;
    }
  }
  async calculateTxCost(): Promise<CalculateTxCostReturn> {
    throw new Error('Method not implemented.');
  }
  async getTx(signature: string) {
    // @ts-ignore
    function decodeMemoData(encodedData) {
      console.log('Encoded data:', encodedData);
      const decodedArray = bs58.decode(encodedData);
      console.log('Decoded array:', decodedArray);
      const buffer = Buffer.from(decodedArray);
      console.log('Buffer:', buffer);
      const decodedString = buffer.toString('utf-8');
      console.log('Decoded string:', decodedString);
      return decodedString;
    }

    try {
      const parsedTx = await this.connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });

      if (!parsedTx) {
        throw new Error('no tx');
      }

      // parsedTx.transaction.message.instructions[1].parsed
      const { instructions } = parsedTx.transaction.message;
      const memos = instructions.reduce((acc, cur) => {
        if (
          cur.programId.equals(this.memoPublicKey) &&
          typeof cur === 'object' &&
          cur !== null
        ) {
          if (
            cur.hasOwnProperty('parsed') &&
            typeof (cur as { parsed: string }).parsed === 'string'
          ) {
            acc.push((cur as { parsed: string }).parsed);
          }
        }
        return acc;
      }, [] as string[]);

      return { parsedTx, memos };
    } catch (err) {
      throw err;
    }
  }
}
