import { Test, TestingModule } from '@nestjs/testing';
import { ContractElementService } from './contract-element.service';

describe('ContractElementService', () => {
  let service: ContractElementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContractElementService],
    }).compile();

    service = module.get<ContractElementService>(ContractElementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
