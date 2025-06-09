import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transfer } from './entities/transfer.entity';
import { Transaction } from './entities/transaction.entity';
import { User } from 'src/users/entities/user.entity';
import { TransferHistory } from 'src/transfer-history/entities/transfer-history.entity';
import { TransferService } from './transfer.service';
import { TransferController } from './transfer.controller'; // 👈 À importer
import { PlatformFee } from 'src/payments/entities/platform-fee.entity'; // ✅ Assure-toi que ce chemin est correct
import { Subscription } from 'src/subscriptions/entities/subscription.entity'; // 👈 adapte le chemin si besoin
import { Virement } from 'src/virement/entities/virement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transfer, Transaction, User, TransferHistory,  PlatformFee, Subscription, Virement,]),
  ],
  controllers: [TransferController], // 👈 À ajouter ici
  providers: [TransferService],
  exports: [TransferService],
})
export class TransferModule {}
