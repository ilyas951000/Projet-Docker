import { Test, TestingModule } from '@nestjs/testing';
import { PrestataireRequirementsController } from './prestataire-requirements.controller';
import { PrestataireRequirementsService } from './prestataire-requirements.service';

describe('PrestataireRequirementsController', () => {
  let controller: PrestataireRequirementsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrestataireRequirementsController],
      providers: [PrestataireRequirementsService],
    }).compile();

    controller = module.get<PrestataireRequirementsController>(PrestataireRequirementsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
