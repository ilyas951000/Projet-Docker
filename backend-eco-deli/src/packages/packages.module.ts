import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';
import { Package } from './entities/package.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { Localisation } from 'src/localisation/entities/localisation.entity';
import { Movement } from 'src/movements/entities/movement.entity';
import { TransferHistory } from 'src/transfer-history/entities/transfer-history.entity';
import { TransferModule } from 'src/payments/transfer.module'; // ✅ Module à importer

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Package,
      User,
      Localisation,
      Movement,
      TransferHistory,
    ]),
    UsersModule,
    TransferModule, // ✅ placé correctement ici
  ],
  controllers: [PackagesController],
  providers: [PackagesService],
})
export class PackagesModule {}
