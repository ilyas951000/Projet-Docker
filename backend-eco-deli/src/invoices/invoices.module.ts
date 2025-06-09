// src/invoices/invoices.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { PaymentsModule } from '../payments/payments.module'; // 👈 ici

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice]),
    PaymentsModule, // 👈 indispensable pour injecter TransferRepository
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule {}
