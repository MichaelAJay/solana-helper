import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BlockchainClientService } from './blockchain-client/blockchain-client.service';
import {
  CreateWalletDto,
  ListWalletsDto,
  AirdropToWalletDto,
  SendTxDto,
} from './dto';

@Controller()
export class AppController {
  constructor(
    private readonly blockchainClientService: BlockchainClientService,
  ) {}

  @Post('wallet')
  async createWallet(@Body() body: CreateWalletDto) {
    const { label } = body;
    return this.blockchainClientService.createWallet(label);
  }

  @Get('wallet-list')
  async getWalletList(@Query() query: ListWalletsDto) {
    const { is_safe } = query;
    // @ts-ignore
    const isSafe = !(is_safe && is_safe === 'false');
    return this.blockchainClientService.listWallets(isSafe);
  }

  @Get('wallet/:id/balance')
  async getWalletBalance(@Param('id') walletId: string) {
    return this.blockchainClientService.getWalletBalance(walletId);
  }

  @Post('wallet/airdrop/:id')
  async airdropToWallet(
    @Param('id') walletId: string,
    @Body() body: AirdropToWalletDto,
  ) {
    return this.blockchainClientService.airdropToWallet(walletId, body.amt);
  }

  @Post('send-tx')
  async sendTx(@Body() body: SendTxDto) {
    const { fromPubkeyStr, toPubkeyStr, amt } = body;
    return this.blockchainClientService.sendTx(fromPubkeyStr, toPubkeyStr, amt);
  }
}
