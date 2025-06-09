import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrestataireRequirement } from './entities/prestataire-requirement.entity';
import { PrestataireRequirementsService } from './prestataire-requirements.service';
import { PrestataireRequirementsController } from './prestataire-requirements.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PrestataireRequirement])],
  controllers: [PrestataireRequirementsController],
  providers: [PrestataireRequirementsService],
})
export class PrestataireRequirementsModule {}
