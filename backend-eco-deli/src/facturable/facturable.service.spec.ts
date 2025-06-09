import { Test, TestingModule } from '@nestjs/testing';
import { FacturableService } from './facturable.service';

describe('FacturableService', () => {
  let service: FacturableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacturableService],
    }).compile();

    service = module.get<FacturableService>(FacturableService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
