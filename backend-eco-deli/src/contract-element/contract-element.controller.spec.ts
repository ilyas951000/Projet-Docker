import { Test, TestingModule } from '@nestjs/testing';
import { ContractElementController } from './contract-element.controller';
import { ContractElementService } from './contract-element.service';

describe('ContractElementController', () => {
  let controller: ContractElementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractElementController],
      providers: [ContractElementService],
    }).compile();

    controller = module.get<ContractElementController>(ContractElementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
