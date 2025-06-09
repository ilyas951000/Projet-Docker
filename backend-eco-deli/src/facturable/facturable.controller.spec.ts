import { Test, TestingModule } from '@nestjs/testing';
import { FacturableController } from './facturable.controller';
import { FacturableService } from './facturable.service';

describe('FacturableController', () => {
  let controller: FacturableController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacturableController],
      providers: [FacturableService],
    }).compile();

    controller = module.get<FacturableController>(FacturableController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
