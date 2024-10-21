import {
  Body,
  Controller,
  Delete,
  Get,
  NotImplementedException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { BlockchainClientService } from './blockchain-client/blockchain-client.service';
import {
  CreateAccountDto,
  GetAccountBalanceDto,
  ListAccountsDto,
  SendTxDto,
} from './dto/request';
import {
  ApiCreatedResponse,
  ApiNotImplementedResponse,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import { CreateAccountResponseDto } from './dto/response';
import { BlockchainNodeUnavailableApiResponseOptions } from './api-documentation/response-error-options';

@Controller()
export class AppController {
  constructor(
    private readonly blockchainClientService: BlockchainClientService,
  ) {}

  @ApiCreatedResponse({ type: CreateAccountResponseDto })
  @ApiServiceUnavailableResponse(BlockchainNodeUnavailableApiResponseOptions)
  @Post('account')
  async createAccount(@Body() body: CreateAccountDto) {
    const { amt, label } = body;
    // Default to 2 SOL
    const DEFAULT_SOL = 2;
    return this.blockchainClientService.createAccount(
      amt || DEFAULT_SOL,
      label,
    );
  }

  @Get('account-list')
  async getAccountList(@Query() query: ListAccountsDto) {
    const { is_safe } = query;
    // @ts-ignore
    const isSafe = !(is_safe && is_safe === 'false');
    return this.blockchainClientService.listAccounts(isSafe);
  }

  @Get('account/:id/balance')
  async getAccountBalance(
    @Param('id') accountId: string,
    @Query() query: GetAccountBalanceDto,
  ) {
    const { in_base_unit } = query;
    // @ts-ignore
    const getBaseUnit = !(in_base_unit && in_base_unit === 'false');
    return this.blockchainClientService.getAccountBalance(
      accountId,
      getBaseUnit,
    );
  }

  @Post('send-tx')
  async sendTx(@Body() body: SendTxDto) {
    const { fromPubkeyStr, toPubkeyStr, amt, invoiceId } = body;
    return this.blockchainClientService.sendTx(
      fromPubkeyStr,
      toPubkeyStr,
      amt,
      invoiceId,
    );
  }

  @Delete('account/:id')
  @ApiNotImplementedResponse()
  async closeAccount(@Param('id') accountId: string) {
    throw new NotImplementedException();
  }

  @Get('tx/:signature')
  async getTx(@Param('signature') signature: string) {
    return this.blockchainClientService.getTx(signature);
  }
}
