import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LivreurRequirement } from './entities/livreur-requirement.entity';
import { LivreurRequirementsService } from './livreur-requirements.service';
import { LivreurRequirementsController } from './livreur-requirements.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LivreurRequirement])],
  controllers: [LivreurRequirementsController],
  providers: [LivreurRequirementsService],
  exports: [LivreurRequirementsService],
})
export class LivreurRequirementsModule {}
