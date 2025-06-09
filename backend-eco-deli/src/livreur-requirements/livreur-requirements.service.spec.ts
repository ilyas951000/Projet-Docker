import { Test, TestingModule } from '@nestjs/testing';
import { LivreurRequirementsService } from './livreur-requirements.service';

describe('LivreurRequirementsService', () => {
  let service: LivreurRequirementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LivreurRequirementsService],
    }).compile();

    service = module.get<LivreurRequirementsService>(LivreurRequirementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
