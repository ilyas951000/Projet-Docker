import { Test, TestingModule } from '@nestjs/testing';
import { PrestataireRolesService } from './prestataire-roles.service';

describe('PrestataireRolesService', () => {
  let service: PrestataireRolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrestataireRolesService],
    }).compile();

    service = module.get<PrestataireRolesService>(PrestataireRolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
