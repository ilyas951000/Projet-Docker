import { Test, TestingModule } from '@nestjs/testing';
import { LocalisationController } from './localisation.controller';
import { LocalisationService } from './localisation.service';

describe('LocalisationController', () => {
  let controller: LocalisationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocalisationController],
      providers: [LocalisationService],
    }).compile();

    controller = module.get<LocalisationController>(LocalisationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
