import { Module } from '@nestjs/common';
import { PicturesService } from './pictures.service';
import { PicturesController } from './pictures.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Picture } from './entities/picture.entity';
import { Advertisement } from 'src/advertisements/entities/advertisement.entity';
import { PackagesModule } from 'src/packages/packages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Picture, Advertisement]),
    PackagesModule,
  ],
  controllers: [PicturesController],
  providers: [PicturesService],
})
export class PicturesModule {}



