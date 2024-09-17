import { CalculateTxCostReturn, CreateAccountReturn, SendTxReturn } from "./types/return"

/**
 * The purpose of the BlockchainClient interface is to abstract the blockchain-specific library or implementation
 * of common blockchain-related activities
 */
export interface BlockchainClient {
    createAccount(amt: number, label?: string): Promise<CreateAccountReturn>
    getAccountBalance(publicKeyStr: string, getBaseUnit: boolean): Promise<number>
    sendTx(fromPubkeyStr: string, toPubkeyStr: string, amt: number): Promise<SendTxReturn>
    calculateTxCost(): Promise<CalculateTxCostReturn>
}

/**
 * Implement:
 * Create wallet
 * Verify keypair (?)
 * Validate public key (?)
 * Generate mnemonics
 * Restore keypair from mnemonic
 * How to send
 * Calculate tx cost
 * Create account (this may be a specific Solana thing)
 */