import { Module } from '@nestjs/common';
import { RatesService } from './rates.service';
import { RatesController } from './rates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rates } from './entities/rates.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rates])],
  controllers: [RatesController],
  providers: [RatesService],
})
export class RatesModule {}
