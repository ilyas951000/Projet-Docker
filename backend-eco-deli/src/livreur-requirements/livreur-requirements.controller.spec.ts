import { Test, TestingModule } from '@nestjs/testing';
import { LivreurRequirementsController } from './livreur-requirements.controller';
import { LivreurRequirementsService } from './livreur-requirements.service';

describe('LivreurRequirementsController', () => {
  let controller: LivreurRequirementsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LivreurRequirementsController],
      providers: [LivreurRequirementsService],
    }).compile();

    controller = module.get<LivreurRequirementsController>(LivreurRequirementsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
