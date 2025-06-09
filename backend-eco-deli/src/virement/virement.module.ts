import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Virement } from './entities/virement.entity';
import { VirementService } from './virement.service';
import { VirementController } from './virement.controller';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Virement, User]) // importe Virement + User pour les relations
  ],
  controllers: [VirementController],
  providers: [VirementService],
})
export class VirementModule {}
