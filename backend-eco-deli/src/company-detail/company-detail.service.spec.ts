import { Test, TestingModule } from '@nestjs/testing';
import { CompanyDetailService } from './company-detail.service';

describe('CompanyDetailService', () => {
  let service: CompanyDetailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanyDetailService],
    }).compile();

    service = module.get<CompanyDetailService>(CompanyDetailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
