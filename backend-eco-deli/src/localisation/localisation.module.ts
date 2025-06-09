import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalisationService } from './localisation.service';
import { LocalisationController } from './localisation.controller';
import { Localisation } from './entities/localisation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Localisation])], // ✅ requis pour injecter le repo
  controllers: [LocalisationController],
  providers: [LocalisationService],
  exports: [LocalisationService], // utile si utilisé ailleurs
})
export class LocalisationModule {}
