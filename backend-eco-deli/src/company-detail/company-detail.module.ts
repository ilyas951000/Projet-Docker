import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyDetailService } from './company-detail.service';
import { CompanyDetailController } from './company-detail.controller';
import { CompanyDetail } from './entities/company-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyDetail])],
  providers: [CompanyDetailService],
  controllers: [CompanyDetailController],
})
export class CompanyDetailModule {}
