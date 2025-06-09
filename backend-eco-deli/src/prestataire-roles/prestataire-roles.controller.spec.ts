import { Test, TestingModule } from '@nestjs/testing';
import { PrestataireRolesController } from './prestataire-roles.controller';
import { PrestataireRolesService } from './prestataire-roles.service';

describe('PrestataireRolesController', () => {
  let controller: PrestataireRolesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrestataireRolesController],
      providers: [PrestataireRolesService],
    }).compile();

    controller = module.get<PrestataireRolesController>(PrestataireRolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
