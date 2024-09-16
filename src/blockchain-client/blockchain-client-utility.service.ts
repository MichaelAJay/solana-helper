import { Injectable } from '@nestjs/common';
import { Keypair, PublicKey } from '@solana/web3.js';
import * as bip39 from 'bip39';

@Injectable()
export class BlockchainClientUtilityService {
    restoreKeypair(privateKeyHex: string): Keypair {
        const secretKey = this.hexStringToUint8Array(privateKeyHex);
        return Keypair.fromSecretKey(secretKey);
    };
    verifyKeypair(publicKeyStr: string, privateKeyHex: string): boolean {
        const publicKey = this.publicKeyFromString(publicKeyStr);
        const keypair = this.restoreKeypair(privateKeyHex);
        return keypair.publicKey.toBase58() === publicKey.toBase58();
    };
    generateMnemonicsForKeypair() {
        const mnemonic = bip39.generateMnemonic();
        return mnemonic;
    };

    /**
     * 
     * @param mnemonic should be full 12 word phrase, lowercase, space separated
     */
    restoreKeypairFromMnemonic(mnemonic: string, password = ''): Keypair {
        const seed = bip39.mnemonicToSeedSync(mnemonic, password);
        const seedArray = new Uint8Array(seed);
        return Keypair.fromSeed(seedArray.slice(0, 32));
    };

    // Helpers
    publicKeyFromString(publicKeyStr: string): PublicKey {
        return new PublicKey(publicKeyStr);
    }
    hexStringToUint8Array(hexString: string): Uint8Array {
        return new Uint8Array(Buffer.from(hexString, 'hex'));
    }
}
