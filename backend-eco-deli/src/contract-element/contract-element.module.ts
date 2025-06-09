import { Module } from '@nestjs/common';
import { ContractElementService } from './contract-element.service';
import { ContractElementController } from './contract-element.controller';

@Module({
  controllers: [ContractElementController],
  providers: [ContractElementService],
})
export class ContractElementModule {}
