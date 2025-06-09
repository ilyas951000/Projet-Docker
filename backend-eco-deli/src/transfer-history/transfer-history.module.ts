import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferHistory } from './entities/transfer-history.entity';
import { TransferHistoryService } from './transfer-history.service';
import { TransferHistoryController } from './transfer-history.controller';
import { Localisation } from 'src/localisation/entities/localisation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransferHistory, Localisation])],
  providers: [TransferHistoryService],
  controllers: [TransferHistoryController], // ← OBLIGATOIRE
})
export class TransferHistoryModule {}
