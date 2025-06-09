import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Local } from './entities/local.entity';
import { LocalService } from './local.service';
import { LocalController } from './local.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Local])],
  providers: [LocalService],
  controllers: [LocalController],
})
export class LocalModule {}
