import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainClientService } from './blockchain-client.service';

describe('BlockchainClientService', () => {
  let service: BlockchainClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockchainClientService],
    }).compile();

    service = module.get<BlockchainClientService>(BlockchainClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
