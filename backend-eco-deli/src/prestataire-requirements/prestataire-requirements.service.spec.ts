import { Test, TestingModule } from '@nestjs/testing';
import { PrestataireRequirementsService } from './prestataire-requirements.service';

describe('PrestataireRequirementsService', () => {
  let service: PrestataireRequirementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrestataireRequirementsService],
    }).compile();

    service = module.get<PrestataireRequirementsService>(PrestataireRequirementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
