import { Module } from '@nestjs/common';
import { FacturableService } from './facturable.service';
import { FacturableController } from './facturable.controller';

@Module({
  controllers: [FacturableController],
  providers: [FacturableService],
})
export class FacturableModule {}
