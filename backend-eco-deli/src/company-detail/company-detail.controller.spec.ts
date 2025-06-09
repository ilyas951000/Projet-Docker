import { Test, TestingModule } from '@nestjs/testing';
import { CompanyDetailController } from './company-detail.controller';
import { CompanyDetailService } from './company-detail.service';

describe('CompanyDetailController', () => {
  let controller: CompanyDetailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyDetailController],
      providers: [CompanyDetailService],
    }).compile();

    controller = module.get<CompanyDetailController>(CompanyDetailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
